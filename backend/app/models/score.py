from sqlalchemy import Column, Integer, DateTime, JSON, Float
from sqlalchemy.sql import func
from app.core.database import Base

class Score(Base):
    __tablename__ = "score"
    id = Column(Integer, primary_key=True, index=True)
    puntaje_maximo = Column(Integer, nullable=False, default=1000)
    distribucion = Column(JSON, nullable=True)   # {"cualitativa": 300, "cuantitativa": 700} o por variable_id
    estado = Column(Integer, default=1)          # 1 activo, 0 inactivo (solo un registro activo)
    creado = Column(DateTime, server_default=func.now())
    modificado = Column(DateTime, server_default=func.now(), onupdate=func.now())