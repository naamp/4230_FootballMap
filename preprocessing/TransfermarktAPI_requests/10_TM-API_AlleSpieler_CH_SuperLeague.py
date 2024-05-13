import requests
import json

# Liste aller club_ids
club_ids = []                                                                                   # (INPUT) Liste kann angepasst werden #WARNING

# Basis-URL der API
base_url = "https://transfermarkt-api.vercel.app/clubs/"

# Funktion zum Abrufen der Spieler für eine bestimmte club_id
def get_players_for_club(club_id):
    url = f"{base_url}{club_id}/players"
    response = requests.get(url)
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Fehler beim Abrufen der Spieler für club_id {club_id}")
        return []

# Hauptfunktion zum Abrufen der Spieler für alle club_ids
def get_all_players(club_ids):
    all_players = {}
    for club_id in club_ids:
        players = get_players_for_club(club_id)
        all_players[club_id] = players
    return all_players

# Abrufen aller Spieler für alle club_ids
all_players = get_all_players(club_ids)

# Speichern der Spielerdaten in einer JSON-Datei
with open("AlleSpieler_SuperLeague.json", "w", encoding="utf-8") as f:                          # (OUTPUT) Filname kann angepasst werden #WARNING
    json.dump(all_players, f, ensure_ascii=False, indent=4)

print("Alle Spielerdaten wurden erfolgreich abgerufen und gespeichert.")
