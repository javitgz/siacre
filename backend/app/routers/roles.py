from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.crud import role as crud_role
from app.schemas.role import RoleCreate, RoleUpdate, RoleResponse, PermisoRelacionResponse

router = APIRouter(prefix="/api/roles", tags=["Roles y Permisos"])

def verificar_acceso_admin(current_user: User):
    if current_user.rol.nombre.lower() != 'administrador':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail='Acceso denegado: Solo el usuario administrador tiene permisos para este modulo'
        )

# ------------------------------------------------------------------
# CATÁLOGO DE PERMISOS
# ------------------------------------------------------------------
@router.get('/permisos', response_model=List[PermisoRelacionResponse])
def listar_permisos_catalogo(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    verificar_acceso_admin(current_user)
    return crud_role.get_permisos(db=db, skip=skip, limit=limit)

# ------------------------------------------------------------------
# CRUD DE ROLES – LISTAR (CON Y SIN BARRA)
# ------------------------------------------------------------------
@router.get('', response_model=List[RoleResponse])   # ← sin barra
@router.get('/', response_model=List[RoleResponse])  # ← con barra
def listar_roles(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    verificar_acceso_admin(current_user)
    return crud_role.get_roles(db=db, skip=skip, limit=limit)

# ------------------------------------------------------------------
# OBTENER ROL POR ID
# ------------------------------------------------------------------
@router.get('/{role_id}', response_model=RoleResponse)
def obtener_rol_id(
    role_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    verificar_acceso_admin(current_user)
    rol = crud_role.get_rol(db=db, role_id=role_id)
    if not rol:
        raise HTTPException(status_code=404, detail='El rol solicitado no existe')
    return rol

# ------------------------------------------------------------------
# CREAR ROL
# ------------------------------------------------------------------
@router.post('/', response_model=RoleResponse, status_code=status.HTTP_201_CREATED)
def crear_nuevo_rol(
    role_in: RoleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    verificar_acceso_admin(current_user)
    rol_existente = crud_role.get_role_by_nombre(db=db, nombre=role_in.nombre)
    if rol_existente:
        raise HTTPException(status_code=400, detail=f"El rol con el nombre '{role_in.nombre}' ya se encuentra registrado")
    return crud_role.create_role(db=db, role_in=role_in)

# ------------------------------------------------------------------
# ACTUALIZAR ROL
# ------------------------------------------------------------------
@router.patch('/{role_id}', response_model=RoleResponse)
def actualizar_rol(
    role_id: int,
    role_in: RoleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    verificar_acceso_admin(current_user)
    rol_actualizado = crud_role.update_role(db=db, role_id=role_id, role_in=role_in)
    if not rol_actualizado:
        raise HTTPException(status_code=404, detail='No se encontró el rol a actualizar')
    return rol_actualizado

# ------------------------------------------------------------------
# ELIMINAR ROL (SOFT DELETE)
# ------------------------------------------------------------------
@router.delete('/{role_id}', response_model=RoleResponse)
def eliminar_rol(
    role_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    verificar_acceso_admin(current_user)
    rol_eliminado = crud_role.delete_role(db=db, role_id=role_id)
    if not rol_eliminado:
        raise HTTPException(status_code=404, detail='No se encontró el rol a eliminar')
    return rol_eliminado

# ------------------------------------------------------------------
# ASIGNAR PERMISOS A ROL
# ------------------------------------------------------------------
@router.post('/{role_id}/permisos', status_code=status.HTTP_200_OK)
def asociar_permisos_rol(
    role_id: int,
    permisos_ids: List[int],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    verificar_acceso_admin(current_user)
    rol = crud_role.get_rol(db=db, role_id=role_id)
    if not rol:
        raise HTTPException(status_code=404, detail='El rol especificado no existe')
    exito = crud_role.assign_permisos_to_role(db=db, role_id=role_id, permiso_ids=permisos_ids)
    if not exito:
        raise HTTPException(status_code=500, detail='No se pudo completar la sincronización')
    return {'status': 'success', 'message': f"Matriz de permisos sincronizada para el rol ID {role_id}."}