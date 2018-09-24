/* cross scope relay for deferred functions */
crwApp.factory('qStore', ['$q', function ($q) {
    function Store () {
		// deferred listening hooks cache
		var store = {};
        // listeners can register callback functions that will provide
        // them with a deferred object and one optional argument they can
        // relate to the resolver functions.
        // callbacks must take the form function(deferred, arg)
        this.register = function (name, callback) {
            if (!store[name]) {
                store[name] = [];
            }
            store[name].push(callback);
        };

        // providers start deferred execution by calling this
        // with the argument for the listeners.
        // The promise object is returned.
        this.newPromise = function (name, arg) {
            var deferred = $q.defer();
            if (store[name]) {
                store[name].forEach(function (callback) {
                    callback(deferred, arg);
                });
            }
            return deferred.promise;
        };
	}
	return {
		addStore: function () {
			return new Store();
		}
	};
}]);

/* input validity parsers for upload form */
crwApp.directive('crwAddParsers', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attrs, ctrl) {
            var space = /\s+/;
            var parsers = attrs.crwAddParsers.split(space);
            if (parsers.indexOf('unique') >= 0) {
                // test if a crossword name is unique and exclude reserved words
                var uniques = attrs.crwUnique.split(space);
                ctrl.$parsers.unshift(function(viewValue) {
                    if (viewValue === undefined) {
                        return viewValue;
                    }
                    var blacklist, i, result = viewValue;
                    for (i = 0; i < uniques.length; i++) {
                        blacklist = scope.$eval(uniques[i]);
                        if (Array.isArray(blacklist)) {
                            if (blacklist.indexOf(viewValue) >= 0) {
                                result = undefined;
                            }
                            continue;
                        } else if (typeof blacklist === 'object') {
                            if (blacklist.hasOwnProperty(viewValue)) {
                                result = undefined;
                            }
                            continue;
                        } else if (typeof blacklist === 'string' && blacklist === viewValue) {
                            result = undefined;
                            continue;
                        }
                    }
                    ctrl.$setValidity('unique', result !== undefined);
                    return result;
                });
            }
            if (parsers.indexOf('sane') >= 0) {
                // sanitize input field more or less the same way WordPress
                // does on receiving the data
                ctrl.$parsers.unshift(function(viewValue) {
                    viewValue = viewValue.replace(space, ' ');
                    var sanitized = viewValue.replace(/<|%[a-f0-9]{2}/, '');
                    if (sanitized === viewValue) {
                        ctrl.$setValidity('sane', true);
                        return viewValue;
                    } else {
                        ctrl.$setValidity('sane', false);
                        return undefined;
                    }
                });
            }
        }
    };
});

crwApp.directive('crwHasPassword', function () {
    return {
        link: function (scope, element, attrs, ctrl) {
            element.find("input[type=submit]").on('click', function () {
                scope.password = null;
            });
            element.on('$destroy', function () {
                element.find("[required]").attr('required', null);
            });
        }
    };
});

/* controller for modal area */
crwApp.controller("ImmediateController", ['$scope', '$sce', function ($scope, $sce) {
    var deferred;
    $scope.immediate = null;

    // button event handler
    $scope.finish = function (resolution) {
        $scope.saveError = undefined;
        $scope.saveDebug = undefined;
        $scope.immediate=null;
        if (resolution) {
            deferred.resolve();
        } else {
            deferred.reject();
        }
    };

    // build page only: deferred handlers for user dialogue in case of
    // table size change
    // register
    $scope.immediateStore.register('invalidWords', function (invalidDeferred, critical) {
        deferred = invalidDeferred;
        $scope.message = {
            which: 'invalid_words',
            // word count for string pluralizing
            count: critical.length,
            buttons: {
                'delete': true,
                'abort': true
            }
        };
        $scope.immediate = 'dialogue';
    });

    $scope.immediateStore.register('invalidDirections', function (invalidDeferred, arg) {
        deferred = invalidDeferred;
        $scope.message = {
            which: 'invalid_directions',
            count: arg.count,
            level: arg.level,
            buttons: {
                'delete': true,
                'abort': true
            }
        };
        $scope.immediate = 'dialogue';
    });

    function showSaveError (error) {
        $scope.progress = 0;
        $scope.saveError = error.error;
        $scope.saveDebug = error.debug;
    }

    function setupSolutionMessage (time) {
        $scope.message = {
            which: 'solved_completely',
            buttons: {
                'ok': true
            }
        };
        if ($scope.count.words > $scope.count.solution) {
            // incomplete solution
            $scope.message.which = 'solved_incomplete';
            $scope.message.words = $scope.count.words;
            $scope.message.solution = $scope.count.solution;
        }
        // complete solution might have time
        $scope.message.time = time || 'false';
    }

    // build page only: deferred handler for user dialogue on data upload
    // register
    $scope.immediateStore.register('saveCrossword', function (saveDeferred, action) {
        deferred = saveDeferred;
        $scope.immediate = 'save_crossword';
        $scope.action = action;
    });
    // event handler for "upload" button
    $scope.upload = function (username, password) {
        $scope.crw.saveCrosswordData(
            // for update, the loadedName is the old name
            $scope.action === 'update' ? $scope.loadedName : $scope.crosswordData.name,
            // if the loadedName has not been altered, it's always an update
            $scope.loadedName === $scope.crosswordData.name ? 'update' : $scope.action,
            // username and password are empty for logged-in editors
            username, password
        ).then($scope.finish, showSaveError);
    };

    // solve page only: deferred handler for user dialogue in case of
    // invalid solution
    // register
    $scope.immediateStore.register('falseWord', function (falseDeferred, word) {
        deferred = falseDeferred;
        $scope.message = {
            which: 'false_word',
            word: word,
            buttons: {
                'delete': true
            }
        };
        $scope.immediate = 'dialogue';
    });

    // solve page only: deferred handler for user dialogue on completed solution
    // register
    $scope.immediateStore.register('solvedCompletely', function (solvedDeferred, time) {
        deferred = solvedDeferred;
        setupSolutionMessage(time);
        $scope.immediate = 'dialogue';
    });

    // solve page only: deferred handler for user dialogue on solution submission
    $scope.immediateStore.register('submitSolution', function (submitDeferred, time) {
        deferred = submitDeferred;
        setupSolutionMessage(time);
        $scope.progress = 0;
        $scope.immediate = 'submit_solution';
    });
    // event handler for "submit" button
    $scope.submit = function (username, password) {
        switch ($scope.progress) {
        case 0:
            $scope.saveError = undefined;
            $scope.saveDebug = undefined;
            $scope.progress = 1;
            $scope.crw.submitSolution(
                ($scope.message.time / 1000).toFixed(1),
                username, password
            ).then(function (message) {
                if (message.length) {
                    $scope.progress = 2;
                    $scope.message.feedback = $sce.trustAsHtml(message);
                } else {
                    $scope.finish(true);
                }
            }, showSaveError);
            break;
        case 2:
            $scope.finish(true);
            break;
        }
    };

    // admin page only: deferred handler for security confirmation user dialogue
    // register
    $scope.immediateStore.register('actionConfirmation', function (actionDeferred, message) {
        deferred = actionDeferred;
        $scope.message = angular.extend(message, {
            buttons: {
                'ok': true,
                'abort': true
            }
        });
        $scope.immediate = 'dialogue';
    });

    $scope.$emit('immediateReady');
}]);
