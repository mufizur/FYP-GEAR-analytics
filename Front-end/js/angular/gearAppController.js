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

gearAppControllers.controller('dashboardController', ['$scope', '$http', '$location', function($scope, $http, $location) {
	var moves = {
		'moveId'  : 1,
		'angle'   : 45
	}
	gearChartMicroMoves(200, 'dashboard', moves);	

	var moves = {
		'moveId'  : 2,
		'angle'   : 45
	}
	gearChartMicroMoves(200, 'dashboard', moves);

	var moves = {
		'moveId'  : 3,
		'angle'   : 45
	}
	gearChartMicroMoves(200, 'dashboard', moves);
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
	getDoctorBasicDetails($http, $scope, GLOBAL_OBJECTS['DOCTOR_ID']=1);
	getAllPatients($http, $scope, GLOBAL_OBJECTS['DOCTOR_ID'], 'overview');
	getPatientsAverageData($http, $scope, GLOBAL_OBJECTS['DOCTOR_ID']);
	$scope.logout = function(){$location.path('login');}
	$scope.selectMenu = function(routeOption) {
		menuSelection(routeOption, CONSTANT_GLOBALS.OVERVIEW_ROUTE, $location);
	};
}]);

gearAppControllers.controller('PatientsController', ['$scope', '$http', '$location', function($scope, $http, $location) {
	getDoctorBasicDetails($http, $scope, GLOBAL_OBJECTS['DOCTOR_ID']=1);
	getAllPatients($http, $scope, GLOBAL_OBJECTS['DOCTOR_ID'], 'patients');
	$scope.logout = function(){$location.path('login');}

	$scope.viewPatientPerformance = function(patientId, injuryId){
		setGlobalObjectsPatients($scope, patientId, injuryId, 1, 1, 1);
		getPatient($http, $scope, patientId);
		//getPatientSessions($http, $scope, patientId, injuryId);
		//getPatientSessionLevels($http, $scope, patientId, injuryId, 1);
		//getPatientSessionLevelActions($http, $scope, patientId, injuryId, 1, 1);
		//getPatientSessionLevelActionMovement($http, $scope, patientId, injuryId, 1, 1, 1);
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

function addGraphs(){
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
	gearChartMicroBinaryBar(300, 600, dataLevels, "patientDataMesoAccuracy", "Recovery", "%", hueIndex=0);
	gearChartMicroBinaryBar(300, 600, dataLevels, "patientDataMesoTime", "Duration", "ms", hueIndex=1);
	gearChartMesoStack(300, 600, dataFeedback, "patientDataMacroFeedback", "Feedback");	
	gearChartMesoBar(300, 600, dataRecovery, "patientDataMacroAccuracy", "Accuracy", "%",  hueIndex=0);	
	gearChartMesoBar(300, 600, dataDuration, "patientDataMacroTime", "Duration", "ms", hueIndex=1);
}

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
		 	console.log("Error in authentication");
		})
		.finally(function(){
			console.log("Authentication Successful");
		})
}

function getDoctorBasicDetails($http, $scope, doctorId){
	var doctorUrl = 'http://localhost:3000/api/doctors/basic/'+doctorId+"?callback=JSON_CALLBACK";
	$http.jsonp(doctorUrl)
		.success(function(data){
		 	$scope.profileName = data['firstName'] + ' ' + data['lastName'];
		 	$scope.proifleImg  = data['imgId'];
		})
		.error(function(data){
		 	console.log("Error in loading doctor's data");
		})
		.finally(function(){
			console.log("doctor's data loaded");
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
		 	//patientOverallGraph(currPage, data['patients'], $http, $scope);
		 	console.log(data['patients']);
		 })
		 .error(function(){
		 	console.log("Error in loading patients data");
		 })
		 .finally(function(){
		 	console.log("patients data loaded");
		 	addGraphs();
		 })
}

function getPatient($http, $scope, patientId){
	var patientUrl = "http://localhost:3000/api/patients/" + patientId + '?callback=JSON_CALLBACK';
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