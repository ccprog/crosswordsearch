var crwApp = angular.module('crwApp', ['crwAjax']);

crwApp.directive("crwLaunch", ['ajaxFactory', function (ajaxFactory) {
    return {
        link: function (scope, element, attrs) {
            angular.element(element).click(function launch () {
                ajaxFactory.http({
                    action: 'get_crw_public_list'
                }, 'wizzard').then(function (data) {
                    scope.$broadcast('publicList', data);
                });
            });
        }
    };
}]);

crwApp.directive('crwTimeValue', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attrs, ctrl) {
            ctrl.$parsers.unshift(function(viewValue) {
                if (scope.timer === 'backward') {
                    var num = parseInt(viewValue, 10);
                    ctrl.$setValidity('time', num.toString() === viewValue && num > 0);
                }
                return viewValue;
            });
        }
    };
});

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
        $scope.project = $scope.projects[0]; // TODO: better preserve old values
        $scope.noData = false;
    });

    function constructNames () {
        // TODO: better preserve old values
        var isDismissable = (basicNames.indexOf($scope.crossword) >= 0  || !$scope.crossword);
        if ($scope.mode === 'build') {
            $scope.names = {
                'new': crwBasics.l10nEmpty,
                'dft': crwBasics.l10nDefault
            };
            if (isDismissable) {
                $scope.crossword = 'new';
            }
        } else {
            $scope.names = {
                'no': crwBasics.l10nChoose
            }; 
            if (isDismissable) {
                $scope.crossword = 'no';
            }
        }
        if ($scope.project) {
            angular.forEach($scope.project.crosswords, function (name) {
                $scope.names[name] = name;
            });
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
        var basic = basicNames.indexOf($scope.crossword);
        if (basic === 0) {
            code.attrs.name = '';
        } else if (basic < 0) {
            code.attrs.name = $scope.crossword;
        }
        if ($scope.mode === 'build' && $scope.restricted) {
            code.attrs.restricted = 1;
        } else if ($scope.timer !== 'none') {
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
