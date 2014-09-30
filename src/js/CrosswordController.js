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
    $scope.count = {
        words: 0,
        solution: 0
    };
    $scope.levelList = $scope.crw.getLevelList();

    // build page only: data object for command menu
    // move the namesIn Project list into the command sub-menu
    function updateLoadList (names) {
        jQuery.grep($scope.commandList, function(command) {
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
    $scope.prepare = function (project, nonceCrossword, nonceEdit, name, restricted) {
        $scope.crw.setProject(project, nonceCrossword, nonceEdit, restricted);
        // init command data object and menu
        if (restricted) {
            $scope.commandState = 'restricted';
            delete $scope.commands.load;
            delete $scope.commands.insert;
        }
        $scope.commandList = jQuery.map($scope.commands, function (value, command) {
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
            $scope.load(name);
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
        // execute load command on submenu selection
        case 'command.sub':
        case 'load':
            $scope.$evalAsync('load("' + value + '")');
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
                    angular.forEach(critical, function (id) {
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
    $scope.$on('previewProject', function (event, project) {
        $scope.crw.setProject(project);
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
        updateNames();
        $scope.count.words = 0;
        angular.forEach($scope.crosswordData.words, function(word) {
            // count words in words/solution object
            $scope.count.words++;
            // refresh data binding for word objects
            $scope.crw.setWord(word);
        });
        $scope.count.solution = 0;
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

    // preview page only: load crossword on message sent by PreviewController
    $scope.$on('previewCrossword', function (event, name) {
        $scope.load(name);
    });

    // solve page only: restart the loaded riddle
    $scope.restart = function () {
        if (!$scope.crw.getLevelRestriction('sol')) {
            $scope.crosswordData.solution = {};
        } else {
            angular.forEach($scope.crosswordData.solution, function (word) {
                word.solved = false;
            });
        }
        $scope.count.solution = 0;
    };

    // solve page only: notify on complete solution
    $scope.$watch('count.solution', function(s) {
        if (s > 0 && s === $scope.count.words) {
            $scope.immediateStore.newPromise('solvedCompletely');
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

}]);
