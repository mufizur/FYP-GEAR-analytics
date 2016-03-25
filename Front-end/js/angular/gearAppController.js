var gearAppControllers = angular.module('gearAppControllers', []);
var CONSTANT_GLOBALS = {
	'OVERVIEW_ROUTE' : 'overview',
	'PATIENTS_ROUTE' : 'patients',
	'SETTINGS_ROUTE' : 'settings',
	'LOGIN_ROUTE'    : 'login', 
}

var GLOBAL_OBJECTS = {
	'DOCTOR_ID ' : '-1',
	'PATIENT_ID' : '-1',
	'INJURY_ID'  : '-1',
	'SESSION_ID' : '1',
	'LEVEL_ID'	 : '1',
	'ACTION_ID'	 : '1'
}

gearAppControllers.controller('DashboardController', ['$scope', '$http', '$location', function($scope, $http, $location) {
	var dataRecovery = {
		'upperBound' : 100,
		'results' : ['S1',  'S2'],
		'S1'  : [65.01, 86.34, 87.89],
		'S2'  : [92.34, 91.33, 100.00]
	}

	var dataDuration = {
		'upperBound' : 900.00,
		'results' : ['S1',  'S2'],
		'S1'  : [100.45, 10.00, 46.67],
		'S2'  : [300.45, 900.00, 100.00]
	}

	var dataFeedback = {
		'upperBound' : 10,
		'results' : ['S1', 'S2'], 
		'fields'  : ['Relief', 'Strength', 'Rom'],
		'Relief'  : {
			'S1'  : [2,3,4],
			'S2'  : [10,5,6]
		},
		'Strength' : {
			'S1' : [5,8,9],
			'S2' : [10,10,9]
		},
		'Rom' : {
			'S1' : [9,9,9],
			'S2' : [10,9,9]
		}
	}

	var dataLevels = {
		'upperBound' : 100,
		'results' : ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8', 'L9'],
		'dataTags': ['Start', 'End'],
		'L1' : [10.00, 12.00],
		'L2' : [14.00, 16.00],
		'L3' : [18.00, 20.00],
		'L4' : [22.00, 24.00],
		'L5' : [26.00, 28.00],
		'L6' : [30.00, 32.00],
		'L7' : [40.00, 50.00],
		'L8' : [60.00, 70.00],
		'L9' : [20.00, 100.00]
	}
	var selectionClass = "dashboard";
	gearChartMicroBinaryBar(300, 600, dataLevels, selectionClass, "Recovery", "%");
	gearChartMesoStack(300, 600, dataFeedback, selectionClass, "Feedback");	
	gearChartMesoBar(300, 600, dataRecovery, selectionClass, "Accuracy", "%",  hueIndex=0);	
	gearChartMesoBar(300, 600, dataDuration, selectionClass, "Duration", "ms", hueIndex=1);
	
}]);

gearAppControllers.controller('LoginController',   ['$scope', '$http', '$location', function($scope, $http, $location) {
	$scope.login = function(user){
		var username = user.username;
		var password = user.password;
		authenticateDoctors($http, $scope, $location, username, password);
	}
}]);

gearAppControllers.controller('OverviewController', ['$scope', '$http', '$location', function($scope, $http, $location) {
	setGlobalObjects($scope);
	getAllPatients($http, $scope, GLOBAL_OBJECTS['DOCTOR_ID'], 'overview');
	getPatientsAverageData($http, $scope, GLOBAL_OBJECTS['DOCTOR_ID']);
	$scope.logout = function(){$location.path('login');}
	$scope.selectMenu = function(routeOption) {
		menuSelection(routeOption, CONSTANT_GLOBALS.OVERVIEW_ROUTE, $location);
	};
}]);

gearAppControllers.controller('PatientsController', ['$scope', '$http', '$location', function($scope, $http, $location) {
	getAllPatients($http, $scope, GLOBAL_OBJECTS['DOCTOR_ID'], 'patients');
	$scope.logout = function(){$location.path('login');}

	$scope.viewPatientPerformance = function(patientId, injuryId){
		setGlobalObjectsPatients($scope, patientId, injuryId, 1, 1, 1);
		getPatient($http, $scope, patientId);
		getPatientSessions($http, $scope, patientId, injuryId);
		getPatientSessionLevels($http, $scope, patientId, injuryId, 1);
		getPatientSessionLevelActions($http, $scope, patientId, injuryId, 1, 1);
		getPatientSessionLevelActionMovement($http, $scope, patientId, injuryId, 1, 1, 1);
	}
	$scope.selectMenu = function(routeOption) {
		menuSelection(routeOption, CONSTANT_GLOBALS.PATIENTS_ROUTE, $location);
	};
	
}]);

gearAppControllers.controller('SettingsController', ['$scope', '$http', '$location', function($scope, $http, $location) {
	$scope.logout = function(){$location.path('login');}
	$scope.selectMenu = function(routeOption) {
		menuSelection(routeOption, CONSTANT_GLOBALS.SETTINGS_ROUTE, $location);
	};
}]);



function menuSelection(routeSelected, currentRoute, $location){
	if (routeSelected != currentRoute){
		$location.path(routeSelected);
	}
}

function authenticateDoctors($http, $scope, $location, username, password){
	var loginUrl = 'http://localhost:3000/api/authenticate/doctors/'+username+'/'+password+"?callback=JSON_CALLBACK";
	$http.jsonp(loginUrl)
		.success(function(data){
		 	if (data.doctorId != -1){ //Authenticated
		 		GLOBAL_OBJECTS['DOCTOR_ID'] = data.doctorId;
		 		$location.path('overview');
		 	}
		})
		.error(function(data){
		 	console.log("Error in loading patients data");
		})
		.finally(function(){
			console.log("patients data loaded");
		})
}

function getPatientsAverageData($http, $scope, doctorId){
	var averageDataUrl = 'http://localhost:3000/api/doctors/1/patients/averageData?callback=JSON_CALLBACK';
	$http.jsonp(averageDataUrl)
		 .success(function(data){
		 	var averageData = data['averageData'];
		 	$scope.totalPatients 	= averageData['totalPatients'];
		 	$scope.averageRecovery	= averageData['averageRecovery'];
		 	$scope.averageProgress	= averageData['averageProgress'];
		 	$scope.averageBMI		= averageData['averageBMI'];
		 })
		 .error(function(){
		 	console.log("Error in loading patients average data");
		 })
		 .finally(function(){
		 	console.log("patients average data loaded");
		 })
}

function getAllPatients($http, $scope, doctorId, currPage){
	var allPatientsUrl = 'http://localhost:3000/api/doctors/1/patients?callback=JSON_CALLBACK';
	$http.jsonp(allPatientsUrl)
		 .success(function(data){
		 	$scope.patients = data['patients'];
		 	patientOverallGraph(currPage, data['patients'], $http, $scope);
		 	console.log(data['patients']);
		 })
		 .error(function(){
		 	console.log("Error in loading patients data");
		 })
		 .finally(function(){
		 	console.log("patients data loaded");
		 })
}

function getPatient($http, $scope, patientId){
	var patientUrl = "http://localhost:3000/api/patients/" + patientId + '?callback=JSON_CALLBACK';
	console.log(patientUrl);
	$http.jsonp(patientUrl)
		 .success(function(data){
		 	$scope.patientInfo = data['patient'];
		 })
		 .error(function(){
		 	console.log("Error in loading patient data");
		 })
		 .finally(function(){
		 	console.log("patient data loaded");
		 })	
}

function getPatientSessions($http, $scope, patientId, injuryId){
	patientSessionUrl = "http://localhost:3000/api/patients/" + patientId + '/injury/'+injuryId+'/sessions?callback=JSON_CALLBACK';
	console.log(patientSessionUrl);
	$http.jsonp(patientSessionUrl)
		 .success(function(data){
		 	$scope.sessions = data['sessions'];
		 	appendChart(data['sessions'], '#patient-sessions-chart', $http, $scope);
		 	console.log(data['sessions']);
		 })
		 .error(function(){
		 	console.log("Error in loading patient session data");
		 })
		 .finally(function(data){
		 	console.log("patient session loaded");
		 })		
}

function getPatientSessionLevels($http, $scope, patientId, injuryId, sessionId){
	patientSessionLevelsUrl = "http://localhost:3000/api/patients/" + patientId + '/injury/'+injuryId+'/sessions/'+sessionId+'/levels?callback=JSON_CALLBACK';
	$http.jsonp(patientSessionLevelsUrl)
		 .success(function(data){
		 	$scope.levels = data['levels'];
		 	appendChart(data['levels'], '#patient-levels-chart', $http, $scope);
		 	console.log(data['levels'])
		 })
		 .error(function(){
		 	console.log("Error in loading patient level data");
		 })
		 .finally(function(){
		 	console.log("patient level data loaded");
		 })	
}

function getPatientSessionLevelActions($http, $scope, patientId, injuryId, sessionId, levelId){
	patientSessionLevelActionsUrl = "http://localhost:3000/api/patients/"+patientId+"/injury/"+injuryId+"/sessions/"+sessionId+"/levels/"+levelId+"/actions?callback=JSON_CALLBACK";
	$http.jsonp(patientSessionLevelActionsUrl)
		 .success(function(data){
		 	$scope.actions = data['actions'];
		 	appendBarChart(data['actions'], '#patient-actions-chart', $http, $scope);
		 	console.log(data['actions']);
		 })
		 .error(function(){
		 	console.log("Error in loading patient action data");
		 })
		 .finally(function(){
		 	console.log("patient action data loaded");
		 })	
}

function getPatientSessionLevelActionMovement($http, $scope, patientId, injuryId, sessionId, levelId, actionId){
	patientSessionLevelActionMovementUrl = "http://localhost:3000/api/patients/"+patientId+"/injury/"+injuryId+"/sessions/"+sessionId+"/levels/"+levelId+"/actions/"+actionId+"?callback=JSON_CALLBACK";
	$http.jsonp(patientSessionLevelActionMovementUrl)
	 .success(function(data){
	 	$scope.movementStart = data['movement'][0];
	 	$scope.movementEnd   = data['movement'][1];
	 })
	 .error(function(){
	 	console.log("Error in loading patient movement data");
	 })
	 .finally(function(){
	 	console.log("patient movement data loaded");
	 })	
}

function patientOverallGraph(currPage, patients, $http, $scope){ 
	if (currPage == "overview"){
		var data = getSummaryOverviewData(patients);
		appendChart(data, '#overview-overall-chart', $http, $scope);
	}
}

function getSummaryOverviewData(patients){
	allData = [];
	for (patientIndex=0; patientIndex < patients.length; patientIndex++){
		data = {
			"recovery" : "",
			"progress" : ""
		}
		data['recovery'] = patients[patientIndex]['ROMrecovery']
		data['progress'] = parseInt((patients[patientIndex]['sessionsCompleted'] / patients[patientIndex]['totalSessions']) * 100)
		allData.push(data);
	}

	return allData.sort(sortByProgress);
}

function sortByProgress(a, b){
	var aProgress = a.progress;
	var bProgress = b.progress;
	return ((aProgress < bProgress) ? -1 : ((aProgress > bProgress) ? 1 : 0));
}

//appendChart(data, '#overview-overall-chart')
//#patient-sessions-chart
//#patient-levels-chart

function appendChart(data, divName, $http, $scope){
	$(divName).empty();
	var labelsArr = [];
	var seriesArr = [];

	for (dataIndex = 0; dataIndex < data.length; dataIndex++){
		labelData  = getLabelData(divName,  data[dataIndex], dataIndex)
		seriesData = getSeriesData(divName, data[dataIndex], dataIndex); 
		labelsArr.push(labelData);
		seriesArr.push(seriesData)
	}

	console.log(labelsArr);
	console.log(seriesArr);

	var chart = new Chartist.Line(divName, {
	  labels: labelsArr,
	  series: [seriesArr]
	}, {
		high:100,
		low: 0,
		showPoint: true, 
		showLine : true,
		showArea : true,
		fullWidth: true 
	});

	chart.on('draw', function(data) {
	if(data.type === 'line' || data.type === 'area') {
	    data.element.animate({
	      d: {
	        begin: 2000 * data.index,
	        dur: 2000,
	        from: data.path.clone().scale(1, 0).translate(0, data.chartRect.height()).stringify(),
	        to: data.path.clone().stringify(),
	        easing: Chartist.Svg.Easing.easeOutQuint
	      }
	    });
	  }
	});

	var $chart = $(divName);
	var $toolTip = $chart.append('<div class="toolTip"></div>').find('.toolTip').hide();

	$chart.on('mouseenter', '.ct-point', function(){
		var $point = $(this);
		value = $point.attr('ct:value').split(',')[1];
		$toolTip.html('Recovery(%):<br>' + value).show();
	});

	$chart.on('mouseleave', '.ct-point', function(){
		$toolTip.hide();
	});

	$chart.on('mousemove', function(event) {
	  leftOffset = event.clientX - 200 + 'px';
	  topOffset  = event.clientY - 200 + 'px';
	  $toolTip.css({
	    "left" : leftOffset,
	    "top"  : topOffset
	  });
	});

	$chart.on('click', '.ct-point', function(){
		var value = $(this).attr('ct:value').split(',')[0];
		updateCharts($http, $scope, value, divName);
	});

}

function getLabelData(divName, dataPoint, dataIndex){
	labelData = "";
	if (divName == "#overview-overall-chart"){
		labelData = dataPoint['progress'];
	
	} else if (divName == "#patient-sessions-chart"){
		labelData = dataPoint['sessionId'];

	} else if (divName == "#patient-levels-chart"){
		labelData = dataPoint['levelId'];

	}
	return labelData;
}

function getSeriesData(divName, dataPoint, dataIndex){
	seriesData = "";
	if (divName == "#overview-overall-chart"){
		seriesData = {
			'x' : (dataIndex+1), 
			'y' : dataPoint['recovery']
		};
	
	} else if (divName == "#patient-sessions-chart"){
		seriesData = {
			'x' : (dataIndex+1), 
			'y' : dataPoint['sessionComplete']
		};

	} else if (divName == "#patient-levels-chart"){
		seriesData = {
			'x' : (dataIndex+1), 
			'y' : dataPoint['levelComplete']
		};

	}
	return seriesData;
}

//appendBarChart(data['actions'], '#patient-actions-chart', $http, $scope);
function appendBarChart(actions, divName, $http, $scope){
	$(divName).empty();
	labelsArr      = [];
	seriesStartArr = [];
	seriesEndArr   = [];

	for(actionIndex=0; actionIndex < actions.length; actionIndex++){
		action = actions[actionIndex];
		if (action['actionType'] == 0){ //start action
			seriesStartArr.push(action['actionComplete']);
			labelsArr.push(action['actionId']);

		} else if (action['actionType'] == 1){ //end action
			seriesEndArr.push(action['actionComplete']);
		}
	}

	var data = {
		labels : labelsArr,
		series : [seriesStartArr, seriesEndArr]
	};

	var options = {
		high:100,
		low:0,
		seriesBarDistance : 20
	};

	var barChart = new Chartist.Bar(divName, data, options);

	var $barChart = $(divName);
	var $toolTip  = $barChart.append('<div class="toolTip"></div>').find('.toolTip').hide();

	$barChart.on('mouseenter', '.ct-bar', function(){
		var $point = $(this);
		value = $point.attr('ct:value');
		$toolTip.html('Recovery(%):<br>' + value).show();
	});

	$barChart.on('mouseleave', '.ct-bar', function(){
		$toolTip.hide();
	});

	$barChart.on('mousemove', function(event) {
	  leftOffset = event.clientX - 200 + 'px';
	  topOffset  = event.clientY - 200 + 'px';
	  $toolTip.css({
	    "left" : leftOffset,
	    "top"  : topOffset
	  });
	});

	$barChart.on('click', '.ct-bar', function(){
		var element = $(this);
		var movementIndex = element.index() + ((GLOBAL_OBJECTS['LEVEL_ID']-1) * 3) + 1;
		updateCharts($http, $scope, movementIndex, divName);
	});
}


function updateCharts($http, $scope, value, divName){
	if (divName == "#patient-sessions-chart"){ //click sessions to get level information
		setGlobalObjectsPatients($scope, 
								 GLOBAL_OBJECTS['PATIENT_ID'], 
								 GLOBAL_OBJECTS['INJURY_ID'],
								 value, 1, 1);
		getPatientSessionLevels($http, $scope, GLOBAL_OBJECTS['PATIENT_ID'], GLOBAL_OBJECTS['INJURY_ID'], value);
		getPatientSessionLevelActions($http, $scope, GLOBAL_OBJECTS['PATIENT_ID'], GLOBAL_OBJECTS['INJURY_ID'], GLOBAL_OBJECTS['SESSION_ID'], GLOBAL_OBJECTS['LEVEL_ID'])
		getPatientSessionLevelActionMovement($http, $scope, GLOBAL_OBJECTS['PATIENT_ID'], GLOBAL_OBJECTS['INJURY_ID'], 
															GLOBAL_OBJECTS['SESSION_ID'], GLOBAL_OBJECTS['LEVEL_ID'], GLOBAL_OBJECTS['ACTION_ID']);
	} else if (divName == "#patient-levels-chart"){
		var actionValue = 1 + ((parseInt(value) -1) * 3);
		setGlobalObjectsPatients($scope, 
						 GLOBAL_OBJECTS['PATIENT_ID'], 
						 GLOBAL_OBJECTS['INJURY_ID'],
						 GLOBAL_OBJECTS['SESSION_ID'], value, actionValue);

		getPatientSessionLevelActions($http, $scope, GLOBAL_OBJECTS['PATIENT_ID'], GLOBAL_OBJECTS['INJURY_ID'], GLOBAL_OBJECTS['SESSION_ID'], value)
		getPatientSessionLevelActionMovement($http, $scope, GLOBAL_OBJECTS['PATIENT_ID'], GLOBAL_OBJECTS['INJURY_ID'], 
															GLOBAL_OBJECTS['SESSION_ID'], GLOBAL_OBJECTS['LEVEL_ID'], GLOBAL_OBJECTS['ACTION_ID']);
	} else if (divName == "#patient-actions-chart"){
		setGlobalObjectsPatients($scope, 
						 GLOBAL_OBJECTS['PATIENT_ID'], 
						 GLOBAL_OBJECTS['INJURY_ID'],
						 GLOBAL_OBJECTS['SESSION_ID'], 
						 GLOBAL_OBJECTS['LEVEL_ID'], value);

		getPatientSessionLevelActionMovement($http, $scope, GLOBAL_OBJECTS['PATIENT_ID'], GLOBAL_OBJECTS['INJURY_ID'], 
															GLOBAL_OBJECTS['SESSION_ID'], GLOBAL_OBJECTS['LEVEL_ID'], value);

	} 
}

function setGlobalObjects($scope){
	$scope.doctorId  = GLOBAL_OBJECTS['DOCTOR_ID'];
	$scope.patientId = GLOBAL_OBJECTS['PATIENT_ID'];
	$scope.injuryId  = GLOBAL_OBJECTS['INJURY_ID'];
	$scope.sessionId = GLOBAL_OBJECTS['SESSION_ID'];
	$scope.levelId   = GLOBAL_OBJECTS['LEVEL_ID'];
	$scope.actionId  = GLOBAL_OBJECTS['ACTION_ID'];
}

function setGlobalObjectsPatients($scope, patientId, injuryId, sectionId, levelId, actionId){
	GLOBAL_OBJECTS['PATIENT_ID'] = patientId;
	GLOBAL_OBJECTS['INJURY_ID']  = injuryId;
	GLOBAL_OBJECTS['SESSION_ID'] = sectionId;
	GLOBAL_OBJECTS['LEVEL_ID']   = levelId;
	GLOBAL_OBJECTS['ACTION_ID']  = actionId;
	setGlobalObjects($scope);
}