import React, { useState, useEffect } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import HomeIcon from '@mui/icons-material/Home';
import { useNavigate } from "react-router-dom";
import axios from 'axios'; // Importiere Axios für HTTP-Anfragen

import './squadoverview.css';
import appbarstyle from './appbarstyle.js';
import Map from 'ol/Map';
import View from 'ol/View.js';
import TileLayer from 'ol/layer/Tile'; // Importiere TileLayer aus 'ol/layer/Tile'
import OSM from 'ol/source/OSM'; // Importiere OSM aus 'ol/source/OSM'

const Squadoverview = ({ countries, country, league, availableLeagues, setCountry, setLeague }) => {
  const [clubs, setClubs] = useState([]);
  const [selectedClub, setSelectedClub] = useState('');
  const [players, setPlayers] = useState([]); // Zustand für Spielerdaten
  const navigate = useNavigate();

  useEffect(() => {
    fetchClubs(); // Beim ersten Rendern die Clubs abrufen
    initializeMap(); // Beim Laden der Komponente die Karte initialisieren
  }, []);

  useEffect(() => {
    fetchPlayers(); // Beim Ändern des ausgewählten Clubs Spieler abrufen
  }, [selectedClub]);

  const fetchClubs = async () => {
    try {
      // Führe eine HTTP-Anfrage zum Geoserver durch, um die Clubs abzurufen
      const response = await axios.get('http://localhost:8080/geoserver/wfs?service=WFS&version=1.1.0&request=GetFeature&typename=vw_club_all&outputFormat=application/json');

      // Überprüfe die Antwort und extrahiere die Clubs, falls vorhanden
      if (response && response.data && response.data.features) {
        const clubsData = response.data.features
          .filter(feature => feature.properties.liga === 'Super League' && feature.properties.land === 'Switzerland') // Filtere Clubs für Super League und Schweiz
          .map(feature => feature.properties.name)
          .sort(); // Sortiere Clubs alphabetisch
        setClubs(clubsData);
      } else {
        console.error('No clubs data found in the response:', response);
      }
    } catch (error) {
      console.error('Error fetching clubs:', error);
    }
  };

  const handleChange = (event) => {
    setSelectedClub(event.target.value);
  };

  const handleHomeButtonClick = () => {
    navigate("/");
  };

  const initializeMap = () => {
    // Karteninitialisierung
    const osmLayer = new TileLayer({
      source: new OSM()
    });

    const map = new Map({
      layers: [osmLayer],
      target: 'map', // Ziel-DOM-Element für die Karte
      view: new View({
        center: [0, 0],
        zoom: 2
      })
    });
  };

  const fetchPlayers = async () => {
    try {
      // Spielerdaten vom GeoServer abrufen
      const response = await axios.get('http://localhost:8080/geoserver/wfs?service=WFS&version=1.1.0&request=GetFeature&typename=vw_spielerdaten&outputFormat=application/json');
  
      // Überprüfe die Antwort und extrahiere die Spielerdaten, falls vorhanden
      if (response && response.data && response.data.features) {
        const playersData = response.data.features.map(feature => ({
          name: feature.properties.name,
          position: feature.properties.position,
          playerimage: feature.properties.spielerbild_link,
          birthdate: feature.properties.geburtsdatum,
          height: feature.properties.körpergrösse,
          marketvalue: feature.properties.marktwert_aktuell,
          birthplace: feature.properties.geburtsort,
          birthcountry: feature.properties.geburtsland,
          nationality: feature.properties.nationalität,
          jerseyNumber: feature.properties.trikotnummer,
          foot: feature.properties.starker_fuss,
          club: feature.properties.club, // Hinzufügen des Club-Attributs
          age: calculateAge(new Date(feature.properties.geburtsdatum)), // Berechne das Alter
          // Hinzufügen der Marktwertrubrik mit Euro und Tausender-Trennstrichen formatiert
          marketvalueFormatted: `€${formatNumber(feature.properties.marktwert_aktuell)}`
        })).filter(player => player.club === selectedClub); // Filtern nach dem ausgewählten Club
  
        // Sortieren nach Position und dann nach Trikotnummer
        playersData.sort((a, b) => {
          // Positionen nach Priorität
          const positions = {
            'Goalkeeper': 1,
            'Centre-Back': 2,
            'Left-Back': 3,
            'Right-Back': 4,
            'Central Midfield': 5,
            'Left Midfield': 6,
            'Right Midfield': 7,
            'Attacking Midfield': 8,
            'Left Winger': 9,
            'Right Winger': 10,
            'Striker': 11
          };
  
          // Sortieren nach Position
          if (positions[a.position] !== positions[b.position]) {
            return positions[a.position] - positions[b.position];
          }
  
          // Wenn die Positionen gleich sind, nach Trikotnummer sortieren
          return a.jerseyNumber - b.jerseyNumber;
        });
  
        setPlayers(playersData);
      } else {
        console.error('No player data found in the response:', response);
      }
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  };
  

  // Funktion zur Berechnung des Alters aus dem Geburtsdatum
  const calculateAge = (birthDate) => {
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const month = today.getMonth() - birthDate.getMonth();
    if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1;
    }
    return age;
  };

  // Funktion zur Formatierung der Marktwertrubrik
  const formatNumber = (value) => {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <div>
      <AppBar position="static" style={appbarstyle.appBar}>
        <Toolbar className="Toolbar" style={{ justifyContent: 'space-between' }}>
          <Button
            style={appbarstyle.button}
            startIcon={<HomeIcon style={{ color: '#f7da00' }} />}
            onClick={handleHomeButtonClick}
          >
            FootballMap
          </Button>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div>
              <FormControl sx={{ m: 1, minWidth: 120 }}>
                <InputLabel id="club-label" style={{ color: '#f7da00' }}>Club</InputLabel>
                <Select
                  labelId="club-label"
                  id="club-select"
                  value={selectedClub}
                  onChange={handleChange}
                  style={{ color: 'white' }}
                >
                  {clubs.map(club => (
                    <MenuItem key={club} value={club}>{club}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
            <div className="Title" style={appbarstyle.title}>
              Squad Overview
            </div>
          </div>
        </Toolbar>
      </AppBar>
      {/* Hier wird die Karte angezeigt */}
      <div id="map" className="map_squadoverview"></div>
      <div className="squadoverview-container">
        <div className="player-table">
          <h2>Player Information</h2>
          <table>
            <thead>
              <tr>
                <th></th>
                <th>Nr</th>
                <th>Name</th>
                <th>Position</th>
                <th>Foot</th>
                <th>Height</th>
                <th>Marketvalue</th>
                <th>Age</th>
                <th>Nationality</th>
              </tr>
            </thead>
            <tbody>
            {players.map((player, index) => (
              <tr key={index}>
                <td>
                  <img src={player.playerimage} alt={player.name} style={{ width: '50px', height: '50px' }} />
                </td>
                <td>{player.jerseyNumber}</td>
                <td>{player.name}</td>
                <td>{player.position}</td>
                <td>{player.foot}</td>
                <td>{player.height}</td>
                <td>{player.marketvalueFormatted}</td>
                <td>{player.age}</td>
                <td>{player.nationality}</td>
              </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Squadoverview;
