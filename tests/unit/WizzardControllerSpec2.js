var tb_remove, send_to_editor, wp;

describe("Wizzard", function() {
    var ajaxFactory, deferred;

    beforeEach(function () {
        module('crwApp');
        module(function($provide) {
            $provide.factory('ajaxFactory', function ($q) {
                return {
                    setNonce: jasmine.createSpy(),
                    http: function (data) {
                        deferred = $q.defer();
                        return deferred.promise;
                    }
                };
            });
        });
        inject(function (_ajaxFactory_) {
            ajaxFactory = _ajaxFactory_;
            spyOn(ajaxFactory, 'http').and.callThrough();
        });
    });

    describe("crwLaunch", function() {
        it("retrieves public list", inject(function($rootScope, $compile) {
            var $scope = $rootScope.$new();
            var element = $compile('<a crw-launch></a>')($scope);
            var handleData = jasmine.createSpy('handleData');
            $scope.$on('publicList', handleData);
            element.click();
            expect(ajaxFactory.http).toHaveBeenCalledWith({
                action: 'get_crw_public_list'
            }, 'wizzard');
            deferred.resolve('data');
            $scope.$apply();
            expect(handleData.calls.argsFor(0)[1]).toBe('data');
        }));
    });

    describe("WizzardController", function() {
        var $rootScope, $scope;
        crwBasics.l10nEmpty = 'empty';
        crwBasics.l10nDefault = 'default';
        crwBasics.l10nChoose = 'choose';

        var list = [
            {
                name: 'project1',
                crosswords: ['crossword1', 'crossword2', 'crossword3']
            },
            {
                name: 'project2',
                crosswords: []
            }
        ];
        
        beforeEach(inject(function(_$rootScope_, $controller) {
            $rootScope = _$rootScope_;
            $scope = $rootScope.$new();            
            $controller('WizzardController', {
                $scope: $scope,
                ajaxFactory: ajaxFactory
            });
            tb_remove = jasmine.createSpy('tb_remove');
            wp = {
                shortcode: {
                    string: jasmine.createSpy('string')
                }
            };
            send_to_editor = jasmine.createSpy('send_to_editor');
        }));

        it("inits controller", function() {
            expect($scope.noData).toBe(true);
            expect($scope.projects).toEqual([]);
            expect($scope.mode).toBe('solve');
            expect($scope.timer).toBe('none');
        });

        it("sets nonce", function() {
            $scope.prepare('nonce');
            expect(ajaxFactory.setNonce).toHaveBeenCalledWith('nonce', 'wizzard');
        });

        it("sets projects and names at publicList event", function() {
            $rootScope.$broadcast('publicList', {
                projects: list
            });
            $scope.$apply();
            expect($scope.projects).toBe(list);
            expect($scope.project).toBe(list[0]);
            expect($scope.noData).toBe(false);
            expect($scope.names).toEqual([
                { key: 'no', label: 'choose' },
                { key: 'crossword1', label: 'crossword1'},
                { key: 'crossword2', label: 'crossword2'},
                { key: 'crossword3', label: 'crossword3'}
            ]);
            expect($scope.crossword).toBe('no');
        });

        it("sets names on project change", function() {
            $rootScope.$broadcast('publicList', {
                projects: list
            });
            $scope.$apply("project=projects[1]");
            $scope.$apply();
            expect($scope.names).toEqual([
                { key: 'no', label: 'choose' }
            ]);
            expect($scope.crossword).toBe('no');
        });

        it("sets names basic options on mode change", function() {
            var basicSolve = [
                { key: 'no', label: 'choose' }
            ];
            var basicBuild = [
                { key: 'new', label: 'empty' },
                { key: 'dft', label: 'default' }
            ];
            $rootScope.$broadcast('publicList', {
                projects: list
            });
            $scope.$apply();
            $scope.$apply("mode ='build'");
            expect($scope.names).not.toEqual(jasmine.objectContaining(basicSolve));
            expect($scope.names).toEqual(jasmine.objectContaining(basicBuild));
            expect($scope.crossword).toBe('new');
            $scope.$apply("mode ='solve'");
            expect($scope.names).toEqual(jasmine.objectContaining(basicSolve));
            expect($scope.names).not.toEqual(jasmine.objectContaining(basicBuild));
            expect($scope.crossword).toBe('no');
        });

        it("preserves existing crossword on mode change", function() {
            $rootScope.$broadcast('publicList', {
                projects: list
            });
            $scope.$apply();
            $scope.crossword = list[0].crosswords[1];
            $scope.$apply("mode ='build'");
            expect($scope.crossword).toBe('crossword2');
            $scope.$apply("mode ='solve'");
            expect($scope.crossword).toBe('crossword2');
        });

        it("sets timerValue to defaults", function() {
            $scope.$apply("timer ='none'");
            expect($scope.timerValue).toBe(null);
            $scope.$apply("timer ='forward'");
            expect($scope.timerValue).toBe(0);
            $scope.$apply("timer ='backward'");
            expect($scope.timerValue).toBe(60);
            $scope.timerValue = 45;
            $scope.$apply("timer ='forward'");
            expect($scope.timerValue).toBe(0);
        });

        it("inserts shortcode in build mode", function() {
            var code = {
                tag: 'crosswordsearch',
                type: 'single',
                attrs: {
                    mode: 'build',
                    project: 'project1'
                }
            };
            $scope.mode = 'build';
            $scope.timer = 'forward';
            $scope.restricted = false;
            $rootScope.$broadcast('publicList', {
                projects: list
            });
            $scope.$apply();
            $scope.crossword = 'dft';
            $scope.insert();
            expect(wp.shortcode.string).toHaveBeenCalledWith(code);
            $scope.crossword = 'new';
            code.attrs.name = '';
            $scope.insert();
            expect(wp.shortcode.string).toHaveBeenCalledWith(code);
            $scope.crossword = 'crossword2';
            code.attrs.name = 'crossword2';
            $scope.insert();
            expect(wp.shortcode.string).toHaveBeenCalledWith(code);
            $scope.restricted = true;
            code.attrs.restricted = 1;
            $scope.insert();
            expect(wp.shortcode.string).toHaveBeenCalledWith(code);
        });

        it("inserts shortcode in solve mode", function() {
            var code = {
                tag: 'crosswordsearch',
                type: 'single',
                attrs: {
                    mode: 'solve',
                    project: 'project1'
                }
            };
            $scope.restricted = true;
            $scope.submitting = true;
            $rootScope.$broadcast('publicList', {
                projects: list
            });
            $scope.$apply();
            $scope.insert();
            expect(wp.shortcode.string).toHaveBeenCalledWith(code);
            $scope.crossword = 'crossword2';
            code.attrs.name = 'crossword2';
            $scope.insert();
            expect(wp.shortcode.string).toHaveBeenCalledWith(code);
            $scope.submitting = false;
            $scope.timer = 'forward';
            $scope.timerValue = 0;
            code.attrs.timer = 0;
            $scope.insert();
            expect(wp.shortcode.string).toHaveBeenCalledWith(code);
            $scope.timer = 'backward';
            $scope.timerValue = 45;
            code.attrs.timer = 45;
            $scope.insert();
            expect(wp.shortcode.string).toHaveBeenCalledWith(code);
            $scope.submitting = true;
            code.attrs.submitting = 1;
            $scope.insert();
            expect(wp.shortcode.string).toHaveBeenCalledWith(code);
        });

        it("calls externals on insert", function() {
            $scope.project = {};
            $scope.insert();
            expect(send_to_editor).toHaveBeenCalled();
            expect(wp.shortcode.string).toHaveBeenCalled();
            expect(tb_remove).toHaveBeenCalled();
        });

        it("calls tb_remove on cancel", function() {
            $scope.cancel();
            expect(tb_remove).toHaveBeenCalled();
        });
    });
});

