// Create SVG Element for employed vs unemployed pie chart
const employmentMargin = { top: 20, right: 30, bottom: 102, left: 20 };
const employmentWidth = 580
const employmentXSize = employmentWidth - employmentMargin.left - employmentMargin.right
const employmentHeight = 345
const employmentYSize = employmentHeight - employmentMargin.top - employmentMargin.bottom;;
const employmentSvg = d3.select(".employmentPie")
  .append("svg")
  .attr("width", employmentXSize + employmentMargin.left + employmentMargin.right)
  .attr("height", employmentYSize + employmentMargin.top + employmentMargin.bottom)
  .style("border", "2px solid black")
  .append("g")
  .attr("transform", "translate(" + employmentMargin.left + "," + employmentMargin.top + ")")


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

  // Append the title
  employmentSvg.append("text")
    .attr("class", "x-label")
    .attr("x", 5)
    .attr("y", 5)
    .text("Percentage Employed vs Unemployed (Overall)")
    .style("font-family", "Arial, Helvetica, sans-serif")
    .style("font-size", "14px")
    .style("font-weight", "bold");

  // Filter the data to include only the employed and unemployed columns
  const employmentPieData = [
    { label: "Employed", value: d3.sum(data, d => d.employed) },
    { label: "Unemployed", value: d3.sum(data, d => d.unemployed) }
  ];


  // Define the pie layout
  const employmentPie = d3.pie()
    .value(d => d.value)
    .sort(null);

  // Define the arc generator
  const employmentArc = d3.arc()
    .innerRadius(100)
    .outerRadius(150);

  // Append the pie chart to the SVG element
  const employmentG = employmentSvg.append("g")
    .attr("transform", "translate(270, 175)")
    .attr("class", "employmentPie");

  // Generate the arcs for each portion of the pie
  const employmentArcs = employmentG.selectAll("path")
    .data(employmentPie(employmentPieData))
    .join("path")
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

  // Append a group element for the legend
  const employmentLegend = employmentSvg.append("g")
    .attr("transform", `translate(${employmentXSize - 100}, 20)`);

  // Add circles and labels to the legend
  const employmentLegendItems = employmentLegend.selectAll("g")
    .data(employmentPieData)
    .join("g")
    .attr("transform", (d, i) => `translate(0, ${i * 25})`);

  employmentLegendItems.append("circle")
    .attr("r", 6)
    .attr("fill", (d, i) => d3.schemeCategory10[i]);

  employmentLegendItems.append("text")
    .text(d => d.label)
    .attr("x", 15)
    .attr("y", 5)
    .style("font-family", "Arial, Helvetica, sans-serif")
    .style("font-size", "14px");


})
