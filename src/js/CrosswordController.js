/* wrapper controller for single crossword instance */
crwApp.controller("CrosswordController", ['$scope', 'qStore', 'crosswordFactory',
		function ($scope, qStore, crosswordFactory) {
    $scope.crw = crosswordFactory.getCrw();
	$scope.immediateStore = qStore.addStore();

    // init crossword at page load time
    $scope.prepare = function (project, name) {
        $scope.crw.setProject(project);
        $scope.load(name);
    };

    // load a crossword
    $scope.load = function (name) {
        if (name) {
            $scope.crw.loadCrosswordData(name).then(function () {
                $scope.crosswordData = $scope.crw.getCrosswordData();
            }, function (error) {
                if (error) {
                    alert(error.error);
                }
            });
        } else {
            $scope.crw.loadDefault();
            $scope.crosswordData = $scope.crw.getCrosswordData();
        }
    };
}]);
