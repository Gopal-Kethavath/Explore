"""Load the curated catalog from places.json. Safe to run more than once."""

import json
import uuid
from datetime import datetime, time, timezone
from decimal import Decimal
from pathlib import Path

from pydantic import BaseModel, Field, field_validator, model_validator
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models import Category, Place, PlaceHour, PlacePhoto, PlaceTag

DATA_PATH = Path(__file__).with_name("places.json")
GUIDE_PATH = Path(__file__).with_name("guides.json")


class SeedHours(BaseModel):
    opens: str
    closes: str
    closed_days: list[int] = Field(default_factory=list)

    @field_validator("opens", "closes")
    @classmethod
    def clock(cls, value: str) -> str:
        time.fromisoformat(value)
        return value

    @field_validator("closed_days")
    @classmethod
    def days(cls, value: list[int]) -> list[int]:
        if any(day < 0 or day > 6 for day in value):
            raise ValueError("closed_days must be 0 (Monday) through 6 (Sunday)")
        return sorted(set(value))


class SeedPhoto(BaseModel):
    url: str
    alt_text: str
    is_cover: bool = False


class SeedGuide(BaseModel):
    visit_duration: str
    ticketed: bool
    ticket_indian: str
    ticket_foreign: str
    getting_there: str
    stay_nearby: str
    what_to_pack: str
    highlights: list[str] = Field(min_length=3)


class SeedCategory(BaseModel):
    slug: str
    name: str
    description: str
    sort_order: int = 0


class SeedPlace(BaseModel):
    slug: str
    name: str
    category: str
    summary: str
    description: str
    address: str
    locality: str
    region: str
    distance_km: float = Field(ge=0)
    drive_time_minutes: int = Field(ge=0)
    latitude: float
    longitude: float
    best_time: str
    entry_fee_note: str
    tips: str
    rating: float = Field(ge=0, le=5)
    is_featured: bool = False
    is_published: bool = True
    tags: list[str] = Field(default_factory=list)
    hours: SeedHours
    photos: list[SeedPhoto] = Field(default_factory=list)

    @field_validator("region")
    @classmethod
    def region_ok(cls, value: str) -> str:
        allowed = {"in-city", "half-day", "weekend"}
        if value not in allowed:
            raise ValueError(f"region must be one of {sorted(allowed)}")
        return value

    @field_validator("slug", "category")
    @classmethod
    def slug_ok(cls, value: str) -> str:
        import re

        if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", value):
            raise ValueError(f"invalid slug: {value}")
        return value


class SeedFile(BaseModel):
    categories: list[SeedCategory]
    places: list[SeedPlace]

    @model_validator(mode="after")
    def check_refs(self) -> "SeedFile":
        category_slugs = [item.slug for item in self.categories]
        if len(category_slugs) != len(set(category_slugs)):
            raise ValueError("duplicate category slug")
        place_slugs = [item.slug for item in self.places]
        if len(place_slugs) != len(set(place_slugs)):
            raise ValueError("duplicate place slug")
        known = set(category_slugs)
        for place in self.places:
            if place.category not in known:
                raise ValueError(f"{place.slug} uses unknown category {place.category}")
        return self


def _replace_children(db: Session, place: Place, data: SeedPlace) -> None:
    place.photos.clear()
    place.hours.clear()
    place.tags.clear()
    db.flush()

    cover_assigned = False
    for index, photo in enumerate(data.photos):
        is_cover = photo.is_cover and not cover_assigned
        if photo.is_cover:
            cover_assigned = True
        place.photos.append(
            PlacePhoto(
                url=photo.url,
                alt_text=photo.alt_text,
                sort_order=index,
                is_cover=is_cover,
            )
        )
    if place.photos and not any(photo.is_cover for photo in place.photos):
        place.photos[0].is_cover = True

    opens = time.fromisoformat(data.hours.opens)
    closes = time.fromisoformat(data.hours.closes)
    closed = set(data.hours.closed_days)
    for day in range(7):
        is_closed = day in closed
        place.hours.append(
            PlaceHour(
                day_of_week=day,
                is_closed=is_closed,
                opens_at=None if is_closed else opens,
                closes_at=None if is_closed else closes,
            )
        )
    seen: set[str] = set()
    for raw in data.tags:
        tag = raw.strip().lower()
        if not tag or tag in seen:
            continue
        seen.add(tag)
        place.tags.append(PlaceTag(tag=tag))


def load_guides() -> dict[str, SeedGuide]:
    raw = json.loads(GUIDE_PATH.read_text(encoding="utf-8"))
    return {slug: SeedGuide.model_validate(item) for slug, item in raw.items()}


def seed(db: Session, payload: SeedFile, guides: dict[str, SeedGuide]) -> None:
    categories: dict[str, Category] = {}
    for item in payload.categories:
        row = db.scalar(select(Category).where(Category.slug == item.slug))
        if row is None:
            row = Category(slug=item.slug)
            db.add(row)
        row.name = item.name
        row.description = item.description
        row.sort_order = item.sort_order
        categories[item.slug] = row
    db.flush()

    missing = [item.slug for item in payload.places if item.slug not in guides]
    if missing:
        raise ValueError(f"guides.json is missing: {', '.join(missing)}")

    now = datetime.now(timezone.utc)
    for item in payload.places:
        guide = guides[item.slug]
        place = db.scalar(select(Place).where(Place.slug == item.slug))
        if place is None:
            place = Place(id=uuid.uuid4(), slug=item.slug)
            db.add(place)
        place.name = item.name
        place.category = categories[item.category]
        place.summary = item.summary
        place.description = item.description
        place.address = item.address
        place.locality = item.locality
        place.region = item.region
        place.distance_km = Decimal(str(item.distance_km))
        place.drive_time_minutes = item.drive_time_minutes
        place.latitude = item.latitude
        place.longitude = item.longitude
        place.best_time = item.best_time
        place.entry_fee_note = item.entry_fee_note
        place.tips = item.tips
        place.visit_duration = guide.visit_duration
        place.ticketed = guide.ticketed
        place.ticket_indian = guide.ticket_indian
        place.ticket_foreign = guide.ticket_foreign
        place.getting_there = guide.getting_there
        place.stay_nearby = guide.stay_nearby
        place.what_to_pack = guide.what_to_pack
        place.highlights = guide.highlights
        place.rating = Decimal(str(item.rating))
        place.is_featured = item.is_featured
        place.is_published = item.is_published
        place.updated_at = now
        _replace_children(db, place, item)


def main() -> None:
    payload = SeedFile.model_validate_json(DATA_PATH.read_text(encoding="utf-8"))
    guides = load_guides()
    db = SessionLocal()
    try:
        seed(db, payload, guides)
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
    print(f"Seeded {len(payload.categories)} categories and {len(payload.places)} places.")


if __name__ == "__main__":
    main()
