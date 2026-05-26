from sqlalchemy.orm import Session, joinedload
from app.models.user import User
from app.schemas.user import UserCreate
from app.core.auth import get_password_hash

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(User).options(joinedload(User.rol)).offset(skip).limit(limit).all()

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def get_user_by_id(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()

def create_user(db: Session, user: UserCreate):
    db_user = User(
        nombre=user.nombre,
        apellidos=user.apellidos,
        tipo_documento=user.tipo_documento,
        documento=user.documento,
        telefono=user.telefono,
        direccion=user.direccion,
        municipio=user.municipio,
        departamento=user.departamento,
        email=user.email,
        password=get_password_hash(user.password),
        estado=user.estado,
        rol_id=user.rol_id
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: int, user_update: UserCreate):
    db_user = db.query(User).filter(User.id == user_id).first()
    if db_user:
        db_user.nombre = user_update.nombre
        db_user.apellidos = user_update.apellidos
        db_user.tipo_documento = user_update.tipo_documento
        db_user.documento = user_update.documento
        db_user.telefono = user_update.telefono
        db_user.direccion = user_update.direccion
        db_user.municipio = user_update.municipio
        db_user.departamento = user_update.departamento
        db_user.email = user_update.email
        # Solo actualizar contraseña si se envió un valor no vacío
        if user_update.password and user_update.password.strip():
            db_user.password = get_password_hash(user_update.password)
        db_user.estado = user_update.estado
        db_user.rol_id = user_update.rol_id
        db.commit()
        db.refresh(db_user)
    return db_user

def delete_user(db: Session, user_id: int):
    db_user = db.query(User).filter(User.id == user_id).first()
    if db_user:
        db_user.estado = 0  # Soft delete
        db.commit()
        db.refresh(db_user)
    return db_user

def cambiar_estado_usuario(db: Session, user_id: int, activo: bool):
    db_user = db.query(User).filter(User.id == user_id).first()
    if db_user:
        db_user.estado = 1 if activo else 0
        db.commit()
        db.refresh(db_user)
    return db_user