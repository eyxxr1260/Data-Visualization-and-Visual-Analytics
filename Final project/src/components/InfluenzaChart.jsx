// InfluenzaChart.js
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import './Comparison.css'; 

const InfluenzaChart = () => {
  const svgRef = useRef();
  const [location, setLocation] = useState('tokyo');
  const [selectedYear, setSelectedYear] = useState("2019");

  const locations = ['hokkaido', 'tokyo'];
  const translate = {'zero': "~9 yeas old", 'one': "10~19 years old", 
    'two': "20~29 years old", 'three': "30~39 years old", "four": "40~49 years old",
    'five': "50~59 years old", 'six': "60~69 years old",
    'seven': "70~79 years old", 'eight': "80 plus", 'total': "Total"
    }; 
  const translate2 = {"~9 yeas old": 'zero', "10~19 years old": 'one', 
    "20~29 years old": 'two', "30~39 years old": 'three', "40~49 years old": 'four',
    "50~59 years old": 'five', "60~69 years old": 'six',
    "70~79 years old": 'seven', "80 plus": 'eight', "Total": 'total'
    }; 

  const ageGroups = ["~9 yeas old", "10~19 years old", "20~29 years old",
    "30~39 years old", "40~49 years old", "50~59 years old", "60~69 years old",
    "70~79 years old", "80 plus", "Total"];
  const [visibleGroups, setVisibleGroups] = useState(ageGroups);
  const yearOptions=["2019", "2020", "2021", "2022", "2023"]

  const color = d3.scaleOrdinal()
    .domain(["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "total"])
    .range(d3.schemeCategory10);
  useEffect(() => {
    const margin = { top: 20, right: 50, bottom: 30, left: 60 };
    const width = 1120 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    d3.csv(`/data/influenza_week_data/${location}_influ_2019_2023_preprocess.csv`).then(data => {
      var filteredData = data.filter(d => d["報告年"] === selectedYear);
      if(location=="hokkaido"){
        filteredData = data.filter(d => d["報告年"] === selectedYear);
        filteredData .forEach(d => {
          d['week'] = +d['報告週'];
          d['zero'] = (+d['～6か月'])+(+d['～12か月'])+(+d['1歳'])+(+d['2歳'])+(+d['3歳'])
              +(+d['4歳'])+(+d['5歳'])+(+d['6歳'])+(+d['7歳'])+(+d['8歳'])+(+d['9歳']);
          d['one'] = (+d['10～14歳']) + (+d['15～19歳']);
          d['two'] = +d['20～29歳'];
          d['three'] = +d['30～39歳'];
          d['four'] = +d['40～49歳'];
          d['five'] = +d['50～59歳'];
          d['six'] = +d['60～69歳'];
          d['seven'] = +d['70～79歳'];
          d['eight'] = +d['80歳以上'];
          d['total'] = +d['合計'];
        });
      }
      else if(location=="tokyo"){
        filteredData = data.filter(d => d["年"] === selectedYear);
        filteredData .forEach(d => {
          d['week'] = +d['週'];
          d['zero'] = (+d['～5ヶ月'])+(+d['～1歳'])+(+d['1歳'])+(+d['2歳'])+(+d['3歳'])
              +(+d['4歳'])+(+d['5歳'])+(+d['6歳'])+(+d['7歳'])+(+d['8歳'])+(+d['9歳']);
          d['one'] = (+d['10～14歳']) + (+d['15～19歳']);
          d['two'] = +d['20～29歳'];
          d['three'] = +d['30～39歳'];
          d['four'] = +d['40～49歳'];
          d['five'] = +d['50～59歳'];
          d['six'] = +d['60～69歳'];
          d['seven'] = +d['70～79歳'];
          d['eight'] = +d['80歳以上'];
          d['total'] = +d['合計'];
        });
      }

      const ageGroups = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "total"];

      const x = d3.scaleLinear()
        .domain(d3.extent(filteredData, d => d.week))
        .range([0, width]);
      const y = d3.scaleLinear()
        .domain([0, d3.max(filteredData, d => d3.max(ageGroups.map(group => +d[group])))])
        .range([height, 0]);

      svg.append('g')
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).ticks(12));
      svg.append('g')
        .call(d3.axisLeft(y).tickFormat(d => Number.isInteger(d) ? d : ''));

      visibleGroups.forEach(group => {
        group = translate2[group]
        const line = d3.line()
          .x(d => x(d.week))
          .y(d => y(+d[group]))

        svg.append("path")
          .datum(filteredData)
          .attr("fill", "none")
          .attr("stroke", color(group))
          .attr("stroke-width", 2)
          .attr("d", line)
          .attr("class", function(d){ return  "hokkaidoLine "+ group  });
      });

      const tooltip = d3.select("#tooltip")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background-color", "white")
        .style("border", "1px solid #ccc")
        .style("padding", "8px")
        .style("border-radius", "4px");

      visibleGroups.forEach(group => {
        group = translate2[group]
        svg.selectAll(`.dot-${group}`)
          .data(filteredData)
          .enter()
          .append("circle")
          .attr("class", `dot-${group}`)
          .attr("cx", d => x(d.week))
          .attr("cy", d => y(+d[group]))
          .attr("r", 5)
          .attr("fill", color(group))
          .attr("class", function(d){ return  "hokkaidoDot "+ group  })
          .on("mouseover", (event, d) => {
            
            // tooltip.transition().duration(200).style("opacity", .9);
            tooltip.style("visibility", "visible").html(`Week: ${d.week}<br>Age group: ${translate[group]}<br>Patient: ${d[group]}`)
              .style("left", (event.pageX + 5) + "px")
              .style("top", (event.pageY - 28) + "px");
            svg.selectAll(".hokkaidoLine").style("opacity", 0.2)
            svg.selectAll(".hokkaidoDot").style("opacity", 0.2)
            d3.selectAll(".hokkaidoLine."+ d3.select(event.currentTarget).attr("class").split(" ")[1]).style("opacity", 1)
            d3.select(event.currentTarget).style("opacity", 1)
          })
          .on("mouseout", () => {
            tooltip.style("visibility", "hidden");
            // d3.selectAll(".myLine")
            //   .style("opacity", 0.8)
            d3.selectAll(".hokkaidoDot")
              .style("opacity", 0.8)
            d3.selectAll(".hokkaidoLine")
              .style("opacity", 0.8)
          })
      });
    });
  }, [selectedYear, visibleGroups, location]);

  const handleCheckboxChange = (group) => {
    setVisibleGroups(prev =>
      prev.includes(group)
        ? prev.filter(g => g !== group)
        : [...prev, group]
    );
  };

  return (
    <div  className="comparison-container">
      <h1>Influenza Cases Grouped by Age</h1>
      <div>
        <div className="comparison-controls">
          <label>Choose Location: </label>
          <select className="comparison-select" value={location} onChange={(e) => setLocation(e.target.value)}>
            <option value="">Select a location</option>
            {locations.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>
        <div className="comparison-controls">
          <label>Choose Year: </label>
          <select className="comparison-select"  value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
            {yearOptions.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        {ageGroups.map(group => (
          <label key={group} style={{ marginRight: '10px' ,color: color(translate2[group]), fontWeight: 'bold'}}>
            <input
              type="checkbox"
              checked={visibleGroups.includes(group)}
              onChange={() => handleCheckboxChange(group)}
            />
            {group}
          </label>
        ))}
      </div>
      <div id="tooltip"></div>
      <div style={{ overflowX: 'auto' }}>
      <svg ref={svgRef}></svg>
      
    </div>
    </div>
  );
};

export default InfluenzaChart;
