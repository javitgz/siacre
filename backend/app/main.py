from app.core.database import engine, Base
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import roles, users, auth
from app.models import role, user

app = FastAPI(
    title="SIACRE API",
    description="Backend automatizado para la evaluación de créditos PYMES",
    version="1.0.0",
    redirect_slashes=False # Evita redirecciones 307
)

# Configuración de CORS para permitir conexiones desde el frontend de React Native / Expo
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # En producción se cambia por el dominio específico
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusion de routers
app.include_router(roles.router)
app.include_router(users.router)
app.include_router(auth.router)

@app.get("/")
def read_root():
    return {"status": "SIACRE API funcionando correctamente"}

# Generar tablas faltantes automaticas en MySQL
Base.metadata.create_all(bind=engine)