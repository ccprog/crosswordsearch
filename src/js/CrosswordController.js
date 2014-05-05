/* wrapper controller for single crossword instance */
crwApp.controller("CrosswordController", ['$scope', 'qStore', 'crosswordFactory',
		function ($scope, qStore, crosswordFactory) {
    $scope.crw = crosswordFactory.getCrw();
	$scope.immediateStore = qStore.addStore();
}]);
