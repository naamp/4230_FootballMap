**Projekt Feedback GitHub Pages:** Football Map

**GitHub Projekt:** Nando Amport, Stefan Sidler, Silvan Baumeler

- https://github.com/naamp/4230_FootballMap
- https://naamp.github.io/4230_FootballMap/

**README**: Einleitung zur Installation und Projekt ergänzen mit einem Beschrieb, was das Repository bietet mit einem klaren Verweis auf die GitHub Pages. Dann ergänzen mit den Systemanforderungen mit den genutzten Technologien in Frontend und Backend.

✔ Vergleicht, ob die Angaben zur Architektur auf der GitHub Pages mit den Frontend Backend Angaben auf GitHub übereinstimmt.
✔ Stimmen die aufgeführten Versionsangaben? und welche weiteren Libraries und Versionen werden genutzt?
- About (oben rechts) ergänzen mit GitHub Pages Link
- Titel *GDI_Project* in Projektnamen ändern
- Preprocessing Ordner noch genauer erläutern, Struktur / Nutzung
- Wie ist der Geoserver eingebunden, respektive sind alle Angaben für das Aufsetzen vorhanden?

Code Organisation:

✔ Code ist strukturiert jedoch kaum kommentiert oder nur mit ToDo versehen.
✔ ToDo's im Code entfernt
✔ In Preprocessing-Daten sind sehr viele Kommentare vorhanden

**GitHub Pages:**

**Allgemein**: Gute Übersicht zum Projekt, es fehlt eine grafische Übersicht der implementierten und geplanten Features.

- Reflektion einführen
- Workflow / Userflow einfügen (Flussdiagramm oder eine aktualisierte Version aus dem Konzept verwenden, ev kennzeichnen was umgesetzt und was geplant ist.)
✔ Literatur und Daten/Library Übersicht am Ende als Quellenverzeichnis oder geeigneter Stelle einfügen.
✔ Scraping und Datenintegration braucht noch Überarbeitung. Hier ist noch nicht ganz klar, welche Daten wie prozessiert werden. Hier eine erläuternde Grafik/Workflow einfügen und mit dieser die Funktionsweise der einzelnen Scripts erläutern.

Kommentare zu den einzelnen Pages/Abschnitten:

✔ Startpage: Das Projekt besser einleiten anstatt einfach *Das ist die FootballMap*. Vielleicht Hier schon die Feature Grafik einfügen?
✔ Einleitung: Der Projektrahmen am Ende der Einleitung erwähnen und direkt mit Abschnitt zwei starten. Am Ende der Einleitung vor dem letzten Satz schreiben, in welchem Rahmen das Projekt entstand.
- Funktionen:
  ✔ Rechtschreibung überprüfen
  ✔ ev. eine Tabelle mit drei Zeilen nach Fussballnationen, die mit drei, zwei oder nur einer Liga aufgeführt sind und den jeweiligen Ländern einfügen.
  ✔ GIF 1: User sieht nicht was im Anschluss passiert wenn, Squad Overview und Player Origin gewählt wird. (ev. verweisen auf den Abschnitt Squad Overview oder Player Origin?)
- Aufbau GDI
  ✔ Grafik: API Services grössere Schrift wählen.
  ✔ Die Pfeile zur Datenbank führen ins leere hier könnte die Tabellen aufgeführt werden, falls sinnvoll.
  - Die Logos für eine einheitlichere Darstellung alle gleich breit oder hoch halten.
  ✔ Maximal zwei Schriftgrössen verwenden.
  - Da die Transfermarkt-API nicht mehr verfügbar ist, wie steht es um die Aktualisierung und Integration zukünftiger Daten?
  (Begründung: Integration von zukünftigen Daten wird im Text erwähnt)
  ✔ Eine Übersichtsgrafik wäre hilfreich zu verstehen, welche Skript wurden für welche Schnittstellen genutzt und welche aufgrund der inaktiven API nicht mehr genutzt werden können.
  ✔ Grundlagedatei: hier die Datei, so wie sie im Repository abgelegt ist benennen.
  - Sowie eine weitere Übersichtsgrafik, welche API, Website welche Informationen liefert und welche in Zukunft ersetzt werden muss, da die API nicht mehr zugänglich ist.
  (Begründung: Diese Informationen sind bereits im Text vorhanden)
  ✔ Bei den Python Scripts 03-05 fehlt das Ziel
  ✔ Datenbankmodell: wie sind die Beziehungen der Tabellen *land* mit den Tabellen *club*, *liga* und *transfer* umgesetzt?
  (Begründung: War schon im Text beschrieben und begründet.)
  ✔ Rechtschreibung prüfen, eher *minimales* als *simples* Design verwenden.
  ✔ Wie wurden die einzelnen Elemente wie OpenLayers konkret in diesem Projekt genutzt, in Ergänzung zur allgemeinen Beschreibung?
  - Bei UI/UX Design die Umsetzung mit einem annotierten Screenshots ergänzen.
- Konzept:
  ✔ Link zur finalen Architektur, sowie Transferhistorie funktioniert nicht.
  - Mockup Bild mit Beschriftung ergänzen zu den einzelnen Mockups
  - Visualisierungsideen: Sätze besser aufeinander abstimmen, vor allem der letzte Satz.
- Erweiterungsmöglichkeiten
  ✔ Text überarbeiten. Sätze z.T. nicht abgeschlossen, Umsetzung Backend sollte auf eine neue Zeile
  - Konsistente Umsetzung Frontend und Backend durchziehen.
  - Grafik mit geplanten und umgesetzten Features ergänzen.
    (Begründung: Enormer Aufwand zum momentanen Projektzeitpunkt)

**Visualisierung und weitere Kommentare**
- Gestaltprinzipien für Layout nutzen - auf der Startseite, sieht die Auswahl im Header oben rechts zufällig platziert aus, ebenso der Titel - funktioniert besser, wenn die Seitenunterteilung auf anderen Seiten anders ist
- konsistentes Farbkonzept - z.B. gelbe Mausover - insbesondere wichtig, wenn durch die Logos viele zusätzliche Farben vorhanden sind, evt. Hintergrundkarte in Graustufen verwenden
- Player Origin - deutlichere Farbabstufungen verwenden, idealerweise auf Datenausdehnung zoomen bei Auswahl
- Navigation links beim aktuellen Stand aufgeklappt lassen - Orientierungshilfe
- UI Design - Aussagen wie 'intuitiv und leicht zugänglich' nur verwenden wenn Tests durchgeführt oder explizit auf relevante Literatur abestützt wurde - ebenso 'logisch'...


