/*
crosswordsearch.js v0.1.0

crosswordsearch Wordpress plugin
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
var customSelectElement = angular.module("customSelectElement", []);

customSelectElement.directive("cseOutsideHide", [ "$document", function($document) {
    return {
        link: function(scope, element, attrs) {
            var elementEquals = function(el1, el2) {
                return el1[0] === el2[0];
            };
            var elementHide = function(event) {
                var clicked = angular.element(event.target);
                do {
                    if (elementEquals(clicked, element)) {
                        return;
                    }
                    clicked = clicked.parent();
                } while (clicked.length && !elementEquals($document, clicked));
                scope.$apply("visible = false");
            };
            element.on("$destroy", function() {
                $document.unbind("click", elementHide);
            });
            $document.bind("click", elementHide);
        }
    };
} ]);

customSelectElement.directive("cseSelect", function() {
    return {
        restrict: "A",
        scope: {
            options: "=cseOptions",
            model: "=cseModel"
        },
        link: function(scope, element, attrs) {
            scope.select = function(opt) {
                scope.model = opt;
            };
        },
        template: '<dt cse-outside-hide ng-init="visible=false">' + '<a href="" ng-click="visible=!visible"><div ng-show="!!(model)" cse-content value="model">' + "</div></a></dt>" + '<dd ng-show="visible"><ul>' + '<li ng-repeat="opt in options"><a href="" ng-click="select(opt)" cse-content value="opt">' + "</a></li>" + "</ul></dd>"
    };
});

var app = angular.module("app", [ "ngSanitize", "qantic.angularjs.stylemodel", "customSelectElement" ]);

app.factory("basics", function() {
    var letterDist = {
        english: {
            A: 8,
            B: 1,
            C: 3,
            D: 4,
            E: 12,
            F: 2,
            G: 2,
            H: 6,
            I: 7,
            J: 1,
            K: 1,
            L: 4,
            M: 2,
            N: 6,
            O: 7,
            P: 2,
            Q: 1,
            R: 6,
            S: 6,
            T: 9,
            U: 3,
            V: 1,
            W: 2,
            X: 1,
            Y: 2,
            Z: 1
        },
        french: {
            A: 8,
            B: 1,
            C: 3,
            D: 3,
            E: 17,
            F: 1,
            G: 1,
            H: 1,
            I: 7,
            J: 1,
            K: 1,
            L: 5,
            M: 3,
            N: 7,
            O: 5,
            P: 3,
            Q: 1,
            R: 6,
            S: 8,
            T: 7,
            U: 6,
            V: 1,
            W: 1,
            X: 1,
            Y: 1,
            Z: 1
        },
        german: {
            A: 6,
            B: 2,
            C: 3,
            D: 5,
            E: 17,
            F: 1,
            G: 3,
            H: 4,
            I: 7,
            J: 1,
            K: 1,
            L: 3,
            M: 2,
            N: 10,
            O: 2,
            P: 1,
            Q: 1,
            R: 7,
            S: 8,
            T: 6,
            U: 4,
            V: 1,
            W: 2,
            X: 1,
            Y: 1,
            Z: 1
        },
        spanish: {
            A: 12,
            B: 1,
            C: 4,
            D: 5,
            E: 13,
            F: 1,
            G: 1,
            H: 1,
            I: 6,
            J: 1,
            K: 1,
            L: 5,
            M: 3,
            N: 7,
            O: 8,
            P: 2,
            Q: 1,
            R: 7,
            S: 8,
            T: 4,
            U: 4,
            V: 1,
            W: 1,
            X: 1,
            Y: 1,
            Z: 1
        },
        portuguese: {
            A: 14,
            B: 1,
            C: 4,
            D: 5,
            E: 12,
            F: 1,
            G: 1,
            H: 1,
            I: 6,
            J: 1,
            K: 1,
            L: 3,
            M: 4,
            N: 5,
            O: 11,
            P: 2,
            Q: 1,
            R: 6,
            S: 8,
            T: 4,
            U: 4,
            V: 1,
            W: 1,
            X: 1,
            Y: 1,
            Z: 1
        },
        italian: {
            A: 11,
            B: 1,
            C: 4,
            D: 3,
            E: 11,
            F: 1,
            G: 1,
            H: 1,
            I: 11,
            J: 1,
            K: 1,
            L: 6,
            M: 2,
            N: 7,
            O: 10,
            P: 3,
            Q: 1,
            R: 6,
            S: 5,
            T: 5,
            U: 3,
            V: 2,
            W: 1,
            X: 1,
            Y: 1,
            Z: 1
        },
        turkish: {
            A: 11,
            B: 3,
            C: 2,
            D: 4,
            E: 11,
            F: 1,
            G: 2,
            H: 1,
            I: 13,
            J: 1,
            K: 4,
            L: 5,
            M: 3,
            N: 7,
            O: 3,
            P: 1,
            Q: 1,
            R: 7,
            S: 5,
            T: 3,
            U: 5,
            V: 1,
            W: 1,
            X: 1,
            Y: 3,
            Z: 1
        },
        swedish: {
            A: 13,
            B: 1,
            C: 1,
            D: 4,
            E: 11,
            F: 2,
            G: 3,
            H: 2,
            I: 5,
            J: 1,
            K: 3,
            L: 5,
            M: 3,
            N: 9,
            O: 5,
            P: 1,
            Q: 1,
            R: 8,
            S: 6,
            T: 8,
            U: 2,
            V: 2,
            W: 1,
            X: 1,
            Y: 1,
            Z: 1
        },
        polish: {
            A: 9,
            B: 2,
            C: 5,
            D: 4,
            E: 8,
            F: 1,
            G: 1,
            H: 1,
            I: 8,
            J: 2,
            K: 3,
            L: 4,
            M: 3,
            N: 6,
            O: 8,
            P: 3,
            Q: 1,
            R: 4,
            S: 5,
            T: 3,
            U: 2,
            V: 1,
            W: 4,
            X: 1,
            Y: 4,
            Z: 7
        },
        dutch: {
            A: 7,
            B: 2,
            C: 1,
            D: 6,
            E: 19,
            F: 1,
            G: 3,
            H: 2,
            I: 6,
            J: 1,
            K: 2,
            L: 3,
            M: 2,
            N: 10,
            O: 6,
            P: 2,
            Q: 1,
            R: 6,
            S: 4,
            T: 7,
            U: 2,
            V: 3,
            W: 1,
            X: 1,
            Y: 1,
            Z: 1
        },
        danish: {
            A: 9,
            B: 2,
            C: 1,
            D: 5,
            E: 16,
            F: 2,
            G: 4,
            H: 1,
            I: 6,
            J: 1,
            K: 3,
            L: 5,
            M: 3,
            N: 7,
            O: 5,
            P: 1,
            Q: 1,
            R: 9,
            S: 5,
            T: 6,
            U: 2,
            V: 2,
            W: 1,
            X: 1,
            Y: 1,
            Z: 1
        }
    };
    var letterRegEx = {
        "default": /[a-zA-Z]/
    };
    return {
        colors: [ "black", "red", "green", "blue", "orange", "violet", "aqua" ],
        pluginPath: "wp-content/plugins/crosswordsearch/",
        randomColor: function(last) {
            var color;
            do {
                color = this.colors[Math.floor(Math.random() * 7)];
            } while (color === last);
            return color;
        },
        letters: function(lang) {
            var list = "", dist = letterDist[lang];
            angular.forEach(dist, function(val, key) {
                list += key;
            });
            return list;
        },
        randomLetter: function(lang) {
            var list = "", total = 0, dist = letterDist[lang];
            angular.forEach(dist, function(val, key) {
                total += val;
                for (var i = 0; i < val; i++) {
                    list += key;
                }
            });
            var pos = Math.floor(Math.random() * total);
            return list.slice(pos, pos + 1);
        },
        letterRegEx: function(lang) {
            return letterRegEx[lang || "default"];
        },
        fieldSize: 31,
        directionMapping: {
            "down-right": {
                end: "up-left",
                middle: "diagonal-down",
                left: "corner-up-right",
                right: "corner-down-left"
            },
            "up-left": {
                end: "down-right",
                middle: "diagonal-down",
                left: "corner-up-right",
                right: "corner-down-left"
            },
            "up-right": {
                end: "down-left",
                middle: "diagonal-up",
                left: "corner-down-right",
                right: "corner-up-left"
            },
            "down-left": {
                end: "up-right",
                middle: "diagonal-up",
                left: "corner-down-right",
                right: "corner-up-left"
            },
            down: {
                end: "up",
                middle: "vertical"
            },
            up: {
                end: "down",
                middle: "vertical"
            },
            right: {
                end: "left",
                middle: "horizontal"
            },
            left: {
                end: "right",
                middle: "horizontal"
            }
        },
        testCrossword: '{"name":"test","size":{"width":10,"height":7},"table":[[{"letter":"V"},{"letter":"N"},{"letter":"N"},{"letter":"C"},{"letter":"G"},{"letter":"L"},{"letter":"D"},{"letter":"S"},{"letter":"E"},{"letter":"Y"}],[{"letter":"M"},{"letter":"E"},{"letter":"R"},{"letter":"K"},{"letter":"U"},{"letter":"R"},{"letter":"N"},{"letter":"A"},{"letter":"M"},{"letter":"E"}],[{"letter":"T"},{"letter":"P"},{"letter":"N"},{"letter":"J"},{"letter":"U"},{"letter":"P"},{"letter":"I"},{"letter":"T"},{"letter":"E"},{"letter":"R"}],[{"letter":"D"},{"letter":"T"},{"letter":"N"},{"letter":"U"},{"letter":"R"},{"letter":"A"},{"letter":"N"},{"letter":"U"},{"letter":"S"},{"letter":"D"}],[{"letter":"W"},{"letter":"U"},{"letter":"D"},{"letter":"S"},{"letter":"S"},{"letter":"E"},{"letter":"B"},{"letter":"R"},{"letter":"F"},{"letter":"E"}],[{"letter":"E"},{"letter":"N"},{"letter":"N"},{"letter":"O"},{"letter":"S"},{"letter":"I"},{"letter":"A"},{"letter":"N"},{"letter":"E"},{"letter":"C"}],[{"letter":"E"},{"letter":"E"},{"letter":"I"},{"letter":"S"},{"letter":"G"},{"letter":"M"},{"letter":"D"},{"letter":"E"},{"letter":"N"},{"letter":"H"}]],"words":{"2":{"id":2,"color":"orange","stop":{"x":0,"y":5},"start":{"x":4,"y":5},"fields":[{"x":4,"y":5,"word":{"letter":"S"}},{"x":3,"y":5,"word":{"letter":"O"}},{"x":2,"y":5,"word":{"letter":"N"}},{"x":1,"y":5,"word":{"letter":"N"}},{"x":0,"y":5,"word":{"letter":"E"}}],"direction":"left"},"3":{"id":3,"color":"violet","stop":{"x":5,"y":1},"start":{"x":0,"y":1},"fields":[{"x":0,"y":1,"word":{"letter":"M"}},{"x":1,"y":1,"word":{"letter":"E"}},{"x":2,"y":1,"word":{"letter":"R"}},{"x":3,"y":1,"word":{"letter":"K"}},{"x":4,"y":1,"word":{"letter":"U"}},{"x":5,"y":1,"word":{"letter":"R"}}],"direction":"right"},"4":{"id":4,"color":"green","stop":{"x":4,"y":4},"start":{"x":0,"y":0},"fields":[{"x":0,"y":0,"word":{"letter":"V"}},{"x":1,"y":1,"word":{"letter":"E"}},{"x":2,"y":2,"word":{"letter":"N"}},{"x":3,"y":3,"word":{"letter":"U"}},{"x":4,"y":4,"word":{"letter":"S"}}],"direction":"down-right"},"5":{"id":5,"color":"aqua","stop":{"x":9,"y":4},"start":{"x":9,"y":1},"fields":[{"x":9,"y":1,"word":{"letter":"E"}},{"x":9,"y":2,"word":{"letter":"R"}},{"x":9,"y":3,"word":{"letter":"D"}},{"x":9,"y":4,"word":{"letter":"E"}}],"direction":"down"},"6":{"id":6,"color":"black","stop":{"x":8,"y":3},"start":{"x":5,"y":6},"fields":[{"x":5,"y":6,"word":{"letter":"M"}},{"x":6,"y":5,"word":{"letter":"A"}},{"x":7,"y":4,"word":{"letter":"R"}},{"x":8,"y":3,"word":{"letter":"S"}}],"direction":"up-right"},"7":{"id":7,"color":"blue","stop":{"x":9,"y":2},"start":{"x":3,"y":2},"fields":[{"x":3,"y":2,"word":{"letter":"J"}},{"x":4,"y":2,"word":{"letter":"U"}},{"x":5,"y":2,"word":{"letter":"P"}},{"x":6,"y":2,"word":{"letter":"I"}},{"x":7,"y":2,"word":{"letter":"T"}},{"x":8,"y":2,"word":{"letter":"E"}},{"x":9,"y":2,"word":{"letter":"R"}}],"direction":"right"},"8":{"id":8,"color":"red","stop":{"x":7,"y":5},"start":{"x":7,"y":0},"fields":[{"x":7,"y":0,"word":{"letter":"S"}},{"x":7,"y":1,"word":{"letter":"A"}},{"x":7,"y":2,"word":{"letter":"T"}},{"x":7,"y":3,"word":{"letter":"U"}},{"x":7,"y":4,"word":{"letter":"R"}},{"x":7,"y":5,"word":{"letter":"N"}}],"direction":"down"},"9":{"id":9,"color":"violet","stop":{"x":8,"y":3},"start":{"x":3,"y":3},"fields":[{"x":3,"y":3,"word":{"letter":"U"}},{"x":4,"y":3,"word":{"letter":"R"}},{"x":5,"y":3,"word":{"letter":"A"}},{"x":6,"y":3,"word":{"letter":"N"}},{"x":7,"y":3,"word":{"letter":"U"}},{"x":8,"y":3,"word":{"letter":"S"}}],"direction":"right"},"10":{"id":10,"color":"aqua","stop":{"x":1,"y":5},"start":{"x":1,"y":0},"fields":[{"x":1,"y":0,"word":{"letter":"N"}},{"x":1,"y":1,"word":{"letter":"E"}},{"x":1,"y":2,"word":{"letter":"P"}},{"x":1,"y":3,"word":{"letter":"T"}},{"x":1,"y":4,"word":{"letter":"U"}},{"x":1,"y":5,"word":{"letter":"N"}}],"direction":"down"}}}'
    };
});

app.factory("immediate", [ "$q", function($q) {
    var store = {};
    return {
        register: function(name, callback) {
            if (!store[name]) {
                store[name] = [];
            }
            store[name].push(callback);
        },
        newPromise: function(name, arg) {
            var deferred = $q.defer();
            if (store[name]) {
                angular.forEach(store[name], function(callback) {
                    callback(deferred, arg);
                });
            }
            return deferred.promise;
        }
    };
} ]);

app.factory("crossword", [ "basics", function(basics) {
    var crossword = {
        name: "",
        size: {
            width: 10,
            height: 10
        },
        content: [],
        words: {},
        solution: {}
    };
    var Row = function() {
        var row = [];
        addFields(row, crossword.size.width, false);
        return row;
    };
    var Field = function() {
        return {
            letter: null
        };
    };
    var addRows = function(number, top) {
        if (number > 0) {
            for (var i = 0; i < number; i++) {
                if (top) {
                    crossword.content.unshift(new Row());
                } else {
                    crossword.content.push(new Row());
                }
            }
        } else {
            crossword.content.splice(top ? 0 : crossword.content.length + number, -number);
        }
        if (top) {
            angular.forEach(crossword.words, function(word) {
                word.start.y += number;
                word.stop.y += number;
            });
        }
    };
    var addFields = function(row, number, left) {
        if (number > 0) {
            for (var i = 0; i < number; i++) {
                if (left) {
                    row.unshift(new Field());
                } else {
                    row.push(new Field());
                }
            }
        } else {
            row.splice(left ? 0 : row.length + number, -number);
        }
    };
    var addAdditionalFields = function(number, left) {
        for (var i = 0; i < crossword.content.length; i++) {
            addFields(crossword.content[i], number, left);
        }
        if (left) {
            angular.forEach(crossword.words, function(word) {
                word.start.x += number;
                word.stop.x += number;
            });
        }
    };
    var forAllFields = function(func) {
        angular.forEach(crossword.content, function(line, row) {
            angular.forEach(line, function(field, col) {
                func.call(field, row, col);
            });
        });
    };
    addRows(crossword.size.height, false);
    return {
        getCrossword: function() {
            return crossword;
        },
        loadCrossword: function(json) {
            var obj = angular.fromJson(json || basics.testCrossword);
            crossword.name = obj.name;
            crossword.size = obj.size;
            crossword.words = obj.words;
            crossword.content = obj.table;
            crossword.solution = {};
        },
        setName: function(str) {
            crossword.name = str;
        },
        randomColor: function() {
            var highID = 0;
            angular.forEach(crossword.words, function(word) {
                if (word.id > highID) {
                    highID = word.id;
                }
            });
            return basics.randomColor(highID > 0 ? crossword.words[highID].color : undefined);
        },
        deleteWord: function(id, target) {
            if (crossword[target][id]) {
                delete crossword[target][id];
            }
        },
        randomizeEmptyFields: function() {
            forAllFields(function() {
                if (!this.letter) {
                    this.letter = basics.randomLetter("german");
                }
            });
        },
        emptyAllFields: function() {
            forAllFields(function() {
                this.letter = null;
            });
        },
        setWord: function(marking) {
            angular.forEach(marking.fields, function(field) {
                field.word = crossword.content[field.y][field.x];
            });
            return crossword.words[marking.id] = marking;
        },
        probeWord: function(marking) {
            var entry = marking;
            angular.forEach(entry.fields, function(field) {
                field.word = crossword.content[field.y][field.x];
            });
            entry.solved = false;
            angular.forEach(crossword.words, function(word) {
                if (angular.equals(word.start, entry.start) && angular.equals(word.stop, entry.stop)) {
                    entry = word;
                    word.solved = true;
                }
            });
            entry.markingId = marking.id;
            return crossword.solution[entry.id] = entry;
        },
        testWordBoundaries: function(change) {
            var critical = [];
            angular.forEach(crossword.words, function(word, id) {
                if (Math.min(word.start.x, word.stop.x) < -change.left || Math.max(word.start.x, word.stop.x) >= crossword.size.width + change.right || Math.min(word.start.y, word.stop.y) < -change.top || Math.max(word.start.y, word.stop.y) >= crossword.size.height + change.bottom) {
                    critical.push(parseInt(id, 10));
                }
            });
            return critical;
        },
        changeSize: function(change, critical) {
            angular.forEach(critical, function(id) {
                this.deleteWord(id, "words");
            }, this);
            var size = angular.copy(crossword.size);
            if (change.left !== 0) {
                addAdditionalFields(change.left, true);
                size.width += change.left;
            }
            if (change.right !== 0) {
                addAdditionalFields(change.right, false);
                size.width += change.right;
            }
            if (change.top !== 0) {
                addRows(change.top, true);
                size.height += change.top;
            }
            if (change.bottom !== 0) {
                addRows(change.bottom, false);
                size.height += change.bottom;
            }
            crossword.size = size;
        }
    };
} ]);

app.factory("markers", [ "basics", function(basics) {
    var markers = {};
    function add(marking, x, y, img) {
        if (img != null) {
            if (markers[x] == null) {
                markers[x] = {};
            }
            if (markers[x][y] == null) {
                markers[x][y] = {};
            }
            markers[x][y][marking.id] = {
                marking: marking,
                img: img
            };
        }
    }
    function setMarkers(marking, swap) {
        var mapping = basics.directionMapping[marking.direction];
        angular.forEach(marking.fields, function(field, i) {
            if (i === 0) {
                add(marking, field.x, field.y, marking.direction);
                if (marking.direction === "origin") {
                    return;
                }
                if (swap) {
                    add(marking, field.x - 1, field.y, mapping.left);
                } else {
                    add(marking, field.x + 1, field.y, mapping.right);
                }
            } else if (i === marking.fields.length - 1) {
                add(marking, field.x, field.y, mapping.end);
                if (swap) {
                    add(marking, field.x + 1, field.y, mapping.right);
                } else {
                    add(marking, field.x - 1, field.y, mapping.left);
                }
            } else {
                add(marking, field.x, field.y, mapping.middle);
                add(marking, field.x - 1, field.y, mapping.left);
                add(marking, field.x + 1, field.y, mapping.right);
            }
        });
    }
    return {
        setNewMarkers: function(marking) {
            var from = marking.start, to = marking.stop;
            var i, dif_x = to.x - from.x, dif_y = to.y - from.y;
            var swap = dif_x < 0 || dif_x === 0 && dif_y < 0;
            this.deleteMarking(marking.id);
            marking.fields = [];
            if (dif_x * dif_y > 0) {
                marking.direction = swap ? "up-left" : "down-right";
                for (i = 0; Math.abs(i) <= Math.abs(to.x - from.x); swap ? i-- : i++) {
                    marking.fields.push({
                        x: from.x + i,
                        y: from.y + i
                    });
                }
            } else if (dif_x * dif_y < 0) {
                marking.direction = swap ? "down-left" : "up-right";
                for (i = 0; Math.abs(i) <= Math.abs(to.x - from.x); swap ? i-- : i++) {
                    marking.fields.push({
                        x: from.x + i,
                        y: from.y - i
                    });
                }
            } else {
                if (dif_x === 0 && dif_y === 0) {
                    marking.direction = "origin";
                    marking.fields.push({
                        x: from.x,
                        y: from.y
                    });
                } else if (dif_x === 0) {
                    marking.direction = swap ? "up" : "down";
                    for (i = 0; Math.abs(i) <= Math.abs(to.y - from.y); swap ? i-- : i++) {
                        marking.fields.push({
                            x: from.x,
                            y: from.y + i
                        });
                    }
                } else {
                    marking.direction = swap ? "left" : "right";
                    for (i = 0; Math.abs(i) <= Math.abs(to.x - from.x); swap ? i-- : i++) {
                        marking.fields.push({
                            x: from.x + i,
                            y: from.y
                        });
                    }
                }
            }
            setMarkers(marking, swap);
        },
        exchangeMarkers: function(fields, id, color) {
            angular.forEach(fields, function(field) {
                markers[field.x][field.y][id].marking.color = color;
            });
        },
        shiftMarkers: function(markings, shift_x, shift_y) {
            angular.forEach(markings, function(marking) {
                var from = marking.start, to = marking.stop;
                var swap = to.x < from.x || to.x === from.x && to.y < from.y;
                this.deleteMarking(marking.id);
                angular.forEach(marking.fields, function(field) {
                    field.x += shift_x;
                    field.y += shift_y;
                });
                setMarkers(marking, swap);
            }, this);
        },
        getMarks: function(x, y) {
            if (markers[x] == null || y == null) {
                return undefined;
            }
            return markers[x][y];
        },
        deleteMarking: function(id) {
            angular.forEach(markers, function(x) {
                angular.forEach(x, function(y) {
                    delete y[id];
                });
            });
        },
        deleteAllMarking: function() {
            markers = {};
        }
    };
} ]);

app.controller("SizeController", [ "$scope", "$document", "immediate", "crossword", "basics", "StyleModelContainer", function($scope, $document, immediate, crossword, basics, StyleModelContainer) {
    var size = basics.fieldSize, t, b, l, r, lg, tg, wg, hg;
    var resetSizes = function(cols, rows) {
        l = t = -1;
        r = cols * size + 1;
        b = rows * size + 1;
        lg = tg = 0;
        wg = cols * size;
        hg = rows * size;
        $scope.modLeft.transform(l, 0);
        $scope.modTop.transform(0, t);
        $scope.modRight.transform(r, 0);
        $scope.modBottom.transform(0, b);
    };
    $scope.crw = crossword.getCrossword();
    StyleModelContainer.add("size-left", -Infinity, ($scope.crw.size.height - 3) * size + 1, 0, 0);
    StyleModelContainer.add("size-top", 0, 0, -Infinity, ($scope.crw.size.width - 3) * size + 1);
    StyleModelContainer.add("size-right", 5 * size + 1, Infinity, 0, 0);
    StyleModelContainer.add("size-bottom", 0, 0, 5 * size + 1, Infinity);
    $scope.modLeft = StyleModelContainer.get("size-left");
    $scope.modTop = StyleModelContainer.get("size-top");
    $scope.modRight = StyleModelContainer.get("size-right");
    $scope.modBottom = StyleModelContainer.get("size-bottom");
    resetSizes($scope.crw.size.width, $scope.crw.size.height);
    $scope.$watch("crw.size", function(newSize) {
        resetSizes(newSize.width, newSize.height);
    });
    $scope.modLeft.addStyle("size-left", function(x, y) {
        l = x;
        lg = Math.ceil((l + 1) / size) * size;
        wg = Math.floor((r - 1 - lg) / size) * size;
        if ($scope.modRight) {
            $scope.modRight.minx = Math.floor((l + 1) / size) * size + 3 * size + 1;
        }
    });
    $scope.modLeft.addStyle("handle-left", function(x, y) {
        return {
            left: l - lg - 6 + "px",
            width: lg - l + 12 + "px"
        };
    });
    $scope.modTop.addStyle("size-top", function(x, y) {
        t = y;
        tg = Math.ceil((t + 1) / size) * size;
        hg = Math.floor((b - 1 - tg) / size) * size;
        if ($scope.modBottom) {
            $scope.modBottom.miny = Math.floor((t + 1) / size) * size + 3 * size + 1;
        }
    });
    $scope.modTop.addStyle("handle-top", function(x, y) {
        return {
            top: t - tg - 6 + "px",
            height: tg - t + 12 + "px"
        };
    });
    $scope.modRight.addStyle("size-right", function(x, y) {
        r = x;
        wg = Math.floor((r - 1 - lg) / size) * size;
        if ($scope.modLeft) {
            $scope.modLeft.maxx = Math.floor((r - 1) / size) * size - 3 * size + 1;
        }
    });
    $scope.modRight.addStyle("handle-right", function(x, y) {
        return {
            right: lg + wg - r - 6 + "px",
            width: r - lg - wg + 12 + "px"
        };
    });
    $scope.modBottom.addStyle("size-bottom", function(x, y) {
        b = y;
        hg = Math.floor((b - 1 - tg) / size) * size;
        if ($scope.modTop) {
            $scope.modTop.maxy = Math.floor((b - 1) / size) * size - 3 * size + 1;
        }
    });
    $scope.modBottom.addStyle("handle-bottom", function(x, y) {
        return {
            bottom: tg + hg - b - 6 + "px",
            height: b - tg - hg + 12 + "px"
        };
    });
    $scope.styleGridSize = function() {
        return {
            left: lg + "px",
            width: wg + "px",
            top: tg + "px",
            height: hg + "px"
        };
    };
    $scope.styleShift = function() {
        return {
            left: -lg + "px",
            top: -tg + "px"
        };
    };
    var currentSize;
    var abstractSize = function() {
        return {
            left: -lg / size,
            right: (lg + wg) / size,
            top: -tg / size,
            bottom: (tg + hg) / size
        };
    };
    $scope.startResize = function() {
        currentSize = abstractSize();
        $document.on("$destroy", $document.unbind("mouseup", stopResize));
        $document.bind("mouseup", stopResize);
    };
    var stopResize = function() {
        var newSize = abstractSize();
        if (!angular.equals(currentSize, newSize)) {
            var change = {
                left: newSize.left - currentSize.left,
                right: newSize.right - currentSize.right,
                top: newSize.top - currentSize.top,
                bottom: newSize.bottom - currentSize.bottom
            };
            var critical = crossword.testWordBoundaries(change);
            if (critical.length) {
                immediate.newPromise("invalidWords", critical).then(function() {
                    crossword.changeSize(change, critical);
                }, function() {
                    resetSizes(currentSize.right + currentSize.left, currentSize.bottom + currentSize.top);
                });
            } else {
                $scope.$apply(crossword.changeSize(change, critical));
            }
        }
        $document.unbind("mouseup", stopResize);
    };
} ]);

app.directive("crwSetFocus", function() {
    return {
        link: function(scope, element, attrs) {
            element.on("mousemove", function(event) {
                event.preventDefault();
            });
            scope.$on("setFocus", function(event, line, column) {
                if (line === scope.line && column === scope.column) {
                    element[0].focus();
                }
            });
        }
    };
});

app.directive("crwCatchDragging", [ "$document", function($document) {
    return {
        link: function(scope, element, attrs) {
            var tableMouseDown = function(event) {
                event.preventDefault();
                $document.bind("mouseup", tableMouseUp);
                scope.startMark();
            };
            var tableMouseUp = function(event) {
                event.preventDefault();
                $document.unbind("mouseup", tableMouseUp);
                scope.$apply(scope.stopMark());
            };
            element.bind("mousedown", tableMouseDown);
            $document.bind("mouseup", tableMouseUp);
            element.on("$destroy", function() {
                $document.unbind("mouseup", tableMouseUp);
            });
        }
    };
} ]);

app.directive("crwIndexChecker", function() {
    return {
        link: function(scope, element, attrs) {
            scope.$watch("$index", function(newIndex) {
                scope[attrs.crwIndexChecker] = newIndex;
            });
        }
    };
});

app.controller("TableController", [ "$scope", "basics", "immediate", "crossword", "markers", function($scope, basics, immediate, crossword, markers) {
    var isMarking = false, currentMarking, mode;
    function validMarking(newStop) {
        var dif_x = currentMarking.start.x - newStop.x, dif_y = currentMarking.start.y - newStop.y;
        return Math.abs(dif_x) === Math.abs(dif_y) || dif_x === 0 || dif_y === 0;
    }
    $scope.setMode = function(m) {
        mode = m;
        if (mode === "build") {
            currentMarking = {
                id: 0
            };
            $scope.$watch("crw.words", function(newWords, oldWords) {
                var probe, shift_x = 0, shift_y = 0;
                angular.forEach(oldWords, function(word, id) {
                    if (!newWords[id]) {
                        markers.deleteMarking(id);
                    } else {
                        probe = id;
                    }
                });
                if (probe) {
                    shift_x = newWords[probe].start.x - oldWords[probe].start.x;
                    shift_y = newWords[probe].start.y - oldWords[probe].start.y;
                    if (shift_x !== 0 || shift_y !== 0) {
                        markers.shiftMarkers($scope.crw.words, shift_x, shift_y);
                    }
                }
            }, true);
        }
        if (mode === "solve") {
            var resetId = function() {
                var nextId = 0;
                angular.forEach($scope.crw.words, function(word, id) {
                    nextId = Math.max(nextId, id);
                });
                return nextId;
            };
            currentMarking = {
                id: resetId()
            };
            $scope.$watch("crw.solution", function(newWords, oldWords) {
                angular.forEach(oldWords, function(word, id) {
                    if (!newWords[id]) {
                        markers.deleteMarking(word.markingId);
                    }
                });
                var probe = false;
                angular.forEach(newWords, function(word, id) {
                    if (!oldWords[id]) {
                        markers.exchangeMarkers(word.fields, currentMarking.id, word.color);
                    }
                    probe = true;
                });
                if (!probe) {
                    currentMarking.id = resetId();
                }
            }, true);
        }
    };
    $scope.getMarks = function(line, column) {
        return markers.getMarks(column, line);
    };
    $scope.getImgClass = function(marker) {
        return [ marker.img, marker.marking.color ];
    };
    $scope.activate = function(row, col) {
        $scope.$broadcast("setFocus", row, col);
    };
    $scope.startMark = function() {
        isMarking = true;
        currentMarking = {
            id: currentMarking.id + 1
        };
        currentMarking.color = mode === "build" ? crossword.randomColor() : "grey";
    };
    $scope.stopMark = function() {
        isMarking = false;
        if (!angular.equals(currentMarking.start, currentMarking.stop)) {
            if (mode === "build") {
                crossword.setWord(currentMarking);
            } else {
                var word = crossword.probeWord(currentMarking);
                if (!word.solved) {
                    immediate.newPromise("falseWord", word).then(function() {
                        crossword.deleteWord(currentMarking.id, "solution");
                    });
                }
            }
        } else {
            markers.deleteMarking(currentMarking.id);
        }
    };
    $scope.intoField = function(row, col) {
        var newStop = {
            x: col,
            y: row
        };
        if (isMarking && currentMarking.start && validMarking(newStop)) {
            currentMarking.stop = newStop;
            markers.setNewMarkers(currentMarking);
        }
    };
    $scope.outofField = function(row, col) {
        if (isMarking && !currentMarking.start) {
            currentMarking.start = currentMarking.stop = {
                x: col,
                y: row
            };
            markers.setNewMarkers(currentMarking);
        }
    };
    $scope.type = function(event) {
        event.preventDefault();
        var key = event.charCode || event.keyCode || event.which;
        var keychar = String.fromCharCode(key);
        if (basics.letterRegEx().test(keychar)) {
            this.field.letter = keychar.toUpperCase();
        } else switch (key) {
          case 8:
          case 46:
            this.field.letter = null;
            break;

          case 37:
            if (this.column > 0) {
                this.activate(this.line, this.column - 1);
            }
            break;

          case 38:
            if (this.line > 0) {
                this.activate(this.line - 1, this.column);
            }
            break;

          case 39:
            if (this.column < this.row.length - 1) {
                this.activate(this.line, this.column + 1);
            }
            break;

          case 40:
            if (this.line < this.crw.content.length - 1) {
                this.activate(this.line + 1, this.column);
            }
            break;
        }
    };
} ]);

app.directive("cseContent", [ "basics", function(basics) {
    return {
        scope: {
            value: "="
        },
        template: '<img ng-src="' + basics.pluginPath + 'images/bullet-{{value}}.png">'
    };
} ]);

app.filter("joinWord", function() {
    return function(input) {
        var word = "";
        angular.forEach(input, function(val) {
            word += val.word.letter || "_";
        });
        return word;
    };
});

app.directive("crwInvalidWords", function() {
    return {
        template: '<p ng-pluralize count="invalidCount" when="{' + "'one': 'Das markierte Wort passt nicht mehr vollständig in das Rätselfeld. " + "Um die Größe anzupassen, muss es gelöscht werden.'," + "'other': 'Die markierten Wörter passen nicht mehr vollständig in das Rätselfeld. " + "Um die Größe anzupassen, müssen sie gelöscht werden.'}\"></p>" + '<p class="actions">' + '<button ng-click="deleteInvalid()">Löschen</button> ' + '<button ng-click="abortInvalid()">Abbrechen</button></p>'
    };
});

app.directive("crwSaveCrossword", function() {
    return {
        template: '<form name="uploader">' + "<p>Zum Speichern muss das Rätsel einen Namen erhalten (mindestens 4 Buchstaben):</p>" + '<p class="actions">' + '<input type="text" ng-model="crw.name" name="name" required="" ng-minlength="4"> ' + '<button ng-disabled="!uploader.name.$valid" ng-click="upload()">Speichern</button></p>' + '<p class="error" ng-show="uploader.name.$error.required">' + "Ein Name muss angegeben werden!</p>" + '<p class="error" ng-show="uploader.name.$error.minlength">' + "Der Name ist zu kurz!</p>" + '<p class="confirm" ng-show="uploader.name.$valid">' + "So geht's!</p>" + "</form>"
    };
});

app.directive("crwFalseWord", function() {
    return {
        template: "<p>Das markierte Wort ist kein Teil der Lösung.</p>" + '<p class="actions">' + '<button ng-click="deleteFalse()">Löschen</button></p>'
    };
});

app.controller("EntryController", [ "$scope", "$filter", "crossword", "basics", function($scope, $filter, crossword, basics) {
    $scope.colors = basics.colors;
    $scope.deleteWord = function(id) {
        crossword.deleteWord(id, "words");
    };
} ]);

app.controller("WordController", [ "$scope", "$sanitize", "crossword", "immediate", function($scope, $sanitize, crossword, immediate) {
    var deferred, highlight = [];
    $scope.crw = crossword.getCrossword();
    $scope.wordsToArray = function(words) {
        var arr = [];
        angular.forEach(words, function(item) {
            arr.push(item);
        });
        return arr;
    };
    $scope.randomize = function() {
        crossword.randomizeEmptyFields();
    };
    $scope.empty = function() {
        crossword.emptyAllFields();
    };
    $scope.load = function() {
        crossword.loadCrossword();
        $scope.crw = crossword.getCrossword();
    };
    $scope.save = function() {
        immediate.newPromise("saveCrossword").then(function() {
            $scope.crw.name = $sanitize($scope.crw.name);
            console.log(angular.toJson($scope.crw));
        }, angular.noop);
    };
    $scope.isHighlighted = function(id) {
        for (var i = 0; i < highlight.length; i++) {
            if (highlight[i] === id) {
                return true;
            }
        }
        return false;
    };
    immediate.register("invalidWords", function(invalidDeferred, critical) {
        deferred = invalidDeferred;
        highlight = critical;
        $scope.invalidCount = critical.length;
        $scope.immediate = "invalidWords";
    });
    $scope.deleteInvalid = function() {
        $scope.immediate = null;
        deferred.resolve();
        highlight = [];
    };
    $scope.abortInvalid = function() {
        $scope.immediate = null;
        highlight = [];
        deferred.reject();
    };
    immediate.register("falseWord", function(falseDeferred, word) {
        deferred = falseDeferred;
        highlight = [ word.id ];
        $scope.immediate = "falseWord";
    });
    $scope.deleteFalse = function() {
        $scope.immediate = null;
        deferred.resolve();
        highlight = [];
    };
    immediate.register("saveCrossword", function(saveDeferred) {
        deferred = saveDeferred;
        $scope.immediate = "saveCrossword";
    });
    $scope.upload = function() {
        $scope.immediate = null;
        deferred.resolve();
    };
} ]);