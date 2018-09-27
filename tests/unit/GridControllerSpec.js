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

describe("GridController", function () {
    var $rootScope, $q, $scope, basics;

    beforeEach(module('crwApp'));
    beforeEach(inject(function(_$rootScope_, _$q_, $controller) {
        $rootScope = _$rootScope_;
        $q = _$q_;
        $scope = $rootScope.$new();
        $scope.crosswordData = {name: 'name'};
        $scope.setHighlight = jasmine.createSpy("setHighlight");
        $scope.crw = {
            getHighId: jasmine.createSpy('getHighId').and.returnValue(1),
            randomColor: jasmine.createSpy("randomColor").and.returnValue('red'),
            getLevelRestriction: jasmine.createSpy("getLevelRestriction").and.returnValue(false)
        };
        basics = {};
        $controller('GridController', { $q: $q, basics: basics, $scope: $scope });
        $scope.currentMarking = { ID: 0 };
    }));

    it("sets mode and inits data", function () {
        $scope.setMode('mode');
        expect($scope.mode).toBe('mode');
        expect($scope.isMarking).toBe(false);
        expect($scope.crw.getHighId).toHaveBeenCalled();
        expect($scope.currentMarking).toEqual({ID: 1});
    });

    it("reinitializes on new crossword", function () {
        expect($scope.crw.getHighId).not.toHaveBeenCalled();
        $scope.isMarking = true;
        $scope.crosswordData = { name: 'riddle' };
        $scope.$apply();
        expect($scope.isMarking).toBe(false);
        expect($scope.crw.getHighId).toHaveBeenCalled();
    });

    describe("testResize inspecting size changes for crossword model changes", function () {
        var resolutions, deferred, critical = [1, 2];

        beforeEach(function () {
            $scope.crw.changeSize = jasmine.createSpy("changeSize");
            $scope.crw.testWordBoundaries= function (direction, change) {
                if (change < 0) {
                    return critical;
                } else {
                    return [];
                }
            };
            spyOn($scope.crw, 'testWordBoundaries').and.callThrough();
            $scope.setHighlight = jasmine.createSpy("setHighlight");
            $scope.immediateStore = {
                newPromise: function () {
                    deferred = $q.defer();
                    return deferred.promise;
                }
            };
            spyOn($scope.immediateStore, 'newPromise').and.callThrough();
            resolutions = {
                resolved: jasmine.createSpy('resolved'),
                rejected: jasmine.createSpy('rejected')
            };
        });

        it("on non-critical change", function () {
            $scope.testResize('right', 1).then(resolutions.resolved, resolutions.rejected);
            expect($scope.crw.testWordBoundaries).toHaveBeenCalledWith('right', 1);
            expect($scope.setHighlight).not.toHaveBeenCalled();
            expect($scope.crw.changeSize.calls.argsFor(0)).toEqual(['right', 1, []]);
            expect(resolutions.resolved).not.toHaveBeenCalled();
            expect(resolutions.rejected).not.toHaveBeenCalled();
        });

        it("user rejection on critical change", function () {
            $scope.testResize('right', -1).then(resolutions.resolved, resolutions.rejected);
            expect($scope.crw.testWordBoundaries).toHaveBeenCalledWith('right', -1);
            expect($scope.setHighlight.calls.argsFor(0)[0]).toBe(critical);
            expect($scope.immediateStore.newPromise).toHaveBeenCalledWith('invalidWords', critical);
            deferred.reject();
            $rootScope.$apply();
            expect($scope.crw.changeSize).not.toHaveBeenCalled();
            expect($scope.setHighlight.calls.argsFor(1)[0]).toEqual([]);
            expect(resolutions.resolved).not.toHaveBeenCalled();
            expect(resolutions.rejected).toHaveBeenCalled();
        });

        it("user resolution on critical change", function () {
            $scope.testResize('right', -1).then(resolutions.resolved, resolutions.rejected);
            expect($scope.crw.testWordBoundaries).toHaveBeenCalledWith('right', -1);
            expect($scope.setHighlight.calls.argsFor(0)[0]).toBe(critical);
            expect($scope.immediateStore.newPromise).toHaveBeenCalledWith('invalidWords', critical);
            deferred.resolve();
            $rootScope.$apply();
            expect($scope.setHighlight.calls.argsFor(1)[0]).toEqual([]);
            expect($scope.crw.changeSize.calls.argsFor(0)).toEqual(['right', -1, critical]);
            expect(resolutions.resolved).toHaveBeenCalled();
            expect(resolutions.rejected).not.toHaveBeenCalled();
        });
    });

    it("broadcasts setFocus events", function () {
        $scope.child = $scope.$new();
        var listener = jasmine.createSpy("listener");
        $scope.child.$on('setFocus', listener);
        $scope.activate(1, 2);
        expect(listener.calls.argsFor(0)[1]).toBe(1);
        expect(listener.calls.argsFor(0)[2]).toBe(2);
    });

    it("starts marking depending on timer state", function () {
        $scope.mode = 'solve';
        $scope.startMark();
        expect($scope.isMarking).toBe(true);
        expect($scope.currentMarking).toEqual({ ID: 1, color: 'grey'});
        delete $scope.isMarking;
        $scope.timer = {
            state: 'waiting'
        };
        $scope.startMark();
        expect($scope.isMarking).toBe(false);
        expect($scope.currentMarking).toEqual({ ID: 2, color: 'grey'});
        delete $scope.isMarking;
        $scope.timer.state = 'playing';
        $scope.startMark();
        expect($scope.isMarking).toBe(true);
        expect($scope.currentMarking).toEqual({ ID: 3, color: 'grey'});
    });

    it("selects a color dependent on mode", function () {
        $scope.mode = 'solve';
        $scope.startMark();
        expect($scope.crw.randomColor).not.toHaveBeenCalled();
        expect($scope.currentMarking.color).toBe('grey');
        $scope.mode = 'build';
        $scope.startMark();
        expect($scope.crw.randomColor).toHaveBeenCalled();
        expect($scope.currentMarking.color).toBe('red');
    });

    it("drops marking on markingStop event", function () {
        $scope.crw.deleteWord = jasmine.createSpy("deleteWord");
        $scope.mode = 'build';
        $scope.isMarking = false;
        $rootScope.$broadcast('markingStop');
        expect($scope.crw.deleteWord).not.toHaveBeenCalled();
        $scope.isMarking = true;
        $rootScope.$broadcast('markingStop');
        expect($scope.crw.deleteWord).not.toHaveBeenCalled();
        expect($scope.isMarking).toBe(false);
        $scope.isMarking = true;
        $scope.mode = 'solve';
        $rootScope.$broadcast('markingStop');
        expect($scope.crw.deleteWord).toHaveBeenCalledWith(0, 'solution');
        expect($scope.isMarking).toBe(false);
    });

    it("does not set a word before multiple fields are set", function () {
        $scope.crw.setWord = jasmine.createSpy("setWord");
        $scope.mode = 'build';
        $scope.isMarking = true;
        $scope.currentMarking = {
            start: {x: 1, y: 1},
            stop: {x: 1, y: 1}
        };
        $scope.stopMark();
        expect($scope.crw.setWord).not.toHaveBeenCalled();
        expect($scope.isMarking).toBe(false);
        $scope.isMarking = true;
        $scope.currentMarking = {
            start: {x: 1, y: 1},
            stop: {x: 2, y: 1}
        };
        $scope.stopMark();
        expect($scope.crw.setWord).toHaveBeenCalledWith($scope.currentMarking);
        expect($scope.isMarking).toBe(false);
    });

    it("prevents double markings in solve mode", function () {
        $scope.crw.probeWord = jasmine.createSpy("probeWord").and.returnValue({solved: null});
        $scope.crw.deleteWord = jasmine.createSpy("probeWord");
        $scope.count = {solution: 0};
        $scope.mode = 'solve';
        $scope.isMarking = true;
        $scope.currentMarking = {
            ID: 1,
            start: {x: 1, y: 1},
            stop: {x: 2, y: 1}
        };
        $scope.stopMark();
        expect($scope.crw.probeWord).toHaveBeenCalledWith($scope.currentMarking);
        expect($scope.crw.deleteWord).toHaveBeenCalledWith(1, 'solution');
        expect($scope.count.solution).toBe(0);
        expect($scope.isMarking).toBe(false);
    });

    it("probes words in solve mode and counts on valid", function () {
        $scope.crw.probeWord = jasmine.createSpy("probeWord").and.returnValue({solved: true});
        $scope.count = {solution: 0};
        $scope.mode = 'solve';
        $scope.isMarking = true;
        $scope.currentMarking = {
            start: {x: 1, y: 1},
            stop: {x: 2, y: 1}
        };
        $scope.stopMark();
        expect($scope.crw.probeWord).toHaveBeenCalledWith($scope.currentMarking);
        expect($scope.count.solution).toBe(1);
        expect($scope.isMarking).toBe(false);
    });

    it("probes words in solve mode and alerts on invalid", inject(function ($q) {
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
        $scope.mode = 'solve';
        $scope.isMarking = true;
        $scope.currentMarking = {
            ID: 2,
            start: {x: 1, y: 1},
            stop: {x: 2, y: 1}
        };
        $scope.crw.probeWord = jasmine.createSpy("probeWord").and.callFake(function (word) {
            word.solved = false;
            word.fields = 'fields';
            return word;
        });
        $scope.stopMark();
        expect($scope.crw.probeWord).toHaveBeenCalledWith($scope.currentMarking);
        expect($scope.immediateStore.newPromise).toHaveBeenCalledWith('falseWord', 'fields');
        expect($scope.count.solution).toBe(0);
        expect($scope.setHighlight.calls.argsFor(0)[0]).toEqual([2]);
        deferred.resolve();
        $scope.$apply();
        expect($scope.crw.deleteWord).toHaveBeenCalledWith(2, 'solution');
        expect($scope.setHighlight.calls.argsFor(1)[0]).toEqual([]);
    }));

    it("expands a marker on intoField", function () {
        $scope.mode = 'solve';
        $scope.isMarking = true;
        $scope.outofField(1, 1);
        expect($scope.currentMarking).toEqual(jasmine.objectContaining({
            start: {x: 1, y: 1},
            stop: {x: 1, y: 1}
        }));
        $scope.intoField(2, 1);
        expect($scope.currentMarking).toEqual(jasmine.objectContaining({
            start: {x: 1, y: 1},
            stop: {x: 1, y: 2}
        }));
    });

    it("tests for unrestricted valid directions", function () {
        $scope.mode = 'solve';
        $scope.isMarking = true;
        $scope.outofField(1, 1);
        $scope.intoField(3, 1);
        expect($scope.currentMarking.stop).toEqual({x: 1, y: 3});
        $scope.intoField(3, 2);
        expect($scope.currentMarking.stop).toEqual({x: 1, y: 3});
        $scope.intoField(3, 3);
        expect($scope.currentMarking.stop).toEqual({x: 3, y: 3});
        $scope.intoField(0, 3);
        expect($scope.currentMarking.stop).toEqual({x: 3, y: 3});
        $scope.intoField(0, 2);
        expect($scope.currentMarking.stop).toEqual({x: 2, y: 0});
    });

    it("tests for restricted valid LTR directions", function () {
        basics.textIsLTR = true;
        $scope.crw.getLevelRestriction = jasmine.createSpy("getLevelRestriction").and.returnValue(true);
        $scope.mode = 'solve';
        $scope.isMarking = true;
        $scope.outofField(1, 1);
        $scope.intoField(3, 1);
        expect($scope.currentMarking.stop).toEqual({x: 1, y: 3});
        $scope.intoField(3, 2);
        expect($scope.currentMarking.stop).toEqual({x: 1, y: 3});
        $scope.intoField(3, 3);
        expect($scope.currentMarking.stop).toEqual({x: 1, y: 3});
        $scope.intoField(1, 3);
        expect($scope.currentMarking.stop).toEqual({x: 3, y: 1});
        $scope.intoField(0, 1);
        expect($scope.currentMarking.stop).toEqual({x: 3, y: 1});
        $scope.intoField(1, 0);
        expect($scope.currentMarking.stop).toEqual({x: 3, y: 1});
    });

    it("tests for restricted valid RTL directions", function () {
        basics.textIsLTR = false;
        $scope.crw.getLevelRestriction = jasmine.createSpy("getLevelRestriction").and.returnValue(true);
        $scope.mode = 'solve';
        $scope.isMarking = true;
        $scope.outofField(1, 1);
        $scope.intoField(3, 1);
        expect($scope.currentMarking.stop).toEqual({x: 1, y: 3});
        $scope.intoField(3, 2);
        expect($scope.currentMarking.stop).toEqual({x: 1, y: 3});
        $scope.intoField(3, 3);
        expect($scope.currentMarking.stop).toEqual({x: 1, y: 3});
        $scope.intoField(1, 3);
        expect($scope.currentMarking.stop).toEqual({x: 1, y: 3});
        $scope.intoField(0, 1);
        expect($scope.currentMarking.stop).toEqual({x: 1, y: 3});
        $scope.intoField(1, 0);
        expect($scope.currentMarking.stop).toEqual({x: 0, y: 1});
    });

    it("initializes a markimg on first outofField", function () {
        $scope.isMarking = false;
        $scope.outofField(1, 1);
        expect($scope.currentMarking.start).toBeUndefined();
        expect($scope.currentMarking.stop).toBeUndefined();
        $scope.isMarking = true;
        $scope.outofField(1, 1);
        $scope.outofField(2, 1);
        expect($scope.currentMarking).toEqual({
            start: {x: 1, y: 1},
            stop: {x: 1, y: 1},
            ID: 0
        });
    });
});