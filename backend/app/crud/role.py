from sqlalchemy.orm import Session
from app.models.role import Role, Permiso, RolePermiso
from app.schemas.role import RoleCreate, RoleUpdate
from typing import List, Optional

def get_rol(db: Session, role_id: int) -> Optional[Role]:
    """
    Busca un rol especifico por su identificador unico (PK)
    """
    return db.query(Role).filter(Role.id == role_id).first()

def get_role_by_nombre(db: Session, nombre: str) -> Optional[Role]:
    """
    Busca un rol especifico por su nombre unico
    Util para prevenir duplicados durante el aprovisionamiento
    """
    return db.query(Role).filter(Role.nombre == nombre).first()

def get_roles(db: Session, skip: int = 0, limit: int = 100) -> List[Role]:
    """
    Retorna la lista de roles definidos en el sistema
    Filtra los registros activos (estado = 1) conforme al criterio de HU01
    """
    return db.query(Role).filter(Role.estado == 1).offset(skip).limit(limit).all()

def create_role(db: Session, role_in: RoleCreate) -> Role:
    """
    Persiste un nuevo rol en la base de datos MySQL
    """
    db_role = Role(
        nombre=role_in.nombre,
        descripcion=role_in.descripcion,
        estado=role_in.estado
    )
    db.add(db_role)
    db.commit()
    db.refresh(db_role)
    return db_role

def update_role(db: Session, role_id: int, role_in: RoleUpdate) -> Optional[Role]:
    """
     Actualiza de manera parcial (PATCH) los atributos de un rol existente
    """
    db_role = db.query(Role).filter(Role.id == role_id).first()
    if not db_role:
        return None

    update_data = role_in.model_dump(exclude_unset=True)
    for campo, valor in update_data.items():
        setattr(db_role, campo, valor)
    db.commit()
    db.refresh(db_role)
    return db_role


def delete_role(db: Session, role_id: int) -> Optional[Role]:
    """
    Desactiva el rol (estado = 0) ejecutando un Soft Delete.
    Evita romper en cascada la integridad de los usuarios que lo heredan.
    """
    db_role = db.query(Role).filter(Role.id == role_id).first()
    if not db_role:
        return None

    db_role.estado = 0
    db.commit()
    db.refresh(db_role)
    return db_role

# ==============================================================================
# FUNCIONALIDADES COMPLEMENTARIAS DE CONTROL DE ACCESO (RBAC)
# ==============================================================================

def get_permisos(db: Session, skip: int = 0, limit: int = 100) -> List[Permiso]:
    """
    Retorna el catálogo maestro de permisos del sistema (HU02 / HU03).
    """
    return db.query(Permiso).filter(Permiso.estado == 1).offset(skip).limit(limit).all()


def assign_permisos_to_role(db: Session, role_id: int, permiso_ids: List[int]) -> bool:
    """
    Sincroniza y asocia de forma atómica una lista de permisos a un rol específico
    en la tabla asociativa intermedia 'roles_permisos'.
    Remueve relaciones previas para evitar redundancias o duplicaciones accidentales.
    """
    # 1. Limpieza de relaciones previas del rol
    db.query(RolePermiso).filter(RolePermiso.rol_id == role_id).delete()

    # 2. Inserción de la nueva matriz de permisos
    for p_id in permiso_ids:
        db_role_permiso = RolePermiso(rol_id=role_id, permiso_id=p_id)
        db.add(db_role_permiso)

    db.commit()
    return True