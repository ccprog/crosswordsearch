/* crwApp setup */
var crwApp = angular.module('crwApp',
            ['qantic.angularjs.stylemodel', 'customSelectElement']);

/* wrapper for $http service */
crwApp.factory('ajaxFactory', ['$http', '$q', function ($http, $q) {
    //counter for crossword instances
    var crwID = 0;

    // format errors from heartbeat or $http
    var serverError = function (response) {
        return $q.reject({
            error: 'server error',
            debug: ['status ' + response.status]
        });
    };

    // construct runtime $http config and send xhr TODO
    var request = function (data) {
        var url = crwBasics.ajaxUrl;
        if (data.name) {
            url += [data.project, data.name, 'json'].join('.');
        } else {
            url += [data.project, 'list', 'json'].join('.');
        }

        return $http.get(url);
    };

    var answer = function (data) {
        if (data.restricted) {
            return $q.resolve({
                "crossword": null,
                "default_level": 1,
                "maximum_level": 3,
                "namesList": []
            });
        } else {
            return request(data).then(function (response) {
                if (typeof response.data !== 'object') {
                    return $q.reject({error: 'malformed request'});
                }
                return response.data;
            }, serverError);
        }
    };

    return {
        getId: function () {
            return crwID++;
        },

        setNonce: function () {},

        // data must be an object and at least contain data.action
        http: function (data, context) {
            switch (data.action) {
            case 'get_crossword':
                return answer(data);
            case 'save_crossword':
                return $q.reject({error: crwBasics.locale.nosave});
            case 'submit_solution':
                return $q.reject({error: crwBasics.locale.nosubmit});
            default:
                return $q.reject({error: crwBasics.locale.noadmin});
            }
        }
    };
}]);
