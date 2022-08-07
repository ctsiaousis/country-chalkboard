// import logo from './img/map.svg';
import './App.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import React, { useRef, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown'
import mapboxgl from 'mapbox-gl';
import randomColor from 'randomcolor';
// import { data, visitedCountries } from './codeData';
import { Parser } from './md-parser';

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_API_KEY;


//////////////////////////////////////////////testing//////////////////////////////////////////////
let customData = [...Parser.data()];
var alpha3Map = new Map();
let mParser = new Parser("myTrip.md");
mParser.parse().then(function () {
  for (var row of customData) {
    if (mParser.visitedCountries.includes(row['Country'])) {
      row['en'] = true;
    }
    alpha3Map.set(row['Alpha3'], [row['en'], row['Lat'], row['Lon']]);
  }
});
/////////////////////////////////////////////\testing//////////////////////////////////////////////

export default function App() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(24.018038);
  const [lat, setLat] = useState(35.513828);
  const [zoom, setZoom] = useState(3.5);

  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/christsiao/cl6cd2tt4000i14n3wbc7g0kt',
      center: [lng, lat],
      zoom: zoom
    });

    map.current.on('load', () => {
      // Add source for country polygons using the Mapbox Countries tileset
      // The polygons contain an ISO 3166 alpha-3 code which can be used to for joining the data
      // https://docs.mapbox.com/vector-tiles/reference/mapbox-countries-v1
      map.current.addSource('countries', {
        type: 'vector',
        url: 'mapbox://mapbox.country-boundaries-v1'
      });

      // Build a GL match expression that defines the color for every vector tile feature
      // Use the ISO 3166-1 alpha 3 code as the lookup key for the country shape
      const matchExpression = ['match', ['get', 'iso_3166_1_alpha_3']];

      // Calculate color values for each country based on 'hdi' value
      for (const row of customData) {
        // Convert the range of data values to a suitable color
        const enabled = row['en'];

        const color = randomColor({
          luminosity: 'bright',
          hue: 'random',
          format: 'rgba',
          alpha: 0.5 // e.g. 'rgba(9, 1, 107, 0.5)',
        });
        if (enabled)
          matchExpression.push(row['Alpha3'], color);
      }

      // Last value is the default, used where there is no data
      matchExpression.push('rgba(0, 0, 0, 0)');

      // Add layer from the vector tile source to create the choropleth
      // Insert it below the 'admin-1-boundary-bg' layer in the style
      map.current.addLayer(
        {
          'id': 'countries-join',
          'type': 'fill',
          'source': 'countries',
          'source-layer': 'country_boundaries',
          'paint': {
            'fill-color': matchExpression
          }
        },
        'admin-1-boundary-bg'
      );
      map.current.addLayer(
        {
          'id': 'countries-join-2',
          'type': 'line',
          'source': 'countries',
          'source-layer': 'country_boundaries',
          'paint': {
            'line-color': 'rgba(0, 255, 255, 1)'
          },
          "filter": ["==", "name", ""]
        },
        'admin-1-boundary'
      );

      map.current.setLayoutProperty('country-label', 'text-field', [
        'format',
        ['get', 'name_en'],
        { 'font-scale': 1.2 },
        '\n',
        {},
        ['get', 'name'],
        {
          'font-scale': 1,
          'text-font': [
            'literal',
            ['DIN Offc Pro Italic', 'Arial Unicode MS Regular']
          ]
        }
      ]);
    });

    map.current.on('click', (e) => {
      // Copy coordinates array.
      var features = map.current.queryRenderedFeatures(e.point, { layers: ["countries-join", "country-label"] });
      let visited = false;
      let featureProp;
      if (features.length === 1) { //mouse on a country, make border bold
        if (alpha3Map.get(features[0].properties.iso_3166_1_alpha_3)[0]){
          visited = true;
          featureProp = features[0];
        }
      }
      else if (features.length === 2) {
        if (alpha3Map.get(features[1].properties.iso_3166_1_alpha_3)[0]){
          visited = true;
          featureProp = features[1];
        }
      }
      if(!visited) return;

      console.log(featureProp);
       
      new mapboxgl.Popup()
      .setLngLat([alpha3Map.get(featureProp.properties.iso_3166_1_alpha_3)[1],
      alpha3Map.get(featureProp.properties.iso_3166_1_alpha_3)[2]])
      .setHTML("<h1>Hello World!</h1>")
      .addTo(map.current);
      }
      );

    map.current.on("mousemove", function (e) {
      if (!map.current.loaded()) return; // wait for map to initialize
      var features = map.current.queryRenderedFeatures(e.point, { layers: ["countries-join", "country-label"] });

      console.log(features);
      if (features.length === 1) { //mouse on a country, make border bold
        if (alpha3Map.get(features[0].properties.iso_3166_1_alpha_3)[0]){
          map.current.setFilter("countries-join-2", ["==", "name_en", features[0].properties.name_en]);
          map.current.getCanvas().style.cursor = 'pointer';
        }
      }
      else if (features.length === 2) {

        if (alpha3Map.get(features[1].properties.iso_3166_1_alpha_3)[0]){
          map.current.setFilter("countries-join-2", ["==", "name_en", features[1].properties.name_en]);
          map.current.getCanvas().style.cursor = 'pointer';
        }
      }
      else {
        map.current.getCanvas().style.cursor = '';
        map.current.setFilter("countries-join-2", ["==", "name", ""]);
      }
    });
    map.current.on("mouseout", function () {
      if (!map.current.loaded()) return; // wait for map to initialize
      map.current.getCanvas().style.cursor = 'auto';
      map.current.setFilter("countries-join-2", ["==", "name", ""]);
    });
  });

  useEffect(() => {
    if (!map.current) return; // wait for map to initialize
    map.current.on('move', () => {
      setLng(map.current.getCenter().lng.toFixed(4));
      setLat(map.current.getCenter().lat.toFixed(4));
      setZoom(map.current.getZoom().toFixed(2));
    });
  });

  return (
    <div>
      <div className="sidebar">
        Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
      </div>
      <div ref={mapContainer} className="map-container" />
    </div>
  );
}

