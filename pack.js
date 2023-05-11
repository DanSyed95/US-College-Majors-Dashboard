// Create SVG Element for Pack Hierarchical Visualization
const packMargin = { top: 60, right: 30, bottom: 10, left: 20 };
const packWidth = 1485;
const packXSize = packWidth - packMargin.left - packMargin.right;
const packHeight = 720;
const packYSize = packHeight - packMargin.top - packMargin.bottom;
const packSvg = d3.select(".packCluster")
    .append("svg")
    .attr("width", packWidth)
    .attr("height", packHeight)
    .style("border", "2px solid black")
    .append("g")
    .attr("transform", "translate(" + packMargin.left + "," + packMargin.top + ")");

// Load College Majors Data
d3.csv("https://raw.githubusercontent.com/fivethirtyeight/data/master/college-majors/all-ages.csv", (d) => ({
    major: d.Major,
    category: d.Major_category,
    total: +d.Total
})).then(data => {

    // Append title
    packSvg.append("text")
        .attr("x", 570)
        .attr("y", -15)
        .text("All College Majors Bubble Chart")
        .style("font-family", "Arial, Helvetica, sans-serif")
        .style("font-size", "20px")
        .style("font-weight", "bold");
    // Format Numbers by adding commas
    const numberFormatter = d3.format(",");

    // Color Map by Category of Major
    const categoryColorMap = {
        'Agriculture & Natural Resources': '#1f77b4',
        'Biology & Life Science': '#ff7f0e',
        'Engineering': '#2ca02c',
        'Humanities & Liberal Arts': '#d62728',
        'Communications & Journalism': '#9467bd',
        'Computers & Mathematics': '#8c564b',
        'Industrial Arts & Consumer Services': '#e377c2',
        'Education': '#7f7f7f',
        'Law & Public Policy': '#bcbd22',
        'Interdisciplinary': '#17becf',
        'Health': '#87343463',
        'Social Science': '#2d2c2c63',
        'Physical Sciences': '#00dda263',
        'Psychology & Social Work': '#7e7a8773',
        'Arts': '#3a00c073',
        'Business': '#bdac278d'
    };

    // Create hierarchical data structure for pack layout
    const root = d3.hierarchy({ children: data })
        .sum(d => d.total)
        .sort((a, b) => b.value - a.value);

    // Create pack layout
    const pack = d3.pack()
        .size([packXSize, packYSize])
        .padding(1);

    // Generate layout and get the nodes
    const nodes = pack(root).descendants().slice(1);

    // Create a new SVG group element for the simulation
    const simulationGroup = packSvg.append("g")
        .attr("class", "simulationGroup");

    // Define the force simulation
    const simulation = d3.forceSimulation()
        .force("center", d3.forceCenter(packXSize / 2, packYSize / 2))
        .force("charge", d3.forceManyBody().strength(5))
        .force("collide", d3.forceCollide().radius(d => d.r + 1).strength(1.5))
        .nodes(root.descendants().slice(1))
        .on("tick", ticked);

    // Define the tick function
    function ticked() {
        const circles = simulationGroup.selectAll("circle")
            .data(nodes)
            .join("circle")
            .attr("class", "packCircle")
            .attr("cx", d => d.x)
            .attr("cy", d => d.y)
            .attr("r", d => d.r)
            .attr("fill", d => d.children ? "#000" : categoryColorMap[d.data.category])
            .attr("stroke", "#000")
            .on("mouseover", function (event, d) {
                // Scale up the circle on mouseover
                d3.select(this)
                    .transition()
                    .duration(300)
                    .attr("r", d.r * 2);

                // Get SVG bounds
                const svgBounds = packSvg.node().getBoundingClientRect();
                // tooltip width and height
                const tooltipWidth = 510;
                const tooltipHeight = 60;
                let tooltipX = event.pageX;
                let tooltipY = event.pageY;
                // Adjust tooltip if it goes out of bounds of SVG
                if (tooltipX + tooltipWidth > svgBounds.right) {
                    tooltipX = svgBounds.right - tooltipWidth - 10;
                }
                if (tooltipY + tooltipHeight > svgBounds.bottom - 200) {
                    tooltipY = svgBounds.bottom - tooltipHeight - 200;
                }
                if (tooltipY + tooltipHeight > svgBounds.top - 200) {
                    tooltipY = svgBounds.bottom - tooltipHeight - 250;
                }
                // Append tooltip with major, category and total details
                const tooltip = packSvg.append("g")
                    .attr("id", "tooltip")
                    .attr("transform", `translate(${tooltipX}, ${tooltipY - 40})`);

                tooltip.append("rect")
                    .attr("width", tooltipWidth)
                    .attr("height", tooltipHeight)
                    .attr("fill", "white")
                    .attr("rx", "10")
                    .style("stroke", "#BDBDBD")
                    .style("border", "2px solid black");

                tooltip.append("text")
                    .text(`Major Category: ` + `${d.data.category}`)
                    .style("font-family", "Arial, Helvetica, sans-serif")
                    .style("font-size", "12px")
                    .attr("x", 5)
                    .attr("y", 15);

                tooltip.append("text")
                    .text(`Major: ` + `${d.data.major}`)
                    .style("font-family", "Arial, Helvetica, sans-serif")
                    .style("font-size", "12px")
                    .attr("x", 5)
                    .attr("y", 30);

                tooltip.append("text")
                    .text(`Total: ` + `${numberFormatter((d.data.total))}`)
                    .style("font-family", "Arial, Helvetica, sans-serif")
                    .style("font-size", "12px")
                    .attr("x", 5)
                    .attr("y", 45);
            })
            .on("mouseout", function (event, d) {
                // Scale down the circle on mouseout and remove tooltip
                d3.select(this)
                    .transition()
                    .duration(300)
                    .attr("r", d.r);
                packSvg.select('#tooltip').remove();
            })
    }

    // Call the simulation to start the animation
    simulation.alpha(1).restart();


    // Create legend
    const legend = packSvg.append("g")
        .attr("class", "legend")
        .selectAll("g")
        .data(Object.entries(categoryColorMap))
        .join("g")
        .attr("transform", (d, i) => `translate(0,${i * 20})`);

    legend.append("rect")
        .attr("x", packXSize - 260)
        .attr("width", 19)
        .attr("height", 19)
        .attr("fill", d => d[1]);

    legend.append("text")
        .attr("x", packXSize - 230)
        .attr("y", 9.5)
        .attr("dy", "0.32em")
        .style("font-family", "Arial, Helvetica, sans-serif")
        .style("font-size", "16px")
        .text(d => d[0]);


});
