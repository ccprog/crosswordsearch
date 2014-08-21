describe("CrosswordController", function () {
    beforeEach(module('crwApp'));

    describe("Initialization", function () {
        var qStore;

        beforeEach(function() {
            qStore = {
                addStore: jasmine.createSpy("addStore")
            };
            crosswordFactory = {
                getCrw: jasmine.createSpy("getCrw")
            };
        });

        it("bypasses existing crw and immediateStore", inject(function($rootScope, $controller) {
            var $scope = $rootScope.$new();
            $scope.crw = {getLevelList: angular.noop};
            $scope.immediateStore = {};
            $controller('CrosswordController', {
                qStore: qStore,
                basics: {},
                crosswordFactory: crosswordFactory,
                $scope: $scope
            });
            expect(qStore.addStore).not.toHaveBeenCalled();
            expect(crosswordFactory.getCrw).not.toHaveBeenCalled();
        }));

        it("inits crw and immediateStore if needed", 
                inject(function($rootScope, crosswordFactory, $controller) {
            var $scope = $rootScope.$new();
            spyOn(crosswordFactory, 'getCrw').and.callThrough();
            $controller('CrosswordController', {
                qStore: qStore,
                basics: {},
                crosswordFactory: crosswordFactory,
                $scope: $scope
            });
            expect(qStore.addStore).toHaveBeenCalled();
            expect(crosswordFactory.getCrw).toHaveBeenCalled();
        }));

        it("initializes properties", inject(function($rootScope, $controller) {
            var $scope = $rootScope.$new();
            $scope.crw = {
                getLevelList: jasmine.createSpy("getLevelList")
            };
            $controller('CrosswordController', {
                qStore: qStore,
                basics: {},
                crosswordFactory: crosswordFactory,
                $scope: $scope
            });
            expect($scope.commandState).toBe('full');
            expect($scope.highlight).toEqual([]);
            expect($scope.count).toEqual({
                words: 0,
                solution: 0
            });
            expect($scope.crw.getLevelList).toHaveBeenCalled();
            expect($scope.commands).toBeDefined();
        }));
    });

    describe("Usage", function () {
        var $root, $scope, $child, basics, deferred;

        beforeEach(inject(function($rootScope, $controller, $q) {
            $root = $rootScope.$new();
            $scope = $root.$new();
            $child = $scope.$new();
            basics = {
                localize: function (str) {
                    return crwBasics.locale[str];
                }
            };
            spyOn(basics, 'localize').and.callThrough();
            $scope.crw = {
                getLevelList: function () {
                    return [0,1,2,3];
                }
            };
            $scope.crosswordData = {};
            $controller('CrosswordController', {
                qStore: {addStore: angular.noop},
                basics: basics,
                crosswordFactory: {getCrw: angular.noop},
                $scope: $scope
            });
            $scope.immediateStore = {
                newPromise: function () {
                    deferred = $q.defer();
                    return deferred.promise;
                }
            };
            spyOn($scope.immediateStore, 'newPromise').and.callThrough();
            $scope.crw = {};
        }));

        it("inits command data object, menu and crossword at page load time", function () {
            $scope.crw.setProject = jasmine.createSpy("setProject");
            spyOn($scope, 'load');
            $scope.prepare('project', 'nc', 'ne', 'name', false);
            expect($scope.crw.setProject).toHaveBeenCalledWith('project', 'nc', 'ne', false);
            expect($scope.commandState).toBe('full');
            var commands = ['new', 'load', 'update', 'insert', 'reload'];
            for (var i in $scope.commandList) {
                expect($scope.commandList[i].value).toBe(commands[i]);
                if ($scope.commandList[i].value === 'load') {
                    expect($scope.commandList[i].group).toEqual([]);
                }
            }
            expect($scope.load).not.toHaveBeenCalled();
            $root.$broadcast('immediateReady');
            expect($scope.load).toHaveBeenCalled();
            $scope.prepare('project', 'nc', 'ne', 'name', true);
            expect($scope.commandState).toBe('restricted');
            var commands = ['new', 'update', 'reload'];
            for (var i in $scope.commandList) {
                expect($scope.commandList[i].value).toBe(commands[i]);
                if ($scope.commandList[i].value === 'load') {
                    expect($scope.commandList[i].group).toEqual([]);
                }
            }
        });

        it("evaluates menu commands asynchronously", function () {
            $scope.loadedName = 'name1';
            var listener = jasmine.createSpy("listener");
            $root.$on('select', listener);
            spyOn($scope, 'load');
            spyOn($scope, 'save');
            $child.$emit('select', 'new', 'command');
            $child.$emit('select', 'update', 'command');
            $child.$emit('select', 'insert', 'command');
            $child.$emit('select', 'reload', 'command');
            $child.$emit('select', 'name2', 'load');
            $child.$emit('select', 'name3', 'command.sub');
            expect($scope.load).not.toHaveBeenCalled();
            expect($scope.save).not.toHaveBeenCalled();
            $scope.$apply();
            expect($scope.load).toHaveBeenCalledWith();
            expect($scope.save).toHaveBeenCalledWith('update');
            expect($scope.save).toHaveBeenCalledWith('insert');
            expect($scope.load).toHaveBeenCalledWith('name1');
            expect($scope.load).toHaveBeenCalledWith('name2');
            expect($scope.load).toHaveBeenCalledWith('name3');
            expect(listener).not.toHaveBeenCalled();
        });

        describe("evaluates level selection", function () {
           var critical;
           
           beforeEach(function() {
                $scope.crw.testDirection = function () {
                    return critical;
                }
                spyOn($scope.crw, 'testDirection').and.callThrough();
                $scope.crw.deleteWord = jasmine.createSpy("deleteWord");
                spyOn($scope, 'setHighlight');
            });

            it("on level upgrade", function () {
                critical = [];
                $scope.crosswordData.level = 0;
                $child.$emit('select', 1, 'level');
                expect($scope.crw.testDirection).toHaveBeenCalled();
                expect($scope.setHighlight).not.toHaveBeenCalled();
            });

            it("on non-critical level downgrade", function () {
                critical = [];
                $scope.crosswordData.level = 1;
                $child.$emit('select', 0, 'level');
                expect($scope.setHighlight).not.toHaveBeenCalled();
            });

            it("user resolution on critical level downgrade", function () {
                critical = [1,2];
                $scope.crosswordData.level = 1;
                $child.$emit('select', 0, 'level');
                expect($scope.setHighlight).toHaveBeenCalledWith(critical);
                expect($scope.immediateStore.newPromise.calls.argsFor(0)[0]).toBe('invalidDirections');
                expect($scope.immediateStore.newPromise.calls.argsFor(0)[1]).toEqual({
                    count: 2,
                    level: 0
                });
                deferred.resolve();
                $scope.$apply();
                expect($scope.crw.deleteWord).toHaveBeenCalledWith(1, 'words');
                expect($scope.crw.deleteWord).toHaveBeenCalledWith(2, 'words');
                expect($scope.setHighlight.calls.argsFor(1)[0]).toEqual([]);
            });

            it("user rejection on critical level downgrade", function () {
                critical = [1,2];
                $scope.crosswordData.level = 1;
                $child.$emit('select', 0, 'level');
                $scope.crosswordData.level = 0;
                deferred.reject();
                $scope.$apply();
                expect($scope.crosswordData.level).toBe(1);
                expect($scope.setHighlight).toHaveBeenCalledWith(critical);
                expect($scope.setHighlight.calls.argsFor(1)[0]).toEqual([]);
            });
        });

        it("sets project on preview message", function () {
            $scope.crw.setProject = jasmine.createSpy("setProject");
            $root.$broadcast('previewProject', 'project');
            expect($scope.crw.setProject).toHaveBeenCalledWith('project');
        });

        it("maps words to array", function () {
            var array = $scope.wordsToArray(testdata.words);
            for (var key in testdata.words) {
                expect(array).toContain(testdata.words[key]);
            }
        });

        it("sets highlight", function () {
            $scope.setHighlight('highlight');
            expect($scope.highlight).toBe('highlight');
        });

        it("loads crossword data", function () {
            $scope.namesInProject = ['name1', 'name3'];
            var namesList = ['name1', 'name2'];
            $scope.crosswordData.name = $scope.loadedName = namesList[0];
            $scope.crw.getCrosswordData = function () {
                return {
                    name: namesList[1],
                    words: ['word1', 'word2']
                };
            };
            $scope.crw.getNamesList =  function () {
                return namesList;
            };
            $scope.levelList = 'levelList1';
            $scope.crw.getLevelList = jasmine.createSpy("getLevelList").and.returnValue('levelList2');
            $scope.crw.setWord = jasmine.createSpy("setWord");
            $scope.crw.loadDefault = jasmine.createSpy("loadDefault");
            $scope.commandList = [{value: 'load'}];
            $scope.loadError = 'error1';
            $scope.count.words = 3;
            $scope.count.solution = 3;
            $scope.load();
            expect($scope.loadError).toBeNull();
            expect($scope.crw.loadDefault).toHaveBeenCalled();
            expect($scope.crosswordData.name).toBe('name2');
            expect($scope.crosswordData.words).toBeDefined();
            expect($scope.levelList).toBe('levelList2');
            expect($scope.namesInProject).toBe(namesList);
            expect($scope.commandList[0].group).toBe(namesList);
            expect($scope.loadedName).toBe('name2');
            expect($scope.highlight).toEqual([]);
            expect($scope.count.words).toBe(2);
            expect($scope.count.solution).toBe(0);
            expect($scope.crw.setWord).toHaveBeenCalledWith('word1');
            expect($scope.crw.setWord).toHaveBeenCalledWith('word2');
            $scope.load('');
            expect($scope.crw.loadDefault.calls.count()).toBe(1);
            expect($scope.immediateStore.newPromise).toHaveBeenCalledWith('loadCrossword', '');
            expect($scope.crw.getLevelList.calls.count()).toBe(1);
            deferred.resolve();
            $scope.$apply();
            expect($scope.crw.getLevelList.calls.count()).toBe(2);
            $scope.load('name2');
            expect($scope.immediateStore.newPromise).toHaveBeenCalledWith('loadCrossword', 'name2');
            deferred.reject('error2');
            $scope.$apply();
            expect($scope.crw.getLevelList.calls.count()).toBe(2);
            expect($scope.loadError).toBe('error2');
        });

        it("sets crossword on preview message", function () {
            spyOn($scope, 'load');
            $root.$broadcast('previewCrossword', 'crossword');
            expect($scope.load).toHaveBeenCalledWith('crossword');
        });

        it("restarts the loaded riddle", function () {
            var restrict = true;
            $scope.crw.getLevelRestriction = function () { return restrict; };
            $scope.crosswordData.solution = {
                word1: {solved: true},
                word2: {solved: true}
            };
            $scope.count.solution = 2;
            $scope.restart();
            expect($scope.count.solution).toBe(0);
            expect($scope.crosswordData.solution.word1.solved).toBe(false);
            expect($scope.crosswordData.solution.word2.solved).toBe(false);
            restrict = false;
            $scope.count.solution = 2;
            $scope.restart();
            expect($scope.count.solution).toBe(0);
            expect($scope.crosswordData.solution).toEqual({});
        });

        it("notifies on complete solution", function () {
            $scope.count.words = 2;
            $scope.count.solution = 1;
            $scope.$apply();
            expect($scope.immediateStore.newPromise).not.toHaveBeenCalled();
            $scope.count.solution = 2;
            $scope.$apply();
            expect($scope.immediateStore.newPromise).toHaveBeenCalledWith('solvedCompletely');
        });

        it("opens save user dialogue", function () {
            $scope.save('update');
            expect($scope.immediateStore.newPromise).toHaveBeenCalledWith('saveCrossword', 'insert');
            $scope.crosswordData.name = 'name';
            $scope.save('update');
            expect($scope.immediateStore.newPromise).toHaveBeenCalledWith('saveCrossword', 'update');
        });

        it("delegates randomize", function () {
            $scope.crw.randomizeEmptyFields = jasmine.createSpy("randomizeEmptyFields");
            $scope.randomize();
            expect($scope.crw.randomizeEmptyFields).toHaveBeenCalled();
        });

        it("delegates empty", function () {
            $scope.crw.emptyAllFields = jasmine.createSpy("emptyAllFields");
            $scope.empty();
            expect($scope.crw.emptyAllFields).toHaveBeenCalled();
        });
    });
});