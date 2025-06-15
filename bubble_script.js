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

// Tamanho do SVG
const width = 1000;
const height = 600;

// Projeção centrada no Brasil
const projection = d3.geoMercator()
    .center([-54, -15]) // centro aproximado do Brasil
    .scale(650)
    .translate([width / 2, height / 2 - 65]);

// Caminho geográfico
const path = d3.geoPath().projection(projection);

// Criar o SVG
const svg = d3.select("#mapa")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

// Grupos para o mapa e bolhas
const mapaGroup = svg.append("g");
const bolhasGroup = svg.append("g");

let dadosNotas = {};
let dadosPresenca = {}; // Armazenará os dados de presença por ano

let currentYear = "2019";

// Carrega o mapa e os dados
Promise.all([
    d3.json("https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/brazil-states.geojson"),
    d3.json("GeoJSON/estados_brasil.json"), // arquivo com lat/long dos estados
    d3.csv("data/data_graph/count_UF.csv"), // arquivo com dados do ENEM
    d3.csv("data/data_graph/taxa_presenca.csv") // arquivo CSV com dados de presença
]).then(([mapa, estados, enemData, presencaData]) => {
    // Organiza os dados do ENEM por ano e estado
    enemData.forEach(item => {
        if (!dadosNotas[item.ANO]) {
            dadosNotas[item.ANO] = [];
        }
        dadosNotas[item.ANO].push({
            UF: item.UF,
            QUANTIDADE_PESSOAS: item.QTD,
        });
    });

    // Organiza os dados de presença por ano e UF
    presencaData.forEach(item => {
        const ano = item.NU_ANO.toString();
        if (!dadosPresenca[ano]) {
            dadosPresenca[ano] = {};
        }
        if (!dadosPresenca[ano][item.SG_UF_PROVA]) {
            dadosPresenca[ano][item.SG_UF_PROVA] = [];
        }
        dadosPresenca[ano][item.SG_UF_PROVA].push(parseFloat(item.PRESENCA));
    });

    // Prepara os dados para as bolhas
    const datasets = {};
    
    // Para cada ano (2019-2023)
    for (let year = 2019; year <= 2023; year++) {
        datasets[year] = estados.map(estado => {
            const dadosEnem = dadosNotas[year].find(d => d.UF === estado.uf);
            return {
                uf: estado.uf,
                nome: estado.nome,
                lat: estado.latitude,
                lon: estado.longitude,
                regiao: estado.regiao,
                NUM_PARTICIPANTES: dadosEnem ? dadosEnem.QUANTIDADE_PESSOAS : 0
            };
        });
    }

    let selectedStates = [];

    // Desenha o mapa
    mapaGroup
        .selectAll("path")
        .data(mapa.features)
        .join("path")
        .attr("d", path)
        .attr("fill", "#69b3a2")
        .attr("stroke", "#1f1f1f")
        .attr("stroke-width", 1)
        .on("mouseover", function(event, d) {
            d3.select(this)
                .attr("stroke-width", "3px");
        })
        .on("mouseout", function() {
            d3.select(this)
                .attr("fill", "#69b3a2")
                .attr("stroke", "#1f1f1f")
                .attr("stroke-width", 1);
        })
        .on("click", function(event, d) {
            const current = d3.select(this);
            const isSelected = current.classed("selected");
            const uf = d.properties.sigla;

            // Alterna a seleção
            current.classed("selected", !isSelected)
                    .transition().duration(300)
                    .attr("stroke-width", !isSelected ? 3 : 1);

            if (!isSelected) {
                if (!selectedStates.includes(uf)) {
                    selectedStates.push(uf);
                }
            } else {
                selectedStates = selectedStates.filter(state => state !== uf);
            }

            // Atualiza o boxplot
            updateBoxplot(currentYear, selectedStates);
            
            // Sincroniza as bolhas
            bolhasGroup.selectAll("circle")
                .attr("stroke", d => selectedStates.includes(d.uf) ? "#16082f" : "none")
                .attr("stroke-width", d => selectedStates.includes(d.uf) ? 1 : 0)
                .classed("selected", d => selectedStates.includes(d.uf));
        });


    // Escala de tamanho
    const maxVal = d3.max(Object.values(datasets).flat(), d => d.NUM_PARTICIPANTES);
    const escalaRaio = d3.scaleSqrt()
        .domain([0, maxVal])
        .range([0, 9]);

    const tooltip = d3.select("#tooltip-map");

    // Função para atualizar bolhas
    function updateBubbles(data) {
        const bolhas = bolhasGroup.selectAll("circle")
            .data(data, d => d.uf);

        bolhas.join(
            enter => enter.append("circle")
            .attr("cx", d => {
                const [x, y] = projection([d.lon, d.lat]);
                d.originalX = x;  // guarda posição original
                return x;
            })
            .attr("cy", d => {
                const [x, y] = projection([d.lon, d.lat]);
                d.originalY = y;
                return y;
            })
            .attr("r", 0)
            .attr("fill", "steelblue")
            .attr("stroke", "#16082f") // Altera a cor do contorno 
            .attr("stroke-width", 1)
            .on("mouseover", function (event, d) {
                tooltip
                .style("visibility", "visible")
                .text(`Estado: ${d.nome} (${d.uf})\nRegião: ${d.regiao}\nNº de inscrições: ${d.NUM_PARTICIPANTES.toLocaleString()}`);
            })
            .on("mousemove", function (event) {
                tooltip
                .style("top", (event.pageY - 40) + "px")
                .style("left", (event.pageX - 200) + "px");
            })
            .on("mouseout", function () {
                tooltip.style("visibility", "hidden");
            })
            .on("click", function(event, d) {
                const current = d3.select(this);
                const isSelected = current.classed("selected");
                
                // Alterna a classe "selected" e ajusta o visual
                current.classed("selected", !isSelected)
                        .attr("stroke", !isSelected ? "#16082f" : "none")
                        .attr("stroke-width", !isSelected ? 1 : 0);
                
                if (!isSelected) {
                    // Se não estiver selecionado, adiciona a UF à lista
                    if (!selectedStates.includes(d.uf)) {
                        selectedStates.push(d.uf);
                    }
                } else {
                    // Se já estava selecionado, remove da lista
                    selectedStates = selectedStates.filter(state => state !== d.uf);
                }
                
                // Atualiza o boxplot com os estados selecionados
                updateBoxplot(currentYear, selectedStates);
                
                // Atualiza também o mapa para refletir a seleção
                mapaGroup.selectAll("path")
                    .classed("selected", feature => selectedStates.includes(feature.properties.sigla))
                    .attr("stroke-width", feature => selectedStates.includes(feature.properties.sigla) ? 1 : 1);
            })
            .transition()
            .duration(500)
            .attr("r", d => escalaRaio(d.NUM_PARTICIPANTES))
            .attr("stroke", d => selectedStates.includes(d.uf) ? "#16082f" : "none")
            .attr("stroke-width", d => selectedStates.includes(d.uf) ? 1 : 0),

            update => update
            .on("mouseover", function (event, d) {
                tooltip
                .style("visibility", "visible")
                .text(`Estado: ${d.nome} (${d.uf})\nRegião: ${d.regiao}\nNº de inscrições: ${d.NUM_PARTICIPANTES.toLocaleString()}`);
            })
            .on("mousemove", function (event) {
                tooltip
                .style("top", (event.pageY - 10) + "px")
                .style("left", (event.pageX + 10) + "px");
            })
            .on("mouseout", function () {
                tooltip.style("visibility", "hidden");
            })
            .transition()
            .duration(500)
            .attr("r", d => escalaRaio(d.NUM_PARTICIPANTES))
            .attr("cx", d => {
                const [x, y] = projection([d.lon, d.lat]);
                d.originalX = x;
                d.originalY = y;
                return x;
            })
            .attr("cy", d => d.originalY)
            .attr("stroke", d => selectedStates.includes(d.uf) ? "#16082f" : "none")
            .attr("stroke-width", d => selectedStates.includes(d.uf) ? 1 : 0),

            exit => exit
            .transition()
            .duration(500)
            .attr("r", 0)
            .remove()
        );

        // Atualiza o boxplot
        updateBoxplot(currentYear, selectedStates);
    }

    function atualizarTooltipSeHover() {
        const hovered = d3.select("circle:hover").data(); // pega os dados da bolha sob o mouse, se houver
        if (hovered.length > 0) {
            const d = hovered[0];
            tooltip
                .style("visibility", "visible")
                .text(`Estado: ${d.nome} (${d.uf})\nRegião: ${d.regiao}\nNº de inscrições: ${d.NUM_PARTICIPANTES.toLocaleString()}`);
        }
    }

    // Função para calcular estatísticas do boxplot
    function boxplotStats(values) {
        values = values.filter(v => !isNaN(v)).sort(d3.ascending);
        if (values.length === 0) return null;

        // Caso especial para apenas 1 valor
        if (values.length === 1) {
            const singleValue = values[0];
            return {
                q1: singleValue,
                median: singleValue,
                q3: singleValue,
                iqr: 0,
                min: singleValue,
                max: singleValue,
                outliers: [],
                singleValue: singleValue  // Adicionamos um campo especial para este caso
            };
        }
        
        const q1 = d3.quantile(values, 0.25);
        const median = d3.quantile(values, 0.5);
        const q3 = d3.quantile(values, 0.75);
        const iqr = q3 - q1;
        const min = Math.max(values[0], q1 - 1.5 * iqr);
        const max = Math.min(values[values.length - 1], q3 + 1.5 * iqr);
        
        return {
            q1: q1,
            median: median,
            q3: q3,
            iqr: iqr,
            min: min,
            max: max,
            outliers: values.filter(v => v < min || v > max)
        };
    }

    function updateBoxplot(year, selectedStates = []) {
        const container = d3.select("#boxplot-presenca");
        const svg = container.select("svg");
        svg.selectAll("*").remove();
        
        const margin = { top: 40, right: 10, bottom: 150, left: 60 };
        const containerWidth = container.node().getBoundingClientRect().width;
        const containerHeight = container.node().getBoundingClientRect().height;
        
        const width = containerWidth - margin.left - margin.right;
        const height = containerHeight - margin.top - margin.bottom;
        
        svg.attr("width", containerWidth)
        .attr("height", containerHeight);
        
        const g = svg.append("g")
                    .attr("transform", `translate(${margin.left},${margin.top})`);
        
        // Obter e preparar dados
        let boxplotData = Object.keys(dadosPresenca[year] || {})
            .map(uf => {
                const stats = boxplotStats(dadosPresenca[year][uf]);
                return {
                    uf: uf,
                    values: dadosPresenca[year][uf],
                    stats: stats,
                    median: stats ? stats.median : 0
                };
            })
            .filter(d => d.stats !== null);
        
        // Filtrar por estados selecionados se houver
        if (selectedStates.length > 0) {
            boxplotData = boxplotData.filter(d => selectedStates.includes(d.uf));
        }
        
        // Ordenar por mediana (decrescente)
        boxplotData.sort((a, b) => d3.descending(a.median, b.median));
        
        // Extrair UFs ordenadas
        const ufsOrdenadas = boxplotData.map(d => d.uf);
        
        // Escalas
        const x = d3.scaleBand()
            .domain(ufsOrdenadas)
            .range([0, width])
            .padding(0.2);
        
        const y = d3.scaleLinear()
            .domain([0, 1]) // Taxa de presença varia de 0 a 1
            .range([height, 0])
            .nice();
        
            // Desenhar os boxplots com transições
            boxplotData.forEach(d => {
                const stats = d.stats;
                
                // Grupo para cada boxplot
                const boxplotGroup = g.append("g")
                    .attr("class", "boxplot")
                    .attr("transform", `translate(${x(d.uf)},0)`);

                if (d.values.length === 1) {
                    // Caso especial para UFs com apenas 1 valor
                    boxplotGroup.append("circle")
                        .attr("cx", 0)
                        .attr("cy", y(stats.singleValue))
                        .attr("r", 0)
                        .attr("fill", "#e15759")
                        .attr("stroke", "#333")
                        .attr("stroke-width", 1)
                        .on("mouseover", function() {
                            d3.select("#tooltip-boxplot")
                                .style("visibility", "visible")
                                .html(`UF: ${d.uf}<br>Valor único: ${stats.singleValue.toFixed(2)}`);
                        })
                        .on("mousemove", function(event) {
                            d3.select("#tooltip-boxplot")
                                .style("top", (event.pageY - 10) + "px")
                                .style("left", (event.pageX + 10) + "px");
                        })
                        .on("mouseout", function() {
                            d3.select("#tooltip-boxplot").style("visibility", "hidden");
                        })
                        .transition()
                        .duration(500)
                        .attr("cx", x.bandwidth() / 2)
                        .attr("r", 3);
                } else { 
                    // Linha vertical (mínimo ao máximo) - com tooltip
                    boxplotGroup.append("line")
                        .attr("x1", x.bandwidth() / 2)
                        .attr("x2", x.bandwidth() / 2)
                        .attr("y1", y(stats.min))
                        .attr("y2", y(stats.max))
                        .attr("stroke", "#999")
                        .attr("stroke-width", 1)
                        .on("mouseover", function() {
                            d3.select("#tooltip-boxplot")
                                .style("visibility", "visible")
                                .html(`UF: ${d.uf}<br>Intervalo: ${stats.min.toFixed(2)} a ${stats.max.toFixed(2)}`);
                        })
                        .on("mousemove", function(event) {
                            d3.select("#tooltip-boxplot")
                                .style("top", (event.pageY - 10) + "px")
                                .style("left", (event.pageX + 10) + "px");
                        })
                        .on("mouseout", function() {
                            d3.select("#tooltip-boxplot").style("visibility", "hidden");
                        })
                        .style("pointer-events", "bounding-box");    

                    // Caixa principal (Q1 a Q3) - com tooltip completo
                    boxplotGroup.append("rect")
                        .attr("x", x.bandwidth() / 2)
                        .attr("y", y(stats.q3))
                        .attr("width", 0)
                        .attr("height", y(stats.q1) - y(stats.q3))
                        .attr("fill", "#4e79a7")
                        .attr("stroke", "#333")
                        .attr("stroke-width", 1)
                        .on("mouseover", function() {
                            d3.select("#tooltip-boxplot")
                                .style("visibility", "visible")
                                .html(`UF: ${d.uf}<br>
                                    Q1: ${stats.q1.toFixed(2)}<br>
                                    Mediana: ${stats.median.toFixed(2)}<br>
                                    Q3: ${stats.q3.toFixed(2)}<br>
                                    IQR: ${stats.iqr.toFixed(2)}`);
                        })
                        .on("mousemove", function(event) {
                            d3.select("#tooltip-boxplot")
                                .style("top", (event.pageY - 10) + "px")
                                .style("left", (event.pageX + 10) + "px");
                        })
                        .on("mouseout", function() {
                            d3.select("#tooltip-boxplot").style("visibility", "hidden");
                        })
                        .transition()
                        .duration(500)
                        .attr("x", x.bandwidth() * 0.1)
                        .attr("width", x.bandwidth() * 0.8)
                        .style("pointer-events", "bounding-box");

                    // Linha da mediana (sem tooltip próprio)
                    boxplotGroup.append("line")
                        .attr("x1", x.bandwidth() / 2)
                        .attr("x2", x.bandwidth() / 2)
                        .attr("y1", y(stats.median))
                        .attr("y2", y(stats.median))
                        .attr("stroke", "#fff")
                        .attr("stroke-width", 2)
                        .attr("opacity", 0)
                        .transition()
                        .duration(500)
                        .attr("opacity", 1)
                        .attr("x1", x.bandwidth() * 0.1)
                        .attr("x2", x.bandwidth() * 0.9);   

                    // Outliers (com tooltips individuais)
                    if (stats.outliers.length > 0) {
                        boxplotGroup.selectAll(".outlier")
                            .data(stats.outliers)
                            .enter()
                            .append("circle")
                            .attr("class", "outlier")
                            .attr("cx", 0)
                            .attr("cy", dVal => y(dVal))
                            .attr("r", 3)
                            .attr("fill", "#e15759")
                            .attr("stroke", "#333")
                            .attr("stroke-width", 0.5)
                            .on("mouseover", function(event, dVal) {
                                d3.select("#tooltip-boxplot")
                                    .style("visibility", "visible")
                                    .html(`UF: ${d.uf}<br>Outlier: ${dVal.toFixed(2)}`);
                            })
                            .on("mousemove", function(event) {
                                d3.select("#tooltip-boxplot")
                                    .style("top", (event.pageY - 10) + "px")
                                    .style("left", (event.pageX + 10) + "px");
                            })
                            .on("mouseout", function() {
                                d3.select("#tooltip-boxplot").style("visibility", "hidden");
                            })
                            .transition()
                            .duration(500)
                            .attr("cx", x.bandwidth() / 2)
                            .style("pointer-events", "bounding-box");
                    }
                    const boxHeight = y(stats.min) - y(stats.max); // Altura desde o máximo até mínimo
                    const boxTop = y(stats.max); // Posição Y do topo do boxplot

                    // Área transparente para capturar cliques
                    boxplotGroup.append("rect")
                        .attr("x", 0)
                        .attr("y", boxTop)
                        .attr("width", x.bandwidth())
                        .attr("height", boxHeight)
                        .attr("fill", "transparent")
                        .style("pointer-events", "all")
                        .on("mouseover", null) // Ignora mouseover
                        .on("mouseout", null)  // Ignora mouseout
                        .on("mousemove", null) // Ignora mousemove
                        .on("click", function(event) {
                            handleBoxplotClick(d.uf);
                    });  

                    boxplotGroup.selectAll(".outlier, line, rect:not([fill='transparent'])").raise();
                }
            });
        
        // Eixos
        g.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end")
            .style("font-size", "10px")
            .attr("dx", "-0.5em")
            .attr("dy", "0.5em");
        
        g.append("g")
            .attr("class", "axis axis--y")
            .call(d3.axisLeft(y).ticks(5))
            .style("font-size", "10px");
        
        // Títulos
        g.append("text")
            .attr("x", width / 2)
            .attr("y", -10)
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("font-weight", "bold")
            .text(`Distribuição das Taxas de Presença por UF - ${year}`);
        
        g.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -margin.left + 10)
            .attr("x", -height / 2)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .style("font-size", "12px")
            .style("font-weight", "bold")
            .text("Taxa de Presença");
        
        g.append("text")
            .attr("transform", `translate(${width / 2}, ${height + margin.bottom - 110})`)
            .style("text-anchor", "middle")
            .style("font-size", "12px")
            .style("font-weight", "bold")
            .text("Unidade Federativa (UF)");
    }

    // Função para tratar o clique no boxplot
    function handleBoxplotClick(uf) {
        const index = selectedStates.indexOf(uf);
        const isSelected = index !== -1;
        
        if (!isSelected) {
            // Adiciona à seleção existente (não substitui)
            selectedStates.push(uf);
        } else {
            // Remove apenas este UF da seleção
            selectedStates = selectedStates.filter(state => state !== uf);
        }
        
        // Atualiza o boxplot (que vai filtrar apenas os selecionados)
        updateBoxplot(currentYear, selectedStates);
        
        // Atualiza o mapa
        mapaGroup.selectAll("path")
            .classed("selected", feature => selectedStates.includes(feature.properties.sigla))
            .transition().duration(300)
            .attr("stroke-width", feature => selectedStates.includes(feature.properties.sigla) ? 4 : 1);
        
        // Atualiza as bolhas
        bolhasGroup.selectAll("circle")
            .attr("stroke", d => selectedStates.includes(d.uf) ? "#16082f" : "none")
            .attr("stroke-width", d => selectedStates.includes(d.uf) ? 1 : 0)
            .classed("selected", d => selectedStates.includes(d.uf));
    }

    // Slider
    d3.select("#yearSlider").on("input", function() {
        currentYear = this.value;
        d3.select("#selectedYear").text(currentYear);
        
        // Transição suave para as bolhas
        updateBubbles(datasets[currentYear], selectedStates);
        
        // Transição suave para o boxplot
        svg.selectAll(".boxplot-group")
        .transition()
        .duration(300)
        .attr("opacity", 0)
        .remove();
        
        updateBoxplot(currentYear, selectedStates);
    });

    // Lógica para o botão play
    let isPlaying = false;
    let animationInterval = null;

    const playButton = document.getElementById('playButton');
    const yearSlider = document.getElementById('yearSlider');

    playButton.addEventListener('click', () => {
        if (isPlaying) {
            // Pause
            clearInterval(animationInterval);
            playButton.textContent = '▶️ Play';
            isPlaying = false;
        } else {
            // Play
            isPlaying = true;
            playButton.textContent = '⏸️ Pause';
            
            animationInterval = setInterval(() => {
                // Avança o ano
                let nextYear = parseInt(currentYear) + 1;
                if (nextYear > 2023) nextYear = 2019;
                
                currentYear = nextYear.toString();
                
                yearSlider.value = currentYear;
                document.getElementById('selectedYear').textContent = currentYear;
                updateBubbles(datasets[currentYear]);
                atualizarTooltipSeHover();
            }, 1500);
        }
    });

    // Inicializa com 2019
    updateBubbles(datasets["2019"]);
});