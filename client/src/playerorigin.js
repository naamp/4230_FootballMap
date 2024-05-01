// ToDo: Zoom-Funktion verbessern (besser auf zentrum), 
// Legende, Hover-Funktion, Klasseneinteilung

import React, { useEffect, useState } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import { fromLonLat } from 'ol/proj';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { bbox as bboxStrategy } from 'ol/loadingstrategy';
import VectorLayer from 'ol/layer/Vector';
import { Stroke, Style, Fill } from 'ol/style';
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
    const [playerCounts, setPlayerCounts] = useState({});
    const [mapInstance, setMapInstance] = useState(null);
    const [selectedCountry, setSelectedCountry] = useState(null);

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
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
                if (playerCount >= 5) {
                    color = 'rgba(0, 0, 0, 0.8)';
                } else if (playerCount === 4) {
                    color = 'rgba(51, 51, 51, 0.8)';
                } else if (playerCount === 3) {
                    color = 'rgba(102, 102, 102, 0.8)';
                } else if (playerCount === 2) {
                    color = 'rgba(153, 153, 153, 0.8)';
                } else if (playerCount === 1) {
                    color = 'rgba(204, 204, 204, 0.8)';
                } else {
                    color = 'rgba(255, 255, 255, 0.8)';
                }
                return new Style({
                    fill: new Fill({
                        color: color
                    }),
                    stroke: new Stroke({
                        color: selectedCountry === nationalität ? 'yellow' : '#000000',
                        width: selectedCountry === nationalität ? 2 : 1
                    })
                });
            }
        });

        const newMap = new Map({
            layers: [landVectorLayer],
            view: new View({
                center: fromLonLat([8.1, 46.9]),
                zoom: 5,
                projection: 'EPSG:3857'
            }),
            target: 'map'
        });

        setMapInstance(newMap);

        return () => {
            newMap.setTarget(undefined);
        };
    }, [playerCounts, selectedCountry]);

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

    const handleTableRowClick = (nationalität) => {
        const landVectorSource = mapInstance.getLayers().item(0).getSource();
        landVectorSource.forEachFeature((feature) => {
            if (feature.get('name') === nationalität) {
                const mapView = mapInstance.getView();
                const geometry = feature.getGeometry();
                if (geometry) {
                    mapView.fit(geometry, { padding: [200, 200, 200, 200], duration: 500 });
                    setSelectedCountry(nationalität);
                }
            }
        });
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
            <div id="legend" className="legend">
                <h3>Legend</h3>
                <ul>
                    <li>0 Spieler: Weiß</li>
                    <li>1 Spieler: #CCCCCC</li>
                    <li>2 Spieler: #999999</li>
                    <li>3 Spieler: #666666</li>
                    <li>4 Spieler: #333333</li>
                    <li>5 und mehr Spieler: Schwarz</li>
                </ul>
            </div>
            <div className="table-container-custom">
                <h3>Player Counts by Nationality</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Flag</th>
                            <th>Country</th>
                            <th>Player Count</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(playerCounts)
                            .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
                            .map(([nationalität, playerCount]) => (
                                <tr key={nationalität} onClick={() => handleTableRowClick(nationalität)} style={{ backgroundColor: selectedCountry === nationalität ? 'yellow' : 'transparent' }}>
                                    <td><img src={`URL_ZUR_FLAGGE_${nationalität}.png`} alt={nationalität} className="club-logo" /></td>
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
