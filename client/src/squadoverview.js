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

const Squadoverview = ({ countries, country, league, availableLeagues, setCountry, setLeague }) => {
  const [clubs, setClubs] = useState([]);
  const [selectedClub, setSelectedClub] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchClubs(); // Beim ersten Rendern die Clubs abrufen
  }, []);

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
      <div id="map" className="map-container"></div>
    </div>
  );
};

export default Squadoverview;
