"""Initial catalog schema.

Revision ID: 0001_initial
Revises:
Create Date: 2026-09-30
"""

from alembic import op
import sqlalchemy as sa

revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm")
    op.create_table(
        "categories",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("slug", sa.String(length=40), nullable=False),
        sa.Column("name", sa.String(length=80), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("sort_order", sa.Integer(), server_default="0", nullable=False),
        sa.UniqueConstraint("slug", name="uq_categories_slug"),
    )
    op.create_table(
        "places",
        sa.Column("id", sa.Uuid(), server_default=sa.text("gen_random_uuid()"), primary_key=True),
        sa.Column("slug", sa.String(length=80), nullable=False),
        sa.Column("name", sa.String(length=160), nullable=False),
        sa.Column("category_id", sa.Integer(), nullable=False),
        sa.Column("summary", sa.Text(), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("address", sa.Text(), nullable=False),
        sa.Column("locality", sa.String(length=120), nullable=False),
        sa.Column("region", sa.String(length=20), nullable=False),
        sa.Column("distance_km", sa.Numeric(6, 1), nullable=False),
        sa.Column("drive_time_minutes", sa.Integer(), nullable=False),
        sa.Column("latitude", sa.Float(), nullable=False),
        sa.Column("longitude", sa.Float(), nullable=False),
        sa.Column("best_time", sa.Text(), nullable=False),
        sa.Column("entry_fee_note", sa.Text(), nullable=False),
        sa.Column("tips", sa.Text(), nullable=False),
        sa.Column("rating", sa.Numeric(2, 1), nullable=False),
        sa.Column("is_featured", sa.Boolean(), server_default=sa.false(), nullable=False),
        sa.Column("is_published", sa.Boolean(), server_default=sa.true(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint(
            "region IN ('in-city', 'half-day', 'weekend')",
            name="ck_places_region",
        ),
        sa.CheckConstraint("rating >= 0 AND rating <= 5", name="ck_places_rating"),
        sa.CheckConstraint("distance_km >= 0", name="ck_places_distance"),
        sa.CheckConstraint("drive_time_minutes >= 0", name="ck_places_drive_time"),
        sa.ForeignKeyConstraint(["category_id"], ["categories.id"], ondelete="RESTRICT"),
        sa.UniqueConstraint("slug", name="uq_places_slug"),
    )
    op.create_index("ix_places_category_id", "places", ["category_id"])
    op.create_index("ix_places_region", "places", ["region"])
    op.create_index("ix_places_is_featured", "places", ["is_featured"])
    op.create_index("ix_places_is_published", "places", ["is_published"])
    op.execute("CREATE INDEX ix_places_name_trgm ON places USING gin (name gin_trgm_ops)")
    op.execute("CREATE INDEX ix_places_summary_trgm ON places USING gin (summary gin_trgm_ops)")
    op.create_table(
        "place_photos",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("place_id", sa.Uuid(), nullable=False),
        sa.Column("url", sa.String(length=1000), nullable=False),
        sa.Column("alt_text", sa.String(length=300), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False),
        sa.Column("is_cover", sa.Boolean(), nullable=False),
        sa.ForeignKeyConstraint(["place_id"], ["places.id"], ondelete="CASCADE"),
    )
    op.create_index("ix_place_photos_place_id", "place_photos", ["place_id"])
    op.create_table(
        "place_hours",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("place_id", sa.Uuid(), nullable=False),
        sa.Column("day_of_week", sa.Integer(), nullable=False),
        sa.Column("opens_at", sa.Time(), nullable=True),
        sa.Column("closes_at", sa.Time(), nullable=True),
        sa.Column("is_closed", sa.Boolean(), nullable=False),
        sa.CheckConstraint("day_of_week >= 0 AND day_of_week <= 6", name="ck_place_hours_day"),
        sa.ForeignKeyConstraint(["place_id"], ["places.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("place_id", "day_of_week", name="uq_place_hours_day"),
    )
    op.create_index("ix_place_hours_place_id", "place_hours", ["place_id"])
    op.create_table(
        "place_tags",
        sa.Column("place_id", sa.Uuid(), nullable=False),
        sa.Column("tag", sa.String(length=40), nullable=False),
        sa.ForeignKeyConstraint(["place_id"], ["places.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("place_id", "tag"),
    )


def downgrade() -> None:
    op.drop_table("place_tags")
    op.drop_table("place_hours")
    op.drop_table("place_photos")
    op.drop_table("places")
    op.drop_table("categories")
    op.execute("DROP EXTENSION IF EXISTS pg_trgm")
