from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class User(Base):
    """
    TABLA: usuarios (HU04)
    Entidad que reperesenta a los colaboradores del sistema, restringidos por empresa, rol y permisos
    """
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nombres = Column(String(100), nullable=False)
    apellidos = Column(String(100), nullable=False)
    tipo_documento = Column(String(20), nullable=False)
    documento = Column(String(20), unique=True, nullable=False)
    telefono = Column(String(20), nullable=False)
    direccion = Column(String(255), nullable=False)
    municipio = Column(String(100), nullable=False)
    departamento = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)  # ← cambiar de 'password' a 'hashed_password'
    estado = Column(Integer, default=1)
    rol_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    empresa_id = Column(Integer, ForeignKey("empresas.id", ondelete="RESTRICT"), nullable=False)
    creado = Column(DateTime, server_default=func.now())
    modificado = Column(DateTime, server_default=func.now(), onupdate=func.now())

    rol = relationship("Role")
    empresa = relationship("Empresa", back_populates="usuarios")