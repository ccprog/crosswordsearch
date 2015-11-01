// prevent letter highlighting and catch angular setFocus events sending
// them to <button> even when the button is hidden under marker images
crwApp.directive('crwSetFocus', function() {
    return {
        link: function(scope, element, attrs) {
            element.on('mousemove', function (event) {
                event.preventDefault();
            });
            scope.$on('setFocus', function (event, line, column) {
                if (line === scope.line && column === scope.column) {
                    element[0].focus();
                }
            });
        }
    };
});

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

crwApp.controller("TableController", ['$scope', 'basics', 'markerFactory',
        function ($scope, basics, markerFactory) {
    var isMarking = false, currentMarking, mode, lastName;
    $scope.markers = markerFactory.getMarkers();

    // test whether start and stop field are in a straight or diagonal relation
    // for levels 0 & 2 restrict to right and down
    function validMarking (newStop) {
        var isHorizontal,
            dif_x = currentMarking.start.x - newStop.x,
            dif_y = currentMarking.start.y - newStop.y;
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

    // init controller for build and solve page
    $scope.setMode = function (m) {
        mode = m;
        lastName = $scope.crosswordData.name;
        // shift marking ids so they never overlap with pre-existing word ids
        currentMarking = { ID: $scope.crw.getHighId() };
        if (mode === 'build') { // build page
            $scope.$watch('crosswordData.words', function (newWords, oldWords) {
                if (lastName !== $scope.crosswordData.name) {
                    lastName = $scope.crosswordData.name;
                    return;
                }
                var probe, len = 0;
                // remove marking for deleted words
                angular.forEach(oldWords, function (word, id) {
                    len++;
                    if (!newWords[id]) {
                        $scope.markers.deleteMarking(id);
                    } else {
                        probe = true;
                    }
                });
                // if there are other markings, redraw to catch word shifts
                if (probe || len === 0) {
                    $scope.markers.redrawMarkers($scope.crosswordData.words);
                }
            }, true);
        }
        if (mode === 'solve') { // solve page
            // remove marking for deleted solutions and colorize valid solutions
            $scope.$watch('crosswordData.solution', function (newWords, oldWords) {
                if (lastName !== $scope.crosswordData.name) {
                    lastName = $scope.crosswordData.name;
                    return;
                }
                angular.forEach(oldWords, function (word, id) {
                    if (!newWords[id] || !newWords[id].solved) {
                        $scope.markers.deleteMarking(word.markingId);
                    }
                });
                angular.forEach(newWords, function (word, id) {
                    if (!oldWords[id] || (!oldWords[id].solved && word.solved)) {
                        $scope.markers.exchangeMarkers(word.fields, currentMarking.ID, word.color);
                    }
                });
            }, true);
        }
    };

    $scope.$watch('crosswordData.name', function () {
        $scope.markers.deleteAllMarking();
        currentMarking = { ID: $scope.crw.getHighId() };
        if (mode !== 'solve') {
            $scope.markers.redrawMarkers($scope.crosswordData.words);
        }
    });

    // retrieve the $scope.markers for a field
    $scope.getMarks = function (line, column) {
        return $scope.markers.getMarks(column, line);
    };
    // unpack the image class names into an array
    $scope.getImgClass = function (marker) {
        return [marker.img, marker.marking.color];
    };

    // transform clicks on a field to angular setFocus event
    $scope.activate = function (row, col) {
        $scope.$broadcast('setFocus', row, col);
    };

    // event handler on mousedown in a field:
    // choose a color and start marking
    $scope.startMark = function () {
        isMarking = true;
        currentMarking = { ID: currentMarking.ID+1 };
        // during build markings get a random color,
        // unconfirmed markings during solve remain grey
        currentMarking.color = mode === 'build' ? $scope.crw.randomColor() : 'grey';
    };

    // event handler on mouseup in a field:
    // stop marking and evaluate
    $scope.stopMark = function () {
        if (!isMarking) {
            return;
        }
        isMarking = false;
        // is the marking longer than only one field
        if (!angular.equals(currentMarking.start, currentMarking.stop)) {
            if (mode === 'build') {
                // on build page save new marking as word
                $scope.crw.setWord(currentMarking);
            } else {
                // on solve page test if marking is a valid solution
                var word = $scope.crw.probeWord(currentMarking);
                if (word.solved) {
                    $scope.count.solution++;
                } else {
                    // if not, highlight invalid solution and delete the marking on confirmation
                    $scope.setHighlight([word.ID]);
                    $scope.immediateStore.newPromise('falseWord', word.fields).then(function () {
                        $scope.crw.deleteWord(currentMarking.ID, 'solution');
                        $scope.setHighlight([]);
                    });
                }
            }
        } else {
            // delete one-field markings
            $scope.markers.deleteMarking(currentMarking.ID);
        }
    };

    // event handler on mouseenter
    $scope.intoField = function (row, col) {
        var newStop = {x: col, y:row};
        // draw marking only for valid directions
        if (isMarking && currentMarking.start && validMarking(newStop)) {
            currentMarking.stop = newStop;
            $scope.markers.setNewMarkers(currentMarking);
        }
    };
    // event handler on mouseleave
    $scope.outofField = function (row, col) {
        // only on the first mouseleave after startMark identify starting field
        // and set first marking
        if (isMarking && !currentMarking.start) {
            currentMarking.start = currentMarking.stop = {x: col, y:row};
            $scope.markers.setNewMarkers(currentMarking);
        }
    };

    // event handler on keydown catches arrow keys and deletion
    $scope.move = function (event) {
        switch (event.which) {
        case 0x08: //backspace
        case 0x2E: //delete
            this.field.letter = null;
            event.preventDefault();
            event.stopPropagation();
            break;
        case 0x25: //left
            if (this.column > 0) {
                this.activate(this.line,this.column-1);
            }
            event.preventDefault();
            event.stopPropagation();
            break;
        case 0x26: //up
            if (this.line > 0) {
                this.activate(this.line-1,this.column);
            }
            event.preventDefault();
            event.stopPropagation();
            break;
        case 0x27: //right
            if (this.column < this.row.length - 1) {
                this.activate(this.line,this.column+1);
            }
            event.preventDefault();
            event.stopPropagation();
            break;
        case 0x28: //down
            if (this.line < this.crosswordData.table.length - 1) {
                this.activate(this.line+1,this.column);
            }
            event.preventDefault();
            event.stopPropagation();
            break;
        }
        // stop event propagation for letters, even if true handling follows
        // later, to suppress keyboard shortcuts from other code parts
        var keychar = String.fromCharCode(event.which);
        if (basics.letterRegEx.test(keychar)) {
            event.stopPropagation();
        }
    };
    // event handler on keypress catches letters
    // beware of the weirdness:
    // test everything here, including basics.letterRegEx(lang)
    // for compatibility with browsers, OS and hardware
    // if you stray from basic latin script
    $scope.type = function (event) {
        var keychar = String.fromCharCode(event.which);
        // if it is an allowed letter, enter into field
        if (basics.letterRegEx.test(keychar)) {
            this.field.letter = keychar.toUpperCase();
            event.preventDefault();
            event.stopPropagation();
        }
    };
}]);
