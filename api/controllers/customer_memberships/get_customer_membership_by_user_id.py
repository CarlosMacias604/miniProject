from fastapi import HTTPException
from database.crud_tables.customer_memberships import get_customer_membership_by_user_id, MySQLConnection
from database.crud_tables.memberships import get_membership_by_id
import traceback

def get_customer_membership_by_user_id_controller(data: dict):
    db = MySQLConnection()
    try:
        required_fields = ["user_id"]
        missing_fields = [
            field for field in required_fields
            if field not in data or data.get(field) is None
        ]
        if missing_fields:
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "Error de validación",
                    "missing_fields": missing_fields
                }
            )
        
        user_id = data.get("user_id")
        customer_membership = get_customer_membership_by_user_id(db, user_id)
        
        if customer_membership:
            # Obtener información de la membresía
            membership = get_membership_by_id(db, customer_membership['membership_id'])
            return {
                "customer_membership": customer_membership,
                "membership": membership
            }
        else:
            return {
                "customer_membership": None,
                "membership": None
            }
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in get_customer_membership_by_user_id_controller: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Internal Server Error")
