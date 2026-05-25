from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.crud import user as crud_user
from app.schemas.auth import LoginRequest
from app.schemas.user import UserResponse

router = APIRouter(prefix="/api/auth", tags=["Autenticación"])


@router.post("/login", response_model=UserResponse)
def login(credentials: LoginRequest, db: Session = Depends(get_db)):
    # 1. Buscar al usuario por su email
    user = crud_user.get_user_by_email(db, email=credentials.email)

    # 2. Si no existe, lanzamos un 401 (No autorizado)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="El correo electrónico o la contraseña son incorrectos"
        )

    # 3. Verificar si el usuario fue desactivado (Soft delete)
    if user.estado == 0:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Este usuario se encuentra inactivo en el sistema"
        )

    # 4. Validar contraseña (Texto plano por ahora)
    if user.password != credentials.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="El correo electrónico o la contraseña son incorrectos"
        )

    # Si todo coincide, devolvemos el objeto usuario (FastAPI lo filtrará con UserResponse)
    return user