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

// sanitize input field more or less the same way WordPress
// does on receiving the data
crwApp.directive('crwSaneInput', ["$sanitize", function ($sanitize) {
    return {
        require: 'ngModel',
        link: function (scope, element, attrs, ctrl) {
            ctrl.$parsers.unshift(function(viewValue) {
                // the first two mimic WordPress sanitize_text_field()
                viewValue = viewValue.replace(/\s+/, ' ');
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
    };
}]);

/* controller for modal area */
crwApp.controller("ImmediateController", ['$scope', function ($scope) {
    var deferred;
    $scope.immediate = null;

    // button event handler
    $scope.finish = function (resolution) {
        $scope.setHighlight([]);
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
        // highlight words crossing the new table boundaries
        $scope.setHighlight(critical);
        // word count for string pluralizing
        $scope.invalidCount = critical.length;
        $scope.immediate = 'invalidWords';
    });

    // solve page only: deferred handler for user dialogue in case of
    // invalid solution
    // register
    $scope.immediateStore.register('falseWord', function (falseDeferred, word) {
        deferred = falseDeferred;
        // highlight invalid solution
        $scope.setHighlight([word.ID]);
        $scope.immediate = 'falseWord';
    });

    // build page only: deferred handler for user dialogue on data upload
    // register
    $scope.immediateStore.register('saveCrossword', function (saveDeferred) {
        deferred = saveDeferred;
        $scope.immediate = 'saveCrossword';
    });
    // event handler for "upload" button
    $scope.upload = function () {
        $scope.crw.saveCrosswordData($scope.crosswordData.name).then(
            $scope.finish,
            function (error) {
                $scope.saveError = error.error;
                $scope.saveDebug = error.debug;
            }
        );
    };
}]);
