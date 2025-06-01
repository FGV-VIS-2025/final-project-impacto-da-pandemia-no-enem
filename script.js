/* Dicionário para variáveis */
const LOOKUP = {
    TP_SEXO: {
        M: "Masculino",
        F: "Feminino"
    },
    TP_COR_RACA: {
        0: "Não declarado",
        1: "Branca",
        2: "Preta",
        3: "Parda",
        4: "Amarela",
        5: "Indígena",
        6: "Não dispõe da informação"
    },
    TP_ESCOLA: {
        1: "Não respondeu",
        2: "Pública", 
        3: "Privada"
    },
    TP_ESTADO_CIVIL: {
        0: "Não informado", 
        1: "Solteiro(a)",
        2: "Casado(a)",
        3: "Divorciado(a)",
        4: "Viúvo(a)",
    },
    TP_FAIXA_ETARIA: {
        1: "Menor de 17 anos",
        2: "17 anos",
        3: "18 anos",
        4: "19 anos",
        5: "20 anos",
        6: "Acima de 20 anos"
    },
    TP_LOCALIZACAO_ESC: {
        "1.0": "Urbana",
        "2.0": "Rural"
    },
    Q006: {
        "A": "Nenhuma Renda",
        "B": "Até 1 salário",
        "C": "De 1 a 2 salários",
        "D": "De 2 a 3 salários",
        "E": "De 3 a 4 salários",
        "F": "De 4 a 5 salários",
        "G": "Acima de 5 salários"
    },
    Q022: {
        "A": "Não Possui",
        "B": "Um",
        "C": "Dois",
        "D": "Três",
        "E": "Quatro ou mais" 
    },
    Q024: {
        "A": "Não Possui",
        "B": "Um",
        "C": "Dois",
        "D": "Três",
        "E": "Quatro ou mais" 
    },
    Q025: {
        "A": "Não",
        "B": "Sim"
    }
}


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


/* Margem padrão */
const GLOBAL_MARGIN = { top: 30, right: 30, bottom: 50, left: 80 };
  
  
/* Gráficos interativos */

// Carreaga os arquivos CSV de 2019 e 2020
Promise.all([
        d3.csv("./data/enem2019-mg.csv"),
        d3.csv("./data/enem2020-mg.csv"),
        d3.csv("./data/enem2019-mg-grouped.csv"),
        d3.csv("./data/enem2020-mg-grouped.csv")
  ]).then(([data2019, data2020, data2019Grouped, data2020Grouped]) => {

    // Para o box plot
    const containerBox = d3.select("#boxplot-container");
    const widthBox = containerBox.node().getBoundingClientRect().width;
    const heightBox = 400;

    const svgBox = containerBox
        .append("svg")
        .attr("viewBox", `0 0 ${widthBox} ${heightBox}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

    // Para o gráfico de barras
    const container = d3.select("#chart-container");
    const width = container.node().getBoundingClientRect().width;
    const height = 400;
    const margin = GLOBAL_MARGIN;
  
    const svg = container
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet");
  
    const x = d3.scaleBand()
        .domain(["2019", "2020"])
        .range([margin.left, width - margin.right])
        .padding(0.4);
  
    const y = d3.scaleLinear()
        .range([height - margin.bottom, margin.top]);

    const yBox = d3.scaleLinear()
        .range([heightBox - margin.top, margin.bottom]);    
  
    const barsGroup = svg.append("g")
        .attr("class", "bars");

    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip");

    // Atualiza o gráfico com base na região selecionada
    function barCharts(regions, column = "all", filteredCategory) {
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
            .attr("x", widthBox / 2)
            .attr("y", heightBox - 6)
            .text("Ano")
            .style("font-weight", "normal");        
        
        svg.append("text")
            .attr("class", "y-label")
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .attr("x", -heightBox / 2)
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
                barCharts(regions, column, filteredCategory === d.key ? null : d.key);
            });
    
        if (column && column !== "all"){
            createLegend(colorScale, column, regions, allCategories, filteredCategory);
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
    
    function createLegend(colorScale, column, regions, allCategories, currentFilter) {
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
                barCharts(regions, column, null);
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
                    barCharts(regions, column, category);
                });
            });
        }
    }    

    function boxPlot(regions) {
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

        // Tooltip (criado uma vez fora do loop)
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

    function updateColorbar(colorscale) {
        const container = d3.select("#colorbar");
        container.selectAll("*").remove();

        // Define proporções
        const margin = { ...GLOBAL_MARGIN, left: 120, bottom: 80 };
        const width = 400
        const height = 20;

        const svg = container.append("svg")
            .attr("viewBox", `0 35 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
            .attr("preserveAspectRatio", "xMidYMid meet")

        const defs = svg.append("defs")
        const grads = defs.append("linearGradient")
            .attr("id", "legend-gradient")
            .attr("x1", "0%").attr("y1", "0%")
            .attr("x2", "100%").attr("y2", "0%");

        const n = 10;
        const [minVal, maxVal] = colorscale.domain();
        const stops = d3.range(n).map(i => minVal + (maxVal - minVal) * i / (n - 1));

        // Adiciona os stops ao gradiente
        grads.selectAll("stop")
            .data(stops)
            .enter()
            .append("stop")
                .attr("offset", (d, i) => `${100*i/(n-1)}%`)
                .attr("stop-color", d => colorscale(d));

        // Adiciona o retângulo com o gradiente
        svg.append("rect")
            .attr("x", margin.left)
            .attr("y", margin.top)
            .attr("width", width)
            .attr("height", height)
            .style("fill", "url(#legend-gradient)");  

        const legendScale = d3.scaleLinear()
            .domain(colorscale.domain())
            .range([0, width]);

        // Adiciona o eixo
        const axis = d3.axisBottom(legendScale)
            .ticks(5)
            .tickFormat(d3.format("~s"));

        svg.append("g")
            .attr("transform", `translate(${margin.left},${height + margin.top})`)
            .call(axis);

        // Adiciona o rótulo do eixo
        svg.append("text")
            .attr("class", "colorbar-label")
            .attr("x", margin.left + width/2) 
            .attr("y", height + margin.top + 30) 
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .style("font-family", "sans-serif")
            .text("Quantidade de Inscrições");    
    }

    function updateHeatMap(regions) {
        const years = [2019, 2020];

        // Obtém por meio do select do HTML as variáveis dos eixos
        let selected1 = document.getElementById("variable1").value;
        let selected2 = document.getElementById("variable2").value;

        // Definição de proporções
        const marginHeatmap = { ...GLOBAL_MARGIN, left: 110, bottom: 80 };
        const heatmapContainer = d3.select("#heatmap-container");

        const fullWidth = 500;
        const fullHeight = 500;

        const width = fullWidth - marginHeatmap.left - marginHeatmap.right;
        const height = fullHeight - marginHeatmap.top - marginHeatmap.bottom;

        // Filtra por região
        const filteredData2019 = (regions.length === 0) ? data2019 : data2019.filter(d => regions.includes(d.MESORREGIAO));
        const filteredData2020 = (regions.length === 0) ? data2020 : data2020.filter(d => regions.includes(d.MESORREGIAO));

        // Armazena os dados para cada combinação de variáveis
        let counts2019 = {};
        filteredData2019.forEach(d => {
            const variable1 = d[selected1];
            const variable2 = d[selected2];
            if (variable1 === "" || variable2 === "") return; // Ignora valores vazios
            const key = `${variable1}-${variable2}`
            counts2019[key] = (counts2019[key] || 0) + 1;
        });

        let counts2020 = {};
        filteredData2020.forEach(d => {
            const variable1 = d[selected1];
            const variable2 = d[selected2];
            if (variable1 === "" || variable2 === "") return; // Ignora valores vazios
            const key = `${variable1}-${variable2}`
            counts2020[key] = (counts2020[key] || 0) + 1;
        });

        // Define o domínio da escala de cores
        let maxCount2019 = d3.max(Object.values(counts2019));
        let maxCount2020 = d3.max(Object.values(counts2020));

        const customBlues = t => d3.interpolateBlues(0.1 + 0.9 * t); // Removendo tons muito claros

        const color = d3.scaleSequential()
            .interpolator(customBlues)
            .domain([0, d3.max(Object.values([maxCount2019, maxCount2020]))]);
            
        // Bases de dados por anos
        filteredDataYears = {2019: filteredData2019, 2020: filteredData2020};

        // Cria o heatmaps
        years.forEach(year => {
            const cats1 = [...new Set(filteredDataYears[year].map(d => d[selected1]))].filter(d => d !== "").sort();
            const cats2 = [...new Set(filteredDataYears[year].map(d => d[selected2]))].filter(d => d !== "").sort();

            // Converte os valores para os rótulos correspondentes
            const map1 = LOOKUP[selected1] || (d=>d);
            const map2 = LOOKUP[selected2] || (d=>d);

            // Realiza as contagens para cada combinação de variáveis
            const fullGrid = []
            if (year === 2019) {
                cats1.forEach(v1 => {
                    cats2.forEach(v2 => {
                        const key = `${v1}-${v2}`;
                        fullGrid.push({
                            v1,
                            v2,
                            value: counts2019[key] || 0
                        });
                    });
                });
            }
            else if (year === 2020) {
                cats1.forEach(v1 => {
                    cats2.forEach(v2 => {
                        const key = `${v1}-${v2}`;
                        fullGrid.push({
                            v1,
                            v2,
                            value: counts2020[key] || 0
                        });
                    });
                });
            }

            //  Desenvolvimento do gráfico
            const x = d3.scaleBand()
                .domain(cats1)
                .range([0, width])
                .padding(0.05);

            const y = d3.scaleBand()
                .domain(cats2)
                .range([height, 0])
                .padding(0.05);

            let svgHeatmap;
            if (year === 2019) {    
                svgHeatmap = d3.select("#heatmap2019")
                    .attr("width", "100%")
                    .attr("height", "auto")
                    .attr("viewBox", `-50 0 ${fullWidth + 50} ${fullHeight}`)
                    .attr("preserveAspectRatio", "xMidYMid meet");
            }
            else if (year === 2020) {
                svgHeatmap = d3.select("#heatmap2020")
                    .attr("width", "100%")
                    .attr("height", "auto")
                    .attr("viewBox", `-50 0 ${fullWidth + 50} ${fullHeight}`)
                    .attr("preserveAspectRatio", "xMidYMid meet");

            }

            svgHeatmap.selectAll("*").remove();
            // Atualiza o eixo Y
            const g = svgHeatmap.append("g")
                .attr("transform", `translate(${marginHeatmap.left},${marginHeatmap.top})`);

            // Adiciona os retângulos e o tooltip
            g.selectAll("rect")
                .data(fullGrid, d => d.v1 + "-" + d.v2)
                .enter()
                .append("rect")
                    .attr("x", d => x(d.v1))
                    .attr("y", d => y(d.v2))
                    .attr("width", x.bandwidth() - 1)
                    .attr("height", y.bandwidth() - 1)
                    .attr("fill", d => color(d.value))
                    .on("mouseover", (event, d) => {
                        const label1 = map1[d.v1] ||  d.v1;
                        const label2 = map2[d.v2] ||  d.v2;

                        if (!label1 && !label2) {
                            tooltip.style("opacity", 1).html(`<strong>Total</strong><br/><em>${d.value}</em> Inscrições`);}
                        else if (!label1){
                            tooltip.style("opacity", 1).html(`<strong>Total: ${label2}</strong><br/><em>${d.value}</em> Inscrições`);}
                        else if (!label2){
                            tooltip.style("opacity", 1).html(`<strong>Total: ${label1}</strong><br/><em>${d.value}</em> Inscrições`);}
                        else {
                            tooltip.style("opacity", 1).html(`<strong>Total: ${label1} × ${label2}</strong><br/><em>${d.value}</em> Inscrições`);}
                    })
                    .on("mousemove", (event, d) => {
                        tooltip.style("left", `${event.pageX + 10}px`).style("top", `${event.pageY - 25}px`);
                    })
                    .on("mouseout", () => {
                        tooltip.style("opacity", 0);
                    })

            
            // Adiciona os rótulos de texto
            const xAxis = d3.axisBottom(x).tickFormat(code => map1[code] ?? code);
            const yAxis = d3.axisLeft(y).tickFormat(code => map2[code] ?? code);

            const selectedText1 = document.getElementById("variable1").options[document.getElementById("variable1").selectedIndex].text;
            const selectedText2 = document.getElementById("variable2").options[document.getElementById("variable2").selectedIndex].text;
    
            // Eixo X
            g.append("g")
                .attr("class", "x-axis")
                .attr("transform", `translate(0,${height})`)
                .call(xAxis)
                .selectAll("text")
                    .attr("transform", "rotate(-45)")
                    .attr("dx", "-0.6em")
                    .attr("dy", "0.25em")
                    .style("text-anchor", "end");

            // Eixo Y
            g.append("g")
                .attr("class", "y-axis")
                .attr("transform", `translate(0,0)`)
                .call(yAxis)
                .selectAll("text")
                    .attr("dx", "-0.6em")
                    .style("text-anchor", "end");
                    
            // Rótulos dos eixos
            g.append("text")
                .attr("class","axis-label")
                .attr("x", width / 2)
                .attr("y", height + marginHeatmap.bottom/2 + 35)
                .attr("text-anchor", "middle")
                .text(selectedText1);

            g.append("text")
                .attr("class","axis-label")
                .attr("transform", "rotate(-90)")
                .attr("x", -height / 2)
                .attr("y", -marginHeatmap.left)
                .attr("text-anchor", "middle")
                .text(selectedText2);
            })

            updateColorbar(color);
    }

    barCharts([]); 
    boxPlot([]);
    updateHeatMap([]);
    

    d3.select("#select-button").on("change", () => {
        const category = document.getElementById("select-button").value;
        barCharts([], category); 
    });

    // Configuração do botão "Remover Filtros"
    d3.select("#reset-button").on("click", () => {
        const selectButton = document.getElementById("select-button");
        selectButton.selectedIndex = 0;
        const category = selectButton.options[0].value;
    
        barCharts([], category);
        boxPlot([]);
    
        svgMap.selectAll("path")
              .classed("selected", false)
              .transition().duration(300)
              .attr("fill", "#69b3a2");

        document.getElementById("variable1").selectedIndex = 0;
        document.getElementById("variable2").selectedIndex = 0;

        updateHeatMap([]);
        updateHeatMap([]);
        
        document.getElementById("selected-regions").textContent = "";
    });
    
    d3.select("#reset-button").style("display", "block");

    d3.select("#variable1").on("change", () => {
        updateHeatMap([]); 
        updateHeatMap([]);
    });
    d3.select("#variable2").on("change", () => {
        updateHeatMap([]); 
        updateHeatMap([]);
    });

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
        .scale(3500)
        .center([-45.5, -18.5]) 
        .translate([widthMap / 2, heightMap / 2]);

    const path = d3.geoPath().projection(projection);

    // Carrega os dados GeoJSON
    d3.json("./GeoJSON/regioes_minas.JSON").then(geojson => {
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
                tooltip.html(`<strong>${d.properties.nm_meso}</strong>`)
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
    
                // Opcional: atualizar a visualização com as regiões atualmente selecionadas
                const selectedRegions = [];
                svgMap.selectAll("path.selected")
                    .each((d) => {
                        selectedRegions.push(d.properties.nm_meso);
                    });
                
                const category = document.getElementById("select-button").value;
                barCharts(selectedRegions, category);
                boxPlot(selectedRegions);
                updateHeatMap(selectedRegions, 2019);
                updateHeatMap(selectedRegions, 2020);

                if (selectedRegions.length > 0) {
                    document.getElementById("selected-regions").innerHTML =
                      `<div class="selected-title">${selectedRegions.join(", <br>").toLowerCase()}</div>`;
                } else {
                    document.getElementById("selected-regions").innerHTML = "";
                  }
            });
    });
});
