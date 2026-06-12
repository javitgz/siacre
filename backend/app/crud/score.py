from sqlalchemy.orm import Session
from app.models.score import Score
from app.schemas.score import ScoreUpdate
from typing import Optional

def get_score_activo(db: Session) -> Optional[Score]:
    return db.query(Score).filter(Score.estado == 1).first()

def crear_score_inicial(db: Session, puntaje_maximo: int = 1000) -> Score:
    activo = get_score_activo(db)
    if activo:
        activo.estado = 0
        db.commit()
    nuevo = Score(puntaje_maximo=puntaje_maximo, estado=1)
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo

def actualizar_score(db: Session, score_id: int, score_in: ScoreUpdate) -> Optional[Score]:
    score = db.query(Score).filter(Score.id == score_id).first()
    if not score:
        return None
    update_data = score_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(score, field, value)
    db.commit()
    db.refresh(score)
    return score