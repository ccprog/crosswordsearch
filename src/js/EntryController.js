// image to show in cse select element
crwApp.directive('colorSelect', ['basics', function(basics) {
    return {
        scope: { value: "=" },
        link: function (scope, element, attrs) {
            scope.localize = basics.localize;
        },
        template: '<svg title="{{localize(value)}}"  class="crw-marker" ng-class="value"><use xlink:href="#crw-bullet"/></svg>'
    };
}]);

// concatenate letter sequences to a string
// empty fields are shown as "_"
crwApp.filter('joinWord', function () {
    return function (input) {
        return input.reduce(function (result, value) {
            return result + (value.word.letter || "_");
        }, "");
    };
});

// word list entry controller, mostly needed for $filter and colors import
crwApp.controller("EntryController", ["$scope", "$filter", 'basics',
        function ($scope, $filter, basics) {
    $scope.colors = basics.colors;
    $scope.textIsLTR = basics.textIsLTR;

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

    //localize color and direction string
    $scope.localize = basics.localize;

    // color selection goes no further
    $scope.$on('select', function(event) {
        event.stopPropagation();
    });
}]);
