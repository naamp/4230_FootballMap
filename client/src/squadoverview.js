import React, { useState, useEffect } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import HomeIcon from '@mui/icons-material/Home';

import axios from 'axios';
import Map from 'ol/Map';
import View from 'ol/View.js';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Icon, Style } from 'ol/style';
import { fromLonLat } from 'ol/proj';

import './squadoverview.css';
import appbarstyle from './appbarstyle.js';

import { useNavigate, useParams } from 'react-router-dom';

const Squadoverview = ({ countries, country, league, availableLeagues, setCountry, setLeague }) => {
  const [clubs, setClubs] = useState([]);
  const [players, setPlayers] = useState([]);
  const [countryFlags, setCountryFlags] = useState({});
  const navigate = useNavigate();
  const [map, setMap] = useState(null);
  const [vectorSource, setVectorSource] = useState(null);
  const [newIconMap, setNewIconMap] = useState({});
  const { club: selectedClubParam } = useParams();
  const [selectedClub, setSelectedClub] = useState(selectedClubParam || '');

  useEffect(() => {
    fetchClubs();
    fetchCountryFlags();
    fetchPlayers();
  }, [selectedClub]);

  useEffect(() => {
    const getSelectedClubFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      return params.get('club') || '';
    };

    setSelectedClub(getSelectedClubFromUrl());

    const handleUrlChange = () => {
      setSelectedClub(getSelectedClubFromUrl());
    };

    window.addEventListener('popstate', handleUrlChange);

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, []);

  useEffect(() => {
    if (!map) {
      initializeMap();
    } else {
      addClubIcon();
    }
  }, [map, clubs, selectedClub]);


  const handleChange = (event) => {
    const newClub = event.target.value;
    setSelectedClub(newClub);
    navigate(`/squadoverview?club=${encodeURIComponent(newClub)}`);
  };

  const fetchClubs = async () => {
    try {
      const response = await axios.get('http://localhost:8080/geoserver/wfs?service=WFS&version=1.1.0&request=GetFeature&typename=vw_club_all&outputFormat=application/json');

      if (response && response.data && response.data.features) {
        const clubsData = response.data.features
            .filter(feature => feature.properties.liga === 'Super League' && feature.properties.land === 'Switzerland')
            .map(feature => ({
                name: feature.properties.name,
                logoLink: feature.properties.logo_link,
                longitude: parseFloat(feature.geometry.coordinates[0]),
                latitude: parseFloat(feature.geometry.coordinates[1])
            }))
            .sort((a, b) => a.name.localeCompare(b.name)); // Alphabetische Sortierung hinzugefügt
        setClubs(clubsData);
      } else {
        console.error('No clubs data found in the response:', response);
      }
    } catch (error) {
      console.error('Error fetching clubs:', error);
    }
  };

  const handleHomeButtonClick = () => {
    navigate("/");
  };
  

  const initializeMap = () => {
    const newVectorSource = new VectorSource();
    setVectorSource(newVectorSource);

    const osmLayer = new TileLayer({
      source: new OSM()
    });

    const newMap = new Map({
      layers: [
        osmLayer,
        new VectorLayer({
          source: newVectorSource,
          style: function(feature) {
            let icon;
            if (newIconMap[feature.getId()]) {
              icon = newIconMap[feature.getId()]
            } else {
              icon = new Icon({
                src: feature.get('logoLink'),
                scale: 0.3
              });
              newIconMap[feature.getId()] = icon;
            }
            return new Style({image: icon});
          }
        })
      ],
      view: new View({
        center: fromLonLat([8.1, 46.9]),
        zoom: 8
      })
    });

    setMap(newMap);
    newMap.setTarget('map');
  };

  const addClubIcon = () => {
    if (!vectorSource || !selectedClub) return;

    const selectedClubData = clubs.find(club => club.name === selectedClub);
    if (!selectedClubData) return;

    const iconFeature = new Feature({
      geometry: new Point(fromLonLat([selectedClubData.longitude, selectedClubData.latitude])),
    });

    const iconStyle = new Style({
      image: new Icon({
        src: selectedClubData.logoLink,
        scale: 0.3
      })
    });

    iconFeature.setStyle(iconStyle);
    vectorSource.clear();
    vectorSource.addFeature(iconFeature);

    const iconExtent = iconFeature.getGeometry().getExtent();
    map.getView().fit(iconExtent, { duration: 1, maxZoom: 16 });
  };

  const fetchPlayers = async () => {
    try {
      const response = await axios.get('http://localhost:8080/geoserver/wfs?service=WFS&version=1.1.0&request=GetFeature&typename=vw_spielerdaten&outputFormat=application/json');

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
          club: feature.properties.club,
          age: calculateAge(new Date(feature.properties.geburtsdatum)),
          marketvalueFormatted: `€${formatNumber(feature.properties.marktwert_aktuell)}`
        })).filter(player => player.club === selectedClub);

        playersData.sort((a, b) => {
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

          if (positions[a.position] !== positions[b.position]) {
            return positions[a.position] - positions[b.position];
          }

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

  const fetchCountryFlags = async () => {
    try {
      const response = await axios.get('http://localhost:8080/geoserver/wfs?service=WFS&version=1.1.0&request=GetFeature&typename=land&outputFormat=application/json');

      if (response && response.data && response.data.features) {
        const countryFlagsData = response.data.features.reduce((acc, feature) => {
          acc[feature.properties.name] = feature.properties.flagge_link;
          return acc;
        }, {});
        setCountryFlags(countryFlagsData);
      } else {
        console.error('No country flags data found in the response:', response);
      }
    } catch (error) {
      console.error('Error fetching country flags:', error);
    }
  };

  const calculateAge = (birthDate) => {
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const month = today.getMonth() - birthDate.getMonth();
    if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1;
    }
    return age;
  };

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
                    <MenuItem key={club.name} value={club.name}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <img src={club.logoLink} alt={club.name} style={{ width: '20px', height: '20px', marginRight: '5px' }} />
                        {club.name}
                      </div>
                    </MenuItem>
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
                  <td>
                    <img src={countryFlags[player.birthcountry]} alt={player.birthcountry} style={{ width: '30px', height: '20px' }} />
                  </td>
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
