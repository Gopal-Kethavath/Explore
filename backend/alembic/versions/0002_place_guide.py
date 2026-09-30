"""Add visit guide fields to places.

Revision ID: 0002_place_guide
Revises: 0001_initial
Create Date: 2026-09-30
"""

from alembic import op
import sqlalchemy as sa

revision = "0002_place_guide"
down_revision = "0001_initial"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("places", sa.Column("visit_duration", sa.String(length=80), server_default="", nullable=False))
    op.add_column("places", sa.Column("ticketed", sa.Boolean(), server_default=sa.false(), nullable=False))
    op.add_column("places", sa.Column("ticket_indian", sa.Text(), server_default="", nullable=False))
    op.add_column("places", sa.Column("ticket_foreign", sa.Text(), server_default="", nullable=False))
    op.add_column("places", sa.Column("getting_there", sa.Text(), server_default="", nullable=False))
    op.add_column("places", sa.Column("stay_nearby", sa.Text(), server_default="", nullable=False))
    op.add_column("places", sa.Column("what_to_pack", sa.Text(), server_default="", nullable=False))
    op.add_column("places", sa.Column("highlights", sa.JSON(), server_default=sa.text("'[]'"), nullable=False))
    op.create_index("ix_places_ticketed", "places", ["ticketed"])


def downgrade() -> None:
    op.drop_index("ix_places_ticketed", table_name="places")
    op.drop_column("places", "highlights")
    op.drop_column("places", "what_to_pack")
    op.drop_column("places", "stay_nearby")
    op.drop_column("places", "getting_there")
    op.drop_column("places", "ticket_foreign")
    op.drop_column("places", "ticket_indian")
    op.drop_column("places", "ticketed")
    op.drop_column("places", "visit_duration")
