from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.nucleo_variable import NucleoVariable, TipoVariableEnum

def init_nucleo():
    db = SessionLocal()
    try:
        # Datos iniciales según HU08: cualitativa 0.3, cuantitativa 0.7
        datos = [
            {
                "nombre": TipoVariableEnum.CUALITATIVA,
                "carga": 0.3,
                "descripcion": "Variable cualitativa para el scoring (ej: comportamiento, historial crediticio)"
            },
            {
                "nombre": TipoVariableEnum.CUANTITATIVA,
                "carga": 0.7,
                "descripcion": "Variable cuantitativa para el scoring (ej: ingresos, deuda, capacidad de pago)"
            }
        ]
        for item in datos:
            exists = db.query(NucleoVariable).filter(NucleoVariable.nombre == item["nombre"]).first()
            if not exists:
                var = NucleoVariable(
                    nombre=item["nombre"],
                    carga=item["carga"],
                    descripcion=item["descripcion"],
                    estado=1
                )
                db.add(var)
                print(f"✅ Insertada variable {item['nombre'].value} con carga {item['carga']}")
            else:
                print(f"ℹ️ Variable {item['nombre'].value} ya existe (carga actual: {exists.carga})")
        db.commit()
        print("🎉 Núcleo de variables inicializado correctamente")
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_nucleo()