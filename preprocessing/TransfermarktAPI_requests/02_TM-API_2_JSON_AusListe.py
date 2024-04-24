import requests
import json

# Liste für nicht gefundene Clubs
clubs_notfound = []

# Funktion für Clubdaten
def get_club_profile(club_id):
    url = f'https://transfermarkt-api.vercel.app/clubs/{club_id}/profile'
    response = requests.get(url)
    if response.status_code == 200:
        return response.json()
    else:
        clubs_notfound.append(club_id)
        print(f"Fehler beim Abrufen der Daten für Club {club_id}. Statuscode: {response.status_code}")
        return None

# Funktion für Stadionkoordinaten
def get_coordinates(city, stadium_name):
    url = f'https://nominatim.openstreetmap.org/search.php?q={stadium_name}+{city}&format=json'         # Suche mit Nominatim Openstreetmap nach Stadionname und Stadt
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        stadium_entry = None
        # Suche nach dem Stadion in den Ergebnissen
        for result in data:
            if 'type' in result and result['type'] == 'stadium':                                        # Filtern der Resultate -> Ergebnis mit Typ = Stadion
                latitude = float(result['lat'])
                longitude = float(result['lon'])
                print(f"Koordinaten gefunden für Stadion '{stadium_name}': Lat {latitude}, Lon {longitude}")
                return latitude, longitude
            elif 'name' in result and result['name'] == stadium_name:
                stadium_entry = result
        if stadium_entry:                                                                               # Filtern der Resultate -> Ergebnis mit Typ = Unbekannt
            latitude = float(stadium_entry['lat'])
            longitude = float(stadium_entry['lon'])
            print(f"Koordinaten gefunden für Stadion '{stadium_name}' (mit Typ '{stadium_entry.get('type', 'unbekannt')}'): Lat {latitude}, Lon {longitude}")
            return latitude, longitude
        else:
            # Falls kein Stadion gefunden wird, wird None zurückgegeben
            print(f"Kein Stadion gefunden für Stadionname: {stadium_name}, Stadt: {city}")
            return None
    else:
        print(f"Fehler beim Abrufen der Koordinaten. Statuscode: {response.status_code}")
        return None


def main():
    # Liste der Club-IDs der Schweizer Super League
    club_ids = []

    # Liste für Club-Daten
    club_profiles = []

    # Detailierte Club-Daten für jede Club-ID abfragen
    for club_id in club_ids:
        club_profile = get_club_profile(club_id)
        if club_profile:
            if 'addressLine2' in club_profile:
            # Stadt aus addressLine2 extrahieren, falls vorhanden
                city = club_profile['addressLine2'].split()[-1]
                stadium_name = club_profile.get('stadiumName', '')
            else:
            # Wenn 'addressLine2' nicht vorhanden ist, setze city auf einen leeren String
                city = ""
            if stadium_name:
                # Koordinaten des Stadions abrufen
                coordinates = get_coordinates(city, stadium_name)
                if coordinates:
                    club_profile['stadium_coordinates'] = coordinates
                else:
                    # Wenn keine Koordinaten gefunden werden, füge leere Koordinaten hinzu
                    print(f"Warnung: Keine Koordinaten gefunden für Club {club_profile['name']}. Leere Koordinaten hinzugefügt.")
                    club_profile['stadium_coordinates'] = None
            else:
                # Wenn kein Stadionname gefunden wird, gib eine Warnung aus und setze leere Koordinaten
                print(f"Warnung: Kein Stadionname gefunden für Club {club_profile['name']}. Leere Koordinaten hinzugefügt.")
                club_profile['stadium_coordinates'] = None
            club_profiles.append(club_profile)

    # Club-Daten in eine Datei speichern
    with open('Clubs.json', 'w') as f:                                                #Filname kann angepasst werden #WARNING
        json.dump(club_profiles, f, indent=4)
    print("Club-Daten erfolgreich abgerufen und in Zielfile gespeichert.")
    print(clubs_notfound)                                                             # Ausgabe der nicht gefundenen Clubs

if __name__ == "__main__":
    main()
