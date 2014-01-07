var width = 960,
	height = 500,
	domain = [10, 22, 33, 44, 60 ],
	range = ['rgb(239,243,255)','rgb(189,215,231)','rgb(107,174,214)','rgb(49,130,189)','rgb(8,81,156)'],
	units = "cents on the gallon",
	legendTitleText = "State Gas Tax Rates",
	xDomain = {},
	data;

var gasTaxByState = {};
var nameByState = {};
  
var legendExists = false;
  
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

var g = svg.append("g");

var legend;    

legendMaker(domain, range, units, legendTitleText);
//Make a key:value pair for Domain and Range in order to automatically generate the legend
function legendMaker(domain, range, units, legendTitleText){
	if(legendExists){
		legend.remove();
	}
	legend = d3.select("body").append("div")
	.attr("id", "legend");

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
		legendTitle.append("strong").text(legendTitleText);
		legendTitle.append("p").attr("id", "unit").text("in " + units);
	
	legend.selectAll("legendoption").data(d3.values(xDomain)).enter().append("legendoption")
		    	.attr("class", "legendOption")
		    	.append("i").style("background-color", function(d){ return d; });
	d3.selectAll("legendoption")
		.append("p").data(d3.keys(xDomain)).text(function(d){ return d; });
	
	legendExists = true;
}
/*
	//color and number replacement and transitions
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
	
	var RColors = d3.values(xDomain);
	var DTexts = d3.keys(xDomain);
	
	d3.selectAll(".legendOption i")
		.transition().duration(750)
		.style("background-color", function(RColors){return RColors; });
	
	d3.selectAll(".legendOption p").text(function(DTexts){return DTexts; });
		
*/

d3.csv("data/gasTax.csv", function (error, gasTax) {
	data = gasTax;

  gasTax.forEach(function(d) { 
  	gasTaxByState[d.id] = +d.gasTax; 
  	nameByState[d.id] = d.stateName;
  });
  

	d3.json("us.json", function(error, us) {
	  g.append("g")
	      .attr("class", "states")
	    .selectAll("path")
	      .data(topojson.feature(us, us.objects.states).features)
	    .enter().append("path")
	      .attr("d", path)
	      .style("fill", function(d) { if(!isNaN(gasTaxByState[d.id])){return color(gasTaxByState[d.id]);} else{return "#ccc";} })
	      .append("svg:title")
	      	.text(function(d) {return nameByState[d.id]; });
	      //.on("click", clicked);
	
	  g.append("path")
	      .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
	      .attr("id", "state-borders")
	      .attr("d", path);
	});
});


function update(value){
	
	//set up a switch that sets domain, range, and other cross-data variables based on their button selection
	switch (value)
	{
		case "gasTax": 
			domain = [20, 25, 35, 45, 50 ];
			range = ['rgb(239,243,255)','rgb(189,215,231)','rgb(107,174,214)','rgb(49,130,189)','rgb(8,81,156)'];
			units = "cents on the gallon";
			legendTitleText = "State Gas Tax Rates";
			console.log("switch went to " + value);
			legendMaker(domain, range, units, legendTitleText);
			break;
		case "otherData":
			domain = [20, 25, 30, 35, 40];
			range = ['rgb(247,251,255)','rgb(222,235,247)','rgb(198,219,239)','rgb(158,202,225)','rgb(107,174,214)'];
			units = "gigabytes";
			legendTitleText = "Other Data";
			console.log("switch went to " + value);
			legendMaker(domain, range, units, legendTitleText);
			break;
	}
	
	data.forEach(function(d){
		gasTaxByState[d.id] = d[value]; 
  		nameByState[d.id] = d.stateName;
	});
	
	color
		.domain(domain)
		.range(range);
	
	g.selectAll(".states path")
	  .transition()
      .duration(750)
	  .style("fill", function(d) { return color(gasTaxByState[d.id]); });

}

$("#select button").click(function() {
	update(this.value);
	$("#select button").removeClass("active");
	$(this).addClass("active");
});