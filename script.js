const countyURL = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";

const eduURL = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";

const w = 1000;
const h = 600;

const lw = 600;
const lh = 80;

const m = {
  top: 50,
  right: 50,
  bottom: 50,
  left: 50 };


const colors = ["#1bdef7", "#1bf7aa", "#94f71b", "#f1ff54", "#ffc926", "#ff8d0a", "#ff5c0a"];

// establish geopath
const path = d3.geoPath();

//create svg elements

const main = d3.select("body").
append("div").
attr("id", "main");

const title = main.append("h1").
attr("id", "title").
text("United States Education Attainment");

const description = main.append("h2").
attr("id", "description").
text("Percentage of adults age 25 and older with a bachelor's degree or higher (2010-2014)");

//establist legend

const colorScale = d3.scaleLinear().
range([m.left, lw - m.right]);

const legendAxis = d3.axisBottom(colorScale).
ticks().
tickFormat(d3.format(".0%"));

const legend = main.append("svg").
attr("id", "legend").
attr("width", lw).
attr("height", lh);

// main svg

const svg = main.append("svg").
attr("id", "map").
attr("width", w).
attr("height", h);

// establish tooltip

const tooltip = main.append("div").
attr("id", "tooltip").
style("opacity", 0);

// get data
d3.queue().
defer(d3.json, countyURL).
defer(d3.json, eduURL).
await(function (error, c, e) {

  function fipsMatch(d) {
    for (let i = 0; i < e.length; i++) {
      if (e[i].fips === d.id) {
        return e[i];
      }
    }
  };
  //scaled e data
  const eData = e.map(data => data.bachelorsOrHigher);
  const eMax = d3.max(eData);
  const eMin = d3.min(eData);

  function colorPicker(val) {
    var rounded = Math.round(val / 10);
    return colors[rounded];
  };

  //scaled legend data

  colorScale.domain([eMin / 100, eMax / 100]);

  legend.append("g").
  attr("stroke", "white").
  call(legendAxis).
  attr("transform", "translate(0, " + lh / 2 + ")");

  const legendWidth = (lw - m.left - m.right) / colors.length;

  legend.selectAll("rect").
  data(colors).
  enter().
  append("rect").
  attr("width", legendWidth).
  attr("height", lh / 2).
  attr("fill", d => d).
  attr("x", (d, i) => m.left + i * legendWidth).
  attr("stroke", "black");

  //county map

  const counties = svg.append("g").
  attr("class", "counties").
  selectAll("path").
  data(topojson.feature(c, c.objects.counties).features).
  enter().
  append("path").
  attr("class", "county").
  attr("data-fips", d => d.id).
  attr("data-education", function (d) {
    var result = e.filter(function (obj) {
      return obj.fips === d.id;
    });
    if (result[0]) {
      return result[0].bachelorsOrHigher;}}).
  attr("fill", d => colorPicker(fipsMatch(d).bachelorsOrHigher)).
  attr("d", path).
  on("mouseover", function (d) {
    tooltip.html(fipsMatch(d).area_name + ", " + fipsMatch(d).state + ": " + fipsMatch(d).bachelorsOrHigher + "%").
    style("opacity", 1).
    style("top", event.pageY - 30 + "px").
    style("left", event.pageX + 10 + "px").
    attr("data-education", fipsMatch(d).bachelorsOrHigher);}).
  on("mouseout", function (d) {
    tooltip.html("").
    style("opacity", 0);
  });







  svg.append("path").
  datum(topojson.mesh(c, c.objects.states), function (a, b) {
    return a !== b;
  }).
  attr("d", path).
  attr("class", "states").
  style("stroke", "black").
  style("fill", "none");



});
