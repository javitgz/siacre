from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.auth import get_current_user # Dependencia que extrae el usuario autenticado desde el JWT
from app.models.user import User
from app.crud import user as crud_user
from app.crud import role as crud_role
from app.schemas.user import UserCreate, UserUpdate, UserResponse

router = APIRouter(prefix="/api/usuarios", tags=["Usuarios"])

# ===================================================================================
# 1. OBTENER PERFIL PROPIO (Acceso para todos los Roles, incluido los analistas)
# ===================================================================================
@router.get('/me', response_model=UserResponse)
def leer_perfil_propio(current_user: User = Depends(get_current_user)):
    """
    Permite a cualquier usuario autenticado (incluyendo analistas) consulsultar su propio perfil
    """
    return current_user

@router.patch('/me', response_model=UserResponse)
def actualizar_perfil_propio(
        user_in: UserUpdate,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """
    Permite a cualquier usuario actualizar exclusivamente sus propio datos de perfil
    """
    # Se fuerza a que solo pueda modificarse a si mismo dentro de su empresa
    user_actualizado = crud_user.update_user(
        db=db, user_id=current_user.id, empresa_id=current_user.empresa_id, user_in=user_in
    )
    return user_actualizado

# ===================================================================================
# 2. LISTAR USUARIOS DE LA EMPRESA (Restringido para analistas)
# ===================================================================================
@router.get('/', response_model=List[UserResponse])
def listar_usuarios(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Lista los usuarios del mismo inquilino (empresa_id)
    - Los analistas tienen el acceso denegado
    - Los coordinadores / supervisores no pueden ver los usuarios con rol 'administrador'
    """
    # REGLA 1: Los analistas, no tienne permiso al modulo de usuarios
    if current_user.rol.nombre.lower() == 'analista':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail='No tiene permisos para acceder al modulo de usuarios'
        )
    usuarios = crud_user.get_user_by_empresa(
        db = db, empresa_id=current_user.empresa_id, skip=skip, limit=limit
    )

    # REGLA 2: Coordinadores / supervisores no puede ver al usuario administrador
    if current_user.rol.nombre.lower() in ['coordinador', 'supervisor']:
        usuarios = [u for u in usuarios if u.rol.nombre.lower() != 'administrador']

    return usuarios

# ===================================================================================
# 3. CREAR USUARIO (Reglas jerarquicas estrictas de Roles)
# ===================================================================================
@router.post('/', response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def crear_usuario(
        user_in: UserCreate,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """
    Registra un usuario bajo el aislamiento multi-tenant
    - Los analistas no puede crear usuarios
    - Solo un Administrador puede asignar el rol administrador
    - Los coordinadores / supervisores no pueden ver, seleccionar ni asignar el rol administrador
    """
    if current_user.rol.nombre.lower() == 'analista':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail='No tiene permiso para crear usuarios'
        )

    # Forzar que el nuevo usuario pertenezca estrictamente a la misma empresa del creador
    user_in.empresa_id = current_user.empresa_id

    # Verificar el rol que se intenta asignar
    rol_destino = crud_role.get_rol(db, role_id=user_in.rol_id)
    if not rol_destino:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='El rol asignado no existe'
        )

    # REGLA: Nadie inferior a administrador puede seleccionar o ver el rol administador
    if rol_destino.nombre.lower() == 'administrador' and current_user.rol.nombre.lower() != 'administrador':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail='Operacion no permitida. Solo un administrador puede crear otro administrador'
        )
    # Verificar unicidad del correo electronico
    usuario_existente = crud_user.get_user_by_email(db, email=user_in.email)
    if usuario_existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='El correo electronico ya se encuentra registrado'
        )
    return crud_user.create_user(db=db, user_in=user_in)

# ===================================================================================
# 4. ACTUALIZACION ADMINISTRATIVA Y CONTROL DE ESTADO
# ===================================================================================
@router.patch('/{user_id}', response_model=UserResponse)
def actualizar_usuario(
        user_id: int,
        user_in: UserUpdate,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """
    Permite a los mandos autorizados modificar los datos de perfil de un colaborador
     - analistas: acceso denegado
     - coordinadores / supervisores: Solo pueden modificar usuarios con rol analista
    """
    if current_user.rol.nombre.lower() == 'analista':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail='No tiene permisos para modificar usuarios'
        )

    target_user = crud_user.get_user(db=db, user_id=user_id, empresa_id=current_user.empresa_id)
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Usuario no encontrado en esta empresa'
        )

    # REGLA JERARQUICA: Validar limites de edicion del coordinador / supervisor
    if current_user.rol.nombre.lower() in ['coordinador', 'supervisor']:
        if target_user.rol.nombre.lower() != 'analista':
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail='Permiso denegado: Los coordinadores / supervisores solo pueden actualizar perfiles analistas'
            )
    return crud_user.update_user(db=db, user_id=user_id, empresa_id=current_user.empresa_id, user_in=user_in)

# ===================================================================================
# 5. ACTIVAR / DESACTIVAR USUARIOS (Flujo de aprobacion descentralizado)
# ===================================================================================
@router.patch('/{user_id}/estado', response_model=UserResponse)
def cambiar_estado(
        user_id: int,
        activo: bool,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """
    Permite la activacion o desactivacion de un usuario
    - El administrador tiene control
    - El coordinador o supervisor puede activar / desactivar analistas exclusivamente
    """
    if current_user.rol.nombre.lower() == 'analista':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail='No tiene permisos para modificar estados de usuarios'
        )

    # Buscar el usuario objetivo garantizando el aislamiento por empresa
    target_user = crud_user.get_user(db=db, user_id=user_id, empresa_id=current_user.empresa_id)
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Usuario no encontrado en esta empresa'
        )

    # REGLA: Coordinador / supervisor solo puede alterar usuario con rol analista
    if current_user.rol.nombre.lower() in ['coordinador', 'supervisor']:
        if target_user.rol.nombre.lower() != 'analista':
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail='Permiso denegado. Los coordinadores / supervisores solo pueden activar o desactivar perfiles analistas'
            )
    return crud_user.cambiar_estado_usuario(
        db=db, user_id=user_id, empresa_id=current_user.empresa_id, activo=activo
    )

# ===================================================================================
# 6. ELIMINACION DE USUARIOS (Soft Delete)
# ===================================================================================
@router.delete('/{user_id}', response_model=UserResponse)
def eliminar_usuario(
        user_id: int,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """
        Ejecuta un borrado lógico (Soft Delete, estado = 0) sobre un usuario de la empresa.
        - Analistas: Acceso denegado.
        - Coordinadores/Supervisores: Solo pueden dar de baja a perfiles analistas.
        - Administrador: Control total sobre los colaboradores de su empresa.
        """
    if current_user.rol.nombre.lower() == 'analista':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail='No tiene permisos para eliminar usuarios.'
        )

    target_user = crud_user.get_user(db=db, user_id=user_id, empresa_id=current_user.empresa_id)
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Usuario no encontrado en esta empresa.'
        )

    # REGLA JERÁRQUICA: El coordinador/supervisor solo puede aplicar soft delete a analistas
    if current_user.rol.nombre.lower() in ['coordinador', 'supervisor']:
        if target_user.rol.nombre.lower() != 'analista':
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail='Permiso denegado. Los coordinadores / supervisores solo pueden eliminar perfiles analistas.'
            )

    return crud_user.delete_user(db=db, user_id=user_id, empresa_id=current_user.empresa_id)