GEAR_CHART_MESO_PIE_SETTINGS = {
	'SVG_BACKGROUND'	 : '#e1e1e1',
	'SVG_MARGIN'		 : '0px',
	'TOOLTIP_WIDTH'		 : 150,
}

function gearChartMesoPie(svgHeight, svgWidth, dataArray, selectionClass, dataTag){
	var dashboardSvg = d3.select("."+selectionClass)
		.append("svg")
		.classed("svg_"+dataTag, true)
		.attr("width", '100%')
		.attr("height", '100%')
		.attr("viewBox", "0 0 "+svgWidth+" "+svgHeight)
		.attr("preserveAspectRation", "xMidYMid meet")
		.style({
			"background" : GEAR_CHART_MESO_PIE_SETTINGS['SVG_BACKGROUND'],
			"margin"     : GEAR_CHART_MESO_PIE_SETTINGS['SVG_MARGIN']
		});

	var total = dataArray['total'];
	var resultLen = dataArray['results'].length
	var hueDifference = 0;
	var hueOffset = 360 / resultLen;
	var startAngle = 0;
	var toolTipWidth = GEAR_CHART_MESO_PIE_SETTINGS['TOOLTIP_WIDTH']
	var textOffsetY = 30

	var toolTip = d3.select('.'+selectionClass).append('div')
		.style({
			'position' : 'absolute', 
			'padding' : '5px 5px', 
			'background' : '#4f4f4f',
			'color' : '#ffffff',
			'width' : toolTipWidth+'px',
			'height': '50px',
			'opacity' : 0.0				
		})

	var mainChart = dashboardSvg.append('circle')
						.attr('cx', svgWidth/2)
						.attr('cy', svgHeight/2)
						.attr('r', svgHeight/3)
						.style('fill', '#dfdfdf')

	for(resultIndex=0; resultIndex<resultLen; resultIndex++){
		var resultKey = dataArray['results'][resultIndex];
		var resultValue = dataArray[resultKey];
		var endAngle = Math.PI*2;
		var resultPercentage = (resultValue / total) * 100
		if (resultIndex != resultLen-1){
			endAngle = startAngle + ((resultValue / total) * Math.PI*2);
		}

		var arc = d3.svg.arc()
	    	.innerRadius(svgHeight*0.45)
	    	.outerRadius(svgHeight*0.00)
	    	.startAngle(startAngle)
	    	.endAngle(endAngle)
		
		var path = dashboardSvg.append('path')
					.attr('d', arc)
					.attr('resultIndex', resultIndex)
					.attr('resultKey', resultKey)
					.attr('resultPercentage', resultPercentage)
					.attr('resultValue', resultValue)
					.attr('hueColor', hueDifference)
					.classed('arc_'+resultKey, true)
					.style({
						'fill' : 'hsl('+hueDifference+', 50%, 50%)',
						'fill-opacity' : '0.5'
					})
					.attr('transform', 'translate('+svgWidth/2+','+svgHeight/2+')')
					.on('mouseover', function(d){
						d3.select(this).style('fill-opacity',1);
						var toolTipHeader = "<div class = 'toolTipHeader'>"+(this.getAttribute('resultKey'))+"</div>";
						var toolTipValue  = "<div class = 'toolTipData'>"+parseInt(this.getAttribute('resultPercentage'))+"% ("+this.getAttribute('resultValue')+")</div>";
						var toolTipHtml   = "<div class = 'toolTipHtml'>"+toolTipHeader+toolTipValue+"</div>";
						toolTip.html(toolTipHtml)
							.style({
								'left': ($(".svg_"+dataTag).offset().left + $("."+selectionClass).width()/2 - toolTipWidth/2)+'px',
								'top' : ($(".svg_"+dataTag).offset().top  + $("."+selectionClass).height()/2 - 25)+'px',
								'opacity' : 1,
								'background' : 'hsl('+(this.getAttribute('hueColor'))+', 10%, 25%)',
								'display' : 'block'
							})
					})
					.on('mouseout', function(d){
						d3.select(this).style('fill-opacity',0.5);
						toolTip.style('display', 'none');
					});

		var textResult = dashboardSvg.append('text')
			.classed('textPieData', true)
			.attr('x', 20)
			.attr('y', textOffsetY)
			.text(resultKey)
			.style('fill', 'hsl('+(hueDifference)+', 50%, 50%)')

		startAngle = endAngle;
		hueDifference = hueDifference + hueOffset;
		textOffsetY = textOffsetY + 30
	}
}