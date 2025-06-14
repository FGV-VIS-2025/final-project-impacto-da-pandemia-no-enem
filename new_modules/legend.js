import { barCharts } from "./bar-chart.js";
import { flowChart } from "./flowChart.js";
import * as utils from "./utils.js";
const {LOOKUP, width, height, margin, svg} = utils;


export function createLegend(colorScale, column, regions, allCategories, currentFilter, data, type=1) {
    svg.selectAll(".legend").remove();
    
    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${width - margin.right - 180},${margin.top - 20})`);

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
            flowChart(regions, data, null, type=type);
            barCharts(regions, data);
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
                flowChart(regions, data, category, type);
                barCharts(regions, data, category);
            });
        });
    }
}
