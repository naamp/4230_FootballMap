from fastapi import FastAPI, HTTPException, status
from fastapi.responses import HTMLResponse
from fastapi.responses import ORJSONResponse
# CORS aktivieren für FastAPI Backend
from fastapi.middleware.cors import CORSMiddleware
# Datenbank Verbindung
from psycopg2 import pool
#from psycopg2.extras import RealDictCursor
from pydantic import BaseModel

app = FastAPI() 

# CORS Einstellungen
# siehe: https://fastapi.tiangolo.com/tutorial/cors/#use-corsmiddleware
origins = [
    "http://localhost",
    "http://localhost:8080",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple Hello World example
@app.get("/") 
async def root(): 
	return {"message": "Hello GDI Project"}
	
    
# Erstellt eine About Seite mit HTML Output 
# import HTMLResponse benötigt
@app.get("/about/")
def about():
    return HTMLResponse(
    """
    <html>
      <head>
        <title>FAST API Service</title>
      </head>
      <body>
        <div align="center">
          <h1>Simple FastAPI Server About Page</h1>
          <p>Dieser FastAPI Rest Server bietet eine einfache REST Schnittstelle. Die Dokumentation ist über <a href="http://localhost:8000/docs">http://localhost:8000/docs</a> verfügbar.</p> 
        </div>
      </body>
    </html>
    """
    )

# Simple static JSON Response 
# (requires package "orjson" https://github.com/ijl/orjson https://anaconda.org/conda-forge/orjson conda install -c conda-forge orjson)
# source: https://fastapi.tiangolo.com/advanced/custom-response/
@app.get("/points/", response_class=ORJSONResponse)
async def read_points():
    return ORJSONResponse({
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "name": "FHNW"
      },
      "geometry": {
        "coordinates": [
          7.642053725874888,
          47.53482543914882
        ],
        "type": "Point"
      },
      "id": 0
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Bern"
      },
      "geometry": {
        "coordinates": [
          7.4469686824532175,
          46.95873550880529
        ],
        "type": "Point"
      },
      "id": 1
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Zurich"
      },
      "geometry": {
        "coordinates": [
          8.54175132796243,
          47.37668053625666
        ],
        "type": "Point"
      },
      "id": 2
    }
  ]
})

   
# Post Query - test on the OPENAPI Docs Page
@app.post("/square")
def square(some_number: int) -> dict:
	square = some_number**2
	return {f"{some_number} squared is: ": square}


# Simple Database query
DB_HOST = "localhost"
DB_PORT = 5432
DB_NAME = "geoserver"
DB_USER = "postgres"
DB_PASSWORD = "postgres"
DB_POOL_MIN_CONN = 1
DB_POOL_MAX_CONN = 10

db_pool = pool.SimpleConnectionPool(
  DB_POOL_MIN_CONN, DB_POOL_MAX_CONN, host=DB_HOST, port=DB_PORT, database=DB_NAME, user=DB_USER, password=DB_PASSWORD
)

# Definition für das Antwortschema (response schema) für den Endpunkt getPoints
class PunkteResponse(BaseModel):
    id: int
    name: str
    x: float
    y: float
    geom: str
    
# Funktion für den getPoints-Endpunkt
# Test: curl http://localhost:8000/getPoints   
@app.get("/getPoints" , response_model=list[PunkteResponse])
async def get_punkte():
    conn = None
    try:
        # Verbindung zur Datenbank über den Verbindungspool herstellen
        conn = db_pool.getconn()
        cur = conn.cursor()
        query = "SELECT id, name, ST_X(geom) as x, ST_Y(geom) as y, ST_AsText(geom) as geom FROM punkte"
        cur.execute(query)
        results = cur.fetchall()
        # Ergebnisse in Pydantic-Modelle umwandeln und zurückgeben
        punkte = []
        for row in results:
        # Prüfen, ob die Ergebnisse ausreichend Spalten enthalten
             if len(row) > 4:
                  punkte.append(PunkteResponse(id=row[0], name=row[1], x=row[2], y=row[3], geom=row[4]))   
        #print(punkte)
        return punkte
    except Exception as e:
        print(e)
        # Eine HTTPException mit Statuscode 500 (Interner Serverfehler) auslösen und den ausgelösten Fehler als Detail übergeben
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error: "+str(e))
    finally:
        if conn:
            # Die Verbindung zur Datenbank beenden
            db_pool.putconn(conn)

