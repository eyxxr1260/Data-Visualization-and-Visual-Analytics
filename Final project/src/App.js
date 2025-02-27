import React, { useEffect, useState } from 'react';
import * as d3 from 'd3';
import MapVisualization from './components/MapVisualization';
import TimeSlider from './components/TimeSlider';
import Overall from './components/Overall.jsx';
import Comparison from './components/Comparison.jsx';
import InfluenzaChart from './components/InfluenzaChart.jsx';
import InfluenzaChartComparison from './components/InfluenzaChartComparison.jsx';
import './components/TimeSlider.css';
import Mix from './components/Mix.jsx'

// 新增以下兩行：引入 React-Bootstrap 的 Tabs, Tab 組件，以及 Bootstrap 的 CSS
import { Tabs, Tab } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import './App.css';

// Cities & years we want to load for weather data
const WEATHER_PATHS = [
  // Hokkaido
  { city: 'Hokkaido', year: 2019, path: '/data/2019_hokkaido_week_data_preprocess.csv' },
  { city: 'Hokkaido', year: 2020, path: '/data/2020_hokkaido_week_data_preprocess.csv' },
  { city: 'Hokkaido', year: 2021, path: '/data/2021_hokkaido_week_data_preprocess.csv' },
  { city: 'Hokkaido', year: 2022, path: '/data/2022_hokkaido_week_data_preprocess.csv' },
  { city: 'Hokkaido', year: 2023, path: '/data/2023_hokkaido_week_data_preprocess.csv' },

  // Tokyo
  { city: 'Tokyo', year: 2019, path: '/data/2019_tokyo_week_data_preprocess.csv' },
  { city: 'Tokyo', year: 2020, path: '/data/2020_tokyo_week_data_preprocess.csv' },
  { city: 'Tokyo', year: 2021, path: '/data/2021_tokyo_week_data_preprocess.csv' },
  { city: 'Tokyo', year: 2022, path: '/data/2022_tokyo_week_data_preprocess.csv' },
  { city: 'Tokyo', year: 2023, path: '/data/2023_tokyo_week_data_preprocess.csv' },

  // Osaka
  { city: 'Osaka', year: 2019, path: '/data/2019_osaka_week_data_preprocess.csv' },
  { city: 'Osaka', year: 2020, path: '/data/2020_osaka_week_data_preprocess.csv' },
  { city: 'Osaka', year: 2021, path: '/data/2021_osaka_week_data_preprocess.csv' },
  { city: 'Osaka', year: 2022, path: '/data/2022_osaka_week_data_preprocess.csv' },
  { city: 'Osaka', year: 2023, path: '/data/2023_osaka_week_data_preprocess.csv' },
];

// For influenza data, we assume 3 big CSVs for 2019–2023
const FLU_PATHS = [
  { city: 'Hokkaido', path: '/data/hokkaido_influ_2019_2023_preprocess.csv' },
  { city: 'Tokyo', path: '/data/tokyo_influ_2019_2023_preprocess.csv' },
  { city: 'Osaka', path: '/data/osaka_influ_2019_2023_preprocess.csv' },
];

// Coordinates for the three main cities
const cityCoordinates = {
  Hokkaido: { lat: 43.0618, lng: 141.3545 },
  Tokyo:    { lat: 35.6895, lng: 139.6917 },
  Osaka:    { lat: 34.6937, lng: 135.5022 }
};

// Generate (year, week) pairs for 2019–2023, weeks 1..52 (或 53, 視實際需要做調整)
function generateYearWeekPairs() {
  const pairs = [];
  for (let year = 2019; year <= 2023; year++) {
    // 這裡預設 52 週，如需要到 53 週則請自行調整
    for (let week = 1; week <= 52; week++) {
      pairs.push({ year, week });
    }
  }
  return pairs;
}

function App() {
  const [allWeatherData, setAllWeatherData] = useState([]);
  const [allFluData, setAllFluData] = useState([]);

  // For the time slider, we'll have an index [0..N-1], which corresponds to a particular {year, week}.
  const allYearWeek = generateYearWeekPairs(); // array of {year, week}
  const [currentIndex, setCurrentIndex] = useState(0);
  // Is the slider playing?
  const [isPlaying, setIsPlaying] = useState(false);

  //-----------------------------------------------------------
  // 1) On mount, load all the weather and flu CSV files
  //-----------------------------------------------------------
  useEffect(() => {
    // 1. Load weather data
    const weatherPromises = WEATHER_PATHS.map(info => 
      d3.csv(process.env.PUBLIC_URL + info.path).then(rows => {
        // parse numeric fields, attach city & year
        rows.forEach(d => {
          d.city = info.city;
          d.year = info.year;
          d.week = +d.week;
          d.highest_temperature  = +d.highest_temperature;
          d.lowest_temperature   = +d.lowest_temperature;
          d.average_temperature  = +d.average_temperature;
          d.precipitation        = +d.precipitation;
          d.snowfall             = +d.snowfall;
          d.humidity             = +d.humidity;
        });
        return rows;
      })
    );

    // 2. Load flu data
    const fluPromises = FLU_PATHS.map(info =>
      d3.csv(process.env.PUBLIC_URL + info.path).then(rows => {
        // 依照不同城市的欄位名稱做對應
        if (info.city === 'Hokkaido') {
          rows.forEach(d => {
            d.city = 'Hokkaido';
            d.year = +d['報告年'];  
            d.week = +d['報告週'];
            d.total_flu = +d['合計'] || 0;
          });
        } else {
          // Tokyo & Osaka 假設都是 "年", "週", "合計"
          rows.forEach(d => {
            d.city = info.city;
            d.year = +d['年'];
            d.week = +d['週'];
            d.total_flu = +d['合計'] || 0;
          });
        }
        return rows;
      })
    );

    Promise.all([
      Promise.all(weatherPromises), 
      Promise.all(fluPromises)
    ]).then(([weatherResults, fluResults]) => {
      // Flatten them into one array
      const combinedWeather = weatherResults.flat(); 
      const combinedFlu = fluResults.flat();

      setAllWeatherData(combinedWeather);
      setAllFluData(combinedFlu);
    });
  }, []);

  // 2) Timer effect: if isPlaying = true, automatically increment currentIndex every second.
  useEffect(() => {
    let timerId;
    if (isPlaying) {
      timerId = setInterval(() => {
        setCurrentIndex(prev => {
          // 如果已達最後一筆，預設迴圈回到第一筆，也可自行調整
          if (prev >= allYearWeek.length - 1) {
            return 0;  
          } else {
            return prev + 1;
          }
        });
      }, 1000);
    }

    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [isPlaying, allYearWeek.length]);

  // 3) Derive the selected (year, week) from currentIndex
  const { year: selectedYear, week: selectedWeek } = allYearWeek[currentIndex] || {};

  // 4) Filter data for (selectedYear, selectedWeek), then merge by city
  const filteredWeather = allWeatherData.filter(
    d => d.year === selectedYear && d.week === selectedWeek
  );
  const filteredFlu = allFluData.filter(
    d => d.year === selectedYear && d.week === selectedWeek
  );
  const cities = ['Hokkaido','Tokyo','Osaka'];
  const combinedData = cities.map(city => {
    const w = filteredWeather.find(d => d.city === city);
    const f = filteredFlu.find(d => d.city === city);
    return {
      city,
      lat: cityCoordinates[city].lat,
      lng: cityCoordinates[city].lng,
      average_temperature: w ? w.average_temperature : undefined,
      humidity: w ? w.humidity : undefined,
      fluCases: f ? f.total_flu : 0
    };
  });

  // 5) Render
  return (
    
    <div className="app-container">
     <div id="tooltip"></div> 
          <Tabs defaultActiveKey="map" id="visualization-tabs" className="mb-3 custom-tabs">
            {/* 第 1 頁：地圖視覺化 */}
            <Tab eventKey="map" title="Map Visualization">
            <h1>Japan Flu & Weather Visualization</h1>
            <TimeSlider
            currentIndex={currentIndex}
            setCurrentIndex={setCurrentIndex}
            maxIndex={allYearWeek.length - 1}
            selectedYear={selectedYear}
            selectedWeek={selectedWeek}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
          />
          <MapVisualization data={combinedData} />
        </Tab>

        <Tab eventKey="overall" title="Overall Weather Data">
          <Overall />
        </Tab>

        <Tab eventKey="comparison" title="Weather Comparison">
          <Comparison />
        </Tab>

        <Tab eventKey="influenzaChart" title="Influenza Cases Grouped by Age">
          <InfluenzaChart />
        </Tab>

        <Tab eventKey="influenzaChartComparison" title="Influenza Chart Comparison">
          <InfluenzaChartComparison />
        </Tab>
        <Tab eventKey="Mix" title="All Data Comparison">
          <Mix />
        </Tab>
      </Tabs>
    </div>
  );
}

export default App;
