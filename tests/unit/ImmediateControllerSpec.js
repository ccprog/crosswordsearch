describe("qStore", function () {
    var qStore, ajaxFactory;

    beforeEach(function () {
        module('crwApp');
        inject(function ($injector) {
            qStore = $injector.get('qStore');
        });
    });

    it("initializes multiple instances" , function () {
        var qs1 = qStore.addStore();
        var qs2 = qStore.addStore();
        expect(typeof qs1).toBe('object');
        expect(typeof qs2).toBe('object');
        expect(qs1).not.toBe(qs2);
    });

    it("instantiates promises by name" , function () {
        var qs = qStore.addStore();
        var func1 = jasmine.createSpy("func1"),
            func2 = jasmine.createSpy("func2"),
            func3 = jasmine.createSpy("func3");
        qs.register('def1', func1),
        qs.register('def1', func2),
        qs.register('def2', func3);
        var promise1 = qs.newPromise('def1', 'arg1');
        expect(func1.calls.argsFor(0)[0].promise).toBe(promise1);
        expect(func1.calls.argsFor(0)[1]).toBe('arg1');
        expect(func2.calls.argsFor(0)[0].promise).toBe(promise1);
        expect(func2.calls.argsFor(0)[1]).toBe('arg1');
        expect(func3).not.toHaveBeenCalled();
        var promise2 = qs.newPromise('def2', 'arg2');
        expect(func3.calls.argsFor(0)[0].promise).toBe(promise2);
        expect(func3.calls.argsFor(0)[1]).toBe('arg2');
    });
});

describe("ImmediateController", function () {
    var $scope;

    beforeEach(module('crwApp'));
    beforeEach(inject(function($rootScope, _$q_, $controller) {
        $q = _$q_;
        $root = $rootScope.$new();
        var listener = jasmine.createSpy("listener");
        $root.$on('immediateReady', listener);
        $scope = $root.$new();
        inject(function ($injector) {
            $scope.immediateStore = $injector.get('qStore').addStore();
        });
        $controller('ImmediateController', {$scope: $scope});
        expect(listener).toHaveBeenCalled();
        $scope.crw = {};
        spyOn($scope, 'finish').and.callThrough();
    }));
    
    function initPromise (which, arg) {
        var catcher = jasmine.createSpy("catcher");
        $scope.immediateStore.register(which, catcher);
        $scope.immediateStore.newPromise(which, arg);
        var deferredImmediate = catcher.calls.argsFor(0)[0];
        spyOn(deferredImmediate, 'resolve');
        spyOn(deferredImmediate, 'reject');
        return deferredImmediate;
    };

    it("reacts on resolving finish button", function () {
        $scope.saveError = 'error';
        $scope.saveDebug = 'debug';
        var deferredImmediate = initPromise('solvedCompletely');
        expect($scope.immediate).toBe('dialogue');
        $scope.finish(true);
        expect(deferredImmediate.resolve).toHaveBeenCalled();
        expect($scope.immediate).toBeNull();
        expect($scope.saveError).toBeUndefined();
        expect($scope.saveDebug).toBeUndefined();
    });

    it("reacts on rejecting finish button", function () {
        $scope.saveError = 'error';
        $scope.saveDebug = 'debug';
        var deferredImmediate = initPromise('solvedCompletely');
        $scope.finish(false);
        expect(deferredImmediate.reject).toHaveBeenCalled();
        expect($scope.immediate).toBeNull();
        expect($scope.saveError).toBeUndefined();
        expect($scope.saveDebug).toBeUndefined();
    });

    it("handles data download on resolution", function () {
        var deferredData = $q.defer();
        $scope.crw.loadCrosswordData = jasmine.createSpy("loadCrosswordData").and.returnValue(deferredData.promise);
        var deferredImmediate = initPromise('loadCrossword', 'name');
        expect($scope.immediate).toBe('dialogue');
        expect($scope.message).toEqual({
            which: 'load_crossword',
            buttons: {}
        });
        expect($scope.crw.loadCrosswordData).toHaveBeenCalledWith('name');
        deferredData.resolve(true);
        $scope.$apply();
        expect($scope.finish).toHaveBeenCalled();
        expect(deferredImmediate.resolve).toHaveBeenCalled();
    });

    it("handles download on rejection", function () {
        var deferredData = $q.defer();
        $scope.crw.loadCrosswordData = jasmine.createSpy("loadCrosswordData").and.returnValue(deferredData.promise);
        var deferredImmediate = initPromise('loadCrossword', 'name');
        deferredData.reject('error');
        $scope.$apply();
        expect($scope.finish).not.toHaveBeenCalled();
        expect(deferredImmediate.reject).toHaveBeenCalledWith('error');
    });

    it("handles invalid words at table size change", function () {
        $scope.immediateStore.newPromise('invalidWords', [1,2]);
        expect($scope.immediate).toBe('dialogue');
        expect($scope.message).toEqual({
            which: 'invalid_words',
            count: 2,
            buttons: {
                'delete': true,
                'abort': true
            }
        });
    });

    it("handles invalid directions at table size change", function () {
        $scope.immediateStore.newPromise('invalidDirections', {count: 1, level: 3});
        expect($scope.immediate).toBe('dialogue');
        expect($scope.message).toEqual({
            which: 'invalid_directions',
            count: 1,
            level: 3,
            buttons: {
                'delete': true,
                'abort': true
            }
        });
    });

    it("handles upload on resolution", function () {
        var deferredData = $q.defer();
        $scope.crw.saveCrosswordData = jasmine.createSpy("saveCrosswordData").and.returnValue(deferredData.promise);
        $scope.loadedName = '';
        $scope.crosswordData = {name: 'name2'};
        initPromise('saveCrossword', 'insert');
        expect($scope.immediate).toBe('save_crossword');
        expect($scope.action).toBe('insert');
        $scope.upload('username', 'password')
        expect($scope.crw.saveCrosswordData).toHaveBeenCalledWith('name2', 'insert', 'username', 'password');
        $scope.loadedName = 'name2';
        $scope.upload('username', 'password')
        expect($scope.crw.saveCrosswordData).toHaveBeenCalledWith('name2', 'update', 'username', 'password');
        var deferredImmediate = initPromise('saveCrossword', 'update');
        $scope.loadedName = 'name1';
        $scope.upload('username', 'password')
        expect($scope.crw.saveCrosswordData).toHaveBeenCalledWith('name1', 'update', 'username', 'password');
        deferredData.resolve(true);
        $scope.$apply();
        expect($scope.finish).toHaveBeenCalled();
        expect(deferredImmediate.resolve).toHaveBeenCalled();
        expect(deferredImmediate.resolve).toHaveBeenCalled();
    });

    it("handles upload on rejection", function () {
        var deferredData = $q.defer();
        $scope.crw.saveCrosswordData = jasmine.createSpy("saveCrosswordData").and.returnValue(deferredData.promise);
        $scope.crosswordData = {name: 'name2'};
        var deferredImmediate = initPromise('saveCrossword', 'update');
        $scope.loadedName = 'name1';
        $scope.upload('username', 'password')
        expect($scope.crw.saveCrosswordData).toHaveBeenCalledWith('name1', 'update', 'username', 'password');
        deferredData.reject({error: 'error', debug: 'debug'});
        $scope.$apply();
        expect(deferredImmediate.resolve).not.toHaveBeenCalled();
        expect(deferredImmediate.reject).not.toHaveBeenCalled();
        expect($scope.immediate).toBe('save_crossword');
        expect($scope.saveError).toBe('error');
        expect($scope.saveDebug).toBe('debug');
    });

    it("handles invalid solution", function () {
        $scope.immediateStore.newPromise('falseWord', 'word');
        expect($scope.immediate).toBe('dialogue');
        expect($scope.message).toEqual({
            which: 'false_word',
            word: 'word',
            buttons: {
                'delete': true
            }
        });
    });

    it("handles completed solution", function () {
        $scope.immediateStore.newPromise('solvedCompletely');
        expect($scope.immediate).toBe('dialogue');
        expect($scope.message).toEqual({
            which: 'solved_completely',
            buttons: {
                'ok': true
            }
        });
    });

    it("handles security confirmation", function () {
        $scope.immediateStore.newPromise('actionConfirmation', {text: 'text'});
        expect($scope.immediate).toBe('dialogue');
        expect($scope.message).toEqual({
            text: 'text',
            buttons: {
                'ok': true,
                'abort': true
            }
        });
    });
});


