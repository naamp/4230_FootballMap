import json
import requests

# Lesen der Inputdatei
with open('AlleLigen_formatiert.json', 'r') as file:                                  #Filname kann angepasst werden #WARNING
    leagues = json.load(file)

club_ids = []

# Iteration der Ligen
for country, leagues_list in leagues.items():
    for league in leagues_list:
        league_id = league['liga_nr']
        # URL für API Abfrage (Liga)
        url = f"https://transfermarkt-api.vercel.app/competitions/{league_id}/clubs"
        try:
            response = requests.get(url)
            response.raise_for_status()
            data = response.json()
            # Extrahieren der club_ids aus der Inputdatei
            for club in data['clubs']:
                club_ids.append(club['id'])
        except requests.exceptions.RequestException as e:
            print(f"Fehler beim Abrufen der Daten für die Liga {league['id']}: {e}")

print(club_ids)
