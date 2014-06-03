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
        template: '{{value.display || value}}'
    };
}]);

/* wrapper controller for single crossword instance */
crwApp.controller("CrosswordController", ['$scope', 'qStore', 'basics', 'crosswordFactory',
		function ($scope, qStore, basics, crosswordFactory) {
    $scope.crw = crosswordFactory.getCrw();
	$scope.immediateStore = qStore.addStore();
    $scope.highlight = [];
    $scope.count = {
        words: 0,
        solution: 0
    };

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
    // init commant data object
    $scope.commandList = jQuery.map($scope.commands, function (value, command) {
        var obj = basics.localize(command, 'action');
        obj.value = command;
        if (command === 'load') {
            obj.group = [];
        }
        return obj;
    });
    // execute command on menu selection
    $scope.$on('select', function(event, entry) {
        var task;
        if ($scope.namesInProject.indexOf(entry) < 0) {
            // named command
            task = $scope.commands[entry];
        } else {
            // load by name command
            task = 'load("' + entry + '")';
        }
        $scope.$evalAsync(task);
    });

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
        updateLoadList($scope.namesInProject);
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
    $scope.save = function (action) {
        // redirect to insert if no name yet exists
        if (!$scope.crosswordData.name) {
            action = 'insert';
        }
        $scope.immediateStore.newPromise('saveCrossword', action).then(function () {
            $scope.namesInProject = $scope.crw.getNamesList();
            updateLoadList($scope.namesInProject);
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
