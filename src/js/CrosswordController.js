/* wrapper controller for single crossword instance */
crwApp.controller("CrosswordController", ['$scope', 'crosswordFactory', function ($scope, crosswordFactory) {
    $scope.crw = crosswordFactory.getCrw();
}]);
