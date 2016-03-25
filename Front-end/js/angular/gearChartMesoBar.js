GEAR_CHART_MESO_BAR_SETTINGS = {
	'SVG_BACKGROUND'	 : '#e1e1e1',
	'SVG_MARGIN'		 : '0px',
	'HUE_DIFFERENCE' 	 : 60, 
	'BAR_HEIGHT_OFFSET'  : 50,
	'TOOLTIP_OFFSET'	 : 45,
	'TOOLTIP_WIDTH'		 : 150,
	'BAR_WIDTH_RATIO'	 : 0.125,
	'DOMAIN_Y_SCALE_MAX' : 100,
	'DOMAIN_Y_SCALE_MIN' : 0,
	'MARGIN'			 : {'top':0, 'right':10, 'bottom':10, 'left':40}
}

function gearChartMesoBar(svgHeight, svgWidth, dataArray, selectionClass, dataTag, dataUnits, hueIndex){
	var margin = GEAR_CHART_MESO_BAR_SETTINGS['MARGIN']
	var width = svgWidth;
	var height = svgHeight;
	svgHeight = svgHeight - margin['top'] - margin['bottom'];
	svgWidth  = svgWidth  - margin['left'] - margin['right']; 

	var dashboardSvg = d3.select("."+selectionClass)
		.append("svg")
		.classed("svg_"+dataTag, true)
		.attr("width", '100%')
		.attr("height", '100%')
		.attr("viewBox", "0 0 "+width+" "+height)
		.attr("preserveAspectRation", "xMidYMid meet")
		.style({
			"background" : GEAR_CHART_MESO_BAR_SETTINGS['SVG_BACKGROUND'],
			"margin"     : GEAR_CHART_MESO_BAR_SETTINGS['SVG_MARGIN']
		});

	var totalDataLen   = dataArray['results'].length;
	var upperBound 	   = dataArray['upperBound']
	var sessionWidth   = svgWidth / totalDataLen;
	var hueDifference  = GEAR_CHART_MESO_BAR_SETTINGS['HUE_DIFFERENCE'] / totalDataLen;
	var heightOffset   = GEAR_CHART_MESO_BAR_SETTINGS['BAR_HEIGHT_OFFSET'];
	var toolTipWidth   = GEAR_CHART_MESO_BAR_SETTINGS['TOOLTIP_WIDTH'];
	var barWidth 	   = parseInt(sessionWidth * GEAR_CHART_MESO_BAR_SETTINGS['BAR_WIDTH_RATIO']);
	var sessionOffset  = 0;
	var hueOffset 	   = hueIndex*GEAR_CHART_MESO_BAR_SETTINGS['HUE_DIFFERENCE'];
	var averageDataArr = [];

	var yScale = d3.scale.linear()
		.domain([GEAR_CHART_MESO_BAR_SETTINGS['DOMAIN_Y_SCALE_MIN'], upperBound])
		.range([0, svgHeight-heightOffset]);

	for(refIndex=0; refIndex<=4; refIndex++){
		var refLineClass = "ref_line_"+refIndex;
		var refLine = dashboardSvg.selectAll(refLineClass)
			.data([refIndex*0.25*upperBound])
			.enter().append('path')
			.classed(refLineClass, true)
				.attr('d', function(d){
					var yValue = svgHeight - yScale(d);
					return 'M'+margin['left']+' '+yValue+' L'+(width-margin['right'])+' '+yValue;
				})
				.attr('stroke-dasharray', '5 5')
				.style({
					'stroke': '#c1c1c1',
					'stroke-width' : '1px'
				});
	}

	for(sessionIndex=0; sessionIndex<totalDataLen; sessionIndex++){
		var key = dataArray['results'][sessionIndex];
		var data = dataArray[key];
		var rectClassName = 'dataRect_'+sessionIndex;
		var lineAvgClassName = 'dataLineAvg_'+sessionIndex;
		var curveLineClassName = 'dataCurve_'+sessionIndex;

		var sumData = 0;
		var averageData = 0;
		var curveCoordinates = [];
		for(dataIndex=0; dataIndex<data.length; dataIndex++){
			sumData = sumData + data[dataIndex];
			coordinateX = sessionOffset + margin['left'] + ((dataIndex+1) * (sessionWidth/4));
			coordinateY = svgHeight - yScale(data[dataIndex]);
			var coordinate = {
				"x" : parseInt(coordinateX), 
				"y" : parseInt(coordinateY)
			}
			curveCoordinates.push(coordinate)
		}
		averageData = parseInt(sumData / data.length);
		averageDataArr.push(averageData);

		var dashboardLineAvg = dashboardSvg.selectAll(lineAvgClassName)
			.data([averageData])
			.enter().append('path')
			.classed(lineAvgClassName, true)
				.attr('d', function(d){
					return 'M'+(sessionOffset+margin['left'])+' '+(svgHeight-yScale(d))+' L'+(sessionOffset+sessionWidth)+' '+(svgHeight-yScale(d));
				})
				.attr('stroke-dasharray', '5 5')
				.style({
					'stroke': 'hsl('+hueOffset+', 80%, 30%)',
					'stroke-width' : '2px'
				});

		var pathString = "";
		for(coordinateIndex=0; coordinateIndex<curveCoordinates.length; coordinateIndex++){
			if (coordinateIndex == 0){
				pathString = 'M'+(sessionOffset+margin['left'])+' '+svgHeight+' ';
			}

			pathString = pathString + 'L'+curveCoordinates[coordinateIndex]['x']+' '+curveCoordinates[coordinateIndex]['y']+' ';

			if(coordinateIndex == curveCoordinates.length-1){
				var path = "L"+(sessionOffset+sessionWidth+margin['left'])+' '+svgHeight+' '; 
				pathString = pathString + path;
			} 
		}

		var curveToolTip = d3.select('.'+selectionClass).append('div')
			.style({
				'position' : 'absolute', 
				'padding' : '5px 5px', 
				'background' : '#4f4f4f',
				'color' : '#ffffff',
				'width' : toolTipWidth+'px',
				'opacity' : 0.0
			})

		var barToolTip = d3.select('.'+selectionClass).append('div')
			.style({
				'position' : 'absolute', 
				'padding' : '5px 5px', 
				'background' : '#4f4f4f',
				'color' : '#ffffff',
				'width' : toolTipWidth+'px',
				'opacity' : 0.0				
			})

		var dashboardCurveLine = dashboardSvg.selectAll(curveLineClassName)
			.data([pathString])
			.enter().append('path')
			.classed(curveLineClassName, true)
				.attr('sessionIndex', sessionIndex)
				.attr('d', function(d){
					return d;
				})
				.style({
					'stroke' : 'hsl('+hueOffset+', 80%, 30%)', 
					'fill' : 'hsl('+hueOffset+', 80%, 30%)',
					'stroke-width' : '0', 
					'fill-opacity' : '0.2'
				})
				.on('mouseover', function(d){
					d3.select(this).style('fill-opacity', 0.4);
					var curveSessionIndex = parseInt(this.getAttribute('sessionIndex'));
					var averageData   = averageDataArr[curveSessionIndex];
					var toolTipHeader = "<div class = 'toolTipHeader'>Session "+(curveSessionIndex+1)+"</div>";
					var toolTipValue  = "<div class = 'toolTipData'>Avg "+dataTag+": "+averageData+dataUnits+"</div>";
					var toolTipHtml   = "<div class = 'toolTipHtml'>"+toolTipHeader+toolTipValue+"</div>";
					var widthOffset   = ($("."+selectionClass).width() / totalDataLen) * curveSessionIndex;
					var widthLength   = ($("."+selectionClass).width()/(2*totalDataLen))
					curveToolTip.html(toolTipHtml)
						.style({
							'left': ($(".svg_"+dataTag).offset().left + (widthOffset + widthLength - toolTipWidth/2)) + 'px',
							'top' : ($(".svg_"+dataTag).offset().top  + $(".svg_"+dataTag).height())+'px',
							'display' : 'block',
							'opacity' : 1
						})
				})
				.on('mouseout', function(d){
					d3.select(this).style('fill-opacity', 0.2);
					curveToolTip.style('display', 'none');
				});

		var dashboardBars = dashboardSvg.selectAll(rectClassName)
			.data(data)
			.enter().append('rect')
			.classed(rectClassName, true)
				.attr('levelIndex', function(d, i){
					return i;
				})
				.attr('sessionIndex', sessionIndex)
				.attr('x', function(d, i){
					return sessionOffset + margin['left'] + ((i+1) * (sessionWidth/4)) - barWidth/2;
				})
				.attr('y', svgHeight)
				.attr('width', barWidth)
				.attr('height', function(d){
					return yScale(d);
				})
				.style({
					'fill': 'hsl('+hueOffset+', 50%, 40%)',
					'fill-opacity' : '0.5'
				})
				.on('mouseover', function(d){
					d3.select(this).style('fill-opacity', 1.0);
					var barLevelIndex   = parseInt(this.getAttribute('levelIndex'));
					var barSessionIndex = parseInt(this.getAttribute('sessionIndex'));
					var toolTipHeader   = "<div class = 'toolTipHeader'>Level "+(barLevelIndex+1)+"</div>";
					var toolTipValue  	= "<div class = 'toolTipData'>"+dataTag+" : "+d+dataUnits+"</div>";
					var toolTipHtml 	= "<div class = 'toolTipHtml'>"+toolTipHeader+toolTipValue+"</div>";
					var widthOffset 	= ($("."+selectionClass).width() / totalDataLen) * barSessionIndex;
					var widthLength 	= ($("."+selectionClass).width() / (2*totalDataLen));
					barToolTip.html(toolTipHtml)
						.style({
							'left': (widthOffset + widthLength - toolTipWidth/2) + 'px',
							'top' : ($(".svg_"+dataTag).offset().top  + heightOffset/2)+'px',
							'display' : 'block',
							'opacity' : 1
						})

					var curveSessionIndex = parseInt(this.getAttribute('sessionIndex'));
					var averageData   = averageDataArr[curveSessionIndex];
					var toolTipHeader = "<div class = 'toolTipHeader'>Session "+(curveSessionIndex+1)+"</div>";
					var toolTipValue  = "<div class = 'toolTipData'>Avg "+dataTag+": "+averageData+dataUnits+"</div>";
					var toolTipHtml   = "<div class = 'toolTipHtml'>"+toolTipHeader+toolTipValue+"</div>";
					var widthOffset   = ($("."+selectionClass).width() / totalDataLen) * curveSessionIndex;
					var widthLength   = ($("."+selectionClass).width()/(2*totalDataLen))
					curveToolTip.html(toolTipHtml)
						.style({
							'left': ($(".svg_"+dataTag).offset().left + (widthOffset + widthLength - toolTipWidth/2)) + 'px',
							'top' : ($(".svg_"+dataTag).offset().top  + $(".svg_"+dataTag).height())+'px',
							'display' : 'block',
							'opacity' : 0.4
						})
					
				})
				.on('mouseout', function(d){
					d3.select(this).style('fill-opacity', 0.5);
					barToolTip.style('display', 'none');
					curveToolTip.style({
						'display': 'none'
					});
				});

		dashboardBars.transition()
			.duration(1000)
			.delay(100)
			.ease('bounce')
			.attr("y", function(d){
				return svgHeight - yScale(d);
			});

		hueOffset = hueOffset + hueDifference
		sessionOffset = sessionOffset + sessionWidth;
	}

	var vScale = d3.scale.linear()
		.domain([GEAR_CHART_MICRO_BAR_SETTINGS['DOMAIN_Y_SCALE_MIN'], upperBound])
		.range([svgHeight-heightOffset, 0]);

	var vAxis = d3.svg.axis()
					.scale(vScale)
					.orient('left')
					.tickValues([
						upperBound * 0.00,
						upperBound * 0.25,
						upperBound * 0.50,
						upperBound * 0.75,
						upperBound * 1.00])

	var vGuide = dashboardSvg.append('g')
	vAxis(vGuide)
	vGuide.attr('transform', 'translate('+margin['left']+','+(heightOffset)+')')
		.style('fill', '#a1a1a1')
		.selectAll('path')
			.style('fill', 'none')
			.style('stroke', '#a1a1a1')
		.selectAll('line')
			.style('stroke', '#a1a1a1');
}
