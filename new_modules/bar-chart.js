import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import * as utils from "./utils.js";
const {LOOKUP, width, height, margin, svg, y, barsGroup, tooltip} = utils;


// Atualiza o gráfico com base na região selecionada
export function barCharts(regions = [], column = "all", filteredCategory, data) {

    let colorScale = d3.schemeTableau10; 
    svg.selectAll(".legend").remove(); 
        
    // Filtra os dados conforme a região 
    const filteredData = (regions.length === 0) ? data : data.filter(d => regions.includes(d.UF));

    const years = [...new Set(data.map(d => d.ANO))].sort();
    const subscriptions = [];
    const allCategories = [...new Set(data.map(d => d[column]))].sort();

    years.forEach((year, idx) => {

    let filteredYearData = filteredData.filter(d => d.ANO === year);
    const obj = { ano: year, total: d3.sum(filteredYearData, d => +d.QTD) };

    allCategories.forEach((category, index) => {
        obj[column + index] = d3.sum(filteredYearData.filter(d => d[column] === category), d => +d.QTD);
        });

        subscriptions.push(obj);
    });
    
    // Define as categorias que serão exibidas
    const displayCategories = filteredCategory ? [filteredCategory] : allCategories;

    // Atualiza a escala do eixo Y com base nas categorias exibidas
    const maxValue = d3.max(subscriptions, d => 
        d3.max(displayCategories.map(category => {
            const index = allCategories.indexOf(category);
            return d[column + index] || 0;
        }))
    );

    y.domain([0, maxValue]).nice();

    const x = d3.scaleBand()
        .domain(years)  
        .range([margin.left, width - margin.right])
        .padding(0.4);

    // Atualiza os eixos
    svg.selectAll(".y-axis").remove();
    svg.append("g")
        .attr("class", "y-axis")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));

    svg.selectAll(".x-axis").remove();
    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x));

    svg.append("text")
        .attr("class", "x-label")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height - 6)
        .text("Ano")
        .style("font-weight", "normal");        
    
    svg.append("text")
        .attr("class", "y-label")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", margin.left / 2 - 10)
        .text("Nº de Inscrições")
        .style("font-weight", "normal");


    // Escala para subgrupos - usa displayCategories
    const xSubgroup = d3.scaleBand()
        .domain(displayCategories)
        .range([0, x.bandwidth()])
        .padding(0.05);

    // Atualiza as barras
    const barGroups = barsGroup.selectAll(".chart-container")
    .data(subscriptions)
    .join("g")
    .attr("class", "chart-container")
    .attr("transform", d => `translate(${x(d.ano)}, 0)`);


    barGroups.selectAll("rect")
        .data(d => displayCategories.map(category => {
            const index = allCategories.indexOf(category);
            return {
                key: category,
                value: d[column + index] || 0,
                year: d.ano
            };
        }))
        .join("rect")
        .attr("class", "bar")
        .attr("x", d => xSubgroup(d.key))
        .attr("y", d => y(d.value))
        .attr("width", xSubgroup.bandwidth())
        .attr("height", d => y(0) - y(d.value))
        .attr("fill", (d, i) => colorScale[allCategories.indexOf(d.key) % 10])
        .on("mouseover", function(event, d) {
            d3.select(this).transition().duration(200);
            tooltip.transition().duration(600).style("opacity", 1);
            if (column !== "all") {
                tooltip.html(`<strong>Ano:</strong> ${d.year}<br/>
                <strong>Categoria:</strong> ${LOOKUP[column][d.key]}<br/>
                <strong>Nº de inscrições:</strong> ${d.value}`
                )
                .style("left", `${event.pageX + 5}px`)
                .style("top", `${event.pageY - 5}px`);
            }
            else{
                tooltip.html(`<strong>Ano:</strong> ${d.year}<br/>
                    <strong>N° inscrições:</strong> ${d.value}`
                    )
                    .style("left", `${event.pageX + 5}px`)
                    .style("top", `${event.pageY - 5}px`);
            }
        })
        .on("mouseout", function(event, d) {
            d3.select(this).transition().duration(200);
            tooltip.transition().duration(400).style("opacity", 0);
        })
        .on("click", function(event, d) {
            // Alterna o filtro: se já está filtrado, mostra tudo; senão, filtra
            barCharts(regions, column, filteredCategory === d.key ? null : d.key, data);
        });

    if (column && column !== "all"){
        createLegend(colorScale, column, regions, allCategories, filteredCategory, data);
    }

    const title = d3.select("#barchart-title");
    if (regions.length === 0) {
        title.text(" Quantidade de inscrições no ENEM no Brasil pela variável selecionada")
    }
    else if (regions.length === 1) {
        title.text(" Quantidade de Inscrições no ENEM no estado selecionado pela variável selecionada")
    }  
    else {
        title.text(" Quantidade de Inscrições do ENEM nos estados selecionados pela variável selecionada")
    }   
}

function createLegend(colorScale, column, regions, allCategories, currentFilter, data) {
    svg.selectAll(".legend").remove();
    
    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${width - margin.right - 140},${margin.top})`);

    if (currentFilter) {
        let index = allCategories.indexOf(currentFilter);
        if (index < 0) index = 0; 

        const legendGroup = legend.append("g")
            .attr("class", "legend-item")
            .attr("transform", `translate(0, 0)`);

        legendGroup.append("rect")
            .attr("class", "legend-rect")
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", colorScale[index % 10]);

        legendGroup.append("text")
            .attr("class", "legend-text")
            .attr("x", 20)
            .attr("y", 12)
            .text(LOOKUP[column][currentFilter]);

        legendGroup.on("click", function() {
            barCharts(regions, column, null, data);
        });
    } else {
        allCategories.forEach((category, i) => {
            const legendGroup = legend.append("g")
                .attr("class", "legend-item")
                .attr("transform", `translate(0, ${i * 20})`);

            legendGroup.append("rect")
                .attr("class", "legend-rect")
                .attr("width", 15)
                .attr("height", 15)
                .attr("fill", colorScale[i % 10]);

            legendGroup.append("text")
                .attr("class", "legend-text")
                .attr("x", 20)
                .attr("y", 12)
                .text(LOOKUP[column][category]);

            legendGroup.on("click", function() {
                barCharts(regions, column, category, data);
            });
        });
    }
}
