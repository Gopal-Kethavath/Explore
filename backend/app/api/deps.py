from collections.abc import Generator
from typing import Annotated, Literal

from fastapi import Depends, Query
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.schemas.place import PlaceQuery


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def parse_place_query(
    q: Annotated[str | None, Query(max_length=100)] = None,
    category: Annotated[str | None, Query(max_length=40)] = None,
    region: Annotated[Literal["in-city", "half-day", "weekend"] | None, Query()] = None,
    tag: Annotated[list[str] | None, Query()] = None,
    max_distance_km: Annotated[float | None, Query(ge=0, le=500)] = None,
    max_drive_minutes: Annotated[int | None, Query(ge=0, le=600)] = None,
    ticketed: bool | None = None,
    featured: bool | None = None,
    sort: Literal["featured", "distance", "rating", "name"] = "featured",
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=50)] = 12,
) -> PlaceQuery:
    cleaned_q = q.strip() if q else None
    if cleaned_q == "":
        cleaned_q = None
    tags = [item.strip().lower() for item in (tag or []) if item and item.strip()]
    cleaned_category = category.strip() if category else None
    if cleaned_category == "":
        cleaned_category = None
    return PlaceQuery(
        q=cleaned_q,
        category=cleaned_category,
        region=region,
        tag=tags,
        max_distance_km=max_distance_km,
        max_drive_minutes=max_drive_minutes,
        ticketed=ticketed,
        featured=featured,
        sort=sort,
        page=page,
        page_size=page_size,
    )
