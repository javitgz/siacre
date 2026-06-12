from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.sql import func
from app.core.database import Base
import enum

class TipoEscenarioEnum(str, enum.Enum):
    SELECTOR = "selector"
    RANGO = "rango"

class Escenario(Base):
    __tablename__ = "escenarios"
    id = Column(Integer, primary_key=True, index=True)
    parametro_id = Column(Integer, ForeignKey("parametros.id", ondelete="CASCADE"), nullable=False)
    tipo = Column(SQLEnum(TipoEscenarioEnum), nullable=False)
    # Para tipo selector
    selector_valor = Column(String(100), nullable=True)
    # Para tipo rango
    rango_min = Column(Float, nullable=True)
    rango_max = Column(Float, nullable=True)
    # Común
    porcentaje = Column(Float, nullable=False)  # entre 0 y 1
    estado = Column(Integer, default=1)
    creado = Column(DateTime, server_default=func.now())
    modificado = Column(DateTime, server_default=func.now(), onupdate=func.now())