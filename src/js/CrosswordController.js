/* wrapper controller for single crossword instance */
crwApp.controller("CrosswordController", ['$scope', 'qStore', 'crosswordFactory',
		function ($scope, qStore, crosswordFactory) {
    $scope.crw = crosswordFactory.getCrw();
	$scope.immediateStore = qStore.addStore();
    $scope.highlight = [];
    $scope.count = {
        words: 0,
        solution: 0
    };

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
    
    // count words in words/solution object
    var wordListLength = function (words) {
        var length = 0;
        angular.forEach(words, function() {
            length++;
        });
        return length;
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
                $scope.namesInProject = $scope.crw.getNamesList();
                $scope.count.words = wordListLength($scope.crosswordData.words);
            }, function (error) {
                if (error) {
                    $scope.loadError = error;
                }
                return;
            });
        } else {
            $scope.crw.loadDefault();
            $scope.loadedName = name;
            $scope.crosswordData = $scope.crw.getCrosswordData();
            $scope.count.words = 0;
        }
        $scope.count.solution = 0;
    };

    // solve page only: restart the loaded riddle
    $scope.restart = function () {
        $scope.crosswordData.solution = {};
        $scope.count.solution = 0;
    };

    // solve page only: notify on complete solution
    $scope.$watch('count.solution', function(s) {
        if (s > 0 && s === $scope.count.words) {
            $scope.immediateStore.newPromise('solvedCompletely');
        }
    });

    // build page only: open save user dialogue
    $scope.save = function () {
        $scope.immediateStore.newPromise('saveCrossword').then(function () {
            $scope.namesInProject = $scope.crw.getNamesList();
            $scope.loadedName = $scope.crosswordData.name;
        });
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
