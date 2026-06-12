from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.crud import parametro as crud
from app.crud import nucleo_variable as crud_nucleo
from app.crud import naturaleza as crud_naturaleza
from app.schemas.parametro import ParametroCreate, ParametroUpdate, ParametroResponse

router = APIRouter(prefix="/api/parametros", tags=["Parámetros"])

def verificar_admin(current_user: User):
    if current_user.rol.nombre.lower() != "administrador":
        raise HTTPException(status_code=403, detail="Solo administrador puede gestionar parámetros")

@router.get('', response_model=List[ParametroResponse])
@router.get('/', response_model=List[ParametroResponse])
def listar_parametros(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    verificar_admin(current_user)
    return crud.get_parametros(db, skip, limit)

@router.post("/", response_model=ParametroResponse, status_code=status.HTTP_201_CREATED)
def crear_parametro(
    param_in: ParametroCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    verificar_admin(current_user)
    # Verificar que núcleo existe
    nucleo = crud_nucleo.get_nucleo_variable(db, param_in.nucleo_id)
    if not nucleo:
        raise HTTPException(status_code=404, detail="Núcleo de variable no encontrado")
    # Verificar que naturaleza existe
    naturaleza = crud_naturaleza.get_naturaleza(db, param_in.naturaleza_id)
    if not naturaleza:
        raise HTTPException(status_code=404, detail="Naturaleza no encontrada")
    # Verificar código único
    existente = crud.get_parametro_by_codigo(db, param_in.codigo)
    if existente:
        raise HTTPException(status_code=400, detail="Ya existe un parámetro con ese código")
    return crud.create_parametro(db, param_in)

@router.put("/{param_id}", response_model=ParametroResponse)
def actualizar_parametro(
    param_id: int,
    param_in: ParametroUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    verificar_admin(current_user)
    parametro = crud.update_parametro(db, param_id, param_in)
    if not parametro:
        raise HTTPException(status_code=404, detail="Parámetro no encontrado")
    return parametro

@router.delete("/{param_id}", response_model=ParametroResponse)
def eliminar_parametro(
    param_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    verificar_admin(current_user)
    parametro = crud.delete_parametro(db, param_id)
    if not parametro:
        raise HTTPException(status_code=404, detail="Parámetro no encontrado")
    return parametro