from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.models.role import Permiso
from app.schemas.permiso import PermisoCreate, PermisoUpdate, PermisoResponse
from app.crud.auditoria import registrar_auditoria

router = APIRouter(prefix="/api/permisos", tags=["Gestión de Permisos"])

def verificar_admin(current_user: User):
    if current_user.rol.nombre.lower() != "administrador":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso denegado: Solo el administrador puede gestionar permisos."
        )

# ------------------------------------------------------------------
# LISTAR PERMISOS (CON Y SIN BARRA)
# ------------------------------------------------------------------
@router.get('', response_model=List[PermisoResponse])   # ← sin barra
@router.get('/', response_model=List[PermisoResponse])  # ← con barra
def listar_permisos(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    verificar_admin(current_user)
    permisos = db.query(Permiso).filter(Permiso.estado == 1).offset(skip).limit(limit).all()
    return permisos

# ------------------------------------------------------------------
# CREAR PERMISO
# ------------------------------------------------------------------
@router.post('/', response_model=PermisoResponse, status_code=status.HTTP_201_CREATED)
def crear_permiso(
    permiso_in: PermisoCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    verificar_admin(current_user)
    existe = db.query(Permiso).filter(Permiso.nombre == permiso_in.nombre).first()
    if existe:
        raise HTTPException(status_code=400, detail=f"Ya existe un permiso con el nombre '{permiso_in.nombre}'.")
    nuevo = Permiso(
        nombre=permiso_in.nombre,
        descripcion=permiso_in.descripcion,
        estado=1
    )
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    # Registrar la acción del usuario en auditoria
    registrar_auditoria(db, current_user, 'CREATE', 'permiso', f"ID: {nuevo.id}, Nombre: {nuevo.nombre}")
    return nuevo

# ------------------------------------------------------------------
# ACTUALIZAR PERMISO
# ------------------------------------------------------------------
@router.put('/{permiso_id}', response_model=PermisoResponse)
def actualizar_permiso(
    permiso_id: int,
    permiso_in: PermisoUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    verificar_admin(current_user)
    permiso = db.query(Permiso).filter(Permiso.id == permiso_id).first()
    if not permiso:
        raise HTTPException(status_code=404, detail="Permiso no encontrado")
    if permiso_in.nombre and permiso_in.nombre != permiso.nombre:
        existe = db.query(Permiso).filter(Permiso.nombre == permiso_in.nombre).first()
        if existe:
            raise HTTPException(status_code=400, detail="El nombre del permiso ya existe")
        permiso.nombre = permiso_in.nombre
    if permiso_in.descripcion is not None:
        permiso.descripcion = permiso_in.descripcion
    db.commit()
    db.refresh(permiso)
    # Registrar la acción del usuario en auditoria
    registrar_auditoria(db, current_user, 'UPDATE', 'permiso', f"ID: {permiso_in.id}, Nombre: {permiso_in.nombre}")
    return permiso

# ------------------------------------------------------------------
# ELIMINAR PERMISO (SOFT DELETE)
# ------------------------------------------------------------------
@router.delete('/{permiso_id}', response_model=PermisoResponse)
def eliminar_permiso(
    permiso_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    verificar_admin(current_user)
    permiso = db.query(Permiso).filter(Permiso.id == permiso_id).first()
    if not permiso:
        raise HTTPException(status_code=404, detail="Permiso no encontrado")
    permiso.estado = 0
    db.commit()
    db.refresh(permiso)
    # Registrar la acción del usuario en auditoria
    registrar_auditoria(db, current_user, 'DELETE', 'permiso', f"ID: {permiso.id}, Nombre: {permiso.nombre}")
    return permiso