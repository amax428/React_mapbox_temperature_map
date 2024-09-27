import React, { useState } from 'react';
import ReactMapGL from 'react-map-gl';
import { DeckGL } from '@deck.gl/react';
import { HeatmapLayer } from '@deck.gl/aggregation-layers'; // Updated import

const MAPBOX_TOKEN = 'pk.eyJ1IjoibnBiYWxsYXJkMTEiLCJhIjoiY2xraDl0d2l0MDZ6bDNlb2h2MnlpMTkxYSJ9.l6qs4UL8ULs2BAoGiqzHZw'; // Replace with your Mapbox access token

const Heatmap = () => {
  const [viewport, setViewport] = useState({
    latitude: 25.77398,
    longitude: -80.17493,
    zoom: 10.52,
    width: '100%',
    height: '100vh',
    zoomDelta: 0.1, // Set zoom step to 0.1
    zoomSnap: 0.1  // Snap zoom to 0.1 increments
  });

  // Sample data points for the heatmap
  const data = [
    { coordinates: [-80.174927, 25.773982], intensity: 100 },
    { coordinates: [-80.174804, 25.773979], intensity: 50 },
    { coordinates: [-80.174850, 25.773975], intensity: 75 },
    { coordinates: [-80.174900, 25.773980], intensity: 60 },
    { coordinates: [-80.174950, 25.773985], intensity: 90 },
  ];

  const heatmapData = data.map(d => ({
    position: d.coordinates,
    weight: d.intensity,
  }));

  const layers = [
    new HeatmapLayer({
      id: 'heatmap',
      data: heatmapData,
      getPosition: d => d.position,
      getWeight: d => d.weight,
      radiusPixels: 30,
      intensity: 1,
      threshold: 0.05,
    }),
  ];

  return (
    <DeckGL
      layers={layers}
      initialViewState={viewport}
      controller={true}
    >
      <ReactMapGL
        {...viewport}
        mapboxAccessToken={MAPBOX_TOKEN}
        onViewportChange={nextViewport => setViewport(nextViewport)}
        mapStyle="mapbox://styles/mapbox/streets-v11"
        scrollZoom={false} // Enable scroll zoom
        doubleClickZoom={false}
        // zoomDelta={0.1} // Set zoom step to 0.1
        // zoomSnap={0.1}  // Snap zoom to 0.1 increments
      />
    </DeckGL>
  );
};

export default Heatmap;
