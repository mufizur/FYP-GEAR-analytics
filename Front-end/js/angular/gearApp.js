var gearApp = angular.module('gearApp', ['ngRoute', 'gearAppControllers']);

gearApp.config(['$routeProvider', function($routeProvider){
	$routeProvider
		.when('/login', {
			templateUrl : 'templates/login.html',
			controller  : 'LoginController'
		})
		.when('/dashboard', {
			templateUrl: 'templates/dashboard.html',
			controller: 'DashboardController'
		})
		.when('/overview', {
			templateUrl : 'templates/overview.html',
			controller  : 'OverviewController'
		})
		.when('/patients', {
			templateUrl : 'templates/patients.html',
			controller  : 'PatientsController'
		})
		.when('/settings', {
			templateUrl : 'templates/settings.html',
			controller  : 'SettingsController'			
		})
		.otherwise({
			redirectTo: '/login'
		});
}]);