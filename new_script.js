import { barCharts } from "./new_modules/bar-chart.js";
import { boxPlot } from "./new_modules/boxplot.js";
import { updateHeatMap } from "./new_modules/heatMap.js";
import * as utils from "./new_modules/utils.js";
const {tooltip} = utils;


/* Alteração para outros temas */
const themeSelect = document.getElementById('theme-select');

// Aplicação do tema escuro
function applyTheme(theme) {
    const root = document.documentElement;
    root.classList.remove('dark-mode');

    if (theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        root.classList.add('dark-mode');
    }

    localStorage.setItem('theme', theme);
}

// Quando o usuário muda a seleção
themeSelect.addEventListener('change', () => {
    applyTheme(themeSelect.value);
});

// Define o tema inicial ao carregar a página
window.addEventListener('DOMContentLoaded', () => {
    const saved = localStorage.getItem('theme') || 'auto';
    themeSelect.value = saved;
    applyTheme(saved);
});

// Se o usuário está no modo automático e o sistema muda de cor
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const current = localStorage.getItem('theme');
    if (current === 'auto') {
        applyTheme('auto');
    }
});

window.addEventListener("DOMContentLoaded", () => {
    document.getElementById("variable1").selectedIndex = 0;
    document.getElementById("variable2").selectedIndex = 0;
  });  
  
/* Gráficos interativos */

// Carreaga os arquivos CSV de 2019 e 2020
Promise.all([
        d3.csv("./data/data_graph/count_UF.csv"),
        d3.csv("./data/data_graph/count_Q006.csv"),
        d3.csv("./data/data_graph/count_Q022.csv"),
        d3.csv("./data/data_graph/count_Q024.csv"),
        d3.csv("./data/data_graph/count_Q025.csv"),
        d3.csv("./data/data_graph/count_TP_COR_RACA.csv"),
        d3.csv("./data/data_graph/count_TP_ESCOLA.csv"),
        d3.csv("./data/data_graph/count_TP_ESTADO_CIVIL.csv"),
        d3.csv("./data/data_graph/count_TP_FAIXA_ETARIA.csv"),
        d3.csv("./data/data_graph/count_TP_LOCALIZACAO_ESC.csv"),
        d3.csv("./data/data_graph/count_TP_SEXO.csv")
  ]).then(([dataUF, dataQ6, dataQ22, dataQ24, dataQ25, dataCR, dataEsc, dataEC, dataFE, dataLoc, dataSexo]) => {

    const dataList = [dataUF, dataCR, dataEC, dataFE, dataLoc, dataQ25, dataQ22, dataQ24, dataQ6, dataSexo, dataEsc];

    barCharts([], "all", null, dataUF);
    // boxPlot([], data2019Grouped, data2020Grouped);
    // updateHeatMap([], data2019, data2020);
    
    let selectedRegions = [];

    d3.select("#select-button").on("change", () => {
        const columnIndex = document.getElementById("select-button").value;
        const data = dataList[columnIndex];
        const dataColumns = Object.keys(data[0]);
        const column = dataColumns[1];

        barCharts(selectedRegions, column, null, data);
    });

    // Configuração do botão "Remover Filtros"
    d3.select("#reset-button").on("click", () => {
        const selectButton = document.getElementById("select-button");
        selectButton.selectedIndex = 0;
        const column = selectButton.options[0].value;
        selectedRegions = [];
        barCharts([], "all", null, dataSexo);
        // boxPlot([], data2019Grouped, data2020Grouped);
    
        svgMap.selectAll("path")
              .classed("selected", false)
              .transition().duration(300)
              .attr("fill", "#69b3a2");

        // document.getElementById("variable1").selectedIndex = 0;
        // document.getElementById("variable2").selectedIndex = 0;

        // updateHeatMap([], data2019, data2020);
        
        document.getElementById("selected-regions").textContent = "";
    });
    
    d3.select("#reset-button").style("display", "block");

    // d3.select("#variable1").on("change", () => {
    //     updateHeatMap([], data2019, data2020); 
    // });
    // d3.select("#variable2").on("change", () => {
    //     updateHeatMap([], data2019, data2020); 
    // });

    const containerMap = d3.select("#map-container")
    const widthMap = 800;
    const heightMap = 600;

    // Cria o SVG para o mapa
    const svgMap = containerMap
        .append("svg")
        .attr("viewBox", `0 0 ${widthMap} ${heightMap}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

    // Configura a projeção e o gerador de caminho
    const projection = d3.geoMercator()
        .scale(800)
        .center([-54, -14]) 
        .translate([widthMap / 2, heightMap / 2]);

    const path = d3.geoPath().projection(projection);

    // Carrega os dados GeoJSON
    d3.json("https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/brazil-states.geojson").then(geojson => {
        svgMap.selectAll("path")
            .data(geojson.features)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("fill", "#69b3a2")
            .attr("stroke", "#333")
            .on("mouseover", function (event, d) {
                d3.select(this).transition().duration(300).attr("fill", "#007400");

                tooltip.transition().duration(600).style("opacity", 1);
                tooltip.html(`<strong>${d.properties.name}</strong>`)
                    .style("left", `${event.pageX + 5}px`)
                    .style("top", `${event.pageY - 5}px`);
            })
            .on("mouseout", function (event, d) {
                if (!d3.select(this).classed("selected")) {
                    d3.select(this)
                    .transition().duration(500)
                    .attr("fill", "#69b3a2");
                }
                else {
                    d3.select(this).transition().duration(500).attr("fill", "darkgreen");
                }
                tooltip.transition().duration(200).style("opacity", 0);
            })
            .on("click", function (event, d) {
                // Fazer o toggle da seleção para a região clicada
                const current = d3.select(this);
                const isSelected = current.classed("selected");
                
                current.classed("selected", !isSelected)
                    .transition().duration(300)
                    .attr("fill", !isSelected ? "darkgreen" : "#69b3a2");
    
                // Atualiza a visualização com as regiões atualmente selecionadas
                svgMap.selectAll("path.selected")
                    .each((d) => {
                        if (!selectedRegions.includes(d.properties.sigla)) {
                            selectedRegions.push(d.properties.sigla);
                        }
                    });
                
                    if (isSelected) {
                        // Remove a região da lista
                        selectedRegions = selectedRegions.filter(region => region !== d.properties.sigla);
                    }

                const columnIndex = document.getElementById("select-button").value;
                const data = dataList[columnIndex];
                const dataColumns = Object.keys(data[0]);
                const column = dataColumns[1];

                barCharts(selectedRegions, column, null, data);
                // boxPlot(selectedRegions, data2019Grouped, data2020Grouped);
                // updateHeatMap(selectedRegions, data2019, data2020);

                if (selectedRegions.length > 0) {
                    document.getElementById("selected-regions").innerHTML = //TODO:Alterar sigla para nome ou tirar lower case
                      `<div class="selected-title">${selectedRegions.join(", <br>").toLowerCase()}</div>`;
                } else {
                    document.getElementById("selected-regions").innerHTML = "";
                  }
            });
    });
});
