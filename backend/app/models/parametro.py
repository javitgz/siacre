from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, Text, Enum
from sqlalchemy.sql import func
from app.core.database import Base
import enum

class TipoMedicionEnum(str, enum.Enum):
    SELECTOR = "selector"
    RANGO = "rango"

class Parametro(Base):
    __tablename__ = "parametros"
    id = Column(Integer, primary_key=True, index=True)
    codigo = Column(String(50), unique=True, index=True, nullable=False)
    nombre = Column(String(100), nullable=False)
    caracteristica_medida = Column(String(255), nullable=True)
    tipo = Column(Enum(TipoMedicionEnum), nullable=False)
    puntos_maximos = Column(Float, nullable=False)  # puntos máximos que aporta este parámetro
    interpretacion = Column(Text, nullable=True)
    nucleo_id = Column(Integer, ForeignKey("nucleo_variables.id", ondelete="RESTRICT"), nullable=False)
    naturaleza_id = Column(Integer, ForeignKey("naturalezas.id", ondelete="RESTRICT"), nullable=False)
    estado = Column(Integer, default=1)  # 1 activo, 0 inactivo
    creado = Column(DateTime, server_default=func.now())
    modificado = Column(DateTime, server_default=func.now(), onupdate=func.now())