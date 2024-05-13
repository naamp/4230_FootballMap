import json
import requests

def get_coordinates(city, country):
    url = f'https://nominatim.openstreetmap.org/search.php?q={city}&format=json'                                # Suche mit Nominatim Openstreetmap nach der Stadt
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        stadium_entry = None
        # Suche nach dem Stadion in den Ergebnissen
        for result in data:
            if 'type' in result:                                                                                # Filtern der Resultate -> ohne Bedingung
                latitude = float(result['lat'])
                longitude = float(result['lon'])
                print(f"Koordinaten gefunden für Club '{club_name}': Lat {latitude}, Lon {longitude}")
                return latitude, longitude
            elif 'name' in result and result['name'] == country:
                stadium_entry = result
        if stadium_entry:
            latitude = float(stadium_entry['lat'])
            longitude = float(stadium_entry['lon'])
            print(f"Koordinaten gefunden für Stadion '{club_name}' (mit Typ '{stadium_entry.get('type', 'unbekannt')}'): Lat {latitude}, Lon {longitude}")
            return latitude, longitude
        else:
            # Falls kein Stadion gefunden wird, gib None zurück
            print(f"Keine Koordinaten gefunden für Club: {club_name}, Stadt: {city}")
            return None
    else:
        print(f"Fehler beim Abrufen der Koordinaten. Statuscode: {response.status_code}")
        return None

# Laden der Daten aus der JSON-Datei
with open('Club_profiles.json.json', 'r') as file:                                                              # (INPUT) Filname kann angepasst werden #WARNING
    data = json.load(file)

# Iteration über die Klubs
for club in data:
    if club.get("stadium_coordinates") is None:
        city = club.get("addressLine2")
        country = club.get("addressLine3")
        stadium_name = club.get("stadiumName")
        club_name = club.get("officialName")
        # Koordinaten abrufen
        coordinates = get_coordinates(city, club_name)
        # Wenn Koordinaten gefunden wurden, aktualisiere das JSON
        if coordinates:
            club["stadium_coordinates"] = coordinates

# Aktualisierte Daten speichern
with open('Club_profiles_updated.json', 'w') as file:                                                           # (OUTPUT) Filname kann angepasst werden #WARNING
    json.dump(data, file, indent=4)

print("Das Programm wurde erfolgreich ausgeführt und die Daten wurden aktualisiert.")
