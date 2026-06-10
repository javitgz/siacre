# backend/crear_admin.py (versión robusta)
import sys, os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.core.auth import get_password_hash

def init_db():
    engine = create_engine(settings.DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    try:
        # Empresa
        empresa_id = None
        result = db.execute(text("SELECT id FROM empresas WHERE documento = '900000001'")).first()
        if not result:
            db.execute(text("""
                INSERT INTO empresas (naturaleza, razon_social, tipo_documento, documento, dv, direccion, municipio, departamento, email, telefono, estado)
                VALUES ('juridica', 'Empresa Demo SIACRE', 'NIT', '900000001', 1, 'Calle 123', 'Bogotá', 'Cundinamarca', 'admin@siacre.com', '1234567', 1)
            """))
            db.commit()
            empresa_id = db.execute(text("SELECT LAST_INSERT_ID()")).scalar()
            print("✅ Empresa creada")
        else:
            empresa_id = result[0]
            print("ℹ️ Empresa ya existe")

        # Permisos
        permisos = ["dashboard", "clientes", "parametros", "reportes", "configuracion", "usuarios", "roles", "auditoria"]
        permisos_ids = {}
        for p in permisos:
            result = db.execute(text("SELECT id FROM permisos WHERE nombre = :nombre"), {"nombre": p}).first()
            if not result:
                db.execute(text("INSERT INTO permisos (nombre, descripcion, estado) VALUES (:nombre, :desc, 1)"),
                           {"nombre": p, "desc": f"Acceso a {p}"})
                db.commit()
                perm_id = db.execute(text("SELECT LAST_INSERT_ID()")).scalar()
                permisos_ids[p] = perm_id
                print(f"✅ Permiso {p} creado")
            else:
                permisos_ids[p] = result[0]

        # Roles
        roles_data = {
            "administrador": permisos,
            "coordinador": ["dashboard", "clientes", "reportes", "usuarios", "auditoria"],
            "analista": ["dashboard", "clientes", "parametros", "reportes"]
        }
        roles_ids = {}
        for rol_nombre, perms in roles_data.items():
            result = db.execute(text("SELECT id FROM roles WHERE nombre = :nombre"), {"nombre": rol_nombre}).first()
            if not result:
                db.execute(text("INSERT INTO roles (nombre, descripcion, estado) VALUES (:nombre, :desc, 1)"),
                           {"nombre": rol_nombre, "desc": f"Rol {rol_nombre}"})
                db.commit()
                rol_id = db.execute(text("SELECT LAST_INSERT_ID()")).scalar()
                roles_ids[rol_nombre] = rol_id
                print(f"✅ Rol {rol_nombre} creado")
                for perm in perms:
                    db.execute(text("INSERT INTO roles_permisos (rol_id, permiso_id, estado) VALUES (:rol, :perm, 1)"),
                               {"rol": rol_id, "perm": permisos_ids[perm]})
                db.commit()
            else:
                roles_ids[rol_nombre] = result[0]
                print(f"ℹ️ Rol {rol_nombre} ya existe")

        # Usuario admin
        result = db.execute(text("SELECT id FROM usuarios WHERE email = 'admin@siacre.com'")).first()
        if not result:
            hashed = get_password_hash("admin123")
            db.execute(text("""
                INSERT INTO usuarios (nombres, apellidos, tipo_documento, documento, telefono, direccion, municipio, departamento, email, hashed_password, estado, rol_id, empresa_id)
                VALUES ('Admin', 'Sistema', 'CC', '123456789', '3001234567', 'Oficina Central', 'Bogotá', 'Cundinamarca', 'admin@siacre.com', :pwd, 1, :rol, :emp)
            """), {"pwd": hashed, "rol": roles_ids["administrador"], "emp": empresa_id})
            db.commit()
            print("✅ Usuario administrador creado (email: admin@siacre.com / password: admin123)")
        else:
            print("ℹ️ Usuario administrador ya existe")

        print("🎉 Inicialización completada")
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_db()