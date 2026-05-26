from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from app.core.database import get_db
from app.crud import user as crud_user
from app.schemas.auth import LoginRequest
from app.schemas.user import UserResponse
from app.core.auth import authenticate_user, create_access_token, get_password_hash
from app.core.config import settings

router = APIRouter(prefix="/api/auth", tags=["Autenticación"])

@router.post("/login")
def login(credentials: LoginRequest, db: Session = Depends(get_db)):
    # Autenticar usuario
    user = authenticate_user(db, credentials.email, credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos",
        )
    if user.estado == 0:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuario inactivo"
        )
    # Crear token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )
    # Devolver token y datos del usuario
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse(
            id=user.id,
            nombre=user.nombre,
            apellidos=user.apellidos,
            email=user.email,
            estado=user.estado,
            rol_id=user.rol_id,
            creado=user.creado,
            rol_nombre=user.rol.nombre if user.rol else None
        ).model_dump()
    }