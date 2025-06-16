import * as utils from "./utils.js";
const {LOOKUP, GLOBAL_MARGIN, tooltip} = utils;
    
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

export function updateHeatMap(regions, data2019, data2020) {
    const years = [2019, 2020];

    // Obtém por meio do select do HTML as variáveis dos eixos
    let selected1 = document.getElementById("variable1").value;
    let selected2 = document.getElementById("variable2").value;

    // Definição de proporções
    const marginHeatmap = { ...GLOBAL_MARGIN, left: 110, bottom: 80 };

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
    const filteredDataYears = {2019: filteredData2019, 2020: filteredData2020};

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