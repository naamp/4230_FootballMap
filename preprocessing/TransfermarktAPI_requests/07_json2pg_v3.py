import psycopg2
import json

# Verbindung zur Datenbank herstellen
conn = psycopg2.connect(
    dbname="footballmap_v2",
    user="postgres",
    password="6037",
    host="localhost",
    port="5432"
)
cur = conn.cursor()

# Erstellen der Tabellen, wenn sie nicht vorhanden sind
cur.execute("""
    CREATE TABLE IF NOT EXISTS club (
        club_id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        official_name VARCHAR(100),
        logo VARCHAR,
        ort VARCHAR(100),
        land VARCHAR(100),
        stadium_id INTEGER REFERENCES stadium(stadium_id),
        liga_id INTEGER,
        club_id_tm INTEGER,
        liga_id_tm VARCHAR(6) REFERENCES liga(liga_id_tm)
    )
""")

cur.execute("""
    CREATE TABLE IF NOT EXISTS stadium (
        stadium_id SERIAL PRIMARY KEY,
        stadium_name VARCHAR(100) NOT NULL,
        kapazität INTEGER,
        lon FLOAT,
        lat FLOAT
    )
""")
conn.commit()

# Lesen der Daten aus JSON und Einfügen in die Datenbank
with open('AlleLigenAlleClubs_formatiert.json', 'r', encoding='utf-8') as f:
    club_data = json.load(f)
    for club_info in club_data:
        stadium_id = int(club_info['stadium_id'])
        liga_id_tm = club_info['liga_id_tm']
        club_id_tm = club_info['club_id_tm']
        stadium_name = club_info['stadium_name']
        kapazität_str = club_info.get('kapazität', '0')
        if kapazität_str.isdigit():
            kapazität = int(kapazität_str)
        else:
            kapazität = 0
            print("Ungültiger Wert für Kapazität:", kapazität_str)
        lon = float(club_info['lon'])
        lat = float(club_info['lat'])

        # Einfügen der STADIUM Daten
        cur.execute("""
            INSERT INTO stadium (stadium_id, stadium_name, kapazität, lon, lat)
            VALUES (%s, %s, %s, %s, %s)
        """, (stadium_id, stadium_name, kapazität, lon, lat))

        # Einfügen der CLUB Daten
        cur.execute("""
            INSERT INTO club (name, official_name, ort, land, stadium_id, club_id_tm, liga_id_tm)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (club_info['name'], club_info.get('officialName'), club_info['ort'],
              club_info['land'], stadium_id, club_id_tm, liga_id_tm))

# Commit der Änderungen und Schließen der Verbindung
conn.commit()
conn.close()

print("Daten erfolgreich in die Datenbank eingefügt.")
