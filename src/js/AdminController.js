/* wrapper controller */
crwApp.controller("AdminController", ['$scope', '$routeParams', '$location', 'qStore', 'crosswordFactory',
		function ($scope, $routeParams, $location, qStore, crosswordFactory) {
    $scope.crw = crosswordFactory.getCrw();
    $scope.immediateStore = qStore.addStore();

    $scope.$routeParams = $routeParams;
    $scope.setActive = function (tabHash) {
        $location.path(tabHash);
    };
}]);

/* controller for Options tab: assign capabilities to roles */
crwApp.controller("OptionsController", ['$scope', 'ajaxFactory',
		function ($scope, ajaxFactory) {
    var optionsContext = 'options';

    // initial load after the nonce has been processed
    $scope.prepare = function (nonce) {
        ajaxFactory.setNonce(nonce, optionsContext);
        ajaxFactory.http({
            action: 'get_crw_capabilities'
        }, optionsContext).then(function (data) {
            $scope.capabilities = data.capabilities;
        }, function (error) {
            $scope.capError = error;
        });
    };

    $scope.updateCaps = function () {
        ajaxFactory.http({
            action: 'update_crw_capabilities',
            capabilities: angular.toJson($scope.capabilities)
        }, optionsContext).then(function (data) {
            $scope.capError = null;
            $scope.capsEdit.$setPristine();
            $scope.capabilities = data.capabilities;
        }, function (error) {
            $scope.capError = error;
        });
    };
}]);

/* controller for administrative tab: adding/deleting projects, managing users */
crwApp.controller("EditorController", ['$scope', '$filter', 'ajaxFactory',
		function ($scope, $filter, ajaxFactory) {
    var adminContext = 'admin';

    // level range that are applicable for default or maximum
    $scope.levelList = function (which) {
        var min, max, list = [];
        if (which === 'default') {
            min = 0;
            max = $scope.currentProject.maximum_level;
        } else {
            min = Math.max($scope.currentProject.default_level,
                    $scope.currentProject.used_level);
            max = 3;
        }
        for (var i = min; i <= max; i++) {
            list.push(i);
        }
        return list;
    };

    // extract the list of project names from the admin object
    $scope.getProjectList = function (current) {
        var list = [];
        angular.forEach($scope.admin.projects, function (project) {
            if (project.name !== current) {
                list.push(project.name);
            }
        });
        return list;
    };

    $scope.currentEditors = [];

    // load data freshly received from the server
    var showLoaded = function (admin, selected) {
        $scope.admin = admin;
        // flag for unsaved editor entries
        angular.forEach($scope.admin.projects, function (project) {
            project.pristine = true;
        });
        if (selected) {
            $scope.selectedProject = jQuery.grep($scope.admin.projects, function (project) {
                return project.name === selected;
            })[0];
        } else {
            $scope.selectedProject = $filter('orderBy')($scope.admin.projects, 'name')[0];
        }
        $scope.currentProject = angular.copy($scope.selectedProject);
        $scope.editorsPristine = true;
    };

    // initial load after the nonce has been processed
    $scope.prepare = function (nonce) {
        ajaxFactory.setNonce(nonce, adminContext);
        ajaxFactory.http({
            action: 'get_admin_data'
        }, adminContext).then(showLoaded, function (error) {
            $scope.loadError = error;
        });
    };

    // prune out form fields that do not count for selectedProject
    $scope.$watch('projectMod.$pristine', function (p) {
        var truePristine = true;
        angular.forEach(['name', 'defaultL', 'maximumL'], function (name) {
            truePristine &= $scope.projectMod[name].$pristine;
        });
        if (!p && truePristine) {
            $scope.projectMod.$setPristine();
        }
    });

    // creates new local project/editors object
    $scope.addProject = function () {
        $scope.selectedProject = null;
    };

    // copy out project data or create new empty objects
    $scope.$watch('selectedProject', function (newSel) {
        if (newSel) {
            $scope.currentProject = angular.copy(newSel);
            $scope.currentEditors = angular.copy(newSel.editors);
        } else {
            $scope.currentProject = {
                name: "",
                default_level: 1,
                maximum_level: 3,
                editors: []
            };
            $scope.currentEditors = [];
        }
        $scope.projectMod.$setPristine();
        $scope.editorsPristine = true;
        $scope.editorsSaveError = null;
        $scope.projectSaveError = null;
    });

    // reset project object
    $scope.abortProject = function () {
        if (!$scope.selectedProject) {
            $scope.selectedProject = $filter('orderBy')($scope.admin.projects, 'name')[0];
        }
        $scope.currentProject = angular.copy($scope.selectedProject);
        $scope.projectMod.$setPristine();
        $scope.projectSaveError = null;
    };

    // add a new project to the server
    $scope.saveProject = function () {
        ajaxFactory.http({
            action: 'save_project',
            method: $scope.selectedProject ? 'update' : 'add',
            project: $scope.selectedProject ? $scope.selectedProject.name : undefined,
            new_name: $scope.currentProject.name,
            default_level: $scope.currentProject.default_level,
            maximum_level: $scope.currentProject.maximum_level
        }, adminContext).then(function (data) {
            showLoaded(data, $scope.currentProject.name);
        }, function (error) {
            $scope.projectSaveError = error;
        });
    };

    // remove a project from the server
    $scope.deleteProject = function () {
        var message = {
            which: 'remove_project',
            project: $scope.selectedProject.name
        };
        $scope.immediateStore.newPromise('actionConfirmation', message).then(function () {
            ajaxFactory.http({
                action: 'save_project',
                method: 'remove',
                project: $scope.selectedProject.name
            }, adminContext).then(showLoaded, function (error) {
                $scope.projectSaveError = error;
            });
        });
    };

    // users not enabled for the selected project (contains user objects)
    $scope.filtered_users = [];

    // get user lists and their model data up to speed
    $scope.$watchCollection('currentEditors', function () {
        if (!$scope.admin) {
            return;
        }
        $scope.filtered_users = jQuery.grep($scope.admin.all_users, function (user) {
            return jQuery.inArray(user.user_id, $scope.currentEditors) < 0;
        });
        $scope.selectedEditor = $filter('orderBy')($scope.currentEditors, $scope.getUserName)[0];
        $scope.selectedUser = $filter('orderBy')($scope.filtered_users, 'user_name')[0];
        $scope.loadError = null;
    });

    var addUser = function (user) {
        $scope.currentEditors.push(user.user_id);
    };

    // fetch a user object by id
    var getUser = function (id) {
        return jQuery.grep($scope.admin.all_users, function (user) {
            return user.user_id === id;
        })[0];
    };

    // fetch a user name by id
    $scope.getUserName = function (id) {
        return getUser(id).user_name;
    };

    // enable all users for the current project
    $scope.addAll = function () {
        angular.forEach($scope.filtered_users, addUser);
        $scope.editorsPristine = false;
    };

    // enable a user for the current project
    $scope.addOne = function () {
        var selected = $scope.selectedUser.user_id;
        addUser($scope.selectedUser);
        $scope.editorsPristine = false;
        $scope.selectedEditor = selected;
    };

    // disable all users for the current project
    $scope.removeAll = function () {
        $scope.currentEditors.splice(0);
        $scope.editorsPristine = false;
    };

    // disable a user for the current project
    $scope.removeOne = function () {
        var index = jQuery.inArray($scope.selectedEditor, $scope.currentEditors),
            selected = getUser($scope.selectedEditor);
        $scope.currentEditors.splice(index, 1);
        $scope.editorsPristine = false;
        $scope.selectedUser = selected;
    };

    // reset editors object
    $scope.abortEditors = function () {
        $scope.currentEditors = angular.copy($scope.selectedProject.editors);
        $scope.editorsSaveError = null;
        $scope.editorsPristine = true;
    };

    // update editors list for current project on the server
    $scope.saveEditors = function () {
        ajaxFactory.http({
            action: 'update_editors',
            project: $scope.selectedProject.name,
            editors: angular.toJson($scope.currentEditors)
        }, adminContext).then(function (data) {
            showLoaded(data, $scope.selectedProject.name);
        }, function (error) {
            $scope.editorsSaveError = error;
        });
    };
}]);

// catch group selection at option level, i. e. after crossword selection
crwApp.directive('crwOptionClick', function () {
    return {
        link: function (scope, element, attrs) {
            element.on('click', 'option', function () {
                scope.$apply(function () {
                    scope.activateGroup(attrs.crwOptionClick);
                });
            });
        }
    };
});

/* controller for Review tab: review, approve or delete crosswords */
crwApp.controller("ReviewController", ['$scope', '$filter', 'ajaxFactory',
		function ($scope, $filter, ajaxFactory) {
    var reviewContext = 'review';
    $scope.selectedCrossword = { confirmed: null, pending: null };
    $scope.activeGroup = 'confirmed';

    // load data freshly received from the server
    var showLoaded = function (data, selected) {
        var newSelected;
        $scope.projects = data.projects;
        if (selected) {
            newSelected = jQuery.grep($scope.projects, function (project) {
                return project.name === selected;
            })[0];
        }
        if (newSelected) {
            $scope.selectedProject = newSelected;
        } else {
            $scope.selectedProject = $filter('orderBy')($scope.projects, 'name')[0];
        }
        $scope.reviewError = null;
    };

    // initial load after the nonce has been processed
    $scope.prepare = function (nonceCrossword, nonceReview) {
        ajaxFactory.setNonce(nonceCrossword, 'crossword');
        ajaxFactory.setNonce(nonceReview, reviewContext);
        ajaxFactory.http({
            action: 'list_projects_and_riddles'
        }, reviewContext).then(showLoaded, function (error) {
            $scope.reviewError = error;
        });
    };

    // delete a crossword from its group
    $scope.deleteCrossword = function (group) {
        var message = {
            which: 'delete_crossword',
            crossword: $scope.selectedCrossword[group],
            project: $scope.selectedProject.name
        };
        $scope.immediateStore.newPromise('actionConfirmation', message).then(function () {
            ajaxFactory.http({
                action: 'delete_crossword',
                project: $scope.selectedProject.name,
                name: $scope.selectedCrossword[group]
            }, reviewContext).then(function (data) {
                showLoaded(data, $scope.selectedProject.name);
            }, function (error) {
                $scope.reviewError = error;
            });
        });
    };

    // move a crossword from pending to confirmed group
    $scope.confirm = function () {
        var name = $scope.selectedCrossword.pending;
        var message = {
            which: 'approve_crossword',
            crossword: name,
            project: $scope.selectedProject.name
        };
        $scope.immediateStore.newPromise('actionConfirmation', message).then(function () {
            ajaxFactory.http({
                action: 'approve_crossword',
                project: $scope.selectedProject.name,
                name: name
            }, reviewContext).then(function (data) {
                showLoaded(data, $scope.selectedProject.name);
                $scope.selectedCrossword.confirmed = name;
                $scope.selectedCrossword.pending = $filter('orderBy')($scope.selectedProject.pending, 'toString()')[0];
                $scope.activateGroup('confirmed');
            }, function (error) {
                $scope.reviewError = error;
            });
        });
    };

    // adjust previewCrossword on group change
    $scope.activateGroup = function (group) {
        $scope.activeGroup = group;
        $scope.previewCrossword = $scope.selectedCrossword[group];
    };

    // on project selection:
    $scope.$watch('selectedProject', function (newSel) {
        if (newSel) {
            // alert preview CrosswordController of new project
            if ($scope.preview) {
                $scope.$broadcast('previewProject', newSel.name);
            }
            // adjust crossword selection
            angular.forEach($scope.selectedCrossword, function (name, group) {
                if (!name || jQuery.inArray(name, newSel[group]) < 0) {
                    $scope.selectedCrossword[group] = $filter('orderBy')(newSel[group], 'toString()')[0];
                }
            });
        }
    });

    // init preview CrosswordController
    $scope.$watch('preview', function (newPre) {
        if (newPre && $scope.selectedProject) {
            $scope.$evalAsync(function (scope) {
                $scope.$broadcast('previewProject', $scope.selectedProject.name);
                $scope.previewCrossword = $scope.selectedCrossword[$scope.activeGroup];
                $scope.$broadcast('previewCrossword', $scope.previewCrossword);
            });
        }
    });

    // adjust previewCrossword on groupwise selection change
    $scope.$watchCollection('selectedCrossword', function (newSc) {
        $scope.previewCrossword = newSc[$scope.activeGroup];
    });

    // pass previewCrossword on to CrosswordController only
    // on real data change
    $scope.$watch('previewCrossword', function (newName) {
        if ($scope.preview) {
            $scope.$broadcast('previewCrossword', newName);
        }
    });
}]);

/* route configuration */
crwApp.config(['$routeProvider', function($routeProvider) {
    var path = '';
    $routeProvider.when('/:tab/:nonce', {
        templateUrl: function ($routeParams) {
            path = $routeParams.tab + '/' + $routeParams.nonce;
            return crwBasics.ajaxUrl + '?action=get_option_tab&tab=' +
                    $routeParams.tab + '&_crwnonce=' + $routeParams.nonce;
        }
    }).otherwise({
        // use the last valid path
        redirectTo: function () {
            return path;
        }
    });
}]);
