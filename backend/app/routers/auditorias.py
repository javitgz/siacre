from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime
from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.models.auditoria import Auditoria
from app.schemas.auditoria import AuditoriaResponse

router = APIRouter(prefix="/api/auditorias", tags=["Auditorías"])

def verificar_admin(current_user: User):
    if current_user.rol.nombre.lower() != "administrador":
        raise HTTPException(status_code=403, detail="Solo administrador puede acceder a la auditoría")

@router.get('', response_model=List[AuditoriaResponse])
@router.get('/', response_model=List[AuditoriaResponse])
def listar_logs(
    skip: int = 0,
    limit: int = 100,
    usuario_id: Optional[int] = Query(None),
    empresa_id: Optional[int] = Query(None),
    accion: Optional[str] = Query(None),
    entidad: Optional[str] = Query(None),
    fecha_desde: Optional[datetime] = Query(None),
    fecha_hasta: Optional[datetime] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    verificar_admin(current_user)
    query = db.query(Auditoria)
    if usuario_id:
        query = query.filter(Auditoria.usuario_id == usuario_id)
    if empresa_id:
        query = query.filter(Auditoria.empresa_id == empresa_id)
    if accion:
        query = query.filter(Auditoria.accion == accion)
    if entidad:
        query = query.filter(Auditoria.entidad == entidad)
    if fecha_desde:
        query = query.filter(Auditoria.creado >= fecha_desde)
    if fecha_hasta:
        query = query.filter(Auditoria.creado <= fecha_hasta)
    logs = query.order_by(Auditoria.creado.desc()).offset(skip).limit(limit).all()
    return logs