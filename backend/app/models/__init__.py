"""
Archivo de iniciacion del modulo de modelos
Importa de manera centralizada todas las entidades ORM para que SQLAlchemy
pueda registrar correctamente las relaciones bidireccionales y construir
las tablas en el orden jerarquico adecuado dentro de MySQL
"""
from app.core.database import Base
from app.models.role import Role, Permiso, RolePermiso
from app.models.empresa import Empresa, NaturalezaEnum, TipoDocumentoEnum
from app.models.user import User
from app.models.naturaleza import Naturaleza
from app.models.auditoria import Auditoria

# al declarar __all__, deifinimos con precision que clases se exportarán
# cuando se ejecute un "from app.models import *"

__all__ = [
    'Base',
    'Role',
    'Permiso',
    'RolePermiso',
    'Empresa',
    'NaturalezaEnum',
    'TipoDocumentoEnum',
    'User',
    'Naturaleza',
    'Auditoria'
]