// InfluenzaChart.js
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import './Comparison.css'; 

const InfluenzaChart = () => {
  const svgRef = useRef();
  const [selectedYear, setSelectedYear] = useState("2019");

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

  // const tooltip = d3.select("body").append("div")
  //   .style("position", "absolute")
  //   .style("background", "#f9f9f9")
  //   .style("border", "1px solid #d3d3d3")
  //   .style("padding", "5px")
  //   .style("border-radius", "5px")
  //   .style("opacity", 0);



  useEffect(() => {
    const margin = { top: 20, right: 450, bottom: 30, left: 60 };
    const width = 1500 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    d3.csv("/data/influenza_week_data/hokkaido_influ_2019_2023_preprocess.csv").then(hokkaidoData => {
      d3.csv("/data/influenza_week_data/tokyo_influ_2019_2023_preprocess.csv").then(tokyoData => {
        d3.csv("/data/influenza_week_data/osaka_influ_2019_2023_preprocess.csv").then(osakaData => {
          var filteredDataHokkaido  = hokkaidoData.filter(function(d){ return d["報告年"] == selectedYear })
          filteredDataHokkaido.forEach(d => {
              d['location'] = 'hokkaido';
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
          })
          var filteredDataTokyo  = tokyoData.filter(function(d){ return d["年"] == selectedYear })
          filteredDataTokyo.forEach(d => {
              d['location'] = 'tokyo';
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
          var filteredDataOsaka  = osakaData.filter(function(d){ return d["年"] == selectedYear })
          filteredDataOsaka.forEach(d => {
              d['location'] = 'osaka';
              d['week'] = +d['週'];
              d['total'] = +d['合計'];
          });

      const ageGroups = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "total"];

      const x = d3.scaleLinear()
        .domain(d3.extent(filteredDataTokyo, d => d.week))
        .range([0, width]);
      const y = d3.scaleLinear()
        .domain([0, d3.max([d3.max(filteredDataTokyo, d => d3.max(ageGroups.map(group => +d[group]))),
          d3.max(filteredDataHokkaido, d => d3.max(ageGroups.map(group => +d[group]))),
          d3.max(filteredDataOsaka, d => d3.max(ageGroups.map(group => +d[group])))
        ])])
        .range([height, 0]);

      svg.append('g')
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).ticks(12));
      svg.append('g')
        .call(d3.axisLeft(y).tickFormat(d => Number.isInteger(d) ? d : ''));
      
      const tooltip = d3.select("#tooltip")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background-color", "white")
        .style("border", "1px solid #ccc")
        .style("padding", "8px")
        .style("border-radius", "4px")
        .style("z-index", 9999);

      
      visibleGroups.forEach(group => {
        group = translate2[group]
        const line = d3.line()
          .x(d => x(d.week))
          .y(d => y(+d[group]))

        svg.append("path")
          .datum(filteredDataTokyo)
          .attr("fill", "none")
          .attr("stroke", color(group))
          .attr("stroke-width", 2)
          .attr("d", line)
          .attr("class", function(d){ return  "hokkaidoLine "+ group  });
        svg.append("path")
          .datum(filteredDataHokkaido)
          .style("stroke", color(group))
          .style("stroke-width", 2)
          .style("stroke-dasharray", ("3, 3")) 
          .style("fill", "none")
          .attr("d", line)
          .attr("class", function(d){ return  "hokkaidoLine "+ group  });
        if(group == "total"){
          svg.append("path")
            .datum(filteredDataOsaka)
            .style("stroke", color(group))
            .style("stroke-width", 2)
            .style("stroke-dasharray", ("10, 5")) 
            .style("fill", "none")
            .attr("d", line)
            .attr("class", function(d){ return  "hokkaidoLine "+ group  });
        }
      });



      visibleGroups.forEach(group => {
        group = translate2[group]
        svg.selectAll(`.dot-${group}`)
          .data(filteredDataTokyo)
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
            tooltip.style("visibility", "visible")
              .html(`City: Tokyo<br>Week: ${d.week}<br>Age group: ${translate[group]}<br>Patient: ${d[group]}`)
              .style("left", (event.pageX + 5) + "px")
              .style("top", (event.pageY - 28) + "px");
            svg.selectAll(".hokkaidoLine").style("opacity", 0.2)
            svg.selectAll(".hokkaidoDot").style("opacity", 0.2)
            d3.selectAll(".hokkaidoLine."+ d3.select(event.currentTarget).attr("class").split(" ")[1]).style("opacity", 1)
            d3.select(event.currentTarget).style("opacity", 1)
          })
          .on("mouseout", () => {
            tooltip.style("visibility", "hidden");
            // tooltip.transition().duration(500).style("opacity", 0)
            // d3.selectAll(".myLine")
            //   .style("opacity", 0.8)
            d3.selectAll(".hokkaidoDot")
              .style("opacity", 0.8)
            d3.selectAll(".hokkaidoLine")
              .style("opacity", 0.8)
          })
        svg.selectAll(`.dot-${group}`)
          .data(filteredDataHokkaido)
          .enter()
          .append("circle")
          .attr("class", `dot-${group}`)
          .attr("cx", d => x(d.week))
          .attr("cy", d => y(+d[group]))
          .attr("r", 5)
          .attr("stroke", color(group))
          .style("stroke-width", 2)
          .style("fill", "white")
          .attr("class", function(d){ return  "hokkaidoDot "+ group  })
          .on("mouseover", (event, d) => {
            // tooltip.transition().duration(200).style("opacity", .9);
            tooltip.style("visibility", "visible")
              .html(`City: Hokkaido<br>Week: ${d.week}<br>Age group: ${translate[group]}<br>Patient: ${d[group]}`)
              .style("left", (event.pageX + 5) + "px")
              .style("top", (event.pageY - 28) + "px");
            svg.selectAll(".hokkaidoLine").style("opacity", 0.2)
            svg.selectAll(".hokkaidoDot").style("opacity", 0.2)
            d3.selectAll(".hokkaidoLine."+ d3.select(event.currentTarget).attr("class").split(" ")[1]).style("opacity", 1)
            d3.select(event.currentTarget).style("opacity", 1)
          })
          .on("mouseout", () => {
            tooltip.style("visibility", "hidden");
            // tooltip.transition().duration(500).style("opacity", 0)
            // d3.selectAll(".myLine")
            //   .style("opacity", 0.8)
            d3.selectAll(".hokkaidoDot")
              .style("opacity", 0.8)
            d3.selectAll(".hokkaidoLine")
              .style("opacity", 0.8)
          })

        if(group == "total"){
          svg.selectAll(`.dot-${group}`)
            .data(filteredDataOsaka)
            .enter()
            .append("circle")
            .attr("class", `dot-${group}`)
            .attr("cx", d => x(d.week))
            .attr("cy", d => y(+d[group]))
            .attr("r", 5)
            .attr("stroke", color(group))
            .style("stroke-width", 2)
            .style("fill", "gray")

            .attr("class", function(d){ return  "hokkaidoDot "+ group  })
            .on("mouseover", (event, d) => {
              // tooltip.transition().duration(200).style("opacity", .9);
              tooltip.style("visibility", "visible")
                .html(`City: Osaka<br>Week: ${d.week}<br>Age group: ${translate[group]}<br>Patient: ${d[group]}`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
              svg.selectAll(".hokkaidoLine").style("opacity", 0.2)
              svg.selectAll(".hokkaidoDot").style("opacity", 0.2)
              d3.selectAll(".hokkaidoLine."+ d3.select(event.currentTarget).attr("class").split(" ")[1]).style("opacity", 1)
              d3.select(event.currentTarget).style("opacity", 1)
            })
            .on("mouseout", () => {
              tooltip.style("visibility", "hidden");
              // tooltip.transition().duration(500).style("opacity", 0)
              // d3.selectAll(".myLine")
              //   .style("opacity", 0.8)
              d3.selectAll(".hokkaidoDot")
                .style("opacity", 0.8)
              d3.selectAll(".hokkaidoLine")
                .style("opacity", 0.8)
            })
        }
        
      });

      const color2 = d3.scaleOrdinal()
        .domain(["Tokyo", "Hokkaido", "Osaka"])
        .range(["black", "white", "gray"]);

      const line2 = d3.line()
        .x(d => x(d.week))
        .y(d => y(+d))

      svg.append("g").selectAll("mydots")
        .data(["Tokyo", "Hokkaido", "Osaka"])
        .enter()
        .append("circle")
        .attr("cx", 950)
        .attr("cy", function(d,i){ return 100-70 + i*25}) 
        .attr("r", 10)
        .attr("stroke", "black")
        .style("stroke-width", 2)
        .style("fill", function(d){ return color2(d)})

      svg.append("g").selectAll("mylabels")
        .data(["Tokyo", "Hokkaido", "Osaka"])
        .enter()
        .append("text")
            .attr("x", 970)
            .attr("y", function(d,i){ return 100-70 + i*25}) 
            .style("fill", "black")
            .text(function(d){ return d})
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle")
            .attr("font-family", "sans-serif")
    });
  });
  });
  }, [selectedYear, visibleGroups]);

  const handleCheckboxChange = (group) => {
    setVisibleGroups(prev =>
      prev.includes(group)
        ? prev.filter(g => g !== group)
        : [...prev, group]
    );
  };

  return (
    <div className="comparison-container">
      <h1>Influenza Cases Comparison</h1>
      <div>
        <div className="comparison-controls">
          <label>Choose Year: </label>
          <select className="comparison-select" value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
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
      <div>
      
      <svg ref={svgRef}></svg>
      </div>
    </div>
  );
};

export default InfluenzaChart;
