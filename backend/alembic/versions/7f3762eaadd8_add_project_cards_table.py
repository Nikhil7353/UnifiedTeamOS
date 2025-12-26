"""Add project_cards table

Revision ID: 7f3762eaadd8
Revises: d6b5d31b56f2
Create Date: 2025-12-26 12:50:17.173068

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7f3762eaadd8'
down_revision: Union[str, Sequence[str], None] = 'd6b5d31b56f2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Create project_cards table
    op.create_table('project_cards',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('status', sa.String(), nullable=True),
        sa.Column('priority', sa.String(), nullable=True),
        sa.Column('project_id', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=True),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_project_cards_id'), 'project_cards', ['id'], unique=False)
    op.create_index(op.f('ix_project_cards_project_id'), 'project_cards', ['project_id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    # Drop project_cards table
    op.drop_index(op.f('ix_project_cards_project_id'), table_name='project_cards')
    op.drop_index(op.f('ix_project_cards_id'), table_name='project_cards')
    op.drop_table('project_cards')
