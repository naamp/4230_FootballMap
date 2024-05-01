//ToDo: Club Icons, Reihenfolge, zoom (BBBox)

import React, { useState, useEffect } from 'react'; 
import axios from 'axios';
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import TileLayer from 'ol/layer/Tile.js';
import OSM from 'ol/source/OSM.js';
import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';
import { fromLonLat } from 'ol/proj';
import Feature from 'ol/Feature.js';
import Style from 'ol/style/Style.js';
import Icon from 'ol/style/Icon.js';
import Point from 'ol/geom/Point.js';
import { useNavigate, useLocation } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import HomeIcon from '@mui/icons-material/Home';
import './transferhistory.css';
import appbarstyle from './appbarstyle.js';
import LineString from 'ol/geom/LineString.js';
import Stroke from 'ol/style/Stroke.js';
import CircleStyle from 'ol/style/Circle.js';
import Fill from 'ol/style/Fill.js';

const Transferhistory = () => {
  const [clubIcons, setClubIcons] = useState([]);
  const [transferLines, setTransferLines] = useState([]);
  const [countryCenters, setCountryCenters] = useState([]);
  const [map, setMap] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const playerName = new URLSearchParams(location.search).get('player');

  useEffect(() => {
    fetchClubLocations();
    fetchTransferLines();
    fetchCountryCenters();
  }, []);

  const fetchClubLocations = async () => {
    try {
      const response = await axios.get('http://localhost:8080/geoserver/wfs?service=WFS&version=1.1.0&request=GetFeature&typename=vw_club_all&outputFormat=application/json');

      if (response && response.data && response.data.features) {
        const clubLocations = response.data.features.map(feature => {
          const coordinates = feature.geometry.coordinates;
          return new Feature({
            geometry: new Point(fromLonLat([coordinates[0], coordinates[1]]))
          });
        });
        setClubIcons(clubLocations);
      } else {
        console.error('No club location data found in the response:', response);
      }
    } catch (error) {
      console.error('Error fetching club locations:', error);
    }
  };

  const fetchTransferLines = async () => {
    try {
      const response = await axios.get('http://localhost:8080/geoserver/wfs?service=WFS&version=1.1.0&request=GetFeature&typename=vw_transferlinien&outputFormat=application/json');

      if (response && response.data && response.data.features) {
        const transferLineFeatures = response.data.features.map(async feature => {
          const playerInLine = feature.properties.spieler_name;
          if (playerInLine === playerName) {
            const fromClub = feature.properties.von_club;
            const toClub = feature.properties.nach_club;
            const fromLand = feature.properties.von_land;
            const toLand = feature.properties.nach_land;
            const fromClubName = feature.properties.von_club_name;
            const toClubName = feature.properties.nach_club_name;
  
            // Find the corresponding country center for from_land and to_land
            const [fromCenter, toCenter] = await Promise.all([
              findCountryCenter(fromLand),
              findCountryCenter(toLand)
            ]);
  
            // Check if fromClub or toClub is unknown
            if (fromClub === 999999 || toClub === 999999) {
              // Find the corresponding country center
              const startPoint = fromClub === 999999 ? fromCenter : clubIcons.find(icon => icon.get('name') === fromClub);
              const endPoint = toClub === 999999 ? toCenter : clubIcons.find(icon => icon.get('name') === toClub);
    
              // If startPoint or endPoint is not found, skip this line
              if (!startPoint || !endPoint) return null;
    
              return new Feature({
                geometry: new LineString([startPoint.getGeometry().getCoordinates(), endPoint.getGeometry().getCoordinates()]),
                name: feature.properties.name,
                id: feature.properties.id
              });
            } else {
              // No unknown clubs, proceed with regular transfer line
              return new Feature({
                geometry: new LineString(feature.geometry.coordinates.map(coord => fromLonLat(coord))),
                name: feature.properties.name,
                id: feature.properties.id
              });
            }
          } else {
            return null;
          }
        });

        // Wait for all async operations to complete
        const resolvedTransferLineFeatures = await Promise.all(transferLineFeatures);
  
        // Filter out null values
        const filteredTransferLineFeatures = resolvedTransferLineFeatures.filter(line => line !== null);
  
        setTransferLines(filteredTransferLineFeatures);
      } else {
        console.error('No transfer line data found in the response:', response);
      }
    } catch (error) {
      console.error('Error fetching transfer lines:', error);
    }
  };
  
  const findCountryCenter = async (countryName) => {
    try {
      const response = await axios.get(`http://localhost:8080/geoserver/wfs?service=WFS&version=1.1.0&request=GetFeature&typename=land&outputFormat=application/json&cql_filter=name='${countryName}'`);
  
      if (response && response.data && response.data.features && response.data.features.length > 0) {
        const centerCoordinates = response.data.features[0].properties.center.coordinates;
        return new Feature({
          geometry: new Point(fromLonLat(centerCoordinates))
        });
      } else {
        console.error(`No country center found for country: ${countryName}`);
        return null;
      }
    } catch (error) {
      console.error('Error fetching country center:', error);
      return null;
    }
  };
  
  const fetchCountryCenters = async () => {
    try {
      const response = await axios.get('http://localhost:8080/geoserver/wfs?service=WFS&version=1.1.0&request=GetFeature&typename=footballmap:land&outputFormat=application/json');

      if (response && response.data && response.data.features) {
        const countryCenterFeatures = response.data.features.map(feature => {
          const centerCoordinates = feature.properties.center.coordinates;
          const countryCenterFeature = new Feature({
            geometry: new Point(fromLonLat(centerCoordinates))
          });
          return countryCenterFeature;
        });
        setCountryCenters(countryCenterFeatures);
      } else {
        console.error('No country center data found in the response:', response);
      }
    } catch (error) {
      console.error('Error fetching country centers:', error);
    }
  };

  const initializeMap = () => {
    const vectorLayer = new VectorLayer({
      source: new VectorSource({
        features: clubIcons.concat(transferLines).concat(countryCenters)
      }),
      style: function (feature) {
        if (feature.getGeometry().getType() === 'LineString') {
          return new Style({
            stroke: new Stroke({
              color: 'blue',
              width: 3
            })
          });
        } else if (feature.getGeometry().getType() === 'Point') {
          // Überprüfen, ob es sich um ein Club-Icon oder ein Länderzentrum handelt
          if (clubIcons.includes(feature)) {
            // Darstellung als kleiner roter Punkt für Club-Icons
            return new Style({
              image: new CircleStyle({
                radius: 2,
                fill: new Fill({
                  color: 'red'
                }),
                stroke: null // Kein Rand
              })
            });
          } else {
            // Darstellung als kleiner blauer Punkt für Länderzentren
            return new Style({
              image: new CircleStyle({
                radius: 5,
                fill: new Fill({
                  color: 'blue'
                }),
                stroke: null // Kein Rand
              })
            });
          }
        } else {
          return feature.getStyle();
        }
      }
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
    if (clubIcons.length > 0 && transferLines.length > 0 && countryCenters.length > 0) {
      initializeMap();
    }
  }, [clubIcons, transferLines, countryCenters]);

  const handleBackButtonClick = () => {
    const clubParam = new URLSearchParams(location.search).get('club');
    navigate(`/squadoverview?club=${clubParam}`);
  };

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
          <div className="Title" style={appbarstyle.title}>
            Transfer History
          </div>
        </Toolbar>
      </AppBar>
      <div id="map" className="map_transferhistory"></div>
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <Button variant="contained" color="primary" onClick={handleBackButtonClick}>
          Back to Squad Overview
        </Button>
      </div>
    </div>
  );
};

export default Transferhistory;
