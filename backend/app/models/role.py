from sqlalchemy import Column, Integer, String, DateTime, JSON
from sqlalchemy.sql import func
from app.core.database import Base

class Role(Base):
    __tablename__ = 'roles'

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(50), unique=True, index=True, nullable=False)
    descripcion = Column(String(255), nullable=True)
    estado = Column(Integer, default=1) # 1=activo, 0=inactivo
    permisos = Column(JSON, default={
        'dashboard': True,
        'clientes': False,
        'parametros': False,
        'reportes': False,
        'configuracion': False,
        'usuarios': False,
        'roles': False,
        'auditoria': False
    })
    creado = Column(DateTime, server_default=func.now())