/* wrapper controller for single crossword instance */
crwApp.controller("CrosswordController", ['$scope', 'qStore', 'crosswordFactory',
		function ($scope, qStore, crosswordFactory) {
    $scope.crw = crosswordFactory.getCrw();
	$scope.immediateStore = qStore.addStore();
    $scope.highlight = [];

    // init crossword at page load time
    $scope.prepare = function (project, name) {
        $scope.crw.setProject(project);
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
