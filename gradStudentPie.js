// Create SVG Element for the graduate vs postgraduate pie chart
const gradMargin = { top: 20, right: 30, bottom: 100, left: 20 };
const gradWidth = 580
const gradXSize = gradWidth - gradMargin.left - gradMargin.right
const gradHeight = 350
const gradYSize = gradHeight - gradMargin.top - gradMargin.bottom;;
const gradSvg = d3.select(".gradStudentPie")
  .append("svg")
  .attr("width", gradXSize + gradMargin.left + gradMargin.right)
  .attr("height", gradYSize + gradMargin.top + gradMargin.bottom)
  .style("border", "2px solid black")
  .append("g")
  .attr("transform", "translate(" + gradMargin.left + "," + gradMargin.top + ")")

// Load College Majors Data for grad students
d3.csv("https://raw.githubusercontent.com/fivethirtyeight/data/master/college-majors/grad-students.csv", (d) => ({
  code: d.Major_code,
  major: d.Major,
  category: d.Major_category,
  gradTotal: +d.Grad_total,
  nonGradTotal: d.Nongrad_total
})).then(function (data) {

  // Filter the data to include only the grad and non-grad columns
  const gradPieData = [
    { label: "Postgraduate Degree", value: d3.sum(data, d => d.gradTotal) },
    { label: "Bachelor's Degree", value: d3.sum(data, d => d.nonGradTotal) }
  ];

  // Append title
  gradSvg.append("text")
    .attr("class", "x-label")
    .attr("x", 5)
    .attr("y", 5)
    .text("Percentage with Postgraduate Degrees (Overall)")
    .style("font-family", "Arial, Helvetica, sans-serif")
    .style("font-size", "14px")
    .style("font-weight", "bold");

  // Define the color scale
  const color = d3.scaleOrdinal()
    .domain(["Postgraduate Degree", "Bachelor's Degree"])
    .range(["#F7A210", "#F27979"]);

  // Define the pie layout
  const gradPie = d3.pie()
    .value(d => d.value)
    .sort(null);

  // Define the arc generator
  const gradArc = d3.arc()
    .innerRadius(100)
    .outerRadius(150);

  // Append the pie chart to the SVG element
  const gradG = gradSvg.append("g")
    .attr("transform", "translate(270, 175)")
    .attr("class", "gradPie");

  // Generate the arcs for each portion of the pie
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

  // Append a group element for the legend
  const gradlegend = gradSvg.append("g")
    .attr("transform", `translate(${employmentXSize - 120}, 20)`);

  // Add circles and labels to the legend
  const gradLegendItems = gradlegend.selectAll("g")
    .data(gradPieData)
    .join("g")
    .attr("transform", (d, i) => `translate(0, ${i * 25})`);

  gradLegendItems.append("circle")
    .attr("r", 6)
    .data(gradPie(gradPieData))
    .attr("fill", (d) => color(d.data.label));

  gradLegendItems.append("text")
    .text(d => d.label)
    .attr("x", 15)
    .attr("y", 5)
    .style("font-family", "Arial, Helvetica, sans-serif")
    .style("font-size", "14px");


})
