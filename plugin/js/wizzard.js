/*
crosswordsearch Wordpress plugin v1.1.0
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
var crwApp = angular.module("crwApp", []);

crwApp.constant("nonces", {});

crwApp.factory("ajaxFactory", [ "$http", "$q", "nonces", function($http, $q, nonces) {
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

crwApp.factory("reduce", function() {
    return function(array, initial, func) {
        angular.forEach(array, function(value, key) {
            initial = func.apply(value, [ initial, value, key ]);
        });
        return initial;
    };
});

crwApp.filter("localeNumber", function() {
    var diff, rlo = String.fromCharCode(8238), pdf = String.fromCharCode(8236);
    var encode = function(d) {
        return String.fromCharCode(d.charCodeAt(0) + diff);
    };
    return function(input) {
        switch (crwBasics.numerals) {
          case "arab":
            diff = 1632 - 48;
            return input.toString(10).replace(/[0-9]/g, encode);

          case "arabext":
            diff = 1776 - 48;
            return input.toString(10).replace(/[0-9]/g, encode);

          default:
            return input;
        }
    };
});

crwApp.directive("crwInteger", function() {
    return {
        require: "ngModel",
        link: function(scope, element, attrs, ctrl) {
            ctrl.$parsers.unshift(function(viewValue) {
                if (element.prop("disabled")) {
                    return viewValue;
                }
                var val = parseInt(viewValue, 10);
                if (isNaN(val) || val < attrs.min || val.toString() !== viewValue) {
                    ctrl.$setValidity(attrs.crwInteger, false);
                    return undefined;
                } else {
                    ctrl.$setValidity(attrs.crwInteger, true);
                    return val;
                }
            });
        }
    };
});

crwApp.directive("crwBindTrusted", [ "$sce", function($sce) {
    return {
        link: function(scope, element, attrs) {
            scope.$watch(attrs.crwBindTrusted, function(newString) {
                element.html(newString);
            });
        }
    };
} ]);

crwApp.directive("crwLaunch", [ "ajaxFactory", function(ajaxFactory) {
    return {
        link: function(scope, element, attrs) {
            element.click(function launch() {
                ajaxFactory.http({
                    action: "get_crw_public_list"
                }, "wizzard").then(function(data) {
                    scope.$broadcast("publicList", data);
                });
            });
        }
    };
} ]);

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
        var projectNames = jQuery.map($scope.projects, function(p) {
            return p.name;
        });
        if (jQuery.inArray($scope.project, projectNames) < 0) {
            $scope.project = $scope.projects[0];
        }
        $scope.noData = false;
    });
    function constructNames() {
        if ($scope.mode === "build") {
            $scope.names = [ {
                key: "new",
                label: crwBasics.l10nEmpty
            }, {
                key: "dft",
                label: crwBasics.l10nDefault
            } ];
        } else {
            $scope.names = [ {
                key: "no",
                label: crwBasics.l10nChoose
            } ];
        }
        if ($scope.project) {
            angular.forEach($scope.project.crosswords, function(name) {
                $scope.names.push({
                    key: name,
                    label: name
                });
            });
        }
        var dismissable = jQuery.grep($scope.names, function(obj) {
            return obj.key === $scope.crossword;
        }).length === 0;
        if (dismissable) {
            $scope.crossword = $scope.mode === "build" ? "new" : "no";
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
        var basic = jQuery.inArray($scope.crossword, basicNames);
        if (basic === 0) {
            code.attrs.name = "";
        } else if (basic < 0) {
            code.attrs.name = $scope.crossword;
        }
        if ($scope.mode === "build" && $scope.restricted) {
            code.attrs.restricted = 1;
        } else if ($scope.mode === "solve" && $scope.timer !== "none") {
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

(function($) {
    var old_position = tb_position;
    tb_position = function() {
        old_position();
        $("#TB_ajaxContent").attr("style", null);
    };
})(jQuery);