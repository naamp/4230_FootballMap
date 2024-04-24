import requests
from bs4 import BeautifulSoup
import json

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'}

url = 'https://www.transfermarkt.ch/super-league/tabelle/wettbewerb/C1/saison_id/2023'
response = requests.get(url, headers=headers)

# Zuordnung der ursprünglichen Namen zu den neuen Namen
name_mapping = {
    'FC Basel': 'FC Basel 1893',
    'Lausanne-Sport': 'FC Lausanne-Sport',
    'FC St. Gallen': 'FC St. Gallen 1879',
    'Yverdon Sport': 'Yverdon Sport FC',
    'Grasshoppers': 'Grasshopper Club Zurich',
    'Stade-Lausanne': 'FC Stade-Lausanne-Ouchy',
}

#Hinzufügen ID
team_ids = {
    'BSC Young Boys': 452,
    'FC Basel 1893': 26,
    'FC Lugano': 2790,
    'FC Luzern': 434,
    'FC Lausanne-Sport': 527,
    'FC St. Gallen 1879': 257,
    'Servette FC': 61,
    'FC Zürich': 260,
    'Yverdon Sport FC': 322,
    'Grasshopper Club Zurich': 504,
    'FC Stade-Lausanne-Ouchy': 5499,
    'FC Winterthur': 242
}


teams_data = []  # Eine Liste, um die Daten aller Teams zu speichern

if response.status_code == 200:
    soup = BeautifulSoup(response.text, 'html.parser')
    tabelle = soup.find('table', class_='items').find('tbody')
    zeilen = tabelle.find_all('tr')
    
    for zeile in zeilen:
        rang_zelle = zeile.find('td', class_='rechts hauptlink')
        rang = rang_zelle.text.strip().split(' ')[0] if rang_zelle else "Nicht gefunden"
        
        name_zelle = zeile.find('td', class_='no-border-links hauptlink')
        name = name_zelle.find('a').text.strip() if name_zelle else "Nicht gefunden"
        
        # Ändere den Namen basierend auf dem Mapping, wenn der Name im Mapping vorhanden ist
        name = name_mapping.get(name, name)
        
        daten_zellen = zeile.find_all('td', class_='zentriert')
        if len(daten_zellen) >= 8:
            spiele = daten_zellen[1].text.strip()
            gewonnen = daten_zellen[2].text.strip()
            unentschieden = daten_zellen[3].text.strip()
            verloren = daten_zellen[4].text.strip()
            tore_und_gegentore = daten_zellen[5].text.strip()
            punkte = daten_zellen[7].text.strip()

            try:
                tore, gegentore = tore_und_gegentore.split(':')
            except ValueError:
                continue  # Überspringt den aktuellen Durchlauf im Fehlerfall
            
            teams_data.append({
                'club_id': team_ids.get(name,"ID nicht gefunden"),
                'rang': rang,
                'name': name,
                'spiele': spiele,
                'gewonnen': gewonnen,
                'unentschieden': unentschieden,
                'verloren': verloren,
                'tore': tore,
                'gegentore': gegentore,
                'punkte': punkte
            })
else:
    print(f'Fehler beim Abrufen der Webseite: Statuscode {response.status_code}')

# Speichere die Daten in einer JSON-Datei
with open('teams_data.json', 'w', encoding='utf-8') as f:
    json.dump(teams_data, f, ensure_ascii=False, indent=4)

print("Daten wurden erfolgreich in teams_data.json gespeichert.")
