from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

# pool_pre_ping=True evita el error común de "MySQL server has gone away"
# verificando la salud de la conexión antes de usarla.
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True
)

# Sesión local para interactuar con la DB
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Clase base de la cual heredarán todos nuestros modelos ORM
Base = declarative_base()

# Dependencia (Yield) para el manejo de sesiones en los endpoints de FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()