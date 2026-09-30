from sqlalchemy import Select, func, or_, select
from sqlalchemy.orm import Session, selectinload

from app.models import Category, Place, PlaceTag
from app.schemas.place import PlaceQuery


def _like_pattern(term: str) -> str:
    escaped = term.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
    return f"%{escaped}%"


def _filtered(query: PlaceQuery) -> Select[tuple[Place]]:
    stmt = select(Place).where(Place.is_published.is_(True))
    if query.q:
        pattern = _like_pattern(query.q)
        stmt = stmt.where(
            or_(
                Place.name.ilike(pattern, escape="\\"),
                Place.summary.ilike(pattern, escape="\\"),
            )
        )
    if query.category:
        stmt = stmt.where(Place.category.has(Category.slug == query.category))
    if query.region:
        stmt = stmt.where(Place.region == query.region)
    for tag in query.tag:
        stmt = stmt.where(Place.tags.any(PlaceTag.tag == tag))
    if query.max_distance_km is not None:
        stmt = stmt.where(Place.distance_km <= query.max_distance_km)
    if query.max_drive_minutes is not None:
        stmt = stmt.where(Place.drive_time_minutes <= query.max_drive_minutes)
    if query.ticketed is True:
        stmt = stmt.where(Place.ticketed.is_(True))
    elif query.ticketed is False:
        stmt = stmt.where(Place.ticketed.is_(False))
    if query.featured is True:
        stmt = stmt.where(Place.is_featured.is_(True))
    elif query.featured is False:
        stmt = stmt.where(Place.is_featured.is_(False))
    return stmt


def _sorted(stmt: Select[tuple[Place]], sort: str) -> Select[tuple[Place]]:
    if sort == "distance":
        return stmt.order_by(Place.distance_km, Place.name)
    if sort == "rating":
        return stmt.order_by(Place.rating.desc(), Place.name)
    if sort == "name":
        return stmt.order_by(Place.name)
    return stmt.order_by(Place.is_featured.desc(), Place.distance_km, Place.name)


def _with_card_loads(stmt: Select[tuple[Place]]) -> Select[tuple[Place]]:
    return stmt.options(
        selectinload(Place.photos),
        selectinload(Place.tags),
        selectinload(Place.category),
    )


def list_categories(db: Session) -> list[Category]:
    stmt = select(Category).order_by(Category.sort_order, Category.name)
    return list(db.scalars(stmt).all())


def list_places(db: Session, query: PlaceQuery) -> tuple[list[Place], int]:
    filtered = _filtered(query)
    total = db.scalar(select(func.count()).select_from(filtered.subquery())) or 0
    stmt = _sorted(filtered, query.sort)
    stmt = _with_card_loads(stmt)
    stmt = stmt.offset((query.page - 1) * query.page_size).limit(query.page_size)
    return list(db.scalars(stmt).all()), total


def get_place_by_slug(db: Session, slug: str) -> Place | None:
    stmt = (
        select(Place)
        .where(Place.slug == slug, Place.is_published.is_(True))
        .options(
            selectinload(Place.photos),
            selectinload(Place.tags),
            selectinload(Place.hours),
            selectinload(Place.category),
        )
    )
    return db.scalar(stmt)
