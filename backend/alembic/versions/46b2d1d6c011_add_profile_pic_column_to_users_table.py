"""Add profile_pic column to users table

Revision ID: 46b2d1d6c011
Revises: e2f9b180a399
Create Date: 2025-12-26 12:41:17.277338

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '46b2d1d6c011'
down_revision: Union[str, Sequence[str], None] = 'e2f9b180a399'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add profile_pic column to users table
    op.add_column('users', sa.Column('profile_pic', sa.String(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    # Remove profile_pic column from users table
    op.drop_column('users', 'profile_pic')
