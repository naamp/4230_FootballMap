import json

# Definition Filename
grundlagen_file = "Club_profiles_updated.json"              # (INPUT) Filename kann angepasst werden # WARNING
ziel_file = "AlleLigenAlleClubs_formatiert.json"            # (OUTPUT) Filename kann angepasst werden # WARNING

# Funktion zur Konvertierung eines Vereins
def convert_club(club, stadium_id):
    official_name = club.get("officialName", "")
    stadium_name = club.get("stadiumName", "")
    liga_id_tm = club["league"]["id"] if "league" in club and "id" in club["league"] else ""
    return {
        "club_id_tm": club["id"],
        "name": club["name"],
        "officialName": official_name,
        "logo": club["image"],
        "ort": club.get("addressLine2", ""),
        "land": club.get("addressLine3", ""),
        "liga_id_tm": liga_id_tm,
        "stadium_name": stadium_name,
        "kapazität": club.get("stadiumSeats", ""),
        "lon": club["stadium_coordinates"][1],
        "lat": club["stadium_coordinates"][0],
        "stadium_id": stadium_id
    }


# Funktion zum Laden der Daten aus der Grundlagen-Datei
def load_data(file):
    with open(file, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data

# Funktion zum Speichern der Daten im Ziel-Format
def save_data(data, file):
    with open(file, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=4)

# Laden der Daten aus der Grundlagen-Datei
grundlagen_data = load_data(grundlagen_file)

# Konvertierung der Daten in das Ziel-Format
ziel_data = []
stadium_id = 1001                                      # Startnummer kann angepasst werden! # WARNING 
for club in grundlagen_data:
    converted_club = convert_club(club, stadium_id)
    ziel_data.append(converted_club)
    stadium_id += 1

# Speichern der Daten im Ziel-Format
save_data(ziel_data, ziel_file)

print("Daten wurden erfolgreich konvertiert und gespeichert.")
