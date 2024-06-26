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
import Point from 'ol/geom/Point.js';
import Attribution from 'ol/control/Attribution';
import Zoom from 'ol/control/Zoom';
import { XYZ } from 'ol/source.js';
import {extend as extendExtent, createEmpty as createEmptyExtent} from 'ol/extent';
import { useNavigate, useLocation } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import './transferhistory.css';
import './ol.css';
import LogoFootballMap from './images/Logo_FootballMap_gelb.png'
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
  const [selectedTransferLine, setSelectedTransferLine] = useState(null);
  const [selectedTransferIds, setSelectedTransferIds] = useState([]);
  const [transferData, setTransferData] = useState([]);
  const [countryFlags, setCountryFlags] = useState({});

  useEffect(() => {
    fetchClubLocations();
    fetchTransferLines();
    fetchCountryCenters();
    fetchTransferData();
    fetchCountryFlags();
  }, []);

  const fetchClubLocations = async () => {
    try {
      const response = await axios.get('http://localhost:8080/geoserver/wfs?service=WFS&version=1.1.0&request=GetFeature&typename=vw_club_all&outputFormat=application/json');

      if (response && response.data && response.data.features) {
        const clubLocations = response.data.features.map(feature => {
          const coordinates = feature.geometry.coordinates;
          return new Feature({
            geometry: new Point(fromLonLat([coordinates[0], coordinates[1]])),
            name: feature.properties.name // Name hinzufügen, um später nach Club-Icon zu suchen
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
            const id = feature.properties.id;
            const fromClub = feature.properties.von_club;
            const toClub = feature.properties.nach_club;
            const transferArt = feature.properties.transferart;
            const fromLand = feature.properties.von_land;
            const toLand = feature.properties.nach_land;
            // const fromClubName = feature.properties.von_club_name;
            // const toClubName = feature.properties.nach_club_name;

            // Find the corresponding country center for from_land and to_land
            const [fromCenter, toCenter] = await Promise.all([
              findCountryCenter(fromLand),
              findCountryCenter(toLand)
            ]);

            // Check if fromClub or toClub is "Vereinslos" => zur Zeit keine Spieler mit "Vereinslos", alle sind dann "Unbekannt"
            if (fromClub === 999998 || toClub === 999998) {
              // Find the corresponding country center
              const startPoint = fromClub === 999998 ? fromCenter : clubIcons.find(icon => icon.get('name') === fromClub);
              const endPoint = toClub === 999998 ? toCenter : clubIcons.find(icon => icon.get('name') === toClub);

              // If startPoint or endPoint is not found, skip this line
              if (!startPoint || !endPoint) return null;

              return new Feature({
                geometry: new LineString([startPoint.getGeometry().getCoordinates(), endPoint.getGeometry().getCoordinates()]),
                name: feature.properties.name,
                id: feature.properties.id,
                transferArt: transferArt
              });
            } else {
              // No unknown clubs, proceed with regular transfer line
              return new Feature({
                geometry: new LineString(feature.geometry.coordinates.map(coord => fromLonLat(coord))),
                name: feature.properties.name,
                id: feature.properties.id,
                transferArt: transferArt
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
          // Überprüfen der Transferart und Anpassen des Stils entsprechend
          const transferArt = feature.get('transferArt');
          if (transferArt === 'Leihe') {
            return new Style({
              stroke: new Stroke({
                color: '#2196F3',
                width: 4
              })
            });
          } else if (transferArt === 'Transfer') {
            return new Style({
              stroke: new Stroke({
                color: '#28487d',
                width: 4
              })
            });
          } else {
            // Standard-Stil für Linien, wenn keine Transferart angegeben ist
            return new Style({
              stroke: new Stroke({
                color: '#28487d',
                width: 4
              })
            });
          }
        } else if (feature.getGeometry().getType() === 'Point') {
          // Überprüfen, ob es sich um ein Club-Icon oder ein Länderzentrum handelt
          if (clubIcons.includes(feature)) {
            // Darstellung als kleiner roter Punkt für Club-Icons
            return new Style({
              image: new CircleStyle({
                radius: 0, // wenn man die Club-Positionen darstellen will, kann man einen Radius setzen
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
                radius: 0, // wenn man die Länder-Center darstellen will, kann man einen Radius setzen
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

    // Festlegen der Attibution/Quelle
    const attributionsOSM =
    '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap</a>';

    // Erstellen OSM Hintergrundlayer
    const osmStandard = new TileLayer({
      source: new OSM({attributions: attributionsOSM}),
    });

    // Erstellen MapBox Hintergrundlayer
    const MapBoxLight = new TileLayer({
      source: new XYZ({
          attributions: '&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> contributors',
          url: 'https://api.mapbox.com/styles/v1/mapbox/light-v10/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibmFhbXAiLCJhIjoiY2x3MXV6ODI5MGdlbDJxcGhqNXlpMHZwaSJ9.yLrZYxgQjbgitKABOhmhTg'
      }),
    });

    const newMap = new Map({
      layers: [
        MapBoxLight,
        vectorLayer
      ],
      view: new View({
        center: fromLonLat([8.1, 46.9]),
        zoom: 8
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

    newMap.on('singleclick', (event) => {
      let featureFound = false;

      newMap.forEachFeatureAtPixel(event.pixel, (feature, layer) => {
        if (layer === vectorLayer) {
          featureFound = true;
          // Behandle das Klicken auf ein Feature hier
        }
        return true; // Stoppe die Suche, wenn ein Feature gefunden wurde
      });

      if (!featureFound) {
        // Kein Feature wurde gefunden, setze die States und Hervorhebungen zurück
        unhighlightTransferLine(); // Keine ID übergeben, setzt alle Linien zurück
        setSelectedTransferIds([]);
      }
    });

    setMap(newMap);
  };


  const zoomToVisibleFeatures = () => {
    if (!map) {
      console.log("Map is not initialized.");
      return;
    }

    if (transferLines.length === 0) {
      console.log("No transfer lines to zoom to.");
      return;
    }

    let extent = createEmptyExtent();

    transferLines.forEach(feature => {
      extendExtent(extent, feature.getGeometry().getExtent());
    });

    map.getView().fit(extent, {
      size: map.getSize(),
      padding: [100, 100, 100, 100],
      maxZoom: 16
    });
  };

  // useEffect, um auf Änderungen in der Karte und den transferLines zu reagieren
  useEffect(() => {
    if (map && transferLines.length > 0) {
      zoomToVisibleFeatures();
    }
  }, [map, transferLines]);


  useEffect(() => {
    if (clubIcons.length > 0 && transferLines.length > 0 && countryCenters.length > 0) {
      initializeMap();
    }
  }, [clubIcons, transferLines, countryCenters]);

  const fetchTransferData = async () => {
    try {
      const response = await axios.get('http://localhost:8080/geoserver/wfs?service=WFS&version=1.1.0&request=GetFeature&typename=vw_transferlinien&outputFormat=application/json');
      if (response && response.data && response.data.features) {
        const filteredData = response.data.features.filter(feature => feature.properties.spieler_name === playerName)
          .map(feature => ({
            id: feature.properties.id,
            date: formatDate(feature.properties.datum), // Datum formatieren
            fromClub: feature.properties.von_club_name,
            fromClubCountry: feature.properties.von_land,
            toClub: feature.properties.nach_club_name,
            toClubCountry: feature.properties.nach_land,
            marketValue: formatCurrency(feature.properties.marktwert), // Währung formatieren
            transferFee: formatCurrency(feature.properties.ablösesumme) // Währung formatieren
          }))
          .sort((a, b) => new Date(convertToDateObject(a.date)) - new Date(convertToDateObject(b.date))); // Sortieren nach dem Datum
        setTransferData(filteredData);
      } else {
        console.error('No transfer data found in the response:', response);
      }
    } catch (error) {
      console.error('Error fetching transfer data:', error);
    }
  };

  // Funktion zum Konvertieren des Datums in ein Objekt
  const convertToDateObject = (dateString) => {
    const parts = dateString.split('.');
    return new Date(parts[2], parts[1] - 1, parts[0]); // Jahr, Monat (0-11), Tag
  };


  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day < 10 ? '0' : ''}${day}.${month < 10 ? '0' : ''}${month}.${year}`;
  };

  const formatCurrency = (value) => {
    if (value === 'Unbekannt') return 'Unknown';
    const formatter = new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0 // Setzt die minimale Anzahl von Nachkommastellen auf 0
    });
    const euroValue = Number(value);
    const integerEuro = Math.floor(euroValue); // Rundet den Euro-Betrag auf ganze Zahlen
    return formatter.format(integerEuro);
  };


  const handleTableRowClick = (id) => {
    // Zuerst die vorherige Auswahl zurücksetzen, wenn vorhanden
    if (selectedTransferLine !== null) {
      unhighlightTransferLine(selectedTransferLine);
    }
    // Dann die neue Zeile hervorheben
    highlightTransferLine(id);
    setSelectedTransferLine(id);
    setSelectedTransferIds([id]);
  };

  const generateLegend = () => {
    return (
        <div>
            <span className="transferhistory_legend-color-box" style={{ backgroundColor: '#2196F3'}}></span>
            <span className="transferhistory_legend-text">on loan</span> <br />
            <span className="transferhistory_legend-color-box" style={{ backgroundColor: '#28487d' }}></span>
            <span className="transferhistory_legend-text">transfer</span> <br />
        </div>
    );
};

  const handleBackButtonClick = () => {
    const clubParam = new URLSearchParams(location.search).get('club');
    navigate(`/squadoverview?club=${clubParam}`);
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

  const highlightTransferLine = (id) => {
    const vectorLayer = map.getLayers().item(1); // Annahme: Die Transferlinien sind auf dem zweiten Vektorlayer
    const features = vectorLayer.getSource().getFeatures();
    features.forEach(feature => {
      if (feature.get('id') === id) {
        // Ändere den Stil der Linie und setze die Z-Index-Eigenschaft
        feature.setStyle(new Style({
          stroke: new Stroke({
            color: '#f7da00',
            width: 10
          }),
          zIndex: 1 // Setze die Z-Index-Eigenschaft auf 1, um die Linie über anderen zu platzieren
        }));

        // Zoom auf die ausgewählte Linie
        const extent = feature.getGeometry().getExtent();
        map.getView().fit(extent, { padding: [100, 100, 100, 100] }); // Padding, um etwas Platz um die Linie herum zu lassen
      }
    });
  };

  const unhighlightTransferLine = (id) => {
    if (!map) {
      console.log("Map is not initialized.");
      return;
    }

    const vectorLayer = map.getLayers().item(1); // Annahme: Die Transferlinien sind auf dem zweiten Vektorlayer
    if (!vectorLayer) {
      console.log("Vector layer is not available.");
      return;
    }

    const features = vectorLayer.getSource().getFeatures();
    features.forEach(feature => {
      if (feature.get('id') === id) {
        // Setze den Stil der Linie auf den ursprünglichen Stil zurück und setze die Z-Index-Eigenschaft zurück
        const transferArt = feature.get('transferArt');
        if (transferArt === 'Leihe') {
          feature.setStyle(new Style({
            stroke: new Stroke({
              color: 'lightblue',
              width: 3
            })
          }));
        } else if (transferArt === 'Transfer') {
          feature.setStyle(new Style({
            stroke: new Stroke({
              color: 'blue',
              width: 3
            })
          }));
        } else {
          feature.setStyle(new Style({
            stroke: new Stroke({
              color: 'black',
              width: 3
            })
          }));
        }
        feature.setStyle(feature.getStyle().setZIndex(undefined)); // Setze die Z-Index-Eigenschaft zurück
      }
    });
  };

  return (
    <div>
      <AppBar position="static" style={appbarstyle.appBar}>
        <Toolbar className="Toolbar" style={{ justifyContent: 'space-between' }}>
          <Button
            style={appbarstyle.button}
            onClick={() => {
              navigate("/");
            }}
          >
            <img src={LogoFootballMap} style={{ width: 'auto', height: '50px' , marginRight: '10px' }} />
            FootballMap
          </Button>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div className="Title" style={appbarstyle.title}>
              Transfer History from {playerName}
            </div>
          </div>
        </Toolbar>
      </AppBar>
      <div id="map" className="map_transferhistory">
        <div
            className="transferhistory_backbutton"
            onClick={handleBackButtonClick}>
            Back to Squad Overview
        </div>
      </div>
      <div id="legend" className="transferhistory_legend">
                <p>transfer type</p>
                {generateLegend()}
            </div>
      <div className="transferTableContainer">
        <div className='transferhistory_table'>
          <caption className='transferhistory_table-caption'></caption>
          <table>
            <thead>
              <tr>
                <th>Nr</th>
                <th>Date</th>
                <th>From</th>
                <th></th>
                <th>To</th>
                <th></th>
                <th>Value</th>
                <th>Fee</th>
              </tr>
            </thead>
            <tbody>
              {transferData.map((transfer, index) => (
                <tr key={index} onClick={() => handleTableRowClick(transfer.id)} className={selectedTransferIds.includes(transfer.id) ? 'selected-row' : 'table-row'}>
                  <td>{index + 1}</td>
                  <td>{transfer.date}</td>
                  <td>
                    <img
                    src={countryFlags[transfer.fromClubCountry]}
                    alt={transfer.fromClubCountry}
                    title={transfer.fromClubCountry}
                    style={{ width: 'auto', height: '20px' }} />
                  </td>
                  <td>{transfer.fromClub}</td>
                  <td>
                    <img
                    src={countryFlags[transfer.toClubCountry]}
                    alt={transfer.toClubCountry}
                    title={transfer.toClubCountry}
                    style={{ width: 'auto', height: '20px' }} />
                  </td>
                  <td>{transfer.toClub}</td>
                  <td>{transfer.marketValue}</td>
                  <td>{transfer.transferFee}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Transferhistory;
