from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.crud import escenario as crud_escenario
from app.crud import parametro as crud_parametro
from app.schemas.escenario import EscenarioCreate, EscenarioUpdate, EscenarioResponse

router = APIRouter(prefix="/api/escenarios", tags=["Escenarios"])

def verificar_admin(current_user: User):
    if current_user.rol.nombre.lower() != "administrador":
        raise HTTPException(status_code=403, detail="Solo administrador puede gestionar escenarios")

@router.get("/parametro/{parametro_id}", response_model=List[EscenarioResponse])
def listar_escenarios_por_parametro(
    parametro_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    verificar_admin(current_user)
    parametro = crud_parametro.get_parametro(db, parametro_id)
    if not parametro:
        raise HTTPException(status_code=404, detail="Parámetro no encontrado")
    return crud_escenario.get_escenarios_by_parametro(db, parametro_id)

@router.post("/", response_model=EscenarioResponse, status_code=status.HTTP_201_CREATED)
def crear_escenario(
    esc_in: EscenarioCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    verificar_admin(current_user)
    # Validar que el parámetro existe
    parametro = crud_parametro.get_parametro(db, esc_in.parametro_id)
    if not parametro:
        raise HTTPException(status_code=404, detail="Parámetro no encontrado")
    # Validar coherencia tipo/valores
    if esc_in.tipo.value == "selector":
        if not esc_in.selector_valor:
            raise HTTPException(status_code=400, detail="Para tipo selector se requiere selector_valor")
        if esc_in.rango_min is not None or esc_in.rango_max is not None:
            raise HTTPException(status_code=400, detail="Para tipo selector no se permiten rangos")
    else:  # rango
        if esc_in.rango_min is None or esc_in.rango_max is None:
            raise HTTPException(status_code=400, detail="Para tipo rango se requieren rango_min y rango_max")
        if esc_in.rango_min > esc_in.rango_max:
            raise HTTPException(status_code=400, detail="rango_min debe ser menor o igual a rango_max")
        if esc_in.selector_valor:
            raise HTTPException(status_code=400, detail="Para tipo rango no se permite selector_valor")
    return crud_escenario.create_escenario(db, esc_in)

@router.put("/{escenario_id}", response_model=EscenarioResponse)
def actualizar_escenario(
    escenario_id: int,
    esc_in: EscenarioUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    verificar_admin(current_user)
    escenario = crud_escenario.update_escenario(db, escenario_id, esc_in)
    if not escenario:
        raise HTTPException(status_code=404, detail="Escenario no encontrado")
    return escenario

@router.delete("/{escenario_id}", response_model=EscenarioResponse)
def eliminar_escenario(
    escenario_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    verificar_admin(current_user)
    escenario = crud_escenario.delete_escenario(db, escenario_id)
    if not escenario:
        raise HTTPException(status_code=404, detail="Escenario no encontrado")
    return escenario