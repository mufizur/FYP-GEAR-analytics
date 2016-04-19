# FYP-GEAR-analytics
Final Year Project : Using Gear (Game Assisted Rehabilitation) to monitor patients recovery using a wearable wristband.

To download and run the program:

1.	Install node.js 
2.	Use xampp or other localhost servers to host mySQL database
3.	Update mySQL database using db.sql in Back-end
4.	Connect database to node module (in Backend/api.js) by passing host, user, password and database credentials.
5.	Run npm run start in /Back-end folder (to start backend server)
6.	Open index.html page in browser (preferably browsers other than chrome as chrome does not allow cross-domain requests for the REST APIs)


# DOCUMENTATION #
## Folder : Front-End

The front-end for gear-analytics was built on angularjs, jquery and d3.js.

**Resources**

### index.html 
Main html file with file references to css, javascript and html templates


### /css 

| File         		| Description  												|
| ------------------| :---------------------------------------------------------|
| background.jpeg  	| Background image for landing page							|
| chart.css    		| styling for data analytics charts							|
| dashboard.css 	| styling for overall interface  							|
| login.css			| styling for login page 									|
| main.css			| styling on html and body tags in html 					|
| overview.css		| specific styling for overview page with @mdeia query 		|
| patients.css		| specific styling for patients page with @mdeia query 		|
| settings.css		| specific styling for settings page with @mdeia query 		|	


CSS3 styling conventions used to display content with responsiveness via @media query tags and flexboxes. @media query triggered whenever the width of the screen is less than 1020px (responsiveness up till tablets)

### /js/angular

| File         			| Description  																								|
| ----------------------| :---------------------------------------------------------------------------------------------------------|
| gearApp.js  			| angular routes for application																			|
| gearAppController.js  | angular controllers for each route 																		|
| gearChartMesoBar.js 	| d3.js custom built responsive bar charts (used to display overall progress over sessions) 				|
| gearChartMesoPie.js	| d3.js custom built responsive pie charts (used to display breakdown of gender and age group) 			|
| gearChartMesoStack.js	| d3.js custom built responsive stacked bar charts (used to display subjective feedbacks) 					|
| gearChartMicroBar.js	| d3.js custom built responsive bar charts (used to display data for each move with a start and end action) |
| gearChartMicroMoves.js| d3.js custom built responsive bar charts (used to display moves and angle of rotation - varies for moves) |

### d3.js files 

All charting files are modularized with a global functional call. Therefore to use the chart, the parameters of the function needs to be formatted and passed correctly. To ensure that the correct format is retrieved, please refer to the server-side end points and the data is passed through the endpoints to use the data visualization functions. 

### Routes and controllers

For each route a controller is assigned to the template. The templates can retrieved in the templates folder. The paths are defined in gearApp.js and the associated controllers in gearAppController.js

| Path 		| Template 		| Controller 																							|
| ----- 	| --------------| ----------------------------------------------------------------------------------------------------- |
| /login	| login.html 	| loginController (handles front-end error verification and sends to server for authentication)		|
| /overview	| overview.html | OverviewController (handles macro level data that is required to be displayed when the user enters)	|
| /patients	| patient.html 	| PatientController (handles patient-specific data and updates feedback given by clinicians to server)	|
| /settings	| settings.html | SettingsController (handles updates to patient total sessions and displays doctor's information)		|

Therefore by appending /{path} to the base url, the appropriate templates will be rendered using angularJS. The base path is /login and once authentication is successful the user will be transferred to /patients to start using gear analytics


## Folder : Back-End

The back-end for gear-analytics was build on expressjs and nodejs. An restful interface was build to faciliate communication with front-end modules. In addition node's mysql library was used to enable connection with mysql database. 

### API End points

The API end-points can be viewed in /Back-end/api.js


#### Doctor Data
**/authenticate/doctors/:email/:password**
Authenticates doctors logining into GEAR analytics based on the email and password. A salted authentication protocol has been implemented and the logic for verficiation and endcoding can be retrieved in this end-point in api.js


**/doctors/basic/:doctorId**
**/doctors/:doctorId**
Get information of the users logged in to be displayed in settings page. (For future implementation, the information can be made edittable by creating an admin panel)


#### Patient Data
**/doctors/:doctorId/patients**
**/patients/:patientId**
Getting information about patient(s) and associating the macro level data with them


**/patients/:patientId/updateSessions/:newSessions**
End point to update total number of sessions of the patient by docotors (For future implementation, POST requests can be used instead of GET)


**/patients/:patientId/injury/:injuryId/sessions**
Getting information and progress of patient for each session that is carried out with GEAR


**/patients/:patientId/injury/:injuryId/macro/accuracy**
Accuracy of all the moves within the game (for three levels in each session) across all sessions. Each with a start and end action that is associated with percentage of accuracy. The formula used to compute the accuracy of the move can be retrieved from this End-point


**/patients/:patientId/injury/:injuryId/macro/duration**
Total time taken of all the moves within the game (for three levels in each session) across all sessions. Each with a start and end action.


**/patients/:patientId/injury/:injuryId/macro/feedback**
Subjective feedback of patients on their ROM, strenght and relief from pain. Each on a scale of 1 to 10, whereby 10 shows the best improvement. 


**/patients/:patientId/injury/:injuryId/session/:sessionId/meso/accuracy**
Accuracy of all the moves within the game (currently, total 9 moves) for a specific session of the patient. Each with a start and end action that is associated with percentage of accuracy. The formula used to compute the accuracy of the move can be retrieved from this End-point


**/patients/:patientId/injury/:injuryId/session/:sessionId/meso/duration**
Total time taken of all the moves within the game (currently, total 9 moves) for a specific session of the patient. Each with a start and end action.


**/patients/:patientId/injury/:injuryId/session/:sessionId/micro/moves**
Micro level information about the moves of the patients for each session, with comparisons to expected and actual values. The formula used to compute deviation from the expected moves can be obtained in this end-point. 



#### Overview Data 
**/doctors/:doctorId/overview/macro**
Macro data such as average recovery, progress, total patients and injury groups for doctors to view.


**/overview/groups**
Internal processing end-point which is used to retrieve all the injury groups associated with a specific doctor


**/overview/groups/:groupId/gender**
Gender breakdown within a specific injury group


**/overview/groups/:groupId/age**
Age breakdown within a specific injury group 


**/overview/groups/:groupId/feedback**
Overall feedback of all patients for a specific group with regards to subjective measurements such as ROM, strenght and relief (Similar to individual subsjective feedback)


**/overview/groups/:groupId/accuracy**
Overall accruacy across all moves (currently, total 9 moves) for all patients with a specific injury group


**/overview/groups/:groupId/duration**
Overall duration across all moves (currently, total 9 moves) for all patients with a specific injury group


#### Doctor Feedback
**/doctors/:doctorId/patients/:patientId/injury/:injuryId/post/feedback**
**/doctors/:doctorId/patients/:patientId/injury/:injuryId/get/feedbacks**

GET and POST requests to manage feedbacks by doctors to patients. 


