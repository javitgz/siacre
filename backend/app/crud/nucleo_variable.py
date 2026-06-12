from sqlalchemy.orm import Session
from app.models.nucleo_variable import NucleoVariable
from app.schemas.nucleo_variable import NucleoVariableUpdate
from typing import List, Optional

def get_nucleo_variables(db: Session) -> List[NucleoVariable]:
    return db.query(NucleoVariable).filter(NucleoVariable.estado == 1).all()

def update_nucleo_variable(db: Session, nombre: str, var_in: NucleoVariableUpdate) -> Optional[NucleoVariable]:
    db_var = db.query(NucleoVariable).filter(NucleoVariable.nombre == nombre).first()
    if not db_var:
        return None
    update_data = var_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_var, field, value)
    db.commit()
    db.refresh(db_var)
    return db_var

def validar_suma_cargas(db: Session) -> bool:
    total = sum(v.carga for v in get_nucleo_variables(db))
    return total <= 1