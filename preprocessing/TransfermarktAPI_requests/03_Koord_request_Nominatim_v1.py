import json
import requests

def get_coordinates(city, stadium_name):
    url = f'https://nominatim.openstreetmap.org/search.php?q={stadium_name}&format=json'                        # Suche mit Nominatim Openstreetmap nach Stadionname
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        stadium_entry = None
        # Suche nach dem Stadion in den Ergebnissen
        for result in data:
            if 'type' in result and result['type'] == 'stadium':                                                # Filtern der Resultate -> Ergebnis mit Typ = Stadion
                latitude = float(result['lat'])
                longitude = float(result['lon'])
                print(f"Koordinaten gefunden für Stadion '{stadium_name}': Lat {latitude}, Lon {longitude}")
                return latitude, longitude
            elif 'name' in result and result['name'] == stadium_name:
                stadium_entry = result
        if stadium_entry:                                                                                       # Filtern der Resultate -> Ergebnis mit Typ = Unbekannt
            latitude = float(stadium_entry['lat'])
            longitude = float(stadium_entry['lon'])
            print(f"Koordinaten gefunden für Stadion '{stadium_name}' (mit Typ '{stadium_entry.get('type', 'unbekannt')}'): Lat {latitude}, Lon {longitude}")
            return latitude, longitude
        else:
            # Falls kein Stadion gefunden wird, gib None zurück
            print(f"Kein Stadion gefunden für Stadionname: {stadium_name}, Stadt: {city}")
            return None
    else:
        print(f"Fehler beim Abrufen der Koordinaten. Statuscode: {response.status_code}")
        return None

# Laden der Daten aus der JSON-Datei
with open('Club_profiles.json', 'r') as file:                                                                   # (INPUT) Filname kann angepasst werden #WARNING
    data = json.load(file)

# Iteration über die Klubs
for club in data:
    if club.get("stadium_coordinates") is None:
        city = club.get("addressLine2")
        stadium_name = club.get("stadiumName")
        # Koordinaten abrufen
        coordinates = get_coordinates(city, stadium_name)
        # Wenn Koordinaten gefunden wurden, aktualisiere das JSON
        if coordinates:
            club["stadium_coordinates"] = coordinates

# Aktualisierte Daten speichern
with open('Club_profiles_updated.json', 'w') as file:                                                            # (OUTPUT) Filname kann angepasst werden #WARNING
    json.dump(data, file, indent=4)

print("Das Programm wurde erfolgreich ausgeführt und die Daten wurden aktualisiert.")
