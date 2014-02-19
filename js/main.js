var width = parseInt(d3.select('.container').style('width')),
	height = width/1.92,
	domain = [20, 25, 30, 35, 100 ],
	range = ['rgb(201,228,242)', 'rgb(150,205,233)', 'rgb(96,175,215)', 'rgb(48,146,195)', 'rgb(10,132,193)'],
	units = "/gal.",
	legendTitleText = "State Gas Tax Rates",
	notes = "State gas tax rate does not include the 18.4 cents per gallon federal gas tax.",
	xDomain = {},
	data,
	myPos,
	myX,
	myY,
	WWidth;

var quantByState = {};
var nameByState = {};
var linkByState = {};
  
var legendExists = false;
var extraNote = d3.select("#underMap").append("div");
	

var color = d3.scale.threshold()
	.domain(domain)
	.range(range);

var projection = d3.geo.albersUsa()
	    .scale(width*1.1)
	    .translate([width / 2, height / 2]);
	
var path = d3.geo.path()
    .projection(projection);

var svg = d3.select("#map").append("svg")
    .attr("width", width)
    .attr("height", height);

svg.append("rect")
    .attr("class", "background")
    .attr("width", width)
    .attr("height", height);
    //.on("click", clicked);

var tooltip = d3.select("#map").append("div").attr("id", "tt").style("z-index", "10").style("position", "absolute").style("visibility", "hidden");

var g = svg.append("g");

var legend;    

legendMaker(domain, range, units, legendTitleText, notes);
//Make a key:value pair for Domain and Range in order to automatically generate the legend
function legendMaker(domain, range, units, legendTitleText, notes){
	if(legendExists){
		legend.remove();
	}
	
	
	
	legend = d3.select("#map").append("div")
		.attr("id", "legend");

	xDomain = {};
		for(var i=0; i< domain.length; i++){
			var DText = parseFloat(domain[i-1]) + "-" + parseFloat(domain[i]) + units;
				if(i==0){
					DText = "> " + parseFloat(domain[i]) + units;
				}
			if(units=="/gal."){
				var DText = "$" + parseFloat(domain[i-1]/100) + "-" + parseFloat(domain[i]/100) + units;
					if(i==0){
						DText = "> " + "$" + parseFloat(domain[i]/100) + units;
					}
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
			legendTitle.append("p").attr("id", "unit");
		}
		
	legend.selectAll("legendoption").data(d3.values(xDomain)).enter().append("legendoption")
		    	.attr("class", "legendOption")
		    	.append("i").style("background-color", function(d){ return d; });
	d3.selectAll("legendoption")
		.append("p").data(d3.keys(xDomain)).text(function(d){ return d; });
	
	extraNote.remove();
	extraNote = d3.select("#underMap").append("div");
		extraNote.append("p").text("*" + notes);
	
	legendExists = true;
}


d3.csv("data/transData.csv", function (error, transData) {
	data = transData;

  transData.forEach(function(d) { 
  	quantByState[d.id] = +d.gasTaxRate; 
  	nameByState[d.id] = d.stateName;
  	linkByState[d.id] = d.stateAbbrev;
  });
  

	d3.json("us.json", function(error, us) {
	  g.append("g")
	      .attr("class", "states")
	    .selectAll("path")
	      .data(topojson.feature(us, us.objects.states).features)
	    .enter().append("path")
	      .attr("d", path)
	      .style("fill", function(d) { if(!isNaN(quantByState[d.id])){return color(quantByState[d.id]);} else{return "#ccc";} })
	      .on("click", clicked)
	      .on("mouseover", function (d) {
		        return toolOver(d, this);
	    }).on("mouseout", function (d) {
	        return toolOut(d, this);
	    }).on("mousemove", function (d, i) {
	        var filtered;
	        for (var i = 0; i < data.length; i++) {
	            if (data[i].id == d.id) {
	                filtered = data[i];
	                break;
	            }
	        }
	        myPos = d3.mouse(this);
	        myX = myPos[0];    
	        myY = myPos[1];
	        
	        //var coords = getScreenCoords(myX, myY, this.getCTM());
			var a = (isNaN(data[i].gasTaxRate) ? "N/A" : data[i].gasTaxRate);
			var b = (isNaN(+data[i].yrsSinceInc) ? "N/A" : +data[i].yrsSinceInc);
			var c = (isNaN(data[i].localGasTax) ? "N/A" : data[i].localGasTax);
			var d = (isNaN(+data[i].pctBridges) ? "N/A" : +data[i].pctBridges);
			var e = (isNaN(+data[i].pctRoads) ? "N/A" : +data[i].pctRoads);
	
	        //myX = coords.x;
	        //myY = coords.y;
	        return toolMove(data[i].stateName, a, b, c, d, e);
	    });
	      /*.append("svg:title")
	      	.text(function(d) {return nameByState[d.id]; });
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
			range = ['rgb(255,166,1)', 'rgb(255,204,102)', 'rgb(201,228,242)', 'rgb(96,175,215)', 'rgb(10,132,193)'];
			//research colors: 'rgb(255,166,1)', 'rgb(255,204,102)', 'rgb(201,228,242)', 'rgb(96,175,215)', 'rgb(10,132,193)'
			//research blues: 'rgb(201,228,242)', 'rgb(150,205,233)', 'rgb(96,175,215)', 'rgb(48,146,195)', 'rgb(10,132,193)'
			units = "/gal.";
			legendTitleText = "State Gas Tax Rates";
			legendMaker(domain, range, units, legendTitleText, notes);
			notes = "State gas tax rate does not include the 18.4 cents per gallon federal gas tax.";
			break;
		case "yrsSinceInc":
			domain = [1, 10, 20, 30, 50];
			range = ['rgb(239,243,255)','rgb(189,215,231)','rgb(107,174,214)','rgb(49,130,189)','rgb(8,81,156)'];
			units = "years";
			legendTitleText = "Time Since A Gas Tax Increase";
			notes = "";
			legendMaker(domain, range, units, legendTitleText), notes;
			break;
		case "localGasTax":
			domain = [1, 2];
			range = ['rgb(201, 228, 242)','rgb(255, 166, 1)'];
			units = "binary";
			legendTitleText = "States That Permit a Local Gas Tax";
			notes = "";
			legendMaker(domain, range, units, legendTitleText, notes);
			break;
		case "pctBridges":
			domain = [20, 40, 60, 80, 100];
			range = ['rgb(239,243,255)','rgb(189,215,231)','rgb(107,174,214)','rgb(49,130,189)','rgb(8,81,156)'];
			units = "%";
			legendTitleText = "Share of County Owned Bridges";
			notes = "";
			legendMaker(domain, range, units, legendTitleText, notes);
			break;
		case "pctRoads":
			domain = [20, 40, 60, 80, 100];
			range = ['rgb(239,243,255)','rgb(189,215,231)','rgb(107,174,214)','rgb(49,130,189)','rgb(8,81,156)'];
			units = "%";
			legendTitleText = "Share of County Owned Roads";
			notes = "";
			legendMaker(domain, range, units, legendTitleText, notes);
			break;
		case "gasTaxType": 
			domain = [20, 25, 30, 35, 100 ];
			range = ['rgb(255,166,1)', 'rgb(255,204,102)', 'rgb(201,228,242)', 'rgb(96,175,215)', 'rgb(10,132,193)'];
			units = "";
			legendTitleText = "State Gas Tax Type";
			notes = "";
			legendMaker(domain, range, units, legendTitleText, notes);
			break;
		case "localSalesTax": 
			domain = [20, 25, 30, 35, 100 ];
			range = ['rgb(255,166,1)', 'rgb(255,204,102)', 'rgb(201,228,242)', 'rgb(96,175,215)', 'rgb(10,132,193)'];
			units = "binary";
			legendTitleText = "Local Option Sales Tax";
			notes = "";
			legendMaker(domain, range, units, legendTitleText, notes);
			break;
		case "propTaxLimits": 
			domain = [20, 25, 30, 35, 100 ];
			range = ['rgb(255,166,1)', 'rgb(255,204,102)', 'rgb(201,228,242)', 'rgb(96,175,215)', 'rgb(10,132,193)'];
			units = "/gal.";
			legendTitleText = "State Gas Tax Rates";
			notes = "Maine and Vermont states do not give counties the authority to levy any taxes, but counties may request an assessment from the state government based on estimates of the costs of county services. In New Hampshire, a county delegation composed of state representatives is responsible for levying taxes.";
			legendMaker(domain, range, units, legendTitleText, notes);
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

function clicked(d){
	console.log(linkByState[d.id]);
	
	window.open('profiles/State_Summary_' + linkByState[d.id] + '.pdf', '_blank');
}
function toolOver(v, thepath) {
	d3.select(thepath).style({
		"fill-opacity": "0.1",
		"cursor": "pointer"
	});
	return tooltip.style("visibility", "visible");
};

function toolOut(m, thepath) {
	d3.select(thepath).style({
		"fill-opacity": "1"
	});
	return tooltip.style("visibility", "hidden");
};


function toolMove(state, gasTaxRate, yrsSinceInc, localGasTax, pctBridges, pctRoads) {
	/*	
		gasTaxRate = (isNaN(paid) ? "N/A" : format1(paid));
		yrsSinceInc = (isNaN(val) ? "N/A" : format2(val));
		localGasTax = (isNaN(paidrank) ? "N/A" : format1(paidrank));
		pctBridges = format1(sharerank);
	*/
	WWidth = width;

 
	if (myX < 50) {
		myX = 50;
	};
	
	if (myY < 50) {
		myY = 50;
	};
	
	function permitted(localGasTax){
		if(localGasTax==1){
			return "Permitted";
		}
		else{
			return "Not Permitted";
		}
	};
	
	return tooltip.style("top", myY-20 + "px").style("left", myX + "px").html("<div id='tipContainer'><div id='tipLocation'><b>" + state + "</b></div><div id='tipKey'>Gas tax ($/gallon): <b>$" + Math.round(gasTaxRate)/100 + "</b><br>Last gas tax increase: <b>" + (2013-yrsSinceInc) + "</b><br>County-level gas tax under state law: <b>" + permitted(localGasTax) + "</b><br>County-owned Bridges: <b>" + Math.round(pctBridges*10)/10 + "%</b><br>County-owned Roads: <b>" + Math.round(pctRoads*10)/10 + "%</b></div><div class='tipClear'></div> </div>");
};

function getScreenCoords(x, y, ctm) {
  var xn = ctm.e + x*ctm.a;
  var yn = ctm.f + y*ctm.d;
  return { x: xn, y: yn };
}
