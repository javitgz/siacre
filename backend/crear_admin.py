# crear_admin.py
from app.core.database import SessionLocal
from app.models.user import User
from app.models.role import Role
from app.core.auth import get_password_hash

db = SessionLocal()

# 1. Crear rol "Administrador" si no existe
rol_admin = db.query(Role).filter(Role.nombre == "Administrador").first()
if not rol_admin:
    rol_admin = Role(
        nombre="Administrador",
        descripcion="Rol con todos los permisos",
        estado=1,
        permisos={
            "dashboard": True,
            "clientes": True,
            "parametros": True,
            "reportes": True,
            "configuracion": True,
            "usuarios": True,
            "roles": True,
            "auditoria": True
        }
    )
    db.add(rol_admin)
    db.commit()
    print("✅ Rol 'Administrador' creado (ID: {})".format(rol_admin.id))
else:
    print("ℹ️ Rol 'Administrador' ya existe (ID: {})".format(rol_admin.id))

# 2. Verificar si ya existe un usuario con email admin@siacre.com
usuario_admin = db.query(User).filter(User.email == "admin@siacre.com").first()
if usuario_admin:
    print("⚠️ El usuario admin@siacre.com ya existe. No se creará duplicado.")
else:
    # Crear usuario administrador
    hashed_pw = get_password_hash("admin123")
    nuevo_admin = User(
        nombre="Admin",
        apellidos="Sistema",
        email="admin@siacre.com",
        password=hashed_pw,
        estado=1,
        rol_id=rol_admin.id
    )
    db.add(nuevo_admin)
    db.commit()
    print("✅ Usuario administrador creado con éxito:")
    print("   Email: admin@siacre.com")
    print("   Contraseña: admin123")

db.close()