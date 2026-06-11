from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.crud import user as crud_user
from app.crud import role as crud_role
from app.schemas.user import UserCreate, UserUpdate, UserResponse

router = APIRouter(prefix="/api/usuarios", tags=["Usuarios"])

@router.get('/me', response_model=UserResponse)
def leer_perfil_propio(current_user: User = Depends(get_current_user)):
    return current_user

@router.patch('/me', response_model=UserResponse)
def actualizar_perfil_propio(
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user_actualizado = crud_user.update_user(
        db=db, user_id=current_user.id, empresa_id=current_user.empresa_id, user_in=user_in
    )
    return user_actualizado

@router.get('', response_model=List[UserResponse])
@router.get('/', response_model=List[UserResponse])
def listar_usuarios(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.rol.nombre.lower() == 'analista':
        raise HTTPException(status_code=403, detail='No tiene permisos')
    usuarios = crud_user.get_user_by_empresa(db, empresa_id=current_user.empresa_id, skip=skip, limit=limit)
    if current_user.rol.nombre.lower() in ['coordinador', 'supervisor']:
        usuarios = [u for u in usuarios if u.rol.nombre.lower() != 'administrador']
    # Añadir rol_nombre a cada usuario (FastAPI lo hará automáticamente si el esquema lo permite, pero por si acaso)
    for u in usuarios:
        u.rol_nombre = u.rol.nombre if u.rol else None
    return usuarios

@router.get('/list', response_model=List[UserResponse])
def listar_usuarios_alternativo(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return listar_usuarios(skip, limit, db, current_user)

@router.post('/', response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def crear_usuario(
    user_in: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.rol.nombre.lower() == 'analista':
        raise HTTPException(status_code=403, detail='No tiene permiso')
    user_in.empresa_id = current_user.empresa_id
    rol_destino = crud_role.get_rol(db, role_id=user_in.rol_id)
    if not rol_destino:
        raise HTTPException(status_code=404, detail='El rol asignado no existe')
    if rol_destino.nombre.lower() == 'administrador' and current_user.rol.nombre.lower() != 'administrador':
        raise HTTPException(status_code=403, detail='Solo administrador puede crear otro administrador')
    usuario_existente = crud_user.get_user_by_email(db, email=user_in.email)
    if usuario_existente:
        raise HTTPException(status_code=400, detail='El correo ya existe')
    return crud_user.create_user(db=db, user_in=user_in)

@router.patch('/{user_id}', response_model=UserResponse)
def actualizar_usuario(
    user_id: int,
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.rol.nombre.lower() == 'analista':
        raise HTTPException(status_code=403, detail='No tiene permisos')
    target_user = crud_user.get_user(db=db, user_id=user_id, empresa_id=current_user.empresa_id)
    if not target_user:
        raise HTTPException(status_code=404, detail='Usuario no encontrado')
    if current_user.rol.nombre.lower() in ['coordinador', 'supervisor']:
        if target_user.rol.nombre.lower() != 'analista':
            raise HTTPException(status_code=403, detail='Solo puede actualizar analistas')
    return crud_user.update_user(db=db, user_id=user_id, empresa_id=current_user.empresa_id, user_in=user_in)

@router.patch('/{user_id}/estado', response_model=UserResponse)
def cambiar_estado(
    user_id: int,
    activo: bool,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.rol.nombre.lower() == 'analista':
        raise HTTPException(status_code=403, detail='No tiene permisos')
    target_user = crud_user.get_user(db=db, user_id=user_id, empresa_id=current_user.empresa_id)
    if not target_user:
        raise HTTPException(status_code=404, detail='Usuario no encontrado')
    # Evitar que un administrador se desactive a sí mismo
    if target_user.id == current_user.id and not activo:
        raise HTTPException(status_code=403, detail='No puede desactivar su propia cuenta')
    if current_user.rol.nombre.lower() in ['coordinador', 'supervisor']:
        if target_user.rol.nombre.lower() != 'analista':
            raise HTTPException(status_code=403, detail='Solo puede cambiar estado de analistas')
    return crud_user.cambiar_estado_usuario(db=db, user_id=user_id, empresa_id=current_user.empresa_id, activo=activo)

@router.delete('/{user_id}', response_model=UserResponse)
def eliminar_usuario(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.rol.nombre.lower() == 'analista':
        raise HTTPException(status_code=403, detail='No tiene permisos')
    target_user = crud_user.get_user(db=db, user_id=user_id, empresa_id=current_user.empresa_id)
    if not target_user:
        raise HTTPException(status_code=404, detail='Usuario no encontrado')
    if current_user.rol.nombre.lower() in ['coordinador', 'supervisor']:
        if target_user.rol.nombre.lower() != 'analista':
            raise HTTPException(status_code=403, detail='Solo puede eliminar analistas')
    return crud_user.delete_user(db=db, user_id=user_id, empresa_id=current_user.empresa_id)