from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(User).offset(skip).limit(limit).all()

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def create_user(db: Session, user: UserCreate):
    db_user = User(
        nombre=user.nombre,
        email=user.email,
        password=user.password,  # NOTA: Implementar hash de seguridad después
        rol_id=user.rol_id,
        estado=user.estado
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: int, user_update: UserCreate):
    db_user = db.query(User).filter(User.id == user_id).first()
    if db_user:
        db_user.nombre = user_update.nombre
        db_user.email = user_update.email
        db_user.password = user_update.password
        db_user.rol_id = user_update.rol_id
        db_user.estado = user_update.estado
        db.commit()
        db.refresh(db_user)
    return db_user

def delete_user(db: Session, user_id: int):
    db_user = db.query(User).filter(User.id == user_id).first()
    if db_user:
        db_user.estado = 0  # Soft Delete
        db.commit()
        db.refresh(db_user)
    return db_user