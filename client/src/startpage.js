// verantwortlich: Stefan

import React, { useEffect, useState } from 'react';
import Map from 'ol/Map.js';
import TileLayer from 'ol/layer/Tile.js';
import OSM from 'ol/source/OSM.js';
import View from 'ol/View.js';
import { fromLonLat } from 'ol/proj';
import { Projection } from 'ol/proj';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON.js';
import { bbox as bboxStrategy } from 'ol/loadingstrategy.js';
import VectorLayer from 'ol/layer/Vector';
import { Icon, Style } from 'ol/style.js';
import Overlay from 'ol/Overlay.js';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import HomeIcon from '@mui/icons-material/Home';
import OutlinedInput from '@mui/material/OutlinedInput';

import './App.css';
import appbarstyle from './appbarstyle.js'; 

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const Startpage = () => {
    const [popup, setPopup] = useState(null);
    const [vectorSource, setVectorSource] = useState(null);
    const [vectorLayer, setVectorLayer] = useState(null);
    const [map, setMap] = useState(null);


    const [country, setCountry] = useState('Switzerland');
    const [league, setLeague] = useState(['Super League']); 



    const [selectedItems, setSelectedItems] = useState([]);
    const [leftAnchorEl, setLeftAnchorEl] = useState(null);
    const [rightAnchorEl, setRightAnchorEl] = useState(null);

    const handleChange = (event) => {
        setCountry(event.target.value);
    };
    
    const handleMultiLeagueChange = (event) => {
        setLeague(event.target.value);
    };
    

    const handleLeftClick = (event) => {
        setLeftAnchorEl(event.currentTarget);
        
        // Zoom zur Startposition und zum Startzoom zurücksetzen
        const startCenter = fromLonLat([8.1, 46.9]); // Startposition
        const startZoom = 8; // Startzoom
        
        if (map) {  // Überprüfung, ob map gesetzt ist
            map.getView().setCenter(startCenter);
            map.getView().setZoom(startZoom);
        } else {
            console.error('Map is not initialized yet');
        }
    };
    



    const handleClose = () => {
        setLeftAnchorEl(null);
        setRightAnchorEl(null);
    };

    const handleMenuItemClick = (event, item) => {
        setSelectedItems([item]);
        handleClose();
    };

    const handleCheckboxChange = (event, item) => {
        if (event.target.checked) {
            setSelectedItems([...selectedItems, item]);
        } else {
            setSelectedItems(selectedItems.filter(i => i !== item));
        }
    };
  
    useEffect(() => {
      const geoserverWFSPointLayer = 'footballmap:vw_club_all';
      const geoserverWFSTableLayer = 'footballmap:vw_tabelle';
  
      const newVectorSource = new VectorSource({
        format: new GeoJSON(),
        url: function(extent) {
          return 'http://localhost:8080/geoserver/wfs?service=WFS&' +
            'version=1.1.0&request=GetFeature&typename=' + geoserverWFSPointLayer +
            '&outputFormat=application/json';
        },
        strategy: bboxStrategy
      });
  
      const newIconMap = {};
  
      const newVectorLayer = new VectorLayer({
        source: newVectorSource,
        style: function(feature) {
          let icon;
          if (newIconMap[feature.getId()]) {
            icon = newIconMap[feature.getId()]
          } else {
            icon = new Icon({
              src: feature.get('logo_link'),
              scale: 0.3
            })
            newIconMap[feature.getId()] = icon
          }
          return new Style({image: icon});
        }
      });
  
      const newPopup = new Overlay({
        element: document.getElementById('popup'),
        autoPan: true,
        autoPanAnimation: {
          duration: 250
        }
      });
  
      const osmLayer = new TileLayer({
        source: new OSM()
      });
  
      const newMap = new Map({
        layers: [
          osmLayer,
          newVectorLayer
        ],
        view: new View({
          center: fromLonLat([8.1, 46.9]),
          zoom: 8,
          projection: new Projection({
            code: 'EPSG:900913',
            units: 'm'
          })
        }),
        target: 'map'
      });
  
      newMap.addOverlay(newPopup);
  
      newMap.on('click', function(evt) {
        const feature = newMap.forEachFeatureAtPixel(evt.pixel, function(feature) {
          return feature;
        });

if (feature) {
    const coordinates = feature.getGeometry().getCoordinates();
    const name = feature.get('name');
    const stadiumname = feature.get('stadium_name');
    const kapazität = feature.get('kapazität');
    
    const popupContent = `
      <strong>${name}</strong><br>
      <strong>Stadion:</strong> ${stadiumname}<br>
      <strong>Kapazität:</strong> ${kapazität} Plätze<br><br>
      <button id="button1" style="margin-right: 10px;">Squad Overview</button>
      <button id="button2">Player Origin</button>
    `;
    
    newPopup.setPosition(coordinates);
    const popupElement = newPopup.getElement();
    popupElement.innerHTML = popupContent;
    
    // Schriftart und Stile ändern
    popupElement.style.fontSize = '16px';
    popupElement.style.fontFamily = 'Arial, sans-serif';
    popupElement.style.color = '#311313';
  
    // Event Listener für Schaltflächen hinzufügen
    const button1 = popupElement.querySelector('#button1');
    const button2 = popupElement.querySelector('#button2');
    
    button1.addEventListener('click', () => {
      console.log('Schaltfläche 1 wurde geklickt!');
      // Hier können Sie die gewünschte Aktion für Schaltfläche 1 hinzufügen
    });
    
    button2.addEventListener('click', () => {
      console.log('Schaltfläche 2 wurde geklickt!');
      // Hier können Sie die gewünschte Aktion für Schaltfläche 2 hinzufügen
    });
    
} else {
    newPopup.setPosition(undefined);
}

          
          
      });
  
      fetch('http://localhost:8080/geoserver/wfs?service=WFS&' +
        'version=1.1.0&request=GetFeature&typename=' + geoserverWFSTableLayer +
        '&outputFormat=application/json')
        .then(response => response.json())
        .then(data => {
          const tableData = data.features.map(feature => {
            return {
              name: feature.properties.name,
              rank: feature.properties.rang,
              games: feature.properties.spiele,
              won: feature.properties.gewonnen,
              drawn: feature.properties.unentschieden,
              lost: feature.properties.verloren,
              goalsFor: feature.properties.tore_geschossen,
              goalsAgainst: feature.properties.tore_bekommen,
              points: feature.properties.punkte
            };
          });
  
          const tableHtml = createTableHtml(tableData);
          document.getElementById('table-body').innerHTML = tableHtml;
        });
  
      setPopup(newPopup);
      setVectorSource(newVectorSource);
      setVectorLayer(newVectorLayer);
      setMap(newMap);
    }, []);
  
    const createTableHtml = (data) => {
      let html = '<table>';
      html += '<tr><th>Name</th><th>Rank</th><th>Games</th><th>Won</th><th>Drawn</th><th>Lost</th><th>Goals For</th><th>Goals Against</th><th>Points</th></tr>';
      data.forEach(row => {
        html += `<tr class="table-row" data-name="${row.name}"><td class="name">${row.name}</td><td>${row.rank}</td><td>${row.games}</td><td>${row.won}</td><td>${row.drawn}</td><td>${row.lost}</td><td>${row.goalsFor}</td><td>${row.goalsAgainst}</td><td>${row.points}</td></tr>`;
      });
      html += '</table>';
      return html;
    }
  
    const zoomToFeature = (name) => {
      const feature = vectorSource.getFeatures().find(feature => feature.get('name') === name);
      if (feature) {
        const extent = feature.getGeometry().getExtent();
        map.getView().fit(extent, { size: map.getSize(), maxZoom: 16});
      }
    }
  
    const handleTableRowClick = (event) => {
      const clickedRow = event.target.closest('tr');
      const name = clickedRow.dataset.name;
      zoomToFeature(name);
    }
   
    return (
        <div>
            <div className="standardAppBar"> 
                <AppBar position="static" style={appbarstyle.appBar}> 
                    <Toolbar className="Toolbar" style={{ justifyContent: 'space-between' }}> 
                    <Button 
                        style={appbarstyle.button}  
                        startIcon={<HomeIcon style={{ color: '#f7da00' }} />}  
                        aria-controls="left-menu"
                        onClick={handleLeftClick} // Füge diesen Klick-Handler hinzu
                    >
                        FootballMap
                    </Button>



                        <div>
                            <FormControl sx={{ m: 1, minWidth: 120 }} >  
                            <InputLabel id="country-label" style={{ color: '#f7da00' }}>Country</InputLabel>

                                <Select
                                    labelId="country-label"
                                    id="country-select"
                                    value={country}
                                    onChange={handleChange}
                                    style={{ color: 'white'}}
                                >
                                    <MenuItem value="Switzerland">Switzerland</MenuItem>
                                    <MenuItem value="Germany">Germany</MenuItem>
                                </Select>
                            </FormControl>

                            <FormControl sx={{ m: 1, minWidth: 120 }}>  
                                <InputLabel id="leagues-label" style={{ color: '#f7da00' }}>Leagues</InputLabel>
                                <Select
                                    labelId="leagues-label"
                                    id="leagues-select"
                                    multiple
                                    value={league}
                                    onChange={handleMultiLeagueChange}
                                    input={<OutlinedInput label="Choose Leagues" />}
                                    renderValue={(selected) => selected.join(', ')}
                                    MenuProps={MenuProps}
                                    style={{ color: 'white' }}
                                >
                                    <MenuItem value="Bundesliga">
                                        <Checkbox checked={league.includes('Bundesliga')} />
                                        Bundesliga
                                    </MenuItem>
                                    <MenuItem value="Premier League">
                                        <Checkbox checked={league.includes('Premier League')} />
                                        Premier League
                                    </MenuItem>
                                    <MenuItem value="Super League">
                                        <Checkbox checked={league.includes('Super League')} />
                                        Super League
                                    </MenuItem>
                                </Select>
                            </FormControl>
                        </div>
                    </Toolbar>
                </AppBar>           
                <div id="table-container" className="table-container-custom" onClick={handleTableRowClick}>
                    <table id="table-body"></table>
                </div>
                <div id="map" className="map-container"></div>
            </div>
        </div>
    );
};

export default Startpage;