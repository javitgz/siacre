from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

from app.core.config import settings
from app.routers.auth import router as auth_router
from app.routers.users import router as users_router
from app.routers.roles import router as roles_router
from app.routers.empresas import router as empresas_router

# Inicialización de la aplicación FastAPI con metadatos del sistema
app = FastAPI(
    title='SIACRE API',
    description='Sistema SaaS Multi-Tenant para la automatización dela evaluación de crediticia en PYMES',
    version='1.0.0',
    docs_url='/docs',
    redoc_url='/redoc',
    redirect_slashes=False # Evita redirecciones 307
)

# ==========================================================================================================
# CONFIGURACIÓN DE MIDDLEWARE (CORS)
# ==========================================================================================================
# Indispensable para permitir que las peticiones del frontend se comuniquen sin
# bloqueos de seguridad con el backend en entornos de desarrollo y producción
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'], # En entornos de producción se restringirá a los dominios autorizados
    allow_credentials=True,
    allow_methods=['*'], # Permite de forma segura GET, POST, PATCH, DELETE, ETC.
    allow_headers=['*'],
)

# ==========================================================================================================
# INCLUSIÓN DE ENRUTADORES (ROUTERS)
# ==========================================================================================================
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(roles_router)
app.include_router(empresas_router)

# ==========================================================================================================
# ENDPOINT DE CONTROL DE SALUD (Health Check)
# ==========================================================================================================
@app.get('/', tags=['Health Check'])
def verificar_estado_sistema():
    """
    Endpoint raíz para comprobar la disponibilidad operativa del backend de SIACRE
    """
    return {
        'status': 'En linea',
        'sistema': 'SIACRE Core API',
        'versión': '1.0.0',
        'documentación': '/docs',
        'hora_servidor': datetime.now().isoformat()
    }