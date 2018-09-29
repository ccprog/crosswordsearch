describe("crwMenu (cse option template)", function () {
    beforeEach(module('crwApp'));

    it("sets title and text", inject(function ($rootScope, $compile) {
        var $scope = $rootScope.$new();
        $scope.value = {
            display: 'display',
            title: 'title'
        };
        var element = $compile('<div crw-menu value="value"></div>')($scope);
        $scope.$digest();
        expect(element.text()).toBe('display');
        expect(element.attr('title')).toBe('title');
    }));
});

describe("crwLetterInput", function() {
    var $scope, element;

    beforeEach(module('crwApp'));
    beforeEach(inject(function ($compile, $rootScope) {
        $scope = $rootScope.$new();
        $scope.crosswordData = {
            size: { width: 8, height: 9 }
        };
        $scope.activate = jasmine.createSpy('activate');
        $scope.setLetter = jasmine.createSpy('setLetter');
        element = $compile('<input type="text" crw-letter-input></input>')($scope);
        $scope.$apply();
    }));

    it("remembers focused field", function () {
        var event = jQuery.Event('keydown');
        event.key = 'Backspace';
        $scope.$broadcast('setFocus', 2, 3);
        element.trigger(event);
        expect($scope.setLetter).toHaveBeenCalledWith(null, 2, 3);
        element.trigger(jQuery.Event('blur'));
        element.trigger(event);
        expect($scope.setLetter.calls.count()).toBe(1);
    });

    it("evaluates keydown keys", function () {
        var line, column,  event;
        function trigger (key, ctrlKey) {
            $scope.activate.calls.reset();
            $scope.setLetter.calls.reset();
            event = jQuery.Event('keydown');
            event.key = key;
            event.ctrlKey = ctrlKey;
            $scope.$broadcast('setFocus', line, column);
            element.trigger(event);
            expect(event.isPropagationStopped()).toBe(true);
        }
        line = 2; column = 2;
        trigger('ArrowUp');
        expect($scope.activate).toHaveBeenCalledWith(1, 2);
        expect(event.isDefaultPrevented()).toBe(true);
        trigger('ArrowLeft');
        expect($scope.activate).toHaveBeenCalledWith(2, 1);
        expect(event.isDefaultPrevented()).toBe(true);
        trigger('ArrowRight');
        expect($scope.activate).toHaveBeenCalledWith(2, 3);
        expect(event.isDefaultPrevented()).toBe(true);
        trigger('ArrowDown');
        expect($scope.activate).toHaveBeenCalledWith(3, 2);
        expect(event.isDefaultPrevented()).toBe(true);
        line = 0; column = 0;
        $scope.crosswordData.size = { width: 1, height: 1 };
        trigger('ArrowLeft');
        expect($scope.activate).not.toHaveBeenCalled();
        expect(event.isDefaultPrevented()).toBe(true);
        trigger('ArrowUp');
        expect($scope.activate).not.toHaveBeenCalled();
        expect(event.isDefaultPrevented()).toBe(true);
        trigger('ArrowRight');
        expect($scope.activate).not.toHaveBeenCalled();
        expect(event.isDefaultPrevented()).toBe(true);
        trigger('ArrowDown');
        expect($scope.activate).not.toHaveBeenCalled();
        expect(event.isDefaultPrevented()).toBe(true);
        trigger('Delete');
        expect($scope.setLetter).toHaveBeenCalledWith(null, 0, 0);
        expect(event.isDefaultPrevented()).toBe(true);
        trigger('Backspace');
        expect($scope.setLetter).toHaveBeenCalledWith(null, 0, 0);
        expect(event.isDefaultPrevented()).toBe(true);
        trigger('F');
        expect($scope.activate).not.toHaveBeenCalled();
        expect(event.isDefaultPrevented()).toBe(false);
        trigger('F', true);
        expect($scope.activate).not.toHaveBeenCalled();
        expect(event.isDefaultPrevented()).toBe(true);
    });

    it("reads and discards input", function () {
        $scope.$broadcast('setFocus', 2, 3);
        element.val('X');
        element.trigger(jQuery.Event('input'));
        expect($scope.setLetter).toHaveBeenCalledWith('X', 2, 3);
        expect(element.val()).toBe('');
    });
});

describe("CrosswordController", function () {
    beforeEach(module('crwApp'));

    describe("Initialization", function () {
        var qStore, crosswordFactory;

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
            expect($scope.crw.getLevelList).toHaveBeenCalled();
            expect($scope.riddleVisible).toBe(true);
            expect($scope.waitsForData).toBe(true);
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
                },
                letterRegEx: {
                    test: jasmine.createSpy('test')
                },
                normalizeLetter: angular.identity
            };
            spyOn(basics, 'localize').and.callThrough();
            spyOn(basics, 'normalizeLetter').and.callThrough();
            $scope.crw = {
                getLevelList: function () {
                    return [0,1,2,3];
                },
                setProject: jasmine.createSpy("setProject")
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
        }));

        it("inits command data object, menu and crossword at page load time", function () {
            spyOn($scope, 'load');
            $scope.prepare('project', 'nc', 'ne', '', 'name');
            expect($scope.crw.setProject).toHaveBeenCalledWith('project', 'nc', 'ne', false);
            expect($scope.commandState).toBe('full');
            var commands = ['new', 'load', 'update', 'insert', 'reload'];
            for (var i = 0;i < $scope.commandList.length; i++) {
                expect($scope.commandList[i].value).toBe(commands[i]);
                if ($scope.commandList[i].value === 'load') {
                    expect($scope.commandList[i].group).toEqual([]);
                }
            }
            expect($scope.load).not.toHaveBeenCalled();
            $root.$broadcast('immediateReady');
            expect($scope.load).toHaveBeenCalledWith('name');
        });

        it("inits command data object for restricted build", function () {
            spyOn($scope, 'load');
            $scope.prepare('project', 'nc', 'ne', 'restricted', 'name');
            expect($scope.crw.setProject).toHaveBeenCalledWith('project', 'nc', 'ne', true);
            expect($scope.commandState).toBe('restricted');
            var commands = ['new', 'update', 'reload'];
            for (var i = 0;i < $scope.commandList.length; i++) {
                expect($scope.commandList[i].value).toBe(commands[i]);
                if ($scope.commandList[i].value === 'load') {
                    expect($scope.commandList[i].group).toEqual([]);
                }
            }
            $root.$broadcast('immediateReady');
            expect($scope.load).toHaveBeenCalledWith(null);
        });

        it("inits competitive solve mode", function () {
            $scope.prepare('project', 'nc', 'ne', 'timer', 'name');
            expect($scope.crw.setProject).toHaveBeenCalledWith('project', 'nc', 'ne', false);
            expect($scope.riddleVisible).toBe(false);
        });

        describe("watches timer state", function () {
            beforeEach(function () {
                spyOn($scope, 'restart');
                $scope.crw.submitSolution = jasmine.createSpy("submitSolution");
                $scope.prepare('project', 'nc', 'ne', 'timer', 'name');
                $scope.timer = {
                    countdown: false,
                    submitting: false,
                    time: 64263
                };
                $scope.count = {
                    words: 2,
                    solution: 1
                };
            });

            it("from waiting to playing", function () {
                $scope.$apply('timer.state="waiting"');
                expect($scope.riddleVisible).toBe(false);
                expect($scope.restart).not.toHaveBeenCalled();
                expect($scope.immediateStore.newPromise).not.toHaveBeenCalled();
                $scope.$apply('timer.state="playing"');
                expect($scope.riddleVisible).toBe(true);
                expect($scope.restart).not.toHaveBeenCalled();
                expect($scope.immediateStore.newPromise).not.toHaveBeenCalled();
            });

            it("from playing to scored", function () {
                spyOn($scope, '$broadcast');
                $scope.$apply('timer.state="playing"');
                $scope.$apply('timer.state="scored"');
                expect($scope.riddleVisible).toBe(true);
                expect($scope.restart).not.toHaveBeenCalled();
                expect($scope.$broadcast).toHaveBeenCalledWith('markingStop');
                expect($scope.immediateStore.newPromise).toHaveBeenCalledWith('solvedCompletely', 64263);
                deferred.resolve();
                $scope.$apply();
                expect($scope.crw.submitSolution).not.toHaveBeenCalled();
            });

            it("from scored to waiting", function () {
                $scope.$apply('timer.state="scored"');
                $scope.$apply('timer.state="waiting"');
                expect($scope.restart).toHaveBeenCalled();
            });

            it("from playing to waiting", function () {
                $scope.$apply('timer.state="playing"');
                $scope.$apply('timer.state="waiting"');
                expect($scope.restart).not.toHaveBeenCalled();
                expect($scope.immediateStore.newPromise).not.toHaveBeenCalled();
            });

            it("from playing to final (submitting)", function () {
                $scope.timer.submitting = true;
                $scope.$apply('timer.state="playing"');
                $scope.$apply('timer.state="final"');
                deferred.resolve();
                $scope.$apply();
                expect($scope.immediateStore.newPromise).toHaveBeenCalledWith('submitSolution', 64263);
            });
        });

        it("evaluates menu commands asynchronously", function () {
            $scope.loadedName = 'name1';
            var listener = jasmine.createSpy("listener");
            $root.$on('cseSelect', listener);
            spyOn($scope, 'load');
            spyOn($scope, 'save');
            $child.$emit('cseSelect', 'command', 'new');
            $child.$emit('cseSelect', 'command', 'update');
            $child.$emit('cseSelect', 'command', 'insert');
            $child.$emit('cseSelect', 'command', 'reload');
            $child.$emit('cseSelect', 'command.sub', 'name2');
            expect($scope.load).not.toHaveBeenCalled();
            expect($scope.save).not.toHaveBeenCalled();
            $scope.$apply();
            expect($scope.load).toHaveBeenCalledWith();
            expect($scope.save).toHaveBeenCalledWith('update');
            expect($scope.save).toHaveBeenCalledWith('insert');
            expect($scope.load).toHaveBeenCalledWith('name1');
            expect($scope.load).toHaveBeenCalledWith('name2');
            expect(listener).not.toHaveBeenCalled();
        });

        it("routes reloads to restart in solve mode conditionally", function () {
            $scope.loadedName = 'name1';
            expect($scope.crosswordData).toBeDefined();
            var listener = jasmine.createSpy("listener");
            $root.$on('cseSelect', listener);
            spyOn($scope, 'load');
            spyOn($scope, 'restart');
            $child.$emit('cseSelect', 'load', 'name1');
            $child.$emit('cseSelect', 'load', 'name2');
            expect($scope.load).not.toHaveBeenCalled();
            expect($scope.restart).not.toHaveBeenCalled();
            $scope.$apply();
            expect($scope.load).toHaveBeenCalledWith('name2');
            expect($scope.restart).toHaveBeenCalled();
            expect(listener).not.toHaveBeenCalled();
        });

        describe("evaluates level selection", function () {
           var critical;
           
           beforeEach(function() {
                $scope.crw.testDirection = function () {
                    return critical;
                };
                spyOn($scope.crw, 'testDirection').and.callThrough();
                $scope.crw.deleteWord = jasmine.createSpy("deleteWord");
                spyOn($scope, 'setHighlight');
            });

            it("on level upgrade", function () {
                critical = [];
                $scope.crosswordData.level = 0;
                $child.$emit('cseSelect', 'level', 1);
                $scope.$apply();
                expect($scope.crw.testDirection).toHaveBeenCalled();
                expect($scope.setHighlight).not.toHaveBeenCalled();
            });

            it("on non-critical level downgrade", function () {
                critical = [];
                $scope.crosswordData.level = 1;
                $child.$emit('cseSelect', 'level', 0);
                expect($scope.setHighlight).not.toHaveBeenCalled();
            });

            it("user resolution on critical level downgrade", function () {
                critical = [1,2];
                $scope.crosswordData.level = 1;
                $child.$emit('cseSelect', 'level', 0);
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
                $child.$emit('cseSelect', 'level', 0);
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
            $root.$broadcast('previewProject', 'project', 'crosswordNonce');
            expect($scope.crw.setProject).toHaveBeenCalledWith('project', 'crosswordNonce');
        });

        it("maps words to array", function () {
            var array = $scope.wordsToArray(testdata.words);
            for (var key in testdata.words) {
                if (testdata.words.hasOwnProperty(key)) {
                    expect(array).toContain(testdata.words[key]);
                }
            }
        });

        it("sets highlight", function () {
            $scope.setHighlight('highlight');
            expect($scope.highlight).toBe('highlight');
        });

        describe("Crossword loading", function () {
            var namesList = ['name1', 'name2'];

            beforeEach(inject(function ($q) {
                $scope.namesInProject = ['name1', 'name3'];
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
                $scope.crw.getCount =  function () {
                    return {
                        words: 2,
                        solution: 0
                    };
                };
                $scope.levelList = 'levelList1';
                $scope.crw.getLevelList = jasmine.createSpy("getLevelList").and.returnValue('levelList2');
                $scope.crw.loadDefault = jasmine.createSpy("loadDefault");
                $scope.crw.loadCrosswordData = function () {
                    deferred = $q.defer();
                    return deferred.promise;
                };
                spyOn($scope.crw, 'loadCrosswordData').and.callThrough();
                $scope.commandList = [{value: 'load'}];
                $scope.loadError = 'error1';
                $scope.count = {
                    word: 3,
                    solution: 3
                };
            }));

            it("loads default crossword data", function () {
                $scope.load();
                expect($scope.loadError).toBeNull();
                expect($scope.waitsForData).toBe(false);
                expect($scope.crw.loadDefault).toHaveBeenCalled();
                expect($scope.crw.loadCrosswordData).not.toHaveBeenCalled();
                expect($scope.crosswordData.name).toBe('name2');
                expect($scope.crosswordData.words).toBeDefined();
                expect($scope.levelList).toBe('levelList2');
                expect($scope.namesInProject).toBe(namesList);
                expect($scope.commandList[0].group).toBe(namesList);
                expect($scope.loadedName).toBe('name2');
                expect($scope.highlight).toEqual([]);
                expect($scope.count.words).toBe(2);
                expect($scope.count.solution).toBe(0);
                $scope.load('');
                expect($scope.crw.loadDefault.calls.count()).toBe(1);
                expect($scope.crw.loadCrosswordData).toHaveBeenCalled();
                expect($scope.waitsForData).toBe(true);
            });

            it("updates on async response", function () {
                $scope.load('name3');
                expect($scope.crw.loadDefault).not.toHaveBeenCalled();
                expect($scope.crw.loadCrosswordData).toHaveBeenCalledWith('name3');
                expect($scope.waitsForData).toBe(true);
                expect($scope.crw.getLevelList).not.toHaveBeenCalled();
                deferred.resolve();
                $scope.$apply();
                expect($scope.crw.getLevelList).toHaveBeenCalled();
                expect($scope.riddleVisible).toBe(true);
                expect($scope.waitsForData).toBe(false);
            });

            it("does not update on async error", function () {
                $scope.load('name2');
                expect($scope.crw.loadCrosswordData).toHaveBeenCalledWith('name2');
                deferred.reject('error2');
                $scope.$apply();
                expect($scope.crw.getLevelList).not.toHaveBeenCalled();
                expect($scope.loadError).toBe('error2');
                expect($scope.waitsForData).toBe(true);
            });

            it("inits timer on load", function () {
                $scope.timer = {};
                spyOn($scope, '$broadcast');
                $scope.load('name3');
                expect($scope.crw.loadCrosswordData).toHaveBeenCalledWith('name3');
                deferred.resolve();
                $scope.$apply();
                expect($scope.riddleVisible).toBe(false);
                expect($scope.$broadcast).toHaveBeenCalledWith('timerInit');
                expect($scope.waitsForData).toBe(false);
            });
        });

        it("sets crossword on preview message", function () {
            spyOn($scope, 'load');
            $root.$broadcast('previewCrossword', 'crossword');
            expect($scope.load).toHaveBeenCalledWith('crossword');
        });

        it("handles solution on restart of the loaded riddle", function () {
            var restrict = true;
            $scope.crw.getLevelRestriction = function () { return restrict; };
            spyOn($scope.crw, 'getLevelRestriction').and.callThrough();
            $scope.crosswordData.words = {
                word1: {solved: true},
                word2: {solved: true}
            };
            $scope.crosswordData.solution = angular.copy($scope.crosswordData.words);
            $scope.count = {
                solution: 2
            };
            $scope.restart();
            expect($scope.count.solution).toBe(0);
            expect($scope.crosswordData.words.word1.solved).toBe(false);
            expect($scope.crosswordData.words.word2.solved).toBe(false);
            $scope.crosswordData.words = {
                word1: {solved: true},
                word2: {solved: true}
            };
            $scope.crosswordData.solution = angular.copy($scope.crosswordData.words);
            restrict = false;
            $scope.count.solution = 2;
            $scope.restart();
            expect($scope.count.solution).toBe(0);
            expect($scope.crosswordData.words.word1.solved).toBe(false);
            expect($scope.crosswordData.words.word2.solved).toBe(false);
            expect($scope.crosswordData.solution).toEqual({});
        });

        it("handles timer on restart of the loaded riddle", function () {
            $scope.crw.getLevelRestriction = jasmine.createSpy('getLevelRestriction').and.returnValue(true);
            spyOn($scope, '$broadcast');
            $scope.crosswordData.words = {};
            $scope.count = {
                solution: 2
            };
            $scope.timer = {
                submitting: true
            };
            $scope.riddleVisible = true;
            $scope.restart();
            expect($scope.riddleVisible).toBe(true);
            expect($scope.$broadcast).not.toHaveBeenCalled();
            expect($scope.crw.getLevelRestriction).not.toHaveBeenCalled();
            $scope.timer.submitting = false;
            $scope.restart();
            expect($scope.riddleVisible).toBe(false);
            expect($scope.$broadcast).toHaveBeenCalledWith('timerInit');
            expect($scope.crw.getLevelRestriction).toHaveBeenCalled();
        });

        it("notifies on complete solution", function () {
            spyOn($scope, '$broadcast');
            $scope.count = {
                words: 2,
                solution: 1
            };
            $scope.$apply();
            expect($scope.immediateStore.newPromise).not.toHaveBeenCalled();
            $scope.count.solution = 2;
            $scope.$apply();
            expect($scope.immediateStore.newPromise).toHaveBeenCalledWith('solvedCompletely');
            expect($scope.$broadcast).not.toHaveBeenCalled();
            $scope.count.solution = 1;
            $scope.$apply();
            $scope.timer = {};
            $scope.count.solution = 2;
            $scope.$apply();
            expect($scope.immediateStore.newPromise.calls.count()).toBe(1);
            expect($scope.$broadcast).toHaveBeenCalledWith('timerStop');
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

        it("broadcasts setFocus events", function () {
            $scope.child = $scope.$new();
            var listener = jasmine.createSpy("listener");
            $scope.child.$on('setFocus', listener);
            $scope.activate(1, 2);
            expect(listener.calls.argsFor(0)[1]).toBe(1);
            expect(listener.calls.argsFor(0)[2]).toBe(2);
        });

        it("sets the letters in the crossword data", function () {
            $scope.$apply($scope.crosswordData = angular.copy(testdata));
            expect($scope.crosswordData.table[0][0].letter).toBe('V');
            expect($scope.crosswordData.table[0][1].letter).toBe('N');
            expect($scope.crosswordData.table[0][2].letter).toBe('N');
            basics.letterRegEx.test.and.returnValue(true);
            $scope.setLetter('A', 0, 0);
            expect(basics.letterRegEx.test).toHaveBeenCalledWith('A');
            expect(basics.normalizeLetter).toHaveBeenCalledWith('A');
            expect($scope.crosswordData.table[0][0].letter).toBe('A');
            $scope.setLetter(null, 0, 1);
            expect(basics.letterRegEx.test.calls.count()).toBe(1);
            expect($scope.crosswordData.table[0][1].letter).toBe(null);
            basics.letterRegEx.test.and.returnValue(false);
            $scope.setLetter('B', 0, 2);
            expect(basics.letterRegEx.test).toHaveBeenCalledWith('B');
            expect(basics.normalizeLetter.calls.count()).toBe(1);
            expect($scope.crosswordData.table[0][2].letter).toBe('N');
        });
    });
});
