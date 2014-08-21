describe("TableController", function () {
    var $scope, basics;

    beforeEach(module('crwApp'));
    beforeEach(inject(function($rootScope, $controller) {
        $scope = $rootScope.$new();
        $scope.crosswordData = {name: 'name'};
        $scope.setHighlight = jasmine.createSpy("setHighlight");
        $scope.crw = {
            getHighId: jasmine.createSpy('getHighId').and.returnValue(1),
            randomColor: jasmine.createSpy("randomColor").and.returnValue('red'),
            getLevelRestriction: jasmine.createSpy("getLevelRestriction").and.returnValue(false)
        }
        basics = {};
        markerFactory = {
            getMarkers: function () {
                return jasmine.createSpyObj('markers', ['setNewMarkers', 'exchangeMarkers', 'redrawMarkers', 'getMarks', 'deleteMarking', 'deleteAllMarking'])
            }
        }
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
            }
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
            }
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

    it("tests for restricted valid directions", function () {
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

    it("does not set a word before multiple fields are set", function () {
        $scope.crw.setWord = jasmine.createSpy("setWord");
        $scope.setMode('build');
        $scope.stopMark();
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

    it("evaluates keydown events", function () {
        $scope.field = {letter: 'A'};
        spyOn($scope, 'activate');
        var event = jQuery.Event('keydown');
        $scope.line = 2;
        $scope.column = 2;
        $scope.row = {length: 5};
        $scope.crosswordData = {table: {length: 5}};
        function trigger (keycode) {
            $scope.activate.calls.reset();
            $scope.field.letter = 'A';
            event.which = keycode;
            $scope.move(event);
        }
        trigger(0x25);
        expect($scope.activate).toHaveBeenCalledWith(2, 1);
        trigger(0x26);
        expect($scope.activate).toHaveBeenCalledWith(1, 2);
        trigger(0x27);
        expect($scope.activate).toHaveBeenCalledWith(2, 3);
        trigger(0x28);
        expect($scope.activate).toHaveBeenCalledWith(3, 2);
        $scope.line = 0;
        $scope.column = 0;
        $scope.row.length = 1;
        $scope.crosswordData.table.length = 1;
        trigger(0x25);
        expect($scope.activate).not.toHaveBeenCalled();
        trigger(0x26);
        expect($scope.activate).not.toHaveBeenCalled();
        trigger(0x27);
        expect($scope.activate).not.toHaveBeenCalled();
        trigger(0x28);
        expect($scope.activate).not.toHaveBeenCalled();
        trigger(0x08);
        expect($scope.field.letter).toBeNull();
        trigger(0x2E);
        expect($scope.field.letter).toBeNull();
        expect(event.isDefaultPrevented()).toBe(true);
        trigger(0x29);
        event = jQuery.Event('keydown');
        expect(event.isDefaultPrevented()).toBe(false);
    });

    it("evaluates keypress events", function () {
        $scope.field = {letter: null};
        basics.letterRegEx = /[a-zA-Z]/;
        var event = jQuery.Event('keypress');
        function trigger (keycode) {
            $scope.field.letter = null;
            event.which = keycode;
            $scope.type(event);
        }
        trigger(0x41);
        expect($scope.field.letter).toBe('A');
        trigger(0x61);
        expect($scope.field.letter).toBe('A');
        trigger(0x52);
        expect($scope.field.letter).toBe('R');
        trigger(0x72);
        expect($scope.field.letter).toBe('R');
        trigger(0xF6);
        expect($scope.field.letter).toBeNull();
        trigger(0x36);
        expect($scope.field.letter).toBeNull();
        trigger(0x20);
        expect($scope.field.letter).toBeNull();
    });
});