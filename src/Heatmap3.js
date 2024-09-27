import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import data from './data/sample.json';
import 'mapbox-gl/dist/mapbox-gl.css';

const Heatmap3 = () => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    console.log('data', data);
    mapboxgl.accessToken = 'pk.eyJ1IjoibnBiYWxsYXJkMTEiLCJhIjoiY2xraDl0d2l0MDZ6bDNlb2h2MnlpMTkxYSJ9.l6qs4UL8ULs2BAoGiqzHZw';

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-80.17, 25.77],
      zoom: 2
    });

    mapRef.current.on('load', () => {
      if (!mapRef.current.getSource('temperature')) {
        mapRef.current.addSource('temperature', {
          type: 'geojson',
          // data: 'https://docs.mapbox.com/mapbox-gl-js/assets/earthquakes.geojson'
          data
        });
      }

      if (!mapRef.current.getLayer('temperatureLayer')) {
        mapRef.current.addLayer(
          {
            id: 'temperatureLayer',
            type: 'heatmap',
            source: 'temperature',
            maxzoom: 24,
            paint: {
              // Increase the heatmap weight based on frequency and property magnitude
              'heatmap-weight': [
                'interpolate',
                ['linear'],
                ['get', 'temperature'],
                -40,
                0,
                60,
                1
              ],
              // Increase the heatmap color weight weight by zoom level
              // heatmap-intensity is a multiplier on top of heatmap-weight
              'heatmap-intensity': [
                'interpolate',
                ['linear'],
                ['zoom'],
                0,
                1,
                24,
                5
              ],
              // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
              // Begin color ramp at 0-stop with a 0-transparancy color
              // to create a blur-like effect.
              'heatmap-color': [
                'interpolate',
                ['linear'],
                ['heatmap-density'],
                0,
                'rgba(33,102,172,0)',
                0.2,
                'rgb(103,169,207)',
                0.4,
                'rgb(209,229,240)',
                0.6,
                'rgb(253,219,199)',
                0.8,
                'rgb(239,138,98)',
                1,
                'rgb(178,24,43)'
              ],
              // Adjust the heatmap radius by zoom level
              'heatmap-radius': [
                'interpolate',
                ['linear'],
                ['zoom'],
                10,
                1,
                24,
                100
              ],
              // Transition from heatmap to circle layer by zoom level
              'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 7, 1, 24, 1]
            }
          },
          'waterway-label'
        );

        // mapRef.current.addLayer({
        //   'id': 'temperatureLayer',
        //   'type': 'fill',
        //   'source': 'temperature',
        //   'maxzoom': 24,
        //   'paint': {
        //     "fill-antialias": false,
        //     "fill-opacity": 0.75,
        //     "fill-color": [
        //       "interpolate",
        //       ["linear"],
        //       ["get", "temperature"],
        //       -50,
        //       'rgba(33,102,172,0)',
        //       -30,
        //       'rgb(103,169,207)',
        //       -10,
        //       'rgb(209,229,240)',
        //       10,
        //       'rgb(253,219,199)',
        //       30,
        //       'rgb(239,138,98)',
        //       50,
        //       'rgb(178,24,43)'
        //     ]
        //   }
        // })
      }

      if (0) {
        if (!mapRef.current.getLayer('temperature-point')) {
          mapRef.current.addLayer(
            {
              id: 'temperature-point',
              type: 'circle',
              source: 'temperature',
              minzoom: 7,
              paint: {
                // Size circle radius by earthquake magnitude and zoom level
                'circle-radius': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  7,
                  ['interpolate', ['linear'], ['get', 'temperature'], 1, 1, 6, 4],
                  16,
                  ['interpolate', ['linear'], ['get', 'temperature'], 1, 5, 6, 50]
                ],
                // Color circle by earthquake magnitude
                'circle-color': [
                  'interpolate',
                  ['linear'],
                  ['get', 'temperature'],
                  1,
                  'rgba(33,102,172,0)',
                  2,
                  'rgb(103,169,207)',
                  3,
                  'rgb(209,229,240)',
                  4,
                  'rgb(253,219,199)',
                  5,
                  'rgb(239,138,98)',
                  6,
                  'rgb(178,24,43)'
                ],
                'circle-stroke-color': 'white',
                'circle-stroke-width': 1,
                // Transition from heatmap to circle layer by zoom level
                'circle-opacity': ['interpolate', ['linear'], ['zoom'], 7, 0, 8, 1]
              }
            },
            'waterway-label'
          );
        }
      }

    });
  }, []);

  return <div id="map" ref={mapContainerRef} style={{ height: '100vh' }}></div>;
};

export default Heatmap3;
