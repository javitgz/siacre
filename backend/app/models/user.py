from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class User(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)  # En producción aplicar hash (bcrypt)
    estado = Column(Integer, default=1)
    rol_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    creado = Column(DateTime, server_default=func.now())

    # Relación para cargar datos del Rol si fuese necesario
    rol = relationship("Role")