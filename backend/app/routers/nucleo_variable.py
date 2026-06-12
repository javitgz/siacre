from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.crud import nucleo_variable as crud
from app.schemas.nucleo_variable import NucleoVariableResponse, NucleoVariableUpdate

router = APIRouter(prefix="/api/nucleo-variables", tags=["Núcleo de Variables"])

def verificar_admin(current_user: User):
    if current_user.rol.nombre.lower() != "administrador":
        raise HTTPException(status_code=403, detail="Solo administrador puede gestionar el núcleo")

@router.get("/", response_model=List[NucleoVariableResponse])
def listar_variables(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    verificar_admin(current_user)
    return crud.get_nucleo_variables(db)

@router.put("/{nombre}", response_model=NucleoVariableResponse)
def actualizar_variable(
    nombre: str,
    var_in: NucleoVariableUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    verificar_admin(current_user)
    # Validar que la suma de cargas no supere 1 después del cambio
    variable_actual = crud.get_nucleo_variables(db)
    # Calcular suma actual sin la que se va a modificar
    suma_actual = sum(v.carga for v in variable_actual if v.nombre != nombre)
    nueva_carga = var_in.carga if var_in.carga is not None else next(v.carga for v in variable_actual if v.nombre == nombre)
    if suma_actual + nueva_carga > 1:
        raise HTTPException(status_code=400, detail="La suma de cargas del núcleo no puede superar 1")
    variable = crud.update_nucleo_variable(db, nombre, var_in)
    if not variable:
        raise HTTPException(status_code=404, detail="Variable no encontrada")
    return variable