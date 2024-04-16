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
import './App.css';

const MyMap = () => {
  const [popup, setPopup] = useState(null);
  const [vectorSource, setVectorSource] = useState(null);
  const [vectorLayer, setVectorLayer] = useState(null);
  const [map, setMap] = useState(null);

  useEffect(() => {
    const geoserverWFSPointLayer = 'footballmap:vw_club_all'; //tabelle (view) mit Club-Daten
    const geoserverWFSTableLayer = 'footballmap:vw_tabelle'; //tabelle (view) mit der aktuellen Tabelle (Swiss Super League)

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
        newPopup.setPosition(coordinates);
        newPopup.getElement().innerHTML = name + '<br>' + stadiumname + '<br>' + kapazität;
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
      <div id="popup" className="ol-popup">
        <a href="#" id="popup-closer" className="ol-popup-closer">×</a>
        <div id="popup-content"></div>
      </div>
      <div id="table-container" className="table-container-custom" onClick={handleTableRowClick}>
        <table id="table-body"></table>
      </div>
      <div id="map" className="map-container"></div>
    </div>
  );
};

export default MyMap;