from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from app.core.database import get_db
from app.core.config import settings
from app.core.auth import verify_password, create_access_token
from app.crud import user as crud_user
from app.schemas.auth import Token

router = APIRouter(prefix="/api/auth", tags=["Autenticación"])

@router.post("/login", response_model=Token)
def iniciar_sesion(
        form_data: OAuth2PasswordRequestForm = Depends(),
        db: Session = Depends(get_db)
):
    """
    Endpoint central de autenticación para el sistema SIACRE
    - Recibe las credenciales (username mapea a email)
    - Valida la existencia del usuario y la contraseña
    - Bloquea el acceso si el usuario se encuentra INACTIVO (estado = 0)
    - Retorna un Bearer JWT con los claims del perfil y contexto multi-tenant
    """
    # 1. Recuperar el usuario por su correo electronico a nivel global
    usuario = crud_user.get_user_by_email(db, email=form_data.username)
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales de acceso incorrectas",
            headers={'WWW-Authenticate': 'Bearer'}
        )
    # Verificar la validez de la contraseña provista contra el hash Bcrypt
    if not verify_password(form_data.password, usuario.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Credenciales de acceso incorrectas',
            headers={'WWW-Authenticate': 'Bearer'}
        )
    # REGLA DE NEGOCIO: Impedir el ingreso de usuarios inactivos
    # Resuelve la HU de registro con aprobación pendiente (estado inicial = 0)
    if usuario.estado == 0:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail='Su cuenta de usuario se encuentra inactiva. Solicite la activación a su administrador corporativo'
        )
    # 4. Definir el tiempo de expiración del token desde la configuración
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    # 5. Inyectar claims informativos esenciales dentro del JWT para evitar consultas repetitivas a la BD
    token_data = {
        'sub': str(usuario.id),
        'empresa_id': usuario.empresa_id,
        'user_id': usuario.id,
        'nombres': usuario.nombres,
        'apellidos': usuario.apellidos,
        'rol_id': usuario.rol_id,
        'rol': usuario.rol.nombre.lower() if usuario.rol else 'sin rol'
    }

    # 6. Generar el token firmado criptográficamente
    access_token = create_access_token(
        data = token_data, expires_delta=access_token_expires
    )

    return {
        'access_token': access_token,
        'token_type': 'bearer'
    }