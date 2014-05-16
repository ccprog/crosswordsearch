// image to show in cse select element
crwApp.directive('cseContent', ['basics', function(basics) {
    return {
        scope: {
            value: "="
        },
        template: '<img ng-src="' + basics.pluginPath + 'images/bullet-{{value}}.png">'
    };
}]);

// concatenate letter sequences to a string
// empty fields are shown as "_"
crwApp.filter('joinWord', ['reduce', function (reduce) {
    return function (input) {
        return reduce(input, "", function (result, value) {
            return result + (value.word.letter || "_");
        });
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

// word list entry controller, mostly needed for $filter and colors import
crwApp.controller("EntryController", ["$scope", "$filter", 'basics',
        function ($scope, $filter, basics) {
    $scope.colors = basics.colors;

    // build page only: event handler on "delete" button click
    $scope.deleteWord = function (id) {
        $scope.crw.deleteWord(id, 'words');
    };

    //build page only: localize direction string
    $scope.localizeDirection = basics.localize;
}]);

/* control elements controller */
crwApp.controller("WordController", ["$scope", function ($scope) {
    var deferred, highlight = [];

    // tweak: since ordering on object entries seems not to really work,
    // map them into an Array
    $scope.wordsToArray = function (words) {
        var arr = [];
        angular.forEach(words, function(item) {
            arr.push(item);
        });
        return arr;
    };

    // build page only: event handler for "fill" button:
    // fill all empty fields with a random letter
    $scope.randomize = function () {
        $scope.crw.randomizeEmptyFields();
    };

    // build page only: event handler for "empty" button:
    // empty all fields
    $scope.empty = function () {
        $scope.crw.emptyAllFields();
    };

    // build page only: event handler for "save" button:
    // ask for crossword name
    $scope.save = function () {
        $scope.immediateStore.newPromise('saveCrossword').then(function () {
            $scope.crosswordName = $scope.crosswordData.name;
            $scope.immediate=null;
        });
    };

    // compare id to the highlight list
    $scope.isHighlighted = function (id) {
        for (var i = 0; i < highlight.length; i++) {
            if (highlight[i] === id) {
                return true;
            }
        }
        return false;
    };

    // build page only: deferred handlers for user dialogue in case of
    // table size change
    // register
    $scope.immediateStore.register('invalidWords', function (invalidDeferred, critical) {
        deferred = invalidDeferred;
        // highlight words crossing the new table boundaries
        highlight = critical;
        // word count for string pluralizing
        $scope.invalidCount = critical.length;
        $scope.immediate = 'invalidWords';
    });
    // event handler for "delete" button (resolve)
    $scope.deleteInvalid = function () {
        $scope.immediate=null;
        deferred.resolve();
        highlight = [];
    };
    // event handler for "abort" button (reject)
    $scope.abortInvalid = function () {
        $scope.immediate=null;
        highlight = [];
        deferred.reject();
    };

    // solve page only: deferred handler for user dialogue in case of
    // invalid solution
    // register
    $scope.immediateStore.register('falseWord', function (falseDeferred, word) {
        deferred = falseDeferred;
        // highlight invalid solution
        highlight = [word.ID];
        $scope.immediate = 'falseWord';
    });
    // event handler for "delete" button (resolve as only possible action)
    $scope.deleteFalse = function () {
        $scope.immediate=null;
        deferred.resolve();
        highlight = [];
    };

    // build page only: deferred handler for user dialogue on data upload
    // register
    $scope.immediateStore.register('saveCrossword', function (saveDeferred) {
        deferred = saveDeferred;
        $scope.immediate = 'saveCrossword';
    });
    // event handler for "upload" button
    $scope.upload = function () {
        $scope.crw.saveCrosswordData($scope.crosswordData.name).then(
            deferred.resolve,
            function (error) {
                $scope.saveError = error.error;
                $scope.saveDebug = error.debug;
            }
        );
    };
}]);
