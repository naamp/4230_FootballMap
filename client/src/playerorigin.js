// provisorisch fertig
// Optimierungsmöglichkeiten: 
        // evtl. Design-Anpassungen
        // Hover etwas verbessern (wenn mit der Maus die Map verlassen wird, soll z.B. der hover weg)
        // p.s. Zoom-Funktion bei Klick auf Tabelle wurde bewusst nicht umgesetzt, da ich darin keinen grossen Mehrwert sah...
        // p.s. "gelb-stufen" fand ich besser als graustufen, da ansonsten der Hover nicht gut aussah

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
    const [highlightedFeature, setHighlightedFeature] = useState(null);
    const [playerCounts, setPlayerCounts] = useState({}); 

    const navigate = useNavigate();
    const location = useLocation();

    const [countryFlags, setCountryFlags] = useState({});

    useEffect(() => {
        fetchCountryFlags();
        fetchClubs();
        const searchParams = new URLSearchParams(location.search);
        const clubParam = searchParams.get('club');
        if (clubParam) {
            setClub(clubParam);
        }
    }, []);

    useEffect(() => {
        if (club) {
            fetchPlayerCounts(club); 
        }
    }, [club]);

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
                    .sort((a, b) => a.name.localeCompare(b.name));
                setClubs(clubsData);
            } else {
                console.error('No clubs data found in the response:', response);
            }
        } catch (error) {
            console.error('Error fetching clubs:', error);
        }
    };

    const fetchPlayerCounts = async (clubName) => {
        try {
            const response = await axios.get(`http://localhost:8080/geoserver/wfs?service=WFS&version=1.1.0&request=GetFeature&typename=vw_spieler_geburtsland&outputFormat=application/json&cql_filter=club='${encodeURIComponent(clubName)}'`);

            if (response && response.data && response.data.features) {
                const playerCountsData = response.data.features.reduce((counts, feature) => {
                    counts[feature.properties.geburtsland] = feature.properties.anzahl_spieler;
                    return counts;
                }, {});
                setPlayerCounts(playerCountsData);
            } else {
                console.error('No player counts data found in the response:', response);
            }
        } catch (error) {
            console.error('Error fetching player counts:', error);
        }
    };

    useEffect(() => {
        const geoserverLandLayer = 'footballmap:land';
        const landVectorSource = new VectorSource({
            format: new GeoJSON(),
            url: function(extent) {
                return `http://localhost:8080/geoserver/wfs?service=WFS&version=1.1.0&request=GetFeature&typename=${geoserverLandLayer}&outputFormat=application/json&srsname=EPSG:3857&bbox=${extent.join(',')},EPSG:3857`;
            },
            strategy: bboxStrategy
        });

        const landVectorLayer = new VectorLayer({
            source: landVectorSource,
            style: function(feature) {
                const nationalität = feature.get('name'); 
                const playerCount = playerCounts[nationalität] || 0; 
                let color;
        
                if (playerCount === 0) {
                    color = 'rgba(255, 255, 255, 0.8)';
                } else if (playerCount === 1) {
                    color = '#fee391'; 
                } else if (playerCount >= 2 && playerCount <= 3) {
                    color = '#fec44f'; 
                } else if (playerCount >= 4 && playerCount <= 5) {
                    color = '#fe9929'; 
                } else if (playerCount >= 6 && playerCount <= 10) {
                    color = '#ec7014'; 
                } else {
                    color = '#cc4c02'; 
                }
        
                return new Style({
                    fill: new Fill({
                        color: color
                    }),
                    stroke: new Stroke({
                        color: '#000000',
                        width: 1
                    })
                });
            }
        });
        
        const newMap = new Map({
            layers: [landVectorLayer],
            view: new View({
                center: fromLonLat([14, 50]),
                zoom: 5,
                projection: 'EPSG:3857'
            }),
            target: 'map'
        });

        const highlightStyle = new Style({
            stroke: new Stroke({
                color: '#f7da00',
                width: 4
            }),
            fill: null
        });

        const highlightVectorLayer = new VectorLayer({
            source: new VectorSource(),
            style: highlightStyle
        });

        newMap.addLayer(highlightVectorLayer);

        let overlayElement = document.getElementById('popup-content');
if (!overlayElement) {
    overlayElement = document.createElement('div');
    overlayElement.id = 'popup-content';
    document.body.appendChild(overlayElement);
}

newMap.on('pointermove', function (event) {
    const hoveredCoord = event.coordinate;
    const extent = [hoveredCoord[0] - 1, hoveredCoord[1] - 1, hoveredCoord[0] + 1, hoveredCoord[1] + 1];
    let name = '';
    
    landVectorSource.forEachFeatureIntersectingExtent(extent, function (feature) {
        name = feature.get('name');
    });

    const overlay = new Overlay({
        element: overlayElement,
        positioning: 'center-center',
        offset: [0, -15],
        stopEvent: false
    });

    if (name) {
        newMap.addOverlay(overlay);
        overlay.setPosition(hoveredCoord);
        overlayElement.innerText = name;
    } else {
        newMap.removeOverlay(overlay);
    }
});

        return () => {
            newMap.setTarget(undefined);
        };
    }, [playerCounts]);

    const generateColorBoxes = () => {
        return (
            <div>
                <span className="legend-color-box" style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}></span>
                <span className="legend-text">none</span> <br />
                <span className="legend-color-box" style={{ backgroundColor: '#fee391' }}></span>
                <span className="legend-text">1 </span> <br />
                <span className="legend-color-box" style={{ backgroundColor: '#fec44f' }}></span>
                <span className="legend-text">2 - 3 </span> <br />
                <span className="legend-color-box" style={{ backgroundColor: '#fe9929' }}></span>
                <span className="legend-text">4 - 5 </span> <br />
                <span className="legend-color-box" style={{ backgroundColor: '#ec7014' }}></span>
                <span className="legend-text">6 - 10 </span> <br />
                <span className="legend-color-box" style={{ backgroundColor: '#cc4c02' }}></span>
                <span className="legend-text">&gt; 10</span>
            </div>
        );
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
                <h3>Player Nationality</h3>
                {generateColorBoxes()}
            </div>
            <div className="table-container-custom">
                <h3 className="table-caption">Player Counts by Nationality</h3>
                <table>
                    <thead>
                        <tr>
                            <th></th>
                            <th>Country</th>
                            <th>Player Count</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(playerCounts)
                            .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
                            .map(([nationalität, playerCount]) => (
                                <tr key={nationalität}>
                                    <td><img src={countryFlags[nationalität]} alt={nationalität} style={{ width: 'auto', height: '20px' }} /></td>
                                    <td>{nationalität}</td>
                                    <td>{playerCount}</td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Playerorigin;