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
}

gearAppControllers.controller('dashboardController', ['$scope', '$http', '$location', function($scope, $http, $location) {
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
	$scope.showGroups = 0;
	$scope.groupName  = 'All'
	GLOBAL_OBJECTS['DOCTOR_ID'] = 1;
	getDoctorBasicDetails	($http, $scope, GLOBAL_OBJECTS['DOCTOR_ID']);

	//Overview Data
	getOverviewMacro ($http, $scope, GLOBAL_OBJECTS['DOCTOR_ID']);
	getOverviewData	($http, $scope, groupId = -1);
	getOverviewMacroGroups ($http, $scope);

	$scope.viewGroupData = function(groupId, groupName){
		getOverviewData	($http, $scope, groupId);
		$scope.groupName = groupName;
		$scope.showGroups = 0;
	}

	$scope.logout = function(){$location.path('login');}
	$scope.selectMenu = function(routeOption) {
		menuSelection(routeOption, CONSTANT_GLOBALS.OVERVIEW_ROUTE, $location);
	};
}]);

gearAppControllers.controller('PatientsController', ['$scope', '$http', '$location', function($scope, $http, $location) {
	setGlobalObjects($scope);
	$scope.showFeedback = 0;
	$scope.currSession  = 0;
	$scope.feedbacks = [];
	$scope.showSessionsList = 0;
	getDoctorBasicDetails($http, $scope, GLOBAL_OBJECTS['DOCTOR_ID']=1);
	getAllPatients($http, $scope, GLOBAL_OBJECTS['DOCTOR_ID'], 'patients');
	
	$scope.logout = function(){$location.path('login');}
	$scope.viewPatientPerformance = function(patientId, injuryId){
		$scope.currSession  = 0;
		$scope.feedbacks= [];
		$scope.showFeedback = 0;
		setGlobalObjectsPatients($scope, patientId, injuryId);
		getPatient($http, $scope, patientId);
	}
	$scope.updateSessionData = function(sessionIndex){
		getPatientMesoAccuracy($http, $scope, $scope.patientId, $scope.injuryId, sessionIndex)
		getPatientMesoDuration($http, $scope, $scope.patientId, $scope.injuryId, sessionIndex)
		getPatientMicroMoves  ($http, $scope, $scope.patientId, $scope.injuryId, sessionIndex)
		$scope.showSessionsList = 0;
	}
	$scope.postDoctorFeedback = function(feedback){
		postDoctorFeedback($http, $scope, $scope.doctorId, $scope.patientId, $scope.injuryId, feedback);
		var dateArr  = String(new Date()).split(" ")
		var date     = dateArr[0]+", "+dateArr[1]+" "+dateArr[2]+" "+dateArr[3] 
		$scope.feedbacks.push({
			'date' 	  : date, 
			'message' : feedback
		})
		$('.patientFeedbackInputBox').val('');
	}
	$scope.showDoctorFeedback = function(){
		$scope.showFeedback = 1;
		getDoctorFeedbacks($http, $scope, $scope.doctorId, $scope.patientId, $scope.injuryId);
	}
	$scope.selectMenu = function(routeOption) {
		menuSelection(routeOption, CONSTANT_GLOBALS.PATIENTS_ROUTE, $location);
	};
	
}]);

gearAppControllers.controller('SettingsController', ['$scope', '$http', '$location', function($scope, $http, $location) {
	setGlobalObjects($scope);
	getDoctorFullDetails($http, $scope, GLOBAL_OBJECTS['DOCTOR_ID']=1);
	getAllPatients($http, $scope, GLOBAL_OBJECTS['DOCTOR_ID'], 'patients');
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

//Doctors
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

function getDoctorFullDetails($http, $scope, doctorId){
	var doctorUrl = 'http://localhost:3000/api/doctors/'+doctorId+"?callback=JSON_CALLBACK";
	$http.jsonp(doctorUrl)
		.success(function(data){
		 	$scope.profileName = data['firstName'] + ' ' + data['lastName'];
		 	$scope.proifleImg  = data['imgId'];
		 	$scope.profileDetails = data;
		})
		.error(function(data){
		 	console.log("Error in loading doctor's data");
		})
		.finally(function(){
			console.log("doctor's data loaded");
		})
}


//Patients Information
function getAllPatients($http, $scope, doctorId, currPage){
	var allPatientsUrl = 'http://localhost:3000/api/doctors/1/patients?callback=JSON_CALLBACK';
	$http.jsonp(allPatientsUrl)
		 .success(function(data){
		 	$scope.patients = data['patients'];
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
	var maxSessionId = 0;
	var injuryId = 0;
	$http.jsonp(patientUrl)
		 .success(function(data){
		 	$scope.patientInfo = data['patient'];
		 	$scope.currSession = data['patient']['sessionsCompleted'];
		 	var injuryId = data['patient']['injuryId'];
		 	getPatientData($http, $scope, patientId, injuryId, $scope.currSession);
		 })
		 .error(function(){
		 	console.log("Error in loading patient data");
		 })
		 .finally(function(){
		 	console.log("patient data loaded");
		 })	
}

function getOverviewData($http, $scope, groupId){
	getOverviewMesoGender	($http, $scope, groupId); //Negative group id for all
	getOverviewMesoAge		($http, $scope, groupId); 
	getOverviewMesoFeedback	($http, $scope, groupId);
	getOverviewMesoAccuracy	($http, $scope, groupId);
	getOverviewMesoDuration	($http, $scope, groupId);
}

function getPatientData($http, $scope, patientId, injuryId, maxSessionId){
	getPatientSessions($http, $scope, patientId, injuryId);
	getPatientMacroAccuracy($http, $scope, patientId, injuryId)
	getPatientMacroDuration($http, $scope, patientId, injuryId)
	getPatientMacroFeedback($http, $scope, patientId, injuryId)
	getPatientMesoAccuracy($http, $scope, patientId, injuryId, maxSessionId)
	getPatientMesoDuration($http, $scope, patientId, injuryId, maxSessionId)
	getPatientMicroMoves($http, $scope, patientId, injuryId, maxSessionId)
}

//Overview Data
function getOverviewMacro($http, $scope, doctorId){
	var url = "http://localhost:3000/api/doctors/"+doctorId+"/overview/macro?callback=JSON_CALLBACK"
	$http.jsonp(url).success(function(data){
		$scope.totalPatients = data['totalPatients'];
		$scope.totalGroups   = data['totalGroups'];
		$scope.avgAccuracy   = data['avgAccuracy'];
		$scope.avgProgress   = data['avgProgress'];
	})
}

function getOverviewMacroGroups($http, $scope){
	var url = "http://localhost:3000/api/overview/groups?callback=JSON_CALLBACK"
	$http.jsonp(url).success(function(data){
		data.unshift({
			"injuryId": "-1", 
			"injuryName": "All", 
			"injuryDescription": ""
		});
		$scope.groups = data;
	})
}	

function getOverviewMesoGender($http, $scope, groupId){
	var url = "http://localhost:3000/api/overview/groups/"+groupId+"/gender?callback=JSON_CALLBACK"
	$http.jsonp(url).success(function(dataGender){
		$(".overviewMacroGeneralGender").empty();
		gearChartMesoPie(300, 600, dataGender, "overviewMacroGeneralGender", "Gender");
	})
}

function getOverviewMesoAge($http, $scope, groupId){
	var url = "http://localhost:3000/api/overview/groups/"+groupId+"/age?callback=JSON_CALLBACK"
	$http.jsonp(url).success(function(dataAge){
		$(".overviewMacroGeneralAge").empty();
		gearChartMesoPie(300, 600, dataAge, "overviewMacroGeneralAge", "Age")
	})
}

function getOverviewMesoFeedback($http, $scope, groupId){
	var url = "http://localhost:3000/api/overview/groups/"+groupId+"/feedback?callback=JSON_CALLBACK"
	$http.jsonp(url).success(function(dataFeedback){
		$(".overviewMacroGeneralSubjective").empty();
		gearChartMesoStack(300, 600, dataFeedback, "overviewMacroGeneralSubjective", "Feedback");
	})
}

function getOverviewMesoAccuracy($http, $scope, groupId){
	var url = "http://localhost:3000/api/overview/groups/"+groupId+"/accuracy?callback=JSON_CALLBACK"
	$http.jsonp(url).success(function(dataAccuracy){
		$(".overviewMacroObjectiveAccuracy").empty();
		gearChartMicroBinaryBar(300, 600, dataAccuracy, "overviewMacroObjectiveAccuracy", "Recovery", "%", hueIndex=2);
	})
}

function getOverviewMesoDuration($http, $scope, groupId){
	var url = "http://localhost:3000/api/overview/groups/"+groupId+"/duration?callback=JSON_CALLBACK"
	$http.jsonp(url).success(function(dataDuration){
		$(".overviewMacroObjectiveTime").empty();
		gearChartMicroBinaryBar(300, 600, dataDuration, "overviewMacroObjectiveTime", "Duration", "s", hueIndex=3);
	})
}

//Patient Data
function getPatientSessions($http, $scope, patientId, injuryId){
	var url = "http://localhost:3000/api/patients/"+patientId+"/injury/"+injuryId+"/sessions?callback=JSON_CALLBACK";
	$http.jsonp(url).success(function(dataSessions){
		$scope.dataSessions = dataSessions['sessions'];
	})
}

function getPatientMacroAccuracy($http, $scope, patientId, injuryId){
	var url = "http://localhost:3000/api/patients/"+patientId+"/injury/"+injuryId+"/macro/accuracy?callback=JSON_CALLBACK"
	$http.jsonp(url).success(function(dataAccuracy){
		$(".patientDataMacroAccuracy").empty();
		gearChartMesoBar(300, 600, dataAccuracy, "patientDataMacroAccuracy", "Accuracy", "%", hueIndex=0);
	})
}

function getPatientMacroDuration($http, $scope, patientId, injuryId){
	var url = "http://localhost:3000/api/patients/"+patientId+"/injury/"+injuryId+"/macro/duration?callback=JSON_CALLBACK"
	$http.jsonp(url).success(function(dataDuration){
		$(".patientDataMacroTime").empty();
		gearChartMesoBar(300, 600, dataDuration, "patientDataMacroTime", "Duration", "s", hueIndex=1);
	})
}

function getPatientMacroFeedback($http, $scope, patientId, injuryId){
	var url = "http://localhost:3000/api/patients/"+patientId+"/injury/"+injuryId+"/macro/feedback?callback=JSON_CALLBACK"
	$http.jsonp(url).success(function(dataFeedback){
		$(".patientDataMacroFeedback").empty();
		gearChartMesoStack(300, 600, dataFeedback, "patientDataMacroFeedback", "Feedback");	
	})
}

function getPatientMesoAccuracy($http, $scope, patientId, injuryId, maxSessionId){
	var url = "http://localhost:3000/api/patients/"+patientId+"/injury/"+injuryId+"/session/"+maxSessionId+"/meso/accuracy?callback=JSON_CALLBACK";
	$http.jsonp(url).success(function(dataAccuracy){
		$(".patientDataMesoAccuracy").empty();
		gearChartMicroBinaryBar(300, 600, dataAccuracy, "patientDataMesoAccuracy", "Recovery", "%", hueIndex=0);
	})
}

function getPatientMesoDuration($http, $scope, patientId, injuryId, maxSessionId){
	var url = "http://localhost:3000/api/patients/"+patientId+"/injury/"+injuryId+"/session/"+maxSessionId+"/meso/duration?callback=JSON_CALLBACK";
	$http.jsonp(url).success(function(dataDuration){
		$(".patientDataMesoTime").empty();
		gearChartMicroBinaryBar(300, 600, dataDuration, "patientDataMesoTime", "Duration", "s", hueIndex=1);
	})
}

function getPatientMicroMoves($http, $scope, patientId, injuryId, maxSessionId){
	var url = "http://localhost:3000/api/patients/"+patientId+"/injury/"+injuryId+"/session/"+maxSessionId+"/micro/moves?callback=JSON_CALLBACK";
	$http.jsonp(url).success(function(dataMoves){
		$scope.microMoves = dataMoves;
		for(moveIndex=0; moveIndex<dataMoves['results'].length; moveIndex++){
			var moveId = moveIndex + 1;
			var moveDataStart = dataMoves['start']['L'+moveId];
			var moveDataEnd   = dataMoves['end']['L'+moveId];
			var startDiv = "patientDataMicroMove_"+moveId+"_start";
			var endDiv   = "patientDataMicroMove_"+moveId+"_end";
			$("."+startDiv).empty();
			$("."+endDiv).empty();

			gearChartMicroMoves(200, startDiv, moveDataStart, 'Start');
			gearChartMicroMoves(200, endDiv,   moveDataEnd,    'end');
		}

	})
}

//Doctor Feedback
function postDoctorFeedback($http, $scope, doctorId, patientId, injuryId, feedback){
	var url = "http://localhost:3000/api//doctors/"+doctorId+"/patients/"+patientId+"/injury/"+injuryId+"/post/feedback?callback=JSON_CALLBACK&doctorFeedback="+feedback;
	$http.jsonp(url).success(function(response){
		console.log("Feedback added")
	})
}

function getDoctorFeedbacks($http, $scope, doctorId, patientId, injuryId){
	var url = "http://localhost:3000/api//doctors/"+doctorId+"/patients/"+patientId+"/injury/"+injuryId+"/get/feedbacks?callback=JSON_CALLBACK";
	$http.jsonp(url).success(function(dataFeedback){
		$scope.feedbacks = dataFeedback;
		console.log(dataFeedback);
	})
}

function setGlobalObjectsPatients($scope, patientId, injuryId){
	GLOBAL_OBJECTS['PATIENT_ID'] = patientId;
	GLOBAL_OBJECTS['INJURY_ID']  = injuryId;
	setGlobalObjects($scope);
}

function setGlobalObjects($scope){
	$scope.doctorId  = GLOBAL_OBJECTS['DOCTOR_ID'];
	$scope.patientId = GLOBAL_OBJECTS['PATIENT_ID'];
	$scope.injuryId  = GLOBAL_OBJECTS['INJURY_ID'];
}