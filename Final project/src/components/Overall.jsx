import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import Papa from 'papaparse';
import './Comparison.css'; 


const Overall = () => {
  const svgRef = useRef();
  const [location, setLocation] = useState('hokkaido');
  const [year, setYear] = useState('2019');
  const [data, setData] = useState([]);
  const [showHighestTemperature, setShowHighestTemperature] = useState(true);
  const [showTemperature, setShowTemperature] = useState(true);
  const [showLowestTemperature, setShowLowestTemperature] = useState(true);
  const [showHumidity, setShowHumidity] = useState(true);
  const [showRainfall, setShowRainfall] = useState(true);
  const [showSnowfall, setShowSnowfall] = useState(true);

  const locations = ['hokkaido', 'tokyo', 'osaka'];
  const years = ['2019', '2020', '2021', "2022", "2023"]; 

  useEffect(() => {
    if (!location) return; 
    if (!year) return;

    const filePath = `/data/weather_day_data/${year}_${location}_data_preprocess.csv`;
    Papa.parse(filePath, {
      download: true,
      header: true,
      complete: (result) => {
        const parsedData = result.data.map(item => ({
          date: d3.timeParse('%Y/%m/%d')(item["年月日"]),
          temperature: parseFloat(item["平均気温(℃)"]),
          highestTemperature: parseFloat(item["最高気温(℃)"]),
          lowestTemperature: parseFloat(item["最低気温(℃)"]),
          humidity: parseFloat(item['平均湿度(％)']),
          rainfall: parseFloat(item['降水量の合計(mm)']),
          snowfall: parseFloat(item['降雪量合計(cm)'])
        }));
        setData(parsedData);
      },
    });
  }, [location, year]);

  useEffect(() => {
    if (data.length === 0) return;

    const width = 1120;
    const height = 600;
    const margin = { top: 20, right: 50, bottom: 30, left: 40 };

    // remove all element
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    svg.append("defs").append("clipPath")
      .attr("id", "clipAll")
      .append("rect")
      .attr("x", margin.left)
      .attr("y", margin.top)
      .attr("width", width - margin.left - margin.right)
      .attr("height", height - margin.top - margin.bottom);

    const chartArea = svg.append("g")
      .attr("clip-path", "url(#clipAll)");

    const daterange = d3.extent(data, d => d.date)

    // x-axis: date
    const xScale = d3.scaleTime()
      .domain([d3.timeDay.offset(daterange[0], -1), 
      d3.timeDay.offset(daterange[1], 1)]) // date range +-1
      .range([margin.left, width - margin.right]);

    // left side y-axis: temperature and humidity
    const yScaleTempHum = d3.scaleLinear()
      .domain([
        d3.min(data, d => Math.min(d.temperature)) - 5,
        d3.max(data, d => Math.max(d.temperature, d.humidity)) + 5,
      ])
      .range([height - margin.bottom, margin.top]);

    // right side y-axis: rain and snow
    const yScaleRainfall = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.rainfall) + 10])
      .range([height - margin.bottom, margin.top]);

    const tooltip = d3.select("#tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background-color", "white")
      .style("border", "1px solid #ccc")
      .style("padding", "8px")
      .style("border-radius", "4px");

    const lineGeneratorHighestTemp = d3.line()
      .x(d => xScale(d.date))
      .y(d => yScaleTempHum(d.highestTemperature))
      .curve(d3.curveMonotoneX);
    const lineGeneratorTemp = d3.line()
      .x(d => xScale(d.date))
      .y(d => yScaleTempHum(d.temperature))
      .curve(d3.curveMonotoneX);
    const lineGeneratorLowestTemp = d3.line()
      .x(d => xScale(d.date))
      .y(d => yScaleTempHum(d.lowestTemperature))
      .curve(d3.curveMonotoneX);

    const lineGeneratorHumidity = d3.line()
      .x(d => xScale(d.date))
      .y(d => yScaleTempHum(d.humidity))
      .curve(d3.curveMonotoneX);

    if (showRainfall) {
      // svg
      chartArea
      .selectAll(".barRainfall")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "barRainfall")
        .attr("x", d => xScale(d.date) - 2)
        .attr("y", d => yScaleRainfall(d.rainfall))
        .attr("width", 2)
        .attr("height", d => height - margin.bottom - yScaleRainfall(d.rainfall))
        .attr("fill", "silver")
        .on("mouseover", (event, d) => {
          tooltip.style("visibility", "visible")
            .html(`<strong>Rainfall</strong><br>Date: ${d3.timeFormat('%Y-%m-%d')(d.date)}<br>Rainfall: ${d.rainfall} mm`);
        })
        .on("mousemove", (event) => {
          tooltip.style("top", (event.pageY-20) + "px")
            .style("left", (event.pageX + 10) + "px");
        })
        .on("mouseout", () => {
          tooltip.style("visibility", "hidden");
        });
    }
    if (showSnowfall) {
      // svg
      chartArea
      .selectAll(".barSnowfall")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "barSnowfall")
        .attr("x", d => xScale(d.date))
        .attr("y", d => yScaleRainfall(d.snowfall))
        .attr("width", 2)
        .attr("height", d => height - margin.bottom - yScaleRainfall(d.snowfall))
        .attr("fill", "white")
        .attr("stroke", "black")
        .attr("stroke-width", "0.5")
        .on("mouseover", (event, d) => {
          tooltip.style("visibility", "visible")
            .html(`<strong>Snowfall</strong><br>Date: ${d3.timeFormat('%Y-%m-%d')(d.date)}<br>Snowfall: ${d.snowfall} cm`);
        })
        .on("mousemove", (event) => {
          tooltip.style("top", (event.pageY - 10) + "px")
            .style("left", (event.pageX + 10) + "px");
        })
        .on("mouseout", () => {
          tooltip.style("visibility", "hidden");
        });
    }

    if (showHighestTemperature) {
      chartArea
        .append('path')
        .datum(data)
        .attr("class", "pathHighestTemp")
        .attr('fill', 'none')
        .attr('stroke', 'red')
        .attr('stroke-width', 2)
        .attr('d', lineGeneratorHighestTemp);

      // svg
      chartArea
        .selectAll(".circleHighestTemp")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "circleHighestTemp")
        .attr("cx", d => xScale(d.date))
        .attr("cy", d => yScaleTempHum(d.highestTemperature))
        .attr("r", 3)
        .attr("fill", "red")
        .on("mouseover", (event, d) => {
          tooltip.style("visibility", "visible")
            .html(`<strong>Temperature</strong><br>Date: ${d3.timeFormat('%Y-%m-%d')(d.date)}<br>Temp: ${d.highestTemperature}°C`);
        })
        .on("mousemove", (event) => {
          tooltip.style("top", (event.pageY - 10) + "px")
            .style("left", (event.pageX + 10) + "px");
        })
        .on("mouseout", () => {
          tooltip.style("visibility", "hidden");
        });
    }
    if (showTemperature) {
      chartArea
        .append('path')
        .datum(data)
        .attr("class", "pathTemp")
        .attr('fill', 'none')
        .attr('stroke', 'orange')
        .attr('stroke-width', 2)
        .attr('d', lineGeneratorTemp);

      // svg
      chartArea
        .selectAll(".circleTemp")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "circleTemp")
        .attr("cx", d => xScale(d.date))
        .attr("cy", d => yScaleTempHum(d.temperature))
        .attr("r", 3)
        .attr("fill", "orange")
        .on("mouseover", (event, d) => {
          tooltip.style("visibility", "visible")
            .html(`<strong>Temperature</strong><br>Date: ${d3.timeFormat('%Y-%m-%d')(d.date)}<br>Temp: ${d.temperature}°C`);
        })
        .on("mousemove", (event) => {
          tooltip.style("top", (event.pageY - 10) + "px")
            .style("left", (event.pageX + 10) + "px");
        })
        .on("mouseout", () => {
          tooltip.style("visibility", "hidden");
        });
    }
    if (showLowestTemperature) {
      chartArea
        .append('path')
        .datum(data)
        .attr("class", "pathLowestTemp")
        .attr('fill', 'none')
        .attr('stroke', 'steelblue')
        .attr('stroke-width', 2)
        .attr('d', lineGeneratorLowestTemp);

      // svg
      chartArea
        .selectAll(".circleLowestTemp")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "circleLowestTemp")
        .attr("cx", d => xScale(d.date))
        .attr("cy", d => yScaleTempHum(d.lowestTemperature))
        .attr("r", 3)
        .attr("fill", "steelblue")
        .on("mouseover", (event, d) => {
          tooltip.style("visibility", "visible")
            .html(`<strong>Temperature</strong><br>Date: ${d3.timeFormat('%Y-%m-%d')(d.date)}<br>Temp: ${d.lowestTemperature}°C`);
        })
        .on("mousemove", (event) => {
          tooltip.style("top", (event.pageY - 10) + "px")
            .style("left", (event.pageX + 10) + "px");
        })
        .on("mouseout", () => {
          tooltip.style("visibility", "hidden");
        });
    }

    if (showHumidity) {
      // svg
      chartArea
        .append('path')
        .datum(data)
        .attr("class", "pathHumidity")
        .attr('fill', 'none')
        .attr('stroke', 'SeaGreen')
        .attr('stroke-width', 2)
        .attr('d', lineGeneratorHumidity);

      // svg
      chartArea
        .selectAll(".circleHumidity")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "circleHumidity")
        .attr("cx", d => xScale(d.date))
        .attr("cy", d => yScaleTempHum(d.humidity))
        .attr("r", 3)
        .attr("fill", "SeaGreen")
        .on("mouseover", (event, d) => {
          tooltip.style("visibility", "visible")
            .html(`<strong>Humidity</strong><br>Date: ${d3.timeFormat('%Y-%m-%d')(d.date)}<br>Humidity: ${d.humidity}%`);
        })
        .on("mousemove", (event) => {
          tooltip.style("top", (event.pageY - 10) + "px")
            .style("left", (event.pageX + 10) + "px");
        })
        .on("mouseout", () => {
          tooltip.style("visibility", "hidden");
        });
    }

    const xAxisGroup = svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale));

    const yAxisGroupLeft = svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScaleTempHum).ticks(10));

    const yAxisGroupRight = svg.append('g')
      .attr('transform', `translate(${width - margin.right},0)`)
      .call(d3.axisRight(yScaleRainfall).ticks(10));

    const zoom = d3.zoom()
      .scaleExtent([1, 10])
      .translateExtent([[margin.left, margin.top], [width-margin.right, height-margin.top]])
      .extent([[margin.left, margin.top], [width-margin.right, height-margin.top]])
      .on('zoom', (event) => {
        const transform = event.transform;
        const newXScale = transform.rescaleX(xScale);

        xAxisGroup.call(d3.axisBottom(newXScale));

        chartArea.selectAll('.pathHighestTemp')
          .attr('d', d3.line()
            .x(d => newXScale(d.date))
            .y(d => yScaleTempHum(d.highestTemperature))
            .curve(d3.curveMonotoneX))
        chartArea.selectAll('.pathTemp')
          .attr('d', d3.line()
            .x(d => newXScale(d.date))
            .y(d => yScaleTempHum(d.temperature))
            .curve(d3.curveMonotoneX))
        chartArea.selectAll('.pathLowestTemp')
          .attr('d', d3.line()
            .x(d => newXScale(d.date))
            .y(d => yScaleTempHum(d.lowestTemperature))
            .curve(d3.curveMonotoneX))

        chartArea.selectAll('.pathHumidity')
            .attr('d', d3.line()
              .x(d => newXScale(d.date))
              .y(d => yScaleTempHum(d.humidity))
              .curve(d3.curveMonotoneX))

        chartArea.selectAll('.circleHighestTemp')
          .attr('cy', d => yScaleTempHum(d.highestTemperature))
          .attr('cx', d => newXScale(d.date))
          .attr("r", Math.max(3,event.transform.k*0.7));
          chartArea.selectAll('.circleTemp')
          .attr('cy', d => yScaleTempHum(d.temperature))
          .attr('cx', d => newXScale(d.date))
          .attr("r", Math.max(3,event.transform.k*0.7));
        chartArea.selectAll('.circleLowestTemp')
          .attr('cy', d => yScaleTempHum(d.lowestTemperature))
          .attr('cx', d => newXScale(d.date))
          .attr("r", Math.max(3,event.transform.k*0.7));

        chartArea.selectAll('.circleHumidity')
          .attr('cy', d => yScaleTempHum(d.humidity))
          .attr('cx', d => newXScale(d.date))
          .attr("r", Math.max(3,event.transform.k));

        chartArea.selectAll('.barRainfall')
          .attr('y', d => yScaleRainfall(d.rainfall))
          .attr('height', d => height - margin.bottom - yScaleRainfall(d.rainfall))
          .attr('x', d => newXScale(d.date)-event.transform.k*2)
          .attr("width", event.transform.k*2);

        chartArea.selectAll('.barSnowfall')
          .attr('y', d => yScaleRainfall(d.snowfall))
          .attr('height', d => height - margin.bottom - yScaleRainfall(d.snowfall))
          .attr('x', d => newXScale(d.date))
          .attr("width", event.transform.k*2);
      });

    svg.call(zoom);

  }, [data, showHighestTemperature, showTemperature, showLowestTemperature, showHumidity, showRainfall, showSnowfall]);

  return (
    <div className="comparison-container">
      <h1>Overall Weather Data</h1>
      <div className="comparison-controls">
        <label>Choose Location: </label>
        <select className="comparison-select"  value={location} onChange={(e) => setLocation(e.target.value)}>
          <option value="">Select a location</option>
          {locations.map(loc => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
      </div>
      <div className="comparison-controls">
        <label>Choose Year: </label>
        <select className="comparison-select" value={year} onChange={(e) => setYear(e.target.value)}>
          <option value="">Select a year</option>
          {years.map(loc => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
      </div>
      <div>
        <label style={{color: 'tomato', fontWeight: 'bold'}}>
          <input
            type="checkbox"
            checked={showHighestTemperature}
            onChange={() => setShowHighestTemperature(!showHighestTemperature)}
          />
          Highest Temperature (℃)
        </label>
        <label style={{color: 'orange', fontWeight: 'bold'}}>
          <input
            type="checkbox"
            checked={showTemperature}
            onChange={() => setShowTemperature(!showTemperature)}
          />
          Average Temperature (℃)
        </label>
        <label style={{color: 'steelblue', fontWeight: 'bold'}}>
          <input
            type="checkbox"
            checked={showLowestTemperature}
            onChange={() => setShowLowestTemperature(!showLowestTemperature)}
          />
          Lowest Temperature (℃)
        </label>
        <label style={{color: 'SeaGreen', fontWeight: 'bold'}}>
          <input
            type="checkbox"
            checked={showHumidity}
            onChange={() => setShowHumidity(!showHumidity)}
          />
          Average Humidity (％)
        </label>
        <label style={{ color: 'silver', fontWeight: 'bold'}}>
          <input
            type="checkbox"
            checked={showRainfall}
            onChange={() => setShowRainfall(!showRainfall)}
          />
          Rainfall (mm)
        </label>
        <label style={{color: 'white', fontWeight: 'bold', WebkitTextStroke: "0.8px black"}}>
          <input
            type="checkbox"
            checked={showSnowfall}
            onChange={() => setShowSnowfall(!showSnowfall)}
          />
          Snowfall(cm)
        </label>
      </div>
      <div style={{ overflowX: 'auto' }}>
      <svg ref={svgRef}></svg>
    </div>
      <div id="tooltip"></div>
      {/* <div>
        <span style={{ color: 'SeaGreen' }}>Average Humidity (％)</span> &nbsp;|&nbsp;
        <span style={{ color: 'tomato' }}>Highest Temperature (℃)</span> &nbsp;|&nbsp;
        <span style={{ color: 'orange' }}>Average Temperature (℃)</span> &nbsp;|&nbsp;
        <span style={{ color: 'steelblue' }}>Lowest Temperature (℃)</span> &nbsp;|&nbsp;
        <span style={{ color: 'lightgray' }}>Rainfall (mm)</span> &nbsp;|&nbsp;
        <span style={{ color: 'black' }}>Snowfall (cm)</span>
      </div> */}
    </div>
  );
};

export default Overall;
