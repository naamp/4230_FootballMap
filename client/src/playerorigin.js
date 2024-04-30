import React, { useEffect, useState } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import { fromLonLat } from 'ol/proj';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { bbox as bboxStrategy } from 'ol/loadingstrategy';
import VectorLayer from 'ol/layer/Vector';
import { Stroke, Style, Fill } from 'ol/style';
import Overlay from 'ol/Overlay';
import './playerorigin.css';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import HomeIcon from '@mui/icons-material/Home';
import appbarstyle from './appbarstyle.js';
import { useNavigate, useLocation } from "react-router-dom";
import axios from 'axios';

const Playerorigin = (props) => {
    const [clubs, setClubs] = useState([]);
    const [club, setClub] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const [highlightedFeature, setHighlightedFeature] = useState(null);


    useEffect(() => {
        fetchClubs();
        const searchParams = new URLSearchParams(location.search);
        const clubParam = searchParams.get('club');
        if (clubParam) {
            setClub(clubParam);
        }
    }, []);

    const handleChange = (event) => {
        const newClub = event.target.value;
        setClub(newClub);
        navigate(`/playerorigin?club=${encodeURIComponent(newClub)}`);
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

    useEffect(() => {
        const geoserverLandLayer = 'footballmap:land';
        const landVectorSource = new VectorSource({
            format: new GeoJSON(),
            url: function(extent) {
                return `http://localhost:8080/geoserver/wfs?service=WFS&` +
                `version=1.1.0&request=GetFeature&typename=${geoserverLandLayer}&` +
                `outputFormat=application/json&srsname=EPSG:3857&bbox=` +
                `${extent.join(',')},EPSG:3857`;
            },
            strategy: bboxStrategy
        });

        const landVectorLayer = new VectorLayer({
          source: landVectorSource,
          style: new Style({
              stroke: new Stroke({
                  color: 'black', // Randfarbe ist Schwarz
                  width: 1       // Randbreite ist 1
              }),
              fill: new Fill({
                  color: 'white'  // Füllfarbe ist Weiß
              })
          })
      });
      

        const highlightStyle = new Style({
          stroke: new Stroke({
              color: '#f7da00', // Umrandungsfarbe auf Gelb ändern
              width: 4 // Dicke der Linie erhöhen
          }),
          fill: null // Keine Füllung
      });
      

        const highlightVectorLayer = new VectorLayer({
            source: new VectorSource(),
            style: highlightStyle
        });

        const newMap = new Map({
            layers: [landVectorLayer, highlightVectorLayer],
            view: new View({
                center: fromLonLat([8.1, 46.9]),
                zoom: 5,
                projection: 'EPSG:3857'
            }),
            target: 'map'
        });

        newMap.on('singleclick', function (event) {
            const clickedCoord = event.coordinate;
            const extent = [clickedCoord[0] - 1, clickedCoord[1] - 1, clickedCoord[0] + 1, clickedCoord[1] + 1];
            let name = '';
            let clickedFeature = null;
            
            landVectorSource.forEachFeatureIntersectingExtent(extent, function (feature) {
                name = feature.get('name');
                clickedFeature = feature;
            });
        
            if (name) {
                const overlay = new Overlay({
                    element: document.getElementById('popup-content'),
                    positioning: 'center-center',
                    offset: [0, -15],
                    stopEvent: false
                });
                newMap.addOverlay(overlay);
                overlay.setPosition(clickedCoord);
                document.getElementById('popup-content').innerText = name;

                if (clickedFeature) {
                    setHighlightedFeature(clickedFeature);
                    const highlightSource = highlightVectorLayer.getSource();
                    highlightSource.clear();
                    highlightSource.addFeature(clickedFeature);
                }
            }
        });

        return () => {
            newMap.setTarget(undefined);
        };
    }, []);

    return (
        <div>
            <AppBar position="static" style={appbarstyle.appBar}>
                <Toolbar className="Toolbar" style={{ justifyContent: 'space-between' }}>
                    <Button
                        style={appbarstyle.button}
                        startIcon={<HomeIcon style={{ color: '#f7da00' }} />}
                        onClick={() => navigate("/")}
                    >
                        FootballMap
                    </Button>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <FormControl sx={{ m: 1, minWidth: 120 }}>
                            <InputLabel id="club-label" style={{ color: '#f7da00' }}>Club</InputLabel>
                            <Select
                                labelId="club-label"
                                id="club-select"
                                value={club}
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
                        <div className="Title" style={appbarstyle.title}>
                            Player Origin
                        </div>
                    </div>
                </Toolbar>
            </AppBar>
            <div id="map" className="map-c"></div>
            <div id="popup-content" className="popup-content"></div>
            <div id="legend" className="legend">
                <h3>Legend</h3>
                <ul>
                    <li>Land 1</li>
                    <li>Land 2</li>
                    <li>Land 3</li>
                    {/* Fügen Sie hier weitere Legendeninformationen hinzu */}
                </ul>
            </div>
        </div>
    );
};

export default Playerorigin;
