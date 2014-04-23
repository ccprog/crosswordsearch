/* app setup */
var app = angular.module('app', ['ngSanitize', 'qantic.angularjs.stylemodel', 'customSelectElement']);

/* constants */
app.factory('basics', function () {
    // letter distribution data for supported languages
    var letterDist =  {
        "english": {"A": 8, "B": 1, "C": 3, "D": 4, "E": 12, "F": 2, "G": 2, "H": 6, "I": 7, "J": 1, "K": 1, "L": 4, "M": 2, "N": 6, "O": 7, "P": 2, "Q": 1, "R": 6, "S": 6, "T": 9, "U": 3, "V": 1, "W": 2, "X": 1, "Y": 2, "Z": 1}, "french": {"A": 8, "B":1, "C": 3, "D": 3, "E": 17, "F": 1, "G": 1, "H": 1, "I": 7, "J": 1, "K": 1, "L": 5, "M": 3, "N": 7, "O": 5, "P": 3, "Q": 1, "R": 6, "S": 8, "T": 7, "U": 6, "V": 1, "W": 1, "X": 1, "Y": 1, "Z": 1},
        "german": {"A": 6, "B": 2, "C": 3, "D": 5, "E": 17, "F": 1, "G": 3, "H": 4, "I": 7, "J": 1, "K": 1, "L": 3, "M": 2, "N": 10, "O": 2, "P": 1, "Q": 1, "R": 7, "S": 8, "T": 6, "U": 4, "V": 1, "W": 2, "X": 1, "Y": 1, "Z": 1},
        "spanish": {"A": 12, "B": 1, "C": 4, "D": 5, "E": 13, "F": 1, "G": 1, "H": 1, "I": 6, "J": 1, "K": 1, "L": 5, "M": 3, "N": 7, "O": 8, "P": 2, "Q": 1, "R": 7, "S": 8, "T": 4, "U": 4, "V": 1, "W": 1, "X": 1, "Y": 1, "Z": 1},
        "portuguese": {"A": 14, "B": 1, "C": 4, "D": 5, "E": 12, "F": 1, "G": 1, "H": 1, "I": 6, "J": 1, "K": 1, "L": 3, "M": 4, "N": 5, "O": 11, "P": 2, "Q": 1, "R": 6, "S": 8, "T": 4, "U": 4, "V": 1, "W": 1, "X": 1, "Y": 1, "Z": 1},
        "italian": {"A": 11, "B": 1, "C": 4, "D": 3, "E": 11, "F": 1, "G": 1, "H": 1, "I": 11, "J": 1, "K": 1, "L": 6, "M": 2, "N": 7, "O": 10, "P": 3, "Q": 1, "R": 6, "S": 5, "T": 5, "U": 3, "V": 2, "W": 1, "X": 1, "Y": 1, "Z": 1},
        "turkish": {"A": 11, "B": 3, "C": 2, "D": 4, "E": 11, "F": 1, "G": 2, "H": 1, "I": 13, "J": 1, "K": 4, "L": 5, "M": 3, "N": 7, "O": 3, "P": 1, "Q": 1, "R": 7, "S": 5, "T": 3, "U": 5, "V": 1, "W": 1, "X": 1, "Y": 3, "Z": 1},
        "swedish": {"A": 13, "B": 1, "C": 1, "D": 4, "E": 11, "F": 2, "G": 3, "H": 2, "I": 5, "J": 1, "K": 3, "L": 5, "M": 3, "N": 9, "O": 5, "P": 1, "Q": 1, "R": 8, "S": 6, "T": 8, "U": 2, "V": 2, "W": 1, "X": 1, "Y": 1, "Z": 1},
        "polish": {"A": 9, "B": 2, "C": 5, "D": 4, "E": 8, "F": 1, "G": 1, "H": 1, "I": 8, "J": 2, "K": 3, "L": 4, "M": 3, "N": 6, "O": 8, "P": 3, "Q": 1, "R": 4, "S": 5, "T": 3, "U": 2, "V": 1, "W": 4, "X": 1, "Y": 4, "Z": 7},
        "dutch": {"A": 7, "B": 2, "C": 1, "D": 6, "E": 19, "F": 1, "G": 3, "H": 2, "I": 6, "J": 1, "K": 2, "L": 3, "M": 2, "N": 10, "O": 6, "P": 2, "Q": 1, "R": 6, "S": 4, "T": 7, "U": 2, "V": 3, "W": 1, "X": 1, "Y": 1, "Z": 1},
        "danish": {"A": 9, "B": 2, "C": 1, "D": 5, "E": 16, "F": 2, "G": 4, "H": 1, "I": 6, "J": 1, "K": 3, "L": 5, "M": 3, "N": 7, "O": 5, "P": 1, "Q": 1, "R": 9, "S": 5, "T": 6, "U": 2, "V": 2, "W": 1, "X": 1, "Y": 1, "Z": 1}
    };

    // regex of allowed letters, defaults to standard latin
    // add other languages to support specific letters, especcially non-latin scripts
    var letterRegEx = {"default": /[a-zA-Z]/};
    return {
        // the list of marking colors selectable on build page.
        colors: ["black", "red", "green", "blue", "orange", "violet", "aqua"],

        // select one color at random, but exclude the one provided as the parameter
        randomColor: function (last) {
            var color;
            do {
                color = this.colors[Math.floor(Math.random()*7)];
            } while (color === last);
            return color;
        },

        // return a concatenated string containing all supported letters for
        // one language. TODO: Obsolete now?
        letters: function (lang) {
            var list = "", dist = letterDist[lang];
            angular.forEach(dist, function (val, key) {
                list += key;
            });
            return list;
        },

        // return one random letter for a specific language.
        // The probability of each letter is determined by the language's
        // letter distribution data
        randomLetter: function (lang) {
            var list = "", total = 0, dist = letterDist[lang];
            angular.forEach(dist, function (val, key) {
                total += val;
                for (var i = 0; i < val; i++) {
                    list += key;
                }
            });
            var pos = Math.floor(Math.random()*total);
            return list.slice(pos, pos+1);
        },

        // return the regex describing allowed letters for one language
        letterRegEx: function (lang) {
            return letterRegEx[lang || "default"];
        },

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

        // test crossword TODO: delete
        'testCrossword': '{"name":"test","size":{"width":10,"height":7},"table":[[{"letter":"V"},{"letter":"N"},{"letter":"N"},{"letter":"C"},{"letter":"G"},{"letter":"L"},{"letter":"D"},{"letter":"S"},{"letter":"E"},{"letter":"Y"}],[{"letter":"M"},{"letter":"E"},{"letter":"R"},{"letter":"K"},{"letter":"U"},{"letter":"R"},{"letter":"N"},{"letter":"A"},{"letter":"M"},{"letter":"E"}],[{"letter":"T"},{"letter":"P"},{"letter":"N"},{"letter":"J"},{"letter":"U"},{"letter":"P"},{"letter":"I"},{"letter":"T"},{"letter":"E"},{"letter":"R"}],[{"letter":"D"},{"letter":"T"},{"letter":"N"},{"letter":"U"},{"letter":"R"},{"letter":"A"},{"letter":"N"},{"letter":"U"},{"letter":"S"},{"letter":"D"}],[{"letter":"W"},{"letter":"U"},{"letter":"D"},{"letter":"S"},{"letter":"S"},{"letter":"E"},{"letter":"B"},{"letter":"R"},{"letter":"F"},{"letter":"E"}],[{"letter":"E"},{"letter":"N"},{"letter":"N"},{"letter":"O"},{"letter":"S"},{"letter":"I"},{"letter":"A"},{"letter":"N"},{"letter":"E"},{"letter":"C"}],[{"letter":"E"},{"letter":"E"},{"letter":"I"},{"letter":"S"},{"letter":"G"},{"letter":"M"},{"letter":"D"},{"letter":"E"},{"letter":"N"},{"letter":"H"}]],"words":{"2":{"id":2,"color":"orange","stop":{"x":0,"y":5},"start":{"x":4,"y":5},"fields":[{"x":4,"y":5,"word":{"letter":"S"}},{"x":3,"y":5,"word":{"letter":"O"}},{"x":2,"y":5,"word":{"letter":"N"}},{"x":1,"y":5,"word":{"letter":"N"}},{"x":0,"y":5,"word":{"letter":"E"}}],"direction":"left"},"3":{"id":3,"color":"violet","stop":{"x":5,"y":1},"start":{"x":0,"y":1},"fields":[{"x":0,"y":1,"word":{"letter":"M"}},{"x":1,"y":1,"word":{"letter":"E"}},{"x":2,"y":1,"word":{"letter":"R"}},{"x":3,"y":1,"word":{"letter":"K"}},{"x":4,"y":1,"word":{"letter":"U"}},{"x":5,"y":1,"word":{"letter":"R"}}],"direction":"right"},"4":{"id":4,"color":"green","stop":{"x":4,"y":4},"start":{"x":0,"y":0},"fields":[{"x":0,"y":0,"word":{"letter":"V"}},{"x":1,"y":1,"word":{"letter":"E"}},{"x":2,"y":2,"word":{"letter":"N"}},{"x":3,"y":3,"word":{"letter":"U"}},{"x":4,"y":4,"word":{"letter":"S"}}],"direction":"down-right"},"5":{"id":5,"color":"aqua","stop":{"x":9,"y":4},"start":{"x":9,"y":1},"fields":[{"x":9,"y":1,"word":{"letter":"E"}},{"x":9,"y":2,"word":{"letter":"R"}},{"x":9,"y":3,"word":{"letter":"D"}},{"x":9,"y":4,"word":{"letter":"E"}}],"direction":"down"},"6":{"id":6,"color":"black","stop":{"x":8,"y":3},"start":{"x":5,"y":6},"fields":[{"x":5,"y":6,"word":{"letter":"M"}},{"x":6,"y":5,"word":{"letter":"A"}},{"x":7,"y":4,"word":{"letter":"R"}},{"x":8,"y":3,"word":{"letter":"S"}}],"direction":"up-right"},"7":{"id":7,"color":"blue","stop":{"x":9,"y":2},"start":{"x":3,"y":2},"fields":[{"x":3,"y":2,"word":{"letter":"J"}},{"x":4,"y":2,"word":{"letter":"U"}},{"x":5,"y":2,"word":{"letter":"P"}},{"x":6,"y":2,"word":{"letter":"I"}},{"x":7,"y":2,"word":{"letter":"T"}},{"x":8,"y":2,"word":{"letter":"E"}},{"x":9,"y":2,"word":{"letter":"R"}}],"direction":"right"},"8":{"id":8,"color":"red","stop":{"x":7,"y":5},"start":{"x":7,"y":0},"fields":[{"x":7,"y":0,"word":{"letter":"S"}},{"x":7,"y":1,"word":{"letter":"A"}},{"x":7,"y":2,"word":{"letter":"T"}},{"x":7,"y":3,"word":{"letter":"U"}},{"x":7,"y":4,"word":{"letter":"R"}},{"x":7,"y":5,"word":{"letter":"N"}}],"direction":"down"},"9":{"id":9,"color":"violet","stop":{"x":8,"y":3},"start":{"x":3,"y":3},"fields":[{"x":3,"y":3,"word":{"letter":"U"}},{"x":4,"y":3,"word":{"letter":"R"}},{"x":5,"y":3,"word":{"letter":"A"}},{"x":6,"y":3,"word":{"letter":"N"}},{"x":7,"y":3,"word":{"letter":"U"}},{"x":8,"y":3,"word":{"letter":"S"}}],"direction":"right"},"10":{"id":10,"color":"aqua","stop":{"x":1,"y":5},"start":{"x":1,"y":0},"fields":[{"x":1,"y":0,"word":{"letter":"N"}},{"x":1,"y":1,"word":{"letter":"E"}},{"x":1,"y":2,"word":{"letter":"P"}},{"x":1,"y":3,"word":{"letter":"T"}},{"x":1,"y":4,"word":{"letter":"U"}},{"x":1,"y":5,"word":{"letter":"N"}}],"direction":"down"}}}'
    };
});

/* cross scope relay for deferred functions */
app.factory('immediate', ['$q', function ($q) {
    // deferred listening hooks cache
    var store = {};
    return {
        // listeners can register callback functions that will provide
        // them with a deferred object and one optional argument they can
        // relate to the resolver functions.
        // callbacks must take the form function(deferred, arg)
        register: function (name, callback) {
            if (!store[name]) {
                store[name] = [];
            }
            store[name].push(callback);
        },

        // providers start deferred execution by calling this
        // with the argument for the listeners.
        // The promise object is returned.
        newPromise: function (name, arg) {
            var deferred = $q.defer();
            if (store[name]) {
                angular.forEach(store[name], function (callback) {
                    callback(deferred, arg);
                });
            }
            return deferred.promise;
        }
    };
}]);
