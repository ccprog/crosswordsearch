// image to show in cse select element
crwApp.directive('colorSelect', ['basics', function(basics) {
    return {
        scope: { value: "=" },
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

// word list entry controller, mostly needed for $filter and colors import
crwApp.controller("EntryController", ["$scope", "$filter", 'basics',
        function ($scope, $filter, basics) {
    $scope.colors = basics.colors;

    // compare id to the highlight list
    $scope.isHighlighted = function () {
        for (var i = 0; i < $scope.highlight.length; i++) {
            if ($scope.highlight[i] === $scope.word.ID) {
                return true;
            }
        }
        return false;
    };

    // build page only: event handler on "delete" button click
    $scope.deleteWord = function (id) {
        $scope.crw.deleteWord(id, 'words');
    };

    //build page only: localize direction string
    $scope.localizeDirection = basics.localize;
}]);
