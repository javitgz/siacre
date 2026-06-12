from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from app.core.database import Base

class Auditoria(Base):
    """
    TABLA: auditorias (HU07)
    Entidad de seguimiento de las acciones realizadas por sistema
    """
    __tablename__ = "auditorias"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False)
    empresa_id = Column(Integer, ForeignKey("empresas.id", ondelete="CASCADE"), nullable=False)
    accion = Column(String(50), nullable=False)
    entidad = Column(String(100), nullable=False)
    detalle = Column(Text, nullable=True)
    creado = Column(DateTime, server_default=func.now())