import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import * as utils from "./utils.js";
const {LOOKUP, width, height, margin, svg, x, y, barsGroup, tooltip} = utils;


// Atualiza o gráfico com base na região selecionada
export function barCharts(regions = [], column = "all", filteredCategory, data2019, data2020) {

    let colorScale = d3.schemeTableau10; 
    svg.selectAll(".legend").remove(); 
        
    // Filtra os dados conforme a região 
    const filteredData2019 = (regions.length === 0) ? data2019 : data2019.filter(d => regions.includes(d.MESORREGIAO));
    const filteredData2020 = (regions.length === 0) ? data2020 : data2020.filter(d => regions.includes(d.MESORREGIAO));

    const subscriptions = [
        {year: "2019", total: filteredData2019.length},
        {year: "2020", total: filteredData2020.length}
    ];

    const allCategories = [...new Set(data2019.map(d => d[column]))].sort();
        
    allCategories.forEach((category, index) => {
        subscriptions[0][column + index] = filteredData2019.filter(d => d[column] === category).length;
        subscriptions[1][column + index] = filteredData2020.filter(d => d[column] === category).length;
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
        .attr("transform", d => `translate(${x(d.year)}, 0)`);

    barGroups.selectAll("rect")
        .data(d => displayCategories.map(category => {
            const index = allCategories.indexOf(category);
            return {
                key: category,
                value: d[column + index] || 0,
                year: d.year
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
            barCharts(regions, column, filteredCategory === d.key ? null : d.key, data2019, data2020);
        });

    if (column && column !== "all"){
        createLegend(colorScale, column, regions, allCategories, filteredCategory, data2019, data2020);
    }

    const title = d3.select("#barchart-title");
    if (regions.length === 0) {
        title.text(" Quantidade de inscrições no ENEM em Minas Gerais pela variável selecionada")
    }
    else if (regions.length === 1) {
        title.text(" Quantidade de Inscrições no ENEM na região selecionada pela variável selecionada")
    }  
    else {
        title.text(" Quantidade de Inscrições do ENEM nas regiões selecionadas pela variável selecionada")
    }   
}

function createLegend(colorScale, column, regions, allCategories, currentFilter, data2019, data2020) {
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
            barCharts(regions, column, null, data2019, data2020);
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
                barCharts(regions, column, category, data2019, data2020);
            });
        });
    }
}
