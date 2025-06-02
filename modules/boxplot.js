import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import * as utils from "./utils.js";
const {widthBox, heightBox, svgBox, yBox, margin} = utils;

export function boxPlot(regions, data2019Grouped, data2020Grouped) {
        // Primeiro limpa o SVG para redesenhar
        svgBox.selectAll("*").remove();
        
        // Filtra os dados conforme a região
        const filteredData2019 = (regions.length === 0) ? data2019Grouped : data2019Grouped.filter(d => regions.includes(d.MESORREGIAO));
        const filteredData2020 = (regions.length === 0) ? data2020Grouped : data2020Grouped.filter(d => regions.includes(d.MESORREGIAO));
    
        // Extrai os valores de presença como números
        const presenca2019 = filteredData2019.map(d => +d.PRESENCA);
        const presenca2020 = filteredData2020.map(d => +d.PRESENCA);
    
        // Função auxiliar para calcular os quartis
        function quartiles(arr) {
            arr.sort(d3.ascending);
            return {
                q0: d3.quantile(arr, 0.025),
                q1: d3.quantile(arr, 0.25),
                median: d3.quantile(arr, 0.5),
                q3: d3.quantile(arr, 0.75),
                q4: d3.quantile(arr, 0.975),
                min: d3.min(arr),
                max: d3.max(arr)
            };
        }
    
        const stats2019 = quartiles(presenca2019);
        const stats2020 = quartiles(presenca2020);
    
        // Limpa o SVG antes de redesenhar
        svgBox.selectAll("*").remove();
    
        // Configuração das escalas
        const xBox = d3.scaleBand()
            .domain(["2019", "2020"])
            .range([margin.left, widthBox - margin.right])
            .padding(0.4);
    
        yBox.domain([0, 1])
           .range([heightBox - margin.bottom, margin.top]);
    
        // Desenha os eixos
        svgBox.append("g")
            .attr("class", "y-axis")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(yBox));
    
        svgBox.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${heightBox - margin.bottom})`)
            .call(d3.axisBottom(xBox));
    
        // Configurações visuais
        const boxWidth = xBox.bandwidth() * 0.6;
        const boxplotGroup = svgBox.append("g");

        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0)
            .style("position", "absolute");
        
        // Desenha os boxplots para cada ano
        ["2019", "2020"].forEach((year, i) => {
            const stats = i === 0 ? stats2019 : stats2020;
            const xPos = xBox(year) + xBox.bandwidth() / 2;
            const filteredData = i === 0 ? filteredData2019 : filteredData2020;

            // Caixa principal (do Q1 ao Q3)
            boxplotGroup.append("rect")
                .attr("class", "box")
                .attr("x", xPos - boxWidth/2)
                .attr("y", yBox(stats.q3))
                .attr("width", boxWidth)
                .attr("height", yBox(stats.q1) - yBox(stats.q3))
                .attr("stroke", "black")
                .attr("fill", "#69b3a2");

            // Linha da mediana COM tooltip
            boxplotGroup.append("line")
                .attr("class", "median")
                .attr("x1", xPos - boxWidth/2)
                .attr("x2", xPos + boxWidth/2)
                .attr("y1", yBox(stats.median))
                .attr("y2", yBox(stats.median))
                .attr("stroke", "black")
                .attr("stroke-width", 2)
                .on("mouseover", function(event) {
                    tooltip.transition().duration(200).style("opacity", 1);
                    tooltip.html(`Ano: ${year}
                        <br>Mediana: ${stats.median.toFixed(3)}`)
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 28) + "px");
                })
                .on("mouseout", function() {
                    tooltip.transition().duration(500).style("opacity", 0);
                });

            // Linha do Q1 COM tooltip
            boxplotGroup.append("line")
                .attr("class", "q1-line")
                .attr("x1", xPos - boxWidth/2)
                .attr("x2", xPos + boxWidth/2)
                .attr("y1", yBox(stats.q1))
                .attr("y2", yBox(stats.q1))
                .attr("stroke", "black")
                .attr("stroke-width", 2)
                .on("mouseover", function(event) {
                    tooltip.transition().duration(200).style("opacity", 1);
                    tooltip.html(`Ano: ${year}
                        <br/>Q1: ${stats.q1.toFixed(3)}`)
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 28) + "px");
                })
                .on("mouseout", function() {
                    tooltip.transition().duration(500).style("opacity", 0);
                });   
                
            // Linha do Q3 COM tooltip
            boxplotGroup.append("line")
                .attr("class", "q3-line")
                .attr("x1", xPos - boxWidth/2)
                .attr("x2", xPos + boxWidth/2)
                .attr("y1", yBox(stats.q3))
                .attr("y2", yBox(stats.q3))
                .attr("stroke", "black")
                .attr("stroke-width", 2)
                .on("mouseover", function(event) {
                    tooltip.transition().duration(200).style("opacity", 1);
                    tooltip.html(`Ano: ${year}
                        <br/>Q3: ${stats.q3.toFixed(3)}`)
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 28) + "px");
                })
                .on("mouseout", function() {
                    tooltip.transition().duration(500).style("opacity", 0);
                });
                
            // Linha do Q4 COM tooltip
            boxplotGroup.append("line")
                .attr("class", "q4-line")
                .attr("x1", xPos - boxWidth/3)
                .attr("x2", xPos + boxWidth/3)
                .attr("y1", yBox(stats.q4))
                .attr("y2", yBox(stats.q4))
                .attr("stroke", "black")
                .attr("stroke-width", 2)
                .on("mouseover", function(event) {
                    tooltip.transition().duration(200).style("opacity", 1);
                    tooltip.html(`Ano: ${year}
                        <br/>Q4: ${stats.q4.toFixed(3)}`)
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 28) + "px");
                })
                .on("mouseout", function() {
                    tooltip.transition().duration(500).style("opacity", 0);
                });    

            // Linha do Q0 COM tooltip
            boxplotGroup.append("line")
                .attr("class", "q0-line")
                .attr("x1", xPos - boxWidth/3)
                .attr("x2", xPos + boxWidth/3)
                .attr("y1", yBox(stats.q0))
                .attr("y2", yBox(stats.q0))
                .attr("stroke", "black")
                .attr("stroke-width", 2)
                .on("mouseover", function(event) {
                    tooltip.transition().duration(200).style("opacity", 1);
                    tooltip.html(`Ano: ${year}
                        <br/>Q0: ${stats.q0.toFixed(3)}`)
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 28) + "px");
                })
                .on("mouseout", function() {
                    tooltip.transition().duration(500).style("opacity", 0);
                });        

            // Bigodes e linhas horizontais (mantidos iguais)
            boxplotGroup.append("line")
                .attr("class", "q0-q1")
                .attr("x1", xPos)
                .attr("x2", xPos)
                .attr("y1", yBox(stats.q0))
                .attr("y2", yBox(stats.q1))
                .attr("stroke", "black");

            boxplotGroup.append("line")
                .attr("class", "q3-q4")
                .attr("x1", xPos)
                .attr("x2", xPos)
                .attr("y1", yBox(stats.q3))
                .attr("y2", yBox(stats.q4))
                .attr("stroke", "black");

            // Extrai outliers com dados completos (incluindo MESORREGIAO)
            const outlierData = filteredData.filter(d => {
                const value = +d.PRESENCA;
                return value < stats.q0 || value > stats.q4;
            });

            // Desenha outliers com tooltip
            outlierData.forEach(d => {
                boxplotGroup.append("circle")
                    .attr("class", "outlier-point")
                    .attr("cx", xPos)
                    .attr("cy", yBox(+d.PRESENCA))
                    .attr("r", 5)
                    .attr("fill", "black")
                    .attr("stroke", "black")
                    .on("mouseover", function(event) {
                        tooltip.transition().duration(200).style("opacity", 0.9);
                        tooltip.html(`Ano: ${year}
                            <br>Mesorregião: ${d.MESORREGIAO}
                            <br>Cidade: ${d.NO_MUNICIPIO_ESC}
                            <br>Taxa: ${(+d.PRESENCA).toFixed(3)}`)
                            .style("left", (event.pageX + 10) + "px")
                            .style("top", (event.pageY - 28) + "px");
                    })
                    .on("mouseout", function() {
                        tooltip.transition().duration(500).style("opacity", 0);
                    });
            });
        });
    
        // Adiciona rótulos aos eixos (centralizados)
        svgBox.append("text")
            .attr("class", "y-label")
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .attr("x", -heightBox / 2)
            .attr("y", margin.left / 2 - 10)
            .text("Taxa de Presença");

        svgBox.append("text")
            .attr("class", "x-label")
            .attr("text-anchor", "middle")
            .attr("x", widthBox / 2)
            .attr("y", heightBox - 6)
            .text("Ano");

        // Para alterar o título
        const title = d3.select("#boxplot-title");
        if (regions.length === 0) {
            title.text("Distribuição da Média de Presença por Cidade em Minas Gerais")
        }
        else if (regions.length === 1) {
            title.text("Distribuição da Média de Presença por Cidade para a região selecionada")
        }  
        else {
            title.text("Distribuição da Média de Presença por Cidade para as regiões selecionadas")
        }    
    }
