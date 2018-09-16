crwApp.factory('containsNode', function () {
    return function (sel, el) {
        if (sel.containsNode) {
            return sel.containsNode(el, true);
        }
        for (var node, i = 0; i < sel.rangeCount; i++) {
            node = sel.getRangeAt(i).commonAncestorContainer;
            if (node.parentNode === el || node.contains(el)) {
                return true;
            }
        }
        return false;
    };
});

crwApp.directive('contenteditable', ['basics', 'containsNode', function (basics, containsNode) {
    return {
        require: 'ngModel',
        link: function (scope, element, attrs, ctrl) {
            element.on('mousemove', function (event) {
                event.preventDefault();
            });
            element.on('focus', function (event) {
                window.getSelection().selectAllChildren(element[0]);
            });
            scope.$on('setFocus', function (event, line, column) {
                if (line === scope.line && column === scope.column) {
                    window.getSelection().removeAllRanges();
                    element[0].focus();
                }
            });

            function move (event) {
                event.stopPropagation();
                // Firefox has a keypress event for Ctrl+V pasting
                if (scope.move(event.key) || event.ctrlKey) {
                    event.preventDefault();
                }
            }
            element.on('keydown', function (event) {
                scope.$apply(move(event));
            });

            function type (letter) {
                if (basics.letterRegEx.test(letter)) {
                    letter = basics.normalizeLetter(letter);
                    ctrl.$setViewValue(letter);
                } else {
                    ctrl.$render();
                }
            }
            element.on('keypress', function (event) {
                event.preventDefault();
                event.stopPropagation();
                type(event.key);
            });
            // Firefox/Linux gets no keypress events on diacritics, but needs the
            // keypress anyway, otherwise double key entries play silly buggers
            element.on('input', function (event) {
                type(element.text());
            });
            element.on('paste', function (event) {
                event.preventDefault();
            });

            ctrl.$viewChangeListeners.push(function () {
                ctrl.$render();
            });

            ctrl.$render = function() {
                element.text(ctrl.$modelValue || '');
                var sel = window.getSelection();
                if (containsNode(sel, element[0])) {
                    sel.selectAllChildren(element[0]);
                }
            };
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
        isMarking = $scope.timer ? $scope.timer.state === 'playing' : true;
        currentMarking = { ID: currentMarking.ID+1 };
        // during build markings get a random color,
        // unconfirmed markings during solve remain grey
        currentMarking.color = mode === 'build' ? $scope.crw.randomColor() : 'grey';
    };

    function dropMarking () {
        if (isMarking) {
            if (mode === 'solve') {
                $scope.crw.deleteWord(currentMarking.ID, 'solution');
            }
            $scope.markers.deleteMarking(currentMarking.ID);
            isMarking = false;
        }
    }
    $scope.$on('markingStop', dropMarking);

    // event handler on mouseup in a field:
    // stop marking and evaluate
    $scope.stopMark = function () {
        var word;

        if (!isMarking) {
            return;
        }
        // is the marking longer than only one field
        if (!angular.equals(currentMarking.start, currentMarking.stop)) {
            if (mode === 'build') {
                // on build page save new marking as word
                word = $scope.crw.setWord(currentMarking);
                if (!word) {
                    // drop silently if word was marked previously
                    dropMarking();
                }
            } else {
                // on solve page test if marking is a valid solution
                word = $scope.crw.probeWord(currentMarking);
                if (word.solved) {
                    $scope.count.solution++;
                } else if (word.solved === null) {
                    // drop silently if solution was found previously
                    dropMarking();
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
        isMarking = false;
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
    $scope.move = function (key) {
        switch (key) {
        case 'Del':
        case 'Delete':
        case 'Backspace':
            this.field.letter = null;
            return true;
        case 'Left':
        case 'ArrowLeft':
            if (this.column > 0) {
                this.activate(this.line,this.column-1);
            }
            return true;
        case 'Up':
        case 'ArrowUp':
            if (this.line > 0) {
                this.activate(this.line-1,this.column);
            }
            return true;
        case 'Right':
        case 'ArrowRight':
            if (this.column < this.row.length - 1) {
                this.activate(this.line,this.column+1);
            }
            return true;
        case 'Down':
        case 'ArrowDown':
                if (this.line < this.crosswordData.table.length - 1) {
                this.activate(this.line+1,this.column);
            }
            return true;
        }
    };
}]);
