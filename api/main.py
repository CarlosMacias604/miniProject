import os
import sys

root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.append(root_dir)

from fastapi import FastAPI
from api.database.mysql_connection import MySQLConnection
from api.routes.auth import router as auth_routes
from api.routes.users import router as user_routes
from api.routes.movies import router as movie_routes
from api.routes.theaters import router as theater_routes
from api.routes.memberships import router as membership_routes
from api.routes.movie_genres import router as movie_genre_routes
from api.routes.showtimes import router as showtime_routes
from api.routes.sales import router as sale_routes
from api.routes.reserved_seats import router as reserved_seat_routes
from api.routes.customer_memberships import router as customer_membership_routes

app = FastAPI()

# Initialize the database connection
db = MySQLConnection(
    host        = "localhost",
    port        = 4000,
    user        = "root",
    password    = "root",
    database    = "cine"
)

@app.get("/")
def read_root():
    return {"message": "Cine API"}

app.include_router(auth_routes, prefix="/auth")
app.include_router(user_routes, prefix="/users")
app.include_router(movie_routes, prefix="/movies")
app.include_router(theater_routes, prefix="/theaters")
app.include_router(membership_routes, prefix="/memberships")
app.include_router(movie_genre_routes, prefix="/movie_genres")
app.include_router(showtime_routes, prefix="/showtimes")
app.include_router(sale_routes, prefix="/sales")
app.include_router(reserved_seat_routes, prefix="/reserved_seats")
app.include_router(customer_membership_routes, prefix="/customer_memberships")