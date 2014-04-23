// prevent letter highlighting and catch angular setFocus events sending
// them to <button> even when the button is hidden under marker images
app.directive('crwSetFocus', function() {
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

// bind/unbind mousedown/mouseup events during letter marking
app.directive('crwCatchDragging', ['$document', function($document) {
    return {
        link: function(scope, element, attrs) {
            // catch mouseup even outside of the table during marking
            var tableMouseDown = function (event) {
                event.preventDefault();
                $document.bind('mouseup', tableMouseUp);
                scope.startMark();
            };
            
            var tableMouseUp = function (event) {
                event.preventDefault();
                $document.unbind('mouseup', tableMouseUp);
                // this is bound to a DOM event, therefore it must be $applied
                scope.$apply(scope.stopMark());
            };
            
            element.bind('mousedown', tableMouseDown);
            $document.bind('mouseup', tableMouseUp);
            element.on('$destroy', function () {
                $document.unbind('mouseup', tableMouseUp);
            });
        }
    };
}]);

// keep the line/column values current when $index changes
app.directive('crwIndexChecker', function() {
    return {
        link: function(scope, element, attrs) {
            scope.$watch('$index', function (newIndex) {
                scope[attrs.crwIndexChecker] = newIndex;
            });
        }
    };
});

/* table and fields controller */

app.controller("TableController", ["$scope", 'basics', 'immediate', "crossword", 'markers',
        function ($scope, basics, immediate, crossword, markers) {
    var isMarking = false, currentMarking, mode;

    // test whether start and stop field are in a straight or diagonal relation
    function validMarking (newStop) {
        var dif_x = currentMarking.start.x - newStop.x,
            dif_y = currentMarking.start.y - newStop.y;
        return Math.abs(dif_x) === Math.abs(dif_y) || dif_x === 0 || dif_y === 0;
    }
   
    // init controller for build and solve page
    $scope.setMode = function (m) {
        mode = m;
        if (mode === 'build') { // build page
            currentMarking = { id: 0 };
            // remove marking for deleted words
            $scope.$watch('crw.words', function (newWords, oldWords) {
                var probe, shift_x = 0, shift_y = 0;
                angular.forEach(oldWords, function (word, id) {
                    if (!newWords[id]) {
                        markers.deleteMarking(id);
                    } else {
                        probe = id;
                    }
                });
                if (probe) {
                    // if there are other markings, test if words have shifted
                    // due to table resize
                    shift_x = newWords[probe].start.x - oldWords[probe].start.x;
                    shift_y = newWords[probe].start.y - oldWords[probe].start.y;
                    if(shift_x !== 0 || shift_y !== 0) {
                        // shift markers the same as words have moved
                        markers.shiftMarkers($scope.crw.words, shift_x, shift_y);
                    }
                }
            }, true);
        }
        if (mode === 'solve') { // solve page
            // find the highest id allocated for words
            var resetId = function () {
                var nextId = 0;
                angular.forEach($scope.crw.words, function (word, id) {
                    nextId = Math.max(nextId, id);
                });
                return nextId;
            };
            // shift marking ids so they never overlap with word ids
            currentMarking = { id: resetId() };
            // remove marking for deleted solutions and colorize valid solutions
            $scope.$watch('crw.solution', function (newWords, oldWords) {
                angular.forEach(oldWords, function (word, id) {
                    if (!newWords[id]) {
                        markers.deleteMarking(word.markingId);
                    }
                });
                var probe = false;
                angular.forEach(newWords, function (word, id) {
                    if (!oldWords[id]) {
                        markers.exchangeMarkers(word.fields, currentMarking.id, word.color);
                    }
                    probe = true;
                });
                // reset marking ids if no solutions are present,
                // i. e. after a new crossword has been loaded
                if (!probe) {
                    currentMarking.id = resetId();
                }
            }, true);
        }
    };

    // retrieve the markers for a field
    $scope.getMarks = function (line, column) {
        return markers.getMarks(column, line);
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
        currentMarking = { id: currentMarking.id+1 };
        // during build markings get a random color,
        // unconfirmed markings during solve remain grey
        currentMarking.color = mode === 'build' ? crossword.randomColor() : 'grey';
    };

    // event handler on mouseup in a field:
    // stop marking and evaluate
    $scope.stopMark = function () {
        isMarking = false;
        // is the marking longer than only one field
        if (!angular.equals(currentMarking.start, currentMarking.stop)) {
            if (mode === 'build') {
                // on build page save new marking as word
                crossword.setWord(currentMarking);
            } else {
                // on solve page test if marking is a valid solution
                var word = crossword.probeWord(currentMarking);
                if (!word.solved) {
                    // if not, inform user and delete the marking on confirmation
                    immediate.newPromise('falseWord', word).then(function () {
                        crossword.deleteWord(currentMarking.id, 'solution');
                    });
                }
            }
        } else {
            // delete one-field markings
            markers.deleteMarking(currentMarking.id);
        }
    };

    // event handler on mouseenter
    $scope.intoField = function (row, col) {
        var newStop = {x: col, y:row};
        // draw marking only for valid directions
        if (isMarking && currentMarking.start && validMarking(newStop)) {
            currentMarking.stop = newStop;
            markers.setNewMarkers(currentMarking);
        }
    };
    // event handler on mouseleave
    $scope.outofField = function (row, col) {
        // only on the first mouseleave after startMark identify starting field
        // and set first marking
        if (isMarking && !currentMarking.start) {
            currentMarking.start = currentMarking.stop = {x: col, y:row};
            markers.setNewMarkers(currentMarking);
        }
    };

    // event handler on keypress
    // beware of the weirdness:
    // test everything here, including basics.letterRegEx(lang)
    // for compatibility with browsers, OS and hardware
    // if you stray from basic latin script
    $scope.type = function (event) {
        // extract the letter from event data the best way you can
        var key = event.charCode || event.keyCode || event.which;
        var keychar = String.fromCharCode(key);
        // if it is an allowed letter, enter into field
        if (basics.letterRegEx().test(keychar)) {
            this.field.letter = keychar.toUpperCase();
        } else switch (key) {
        // else catch special keys:
        // delete letter
        case 0x08: //backspace
        case 0x2E: //delete
            this.field.letter = null;
            break;
        // move focus
        case 0x25: //left
            if (this.column > 0) {
                this.activate(this.line,this.column-1);
            }
            break;
        case 0x26: //up
            if (this.line > 0) {
                this.activate(this.line-1,this.column);
            }
            break;
        case 0x27: //right
            if (this.column < this.row.length - 1) {
                this.activate(this.line,this.column+1);
            }
            break;
        case 0x28: //down
            if (this.line < this.crw.content.length - 1) {
                this.activate(this.line+1,this.column);
            }
            break;
        }
    };
}]);
