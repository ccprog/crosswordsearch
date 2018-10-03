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

// keep the line/column values current when $index changes
crwApp.directive('crwIndexChecker', function() {
    return {
        link: function(scope, element, attrs) {
            scope.$watch('$index', function (newIndex) {
                scope[attrs.crwIndexChecker] = newIndex;
            });
        }
    };
});

/* table and fields controller */

crwApp.controller("GridController", ['$scope', '$q', 'basics',
        function ($scope, $q, basics) {

    // test whether start and stop field are in a straight or diagonal relation
    // for levels 0 & 2 restrict to right and down
    function validMarking (newStop) {
        var isHorizontal,
            dif_x = $scope.currentMarking.start.x - newStop.x,
            dif_y = $scope.currentMarking.start.y - newStop.y;
        if ($scope.crw.getLevelRestriction('dir')) {
            if (basics.textIsLTR) {
                isHorizontal = (dif_y === 0 && dif_x <= 0);
            } else {
                isHorizontal = (dif_y === 0 && dif_x >= 0);
            }
            return (dif_x === 0 && dif_y <= 0) || isHorizontal;
        } else {
            return Math.abs(dif_x) === Math.abs(dif_y) || dif_x === 0 || dif_y === 0;
        }
    }

    function initData () {
        $scope.isMarking = false;
        // shift marking ids so they never overlap with pre-existing word ids
        $scope.currentMarking = { ID: $scope.crw.getHighId() };
    }

    // init controller for build and solve page
    $scope.setMode = function (m) {
        $scope.mode = m;
        initData();
    };

    $scope.$watch('crosswordData.name', initData);

    $scope.testResize = function (direction, change) {
        var critical = $scope.crw.testWordBoundaries(direction, change);
        if (critical.length) {
            // highlight words crossing the new table boundaries
            $scope.setHighlight(critical);
            // ask user whether change should be applied.
            return $scope.immediateStore.newPromise('invalidWords', critical).then(function () {
                // yes: apply all style changes.
                $scope.crw.changeSize(direction, change, critical);
            })['finally'](function () {
                $scope.setHighlight([]);
            });
        } else {
            $scope.crw.changeSize(direction, change, critical);
            return $q.resolve();
        }
    };

    // event handler on mousedown in a field:
    // choose a color and start marking
    $scope.startMark = function () {
        $scope.isMarking = $scope.timer ? $scope.timer.state === 'playing' : true;
        $scope.currentMarking = { ID: $scope.currentMarking.ID+1 };
        // during build markings get a random color,
        // unconfirmed markings during solve remain grey
        $scope.currentMarking.color = $scope.mode === 'build' ? $scope.crw.randomColor() : 'grey';
    };

    function dropMarking () {
        if ($scope.isMarking) {
            if ($scope.mode === 'solve') {
                $scope.crw.deleteWord($scope.currentMarking.ID, 'solution');
            }
            $scope.isMarking = false;
        }
    }
    $scope.$on('markingStop', dropMarking);

    // event handler on mouseup in a field:
    // stop marking and evaluate
    $scope.stopMark = function () {
        var word;

        if (!$scope.isMarking) {
            return;
        }
        // is the marking longer than only one field
        if (!angular.equals($scope.currentMarking.start, $scope.currentMarking.stop)) {
            if ($scope.mode === 'build') {
                // on build page save new marking as word
                word = $scope.crw.setWord($scope.currentMarking);
            } else {
                // on solve page test if marking is a valid solution
                word = $scope.crw.probeWord($scope.currentMarking);
                if (word.solved) {
                    $scope.count.solution++;
                } else if (word.solved === null) {
                    // drop silently if solution was found previously
                    dropMarking();
                } else {
                    // if not, highlight invalid solution and delete the marking on confirmation
                    $scope.setHighlight([word.ID]);
                    $scope.immediateStore.newPromise('falseWord', word.fields).then(function () {
                        $scope.crw.deleteWord($scope.currentMarking.ID, 'solution');
                        $scope.setHighlight([]);
                    });
                }
            }
        }
        $scope.isMarking = false;
        delete $scope.invalidMarking;
    };

    // event handler on mouseenter
    $scope.intoField = function (row, col) {
        var newStop = {x: col, y:row};
        if ($scope.isMarking && $scope.currentMarking.start) {
            if (validMarking(newStop)) {
                $scope.currentMarking.stop = newStop;
                delete $scope.invalidMarking;
            } else {
                $scope.invalidMarking = {
                    start: $scope.currentMarking.start,
                    stop: newStop
                }
            }
        }
    };
    // event handler on mouseleave
    $scope.outofField = function (row, col) {
        // only on the first mouseleave after startMark identify starting field
        // and set first marking
        if ($scope.isMarking && !$scope.currentMarking.start) {
            $scope.currentMarking.start = $scope.currentMarking.stop = {x: col, y:row};
        }
    };

    // that's soooo important
    $scope.getId = function (prefix, id) {
        return prefix + id;
    };
}]);
