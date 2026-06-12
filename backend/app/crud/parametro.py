from sqlalchemy.orm import Session
from app.models.parametro import Parametro
from app.schemas.parametro import ParametroCreate, ParametroUpdate
from typing import List, Optional

def get_parametro(db: Session, id: int) -> Optional[Parametro]:
    return db.query(Parametro).filter(Parametro.id == id).first()

def get_parametro_by_codigo(db: Session, codigo: str) -> Optional[Parametro]:
    return db.query(Parametro).filter(Parametro.codigo == codigo).first()

def get_parametros(db: Session, skip: int = 0, limit: int = 100, activos_only: bool = True) -> List[Parametro]:
    query = db.query(Parametro)
    if activos_only:
        query = query.filter(Parametro.estado == 1)
    return query.offset(skip).limit(limit).all()

def create_parametro(db: Session, param_in: ParametroCreate) -> Parametro:
    db_param = Parametro(**param_in.model_dump())
    db.add(db_param)
    db.commit()
    db.refresh(db_param)
    return db_param

def update_parametro(db: Session, id: int, param_in: ParametroUpdate) -> Optional[Parametro]:
    db_param = db.query(Parametro).filter(Parametro.id == id).first()
    if not db_param:
        return None
    update_data = param_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_param, field, value)
    db.commit()
    db.refresh(db_param)
    return db_param

def delete_parametro(db: Session, id: int) -> Optional[Parametro]:
    db_param = db.query(Parametro).filter(Parametro.id == id).first()
    if not db_param:
        return None
    db_param.estado = 0
    db.commit()
    db.refresh(db_param)
    return db_param