import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import * as d3 from 'd3';
import CombinedLegendControl from './TempLegendControl.jsx';

function MapVisualization({ data }) {
  // You said you updated the scale domains for your data, so:
  const tempScale = d3.scaleSequential(
    // for each t in [0,1], 
    // we use 1 - t to flip the color ramp
    t => d3.interpolateRdYlBu(1 - t)
  )
  .domain([-15, 40]);
  const sizeScale = d3.scaleLinear().domain([0, 10000]).range([15, 100]);
  const opacityScale = d3.scaleLinear().domain([40, 70]).range([0.2, 1]);

  return (
    <div style={{ width: '100%', height: '600px' }}>
      <MapContainer 
        center={[36.2048, 138.2529]} 
        zoom={5} 
        style={{ width: '100%', height: '100%' }}
      >
        {/* Dark-themed tile layer example: CartoDB DarkMatter */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"
        />

        {/* Alternatively: Stamen Toner (also darkish)
        <TileLayer
          attribution='Map tiles by Stamen Design...'
          url="https://{s}.tile.stamen.com/toner/{z}/{x}/{y}.png"
        />
        */}

        {data.map((d, i) => {
          if (d.average_temperature == null) return null;
          const color = tempScale(d.average_temperature);
          const radius = sizeScale(d.fluCases);
          const fillOp = opacityScale(d.humidity);

          return (
            <CircleMarker
                key={d.city + color}
                center={[d.lat, d.lng]}
                radius={radius}
                fillColor={color}
                fillOpacity={fillOp}
                stroke={false}
            >
              <Tooltip>
                <div>
                  <strong>{d.city}</strong><br/>
                  Temp: {d.average_temperature?.toFixed(1)} °C<br/>
                  Flu: {d.fluCases}<br/>
                  Humidity: {d.humidity?.toFixed(1)}%
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}
        {/* Add the legend control */}
        <CombinedLegendControl 
          tempScale={tempScale}
          minTemp={-15}
          maxTemp={40}
          sizeScale={sizeScale}
          minFlu={0}
          maxFlu={10000}
          opacityScale={opacityScale}
          minHumidity={40}
          maxHumidity={70}
          // You can also pass minHumidity, maxHumidity, etc.
        />
      </MapContainer>
    </div>
  );
}

export default MapVisualization;
