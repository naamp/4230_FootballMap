# Einleitung
<a id="top"></a>
Im Vertiefungsmodul 4230 „Geoinformatik & Raumanalyse I“ des Bachelorstudiengangs Geomatik an der Fachhochschule Nordwestschweiz (FHNW) wurde eine Geodateninfrastruktur entwickelt. Das Thema konnte frei gewählt werden, musste jedoch räumlich-zeitliche Inhalte umfassen.

Diese GitHub-Page widmet sich der Geodateninfrastruktur „Football Map“. Fussball ist enorm populär und generiert eine riesige Datenmenge. Allein die Deutsche Bundesliga erfasst laut DFL Deutsche Fussball Liga GmbH 2024 pro Spiel 3,6 Millionen Positionsdatenpunkte. Obwohl zahlreiche Portale und Applikationen diese Daten in Echtzeit in Tabellen und Spielberichten präsentieren, gibt es kaum Webseiten oder Applikationen, die diese geografischen Daten nutzen und sie räumlich visualisiert.

Deshalb konzentriert sich die Football Map auf geografische Daten in einem Bereich, für den es bisher keine vergleichbaren Anwendungen öffentlicher Fussballdaten gibt. Die Football Map ist ein Analyseplattform, welche speziell für Fussballfans entwickelt wurde. Diese dynamische thematische Karte ermöglicht es Ihnen, Fussballvereine aus den Top-Ligen Europas zu entdecken. Mit der Football Map können Sie:

- **Geografische Betrachtung aller Clubs:**Betrachte die Fussballvereine auf einer Weltkarte und entdecke Clubs die dir noch unbekannt sind.
- **Vereinsdetails erkunden:** Blenden Sie das Spielerkader eines jeden Vereins ein und erhalten Sie Zugriff auf spannende Informationen.
- **Transferhistorien analysieren:** Betrachten Sie die Transferhistorie einzelner Spieler auf der Weltkarte, um ihre Karrierewege zu verfolgen.
- **Mannschaftsherkunft interpretieren:** Nutzen Sie thematische Karten, um die geografische Zusammensetzung und Herkunft der Mannschaften zu verstehen.

Die Football Map unterstützt derzeit die Funktionen Squad Overview, Player Origin und Transfer History ausschliesslich für die Schweizer Super League, da die zugrundeliegende Datenbank momentan nur Spielerdaten aus der Schweiz enthält. Die Datenbankstruktur ist jedoch so aufgebaut, dass sie problemlos mit Daten aus allen Ländern erweitert werden kann.

In den Nachfolgenden Kapiteln werden alle Funktionen, das verwendete Konzept, die Architektur, das Backend/Frontend und die verwendeten Methoden der Football Map vorgestellt.


[↑](#top)