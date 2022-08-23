// import logo from './img/map.svg';
import './App.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import randomColor from 'randomcolor';
import { Parser } from './md-parser';
import { marked } from 'marked';
import markedImages from 'marked-images';
import { SideBar } from './SideBar';
var opts = {
  xhtml: false,
  relPath: ''
}
marked.use(markedImages(opts));


mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_API_KEY;


///////////////////////////////////////// Global undefined vars /////////////////////////////////////////
var updateID = -1;
var mapContainer = undefined;
var map = undefined;
var [RELOADED, setRELOADED] = [false, () => { }];
var [lng, setLng] = [undefined, () => { }];
var [lat, setLat] = [undefined, () => { }];
var [zoom, setZoom] = [undefined, () => { }];
/////////////////////////////////////////////////////////////////////////////////////////////////////////


//////////////////////////////////////// Parser and Country data ////////////////////////////////////////
let customData = [...Parser.data()];
var alpha3Map = new Map();
let mParser = new Parser("myTrip.md");
/////////////////////////////////////////////////////////////////////////////////////////////////////////


export default function App() {
  mapContainer = useRef(null);
  map = useRef(null);
  [lng, setLng] = useState(24.018038);
  [lat, setLat] = useState(35.513828);
  [zoom, setZoom] = useState(3.5);
  [RELOADED, setRELOADED] = useState(false);

  InitMap(mapContainer, map, lng, setLng, lat, setLat, zoom, setZoom);

  return (
    <div id="App">
      <SideBar pageWrapId={"map-container-webgl-id"} outerContainerId={"App"} getState={getSidebarState}
      parseNext={parseNextTrip} getTitle={getTripTitle} updateID={updateID}/>
      <div className="infobar">
        Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
      </div>
      <div ref={mapContainer} className="map-container" id="map-container-webgl-id" />
    </div>
  );
}



function InitMap(mapContainer, map, lng, setLng, lat, setLat, zoom, setZoom) {

  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/christsiao/cl6cd2tt4000i14n3wbc7g0kt',
      center: [lng, lat],
      zoom: zoom
    });

    map.current.on('load', onMapLoad);
    map.current.on('click', onMapClick);
    map.current.on("mousemove", onMouseMove);
    map.current.on("mouseout", onMouseOut);

  });

  useEffect(() => {

    if (RELOADED) {
      onMapLoad();
      map.current.on('click', onMapClick);
      map.current.on("mousemove", onMouseMove);
      map.current.on("mouseout", onMouseOut);
      setRELOADED(false);
    }
  });

  useEffect(() => {
    if (!map.current) return; // wait for map to initialize
    map.current.on('move', onMapMove);
  });
}



/////////////////////////////////////////////// Map Event Functions /////////////////////////////////////////////// 
function onMapLoad() {
  //remove old layers and source in case of reload
  if (map.current.getLayer("countries-join")) {
    map.current.removeLayer("countries-join");
  }
  if (map.current.getLayer("countries-join-2")) {
    map.current.removeLayer("countries-join-2");
  }
  if (map.current.getSource("countries")) {
    map.current.removeSource("countries");
  }
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
}

function onMapClick(e) {
  // Copy coordinates array.
  var features = map.current.queryRenderedFeatures(e.point, { layers: ["countries-join", "country-label"] });
  let visited = false;
  let featureProp;
  if (features.length === 1) { //mouse on a country, make border bold
    if (alpha3Map.get(features[0].properties.iso_3166_1_alpha_3)[0]) {
      visited = true;
      featureProp = features[0];
    }
  }
  else if (features.length === 2) {
    if (alpha3Map.get(features[1].properties.iso_3166_1_alpha_3)[0]) {
      visited = true;
      featureProp = features[1];
    }
  }
  if (!visited) return;

  console.log(featureProp);

  let body = mParser.getBodyOfCountry(featureProp.properties.name_en);

  const html = marked.parse(`# ${featureProp.properties.name_en}\n` + body);

  console.log(html);
  console.log('<p><img src="' + mParser.images[0] + '" alt="An Image of marker.properties.title"></p>');

  new mapboxgl.Popup({ className: 'popup-content' })
    .setLngLat([alpha3Map.get(featureProp.properties.iso_3166_1_alpha_3)[2],
    alpha3Map.get(featureProp.properties.iso_3166_1_alpha_3)[1]])
    .setHTML(html)
    .addTo(map.current);
}

function onMouseMove(e) {
  if (!map.current.loaded()) return; // wait for map to initialize
  var features = map.current.queryRenderedFeatures(e.point, { layers: ["countries-join", "country-label"] });

  console.log(features);
  if (features.length === 1) { //mouse on a country, make border bold
    if (alpha3Map.get(features[0].properties.iso_3166_1_alpha_3)[0]) {
      map.current.setFilter("countries-join-2", ["==", "name_en", features[0].properties.name_en]);
      map.current.getCanvas().style.cursor = 'pointer';
    }
  }
  else if (features.length === 2) {

    if (alpha3Map.get(features[1].properties.iso_3166_1_alpha_3)[0]) {
      map.current.setFilter("countries-join-2", ["==", "name_en", features[1].properties.name_en]);
      map.current.getCanvas().style.cursor = 'pointer';
    }
  }
  else {
    map.current.getCanvas().style.cursor = '';
    map.current.setFilter("countries-join-2", ["==", "name", ""]);
  }
}

function onMouseOut() {
  if (!map.current.loaded()) return; // wait for map to initialize
  map.current.getCanvas().style.cursor = 'auto';
  map.current.setFilter("countries-join-2", ["==", "name", ""]);
}

function onMapMove() {
  setLng(map.current.getCenter().lng.toFixed(4));
  setLat(map.current.getCenter().lat.toFixed(4));
  setZoom(map.current.getZoom().toFixed(2));
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////// 


/////////////////////////////////////////// Sidebar Callback Functions /////////////////////////////////////////// 
function getTripTitle() {
  return mParser.tripInfo.title;
}

function getSidebarState() {
  return {
    currentHtml: marked.parse(mParser.getCurTripMarkdown()),
    currentTripIdx: mParser.getCurrentEntryIdx(),
    currentFilename: mParser.md_file,
    totalFilenames: mParser.getTripEntries().length,
    filenameList: mParser.getTripEntries()
  };
}

function parseNextTrip(filename = '') {
  if(filename === ''){
    var idx = mParser.getCurrentEntryIdx();
    idx = (idx + 1) % mParser.getTripEntries().length;
    mParser.setMdFileName(mParser.getTripEntries()[idx]);
  }else{
    mParser.setMdFileName(filename);
  }

  for (var row of customData) {
    row['en'] = false;
  }
  alpha3Map.clear();
  mParser.parse().then(function () {
    for (var row of customData) {
      if (mParser.visitedCountries.includes(row['Country'])) {
        row['en'] = true;
      }
      alpha3Map.set(row['Alpha3'], [row['en'], row['Lat'], row['Lon']]);
    }
    setRELOADED(true);
    updateID++;
  });
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
