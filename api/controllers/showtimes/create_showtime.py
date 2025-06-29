from fastapi import HTTPException
from database.crud_tables.showtimes import create_showtime, MySQLConnection
import traceback

def create_showtime_controller(data: dict):
    db = MySQLConnection()
    try:
        required_fields = ["movie_id", "theater_id", "datetime", "base_price", "available_seats"]
        missing_fields = [
            field for field in required_fields
            if field not in data or data.get(field) is None or data.get(field) == ""
        ]
        if missing_fields:
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "Error de validación",
                    "missing_fields": missing_fields
                }
            )
        
        # Campos válidos para crear showtime según la BD
        valid_fields = ["movie_id", "theater_id", "datetime", "base_price", "available_seats", "is_3d", "is_imax", "created_by_user_id"]
        showtime_data = {k: v for k, v in data.items() if k in valid_fields}
        
        create_showtime(db, **showtime_data)
        return {"message": "Horario creado exitosamente."}
    except HTTPException:
        raise
    except ValueError as ve:
        print(f"ValueError in create_showtime_controller: {ve}")
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        print(f"Error in create_showtime_controller: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Internal Server Error")
