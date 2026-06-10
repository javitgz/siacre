from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.core.auth import pwd_context
from typing import List, Optional

def get_user(db: Session, user_id: int, empresa_id: int) -> Optional[User]:
    """
    Recupera un usuario garantizando el asilamiento Multi-Tenant
    Evita que un usuario intente adivinar IDs de otras empresas modificando la URL
    """
    return db.query(User).filter(User.id == user_id, User.empresa_id == empresa_id).first()

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """
    Recupera un usuario por su correo electronico a nivel global
    Esencial para el inicio de sesion y para garantizar que un correo no se registre dos veces
    """
    return db.query(User).filter(User.email == email).first()

def get_user_by_empresa(db: Session, empresa_id: int, skip: int = 0, limit: int = 100) -> List[User]:
    """
    Retorna el listado de usuarios pertenecientes exclusivamente a una empresa
    Cumple con las HUs de isalamiento limitando la visualizacion al contexto del inquilino
    """
    return db.query(User).filter(
        User.empresa_id == empresa_id,
        User.estado == 1
    ).offset(skip).limit(limit).all()

def create_user(db: Session, user_in: UserCreate) -> User:
    """
    Registra un nuevo usuario en la base de datos de SIACRE
    Aplica hashing seguro con Bcrypt y fuerza el estado INACTIVO (0) por defecto
    para que un administrador deba autorizar su ingreso formalmente
    """
    # Encriptacion de la contraseña usando el pwd_context importado de core/auth.py
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
        estado=0, # inactivo por defecto, requiere activacion del administrador
        rol_id=user_in.rol_id,
        empresa_id=user_in.empresa_id
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: int, empresa_id: int, user_in: UserUpdate) -> Optional[User]:
    """
    Actualiza de forma parcial (PATCH) los atributos de perfil de un usuario, validando su pertinencia a la empresa
    Si la peticion incluye una actualizacion de contraseña, la procesa de forma segura
    con hashing antes de enviarla a la base de datos
    """
    db_user = db.query(User).filter(User.id == user_id, User.empresa_id == empresa_id).first()
    if not db_user:
        return None

    update_data = user_in.model_dump(exclude_unset=True)

    # Manejo seguro si se decide actualizar el password de un usuario existente
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
    """
    Ejecuta un borrado logico (Soft Delete) cambiando el estado del usuario a 0 (Inactivo)
    Garantiza la trazabilidad historica de las auditorias y operaciones de credito previas
    """
    db_user = db.query(User).filter(User.id == user_id, User.empresa_id == empresa_id).first()
    if not db_user:
        return None
    db_user.estado = 0
    db.commit()
    db.refresh(db_user)
    return db_user

def cambiar_estado_usuario(db: Session, user_id: int, empresa_id: int, activo: bool) -> Optional[User]:
    """
    Permite al administrador activar (1) o desactivar (0) un usuario de su propia empresa
    Resuelve el flujo de autorizacion posterior al registro
    """
    db_user = db.query(User).filter(User.id == user_id, User.empresa_id == empresa_id).first()
    if not db_user:
        return None

    db_user.estado = 1 if activo else 0
    db.commit()
    db.refresh(db_user)
    return db_user

def get_users(db: Session, empresa_id: int, skip: int = 0, limit: int = 100) -> List[User]:
    """
    Retorna la lista de usuarios registrados en el sistema
    Filtra los registros activos (estado = 1) conforme al criterio de HU01
    """
    return db.query(User).filter(User.estado == 1, User.empresa_id == empresa_id).offset(skip).limit(limit).all()
