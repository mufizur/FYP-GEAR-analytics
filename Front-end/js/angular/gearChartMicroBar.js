GEAR_CHART_MICRO_BAR_SETTINGS = {
	'SVG_BACKGROUND'	 : '#e1e1e1',
	'SVG_MARGIN'		 : '0px',
	'HUE_DIFFERENCE' 	 : 60, 
	'BAR_HEIGHT_OFFSET'  : 50,
	'TOOLTIP_OFFSET'	 : 45,
	'TOOLTIP_WIDTH'		 : 150,
	'BAR_WIDTH_RATIO'	 : 0.125,
	'DOMAIN_Y_SCALE_MAX' : 100,
	'DOMAIN_Y_SCALE_MIN' : 0, 
	'BINARY_ONE_HUE'	 : 0,
	'BINARY_TWO_HUE'	 : 240,
	'MARGIN'			 : {'top':0, 'right':10, 'bottom':10, 'left':20}
}

function gearChartMicroBinaryBar(svgHeight, svgWidth, dataArray, selectionClass, dataTag, dataUnits){
	var margin = GEAR_CHART_MICRO_BAR_SETTINGS['MARGIN']
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
			"background" : GEAR_CHART_MICRO_BAR_SETTINGS['SVG_BACKGROUND'],
			"margin"     : GEAR_CHART_MICRO_BAR_SETTINGS['SVG_MARGIN']
		})
		.append('g')
			.attr('transform', "translate("+margin['left']+","+margin['top']+")");

	var totalResults = dataArray['results'].length;
	var dataWidth    = svgWidth / (totalResults+1);
	var barWidth     = dataWidth / 4;
	var upperBound   = dataArray['upperBound'];
	var heightOffset = GEAR_CHART_MICRO_BAR_SETTINGS['BAR_HEIGHT_OFFSET'];
	var yScale = d3.scale.linear()
		.domain([GEAR_CHART_MICRO_BAR_SETTINGS['DOMAIN_Y_SCALE_MIN'], upperBound])
		.range([0, svgHeight-heightOffset]);
	var color = [GEAR_CHART_MICRO_BAR_SETTINGS['BINARY_ONE_HUE'],GEAR_CHART_MICRO_BAR_SETTINGS['BINARY_TWO_HUE']];
	var curvePath = ""; 
	var toolTipWidth   = GEAR_CHART_MICRO_BAR_SETTINGS['TOOLTIP_WIDTH']

	var toolTip = d3.select('.'+selectionClass).append('div')
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
					return 'M'+margin['left']+' '+yValue+' L'+(svgWidth)+' '+yValue;
				})
				.attr('stroke-dasharray', '5 5')
				.style({
					'stroke': '#c1c1c1',
					'stroke-width' : '1px'
				});
	}

	for(dataIndex=0; dataIndex<totalResults; dataIndex++){
		var dataKey = dataArray['results'][dataIndex];
		var data = dataArray[dataKey];
		var averageValue = 0; 
		var sumValue = 0;
		for(binaryIndex=0; binaryIndex<data.length; binaryIndex++){
			sumValue = sumValue + data[binaryIndex];
		} 

		averageValue = sumValue / data.length;
		if (dataIndex == 0){
			curvePath = 'M'+margin['left']+' '+svgHeight+' ';
		}
		curvePath = curvePath + 'L'+(dataWidth*(dataIndex+1))+' '+(svgHeight - yScale(averageValue))+' ';
		if(dataIndex == totalResults-1){
			curvePath = curvePath + "L"+svgWidth+" "+svgHeight+' ';
		} 
	}

	var microCurveLineClassName = "mico_curve"
	var microCurveLine = dashboardSvg.selectAll(microCurveLineClassName)
		.data([curvePath])
		.enter().append('path')
		.classed(microCurveLineClassName, true)
			.attr('d', function(d){
				return d;
			})
			.style({
				'stroke' : '#9f9f9f', 
				'fill' : 'hsl(0, 0%, 30%)',
				'stroke-width' : '1', 
				'fill-opacity' : '0.1'
			})

	for(dataIndex=0; dataIndex<totalResults; dataIndex++){
		var dataKey = dataArray['results'][dataIndex];
		var data = dataArray[dataKey];
		for(binaryIndex=0; binaryIndex<data.length; binaryIndex++){
			var dataVal = data[binaryIndex];
			var dataTagMicro = dataArray['dataTags'][binaryIndex];
			var microDataRectClassName = "micro_bar_"+dataKey+"_"+dataTagMicro;

			var microBars = dashboardSvg.selectAll(microDataRectClassName)
				.data([dataVal])
				.enter().append('rect')
				.classed(microDataRectClassName, true)
					.attr('dataIndex', function(d){
						return dataIndex;
					})
					.attr('binaryIndex', binaryIndex)
					.attr('x', function(d, i){
						if (binaryIndex == 0){ //First Element 
							return (dataWidth*(dataIndex+1)) - barWidth;
						} else { //Second Element
							return (dataWidth*(dataIndex+1));
						}
					})
					.attr('y', function(d, i){
						return svgHeight + margin['bottom'];
					})
					.attr('width', barWidth)
					.attr('height', function(d, i){
						var height = yScale(d);
						return height;
					})
					.style({
						'fill': 'hsl('+color[binaryIndex]+', 50%, 50%)',
						'fill-opacity' : '0.5'
					})
					.on('mouseover', function(d){
						d3.select(this).style('fill-opacity',1.0)
						var dataTagIndex  = parseInt(this.getAttribute('binaryIndex'))
						var toolTipHeader = "<div class = 'toolTipHeader'>Level "+(parseInt(this.getAttribute('dataIndex'))+1)+" ("+dataArray['dataTags'][dataTagIndex]+")</div>";
						var toolTipValue  = "<div class = 'toolTipData'>"+dataTag+": "+d+dataUnits+"</div>";
						var toolTipHtml   = "<div class = 'toolTipHtml'>"+toolTipHeader+toolTipValue+"</div>";
						toolTip.html(toolTipHtml)
							.style({
								'left': ($(this).position().left - toolTipWidth/2)+'px',
								'top' : ($(this).position().top - GEAR_CHART_MICRO_BAR_SETTINGS['TOOLTIP_OFFSET'])+'px',
								'opacity' : 1,
								'background' : 'hsl('+color[dataTagIndex]+', 10%, 25%)',
								'display' : 'block'
							})
					})
					.on('mouseout', function(d){
						d3.select(this).style('fill-opacity',0.5)
						toolTip.style('display', 'none')
					});
			microBars.transition()
				.duration(1000)
				.delay(100)
				.ease('bounce')
				.attr("y", function(d){
					return svgHeight - yScale(d);
				});
		}
	}

	for(dataIndex=0; dataIndex<totalResults; dataIndex++){
		var dataKey = dataArray['results'][dataIndex];
		var data = dataArray[dataKey];
		var averageValue = 0; 
		var sumValue = 0;
		for(binaryIndex=0; binaryIndex<data.length; binaryIndex++){
			sumValue = sumValue + data[binaryIndex];
		} 

		averageValue = sumValue / data.length;
		var microDataCircleClassName = "micro_circle_"+dataKey;
		var microBarsCircle = dashboardSvg.selectAll(microDataCircleClassName)
			.data([averageValue])
			.enter().append('circle')
			.classed(microDataCircleClassName, true)
				.attr('dataIndex', dataIndex)
				.attr('binaryIndex', binaryIndex)
				.attr('cx', function(d, i){
					return (dataWidth*(dataIndex+1));
				})
				.attr('cy', function(d, i){
					return svgHeight - yScale(d)
				})
				.attr('r', 7.5)
				.style({
					'fill': '#000000',
					'fill-opacity' : '0.5'
				})
				.on('mouseover', function(d){
					d3.select(this).style('fill-opacity',1.0);
					var toolTipHeader = "<div class = 'toolTipHeader'>Level "+(parseInt(this.getAttribute('dataIndex'))+1)+"</div>";
					var toolTipValue  = "<div class = 'toolTipData'>Avg "+dataTag+": "+d+dataUnits+"</div>";
					var toolTipHtml   = "<div class = 'toolTipHtml'>"+toolTipHeader+toolTipValue+"</div>";
					toolTip.html(toolTipHtml)
						.style({
							'left': ($(this).position().left - toolTipWidth/2)+'px',
							'top' : ($(this).position().top - GEAR_CHART_MICRO_BAR_SETTINGS['TOOLTIP_OFFSET'])+'px',
							'opacity' : 1,
							'background' : '#4f4f4f',
							'display' : 'block'
						})
				})
				.on('mouseout', function(d){
					d3.select(this).style('fill-opacity',0.5)
					toolTip.style('display', 'none')
				});
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
