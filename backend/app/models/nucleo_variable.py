from sqlalchemy import Column, Integer, String, DateTime, Float, Enum
from sqlalchemy.sql import func
from app.core.database import Base
import enum

class TipoVariableEnum(str, enum.Enum):
    CUALITATIVA = "cualitativa"
    CUANTITATIVA = "cuantitativa"

class NucleoVariable(Base):

    __tablename__ = "nucleo_variables"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(Enum(TipoVariableEnum), unique=True, nullable=False)
    carga = Column(Float, nullable=False)  # peso (ej: 0.3)
    descripcion = Column(String(255), nullable=True)
    estado = Column(Integer, default=1)  # 1 activo, 0 inactivo
    creado = Column(DateTime, server_default=func.now())
    modificado = Column(DateTime, server_default=func.now(), onupdate=func.now())