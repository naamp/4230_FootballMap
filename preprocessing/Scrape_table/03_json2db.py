import psycopg2

# Datenbankverbindungsdaten
dbname = 'deine_datenbank'  # Name deiner Datenbank
user = 'dein_benutzername'   # Dein Benutzername
password = 'dein_passwort'   # Dein Passwort
host = 'localhost'           # Host, typischerweise 'localhost' für eine lokale Datenbank
port = '5432'                # Port, standardmäßig 5432 für PostgreSQL

# Pfad zur SQL-Datei
sql_file_path = 'insert_statements.sql'

try:
    # Verbinde zur Datenbank
    conn = psycopg2.connect(dbname=dbname, user=user, password=password, host=host, port=port)
    cursor = conn.cursor()

    # Öffne und lese die SQL-Datei
    with open(sql_file_path, 'r') as sql_file:
        sql_script = sql_file.read()
    
    # Führe das SQL-Skript aus
    cursor.execute(sql_script)
    conn.commit()
    print("SQL-Statements wurden erfolgreich ausgeführt.")

except psycopg2.DatabaseError as e:
    print(f"Ein Datenbankfehler ist aufgetreten: {e}")
    conn.rollback()  # Rollback im Fehlerfall
except IOError as e:
    print(f"Fehler beim Lesen der Datei: {e}")
finally:
    # Schließe Cursor und Verbindung
    if cursor:
        cursor.close()
    if conn:
        conn.close()
