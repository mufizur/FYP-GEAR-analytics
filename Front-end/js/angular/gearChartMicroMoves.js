GEAR_CHART_MICRO_MOVES_SETTINGS = {
	'SVG_BACKGROUND'	 : '#e1e1e1',
	'SVG_MARGIN'		 : '0px',
	'TOOLTIP_WIDTH'		 : 150,
	'GREEN_COLOR'		 : '22,160,133',
	'YELLOW_COLOR'		 : '230,126,34',
	'RED_COLOR'			 : '192,57,43'
}

function gearChartMicroMoves(svgSquare, selectionClass, moves, moveType){
	var svgWidth  = svgSquare;
	var svgHeight = svgSquare;
	var moveId = moves['moveId'];
	var moveAngle = moves['angle'];
	var moveCalibration = moves['calibration'];
	var moveExpected = moves['expected'];
	var accuracy = 100 - ((Math.abs(moveCalibration - moveAngle) / 360) * 100)
	var angleColor = GEAR_CHART_MICRO_MOVES_SETTINGS['GREEN_COLOR'];

	if(accuracy < 40){
		angleColor = GEAR_CHART_MICRO_MOVES_SETTINGS['RED_COLOR']; //Poor

	} else if(accuracy >= 40 && accuracy < 80){
		angleColor = GEAR_CHART_MICRO_MOVES_SETTINGS['YELLOW_COLOR']; //Fair 

	} else if(accuracy >= 80){
		angleColor = GEAR_CHART_MICRO_MOVES_SETTINGS['GREEN_COLOR']; //Good
	}


	if (moveAngle < 0){
		moveAngle = moveAngle % 360;
	}

	var toolTipWidth   = GEAR_CHART_MICRO_MOVES_SETTINGS['TOOLTIP_WIDTH']
	var toolTip = d3.select('.'+selectionClass).append('div')
		.style({
			'position' : 'absolute', 
			'padding' : '5px 5px', 
			'background' : '#4f4f4f',
			'color' : '#ffffff',
			'width' : toolTipWidth+'px',
			'opacity' : 0.0				
		})

	var dashboardSvg = d3.select("."+selectionClass)
		.append("svg")
		.classed("svg_moves_"+moveId, true)
		.attr("width", '100%')
		.attr("height", '100%')
		.attr("viewBox", "0 0 "+svgWidth+" "+svgHeight)
		.attr("preserveAspectRation", "xMidYMid meet")
		.style({
			"background" : 'rgba('+angleColor+', 0.1)',
			"margin"     : GEAR_CHART_MICRO_MOVES_SETTINGS['SVG_MARGIN']
		});

	if(moveId == 1 || moveId == 5 || moveId == 6 || moveId == 7){
		var bodyHeight = svgSquare*0.4
		var bodyWidth  = svgSquare*0.15
		var armWidth   = bodyWidth/2;
		var armHeight  = bodyHeight * 0.8;

		var bodyRectangle = dashboardSvg.append('rect')
								.attr('x', svgSquare/2 - bodyWidth/2)
							 	.attr('y', svgSquare/2 - bodyHeight/3)
							 	.attr('width', bodyWidth)
							 	.attr('height', bodyHeight)
							 	.style({
									'fill': '#bdc3c7'
								})

		var bodyNosePath = ""
		bodyNosePath = bodyNosePath + 'M'+(svgSquare/2)+' '+(svgSquare/2  - bodyHeight/3 - svgWidth*0.02) + ' ';
		bodyNosePath = bodyNosePath + 'L'+(svgSquare/2)+' '+(svgSquare/2  - bodyHeight/3 - svgWidth*0.18) + ' ';
		bodyNosePath = bodyNosePath + 'L'+(svgSquare/2 + svgWidth*0.10)+' '+(svgSquare/2  - bodyHeight/3 - svgWidth*0.10);
		var bodyNose = dashboardSvg.append('path')
							.attr('d', bodyNosePath)
							.style({
								'fill' : '#bdc3c7'
							})

		var bodyHead = dashboardSvg.append('circle')
								.attr('cx', svgSquare/2)
								.attr('cy', svgSquare/2  - bodyHeight/3 - svgWidth*0.10)
								.attr('r', svgWidth*0.08)
								.style({
									'fill': '#ecf0f1'
								})

		var armJointCircle = dashboardSvg.append('circle')
								.attr('cx', svgSquare/2)
								.attr('cy', svgSquare/2)
								.attr('r', svgWidth*0.04)
								.style({
									'fill': '#d35400'
								})

		var markerAction = dashboardSvg.append('path')
					.attr('d', 'M'+(svgSquare/2)+' 0 L'+(svgSquare/2)+' '+svgSquare)
					.attr('transform', 'rotate('+(moveAngle*-1)+' '+(svgSquare/2)+' '+(svgSquare/2)+')')
					.style({
						'stroke': '#a1a1a1',
						'stroke-width' : '2px',
						'opacity' : 0.4
					});

		moveAngle = moveAngle * -1;
		var arm = dashboardSvg.append('rect')
					.attr('class', 'arm_'+moveId+' '+'arm_movement')
					.attr('x', svgSquare/2 - armWidth/2)
				 	.attr('y', svgSquare/2)
				 	.attr('width', armWidth)
				 	.attr('height', armHeight)
				 	.attr('transform', 'rotate('+moveAngle+' '+(svgSquare/2)+' '+(svgSquare/2)+')')
				 	.style({
						'fill': '#00000',
						'fill-opacity' : 0.3
					})
					.on('mouseover', function(d){
						d3.select(this).style('fill-opacity', 0.5);
						var toolTipHeader = "<div class = 'toolTipHeader'>Move "+(moveId)+"</div>";
						var toolTipValue  = "<div class = 'toolTipData'>ROM : "+(moveAngle * -1)+"°</div>";
						var toolTipHtml   = "<div class = 'toolTipHtml'>"+toolTipHeader+toolTipValue+"</div>";
						toolTip.html(toolTipHtml)
							.style({
								'left': ($(this).position().left - toolTipWidth/2)+'px',
								'top' : ($(this).position().top)+'px',
								'opacity' : 1,
								'display' : 'block'
							})
					})
					.on('mouseout', function(d){
						d3.select(this).style('fill-opacity', 0.3);
						toolTip.style('display', 'none');
					});
	
	} else if (moveId == 2 || moveId == 9){
		var bodyHeight = svgSquare*0.15
		var bodyWidth  = svgSquare*0.4
		var armWidth   = bodyWidth * 0.8;
		var armHeight  = bodyHeight / 2;

		var bodyRectangle = dashboardSvg.append('rect')
								.attr('x', svgSquare/2 - bodyWidth*0.7)
							 	.attr('y', svgSquare/2 - bodyHeight/2)
							 	.attr('width', bodyWidth)
							 	.attr('height', bodyHeight)
							 	.style({
									'fill': '#bdc3c7'
								})

		var bodyNosePath = ""
		bodyNosePath = bodyNosePath + 'M'+(svgSquare/2  + bodyWidth*0.55 - svgWidth*0.08)+' '+(svgSquare/2)+' ';
		bodyNosePath = bodyNosePath + 'L'+(svgSquare/2  + bodyWidth*0.55 + svgWidth*0.08)+' '+(svgSquare/2)+' ';
		bodyNosePath = bodyNosePath + 'L'+(svgSquare/2  + bodyWidth*0.55)+' '+(svgSquare/2 + svgWidth*0.10);
		var bodyNose = dashboardSvg.append('path')
							.attr('d', bodyNosePath)
							.style({
								'fill' : '#bdc3c7'
							})

		var bodyHead = dashboardSvg.append('circle')
								.attr('cx', svgSquare/2 + bodyWidth*0.55)
								.attr('cy', svgSquare/2)
								.attr('r', svgWidth*0.08)
								.style({
									'fill': '#ecf0f1'
								})

		var armJointCircle = dashboardSvg.append('circle')
								.attr('cx', svgSquare/2)
								.attr('cy', svgSquare/2)
								.attr('r', svgWidth*0.04)
								.style({
									'fill': '#d35400'
								})

		var markerAction = dashboardSvg.append('path')
					.attr('d', 'M'+(svgSquare/2)+' 0 L'+(svgSquare/2)+' '+svgSquare)
					.attr('transform', 'rotate('+(moveAngle*-1)+' '+(svgSquare/2)+' '+(svgSquare/2)+')')
					.style({
						'stroke': '#a1a1a1',
						'stroke-width' : '2px',
						'opacity' : 0.4
					});

		moveAngle = moveAngle * -1;
		var arm = dashboardSvg.append('rect')
								.attr('class', 'arm_'+moveId+' '+'arm_movement')
								.attr('x', svgSquare/2 - armHeight/2)
							 	.attr('y', svgSquare/2)
							 	.attr('width', armHeight)
							 	.attr('height', armWidth)
							 	.attr('transform', 'rotate('+moveAngle+' '+(svgSquare/2)+' '+(svgSquare/2)+')')
							 	.style({
									'fill': '#00000',
    								'fill-opacity' : 0.3
								})
								.on('mouseover', function(d){
									d3.select(this).style('fill-opacity', 0.5);
									var toolTipHeader = "<div class = 'toolTipHeader'>Move "+(moveId)+"</div>";
									var toolTipValue  = "<div class = 'toolTipData'>ROM : "+(moveAngle * -1)+"°</div>";
									var toolTipHtml   = "<div class = 'toolTipHtml'>"+toolTipHeader+toolTipValue+"</div>";
									toolTip.html(toolTipHtml)
										.style({
											'left': ($(this).position().left - toolTipWidth/2)+'px',
											'top' : ($(this).position().top)+'px',
											'opacity' : 1,
											'display' : 'block'
										})
								})
								.on('mouseout', function(d){
									d3.select(this).style('fill-opacity', 0.3);
									toolTip.style('display', 'none');
								});
	
	} else if (moveId == 3 || moveId == 4 || moveId == 8){
		moveAngle = moveAngle * -1;
		var microScale  = svgHeight / 3; 
		var armWidth    = svgWidth * 0.06;
		var armHeight   = microScale * 0.9;
		var torsoPath = "";
		torsoPath = torsoPath + "M"+(microScale * 1.0)+' '+(microScale * 1.0)+' ';
		torsoPath = torsoPath + "L"+(microScale * 2.0)+' '+(microScale * 1.0)+' ';
		torsoPath = torsoPath + "L"+(microScale * 1.8)+' '+(microScale * 2.0)+' ';
		torsoPath = torsoPath + "L"+(microScale * 1.2)+' '+(microScale * 2.0)+' ';
		torsoPath = torsoPath + "L"+(microScale * 1.0)+' '+(microScale * 1.0)+' ';
		console.log(torsoPath);

		var torso = dashboardSvg.append('path')
							.attr('d', torsoPath)
							.style({
								'fill' : '#bdc3c7'
							})

		var bodyHead = dashboardSvg.append('circle')
			.attr('cx', svgSquare/2)
			.attr('cy', microScale*0.70)
			.attr('r', svgWidth*0.08)
			.style({
				'fill': '#ecf0f1'
			})

		var armJointLeft = dashboardSvg.append('circle')
								.attr('cx', (microScale * 1.0))
								.attr('cy', (microScale * 1.0))
								.attr('r', svgWidth*0.03)
								.style({
									'fill': '#d35400'
								})

		var armJointRight = dashboardSvg.append('circle')
								.attr('cx', (microScale * 2.0))
								.attr('cy', (microScale * 1.0))
								.attr('r', svgWidth*0.03)
								.style({
									'fill': '#d35400'
								})

		var armLeft = dashboardSvg.append('rect')
						.attr('x', (microScale * 1.0) - armWidth/2)
						.attr('y', (microScale * 1.0))
						.attr('width',  armWidth)
						.attr('height', armHeight)
						.attr('transform', 'rotate('+moveAngle+' '+(microScale * 1.0)+' '+(microScale * 1.0)+')')
						.style({
							'fill': '#00000',
    						'fill-opacity' : 0.3
						})
						.on('mouseover', function(d){
							d3.select(this).style('fill-opacity', 0.5);
							var toolTipHeader = "<div class = 'toolTipHeader'>Move "+(moveId)+"</div>";
							var toolTipValue  = "<div class = 'toolTipData'>ROM : "+(moveAngle * -1)+"°</div>";
							var toolTipHtml   = "<div class = 'toolTipHtml'>"+toolTipHeader+toolTipValue+"</div>";
							toolTip.html(toolTipHtml)
								.style({
									'left': ($(".svg_moves_"+moveId).offset().left + $(".svg_moves_"+moveId).width()/2 - toolTipWidth/2)+'px',
									'top' : ($(".svg_moves_"+moveId).offset().top  + $(".svg_moves_"+moveId).height()*0.75)+'px',
									'opacity' : 1,
									'display' : 'block'
								})
						})
						.on('mouseout', function(d){
							d3.select(this).style('fill-opacity', 0.3);
							toolTip.style('display', 'none');
						});

		var leftMove = moveAngle;
		if (moveId == 4 || moveId == 8){
			leftMove = leftMove * -1;
		} 
		var armLeft = dashboardSvg.append('rect')
						.attr('x', (microScale * 2.0) - armWidth/2)
						.attr('y', (microScale * 1.0))
						.attr('width',  armWidth)
						.attr('height', armHeight)
						.attr('transform', 'rotate('+leftMove+' '+(microScale * 2.0)+' '+(microScale * 1.0)+')')
						.style({
							'fill': '#00000',
    						'fill-opacity' : 0.1
						})
	}

	var markerVertical = dashboardSvg.append('path')
						.attr('d', 'M'+(svgSquare/2)+' 0 L'+(svgSquare/2)+' '+svgSquare)
						.attr('stroke-dasharray', '2 2')
						.style({
							'stroke': '#a1a1a1',
							'stroke-width' : '2px',
							'opacity' : 0.4
						});

	var markerHorizontal = dashboardSvg.append('path')
						.attr('d', 'M0 '+(svgSquare/2)+' L'+(svgSquare)+' '+(svgSquare/2))
						.attr('stroke-dasharray', '2 2')
						.style({
							'stroke': '#a1a1a1',
							'stroke-width' : '2px',
							'opacity' : 0.4
						});

	var textBottom = dashboardSvg.append('text')
					.classed('textMicroData', true)
					.attr('x', svgWidth/2)
					.attr('y', svgHeight)
					.attr('width', svgWidth)
					.attr('text-anchor', 'middle')
					.text('0°')

	var textTop = dashboardSvg.append('text')
					.classed('textMicroData', true)
					.attr('x', svgWidth/2)
					.attr('y', 10)
					.attr('width', svgWidth)
					.attr('text-anchor', 'middle')
					.text('180°')

	var textLeft = dashboardSvg.append('text')
					.classed('textMicroData', true)
					.attr('x', 0)
					.attr('y', svgHeight/2)
					.attr('width', svgWidth)
					.text('270°')
	
	var textRight = dashboardSvg.append('text')
					.classed('textMicroData', true)
					.attr('x', svgWidth-20)
					.attr('y', svgHeight/2)
					.text('90°')

	var textResult = dashboardSvg.append('text')
			.classed('textMicroDataResult', true)
			.attr('x', 10)
			.attr('y', svgSquare - 60)
			.text((moveAngle*-1)+'°')
			.style('fill', 'rgb('+angleColor+')')

	var textResult = dashboardSvg.append('text')
			.classed('textMicroDataCalibration', true)
			.attr('x', 10)
			.attr('y', svgSquare - 40)
			.text('Ref : '+moveCalibration+'°')

	var textResult = dashboardSvg.append('text')
			.classed('textMicroExpected', true)
			.attr('x', 10)
			.attr('y', svgSquare - 20)
			.text('Ideal : '+moveExpected+'°')

	var textResult = dashboardSvg.append('text')
			.classed('textMicroDataResult', true)
			.attr('x', 10)
			.attr('y', 20)
			.text(parseInt(accuracy)+'%')
			.style('fill', 'rgb('+angleColor+')')

	var textResult = dashboardSvg.append('text')
			.classed('textMicroDataText', true)
			.attr('x', svgSquare-30)
			.attr('y', svgSquare-10)
			.text(moveType)
}