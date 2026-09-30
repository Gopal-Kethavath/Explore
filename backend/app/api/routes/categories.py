from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.place import CategoryOut
from app.services.places import list_categories

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("", response_model=list[CategoryOut])
def read_categories(db: Annotated[Session, Depends(get_db)]) -> list[CategoryOut]:
    return [CategoryOut.model_validate(category) for category in list_categories(db)]
