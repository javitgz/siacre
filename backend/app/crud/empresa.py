from sqlalchemy.orm import Session
from app.models.empresa import Empresa
from app.schemas.empresa import EmpresaCreate, EmpresaUpdate
from typing import List, Optional

def get_empresa(db: Session, empresa_id: int) -> Optional[Empresa]:
    """
    Recupera una empresa especifica por su ID unico de base de datos
    """
    return db.query(Empresa).filter(Empresa.id == empresa_id).first()

def get_empresa_by_documento(db: Session, documento: str) -> Optional[Empresa]:
    """
    Busca una empresa por su numero de documento
    Utilizado para prevenir registros duplicados en el ecosistema SaaS
    """
    return db.query(Empresa).filter(Empresa.documento == documento).first()

def get_empresas(db: Session, skip: int = 0, limit: int = 100) -> List[Empresa]:
    """
    Retorna el listado global de empresas registradas con soporte para paginacion
    Filtra por defecto las empresas que se encuentren activas (estado = 1).
    """
    return db.query(Empresa).filter(Empresa.estado == 1).offset(skip).limit(limit).all()

def create_empresa(db: Session, empresa_in: EmpresaCreate) -> Empresa:
    """
    Registra una nueva empresa en el sistema
    Mapea de forma dinamica todos los campos del esquema Pydantic (EmpresaCreate)
    hacia el modelo ORM de SQLAlchemy para su persistencia
    """
    db_empresa = Empresa(
        naturaleza=empresa_in.naturaleza,
        nombres=empresa_in.nombres,
        apellidos=empresa_in.apellidos,
        razon_social=empresa_in.razon_social,
        tipo_documento=empresa_in.tipo_documento,
        documento=empresa_in.documento,
        dv=empresa_in.dv,
        direccion=empresa_in.direccion,
        municipio=empresa_in.municipio,
        departamento=empresa_in.departamento,
        email=empresa_in.email,
        telefono=empresa_in.telefono,
        ruta_logo=empresa_in.ruta_logo,
        estado=1  # Inicializa explícitamente como activa
    )
    db.add(db_empresa)
    db.commit()
    db.refresh(db_empresa)
    return db_empresa

def update_empresa(db: Session, empresa_id: int, empresa_in: EmpresaUpdate) -> Optional[Empresa]:
    """
    Actualiza de forma parcial (PATCH) los datos de una empresa existente
    Solo modifica los campos que hayan sido enviados explicitamente en la petición
    manteniendo intactos los valores preexistentes
    """
    db_empresa = db.query(Empresa).filter(Empresa.id == empresa_id).first()
    if not db_empresa:
        return None

    # Convierte el esquema Pydantic a un diccionario, exlcuyendo campos no enviados
    update_data = empresa_in.model_dump(exclude_unset=True)

    for campo, valor in update_data.items():
        setattr(db_empresa, campo, valor)

    db.commit()
    db.refresh(db_empresa)
    return db_empresa

def delete_empresa(db: Session, empresa_id: int) -> Optional[Empresa]:
    """
    Aplica un borrado logico (Soft Delete) sobre la empresa
    Cambia el estado a 0 (inactivo en lugar de destruir el registro fisico)
    preservando la integridad referencial historica de los creditos y usuarios asociados
    """
    db_empresa = db.query(Empresa).filter(Empresa.id == empresa_id).first()
    if not db_empresa:
        return None

    db_empresa.estado = 0
    db.commit()
    db.refresh(db_empresa)
    return db_empresa

