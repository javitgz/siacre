from pydantic import BaseModel, EmailStr

class LoginRequest(BaseModel):
    email: EmailStr  # Valida automáticamente que sea un formato de correo real
    password: str