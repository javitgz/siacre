from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from typing import List
from app.core.database import get_db
from app.crud import user as crud_user
from app.schemas.user import UserCreate, UserResponse
from app.core.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/usuarios", tags=["Usuarios"])

@router.get("/", response_model=List[UserResponse])
def read_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    users = db.query(User).options(joinedload(User.rol)).offset(skip).limit(limit).all()
    result = []
    for u in users:
        u_dict = {
            "id": u.id,
            "nombre": u.nombre,
            "apellidos": u.apellidos,
            "tipo_documento": u.tipo_documento,
            "documento": u.documento,
            "telefono": u.telefono,
            "direccion": u.direccion,
            "municipio": u.municipio,
            "departamento": u.departamento,
            "email": u.email,
            "estado": u.estado,
            "rol_id": u.rol_id,
            "creado": u.creado,
            "rol_nombre": u.rol.nombre if u.rol else None
        }
        result.append(UserResponse(**u_dict))
    return result

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_new_user(
    user: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_user = crud_user.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="El email ya se encuentra registrado")
    new_user = crud_user.create_user(db=db, user=user)
    return UserResponse(
        id=new_user.id,
        nombre=new_user.nombre,
        apellidos=new_user.apellidos,
        tipo_documento=new_user.tipo_documento,
        documento=new_user.documento,
        telefono=new_user.telefono,
        direccion=new_user.direccion,
        municipio=new_user.municipio,
        departamento=new_user.departamento,
        email=new_user.email,
        estado=new_user.estado,
        rol_id=new_user.rol_id,
        creado=new_user.creado,
        rol_nombre=new_user.rol.nombre if new_user.rol else None
    )

@router.put("/{user_id}", response_model=UserResponse)
def modify_user(
    user_id: int,
    user_update: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.id == user_id and user_update.rol_id != current_user.rol_id:
        raise HTTPException(status_code=403, detail="No puede cambiar su propio rol")
    db_user = crud_user.update_user(db=db, user_id=user_id, user_update=user_update)
    if not db_user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return UserResponse(
        id=db_user.id,
        nombre=db_user.nombre,
        apellidos=db_user.apellidos,
        tipo_documento=db_user.tipo_documento,
        documento=db_user.documento,
        telefono=db_user.telefono,
        direccion=db_user.direccion,
        municipio=db_user.municipio,
        departamento=db_user.departamento,
        email=db_user.email,
        estado=db_user.estado,
        rol_id=db_user.rol_id,
        creado=db_user.creado,
        rol_nombre=db_user.rol.nombre if db_user.rol else None
    )

@router.delete("/{user_id}", response_model=UserResponse)
def remove_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user_to_delete = crud_user.get_user_by_id(db, user_id)
    if not user_to_delete:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    if user_to_delete.email == "admin@siacre.com" or user_to_delete.rol_id == 1:
        raise HTTPException(status_code=403, detail="No se puede eliminar el administrador principal")
    db_user = crud_user.delete_user(db=db, user_id=user_id)
    return UserResponse(
        id=db_user.id,
        nombre=db_user.nombre,
        apellidos=db_user.apellidos,
        tipo_documento=db_user.tipo_documento,
        documento=db_user.documento,
        telefono=db_user.telefono,
        direccion=db_user.direccion,
        municipio=db_user.municipio,
        departamento=db_user.departamento,
        email=db_user.email,
        estado=db_user.estado,
        rol_id=db_user.rol_id,
        creado=db_user.creado,
        rol_nombre=db_user.rol.nombre if db_user.rol else None
    )

@router.patch("/{user_id}/estado", response_model=UserResponse)
def toggle_user_status(
    user_id: int,
    activo: bool = Query(...),  # ✅ query parameter, no body
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.id == user_id and not activo:
        raise HTTPException(status_code=403, detail="No puede desactivarse a sí mismo")
    user = crud_user.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    if user.email == "admin@siacre.com" or user.rol_id == 1:
        raise HTTPException(status_code=403, detail="No se puede modificar el estado del administrador principal")
    nuevo_estado = 1 if activo else 0
    if user.estado == nuevo_estado:
        estado_texto = "activado" if activo else "desactivado"
        raise HTTPException(status_code=400, detail=f"El usuario ya se encuentra {estado_texto}")
    db_user = crud_user.cambiar_estado_usuario(db, user_id, activo)
    return UserResponse(
        id=db_user.id,
        nombre=db_user.nombre,
        apellidos=db_user.apellidos,
        tipo_documento=db_user.tipo_documento,
        documento=db_user.documento,
        telefono=db_user.telefono,
        direccion=db_user.direccion,
        municipio=db_user.municipio,
        departamento=db_user.departamento,
        email=db_user.email,
        estado=db_user.estado,
        rol_id=db_user.rol_id,
        creado=db_user.creado,
        rol_nombre=db_user.rol.nombre if db_user.rol else None
    )