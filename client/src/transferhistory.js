import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import TileLayer from 'ol/layer/Tile.js';
import OSM from 'ol/source/OSM.js';
import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';
import { fromLonLat } from 'ol/proj';
import GeoJSON from 'ol/format/GeoJSON.js';
import Icon from 'ol/style/Icon.js';
import Style from 'ol/style/Style.js';
import Feature from 'ol/Feature.js';
import Point from 'ol/geom/Point.js';
import { useNavigate, useLocation } from 'react-router-dom'; // Importiere useLocation

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

const Transferhistory = () => {
  const [player, setPlayer] = useState();
  const [players, setPlayers] = useState([]);
  const [transferLines, setTransferLines] = useState([]);
  const [clubIcons, setClubIcons] = useState([]);
  const [map, setMap] = useState(null);
  const navigate = useNavigate();
  const location = useLocation(); // Verwende useLocation-Hook, um die URL zu erhalten

  const getPlayerFromUrl = () => {
    const params = new URLSearchParams(location.search); // Verwende location.search
    return params.get('player') || '';
  };

  useEffect(() => {
    const handleUrlChange = () => {
      setPlayer(getPlayerFromUrl());
    };

    window.addEventListener('popstate', handleUrlChange);

    fetchPlayers();

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, []);

  const fetchPlayers = async () => {
    try {
      const response = await axios.get('http://localhost:8080/geoserver/wfs?service=WFS&version=1.1.0&request=GetFeature&typename=vw_spielerdaten&outputFormat=application/json');

      if (response && response.data && response.data.features) {
        const playerData = response.data.features.map(feature => feature.properties.name);
        setPlayers(playerData);
        const playerFromUrl = getPlayerFromUrl();
        setPlayer(playerFromUrl || playerData[0]);
      } else {
        console.error('No player data found in the response:', response);
      }
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  };

  const handleChange = (event) => {
    setPlayer(event.target.value);
  };

  const fetchTransferLines = async () => {
    try {
      const response = await axios.get('http://localhost:8080/geoserver/wfs?service=WFS&version=1.1.0&request=GetFeature&typename=vw_transferlinien&outputFormat=application/json');

      if (response && response.data && response.data.features) {
        const transferLinesData = response.data.features.map(feature => ({
          id: feature.properties.id,
          vonClubName: feature.properties.von_club_name,
          nachClubName: feature.properties.nach_club_name,
          spielerName: feature.properties.spieler_name,
          vonClub: feature.properties.von_club,
          nachClub: feature.properties.nach_club,
          linie: feature.geometry
        }));
        setTransferLines(transferLinesData);
      } else {
        console.error('No transfer lines data found in the response:', response);
      }
    } catch (error) {
      console.error('Error fetching transfer lines:', error);
    }
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
        features: [
          ...transferLines.map(transferLine => {
            const geojsonFormat = new GeoJSON();
            return geojsonFormat.readFeature(transferLine.linie);
          }),
          ...clubIcons
        ]
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
    fetchTransferLines();
    fetchClubIcons();
  }, []);

  useEffect(() => {
    if (transferLines.length > 0 && clubIcons.length > 0) {
      initializeMap();
    }
  }, [transferLines, clubIcons]);

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
                        {/* Hier kannst du das Bild des Spielers einfügen, falls verfügbar */}
                        { /* <img src={player.image} alt={player} style={{ width: '20px', height: '20px', marginRight: '5px' }} /> */ }
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
