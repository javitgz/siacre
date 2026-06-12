from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.models.naturaleza import Naturaleza, NaturalezaEnum
from app.schemas.naturaleza import NaturalezaCreate, NaturalezaUpdate, NaturalezaResponse
from app.crud.auditoria import registrar_auditoria

router = APIRouter(prefix="/api/naturalezas", tags=["Gestión de Naturalezas"])

def verificar_admin(current_user: User):
    if current_user.rol.nombre.lower() != "administrador":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso denegado: Solo el administrador puede gestionar naturalezas."
        )

# ------------------------------------------------------------------
# LISTAR NATURALEZAS (CON Y SIN BARRA)
# ------------------------------------------------------------------
@router.get('', response_model=List[NaturalezaResponse])   # ← sin barra
@router.get('/', response_model=List[NaturalezaResponse])  # ← con barra
def listar_naturalezas(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    verificar_admin(current_user)
    naturalezas = db.query(Naturaleza).filter(Naturaleza.estado == 1).offset(skip).limit(limit).all()
    return naturalezas

# ------------------------------------------------------------------
# CREAR NATURALEZA
# ------------------------------------------------------------------
@router.post('/', response_model=NaturalezaResponse, status_code=status.HTTP_201_CREATED)
def crear_naturaleza(
    nat_in: NaturalezaCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    verificar_admin(current_user)
    existe = db.query(Naturaleza).filter(Naturaleza.nombre == nat_in.nombre).first()
    if existe:
        raise HTTPException(status_code=400, detail=f"Ya existe una naturaleza con el nombre '{nat_in.nombre}'.")
    nueva = Naturaleza(
        nombre=nat_in.nombre,
        descripcion=nat_in.descripcion,
        estado=1
    )
    db.add(nueva)
    db.commit()
    db.refresh(nueva)
    # Registrar la acción del usuario en auditoria
    registrar_auditoria(db, current_user, 'CREATE', 'naturaleza', f"ID: {nueva.id}, Nombre: {nueva.nombre}")
    return nueva

# ------------------------------------------------------------------
# ACTUALIZAR NATURALEZA
# ------------------------------------------------------------------
@router.put('/{naturaleza_id}', response_model=NaturalezaResponse)
def actualizar_naturaleza(
    naturaleza_id: int,
    nat_in: NaturalezaUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    verificar_admin(current_user)
    naturaleza = db.query(Naturaleza).filter(Naturaleza.id == naturaleza_id).first()
    if not naturaleza:
        raise HTTPException(status_code=404, detail="Naturaleza no encontrada")
    if nat_in.nombre is not None and nat_in.nombre != naturaleza.nombre:
        existe = db.query(Naturaleza).filter(Naturaleza.nombre == nat_in.nombre).first()
        if existe:
            raise HTTPException(status_code=400, detail="El nombre de la naturaleza ya existe")
        naturaleza.nombre = nat_in.nombre
    if nat_in.descripcion is not None:
        naturaleza.descripcion = nat_in.descripcion
    db.commit()
    db.refresh(naturaleza)
    # Registrar la acción del usuario en auditoria
    registrar_auditoria(db, current_user, 'UPDATE', 'naturaleza', f"ID: {naturaleza.id}, Nombre: {naturaleza.nombre}")
    return naturaleza

# ------------------------------------------------------------------
# ELIMINAR NATURALEZA (SOFT DELETE)
# ------------------------------------------------------------------
@router.delete('/{naturaleza_id}', response_model=NaturalezaResponse)
def eliminar_naturaleza(
    naturaleza_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    verificar_admin(current_user)
    naturaleza = db.query(Naturaleza).filter(Naturaleza.id == naturaleza_id).first()
    if not naturaleza:
        raise HTTPException(status_code=404, detail="Naturaleza no encontrada")
    naturaleza.estado = 0
    db.commit()
    db.refresh(naturaleza)
    # Registrar la acción del usuario en auditoria
    registrar_auditoria(db, current_user, 'DELETE', 'naturaleza', f"ID: {naturaleza.id}, Nombre: {naturaleza.nombre}")
    return naturaleza