// Create SVG Element for negative scatter plot
const negativeMargin = { top: 20, right: 75, bottom: 65, left: 100 };
const negativeWidth = 740
const negativeXSize = negativeWidth - negativeMargin.left - negativeMargin.right
const negativeHeight = 700
const negativeYSize = negativeHeight - negativeMargin.top - negativeMargin.bottom;;
const negativeSvg = d3.select(".negativeScatter")
    .append("svg")
    .attr("width", negativeXSize + negativeMargin.left + negativeMargin.right)
    .attr("height", negativeYSize + negativeMargin.top + negativeMargin.bottom)
    .style("border", "2px solid black")
    .append("g")
    .attr("transform", "translate(" + negativeMargin.left + "," + negativeMargin.top + ")")


// Load Recent Grads Data
d3.csv("https://raw.githubusercontent.com/fivethirtyeight/data/master/college-majors/recent-grads.csv", (d) => ({
    code: d.Major_code,
    major: d.Major,
    category: d.Major_category,
    unemployment_rate: +d.Unemployment_rate,
    women_share: +d.ShareWomen,
})).then(function (data) {

    // Filter the data for the relevant majors
    const artsMajors = data.filter(d => d.category === 'Arts')
        .sort((a, b) => b.unemployment_rate - a.unemployment_rate)
        .slice(0, 3);
    const engineeringMajors = data.filter(d => d.category === 'Engineering')
        .sort((a, b) => a.unemployment_rate - b.unemployment_rate)
        .slice(0, 5);
    const bioMajors = data.filter(d => d.category === 'Biology & Life Science')
        .sort((a, b) => b.unemployment_rate - a.unemployment_rate)
        .slice(0, 3);
    const humanitiesMajors = data.filter(d => d.category === 'Humanities & Liberal Arts')
        .sort((a, b) => b.unemployment_rate - a.unemployment_rate)
        .slice(0, 3);

    const educationMajors = data.filter(d => d.category === 'Education')
        .sort((a, b) => b.unemployment_rate - a.unemployment_rate)
        .slice(0, 3);
    // Concatenate all selected data    
    const filteredDataNegative = artsMajors.concat(engineeringMajors, bioMajors, humanitiesMajors, educationMajors);

    // Defining arrays for circle color scheme
    const categories = ['Arts', 'Engineering', 'Biology & Life Science', 'Humanities & Liberal Arts', 'Education'];
    const colors = ['turquoise', 'steelblue', 'purple', 'teal', 'orange'];

    // Append title
    negativeSvg.append("text")
        .attr("x", -43)
        .attr("y", 10)
        .text("Lesser opportunities in women dominated sectors amongst recent graduates!")
        .style("font-family", "Arial, Helvetica, sans-serif")
        .style("font-size", "18px")
        .style("font-weight", "bold");
    // Append subtitle   
    negativeSvg.append("text")
        .attr("x", -43)
        .attr("y", 35)
        .text("Male Dominated sectors continue to dominate job market in terms of employability")
        .style("font-family", "Arial, Helvetica, sans-serif")
        .style("font-size", "14px");

    // Create scales for x and y axes
    const xScaleNegative = d3.scaleLinear()
        .domain([0, d3.extent(filteredDataNegative, d => d.women_share)[1]])
        .range([100, negativeXSize]);
    const yScaleNegative = d3.scaleLinear()
        .domain(d3.extent(filteredDataNegative, d => d.unemployment_rate))
        .range([negativeYSize, 75]);

    // Create x and y axes
    const xAxisNegative = d3.axisBottom(xScaleNegative)
        .tickFormat(d3.format(".0%"));
    const yAxisNegative = d3.axisLeft(yScaleNegative)
        .tickFormat(d3.format(".0%"));
    negativeSvg.append("g")
        .attr("id", "x-axis")
        .attr("transform", "translate(0," + negativeYSize + ")")
        .call(xAxisNegative);
    negativeSvg.append("g")
        .attr("id", "y-axis")
        .attr("transform", "translate(100,0)")
        .call(yAxisNegative);

    // Create x axis label    
    negativeSvg.append("text")
        .attr("x", negativeXSize / 2 + 50)
        .attr("y", negativeYSize + 40)
        .attr("text-anchor", "middle")
        .text("Share of Women")
        .attr("id", "x-label")
        .style("font-weight", "bold");
    // Create y axis label
    negativeSvg.append("text")
        .attr("id", "y-label")
        .attr("transform", "rotate(-90)")
        .attr("x", -negativeYSize / 2)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .text("Unemployment Rate")
        .style("font-weight", "bold");

    // Create circles for each data point
    negativeSvg.selectAll("circle")
        .data(filteredDataNegative)
        .join("circle")
        .attr("class", "negativeCircles")
        .attr("cx", d => xScaleNegative(d.women_share))
        .attr("cy", d => yScaleNegative(d.unemployment_rate))
        .attr("r", 0)  // Start with zero radius
        // Fill circle color based on category
        .attr("fill", d => d.category === 'Arts' ? 'turquoise' : d.category === 'Engineering' ? 'steelblue' : d.category === 'Biology & Life Science' ? 'purple' : d.category === 'Humanities & Liberal Arts' ? 'teal' : 'orange')
        .attr("opacity", 0.8)
        .on("mouseover", function (event, d) {
            // Select the circle that was moused over and change its opacity to 0.8
            d3.select(this)
                .attr("opacity", 0.8);
            // Change opacity of x and y axes and their ticks
            negativeSvg.selectAll("#x-axis, #y-axis, #x-label, #y-label")
                .style("opacity", 0.2);
            d3.select(this).attr('r', 8); // Increase radius on mouseover to 8

            // Select all the other circles and change their opacity to 0.2
            negativeSvg.selectAll("circle:not(:hover)")
                .attr("opacity", 0.2);
            // Append tooltip    
            const negativeToolTip = negativeSvg.append("text")
                .attr("x", xScaleNegative(d.women_share) + 10)
                .attr("y", yScaleNegative(d.unemployment_rate) - 10)
                .attr("id", "negativeTip")
                .attr("font-size", "12px")
                .attr("font-weight", "bold")
                .attr("text-anchor", "middle");
            negativeToolTip.append("tspan").text(d.major);
            negativeToolTip.append("tspan").text("Unemployment rate: " + (d.unemployment_rate * 100).toFixed(2) + "%")
                .attr("x", xScaleNegative(d.women_share))
                .attr("dy", "1.2em");
            negativeToolTip.append("tspan").text("Share of women: " + (d.women_share * 100).toFixed(2) + "%")
                .attr("x", xScaleNegative(d.women_share))
                .attr("dy", "1.2em");
            // Get tooltip dimensions
            const bbox = negativeToolTip.node().getBBox();

            // Set tooltip position
            const x = xScaleNegative(d.women_share) + 10;
            const y = yScaleNegative(d.unemployment_rate) - bbox.height - 700;
            const padding = 100;
            negativeToolTip.attr("transform", `translate(${Math.min(Math.max(padding, x), negativeXSize - bbox.width - padding - 317)}, ${Math.min(Math.max(padding, y), negativeYSize - bbox.height - padding - 440)})`);
        })
        .on("mouseout", (event, d) => {

            // Reset the opacity of all the circles to 0.8 and the axis to normal
            negativeSvg.selectAll("circle")
                .attr("opacity", 0.8);
            negativeSvg.selectAll("#x-axis, #y-axis, #x-label, #y-label")
                .style("opacity", 1);
            // Remove tooltip and reset circle radius to 6    
            negativeSvg.selectAll("#negativeTip").remove();
            d3.selectAll(".negativeCircles").attr('r', 6);
        })
        .transition() // Transition in the beginning
        .duration(500)
        .delay((d, i) => i * 100) // Set a delay based on the index of each data point
        .attr("r", 6);

    // Create a legend 
    const legend = negativeSvg.append("g")
        .attr("transform", `translate(${negativeXSize - 640}, ${negativeYSize - 550})`);

    // Append circles to legend    
    legend.selectAll(".legend-item")
        .data(categories)
        .join("circle")
        .attr("class", "legend-item")
        .attr("cx", 0)
        .attr("cy", (d, i) => i * 20)
        .attr("r", 6)
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", (d, i) => colors[i]);

    // Append category names to legend
    legend.selectAll(".legend-text")
        .data(categories)
        .join("text")
        .attr("class", "legend-text")
        .attr("x", 15)
        .attr("y", (d, i) => i * 20 + 9)
        .text(d => d)
        .style("font-size", "12px");



});


