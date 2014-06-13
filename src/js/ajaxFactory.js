/* wrapper for $http service */
crwApp.factory('ajaxFactory', ['$http', '$q', function ($http, $q) {
    // defaults for all communication
    $http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
    $http.defaults.transformRequest = jQuery.param;
    var httpDefaults = {
        method: 'POST',
        url: crwBasics.ajaxUrl
    };

    // web server error messages
    var serverError = function (response) {
        return $q.reject({
            error: 'server error',
            debug: 'status ' + response.status
        });
    };

    // look for error messages received from server
    // or return the data object
    var inspectResponse = function (response) {
        var error = false;
        // look for admin-ajax.php errors
        if (typeof response.data !== 'object') {
            error = {error: 'malformed request'};
        // look for php execution errors
        } else if (response.data.error) {
            error = response.data;
        }
        if (error) {
            return $q.reject(error);
        }
        return response.data;
    };

    return {
        // data must be an object and at least contain data.action
        http: function (data) {
            return $http(angular.extend({
                data: data
            }, httpDefaults)).then(inspectResponse, serverError);
        }
    };
}]);