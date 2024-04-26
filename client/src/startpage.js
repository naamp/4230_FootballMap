// Verantwortlich: Stefan
// ToDo: Tabelle nur bei CH, ansonsten Karte ganze breite
// Möglichkeit, ganz Europa zu zeigen
// Karte verschönern inkl. luftbild
// Button für Tabelle, Liste bei ausländischen Ligen

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
import './startpage.css';
import appbarstyle from './appbarstyle.js';
import { useNavigate } from "react-router-dom";



// Konstanten für Menü-Styles
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
    // Zustandsvariablen der Komponenten
    const [popup, setPopup] = useState(null);
    const [vectorSource, setVectorSource] = useState(null);
    const [vectorLayer, setVectorLayer] = useState(null);
    const [map, setMap] = useState(null);
    const [countries, setCountries] = useState(['Switzerland']);
    const [country, setCountry] = useState('Switzerland');
    const [league, setLeague] = useState([]); 
    const [selectedItems, setSelectedItems] = useState([]);
    const [leftAnchorEl, setLeftAnchorEl] = useState(null);
    const [rightAnchorEl, setRightAnchorEl] = useState(null);
    const [availableLeagues, setAvailableLeagues] = useState([]);

    const [clickedName, setClickedName] = useState(null); 

    

    const navigate = useNavigate();

    // Funktion zum Zoomen auf sichtbare Features (Bounding Box um die Club-Icons)
    const zoomToVisibleFeatures = (source) => {
      if (!map || !source) {
          return;
      }
  
      const features = source.getFeatures();
  
      if (features.length === 0) {
          return;
      }
  
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;
  
      features.forEach(feature => {
          const geometry = feature.getGeometry();
          const extent = geometry.getExtent();
  
          minX = Math.min(minX, extent[0]);
          minY = Math.min(minY, extent[1]);
          maxX = Math.max(maxX, extent[2]);
          maxY = Math.max(maxY, extent[3]);
      });
  
      // Zusätzlicher Rand von 200px
      const padding = [200, 200, 200, 200];
  
      const extent = [minX, minY, maxX, maxY];
      map.getView().fit(extent, { padding, maxZoom: 16 });
  };
  
  // Funktion zum Aktualisieren der gefilterten Ligen (gemäss Dropdown "leagues")
  const updateFilteredFeatures = (selectedLeagues) => {
    const features = vectorSource.getFeatures();
    const filteredFeatures = filterFeaturesByLeagues(features, selectedLeagues, country);
    
    const newVectorSource = new VectorSource({
        format: new GeoJSON(),
        features: filteredFeatures
    });
    
    vectorLayer.setSource(newVectorSource);
    zoomToVisibleFeatures(newVectorSource);
};

  // Aufruf der Fetch-Funktion für Länder bei Änderungen in league und availableLeagues 
  useEffect(() => {
    if (vectorLayer && availableLeagues.length > 0) {
        updateFilteredFeatures(league);
        zoomToVisibleFeatures(); 
    }
}, [league, availableLeagues]);  

    

    // Funktion für die Buttons innerhalb des Pop-Ups
    const handleButtonClick = (page) => {
        switch(page) {
            case 'squadoverview':
                navigate(`/squadoverview?club=${encodeURIComponent(clickedName)}`); // Club-Namen als Parameter hinzufügen
                break;
            case 'playerorigin':
                navigate('/playerorigin');
                break;
            default:
                console.error('Unbekannte Seite');
        }
    };

    // Funktion beim Wechseln des Drop-Downs "country"
    const handleChange = (event) => {
      const selectedCountry = event.target.value;
      setCountry(selectedCountry);
      fetchLeagues(selectedCountry);
    };
    
    // Funktion beim Wechseln des Drop-Downs "leagues"
    const handleMultiLeagueChange = (event) => {
      const selectedLeagues = event.target.value;
      setLeague(selectedLeagues);
      updateFilteredFeatures(selectedLeagues);
      zoomToVisibleFeatures();  
  };
  
    // Schliessen des Pop-Ups
    const handleClose = () => {
        setLeftAnchorEl(null);
        setRightAnchorEl(null);
    };

    // Funktion zum Filtern der Club-Icons gemäss gewählter Ligen beim Drop-Down "leagues"
    const filterFeaturesByLeagues = (features, selectedLeagues, selectedCountry) => {
      return features.filter(feature => {
          const featureLeagues = feature.getProperties().liga.split(',');
          const featureCountry = feature.getProperties().land;
  
          return featureLeagues.some(league => selectedLeagues.includes(league.trim())) &&
                 featureCountry === selectedCountry;
      });
  };
    
    // Fetch der Länder (Verbindung zum Geoserver)
    const fetchCountries = () => {
        const geoserverWFSPointLayer = 'footballmap:vw_club_all';

        fetch('http://localhost:8080/geoserver/wfs?service=WFS&' +
            'version=1.1.0&request=GetFeature&typename=' + geoserverWFSPointLayer +
            '&outputFormat=application/json')
            .then(response => response.json())
            .then(data => {
                const uniqueCountries = [...new Set(data.features.map(feature => feature.properties.land))];
                setCountries(uniqueCountries.sort());
            })
            .catch(error => {
                console.error('Error fetching countries:', error);
            });
    };

    // Fetch der Ligen (Verbindung zum Geoserver)
    const fetchLeagues = (selectedCountry) => {
      const geoserverWFSPointLayer = 'footballmap:vw_club_all';
    
      fetch(`http://localhost:8080/geoserver/wfs?service=WFS&` +
          `version=1.1.0&request=GetFeature&typename=${geoserverWFSPointLayer}` +
          `&outputFormat=application/json&cql_filter=land='${selectedCountry}'`)
          .then(response => response.json())
          .then(data => {
              const leaguesWithWeight = data.features
                  .map(feature => ({
                      league: feature.properties.liga,
                      weight: feature.properties.gewichtung
                  }))
                  .sort((a, b) => a.weight - b.weight) // Sortieren nach Gewichtung
                  .reduce((acc, curr) => {
                      if (!acc.some(item => item.league === curr.league)) {
                          acc.push(curr);
                      }
                      return acc;
                  }, [])
                  .map(item => item.league); 
    
              setAvailableLeagues(leaguesWithWeight);  
    
              // Standardmässig Liga mit Gewichtung = 1 im Drop-Down "leagues" auswählen
              const defaultLeague = leaguesWithWeight.find(league => {
                  const weight = data.features.find(feature => feature.properties.liga === league)?.properties.gewichtung;
                  return weight === 1;
              });
    
              if (defaultLeague) {
                  setLeague([defaultLeague]);
              } else {
                  setLeague([]);
              }
          })
          .catch(error => {
              console.error('Error fetching leagues:', error);
          });
    };
    
    // Initialisierung der Komponente: Einrichtung der Karte, Vektorlayer, Pop-up usw.
    useEffect(() => {
        fetchCountries();

        const geoserverWFSPointLayer = 'vw_club_all';
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
  
        // Darstellen der Club-Icons
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
                    });
                    newIconMap[feature.getId()] = icon;
                }
                return new Style({image: icon});
            }
        });
  
        // Darstellen des Pop-Ups
        const newPopup = new Overlay({
            element: document.getElementById('popup'),
            autoPan: true,
            autoPanAnimation: {
                duration: 250
            }
        });
  
        // Darstellen der OSM-Karte
        const osmLayer = new TileLayer({
            source: new OSM()
        });
  
        // Darstellen der Karte
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
  
        // Darstellen der Pop-Up inklusive Content und Buttons
        newMap.on('click', function(evt) {
            const feature = newMap.forEachFeatureAtPixel(evt.pixel, function(feature) {
                return feature;
            });

            if (feature) {
                const coordinates = feature.getGeometry().getCoordinates();
                const name = feature.get('name');
                const stadiumname = feature.get('stadium_name');
                const kapazität = feature.get('kapazität');

                setClickedName(name); // Speichere den geklickten Namen
    
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
    
                popupElement.style.fontSize = '16px';
                popupElement.style.fontFamily = 'Arial, sans-serif';
                popupElement.style.color = '#311313';
  
                const button1 = popupElement.querySelector('#button1');
                const button2 = popupElement.querySelector('#button2');
    
                button1.addEventListener('click', () => {
                    console.log('Schaltfläche 1 wurde geklickt!');
                    handleButtonClick('squadoverview');
                });
    
                button2.addEventListener('click', () => {
                    console.log('Schaltfläche 2 wurde geklickt!');
                    handleButtonClick('playerorigin');
                });
            } else {
                newPopup.setPosition(undefined);
            }
        });
  
        // Abfragen der Tabellen-Daten vom Geoserver
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

    // Fetchen der Ligen basierend auf dem gewählten Land ("Switzerland" = default)
    useEffect(() => {
      if (countries.length > 0 && countries.includes('Switzerland')) {
          fetchLeagues('Switzerland');
      }
    }, [countries]);

    // Erstellung des HTML-Codes für die Tabelle basierend auf den Daten
        const createTableHtml = (data) => {
            // Sortieren des Datenarrays nach dem Rang
            const sortedData = data.sort((a, b) => a.rank - b.rank);
            
            let html = '<table>';
            html += '<tr><th>Rank</th><th>Club</th><th>G</th><th>W</th><th>D</th><th>L</th><th>Goals</th><th>Points</th></tr>';
            sortedData.forEach(row => {
                // Zusammenfassen der Goals For und Goals Against in einem String
                const goals = `${row.goalsFor}:${row.goalsAgainst}`;
                
                // Setzen der Hintergrundfarbe und fett darstellen der Zahlen in der "Rank"-Spalte
                let rankStyle = '';
                if (row.rank >= 1 && row.rank <= 6) {
                    rankStyle = 'background-color: #d0ffd0;';  // Hellgrün
                } else if (row.rank >= 7 && row.rank <= 12) {
                    rankStyle = 'background-color: #ffd0d0;';  // Hellrot
                }
                
                html += `<tr class="table-row" data-name="${row.name}"><td style="font-weight: bold; ${rankStyle}">${row.rank}</td><td><button class="zoom-button" data-name="${row.name}" style="margin-left: 10px;">${row.name}</button></td><td>${row.games}</td><td>${row.won}</td><td>${row.drawn}</td><td>${row.lost}</td><td>${goals}</td><td>${row.points}</td></tr>`;
        });
        
        html += '</table>';
        return html;
    };

    useEffect(() => {
        // Zoom auf Club-Icon beim Klick auf die Tabelle
        const zoomToFeature = (name) => {
            if (!vectorSource) {
                console.error('vectorSource is not initialized');
                return;
            }
    
            const feature = vectorSource.getFeatures().find(feature => feature.get('name') === name);
            if (feature) {
                const extent = feature.getGeometry().getExtent();
                map.getView().fit(extent, { size: map.getSize(), maxZoom: 16 });
            } else {
                console.error('Feature not found for name:', name);
            }
        };
    
        // Event Delegation für Tabellencontainer
        const handleTableClick = (event) => {
            const clickedButton = event.target.closest('.zoom-button');
            if (clickedButton) {
                const name = clickedButton.getAttribute('data-name');
                zoomToFeature(name);
            }
        };
    
        const tableContainer = document.getElementById('table-container');
        tableContainer.addEventListener('click', handleTableClick);
    
        // Cleanup des Event Listeners
        return () => {
            tableContainer.removeEventListener('click', handleTableClick);
        };
    }, [vectorSource, map]); // Abhängigkeiten für den useEffect hinzugefügt
    
    
    

    // Return Hauptkomponente
    return (
        <div>
            <div className="standardAppBar"> 
                <AppBar position="static" style={appbarstyle.appBar}>
                    <Toolbar className="Toolbar" style={{ justifyContent: 'space-between' }}> 
                    <Button 
                        style={appbarstyle.button}  
                        startIcon={<HomeIcon style={{ color: '#f7da00' }} />}  
                        aria-controls="left-menu"
                        onClick={() => window.location.reload()}  
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
                                    {countries.map(country => (
                                        <MenuItem key={country} value={country}>{country}</MenuItem>
                                    ))}
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
                                    {availableLeagues.map(l => (
                                        <MenuItem key={l} value={l}>
                                            <Checkbox checked={league.includes(l)} />
                                            {l}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </div>
                    </Toolbar>
                </AppBar>
            </div>
              <div id="popup" className="ol-popup">
                <a href="#" id="popup-closer" className="ol-popup-closer">×</a>
                <div id="popup-content"></div>
                </div>
                <div id="table-container" className="table-container-custom">
                    <table id="table-body"></table>
                </div>
                    <div style={{ position: 'fixed', bottom: '10px', right: '10px', backgroundColor: 'white', padding: '10px', border: '1px solid black' }}>
                    {clickedName && <p>Geklickter Name: {clickedName}</p>}
                </div>

              <div id="map" className="map-container"></div>
        </div>
    );
};

export default Startpage;