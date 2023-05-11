// Create SVG Element for Main Bar Chart
const categoryMargin = { top: 20, right: 30, bottom: 100, left: 20 };
const categoryWidth = 1485;
const categoryXSize = categoryWidth - categoryMargin.left - categoryMargin.right;
const categoryHeight = 720;
const categoryYSize = categoryHeight - categoryMargin.top - categoryMargin.bottom;
const categorySvg = d3.select(".categoryBar")
    .append("svg")
    .attr("width", categoryXSize + categoryMargin.left + categoryMargin.right)
    .attr("height", categoryYSize + categoryMargin.top + categoryMargin.bottom)
    .style("border", "2px solid black")
    .append("g")
    .attr("transform", "translate(" + categoryMargin.left + "," + categoryMargin.top + ")");

// Load College Majors Data
d3.csv("https://raw.githubusercontent.com/fivethirtyeight/data/master/college-majors/all-ages.csv", (d) => ({
    code: d.Major_code,
    major: d.Major,
    category: d.Major_category,
    total: +d.Total,
    employed: +d.Employed,
    employed_yr: +d.Employed_full_time_year_round,
    unemployed: +d.Unemployed,
    unemployment_rate: +d.Unemployment_rate,
    median: +d.Median,
    p25: +d.P25th,
    p75: +d.P75th
})).then(function (data) {
    // Group by Distinct Major categories
    const categories = d3.group(data, d => d.category);

    // Creating a new map aggregating the total graduates by Major category
    const totalsByCategory = new Map(Array.from(categories, ([category, values]) => [category, d3.sum(values, d => +d.total)]));

    // Format Numbers by adding commas
    const numberFormatter = d3.format(",");

    // Create the x and y scales
    const x = d3.scaleBand()
        .domain(Array.from(totalsByCategory.keys()))
        .range([categoryMargin.left, categoryWidth - categoryMargin.right])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max(totalsByCategory.values())])
        .nice()
        .range([categoryHeight - categoryMargin.bottom, categoryMargin.top]);

    // Create the x and y axes     
    categorySvg.append("g")
        .attr("transform", `translate(7,${categoryHeight - categoryMargin.bottom - 30})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "rotate(-40)")
        .attr("text-anchor", "end")
        .style("font-size", "9px")
        .style("font-weight", "bold")
        .attr("dx", "1.5em")
        .attr("dy", "1.25em");

    categorySvg.append("g")
        .attr("transform", `translate(${categoryMargin.left + 7},-30)`)
        .call(d3.axisLeft(y))
        .selectAll("text")
        .attr("transform", "rotate(-40)")


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

    // Create the bar chart with events and transitions
    categorySvg.append("g")
        .selectAll("rect")
        .data(totalsByCategory)
        .join("rect")
        .attr("class", "categories")
        .attr("x", d => x(d[0]))
        .attr("y", d => categoryHeight - categoryMargin.bottom - 30)
        .attr("height", 0)   // Initially at 0 before transitioning in
        .attr("width", x.bandwidth())
        // Each bar colored according to the color scheme
        .attr("fill", d => categoryColorMap[d[0]])
        // On hover all non-hovered bars opacities will decrease
        .on("mousemove", function () {
            categorySvg.selectAll(".categories")
                .style('opacity', 0.2)
            d3.select(this)
                .style('opacity', 1);
        })
        // On click the employment pie chart, grad pie chart and top 5 majors pie chart will be filtered by selected bar category
        .on("click", (event, d) => {
            // Sort the data by total in descending order
            const sortedData = data.sort((a, b) => b.total - a.total);
            // Get the top 5 majors by total
            const top5Majors = sortedData.slice(0, 5);

            // Category data filtered by the bar selected on click 
            let selectedCategory = d[0];
            d3.select(".dropdown select").property("value", selectedCategory);
            let filteredData = data.filter(d => d.category === selectedCategory);
            // data sorted in descending order and limited to the top 5 values
            filteredData = filteredData.sort((a, b) => b.total - a.total).slice(0, 5);

            // Create x scale for top 5 majors
            const x = d3.scaleLinear()
                .domain([0, d3.max(filteredData, d => d.total)])
                .range([150, top5XSize - 100]);

            // Create y scale for top 5 majors
            const y = d3.scaleBand()
                .domain(filteredData.map(d => d.major))
                .range([50, top5YSize + 10])
                .padding(0.1);

            // Remove any previous x-axis for top 5 majors
            top5Svg.select(".x-axis").remove();

            // Add x-axis for top 5 majors
            const xAxis = d3.axisBottom(x).ticks(6);
            top5Svg.append("g")
                .attr("class", "x-axis")
                .attr("transform", "translate(0," + (top5YSize + 10) + ")")
                .call(xAxis)
                .style("font-weight", "bold");

            // Remove any previous y-axis for top 5 majors
            top5Svg.select(".y-axis").remove();

            // Add y-axis for top 5 majors
            const yAxis = d3.axisLeft(y);
            top5Svg.append("g")
                .attr("class", "y-axis")
                .attr("transform", "translate(150,0)")
                .call(yAxis)
                .selectAll("text")
                .style("font-size", "7px")
                .style("font-weight", "bold")
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .attr("transform", "rotate(-40)");

            // remove previous header for top 5 majors
            top5Svg.select(".title").remove();
            // Add a new header for top 5 majors
            top5Svg.append("text")
                .attr("class", "title")
                .attr("x", top5XSize / 2 + 100)
                .attr("y", 35)
                .attr("text-anchor", "middle")
                .style("font-size", "20px")
                .style("font-weight", "bold")
                .style("font-family", "Arial, Helvetica, sans-serif")
                .text("Top 5 Majors by Total Graduates (" + `${selectedCategory}` + ")");  // Seleccted category in header


            // Remove any previous bars for top 5 majors
            top5Svg.select(".majors").remove();

            // Add bars for top 5 major
            top5Svg.selectAll(".majors")
                .data(filteredData)
                .join("rect")
                .attr("class", "majors")
                .attr("x", 150)
                .attr("y", d => y(d.major))
                .attr("width", 0)
                .attr("height", y.bandwidth() - 10)
                .style("fill", d => categoryColorMap[d.category])
                .on("mouseover", function (event, d) {
                    // On hover all non-hovered bars opacities will decrease
                    top5Svg.selectAll(".majors")
                        .style('opacity', 0.2)
                    d3.select(this)
                        .style('opacity', 1);
                    // SVG bounds for tooltip  
                    const svgBounds = top5Svg.node().getBoundingClientRect();
                    // tooltip width and height
                    const tooltipWidth = 510;
                    const tooltipHeight = 60;
                    let tooltipX = event.pageX + 100;
                    let tooltipY = event.pageY - 900;
                    // Adjustment of tooltip if it exits any bounds
                    if (tooltipX + tooltipWidth > svgBounds.right) {
                        tooltipX = svgBounds.right - tooltipWidth
                    }
                    if (tooltipY + tooltipHeight > svgBounds.bottom) {
                        tooltipY = svgBounds.bottom - tooltipHeight;
                    }
                    if (tooltipY + tooltipHeight < svgBounds.top) {
                        tooltipY = svgBounds.top + tooltipHeight;
                    }
                    // appending tool tip when mouseover event occurs with bar category, major and total details
                    const tooltip = top5Svg.append("g")
                        .attr("id", "tooltip")
                        .attr("transform", `translate(${tooltipX - 100}, ${tooltipY})`);

                    tooltip.append("rect")
                        .attr("width", tooltipWidth)
                        .attr("height", tooltipHeight)
                        .attr("fill", "white")
                        .attr("rx", "10")
                        .style("stroke", "#BDBDBD");

                    tooltip.append("text")
                        .text(`Major Category: ` + `${d.category}`)
                        .style("font-family", "Arial, Helvetica, sans-serif")
                        .style("font-size", "12px")
                        .attr("x", 5)
                        .attr("y", 15);

                    tooltip.append("text")
                        .text(`Major: ` + `${d.major}`)
                        .style("font-family", "Arial, Helvetica, sans-serif")
                        .style("font-size", "12px")
                        .attr("x", 5)
                        .attr("y", 30);

                    tooltip.append("text")
                        .text(`Total: ` + `${(numberFormatter(d.total))}`)
                        .style("font-family", "Arial, Helvetica, sans-serif")
                        .style("font-size", "12px")
                        .attr("x", 5)
                        .attr("y", 45);

                })
                .on("mouseout", function () {
                    // changing opacity back to normal for all bars and removing the tooltip after mouseout event
                    top5Svg.selectAll(".majors")
                        .style('opacity', 1)
                    top5Svg.select("#tooltip").remove();
                })
                // transition in bars in the beginning
                .transition()
                .duration(1000)
                .ease(d3.easeLinear)
                .attr("width", d => x(d.total) - 100);

            // Filtering the data for the employment pie chart  

            // removing any previous title   
            employmentSvg.select(".x-label").remove();

            // Appending new title
            employmentSvg.append("text")
                .attr("class", "x-label")
                .attr("x", 5)
                .attr("y", 5)
                .text("Percentage Employed vs Unemployed (" + `${selectedCategory}` + ")")
                .style("font-family", "Arial, Helvetica, sans-serif")
                .style("font-size", "14px")
                .style("font-weight", "bold");

            // Filter the data to include only the employed and unemployed columns for selected category or overall
            if (selectedCategory === "Overall") {
                pieFilteredData = data;
            } else {
                pieFilteredData = data.filter(d => d.category === selectedCategory);
            }
            // Array data for employment pie chart
            const employmentPieData = [
                { label: "Employed", value: d3.sum(pieFilteredData, d => d.employed) },
                { label: "Unemployed", value: d3.sum(pieFilteredData, d => d.unemployed) }
            ];

            // Define the employment pie layout
            const employmentPie = d3.pie()
                .value(d => d.value)
                .sort(null);

            // Define the employment arc generator
            const employmentArc = d3.arc()
                .innerRadius(100)
                .outerRadius(150);

            // Remove the employment previous pie chart for employment
            employmentSvg.select('.employmentPie').remove();

            // Append the employment pie chart to the SVG element
            const employmentG = employmentSvg.append("g")
                .attr("transform", "translate(270, 175)")
                .attr("class", "employmentPie");

            // Generate the arcs for each portion of the employment pie
            const employmentArcs = employmentG.selectAll("path")
                .data(employmentPie(employmentPieData))
                .join("path")
                .attr("class", "employmentPie")
                .attr("d", employmentArc)
                .attr("fill", (d, i) => d3.schemeCategory10[i])
                .attr("stroke", "white")
                .style("stroke-width", "2px")
                .on("mousemove", function () {
                    // Change the opacity of the non-hovered-over portion pie chart
                    employmentSvg.selectAll("path")
                        .style('opacity', 0.2)
                    d3.select(this)
                        .style('opacity', 1)
                        .style("stroke", "red");
                })
                .on("mouseout", function () {
                    // Change the opacity of all pie portions to normal and remove tooltip
                    employmentSvg.selectAll('path')
                        .style('opacity', 1)
                        .style("stroke", "white");
                    employmentSvg.select("#tooltip").remove();
                })
                .on("mouseover", function (event, d) {
                    // Calculate percentage of employed and unemployed graduates
                    const overallTotal = employmentPieData[0].value + employmentPieData[1].value
                    // Get SVG bounds
                    const svgBounds = employmentSvg.node().getBoundingClientRect();
                    // Tooltip width and height 
                    const tooltipWidth = 150;
                    const tooltipHeight = 40;
                    let tooltipX = event.pageX - 1000;
                    let tooltipY = event.pageY - 1200;
                    // Adjust tooltip bounds if it moves out of bounds
                    if (tooltipY + tooltipHeight > svgBounds.bottom - 400) {
                        tooltipY = svgBounds.bottom - tooltipHeight - 400;
                    }
                    if (tooltipY + tooltipHeight < svgBounds.top - 200) {
                        tooltipY = svgBounds.bottom - tooltipHeight - 500;
                    }
                    // Append tooltip to svg for employment percentage
                    const tooltip = employmentSvg.append("g")
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
                        .text(`${d.data.label}: ` + `${(d.data.value / overallTotal * 100).toFixed(2)}` + ` %`)
                        .style("font-family", "Arial, Helvetica, sans-serif")
                        .style("font-size", "14px")
                        .style("font-weight", "bold")
                        .attr("x", 5)
                        .attr("y", 20);
                })
                // Transition in the beginning
                .transition()
                .duration(1500)
                .attrTween("d", function (d) {
                    const i = d3.interpolate(d.startAngle, d.endAngle);
                    return function (t) {
                        d.endAngle = i(t);
                        return employmentArc(d);
                    }
                });

            // Postgraduate vs Undergrad proportion pie chart     

            // Remove previous grad pie title
            gradSvg.select(".x-label").remove();

            // Add new title for grad pie
            gradSvg.append("text")
                .attr("class", "x-label")
                .attr("x", 5)
                .attr("y", 5)
                .text("Percentage with Postgraduate Degrees (" + `${selectedCategory}` + ")")
                .style("font-family", "Arial, Helvetica, sans-serif")
                .style("font-size", "14px")
                .style("font-weight", "bold");

            // Load College Majors Data for grad students
            d3.csv("https://raw.githubusercontent.com/fivethirtyeight/data/master/college-majors/grad-students.csv", (d) => ({
                code: d.Major_code,
                major: d.Major,
                category: d.Major_category,
                gradTotal: +d.Grad_total,
                nonGradTotal: d.Nongrad_total
            })).then(function (gradData) {
                // Filter the data based on selected category or the overall
                if (selectedCategory === "Overall") {
                    gradFilteredData = gradData;
                } else {
                    gradFilteredData = gradData.filter(d => d.category === selectedCategory);
                }
                // Filter the data to include only the grad and non-grad columns for selected category
                const gradPieData = [
                    { label: "Postgraduate Degree", value: d3.sum(gradFilteredData, d => d.gradTotal) },
                    { label: "Bachelor's Degree", value: d3.sum(gradFilteredData, d => d.nonGradTotal) }
                ];

                // Define the color scale for the grad pie portions
                const color = d3.scaleOrdinal()
                    .domain(["Postgraduate Degree", "Bachelor's Degree"])
                    .range(["#F7A210", "#F27979"]);

                // Define the grad pie layout
                const gradPie = d3.pie()
                    .value(d => d.value)
                    .sort(null);

                // Define the grad arc generator
                const gradArc = d3.arc()
                    .innerRadius(100)
                    .outerRadius(150);

                // Remove the previous pie chart for grad students

                gradSvg.select(".gradPie").remove();
                // Append the grad pie chart to the SVG element
                const gradG = gradSvg.append("g")
                    .attr("transform", "translate(270, 175)")
                    .attr("class", "gradPie");

                // Generate the arcs for each portion of the grad pie
                const gradArcs = gradG.selectAll("path")
                    .data(gradPie(gradPieData))
                    .join("path")
                    .attr("d", gradArc)
                    .attr("fill", (d) => color(d.data.label))
                    .attr("stroke", "white")
                    .style("stroke-width", "2px")
                    .on("mousemove", function () {
                        // Change opacity of non-hovered-overed pie proportion  
                        gradSvg.selectAll("path")
                            .style('opacity', 0.2)
                        d3.select(this)
                            .style('opacity', 1)
                            .style("stroke", "blue");
                    })
                    .on("mouseout", function () {
                        // Change opacity of pie proportions to normal and remove tooltip 
                        gradSvg.selectAll('path')
                            .style('opacity', 1)
                            .style("stroke", "white");
                        gradSvg.select("#tooltip").remove();
                    })
                    .on("mouseover", function (event, d) {
                        // Calculate percentage of postgraduate and undergraduate degree holders
                        const overallTotal = gradPieData[0].value + gradPieData[1].value
                        // Get SVG bounds
                        const svgBounds = gradSvg.node().getBoundingClientRect();
                        // Tooltip width and height
                        const tooltipWidth = 210;
                        const tooltipHeight = 40;
                        let tooltipX = event.pageX - 1050;
                        let tooltipY = event.pageY - 550;
                        // Adjust tooltip if it goes out of bounds of SVG
                        if (tooltipY + tooltipHeight > svgBounds.bottom - 200) {
                            tooltipY = svgBounds.bottom - tooltipHeight - 200;
                        }
                        if (tooltipY + tooltipHeight > svgBounds.top - 200) {
                            tooltipY = svgBounds.bottom - tooltipHeight - 250;
                        }
                        // Append tooltip with percentage of degree holders
                        const tooltip = gradSvg.append("g")
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
                            .text(`${d.data.label}: ` + `${(d.data.value / overallTotal * 100).toFixed(2)}` + ` %`)
                            .style("font-family", "Arial, Helvetica, sans-serif")
                            .style("font-size", "14px")
                            .style("font-weight", "bold")
                            .attr("x", 5)
                            .attr("y", 20);
                    })
                    // Transition in the beginning
                    .transition()
                    .duration(1500)
                    .attrTween("d", function (d) {
                        const i = d3.interpolate(d.startAngle, d.endAngle);
                        return function (t) {
                            d.endAngle = i(t);
                            return gradArc(d);
                        }
                    });
            })
        })
        .on("mouseout", function () {
            // Change opacity of non-hovered-over bars and remove tooltip
            categorySvg.selectAll(".categories")
                .style('opacity', 1)
            categorySvg.select("#tooltip").remove();
        })
        .on("mouseover", function (event, d) {
            // Get SVG limit bounds
            const svgBounds = categorySvg.node().getBoundingClientRect();
            // Tooltip width and height
            const tooltipWidth = 290;
            const tooltipHeight = 45;
            let tooltipX = event.pageX - 10;
            let tooltipY = event.pageY - 200;

            // Adjust tooltip position if it goes out of bounds
            if (tooltipX + tooltipWidth > svgBounds.right) {
                tooltipX = svgBounds.right - tooltipWidth - 140;
            }
            if (tooltipY + tooltipHeight > svgBounds.bottom) {
                tooltipY = svgBounds.bottom - tooltipHeight;
            }
            if (tooltipY + tooltipHeight < svgBounds.top) {
                tooltipY = svgBounds.top + tooltipHeight;
            }

            // Append tooltip with category and total number of graduates
            const tooltip = categorySvg.append("g")
                .attr("id", "tooltip")
                .attr("transform", `translate(${tooltipX}, ${tooltipY})`);

            tooltip.append("rect")
                .attr("width", tooltipWidth)
                .attr("height", tooltipHeight)
                .attr("fill", "white")
                .attr("rx", "10")
                .style("stroke", "#BDBDBD");

            tooltip.append("text")
                .text(`Major Category: ` + `${d[0]}`)
                .style("font-family", "Arial, Helvetica, sans-serif")
                .style("font-size", "12px")
                .attr("x", 5)
                .attr("y", 15);

            tooltip.append("text")
                .text(`Total: ` + `${numberFormatter(d[1])}`)
                .style("font-family", "Arial, Helvetica, sans-serif")
                .style("font-size", "12px")
                .attr("x", 5)
                .attr("y", 30);

        })
        // Transition in the main bar chart
        .transition()
        .duration(1000)
        .ease(d3.easeLinear)
        .attr("y", d => y(d[1]) - 30)
        .attr("height", d => y(0) - y(d[1]))

    // Add y-axis label to main bar chart
    categorySvg.append("text")
        .attr("class", "y-label")
        .attr("x", 30)
        .attr("y", 0)
        .text("Total")
        .style("font-weight", "bold")
        .style("font-family", "Helvetica, sans-serif");

    // Add x-axis label to main bar chart
    categorySvg.append("text")
        .attr("class", "x-label")
        .attr("x", 650)
        .attr("y", categoryHeight - 30)
        .text("Major Category")
        .style("font-weight", "bold")
        .style("font-family", "Helvetica, sans-serif");

    // Suggestion to click on bar to filter graphs by category  
    categorySvg.append("text")
        .attr("x", 1250)
        .attr("y", categoryHeight - 30)
        .text("Click on bar to filter by category!")
        .style("font-weight", "bold")
        .style("font-size", "10px")
        .style("font-family", "Helvetica, sans-serif");
})
