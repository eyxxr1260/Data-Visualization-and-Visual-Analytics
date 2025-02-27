import { useEffect } from 'react';
import L from 'leaflet';
import { useMap } from 'react-leaflet';

/**
 * CombinedLegendControl
 * A Leaflet control at bottom-right that shows:
 *  - Color ramp for Temperature
 *  - Circle size for Flu Cases
 *  - Opacity for Humidity
 */
function CombinedLegendControl({ tempScale, minTemp, maxTemp, sizeScale, minFlu, maxFlu, opacityScale, minHumidity, maxHumidity }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const legendControl = L.control({ position: 'bottomright' });
    legendControl.onAdd = function() {
      const div = L.DomUtil.create('div', 'leaflet-control leaflet-bar');
      div.style.background = 'white';
      div.style.padding = '8px';
      div.style.borderRadius = '4px';
      div.innerHTML = `
        <h4 style="margin: 0 0 6px 0;">Legend</h4>
        
        <!-- 1) Temperature color ramp -->
        <div><strong>Temperature</strong></div>
        <div style="width: 140px; height: 10px; background: ${makeGradientCSS(tempScale, minTemp, maxTemp)}"></div>
        <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
          <span>${minTemp}°C</span>
          <span>${maxTemp}°C</span>
        </div>
        
        <!-- 2) Flu circle size -->
        <div style="margin-bottom:8px;">
          <strong>Flu Cases (Circle Size)</strong>
          <div style="display:flex; align-items:center; margin-top:4px;">
            <svg width="60" height="30">
              <circle cx="15" cy="15" r="5" fill="#999" />
            </svg>
            <span>Min: ${minFlu}</span>
          </div>
          <div style="display:flex; align-items:center;">
            <svg width="60" height="40">
              <circle cx="15" cy="20" r="15" fill="#999" />
            </svg>
            <span>Max: ${maxFlu}</span>
          </div>
        </div>
        
        <!-- 3) Humidity opacity -->
        <div>
          <strong>Humidity (Circle Opacity)</strong>
          <div style="display:flex; align-items:center; margin-top:4px;">
            <svg width="60" height="30">
              <circle cx="15" cy="15" r="10" fill="#999" style="opacity:${opacityScale(minHumidity)}"/>
            </svg>
            <span>Low: ${minHumidity}%</span>
          </div>
          <div style="display:flex; align-items:center;">
            <svg width="60" height="30">
              <circle cx="15" cy="15" r="10" fill="#999" style="opacity:${opacityScale(maxHumidity)}"/>
            </svg>
            <span>High: ${maxHumidity}%</span>
          </div>
        </div>
      `;
      return div;
    };

    legendControl.addTo(map);
    return () => {
      legendControl.remove();
    };
  }, [map, tempScale, minTemp, maxTemp, sizeScale, minFlu, maxFlu, opacityScale]);

  return null;
}

// Use a helper function for the temperature gradient
function makeGradientCSS(scale, minVal, maxVal) {
  const n = 10;
  const step = (maxVal - minVal) / (n - 1);
  let stops = [];
  for (let i = 0; i < n; i++) {
    const val = minVal + i * step;
    const color = scale(val);
    const pct = (i / (n - 1)) * 100;
    stops.push(`${color} ${pct}%`);
  }
  return `linear-gradient(to right, ${stops.join(', ')})`;
}

export default CombinedLegendControl;
