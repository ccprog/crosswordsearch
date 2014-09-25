describe("crosswordFactory", function () {
    var crosswordFactory, ajaxFactory;

    beforeEach(function () {
        module('crwApp');
        inject(function ($injector) {
            crosswordFactory = $injector.get('crosswordFactory');
        });
    });

    it("initializes multiple instances" , function () {
        var crw1 = crosswordFactory.getCrw();
        var crw2 = crosswordFactory.getCrw();
        expect(typeof crw1).toBe('object');
        expect(typeof crw2).toBe('object');
        expect(crw1).not.toBe(crw2);
    });

    describe("crosswordFactory instance", function () {
        var crw, deferred;

        beforeEach(function () {
            crw = crosswordFactory.getCrw();
            inject(function ($q, $injector) {
                var http = function (data) {
                    deferred = $q.defer();
                    return deferred.promise;
                };
                ajaxFactory = $injector.get('ajaxFactory');
                ajaxFactory.http = http;
                ajaxFactory.setNonce = jasmine.createSpy();
                spyOn(ajaxFactory, 'http').and.callThrough();
            });
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
            expect(ajaxFactory.setNonce).toHaveBeenCalledWith('crwnonce', 'crossword');
            crw.loadCrosswordData('name');
            expect(ajaxFactory.http.calls.argsFor(0)).toEqual([{
                action: 'get_crossword',
                project: 'project',
                name: 'name',
                restricted: true
            }, 'crossword']);
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
            var crossword = crw.getCrosswordData();
            crw.setProject('project', 'editnonce', null, false);
            expect(ajaxFactory.setNonce.calls.count()).toBe(1);
            expect(ajaxFactory.setNonce).toHaveBeenCalledWith('editnonce', 'crossword');
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
                restricted: false,
                username: 'username',
                password: 'password',
                name: 'old'
            }));
            expect(ajaxFactory.http.calls.argsFor(0)[1]).toBe('edit');
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

        function compareLetters (table, word) {
            var field, xses = [], yses = [];
            for (var i = 0; i < word.fields.length; i++) {
                field = word.fields[i];
                xses.push(field.x);
                yses.push(field.y);
                expect(field.word.letter).toBe(table[field.y][field.x].letter);
            }
            expect(xses).toEqual([0,1,2]);
            expect(yses).toEqual([1,2,3]);
        }
        
        it("saves a marking as a word", function () {
            var crossword = crw.getCrosswordData();
            angular.extend(crossword, angular.copy(testdata));
            var marking = {
                ID: 11,
                fields: [ {x: 0, y: 1}, {x: 1, y: 2}, {x: 2, y: 3}  ]
            };
            var word = crw.setWord(marking);
            expect(crossword.words[11]).toBe(marking);
            compareLetters(crossword.table, word);
        });

        it("probes a marking to be a solution", function () {
            var crossword = crw.getCrosswordData();
            angular.extend(crossword, angular.copy(testdata));
            var marking = {
                ID: 11,
                color: 'color',
                start: {x: 0, y: 1},
                stop: {x: 2, y: 3},
                fields: [ {x: 0, y: 1}, {x: 1, y: 2}, {x: 2, y: 3} ]
            };
            var word = crw.probeWord(marking);
            expect(crossword.solution[11]).toBe(marking);
            compareLetters(crossword.table, word);
            expect(word.solved).toBe(false);
            marking = {
                ID: 12,
                color: 'color',
                start: {x: 0, y: 0},
                stop: {x: 4, y: 4},
                fields: []
            };
            word = crw.probeWord(marking);
            expect(crossword.solution[12]).toBeUndefined();
            expect(crossword.solution[4]).toBe(crossword.words[4]);
            expect(word).toBe(crossword.words[4]);
            expect(word.solved).toBe(true);
            expect(word.markingId).toBe(12);
        });

        it("finds critical size changes", function () {
            var crossword = crw.getCrosswordData();
            angular.extend(crossword, angular.copy(testdata));
            expect(crw.testWordBoundaries({left: 2, right: 0, top: 0, bottom: 0}).length).toBe(0);
            expect(crw.testWordBoundaries({left: 0, right: 2, top: 0, bottom: 0}).length).toBe(0);
            expect(crw.testWordBoundaries({left: 0, right: 0, top: 2, bottom: 0}).length).toBe(0);
            expect(crw.testWordBoundaries({left: 0, right: 0, top: 0, bottom: 2}).length).toBe(0);
            var critical = crw.testWordBoundaries({left: -1, right: 0, top: 0, bottom: 0});
            expect(critical.length).toBe(3);
            expect(critical).toContain(2);
            expect(critical).toContain(3);
            expect(critical).toContain(4);
            critical = crw.testWordBoundaries({left: 0, right: -1, top: 0, bottom: 0});
            expect(critical.length).toBe(2);
            expect(critical).toContain(5);
            expect(critical).toContain(7);
            critical = crw.testWordBoundaries({left: 0, right: 0, top: -1, bottom: 0});
            expect(critical.length).toBe(3);
            expect(critical).toContain(4);
            expect(critical).toContain(8);
            expect(critical).toContain(10);
            critical = crw.testWordBoundaries({left: 0, right: 0, top: 0, bottom: -2});
            expect(critical.length).toBe(4);
            expect(critical).toContain(2);
            expect(critical).toContain(6);
            expect(critical).toContain(8);
            expect(critical).toContain(10);
        });

        it("finds difficult directions", function () {
            var crossword = crw.getCrosswordData();
            angular.extend(crossword, angular.copy(testdata));
            var critical = crw.testDirection();
            expect(critical.length).toBe(3);
            expect(critical).toContain(2);
            expect(critical).toContain(4);
            expect(critical).toContain(6);
        });

        it("changes the size of the crossword", function () {
            var crossword = crw.getCrosswordData();
            crw.loadDefault();
            crossword.table[5][5].letter = "X";
            crw.changeSize({left: 2, right: 0, top: 0, bottom: 0}, []);
            expect(crossword.table[5][7].letter).toBe("X");
            expect(crossword.table.length).toBe(10);
            for (var i = 0; i < crossword.table.length; i++) {
                expect(crossword.table[i].length).toBe(12);
            }
            crw.changeSize({left: 0, right: -2, top: 0, bottom: 0}, []);
            expect(crossword.table[5][7].letter).toBe("X");
            expect(crossword.table.length).toBe(10);
            for (i = 0; i < crossword.table.length; i++) {
                expect(crossword.table[i].length).toBe(10);
            }
            crw.changeSize({left: 0, right: 0, top: -1, bottom: 0}, []);
            expect(crossword.table[4][7].letter).toBe("X");
            expect(crossword.table.length).toBe(9);
            for (i = 0; i < crossword.table.length; i++) {
                expect(crossword.table[i].length).toBe(10);
            }
            crw.changeSize({left: 0, right: 0, top: 0, bottom: 3}, []);
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
            crw.changeSize({left: 0, right: 0, top: 0, bottom: 0}, [4, 5]);
            expect(crossword.words[4]).toBeUndefined();
            expect(crossword.words[5]).toBeUndefined();
        });
    });
});