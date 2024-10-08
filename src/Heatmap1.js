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
  if (zoomLevel < 10) {
    gridSize = 0.1; // Larger grid for lower zoom
  } else if (zoomLevel < 12) {
    gridSize = 0.05; // Medium grid for mid zoom
  } else {
    gridSize = 0.01; // Smaller grid for higher zoom
  }

  const aggregatedData = aggregateTemperature(temperatureData, gridSize);

  // Update the heatmap source with the new aggregated data
  mapRef.current.getSource('aggregated-temperature-data').setData(aggregatedData);
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
      if (!mapRef.current.getSource('aggregated-temperature-data')) {
        mapRef.current.addSource('aggregated-temperature-data', {
          type: 'geojson',
          data: aggregateTemperature(temperatureData, 0.1)
        });
      }

      if (!mapRef.current.getLayer('temperature-heat')) {
        mapRef.current.addLayer(
          {
            id: 'temperature-heat',
            type: 'heatmap',
            source: 'aggregated-temperature-data',
            maxzoom: 24,
            paint: {
              'heatmap-weight': [
                'interpolate',
                ['linear'],
                ['get', 'temperature'],
                -40,
                0,
                60,
                1
              ],
              'heatmap-intensity': 1,
              'heatmap-color': [
                'interpolate',
                ['linear'],
                ['heatmap-density'],
                0, 'blue',
                0.5, 'yellow',
                1, 'red'
              ],
            }
          },
          'waterway-label'
        );
      }

      // mapRef.current.on('zoom', () => {
      //   console.log('zooming....')
      //   updateHeatmapData(mapRef);
      // });
    });
  }, []);

  return <div id="map" ref={mapContainerRef} style={{ height: '100vh' }}></div>;
};

export default Heatmap2;
