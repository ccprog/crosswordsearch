describe("contenteditable", function() {
    var $scope, element;

    beforeEach(module('crwApp'));
    beforeEach(inject(function($rootScope, $compile) {
        $scope = $rootScope.$new();
        $scope.line = 1;
        $scope.cols = [2, 3];
        $scope.letter = '';
        element = $compile('<ul>' +
            '<li ng-repeat="column in cols" ng-click="$broadcast(\'setFocus\', line, column)">' +
            '<span id="span{{column}}" contenteditable="true" ng-model="letter"></span>' +
            '<div id="top{{column}}"></div>' +
            '</li>' +
            '</ul>')($scope);
        jQuery('body').append(element);
        $rootScope.$digest();
    }));
    afterEach(function () {
        element.remove();
    });

    it("prevents letter highlighting", function() {
        var listener = jasmine.createSpy('listener');
        jQuery('body').on('mousemove', listener);
        element.find('#span2').trigger('mousemove');
        expect(listener.calls.argsFor(0)[0].isDefaultPrevented()).toBe(true);
    });

    it("sends setFocus events to contenteditable", function() {
        element.find('#top2').trigger('click');
        expect(document.activeElement.id).toBe('span2');
        element.find('#top3').trigger('click');
        expect(document.activeElement.id).toBe('span3');
    });
});

describe("crwIndexChecker", function() {
    var $scope, element;

    beforeEach(module('crwApp'));

    function runThrough() {
        var li, liScope, index;
        $scope.$digest();
        for (index = 0; index < $scope.cols.length; index++) {
            li = element.find('#li' + $scope.cols[index]);
            liScope = li.scope('ngRepeat');
            expect(liScope.index).toBe(index);
        }
    }

    it("keeps index current", inject(function($rootScope, $compile) {
        $scope = $rootScope.$new();
        element = $compile('<ul>' +
            '<li id="li{{column}}" ng-repeat="column in cols" crw-index-checker="index"></li>' +
            '</ul>')($scope);
        $scope.cols = [1, 2, 3];
        runThrough();
        $scope.cols.unshift(0);
        runThrough();
        $scope.cols.pop();
        runThrough();
    }));
});

describe("TableController", function () {
    var $rootScope, $scope, basics;

    beforeEach(module('crwApp'));
    beforeEach(inject(function(_$rootScope_, $controller) {
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();
        $scope.crosswordData = {name: 'name'};
        $scope.setHighlight = jasmine.createSpy("setHighlight");
        $scope.crw = {
            getHighId: jasmine.createSpy('getHighId').and.returnValue(1),
            randomColor: jasmine.createSpy("randomColor").and.returnValue('red'),
            getLevelRestriction: jasmine.createSpy("getLevelRestriction").and.returnValue(false)
        };
        basics = {};
        var markerFactory = {
            getMarkers: function () {
                return jasmine.createSpyObj('markers', ['setNewMarkers', 'exchangeMarkers', 'redrawMarkers', 'getMarks', 'deleteMarking', 'deleteAllMarking']);
            }
        };
        $controller('TableController', { markerFactory: markerFactory, basics: basics, $scope: $scope });
    }));

    describe("crossword data watches in build mode", function () {
        beforeEach(function () {
            $scope.setMode('build');
            $scope.crosswordData = angular.copy(testdata);
            $scope.$apply();
        });

        it("redraws all markers on new crossword", function () {
            expect($scope.markers.deleteAllMarking.calls.count()).toBe(1);
            expect($scope.markers.deleteMarking).not.toHaveBeenCalled();
            expect($scope.markers.redrawMarkers).toHaveBeenCalledWith($scope.crosswordData.words);
            $scope.crosswordData = {
                name: 'riddle',
                words: {'1': {}}
            };
            $scope.$apply();
            expect($scope.markers.deleteAllMarking.calls.count()).toBe(2);
            expect($scope.markers.deleteMarking).not.toHaveBeenCalled();
            expect($scope.markers.redrawMarkers).toHaveBeenCalledWith($scope.crosswordData.words);
        });

        it("removes marking for deleted word", function () {
            delete $scope.crosswordData.words['5'];
            $scope.$apply();
            expect($scope.markers.deleteMarking.calls.count()).toBe(1);
            expect($scope.markers.deleteMarking).toHaveBeenCalledWith('5');
        });

        it("adds markings on added word", function () {
            $scope.markers.redrawMarkers.calls.reset();
            $scope.crosswordData.words['11'] = {};
            $scope.$apply();
            expect($scope.markers.redrawMarkers).toHaveBeenCalledWith($scope.crosswordData.words);
        });

        it("redraws markings on word shift", function () {
            $scope.markers.redrawMarkers.calls.reset();
            $scope.crosswordData.words['5'].start = {x:8, y:1};
            $scope.crosswordData.words['5'].stop = {x:8, y:4};
            $scope.$apply();
            expect($scope.markers.redrawMarkers).toHaveBeenCalledWith($scope.crosswordData.words);
        });
    });

    describe("crossword data watches in solve mode", function () {
        beforeEach(function () {
            $scope.setMode('solve');
            $scope.crosswordData = angular.copy(testdata);
            for (var id in $scope.crosswordData.words) {
                $scope.crosswordData.solution[id] = angular.copy($scope.crosswordData.words[id]);
                $scope.crosswordData.solution[id].markingId = id;
                $scope.crosswordData.solution[id].solved = true;
            }
            $scope.$apply();
        });

        it("deletes all markers on new crossword", function () {
            expect($scope.markers.deleteAllMarking.calls.count()).toBe(1);
            expect($scope.markers.deleteMarking).not.toHaveBeenCalled();
            expect($scope.markers.redrawMarkers).not.toHaveBeenCalled();
            $scope.crosswordData = {
                name: 'riddle',
                solution: {'1': {}}
            };
            $scope.$apply();
            expect($scope.markers.deleteAllMarking.calls.count()).toBe(2);
            expect($scope.markers.deleteMarking).not.toHaveBeenCalled();
            expect($scope.markers.redrawMarkers).not.toHaveBeenCalled();
        });

        it("removes marking for deleted solution", function () {
            delete $scope.crosswordData.solution['5'];
            $scope.$apply();
            expect($scope.markers.deleteMarking.calls.count()).toBe(1);
            expect($scope.markers.deleteMarking).toHaveBeenCalledWith('5');
        });

        it("removes marking for false solution", function () {
            $scope.crosswordData.solution['5'].solved = false;
            $scope.$apply();
            expect($scope.markers.deleteMarking.calls.count()).toBe(1);
            expect($scope.markers.deleteMarking).toHaveBeenCalledWith('5');
        });

        it("colorizes marking on added word", function () {
            $scope.markers.exchangeMarkers.calls.reset();
            $scope.crosswordData.solution['11'] = {fields: 'fields', color: 'red'};
            $scope.$apply();
            expect($scope.markers.exchangeMarkers).toHaveBeenCalledWith('fields', 1, 'red');
        });

        it("colorizes marking on solved word", function () {
            var word = $scope.crosswordData.solution['5'];
            word.solved = false;
            $scope.$apply();
            $scope.markers.exchangeMarkers.calls.reset();
            word.solved = true;
            $scope.$apply();
            expect($scope.markers.exchangeMarkers).toHaveBeenCalledWith(word.fields, 1, word.color);
        });
    });

    it("delegates getMarks", function () {
        $scope.getMarks(1, 2);
        expect($scope.markers.getMarks).toHaveBeenCalledWith(2, 1);
    });

    it("unpacks the image class names", function () {
        var classes = $scope.getImgClass({
            marking: {color: 'color'},
            img: 'img'
        });
        expect(classes.length).toBe(2);
        expect(classes).toContain('color');
        expect(classes).toContain('img');
    });

    it("broadcasts setFocus events", function () {
        $scope.child = $scope.$new();
        var listener = jasmine.createSpy("listener");
        $scope.child.$on('setFocus', listener);
        $scope.activate(1, 2);
        expect(listener.calls.argsFor(0)[1]).toBe(1);
        expect(listener.calls.argsFor(0)[2]).toBe(2);
    });

    it("initializes a marker on first outofField", function () {
        $scope.setMode('solve');
        $scope.outofField(1, 1);
        expect($scope.markers.setNewMarkers).not.toHaveBeenCalled();
        $scope.startMark();
        $scope.outofField(1, 1);
        $scope.outofField(2, 1);
        expect($scope.markers.setNewMarkers.calls.count()).toBe(1);
        expect($scope.markers.setNewMarkers.calls.argsFor(0)[0]).toEqual({
            start: {x: 1, y: 1},
            stop: {x: 1, y: 1},
            color: 'grey',
            ID: 2
        });
    });

    it("starts marking depending on timer state", function () {
        $scope.setMode('solve');
        $scope.startMark();
        $scope.stopMark();
        expect($scope.markers.deleteMarking.calls.count()).toBe(1);
        $scope.timer = {
            state: 'waiting'
        };
        $scope.startMark();
        $scope.stopMark();
        expect($scope.markers.deleteMarking.calls.count()).toBe(1);
        $scope.timer.state = 'playing';
        $scope.startMark();
        $scope.stopMark();
        expect($scope.markers.deleteMarking.calls.count()).toBe(2);
    });

    it("selects a color dependent on mode", function () {
        $scope.setMode('solve');
        $scope.startMark();
        $scope.outofField(1, 1);
        expect($scope.crw.randomColor).not.toHaveBeenCalled();
        var marking = $scope.markers.setNewMarkers.calls.argsFor(0)[0];
        expect(marking.color).toBe('grey');
        $scope.stopMark();
        $scope.setMode('build');
        $scope.startMark();
        $scope.outofField(2, 2);
        expect($scope.crw.randomColor).toHaveBeenCalled();
        marking = $scope.markers.setNewMarkers.calls.argsFor(1)[0];
        expect(marking.color).toBe('red');
    });

    it("expands a marker on intoField", function () {
        $scope.setMode('solve');
        $scope.startMark();
        $scope.outofField(1, 1);
        expect($scope.markers.setNewMarkers.calls.argsFor(0)[0]).toEqual(jasmine.objectContaining({
            start: {x: 1, y: 1},
            stop: {x: 1, y: 1}
        }));
        $scope.intoField(2, 1);
        expect($scope.markers.setNewMarkers.calls.argsFor(0)[0]).toEqual(jasmine.objectContaining({
            start: {x: 1, y: 1},
            stop: {x: 1, y: 2}
        }));
    });

    it("tests for unrestricted valid directions", function () {
        $scope.setMode('solve');
        $scope.startMark();
        $scope.outofField(1, 1);
        $scope.intoField(3, 1);
        expect($scope.markers.setNewMarkers.calls.count(0)).toBe(2);
        $scope.intoField(3, 2);
        expect($scope.markers.setNewMarkers.calls.count(0)).toBe(2);
        $scope.intoField(3, 3);
        expect($scope.markers.setNewMarkers.calls.count(0)).toBe(3);
        $scope.intoField(0, 3);
        expect($scope.markers.setNewMarkers.calls.count(0)).toBe(3);
        $scope.intoField(0, 2);
        expect($scope.markers.setNewMarkers.calls.count(0)).toBe(4);
    });

    it("tests for restricted valid LTR directions", function () {
        basics.textIsLTR = true;
        $scope.crw.getLevelRestriction = jasmine.createSpy("getLevelRestriction").and.returnValue(true);
        $scope.setMode('solve');
        $scope.startMark();
        $scope.outofField(1, 1);
        $scope.intoField(3, 1);
        expect($scope.markers.setNewMarkers.calls.count(0)).toBe(2);
        $scope.intoField(3, 2);
        expect($scope.markers.setNewMarkers.calls.count(0)).toBe(2);
        $scope.intoField(3, 3);
        expect($scope.markers.setNewMarkers.calls.count(0)).toBe(2);
        $scope.intoField(1, 3);
        expect($scope.markers.setNewMarkers.calls.count(0)).toBe(3);
        $scope.intoField(0, 1);
        expect($scope.markers.setNewMarkers.calls.count(0)).toBe(3);
        $scope.intoField(1, 0);
        expect($scope.markers.setNewMarkers.calls.count(0)).toBe(3);
    });

    it("tests for restricted valid RTL directions", function () {
        basics.textIsLTR = false;
        $scope.crw.getLevelRestriction = jasmine.createSpy("getLevelRestriction").and.returnValue(true);
        $scope.setMode('solve');
        $scope.startMark();
        $scope.outofField(1, 1);
        $scope.intoField(3, 1);
        expect($scope.markers.setNewMarkers.calls.count(0)).toBe(2);
        $scope.intoField(3, 2);
        expect($scope.markers.setNewMarkers.calls.count(0)).toBe(2);
        $scope.intoField(3, 3);
        expect($scope.markers.setNewMarkers.calls.count(0)).toBe(2);
        $scope.intoField(1, 3);
        expect($scope.markers.setNewMarkers.calls.count(0)).toBe(2);
        $scope.intoField(0, 1);
        expect($scope.markers.setNewMarkers.calls.count(0)).toBe(2);
        $scope.intoField(1, 0);
        expect($scope.markers.setNewMarkers.calls.count(0)).toBe(3);
    });

    it("drops marking on markingStop event", function () {
        $scope.crw.setWord = jasmine.createSpy("setWord");
        $scope.crw.deleteWord = jasmine.createSpy("deleteWord");
        $scope.setMode('build');
        $scope.startMark();
        $scope.outofField(1, 1);
        $scope.intoField(2, 1);
        $rootScope.$broadcast('markingStop');
        $scope.$apply();
        expect($scope.markers.deleteMarking.calls.argsFor(0)[0]).toBe(2);
        $scope.stopMark();
        expect($scope.crw.setWord).not.toHaveBeenCalled();
        $scope.setMode('solve');
        $scope.startMark();
        $scope.outofField(1, 1);
        $scope.intoField(2, 1);
        $rootScope.$broadcast('markingStop');
        $scope.$apply();
        expect($scope.crw.deleteWord).toHaveBeenCalledWith(2, 'solution');
        expect($scope.markers.deleteMarking.calls.argsFor(1)[0]).toBe(2);
        $scope.stopMark();
        expect($scope.crw.setWord).not.toHaveBeenCalled();
    });

    it("does not set a word before multiple fields are set", function () {
        $scope.crw.setWord = jasmine.createSpy("setWord");
        $scope.setMode('build');
        $scope.startMark();
        $scope.outofField(1, 1);
        $scope.stopMark();
        expect($scope.crw.setWord).not.toHaveBeenCalled();
        $scope.startMark();
        $scope.outofField(1, 1);
        $scope.intoField(2, 1);
        $scope.stopMark();
        expect($scope.crw.setWord).toHaveBeenCalled();
    });

    it("prevents double markings in build mode", function () {
        $scope.crw.setWord = jasmine.createSpy("setWord").and.returnValue(false);
        $scope.setMode('build');
        $scope.startMark();
        $scope.outofField(1, 1);
        $scope.intoField(2, 1);
        $scope.stopMark();
        expect($scope.markers.deleteMarking).toHaveBeenCalled();
    });

    it("prevents double markings in solve mode", function () {
        $scope.crw.probeWord = jasmine.createSpy("probeWord").and.returnValue({solved: null});
        $scope.crw.deleteWord = jasmine.createSpy("probeWord");
        $scope.count = {solution: 0};
        $scope.setMode('solve');
        $scope.startMark();
        $scope.outofField(1, 1);
        $scope.intoField(2, 1);
        $scope.stopMark();
        expect($scope.crw.probeWord).toHaveBeenCalled();
        expect($scope.crw.deleteWord).toHaveBeenCalled();
        expect($scope.markers.deleteMarking).toHaveBeenCalled();
        expect($scope.count.solution).toBe(0);
    });

    it("probes words in solve mode and counts on valid", function () {
        $scope.crw.probeWord = jasmine.createSpy("probeWord").and.returnValue({solved: true});
        $scope.count = {solution: 0};
        $scope.setMode('solve');
        $scope.startMark();
        $scope.outofField(1, 1);
        $scope.intoField(2, 1);
        $scope.stopMark();
        expect($scope.crw.probeWord).toHaveBeenCalled();
        expect($scope.count.solution).toBe(1);
    });

    it("probes words in solve mode and alerts on invalid", inject(function ($q) {
        $scope.crw.probeWord = jasmine.createSpy("probeWord").and.returnValue({
            solved: false,
            ID: 2,
            fields: 'fields'
        });
        $scope.crw.deleteWord = jasmine.createSpy("deleteWord");
        $scope.count = {solution: 0};
        var deferred;
        $scope.immediateStore = {
            newPromise: function () {
                deferred = $q.defer();
                return deferred.promise;
            }
        };
        spyOn($scope.immediateStore, 'newPromise').and.callThrough();
        $scope.setMode('solve');
        $scope.startMark();
        $scope.outofField(1, 1);
        $scope.intoField(2, 1);
        $scope.stopMark();
        expect($scope.crw.probeWord).toHaveBeenCalled();
        expect($scope.immediateStore.newPromise).toHaveBeenCalledWith('falseWord', 'fields');
        expect($scope.count.solution).toBe(0);
        expect($scope.setHighlight.calls.argsFor(0)[0]).toEqual([2]);
        deferred.resolve();
        $scope.$apply();
        expect($scope.crw.deleteWord).toHaveBeenCalledWith(2, 'solution');
        expect($scope.setHighlight.calls.argsFor(1)[0]).toEqual([]);
    }));

    it("evaluates keydown keys", function () {
        $scope.field = {letter: 'A'};
        basics.letterRegEx = /[a-zA-Z]/;
        spyOn($scope, 'activate');
        var moved = null;
        $scope.line = 2;
        $scope.column = 2;
        $scope.row = {length: 5};
        $scope.crosswordData = {table: {length: 5}};
        function trigger (key) {
            $scope.activate.calls.reset();
            $scope.field.letter = 'A';
            moved = null;
            return $scope.move(key);
        }
        moved = trigger('ArrowLeft');
        expect($scope.activate).toHaveBeenCalledWith(2, 1);
        expect(moved).toBeTruthy();
        moved = trigger('ArrowUp');
        expect($scope.activate).toHaveBeenCalledWith(1, 2);
        expect(moved).toBeTruthy();
        moved = trigger('ArrowRight');
        expect($scope.activate).toHaveBeenCalledWith(2, 3);
        expect(moved).toBeTruthy();
        moved = trigger('ArrowDown');
        expect($scope.activate).toHaveBeenCalledWith(3, 2);
        expect(moved).toBeTruthy();
        $scope.line = 0;
        $scope.column = 0;
        $scope.row.length = 1;
        $scope.crosswordData.table.length = 1;
        moved = trigger('ArrowLeft');
        expect($scope.activate).not.toHaveBeenCalled();
        expect(moved).toBeTruthy();
        moved = trigger('ArrowUp');
        expect($scope.activate).not.toHaveBeenCalled();
        expect(moved).toBeTruthy();
        moved = trigger('ArrowRight');
        expect($scope.activate).not.toHaveBeenCalled();
        expect(moved).toBeTruthy();
        moved = trigger('ArrowDown');
        expect($scope.activate).not.toHaveBeenCalled();
        expect(moved).toBeTruthy();
        moved = trigger('Delete');
        expect($scope.field.letter).toBeNull();
        expect(moved).toBeTruthy();
        moved = trigger('Backspace');
        expect($scope.field.letter).toBeNull();
        expect(moved).toBeTruthy();
        moved = trigger('F');
        expect($scope.activate).not.toHaveBeenCalled();
        expect(moved).toBeFalsy();
    });
});
