import React, { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

// Set your Mapbox access token here
mapboxgl.accessToken = 'pk.eyJ1IjoibnBiYWxsYXJkMTEiLCJhIjoiY2xraDl0d2l0MDZ6bDNlb2h2MnlpMTkxYSJ9.l6qs4UL8ULs2BAoGiqzHZw';

const Test = () => {
  useEffect(() => {
    const map = new mapboxgl.Map({
      container: 'map', // ID of the container
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-74.5, 40], // Starting position [lng, lat]
      zoom: 9 // Starting zoom
    });

    map.on('load', () => {
      // Add a GeoJSON source for the triangle
      map.addSource('triangle', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [-74.5, 40], // Vertex 1
              [-74.6, 40.1], // Vertex 2
              [-74.4, 40.1], // Vertex 3
              [-74.5, 40] // Closing the triangle
            ]]
          }
        }
      });

      // Add a fill layer to draw the triangle
      map.addLayer({
        id: 'triangle-layer',
        type: 'fill',
        source: 'triangle',
        layout: {},
        paint: {
          'fill-color': [
            'interpolate',
            ['linear'],
            ['literal', [0, 1, 2]], // This represents the vertices
            0, '#ff0000', // Color for vertex 1
            1, '#00ff00', // Color for vertex 2
            2, '#0000ff'  // Color for vertex 3
          ],
          'fill-opacity': 0.8
        }
      });
    });

    // Clean up on component unmount
    return () => map.remove();
  }, []);

  return <div id="map" style={{ width: '100%', height: '100vh' }} />;
};

export default Test;
