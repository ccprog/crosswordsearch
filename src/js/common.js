/* reduce implementation */
crwApp.factory('reduce', function () {
    return function (array, initial, func) {
    angular.forEach(array, function(value, key) {
        initial = func.apply(value, [initial, value, key]);
    });
	return initial;
    };
});

/* display localized integers in different scripts
 * (shim for Number.prototype.toLocaleString) */
crwApp.filter("localeNumber",  function() {
    var diff,
        rlo = String.fromCharCode(0x202E),
        pdf = String.fromCharCode(0x202C);
    var encode = function (d) {
        return String.fromCharCode(d.charCodeAt(0) + diff);
    };
    return function(input) {
        switch (crwBasics.numerals) {
        case "arab":
            diff = 0x660 - 0x30;
            return input.toString(10).replace(/[0-9]/g, encode);
        case "arabext":
            diff = 0x6F0 - 0x30;
            return input.toString(10).replace(/[0-9]/g, encode);
        default:
            return input;
        }
    };
});

/* input validity parser for dimensions */
crwApp.directive('crwInteger', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attrs, ctrl) {
            ctrl.$parsers.unshift(function(viewValue) {
                if (element.prop('disabled')) {
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

/* bypass escape service for localized strings */
crwApp.directive('crwBindTrusted', ['$sce', function ($sce) {
    return {
        link: function (scope, element, attrs) {
            scope.$watch(attrs.crwBindTrusted, function (newString) {
                element.html(newString);
            });
        }
    };
}]);
