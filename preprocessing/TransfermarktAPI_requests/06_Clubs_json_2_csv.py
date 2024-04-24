import csv
import json

# Funktion zum Laden der Daten aus der JSON-Datei
def load_data(file):
    with open(file, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data

# Funktion zum Schreiben der Daten in eine CSV-Datei
def write_to_csv(data, csv_file):
    with open(csv_file, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=data[0].keys())
        writer.writeheader()
        writer.writerows(data)

# Hauptfunktion zum Ausführen des Programms
def main():
    json_file = "AlleLigenAlleClubs_formatiert.json"            #Filname kann angepasst werden #WARNING
    csv_file = "AlleLigenAlleClubs_formatiert.csv"              #Filname kann angepasst werden #WARNING

    # Laden der Daten aus der JSON-Datei
    data = load_data(json_file)

    # Schreiben der Daten in die CSV-Datei
    write_to_csv(data, csv_file)

    print("Daten wurden erfolgreich in CSV-Datei konvertiert.")

# Programm ausführen
if __name__ == "__main__":
    main()
