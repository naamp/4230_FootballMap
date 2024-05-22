-- Datenbank "footballmap" Version 4 (final version) (14.05.2024)
-- Datenbankschema ohne Daten und ohne DB-Views
-- Diese Tabellen sind auch im Database-Dump "footballmap_v4_database-dump.sql" implementiert


-- postgis aktivieren
CREATE EXTENSION postgis;


-- Tabellen erstellen
-- Land Tabelle 
-- Bemerkung: Tabelle provisorisch, ohne Beziehung zu anderen Tabellen!
CREATE TABLE land (
    land_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    geom GEOMETRY(MULTIPOLYGON), 
    center GEOMETRY(POINT), 
    flagge BYTEA,					-- BLOB
	flagge_link VARCHAR(255),		-- Internet-Link (gemäss json)
	flagge_pfad VARCHAR(255),		-- Pfad auf Server / PC
	ländercode VARCHAR(10)			-- ISO 3166-Ländercode
);


-- Stadium Tabelle
CREATE TABLE stadium (
    stadium_id SERIAL PRIMARY KEY,
	stadium_nr INTEGER NOT NULL UNIQUE,		-- Nummer gemäss json (1001, ...)
    stadium_name VARCHAR(100),
    kapazität INTEGER,
    lon FLOAT,
    lat FLOAT
);

-- Liga Tabelle
CREATE TABLE liga (
    liga_id SERIAL PRIMARY KEY,
	liga_nr VARCHAR(10) NOT NULL UNIQUE,	-- Nummer gemäss json (GB1, ...)
    name VARCHAR(100) NOT NULL,
	land VARCHAR(100),
	gewichtung INTEGER						-- Zum Sortieren der Ligen (1 = oberste Liga)
);

-- Club Tabelle
CREATE TABLE club (
    club_id SERIAL PRIMARY KEY,
	club_nr INTEGER NOT NULL UNIQUE,	-- Nummer gemäss json (1, ...)
    name VARCHAR(100) NOT NULL,
    official_name VARCHAR(100),
    logo BYTEA,							-- BLOB
	logo_link VARCHAR(255),				-- Internet-Link (gemäss json)
	logo_pfad VARCHAR(255),				-- Pfad auf Server / PC
    ort VARCHAR(100),
    land VARCHAR(100),
    stadium_nr INTEGER REFERENCES Stadium(stadium_nr),
    liga_nr VARCHAR(10) REFERENCES Liga(liga_nr)
);

-- Spieler Tabelle
CREATE TABLE spieler (
    spieler_id SERIAL PRIMARY KEY,
	spieler_nr INTEGER NOT NULL UNIQUE,	-- Nummer gemäss json (???, ...)
    name VARCHAR(100) NOT NULL,
    geburtsdatum DATE,
    spielerbild BYTEA,					-- BLOB
	spielerbild_link VARCHAR(255),		-- Internet-Link (gemäss json)
	spielerbild_pfad VARCHAR(255),		-- Pfad auf Server / PC
    geburtsort VARCHAR(100),
    geburtsland VARCHAR(100),
	nationalität VARCHAR(100),
    trikotnummer INTEGER,
    körpergrösse DECIMAL,
    marktwert_aktuell DECIMAL,
    position VARCHAR(50),
    starker_fuss VARCHAR(10),
    vertragsende DATE,
    vereinsbeitritt DATE,
    club_nr INTEGER REFERENCES Club(club_nr)
);

-- Transfer Tabelle
CREATE TABLE transfer (
    transfer_id SERIAL PRIMARY KEY,
    von_club INTEGER REFERENCES Club(club_nr),
    nach_club INTEGER REFERENCES Club(club_nr),
    spieler_nr INTEGER REFERENCES Spieler(spieler_nr),
    ablösesumme DECIMAL,
    marktwert DECIMAL,
    datum DATE,
    transferart VARCHAR(50),
	von_land VARCHAR(100),
	nach_land VARCHAR(100)
);

-- Beziehungen definieren
-- Eine Liga enthält mehrere Clubs
ALTER TABLE Club ADD CONSTRAINT fk_liga FOREIGN KEY (liga_nr) REFERENCES Liga(liga_nr);

-- Ein Club hat genau eine Liga
-- Ein Club hat ein Stadium
-- Ein Stadium hat beliebig viele Clubs
ALTER TABLE Club ADD CONSTRAINT fk_stadium FOREIGN KEY (stadium_nr) REFERENCES Stadium(stadium_nr);

-- Ein Club hat beliebig viele Transfers (immer von und zu Club)
ALTER TABLE Transfer ADD CONSTRAINT fk_von_club FOREIGN KEY (von_club) REFERENCES Club(club_nr);
ALTER TABLE Transfer ADD CONSTRAINT fk_nach_club FOREIGN KEY (nach_club) REFERENCES Club(club_nr);

-- Ein Transfer hat jeweils einen Club (von und zu club)
-- Ein Transfer hat genau einen Spieler
ALTER TABLE Transfer ADD CONSTRAINT fk_spieler FOREIGN KEY (spieler_nr) REFERENCES Spieler(spieler_nr);

-- Ein Spieler hat beliebig viele Transfers
-- Ein Spieler hat einen oder keinen Club
ALTER TABLE Spieler ADD CONSTRAINT fk_club FOREIGN KEY (club_nr) REFERENCES Club(club_nr);
