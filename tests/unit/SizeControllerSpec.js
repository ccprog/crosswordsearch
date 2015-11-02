describe("SizeController", function () {
    var $rootScope, $scope, basics, StyleModelContainer;

    beforeEach(module('crwApp'));
    beforeEach(inject(function(_$rootScope_, _StyleModelContainer_, $controller) {
        $rootScope = _$rootScope_;
        StyleModelContainer = _StyleModelContainer_;
        $scope = $rootScope.$new();
        $scope.crosswordData = {
            size: {width: 10, height: 10}
        };
        basics = {dimensions: {
            tableBorder: 1,
            fieldBorder: 1,
            field: 30,
            handleOutside: 8,
            handleInside: 4
        }};
        $controller('SizeController', {
            $document: null,
            basics: basics,
            StyleModelContainer: StyleModelContainer,
            $scope: $scope
        });
    }));
    
    describe("LTR layout", function () {
        beforeEach(function () {
            basics.textIsLTR = true;
        });

        it("initializes styles", function () {
            expect($scope.modLeft).toEqual(jasmine.objectContaining({
                minx: -Infinity,
                maxx: 217,
                miny: 0,
                maxy: 0,
                pivotx: 0,
                pivoty: 0
            }));
            expect($scope.modLeft.styleObject['handle-left'].style).toEqual({left: '-9px', width: '12px'});
            expect($scope.modTop).toEqual(jasmine.objectContaining({
                minx: 0,
                maxx: 0,
                miny: -Infinity,
                maxy: 217,
                pivotx: 0,
                pivoty: 0
            }));
            expect($scope.modTop.styleObject['handle-top'].style).toEqual({top: '-9px', height: '12px'});
            expect($scope.modRight).toEqual(jasmine.objectContaining({
                minx: 93,
                maxx: Infinity,
                miny: 0,
                maxy: 0,
                pivotx: 310,
                pivoty: 0
            }));
            expect($scope.modRight.styleObject['handle-right'].style).toEqual({right: '-9px', width: '12px'});
            expect($scope.modBottom).toEqual(jasmine.objectContaining({
                minx: 0,
                maxx: 0,
                miny: 93,
                maxy: Infinity,
                pivotx: 0,
                pivoty: 310
            }));
            expect($scope.modBottom.styleObject['handle-bottom'].style).toEqual({bottom: '-9px', height: '12px'});
            expect($scope.styleCrossword()).toEqual({width: '311px', height: '351px'});
            expect($scope.styleGridSize()).toEqual({left: '0px', width: '309px', top: '0px', height: '309px'});
            expect($scope.styleShift()).toEqual({left: '-1px', top: '-1px'});
            expect($scope.styleExtras()).toEqual({left: '0px', top: '319px', width: '309px'});
        });

        it("changes styles with dimensions", inject(function ($controller) {
            basics = {dimensions: {
                tableBorder: 5,
                fieldBorder: 2,
                field: 27,
                handleOutside: 15,
                handleInside: 5
            }, textIsLTR: true};
            $controller('SizeController', {
                $document: null,
                basics: basics,
                StyleModelContainer: StyleModelContainer,
                $scope: $scope
            });
            expect($scope.modLeft).toEqual(jasmine.objectContaining({
                minx: -Infinity,
                maxx: 203,
                miny: 0,
                maxy: 0,
                pivotx: 0,
                pivoty: 0
            }));
            expect($scope.modLeft.styleObject['handle-left'].style).toEqual({left: '-20px', width: '20px'});
            expect($scope.modTop).toEqual(jasmine.objectContaining({
                minx: 0,
                maxx: 0,
                miny: -Infinity,
                maxy: 203,
                pivotx: 0,
                pivoty: 0
            }));
            expect($scope.modTop.styleObject['handle-top'].style).toEqual({top: '-20px', height: '20px'});
            expect($scope.modRight).toEqual(jasmine.objectContaining({
                minx: 87,
                maxx: Infinity,
                miny: 0,
                maxy: 0,
                pivotx: 290,
                pivoty: 0
            }));
            expect($scope.modRight.styleObject['handle-right'].style).toEqual({right: '-20px', width: '20px'});
            expect($scope.modBottom).toEqual(jasmine.objectContaining({
                minx: 0,
                maxx: 0,
                miny: 87,
                maxy: Infinity,
                pivotx: 0,
                pivoty: 290
            }));
            expect($scope.modBottom.styleObject['handle-bottom'].style).toEqual({bottom: '-20px', height: '20px'});
            expect($scope.styleCrossword()).toEqual({width: '298px', height: '338px'});
            expect($scope.styleGridSize()).toEqual({left: '0px', width: '288px', top: '0px', height: '288px'});
            expect($scope.styleShift()).toEqual({left: '-2px', top: '-2px'});
            expect($scope.styleExtras()).toEqual({left: '0px', top: '310px', width: '288px'});
        }));

        it("watches size changes", function () {
            $scope.crosswordData.size.width = 12;
            $scope.crosswordData.size.height = 8;
            $rootScope.$apply();
            expect($scope.modLeft).toEqual(jasmine.objectContaining({maxx: 279, pivotx: 0}));
            expect($scope.modTop).toEqual(jasmine.objectContaining({maxy: 155, pivoty: 0}));
            expect($scope.modRight).toEqual(jasmine.objectContaining({minx: 93, pivotx: 372}));
            expect($scope.modBottom).toEqual(jasmine.objectContaining({miny: 93, pivoty: 248}));
            expect($scope.styleCrossword()).toEqual({width: '373px', height: '289px'});
            expect($scope.styleGridSize()).toEqual({left: '0px', width: '371px', top: '0px', height: '247px'});
            expect($scope.styleExtras()).toEqual({left: '0px', top: '257px', width: '371px'});
        });

        it("reacts on left size movement", function () {
            $scope.modLeft.transform(-10, 0);
            expect($scope.modLeft.styleObject['handle-left'].style).toEqual({left: '-19px', width: '22px'});
            expect($scope.styleGridSize()).toEqual(jasmine.objectContaining({left: '0px', width: '309px'}));
            expect($scope.styleShift().left).toBe('-1px');
            $scope.modLeft.transform(-40, 0);
            expect($scope.modLeft.styleObject['handle-left'].style).toEqual({left: '-18px', width: '21px'});
            expect($scope.styleGridSize()).toEqual(jasmine.objectContaining({left: '-31px', width: '340px'}));
            expect($scope.styleShift().left).toBe('30px');
            $scope.modLeft.transform(5, 0);
            expect($scope.modLeft.styleObject['handle-left'].style).toEqual({left: '-35px', width: '38px'});
            expect($scope.styleGridSize()).toEqual(jasmine.objectContaining({left: '31px', width: '278px'}));
            expect($scope.styleShift().left).toBe('-32px');
        });

        it("reacts on top size movement", function () {
            $scope.modTop.transform(0, -10);
            expect($scope.modTop.styleObject['handle-top'].style).toEqual({top: '-19px', height: '22px'});
            expect($scope.styleGridSize()).toEqual(jasmine.objectContaining({top: '0px', height: '309px'}));
            expect($scope.styleShift().top).toBe('-1px');
            $scope.modTop.transform(0, -40);
            expect($scope.modTop.styleObject['handle-top'].style).toEqual({top: '-18px', height: '21px'});
            expect($scope.styleGridSize()).toEqual(jasmine.objectContaining({top: '-31px', height: '340px'}));
            expect($scope.styleShift().top).toBe('30px');
            $scope.modTop.transform(0, 5);
            expect($scope.modTop.styleObject['handle-top'].style).toEqual({top: '-35px', height: '38px'});
            expect($scope.styleGridSize()).toEqual(jasmine.objectContaining({top: '31px', height: '278px'}));
            expect($scope.styleShift().top).toBe('-32px');
        });

        it("reacts on right size movement", function () {
            $scope.modRight.transform(320, 0);
            expect($scope.modRight.styleObject['handle-right'].style).toEqual({right: '-19px', width: '22px'});
            expect($scope.styleGridSize()).toEqual(jasmine.objectContaining({left: '0px', width: '309px'}));
            expect($scope.styleShift().left).toBe('-1px');
            $scope.modRight.transform(350, 0);
            expect($scope.modRight.styleObject['handle-right'].style).toEqual({right: '-18px', width: '21px'});
            expect($scope.styleGridSize()).toEqual(jasmine.objectContaining({left: '0px', width: '340px'}));
            expect($scope.styleShift().left).toBe('-1px');
            $scope.modRight.transform(305, 0);
            expect($scope.modRight.styleObject['handle-right'].style).toEqual({right: '-35px', width: '38px'});
            expect($scope.styleGridSize()).toEqual(jasmine.objectContaining({left: '0px', width: '278px'}));
            expect($scope.styleShift().left).toBe('-1px');
        });

        it("reacts on bottom size movement", function () {
            $scope.modBottom.transform(0, 320);
            expect($scope.modBottom.styleObject['handle-bottom'].style).toEqual({bottom: '-19px', height: '22px'});
            expect($scope.styleGridSize()).toEqual(jasmine.objectContaining({top: '0px', height: '309px'}));
            expect($scope.styleShift().top).toBe('-1px');
            $scope.modBottom.transform(0, 350);
            expect($scope.modBottom.styleObject['handle-bottom'].style).toEqual({bottom: '-18px', height: '21px'});
            expect($scope.styleGridSize()).toEqual(jasmine.objectContaining({top: '0px', height: '340px'}));
            expect($scope.styleShift().top).toBe('-1px');
            $scope.modBottom.transform(0, 305);
            expect($scope.modBottom.styleObject['handle-bottom'].style).toEqual({bottom: '-35px', height: '38px'});
            expect($scope.styleGridSize()).toEqual(jasmine.objectContaining({top: '0px', height: '278px'}));
            expect($scope.styleShift().left).toBe('-1px');
        });
    });
    
    describe("RTL layout", function () {
        beforeEach(function () {
            basics.textIsLTR = false;
        });

        it("initializes styles", function () {
            expect($scope.styleGridSize()).toEqual({right: '0px', width: '309px', top: '0px', height: '309px'});
            expect($scope.styleShift()).toEqual({left: '-1px', top: '-1px'});
            expect($scope.styleExtras()).toEqual({right: '0px', top: '319px', width: '309px'});
        });

        it("changes styles with dimensions", inject(function ($controller) {
            basics = {dimensions: {
                tableBorder: 5,
                fieldBorder: 2,
                field: 27,
                handleOutside: 15,
                handleInside: 5
            }, textIsLTR: false};
            $controller('SizeController', {
                $document: null,
                basics: basics,
                StyleModelContainer: StyleModelContainer,
                $scope: $scope
            });
            expect($scope.styleGridSize()).toEqual({right: '0px', width: '288px', top: '0px', height: '288px'});
            expect($scope.styleShift()).toEqual({left: '-2px', top: '-2px'});
            expect($scope.styleExtras()).toEqual({right: '0px', top: '310px', width: '288px'});
        }));

        it("watches size changes", function () {
            $scope.crosswordData.size.width = 12;
            $scope.crosswordData.size.height = 8;
            $rootScope.$apply();
            expect($scope.styleGridSize()).toEqual({right: '0px', width: '371px', top: '0px', height: '247px'});
            expect($scope.styleExtras()).toEqual({right: '0px', top: '257px', width: '371px'});
        });

        it("reacts on left size movement", function () {
            $scope.modLeft.transform(-10, 0);
            expect($scope.styleGridSize()).toEqual(jasmine.objectContaining({right: '0px', width: '309px'}));
            expect($scope.styleShift().left).toBe('-1px');
            $scope.modLeft.transform(-40, 0);
            expect($scope.styleGridSize()).toEqual(jasmine.objectContaining({right: '0px', width: '340px'}));
            expect($scope.styleShift().left).toBe('30px');
            $scope.modLeft.transform(5, 0);
            expect($scope.styleGridSize()).toEqual(jasmine.objectContaining({right: '0px', width: '278px'}));
            expect($scope.styleShift().left).toBe('-32px');
        });

        it("reacts on right size movement", function () {
            $scope.modRight.transform(320, 0);
            expect($scope.styleGridSize()).toEqual(jasmine.objectContaining({right: '0px', width: '309px'}));
            expect($scope.styleShift().left).toBe('-1px');
            $scope.modRight.transform(350, 0);
            expect($scope.styleGridSize()).toEqual(jasmine.objectContaining({right: '-31px', width: '340px'}));
            expect($scope.styleShift().left).toBe('-1px');
            $scope.modRight.transform(305, 0);
            expect($scope.styleGridSize()).toEqual(jasmine.objectContaining({right: '31px', width: '278px'}));
            expect($scope.styleShift().left).toBe('-1px');
        });
    });

    describe("stopResize inspecting size changes for crossword model changes", function () {
        var deferred, change, critical = [1, 2];

        beforeEach(inject(function ($q) {
            basics.textIsLTR = false;
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
