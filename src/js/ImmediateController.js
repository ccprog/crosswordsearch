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
                angular.forEach(store[name], function (callback) {
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
crwApp.directive('crwAddParsers', ["$sanitize", function ($sanitize) {
    return {
        require: 'ngModel',
        link: function (scope, element, attrs, ctrl) {
            var space = /\s+/;
            var parsers = attrs.crwAddParsers.split(space);
            if (parsers.indexOf('unique') >= 0) {
                // test if a crossword name is unique
                ctrl.$parsers.unshift(function(viewValue) {
                    if (scope.loadedName === viewValue || scope.namesInProject.indexOf(viewValue) < 0) {
                        ctrl.$setValidity('unique', true);
                        return viewValue;
                    } else {
                        ctrl.$setValidity('unique', false);
                        return undefined;
                    }
                });
            }
            if (parsers.indexOf('sane') >= 0) {
                // sanitize input field more or less the same way WordPress
                // does on receiving the data
                ctrl.$parsers.unshift(function(viewValue) {
                    // the first two mimic WordPress sanitize_text_field()
                    viewValue = viewValue.replace(space, ' ');
                    var sanitized = viewValue.replace(/<|%[a-f0-9]{2}/, '');
                    sanitized = $sanitize(sanitized);
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
}]);

/* controller for modal area */
crwApp.controller("ImmediateController", ['$scope', function ($scope) {
    var deferred;
    $scope.immediate = null;

    // button event handler
    $scope.finish = function (resolution) {
        $scope.setHighlight([]);
        $scope.saveError = undefined;
        $scope.saveDebug = undefined;
        $scope.immediate=null;
        if (resolution) {
            deferred.resolve();
        } else {
            deferred.reject();
        }
    };

    // deferred handler for blocking input during data download
    // register
    $scope.immediateStore.register('loadCrossword', function (loadDeferred, name) {
        deferred = loadDeferred;
        $scope.immediate = 'loadCrossword';
        $scope.crw.loadCrosswordData(name).then(
            $scope.finish,
            function (error) {
                $scope.immediate=null;
                deferred.reject(error);
            }
        );
    });

    // build page only: deferred handlers for user dialogue in case of
    // table size change
    // register
    $scope.immediateStore.register('invalidWords', function (invalidDeferred, critical) {
        deferred = invalidDeferred;
        // highlight words crossing the new table boundaries
        $scope.setHighlight(critical);
        // word count for string pluralizing
        $scope.invalidCount = critical.length;
        $scope.immediate = 'invalidWords';
    });

    // build page only: deferred handler for user dialogue on data upload
    // register
    $scope.immediateStore.register('saveCrossword', function (saveDeferred, action) {
        deferred = saveDeferred;
        $scope.immediate = 'saveCrossword';
        $scope.action = action;
    });
    // event handler for "upload" button
    $scope.upload = function () {
        $scope.crw.saveCrosswordData(
            // for update, the loadedName is the old name
            $scope.action === 'update' ? $scope.loadedName : $scope.crosswordData.name,
            // if the loadedName has not been altered, it's allways an update
            $scope.loadedName === $scope.crosswordData.name ? 'update' : $scope.action
        ).then(
            $scope.finish,
            function (error) {
                $scope.saveError = error.error;
                $scope.saveDebug = error.debug;
            }
        );
    };

    // solve page only: deferred handler for user dialogue in case of
    // invalid solution
    // register
    $scope.immediateStore.register('falseWord', function (falseDeferred, word) {
        deferred = falseDeferred;
        // highlight invalid solution
        $scope.setHighlight([word.ID]);
        $scope.immediate = 'falseWord';
    });

    // solve page only: deferred handler for user dialogue on completed solution
    // register
    $scope.immediateStore.register('solvedCompletely', function (solvedDeferred) {
        deferred = solvedDeferred;
        $scope.immediate = 'solvedCompletely';
    });

    $scope.$emit('immediateReady');
}]);
