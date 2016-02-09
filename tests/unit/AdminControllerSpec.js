describe("crwHelpFollow", function() {
    beforeEach(module('crwApp'));

    it("sets active class", inject(function($rootScope, $compile) {
        jQuery('body').append('<div id="contextual-help-columns"><div class="contextual-help-tabs">' +
            '<ul>' +
            '<li id="tab-link-crw-help-tab-options">' +
            '<li id="tab-link-crw-help-tab-projects">' +
            '<li id="tab-link-crw-help-tab-review">' +
            '</ul>' +
            '</div>' +
            '<div class="contextual-help-tabs-wrap">' +
            '<div id="tab-panel-crw-help-tab-options" class="help-tab-content"></div>' +
            '<div id="tab-panel-crw-help-tab-projects" class="help-tab-content"></div>' +
            '<div id="tab-panel-crw-help-tab-review" class="help-tab-content"></div>' +
            '</div></div>');
        var element = jQuery('#contextual-help-columns');
        var $scope = $rootScope.$new();
        $compile('<div crw-help-follow></div>')($scope);
        var tabs = {
            capabilities: 'options',
            editor: 'projects',
            review: 'review'
        };
        for (var t1 in tabs) {
            $scope.activeTab = t1;
            $scope.$apply();
            for (var t2 in tabs) {
                expect(element.find('#tab-link-crw-help-tab-' + tabs[t2]).hasClass('active')).toBe(t1 === t2);
                expect(element.find('#tab-panel-crw-help-tab-' + tabs[t2]).hasClass('active')).toBe(t1 === t2);
            }
        }
        element.remove();
    }));
});
describe("crwBindTrusted", function() {
    beforeEach(module('crwApp'));

    it("bypasses escape service", inject(function($rootScope, $compile) {
        var $scope = $rootScope.$new();
        var element = $compile('<div crw-bind-trusted="value"></div>')($scope);
        $scope.value = "string";
        $scope.$apply();
        expect(element.html()).toBe("string");
        $scope.value = "&ndash;";
        $scope.$apply();
        expect(element.html()).toBe("–");
        $scope.value = "&#248;";
        $scope.$apply();
        expect(element.html()).toBe("ø");
    }));
});

describe("AdminController", function () {
    var $scope, $location, qStore, ajaxFactory, crosswordFactory;

    beforeEach(module('crwApp'));
    beforeEach(inject(function($rootScope, $controller, _$location_) {
        $scope = $rootScope.$new();
        $location = _$location_;
        qStore = {
            addStore: jasmine.createSpy("addStore")
        };
        ajaxFactory = {
            setNonce: jasmine.createSpy("setNonce")
        };
        crosswordFactory = {
            getCrw: jasmine.createSpy("getCrw")
        };
        $controller('AdminController', {
            $scope: $scope,
            $location: $location,
            qStore: qStore,
            ajaxFactory: ajaxFactory,
            crosswordFactory: crosswordFactory
        });
    }));

    it("initializes wrapper controller", function() {
        expect(crosswordFactory.getCrw).toHaveBeenCalled();
        expect(qStore.addStore).toHaveBeenCalled();
    });

    it("inspects location on initial load", function() {
        $scope.prepare('/hash', 'nonce');
        $scope.$apply();
        expect(ajaxFactory.setNonce).toHaveBeenCalledWith('nonce', 'settings');
        expect($location.path()).toBe('/hash');
        expect($scope.activeTab).toBe('/hash');
        delete $scope.activeTab;
        $location.path('/editor');
        $scope.prepare('/hash', 'nonce');
        $scope.$apply();
        expect($scope.activeTab).toBe('/editor');
        delete $scope.activeTab;
        $scope.setActive('hash2');
        $scope.$apply();
        expect($scope.activeTab).toBe('/hash2');
        expect($location.path()).toBe('/hash2');
    });

    it("handles errors", function() {
        spyOn($location, "path");
        $scope.setError({error: 'error'});
        expect($scope.globalError).toEqual({error: 'error'});
        $scope.setError(null);
        expect($scope.globalError).toBe(null);
        $scope.setError({heartbeat: true});
        expect($location.path).toHaveBeenCalledWith('');
    });
});

describe("crwDimension", function() {
    var $scope, $compile, element, model;

    beforeEach(module('crwApp'));
    beforeEach(inject(function($rootScope, _$compile_) {
        $compile = _$compile_;
        $scope = $rootScope.$new();
        $scope.value = 1;
        element = $compile('<form name="frm"><input name="dim" type="text" ng-model="value" ' +
            'crw-dimension></input></form>')($scope);
        model = element.find('input').controller('ngModel');
    }));

    it("accepts only integers of 0 and above", function() {
        model.$setViewValue('0');
        expect($scope.frm.dim.$error.dimension).toBe(false);
        expect($scope.value).toBe(0);
        model.$setViewValue('1.3');
        expect($scope.frm.dim.$error.dimension).toBe(true);
        expect($scope.value).toBeUndefined();
        model.$setViewValue('1');
        expect($scope.frm.dim.$error.dimension).toBe(false);
        expect($scope.value).toBe(1);
        model.$setViewValue('-2');
        expect($scope.frm.dim.$error.dimension).toBe(true);
        expect($scope.value).toBeUndefined();
        model.$setViewValue('563');
        expect($scope.frm.dim.$error.dimension).toBe(false);
        expect($scope.value).toBe(563);
        model.$setViewValue('abc');
        expect($scope.frm.dim.$error.dimension).toBe(true);
        expect($scope.value).toBeUndefined();
    });
});

describe("OptionsController", function () {
    var $scope, ajaxFactory, deferred, options = {};

    beforeEach(module('crwApp'));
    beforeEach(inject(function ($rootScope, $controller, $q) {
        ajaxFactory = {
            http: function (data) {
                deferred = $q.defer();
                return deferred.promise;
            },
            setNonce: jasmine.createSpy()
        };
        spyOn(ajaxFactory, 'http').and.callThrough();
        $scope = $rootScope.$new();
        $controller('OptionsController', {
            $scope: $scope,
            ajaxFactory: ajaxFactory
        });
        options.capabilities = $scope.capabilities = {data:"data1"};
        options.dimensions = $scope.dimensions = {data:"data2"};
        options.subscribers = $scope.subscribers = {data:"data2"};
        $scope.capsEdit = {$setPristine: jasmine.createSpy()};
        $scope.dimEdit = {$setPristine: jasmine.createSpy()};
        $scope.submissions = {$setPristine: jasmine.createSpy()};
        $scope.setError = jasmine.createSpy("setError");
    }));

    it("loads initial data", function () {
        $scope.prepare('nonce');
        expect(ajaxFactory.setNonce).toHaveBeenCalledWith('nonce', 'options');
        expect(ajaxFactory.http.calls.argsFor(0)[0]).toEqual({
            action: 'get_crw_capabilities'
        });
        expect(ajaxFactory.http.calls.argsFor(0)[1]).toBe('options');
        deferred.resolve({capabilities: 'cap', dimensions: 'dim', subscribers: 'subs'});
        $scope.$apply();
        expect($scope.capabilities).toBe('cap');
        expect($scope.dimensions).toBe('dim');
        expect($scope.subscribers).toBe('subs');
        expect($scope.setError).toHaveBeenCalledWith(false);
    });

    it("reacts on initial data load failure", function () {
        $scope.prepare('nonce');
        deferred.reject('error');
        $scope.$apply();
        expect($scope.capabilities).toBe(options.capabilities);
        expect($scope.dimensions).toBe(options.dimensions);
        expect($scope.subscribers).toBe(options.subscribers);
        expect($scope.setError).toHaveBeenCalledWith('error');
    });

    ['capabilities', 'dimensions', 'subscribers'].forEach(function(option) {
        it("calls for " + option + " update", function () {
            $scope.update(option);
            var call = {
                action: 'update_crw_' + option
            };
            call[option] =  JSON.stringify(options[option]);
            expect(ajaxFactory.http.calls.argsFor(0)[0]).toEqual(call);
            expect(ajaxFactory.http.calls.argsFor(0)[1]).toBe('options');
            var resp = {capabilities: 'cap', dimensions: 'dim', subscribers: 'subs'};
            deferred.resolve(resp);
            $scope.$apply();
            expect($scope.setError).toHaveBeenCalledWith(false);
            expect($scope.capsEdit.$setPristine).toHaveBeenCalled();
            expect($scope.dimEdit.$setPristine).toHaveBeenCalled();
            expect($scope.submissions.$setPristine).toHaveBeenCalled();
            expect($scope[option]).toBe(resp[option]);
        });

        it("reacts on " + option + " update failure", function () {
            $scope.update(option);
            deferred.reject('error');
            $scope.$apply();
            expect($scope.setError).toHaveBeenCalledWith('error');
            expect($scope[option]).toBe(options[option]);
        });
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
        };
        spyOn(ajaxFactory, 'http').and.callThrough();
        $scope = $rootScope.$new();
        $scope.setError = jasmine.createSpy("setError");
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
        expect(ajaxFactory.setNonce).toHaveBeenCalledWith('nonce', 'editors');
        expect(ajaxFactory.http.calls.argsFor(0)[0]).toEqual({
            action: 'get_admin_data'
        });
        expect(ajaxFactory.http.calls.argsFor(0)[1]).toBe('editors');
        deferred.resolve(admin);
        $scope.$apply();
        expect($scope.admin).toBe(admin);
        for (var i = 0;i < admin.projects.length; i++) {
            expect(admin.projects[i].pristine).toBe(true);
        }
        expect($scope.currentProject).toEqual(admin.projects[2]);
        expect($scope.currentEditors).toEqual(admin.projects[2].editors);
        expect($scope.filtered_users).toEqual([admin.all_users[1]]);
        expect($scope.selectedEditor).toBe(1);
        expect($scope.selectedUser).toBe(admin.all_users[1]);
        expect($scope.setError).toHaveBeenCalledWith(false);
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
        expect($scope.setError).toHaveBeenCalledWith(false);
        expect($scope.setError).toHaveBeenCalledWith(false);
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
        expect($scope.setError).toHaveBeenCalledWith(false);
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
        expect(ajaxFactory.http.calls.argsFor(0)[1]).toBe('editors');
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
        expect(ajaxFactory.http.calls.argsFor(1)[1]).toBe('editors');
        deferred.reject('error');
        $scope.$apply();
        expect($scope.selectedProject.name).toBe('_project3');
        expect($scope.setError).toHaveBeenCalledWith('error');
    });

    it("remove a project from the server", inject(function ($q) {
        $scope.immediateStore = {
            newPromise: function () {
                deferred = $q.defer();
                return deferred.promise;
            }
        };
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
            project: 'project1'
        });
        expect(ajaxFactory.http.calls.argsFor(1)[1]).toBe('editors');
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
        expect(ajaxFactory.http.calls.argsFor(1)[1]).toBe('editors');
        deferred.reject('error');
        $scope.$apply();
        expect($scope.setError).toHaveBeenCalledWith('error');
    });
});

describe("crwOptionClick", function() {
    beforeEach(module('crwApp'));

    it("catches option selection", inject(function($rootScope, $compile) {
        var $scope = $rootScope.$new();
        $scope.activateGroup = jasmine.createSpy('activateGroup');
        var element = $compile('<select crw-option-click="this">' +
            '<option value="1">1</option>' +
            '<option value="2">2</option>' +
            '</select>')($scope);
        element.find('option[value=1]').trigger('click');
        expect($scope.activateGroup).toHaveBeenCalledWith('this');
    }));
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
        };
        spyOn(ajaxFactory, 'http').and.callThrough();
        $scope = $rootScope.$new();
        $scope.setError = jasmine.createSpy("setError");
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
        };
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
        expect($scope.setError).toHaveBeenCalledWith(false);
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
        expect($scope.setError).toHaveBeenCalledWith('error');
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

describe("Adminstrative tab navigation", function () {
    var $httpBackend, $scope, element;

    beforeEach(module('crwApp'));
    beforeEach(inject(function($injector, $rootScope, $location, $compile) {
        $httpBackend = $injector.get('$httpBackend');
        $httpBackend.whenGET(/get_option_tab/).respond(201, '');
        $scope = $rootScope.$new();
        $scope.location = $location;
        element = $compile('<div ng-view></div>')($scope);
    }));

    it("requests tab templates", inject(function ($route, nonces) {
        var basepath = crwBasics.ajaxUrl + '?action=get_option_tab';
        var routePaths = {
            '/editor': '&tab=editor&_crwnonce=nonce',
            '/review': '&tab=review&_crwnonce=nonce',
            '/other': '&tab=review&_crwnonce=nonce'
        };
        $scope.location.path('/capabilities');
        $httpBackend.expectGET(basepath + '&tab=invalid');
        $scope.$apply();
        $httpBackend.flush();
        expect($route.current.loadedTemplateUrl).toBe(basepath + '&tab=invalid');
        nonces.settings = 'nonce';
        for (var route in routePaths) {
            $scope.location.path(route);
            if (route !== '/other') {
                $httpBackend.expectGET(basepath + routePaths[route]);
                $scope.$apply();
                $httpBackend.flush();
            } else {
                $scope.$apply();
            }
            expect($route.current.loadedTemplateUrl).toBe(basepath + routePaths[route]);
        }
    }));
});
