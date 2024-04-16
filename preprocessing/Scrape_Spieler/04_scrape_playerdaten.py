import json
import requests
from bs4 import BeautifulSoup

# Funktion zum Laden der Spieler-IDs aus einer Datei
def lade_spieler_ids(dateipfad):
    with open(dateipfad, 'r', encoding='utf-8') as file:
        data = json.load(file)
    return data['player_ids']

# Funktion zum Abrufen und Verarbeiten der Spielerdaten
def verarbeite_spieler(id):
    url = f'https://www.transfermarkt.com/ardon-jashari/profil/spieler/{id}'
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'}
    response = requests.get(url, headers=headers)

    # Überprüfe den Statuscode der Antwort
    if response.status_code == 200:
        # Parse das HTML der Seite
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Extrahiere die Trikotnummer
        trikotnummer_element = soup.find("span", class_="data-header__shirt-number")
        trikotnummer = trikotnummer_element.text.strip().replace('#', '') if trikotnummer_element else "Nicht gefunden"
        
        # Extrahiere den Namen, ohne die Trikotnummer
        name_element = soup.find("h1", class_="data-header__headline-wrapper")
        if name_element and name_element.find("span", class_="data-header__shirt-number"):
             name_element.find("span", class_="data-header__shirt-number").decompose()
        name = ' '.join(name_element.text.split()) if name_element else "Nicht gefunden"
        
        # Funktion zur Extraktion der weiteren Daten
        def extrahiere_daten(beschreibung):
            element = soup.find(string=beschreibung)
            if element:
                naechstes_fett_element = element.find_next("span", class_="info-table__content info-table__content--bold")
                if naechstes_fett_element:
                    return ' '.join(naechstes_fett_element.text.split())
            return "Information nicht gefunden"
        
        # Extrahiere das Geburtsland
        def extrahiere_geburtsland():
            element = soup.find(string="Place of birth:")
            if element:
                # Suche das nächste Element mit einem title-Attribut, das den Ländernamen enthält
                land_element = element.find_next(lambda tag: tag.has_attr('title'))
                if land_element:
                    return land_element['title']
            return "Land nicht gefunden"
        
        def extrahiere_marktwert():
            marktwert_element = soup.find("div", class_="data-header__box--small")
            if marktwert_element:
                marktwert = marktwert_element.find("a", class_="data-header__market-value-wrapper")
                if marktwert:
                    marktwert_text = marktwert.text.strip()
                    # Entferne den Teil nach "Last update:", falls vorhanden
                    if "Last update:" in marktwert_text:
                        marktwert_text = marktwert_text.split("Last update:")[0].strip()
                    return marktwert_text
            return "Marktwert nicht gefunden"
  
        
        def extrahiere_vereinsnummer():
            club_element = soup.find("span", class_="info-table__content info-table__content--bold info-table__content--flex")
            if club_element:
                club_link = club_element.find("a", href=True)
                if club_link and 'href' in club_link.attrs:
                    club_href = club_link.attrs['href']
                    club_nummer = club_href.split('/')[-1]
                    return club_nummer
            return "Vereinsnummer nicht gefunden"    

        def extrahiere_spielerbild_link():
            bild_element = soup.find("img", class_="data-header__profile-image")
            if bild_element and 'src' in bild_element.attrs:
                return bild_element.attrs['src']
            return "Bildlink nicht gefunden"         
        
        
        # Finde das Element mit der Spieler-ID
        spieler_nr_element = soup.find("div", {"id": "svelte-performance-data"})
        spieler_nr = spieler_nr_element['data-player-id'] if spieler_nr_element else "Nicht gefunden"
        
        # Extrahiere die gewünschten Daten
        spielerdaten = {
            "spieler_nr": spieler_nr,
            "trikotnummer": trikotnummer,
            "name": name,
            "geburtsort": extrahiere_daten("Place of birth:").split()[0],  # Entfernt zusätzliche Informationen nach dem ersten Leerzeichen
            "geburtsland": extrahiere_geburtsland(),
            "vereinsbeitritt": extrahiere_daten("Joined:"),
            "vertragsende": extrahiere_daten("Contract expires:"),
            "position": extrahiere_daten("Position:"),
            "starker_fuss": extrahiere_daten("Foot:"),
            "geburtsdatum": extrahiere_daten("Date of birth/Age:").split('(')[0].strip(),  # Entfernt das Alter
            "körpergrösse": extrahiere_daten("Height:"),
            "nationalität": extrahiere_daten("Citizenship:").split()[-1],  # Nimmt den letzten Teil, falls mehrere Staatsangehörigkeiten angegeben sind
            "marktwert": extrahiere_marktwert(),
            "vereinsnummer": extrahiere_vereinsnummer(),
            "spielerbild_link": extrahiere_spielerbild_link()
        }
        
        return spielerdaten
    else:
        print(f"Fehler beim Abrufen der Webseite: Statuscode {response.status_code}")

dateipfad = 'alle_Spieler_Nr.json'
spieler_ids = lade_spieler_ids(dateipfad)
alle_spieler_daten = []

for spieler_id in spieler_ids:
    daten = verarbeite_spieler(spieler_id)
    if daten:
        alle_spieler_daten.append(daten)

# Speichere die Daten in einer JSON-Datei
with open('alle_spieler_daten.json', 'w', encoding='utf-8') as file:
    json.dump(alle_spieler_daten, file, ensure_ascii=False, indent=4)