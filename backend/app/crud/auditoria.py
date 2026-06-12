from sqlalchemy.orm import Session
from app.models.auditoria import Auditoria
from app.models.user import User

def registrar_auditoria(
    db: Session,
    usuario: User,
    accion: str,
    entidad: str,
    detalle: str = None
):
    """
    Registra una acción en la tabla de auditoría.
    """
    log = Auditoria(
        usuario_id=usuario.id,
        empresa_id=usuario.empresa_id,
        accion=accion,
        entidad=entidad,
        detalle=detalle
    )
    db.add(log)
    db.commit()