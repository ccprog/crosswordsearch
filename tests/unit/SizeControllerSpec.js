describe("SizeController", function () {
    var $rootScope, $scope, basics;

    beforeEach(module('crwApp'));
    beforeEach(inject(function(_$rootScope_, StyleModelContainer, $controller) {
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();
        $scope.crosswordData = {
            size: {width: 10, height: 10}
        };
        basics = {fieldSize: 31};
        $controller('SizeController', {
            $document: null,
            basics: basics,
            StyleModelContainer: StyleModelContainer,
            $scope: $scope
        });
    }));

    it("initializes styles", function () {
        expect($scope.modLeft).toEqual(jasmine.objectContaining({
            minx: -Infinity,
            maxx: 218,
            miny: 0,
            maxy: 0,
            pivotx: -1,
            pivoty: 0
        }));
        expect($scope.modLeft.styleObject['handle-left'].style).toEqual({left: '-9px', width: '13px'});
        expect($scope.modTop).toEqual(jasmine.objectContaining({
            minx: 0,
            maxx: 0,
            miny: -Infinity,
            maxy: 218,
            pivotx: 0,
            pivoty: -1
        }));
        expect($scope.modTop.styleObject['handle-top'].style).toEqual({top: '-9px', height: '13px'});
        expect($scope.modRight).toEqual(jasmine.objectContaining({
            minx: 94,
            maxx: Infinity,
            miny: 0,
            maxy: 0,
            pivotx: 311,
            pivoty: 0
        }));
        expect($scope.modRight.styleObject['handle-right'].style).toEqual({right: '-9px', width: '13px'});
        expect($scope.modBottom).toEqual(jasmine.objectContaining({
            minx: 0,
            maxx: 0,
            miny: 94,
            maxy: Infinity,
            pivotx: 0,
            pivoty: 311
        }));
        expect($scope.modBottom.styleObject['handle-bottom'].style).toEqual({bottom: '-9px', height: '13px'});
        expect($scope.styleCrossword()).toEqual({width: '310px', height: '350px'});
        expect($scope.styleGridSize()).toEqual({left: '0px', width: '310px', top: '0px', height: '310px'});
        expect($scope.styleShift()).toEqual({left: '0px', top: '0px'});
        expect($scope.styleExtras()).toEqual({left: '0px', top: '318px'});
    });

    it("watches size changes", function () {
        $scope.crosswordData.size.width = 12;
        $scope.crosswordData.size.height = 8;
        $rootScope.$apply();
        expect($scope.modLeft).toEqual(jasmine.objectContaining({maxx: 280, pivotx: -1}));
        expect($scope.modTop).toEqual(jasmine.objectContaining({maxy: 156, pivoty: -1}));
        expect($scope.modRight).toEqual(jasmine.objectContaining({minx: 94, pivotx: 373}));
        expect($scope.modBottom).toEqual(jasmine.objectContaining({miny: 94, pivoty: 249}));
        expect($scope.styleCrossword()).toEqual({width: '372px', height: '288px'});
        expect($scope.styleGridSize()).toEqual({left: '0px', width: '372px', top: '0px', height: '248px'});
        expect($scope.styleExtras()).toEqual({left: '0px', top: '256px'});
    });

    it("reacts on left size movement", function () {
        $scope.modLeft.transform(-10, 0);
        expect($scope.modLeft.styleObject['handle-left'].style).toEqual({left: '-18px', width: '22px'});
        expect($scope.styleGridSize()).toEqual(jasmine.objectContaining({left: '0px', width: '310px'}));
        expect($scope.styleShift().left).toBe('0px');
        $scope.modLeft.transform(-40, 0);
        expect($scope.modLeft.styleObject['handle-left'].style).toEqual({left: '-17px', width: '21px'});
        expect($scope.styleGridSize()).toEqual(jasmine.objectContaining({left: '-31px', width: '341px'}));
        expect($scope.styleShift().left).toBe('31px');
        $scope.modLeft.transform(5, 0);
        expect($scope.modLeft.styleObject['handle-left'].style).toEqual({left: '-34px', width: '38px'});
        expect($scope.styleGridSize()).toEqual(jasmine.objectContaining({left: '31px', width: '279px'}));
        expect($scope.styleShift().left).toBe('-31px');
    });

    it("reacts on top size movement", function () {
        $scope.modTop.transform(0, -10);
        expect($scope.modTop.styleObject['handle-top'].style).toEqual({top: '-18px', height: '22px'});
        expect($scope.styleGridSize()).toEqual(jasmine.objectContaining({top: '0px', height: '310px'}));
        expect($scope.styleShift().top).toBe('0px');
        $scope.modTop.transform(0, -40);
        expect($scope.modTop.styleObject['handle-top'].style).toEqual({top: '-17px', height: '21px'});
        expect($scope.styleGridSize()).toEqual(jasmine.objectContaining({top: '-31px', height: '341px'}));
        expect($scope.styleShift().top).toBe('31px');
        $scope.modTop.transform(0, 5);
        expect($scope.modTop.styleObject['handle-top'].style).toEqual({top: '-34px', height: '38px'});
        expect($scope.styleGridSize()).toEqual(jasmine.objectContaining({top: '31px', height: '279px'}));
        expect($scope.styleShift().top).toBe('-31px');
    });

    it("reacts on right size movement", function () {
        $scope.modRight.transform(320, 0);
        expect($scope.modRight.styleObject['handle-right'].style).toEqual({right: '-18px', width: '22px'});
        expect($scope.styleGridSize()).toEqual(jasmine.objectContaining({left: '0px', width: '310px'}));
        expect($scope.styleShift().left).toBe('0px');
        $scope.modRight.transform(350, 0);
        expect($scope.modRight.styleObject['handle-right'].style).toEqual({right: '-17px', width: '21px'});
        expect($scope.styleGridSize()).toEqual(jasmine.objectContaining({left: '0px', width: '341px'}));
        expect($scope.styleShift().left).toBe('0px');
        $scope.modRight.transform(305, 0);
        expect($scope.modRight.styleObject['handle-right'].style).toEqual({right: '-34px', width: '38px'});
        expect($scope.styleGridSize()).toEqual(jasmine.objectContaining({left: '0px', width: '279px'}));
        expect($scope.styleShift().left).toBe('0px');
    });

    it("reacts on bottom size movement", function () {
        $scope.modBottom.transform(0, 320);
        expect($scope.modBottom.styleObject['handle-bottom'].style).toEqual({bottom: '-18px', height: '22px'});
        expect($scope.styleGridSize()).toEqual(jasmine.objectContaining({top: '0px', height: '310px'}));
        expect($scope.styleShift().top).toBe('0px');
        $scope.modBottom.transform(0, 350);
        expect($scope.modBottom.styleObject['handle-bottom'].style).toEqual({bottom: '-17px', height: '21px'});
        expect($scope.styleGridSize()).toEqual(jasmine.objectContaining({top: '0px', height: '341px'}));
        expect($scope.styleShift().top).toBe('0px');
        $scope.modBottom.transform(0, 305);
        expect($scope.modBottom.styleObject['handle-bottom'].style).toEqual({bottom: '-34px', height: '38px'});
        expect($scope.styleGridSize()).toEqual(jasmine.objectContaining({top: '0px', height: '279px'}));
        expect($scope.styleShift().left).toBe('0px');
    });

    describe("stopResize inspecting size changes for crossword model changes", function () {
        var deferred, change, critical = [1, 2];

        beforeEach(inject(function ($q) {
            $scope.crw = {
                changeSize: jasmine.createSpy("changeSize"),
                testWordBoundaries: function (change) {
                    if (change.right < 0) {
                        return critical;
                    } else {
                        return [];
                    }
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
            change = {left: 0, right: 0, top: 0, bottom: 0};
        }));

        it("on no resulting change", function () {
            $scope.startResize();
            $scope.modRight.transform(320, 0);
            $scope.stopResize();
            expect($scope.crw.changeSize).not.toHaveBeenCalled();
        });

        it("on non-critical change", function () {
            $scope.startResize();
            $scope.modRight.transform(350, 0);
            $scope.stopResize();
            change.right = 1;
            expect($scope.crw.testWordBoundaries).toHaveBeenCalledWith(change);
            expect($scope.setHighlight).not.toHaveBeenCalled();
            expect($scope.crw.changeSize.calls.argsFor(0)[0]).toEqual(change);
            expect($scope.crw.changeSize.calls.argsFor(0)[1]).toEqual([]);
        });

        it("user rejection on critical change", function () {
            $scope.startResize();
            $scope.modRight.transform(305, 0);
            $scope.stopResize();
            change.right = -1;
            expect($scope.crw.testWordBoundaries).toHaveBeenCalledWith(change);
            expect($scope.setHighlight.calls.argsFor(0)[0]).toBe(critical);
            expect($scope.immediateStore.newPromise).toHaveBeenCalledWith('invalidWords', critical);
            deferred.reject();
            $rootScope.$apply();
            expect($scope.crw.changeSize).not.toHaveBeenCalled();
            expect($scope.setHighlight.calls.argsFor(1)[0]).toEqual([]);
        });

        it("user resolution on critical change", function () {
            $scope.startResize();
            $scope.modRight.transform(305, 0);
            $scope.stopResize();
            change.right = -1;
            expect($scope.crw.testWordBoundaries).toHaveBeenCalledWith(change);
            expect($scope.setHighlight.calls.argsFor(0)[0]).toBe(critical);
            expect($scope.immediateStore.newPromise).toHaveBeenCalledWith('invalidWords', critical);
            deferred.resolve();
            $rootScope.$apply();
            expect($scope.setHighlight.calls.argsFor(1)[0]).toEqual([]);
            expect($scope.crw.changeSize.calls.argsFor(0)[0]).toEqual(change);
            expect($scope.crw.changeSize.calls.argsFor(0)[1]).toEqual(critical);
        });
    });
});
