-- SQL-Code zum Erstellen von Datenbank-Sichten (DB-Views)
-- Diese DB-Views sind auch im Database-Dump "footballmap_v4_database-dump.sql" implementiert

-- Sicht mit allen Stadion-Standorten inkl. Metadaten und Club-Informationen
CREATE OR REPLACE VIEW vw_club_all AS
SELECT 
	club.club_nr, 
    club.name,
    club.ort,
    club.logo_link,
    stadium.stadium_name,
    stadium.kapazität,
    liga.name As liga,
	club.land As club_land,
    liga.land As land,
	liga.gewichtung,
	ST_SetSRID(ST_MakePoint(Stadium.lon, Stadium.lat), 4326) AS geom -- PostGIS-Befehl, welcher die Punktgeometrie aus Lon/Lat generiert
From
    club Inner Join
    liga On club.liga_nr = liga.liga_nr Inner Join
    stadium On club.stadium_nr = stadium.stadium_nr;


-- Sicht mit allen Informationen zu den Spielern, verknüpft mit dem dazugehörigen Club
CREATE OR REPLACE VIEW vw_spielerdaten as
Select
    club.name as club,
    club.logo_link,
    club.land as club_land,
    spieler.spieler_nr,
    spieler.name,
    spieler.geburtsdatum,
    spieler.spielerbild_link,
    spieler.geburtsort,
    spieler.geburtsland,
    spieler.nationalität,
    spieler.trikotnummer,
    spieler.körpergrösse,
    spieler.marktwert_aktuell,
    spieler.position,
    spieler.starker_fuss,
    spieler.vertragsende,
    spieler.vereinsbeitritt,
    club.club_nr
From
    club Inner Join
    spieler On spieler.club_nr = club.club_nr;
	
	
-- Sicht mit Anzahl Spieler pro Land (nach Attribut "geburtsland")	
CREATE OR REPLACE VIEW vw_spieler_geburtsland AS 
SELECT
    club.name AS club,
    club.club_nr,
    spieler.geburtsland,
    COUNT(*) AS anzahl_spieler
FROM
    club
INNER JOIN
    spieler ON spieler.club_nr = club.club_nr
GROUP BY
    club.name,
    club.club_nr,
    spieler.geburtsland
order by club;


-- Sicht, welche die Transferlinien erzeugt
-- Linien werden auf das Zentrum des Landes gezogen, wenn der Club unbekannt (club_nr = 999999) ist
-- Linien mit Länge Null werden weggefiltert (wenn innerhalb eines Landes von einem unbekannten zu einem anderen unbekannten Club gewechselt wird)
CREATE OR REPLACE VIEW vw_transferlinien AS 
SELECT
    row_number() OVER () AS id,
    club_von.name AS von_club_name,
    club_nach.name AS nach_club_name,
    spieler.name AS spieler_name,
    transfer.von_club,
    transfer.nach_club,
    transfer.von_land,
    transfer.nach_land,
	transfer.ablösesumme,
	transfer.marktwert,
	transfer.datum,
	transfer.transferart,
    CASE 
        WHEN transfer.von_club != 999999 AND transfer.nach_club != 999999 THEN ST_MakeLine(
            ST_SetSRID(ST_MakePoint(von_stadium.lon, von_stadium.lat), 4326),
            ST_SetSRID(ST_MakePoint(nach_stadium.lon, nach_stadium.lat), 4326)
        )
        WHEN transfer.von_club = 999999 AND transfer.nach_club = 999999 THEN ST_MakeLine(
            ST_SetSRID(von_land.center, 4326),
            ST_SetSRID(nach_land.center, 4326)
        )
        WHEN transfer.von_club = 999999 AND transfer.nach_club != 999999 THEN ST_MakeLine(
            ST_SetSRID(von_land.center, 4326),
            ST_SetSRID(ST_MakePoint(nach_stadium.lon, nach_stadium.lat), 4326)
        )
        WHEN transfer.von_club != 999999 AND transfer.nach_club = 999999 THEN ST_MakeLine(
            ST_SetSRID(ST_MakePoint(von_stadium.lon, von_stadium.lat), 4326),
            ST_SetSRID(nach_land.center, 4326)
        )
    END AS linie
FROM
    transfer
INNER JOIN
    club AS club_von ON transfer.von_club = club_von.club_nr
INNER JOIN
    stadium AS von_stadium ON club_von.stadium_nr = von_stadium.stadium_nr
INNER JOIN
    club AS club_nach ON transfer.nach_club = club_nach.club_nr
INNER JOIN
    stadium AS nach_stadium ON club_nach.stadium_nr = nach_stadium.stadium_nr
INNER JOIN
    spieler ON transfer.spieler_nr = spieler.spieler_nr
LEFT JOIN
    land AS von_land ON transfer.von_land = von_land.name
LEFT JOIN
    land AS nach_land ON transfer.nach_land = nach_land.name
WHERE
    ST_Length(
        CASE
            WHEN transfer.von_club != 999999 AND transfer.nach_club != 999999 THEN ST_MakeLine(
                ST_SetSRID(ST_MakePoint(von_stadium.lon, von_stadium.lat), 4326),
                ST_SetSRID(ST_MakePoint(nach_stadium.lon, nach_stadium.lat), 4326)
            )
            WHEN transfer.von_club = 999999 AND transfer.nach_club = 999999 THEN ST_MakeLine(
                ST_SetSRID(von_land.center, 4326),
                ST_SetSRID(nach_land.center, 4326)
            )
            WHEN transfer.von_club = 999999 AND transfer.nach_club != 999999 THEN ST_MakeLine(
                ST_SetSRID(von_land.center, 4326),
                ST_SetSRID(ST_MakePoint(nach_stadium.lon, nach_stadium.lat), 4326)
            )
            WHEN transfer.von_club != 999999 AND transfer.nach_club = 999999 THEN ST_MakeLine(
                ST_SetSRID(ST_MakePoint(von_stadium.lon, von_stadium.lat), 4326),
                ST_SetSRID(nach_land.center, 4326)
            )
        END
    ) > 0;
