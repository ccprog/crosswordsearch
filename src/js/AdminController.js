crwApp.controller("AdminController", ['$scope', function ($scope) {
    $scope.activeTab = 'editor';
}]);

crwApp.controller("EditorController", ['$scope', '$filter',
		function ($scope, $filter) {
    $scope.admin = {
        projects: [
            {
                name: 'test_project_1',
                editors: [ 1, 2 ]
            },
            {
                name: 'test_project_2',
                editors: [ 3 ]
            }
        ],
        all_users: [
            {user_id: 1, user_name: 'Hans'},
            {user_id: 2, user_name: 'Margarete'},
            {user_id: 3, user_name: 'Die Hexe'},
            {user_id: 4, user_name: 'Gebrüder Grimm'}
        ]
    };
    $scope.filtered_users = [];
    $scope.current_users = [];
    $scope.selectedProject = $filter('orderBy')($scope.admin.projects, 'name')[0];

    $scope.$watch('selectedProject', function (newSel) {
        $scope.current_users = newSel.editors || [];
        update_filtered();
    });

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

    var getUser = function (id) {
        return jQuery.grep($scope.admin.all_users, function (user) {
            return user.user_id === id;
        })[0];
    };

    $scope.getUserName = function (id) {
        return getUser(id).user_name;
    };

    $scope.getProjectList = function () {
        return jQuery.map($scope.admin.projects, function (project) {
            return project.name;
        });
    };

    $scope.addAll = function () {
        angular.forEach($scope.filtered_users, addUser);
        update_filtered();
    };

    $scope.addOne = function () {
        var selected = $scope.selectedUser.user_id;
        addUser($scope.selectedUser);
        update_filtered();
        $scope.selectedEditor = selected;
    };

    $scope.removeAll = function () {
        $scope.current_users.splice(0);
        update_filtered();
    };

    $scope.removeOne = function () {
        var index = jQuery.inArray($scope.selectedEditor, $scope.current_users),
            selected = getUser($scope.selectedEditor);
        $scope.current_users.splice(index, 1);
        update_filtered();
        $scope.selectedUser = selected;
    };

    $scope.saveProject = function () {
        var project = {
            name: $scope.newProject,
            editors: []
        };
        $scope.admin.projects.push(project);
        $scope.selectedProject = project;
        $scope.addingProject = false;
    };

    $scope.deleteProject = function () {
        var index = jQuery.inArray($scope.admin.projects, $scope.selectedProject);
        $scope.admin.projects.splice(index, 1);
        $scope.selectedProject = $filter('orderBy')($scope.admin.projects, 'name')[0];
    };
}]);
