var width = 960,
    height = 500,
    centered;

var domain,
	range,
	units;

var selectedData = "gasTax";
//set up a switch that sets domain, range, and other cross-data variables based on their button selection
switch (selectedData)
{
	case "gasTax": 
		domain = [20, 25, 30, 35, 40, 45, 50, 55 ];
		range = ['rgb(247,251,255)','rgb(222,235,247)','rgb(198,219,239)','rgb(158,202,225)','rgb(107,174,214)','rgb(66,146,198)','rgb(33,113,181)','rgb(8,69,148)'];
		units = "cents on the gallon";
}
//Make a key:value pair for Domain and Range in order to automatically generate the legend
var xDomain = {};
for(var i=0; i< domain.length; i++){
	var DText = parseInt(domain[i-1]) + "-" + parseInt(domain[i]);
		if(i==0){
			DText = "> " + parseInt(domain[i]);
		}
	var RColor = range[i];
		//we don't have this key yet, so make a new one
		xDomain[DText] = RColor;
}

var color = d3.scale.threshold()
    .domain(domain)
    .range(range);
    
    

var projection = d3.geo.albersUsa()
    .scale(1070)
    .translate([width / 2, height / 2]);

var path = d3.geo.path()
    .projection(projection);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

svg.append("rect")
    .attr("class", "background")
    .attr("width", width)
    .attr("height", height);
    //.on("click", clicked);
    
var legend = d3.select("body").append("div")
	.attr("id", "legend")
	
	var legendTitle = legend.append("div").attr("id", "legendTitle");
		legendTitle.append("strong").text("State Gas Tax Rates");
		legendTitle.append("p").attr("id", "unit").text("in " + units);

legend.selectAll("legendoption").data(d3.values(xDomain)).enter().append("legendoption")
			    	.attr("class", "legendOption")
			    	.append("i").style("background-color", function(d){ return d; }); /* Optional */
	d3.selectAll("legendoption")
		.append("p").data(d3.keys(xDomain)).text(function(d){ return d; });

queue()
    .defer(d3.json, "us.json")
    .defer(d3.csv, "data/gasTax.csv")
    .await(ready);

function ready(error, us, gasTax) {
  var gasTaxByState = {};
  var nameByState = {};
  
  gasTax.forEach(function(d) { 
  	gasTaxByState[d.id] = +d.gasTax; 
  	nameByState[d.id] = d.stateName;
  });
  
  var g = svg.append("g");

	d3.json("us.json", function(error, us) {
	  g.append("g")
	      .attr("id", "states")
	    .selectAll("path")
	      .data(topojson.feature(us, us.objects.states).features)
	    .enter().append("path")
	      .attr("d", path)
	      .style("fill", function(d) { return color(gasTaxByState[d.id]); })
	      .append("svg:title")
	      	.text(function(d) {return nameByState[d.id]; });
	      //.on("click", clicked);
	
	  g.append("path")
	      .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
	      .attr("id", "state-borders")
	      .attr("d", path);
	});
  
}


  



/*
function clicked(d) {
  var x, y, k;

  if (d && centered !== d) {
    var centroid = path.centroid(d);
    x = centroid[0];
    y = centroid[1];
    k = 4;
    centered = d;
  } else {
    x = width / 2;
    y = height / 2;
    k = 1;
    centered = null;
  }

  g.selectAll("path")
      .classed("active", centered && function(d) { return d === centered; });

  g.transition()
      .duration(750)
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
      .style("stroke-width", 1.5 / k + "px");
}
*/
