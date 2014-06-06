/* crwApp setup */
var crwApp = angular.module('crwApp', ['qantic.angularjs.stylemodel', 'customSelectElement']);

/* reduce implementation */
crwApp.factory('reduce', function () {
    return function (array, initial, func) {
    angular.forEach(array, function(value, key) {
        initial = func.apply(value, [initial, value, key]);
    });
	return initial;
    };
});

/* constants */
crwApp.factory('basics', ['reduce', function (reduce) {
    var total = 0;
    var list = reduce(crwBasics.letterDist, "", function (result, value, key) {
        total += value;
        for (var i = 0; i < value; i++) {
            result += key;
        }
        return result;
    });

    return {
        // the list of marking colors selectable on build page.
        colors: ["black", "red", "green", "blue", "orange", "violet", "aqua"],

        // base directory
        pluginPath: crwBasics.pluginPath,

        // select one color at random, but exclude the one provided as the parameter
        randomColor: function (last) {
            var color;
            do {
                color = this.colors[Math.floor(Math.random()*7)];
            } while (color === last);
            return color;
        },

        // return one random letter. The probability of each letter
        // is determined by the letter distribution data
        randomLetter: function () {
            var pos = Math.floor(Math.random()*total);
            return list.slice(pos, pos+1);
        },

        // return the regex describing allowed letters
        letterRegEx: new RegExp(crwBasics.letterRegEx),

        // pixel sizing for one crossword field, including borders
        // This must match the width and height of images/grid.png
        // and all images/markers-...png partial sizes
        fieldSize: 31,

        // maps from marking direction names to CSS class names for
        // individual marker parts
        directionMapping: {
            'down-right': {
                end: 'up-left',
                middle: 'diagonal-down',
                left: 'corner-up-right',
                right: 'corner-down-left'
            },
            'up-left': {
                end: 'down-right',
                middle: 'diagonal-down',
                left: 'corner-up-right',
                right: 'corner-down-left'
            },
            'up-right': {
                end: 'down-left',
                middle: 'diagonal-up',
                left: 'corner-down-right',
                right: 'corner-up-left'
            },
            'down-left': {
                end: 'up-right',
                middle: 'diagonal-up',
                left: 'corner-down-right',
                right: 'corner-up-left'
            },
            'down': {
                end: 'up',
                middle: 'vertical'
            },
            'up': {
                end: 'down',
                middle: 'vertical'
            },
            'right': {
                end: 'left',
                middle: 'horizontal'
            },
            'left': {
                end: 'right',
                middle: 'horizontal'
            }
        },

        // localize a string for output
        localize: function (str) {
            return crwBasics.locale[str] || str;
        }
    };
}]);
