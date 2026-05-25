from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.crud import role as crud_role
from app.schemas.role import RoleCreate, RoleResponse

router = APIRouter(prefix="/api/roles", tags=["Roles"])

@router.get("/", response_model=List[RoleResponse])
def read_roles(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_role.get_roles(db, skip=skip, limit=limit)

@router.post("/", response_model=RoleResponse, status_code=status.HTTP_201_CREATED)
def create_new_role(role: RoleCreate, db: Session = Depends(get_db)):
    db_role = crud_role.get_role_by_name(db, nombre=role.nombre)
    if db_role:
        raise HTTPException(status_code=400, detail="El rol ya existe")
    return crud_role.create_role(db=db, role=role)

@router.put("/{role_id}", response_model=RoleResponse)
def modify_role(role_id: int, role_update: RoleCreate, db: Session = Depends(get_db)):
    db_role = crud_role.update_role(db=db, role_id=role_id, role_update=role_update)
    if not db_role:
        raise HTTPException(status_code=404, detail="Rol no encontrado")
    return db_role

@router.delete("/{role_id}", response_model=RoleResponse)
def remove_role(role_id: int, db: Session = Depends(get_db)):
    db_role = crud_role.delete_role(db=db, role_id=role_id)
    if not db_role:
        raise HTTPException(status_code=404, detail="Rol no encontrado")
    return db_role