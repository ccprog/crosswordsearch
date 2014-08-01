describe("colorSelect", function () {
    beforeEach(module('crwApp'));

    it("concatenates Words", inject(function ($filter) {
        var input = [
            { word: { letter: 'A' } },
            { word: { letter: 'B' } },
            { word: { letter: '' } },
            { word: { letter: 'D' } },
            { word: { letter: null } },
        ];

        expect($filter('joinWord')(input)).toBe('AB_D_');
    }));
});

describe("EntryController", function () {
    var $root, $scope, basics;

    beforeEach(module('crwApp'));
    beforeEach(inject(function($rootScope, $filter, _basics_, $controller) {
        $root = $rootScope.$new();
        basics = _basics_;
        $scope = $root.$new();
        $scope.crw = { deleteWord: jasmine.createSpy('deleteWord') };
        $scope.word = {};
        $scope.highlight = [2, 4];
        $scope.child = $scope.$new();
        $controller('EntryController', { $filter: $filter, basics: basics, $scope: $scope });
    }));

    it("sets up properties", function () {
        expect($scope.colors).toBe(basics.colors);
        expect($scope.localizeDirection).toBe(basics.localize);
    });

    it("delegates deleteWord", function () {
        $scope.deleteWord(2);

        expect($scope.crw.deleteWord).toHaveBeenCalledWith(2, 'words');
    });

    it("identifies as highlighted", function () {
        $scope.word.ID = 1;
        expect($scope.isHighlighted()).toBeFalsy();

        $scope.word.ID = 2;
        expect($scope.isHighlighted()).toBeTruthy();
    });

    it("stops event propagation", function () {
        var eventHandler = jasmine.createSpy('deleteWord');
        $root.$on('select', eventHandler);
        $scope.child.$emit('select', {});

        expect(eventHandler.calls.any()).toEqual(false);
    });
});