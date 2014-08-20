describe("AdminController", function () {
    beforeEach(module('crwApp'));

    it("initializes wrapper controller", inject(function($rootScope, $controller) {
        var $scope = $rootScope.$new();
        var qStore = {
            addStore: jasmine.createSpy("addStore")
        };
        var crosswordFactory = {
            getCrw: jasmine.createSpy("getCrw")
        };
        var $routeParams = {};
        var $location = {path: jasmine.createSpy("path")};
        $controller('AdminController', {
            $scope: $scope,
            $routeParams: $routeParams,
            $location: $location,
            qStore: qStore,
            crosswordFactory: crosswordFactory
        });
        expect(crosswordFactory.getCrw).toHaveBeenCalled();
        expect(qStore.addStore).toHaveBeenCalled();
        expect($scope.$routeParams).toBe($routeParams);
        $scope.setActive('hash');
        expect($location.path).toHaveBeenCalledWith('hash');
    }));
});

describe("OptionsController", function () {
    var $scope, ajaxFactory, deferred, capabilities;

    beforeEach(module('crwApp'));
    beforeEach(inject(function ($rootScope, $controller, $q) {
        ajaxFactory = {
            http: function (data) {
                deferred = $q.defer();
                return deferred.promise;
            },
            setNonce: jasmine.createSpy()
        }
        spyOn(ajaxFactory, 'http').and.callThrough();
        $scope = $rootScope.$new();
        $controller('OptionsController', {
            $scope: $scope,
            ajaxFactory: ajaxFactory
        });
        capabilities = $scope.capabilities = {data:"data"};
        $scope.capsEdit = {$setPristine: jasmine.createSpy()};
    }));

    it("loads initial data", function () {
        $scope.prepare('nonce');
        expect(ajaxFactory.setNonce).toHaveBeenCalledWith('nonce', 'options');
        expect(ajaxFactory.http.calls.argsFor(0)[0]).toEqual({
            action: 'get_crw_capabilities'
        });
        expect(ajaxFactory.http.calls.argsFor(0)[1]).toBe('options');
        deferred.resolve({capabilities: 'cap'});
        $scope.$apply();
        expect($scope.capabilities).toBe('cap');
        expect($scope.capError).toBeUndefined();
    });

    it("reacts on initial data load failure", function () {
        $scope.prepare('nonce');
        deferred.reject('error');
        $scope.$apply();
        expect($scope.capabilities).toBe(capabilities);
        expect($scope.capError).toBe('error');
    });

    it("calls for capabilities update", function () {
        $scope.updateCaps();
        expect(ajaxFactory.http.calls.argsFor(0)[0]).toEqual({
            action: 'update_crw_capabilities',
            capabilities: JSON.stringify(capabilities)
        });
        expect(ajaxFactory.http.calls.argsFor(0)[1]).toBe('options');
        deferred.resolve({capabilities: 'cap'});
        $scope.$apply();
        expect($scope.capError).toBeNull();
        expect($scope.capsEdit.$setPristine).toHaveBeenCalled();
        expect($scope.capabilities).toBe('cap');
    });

    it("reacts on capabilities update failure", function () {
        $scope.updateCaps();
        deferred.reject('error');
        $scope.$apply();
        expect($scope.capError).toBe('error');
        expect($scope.capabilities).toBe(capabilities);
    });
});

describe("EditorController", function () {
    var $scope, ajaxFactory, deferred, admin;

    beforeEach(module('crwApp'));
    beforeEach(inject(function ($rootScope, $filter, $controller, $compile, $q) {
        ajaxFactory = {
            http: function (data) {
                deferred = $q.defer();
                return deferred.promise;
            },
            setNonce: jasmine.createSpy()
        }
        spyOn(ajaxFactory, 'http').and.callThrough();
        $scope = $rootScope.$new();
        $controller('EditorController', {
            $scope: $scope,
            $filter: $filter,
            ajaxFactory: ajaxFactory
        });
        admin = $scope.admin = angular.copy({
            projects: [
                {name: 'project1', default_level: 1, maximum_level: 2, used_level: 0, editors: [1,2]},
                {name: 'project2', default_level: 2, maximum_level: 3, used_level: 3, editors: [2,3]},
                {name: '_project3', default_level: 2, maximum_level: 3, used_level: 3, editors: [1,3]}
            ],
            all_users: [
                {user_id: 1, user_name: 'one'},
                {user_id: 2, user_name: 'two'},
                {user_id: 3, user_name: 'three'}
            ]
        });
        $compile('<form name="projectMod">' +
            '<input type="text" name="name" ng-model="currentProject.name"></input>' + 
            '<input type="text" name="defaultL" ng-model="currentProject.default_level"></input>' +
            '<input type="text" name="maximumL" ng-model="currentProject.maximum_level"></input>' +
            '<input type="text" name="extra" ng-model="extra"></input>' +
            '</form>')($scope);
        spyOn($scope.projectMod, '$setPristine').and.callThrough();
    }));

    it("sets up properties", function () {
        expect($scope.currentEditors).toEqual([]);
        expect($scope.filtered_users).toEqual([]);
    });

    it("returns applicable level ranges", function () {
        $scope.currentProject = $scope.admin.projects[0];
        expect($scope.levelList('default')).toEqual([0,1,2]);
        expect($scope.levelList('maximum')).toEqual([1,2,3]);
        $scope.currentProject.used_level = 2;
        expect($scope.levelList('maximum')).toEqual([2,3]);
    });

    it("extract the list of project names", function () {
        expect($scope.getProjectList('project2')).toEqual(['project1', '_project3']);
    });

    it("loads initial data", function () {
        $scope.admin = null;
        $scope.prepare('nonce');
        expect(ajaxFactory.setNonce).toHaveBeenCalledWith('nonce', 'admin');
        expect(ajaxFactory.http.calls.argsFor(0)[0]).toEqual({
            action: 'get_admin_data'
        });
        expect(ajaxFactory.http.calls.argsFor(0)[1]).toBe('admin');
        deferred.resolve(admin);
        $scope.$apply();
        expect($scope.admin).toBe(admin);
        for(var i in admin.projects) {
            expect(admin.projects[i].pristine).toBe(true);
        }
        expect($scope.currentProject).toEqual(admin.projects[2]);
        expect($scope.currentEditors).toEqual(admin.projects[2].editors);
        expect($scope.filtered_users).toEqual([admin.all_users[1]]);
        expect($scope.selectedEditor).toBe(1);
        expect($scope.selectedUser).toBe(admin.all_users[1]);
        expect($scope.loadError).toBeNull();
        expect($scope.editorsPristine).toBe(true);
    });

    it("prunes out form fields", function () {
        $scope.projectMod.extra.$setViewValue('extra');
        $scope.$apply();
        expect($scope.projectMod.$setPristine).toHaveBeenCalled();
        expect($scope.projectMod.$pristine).toBe(true);
        $scope.projectMod.defaultL.$setViewValue('defaultL');
        $scope.$apply();
        expect($scope.projectMod.$pristine).toBe(false);
    });

    it("discards selected project for new", function () {
        $scope.prepare('nonce');
        deferred.resolve(admin);
        $scope.addProject();
        expect($scope.selectedProject).toBeNull();
    });

    it("creates new empty objects", function () {
        $scope.editorsPristine = false;
        $scope.editorsSaveError = 'error';
        $scope.projectSaveError = 'error';
        $scope.projectMod.defaultL.$setViewValue('defaultL');
        $scope.$apply();
        $scope.addProject();
        $scope.$apply();
        expect($scope.currentProject).toEqual({
            name: "",
            default_level: 1,
            maximum_level: 3,
            used_level: 0,
            editors: []
        });
        expect($scope.currentEditors).toEqual([]);
        expect($scope.editorsPristine).toBe(true);
        expect($scope.projectMod.$pristine).toBe(true);
        expect($scope.editorsSaveError).toBeNull();
        expect($scope.projectSaveError).toBeNull();
    });

    it("resets project object", function () {
        $scope.prepare('nonce');
        deferred.resolve(admin);
        $scope.abortProject();
        $scope.$apply();
        expect($scope.currentProject).toEqual(admin.projects[2]);
        expect($scope.currentEditors).toEqual(admin.projects[2].editors);
        $scope.selectedProject = admin.projects[1];
        $scope.currentProject.default_level = 0;
        $scope.projectMod.defaultL.$setViewValue(0);
        $scope.currentProject.editors.push(1);
        $scope.projectSaveError = 'error';
        $scope.abortProject();
        $scope.$apply();
        expect($scope.currentProject).toEqual(admin.projects[1]);
        expect($scope.currentEditors).toEqual(admin.projects[1].editors);
        expect($scope.currentProject.default_level).toBe(2);
        expect($scope.currentProject.editors).toEqual([2,3]);
        expect($scope.projectMod.$pristine).toBe(true);
        expect($scope.projectSaveError).toBeNull();
    });

    it("adds a new project to the server", function () {
        $scope.currentProject = admin.projects[0];
        $scope.saveProject();
        expect(ajaxFactory.http.calls.argsFor(0)[0]).toEqual({
            action: 'save_project',
            method: 'add',
            project: undefined,
            new_name: 'project1',
            default_level: 1,
            maximum_level: 2
        });
        expect(ajaxFactory.http.calls.argsFor(0)[1]).toBe('admin');
        deferred.resolve(admin);
        $scope.$apply();
        expect($scope.currentProject).toEqual(admin.projects[0]);
    });

    it("updates a project on the server", function () {
        $scope.prepare('nonce');
        deferred.resolve(admin);
        $scope.$apply();
        $scope.currentProject.name = 'project4';
        $scope.saveProject();
        expect(ajaxFactory.http.calls.argsFor(1)[0]).toEqual({
            action: 'save_project',
            method: 'update',
            project: '_project3',
            new_name: 'project4',
            default_level: 2,
            maximum_level: 3
        });
        expect(ajaxFactory.http.calls.argsFor(1)[1]).toBe('admin');
        deferred.reject('error');
        $scope.$apply();
        expect($scope.selectedProject.name).toBe('_project3');
        expect($scope.projectSaveError).toBe('error');
    });

    it("remove a project from the server", inject(function ($q) {
        $scope.immediateStore = {
            newPromise: function () {
                deferred = $q.defer();
                return deferred.promise;
            }
        }
        spyOn($scope.immediateStore, 'newPromise').and.callThrough();
        $scope.prepare('nonce');
        deferred.resolve(admin);
        $scope.$apply();
        $scope.selectedProject = admin.projects[0];
        $scope.$apply();
        $scope.deleteProject();
        expect($scope.immediateStore.newPromise.calls.argsFor(0)[0]).toBe('actionConfirmation');
        expect($scope.immediateStore.newPromise.calls.argsFor(0)[1]).toEqual({
            which: 'remove_project',
            project: 'project1'
        });
        deferred.reject();
        $scope.$apply();
        expect(ajaxFactory.http.calls.count()).toBe(1);
        $scope.deleteProject();
        deferred.resolve();
        $scope.$apply();
        expect(ajaxFactory.http.calls.argsFor(1)[0]).toEqual({
            action: 'save_project',
            method: 'remove',
            project: 'project1',
        });
        expect(ajaxFactory.http.calls.argsFor(1)[1]).toBe('admin');
        deferred.resolve(admin);
        $scope.$apply();
        expect($scope.currentProject).toEqual(admin.projects[2]);
    }));

    it("adjusts user lists", function () {
        $scope.prepare('nonce');
        deferred.resolve(admin);
        $scope.$apply();
        expect($scope.filtered_users).toEqual([admin.all_users[1]]);
        $scope.currentEditors.pop();
        $scope.$apply();
        expect($scope.filtered_users).toEqual([admin.all_users[1],admin.all_users[2]]);
    });

    it("fetches a user name by id", function () {
        expect($scope.getUserName(2)).toBe('two');
        expect($scope.getUserName(3)).toBe('three');
    });

    it("adds all users", function () {
        $scope.prepare('nonce');
        deferred.resolve(admin);
        $scope.$apply();
        $scope.currentEditors.pop();
        $scope.$apply();
        $scope.addAll();
        $scope.$apply();
        expect($scope.currentEditors).toContain(1);
        expect($scope.currentEditors).toContain(2);
        expect($scope.currentEditors).toContain(3);
        expect($scope.filtered_users).toEqual([]);
        expect($scope.editorsPristine).toBe(false);
    });

    it("removes all users", function () {
        $scope.prepare('nonce');
        deferred.resolve(admin);
        $scope.$apply();
        $scope.removeAll();
        $scope.$apply();
        expect($scope.currentEditors).toEqual([]);
        expect($scope.filtered_users).toEqual(admin.all_users);
        expect($scope.editorsPristine).toBe(false);
    });

    it("adds one user", function () {
        $scope.prepare('nonce');
        deferred.resolve(admin);
        $scope.$apply();
        $scope.selectedUser = admin.all_users[1];
        $scope.addOne();
        $scope.$digest();
        expect($scope.currentEditors).toContain(1);
        expect($scope.currentEditors).toContain(2);
        expect($scope.currentEditors).toContain(3);
        expect($scope.filtered_users).toEqual([]);
        expect($scope.selectedEditor).toBe(2);
        expect($scope.editorsPristine).toBe(false);
    });

    it("removes one user", function () {
        $scope.prepare('nonce');
        deferred.resolve(admin);
        $scope.$apply();
        $scope.selectedEditor = 3;
        $scope.removeOne();
        $scope.$apply();
        expect($scope.currentEditors[0]).toBe(1);
        expect($scope.currentEditors.length).toBe(1);
        expect($scope.filtered_users).toEqual([admin.all_users[1],admin.all_users[2]]);
        expect($scope.selectedEditor).toBe(1);
        expect($scope.selectedUser).toBe(admin.all_users[2]);
        expect($scope.editorsPristine).toBe(false);
    });

    it("resets editors", function () {
        $scope.prepare('nonce');
        deferred.resolve(admin);
        $scope.$apply();
        $scope.selectedEditor = 3;
        $scope.removeOne();
        $scope.$apply();
        $scope.abortEditors();
        expect($scope.currentEditors).toEqual($scope.selectedProject.editors);
        expect($scope.editorsPristine).toBe(true);
    });

    it("updates editors list on the server", function () {
        $scope.prepare('nonce');
        deferred.resolve(admin);
        $scope.$apply();
        $scope.saveEditors();
        expect(ajaxFactory.http.calls.argsFor(1)[0]).toEqual({
            action: 'update_editors',
            project: '_project3',
            editors: angular.toJson(admin.projects[2].editors)
        });
        expect(ajaxFactory.http.calls.argsFor(1)[1]).toBe('admin');
        deferred.reject('error');
        $scope.$apply();
        expect($scope.editorsSaveError).toBe('error');
    });
});

describe("ReviewController", function () {
    var $scope, $child, ajaxFactory, deferred, projects;

    beforeEach(module('crwApp'));
    beforeEach(inject(function ($rootScope, $controller, $filter, $q) {
        ajaxFactory = {
            http: function (data) {
                deferred = $q.defer();
                return deferred.promise;
            },
            setNonce: jasmine.createSpy()
        }
        spyOn(ajaxFactory, 'http').and.callThrough();
        $scope = $rootScope.$new();
        $controller('ReviewController', {
            $scope: $scope,
            $filter: $filter,
            ajaxFactory: ajaxFactory
        });
        $child = $scope.$new();
        $scope.immediateStore = {
            newPromise: function () {
                deferred = $q.defer();
                return deferred.promise;
            }
        }
        spyOn($scope.immediateStore, 'newPromise').and.callThrough();
        projects = angular.copy([
            {
                name: 'project1',
                confirmed: ['riddle1', 'riddle2', 'riddle3'],
                pending: ['riddle4']
            },
            {
                name: 'project02',
                confirmed: ['riddle5','riddle6'],
                pending: []
            }
        ]);
    }));

    it("sets up properties", function () {
        expect($scope.selectedCrossword).toEqual({ confirmed: null, pending: null });
        expect($scope.activeGroup).toBe('confirmed');
    });

    it("loads initial data", function () {
        $scope.prepare('nonceCrossword', 'nonceReview');
        expect(ajaxFactory.setNonce).toHaveBeenCalledWith('nonceCrossword', 'crossword');
        expect(ajaxFactory.setNonce).toHaveBeenCalledWith('nonceReview', 'review');
        expect(ajaxFactory.http.calls.argsFor(0)[0]).toEqual({
            action: 'list_projects_and_riddles'
        });
        expect(ajaxFactory.http.calls.argsFor(0)[1]).toBe('review');
        deferred.resolve({projects: projects});
        $scope.$apply();
        expect($scope.projects).toBe(projects);
        expect($scope.selectedProject).toEqual(projects[1]);
        expect($scope.reviewError).toBeNull();
    });

    it("deletes a crossword from pending group", function () {
        $scope.projects = projects;
        $scope.selectedProject = projects[0];
        $scope.selectedCrossword.pending = projects[0].pending[0];
        $scope.deleteCrossword('pending');
        expect($scope.immediateStore.newPromise.calls.argsFor(0)[0]).toBe('actionConfirmation');
        expect($scope.immediateStore.newPromise.calls.argsFor(0)[1]).toEqual({
            which: 'delete_crossword',
            crossword: 'riddle4',
            project: 'project1'
        });
        deferred.reject();
        $scope.$apply();
        expect(ajaxFactory.http).not.toHaveBeenCalled();
        $scope.deleteCrossword('pending');
        deferred.resolve();
        $scope.$apply();
        expect(ajaxFactory.http.calls.argsFor(0)[0]).toEqual({
            action: 'delete_crossword',
            project: 'project1',
            name: 'riddle4'
        });
        expect(ajaxFactory.http.calls.argsFor(0)[1]).toBe('review');
        deferred.resolve({projects: projects});
        $scope.$apply();
        expect($scope.selectedProject).toEqual(projects[0]);
    });

    it("deletes a crossword from confirmed group", function () {
        $scope.projects = projects;
        $scope.selectedProject = projects[0];
        $scope.selectedCrossword.confirmed = projects[0].confirmed[1];
        $scope.deleteCrossword('confirmed');
        expect($scope.immediateStore.newPromise.calls.argsFor(0)[0]).toBe('actionConfirmation');
        expect($scope.immediateStore.newPromise.calls.argsFor(0)[1]).toEqual({
            which: 'delete_crossword',
            crossword: 'riddle2',
            project: 'project1'
        });
        deferred.resolve();
        $scope.$apply();
        expect(ajaxFactory.http.calls.argsFor(0)[0]).toEqual({
            action: 'delete_crossword',
            project: 'project1',
            name: 'riddle2'
        });
        expect(ajaxFactory.http.calls.argsFor(0)[1]).toBe('review');
        deferred.reject('error');
        $scope.$apply();
        expect($scope.reviewError).toBe('error');
    });

    it("moves a crossword from pending to confirmed group", function () {
        $scope.projects = angular.copy(projects);
        $scope.selectedProject = $scope.projects[0];
        $scope.selectedProject.pending.push($scope.selectedProject.confirmed.splice(0, 1)[0]);
        $scope.selectedCrossword.confirmed = $scope.projects[0].confirmed[1];
        $scope.selectedCrossword.pending = $scope.projects[0].pending[1];
        $scope.confirm();
        expect($scope.immediateStore.newPromise.calls.argsFor(0)[0]).toBe('actionConfirmation');
        expect($scope.immediateStore.newPromise.calls.argsFor(0)[1]).toEqual({
            which: 'approve_crossword',
            crossword: 'riddle1',
            project: 'project1'
        });
        deferred.reject();
        $scope.$apply();
        expect(ajaxFactory.http).not.toHaveBeenCalled();
        $scope.confirm();
        deferred.resolve();
        $scope.$apply();
        expect(ajaxFactory.http.calls.argsFor(0)[0]).toEqual({
            action: 'approve_crossword',
            project: 'project1',
            name: 'riddle1'
        });
        expect(ajaxFactory.http.calls.argsFor(0)[1]).toBe('review');
        deferred.resolve({projects: projects});
        $scope.$apply();
        expect($scope.selectedProject).toEqual(projects[0]);
        expect($scope.selectedCrossword.confirmed).toBe('riddle1');
        expect($scope.selectedCrossword.pending).toBe('riddle4');
    });

    it("adjusts previewCrossword on group change", function () {
        $scope.projects = projects;
        $scope.selectedProject = projects[0];
        $scope.selectedCrossword.confirmed = projects[0].confirmed[1];
        $scope.selectedCrossword.pending = projects[0].pending[0];
        $scope.activateGroup('pending');
        expect($scope.activeGroup).toBe('pending');
        expect($scope.previewCrossword).toEqual(projects[0].pending[0]);
        $scope.activateGroup('confirmed');
        expect($scope.activeGroup).toBe('confirmed');
        expect($scope.previewCrossword).toEqual(projects[0].confirmed[1]);
    });

    it("crossword selection follows project selection", function () {
        $scope.projects = projects;
        $scope.selectedProject = projects[0];
        $scope.preview = true;
        $scope.$apply();
        expect($scope.selectedCrossword.confirmed).toEqual(projects[0].confirmed[0]);
        expect($scope.selectedCrossword.pending).toEqual(projects[0].pending[0]);
        $scope.selectedProject = projects[1];
        $scope.$apply();
        expect($scope.selectedCrossword.confirmed).toEqual(projects[1].confirmed[0]);
        expect($scope.selectedCrossword.pending).toBeUndefined();
    });

    it("adjusts previewCrossword on groupwise selection change", function () {
        $scope.activeGroup = 'pending';
        $scope.selectedCrossword.confirmed = 'riddle1';
        $scope.$apply();
        expect($scope.previewCrossword).toBeNull();
        $scope.selectedCrossword.pending = 'riddle2';
        $scope.$apply();
        expect($scope.previewCrossword).toBe('riddle2');
    });

    it("alerts once on preview activation and project/crossword change", function () {
        var projectListener = jasmine.createSpy('projectListener');
        var crosswordListener = jasmine.createSpy('crosswordListener');
        $child.$on('previewProject', projectListener);
        $child.$on('previewCrossword', crosswordListener);
        $scope.projects = projects;
        $scope.activeGroup = 'confirmed';
        $scope.selectedProject = projects[1];
        $scope.selectedCrossword.confirmed = projects[1].confirmed[1];
        $scope.preview = false;
        $scope.$apply(); // no preview, no event
        expect(projectListener).not.toHaveBeenCalled();
        expect(crosswordListener).not.toHaveBeenCalled();
        $scope.preview = true;
        $scope.$apply(); // activation, both events from 'preview' watch
        expect(projectListener.calls.count()).toBe(1);
        expect(crosswordListener.calls.count()).toBe(1);
        expect(projectListener.calls.argsFor(0)[1]).toBe(projects[1].name);
        expect($scope.previewCrossword).toBe(projects[1].confirmed[1]);
        expect(crosswordListener.calls.argsFor(0)[1]).toBe(projects[1].confirmed[1]);
        $scope.selectedProject = projects[0];
        $scope.$apply(); // project change, project event from 'selectedProject' watch
                         // and crossword event from 'previewCrossword' watch
        expect(projectListener.calls.count()).toBe(2);
        expect(crosswordListener.calls.count()).toBe(2);
        expect(projectListener.calls.argsFor(1)[1]).toBe(projects[0].name);
        expect(crosswordListener.calls.argsFor(1)[1]).toBe(projects[0].confirmed[0]);
        $scope.previewCrossword = projects[0].confirmed[1];
        $scope.$apply(); // crossword change, crossword event from 'previewCrossword' watch
        expect(crosswordListener.calls.count()).toBe(3);
        expect(crosswordListener.calls.argsFor(2)[1]).toBe(projects[0].confirmed[1]);
    });
});
