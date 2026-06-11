from sqlalchemy import Column, Integer, String, DateTime, Enum
from sqlalchemy.sql import func
from app.core.database import Base
import enum

class NaturalezaEnum(str, enum.Enum):
    natural = "natural"
    juridica = "juridica"

class Naturaleza(Base):
    __tablename__ = "naturalezas"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(Enum(NaturalezaEnum), unique=True, nullable=False)
    descripcion = Column(String(255), nullable=True)
    estado = Column(Integer, default=1)  # 1 activo, 0 inactivo
    creado = Column(DateTime, server_default=func.now())
    modificado = Column(DateTime, server_default=func.now(), onupdate=func.now())