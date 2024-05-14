# GDI Projekt - Footballmap
<a id="top"></a>

Das ist die Projekt Website des *GDI Projekts*. Das GDI enthält eine Server und eine Client Umgebung.
- Server: FastAPI
- Client: React + OpenLayers

GitHub Repository: [https://github.com/314a/GDI_Project](https://github.com/314a/GDI_Project)

![GDI Projekt Screenshot](Bilder/Startpage1.png)

#### Projektteam

- [Nando Amport](https://github.com/naamp)
- [Stefan Sidler](https://github.com/StefanSidler95)
- [Silvan Baumeler](https://github.com/SilvanBaumeler)

# Inhaltsverzeichnis
- [GDI Projekt - Footballmap](#gdi-projekt---footballmap)
      - [Projektteam](#projektteam)
- [Inhaltsverzeichnis](#inhaltsverzeichnis)
- [Einleitung](#einleitung)
- [Erklärung der Funktionen von Football Map](#erklärung-der-funktionen-von-football-map)
  - [Startpage](#startpage)
    - [Funktionen:](#funktionen)
  - [Squad Overview](#squad-overview)
    - [Funktionen:](#funktionen-1)
  - [Transfer History](#transfer-history)
    - [Funktionen:](#funktionen-2)
- [Aufbau Geodateninfrastruktur (GDI)](#aufbau-geodateninfrastruktur-gdi)
  - [Backend](#backend)
    - [Grundlagedaten](#grundlagedaten)
      - [Datenabfrage über API-Schnittstelle](#datenabfrage-über-api-schnittstelle)
      - [Web-Scraping Squad Overview](#web-scraping-squad-overview)
      - [Web-Scraping Transfer History](#web-scraping-transfer-history)
      - [Web-Scraping aktuelle Liga Tabelle](#web-scraping-aktuelle-liga-tabelle)
    - [Datenbank und Datenbankschema](#datenbank-und-datenbankschema)
    - [Geoserver](#geoserver)
  - [Frontend](#frontend)
    - [UI Design](#ui-design)
    - [UX Design](#ux-design)
- [Ursprüngliches Konzept](#ursprüngliches-konzept)
    - [Aufbau Geodateninfrastruktur (GDI)](#aufbau-geodateninfrastruktur-gdi-1)
    - [Mockup](#mockup)
    - [Visualisierungsideen](#visualisierungsideen)
    - [User Persona](#user-persona)
- [Ausblick und Erweiterungsmöglichkeiten](#ausblick-und-erweiterungsmöglichkeiten)

360 Spieler

[Zurück nach oben](#top)