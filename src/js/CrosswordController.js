/* wrapper controller for single crossword instance */
crwApp.controller("CrosswordController", ['$scope', 'qStore', 'crosswordFactory',
		function ($scope, qStore, crosswordFactory) {
    $scope.crw = crosswordFactory.getCrw();
	$scope.immediateStore = qStore.addStore();
    $scope.highlight = [];

    // init crossword at page load time
    $scope.prepare = function (project, name, namesList) {
        $scope.crw.setProject(project);
        if (namesList) {
            $scope.namesInProject = angular.fromJson(namesList);
        }
        $scope.load(name);
    };

    // tweak: since ordering on object entries seems not to really work,
    // map them into an Array
    $scope.wordsToArray = function (words) {
        var arr = [];
        angular.forEach(words, function(item) {
            arr.push(item);
        });
        return arr;
    };

    $scope.setHighlight = function (h) {
        $scope.highlight = h;
    };

    // load a crossword
    $scope.load = function (name) {
        $scope.loadError = null;
        if (name) {
            $scope.crw.loadCrosswordData(name).then(function () {
                $scope.loadedName = name;
                $scope.crosswordData = $scope.crw.getCrosswordData();
            }, function (error) {
                if (error) {
                    $scope.loadError = error;
                }
            });
        } else {
            $scope.crw.loadDefault();
            $scope.loadedName = name;
            $scope.crosswordData = $scope.crw.getCrosswordData();
        }
    };

    // load page only: restart the loaded riddle
    $scope.restart = function () {
        $scope.crosswordData.solution = {};
    };

    // build page only: open save user dialogue
    $scope.save = function () {
        $scope.immediateStore.newPromise('saveCrossword');
    };

    // build page only: fill all empty fields with a random letter
    $scope.randomize = function () {
        $scope.crw.randomizeEmptyFields();
    };

    // build page only:  empty all fields
    $scope.empty = function () {
        $scope.crw.emptyAllFields();
    };

}]);
