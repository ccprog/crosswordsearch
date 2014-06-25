/* controller for administrative tab: adding/deleting projects, managing users */
crwApp.controller("EditorController", ['$scope', '$filter', 'ajaxFactory',
		function ($scope, $filter, ajaxFactory) {
    var adminContext = 'admin';

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
        $scope.newProject = null;
        $scope.addingProject = false;
        $scope.editorsSaveError = null;
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

    // users not enabled for the selected project (contains user objects)
    $scope.filtered_users = [];
    // users enabled for the selected project (contains user ids)
    $scope.current_users = [];

    $scope.$watch('selectedProject', function (newSel) {
        if (newSel) {
            $scope.current_users = angular.copy(newSel.editors) || [];
        } else {
            $scope.current_users = null;
        }
    });

    // get user lists and their model data up to speed
    $scope.$watchCollection('current_users', function () {
        if (!$scope.admin) {
            return;
        }
        $scope.filtered_users = jQuery.grep($scope.admin.all_users, function (user) {
            if ($scope.selectedProject) {
                return jQuery.inArray(user.user_id, $scope.current_users) < 0;
            } else {
                return true;
            }
        });
        $scope.selectedEditor = $filter('orderBy')($scope.current_users, $scope.getUserName)[0];
        $scope.selectedUser = $filter('orderBy')($scope.filtered_users, 'user_name')[0];
        $scope.loadError = null;
        $scope.projectSaveError = null;
    });

    var addUser = function (user) {
        $scope.current_users.push(user.user_id);
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

    // extract the list of project names from the admin object
    $scope.getProjectList = function () {
        return jQuery.map($scope.admin.projects, function (project) {
            return project.name;
        });
    };

    // enable all users for the current project
    $scope.addAll = function () {
        angular.forEach($scope.filtered_users, addUser);
        $scope.selectedProject.pristine = false;
    };

    // enable a user for the current project
    $scope.addOne = function () {
        var selected = $scope.selectedUser.user_id;
        addUser($scope.selectedUser);
        $scope.selectedProject.pristine = false;
        $scope.selectedEditor = selected;
    };

    // disable all users for the current project
    $scope.removeAll = function () {
        $scope.current_users.splice(0);
        $scope.selectedProject.pristine = false;
    };

    // disable a user for the current project
    $scope.removeOne = function () {
        var index = jQuery.inArray($scope.selectedEditor, $scope.current_users),
            selected = getUser($scope.selectedEditor);
        $scope.current_users.splice(index, 1);
        $scope.selectedProject.pristine = false;
        $scope.selectedUser = selected;
    };

    // add a new project to the server
    $scope.saveProject = function () {
        ajaxFactory.http({
            action: 'add_project',
            project: $scope.newProject
        }, adminContext).then(function (data) {
            showLoaded(data, $scope.newProject);
        }, function (error) {
            $scope.projectSaveError = error;
        });
    };

    // reset project column
    $scope.abortProject = function () {
        $scope.newProject = null;
        $scope.projectSaveError = null;
        $scope.addingProject = false;
    };

    // remove a project from the server
    $scope.deleteProject = function () {
        ajaxFactory.http({
            action: 'remove_project',
            project: $scope.selectedProject.name
        }, adminContext).then(showLoaded, function (error) {
            $scope.projectSaveError = error;
        });
    };

    // update editors list for current project on the server
    $scope.saveEditors = function () {
        ajaxFactory.http({
            action: 'update_editors',
            project: $scope.selectedProject.name,
            editors: angular.toJson($scope.current_users)
        }, adminContext).then(function (data) {
            showLoaded(data, $scope.selectedProject.name);
        }, function (error) {
            $scope.editorsSaveError = error;
        });
    };

    // reset editors column
    $scope.abortEditors = function () {
        $scope.current_users = angular.copy($scope.selectedProject.editors);
        $scope.editorsSaveError = null;
        $scope.selectedProject.pristine = true;
    };
}]);

/* controller for administrative tab: adding/deleting projects, managing users */
crwApp.controller("ReviewController", ['$scope', '$filter', 'ajaxFactory',
		function ($scope, $filter, ajaxFactory) {
    var reviewContext = 'review';

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
        $scope.loadError = null;
        $scope.deleteError = null;
    };

    // initial load after the nonce has been processed
    $scope.prepare = function (nonceCrossword, nonceReview) {
        ajaxFactory.setNonce(nonceCrossword, 'crossword');
        ajaxFactory.setNonce(nonceReview, reviewContext);
        ajaxFactory.http({
            action: 'list_projects_and_riddles'
        }, reviewContext).then(showLoaded, function (error) {
            $scope.loadError = error;
        });
    };

    $scope.deleteCrossword = function () {
        ajaxFactory.http({
            action: 'delete_crossword',
            project: $scope.selectedProject.name,
            name: $scope.selectedCrossword
        }, reviewContext).then(function (data) {
            showLoaded(data, $scope.selectedProject.name);
        }, function (error) {
            $scope.deleteError = error;
        });
    };

    $scope.$watch('selectedProject', function (newSel) {
        if (newSel) {
             if ($scope.preview) {
                $scope.$broadcast('previewProject', newSel.name);
            }
           $scope.selectedCrossword = $filter('orderBy')(newSel.crosswords, 'toString()')[0];
        }
        $scope.deleteError = null;
    });

    $scope.$watch('selectedCrossword', function (newName) {
        if (newName && $scope.preview) {
            $scope.$broadcast('previewCrossword', newName);
        }
    });

    $scope.$watch('preview', function (newPre) {
        if (newPre && $scope.selectedProject) {
            $scope.$evalAsync(function (scope) {
                scope.$broadcast('previewProject', scope.selectedProject.name);
                scope.$broadcast('previewCrossword', scope.selectedCrossword);
            });
        }
    });
}]);
