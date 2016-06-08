var crwApp = angular.module('crwApp', ['crwCommon']);

crwApp.directive("crwLaunch", ['ajaxFactory', function (ajaxFactory) {
    return {
        link: function (scope, element, attrs) {
            element.click(function launch () {
                ajaxFactory.http({
                    action: 'get_crw_public_list'
                }, 'wizzard').then(function (data) {
                    scope.$broadcast('publicList', data);
                });
            });
        }
    };
}]);

crwApp.controller("WizzardController", ['$scope', 'ajaxFactory',
		function ($scope, ajaxFactory) {
    var basicNames = ['new', 'dft', 'no'];

    $scope.noData = true;
    $scope.projects = [];
    $scope.mode = 'solve';
    $scope.timer = 'none';

    $scope.prepare = function (nonce) {
        ajaxFactory.setNonce(nonce, 'wizzard');
    };

    $scope.$on('publicList', function (event, data) {
        $scope.projects = data.projects;
        var projectNames = jQuery.map($scope.projects, function (p) {
            return p.name;
        });
        if (jQuery.inArray($scope.project, projectNames) < 0) {
            $scope.project = $scope.projects[0];
        }
        $scope.noData = false;
    });

    function constructNames () {
        if ($scope.mode === 'build') {
            $scope.names = [
                { key: 'new', label: crwBasics.l10nEmpty },
                { key: 'dft', label: crwBasics.l10nDefault }
            ];
        } else {
            $scope.names = [
                { key: 'no', label: crwBasics.l10nChoose }
            ]; 
        }
        if ($scope.project) {
            angular.forEach($scope.project.crosswords, function (name) {
                $scope.names.push({ key: name, label: name });
            });
        }
        var dismissable = jQuery.grep($scope.names, function (obj) {
            return obj.key === $scope.crossword;
        }).length === 0;
        if (dismissable) {
            $scope.crossword = $scope.mode === 'build' ? 'new' : 'no';
        }
    }
    $scope.$watch('project', constructNames);
    $scope.$watch('mode', constructNames);

    $scope.$watch('timer', function (newTimer) {
        switch (newTimer) {
        case 'none':
            $scope.timerValue = null;
            break;
        case 'forward':
            $scope.timerValue = 0;
            break;
        case 'backward':
            $scope.timerValue = 60;
            break;
        }
    });

    $scope.invalid = function () {
        return $scope.noData || !$scope.projects.length || ($scope.mode === 'solve' ?
            !$scope.crwForm.$valid : $scope.crwForm.$error.required);
    };

    $scope.insert = function () {
        var code = {
            tag: 'crosswordsearch',
            type: 'single',
            attrs: {
                mode: $scope.mode,
                project: $scope.project.name
            }
        };
        var basic = jQuery.inArray($scope.crossword, basicNames);
        if (basic === 0) {
            code.attrs.name = '';
        } else if (basic < 0) {
            code.attrs.name = $scope.crossword;
        }
        if ($scope.mode === 'build' && $scope.restricted) {
            code.attrs.restricted = 1;
        } else if ($scope.mode === 'solve' && $scope.timer !== 'none') {
            code.attrs.timer = $scope.timerValue;
            if ($scope.submitting) {
                code.attrs.submitting = 1;
            }
        }
        window.send_to_editor(wp.shortcode.string(code));
        tb_remove();
    };

    $scope.cancel = function () {
        tb_remove();
    };
}]);
