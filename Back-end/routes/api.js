var express = require('express');
var mysql   = require('mysql');
var router  = express.Router();


var databaseConnection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'rehabilitation'
});

databaseConnection.connect();

/*
router.get('/users', function(req, res, next) {
  res.send('respond with a resource');
});*/

router.route('/authenticate/doctors/:email/:hashpassword')
	.get(function(req, res){
		var doctorId = "-1";
		var selectTable    = "doctors";
		var selectParams   = "DoctorId";
		var filterPassword = "hashpassword = '" + req.params.hashpassword + "'";
		var filterEmail    = "email = '" + req.params.email + "'";
		var sqlQuery = 'SELECT ' + selectParams + ' FROM ' + selectTable + ' WHERE ' + filterPassword + ' AND ' + filterEmail;
		databaseConnection.query(sqlQuery, function(err, result){
			doctorId = result[0]['DoctorId'];
			res.jsonp({"doctorId" : doctorId});
		});
	});

router.route('/doctors/:doctorId/patients')
	.get(function(req, res){
		
		var patients = [];
		var selectTable  = "patientinjruy as A, injuries as B, patients as C"
		var selectPatientInjury  = "A.PatientId, A.InjuryId, A.patientInjuryDescription, B.injuryName, B.injuryDescription";
		var selectPatientDetials = "C.FirstName, C.LastName, C.Email, C.age, C.gender, C.registrationDate, C.patientImgId, C.totalSessions, C.sessionsCompleted, C.ROMrecovery, C.height, C.weight" 
		var filterDoctor  = "C.DoctorId = " + req.params.doctorId;
		var joinCondition = "A.InjuryId = B.InjuryId and C.PatientId = A.PatientId";
		var sqlQuery = 'SELECT ' + selectPatientInjury + ' , ' + selectPatientDetials + ' FROM ' + selectTable + ' WHERE ' + filterDoctor + ' AND ' + joinCondition;
		
		databaseConnection.query(sqlQuery, function(err, result){
			
			for(patientIndex = 0; patientIndex < result.length; patientIndex++){
				var patientInjuryDescription = "";
				if (result[patientIndex]['patientInjuryDescription'] != ''){
					patientInjuryDescription = result[patientIndex]['patientInjuryDescription'];
				} else {
					patientInjuryDescription = result[patientIndex]['injuryDescription'];
				}

				patient = {
					'patientId'	 		: result[patientIndex]['PatientId'],
					'injuryId'			: result[patientIndex]['InjuryId'],
					'injuryDescription' : patientInjuryDescription,
					'injuryName'		: result[patientIndex]['injuryName'],
					'firstName' 		: result[patientIndex]['FirstName'],
					'lastName'   		: result[patientIndex]['LastName'],
					'email'		 		: result[patientIndex]['Email'],
					'age'				: result[patientIndex]['age'],
					'gender'			: result[patientIndex]['gender'],
					'registrationDate'	: result[patientIndex]['registrationDate'],
					'patientImgId'		: result[patientIndex]['patientImgId'],
					'totalSessions'		: result[patientIndex]['totalSessions'],
					'sessionsCompleted'	: result[patientIndex]['sessionsCompleted'],
					'ROMrecovery'		: result[patientIndex]['ROMrecovery'],
					'height'			: result[patientIndex]['height'],
					'weight'			: result[patientIndex]['weight'],
					'patientPogress'    : ((result[patientIndex]['sessionsCompleted'] / result[patientIndex]['totalSessions']) * 100).toFixed(2)
				}
				patients.push(patient)
			}
			res.jsonp({"patients" : patients});
		});
	});

router.route('/doctors/:doctorId/patients/averageData')
	.get(function(req, res){
		
		var averageData = {
			'totalPatients'   : '',
			'averageProgress' : '',
			'averageRecovery' : '',
			'averageBMI'	  : ''
		};

		var selectTable  = "patients"
		var selectParams = "COUNT(*) as totalPatients, AVG(sessionsCompleted) / AVG(totalSessions) as AVGProgress, AVG(ROMrecovery) as AVGRecovery, AVG(weight) as AVGWeight, AVG(height) as AVGHeight";
		var filterDoctor = "DoctorId = " + req.params.doctorId;
		var sqlQuery = 'SELECT ' + selectParams + ' FROM ' + selectTable + ' WHERE ' + filterDoctor;
		
		databaseConnection.query(sqlQuery, function(err, result){
			averageData['totalPatients'] 	= (result[0]['totalPatients']).toFixed(2);
			averageData['averageProgress'] 	= (result[0]['AVGProgress'] * 100).toFixed(2);
			averageData['averageRecovery'] 	= (result[0]['AVGRecovery']).toFixed(2);
			averageData['averageBMI'] 		= (result[0]['AVGWeight'] / ((result[0]['AVGHeight'] / 100.0) * (result[0]['AVGHeight'] / 100.0))).toFixed(2);
			res.jsonp({"averageData" : averageData});
		});
	});

router.route('/patients/:patientId')
	.get(function(req, res){

		var selectTable  = "patientinjruy as A, injuries as B, patients as C";
		var selectPatientInjury  = "A.PatientId, A.InjuryId, A.patientInjuryDescription, B.injuryName, B.injuryDescription";
		var selectPatientDetials = "C.FirstName, C.LastName, C.Email, C.age, C.gender, C.registrationDate, C.patientImgId, C.totalSessions, C.sessionsCompleted, C.ROMrecovery, C.height, C.weight";
		var filterPatient = "A.PatientId = " + req.params.patientId;
		var joinCondition = "A.InjuryId  = B.InjuryId and C.PatientId = A.PatientId";
		var sqlQuery = 'SELECT ' + selectPatientInjury + ' , ' + selectPatientDetials + ' FROM ' + selectTable + ' WHERE ' + filterPatient + ' AND ' + joinCondition;
		
		databaseConnection.query(sqlQuery, function(err, result){
			var patientInjuryDescription = "";
			if (result[0]['patientInjuryDescription'] != ''){
				patientInjuryDescription = result[0]['patientInjuryDescription'];
			} else {
				patientInjuryDescription = result[0]['injuryDescription'];
			}

			patient = {
					'patientId'	 		: result[0]['PatientId'],
					'injuryId'			: result[0]['InjuryId'],
					'injuryDescription' : patientInjuryDescription,
					'injuryName'		: result[0]['injuryName'],
					'firstName' 		: result[0]['FirstName'],
					'lastName'   		: result[0]['LastName'],
					'email'		 		: result[0]['Email'],
					'age'				: result[0]['age'],
					'gender'			: result[0]['gender'],
					'registrationDate'	: result[0]['registrationDate'],
					'patientImgId'		: result[0]['patientImgId'],
					'totalSessions'		: result[0]['totalSessions'],
					'sessionsCompleted'	: result[0]['sessionsCompleted'],
					'ROMrecovery'		: result[0]['ROMrecovery'],
					'height'			: result[0]['height'],
					'weight'			: result[0]['weight'],
					'patientPogress'    : ((result[0]['sessionsCompleted'] / result[0]['totalSessions']) * 100).toFixed(2)
				}
			res.jsonp({"patient" : patient});
		});
	});

router.route('/patients/:patientId/injury/:injuryId/sessions')
	.get(function(req, res){
		var sessions      = [];
		var selectTable   = "recordsessions";
		var selectParams  = "sessionId, sessionAccuracy, sessionComplete, StartDateTime, EndDateTime";
		var filterPatient = "PatientId = " + req.params.patientId;
		var filterInjury  = "InjuryId  = " + req.params.injuryId;
		var sqlQuery      = 'SELECT ' + selectParams + ' FROM ' + selectTable + ' WHERE ' + filterPatient + ' AND ' + filterInjury;
		
		databaseConnection.query(sqlQuery, function(err, result){
			for(sessionIndex = 0; sessionIndex < result.length; sessionIndex++){
				var duration = (result[sessionIndex]['EndDateTime'] - result[sessionIndex]['StartDateTime']) / (60 * 1000);
				session = {
					'sessionId' : result[sessionIndex]['sessionId'], 
					'sessionAccuracy' : result[sessionIndex]['sessionAccuracy'],
					'sessionComplete' : result[sessionIndex]['sessionComplete'], 
					'sessionDuration' : duration
				}
				sessions.push(session)
			}
			res.jsonp({"sessions":sessions});
		});
	});

router.route('/patients/:patientId/injury/:injuryId/sessions/:sessionId/levels')
	.get(function(req, res){
		var levels      = [];
		var selectTable   = "recordlevels";
		var selectParams  = "levelId, levelAccuracy, levelComplete, StartDateTime, EndDateTime, pain, strength, RangeOfMotion";
		var filterPatient = "PatientId = " + req.params.patientId;
		var filterInjury  = "InjuryId  = " + req.params.injuryId;
		var filterSession = "sessionId = " + req.params.sessionId;
		var sqlQuery      = 'SELECT ' + selectParams + ' FROM ' + selectTable + ' WHERE ' + filterPatient + ' AND ' + filterInjury + ' AND ' + filterSession;
		
		databaseConnection.query(sqlQuery, function(err, result){
			for(levelIndex = 0; levelIndex < result.length; levelIndex++){
				var duration = (result[levelIndex]['EndDateTime'] - result[levelIndex]['StartDateTime']) / (60 * 1000);
				level = {
					'levelId'       : result[levelIndex]['levelId'], 
					'levelAccuracy' : result[levelIndex]['levelAccuracy'],
					'levelComplete' : result[levelIndex]['levelComplete'], 
					'levelDuration' : duration,
					'pain'			: result[levelIndex]['pain'],
					'strength'		: result[levelIndex]['strength'],
					'RangeOfMotion'	: result[levelIndex]['RangeOfMotion']
				}
				levels.push(level)
			}
			res.jsonp({"levels":levels});
		});
	});

router.route('/patients/:patientId/injury/:injuryId/sessions/:sessionId/levels/:levelId/actions')
	.get(function(req, res){
		var actions       = [];
		var selectTable   = "recordactions";
		var selectParams  = "actionId, actionType, referenceValue, recordedValue, yaw, pitch, roll, actionComplete, StartDateTime, EndDateTime";
		var filterPatient = "PatientId = " + req.params.patientId;
		var filterInjury  = "InjuryId  = " + req.params.injuryId;
		var filterSession = "sessionId = " + req.params.sessionId;
		var filterLevel   = "levelId   = " + req.params.levelId;
		var sqlQuery      = 'SELECT ' + selectParams + ' FROM ' + selectTable + ' WHERE ' + filterPatient + ' AND ' + filterInjury + ' AND ' + filterSession + ' AND ' + filterLevel;
		
		databaseConnection.query(sqlQuery, function(err, result){
			for(actionIndex = 0; actionIndex < result.length; actionIndex++){
				var duration = (result[actionIndex]['EndDateTime'] - result[actionIndex]['StartDateTime']) / (60 * 1000);
				action = {
					'actionId'       : result[actionIndex]['actionId'], 
					'actionType' 	 : result[actionIndex]['actionType'],
					'referenceValue' : result[actionIndex]['referenceValue'], 
					'recordedValue'  : result[actionIndex]['recordedValue'],
					'yaw'			 : result[actionIndex]['yaw'],
					'pitch'		 	 : result[actionIndex]['pitch'],
					'roll'	 		 : result[actionIndex]['roll'],
					'actionComplete' : result[actionIndex]['actionComplete'],
					'actionDuration' : duration
				}
				actions.push(action)
			}
			res.jsonp({"actions":actions});
		});
	});


router.route('/patients/:patientId/injury/:injuryId/sessions/:sessionId/levels/:levelId/actions/:actionId')
	.get(function(req, res){

		var actions       = [];
		var selectTable   = "recordactions as A, gameactions as B";
		var selectParams  = "A.actionId, A.actionType, A.referenceValue, A.recordedValue, A.yaw, A.pitch, A.roll, A.actionComplete, A.StartDateTime, A.EndDateTime, B.ActionImgId";
		var filterPatient = "A.PatientId = " + req.params.patientId;
		var filterInjury  = "A.InjuryId  = " + req.params.injuryId;
		var filterSession = "A.sessionId = " + req.params.sessionId;
		var filterLevel   = "A.levelId   = " + req.params.levelId;
		var filterActions = "A.actionId  = " + req.params.actionId;
		var joinCondition = "A.actionId = B.actionId AND A.actionType = B.actionType"
		var sqlQuery      = 'SELECT ' + selectParams + ' FROM ' + selectTable + ' WHERE ' + filterPatient + ' AND ' + filterInjury + ' AND ' + filterSession + ' AND ' + filterLevel + ' AND ' + filterActions + ' AND ' + joinCondition;
		
		databaseConnection.query(sqlQuery, function(err, result){
			for(actionIndex = 0; actionIndex < result.length; actionIndex++){
				var duration = (result[actionIndex]['EndDateTime'] - result[actionIndex]['StartDateTime']) / (60 * 1000);
				action = {
					'actionId'       : result[actionIndex]['actionId'], 
					'actionType' 	 : result[actionIndex]['actionType'],
					'actionImgId'	 : result[actionIndex]['ActionImgId'],
					'referenceValue' : result[actionIndex]['referenceValue'], 
					'recordedValue'  : result[actionIndex]['recordedValue'],
					'yaw'			 : result[actionIndex]['yaw'],
					'pitch'		 	 : result[actionIndex]['pitch'],
					'roll'	 		 : result[actionIndex]['roll'],
					'actionComplete' : result[actionIndex]['actionComplete'],
					'actionDuration' : duration
				}
				actions.push(action)
			}
			res.jsonp({"movement":actions});
		});
	});



module.exports = router;
