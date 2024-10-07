import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import data from './data/sample4.json';
import 'mapbox-gl/dist/mapbox-gl.css';

const preprocessTemperatureData = (json) => {
  const temperatureMap = {
    "hot": 50,
    "warm": 20,
    "cold": -30
  };

  // Loop through each feature in the JSON and update the temperature
  json.features.forEach(feature => {
    const temperature = feature.properties.temperature;
    if (temperatureMap.hasOwnProperty(temperature)) {
      feature.properties.temperature = temperatureMap[temperature];
    }
  });

  return json;
}

const Map = () => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [isSatellite, setIsSatellite] = useState(true);

  const temperatureData = preprocessTemperatureData(data);
  useEffect(() => {
    mapboxgl.accessToken = 'pk.eyJ1IjoibnBiYWxsYXJkMTEiLCJhIjoiY2xraDl0d2l0MDZ6bDNlb2h2MnlpMTkxYSJ9.l6qs4UL8ULs2BAoGiqzHZw';

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/satellite-v9',
      center: [-80.17, 25.77],
      zoom: 9,
      maxZoom: 16,
    });

    mapRef.current.on('load', () => {
      addLayers(mapRef.current, 0.5, 2);
    });
    console.log('isSatellite', isSatellite);
  }, []);

  const addLayers = (mapInstance, opacity, blur) => {
    console.log(opacity, blur)
    if (!mapInstance.getSource('temperature')) {
      mapInstance.addSource('temperature', {
        type: 'geojson',
        // data: 'https://docs.mapbox.com/mapbox-gl-js/assets/earthquakes.geojson'
        data: temperatureData,
      });
    }

    if (mapInstance.getLayer('temperature-point')) {
      mapInstance.removeLayer('temperature-point');
    }

    mapInstance.addLayer(
      {
        id: 'temperature-point',
        type: 'circle',
        source: 'temperature',
        minzoom: 1,
        paint: {
          // Size circle radius by earthquake magnitude and zoom level
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            7,
            // 2,
            ['interpolate', ['linear'], ['get', 'temperature'], -30, 1, 50, 2],
            12,
            // 10,
            ['interpolate', ['linear'], ['get', 'temperature'], -30, 7, 50, 10],
            13,
            // 15,
            ['interpolate', ['linear'], ['get', 'temperature'], -30, 15, 50, 20],
            14,
            // 30,
            ['interpolate', ['linear'], ['get', 'temperature'], -30, 30, 50, 40],
            18,
            // 100,
            ['interpolate', ['linear'], ['get', 'temperature'], -30, 100, 50, 120],
          ],
          // Color circle by earthquake magnitude
          'circle-color': [
            'interpolate',
            ['linear'],
            ['get', 'temperature'],
            -30,
            // 'rgb(17, 237, 83)',
            'rgb(0, 255, 0)',
            20,
            'rgb(255, 255, 0)',
            50,
            // 'rgb(219, 72, 39)'
            'rgb(255, 0, 0)'
          ],
          'circle-blur':
            blur,
          // 'circle-stroke-color': 'white',
          // 'circle-stroke-width': 1,
          // Transition from heatmap to circle layer by zoom level
          // 'circle-opacity': ['interpolate', ['linear'], ['zoom'], 7, 0, 24, 1]
          'circle-opacity': opacity
        }
      },
    );

    const layers = mapInstance.getStyle().layers;
    // console.log(layers); // Check this in the console to find the right label layer

    // Move the circle layer below the street name labels
    // Adjust the layer name based on what you find in the log
    const labelLayer = layers.find(layer => layer.id.includes('label') && layer.type === 'symbol');
    if (labelLayer) {
      mapInstance.moveLayer('temperature-point', labelLayer.id);
    }
  }

  const toggleMapStyle = () => {
    console.log('isSatellite', !isSatellite)
    const newStyle = isSatellite ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/satellite-v9';
    mapRef.current.setStyle(newStyle);
    mapRef.current.on('style.load', () => {
      addLayers(mapRef.current, isSatellite ? 0.5 : 0.5, isSatellite ? 3 : 2);
    });
    setIsSatellite(!isSatellite);
  };

  return (
    <>
      <button className="toggle-button" onClick={toggleMapStyle}>
        Toggle Satellite/Street
      </button>
      <div id="map" ref={mapContainerRef} style={{ height: '100vh' }}></div>;
    </>)
};

export default Map;
