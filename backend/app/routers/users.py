from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.crud import user as crud_user
from app.schemas.user import UserCreate, UserResponse

router = APIRouter(prefix="/api/usuarios", tags=["Usuarios"])

@router.get("/", response_model=List[UserResponse])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_user.get_users(db, skip=skip, limit=limit)

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_new_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = crud_user.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="El email ya se encuentra registrado")
    return crud_user.create_user(db=db, user=user)

@router.put("/{user_id}", response_model=UserResponse)
def modify_user(user_id: int, user_update: UserCreate, db: Session = Depends(get_db)):
    db_user = crud_user.update_user(db=db, user_id=user_id, user_update=user_update)
    if not db_user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return db_user

@router.delete("/{user_id}", response_model=UserResponse)
def remove_user(user_id: int, db: Session = Depends(get_db)):
    db_user = crud_user.delete_user(db=db, user_id=user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return db_user