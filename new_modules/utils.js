export const LOOKUP = {
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

export const GLOBAL_MARGIN = { top: 30, right: 30, bottom: 50, left: 80 };

export const container = d3.select("#chart-container");
export const width = container.node().getBoundingClientRect().width;
export const height = 400;
export const margin = GLOBAL_MARGIN;

export const svg = container
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("preserveAspectRatio", "xMidYMid meet");

export const y = d3.scaleLinear()
    .range([height - margin.bottom, margin.top]);

export const barsGroup = svg.append("g")
    .attr("class", "bars");

export const tooltip = d3.select("body").append("div")
                                        .attr("class", "tooltip")
                                        .style("opacity", 0)
                                        .style("position", "absolute");

// Para o box plot
export const containerBox = d3.select("#boxplot-container");
export const widthBox = containerBox.node().getBoundingClientRect().width;
export const heightBox = 400;

export const svgBox = containerBox
    .append("svg")
    .attr("viewBox", `0 0 ${widthBox} ${heightBox}`)
    .attr("preserveAspectRatio", "xMidYMid meet");

export const yBox = d3.scaleLinear()
    .range([heightBox - margin.top, margin.bottom]);    

export const containerFlow = d3.select("#flow-chart");
export const widthFlow = containerFlow.node().getBoundingClientRect().width;
export const heightFlow = 400;

export const svgFlow = containerFlow
    .append("svg")
    .attr("viewBox", `0 0 ${widthFlow} ${heightFlow}`)
    .attr("preserveAspectRatio", "xMidYMid meet");