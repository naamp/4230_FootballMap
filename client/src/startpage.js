// Startseite provisorisch fertig
// Optimierungsmöglichkeiten:
        // evtl. Luftbild als zusätzliche Karte
        // Icons "flackern" teilweise wieder, ich glaube wegen Kollision mit anderen Icons verursacht

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
import Attribution from 'ol/control/Attribution';
import Zoom from 'ol/control/Zoom';
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
import LogoFootballMap from './images/Logo_FootballMap_gelb.png'
import { useNavigate } from "react-router-dom";

// => Abschnitt wird wohl nicht mehr benötigt
// Konstanten für Menü-Styles
// const ITEM_HEIGHT = 48;
// const ITEM_PADDING_TOP = 8;
// const MenuProps = {
//   PaperProps: {
//     style: {
//       maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
//       width: 250,
//     },
//   },
// };

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
    const [popupReady, setPopupReady] = useState(false);
    const navigate = useNavigate();

    // Zustandsvariablen für Club-Positionen
    const [clubPositions, setClubPositions] = useState({});

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

      const padding = [100, 100, 100, 100];

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
    updateSelectedItems(filteredFeatures); // Update der ausgewählten Elemente für die Tabelle
};

// Funktion zum Aktualisieren der ausgewählten Elemente für die Tabelle
const updateSelectedItems = (features) => {
    const items = features.map(feature => ({
        name: feature.getProperties().name,
        logo_link: feature.getProperties().logo_link,
        kapazität: feature.getProperties().kapazität,
        position: feature.getGeometry().getCoordinates() // Hinzufügen der Club-Position
    }));

    // Sortiere die Elemente zuerst nach Stadionkapazität und dann nach Namen
    items.sort((a, b) => {
        if (a.kapazität !== b.kapazität) return b.kapazität - a.kapazität;
        return a.name.localeCompare(b.name); // Sortiere nach Namen
    });

    setSelectedItems(items);
    // Aktualisieren der Club-Positionen im Zustand
    const positions = {};
    items.forEach(item => {
        positions[item.name] = item.position;
    });
    setClubPositions(positions);
};

// Funktion zum Zoomen auf einen Club auf der Karte
const zoomToClub = (clubName) => {
    const position = clubPositions[clubName];
    if (position) {
        map.getView().animate({ center: position, duration: 1, zoom: 16 });
    }
};

  // Aufruf der Fetch-Funktion für Länder bei Änderungen in league und availableLeagues
  useEffect(() => {
    if (vectorLayer && availableLeagues.length > 0) {
        updateFilteredFeatures(league);
        zoomToVisibleFeatures();
    }
}, [league, availableLeagues]);
    // Funktion für die Buttons innerhalb des Pop-Ups
    const handleButtonClick = (page, clubName) => {
        switch(page) {
            case 'squadoverview':
                // Club-Namen als Parameter hinzufügen und auf die Seite "Squad Overview" weiterleiten
                navigate(`/squadoverview?club=${encodeURIComponent(clubName)}`);
                break;
            case 'playerorigin':
                // Club-Namen als Parameter hinzufügen und auf die Seite "Player Origin" weiterleiten
                navigate(`/playerorigin?club=${encodeURIComponent(clubName)}`);
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
                const kapazität = feature.getProperties().kapazität;
                // Berechne die Z-Index-Ebene basierend auf der Kapazität
                const zIndex = Math.floor(kapazität / 1000);

                return new Style({
                    image: new Icon({
                        src: feature.get('logo_link'),
                        scale: 0.3
                    }),
                    zIndex: zIndex // Setze die Z-Index basierend auf der berechneten Ebene
                });
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

        // Festlegen der Attibution/Quelle
        const attributions =
            '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap</a>';

        // Darstellen der OSM-Karte
        const osmLayer = new TileLayer({
            source: new OSM({attributions: attributions}),
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
                minZoom: 5,
                maxZoom: 20,
                projection: new Projection({
                    code: 'EPSG:3857', //zuvor war EPSG:900913
                    units: 'm'
                })
            }),
            target: 'map',
            controls: [
                new Zoom({
                    className: 'ol-zoom-custom'
                }),
                new Attribution({
                    collapsed: true,
                    collapsible: true,
                    tipLabel: 'show Attibution',
                    label: '\u00A9',
                    collapseLabel: '>'
                })]
        });

        newMap.addOverlay(newPopup);

        // Änderung des Mauszeigers bei Hover über den Clublogos
        newMap.on('pointermove', function(evt) {
            const hit = newMap.hasFeatureAtPixel(evt.pixel);
            const element = newMap.getTargetElement();
            element.style.cursor = hit ? 'pointer' : '';
        });

        // Darstellen der Pop-Up inklusive Content und Buttons
        newMap.on('click', function(evt) {
            const feature = newMap.forEachFeatureAtPixel(evt.pixel, function(feature) {
                return feature;
            });

            if (feature) {
                const liga = feature.get('liga');
                const coordinates = feature.getGeometry().getCoordinates();
                const name = feature.get('name');
                const stadiumname = feature.get('stadium_name');
                const kapazität = feature.get('kapazität');

                // Setze den geklickten Namen hier
                setClickedName(name);

                const popupContent = `
                    <a href="#" id="popup-closer" style="position: absolute; top: 10px; right: 10px; font-size: 20px;color: #888; text-decoration: none;">&times;</a>
                    <strong>${name}</strong><br>
                    <strong>League:</strong> ${liga}<br>
                    <strong>Stadium:</strong> ${stadiumname}<br>
                    <strong>Capacity:</strong> ${kapazität} seats<br><br>
                    <button id="button1" class="startpage_popup-button" style="margin-right: 10px;" ${liga !== 'Super League' ? 'disabled' : ''}>Squad Overview</button>
                    <button id="button2" class="startpage_popup-button" ${liga !== 'Super League' ? 'disabled' : ''}>Player Origin</button>
                    ${liga !== 'Super League' ? '<p style="font-size: 12px; color: #888;">Functions only for Swiss Super League</p>' : ''}
                `;

                newPopup.setPosition(coordinates);
                const popupElement = newPopup.getElement();
                popupElement.innerHTML = popupContent;

                popupElement.style.fontSize = '14px';
                popupElement.style.fontFamily = '"Roboto", sans-serif';
                popupElement.style.color = '#311313';

                const button1 = popupElement.querySelector('#button1');
                const button2 = popupElement.querySelector('#button2');

                button1.addEventListener('click', () => {
                    console.log('Schaltfläche 1 wurde geklickt!');
                    if (liga === 'Super League') {
                        handleButtonClick('squadoverview', name);
                    }
                });

                button2.addEventListener('click', () => {
                    console.log('Schaltfläche 2 wurde geklickt!');
                    if (liga === 'Super League') {
                        handleButtonClick('playerorigin', name);
                    }
                });

                const closer = popupElement.querySelector('#popup-closer');
            closer.addEventListener('click', function() {
                newPopup.setPosition(undefined);
            });

            } else {
                newPopup.setPosition(undefined);
            }
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

    useEffect(() => {
        if (popupReady) {
            const handleClosePopup = () => {
                popup.setPosition(undefined);
            };

            const popupCloser = document.getElementById('popup-closer');
            popupCloser.addEventListener('click', handleClosePopup);

            // Cleanup: Entferne den Event-Listener, wenn das Komponenten unmounted wird
            return () => {
                popupCloser.removeEventListener('click', handleClosePopup);
            };
        }
    }, [popupReady]);

    // Return Hauptkomponente
    return (
        <div>
            <div className="standardAppBar">
                <AppBar position="static" style={appbarstyle.appBar}>
                    <Toolbar className="Toolbar" style={{ justifyContent: 'space-between' }}>
                        <Button
                            style={appbarstyle.button}
                            aria-controls="left-menu"
                            onClick={() => window.location.reload()}
                        >
                            <img src={LogoFootballMap} style={{ width: 'auto', height: '50px' , marginRight: '10px' }} />
                            FootballMap
                        </Button>
                        <div>
                            <FormControl sx={{ m: 1,color:'red', minWidth: 120 }} >
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
                                    renderValue={(selected) => {
                                        if (selected.length > 1) {
                                            return 'Multiple Leagues Selected';
                                        } else {
                                            return selected.join(', ');
                                        }
                                    }}
                                    //MenuProps={MenuProps} => wird wohl nicht mehr benötigt
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
            <div id="popup" className="startpage_popup">
                <a href="#" id="popup-closer">×</a>
                <div id="popup-content"></div>
            </div>
            <div id="table-container" className="startpage_table">
                <table id="table-body"></table>
            </div>
            <div id="visible-clubs-table" className="startpage_table">
                <table id="visible-clubs-body">
                <caption className="startpage_table-caption">ⓘ Selected clubs sorted by stadium capacity</caption>
                    <thead>
                        <tr>
                            <th></th>
                            <th>Club</th>
                            <th>Capacity</th>
                        </tr>
                    </thead>
                    <tbody>
                        {selectedItems.map((item, index) => (
                            <tr key={index} onClick={() => zoomToClub(item.name)}>
                                <td><img src={item.logo_link} alt={item.name} style={{ width: '25px', height: 'auto' }} /></td>
                                <td>{item.name}</td>
                                <td>{item.kapazität}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div id="map" className="startpage_map"></div>
        </div>
    );
};

export default Startpage;