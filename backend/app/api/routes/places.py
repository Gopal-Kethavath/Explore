from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Path
from sqlalchemy.orm import Session

from app.api.deps import get_db, parse_place_query
from app.models import Place
from app.schemas.place import (
    CategoryOut,
    HoursOut,
    PhotoOut,
    PlaceCard,
    PlaceDetail,
    PlaceListOut,
    PlaceQuery,
)
from app.services.places import get_place_by_slug, list_places

router = APIRouter(prefix="/places", tags=["places"])


def _cover(place: Place) -> PhotoOut | None:
    chosen = next((photo for photo in place.photos if photo.is_cover), None)
    if chosen is None and place.photos:
        chosen = place.photos[0]
    return PhotoOut.model_validate(chosen) if chosen else None


def to_card(place: Place) -> PlaceCard:
    return PlaceCard(
        slug=place.slug,
        name=place.name,
        summary=place.summary,
        locality=place.locality,
        region=place.region,
        distance_km=float(place.distance_km),
        drive_time_minutes=place.drive_time_minutes,
        rating=float(place.rating),
        is_featured=place.is_featured,
        category=CategoryOut.model_validate(place.category),
        cover_photo=_cover(place),
        tags=sorted(tag.tag for tag in place.tags),
        visit_duration=place.visit_duration,
        ticketed=place.ticketed,
    )


def to_detail(place: Place) -> PlaceDetail:
    card = to_card(place)
    return PlaceDetail(
        **card.model_dump(),
        description=place.description,
        address=place.address,
        latitude=place.latitude,
        longitude=place.longitude,
        best_time=place.best_time,
        entry_fee_note=place.entry_fee_note,
        tips=place.tips,
        ticket_indian=place.ticket_indian,
        ticket_foreign=place.ticket_foreign,
        getting_there=place.getting_there,
        stay_nearby=place.stay_nearby,
        what_to_pack=place.what_to_pack,
        highlights=list(place.highlights or []),
        photos=[PhotoOut.model_validate(photo) for photo in place.photos],
        hours=[HoursOut.model_validate(hour) for hour in place.hours],
    )


@router.get("", response_model=PlaceListOut)
def read_places(
    query: Annotated[PlaceQuery, Depends(parse_place_query)],
    db: Annotated[Session, Depends(get_db)],
) -> PlaceListOut:
    places, total = list_places(db, query)
    return PlaceListOut(
        items=[to_card(place) for place in places],
        total=total,
        page=query.page,
        page_size=query.page_size,
    )


@router.get("/{slug}", response_model=PlaceDetail)
def read_place(
    slug: Annotated[str, Path(pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")],
    db: Annotated[Session, Depends(get_db)],
) -> PlaceDetail:
    place = get_place_by_slug(db, slug)
    if place is None:
        raise HTTPException(status_code=404, detail="Place not found")
    return to_detail(place)
