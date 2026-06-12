from sqlalchemy.orm import Session
from app.models.escenario import Escenario
from app.schemas.escenario import EscenarioCreate, EscenarioUpdate
from typing import List, Optional

def get_escenario(db: Session, id: int) -> Optional[Escenario]:
    return db.query(Escenario).filter(Escenario.id == id).first()

def get_escenarios_by_parametro(db: Session, parametro_id: int, activos_only: bool = True) -> List[Escenario]:
    query = db.query(Escenario).filter(Escenario.parametro_id == parametro_id)
    if activos_only:
        query = query.filter(Escenario.estado == 1)
    return query.all()

def create_escenario(db: Session, esc_in: EscenarioCreate) -> Escenario:
    db_esc = Escenario(**esc_in.model_dump())
    db.add(db_esc)
    db.commit()
    db.refresh(db_esc)
    return db_esc

def update_escenario(db: Session, id: int, esc_in: EscenarioUpdate) -> Optional[Escenario]:
    db_esc = db.query(Escenario).filter(Escenario.id == id).first()
    if not db_esc:
        return None
    update_data = esc_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_esc, field, value)
    db.commit()
    db.refresh(db_esc)
    return db_esc

def delete_escenario(db: Session, id: int) -> Optional[Escenario]:
    db_esc = db.query(Escenario).filter(Escenario.id == id).first()
    if not db_esc:
        return None
    db_esc.estado = 0
    db.commit()
    db.refresh(db_esc)
    return db_esc