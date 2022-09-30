async function drawChart() {
  // saving start and end time from the user
  let start_time = document.getElementById("start_time").value;
  let end_time = document.getElementById("end-time").value;

  if (start_time > end_time) {
    alert("Error: Wrong time.");
    d3.select("svg").remove();
    pNode = document.getElementById("p");
    pNode.textContent = "No data was found.";
  }

  // this function to save the chart that user choose
  function Charts() {
    let VariableId;
    let pNode;
    if (document.getElementById("production").checked) {
      VariableId = "192";
      pNode = document.getElementById("p");
      pNode.textContent =
        "Electricity production in Finland based on the real-time measurements in Fingrid's operation control system.";
      return VariableId;
    }
    if (document.getElementById("consumption").checked) {
      VariableId = "193";
      pNode = document.getElementById("p");
      pNode.textContent =
        "Electricity consumption in Finland is calculated based on production and import/export. Production information and import/export are based on the real-time measurements in Fingrid's operation control system.";

      return VariableId;
    }
    if (document.getElementById("wind").checked) {
      VariableId = "181";
      pNode = document.getElementById("p");
      pNode.textContent =
        "Wind power production based on the real-time measurements in Fingrid's operation control system.";
      return VariableId;
    } else {
      alert("Please choose one of the charts!");
    }
  }
  let charts = Charts();
  // header and defining the data request settings
  const myHeaders = new Headers();
  myHeaders.append("x-api-key", "laDi1KQjoo1URlb1OmuA5c1R0xrLvIbFciodpf80");
  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  // save the information from user and create the apilink
  apiLink = "https://api.fingrid.fi/v1/variable/".concat(
    Charts(),
    "/events/csv?start_time=",
    start_time,
    "T00:00:00Z&end_time=",
    end_time,
    "T23:59:59Z"
  );

  const apiURL = apiLink;
  const response = await d3.csv(apiURL, requestOptions);
  console.table(response[0]);

  const yAccessor = (d) => d.value / 1000;

  // console.log(response);

  // console.log(response[0]);

  // console.table(response[0]);

  // date accessor
  const dateParser = d3.timeParse("%Y-%m-%dT%H:%M:%S+0000");
  const xAccessor = (d) => dateParser(d.start_time);

  console.log("date accessor");
  console.log(xAccessor(response[0]));
  console.log(yAccessor(response[0]));

  // Dimensions object
  let dimensions = {
    width: window.innerWidth * 0.6,
    height: 550,
    margin: {
      top: 15,
      right: 15,
      bottom: 40,
      left: 60,
    },
  };

  dimensions.boundedWidth =
    dimensions.width - dimensions.margin.left - dimensions.margin.right;
  dimensions.boundedHeight =
    dimensions.height - dimensions.margin.top - dimensions.margin.bottom;
  console.table(dimensions);

  // Draw a base svg on the diagram
  d3.select("svg").remove();
  const wrapper = d3
    .select("#chart-wrapper")
    .append("svg")
    .attr("width", dimensions.width)
    .attr("height", dimensions.height)
    .style("border", " 1px solid black");

  console.log(wrapper);

  const boundingBox = wrapper
    .append("g")
    .style(
      "transform",
      `translate(${dimensions.margin.left}px,${dimensions.margin.top}px`
    );

  // Specify scalers for the data
  const yScale = d3
    .scaleLinear()
    .domain(d3.extent(response, yAccessor))
    .range([dimensions.boundedHeight, 0]);

  // console.table(d3.extent(response, yAccessor));

  const xScale = d3
    .scaleTime()
    .domain(d3.extent(response, xAccessor))
    .range([0, dimensions.boundedWidth]);

  // console.table(d3.extent(response, xAccessor));
  yScale.nice();
  // console.log("yScale and xScale .domain");
  // console.log(yScale.domain());
  // console.log(xScale.domain());

  // Draw the data

  const lineGenerator = d3
    .line()
    .x((d) => xScale(xAccessor(d)))
    .y((d) => yScale(yAccessor(d)));

  const line = boundingBox
    .append("path")
    .datum(response)
    .attr("d", lineGenerator(response))
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5)
    .call(transition);

  function transition(path) {
    path
      .transition()
      .duration(7500)
      .attrTween("stroke-dasharray", tweenDash)
      .on("end", () => {
        d3.select(this).call(transition);
      });
  }
  function tweenDash() {
    const l = this.getTotalLength(),
      i = d3.interpolateString("0," + l, l + "," + l);
    return function (t) {
      return i(t);
    };
  }
  // Draw the axes

  const yAxisGenerator = d3.axisLeft().scale(yScale); // generate y axis and place it on the left with the right scales.

  const yAxis = boundingBox.append("g").call(yAxisGenerator); // drow the y axis

  const xAxisGenerator = d3.axisBottom().scale(xScale);

  const xAxis = boundingBox
    .append("g")
    .call(xAxisGenerator)
    .style("transform", `translateY(${dimensions.boundedHeight}px)`);

  const xAxislable = xAxis
    .append("text")
    .attr("x", dimensions.boundedWidth / 2)
    .attr("y", dimensions.margin.bottom - 10)
    .attr("fill", "black")
    .style("font-size", "16px")
    .text("Date");

  const yAxislable = yAxis
    .append("text")
    .attr("x", -dimensions.boundedHeight / 2)
    .attr("y", -dimensions.margin.left + 15)
    .attr("fill", "black")
    .style("font-size", "16px")
    .style("transform", "rotate(-90deg)")
    .text("Gigawatt");
}
