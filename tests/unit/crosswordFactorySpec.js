describe("crosswordFactory", function () {
    var crosswordFactory, basics, ajaxFactory, deferred;

    beforeEach(function () {
        module('crwApp');
        module(function($provide) {
            $provide.factory('ajaxFactory', function ($q) {
                var crwId = 0;
                return {
                    getId: function () {
                        return crwId++;
                    },
                    setNonce: jasmine.createSpy(),
                    http: function (data) {
                        deferred = $q.defer();
                        return deferred.promise;
                    }
                };
            });
        });
        inject(function (_basics_, _ajaxFactory_, _crosswordFactory_) {
            basics = _basics_;
            ajaxFactory = _ajaxFactory_;
            spyOn(ajaxFactory, 'getId').and.callThrough();
            spyOn(ajaxFactory, 'http').and.callThrough();
            crosswordFactory = _crosswordFactory_;
        });
    });

    it("initializes multiple instances" , function () {
        var crw1 = crosswordFactory.getCrw();
        var crw2 = crosswordFactory.getCrw();
        expect(typeof crw1).toBe('object');
        expect(typeof crw2).toBe('object');
        expect(crw1).not.toBe(crw2);
    });

    it("uses multiple nonce keys for multiple instances" , function () {
        var crw1 = crosswordFactory.getCrw();
        expect(ajaxFactory.getId.calls.count()).toBe(1);
        var crw2 = crosswordFactory.getCrw();
        expect(ajaxFactory.getId.calls.count()).toBe(2);
        crw1.loadCrosswordData('name1');
        crw2.loadCrosswordData('name2');
        expect(ajaxFactory.http.calls.argsFor(0)[1]).not.toEqual(ajaxFactory.http.calls.argsFor(1)[1]);
        ajaxFactory.http.calls.reset();
        crw1.saveCrosswordData('name1', 'method', 'user', 'password');
        crw2.saveCrosswordData('name2', 'method', 'user', 'password');
        expect(ajaxFactory.http.calls.argsFor(0)[1]).not.toEqual(ajaxFactory.http.calls.argsFor(1)[1]);
    });

    describe("crosswordFactory instance", function () {
        var crw;

        beforeEach(function () {
            crw = crosswordFactory.getCrw();
            expect(crw.getCrosswordData()).toEqual({});
        });

        it("loads default crossword and validate", function () {
            crw.loadDefault();
            var crossword = crw.getCrosswordData();
            var result = tv4.validateMultiple(crossword, schema);
            expect(result.valid).toBe(false);
            expect(result.errors.length).toBe(1);
            expect(result.errors[0].dataPath).toBe('/name');
            expect(result.errors[0].code).toBe(tv4.errorCodes.STRING_LENGTH_SHORT);
        });

        it("loads restricted crossword data", inject(function ($rootScope) {
            var crossword = crw.getCrosswordData();
            crw.setProject('project', 'crwnonce', null, true);
            expect(ajaxFactory.setNonce.calls.count()).toBe(1);
            expect(ajaxFactory.setNonce).toHaveBeenCalledWith('crwnonce', 'crossword0');
            crw.loadCrosswordData('name');
            expect(ajaxFactory.http.calls.argsFor(0)).toEqual([{
                action: 'get_crossword',
                project: 'project',
                name: 'name',
                restricted: 1
            }, 'crossword0']);
            expect(crossword).toEqual({});

            deferred.resolve({
                crossword: null,
                default_level: 0,
                maximum_level: 2
            });
            $rootScope.$apply();
            expect(crossword.name).toBe('');
            expect(crw.getNamesList()).toBeUndefined();
            expect(crossword.level).toBe(0);
            expect(crw.getLevelList()).toEqual([0,1,2]);
        }));

        it("loads unrestricted crossword data", inject(function ($rootScope) {
            expect(crw.getCount()).toEqual({
                words: 0,
                solution: 0
            });
            var crossword = crw.getCrosswordData();
            crw.setProject('project', 'editnonce', null, false);
            expect(ajaxFactory.setNonce.calls.count()).toBe(1);
            expect(ajaxFactory.setNonce).toHaveBeenCalledWith('editnonce', 'crossword0');
            crw.loadCrosswordData('test');

            var namesList = ['test', 'more'];
            deferred.resolve({
                crossword: angular.copy(testdata),
                default_level: 2,
                maximum_level: 3,
                namesList: namesList
            });
            $rootScope.$apply();
            expect(crossword.name).toBe('test');
            expect(crossword.solution).toEqual(crossword.words);
            expect(crw.getNamesList()).toBe(namesList);
            expect(crossword.level).toBe(1);
            expect(crw.getLevelList()).toEqual([0,1,2,3]);
            expect(crw.getCount()).toEqual({
                words: 9,
                solution: 0
            });
        }));

        it("calls ajax for saving crossword data", inject(function ($rootScope) {
            var crossword = crw.getCrosswordData();
            crw.setProject('project', null, 'crwnonce', false);
            crw.loadDefault();
            crw.saveCrosswordData('old', 'insert', 'username', 'password');
            expect(ajaxFactory.http.calls.argsFor(0)[0]).toEqual(jasmine.objectContaining({
                action: 'save_crossword',
                method: 'insert',
                project: 'project',
                restricted: 0,
                username: 'username',
                password: 'password',
                name: 'old'
            }));
            expect(ajaxFactory.http.calls.argsFor(0)[1]).toBe('edit0');
            var json = ajaxFactory.http.calls.argsFor(0)[0].crossword;
            expect(JSON.parse(json)).toEqual(crossword);

            var namesList = ['test', 'more'];
            deferred.resolve({
                namesList: namesList
            });
            $rootScope.$apply();
            expect(crw.getNamesList()).toBe(namesList);

            crossword.name = 'new';
            crw.saveCrosswordData('old', 'update', 'username', 'password');
            expect(ajaxFactory.http.calls.argsFor(1)[0]).toEqual(jasmine.objectContaining({
                method: 'update',
                name: 'new',
                old_name: 'old'
            }));
        }));

        it("calls ajax for submitting a solution", inject(function ($rootScope) {
            crw.loadDefault();
            var crossword = crw.getCrosswordData();
            crossword.name = 'name';
            crw.setProject('project', null, 'crwnonce', false);
            var resolver = jasmine.createSpy('resolver');
            crw.submitSolution('time', 'username', 'password').then(resolver);
            expect(ajaxFactory.http.calls.argsFor(0)[0]).toEqual(jasmine.objectContaining({
                action: 'submit_solution',
                project: 'project',
                name: 'name',
                time: 'time',
                solved: 0,
                total: 0,
                username: 'username',
                password: 'password'
            }));
            expect(ajaxFactory.http.calls.argsFor(0)[1]).toBe('crossword0');
            deferred.resolve({
                submitted: 'message'
            });
            $rootScope.$apply();
            expect(resolver).toHaveBeenCalledWith('message');
        }));

        it("gets highest word ID", function () {
            var crossword = crw.getCrosswordData();
            crw.loadDefault();
            expect(crw.getHighId()).toBe(0);
            angular.extend(crossword, angular.copy(testdata));
            expect(crw.getHighId()).toBe(10);
        });

        it("gets a random color that differs from the last", function () {
            var crossword = crw.getCrosswordData();
            angular.extend(crossword, angular.copy(testdata));
            expect(crw.randomColor()).not.toBe(crossword.words["10"].color);
        });

        it("deletes a word", function () {
            var crossword = crw.getCrosswordData();
            angular.extend(crossword, angular.copy(testdata));
            expect(crossword.words[5]).toBeDefined();
            crw.deleteWord(5, 'words');
            expect(crossword.words[5]).toBeUndefined();
            crossword.solution[4] = angular.copy(crossword.words[4]);
            expect(crossword.solution[4]).toBeDefined();
            crw.deleteWord(4, 'solution');
            expect(crossword.solution[4]).toBeUndefined();
        });

        it("fills all empty fields with a random letter", function () {
            var crossword = crw.getCrosswordData();
            angular.extend(crossword, angular.copy(testdata));
            crw.randomizeEmptyFields();
            for(var line = 0; line < crossword.table.length; line++) {
                for(var field = 0; field < crossword.table[line].length; field++) {
                    expect(crossword.table[line][field].letter).toBeTruthy();
                }
            }
        });

        it("set all fields to empty", function () {
            var crossword = crw.getCrosswordData();
            crw.loadDefault();
            crw.emptyAllFields();
            for(var line = 0; line < crossword.table.length; line++) {
                for(var field = 0; field < crossword.table[line].length; field++) {
                    expect(crossword.table[line][field].letter).toBeFalsy();
                }
            }
        });

        it("interprets level restrictions", function () {
            var crossword = crw.getCrosswordData();
            crossword.level = 0;
            expect(crw.getLevelRestriction('dir')).toBe(true);
            expect(crw.getLevelRestriction('sol')).toBe(true);
            crossword.level = 1;
            expect(crw.getLevelRestriction('dir')).toBe(false);
            expect(crw.getLevelRestriction('sol')).toBe(true);
            crossword.level = 2;
            expect(crw.getLevelRestriction('dir')).toBe(true);
            expect(crw.getLevelRestriction('sol')).toBe(false);
            crossword.level = 3;
            expect(crw.getLevelRestriction('dir')).toBe(false);
            expect(crw.getLevelRestriction('sol')).toBe(false);
        });
        
        var markingData = [
            { start: {x: 2, y: 3}, stop: {x: 4, y: 3}, fields: [[2, 3], [3 ,3], [4, 3]], direction: 'right' },
            { start: {x: 2, y: 3}, stop: {x: 4, y: 5}, fields: [[2, 3], [3, 4], [4, 5]], direction: 'down-right' },
            { start: {x: 2, y: 3}, stop: {x: 2, y: 6}, fields: [[2, 3], [2, 4], [2, 5], [2, 6]], direction: 'down' },
            { start: {x: 2, y: 3}, stop: {x: 0, y: 5}, fields: [[2, 3], [1, 4], [0, 5]], direction: 'down-left' },
            { start: {x: 2, y: 3}, stop: {x: 0, y: 3}, fields: [[2, 3], [1, 3], [0, 3]], direction: 'left' },
            { start: {x: 2, y: 3}, stop: {x: 1, y: 2}, fields: [[2, 3], [1, 2]], direction: 'up-left' },
            { start: {x: 2, y: 3}, stop: {x: 2, y: 2}, fields: [[2, 3], [2, 2]], direction: 'up' },
            { start: {x: 2, y: 3}, stop: {x: 4, y: 1}, fields: [[2, 3], [3, 2], [4, 1]], direction: 'up-right' },
            { start: {x: 2, y: 3}, stop: {x: 2, y: 3}, fields: [[2, 3]], direction: 'origin' }
        ];

        markingData.forEach(function (data) {
            it("saves a marking as a word in direction " + data.direction, function () {
                var crossword = crw.getCrosswordData();
                angular.extend(crossword, angular.copy(testdata));
                var marking = {
                    ID: 11,
                    start: data.start,
                    stop: data.stop
                };
                var word = crw.setWord(marking);
                expect(crossword.words[11]).toBe(marking);
                expect(word).toBe(marking);
                expect(marking.direction).toBe(data.direction);
                data.fields.forEach(function (field, i) {
                    expect(marking.fields[i].x).toBe(field[0]);
                    expect(marking.fields[i].y).toBe(field[1]);
                    expect(marking.fields[i].word).toBe(crossword.table[field[1]][field[0]]);
                });
            });
        });
        
        it("saves a double marking as a word only if IDs are identical", function () {
            var crossword = crw.getCrosswordData();
            angular.extend(crossword, angular.copy(testdata));
            var marking = {
                ID: 11,
                color: 'color',
                start: {"x":4,"y":5},
                stop: {"x":0,"y":5}
            };
            var word = crw.setWord(marking);
            expect(crossword.words[11]).toBeUndefined();
            expect(word).toBe(false);
            marking.ID = 2;
            word = crw.setWord(marking);
            expect(crossword.words[2]).toBe(marking);
            expect(marking.fields.length).toBe(5);
        });

        it("probes a marking to be a solution", function () {
            var crossword = crw.getCrosswordData();
            angular.extend(crossword, angular.copy(testdata));
            var marking = {
                ID: 11,
                color: 'color',
                start: {x: 0, y: 1},
                stop: {x: 2, y: 3}
            };
            var word = crw.probeWord(marking);
            expect(crossword.solution[11]).toBe(marking);
            expect(marking.fields.length).toBe(3);
            expect(marking.fields[0].word).toBe(crossword.table[1][0]);
            expect(marking.fields[1].word).toBe(crossword.table[2][1]);
            expect(marking.fields[2].word).toBe(crossword.table[3][2]);
            expect(word.solved).toBe(false);
            marking = {
                ID: 12,
                color: 'color',
                start: {x: 0, y: 0},
                stop: {x: 4, y: 4}
            };
            word = crw.probeWord(marking);
            expect(crossword.solution[12]).toBeUndefined();
            expect(crossword.solution[4]).toEqual(crossword.words[4]);
            expect(word.start).toEqual(crossword.words[4].start);
            expect(word.stop).toEqual(crossword.words[4].stop);
            expect(word.color).toEqual(crossword.words[4].color);
            expect(word.solved).toBe(true);
            expect(word.markingId).toBe(12);
        });

        it("does not identify a double marking as a solution", function () {
            var crossword = crw.getCrosswordData();
            angular.extend(crossword, angular.copy(testdata));
            crossword.words[4].solved = true;
            crossword.solution[4] = crossword.words[4];
            var marking = {
                ID: 12,
                color: 'color',
                start: {x: 0, y: 0},
                stop: {x: 4, y: 4}
            };
            var word = crw.probeWord(marking);
            expect(crossword.solution[12]).toBe(marking);
            expect(word.solved).toBeNull();
        });

        it("finds critical size changes", function () {
            var crossword = crw.getCrosswordData();
            angular.extend(crossword, angular.copy(testdata));
            expect(crw.testWordBoundaries('left', -2).length).toBe(0);
            expect(crw.testWordBoundaries('right', 2).length).toBe(0);
            expect(crw.testWordBoundaries('top', -2).length).toBe(0);
            expect(crw.testWordBoundaries('bottom', 2).length).toBe(0);
            var critical = crw.testWordBoundaries('left', 1);
            expect(critical.length).toBe(3);
            expect(critical).toContain(2);
            expect(critical).toContain(3);
            expect(critical).toContain(4);
            critical = crw.testWordBoundaries('right', -1);
            expect(critical.length).toBe(2);
            expect(critical).toContain(5);
            expect(critical).toContain(7);
            critical = crw.testWordBoundaries('top', 1);
            expect(critical.length).toBe(3);
            expect(critical).toContain(4);
            expect(critical).toContain(8);
            expect(critical).toContain(10);
            critical = crw.testWordBoundaries('bottom', -2);
            expect(critical.length).toBe(4);
            expect(critical).toContain(2);
            expect(critical).toContain(6);
            expect(critical).toContain(8);
            expect(critical).toContain(10);
        });

        it("finds difficult LTR directions", function () {
            basics.textIsLTR = true;
            var crossword = crw.getCrosswordData();
            angular.extend(crossword, angular.copy(testdata));
            var critical = crw.testDirection();
            expect(critical.length).toBe(3);
            expect(critical).toContain(2);
            expect(critical).toContain(4);
            expect(critical).toContain(6);
        });

        it("finds difficult RTL directions", function () {
            basics.textIsLTR = false;
            var crossword = crw.getCrosswordData();
            angular.extend(crossword, angular.copy(testdata));
            var critical = crw.testDirection();
            expect(critical.length).toBe(5);
            expect(critical).toContain(3);
            expect(critical).toContain(4);
            expect(critical).toContain(6);
            expect(critical).toContain(7);
            expect(critical).toContain(9);
        });

        it("changes the size of the crossword", function () {
            var crossword = crw.getCrosswordData();
            crw.loadDefault();
            crossword.table[5][5].letter = "X";
            crw.changeSize('left', -2, []);
            expect(crossword.table[5][7].letter).toBe("X");
            expect(crossword.table.length).toBe(10);
            for (var i = 0; i < crossword.table.length; i++) {
                expect(crossword.table[i].length).toBe(12);
            }
            crw.changeSize('right', -2, []);
            expect(crossword.table[5][7].letter).toBe("X");
            expect(crossword.table.length).toBe(10);
            for (i = 0; i < crossword.table.length; i++) {
                expect(crossword.table[i].length).toBe(10);
            }
            crw.changeSize('top', 1, []);
            expect(crossword.table[4][7].letter).toBe("X");
            expect(crossword.table.length).toBe(9);
            for (i = 0; i < crossword.table.length; i++) {
                expect(crossword.table[i].length).toBe(10);
            }
            crw.changeSize('bottom', 3, []);
            expect(crossword.table[4][7].letter).toBe("X");
            expect(crossword.table.length).toBe(12);
            for (i = 0; i < crossword.table.length; i++) {
                expect(crossword.table[i].length).toBe(10);
            }
        });

        it("deletes critical words on size change", function () {
            var crossword = crw.getCrosswordData();
            angular.extend(crossword, angular.copy(testdata));
            expect(crossword.words[4]).toBeDefined();
            expect(crossword.words[5]).toBeDefined();
            crw.changeSize('left', 0, [4, 5]);
            expect(crossword.words[4]).toBeUndefined();
            expect(crossword.words[5]).toBeUndefined();
        });
    });
});
