var express = require('express');
var mysql   = require('mysql');
var router  = express.Router();
var bCrypt  = require('bcrypt-nodejs');

router.route('/test')
	.get(function(req, res){
		res.jsonp({"status" : "successful"});
	});	

//var CONNECTION_TYPE = 'local';
var CONNECTION_TYPE = 'server';
var databaseConnection;

if (CONNECTION_TYPE == 'local'){
	databaseConnection = mysql.createConnection({
	  host     : 'localhost',
	  user     : 'root',
	  password : '',
	  database : 'rehabilitation'
	});

} else if (CONNECTION_TYPE == 'server'){
	databaseConnection = mysql.createConnection({
	  host     : 'sql6.freemysqlhosting.net',
	  user     : 'sql6115444',
	  password : 'nBsA7B2C21',
	  database : 'sql6115444'
	});	
}

databaseConnection.connect();


//Doctor Data
router.route('/authenticate/doctors/:email/:password')
	.get(function(req, res){
		var returnJson	   = {};
		var selectTable    = "doctors";
		var selectParams   = "DoctorId, hashPassword, hashSalt";
		var filterEmail    = "email = '" + req.params.email + "'";
		var sqlQuery = 'SELECT ' + selectParams + ' FROM ' + selectTable + ' WHERE ' + filterEmail;
		databaseConnection.query(sqlQuery, function(err, result){
			if (typeof result[0] !== 'undefinied' && result[0]){
				var hashSalt = result[0]['hashSalt'];
				var password = req.params.password;
				var prevHashpassword = result[0]['hashPassword'];
				if (bCrypt.compareSync((password + hashSalt), prevHashpassword)){
					returnJson = {
						"doctorId" : result[0]['DoctorId']
					}	
				} else {
					returnJson = {
						"error" : "Please check if your password is correct"
					}
				}
			} else {
				returnJson = {
					"error" : "Please check if your username is correct"
				}
			}
			res.jsonp(returnJson);
		});
	});

router.route('/doctors/basic/:doctorId')
	.get(function(req, res){
		var doctorJson	   = {};
		var selectTable    = "doctors";
		var selectParams   = "DoctorId, FirstName, LastName, doctorImgId";
		var filterId 	   = "DoctorId = '" + req.params.doctorId + "'";
		var sqlQuery = 'SELECT ' + selectParams + ' FROM ' + selectTable + ' WHERE ' + filterId;
		databaseConnection.query(sqlQuery, function(err, result){
			if (typeof result[0] !== 'undefinied' && result[0]){
				doctorJson = {
					"doctorId" 		: result[0]['DoctorId'],
					"firstName" 	: result[0]['FirstName'],
					"lastName"  	: result[0]['LastName'],
					"imgId" 		: result[0]['doctorImgId']
				}
			}
			res.jsonp(doctorJson);
		});
	});

router.route('/doctors/:doctorId')
	.get(function(req, res){
		var doctorJson	   = {};
		var selectTable    = "doctors";
		var selectParams   = "DoctorId, FirstName, LastName, Qualification, Institution, Department, Speciality, OfficeTelephone, OfficeFax, doctorImgId";
		var filterId 	   = "DoctorId = '" + req.params.doctorId + "'";
		var sqlQuery = 'SELECT ' + selectParams + ' FROM ' + selectTable + ' WHERE ' + filterId;
		databaseConnection.query(sqlQuery, function(err, result){
			if (typeof result[0] !== 'undefinied' && result[0]){
				doctorJson = {
					"doctorId" 		: result[0]['DoctorId'],
					"firstName" 	: result[0]['FirstName'],
					"lastName"  	: result[0]['LastName'],
					"qualification" : result[0]['Qualification'],
					"institution" 	: result[0]['Institution'],
					"department" 	: result[0]['Department'],
					"speciality" 	: result[0]['Speciality'],
					"telephone" 	: result[0]['OfficeTelephone'],
					"fax" 			: result[0]['OfficeFax'],
					"imgId" 		: result[0]['doctorImgId']
				}
			}
			res.jsonp(doctorJson);
		});
	});


//Patient Data
router.route('/doctors/:doctorId/patients')
	.get(function(req, res){
		
		var patients = [];
		var selectTable  = "patientinjruy as A, injuries as B, patients as C";
		var selectPatientInjury  = "A.PatientId, A.InjuryId, B.injuryName";
		var selectPatientDetials = "C.FirstName, C.LastName, C.patientImgId, C.ROMrecovery, C.totalSessions, C.sessionsCompleted";
		var joinCondition = "A.InjuryId  = B.InjuryId and C.PatientId = A.PatientId";
		var orderCondition = "C.FirstName"
		var sqlQuery = 'SELECT ' + selectPatientInjury + ' , ' + selectPatientDetials + ' FROM ' + selectTable + ' WHERE ' + joinCondition + ' ORDER BY '+orderCondition;
		
		databaseConnection.query(sqlQuery, function(err, result){
			
			for(patientIndex = 0; patientIndex < result.length; patientIndex++){
				var patientRecoveryRange = ""
				var patientRecovery = parseInt(result[patientIndex]['ROMrecovery']);
				if (patientRecovery <= 60){
					patientRecoveryRange = "POOR"
				
				} else if (patientRecovery > 60 && patientRecovery < 70){
					patientRecoveryRange = "FAIR"
				
				} else if (patientRecovery >= 70){
					patientRecoveryRange = "GOOD"
				}

				patient = {
					'patientId'	 		: result[patientIndex]['PatientId'],
					'injuryId'			: result[patientIndex]['InjuryId'],
					'firstName' 		: result[patientIndex]['FirstName'],
					'lastName'   		: result[patientIndex]['LastName'],
					'injuryName'		: result[patientIndex]['injuryName'],
					'patientImgId'		: result[patientIndex]['patientImgId'],
					'totalSessions'		: result[patientIndex]['totalSessions'],
					'sessionsCompleted'	: result[patientIndex]['sessionsCompleted'],
					'ROMrecovery'		: patientRecovery,
					'recoveryRange'		: patientRecoveryRange
				}
				patients.push(patient)
			}
			res.jsonp({"patients" : patients});
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


router.route('/patients/:patientId/updateSessions/:newSessions')
	.get(function(req, res){
		var updateQuery = "UPDATE patients SET totalSessions = "+req.params.newSessions+" where patientId = "+req.params.patientId;
		databaseConnection.query(updateQuery, function(err, result){
			res.jsonp({"status" : "successful"})
		});
	})

router.route('/patients/:patientId/injury/:injuryId/sessions')
	.get(function(req, res){
		var sessions      = [];
		var selectTable   = "recordsessions";
		var selectParams  = "sessionId";
		var filterPatient = "PatientId = " + req.params.patientId;
		var filterInjury  = "InjuryId  = " + req.params.injuryId;
		var sqlQuery      = 'SELECT ' + selectParams + ' FROM ' + selectTable + ' WHERE ' + filterPatient + ' AND ' + filterInjury;
		
		databaseConnection.query(sqlQuery, function(err, result){
			for(sessionIndex = result.length-1; sessionIndex >= 0 ; sessionIndex--){
				sessions.push(result[sessionIndex]['sessionId'])
			}
			res.jsonp({"sessions":sessions});
		});
	});

router.route('/patients/:patientId/injury/:injuryId/macro/accuracy')
	.get(function(req, res){
		var accuacyUpperBound = 100.00;
		var macroAccuracy = {
			'upperBound' : accuacyUpperBound,
			'results' : []
		}

		var sessionFilter = "PatientId = '"+req.params.patientId+"' and InjuryId = '"+req.params.injuryId+"'"
		var sessionTable  = "recordlevels"
		var sessionSelection = "sessionId, levelId, levelAccuracy"
		var sessionOrder  = "sessionId ASC"
		var selectQuery = "SELECT "+sessionSelection+" FROM "+sessionTable+" where "+sessionFilter+" order by "+sessionOrder;
		databaseConnection.query(selectQuery, function(err, result){
			var currKey = "";
			var currData = [];

			for(index=0; index<result.length; index++){
				currKey = result[index]['sessionId'];
				var prevKey = currKey;
				var accuracy = result[index]['levelAccuracy'];
				
				if(index != 0){
					prevKey = result[index-1]['sessionId'];
				} else if(index == 0) {
					macroAccuracy['results'].push('S'+currKey) //Adding First Key 
				}

				if(prevKey != currKey){
					macroAccuracy['results'].push('S'+currKey); //Adding Subsquent Key
					macroAccuracy['S'+prevKey] = currData;		//Adding Recent Data
					currData = [];
				}

				currData.push(accuracy);
				if(index == result.length-1){
					macroAccuracy['S'+currKey] = currData;		//Adding Final Data
				}
			}

			res.jsonp(macroAccuracy);
		});
	});

router.route('/patients/:patientId/injury/:injuryId/macro/duration')
	.get(function(req, res){
		var macroDuration = {
			'upperBound' : 0,
			'results' : []
		}

		var sessionFilter = "PatientId = '"+req.params.patientId+"' and InjuryId = '"+req.params.injuryId+"'"
		var sessionTable  = "recordlevels"
		var sessionSelection = "sessionId, levelId, timeTaken"
		var sessionOrder  = "sessionId ASC"
		var selectQuery = "SELECT "+sessionSelection+" FROM "+sessionTable+" where "+sessionFilter+" order by "+sessionOrder;
		databaseConnection.query(selectQuery, function(err, result){
			var currKey = "";
			var currData = [];
			var timeUpperBound = 0.0;

			for(index=0; index<result.length; index++){
				currKey = result[index]['sessionId'];
				var prevKey = currKey;
				var timeTaken = result[index]['timeTaken'];
				if(timeTaken > parseFloat(timeUpperBound)){
					timeUpperBound = timeTaken;
				}
				
				if(index != 0){
					prevKey = result[index-1]['sessionId'];
				} else if(index == 0) {
					macroDuration['results'].push('S'+currKey) //Adding First Key 
				}

				if(prevKey != currKey){
					macroDuration['results'].push('S'+currKey); //Adding Subsquent Key
					macroDuration['S'+prevKey] = currData;		//Adding Recent Data
					currData = [];
				}

				currData.push(timeTaken);
				if(index == result.length-1){
					macroDuration['S'+currKey] = currData;		//Adding Final Data
				}
			}

			macroDuration['upperBound'] = timeUpperBound;
			res.jsonp(macroDuration);
		});
	});

router.route('/patients/:patientId/injury/:injuryId/macro/feedback')
	.get(function(req, res){

		var userFeedback = {
			'upperBound' : 10,
			'results' 	 : [],
			'fields'  	 : ['Relief', 'Strength', 'Rom'],
			'Relief'  	 : {},
			'Strength' 	 : {},
			'Rom' 		 : {}
		}

		var sessionFilter = "PatientId = '"+req.params.patientId+"' and InjuryId = '"+req.params.injuryId+"'"
		var sessionTable  = "recordlevels"
		var sessionSelection = "sessionId, levelId, pain, strength, RangeOfMotion"
		var sessionOrder  = "sessionId ASC"
		var selectQuery = "SELECT "+sessionSelection+" FROM "+sessionTable+" where "+sessionFilter+" order by "+sessionOrder;
		databaseConnection.query(selectQuery, function(err, result){
			var currKey = "";
			var currDataRelief = [];
			var currDataStrength = [];
			var currDataRom = [];

			for(index=0; index<result.length; index++){
				currKey = result[index]['sessionId'];
				var prevKey  = currKey;
				var relief   = 10 - result[index]['pain'];
				var rom      = result[index]['RangeOfMotion'];
				var strength = result[index]['strength'];  
				
				if(index != 0){
					prevKey = result[index-1]['sessionId'];
				} else if(index == 0) {
					userFeedback['results'].push('S'+currKey) //Adding First Key 
				}

				if(prevKey != currKey){
					userFeedback['results'].push('S'+currKey); //Adding Subsquent Key
					userFeedback['Relief']['S'+prevKey] = currDataRelief; //Adding Recent Data
					userFeedback['Strength']['S'+prevKey] = currDataStrength;
					userFeedback['Rom']['S'+prevKey] = currDataRom;
					currDataRelief = [];
					currDataStrength = [];
					currDataRom = [];
				}

				currDataRelief.push(relief);
				currDataStrength.push(strength);
				currDataRom.push(rom);

				if(index == result.length-1){
					userFeedback['Relief']['S'+currKey] = currDataRelief; //Adding Final Data
					userFeedback['Strength']['S'+currKey] = currDataStrength;
					userFeedback['Rom']['S'+currKey] = currDataRom;
				}
			}

			res.jsonp(userFeedback);
		});
	});

router.route('/patients/:patientId/injury/:injuryId/session/:sessionId/meso/accuracy')
	.get(function(req, res){
		var totalMoves = 9;
		var mesoAccuracy = {
			'upperBound' : 100,
			'results' : [],
			'dataTags': ['Start', 'End']
		}

		var queryFilter = "PatientId = '"+req.params.patientId+"' and InjuryId = '"+req.params.injuryId+"' and sessionId = '"+req.params.sessionId+"'"
		var queryTable  = "recordActions"
		var querySelection = "ActionId, ActionType, Accuracy"
		var queryOrder  = "ActionId, ActionType ASC"
		var selectQuery = "SELECT "+querySelection+" FROM "+queryTable+" where "+queryFilter+" order by "+queryOrder;
		databaseConnection.query(selectQuery, function(err, result){
			var data = [];
			for(moveIndex=0; moveIndex < totalMoves; moveIndex++){
				startValue = result[moveIndex*2 + 0]['Accuracy'];
				endValue   = result[moveIndex*2 + 1]['Accuracy'];
				moveKey    = 'L'+(moveIndex+1);
				mesoAccuracy['results'].push(moveKey);
				mesoAccuracy[moveKey] = [startValue, endValue];
			}

			res.jsonp(mesoAccuracy);
		});
	});

router.route('/patients/:patientId/injury/:injuryId/session/:sessionId/meso/duration')
	.get(function(req, res){
		var totalMoves = 9;
		var upperBound = 0;
		var mesoDuration = {
			'upperBound' : 100,
			'results' : [],
			'dataTags': ['Start', 'End']
		}

		var queryFilter = "PatientId = '"+req.params.patientId+"' and InjuryId = '"+req.params.injuryId+"' and sessionId = '"+req.params.sessionId+"'"
		var queryTable  = "recordActions"
		var querySelection = "ActionId, ActionType, timeTaken"
		var queryOrder  = "ActionId, ActionType ASC"
		var selectQuery = "SELECT "+querySelection+" FROM "+queryTable+" where "+queryFilter+" order by "+queryOrder;
		databaseConnection.query(selectQuery, function(err, result){
			var data = [];
			for(moveIndex=0; moveIndex < totalMoves; moveIndex++){
				startValue = result[moveIndex*2 + 0]['timeTaken'];
				endValue   = result[moveIndex*2 + 1]['timeTaken'];
				moveKey    = 'L'+(moveIndex+1);
				mesoDuration['results'].push(moveKey);
				mesoDuration[moveKey] = [startValue, endValue];

				if(parseFloat(startValue) > parseFloat(endValue)){
					if(upperBound < parseFloat(startValue))	{upperBound = parseFloat(startValue);}
				
				} else if(parseFloat(endValue) > parseFloat(startValue)){
					if(upperBound < parseFloat(endValue))	{upperBound = parseFloat(endValue);}
				}
			}

			mesoDuration['upperBound'] = upperBound.toFixed(2);
			res.jsonp(mesoDuration);
		});
	});

router.route('/patients/:patientId/injury/:injuryId/session/:sessionId/micro/moves')
	.get(function(req, res){
		totalMoves = 9;
		var moves = {
			'results'   : [],
			'dataTags'  : ['start', 'end'],
			'start'		: {},
			'end'		: {} 
		};

		var queryFilter = "A.PatientId = '"+req.params.patientId+"' and A.InjuryId = '"+req.params.injuryId+"' and A.sessionId = '"+req.params.sessionId+"'"
		var queryTable  = "recordActions as A, gameactions B"
		var querySelection = "A.moveAngle, A.refPlane, B.refROM, B.planeName, B.moveName, A.Accuracy"
		var queryJoin 	= "A.ActionType = B.ActionType and A.ActionId = B.ActionId"
		var queryOrder  = "A.ActionId, A.ActionType ASC"
		var selectQuery = "SELECT "+querySelection+" FROM "+queryTable+" where "+queryFilter+" and "+queryJoin+" order by "+queryOrder;
		console.log(selectQuery);

		databaseConnection.query(selectQuery, function(err, result){
			for(moveIndex=0; moveIndex < totalMoves; moveIndex++){
				var moveKey = 'L'+(moveIndex+1);
				for(moveTypeIndex = 0; moveTypeIndex < moves['dataTags'].length; moveTypeIndex++){
					moveTypeKey = moves['dataTags'][moveTypeIndex];
					moves[moveTypeKey][moveKey] = {
						'moveId'    : (moveIndex+1),
						'angle'     : result[moveIndex*2 + moveTypeIndex]['moveAngle'],
						'expected'  : result[moveIndex*2 + moveTypeIndex]['refROM'],
						'accuracy'  : result[moveIndex*2 + moveTypeIndex]['Accuracy'],
						'refPlane'  : result[moveIndex*2 + moveTypeIndex]['refPlane'],
						'planeName' : result[moveIndex*2 + moveTypeIndex]['planeName'],
						'moveName'	: result[moveIndex*2 + moveTypeIndex]['moveName']
					}
				}
				moves['results'].push(moveKey);
			}
			res.jsonp(moves);
		});
	});


//Overview Data
router.route('/doctors/:doctorId/overview/macro')
	.get(function(req, res){

		var queryFieldsPatients = "COUNT(*) as totalPatients";
		var queryFieldAccuracy  = "AVG(A.ROMrecovery) as avgRecovery";
		var queryFieldProgress  = "(SUM(sessionsCompleted) / SUM(totalSessions)) * 100 as avgProgress";
		var queryFieldGroups    = "COUNT(DISTINCT(B.InjuryId)) as totalGroups"
		var queryTable  = "patients as A, patientinjruy as B "
		var queryFilter = "A.DoctorId = '"+req.params.doctorId+"' and A.PatientId = B.patientId"
		var queryFields = queryFieldsPatients+", "+queryFieldAccuracy+", "+queryFieldProgress+", "+queryFieldGroups
		var sqlQuery = "SELECT "+queryFields+" FROM "+queryTable+" WHERE "+queryFilter;
		console.log(sqlQuery);

		databaseConnection.query(sqlQuery, function(err, result){
			var overview = {
				'totalPatients' : result[0]['totalPatients'],
				'totalGroups' 	: result[0]['totalGroups'], 
				'avgAccuracy' 	: result[0]['avgRecovery'].toFixed(2),
				'avgProgress'	: result[0]['avgProgress'].toFixed(2)
			}
			res.jsonp(overview);
		});
	});

router.route('/overview/groups')
	.get(function(req, res){
		var sqlQuery = "SELECT * FROM injuries";
		var groups   = []
		databaseConnection.query(sqlQuery, function(err, result){
			for(index=0; index<result.length; index++){
				var group = {
					'injuryId' : result[index]['InjuryId'], 
					'injuryName' : result[index]['injuryName'],
					'injuryDescription' : result[index]['InjuryDescription']
				}
				groups.push(group)
			}
			res.jsonp(groups);
		});
	});

router.route('/overview/groups/:groupId/gender')
	.get(function(req, res){
		var overviewGender = {'results' : []}
		var total = 0;

		var queryFields   = "A.gender, count(*) as total";
		var queryTables   = "patients as A, patientinjruy as B";
		var queryJoin     = "A.PatientId = B.patientId";
		var queryGroup    = "A.gender"
		var queryFilter   = "";
		if(parseInt(req.params.groupId) > 0){
			queryFilter = "and B.InjuryId = "+ req.params.groupId;
		}
		var sqlQuery = "SELECT "+queryFields+" FROM "+queryTables+" where "+queryJoin+" "+queryFilter+" group by "+queryGroup;
		console.log(sqlQuery);
		databaseConnection.query(sqlQuery, function(err, result){
			for(index=0; index<result.length; index++){
				key = result[index]['gender'];
				keyValue = result[index]['total'];
				overviewGender.results.push(key);
				overviewGender[key] = keyValue;
				total = total + keyValue;
			}

			overviewGender['total'] = total;
			res.jsonp(overviewGender);
		});
	});

router.route('/overview/groups/:groupId/age')
	.get(function(req, res){

		var maxAgeGroups = 5;
		var ageGroup = {
			'total' : 0,
			'results' : []
		}

		var querySelect = "A.age, count(*) as total"
		var queryTable  = "patients as A, patientinjruy as B";
		var queryJoin   = "A.PatientId = B.patientId";
		var queryGroup  = "A.age"
		var queryFilter = "";

		if(parseInt(req.params.groupId) > 0){
			queryFilter = "and B.InjuryId = "+ req.params.groupId;
		}
		var sqlQuery = "SELECT "+querySelect+" FROM "+queryTable+" WHERE "+queryJoin+" "+queryFilter+" group by "+queryGroup;
		console.log(sqlQuery);

		databaseConnection.query(sqlQuery, function(err, result){
			var minAge = result[0]['age'];
			var maxAge = result[result.length-1]['age'];
			var ageDifference = maxAge - minAge;
			var ageOffset = parseInt(ageDifference / maxAgeGroups);
			
			var maxAgeOffset = 0;
			var currUpperLimit = parseInt(minAge) + ageOffset;
			var ageTotal  = 0;
			var overallTotal = 0;
			for(index=0; index<result.length; index++){
				ageTotal = ageTotal + result[index]['total'];
				overallTotal = overallTotal + result[index]['total'];

				var currAge = result[index]['age']
				if(currAge >= currUpperLimit || index == result.length-1){
					var ageKey = (currUpperLimit - ageOffset)+' - '+(currUpperLimit);
					ageGroup['results'].push(ageKey);
					ageGroup[ageKey] = ageTotal;
					ageTotal = 0;
					currUpperLimit = currUpperLimit + ageOffset + 1;
				}
				
			}
			ageGroup['total'] = overallTotal;
			res.jsonp(ageGroup);
		});
	});

router.route('/overview/groups/:groupId/feedback')
	.get(function(req, res){

		var overallFeedback = {
			'upperBound' : 10,
			'results'  : ['Overall'], 
			'fields'   : ['Relief', 'Strength', 'Rom'],
			'Relief'   : {},
			'Strength' : {},
			'Rom' : {}
		}
		
		var querySelection = "levelId, AVG(pain) as pain, AVG(strength) as strength, AVG(RangeOfMotion) as ROM";
		var queryFilter    = "";
		if(parseInt(req.params.groupId) > 0){
			queryFilter    = "where InjuryId = '"+req.params.groupId+"'";
		}
		var queryTable     = "recordlevels"
		var queryGroup 	   = "levelId"
		var queryOrder     = "levelId ASC"
		var sqlQuery = "SELECT "+querySelection+" FROM "+queryTable+" "+queryFilter + "group by "+queryGroup + " ORDER BY "+queryOrder;
		console.log(sqlQuery);
		databaseConnection.query(sqlQuery, function(err, result){
			var levelResultRelief = [];
			var levelResultStrength = [];
			var levelResultROM = [];
			for(index=0; index<result.length; index++){
				levelResultRelief.push((10 -result[index]['pain']).toFixed(2));
				levelResultStrength.push((result[index]['strength']).toFixed(2));
				levelResultROM.push((result[index]['ROM']).toFixed(2));
			} 

			overallFeedback['Relief']['Overall'] = levelResultRelief;
			overallFeedback['Strength']['Overall'] = levelResultStrength;
			overallFeedback['Rom']['Overall'] = levelResultROM;
			res.jsonp(overallFeedback);
		});
	});


router.route('/overview/groups/:groupId/accuracy')
	.get(function(req, res){
		var totalMoves = 9;
		var overviewLevels = {
			'upperBound' : 100,
			'results' : [],
			'dataTags': ['Start', 'End']
		}

		var querySelect = "AVG(Accuracy) as Accuracy, ActionId, ActionType";
		var queryTable  = "recordActions";
		var queryGroup  = "ActionId, ActionType"
		var queryFilter = "";
		if(parseInt(req.params.groupId) > 0){
			queryFilter = "where InjuryId = "+req.params.groupId;
		}
		var sqlQuery    = "SELECT "+querySelect+" FROM "+queryTable+" "+queryFilter+" group by "+queryGroup;
		databaseConnection.query(sqlQuery, function(err, result){
			for(index=0; index<totalMoves; index++){
				startVal = (result[2*index+0]['Accuracy']).toFixed(2);
				endVal   = (result[2*index+1]['Accuracy']).toFixed(2);
				moveKey  = 'L'+(index+1);
				overviewLevels['results'].push(moveKey);
				overviewLevels[moveKey] = [startVal, endVal]
			}

			res.jsonp(overviewLevels);
		});
	});

router.route('/overview/groups/:groupId/duration')
	.get(function(req, res){
		var totalMoves = 9;
		var upperBoundTime = 0;
		var overviewLevels = {
			'upperBound' : 0,
			'results' : [],
			'dataTags': ['Start', 'End']
		}

		var querySelect = "AVG(timeTaken) as timeTaken, ActionId, ActionType";
		var queryTable  = "recordActions";
		var queryGroup  = "ActionId, ActionType"
		var queryFilter = "";
		if(parseInt(req.params.groupId) > 0){
			queryFilter = "where InjuryId = "+req.params.groupId;
		}
		var sqlQuery    = "SELECT "+querySelect+" FROM "+queryTable+" "+queryFilter+" group by "+queryGroup;
		databaseConnection.query(sqlQuery, function(err, result){
			for(index=0; index<totalMoves; index++){
				startVal = (result[2*index+0]['timeTaken']).toFixed(2);
				endVal   = (result[2*index+1]['timeTaken']).toFixed(2);

				if(startVal > endVal && startVal > upperBoundTime){
					upperBoundTime = startVal;
				
				} else if(endVal > startVal && endVal > upperBoundTime){
					upperBoundTime = endVal;
				} 

				moveKey  = 'L'+(index+1);
				overviewLevels['results'].push(moveKey);
				overviewLevels[moveKey] = [startVal, endVal]
			}

			overviewLevels['upperBound'] = upperBoundTime
			res.jsonp(overviewLevels);
		});
	});


//Doctor Feedback

router.route('/doctors/:doctorId/patients/:patientId/injury/:injuryId/post/feedback')
	.get(function(req, res){
		var feedback = req.query.doctorFeedback
		var sender   = 'doctor';
		var date     =  new Date().toISOString().slice(0, 19).replace('T', ' ');
		var insertValues = "'"+req.params.doctorId+"', '"+req.params.patientId+"', '"+req.params.injuryId+"', '"+date+"', '"+feedback+"', 'doctor'";
		var insertTable  = "doctorPatientFeedback"
		var insertQuery  = "INSERT into "+insertTable+" VALUES("+insertValues+")";
		console.log(insertQuery);
		databaseConnection.query(insertQuery, function(insertQuery, result){
			res.jsonp("Added")
		});
	});

router.route('/doctors/:doctorId/patients/:patientId/injury/:injuryId/get/feedbacks')
	.get(function(req, res){
		var feedbacks   = [];
		var querySelect = "dateRecord, message";
		var queryTable  = "doctorPatientFeedback";
		var queryFilter = "doctorId = '"+req.params.doctorId+"' and patientId = '"+req.params.patientId+"' and injuryId = '"+req.params.injuryId+"'";
		var queryOrder  = "dateRecord ASC"
		var sqlQuery = "SELECT "+querySelect+" FROM "+queryTable+" WHERE "+queryFilter+" ORDER BY "+queryOrder;
		console.log(sqlQuery);
		databaseConnection.query(sqlQuery, function(insertQuery, result){
			if (result){
				for(index=0; index<result.length; index++){
					var dateArr  = String(result[index]['dateRecord']).split(" ")
					var date     = dateArr[0]+", "+dateArr[1]+" "+dateArr[2]+" "+dateArr[3] 
					var feedback = {
						'date' 	  : date, 
						'message' : result[index]['message']
					}
					feedbacks.push(feedback);
				}
			}
			res.jsonp(feedbacks)
		});
	});

module.exports = router;
