from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.crud import empresa as crud_empresa
from app.schemas.empresa import EmpresaCreate, EmpresaUpdate, EmpresaResponse

router = APIRouter(prefix="/api/empresas", tags=["Gestión de Empresas"])

# ===================================================================================
# 1. PERFIL CORPORATIVO: OBTENER DATOS DE LA PROPIA EMPRESA (Aislamiento Tenant)
# ===================================================================================
@router.get("/me", response_model=EmpresaResponse)
def obtener_perfil_empresa_propia(
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """
    Retorna la información legal, fiscal y de localización de la empresa
    asociada al usuario autenticado extraído del JWT.
    Garantiza el aislamiento estricto multi-tenant de SIACRE.
    """
    if not current_user.empresa_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El usuario actual no tiene asignado un identificador de empresa corporativa."
        )

    empresa = crud_empresa.get_empresa(db=db, empresa_id=current_user.empresa_id)
    if not empresa or empresa.estado == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="La empresa solicitada no existe o se encuentra inactiva en el sistema."
        )
    return empresa


# ===================================================================================
# 2. GOBERNANZA CORPORATIVA: ACTUALIZAR DATOS DE LA EMPRESA (Restringido a Administrador)
# ===================================================================================
@router.patch("/me", response_model=EmpresaResponse)
def actualizar_perfil_empresa_propia(
        empresa_in: EmpresaUpdate,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """
    Permite modificar de forma parcial (PATCH) los atributos de la empresa del usuario.
    Regla jerárquica estricta: Solo el rol 'administrador' de la empresa puede realizar cambios.
    """
    if current_user.rol.nombre.lower() != "administrador":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permiso denegado. Solo el perfil Administrador de la empresa puede actualizar los datos corporativos."
        )

    empresa_actualizada = crud_empresa.update_empresa(
        db=db, empresa_id=current_user.empresa_id, empresa_in=empresa_in
    )
    if not empresa_actualizada:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No se pudo procesar la actualización. Empresa no encontrada."
        )
    return empresa_actualizada


# ===================================================================================
# 3. APROVISIONAMIENTO GLOBAL: REGISTRO INICIAL DE UNA NUEVA EMPRESA
# ===================================================================================
@router.post("/", response_model=EmpresaResponse, status_code=status.HTTP_201_CREATED)
def registrar_nueva_empresa(
        empresa_in: EmpresaCreate,
        db: Session = Depends(get_db)
):
    """
    Endpoint público orientado al aprovisionamiento automático (Onboarding/Sign-up)
    de nuevos inquilinos en el ecosistema SaaS.
    Valida la unicidad del documento (NIT o CC) a nivel global de la plataforma.
    """
    empresa_existente = crud_empresa.get_empresa_by_documento(db=db, documento=empresa_in.documento)
    if empresa_existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Operación inválida. Ya existe un registro activo con el documento de identificación '{empresa_in.documento}'."
        )
    return crud_empresa.create_empresa(db=db, empresa_in=empresa_in)