/* wrapper controler for settings page */
crwApp.controller("AdminController", ['$scope', function ($scope) {
    $scope.activeTab = 'editor';
}]);

/* controller for administrative tab: adding/deleting projects, managing users */
crwApp.controller("EditorController", ['$scope', '$filter', 'ajaxFactory',
		function ($scope, $filter, ajaxFactory) {
    // initial load
    ajaxFactory.http({
        action: 'get_admin_data'
    }).then(function (admin) {
        $scope.admin = admin;
        $scope.selectedProject = $filter('orderBy')($scope.admin.projects, 'name')[0];
    }, function (error) {
        $scope.loadError = error;
    });

    // users not enabled for the selected project (contains user objects)
    $scope.filtered_users = [];
    // users enabled for the selected project (contains user ids)
    $scope.current_users = [];

    $scope.$watch('selectedProject', function (newSel) {
        if (newSel) {
            $scope.current_users = newSel.editors || [];
            update_filtered();
        } else {
            $scope.current_users = [];
        }
    });

    // get user lists and their model data up to speed
    var update_filtered = function () {
        $scope.filtered_users = jQuery.grep($scope.admin.all_users, function (user) {
            if ($scope.selectedProject) {
                return jQuery.inArray(user.user_id, $scope.current_users) < 0;
            } else {
                return true;
            }
        });
        $scope.selectedEditor = $filter('orderBy')($scope.current_users, $scope.getUserName)[0];
        $scope.selectedUser = $filter('orderBy')($scope.filtered_users, 'user_name')[0];
    };

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
        update_filtered();
    };

    // enable a user for the current project
    $scope.addOne = function () {
        var selected = $scope.selectedUser.user_id;
        addUser($scope.selectedUser);
        update_filtered();
        $scope.selectedEditor = selected;
    };

    // disable all users for the current project
    $scope.removeAll = function () {
        $scope.current_users.splice(0);
        update_filtered();
    };

    // disnable a user for the current project
    $scope.removeOne = function () {
        var index = jQuery.inArray($scope.selectedEditor, $scope.current_users),
            selected = getUser($scope.selectedEditor);
        $scope.current_users.splice(index, 1);
        update_filtered();
        $scope.selectedUser = selected;
    };

    // add a new project to the local admin object
    $scope.saveProject = function () {
        var project = {
            name: $scope.newProject,
            editors: []
        };
        $scope.admin.projects.push(project);
        $scope.selectedProject = project;
        $scope.addingProject = false;
    };

    // remove a project from the local admin object
    $scope.deleteProject = function () {
        var index = jQuery.inArray($scope.admin.projects, $scope.selectedProject);
        $scope.admin.projects.splice(index, 1);
        $scope.selectedProject = $filter('orderBy')($scope.admin.projects, 'name')[0];
    };
}]);
