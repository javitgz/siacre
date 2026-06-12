from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.crud import score as crud_score
from app.crud import nucleo_variable as crud_nucleo
from app.schemas.score import ScoreResponse, ScoreUpdate

router = APIRouter(prefix="/api/score", tags=["Score"])


def verificar_admin(current_user: User):
    if current_user.rol.nombre.lower() != "administrador":
        raise HTTPException(status_code=403, detail="Solo administrador puede gestionar el score")

@router.get('', response_model=ScoreResponse)
@router.get('/', response_model=ScoreResponse)
def obtener_score_activo(
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    verificar_admin(current_user)
    score = crud_score.get_score_activo(db)
    if not score:
        score = crud_score.crear_score_inicial(db)
    return score


@router.put("/{score_id}", response_model=ScoreResponse)
def actualizar_score(
        score_id: int,
        score_in: ScoreUpdate,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    verificar_admin(current_user)
    score = crud_score.actualizar_score(db, score_id, score_in)
    if not score:
        raise HTTPException(status_code=404, detail="Score no encontrado")
    return score


@router.post("/recalcular-distribucion", response_model=ScoreResponse)
def recalcular_distribucion(
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    verificar_admin(current_user)
    score = crud_score.get_score_activo(db)
    if not score:
        score = crud_score.crear_score_inicial(db)

    nucleos = crud_nucleo.get_nucleo_variables(db)
    distribucion = {}
    total_cargas = sum(v.carga for v in nucleos)
    if total_cargas > 0:
        for v in nucleos:
            distribucion[v.nombre] = round(score.puntaje_maximo * v.carga, 2)
    else:
        distribucion = {"cualitativa": 0, "cuantitativa": 0}

    score.distribucion = distribucion
    db.commit()
    db.refresh(score)
    return score