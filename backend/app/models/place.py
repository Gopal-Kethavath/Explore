import uuid
from datetime import datetime, time

from sqlalchemy import (
    JSON,
    Boolean,
    CheckConstraint,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    Time,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    slug: Mapped[str] = mapped_column(String(40), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(80), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")

    places: Mapped[list["Place"]] = relationship(back_populates="category")


class Place(Base):
    __tablename__ = "places"
    __table_args__ = (
        CheckConstraint(
            "region IN ('in-city', 'half-day', 'weekend')",
            name="ck_places_region",
        ),
        CheckConstraint("rating >= 0 AND rating <= 5", name="ck_places_rating"),
        CheckConstraint("distance_km >= 0", name="ck_places_distance"),
        CheckConstraint("drive_time_minutes >= 0", name="ck_places_drive_time"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    slug: Mapped[str] = mapped_column(String(80), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    category_id: Mapped[int] = mapped_column(
        ForeignKey("categories.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    address: Mapped[str] = mapped_column(Text, nullable=False)
    locality: Mapped[str] = mapped_column(String(120), nullable=False)
    region: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    distance_km: Mapped[float] = mapped_column(Numeric(6, 1), nullable=False)
    drive_time_minutes: Mapped[int] = mapped_column(Integer, nullable=False)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    best_time: Mapped[str] = mapped_column(Text, nullable=False)
    entry_fee_note: Mapped[str] = mapped_column(Text, nullable=False)
    tips: Mapped[str] = mapped_column(Text, nullable=False)
    visit_duration: Mapped[str] = mapped_column(String(80), nullable=False, default="", server_default="")
    ticketed: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, server_default="false", index=True
    )
    ticket_indian: Mapped[str] = mapped_column(Text, nullable=False, default="", server_default="")
    ticket_foreign: Mapped[str] = mapped_column(Text, nullable=False, default="", server_default="")
    getting_there: Mapped[str] = mapped_column(Text, nullable=False, default="", server_default="")
    stay_nearby: Mapped[str] = mapped_column(Text, nullable=False, default="", server_default="")
    what_to_pack: Mapped[str] = mapped_column(Text, nullable=False, default="", server_default="")
    highlights: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    rating: Mapped[float] = mapped_column(Numeric(2, 1), nullable=False)
    is_featured: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, server_default="false", index=True
    )
    is_published: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=True, server_default="true", index=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    category: Mapped[Category] = relationship(back_populates="places")
    photos: Mapped[list["PlacePhoto"]] = relationship(
        back_populates="place",
        cascade="all, delete-orphan",
        order_by="PlacePhoto.sort_order",
    )
    hours: Mapped[list["PlaceHour"]] = relationship(
        back_populates="place",
        cascade="all, delete-orphan",
        order_by="PlaceHour.day_of_week",
    )
    tags: Mapped[list["PlaceTag"]] = relationship(
        back_populates="place",
        cascade="all, delete-orphan",
    )


class PlacePhoto(Base):
    __tablename__ = "place_photos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    place_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("places.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    url: Mapped[str] = mapped_column(String(1000), nullable=False)
    alt_text: Mapped[str] = mapped_column(String(300), nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    is_cover: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    place: Mapped[Place] = relationship(back_populates="photos")


class PlaceHour(Base):
    __tablename__ = "place_hours"
    __table_args__ = (
        UniqueConstraint("place_id", "day_of_week", name="uq_place_hours_day"),
        CheckConstraint("day_of_week >= 0 AND day_of_week <= 6", name="ck_place_hours_day"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    place_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("places.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    # 0 = Monday through 6 = Sunday.
    day_of_week: Mapped[int] = mapped_column(Integer, nullable=False)
    opens_at: Mapped[time | None] = mapped_column(Time, nullable=True)
    closes_at: Mapped[time | None] = mapped_column(Time, nullable=True)
    is_closed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    place: Mapped[Place] = relationship(back_populates="hours")


class PlaceTag(Base):
    __tablename__ = "place_tags"

    place_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("places.id", ondelete="CASCADE"),
        primary_key=True,
    )
    tag: Mapped[str] = mapped_column(String(40), primary_key=True)

    place: Mapped[Place] = relationship(back_populates="tags")
