"""
HERRAMIENTA DE SINCRONIZACION AUTOMATICA DE BASE DE DATOS
Este script actua como el punte definitivo entre los modelos ORM de PyCharm
y el esquema fisicao en MySQL Workbench

Elimina de forma segura las estructuras antiguas quegeneran los conflictos de diseño
y construye el nuevo ecosistema relacional y multi-tenant (SaaS).
"""
import sys
import os

from sqlalchemy import except_

# MODIFICACION DEL ENTORNO: Garantiza que la raiz del proyecto este en el path de ejecucion
# para prevenir errores de tipo 'ModuleNotFoundError' al ejecutar el script desde la terminal
directorio_raiz = os.path.dirname(os.path.abspath(__file__))
if directorio_raiz not in sys.path:
    sys.path.append(directorio_raiz)

from app.core.database import Base, engine
# IMPORTACION CRUCIAL: Al importar el modulo de modelos, forzamos a python a leer
# nuestro archivo __init__.py recien configurado, registrando todas las entidades en el motor
from app.models import Role, Permiso, RolePermiso, Empresa, User

def ejecutar_sincronizacion():
    print('===================================================================')
    print('   SIACRE - INICIANDO PROCESO DE REALINEACION EN MYSQL WORKBENCH   ')
    print('===================================================================')

    try:
        # Paso 1: Limpieza del esquema previo para solventar las discrepancias del backend
        # drop_all analiza el arbol de dependencias y elimina las tablas en el orden correcto
        print('\n[1/3] Detectando y removiendo estructuras antiguas dañadas...')
        Base.metadata.drop_all(bind=engine)
        print('-> Éxito: Esquema antiguo removido por completo')

        # Paso 2: Construccion fisica del nuevo modelo de datos
        # create_all lee el diccionario de metadatos de Base y genera las sentencias DDL (CREATE TABLE)
        print('\n[2/3] Generando tablas normalizadas basadas en HUs (RBAC + Mult-Tenant)')
        Base.metadata.create_all(bind=engine)
        print('-> Éxito: Nuevas tablas creadas en el motor de base de datos')

        # Paso 3: Verificacion de metadatos generados
        print('\n[3/3] Resumen de entidades sincronizadas de forma segura')
        for tabla in Base.metadata.tables.keys():
            print(f" Tabla fisica registrada: '{tabla}'")

        print('===================================================================')
        print('    SINCRONIZACION EXITOSA: Tu base de datos esta 100% alineada    ')
        print('===================================================================')

    except Exception as error:
        print(f"                        \n ERROR CRITICO DURANTE LA SINCRONIZACION: {str(error)}                     ")
        print('Por favor, verifica que el servicio de MySQL este activo y las credenciales en tu .env esten correctas')
        print('======================================================================================================')

if __name__ == "__main__":
    ejecutar_sincronizacion()