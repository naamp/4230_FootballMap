import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import TileLayer from 'ol/layer/Tile.js';
import OSM from 'ol/source/OSM.js';
import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';
import { fromLonLat } from 'ol/proj';
import Icon from 'ol/style/Icon.js';
import Feature from 'ol/Feature.js';
import Point from 'ol/geom/Point.js';
import { useNavigate, useLocation } from 'react-router-dom'; 

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import HomeIcon from '@mui/icons-material/Home';

import './transferhistory.css';
import appbarstyle from './appbarstyle.js';

import Style from 'ol/style/Style.js';


const Transferhistory = () => {
  const [player, setPlayer] = useState('');
  const [players, setPlayers] = useState([]);
  const [clubIcons, setClubIcons] = useState([]);
  const [map, setMap] = useState(null);
  const navigate = useNavigate();
  const location = useLocation(); 

  const getParameterByName = (name, url) => {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
          results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  };

  useEffect(() => {
    const club = getParameterByName('club');
    const playerFromUrl = getParameterByName('player');

    if (club) {
      fetchPlayers(club);
    } else {
      console.error('No club provided in URL');
    }

    if (playerFromUrl) {
      setPlayer(playerFromUrl);
    }

    fetchClubIcons();

  }, []);

  useEffect(() => {
    if (players.length > 0) {
      const sortedPlayers = [...players].sort((a, b) => a.localeCompare(b));
      setPlayers(sortedPlayers);
    }
  }, [players]);

  const fetchPlayers = async (club) => {
    try {
      const response = await axios.get(`http://localhost:8080/geoserver/wfs?service=WFS&version=1.1.0&request=GetFeature&typename=vw_spielerdaten&outputFormat=application/json&cql_filter=club='${club}'`);

      if (response && response.data && response.data.features) {
        const playerData = response.data.features.map(feature => feature.properties.name);
        setPlayers(playerData);
      } else {
        console.error('No player data found for club:', club);
      }
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  };

  const handleChange = (event) => {
    const selectedPlayer = event.target.value;
    setPlayer(selectedPlayer);
    const urlSearchParams = new URLSearchParams(location.search);
    urlSearchParams.set('player', selectedPlayer);
    navigate(`${location.pathname}?club=${encodeURIComponent(getParameterByName('club'))}&${urlSearchParams.toString()}`);
  };
  
  const fetchClubIcons = async () => {
    try {
      const response = await axios.get('http://localhost:8080/geoserver/wfs?service=WFS&version=1.1.0&request=GetFeature&typename=vw_club_all&outputFormat=application/json');

      if (response && response.data && response.data.features) {
        const clubIconFeatures = response.data.features.map(feature => {
          const coordinates = feature.geometry.coordinates;
          const iconFeature = new Feature({
            geometry: new Point(fromLonLat([coordinates[0], coordinates[1]]))
          });
          iconFeature.setStyle(new Style({
            image: new Icon({
              src: feature.properties.logo_link,
              scale: 0.3
            })
          }));
          return iconFeature;
        });
        setClubIcons(clubIconFeatures);
      } else {
        console.error('No club icon data found in the response:', response);
      }
    } catch (error) {
      console.error('Error fetching club icons:', error);
    }
  };

  const initializeMap = () => {
    const vectorLayer = new VectorLayer({
      source: new VectorSource({
        features: clubIcons
      })
    });
  
    const newMap = new Map({
      layers: [
        new TileLayer({
          source: new OSM()
        }),
        vectorLayer
      ],
      view: new View({
        center: fromLonLat([8.1, 46.9]),
        zoom: 8
      }),
      target: 'map'
    });
  
    setMap(newMap);
  };
  
  useEffect(() => {
    if (clubIcons.length > 0) {
      initializeMap();
    }
  }, [clubIcons]);

  return (
    <div>
      <AppBar position="static" style={appbarstyle.appBar}>
        <Toolbar className="Toolbar" style={{ justifyContent: 'space-between' }}>
          <Button
            style={appbarstyle.button}
            startIcon={<HomeIcon style={{ color: '#f7da00' }} />}
            onClick={() => {
              navigate("/");
            }}
          >
            FootballMap
          </Button>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div>
              <FormControl sx={{ m: 1, minWidth: 120 }}>
                <InputLabel id="player-label" style={{ color: '#f7da00' }}>Player</InputLabel>
                <Select
                  labelId="player-label"
                  id="player-select"
                  value={player}
                  onChange={handleChange}
                  style={{ color: 'white' }}
                >
                  {players.map(player => (
                    <MenuItem key={player} value={player}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {player}
                      </div>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
            <div className="Title" style={appbarstyle.title}>
              Transfer History
            </div>
          </div>
        </Toolbar>
      </AppBar>
      <div id="map" className="map_transferhistory"></div>
    </div>
  );
};

export default Transferhistory;