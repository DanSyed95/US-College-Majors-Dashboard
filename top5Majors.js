// Create SVG Element for top 5 majors bar chart
const top5Margin = { top: 20, right: 30, bottom: 80, left: 20 };
const top5Width = 900
const top5XSize = top5Width - top5Margin.left - top5Margin.right
const top5Height = 700
const top5YSize = top5Height - top5Margin.top - top5Margin.bottom;;
const top5Svg = d3.select(".categoryBar")
  .append("svg")
  .attr("width", top5XSize + top5Margin.left + top5Margin.right)
  .attr("height", top5YSize + top5Margin.top + top5Margin.bottom)
  .style("border", "2px solid black")
  .append("g")
  .attr("transform", "translate(" + top5Margin.left + "," + top5Margin.top + ")")

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

  // Create the dropdown menu with update function
  let dropdown = d3.select(".dropdown")
    .append("select")
    .on("change", update);

  // Group by Distinct Major categories
  let dataByCategory = d3.group(data, d => d.category);

  // Get the key value from distinct majors
  let categoryNames = Array.from(dataByCategory.keys());
  // Add Overall option in the array
  categoryNames.push("Overall");

  // Assign category names as dropdown menu options
  dropdown.selectAll("option")
    .data(categoryNames)
    .join("option")
    .text(function (d) { return d; })
    .property("value", function (d) { return d })
    .property("selected", function (d) { return d === "Overall"; });  // Default value of dropdown menu


  // Sort the data by total in descending order
  const sortedData = data.sort((a, b) => b.total - a.total);
  // Get the top 5 majors by total
  const top5Majors = sortedData.slice(0, 5);

  // Format Numbers by adding commas
  const numberFormatter = d3.format(",")

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

  // Create x scale for bar chart
  const x = d3.scaleLinear()
    .domain([0, d3.max(top5Majors, d => d.total)])
    .range([150, top5XSize - 100]);

  // Create y scale for bar chart
  const y = d3.scaleBand()
    .domain(top5Majors.map(d => d.major))
    .range([50, top5YSize + 10])
    .padding(0.1);

  // Add x-axis for bar chart
  const xAxis = d3.axisBottom(x).ticks(6);
  top5Svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", "translate(0," + (top5YSize + 10) + ")")
    .call(xAxis)
    .style("font-weight", "bold");

  // Add y-axis for bar chart
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

  // Add y-axis label for bar chart
  top5Svg.append("text")
    .attr("id", "y-label")
    .attr("x", 100)
    .attr("y", 50)
    .attr("text-anchor", "middle")
    .text("Major")
    .style("font-weight", "bold");

  // Add x-axis label for bar chart
  top5Svg.append("text")
    .attr("id", "x-label")
    .attr("x", 500)
    .attr("y", 650)
    .attr("text-anchor", "middle")
    .text("Total Graduates")
    .style("font-weight", "bold");

  // Add a header for bar chart
  top5Svg.append("text")
    .attr("class", "title")
    .attr("x", top5XSize / 2 + 100)
    .attr("y", 35)
    .attr("text-anchor", "middle")
    .style("font-size", "20px")
    .style("font-weight", "bold")
    .style("font-family", "Arial, Helvetica, sans-serif")
    .text("Top 5 Majors by Total Graduates (Overall)");

  // Add bars for top 5 majors bar chart
  top5Svg.selectAll(".majors")
    .data(top5Majors)
    .join("rect")
    .attr("class", "majors")
    .attr("x", 150)
    .attr("y", d => y(d.major))
    .attr("width", 0)  // Initially at zero before transitioning in        
    .attr("height", y.bandwidth() - 10)
    .style("fill", d => categoryColorMap[d.category])  // Major bars will match their category color scheme
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

  // Function to update category values from dropdown menu  
  function update() {
    // Filtering by selected category
    let selectedCategory = dropdown.property("value");
    let filteredData;
    // Overall Majors to remain as before if it is selected else the categories top 5 majors will be filtered
    if (selectedCategory === "Overall") {
      let selectedMajors = top5Majors.map(d => d.major)
      filteredData = data.filter(d => selectedMajors.includes(d.major));
    } else {
      filteredData = data.filter(d => d.category === selectedCategory);
    }

    filteredData = filteredData.sort((a, b) => b.total - a.total).slice(0, 5);


    // Create x scale for bar chart
    const x = d3.scaleLinear()
      .domain([0, d3.max(filteredData, d => d.total)])
      .range([150, top5XSize - 100]);

    // Create y scale for bar chart
    const y = d3.scaleBand()
      .domain(filteredData.map(d => d.major))
      .range([50, top5YSize + 10])
      .padding(0.1);


    // Remove any previous x-axis 
    top5Svg.select(".x-axis").remove();

    // Add x-axis for bar chart
    const xAxis = d3.axisBottom(x).ticks(6);
    top5Svg.append("g")
      .attr("class", "x-axis")
      .attr("transform", "translate(0," + (top5YSize + 10) + ")")
      .call(xAxis)
      .style("font-weight", "bold");

    // Remove any previous y-axis
    top5Svg.select(".y-axis").remove();

    // Add y-axis for bar chart
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

    // remove previous header 
    top5Svg.select(".title").remove();
    // Add a new header
    top5Svg.append("text")
      .attr("class", "title")
      .attr("x", top5XSize / 2 + 100)
      .attr("y", 35)
      .attr("text-anchor", "middle")
      .style("font-size", "20px")
      .style("font-weight", "bold")
      .style("font-family", "Arial, Helvetica, sans-serif")
      .text("Top 5 Majors by Total Graduates (" + `${selectedCategory}` + ")");


    // Remove any previous bars from chart
    top5Svg.select(".majors").remove();

    // Add bars for chart
    top5Svg.selectAll(".majors")
      .data(filteredData)
      .join("rect")
      .attr("class", "majors")
      .attr("x", 150)
      .attr("y", d => y(d.major))
      .attr("width", 0)    // Initially zero before transitioning in
      .attr("height", y.bandwidth() - 10)
      .style("fill", d => categoryColorMap[d.category])
      .on("mouseover", function (event, d) {

        top5Svg.selectAll(".majors")
          .style('opacity', 0.2)
        d3.select(this)
          .style('opacity', 1);

        const svgBounds = top5Svg.node().getBoundingClientRect();
        const tooltipWidth = 510;
        const tooltipHeight = 60;
        let tooltipX = event.pageX + 100;
        let tooltipY = event.pageY - 900;

        if (tooltipX + tooltipWidth > svgBounds.right) {
          tooltipX = svgBounds.right - tooltipWidth
        }
        if (tooltipY + tooltipHeight > svgBounds.bottom) {
          tooltipY = svgBounds.bottom - tooltipHeight;
        }
        if (tooltipY + tooltipHeight < svgBounds.top) {
          tooltipY = svgBounds.top + tooltipHeight;
        }

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
        top5Svg.selectAll(".majors")
          .style('opacity', 1)
        top5Svg.select("#tooltip").remove();
      })
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

    // Remove the previous pie chart for employment
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

  }

})
