import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import data from './data/sample.json';
import 'mapbox-gl/dist/mapbox-gl.css';

const Map = () => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    mapboxgl.accessToken = 'pk.eyJ1IjoibnBiYWxsYXJkMTEiLCJhIjoiY2xraDl0d2l0MDZ6bDNlb2h2MnlpMTkxYSJ9.l6qs4UL8ULs2BAoGiqzHZw';

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-80.17, 25.77],
      zoom: 9,
      maxZoom: 16,
    });

    mapRef.current.on('load', () => {
      if (!mapRef.current.getSource('temperature')) {
        mapRef.current.addSource('temperature', {
          type: 'geojson',
          // data: 'https://docs.mapbox.com/mapbox-gl-js/assets/earthquakes.geojson'
          data
        });
      }

      if (!mapRef.current.getLayer('temperature-point')) {
        mapRef.current.addLayer(
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
                'rgb(17, 237, 83)',
                20,
                'rgb(250, 225, 5)',
                50,
                'rgb(219, 72, 39)'
              ],
              'circle-blur':
                3,
              // 'circle-stroke-color': 'white',
              // 'circle-stroke-width': 1,
              // Transition from heatmap to circle layer by zoom level
              // 'circle-opacity': ['interpolate', ['linear'], ['zoom'], 7, 0, 24, 1]
              'circle-opacity': 0.8
            }
          },
        );

        const layers = mapRef.current.getStyle().layers;
        console.log(layers); // Check this in the console to find the right label layer

        // Move the circle layer below the street name labels
        // Adjust the layer name based on what you find in the log
        const labelLayer = layers.find(layer => layer.id.includes('label') && layer.type === 'symbol');
        if (labelLayer) {
          mapRef.current.moveLayer('temperature-point', labelLayer.id);
        }
      }
      mapRef.current.on('zoom', () => {
        // console.log('zooming....', mapRef.current.getZoom())
      });
    });
  }, []);

  return <div id="map" ref={mapContainerRef} style={{ height: '100vh' }}></div>;
};

export default Map;
