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
crwApp.filter('joinWord', function () {
    return function (input) {
        var word = "";
        angular.forEach(input, function (val) {
            word += val.word.letter || "_";
        });
        return word;
    };
});

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
crwApp.controller("WordController", ["$scope", "$sanitize", 'immediate',
        function ($scope, $sanitize, immediate) {
    var deferred, highlight = [];
    $scope.crosswordData = $scope.crw.getCrosswordData();

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

    // solve page only: event handler for "load" button:
    // load a crossword TODO: really load from server
    $scope.load = function () {
        $scope.crw.loadCrosswordData();
    };

    // build page only: event handler for "save" button:
    // ask for crossword name
    $scope.save = function () {
        immediate.newPromise('saveCrossword').then(function () {
            $scope.crosswordData.name = $sanitize($scope.crosswordData.name);
            console.log(angular.toJson($scope.crosswordData));
        }, angular.noop);
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
    immediate.register('invalidWords', function (invalidDeferred, critical) {
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
    immediate.register('falseWord', function (falseDeferred, word) {
        deferred = falseDeferred;
        // highlight invalid solution
        highlight = [word.id];
        $scope.immediate = 'falseWord';
    });
    // event handler for "delete" button (resolve as only possible action)
    $scope.deleteFalse = function () {
        $scope.immediate=null;
        deferred.resolve();
        highlight = [];
    };

    immediate.register('saveCrossword', function (saveDeferred) {
        deferred = saveDeferred;
        $scope.immediate = 'saveCrossword';
    });
    $scope.upload = function () {
        $scope.immediate=null;
        deferred.resolve();
    };
}]);
