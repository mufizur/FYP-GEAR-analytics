GEAR_CHART_MESO_CHART_SETTINGS = {
	'SVG_BACKGROUND'	 : '#e1e1e1',
	'SVG_MARGIN'		 : '0px',
	'HUE_DIFFERENCE' 	 : 360, 
	'BAR_HEIGHT_OFFSET'  : 50,
	'TOOLTIP_WIDTH'		 : 150,
	'BAR_WIDTH_RATIO'	 : 0.125,
	'DOMAIN_Y_SCALE_MAX' : 100,
	'DOMAIN_Y_SCALE_MIN' : 0,
	'MARGIN'			 : {'top':0, 'right':10, 'bottom':10, 'left':40}
}

//300, 600, dataFeedback, selectionClass
function gearChartMesoStack(svgHeight, svgWidth, dataArray, selectionClass, dataTag){

	var margin = GEAR_CHART_MESO_CHART_SETTINGS['MARGIN']
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
			"background" : GEAR_CHART_MESO_CHART_SETTINGS['SVG_BACKGROUND'],
			"margin"     : GEAR_CHART_MESO_CHART_SETTINGS['SVG_MARGIN']
		});

	var totalDataLen   = dataArray['results'].length;
	var totalFields    = dataArray['fields'].length
	var upperBound 	   = dataArray['upperBound'] * totalFields;
	var sessionWidth   = svgWidth / totalDataLen;
	var heightOffset   = GEAR_CHART_MESO_CHART_SETTINGS['BAR_HEIGHT_OFFSET'];
	var barWidth 	   = parseInt(sessionWidth * GEAR_CHART_MESO_CHART_SETTINGS['BAR_WIDTH_RATIO']);
	var sessionOffset  = 0;
	var hueOffset 	   = 0;
	var hueDifference  = GEAR_CHART_MESO_CHART_SETTINGS['HUE_DIFFERENCE'] / (totalFields);
	var toolTipWidth   = GEAR_CHART_MESO_CHART_SETTINGS['TOOLTIP_WIDTH']

	var yScale = d3.scale.linear()
			.domain([GEAR_CHART_MESO_CHART_SETTINGS['DOMAIN_Y_SCALE_MIN'], upperBound])
			.range([0, svgHeight-heightOffset]);

	var toolTip = d3.select('.'+selectionClass).append('div')
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

	for(refIndex=0; refIndex<=4; refIndex++){
		var refLineClass = "ref_line_"+refIndex;
		var refLine = dashboardSvg.selectAll(refLineClass)
			.data([refIndex*0.25*upperBound])
			.enter().append('path')
			.classed(refLineClass, true)
				.attr('d', function(d){
					var yValue = svgHeight - yScale(d);
					return 'M'+margin['left']+' '+yValue+' L'+(width)+' '+yValue;
				})
				.attr('stroke-dasharray', '5 5')
				.style({
					'stroke': '#c1c1c1',
					'stroke-width' : '1px'
				});
	}

	var prevHeightArr = []; 

	for(resultIndex=0; resultIndex<dataArray['results'].length; resultIndex++){
		var resultKey = dataArray['results'][resultIndex];
		for(fieldIndex=0; fieldIndex<dataArray['fields'].length; fieldIndex++){
			var fieldKey = dataArray['fields'][fieldIndex];
			var data = dataArray[fieldKey][resultKey];
			var dataHeightArr = []
			for(dataIndex=0; dataIndex<data.length; dataIndex++){
				var d = data[dataIndex];
				var height = parseInt(yScale(d));
				if(fieldIndex != 0){
					var heightDataIndex = (dataArray['fields'].length*resultIndex) + fieldIndex;
					height = parseInt(height) + parseInt(prevHeightArr[heightDataIndex-1][dataIndex])
				}
				dataHeightArr.push(height);
			}
			prevHeightArr.push(dataHeightArr);
		}
	}

	for(resultIndex=0; resultIndex<dataArray['results'].length; resultIndex++){
		var resultKey = dataArray['results'][resultIndex];
		for(fieldIndex=0; fieldIndex<dataArray['fields'].length; fieldIndex++){
			var pathString = "M"+(margin['left'] + (sessionWidth * resultIndex))+" "+svgHeight+" ";
			var fieldKey = dataArray['fields'][fieldIndex];
			var innerDataLen = dataArray[fieldKey][resultKey].length;
			var sessionWidthOffset = sessionWidth;
			if(totalDataLen > 1){
				sessionWidthOffset = sessionWidth/(totalDataLen-1);
			}
			for(dataIndex = 0; dataIndex < innerDataLen; dataIndex++){
				var heightDataIndex = (dataArray['fields'].length*resultIndex) + fieldIndex;
				var coordinateX = (sessionWidth * resultIndex) + ((dataIndex+1) * (sessionWidth/4)) + margin['left'];
				var coordinateY = svgHeight - prevHeightArr[heightDataIndex][dataIndex];
				pathString = pathString + "L"+coordinateX+" "+coordinateY+" ";
			}

			pathString = pathString + "L"+(sessionWidthOffset * (resultIndex+1) + margin['left'])+" "+(svgHeight)+" ";
			if(fieldIndex != 0){
				for(dataIndex=innerDataLen-1; dataIndex >= 0; dataIndex--){
					var prevHeightDataIndex = (dataArray['fields'].length*resultIndex) + fieldIndex - 1;
					var coordinateX = (sessionWidth * resultIndex) + ((dataIndex+1) * (sessionWidth/4)) + margin['left'];
					var coordinateY = svgHeight - prevHeightArr[prevHeightDataIndex][dataIndex];
					pathString = pathString + "L"+coordinateX+" "+coordinateY+" ";
				}
			}
			var curveLineClassName = 'curveLine_session'+resultIndex+'_field'+fieldIndex
			var dashboardCurveLine = dashboardSvg.selectAll(curveLineClassName)
				.data([pathString])
				.enter().append('path')
				.classed(curveLineClassName, true)
					.attr('resultIndex', resultIndex)
					.attr('fieldIndex', fieldIndex)
					.attr('resultKey', resultKey)
					.attr('d', function(d){
						return d;
					})
					.style({
						'stroke' : 'hsl('+hueOffset+', 10%, 50%)', 
						'fill' : 'hsl('+hueOffset+', 80%, 50%)',
						'stroke-width' : '0', 
						'fill-opacity' : '0.1'
					})
					.on('mouseover', function(d){
						d3.select(this).style('fill-opacity',0.3);
						var resultId   = parseInt(this.getAttribute('resultIndex')) + 1;
						var fieldIndex = parseInt(this.getAttribute('fieldIndex'))
						var resultKey  = parseInt(this.getAttribute('resultKey'))
						var fieldKey   = dataArray['fields'][fieldIndex];
						var resultKey  = dataArray['results'][resultId-1];
						var dataArr    = dataArray[fieldKey][resultKey];
						var dataTotal = 0;
						var dataAverage = 0;
						for(dataIndex=0; dataIndex<dataArr.length; dataIndex++){
							dataTotal = dataTotal + parseFloat(dataArr[dataIndex]);
						}
						dataAverage = parseInt(dataTotal / dataArr.length);
						var toolTipHeader = "<div class = 'toolTipHeader'>Session "+resultKey+"</div>";
						var toolTipValue  = "<div class = 'toolTipData'>Avg "+fieldKey+" : "+dataAverage+"</div>";
						var toolTipHtml   = "<div class = 'toolTipHtml'>"+toolTipHeader+toolTipValue+"</div>";
						var widthOffset   = ($("."+selectionClass).width() / totalDataLen) * (resultId-1);
						var widthLength   = ($("."+selectionClass).width() / (2*totalDataLen));
						toolTip.html(toolTipHtml)
							.style({
								'left': ($(".svg_"+dataTag).offset().left + (widthOffset + widthLength - toolTipWidth/2)) + 'px',
								'top' : ($(".svg_"+dataTag).offset().top  + $(".svg_"+dataTag).height())+'px',
								'opacity' : 1,
								'background' : 'hsl('+(hueDifference * fieldIndex)+', 10%, 25%)',
								'display' : 'block'
							})
					})
					.on('mouseout', function(d){
						d3.select(this).style('fill-opacity',0.1);
						toolTip.style('display', 'none');
					});
			hueOffset = hueOffset + hueDifference;
		}
		hueOffset = 0;
	}

	for(resultIndex=0; resultIndex<dataArray['results'].length; resultIndex++){
		var resultKey = dataArray['results'][resultIndex];
		for(fieldIndex=0; fieldIndex<dataArray['fields'].length; fieldIndex++){
			var fieldKey = dataArray['fields'][fieldIndex];
			var data = dataArray[fieldKey][resultKey];
			var rectClassName = "stack_"+fieldKey+"_result"+resultIndex+"_field"+fieldIndex;
			var stackBars = dashboardSvg.selectAll(rectClassName)
				.data(data)
				.enter().append('rect')
				.classed(rectClassName, true)
					.attr('dataIndex', function(d, i){
						return i;
					})
					.attr('resultIndex', resultIndex)
					.attr('fieldIndex', fieldIndex)
					.attr('resultValue', resultKey)
					.attr('x', function(d, i){
						return 0;
					})
					.attr('y', function(d, i){
						var heightDataIndex = (dataArray['fields'].length*resultIndex) + fieldIndex;
						var dataIndex = parseInt(i)
						var heightOffset =  parseInt(prevHeightArr[heightDataIndex][dataIndex]);
						return svgHeight - heightOffset;
					})
					.attr('width', barWidth)
					.attr('height', function(d, i){						
						return yScale(d);
					})
					.style({
						'fill': 'hsl('+hueOffset+', 50%, 50%)',
						'fill-opacity' : '0.6'
					})
					.on('mouseover', function(d,i){
						d3.select(this).style('fill-opacity',1.0);
						var resultId    = parseInt(this.getAttribute('resultIndex')) + 1;
						var fieldIndex  = parseInt(this.getAttribute('fieldIndex'));
						var resultValue = this.getAttribute('resultValue'); 
						var fieldKey    = dataArray['fields'][fieldIndex];
						var resultKey   = dataArray['results'][resultId-1];
						var dataArr     = dataArray[fieldKey][resultKey];
						var dataTotal   = 0;
						var dataAverage = 0;
						var widthOffset   = ($("."+selectionClass).width() / totalDataLen) * (resultId-1);
						var widthLength   = ($("."+selectionClass).width() / (2*totalDataLen));
						for(dataIndex=0; dataIndex<dataArr.length; dataIndex++){
							dataTotal = dataTotal + parseFloat(dataArr[dataIndex]);
						}
						dataAverage = parseInt(dataTotal / dataArr.length);

						var toolTipHeader = "<div class = 'toolTipHeader'>Level "+(i+1)+"</div>";
						var toolTipValue  = "<div class = 'toolTipData'> "+fieldKey+" : "+d+"</div>";
						var toolTipHtml   = "<div class = 'toolTipHtml'>"+toolTipHeader+toolTipValue+"</div>";
						barToolTip.html(toolTipHtml)
							.style({
								'left': ($(".svg_"+dataTag).offset().left + (widthOffset + widthLength - toolTipWidth/2)) + 'px',
								'top' : ($(".svg_"+dataTag).offset().top  + heightOffset/4)+'px',
								'opacity' : 1,
								'background' : 'hsl('+(hueDifference * fieldIndex)+', 10%, 25%)',
								'display' : 'block'
							})

						var toolTipHeader = "<div class = 'toolTipHeader'>Session "+resultValue+"</div>";
						var toolTipValue  = "<div class = 'toolTipData'>Avg "+fieldKey+" : "+dataAverage+"</div>";
						var toolTipHtml   = "<div class = 'toolTipHtml'>"+toolTipHeader+toolTipValue+"</div>";
						toolTip.html(toolTipHtml)
							.style({
								'left': ($(".svg_"+dataTag).offset().left + (widthOffset + widthLength - toolTipWidth/2)) + 'px',
								'top' : ($(".svg_"+dataTag).offset().top  + $(".svg_"+dataTag).height())+'px',
								'opacity' : 0.6,
								'background' : 'hsl('+(hueDifference * fieldIndex)+', 10%, 25%)',
								'display' : 'block'
							})
					})
					.on('mouseout', function(d){
						d3.select(this).style('fill-opacity',0.6);
						barToolTip.style('display', 'none');
						toolTip.style('display', 'none');
					});
			hueOffset = hueOffset + hueDifference;

			stackBars.transition()
				.duration(1500)
				.delay(100)
				.ease('bounce')
				.attr("x", function(d, i){
					return sessionOffset + ((i+1) * (sessionWidth/4)) - barWidth/2 + margin['left'];
				});
		}

		sessionOffset = sessionOffset + sessionWidth;
		hueOffset = 0;
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

	var textWidthOffset = 40;
	for(fieldIndex=0; fieldIndex<dataArray['fields'].length; fieldIndex++){
		var fieldKey = dataArray['fields'][fieldIndex];
		var textResult = dashboardSvg.append('text')
				.classed('textStackData_'+fieldKey, true)
				.attr('x', textWidthOffset)
				.attr('y', 30)
				.text(fieldKey)
				.style('fill', 'hsl('+(hueDifference * fieldIndex)+', 50%, 50%)')
		textWidthOffset = textWidthOffset + 100;
	}
}
