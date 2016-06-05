/*
crosswordsearch Wordpress plugin v0.7.3
Copyright Claus Colloseus 2014 for RadiJojo.de

This program is free software: Redistribution and use, with or
without modification, are permitted provided that the following
conditions are met:
 * If you redistribute this code, either as source code or in
   minimized, compacted or obfuscated form, you must retain the
   above copyright notice, this list of conditions and the
   following disclaimer.
 * If you modify this code, distributions must not misrepresent
   the origin of those parts of the code that remain unchanged,
   and you must retain the above copyright notice and the following
   disclaimer.
 * If you modify this code, distributions must include a license
   which is compatible to the terms and conditions of this license.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
*/
var crwAjax = angular.module("crwAjax", []);

crwAjax.constant("nonces", {});

crwAjax.factory("ajaxFactory", [ "$http", "$q", "nonces", function($http, $q, nonces) {
    var crwID = 0;
    $http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
    var httpDefaults = {
        transformRequest: jQuery.param,
        method: "POST",
        url: crwBasics.ajaxUrl
    };
    jQuery(document).on("heartbeat-tick", function(e, data) {
        if (data["wp-auth-check"] === false) {
            angular.forEach(nonces, function(val, key) {
                delete nonces[key];
            });
        }
    });
    var serverError = function(response) {
        if (response.heartbeat) {
            return $q.reject(response);
        } else {
            return $q.reject({
                error: "server error",
                debug: [ "status " + response.status ]
            });
        }
    };
    var inspectResponse = function(response, context) {
        var error = false;
        if (typeof response.data !== "object") {
            error = {
                error: "malformed request"
            };
        } else if (response.data.error) {
            error = response.data;
        }
        if (error) {
            return $q.reject(error);
        }
        if (response.data.nonce) {
            nonces[context] = response.data.nonce;
        }
        return response.data;
    };
    var request = function(data, context) {
        var bodyData = angular.extend({
            _crwnonce: nonces[context]
        }, data);
        var config = angular.extend({
            data: bodyData
        }, httpDefaults);
        return $http(config);
    };
    return {
        getId: function() {
            return crwID++;
        },
        setNonce: function(nonce, context) {
            nonces[context] = nonce;
        },
        http: function(data, context) {
            if (nonces[context]) {
                return request(data, context).then(function(response) {
                    return inspectResponse(response, context);
                }, serverError);
            } else {
                return $q.reject({
                    heartbeat: true
                });
            }
        }
    };
} ]);

var crwApp = angular.module("crwApp", [ "crwAjax" ]);

crwApp.directive("crwLaunch", [ "ajaxFactory", function(ajaxFactory) {
    return {
        link: function(scope, element, attrs) {
            angular.element(element).click(function launch() {
                ajaxFactory.http({
                    action: "get_crw_public_list"
                }, "wizzard").then(function(data) {
                    scope.$broadcast("publicList", data);
                });
            });
        }
    };
} ]);

crwApp.directive("crwTimeValue", function() {
    return {
        require: "ngModel",
        link: function(scope, element, attrs, ctrl) {
            ctrl.$parsers.unshift(function(viewValue) {
                if (scope.timer === "backward") {
                    var num = parseInt(viewValue, 10);
                    ctrl.$setValidity("time", num.toString() === viewValue && num > 0);
                }
                return viewValue;
            });
        }
    };
});

crwApp.controller("WizzardController", [ "$scope", "ajaxFactory", function($scope, ajaxFactory) {
    var basicNames = [ "new", "dft", "no" ];
    $scope.noData = true;
    $scope.projects = [];
    $scope.mode = "solve";
    $scope.timer = "none";
    $scope.prepare = function(nonce) {
        ajaxFactory.setNonce(nonce, "wizzard");
    };
    $scope.$on("publicList", function(event, data) {
        $scope.projects = data.projects;
        $scope.project = $scope.projects[0];
        $scope.noData = false;
    });
    function constructNames() {
        var isDismissable = basicNames.indexOf($scope.crossword) >= 0 || !$scope.crossword;
        if ($scope.mode === "build") {
            $scope.names = {
                "new": crwBasics.l10nEmpty,
                dft: crwBasics.l10nDefault
            };
            if (isDismissable) {
                $scope.crossword = "new";
            }
        } else {
            $scope.names = {
                no: crwBasics.l10nChoose
            };
            if (isDismissable) {
                $scope.crossword = "no";
            }
        }
        if ($scope.project) {
            angular.forEach($scope.project.crosswords, function(name) {
                $scope.names[name] = name;
            });
        }
    }
    $scope.$watch("project", constructNames);
    $scope.$watch("mode", constructNames);
    $scope.$watch("timer", function(newTimer) {
        switch (newTimer) {
          case "none":
            $scope.timerValue = null;
            break;

          case "forward":
            $scope.timerValue = 0;
            break;

          case "backward":
            $scope.timerValue = 60;
            break;
        }
    });
    $scope.invalid = function() {
        return $scope.noData || !$scope.projects.length || ($scope.mode === "solve" ? !$scope.crwForm.$valid : $scope.crwForm.$error.required);
    };
    $scope.insert = function() {
        var code = {
            tag: "crosswordsearch",
            type: "single",
            attrs: {
                mode: $scope.mode,
                project: $scope.project.name
            }
        };
        var basic = basicNames.indexOf($scope.crossword);
        if (basic === 0) {
            code.attrs.name = "";
        } else if (basic < 0) {
            code.attrs.name = $scope.crossword;
        }
        if ($scope.mode === "build" && $scope.restricted) {
            code.attrs.restricted = 1;
        } else if ($scope.timer !== "none") {
            code.attrs.timer = $scope.timerValue;
            if ($scope.submitting) {
                code.attrs.submitting = 1;
            }
        }
        window.send_to_editor(wp.shortcode.string(code));
        tb_remove();
    };
    $scope.cancel = function() {
        tb_remove();
    };
} ]);