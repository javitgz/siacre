from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class RolePermiso(Base):
    """
    TABLA INTERMEDIA: roles_permisos (HU02 / HU03)
    permite la relacion de muchos a muchos entre Roles y Permisos.
    Incluye campos de auditoria requeridos
    """
    __tablename__ = 'roles_permisos'

    id = Column(Integer, primary_key=True, index=True)
    rol_id = Column(Integer, ForeignKey("roles.id", ondelete="CASCADE"), nullable=False)
    permiso_id = Column(Integer, ForeignKey("permisos.id", ondelete="CASCADE"), nullable=False)
    estado = Column(Integer, default=1) # inactivo = 0, activo = 1
    creado = Column(DateTime, server_default=func.now())
    modificado = Column(DateTime, server_default=func.now(), onupdate=func.now())

class Permiso(Base):
    """
    TABLA: permisos (HU02 / HU03)
    Almacena los accesos granulares del sistema de forma independiente
    """
    __tablename__= 'permisos'

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), unique=True, index=True, nullable=False)
    descripcion = Column(String(255), nullable=True)
    estado = Column(Integer, default=1)
    creado = Column(DateTime, server_default=func.now())
    modificado = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relación con roles (muchos a muchos)
    roles = relationship("Role", secondary="roles_permisos", back_populates="permisos")

class Role(Base):
    """
    TABLA: roles (HU01)
    Define los perfiles de usuarios del sistema (administrador, coordinador, analista)
    """
    __tablename__ = 'roles'

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(50), unique=True, index=True, nullable=False)
    descripcion = Column(String(255), nullable=True)
    estado = Column(Integer, default=1)
    creado = Column(DateTime, server_default=func.now())
    modificado = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relación con permisos
    permisos = relationship("Permiso", secondary="roles_permisos", back_populates="roles")