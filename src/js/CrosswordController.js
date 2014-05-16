/* wrapper controller for single crossword instance */
crwApp.controller("CrosswordController", ['$scope', 'qStore', 'crosswordFactory',
		function ($scope, qStore, crosswordFactory) {
    $scope.crw = crosswordFactory.getCrw();
	$scope.immediateStore = qStore.addStore();
    $scope.crosswordData = $scope.crw.getCrosswordData();

    // init crossword at page load time
    $scope.prepare = function (project, name) {
        $scope.crw.setProject(project);
        if (name) {
            $scope.load(name);
        }
    };

    // load a crossword
    $scope.load = function (name) {
        $scope.crw.loadCrosswordData(name).then(function () {
            $scope.crosswordName = name;
        }, function (error) {
            if (error) {
                alert(error.error);
            }
        });
    };
}]);
