// playerorigin (verantwortlich: Silvan)
// Inhalt: originmap, toolbar, ...

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
import { useNavigate } from "react-router-dom";

const Playerorigin = (props) => {
    const [club, setClub] = useState('FC Luzern');
    const navigate = useNavigate();
    const [highlightedFeature, setHighlightedFeature] = useState(null);

    const handleChange = (event) => {
        setClub(event.target.value);
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
                                <MenuItem value="FC Luzern">FC Luzern</MenuItem>
                                <MenuItem value="FC Basel">FC Basel</MenuItem>
                                <MenuItem value="FC Sion">FC Sion</MenuItem>
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
