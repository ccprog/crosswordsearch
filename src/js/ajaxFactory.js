crwApp.constant('nonces', {});

/* wrapper for $http service */
crwApp.factory('ajaxFactory', ['$http', '$q', 'nonces', function ($http, $q, nonces) {
    // defaults for all communication
    $http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
    var httpDefaults = {
        transformRequest: jQuery.param,
        method: 'POST',
        url: crwBasics.ajaxUrl
    };

    jQuery(document).on('heartbeat-tick', function (e, data) {
        if (data['wp-auth-check'] === false) {
            // nonces have expired, delete them
            angular.forEach(nonces, function (val, key) {
                delete nonces[key];
            });
        }
    });

    // format errors from heartbeat or $http
    var serverError = function (response) {
        if (response.heartbeat) {
            // ajax won't work at all without a browser reload
            return $q.reject(response);
        } else {
            return $q.reject({
                error: 'server error',
                debug: ['status ' + response.status]
            });
        }
    };

    // reject if the data received from the server are error messages,
    // or hand on the data object
    var inspectResponse = function (response, context) {
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
        if (response.data.nonce) {
            nonces[context] = response.data.nonce;
        }
        return response.data;
    };

    // construct runtime $http config and send xhr
    var request = function (data, context) {
        var bodyData = angular.extend({
                _crwnonce: nonces[context]
            }, data);
        var config = angular.extend({
            data: bodyData
        }, httpDefaults);
        return $http(config);
    };

    return {
        // for initial nonces transmitted with html code
        setNonce: function (nonce, context) {
            nonces[context] = nonce;
        },

        // data must be an object and at least contain data.action
        http: function (data, context) {
            if (nonces[context]) {
                // request can be sent
                return request(data, context).then(function (response) {
                    return inspectResponse(response, context);
                }, serverError);
            } else {
                // nonces have expired and are gone
                return $q.reject({heartbeat: true});
            }
        }
    };
}]);
