var width = 960,
	height = 500,
	domain = [20, 25, 30, 35, 100 ],
	range = ['rgb(239,243,255)','rgb(189,215,231)','rgb(107,174,214)','rgb(49,130,189)','rgb(8,81,156)'],
	units = "cents on the gallon",
	legendTitleText = "State Gas Tax Rates",
	xDomain = {},
	data;

var quantByState = {};
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
			var DText = parseFloat(domain[i-1]) + "-" + parseFloat(domain[i]);
				if(i==0){
					DText = "> " + parseFloat(domain[i]);
				}
			var RColor = range[i];
				//we don't have this key yet, so make a new one
				xDomain[DText] = RColor;
		}
		
	if(units=="binary"){
		xDomain = {
			"No": 'rgb(201, 228, 242)',
			"Yes": 'rgb(255, 166, 1)',
		};
	}
	
	var legendTitle = legend.append("div").attr("id", "legendTitle");
		legendTitle.append("strong").text(legendTitleText);
		if(units!="binary"){
			legendTitle.append("p").attr("id", "unit").text("in " + units);
		}
		
	legend.selectAll("legendoption").data(d3.values(xDomain)).enter().append("legendoption")
		    	.attr("class", "legendOption")
		    	.append("i").style("background-color", function(d){ return d; });
	d3.selectAll("legendoption")
		.append("p").data(d3.keys(xDomain)).text(function(d){ return d; });
	
	legendExists = true;
}


d3.csv("data/transData.csv", function (error, transData) {
	data = transData;

  transData.forEach(function(d) { 
  	quantByState[d.id] = +d.gasTaxRate; 
  	nameByState[d.id] = d.stateName;
  });
  

	d3.json("us.json", function(error, us) {
	  g.append("g")
	      .attr("class", "states")
	    .selectAll("path")
	      .data(topojson.feature(us, us.objects.states).features)
	    .enter().append("path")
	      .attr("d", path)
	      .style("fill", function(d) { if(!isNaN(quantByState[d.id])){return color(quantByState[d.id]);} else{return "#ccc";} })
	      .append("svg:title")
	      	.text(function(d) {return nameByState[d.id]; });
	      /*.on("click", clicked);
	      .on("mouseover", function (d) {
		        return toolOver(d, this)
	    }).on("mouseout", function (d) {
	        return toolOut(d, this)
	    }).on("mousemove", function (d, i) {
	        var filtered;
	        for (var i = 0; i < dataset.length; i++) {
	            if (dataset[i].cfips == d.id) {
	                filtered = dataset[i];
	                break;
	            }
	        }
	*/
	  g.append("path")
	      .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
	      .attr("id", "state-borders")
	      .attr("d", path);
	});
});


function update(value){
	
	//set up a switch that sets domain, range, and other cross-data variables based on their button selection
	switch (value){
		case "gasTaxRate": 
			domain = [20, 25, 30, 35, 100 ];
			range = ['rgb(239,243,255)','rgb(189,215,231)','rgb(107,174,214)','rgb(49,130,189)','rgb(8,81,156)'];
			units = "cents on the gallon";
			legendTitleText = "State Gas Tax Rates";
			console.log("switch went to " + value);
			legendMaker(domain, range, units, legendTitleText);
			break;
		case "yrsSinceInc":
			domain = [1, 10, 20, 30, 50];
			range = ['rgb(239,243,255)','rgb(189,215,231)','rgb(107,174,214)','rgb(49,130,189)','rgb(8,81,156)'];
			units = "years";
			legendTitleText = "Time Since A Gas Tax Increase";
			console.log("switch went to " + value);
			legendMaker(domain, range, units, legendTitleText);
			break;
		case "localGasTax":
			domain = [1, 2];
			range = ['rgb(201, 228, 242)','rgb(255, 166, 1)'];
			units = "binary";
			legendTitleText = "States That Permit a Local Gas Tax";
			console.log("switch went to " + value);
			legendMaker(domain, range, units, legendTitleText);
			break;
		case "pctBridges":
			domain = [20, 40, 60, 80, 100];
			range = ['rgb(239,243,255)','rgb(189,215,231)','rgb(107,174,214)','rgb(49,130,189)','rgb(8,81,156)'];
			units = "percent";
			legendTitleText = "Share of County Owned Bridges";
			console.log("switch went to " + value);
			legendMaker(domain, range, units, legendTitleText);
			break;
		case "pctRoads":
			domain = [20, 40, 60, 80, 100];
			range = ['rgb(239,243,255)','rgb(189,215,231)','rgb(107,174,214)','rgb(49,130,189)','rgb(8,81,156)'];
			units = "percent";
			legendTitleText = "Share of County Owned Roads";
			console.log("switch went to " + value);
			legendMaker(domain, range, units, legendTitleText);
			break;
	}
	
	data.forEach(function(d){
		quantByState[d.id] = d[value]; 
  		nameByState[d.id] = d.stateName;
	});
	
	color
		.domain(domain)
		.range(range);
	
	g.selectAll(".states path")
	  .transition()
      .duration(750)
	  .style("fill", function(d) { if(!isNaN(quantByState[d.id])){return color(quantByState[d.id]);} else{return "#ccc";} });

}

$("#select button").click(function() {
	$("#select button").removeClass("active");
	//$(this).addClass("btn active");
	update(this.value);
});

//

function clicked(){
	
}
function toolOver(){
	
}
function toolOut(){
	
}