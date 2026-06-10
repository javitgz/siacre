from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.auth import get_current_user # Intercepta el JWT y extraer el usuario
from app.models.user import User
from app.crud import role as crud_role
from app.schemas.role import RoleCreate, RoleUpdate, RoleResponse, PermisoRelacionResponse

router = APIRouter(prefix="/api/roles", tags=["Roles y Permisos"])

# ===================================================================================
# FUNCION DE CONTROL: Validación de Rol de administrador
# ===================================================================================
def verificar_acceso_admin(current_user: User):
    """
    Regla de negocio estricta: Ningun rol inferior a administracion puede verm
    crear o modificar roles o permisos en el ecosistema
    """
    if current_user.rol.nombre.lower() != 'administrador':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail='Acceso denegado: Solo el usuario administrador tiene permisos para este modulo'
        )

# ===================================================================================
# 1. GESTION DE CATALOGO MAESTRO DE PERMISOS (HU02 / HU03)
# ===================================================================================
@router.get('/permisos', response_model=List[PermisoRelacionResponse])
def listar_permisos(
        skip: int = 0,
        limit: int = 100,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """
    Retorna el catalogo maestro de permisos del sistema
    Exclusivo para el administrador
    """
    verificar_acceso_admin(current_user)
    return crud_role.get_permisos(db=db, skip=skip, limit=limit)

# ===================================================================================
# 2. ENDPOINTS CRUD DE ROLES (HU01)
# ===================================================================================
@router.get('/', response_model=List[RoleResponse])
def listar_roles(
        skip: int = 0,
        limit: int = 100,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """
    Retorna la lista de roles definidos y activos en el sistema
    Exclusivo para el administrador
    """
    verificar_acceso_admin(current_user)
    return crud_role.get_roles(db=db, skip=skip, limit=limit)

@router.get('/{role_id}', response_model=RoleResponse)
def obtener_rol_id(
        role_id: int,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """
    Busca y retorna un rol específico mediante su ID
    Exclusivo para el administrador
    """
    verificar_acceso_admin(current_user)
    rol = crud_role.get_rol(db=db, role_id=role_id)
    if not rol:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='El rol solicitado no existe en el sistema'
        )
    return rol

@router.post('/', response_model=RoleResponse, status_code=status.HTTP_201_CREATED)
def crear_nuevo_rol(
        role_in: RoleCreate,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """
    Crea un nuevo rol en la base de datos validando que el nombre no este duplicado
    Exclusivo para el administrador
    """
    verificar_acceso_admin(current_user)

    # Prevenir duplicados en el aprovisionamiento de nombres de roles
    rol_existente = crud_role.get_role_by_nombre(db=db, nombre=role_in.nombre)
    if rol_existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"El rol con el nombre '{role_in.nombre}' ya se encuentra registrado"
        )
    return crud_role.create_role(db=db, role_in=role_in)

@router.patch('/{role_id}', response_model=RoleResponse)
def actualizar_rol(
        role_id: int,
        role_in: RoleUpdate,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """
    Modifica parcialmente un rol existente (PATCH)
    Exclusive para el administrador
    """
    verificar_acceso_admin(current_user)

    rol_actualizado = crud_role.update_role(db=db, role_id=role_id, role_in=role_in)
    if not rol_actualizado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='No se encontro el rol a actualizar'
        )
    return rol_actualizado

@router.delete('/{role_id}', response_model=RoleResponse)
def eliminar_rol(
        role_id: int,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """
    Desactiva el rol estableciendo su estado en 0 (Soft Delete)
    Exclusivo para el administrador
    """
    verificar_acceso_admin(current_user)
    rol_eliminado = crud_role.delete_role(db=db, role_id=role_id)
    if not rol_eliminado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='No se encontró el rol a eliminar'
        )
    return rol_eliminado

# ===================================================================================
# 3. ASOCIACIÓN ATÓMICA DE MATRIZ DE PERMISOS (RBAC)
# ===================================================================================
@router.post('/{role_id}/permisos', status_code=status.HTTP_200_OK)
def asociar_permisos_rol(
        role_id: int,
        permisos_ids: List[int],
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """
    Sincroniza la tabla asociativa intermedia 'roles_permisos' para un rol determinado
    Remueve relaciones previas e inserta el nuevo conjunto de forma atomica
    Exclusivo para el administrador
    """
    verificar_acceso_admin(current_user)

    # Validar primero que el rol exista antes de proceder a la limpieza / sincronización
    rol = crud_role.get_rol(db=db, role_id=role_id)
    if not rol:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='El rol especificado no existe'
        )
    exito = crud_role.assign_permisos_to_role(db=db, role_id=role_id, permisos_ids=permisos_ids)
    if not exito:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='No se pudo completar la sincronización de la matriz de permisos'
        )
    return {'status': 'success', 'message': f"Matriz de permisos sincronizada correctamente para el rol ID {role_id}."}
