var express = require('express');
var mysql   = require('mysql');
var router  = express.Router();

var databaseConnection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'rehabilitation'
});

var databaseConnectionNew = mysql.createConnection({
	host     : 'localhost',
  	user     : 'root',
  	password : '',
  	database : 'rehabilitation_db'
})

databaseConnection.connect();


router.route('/updatePatients')
	.get(function(req, res){
		//var sqlQuery = "SELECT A.Record_No, A.F_Name, A.Email, A.Registration_Date, A.Group FROM `usermanage` as A where F_Name LIKE 'NgZikai%'";
		var insertStartIndex = 60; 
		var sqlQuery = "SELECT A.F_Name, A.Email, A.Registration_Date FROM `usermanage` as A where A.group IN (3)";
		databaseConnectionNew.query(sqlQuery, function(err, result){
			for(index=0 ; index<result.length; index++){
				var patientId  = insertStartIndex;
				var doctorId   = 1;
				var firstName  = result[index]['F_Name']; 
				var lastName   = ''
				var email      = result[index]['Email'];
				var password   = '123456';
				var address    = 'National University of Singapore, 21 Lower Kent Ridge Rd';
				var postalCode = '119077';
				var contactNumber = randomGenerator(90905019, 96305787);
				var age = randomGenerator(20, 26);
				var gender = 'Male';
				var registrationDate = '2016-02-16';
				var patientImgId = 'http://www.fakenamegenerator.com/images/sil-male.png';
				var totalSessions = 40;
				var sessionsCompleted = 2;
				var ROMrecovery = randomGenerator(20, 95);
				var height = randomGenerator(165, 180);
				var weight = randomGenerator(60.0, 90.0);
				insertStartIndex = insertStartIndex + 1;

				var insertQuery = "INSERT INTO `patients` (`PatientId`, `DoctorId`, `FirstName`, `LastName`, `Email`, `HashPassword`, `Address`, `PostalCode`, `ContactNumber`, `Age`, `gender`, `RegistrationDate`, `PatientImgId`, `totalSessions`, `sessionsCompleted`, `ROMrecovery`, `height`, `weight`) VALUES ('"+patientId+"', '"+doctorId+"', '"+firstName+"', '', '"+email+"', '123456', '"+address+"', '"+postalCode+"', '"+contactNumber+"', '"+age+"', 'Male', '"+registrationDate+"', '"+patientImgId+"', '40', '2', '"+ROMrecovery+"', '"+height+"', '"+weight+"');"
				databaseConnection.query(insertQuery);
			}

			res.send("Updated");
		})
	});

router.route('/updatePatientsInjury')
	.get(function(req, res){
		for(index=60; index<=75; index++){
			var insertQuery = "INSERT INTO `patientinjruy` (`patientId`, `InjuryId`, `patientInjuryDescription`) VALUES ('"+index+"', '3', 'Frozen shoulder treatment with leaderboard for mix of friends and strangers')";
			databaseConnection.query(insertQuery);
		}

		res.send("Updated");
	});

router.route('/updateGame')
	.get(function(req, res){
		selectQuery = "SELECT A.PatientId, B.InjuryId, A.FirstName FROM patients as A, patientinjruy as B where A.PatientId > 1 and A.PatientId = B.patientId";
		databaseConnection.query(selectQuery, function(err, result){
			for(index=0; index<result.length; index++){
				var name = result[index]['FirstName'];
				var insertId = result[index]['PatientId'];
				var injuryId = result[index]['InjuryId'];
				var sessionOneQuery = "SELECT Record_No FROM `usermanage` where F_Name = '"+name+"'";
				var sessionTwoQuery = "SELECT Record_No FROM `usermanage` where F_Name = '"+name+"N'";
				dbUpateGameSession(sessionOneQuery, name, insertId, injuryId, sessionId=1);
				dbUpateGameSession(sessionTwoQuery, name, insertId, injuryId, sessionId=2);
			}
		}) 

		res.send("Updated");
	});

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

function dbUpateGameSession(sessionQuery, name, insertId, injuryId, sessionId){
	databaseConnectionNew.query(sessionQuery, function(err, result){
		var newDbId = result[0]['Record_No']
		//dbCreateSessions(insertId, injuryId, sessionId);
		//dbCreateLevels(insertId, injuryId, sessionId);
		//dbCreateAndUpdateActions(insertId, injuryId, sessionId, newDbId);
		//dbUpadeLevels(insertId, injuryId, sessionId, newDbId);
		dbUpdateSessions(insertId, injuryId, sessionId, newDbId);
	});
}

function dbCreateSessions(insertId, injuryId, sessionId){
	var insertQuery = "INSERT INTO `recordsessions` (`PatientId`, `InjuryId`, `sessionId`, `sessionAccuracy`, `sessionComplete`, `StartDateTime`, `EndDateTime`) VALUES ('"+insertId+"', '"+injuryId+"', '"+sessionId+"', '', '', '', '');"
	databaseConnection.query(insertQuery);
}

function dbCreateLevels(insertId, injuryId, sessionId){
	totalLevels = 3;
	for (level=1; level<=totalLevels; level++){
		var pain = randomGenerator(0,2);
		var strength = randomGenerator(8, 10);
		var ROMStrength = randomGenerator(9, 10);
		var insertQuery = "INSERT INTO `recordlevels` (`PatientId`, `InjuryId`, `sessionId`, `levelId`, `score`, `levelAccuracy`, `levelComplete`, `StartDateTime`, `EndDateTime`, `pain`, `strength`, `RangeOfMotion`) VALUES ('"+insertId+"', '"+injuryId+"', '"+sessionId+"', '"+level+"', '', '', '', '', '', '"+pain+"', '"+strength+"', '"+ROMStrength+"');"
		databaseConnection.query(insertQuery);
	}
}

function dbCreateAndUpdateActions(insertId, injuryId, sessionId, newDbId){
	totalLevels = 3;
	totalMovesInOneLevel  = 3;
	for (level=1; level<=totalLevels; level++){
		for(move=1; move<=totalMovesInOneLevel; move++){
			var moveId = (level-1)*totalMovesInOneLevel + move;
			dbActionInsert(insertId, injuryId, sessionId, newDbId, level, moveId, actionLevel='Start');
			dbActionInsert(insertId, injuryId, sessionId, newDbId, level, moveId, actionLevel='Finish');
		}
	}
}

var START_INDEX = 73;

function dbActionInsert(insertId, injuryId, sessionId, newDbId, level, move, actionLevel){
	var selectActionQuery = "SELECT A.ReferenceValue, AVG(A.RecordedValue) as recorded, A.Date, AVG(A.Yaw) as yaw, AVG(A.Pitch) as pitch, AVG(A.Roll) as roll, A.Reference_Plane FROM `FailureGameData` as A where A.User_ID = '"+newDbId+"' and A.GameLevel = '"+level+"' and A.MoveNumber = '"+move+"' and A.ActionLevel = '"+actionLevel+"'"
	var actionType = 0;
	if (actionLevel == 'Finish'){
		actionType = 1;
	}
	databaseConnectionNew.query(selectActionQuery, function(err, result){
		var referencePlane = result[0]['Reference_Plane']
		var referenceValue = result[0]['ReferenceValue']+referencePlane;
		var recordedValue  = (parseInt(result[0]['recorded'])).toString()+referencePlane;
		var yaw = (parseInt(result[0]['yaw'])).toString();
		var pitch = (parseInt(result[0]['pitch'])).toString();
		var roll  = (parseInt(result[0]['roll'])).toString();
		var actionComplete = 100
		var startDate = result[0]['Date'];
		var endDate = startDate
		var isSuccessful = 1;

		var deviation = parseInt(result[0]['ReferenceValue']) - parseInt(result[0]['recorded'])
		if (deviation < 0){
			deviation = deviation * -1;
		}
		actionComplete = 100 - (deviation / 360)*100

		if (actionComplete > 100){
			actionComplete = 100;
		} else if (actionComplete < 0){
			actionComplete = 0;
		}

		var insertQuery = "INSERT INTO `recordactions` (`recordId`, `PatientId`, `InjuryId`, `sessionId`, `levelId`, `ActionId`, `ActionType`, `referenceValue`, `recordedValue`, `YAW`, `pitch`, `roll`, `actionComplete`, `StartDateTime`, `EndDateTime`, `isSuccessful`) VALUES ('"+START_INDEX+"', '"+insertId+"', '"+injuryId+"', '"+sessionId+"', '"+level+"', '"+move+"', '"+actionType+"', '"+referenceValue+"', '"+recordedValue+"', '"+yaw+"', '"+pitch+"', '"+roll+"', '"+actionComplete+"', '"+startDate+"', '"+endDate+"', '1');"
		START_INDEX = START_INDEX + 1;
		databaseConnection.query(insertQuery);
	});
}

function dbUpadeLevels(insertId, injuryId, sessionId, newDbId){
	var totalLevels = 3;
	for(level=1; level<=totalLevels; level++){
		dbUpdateLevel(insertId, injuryId, sessionId, newDbId, level)		
	}
}

function dbUpdateLevel(insertId, injuryId, sessionId, newDbId, level){
	var selectScoreQuery = "SELECT Score FROM `record_details` where User_ID = '"+newDbId+"' and level = '"+level+"'"
	databaseConnectionNew.query(selectScoreQuery, function(err, result){
		var score = 0;
		if (result[0]){
			score =  result[0]['Score'];
			var selectDateTime = "SELECT MIN(StartDateTime) as start, MAX(EndDateTime) as end, AVG(actionComplete) as accuracy FROM `recordActions` where PatientId = '"+insertId+"' and InjuryId = '"+injuryId+"' and sessionId = '"+sessionId+"' and levelId = '"+level+"'";
			databaseConnection.query(selectDateTime, function(err, result){
				if (result[0]){
					var startDate = result[0]['start'] == null ? null : result[0]['start'].toISOString().slice(0, 19).replace('T', ' ');
					var endDate   = result[0]['end']   == null ? null : result[0]['end'].toISOString().slice(0, 19).replace('T', ' ');
					var accuracy  = result[0]['accuracy'];
					var completion = 100;
					var updateLevelQuery = "UPDATE recordlevels SET score = '"+score+"', levelAccuracy = '"+accuracy+"', levelComplete = 100, StartDateTime = '"+startDate+"', EndDateTime = '"+endDate+"' where PatientId = '"+insertId+"' and InjuryId = '"+injuryId+"' and sessionId = '"+sessionId+"' and levelId = '"+level+"' ";
					databaseConnection.query(updateLevelQuery);
				}
			});
		}
	});
}

function dbUpdateSessions(insertId, injuryId, sessionId, newDbId){
	var selectSessionQuery = "SELECT AVG(levelAccuracy) as accuracy, MIN(StartDateTime) as start, MAX(EndDateTime) as end  FROM `recordlevels` where PatientId = '"+insertId+"' and InjuryId = '"+injuryId+"' and sessionId = '"+sessionId+"'";
	databaseConnection.query(selectSessionQuery, function(err, result){
		var accuracy = result[0]['accuracy'];
		var start = result[0]['start'] == null ? null : result[0]['start'].toISOString().slice(0, 19).replace('T', ' ');
		var end   = result[0]['end']   == null ? null : result[0]['end'].toISOString().slice(0, 19).replace('T', ' ');
		var complete = 100;
		var updateSessionQuery = "UPDATE recordsessions SET sessionAccuracy = '"+accuracy+"', sessionComplete = '"+complete+"', StartDateTime = '"+start+"', EndDateTime = '"+end+"' where PatientId = '"+insertId+"' and InjuryId = '"+injuryId+"' and sessionId = '"+sessionId+"'";
		databaseConnection.query(updateSessionQuery);
	})
}

function randomGenerator(min, max){
	randomValue = Math.floor(Math.random()*(max-min+1)+min);;
	return randomValue;
}

module.exports = router;









































