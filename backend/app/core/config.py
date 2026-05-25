import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import computed_field

# Obtiene la ruta absoluta de la carpeta 'backend' basándose en la posición de este archivo
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ENV_PATH = os.path.join(BASE_DIR, ".env")

class Settings(BaseSettings):
    # Variables individuales obligatorias del .env
    DB_USER: str
    DB_PASSWORD: str
    DB_HOST: str
    DB_PORT: int
    DB_NAME: str

    # Construcción dinámica de la URL para SQLAlchemy usando PyMySQL
    @computed_field
    @property
    def DATABASE_URL(self) -> str:
        return f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    # Configuración dinámica de la ruta del archivo .env
    model_config = SettingsConfigDict(
        env_file=ENV_PATH,
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()