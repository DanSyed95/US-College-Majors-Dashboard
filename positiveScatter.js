// Create SVG Element for positive scatter plot
const positiveMargin = { top: 20, right: 70, bottom: 65, left: 50 };
const positiveWidth = 740
const positiveXSize = positiveWidth - positiveMargin.left - positiveMargin.right
const positiveHeight = 700
const positiveYSize = positiveHeight - positiveMargin.top - positiveMargin.bottom;;
const positiveSvg = d3.select(".positiveScatter")
    .append("svg")
    .attr("width", positiveXSize + positiveMargin.left + positiveMargin.right)
    .attr("height", positiveYSize + positiveMargin.top + positiveMargin.bottom)
    .style("border", "2px solid black")
    .append("g")
    .attr("transform", "translate(" + positiveMargin.left + "," + positiveMargin.top + ")");

// Load Recent Grads Data
d3.csv("https://raw.githubusercontent.com/fivethirtyeight/data/master/college-majors/recent-grads.csv", (d) => ({
    code: d.Major_code,
    major: d.Major,
    category: d.Major_category,
    unemployment_rate: +d.Unemployment_rate,
    women_share: +d.ShareWomen,
})).then(function (data) {

    // Filter data for bottom 5 Health and top 5 Engineering majors
    const healthMajors = data.filter(d => d.category === 'Health')
        .sort((a, b) => a.unemployment_rate - b.unemployment_rate)
        .slice(0, 5);
    const engineeringMajors = data.filter(d => d.category === 'Engineering')
        .sort((a, b) => b.unemployment_rate - a.unemployment_rate)
        .slice(0, 5);
    // Concatenate all selected data     
    const filteredData = healthMajors.concat(engineeringMajors);

    // Defining arrays for circle color scheme
    const categories = ['Health', 'Engineering'];
    const colors = ['pink', 'steelblue'];

    // Append title
    positiveSvg.append("text")
        .attr("x", -20)
        .attr("y", 10)
        .text("Women Dominated Health Sector highly employable amongst recent graduates!")
        .style("font-family", "Arial, Helvetica, sans-serif")
        .style("font-size", "18px")
        .style("font-weight", "bold");

    // Append subtitle     
    positiveSvg.append("text")
        .attr("x", -20)
        .attr("y", 35)
        .text("Male Dominated Engineering sector not as employable, confirming rising importance of women-dominated sectors")
        .style("font-family", "Arial, Helvetica, sans-serif")
        .style("font-size", "14px");


    // Create scales for x and y axes
    const xScale = d3.scaleLinear()
        .domain([0, d3.extent(filteredData, d => d.women_share)[1]])
        .range([100, positiveXSize]);
    const yScale = d3.scaleLinear()
        .domain(d3.extent(filteredData, d => d.unemployment_rate))
        .range([positiveYSize, 75]);

    // Create x and y axes
    const xAxis = d3.axisBottom(xScale)
        .tickFormat(d3.format(".0%"));
    const yAxis = d3.axisLeft(yScale)
        .tickFormat(d3.format(".0%"));
    positiveSvg.append("g")
        .attr("id", "x-axis")
        .attr("transform", "translate(0," + positiveYSize + ")")
        .call(xAxis);
    positiveSvg.append("g")
        .attr("id", "y-axis")
        .attr("transform", "translate(100,0)")
        .call(yAxis);

    // Create x axis label        
    positiveSvg.append("text")
        .attr("x", positiveXSize / 2 + 50)
        .attr("y", positiveYSize + 40)
        .attr("text-anchor", "middle")
        .text("Share of Women")
        .attr("id", "x-label")
        .style("font-weight", "bold");
    // Create y axis label
    positiveSvg.append("text")
        .attr("id", "y-label")
        .attr("transform", "rotate(-90)")
        .attr("x", -positiveYSize / 2)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .text("Unemployment Rate")
        .style("font-weight", "bold");


    // Create circles for each data point
    positiveSvg.selectAll("circle")
        .data(filteredData)
        .join("circle")
        .attr("class", "positiveCircles")
        .attr("cx", d => xScale(d.women_share))
        .attr("cy", d => yScale(d.unemployment_rate))
        .attr("r", 0) // Start with zero radius
        // Fill circle color based on category
        .attr("fill", d => d.category === 'Health' ? 'pink' : 'steelblue')
        .attr("opacity", 0.8)
        .on("mouseover", function (event, d) {
            // Select the circle that was moused over and change its opacity to 0.8
            d3.select(this)
                .attr("opacity", 0.8);
            d3.select(this).attr('r', 8); // Increase radius on mousover to 8

            // Select all the other circles and change their opacity to 0.2
            positiveSvg.selectAll("circle:not(:hover)")
                .attr("opacity", 0.2);

            // Change opacity of x and y axes and their ticks
            positiveSvg.selectAll("#x-axis, #y-axis, #x-label, #y-label")
                .style("opacity", 0.2);
            // Append tooltip        
            const tooltip = positiveSvg.append("text")
                .attr("x", xScale(d.women_share) + 10)
                .attr("y", yScale(d.unemployment_rate) - 10)
                .attr("id", "tip")
                .attr("font-size", "12px")
                .attr("font-weight", "bold")
                .attr("text-anchor", "middle");
            tooltip.append("tspan").text(d.major);
            tooltip.append("tspan").text("Unemployment rate: " + (d.unemployment_rate * 100).toFixed(2) + "%")
                .attr("x", xScale(d.women_share))
                .attr("dy", "1.2em");
            tooltip.append("tspan").text("Share of women: " + (d.women_share * 100).toFixed(2) + "%")
                .attr("x", xScale(d.women_share))
                .attr("dy", "1.2em");

            // Get tooltip dimensions
            const bbox = tooltip.node().getBBox();

            // Set tooltip position
            const x = xScale(d.women_share) + 10;
            const y = yScale(d.unemployment_rate) - bbox.height - 700;
            const padding = 100;
            tooltip.attr("transform", `translate(${Math.min(Math.max(padding, x), positiveXSize - bbox.width - padding - 345)}, ${Math.min(Math.max(padding, y), positiveYSize - bbox.height - padding - 440)})`);
        })
        .on("mouseout", (event, d) => {
            // Reset the opacity of all the circles to 0.8 and the axis to normal
            positiveSvg.selectAll("circle")
                .attr("opacity", 0.8);
            positiveSvg.selectAll("#x-axis, #y-axis, #x-label, #y-label")
                .style("opacity", 1);
            // Remove tooltip and reset circle radius to 6    
            positiveSvg.selectAll("#tip").remove();
            d3.selectAll(".positiveCircles").attr('r', 6);
        })
        .transition() // Transition in the beginning
        .duration(500)
        .delay((d, i) => i * 100) // Set a delay based on the index of each data point
        .attr("r", 6);

    // Create a legend 
    const legend = positiveSvg.append("g")
        .attr("transform", `translate(${positiveXSize - 110}, ${positiveYSize - 550})`);

    // Append circles to legend       
    legend.selectAll(".legend-item")
        .data(categories)
        .enter()
        .append("circle")
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
        .enter()
        .append("text")
        .attr("class", "legend-text")
        .attr("x", 15)
        .attr("y", (d, i) => i * 20 + 9)
        .text(d => d)
        .style("font-size", "12px");


});


