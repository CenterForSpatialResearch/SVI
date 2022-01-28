function drawThemeMap(data,divName){//,outline){
 	//	console.log(data);

	//makes new map in the #map div
	//d3.select("#"+divName)        //
        // .style("width",window.innerWidth+"px")
        // .style("height",window.innerHeight+"px")
    mapboxgl.accessToken = "pk.eyJ1IjoiYzRzci1nc2FwcCIsImEiOiJja2J0ajRtNzMwOHBnMnNvNnM3Ymw5MnJzIn0.fsTNczOFZG8Ik3EtO9LdNQ"

    var maxBounds = [
      [-74.235258, 40.4485374], // Southwest coordinates
      [-73.289334, 40.931799] // Northeast coordinates
    ];
    thememap = new mapboxgl.Map({
        container: divName,
        style:"mapbox://styles/c4sr-gsapp/ckytx8oxk000e14rh745xntyo",
       // maxZoom:15,
        zoom: 9.4,
		    center:[-73.95, 40.7],
        preserveDrawingBuffer: true,
        minZoom:1,
        maxBounds: maxBounds
	 //  bearing: 28
    });

  var hoverCountyID = null;
  thememap.on("load",function(){
	
        thememap.addControl(new mapboxgl.NavigationControl(),'bottom-right');
        thememap.dragRotate.disable();
        
		thememap.addSource("theme",{
		              "type":"geojson",
		              "data":data
		          })
		  thememap.addLayer({
		              'id': 'theme',
		              'type': 'fill',
		              'source': 'theme', 
		              'layout': {'visibility':'none'},
		              'paint': {
		                'fill-color': 'red',
						  'fill-opacity':.5,
						  'fill-outline-color':"black"
		              }
		            })
  		  thememap.addLayer({
  		              'id': 'themeOutline',
  		              'type': 'line',
  		              'source': 'theme', 
  		              'layout': {'visibility':'visible'},
  		              'paint': {
  		                'line-color': 'black',
  						  'line-width':1,
						  "line-opacity":.4
  		              }
  		            })
		
      });
	  thememap.on("mousemove",function(e){
	  	var feature = thememap.queryRenderedFeatures(e.point);
		if(feature.length>0){
		console.log(feature[0]["properties"]["LOCATION"])
			
		}
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
	console.log(data)
	data["features"] = data["features"].filter(entry => parseFloat(entry["properties"]["E_TOTPOP"])>100);
	console.log(data)

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
		.style("cursor","pointer")
		//.style("font-weight","700")
		.on("click",function(){
				d3.selectAll(".measureButton").style("background-color","white")
				d3.selectAll(".themeButton").style("background-color","black").style("color","white")
				d3.select(this).style("background-color","gold").style("color","black")
				//.style("border","1px solid black")
		})
		
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
				var topTracts = data.features.sort(function(a,b){
						return parseFloat(b["properties"][measure])-parseFloat(a["properties"][measure])
				})				//
				// newData["features"]=topTracts.slice(0,20)
				// console.log(newData)
				var topIds =[] 
				for(var t in topTracts.slice(0,50)){
					//console.log(topTracts[t]["properties"]["FIPS"])
					topIds.push(topTracts.slice(0,50)[t]["properties"]["FIPS"])
				}
				var filter = ["in","FIPS"].concat(topIds)
				//console.log(filter)
				thememap.setFilter("theme",filter)
				thememap.setLayoutProperty("theme",'visibility','visible')
				
			})
		}
	}
	
}

function drawTopAndBottom(tracts){
	//console.log(tracts)
	var sorted = tracts.sort(function(a,b){
			return b["data"]["SPL_THEMES"]-a["data"]["RPL_THEMES"]
	})
	//console.log(sorted.length)
	//var highTotals = sorted.slice(0,100)
	var countiesGrouped={}
	for(var i in sorted){
		
		var county = sorted[i]["data"]["COUNTY"]
		if(Object.keys(countiesGrouped).indexOf(county)==-1){
			if(sorted[i]["data"]["E_TOTPOP"]>-10){
				countiesGrouped[county]=[sorted[i]]
			}
		}else{
			if(sorted[i]["data"]["E_TOTPOP"]>-10){
				countiesGrouped[county].push(sorted[i])
			}
		}
	}
	//console.log(countiesGrouped)
	var width =800
	var height = 450
	var svg = d3.select("#boroughCharts").append("svg").attr("width",width).attr("height",height)
	var countyOffset = {
		"New York": 1, 
		Kings: 2, 
		Queens: 3, 
		Richmond: 4,
		Bronx: 5}
	var barHeight = 60
	var padding = 80
	var barSize = 20
	var xScale = d3.scaleLinear().domain([0,1]).range([0,width-padding*2])
	var xAxis = d3.axisBottom().scale(xScale).ticks(10)
	svg.append("g").call(xAxis).attr("transform","translate("+padding+","+(height-80)+")")
	svg.append("text")
		.text("National Vulnerability Percentile Rank")
		.attr("x",10).attr("y",16)
		.style("font-size","16px")
	svg.append("text")
		.text("For 2166 census tracts in New York City by borough")
		.attr("x",10).attr("y",28)
		
	svg.append("text").text("Low Vulnerability Index").attr("x",padding).attr("y",height-40)
	svg.append("text").text("High Vulnerability Index").attr("x",width-padding).attr("y",height-40)
		.attr("text-anchor","end")
		
	for(var c in countiesGrouped){
				
		svg.append("text").text(c).attr("x",10).attr("y",countyOffset[c]*barHeight+barHeight/2)
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
		
		svg.append("text").text("- Borough Average")
		.attr("fill","#b4943e")
		.attr("x",width-padding*2)
		.attr("y",65)
		svg.append("text").text("- Borough Median")
		.attr("fill","#777acd")
		.attr("x",width-padding*2)
		.attr("y",50)
		
		svg.append("rect").attr("id","average_"+c)
		.attr("x",xScale(average))
		.attr("y",countyOffset[c]*barHeight+barSize-10)
		.attr("height",barSize+10)
		.attr("width",1)
		.attr("fill","#b4943e")
		
		svg.append("text").text(average)
		.attr("x",xScale(average)+5)
		.attr("y",countyOffset[c]*barHeight+10)
		.attr("transform",function(){
		    return "rotate(-45 " + (xScale(average)+5) + " " + (countyOffset[c]*barHeight+10) + ")";
		})
		.attr("fill","#b4943e")
		
		
		svg.append("rect").attr("id","median_"+c)
		.attr("x",xScale(median))
		.attr("y",countyOffset[c]*barHeight+barSize-10)
		.attr("height",barSize+10)
		.attr("width",1)
		.attr("fill","#777acd")
		
		svg.append("text").text(median)
		.attr("x",xScale(median)+5)
		.attr("y",countyOffset[c]*barHeight+10)
		.attr("transform",function(){
		    return "rotate(-45 " + (xScale(median)+5) + " " + (countyOffset[c]*barHeight+10) + ")";
		})
		.attr("fill","#777acd")
		
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