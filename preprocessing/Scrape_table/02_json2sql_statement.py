import json

# Der Pfad zu deiner JSON-Datei
json_file_path = 'teams_data.json'
# Der Pfad, wo die SQL-Statements gespeichert werden sollen
sql_file_path = 'insert_statements.sql'

# Lese die JSON-Datei
with open(json_file_path, 'r') as file:
    data = json.load(file)

# Öffne eine neue Datei, um die SQL-Statements zu schreiben
with open(sql_file_path, 'w') as sql_file:
    for item in data:
        # Generiere das SQL-INSERT-Statement für den aktuellen Datensatz
        insert_query = f"INSERT INTO public.clubstatistik (club_id, rang, spiele, gewonnen, unentschieden, verloren, tore, gegentore, punkte) VALUES ({item['club_id']}, {item['rang']}, {item['spiele']}, {item['gewonnen']}, {item['unentschieden']}, {item['verloren']}, {item['tore']}, {item['gegentore']}, {item['punkte']});\n"
        # Schreibe das INSERT-Statement in die Datei
        sql_file.write(insert_query)

print(f"SQL-Statements wurden in {sql_file_path} gespeichert.")
