// bind/unbind mousedown/mouseup events, arguments:
// down: name of scope function to execute on mousedown
// up: name of scope function to execute on mouseup
// prevent-default: (optional) if present, suppresses event defaults
crwApp.directive('crwCatchMouse', ['$document', function($document) {
    return {
        link: function(scope, element, attrs) {
            // catch mouseup everywhere
            var onMouseDown = function (event) {
                if (angular.isDefined(attrs.preventDefault)) {
                    event.preventDefault();
                }
                $document.bind('mouseup', onMouseUp);
                scope[attrs.down]();
            };

            var onMouseUp = function (event) {
                if (angular.isDefined(attrs.preventDefault)) {
                    event.preventDefault();
                }
                $document.unbind('mouseup', onMouseUp);
                // this is bound to a DOM event, therefore it must be $applied
                scope.$apply(scope[attrs.up]());
            };

            element.bind('mousedown', onMouseDown);
            element.on('$destroy', function () {
                element.unbind('mousedown', onMouseDown);
                $document.unbind('mouseup', onMouseUp);
            });
        }
    };
}]);

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
        var deregister = $scope.$on('immediateReady', function () {
            $scope.load(name);
            deregister();
        });
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

    // get model data up to speed after loading
    var updateModel = function () {
        $scope.crosswordData = $scope.crw.getCrosswordData();
        $scope.namesInProject = $scope.crw.getNamesList();
        $scope.loadedName = $scope.crosswordData.name;
        $scope.count.words = wordListLength($scope.crosswordData.words);
        $scope.count.solution = 0;
    };

    $scope.setHighlight = function (h) {
        $scope.highlight = h;
    };

    // load a crossword
    $scope.load = function (name) {
        $scope.loadError = null;
        if (name) {
            $scope.immediateStore.newPromise('loadCrossword', name).then(
                updateModel,
                function (error) {
                    $scope.loadError = error;
                }
            );
        } else {
            $scope.crw.loadDefault();
            updateModel();
        }
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
