# backend/app/crud/user.py
from sqlalchemy.orm import Session, joinedload
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.core.auth import pwd_context
from typing import List, Optional

def get_user(db: Session, user_id: int, empresa_id: int) -> Optional[User]:
    return db.query(User).filter(User.id == user_id, User.empresa_id == empresa_id).options(joinedload(User.rol)).first()

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).options(joinedload(User.rol)).first()

def get_user_by_empresa(db: Session, empresa_id: int, skip: int = 0, limit: int = 100) -> List[User]:
    return db.query(User).filter(
        User.empresa_id == empresa_id,
        User.estado == 1
    ).options(joinedload(User.rol)).offset(skip).limit(limit).all()

def create_user(db: Session, user_in: UserCreate) -> User:
    hashed_password = pwd_context.hash(user_in.password)
    db_user = User(
        tipo_documento=user_in.tipo_documento,
        documento=user_in.documento,
        nombres=user_in.nombres,
        apellidos=user_in.apellidos,
        telefono=user_in.telefono,
        direccion=user_in.direccion,
        municipio=user_in.municipio,
        departamento=user_in.departamento,
        email=user_in.email,
        hashed_password=hashed_password,
        estado=0,
        rol_id=user_in.rol_id,
        empresa_id=user_in.empresa_id
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: int, empresa_id: int, user_in: UserUpdate) -> Optional[User]:
    db_user = db.query(User).filter(User.id == user_id, User.empresa_id == empresa_id).first()
    if not db_user:
        return None
    update_data = user_in.model_dump(exclude_unset=True)
    if 'password' in update_data and update_data['password']:
        password_plano = update_data.pop('password')
        update_data['hashed_password'] = pwd_context.hash(password_plano)
    for campo, valor in update_data.items():
        if hasattr(db_user, campo):
            setattr(db_user, campo, valor)
    db.commit()
    db.refresh(db_user)
    return db_user

def delete_user(db: Session, user_id: int, empresa_id: int) -> Optional[User]:
    db_user = db.query(User).filter(User.id == user_id, User.empresa_id == empresa_id).first()
    if not db_user:
        return None
    db_user.estado = 0
    db.commit()
    db.refresh(db_user)
    return db_user

def cambiar_estado_usuario(db: Session, user_id: int, empresa_id: int, activo: bool) -> Optional[User]:
    db_user = db.query(User).filter(User.id == user_id, User.empresa_id == empresa_id).first()
    if not db_user:
        return None
    db_user.estado = 1 if activo else 0
    db.commit()
    db.refresh(db_user)
    return db_user

def get_users(db: Session, empresa_id: int, skip: int = 0, limit: int = 100) -> List[User]:
    return db.query(User).filter(User.estado == 1, User.empresa_id == empresa_id).options(joinedload(User.rol)).offset(skip).limit(limit).all()