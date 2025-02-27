// WeatherChart.js
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import Papa from 'papaparse';
import './Comparison.css'; 

const Comparison = () => {
  const svgRef = useRef();
  const [year, setYear] = useState('2019');
  const [datatype, setDatatype] = useState('Highest Temperature');
  const [hokkaido, setHokkaido] = useState([]);
  // const [hokkaido2020, setHokkaido2020] = useState([]);
  // const [hokkaido2021, setHokkaido2021] = useState([]);
  // const [hokkaido2022, setHokkaido2022] = useState([]);
  // const [hokkaido2023, setHokkaido2023] = useState([]);
  const [tokyo, setTokyo] = useState([]);
  // const [tokyo2020, setTokyo2020] = useState([]);
  // const [tokyo2021, setTokyo2021] = useState([]);
  // const [tokyo2022, setTokyo2022] = useState([]);
  // const [tokyo2023, setTokyo2023] = useState([]);
  const [osaka, setOsaka] = useState([]);
  // const [osaka2020, setOsaka2020] = useState([]);
  // const [osaka2021, setOsaka2021] = useState([]);
  // const [osaka2022, setOsaka2022] = useState([]);
  // const [osaka2023, setOsaka2023] = useState([]);
  const [showHokkaido, setShowHokkaido] = useState(true);
  const [showTokyo, setShowTokyo] = useState(true);
  const [showOsaka, setShowOsaka] = useState(true);

  const [showHighestTemperature, setShowHighestTemperature] = useState(true);
  const [showTemperature, setShowTemperature] = useState(true);
  const [showLowestTemperature, setShowLowestTemperature] = useState(true);
  const [showHumidity, setShowHumidity] = useState(true);
  const [showRainfall, setShowRainfall] = useState(true);
  const [showSnowfall, setShowSnowfall] = useState(true);

  const locations = ['hokkaido', 'tokyo', 'osaka'];
  const years = ['2019', '2020', '2021', "2022", "2023"]; 
  const datatypes = ["Highest Temperature", "Average Temperature", "Lowest Temperature",
    "Average Humidity", "Rainfall", "Snowfall"
  ]

  useEffect(() => {
    const hokkaidoFilePath = `/data/weather_day_data/${year}_hokkaido_data_preprocess.csv`;
    const tokyoFilePath = `/data/weather_day_data/${year}_tokyo_data_preprocess.csv`;
    const osakaFilePath = `/data/weather_day_data/${year}_osaka_data_preprocess.csv`;
    Papa.parse(hokkaidoFilePath, {
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
        setHokkaido(parsedData);
      },
    });

    Papa.parse(tokyoFilePath, {
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
        setTokyo(parsedData);
      },
    });

    Papa.parse(osakaFilePath, {
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
        setOsaka(parsedData);
      },
    });
  }, [year]);


  useEffect(() => {
    // if ((!showHokkaido && !showTokyo && !showOsaka) || (hokkaido2019.length === 0 && tokyo2019.length === 0 && osaka2019.length === 0)) return;

    // 設置SVG的寬度和高度
    const width = 1120;
    const height = 600;
    const margin = { top: 20, right: 50, bottom: 30, left: 40 };

    // 清空SVG內容
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    svg.append("defs").append("clipPath")
      .attr("id", "clipComparison")
      .append("rect")
      .attr("x", margin.left)
      .attr("y", margin.top)
      .attr("width", width - margin.left - margin.right)
      .attr("height", height - margin.top - margin.bottom);

    const chartAreaComparison = svg.append("g")
      .attr("clip-path", "url(#clipComparison)");

    const combinedData = [...(showHokkaido ? hokkaido : []), ...(showTokyo ? tokyo : []), ...(showOsaka ? osaka : [])];

    const daterange = d3.extent(hokkaido, d => d.date)
    const xScale = d3.scaleTime()
      .domain([d3.timeDay.offset(daterange[0], -1), 
        d3.timeDay.offset(daterange[1], 1)]) // date range +-1
      .range([margin.left, width - margin.right]);

    const yScaleTemp = d3.scaleLinear()
      .domain([
        d3.min(combinedData, d => d.temperature) - 5,
        d3.max(combinedData, d => d.temperature) + 5,
      ])
      .range([height - margin.bottom, margin.top]);
    const yScaleHumidity = d3.scaleLinear()
      .domain([
          d3.min(combinedData, d => d.humidity) - 5,
          d3.max(combinedData, d => d.humidity) + 5,
        ])
        .range([height - margin.bottom, margin.top]);
    const yScaleRainfall = d3.scaleLinear()
      .domain([
          0,
          d3.max(combinedData, d => d.rainfall) + 5,
        ])
        .range([height - margin.bottom, margin.top]);
    const yScaleSnowfall = d3.scaleLinear()
      .domain([
          0,
          d3.max(combinedData, d => d.snowfall) + 5,
        ])
        .range([height - margin.bottom, margin.top]);

    const xAxisGroup = svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).ticks(10).tickFormat(d3.timeFormat('%Y-%m-%d')))
      // .selectAll("text")

    const yAxisGroup = svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScaleTemp));

    const tooltip = d3.select("#tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background-color", "white")
      .style("border", "1px solid #ccc")
      .style("padding", "8px")
      .style("border-radius", "4px");

    if (datatype == "Highest Temperature"){
      const yScale = d3.scaleLinear()
        .domain([
          d3.min(combinedData, d => d.highestTemperature) - 5,
          d3.max(combinedData, d => d.highestTemperature) + 5,
        ])
        .range([height - margin.bottom, margin.top]);
      yAxisGroup.call(d3.axisLeft(yScale));

      const lineGeneratorHighestTemp = d3.line()
        .x(d => xScale(d.date))
        .y(d => yScale(d.highestTemperature))
        .curve(d3.curveMonotoneX);

      if (showHokkaido) {
        chartAreaComparison.append('path')
          .datum(hokkaido)
          .attr("class", "pathTemp")
          .attr('fill', 'none')
          .attr('stroke', 'steelblue')
          .attr('stroke-width', 2)
          .attr('d', lineGeneratorHighestTemp);

          chartAreaComparison.selectAll(".circle1")
          .data(hokkaido)
          .enter()
          .append("circle")
          .attr("class", "circleTemp")
          .attr("cx", d => xScale(d.date))
          .attr("cy", d => yScale(d.highestTemperature))
          .attr("r", 3)
          .attr("fill", "steelblue")
          .on("mouseover", (event, d) => {
            tooltip.style("visibility", "visible")
              .html(`<strong>Hokkaido</strong><br>Date: ${d3.timeFormat('%Y-%m-%d')(d.date)}<br>Temperature: ${d.highestTemperature}°C`);
          })
          .on("mousemove", (event) => {
            tooltip.style("top", (event.pageY - 10) + "px")
              .style("left", (event.pageX + 10) + "px");
          })
          .on("mouseout", () => {
            tooltip.style("visibility", "hidden");
          });
      }

      if (showTokyo) {
        chartAreaComparison.append('path')
          .datum(tokyo)
          .attr("class", "pathTemp")
          .attr('fill', 'none')
          .attr('stroke', 'tomato')
          .attr('stroke-width', 2)
          .attr('d', lineGeneratorHighestTemp);

          chartAreaComparison.selectAll(".circle2")
          .data(tokyo)
          .enter()
          .append("circle")
          .attr("class", "circleTemp")
          .attr("cx", d => xScale(d.date))
          .attr("cy", d => yScale(d.highestTemperature))
          .attr("r", 3)
          .attr("fill", "tomato")
          .on("mouseover", (event, d) => {
            tooltip.style("visibility", "visible")
              .html(`<strong>Tokyo</strong><br>Date: ${d3.timeFormat('%Y-%m-%d')(d.date)}<br>Temperature: ${d.highestTemperature}°C`);
          })
          .on("mousemove", (event) => {
            tooltip.style("top", (event.pageY - 10) + "px")
              .style("left", (event.pageX + 10) + "px");
          })
          .on("mouseout", () => {
            tooltip.style("visibility", "hidden");
          });
      }

      if (showOsaka) {
        chartAreaComparison.append('path')
          .datum(osaka)
          .attr("class", "pathTemp")
          .attr('fill', 'none')
          .attr('stroke', 'green')
          .attr('stroke-width', 2)
          .attr('d', lineGeneratorHighestTemp);

          chartAreaComparison.selectAll(".circle3")
          .data(osaka)
          .enter()
          .append("circle")
          .attr("class", "circleTemp")
          .attr("cx", d => xScale(d.date))
          .attr("cy", d => yScale(d.highestTemperature))
          .attr("r", 3)
          .attr("fill", "green")
          .on("mouseover", (event, d) => {
            tooltip.style("visibility", "visible")
              .html(`<strong>Osaka</strong><br>Date: ${d3.timeFormat('%Y-%m-%d')(d.date)}<br>Temperature: ${d.highestTemperature}°C`);
          })
          .on("mousemove", (event) => {
            tooltip.style("top", (event.pageY - 10) + "px")
              .style("left", (event.pageX + 10) + "px");
          })
          .on("mouseout", () => {
            tooltip.style("visibility", "hidden");
          });
      }

    }

    if (datatype == "Average Temperature"){

      const yScale = d3.scaleLinear()
        .domain([
          d3.min(combinedData, d => d.temperature) - 5,
          d3.max(combinedData, d => d.temperature) + 5,
        ])
        .range([height - margin.bottom, margin.top]);
      yAxisGroup.call(d3.axisLeft(yScale));

      const lineGeneratorTemp = d3.line()
      .x(d => xScale(d.date))
      .y(d => yScale(d.temperature))
      .curve(d3.curveMonotoneX);

      if (showHokkaido) {
        chartAreaComparison.append('path')
          .datum(hokkaido)
          .attr("class", "pathTemp")
          .attr('fill', 'none')
          .attr('stroke', 'steelblue')
          .attr('stroke-width', 2)
          .attr('d', lineGeneratorTemp);

          chartAreaComparison.selectAll(".circle1")
          .data(hokkaido)
          .enter()
          .append("circle")
          .attr("class", "circleTemp")
          .attr("cx", d => xScale(d.date))
          .attr("cy", d => yScale(d.temperature))
          .attr("r", 3)
          .attr("fill", "steelblue")
          .on("mouseover", (event, d) => {
            tooltip.style("visibility", "visible")
              .html(`<strong>Hokkaido</strong><br>Date: ${d3.timeFormat('%Y-%m-%d')(d.date)}<br>Temperature: ${d.temperature}°C`);
          })
          .on("mousemove", (event) => {
            tooltip.style("top", (event.pageY - 10) + "px")
              .style("left", (event.pageX + 10) + "px");
          })
          .on("mouseout", () => {
            tooltip.style("visibility", "hidden");
          });
      }
      if (showTokyo) {
        chartAreaComparison.append('path')
          .datum(tokyo)
          .attr("class", "pathTemp")
          .attr('fill', 'none')
          .attr('stroke', 'tomato')
          .attr('stroke-width', 2)
          .attr('d', lineGeneratorTemp);

          chartAreaComparison.selectAll(".circle2")
          .data(tokyo)
          .enter()
          .append("circle")
          .attr("class", "circleTemp")
          .attr("cx", d => xScale(d.date))
          .attr("cy", d => yScale(d.temperature))
          .attr("r", 3)
          .attr("fill", "tomato")
          .on("mouseover", (event, d) => {
            tooltip.style("visibility", "visible")
              .html(`<strong>Tokyo</strong><br>Date: ${d3.timeFormat('%Y-%m-%d')(d.date)}<br>Temperature: ${d.temperature}°C`);
          })
          .on("mousemove", (event) => {
            tooltip.style("top", (event.pageY - 10) + "px")
              .style("left", (event.pageX + 10) + "px");
          })
          .on("mouseout", () => {
            tooltip.style("visibility", "hidden");
          });
      }
      if (showOsaka) {
        chartAreaComparison.append('path')
          .datum(osaka)
          .attr("class", "pathTemp")
          .attr('fill', 'none')
          .attr('stroke', 'green')
          .attr('stroke-width', 2)
          .attr('d', lineGeneratorTemp);

          chartAreaComparison.selectAll(".circle3")
          .data(osaka)
          .enter()
          .append("circle")
          .attr("class", "circleTemp")
          .attr("cx", d => xScale(d.date))
          .attr("cy", d => yScale(d.temperature))
          .attr("r", 3)
          .attr("fill", "green")
          .on("mouseover", (event, d) => {
            tooltip.style("visibility", "visible")
              .html(`<strong>Osaka</strong><br>Date: ${d3.timeFormat('%Y-%m-%d')(d.date)}<br>Temperature: ${d.temperature}°C`);
          })
          .on("mousemove", (event) => {
            tooltip.style("top", (event.pageY - 10) + "px")
              .style("left", (event.pageX + 10) + "px");
          })
          .on("mouseout", () => {
            tooltip.style("visibility", "hidden");
          });
      }


    }

    if (datatype == "Lowest Temperature"){
      const yScale = d3.scaleLinear()
      .domain([
          d3.min(combinedData, d => d.lowestTemperature) - 5,
          d3.max(combinedData, d => d.lowestTemperature) + 5,
        ])
        .range([height - margin.bottom, margin.top]);
      yAxisGroup.call(d3.axisLeft(yScale));

      const lineGeneratorLowestTemp = d3.line()
      .x(d => xScale(d.date))
      .y(d => yScale(d.lowestTemperature))
      .curve(d3.curveMonotoneX);

      if (showHokkaido) {
        chartAreaComparison.append('path')
          .datum(hokkaido)
          .attr("class", "pathTemp")
          .attr('fill', 'none')
          .attr('stroke', 'steelblue')
          .attr('stroke-width', 2)
          .attr('d', lineGeneratorLowestTemp);

          chartAreaComparison.selectAll(".circle1")
          .data(hokkaido)
          .enter()
          .append("circle")
          .attr("class", "circleTemp")
          .attr("cx", d => xScale(d.date))
          .attr("cy", d => yScale(d.lowestTemperature))
          .attr("r", 3)
          .attr("fill", "steelblue")
          .on("mouseover", (event, d) => {
            tooltip.style("visibility", "visible")
              .html(`<strong>Hokkaido</strong><br>Date: ${d3.timeFormat('%Y-%m-%d')(d.date)}<br>Temperature: ${d.lowestTemperature}°C`);
          })
          .on("mousemove", (event) => {
            tooltip.style("top", (event.pageY - 10) + "px")
              .style("left", (event.pageX + 10) + "px");
          })
          .on("mouseout", () => {
            tooltip.style("visibility", "hidden");
          });
      }

      if (showTokyo) {
        chartAreaComparison.append('path')
          .datum(tokyo)
          .attr("class", "pathTemp")
          .attr('fill', 'none')
          .attr('stroke', 'tomato')
          .attr('stroke-width', 2)
          .attr('d', lineGeneratorLowestTemp);

          chartAreaComparison.selectAll(".circle2")
          .data(tokyo)
          .enter()
          .append("circle")
          .attr("class", "circleTemp")
          .attr("cx", d => xScale(d.date))
          .attr("cy", d => yScale(d.lowestTemperature))
          .attr("r", 3)
          .attr("fill", "tomato")
          .on("mouseover", (event, d) => {
            tooltip.style("visibility", "visible")
              .html(`<strong>Tokyo</strong><br>Date: ${d3.timeFormat('%Y-%m-%d')(d.date)}<br>Temperature: ${d.lowestTemperature}°C`);
          })
          .on("mousemove", (event) => {
            tooltip.style("top", (event.pageY - 10) + "px")
              .style("left", (event.pageX + 10) + "px");
          })
          .on("mouseout", () => {
            tooltip.style("visibility", "hidden");
          });
      }

      if (showOsaka) {
        chartAreaComparison.append('path')
          .datum(osaka)
          .attr("class", "pathTemp")
          .attr('fill', 'none')
          .attr('stroke', 'green')
          .attr('stroke-width', 2)
          .attr('d', lineGeneratorLowestTemp);

          chartAreaComparison.selectAll(".circle3")
          .data(osaka)
          .enter()
          .append("circle")
          .attr("class", "circleTemp")
          .attr("cx", d => xScale(d.date))
          .attr("cy", d => yScale(d.lowestTemperature))
          .attr("r", 3)
          .attr("fill", "green")
          .on("mouseover", (event, d) => {
            tooltip.style("visibility", "visible")
              .html(`<strong>Osaka</strong><br>Date: ${d3.timeFormat('%Y-%m-%d')(d.date)}<br>Temperature: ${d.lowestTemperature}°C`);
          })
          .on("mousemove", (event) => {
            tooltip.style("top", (event.pageY - 10) + "px")
              .style("left", (event.pageX + 10) + "px");
          })
          .on("mouseout", () => {
            tooltip.style("visibility", "hidden");
          });
      }
    }

    if(datatype == "Average Humidity"){
      const yScale = d3.scaleLinear()
      .domain([
          d3.min(combinedData, d => d.humidity) - 5,
          d3.max(combinedData, d => d.humidity) + 5,
        ])
        .range([height - margin.bottom, margin.top]);
      yAxisGroup.call(d3.axisLeft(yScale));

      const lineGeneratorHumidity = d3.line()
        .x(d => xScale(d.date))
        .y(d => yScale(d.humidity))
        .curve(d3.curveMonotoneX);
      if (showHokkaido) {
        chartAreaComparison
          .append('path')
          .datum(hokkaido)
          .attr("class", "pathHumidity")
          .attr('fill', 'none')
          .attr('stroke', 'steelblue')
          .attr('stroke-width', 2)
          .attr('d', lineGeneratorHumidity);

        // svg
        chartAreaComparison
          .selectAll(".circle1")
          .data(hokkaido)
          .enter()
          .append("circle")
          .attr("class", "circleHumidity")
          .attr("cx", d => xScale(d.date))
          .attr("cy", d => yScale(d.humidity))
          .attr("r", 3)
          .attr("fill", "steelblue")
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
      if (showTokyo) {
        chartAreaComparison
          .append('path')
          .datum(tokyo)
          .attr("class", "pathHumidity")
          .attr('fill', 'none')
          .attr('stroke', 'tomato')
          .attr('stroke-width', 2)
          .attr('d', lineGeneratorHumidity);

        // svg
        chartAreaComparison
          .selectAll(".circle2")
          .data(tokyo)
          .enter()
          .append("circle")
          .attr("class", "circleHumidity")
          .attr("cx", d => xScale(d.date))
          .attr("cy", d => yScale(d.humidity))
          .attr("r", 3)
          .attr("fill", "tomato")
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
      if (showOsaka) {
        chartAreaComparison
          .append('path')
          .datum(osaka)
          .attr("class", "pathHumidity")
          .attr('fill', 'none')
          .attr('stroke', 'SeaGreen')
          .attr('stroke-width', 2)
          .attr('d', lineGeneratorHumidity);

        // svg
        chartAreaComparison
          .selectAll(".circle3")
          .data(osaka)
          .enter()
          .append("circle")
          .attr("class", "circleHumidity")
          .attr("cx", d => xScale(d.date))
          .attr("cy", d => yScale(d.humidity))
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

    }

    if(datatype == "Rainfall"){
      const yScale = d3.scaleLinear()
      .domain([
          0,
          d3.max(combinedData, d => d.rainfall) + 5,
        ])
        .range([height - margin.bottom, margin.top]);
      yAxisGroup.call(d3.axisLeft(yScale));

      // const lineGeneratorHumidity = d3.line()
      //   .x(d => xScale(d.date))
      //   .y(d => yScale(d.rainfall))
      //   .curve(d3.curveMonotoneX);
      if (showHokkaido) {
        chartAreaComparison
          .selectAll(".barRainfallHokkaido")
            .data(hokkaido)
            .enter()
            .append("rect")
            .attr("class", "barRainfallHokkaido")
            .attr("x", d => xScale(d.date) - 1.5)
            .attr("y", d => yScale(d.rainfall))
            .attr("width", 1)
            .attr("height", d => height - margin.bottom - yScale(d.rainfall))
            .attr("fill", "steelblue")
            // // .attr("stroke", "purple")
            // .attr("stroke-width", "0.3")
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
      if (showTokyo) {
        chartAreaComparison
        .selectAll(".barRainfallTokyo")
          .data(tokyo)
          .enter()
          .append("rect")
          .attr("class", "barRainfallTokyo")
          .attr("x", d => xScale(d.date)-0.5)
          .attr("y", d => yScale(d.rainfall))
          .attr("width", 1)
          .attr("height", d => height - margin.bottom - yScale(d.rainfall))
          .attr("fill", "tomato")
          // // .attr("stroke", "purple")
          // .attr("stroke-width", "0.3")
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
      if (showOsaka) {
        chartAreaComparison
        .selectAll(".barRainfallOsaka")
          .data(osaka)
          .enter()
          .append("rect")
          .attr("class", "barRainfallOsaka")
          .attr("x", d => xScale(d.date) + 0.5)
          .attr("y", d => yScale(d.rainfall))
          .attr("width", 1)
          .attr("height", d => height - margin.bottom - yScale(d.rainfall))
          .attr("fill", "SeaGreen")
          // // .attr("stroke", "purple")
          // .attr("stroke-width", "0.3")
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

    }

    if(datatype == "Snowfall"){
      const yScale = d3.scaleLinear()
      .domain([
          0,
          d3.max(combinedData, d => d.snowfall) + 5,
        ])
        .range([height - margin.bottom, margin.top]);
      yAxisGroup.call(d3.axisLeft(yScale));

      if (showHokkaido) {
        chartAreaComparison
          .selectAll(".barSnowfallHokkaido")
            .data(hokkaido)
            .enter()
            .append("rect")
            .attr("class", "barSnowfallHokkaido")
            .attr("x", d => xScale(d.date) - 1.5)
            .attr("y", d => yScale(d.snowfall))
            .attr("width", 1)
            .attr("height", d => height - margin.bottom - yScale(d.snowfall))
            .attr("fill", "steelblue")
            // // .attr("stroke", "purple")
            // .attr("stroke-width", "0.3")
            .on("mouseover", (event, d) => {
              tooltip.style("visibility", "visible")
                .html(`<strong>Snowfall</strong><br>Date: ${d3.timeFormat('%Y-%m-%d')(d.date)}<br>Snowfall: ${d.snowfall} cm`);
            })
            .on("mousemove", (event) => {
              tooltip.style("top", (event.pageY-20) + "px")
                .style("left", (event.pageX + 10) + "px");
            })
            .on("mouseout", () => {
              tooltip.style("visibility", "hidden");
            });
      }
      if (showTokyo) {
        chartAreaComparison
        .selectAll(".barSnowfallTokyo")
          .data(tokyo)
          .enter()
          .append("rect")
          .attr("class", "barSnowfallTokyo")
          .attr("x", d => xScale(d.date)-0.5)
          .attr("y", d => yScale(d.snowfall))
          .attr("width", 1)
          .attr("height", d => height - margin.bottom - yScale(d.snowfall))
          .attr("fill", "tomato")
          // // .attr("stroke", "purple")
          // .attr("stroke-width", "0.3")
          .on("mouseover", (event, d) => {
            tooltip.style("visibility", "visible")
              .html(`<strong>Snowfall</strong><br>Date: ${d3.timeFormat('%Y-%m-%d')(d.date)}<br>Snowfall: ${d.snowfall} cm`);
          })
          .on("mousemove", (event) => {
            tooltip.style("top", (event.pageY-20) + "px")
              .style("left", (event.pageX + 10) + "px");
          })
          .on("mouseout", () => {
            tooltip.style("visibility", "hidden");
          });
      }
      if (showOsaka) {
        chartAreaComparison
        .selectAll(".barSnowOsaka")
          .data(osaka)
          .enter()
          .append("rect")
          .attr("class", "barSnowOsaka")
          .attr("x", d => xScale(d.date) + 0.5)
          .attr("y", d => yScale(d.snowfall))
          .attr("width", 1)
          .attr("height", d => height - margin.bottom - yScale(d.snowfall))
          .attr("fill", "SeaGreen")
          // // .attr("stroke", "purple")
          // .attr("stroke-width", "0.3")
          .on("mouseover", (event, d) => {
            tooltip.style("visibility", "visible")
              .html(`<strong>Snowfall</strong><br>Date: ${d3.timeFormat('%Y-%m-%d')(d.date)}<br>Snow: ${d.snowfall} cm`);
          })
          .on("mousemove", (event) => {
            tooltip.style("top", (event.pageY-20) + "px")
              .style("left", (event.pageX + 10) + "px");
          })
          .on("mouseout", () => {
            tooltip.style("visibility", "hidden");
          });
      }

    }

    const zoom = d3.zoom()
      .scaleExtent([1, 10])
      .translateExtent([[margin.left, margin.top], [width-margin.right, height-margin.top]])
      .extent([[margin.left, margin.top], [width-margin.right, height-margin.top]])
      .on('zoom', (event) => {
        const transform = event.transform;
        const newXScale = transform.rescaleX(xScale);

        xAxisGroup.call(d3.axisBottom(newXScale));

        chartAreaComparison.selectAll('.pathTemp')
          .attr('d', d3.line()
            .x(d => newXScale(d.date))
            .y(d => yScaleTemp(d.temperature))
            .curve(d3.curveMonotoneX))

        chartAreaComparison.selectAll('.pathHumidity')
          .attr('d', d3.line()
            .x(d => newXScale(d.date))
            .y(d => yScaleHumidity(d.humidity))
            .curve(d3.curveMonotoneX))

        chartAreaComparison.selectAll('.circleTemp')
          .attr('cy', d => yScaleTemp(d.temperature))
          .attr('cx', d => newXScale(d.date))
          .attr("r", Math.max(3,event.transform.k*0.7));

        chartAreaComparison.selectAll('.circleHumidity')
          .attr('cy', d => yScaleHumidity(d.humidity))
          .attr('cx', d => newXScale(d.date))
          .attr("r", Math.max(3,event.transform.k*0.7));

        chartAreaComparison.selectAll('.barRainfallHokkaido')
          .attr('y', d => yScaleRainfall(d.rainfall))
          .attr('height', d => height - margin.bottom - yScaleRainfall(d.rainfall))
          .attr('x', d => newXScale(d.date)-event.transform.k*1.5)
          .attr("width", event.transform.k);
        chartAreaComparison.selectAll('.barRainfallTokyo')
          .attr('y', d => yScaleRainfall(d.rainfall))
          .attr('height', d => height - margin.bottom - yScaleRainfall(d.rainfall))
          .attr('x', d => newXScale(d.date)-event.transform.k*0.5)
          .attr("width", event.transform.k);
        chartAreaComparison.selectAll('.barRainfallOsaka')
          .attr('y', d => yScaleRainfall(d.rainfall))
          .attr('height', d => height - margin.bottom - yScaleRainfall(d.rainfall))
          .attr('x', d => newXScale(d.date)+event.transform.k*0.5)
          .attr("width", event.transform.k);
        // console.log(event.transform.k)

        chartAreaComparison.selectAll('.barSnowfallHokkaido')
        .attr('y', d => yScaleSnowfall(d.snowfall))
        .attr('height', d => height - margin.bottom - yScaleSnowfall(d.snowfall))
        .attr('x', d => newXScale(d.date)-event.transform.k*1.5)
        .attr("width", event.transform.k);
      chartAreaComparison.selectAll('.barSnowfallTokyo')
        .attr('y', d => yScaleSnowfall(d.snowfall))
        .attr('height', d => height - margin.bottom - yScaleSnowfall(d.snowfall))
        .attr('x', d => newXScale(d.date)-event.transform.k*0.5)
        .attr("width", event.transform.k);
      chartAreaComparison.selectAll('.barSnowfallOsaka')
        .attr('y', d => yScaleSnowfall(d.snowfall))
        .attr('height', d => height - margin.bottom - yScaleSnowfall(d.snowfall))
        .attr('x', d => newXScale(d.date)+event.transform.k*0.5)
        .attr("width", event.transform.k);
      // console.log(event.transform.k)
        // chartArea.selectAll('.barSnowfall')
        //   .attr('y', d => yScaleRainfall(d.snowfall))
        //   .attr('height', d => height - margin.bottom - yScaleRainfall(d.snowfall))
        //   .attr('x', d => newXScale(d.date)+1.5);
    });

  svg.call(zoom);
    

  }, [hokkaido, tokyo, osaka, showHokkaido, showTokyo, showOsaka, datatype]);

  return (
    <div className="comparison-container">
      <h1>Weather Comparison</h1>

      <div className="comparison-controls">
        <label>Choose Year: </label>
        <select 
          className="comparison-select" 
          value={year} 
          onChange={(e) => setYear(e.target.value)}
        >
          <option value="">Select a year</option>
          {years.map(loc => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
      </div>
      <div className="comparison-controls">
        <label>Choose Data: </label>
        <select 
          className="comparison-select" 
          value={datatype} 
          onChange={(e) => setDatatype(e.target.value)}
        >
          <option value="">Select a datatype</option>
          {datatypes.map(loc => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
      </div>
      <div>
        <label style={{ color: 'steelblue' ,fontWeight: 'bold'}}>
          <input
            type="checkbox"
            checked={showHokkaido}
            onChange={() => setShowHokkaido(!showHokkaido)}
          />
          Show data about Hokkaido &nbsp;
        </label>
        <label style={{ color: 'tomato' ,fontWeight: 'bold'}}>
          <input
            type="checkbox"
            checked={showTokyo}
            onChange={() => setShowTokyo(!showTokyo)}
          />
          Show data about Tokyo &nbsp;
        </label>
        <label style={{ color: 'green' ,fontWeight: 'bold'}}>
          <input
            type="checkbox"
            checked={showOsaka}
            onChange={() => setShowOsaka(!showOsaka)}
          />
          Show data about Osaka&nbsp;
        </label>
      </div>
      <div style={{ overflowX: 'auto' }}>
      <svg ref={svgRef}></svg>
    </div>
      <div id="tooltip"></div>
      <div>
        <span style={{ color: 'steelblue' }}>Hokkaido</span> &nbsp;|&nbsp;
        <span style={{ color: 'tomato' }}>Tokyo</span> &nbsp;|&nbsp;
        <span style={{ color: 'green' }}>Osaka</span>
      </div>
    </div>
  );
};

export default Comparison;