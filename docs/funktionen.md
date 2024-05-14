# Erklärung der Funktionen von Football Map
In diesem Abschnitt werden die Funktionen und Interaktionen der Fussballmap beschrieben

## Startpage
<div id="startpage">
Auf der Startseite erscheint eine dynamische Karte, die auf die Schweiz fokussiert ist. Es werden die Clublogos entsprechend iherer geografischen Lage (Stadion) angezeit. Über die Toolbar können Nutzer aus 30 Ländern und 70 Ligen Clubs auswählen und filtern. Insgesamt sind 1060 Clubs in der Datenbank vorhanden.

Die Anzahl der Ligen pro Land variiert je nach Spielstärke. Für führende Fussballnationen sind die drei obersten Ligen verfügbar. Bei Ländern mit mittlerem Fussballniveau wurden die zwei höchsten Ligen einbezogen. In anderen Nationen ist jeweils nur die oberste Liga vertreten. Für die Schweiz hingegen wurden die fünf höchsten Ligen aufgenommen.
</div>

### Funktionen:
- Filtern nach Land und Liga mit der Möglichkeit mehrere Ligen eines Landes einzublenden (siehe Bild)
- Tabelle aller Stadion in einer Liga geordnet nach Stadionkapazität
- Mit Klick auf Clublogo wird der Stadiumname aufgerufen und es eröffnet weitere Funktionen: Squad Overview und Player Origin (siehe Bild)

![Mehrere Ligen](GIFs/Startpage_4.gif) ![Klick auf Logo](GIFs/Startpage_1.gif)

## Squad Overview
<div id="squad-overview">
Durch den entsprechenden Klick auf den Button Squadoverview, wie es im Kapitel Startpage beschrieben wurde, öffnet ein weiteres Fenster. In diesem Ausschnitt kann nun das entsprechende Kader betrachtet werden (siehe Bild). Ingesamt wurden 360 Spieler und 2880 Attribute (Spielerinformationen) aus der Schweizer Super League in der Datenbank erfasst.

![squad overview](Bilder/SquadOverview.png)
</div>

### Funktionen:
- Dynamische Karte mit Zoomfunktion auf Club
- Tabelle mit Spielern des Clubs und Spielerinformationen (Shirt Nr., Name, Position, Foot, Height, Marketvalue, Age, Born)
- Durch den Klick auf Spieler ist ein weitere Funktionion (Transfer History) aufrufbar
- Ändern der Teamübersicht auf ein anderen Club mittels Auswahlmenü in der Toolbar

Bemerkung: Diese Informationen und Funktionen sind nur für Clubs aus der schweizerischen Super League, sowie deren Spieler möglich.

## Transfer History
<div id="transfer-history">
Mit dem Entsprechenden Klick auf den Spieler (Seite Squad Overview), geht eine neue Seite auf. Die Seite Transfer History ermöglicht es den Transferweg eines Spielers zu betrachten. Dabei werden die Stationen mittels einer Linie dargestellt. Ist ein Club bei einem Transfer in der Datenbank nicht vorhanden, so wird das Land des Clubs mit dem Zentroid als Station verwendet.

![transfer history](Bilder/TransferHistory.png)
</div>

### Funktionen:
- Transferströme unterteilt in