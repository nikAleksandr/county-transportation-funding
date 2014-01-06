	var width = 960,
    	height = 500,
    	domain,
		range,
		units
		xDomain = {};

  var gasTaxByState = {};
  var nameByState = {};

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
	.attr("id", "legend");
		
		
var selectedData = "gasTax";
dataReset(selectedData);

d3.selectAll(".btn").on("click", function(){
	console.log("this.value = " + this.value);
	selectedData = this.value;
	dataReset(selectedData);
})




function dataReset(selectedData){
	
	//set up a switch that sets domain, range, and other cross-data variables based on their button selection
	switch (selectedData)
	{
		case "gasTax": 
			domain = [10, 22, 33, 44, 60 ];
			range = ['rgb(239,243,255)','rgb(189,215,231)','rgb(107,174,214)','rgb(49,130,189)','rgb(8,81,156)'];
			units = "cents on the gallon";
			console.log("switch went to " + selectedData);
			legendMaker(domain, range, units);
			mapMaker(domain, range);
			break;
		case "otherData":
			domain = [20, 25, 30, 35, 40, 45, 50, 55 ];
			range = ['rgb(247,251,255)','rgb(222,235,247)','rgb(198,219,239)','rgb(158,202,225)','rgb(107,174,214)','rgb(66,146,198)','rgb(33,113,181)','rgb(8,69,148)'];
			units = "cents on the gallon";
			console.log("switch went to " + selectedData);
			legendMaker(domain, range, units);
			mapMaker(domain, range);
			break;
	}

}
//Make a key:value pair for Domain and Range in order to automatically generate the legend
function legendMaker(domain, range, units){
	xDomain = {};
	for(var i=0; i< domain.length; i++){
		var DText = parseInt(domain[i-1]) + "-" + parseInt(domain[i]);
			if(i==0){
				DText = "> " + parseInt(domain[i]);
			}
		var RColor = range[i];
			//we don't have this key yet, so make a new one
			xDomain[DText] = RColor;
	}
	
	var legendTitle = legend.append("div").attr("id", "legendTitle");
		legendTitle.append("strong").text("State Gas Tax Rates");
		legendTitle.append("p").attr("id", "unit").text("in " + units);
			
	legend.selectAll("legendoption").data(d3.values(xDomain)).enter().append("legendoption")
			    	.attr("class", "legendOption")
			    	.append("i").style("background-color", function(d){ return d; }); /* Optional */
	d3.selectAll("legendoption")
		.append("p").data(d3.keys(xDomain)).text(function(d){ return d; });
}

function mapMaker(){

queue()
    .defer(d3.json, "us.json")
    .defer(d3.csv, "data/gasTax.csv")
    .await(ready);

var color = d3.scale.threshold()
	.domain(domain)
	.range(range);


function ready(error, us, gasTax) {

  
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
}
/*
//Hover Functions
function (d) {
	return toolOver(d, this)
}
function toolOver(v, thepath) {
	d3.select(thepath).style({
		"fill-opacity": "0.1"
	});
	return tooltip.style("visibility", "visible");
}
function (d, i) {
	myPos = d3.mouse(this);
	myX = myPos[0];
	myY = myPos[1];
	var coords = getScreenCoords(myX, myY, this.getCTM());
	var a = (isNaN(gasTaxByState[d.id]) ? "N/A" : gasTaxByState[d.id]);
	var b = (isNaN(gasTaxByState[d.id]) ? "N/A" : gasTaxByState[d.id]);
	var c = (isNaN(gasTaxByState[d.id]) ? "N/A" : gasTaxByState[d.id]);
	var d = (isNaN(gasTaxByState[d.id]) ? "N/A" : gasTaxByState[d.id]);
	myX = coords.x;
	myY = coords.y;
	return toolMove(nameByState[d.id], a, b, c, d, myX, myY)
}
function (container) {
	return d3_mousePoint(container, d3_eventSource());
}
function d3_eventSource() {
	var e = d3.event, s;
	while (s = e.sourceEvent) e = s;
	return e;
}
function getScreenCoords(x, y, ctm) {
	var xn = ctm.e + x*ctm.a;
	var yn = ctm.f + y*ctm.d;
	return { x: xn, y: yn };
}
function toolMove(state, gasTax, paidrank, share, sharerank) {
	gasTax = (isNaN(gasTax) ? "N/A" : format1(gasTax));
	paidrank = (isNaN(paidrank) ? "N/A" : format1(paidrank));
	sharerank = (isNaN(sharerank) ? "N/A" : format1(sharerank));
	if (myX < 200) {
		myX = 200
	};
	if (myY < 200) {
		myY = 200
	};
	return tooltip.style("top", myY + -200 + "px").style("left", myX - 200 + "px").html("<div id='tipContainer'><div id='tipLocation'><b>" + county + "</b></div><div id='tipKey'>Avg taxes paid: <b>$" + paid + "</b><br>Taxes paid rank: <b>" + paidrank + "</b><br>Avg home value: <b>$" + "function" + "</b><br>Home value rank: <b>" + "function2" + "</b><br>Taxes paid as share of home value: <b>" + share + "</b><br>Taxes paid as share rank: <b>" + sharerank + "</b></div><div class='tipClear'></div> </div>");
}

function (d) {
	return toolOut(d, this)
}
function toolOut(m, thepath) {
	d3.select(thepath).style({
		"fill-opacity": "1"
	});
	return tooltip.style("visibility", "hidden");
} 
*/


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
