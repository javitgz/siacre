from sqlalchemy.orm import Session
from app.models.role import Role
from app.schemas.role import RoleCreate

# Funcion para consultar todos los roles
def get_roles(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Role).offset(skip).limit(limit).all()

# Funcion para consultar rol por nombre
def get_role_by_name(db: Session, nombre: str):
    return db.query(Role).filter(Role.nombre == nombre).first()

# Funcion para consultar rol por id
def gt_role_by_id(db: Session, role_id: int):
    return db.query(Role).filter(Role.id == role_id).first()

# Funcion para crear rol
def create_role(db: Session, role: RoleCreate):
    db_role = Role(
        nombre=role.nombre,
        descripcion=role.descripcion,
        estado=role.estado,
        permisos=role.permisos
    )
    db.add(db_role)
    db.commit()
    db.refresh(db_role)
    return db_role

# Funcion para actualizar rol por id
def update_role(db: Session, role_id: int, role_update: RoleCreate):
    db_role = db.query(Role).filter(Role.id == role_id).first()
    if db_role:
        db_role.nombre = role_update.nombre
        db_role.descripcion = role_update.descripcion
        db_role.estado = role_update.estado
        db_role.permisos = role_update.permisos
        db.commit()
        db.refresh(db_role)
    return db_role

# Funcion para eliminar rol (Eliminado logico)
def delete_role(db: Session, role_id: int):
    db_role = db.query(Role).filter(Role.id == role_id).first()
    if db_role:
        db_role.estado = 0  # Soft Delete (Inactivación)
        db.commit()
        db.refresh(db_role)
    return db_role