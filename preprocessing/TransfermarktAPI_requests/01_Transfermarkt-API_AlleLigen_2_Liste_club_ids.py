import json
import requests

# Lese die JSON-Datei mit den Fußballligen und ihren IDs ein
with open('RestlicheLigen.json', 'r') as file:                                                      #ANPASSUNG FILENAME
    leagues = json.load(file)

club_ids = []

# Iteriere über die Ligen
for country, leagues_list in leagues.items():
    for league in leagues_list:
        league_id = league['id']
        # Erstelle die API-Abfrage-URL für die Clubs in dieser Liga
        url = f"https://transfermarkt-api.vercel.app/competitions/{league_id}/clubs"
        try:
            response = requests.get(url)
            response.raise_for_status()  # Wirft eine Ausnahme bei einem Fehlerstatuscode
            data = response.json()
            # Extrahiere die club_ids aus der Antwort und füge sie zur Liste hinzu
            for club in data['clubs']:
                club_ids.append(club['id'])
        except requests.exceptions.RequestException as e:
            print(f"Fehler beim Abrufen der Daten für die Liga {league['id']}: {e}")

print(club_ids)
