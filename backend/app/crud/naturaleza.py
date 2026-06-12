from sqlalchemy.orm import Session
from app.models.naturaleza import Naturaleza
from app.schemas.naturaleza import NaturalezaCreate, NaturalezaUpdate
from typing import List, Optional

def get_naturaleza(db: Session, naturaleza_id: int) -> Optional[Naturaleza]:
    return db.query(Naturaleza).filter(Naturaleza.id == naturaleza_id).first()

def get_naturaleza_by_nombre(db: Session, nombre: str) -> Optional[Naturaleza]:
    return db.query(Naturaleza).filter(Naturaleza.nombre == nombre).first()

def get_naturalezas(db: Session, skip: int = 0, limit: int = 100, activos_only: bool = True) -> List[Naturaleza]:
    query = db.query(Naturaleza)
    if activos_only:
        query = query.filter(Naturaleza.estado == 1)
    return query.offset(skip).limit(limit).all()

def create_naturaleza(db: Session, naturaleza_in: NaturalezaCreate) -> Naturaleza:
    db_nat = Naturaleza(
        nombre=naturaleza_in.nombre,
        descripcion=naturaleza_in.descripcion,
        estado=1
    )
    db.add(db_nat)
    db.commit()
    db.refresh(db_nat)
    return db_nat

def update_naturaleza(db: Session, naturaleza_id: int, naturaleza_in: NaturalezaUpdate) -> Optional[Naturaleza]:
    db_nat = db.query(Naturaleza).filter(Naturaleza.id == naturaleza_id).first()
    if not db_nat:
        return None
    update_data = naturaleza_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_nat, field, value)
    db.commit()
    db.refresh(db_nat)
    return db_nat

def delete_naturaleza(db: Session, naturaleza_id: int) -> Optional[Naturaleza]:
    db_nat = db.query(Naturaleza).filter(Naturaleza.id == naturaleza_id).first()
    if not db_nat:
        return None
    db_nat.estado = 0
    db.commit()
    db.refresh(db_nat)
    return db_nat