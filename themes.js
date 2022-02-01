//TODO:
	///rollover popup on themes map
//relink images
//reformat images left and right, only high?
//rewrite toggle map text
//write conclusion to introduce the idea of constructing indexes
//write text to thread together each map
//rework others ideas - map out
	//change average and median colors
//add annotations for rollovers
//mobile design experience
//fix average and median markers placement on ALL
//add rollover for inidivdual measure bars
//highlight map from bar, and var from map
//add bar for last map?

var medianColor = "green"
var averageColor = "black"
var currentMeasure = "EPL_AGE17"

function drawThemeHisto(data){
	console.log(data.features)

	
	console.log(bins)
	var w = 200
	var h = 120
	var padding=20
	var numBins =20
	var barWidth = w/numBins
	
var histogram = d3.histogram()
    .value(function(d) { return parseFloat(d["properties"][currentMeasure]); })
    .domain([0,1])
    .thresholds(numBins);
	var bins = histogram(data.features)
	var xScale = d3.scaleLinear().domain([0,1]).range([0,w])
	var xAxis = d3.axisBottom().scale(xScale).ticks(5)
	
	var svg = d3.select("#themesMapHistogram").append("svg").attr("width",w).attr('height',h+padding*2)
	svg.append("text").attr("x",w/2).attr("y",h+padding*1.5).text("Percentile Rank").attr("text-anchor","middle")
	
	svg.append("g").call(xAxis).attr("transform","translate(0,"+h+")")
	
	var maxLength = d3.max(bins, function(d){return d.length})
	console.log(maxLength)
	var yScale = d3.scaleLinear().domain([0,maxLength]).range([0,h])
	
	svg.selectAll(".themeHisto")
	.data(bins)
	.enter()
	.append("rect")
	.attr("class","themeHisto")
	.attr('width',barWidth-1)
	.attr("height",function(d){return yScale(d.length)})
	.attr("x",function(d,i){return i*barWidth})
	.attr("y",function(d){
		return h-yScale(d.length)
	})
	.attr("fill",function(d,i){
		if(i==bins.length-1){return "red"}
	})
	.on("click",function(d){
		console.log(d)
	})
}
function colorByMeasure(){
	//console.log(pub.all)
	console.log(pub.activeThemes)
   // thememap.getSource('theme').setData(pub.all);
    thememap.setPaintProperty("theme", 'fill-opacity',.8)
    var colorSteps = {
    property: currentMeasure,
    stops: [
		[0,"#aaa"],
		[.000001, colors[0]],
		[.1, colors[0]],
		[.5,colors[1]],
		[.9, colors[2]],
		[1, colors[2]]
		]
    }
	
    var opacitySteps = {
    property: currentMeasure,
    stops: [
		[0,1],
		[.000001, 1],
		[.2, .2],
		[.5,0],
		[.8, .2],
		[1, 1]
		]
    }
	
    thememap.setPaintProperty("theme", 'fill-color', colorSteps)
    thememap.setPaintProperty("theme", 'fill-opacity', opacitySteps)
    d3.select("#coverage").style("display","block")
}

function drawThemeMap(data,divName){//,outline){
 		drawBarsPerMeasure(data.features)
//drawThemeHisto(data)
	//makes new map in the #map div
	//d3.select("#"+divName)        //
        // .style("width",window.innerWidth+"px")
        // .style("height",window.innerHeight+"px")
    mapboxgl.accessToken = "pk.eyJ1IjoiYzRzci1nc2FwcCIsImEiOiJja2J0ajRtNzMwOHBnMnNvNnM3Ymw5MnJzIn0.fsTNczOFZG8Ik3EtO9LdNQ"

    var maxBounds = [
      [-74.27, 40.48], // Southwest coordinates
      [-73.289334, 40.931799] // Northeast coordinates
    ];
    thememap = new mapboxgl.Map({
        container: divName,
        style:"mapbox://styles/c4sr-gsapp/ckytx8oxk000e14rh745xntyo",
       // maxZoom:15,
        zoom: 9.6,
		    center:[-73.95, 40.7],
        preserveDrawingBuffer: true,
        minZoom:1,
        maxBounds: maxBounds
	 //  bearing: 28
    });

  var hoverCountyID = null;
  thememap.on("load",function(){
	d3.selectAll(".mapboxgl-ctrl-attrib").remove()
	  d3.selectAll(".mapboxgl-ctrl-logo").remove()
     //   thememap.addControl(new mapboxgl.NavigationControl(),'bottom-right');
        thememap.dragRotate.disable();
        
		thememap.addSource("theme",{
		              "type":"geojson",
		              "data":data
		          })
		  thememap.addLayer({
		              'id': 'theme',
		              'type': 'fill',
		              'source': 'theme', 
		              'layout': {'visibility':'visible'},
		              'paint': {
		                'fill-color': 'red',
						  'fill-opacity':.8,//,
						  'fill-outline-color':"white"
		              }
		            })
  		  thememap.addLayer({
  		              'id': 'themeOutline',
  		              'type': 'line',
  		              'source': 'theme', 
  		              'layout': {'visibility':'none'},
  		              'paint': {
  		                'line-color': 'black',
  						  'line-width':1,
						  "line-opacity":1
  		              }
  		            })
					colorByMeasure()
//	  	  filterByTheme(currentMeasure, data)
		d3.select("#EPL_AGE17_clickableMap").style("background-color","gold")
		d3.select("#themesMapKey").html("Showing NYC census tracts vulnerability according to <strong>"+themeDisplayText["EPL_AGE17"]+"</strong>")
      });
	  
     thememap.on('mousemove', 'theme', function(e) {
		 thememap.setLayoutProperty("themeOutline","visibility","visible")
          var feature = e.features[0]
	  	var feature = thememap.queryRenderedFeatures(e.point);
		if(feature.length>0){
			var FIPS = feature[0]["properties"]["FIPS"]
			 thememap.setFilter("themeOutline",["==","FIPS",FIPS])
			
            var x = event.clientX+20;
            var y = event.clientY+20;
            // var w = window.innerWidth;
   //          var h = window.innerHeight;
   //          if(x+200>w){
   //              x = x-280
   //          }
   //          if(y+200>h){
   //              y= h-220
   //          }else if(y-200<150){
   //              y = 150
   //          }

             d3.select("#thememapPopup").style("visibility","visible")
             .style("left",x+"px")
             .style("top",y+"px")
	
			var tractName = "<strong>"+feature[0]["properties"]["LOCATION"].replace(", New York","").replace(",","<br>")+"</strong>"
			var currentMeasurePercentile = "Percentile Rank:"+feature[0]["properties"][currentMeasure]
			if(currentMeasure.split("_")[1]!="PCI"){
				var currentMeasureValue = "<span class=\"themePopTitle\">"+feature[0]["properties"][currentMeasure.replace("EPL_","EP_")]+"%</span>"
			}else{
			var currentMeasureValue = "$"+feature[0]["properties"][currentMeasure.replace("EPL_","EP_")]
				
			}
			var totPop = "Total Population: "+feature[0]["properties"]["E_TOTPOP"]
			
			var currentMeasureText = themeDisplayText[currentMeasure]
			d3.select("#thememapPopup").html(tractName+"<br>"+currentMeasureText+":<br>"
			+currentMeasureValue+"<br>"+currentMeasurePercentile+"<br>"+totPop)
		}
	  })
      thememap.on("mouseleave",'theme',function(){
          d3.select("#thememapPopup").style("visibility","hidden")
		 thememap.setLayoutProperty("themeOutline","visibility","none")
		  
      })
}

function getAverage(data){
	var sum = 0
	for(var i in data){
		sum+=parseFloat(data[i]["data"]["RPL_THEMES"])
	}
	return sum/data.length
}
function drawClickableThemeMap(data){
	drawThemeMap(data,"clickableThemesMap")
	//console.log(data)
	data["features"] = data["features"].filter(entry => parseFloat(entry["properties"]["E_TOTPOP"])>100);

	for(var m in groups){
		var groupDiv = d3.select("#clickableThemes").append("div")
		.style("display","inline-block")
		.style("vertical-align","top")
		.style("width","180px")
		.style("margin","2px")
		.style("border","1px solid black")
		
		groupDiv.append("div").html(themeGroupDisplayText[m])
		.style("background-color","black")
		.style("padding","2px")
		.style("color","white")
		.attr("class","themeButton")
		// .style("border","1px solid black")
		//.style("cursor","pointer")
		//.style("font-weight","700")
		// .on("click",function(){
//
// 				d3.selectAll(".measureButton").style("background-color","white")
// 				d3.selectAll(".themeButton").style("background-color","black").style("color","white")
// 				d3.select(this).style("background-color","gold").style("color","black")
// 				//.style("border","1px solid black")
// 		})
		
		for(var t in groups[m]){
			groupDiv.append("div").html( themeDisplayTextShort[groups[m][t]])
			.attr("class","measureButton")
			.attr("id",groups[m][t]+"_clickableMap")
		//	.style("border","1px solid black")
			.style("margin","2px")
			.style("padding","2px")
			.style("cursor","pointer")
			.style("border","1px dotted black")
			.on("click",function(){
				d3.selectAll(".measureButton").style("background-color","white")
				d3.selectAll(".themeButton").style("background-color","black").style("color","white")
				d3.select(this).style("background-color","gold")
				var newData = data
				
				var measure = d3.select(this).attr("id").split("_")[0]+"_"+d3.select(this).attr("id").split("_")[1]
				//console.log(measure)
				currentMeasure = measure
				colorByMeasure()
				drawBarsPerMeasure(data.features)
				//filterByTheme(measure, data)
			})
		}
	}
}

function filterByTheme(measure, data){
		d3.select("#themesMapKey").html("Showing NYC census tracts vulnerability according to <strong>"
	+themeDisplayText[measure.replace("EP_","EPL")]+"</strong>")
	
	if(measure.split("_")[1]=="PCI"){
		var topTracts = data.features.sort(function(a,b){
				return parseFloat(b["properties"][measure])-parseFloat(a["properties"][measure])
		})	
	}else{
		var topTracts = data.features.sort(function(a,b){
				return parseFloat(b["properties"][measure])-parseFloat(a["properties"][measure])
		})	
	}
				//
	// newData["features"]=topTracts.slice(0,20)
	// console.log(newData)
	var topIds =[] 
	var numTop = Math.round(topTracts.length/20)
	//console.log(numTop)
	for(var t in topTracts.slice(0,numTop)){
		//console.log(topTracts[t]["properties"]["FIPS"])
		topIds.push(topTracts.slice(0,numTop)[t]["properties"]["FIPS"])
	}
	var filter = ["in","FIPS"].concat(topIds)
	//console.log(filter)
	thememap.setFilter("theme",filter)
	thememap.setFilter("themeOutline",filter)
	thememap.setLayoutProperty("theme",'visibility','visible')
}

function drawBarsPerMeasure(tracts){
	d3.selectAll("#themesMapHistogram svg").remove()
	var barColors = ["#00A9CE","#aaa","#FB7139"]

	var colorScale = d3.scaleLinear().domain([0,.5,1]).range(barColors)
	//console.log(tracts)
	var sorted = tracts.sort(function(a,b){
			return b["properties"][currentMeasure]-a["properties"][currentMeasure]
	})
	var width =800
	var height = 100
	var barHeight = 60
	var padding = 20
	var barSize = 20
	var svg = d3.select("#themesMapHistogram").append("svg").attr("width",width).attr("height",height)
	var xScale = d3.scaleLinear().domain([0,1]).range([0,width-padding*2])
	var oScale = d3.scaleLinear().domain([0,.1,.5,.9,1]).range([1,.2,0.1,.2,1])
	var xAxis = d3.axisBottom().scale(xScale).ticks(10)
	svg.append("g").call(xAxis).attr("transform","translate("+padding+","+(height-40)+")")
	// svg.append("text")
// 		.text("Vulnerability Percentile Rank")
// 		.attr("x",10).attr("y",16)
// 		.style("font-size","20px")
	// svg.append("text")
// 		.text("Where New York City's 2166 census tracts fall in the national percentile ranking")
// 		.attr("x",10).attr("y",30)
	svg.append("text")
		.text("New York City All Tracts")
		.attr("x",padding).attr("y",height-70)
	// svg.append("text")
// 		.text("All Tracts")
// 		.attr("x",0).attr("y",height-40)
	svg.append("text").text("Low").attr("x",padding).attr("y",height-10).attr("fill",barColors[0])
	svg.append("text").text("Nation Percentile Rank").attr("x",width/2).attr("y",height-10)
	.attr("text-anchor","middle")

	svg.append("text").text("High").attr("x",width-padding).attr("y",height-10)
		.attr("text-anchor","end").attr("fill",barColors[2])
	
	
	var sum = 0
	for(var i in tracts){
		sum+=parseFloat(tracts[i]["properties"][currentMeasure])
	}
	var measureAverage = Math.round(sum/tracts.length*100)/100
	
	 svg.append("rect")//.attr("id","average_"+c)
	 .attr("x",xScale(measureAverage))
	 .attr("y",30)
	  .attr("height",barSize+10)
	 .attr("width",1)
	 .attr("fill",averageColor)
	  .attr("transform","translate("+padding+",0)")
	
	 svg.append("text").text(measureAverage)
	 .attr("x",xScale(measureAverage)+padding+35)
	 .attr("y",20)
	 .attr("transform",function(){
	 	    return "rotate(-45 " + (xScale(measureAverage)+padding+35) + " " + (barHeight-1) + ")";
	 })
	 .attr("fill",averageColor)
	
	 if(tracts.length%2==0){
	 	var cityMedian = Math.round((tracts[tracts.length/2]["properties"][currentMeasure]
	 	+tracts[tracts.length/2+1]["properties"][currentMeasure])/2*100)/100
	 }else{
	 	var cityMedian = Math.round(tracts[Math.ceil(tracts.length/2)]["properties"][currentMeasure]*100)/100
	 	//console.log(median)
	 }
	
	  svg.append("rect")//.attr("id","median_"+c)
	  .attr("x",xScale(cityMedian))
	 .attr("y",30)
	  .attr("height",barSize+10)
	  .attr("width",2)
	  .attr("fill",medianColor)
	  .attr("transform","translate("+padding+",0)")
	 .attr("fill",averageColor)
	 
	  svg.append("text").text(cityMedian)
	 .attr("x",xScale(cityMedian)+padding+20)
	 .attr("y",20)
	  .attr("transform",function(){
	  	    return "rotate(-45 " + (xScale(cityMedian)+padding+20) + " " + (barHeight-1) + ")";
	  })
	  .attr("fill",medianColor)
	 .attr("fill",averageColor)
	  .style("font-weight",700)
	  
	  
		svg.append("text").text("- Measure Average")
		.attr("fill",averageColor)
		.attr("x",width-padding*6)
		.attr("y",25)
		svg.append("text").text("- Measure Median")
		.attr("fill",medianColor)
		.attr("x",width-padding*6)
		.attr("y",10)
		.attr("fill",averageColor)
	  .style("font-weight",700)
	  
	
	svg.selectAll(".cityBars")
	.data(sorted)
	.enter()
	.append("rect")
	.attr("x",function(d,i){return xScale(d["properties"][currentMeasure])+padding})
	.attr("y",function(d,i){return height-60})
	.attr("width",1)
	.attr("height",barSize)
	.attr("opacity",.2)
	.attr("fill",function(d){
		return colorScale(d["properties"][currentMeasure])
	})
	.style("opacity",function(d){
		return oScale(d["properties"][currentMeasure])
	})
	.style("cursor","pointer")
	.on("mouseover",function(d){
		//console.log(d)
		d3.select("#boroughChartPopup")
		.html(d["countyName"].replace(", New York","").split(",").join("<br>")+"<br>"
		+d["data"][currentMeasure])
		.style("left",event.clientX+15+"px")
		.style("top",event.clientY+"px")
		.style("visibility","visible")
	})
	.on("mouseout",function(d){
		d3.select("#boroughChartPopup").style("visibility","hidden")
	})
}

function drawBars(tracts){
	var barColors = ["#00A9CE","#aaa","#FB7139"]

	var colorScale = d3.scaleLinear().domain([0,.5,1]).range(barColors)
	console.log(tracts)
	var sorted = tracts.sort(function(a,b){
			return b["data"]["SPL_THEMES"]-a["data"]["RPL_THEMES"]
	})
	var width =800
	var height = 120
	var barHeight = 60
	var padding = 20
	var barSize = 20
	var svg = d3.select("#cityChart").append("svg").attr("width",width).attr("height",height)
	var xScale = d3.scaleLinear().domain([0,1]).range([0,width-padding*2])
	var xAxis = d3.axisBottom().scale(xScale).ticks(10)
	svg.append("g").call(xAxis).attr("transform","translate("+padding+","+(height-60)+")")
	// svg.append("text")
	// 	.text("Vulnerability Percentile Rank")
	// 	.attr("x",10).attr("y",16)
	// 	.style("font-size","20px")
	// svg.append("text")
// 		.text("Where New York City's 2166 census tracts fall in the national percentile ranking")
// 		.attr("x",10).attr("y",18)
// 		.style("font-size","20px")
	svg.append("text")
		.text("New York City Tracts")
		.attr("x",padding).attr("y",25)
	svg.append("text").text("Low").attr("x",padding).attr("y",height-25).attr("fill",barColors[0])
	svg.append("text").text("Nation Percentile Rank").attr("x",width/2).attr("y",height-25)
	.attr("text-anchor","middle")
	
	svg.append("text").text("High").attr("x",width-padding).attr("y",height-25)
		.attr("text-anchor","end").attr("fill",barColors[2])
	svg.selectAll(".cityBars")
	.data(sorted)
	.enter()
	.append("rect")
	.attr("x",function(d,i){return xScale(d["data"]["RPL_THEMES"])+padding})
	.attr("y",function(d,i){return 40})
	.attr("width",2)
	.attr("height",barSize)
	.attr("opacity",.2)
	.attr("fill",function(d){
		return colorScale(d["data"]["RPL_THEMES"])
	})
	.style("cursor","pointer")
	.on("mouseover",function(d){
		//console.log(d)
		d3.select("#boroughChartPopup")
		.html(d["countyName"].replace(", New York","").split(",").join("<br>")+"<br>"+d["data"]["RPL_THEMES"])
		.style("left",event.clientX+15+"px")
		.style("top",event.clientY+"px")
		.style("visibility","visible")
	})
	.on("mouseout",function(d){
		d3.select("#boroughChartPopup").style("visibility","hidden")
	})
	
	var cityAverage = Math.round(getAverage(tracts)*100)/100
	//console.log(cityAverage)
	svg.append("rect")//.attr("id","average_"+c)
	.attr("x",xScale(cityAverage))
	.attr("y",barHeight-30)
	.attr("height",barSize+10)
	.attr("width",1)
	.attr("fill",averageColor)
	  .attr("transform","translate("+padding+",0)")
	
	svg.append("text").text(cityAverage)
	.attr("x",xScale(cityAverage)+5+padding)
	.attr("y",barHeight-30)
	.attr("transform",function(){
	    return "rotate(-45 " + (xScale(cityAverage)+5+padding) + " " + (barHeight-30) + ")";
	})
	.attr("fill",averageColor)
	
	if(tracts.length%2==0){
		var cityMedian = Math.round((tracts[tracts.length/2]["data"]["RPL_THEMES"]
		+tracts[tracts.length/2+1]["data"]["RPL_THEMES"])/2*100)/100
	}else{
		var cityMedian = Math.round(tracts[Math.ceil(tracts.length/2)]["data"]["RPL_THEMES"]*100)/100
		//console.log(median)
	}	
	
	 svg.append("rect")//.attr("id","median_"+c)
	 .attr("x",xScale(cityMedian))
	.attr("y",barHeight-30)
	 .attr("height",barSize+10)
	 .attr("width",2)
	 .style("font-weight",700)
	 .attr("fill",averageColor)
	  .attr("transform","translate("+padding+",0)")
	
	 svg.append("text").text(cityMedian)
	.attr("x",xScale(cityMedian)+5+padding)
	.attr("y",barHeight-30)
	 .attr("transform",function(){
 	    return "rotate(-45 " + (xScale(cityMedian)+5+padding) + " " + (barHeight-30) + ")";
	 })
	 .style("font-weight",700)
	 .attr("fill",averageColor)
	 
	 
	svg.append("text").text("- City Average")
	.attr("fill",averageColor)
	.attr("x",width-padding*5)
	.attr("y",30)
	svg.append("text").text("- City Median")
	.attr("fill",medianColor)
	.attr("x",width-padding*5)
	.attr("y",15)
	 .style("font-weight",700)
	 .attr("fill",averageColor)
	
	
}

function drawBoroughs(tracts){
	var boroughNames = {
		"New York": "Manhattan", 
		Kings: "Brooklyn", 
		Queens: "Queens", 
		Richmond: "Staten Island",
		Bronx: "Bronx"}
	//console.log(tracts)
	var barColors = ["#00A9CE","#aaa","#FB7139"]
	var colorScale = d3.scaleLinear().domain([0,.5,1]).range(barColors)
	var sorted = tracts.sort(function(a,b){
			return b["data"]["SPL_THEMES"]-a["data"]["RPL_THEMES"]
	})
	//console.log(sorted.length)
	//var highTotals = sorted.slice(0,100)
	var countiesGrouped={}
	for(var i in sorted){
		
		var county = sorted[i]["data"]["COUNTY"]
		if(Object.keys(countiesGrouped).indexOf(county)==-1){
			if(sorted[i]["data"]["E_TOTPOP"]>-100){
				countiesGrouped[county]=[sorted[i]]
			}
		}else{
			if(sorted[i]["data"]["E_TOTPOP"]>-100){
				countiesGrouped[county].push(sorted[i])
			}
		}
	}
	//console.log(countiesGrouped)
	var width =800
	var height = 420
	var svg = d3.select("#boroughCharts").append("svg").attr("width",width).attr("height",height)
	var countyOffset = {
		"New York": 1, 
		Kings: 2, 
		Queens: 3, 
		Richmond: 4,
		Bronx: 5}
	var barHeight = 60
	var padding = 20
	var barSize = 20
	var xScale = d3.scaleLinear().domain([0,1]).range([0,width-padding*2])
	var xAxis = d3.axisBottom().scale(xScale).ticks(10)
	svg.append("g").call(xAxis).attr("transform","translate("+padding+","+(height-80)+")")
	// svg.append("text")
// 		.text("Vulnerability Percentile Rank by Borough")
// 		.attr("x",10).attr("y",16)
// 		.style("font-size","20px")
// 	svg.append("text")
// 		.text("Where census tracts from each borouogh fall in the national percentile ranking ")
// 		.attr("x",10).attr("y",28)
		
	svg.append("text").text("Low").attr("x",padding).attr("y",height-40).attr("fill",barColors[0])
	svg.append("text").text("Nation Percentile Rank").attr("x",width/2).attr("y",height-40)
	.attr("text-anchor","middle")
	svg.append("text").text("High").attr("x",width-padding).attr("y",height-40)
		.attr("text-anchor","end").attr("fill",barColors[2])
		
		svg.append("text").text("- Borough Average")
		.attr("fill",averageColor)
		.attr("x",width-padding*6)
		.attr("y",65)
		svg.append("text").text("- Borough Median")
		.attr("fill",medianColor)
		.attr("x",width-padding*6)
		.attr("y",50)
	 .style("font-weight",700)
	 .attr("fill",averageColor)
	
	for(var c in countiesGrouped){
				
		svg.append("text").text(boroughNames[c]).attr("x",padding)
		.attr("y",countyOffset[c]*barHeight+15)
		
		var countyData = countiesGrouped[c].sort(function(a,b){
							return b["data"]["RPL_THEMES"]-a["data"]["RPL_THEMES"]
						})
		var average = Math.round(getAverage(countyData)*100)/100
		if(countyData.length%2==0){
			var median = Math.round((countyData[countyData.length/2]["data"]["RPL_THEMES"]
			+countyData[countyData.length/2+1]["data"]["RPL_THEMES"])/2*100)/100
		}else{
			var median = Math.round(countyData[Math.ceil(countyData.length/2)]["data"]["RPL_THEMES"]*100)/100
			//console.log(median)
		}	
	//	console.log(median, average)
		svg.selectAll("."+c)
		.data(countyData)
		.enter()
		.append("rect")
		.attr("x",function(d,i){return xScale(d["data"]["RPL_THEMES"])+padding})
		.attr("y",function(d,i){return countyOffset[c]*barHeight+barSize})
		.attr("width",2)
		.attr("height",barSize)
		.attr("opacity",.2)
		.attr("fill",function(d){
			return colorScale(d["data"]["RPL_THEMES"])
		})
		.style("cursor","pointer")
		.on("mouseover",function(d){
			//console.log(d)
			d3.select("#boroughChartPopup")
			.html(d["countyName"].replace(", New York","").split(",").join("<br>")+"<br>"+d["data"]["RPL_THEMES"])
			.style("left",event.clientX+15+"px")
			.style("top",event.clientY+"px")
			.style("visibility","visible")
		})
		.on("mouseout",function(d){
			d3.select("#boroughChartPopup").style("visibility","hidden")
		})
			
		svg.append("rect").attr("id","average_"+c)
		.attr("x",xScale(average))
		.attr("y",countyOffset[c]*barHeight+barSize-10)
		.attr("height",barSize+10)
		.attr("width",1)
		.attr("fill",averageColor)
	  .attr("transform","translate("+padding+",0)")
		
		svg.append("text").text(average)
		.attr("x",xScale(average)+5+padding)
		.attr("y",countyOffset[c]*barHeight+10)
		.attr("transform",function(){
		    return "rotate(-45 " + (xScale(average)+5+padding) + " " + (countyOffset[c]*barHeight+10) + ")";
		})
		.attr("fill",averageColor)
		
		
		svg.append("rect").attr("id","median_"+c)
		.attr("x",xScale(median))
		.attr("y",countyOffset[c]*barHeight+barSize-10)
		.attr("height",barSize+10)
		.attr("width",2)
	 .attr("fill",averageColor)
	  .attr("transform","translate("+padding+",0)")
		
		svg.append("text").text(median)
		.attr("x",xScale(median)+5+padding)
		.attr("y",countyOffset[c]*barHeight+10)
		.attr("transform",function(){
		    return "rotate(-45 " + (xScale(median)+5+padding) + " " + (countyOffset[c]*barHeight+10) + ")";
		})
		.attr("fill",medianColor)
	 .style("font-weight",700)
	 .attr("fill",averageColor)
	}
}

function drawTheme(tracts){
	//console.log(tracts)
	for(var i in  groups){
		var groupName = themeGroupDisplayText[i]
		var groupMeasures = groups[i]
		//console.log(groupName,groupMeasures)
		var themeDiv = d3.select("#themes").append("div").attr("id",i).attr("class","themes")
		var themeTitleDiv = themeDiv.append("div")
		.html(groupName).attr("class","groupTitle")
		
		for(var m in groupMeasures){
			var measureCode = groupMeasures[m]
			//console.log(measureCode)
			var measureLabel = themeDisplayText[measureCode]
			var measureDiv = themeDiv.append('div')
			var measureTitle = measureDiv.append('div').html(measureLabel).attr("class","measureTitle")
			
			var filtered = tracts.filter(entry => parseFloat(entry["data"][measureCode])>0);
			//console.log(filtered.length,tracts.length)
			
			var sorted = filtered.sort(function(a,b){
					return b["data"][measureCode]-a["data"][measureCode]
			})
			
			var highDiv = measureDiv.append("div").attr("id",measureCode+"_high")
			highDiv.append("div").html("Highest Tracts").attr("class","orderTitle")
			var lowDiv = measureDiv.append("div").attr("id",measureCode+"_low")
			lowDiv.append("div").html("Lowest Tracts").attr("class","orderTitle")
			
			var highList = sorted.slice(0,5)
			var lowList = sorted.slice(sorted.length-5, sorted.length)
			for(var h in highList){
				var fips = highList[h]["county"]
				var item = highDiv.append("div").style("display","inline-block").attr("class","tractDiv")
				item.append("div").html(highList[h].data.LOCATION.replace(", New York","")+"<br>"+highList[h].data[measureCode])
				item.append("div")
				.html("<img src=\"../2021_SVI_Satellite/tracts/"+fips+".png\" >")
			}
			
			for(var l in lowList){
				var fips =lowList[l]["county"]
				var item = lowDiv.append("div").style("display","inline-block").attr("class","tractDiv")
				item.append("div").html(lowList[l].data.LOCATION+"<br>"+lowList[l].data[measureCode])
				item.append("div")
				.html("<img src=\"../2021_SVI_Satellite/tracts/"+fips+".png\" >")
			}
			
			
		}
		
		
	}
}