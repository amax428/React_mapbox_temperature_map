import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import temperatureData from './data/sample.json';
import 'mapbox-gl/dist/mapbox-gl.css';

function aggregateTemperature(data, gridSize) {
  const aggregatedData = {};

  data.features.forEach(feature => {
    const coords = feature.geometry.coordinates;
    const temperature = feature.properties.temperature;
    const gridX = Math.floor(coords[0] / gridSize);
    const gridY = Math.floor(coords[1] / gridSize);
    const gridKey = `${gridX},${gridY}`;

    if (!aggregatedData[gridKey]) {
      aggregatedData[gridKey] = { total: 0, count: 0 };
    }

    aggregatedData[gridKey].total += temperature;
    aggregatedData[gridKey].count += 1;
  });

  const avgTemperatureFeatures = Object.entries(aggregatedData).map(([key, { total, count }]) => {
    const [gridX, gridY] = key.split(',').map(Number);
    const avgTemp = total / count;

    return {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [
          gridX * gridSize + gridSize / 2,
          gridY * gridSize + gridSize / 2
        ]
      },
      "properties": { "avg_temperature": avgTemp }
    };
  });

  return {
    "type": "FeatureCollection",
    "features": avgTemperatureFeatures
  };
}

function updateHeatmapData(mapRef) {
  const zoomLevel = mapRef.current.getZoom();
  let gridSize;
  // Adjust grid size based on zoom level
  if (zoomLevel < 9) {
    gridSize = 0.001; // Larger grid for lower zoom
    } else if (zoomLevel < 10) {
      gridSize = 0.001; // Medium grid for mid zoom
    } else if (zoomLevel < 11) {
      gridSize = 0.002;
    } else if (zoomLevel < 12) {
      gridSize = 0.0015;
    } else if (zoomLevel < 13) {
      gridSize = 0.0012;
    } else if (zoomLevel < 14) {
      gridSize = 0.0006;
    } else if (zoomLevel < 15) {
      gridSize = 0.0003;
    } else if (zoomLevel < 16) {
      gridSize = 0.0001;
    } else {
      gridSize = 0.00001; // Smaller grid for higher zoom
    }

    // gridSize = 0.00458 - 0.00028 * zoomLevel;
    console.log("zoomLevel: ", zoomLevel)
    console.log("gridSize", gridSize);

    const aggregatedData = aggregateTemperature(temperatureData, gridSize);
    console.log('aggregatedData', aggregatedData)

    // Update the heatmap source with the new aggregated data
    mapRef.current.getSource('temperature').setData(aggregatedData);
  }

  const Heatmap2 = () => {
    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);

    useEffect(() => {
      mapboxgl.accessToken = 'pk.eyJ1IjoibnBiYWxsYXJkMTEiLCJhIjoiY2xraDl0d2l0MDZ6bDNlb2h2MnlpMTkxYSJ9.l6qs4UL8ULs2BAoGiqzHZw';

      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [-120, 50],
        zoom: 2
      });

      mapRef.current.on('load', () => {
        if (!mapRef.current.getSource('temperature')) {
          mapRef.current.addSource('temperature', {
            type: 'geojson',
            // data: 'https://docs.mapbox.com/mapbox-gl-js/assets/earthquakes.geojson'
            data: aggregateTemperature(temperatureData, 0.1)
          });
        }

        if (!mapRef.current.getLayer('temperature-heat')) {
          mapRef.current.addLayer(
            {
              id: 'temperature-heat',
              type: 'heatmap',
              source: 'temperature',
              maxzoom: 24,
              paint: {
                // Increase the heatmap weight based on frequency and property magnitude
                'heatmap-weight': [
                  'interpolate',
                  ['linear'],
                  ['get', 'avg_temperature'],
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
                  3
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

        mapRef.current.on('zoom', () => {
          console.log('zooming....')
          updateHeatmapData(mapRef);
        });
      });
    }, []);

    return <div id="map" ref={mapContainerRef} style={{ height: '100vh' }}></div>;
  };

  export default Heatmap2;
