from datetime import time
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_serializer


class CategoryOut(BaseModel):
    slug: str
    name: str
    description: str

    model_config = ConfigDict(from_attributes=True)


class PhotoOut(BaseModel):
    url: str
    alt_text: str
    sort_order: int
    is_cover: bool

    model_config = ConfigDict(from_attributes=True)


class HoursOut(BaseModel):
    day_of_week: int
    opens_at: time | None
    closes_at: time | None
    is_closed: bool

    model_config = ConfigDict(from_attributes=True)

    @field_serializer("opens_at", "closes_at")
    def serialize_time(self, value: time | None) -> str | None:
        if value is None:
            return None
        return value.strftime("%H:%M")


class PlaceCard(BaseModel):
    slug: str
    name: str
    summary: str
    locality: str
    region: str
    distance_km: float
    drive_time_minutes: int
    rating: float
    is_featured: bool
    category: CategoryOut
    cover_photo: PhotoOut | None
    tags: list[str]
    visit_duration: str
    ticketed: bool


class PlaceDetail(PlaceCard):
    description: str
    address: str
    latitude: float
    longitude: float
    best_time: str
    entry_fee_note: str
    tips: str
    ticket_indian: str
    ticket_foreign: str
    getting_there: str
    stay_nearby: str
    what_to_pack: str
    highlights: list[str]
    photos: list[PhotoOut]
    hours: list[HoursOut]


class PlaceListOut(BaseModel):
    items: list[PlaceCard]
    total: int
    page: int
    page_size: int


class PlaceQuery(BaseModel):
    q: str | None = None
    category: str | None = None
    region: Literal["in-city", "half-day", "weekend"] | None = None
    tag: list[str] = Field(default_factory=list)
    max_distance_km: float | None = None
    max_drive_minutes: int | None = None
    ticketed: bool | None = None
    featured: bool | None = None
    sort: Literal["featured", "distance", "rating", "name"] = "featured"
    page: int = 1
    page_size: int = 12
