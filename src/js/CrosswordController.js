// command menu data binding directive
crwApp.directive("crwMenu", ["$compile", function($compile) {
    return {
        scope: { value: "=" },
        link: function (scope, element, attrs) {
            scope.$watch('value', function(val) {
                element.attr('title', scope.value.title);
            });
        },
        template: '<span crw-bind-trusted="value.display || value"></span>'
    };
}]);

crwApp.constant('combiningRegExp',  /^[^\u02B0-\u036F\u064B-\u065F\u1AB0-\u1AFF\u1DC0-\u1DFF][\u02B0-\u036F\u064B-\u065F\u1AB0-\u1AFF\u1DC0-\u1DFF]+$/);

crwApp.directive('crwLetterInput', ['combiningRegExp', function (combiningRegExp) {
    return {
        link: function (scope, element) {
            var line, column;
            var combined = '';

            scope.$on('setFocus', function (event, l, c) {
                element[0].focus();
                line = l; column = c;
                combined = '';
            });

            element.on('keydown', function (event) {
                event.stopPropagation();
                switch (event.key) {
                case 'Del':
                case 'Delete':
                case 'Backspace':
                    scope.$apply(scope.setLetter(null, line, column));
                    return event.preventDefault();
                case 'Left':
                case 'ArrowLeft':
                    if (column > 0) {
                        scope.activate(line, column - 1);
                    }
                    return event.preventDefault();
                case 'Up':
                case 'ArrowUp':
                    if (line > 0) {
                        scope.activate(line - 1, column);
                    }
                    return event.preventDefault();
                case 'Right':
                case 'ArrowRight':
                    if (column < scope.crosswordData.size.width - 1) {
                        scope.activate(line, column + 1);
                    }
                    return event.preventDefault();
                case 'Down':
                case 'ArrowDown':
                        if (line < scope.crosswordData.size.height - 1) {
                        scope.activate(line + 1, column);
                    }
                    return event.preventDefault();
                }
                if (event.ctrlKey) {
                    event.preventDefault();
                }
            });

            element.on('input', function (event) {
                var letter = element.val();
                if (combiningRegExp.test(combined + letter)) {
                    combined += letter;
                } else {
                    combined = letter;
                }
                scope.$apply(scope.setLetter(combined, line, column));
                element.val(null);
            });

            element.on('paste', function (event) {
                event.preventDefault();
            });

            element.on('blur', function () {
                scope.$broadcast('setFocus', -1, -1);
            });
        }
    };
}]);

/* wrapper controller for single crossword instance */
crwApp.controller("CrosswordController", ['$scope', 'qStore', 'basics', 'crosswordFactory',
		function ($scope, qStore, basics, crosswordFactory) {
    // immediateStore and crw might have been initialized by wrapping AdminController
    if (!$scope.crw) {
        $scope.crw = crosswordFactory.getCrw();
    }
    if (!$scope.immediateStore) {
        $scope.immediateStore = qStore.addStore();
    }

    // full: has command list, restricted: no command list,
    // preview: bypasses command list for load
    $scope.commandState = 'full';
    $scope.highlight = [];
    $scope.levelList = $scope.crw.getLevelList();
    $scope.riddleVisible = true;
    $scope.waitsForData = true;

    // build page only: data object for command menu
    // move the namesIn Project list into the command sub-menu
    function updateLoadList (names) {
        $scope.commandList.filter(function(command) {
            return command.value === 'load';
        })[0].group = names;
    }
    // mapping of command names to command expressions
    $scope.commands = {
        'new': 'load()',
        'load': 'group',
        'update': 'save("update")',
        'insert': 'save("insert")',
        'reload': 'load(loadedName)'
    };

    // init crossword at page load time
    $scope.prepare = function (project, nonceCrossword, nonceEdit, attr, name) {
        $scope.crw.setProject(project, nonceCrossword, nonceEdit, attr === 'restricted');
        switch (attr) {
        case 'restricted': // restricted build mode
            $scope.commandState = 'restricted';
            delete $scope.commands.load;
            delete $scope.commands.insert;
            break;
        case 'timer': // competitive solve mode
            $scope.riddleVisible = false;
            $scope.$watch('timer.state', function (newState, oldState) {
                if (newState === 'playing') {
                    // make riddle visible
                    $scope.riddleVisible = true;
                } else if (oldState === 'scored' && newState === 'waiting') {
                    // restart an already solved riddle
                    $scope.restart();
                } else if (oldState === 'playing' && newState !== 'waiting') {
                    $scope.$broadcast('markingStop');
                    // user feedback after game stops
                    var dialogue = $scope.timer.submitting ?
                        'submitSolution' : 'solvedCompletely';
                    $scope.immediateStore.newPromise(dialogue, $scope.timer.time);
                }
            });
            break;
        }
        // init command data object and menu
        $scope.commandList = Object.keys($scope.commands).map(function (command) {
            var obj = basics.localize(command);
            obj.value = command;
            if (command === 'load') {
                obj.menu = obj.display;
                obj.group = [];
            }
            return obj;
        });
        // load data
        var deregister = $scope.$on('immediateReady', function () {
            $scope.load($scope.commandState === 'restricted' ? null : name);
            deregister();
        });
    };

    $scope.$on('cseSelect', function(event, source, value) {
        event.stopPropagation();
        switch (source) {
        // execute command on menu selection
        case 'command':
            $scope.$evalAsync($scope.commands[value]);
            break;
        // execute load command on build submenu selection
        case 'command.sub':
            $scope.$evalAsync('load("' + value + '")');
            break;
        // execute restart or load on solve menu selection
        case 'load':
            // do not reload unnecessarily
            if ($scope.crosswordData && (value === $scope.loadedName)) {
                $scope.$evalAsync('restart()');
            } else {
                $scope.$evalAsync('load("' + value + '")');
            }
            break;
        // build page only: test directions on level downgrade
        case 'level':
            var critical = $scope.crw.testDirection();
            var oldLevel = $scope.crosswordData.level;
            if (!(value & 1) && critical.length) {
                // highlight words with invalid directions
                $scope.setHighlight(critical);
                // ask user whether change should be applied.
                var arg = {count: critical.length, level: value};
                $scope.immediateStore.newPromise('invalidDirections', arg).then(function () {
                    // yes: delete words.
                    critical.forEach(function (id) {
                        $scope.crw.deleteWord(id, 'words');
                    });
                }, function () {
                    // no: reset level
                    $scope.$evalAsync('crosswordData.level=' + oldLevel); //late enough?
                })['finally'](function () {
                    $scope.setHighlight([]);
                });
            }
            break;
        }
    });

    // preview page only: set current project on message sent by PreviewController
    $scope.$on('previewProject', function (event, project, nonceCrossword) {
        $scope.crw.setProject(project, nonceCrossword);
    });

    // tweak: since ordering on object entries seems not to really work,
    // map them into an Array
    $scope.wordsToArray = function (words) {
        var arr = [];
        angular.forEach(words, function(item) {
            arr.push(item);
        });
        return arr;
    };

    // adjust names list in menu
    var updateNames = function () {
        if ($scope.commandState === 'full') {
            $scope.namesInProject = $scope.crw.getNamesList();
            updateLoadList($scope.namesInProject);
        }
        $scope.loadedName = $scope.crosswordData.name;
        $scope.setHighlight([]);
    };

    // get model data up to speed after loading
    var updateModel = function () {
        $scope.crosswordData = $scope.crw.getCrosswordData();
        $scope.levelList = $scope.crw.getLevelList();
        $scope.count = $scope.crw.getCount();
        updateNames();
        if (typeof $scope.timer === 'object') {
            $scope.riddleVisible = false;
            $scope.$broadcast('timerInit');
        }
        $scope.waitsForData = false;
    };

    $scope.setHighlight = function (h) {
        $scope.highlight = h;
    };

    // load a crossword
    $scope.load = function (name) {
        $scope.loadError = null;
        // if the page shortcode explicitely sets name='', it will be routed
        // through by $scope.prepare.
        if (name || typeof name === 'string') {
            $scope.waitsForData = true;
            $scope.crw.loadCrosswordData(name).then(
                updateModel,
                function (error) {
                    $scope.loadError = error;
                }
            );
        } else {
            $scope.waitsForData = false;
            $scope.crw.loadDefault();
            updateModel();
        }
    };

    // preview page only: load crossword on message sent by PreviewController
    $scope.$on('previewCrossword', function (event, name) {
        $scope.load(name);
    });

    // solve page only: restart the loaded riddle
    $scope.restart = function () {
        if ($scope.timer) {
            if ($scope.timer.submitting) {
                return;
            }
            $scope.riddleVisible = false;
            $scope.$broadcast('timerInit');
        }
        if (!$scope.crw.getLevelRestriction('sol')) {
            Object.keys($scope.crosswordData.solution).forEach(function (id) {
                delete $scope.crosswordData.solution[id];
            });
        }
        angular.forEach($scope.crosswordData.words, function (word) {
            word.solved = false;
        });
        $scope.count.solution = 0;
    };

    // solve page only: notify on complete solution
    $scope.$watch('count.solution', function(s) {
        if (s > 0 && s === $scope.count.words) {
            if ($scope.timer) {
                $scope.$broadcast('timerStop');
            } else {
                $scope.immediateStore.newPromise('solvedCompletely');
            }
        }
    });

    // build page only: open save user dialogue
    $scope.save = function (action) {
        // redirect to insert if no name yet exists
        if (!$scope.crosswordData.name) {
            action = 'insert';
        }
        $scope.immediateStore.newPromise('saveCrossword', action).then(updateNames);
    };

    // build page only: fill all empty fields with a random letter
    $scope.randomize = function () {
        $scope.crw.randomizeEmptyFields();
    };

    // build page only:  empty all fields
    $scope.empty = function () {
        $scope.crw.emptyAllFields();
    };

    $scope.activate = function (row, col) {
        $scope.$broadcast('setFocus', row, col);
    };

    $scope.setLetter = function(letter, line, column) {
        if (letter === null) {
            $scope.crosswordData.table[line][column].letter = null;
        } else if (basics.letterRegEx.test(letter)) {
            $scope.crosswordData.table[line][column].letter = basics.normalizeLetter(letter);
        }
    };
}]);
