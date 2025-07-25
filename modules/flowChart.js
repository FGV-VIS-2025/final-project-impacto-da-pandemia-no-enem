import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import * as utils from "./utils.js";
import { barCharts } from "./bar-chart.js";
const {LOOKUP, widthFlow, heightFlow, margin, svgFlow, tooltip} = utils;

export function flowChart(regions = [], data, filteredCategory=null, type=1){
    if (type == 1) {
        flowChart_1(regions, data, filteredCategory);
    } else if (type > 1) {
        flowChart_2(regions, data, filteredCategory, type);
    }
};

function flowChart_1(regions, data, filteredCategory) {
    const variable = Object.keys(data[0])[1];

    const filteredData = regions.length === 0 ? data : data.filter(d => regions.includes(d.UF));

    const years = [...new Set(filteredData.map(d => d.ANO))].sort();
    const categories = [...new Set(filteredData.map(d => d[variable]))].sort();

    const aggregated = {};
    years.forEach(year => {
        aggregated[year] = { total: 0 };
        categories.forEach(cat => { aggregated[year][cat] = 0; });
    });

    const displayCategories = filteredCategory ? [filteredCategory] : categories;

    filteredData.forEach(d => {
        const year = d.ANO;
        const cat = d[variable];
        const value = +d.PARTICIPANTES;
        aggregated[year][cat] += value;
        aggregated[year].total += value;
    });

    const axisHeight = 145;

    svgFlow.selectAll("*").remove();

    const xScale = d3.scalePoint()
        .domain(years)
        .range([0, widthFlow])
        .padding(0.5);

    const centerY = heightFlow / 2;

    let nodes = [];
    if (filteredCategory) {
        const maxCategoryValue = d3.max(years, year => aggregated[year][filteredCategory]);
        
        const thicknessScaleCategory = d3.scaleLinear()
            .domain([0, maxCategoryValue])
            .range([0, axisHeight]);
        
        years.forEach(year => {
            const value = aggregated[year][filteredCategory];
            const thickness = thicknessScaleCategory(value);
            nodes.push({
                ano: year,
                category: filteredCategory,
                value: value,
                x: xScale(year),
                y0: centerY - thickness / 2,
                y1: centerY + thickness / 2
            });
        });
    } else {
        const maxTotal = d3.max(years, year => aggregated[year].total);

        const thicknessScale = d3.scaleLinear()
            .domain([0, maxTotal])
            .range([0, axisHeight]);

        years.forEach(year => {
            const total = aggregated[year].total;
            const thickness = thicknessScale(total); 
            const ribbonYoffset = centerY - thickness / 2;
            let cumulative = 0;
            displayCategories.forEach(cat => {
            const val = aggregated[year][cat];
            const segmentHeight = total ? (val / total) * thickness : 0;
            nodes.push({
                ano: year,
                category: cat,
                value: val,
                x: xScale(year),
                y0: ribbonYoffset + cumulative,
                y1: ribbonYoffset + cumulative + segmentHeight
            });
            cumulative += segmentHeight;
            });
        });
    }

    const series = displayCategories.map(cat => {
        return {
            category: cat,
            values: nodes.filter(n => n.category === cat)
                         .sort((a, b) => d3.ascending(a.ano, b.ano))
        };
    });

    const color = d3.scaleOrdinal(d3.schemeTableau10).domain(categories);

    // Gerador de área para desenhar os ribbons para cada categoria
    const area = d3.area()
                   .x(d => d.x)
                   .y0(d => d.y0)
                   .y1(d => d.y1)
                   .curve(d3.curveMonotoneX);

    // Desenha cada faixa para cada categoria
    series.forEach(ser => {
        svgFlow.append("path")
               .datum(ser.values)
               .attr("d", area)
               .attr("fill", color(ser.category));
    });

    // Desenha os eixos verticais para cada ano com altura fixa
    years.forEach(year => {
        const x = xScale(year);
        const axisTop = centerY - axisHeight / 2 - 17.5;
        const axisBottom = centerY + axisHeight / 2 + 17.5;
        svgFlow.append("line")
               .attr("class", "paralel-axis")
               .attr("x1", x)
               .attr("x2", x)
               .attr("y1", axisTop)
               .attr("y2", axisBottom);
             
        // Rótulo do ano abaixo do eixo
        svgFlow.append("text")
               .attr("class", "x-label")
               .attr("x", x)
               .attr("y", axisBottom + 15)
               .attr("text-anchor", "middle")
               .style("font-weight", "normal")
               .text(year);
        
        svgFlow.append("text")
               .attr("class", "y-label")
               .attr("text-anchor", "middle")
               .attr("transform", "rotate(-90)")
               .attr("x", - heightFlow / 2)
               .attr("y", margin.left / 2)
               .attr("text-anchor", "middle")
               .style("font-weight", "normal")
               .text("Nº de Participantes");
    });

    const overlayWidth = 30;

    svgFlow.selectAll("rect.click-overlay")
        .data(nodes)
        .enter()
        .append("rect")
        .attr("class", "click-overlay")
        .attr("x", d => {
            const i = years.indexOf(d.ano);
            return i === 0 ? 0 : (xScale(years[i]) + xScale(years[i - 1])) / 2;
        })
        .attr("y", d => d.y0)
        .attr("width", d => {
            const i = years.indexOf(d.ano);
            const left = i === 0 ? 0 : (xScale(years[i]) + xScale(years[i - 1])) / 2;
            const right = i === years.length - 1 ? widthFlow : (xScale(years[i]) + xScale(years[i + 1])) / 2;
            return right - left;
        })
        .attr("height", d => d.y1 - d.y0)
        .style("fill", "transparent")
        .on("click", function(event, d) {
            if (filteredCategory === d.category) {
                flowChart_1(regions, data, null);
                barCharts(regions, data, null, 1);
            } else {
                flowChart_1(regions, data, d.category);
                barCharts(regions, data, d.category, 1);
            }
        });

    svgFlow.selectAll("rect.overlay")
        .data(nodes)
        .enter()
        .append("rect")
        .attr("class", "overlay")
        .attr("x", d => d.x - overlayWidth / 2)
        .attr("y", d => d.y0)
        .attr("width", overlayWidth)
        .attr("height", d => d.y1 - d.y0)
        .style("fill", "transparent")
        .on("mouseover", function(event, d) {
            tooltip.transition().duration(200).style("opacity", 1);

            if (variable === "all") {
                tooltip.html(`Ano: ${d.ano}<br>Participantes: ${d3.format(",")(d.value)}`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            } else {
                tooltip.html(`Ano: ${d.ano}<br>Categoria: ${LOOKUP[variable][d.category]}<br>Participantes: ${d3.format(",")(d.value)}`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            }
        })
        .on("mousemove", function(event) {
            tooltip.style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            tooltip.transition().duration(500).style("opacity", 0);
        });
}

function flowChart_2(regions, data, filteredCategory, type) {

    const variable = Object.keys(data[0])[1];
    
    const filteredData = regions.length === 0 ? data : data.filter(d => regions.includes(d.UF));
    
    const years = [...new Set(filteredData.map(d => d.ANO))].sort();
    const categories = [...new Set(filteredData.map(d => d[variable]))].sort();
    
    const aggregated = {};
    years.forEach(year => {
        aggregated[year] = {};
        categories.forEach(cat => { aggregated[year][cat] = 0; });
    });

    const displayCategories = filteredCategory ? [filteredCategory] : categories;

    filteredData.forEach(d => {
        const year = d.ANO;
        const cat = d[variable];
        const val = +d.PARTICIPANTES;
        aggregated[year][cat] += val;
    });
    
    const globalMax = d3.max(years, year => d3.max(displayCategories, cat => aggregated[year][cat]));
    
    const axisHeight = 180;
    const nCat = displayCategories.length;
    const slotHeight = axisHeight / nCat;  
    
    svgFlow.selectAll("*").remove();

    
    const centerY = heightFlow / 2;
    const axisTop = centerY - axisHeight / 2;
    
    // Para cada categoria, definimos o centro do "slot" vertical onde ela será desenhada.
    const categoryCenters = displayCategories.map((cat, i) => axisTop + (i + 0.5) * slotHeight);
    
    // Escala horizontal para posicionar os anos
    const xScale = d3.scalePoint()
        .domain(years)
        .range([0, widthFlow])
        .padding(0.5);
    
    const nodes = [];
    if (type == 2) {
        const commonScale = d3.scaleLinear()
            .domain([0, globalMax])
            .range([5, slotHeight * 0.8]);

        years.forEach(year => {
            displayCategories.forEach((cat, catIndex) => {
                const val = aggregated[year][cat];
                const thickness = commonScale(val);
                const center = categoryCenters[catIndex];
                
                nodes.push({
                    ano: year,
                    category: cat,
                    value: val,
                    x: xScale(year),
                    y0: center - thickness / 2,
                    y1: center + thickness / 2
                });
            });
        });
    } else {
        const categoryScales = {};
        displayCategories.forEach(cat => {
            const catMax = d3.max(years, year => aggregated[year][cat]);
            categoryScales[cat] = d3.scaleLinear()
                .domain([0, catMax])
                .range([5, slotHeight * 0.8]);
        });

        years.forEach(year => {
            displayCategories.forEach((cat, catIndex) => {
                const val = aggregated[year][cat];
                const thickness = categoryScales[cat](val);
                const center = categoryCenters[catIndex];
                
                nodes.push({
                    ano: year,
                    category: cat,
                    value: val,
                    x: xScale(year),
                    y0: center - thickness / 2,
                    y1: center + thickness / 2
                });
            });
        });
    }
    
    // Agrupa os nós por categoria
    const series = displayCategories.map(cat => {
        return {
            category: cat,
            values: nodes.filter(n => n.category === cat)
                         .sort((a, b) => d3.ascending(a.ano, b.ano))
        };
    });
    
    // Escala de cores para atribuir uma cor a cada categoria
    const color = d3.scaleOrdinal(d3.schemeTableau10).domain(categories);

    // Gerador de área para desenhar os ribbons (faixas) para cada categoria
    const area = d3.area()
                   .x(d => d.x)
                   .y0(d => d.y0)
                   .y1(d => d.y1)
                   .curve(d3.curveMonotoneX);
    
    // Desenha cada faixa (ribbon) para cada categoria
    series.forEach(ser => {
        svgFlow.append("path")
               .datum(ser.values)
               .attr("d", area)
               .attr("fill", color(ser.category));
    });
    
    // Desenha os eixos verticais com altura fixa
    years.forEach(year => {
        const x = xScale(year);
        svgFlow.append("line")
               .attr("class", "paralel-axis")
               .attr("x1", x)
               .attr("x2", x)
               .attr("y1", axisTop)
               .attr("y2", axisTop + axisHeight);
    
        // Rótulo do ano abaixo do eixo
        svgFlow.append("text")
               .attr("class", "x-label")
               .attr("x", x)
               .attr("y", axisTop + axisHeight + 15)
               .attr("text-anchor", "middle")
               .style("font-weight", "normal")
               .text(year);
        
        svgFlow.append("text")
               .attr("class", "y-label")
               .attr("text-anchor", "middle")
               .attr("transform", "rotate(-90)")
               .attr("x", - heightFlow / 2)
               .attr("y", margin.left / 2)
               .attr("text-anchor", "middle")
               .style("font-weight", "normal")
               .text("Nº de Participantes");       
    });
    
    const overlayWidth = 30;

    svgFlow.selectAll("rect.click-overlay")
        .data(nodes)
        .enter()
        .append("rect")
        .attr("class", "click-overlay")
        .attr("x", d => {
            const i = years.indexOf(d.ano);
            return i === 0 ? 0 : (xScale(years[i]) + xScale(years[i - 1])) / 2;
        })
        .attr("y", d => d.y0)
        .attr("width", d => {
            const i = years.indexOf(d.ano);
            const left = i === 0 ? 0 : (xScale(years[i]) + xScale(years[i - 1])) / 2;
            const right = i === years.length - 1 ? widthFlow : (xScale(years[i]) + xScale(years[i + 1])) / 2;
            return right - left;
        })
        .attr("height", d => d.y1 - d.y0)
        .style("fill", "transparent")
        .on("click", function(event, d) {
            if (filteredCategory === d.category) {
                flowChart_2(regions, data, null, type);
                barCharts(regions, data, null, type);
            } else {
                flowChart_2(regions, data, d.category, type);
                barCharts(regions, data, d.category, type);
            }
        });

    svgFlow.selectAll("rect.overlay")
        .data(nodes)
        .enter()
        .append("rect")
        .attr("class", "overlay")
        .attr("x", d => d.x - overlayWidth / 2)
        .attr("y", d => d.y0)
        .attr("width", overlayWidth)
        .attr("height", d => d.y1 - d.y0)
        .style("fill", "transparent")
        .on("mouseover", function(event, d) {
            tooltip.transition().duration(200).style("opacity", 1);
            if (variable === "all") {
                tooltip.html(`Ano: ${d.ano}<br>Participantes: ${d3.format(",")(d.value)}`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            } else {
                tooltip.html(`Ano: ${d.ano}<br>Categoria: ${LOOKUP[variable][d.category]}<br>Participantes: ${d3.format(",")(d.value)}`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            }
        })
        .on("mousemove", function(event) {
            tooltip.style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            tooltip.transition().duration(500).style("opacity", 0);
        });
}