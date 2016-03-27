var gearApp = angular.module('gearApp', ['ngRoute', 'gearAppControllers']);

gearApp.config(['$routeProvider', function($routeProvider){
	$routeProvider
		.when('/login', {
			templateUrl : 'templates/login.html',
			controller  : 'LoginController',
			cache : true
		})
		.when('/dashboard', {
			templateUrl : 'templates/dashboard.html',
			controller  : 'dashboardController',
			cache : true
		})
		.when('/overview', {
			templateUrl : 'templates/overview.html',
			controller  : 'OverviewController',
			cache : true
		})
		.when('/patients', {
			templateUrl : 'templates/patients.html',
			controller  : 'PatientsController',
			cache : true
		})
		.when('/settings', {
			templateUrl : 'templates/settings.html',
			controller  : 'SettingsController'	,
			cache : true		
		})
		.otherwise({
			redirectTo: '/login'
		});
}]);