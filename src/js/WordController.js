// image to show in cse select element
app.directive('cseContent', ['basics', function(basics) {
    return {
        scope: {
            value: "="
        },
        template: '<img ng-src="' + basics.pluginPath + 'images/bullet-{{value}}.png">'
    };
}]);

// concatenate letter sequences to a string
// empty fields are shown as "_"
app.filter('joinWord', function () {
    return function (input) {
        var word = "";
        angular.forEach(input, function (val) {
            word += val.word.letter || "_";
        });
        return word;
    };
});

// template for user dialogue in case of table size change
// and when a word crosses the table boundaries
// user can confirm deletion or abort
app.directive('crwInvalidWords', function() {
    return {
        template: '<p ng-pluralize count="invalidCount" when="{' +
            '\'one\': \'Das markierte Wort passt nicht mehr vollständig in das Rätselfeld. ' +
            'Um die Größe anzupassen, muss es gelöscht werden.\',' +
            '\'other\': \'Die markierten Wörter passen nicht mehr vollständig in das Rätselfeld. ' +
            'Um die Größe anzupassen, müssen sie gelöscht werden.\'}"></p>' +
            '<p class="actions">' +
            '<button ng-click="deleteInvalid()">Löschen</button> ' +
            '<button ng-click="abortInvalid()">Abbrechen</button></p>'
    };
});

// template for user dialogue for saving a crossword
// TODO: yet only a stub
app.directive('crwSaveCrossword', function() {
    return {
        template: '<form name="uploader">' + 
            '<p>Zum Speichern muss das Rätsel einen Namen erhalten (mindestens 4 Buchstaben):</p>' +
            '<p class="actions">' +
            '<input type="text" ng-model="crw.name" name="name" required="" ng-minlength="4"> ' +
            '<button ng-disabled="!uploader.name.$valid" ng-click="upload()">Speichern</button></p>' +
            '<p class="error" ng-show="uploader.name.$error.required">' +
            'Ein Name muss angegeben werden!</p>' +
            '<p class="error" ng-show="uploader.name.$error.minlength">' +
            'Der Name ist zu kurz!</p>' +
            '<p class="confirm" ng-show="uploader.name.$valid">' +
            'So geht\'s!</p>' +
            '</form>'
    };
});

// template for user dialogue in case of invalid solution
// on user ok click the solution entry is removed immediately
app.directive('crwFalseWord', function() {
    return {
        template: '<p>Das markierte Wort ist kein Teil der Lösung.</p>' +
            '<p class="actions">' +
            '<button ng-click="deleteFalse()">Löschen</button></p>'
    };
});

// word list entry controller, mostly needed for $filter and colors import
app.controller("EntryController", ["$scope", "$filter", "crossword", 'basics',
        function ($scope, $filter, crossword, basics) {
    $scope.colors = basics.colors;

    // build page only: event handler on "delete" button click
    $scope.deleteWord = function (id) {
        crossword.deleteWord(id, 'words');
    };
}]);

/* control elements controller */
app.controller("WordController", ["$scope", "$sanitize", "crossword", 'immediate',
        function ($scope, $sanitize, crossword, immediate) {
    var deferred, highlight = [];
    $scope.crw = crossword.getCrossword();

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
        crossword.randomizeEmptyFields();
    };

    // build page only: event handler for "empty" button:
    // empty all fields
    $scope.empty = function () {
        crossword.emptyAllFields();
    };

    // solve page only: event handler for "load" button:
    // load a crossword TODO: really load from server
    $scope.load = function () {
        crossword.loadCrossword();
        $scope.crw = crossword.getCrossword();
    };

    // build page only: event handler for "save" button:
    // ask for crossword name
    $scope.save = function () {
        immediate.newPromise('saveCrossword').then(function () {
            $scope.crw.name = $sanitize($scope.crw.name);
            console.log(angular.toJson($scope.crw));
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
