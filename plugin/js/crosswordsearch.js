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

var crwApp = angular.module("crwApp", [ "ngSanitize", "qantic.angularjs.stylemodel", "customSelectElement" ]);

crwApp.factory("basics", function() {
    return {
        colors: [ "black", "red", "green", "blue", "orange", "violet", "aqua" ],
        pluginPath: crwBasics.pluginPath,
        randomColor: function(last) {
            var color;
            do {
                color = this.colors[Math.floor(Math.random() * 7)];
            } while (color === last);
            return color;
        },
        randomLetter: function() {
            var list = "", total = 0;
            angular.forEach(crwBasics.letterDist, function(val, key) {
                total += val;
                for (var i = 0; i < val; i++) {
                    list += key;
                }
            });
            var pos = Math.floor(Math.random() * total);
            return list.slice(pos, pos + 1);
        },
        letterRegEx: new RegExp(crwBasics.letterRegEx),
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
        localize: function(str) {
            return crwBasics.locale[str] || str;
        },
        testCrossword: '{"name":"test","size":{"width":10,"height":7},"table":[[{"letter":"V"},{"letter":"N"},{"letter":"N"},{"letter":"C"},{"letter":"G"},{"letter":"L"},{"letter":"D"},{"letter":"S"},{"letter":"E"},{"letter":"Y"}],[{"letter":"M"},{"letter":"E"},{"letter":"R"},{"letter":"K"},{"letter":"U"},{"letter":"R"},{"letter":"N"},{"letter":"A"},{"letter":"M"},{"letter":"E"}],[{"letter":"T"},{"letter":"P"},{"letter":"N"},{"letter":"J"},{"letter":"U"},{"letter":"P"},{"letter":"I"},{"letter":"T"},{"letter":"E"},{"letter":"R"}],[{"letter":"D"},{"letter":"T"},{"letter":"N"},{"letter":"U"},{"letter":"R"},{"letter":"A"},{"letter":"N"},{"letter":"U"},{"letter":"S"},{"letter":"D"}],[{"letter":"W"},{"letter":"U"},{"letter":"D"},{"letter":"S"},{"letter":"S"},{"letter":"E"},{"letter":"B"},{"letter":"R"},{"letter":"F"},{"letter":"E"}],[{"letter":"E"},{"letter":"N"},{"letter":"N"},{"letter":"O"},{"letter":"S"},{"letter":"I"},{"letter":"A"},{"letter":"N"},{"letter":"E"},{"letter":"C"}],[{"letter":"E"},{"letter":"E"},{"letter":"I"},{"letter":"S"},{"letter":"G"},{"letter":"M"},{"letter":"D"},{"letter":"E"},{"letter":"N"},{"letter":"H"}]],"words":{"2":{"id":2,"color":"orange","stop":{"x":0,"y":5},"start":{"x":4,"y":5},"fields":[{"x":4,"y":5,"word":{"letter":"S"}},{"x":3,"y":5,"word":{"letter":"O"}},{"x":2,"y":5,"word":{"letter":"N"}},{"x":1,"y":5,"word":{"letter":"N"}},{"x":0,"y":5,"word":{"letter":"E"}}],"direction":"left"},"3":{"id":3,"color":"violet","stop":{"x":5,"y":1},"start":{"x":0,"y":1},"fields":[{"x":0,"y":1,"word":{"letter":"M"}},{"x":1,"y":1,"word":{"letter":"E"}},{"x":2,"y":1,"word":{"letter":"R"}},{"x":3,"y":1,"word":{"letter":"K"}},{"x":4,"y":1,"word":{"letter":"U"}},{"x":5,"y":1,"word":{"letter":"R"}}],"direction":"right"},"4":{"id":4,"color":"green","stop":{"x":4,"y":4},"start":{"x":0,"y":0},"fields":[{"x":0,"y":0,"word":{"letter":"V"}},{"x":1,"y":1,"word":{"letter":"E"}},{"x":2,"y":2,"word":{"letter":"N"}},{"x":3,"y":3,"word":{"letter":"U"}},{"x":4,"y":4,"word":{"letter":"S"}}],"direction":"down-right"},"5":{"id":5,"color":"aqua","stop":{"x":9,"y":4},"start":{"x":9,"y":1},"fields":[{"x":9,"y":1,"word":{"letter":"E"}},{"x":9,"y":2,"word":{"letter":"R"}},{"x":9,"y":3,"word":{"letter":"D"}},{"x":9,"y":4,"word":{"letter":"E"}}],"direction":"down"},"6":{"id":6,"color":"black","stop":{"x":8,"y":3},"start":{"x":5,"y":6},"fields":[{"x":5,"y":6,"word":{"letter":"M"}},{"x":6,"y":5,"word":{"letter":"A"}},{"x":7,"y":4,"word":{"letter":"R"}},{"x":8,"y":3,"word":{"letter":"S"}}],"direction":"up-right"},"7":{"id":7,"color":"blue","stop":{"x":9,"y":2},"start":{"x":3,"y":2},"fields":[{"x":3,"y":2,"word":{"letter":"J"}},{"x":4,"y":2,"word":{"letter":"U"}},{"x":5,"y":2,"word":{"letter":"P"}},{"x":6,"y":2,"word":{"letter":"I"}},{"x":7,"y":2,"word":{"letter":"T"}},{"x":8,"y":2,"word":{"letter":"E"}},{"x":9,"y":2,"word":{"letter":"R"}}],"direction":"right"},"8":{"id":8,"color":"red","stop":{"x":7,"y":5},"start":{"x":7,"y":0},"fields":[{"x":7,"y":0,"word":{"letter":"S"}},{"x":7,"y":1,"word":{"letter":"A"}},{"x":7,"y":2,"word":{"letter":"T"}},{"x":7,"y":3,"word":{"letter":"U"}},{"x":7,"y":4,"word":{"letter":"R"}},{"x":7,"y":5,"word":{"letter":"N"}}],"direction":"down"},"9":{"id":9,"color":"violet","stop":{"x":8,"y":3},"start":{"x":3,"y":3},"fields":[{"x":3,"y":3,"word":{"letter":"U"}},{"x":4,"y":3,"word":{"letter":"R"}},{"x":5,"y":3,"word":{"letter":"A"}},{"x":6,"y":3,"word":{"letter":"N"}},{"x":7,"y":3,"word":{"letter":"U"}},{"x":8,"y":3,"word":{"letter":"S"}}],"direction":"right"},"10":{"id":10,"color":"aqua","stop":{"x":1,"y":5},"start":{"x":1,"y":0},"fields":[{"x":1,"y":0,"word":{"letter":"N"}},{"x":1,"y":1,"word":{"letter":"E"}},{"x":1,"y":2,"word":{"letter":"P"}},{"x":1,"y":3,"word":{"letter":"T"}},{"x":1,"y":4,"word":{"letter":"U"}},{"x":1,"y":5,"word":{"letter":"N"}}],"direction":"down"}}}'
    };
});

crwApp.factory("qStore", [ "$q", function($q) {
    function Store() {
        var store = {};
        this.register = function(name, callback) {
            if (!store[name]) {
                store[name] = [];
            }
            store[name].push(callback);
        };
        this.newPromise = function(name, arg) {
            var deferred = $q.defer();
            if (store[name]) {
                angular.forEach(store[name], function(callback) {
                    callback(deferred, arg);
                });
            }
            return deferred.promise;
        };
    }
    return {
        addStore: function() {
            return new Store();
        }
    };
} ]);

crwApp.factory("crosswordFactory", [ "basics", function(basics) {
    function Crw() {
        var addRows = function(number, top) {
            if (number > 0) {
                for (var i = 0; i < number; i++) {
                    var row = [];
                    addFields(row, crossword.size.width, false);
                    if (top) {
                        crossword.content.unshift(row);
                    } else {
                        crossword.content.push(row);
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
                    var field = {
                        letter: null
                    };
                    if (left) {
                        row.unshift(field);
                    } else {
                        row.push(field);
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
        addRows(crossword.size.height, false);
        this.getCrosswordData = function() {
            return crossword;
        };
        this.loadCrosswordData = function(json) {
            var obj = angular.fromJson(json || basics.testCrossword);
            crossword.name = obj.name;
            crossword.size = obj.size;
            crossword.words = obj.words;
            crossword.content = obj.table;
            crossword.solution = {};
        };
        this.setName = function(str) {
            crossword.name = str;
        };
        this.randomColor = function() {
            var highID = 0;
            angular.forEach(crossword.words, function(word) {
                if (word.id > highID) {
                    highID = word.id;
                }
            });
            return basics.randomColor(highID > 0 ? crossword.words[highID].color : undefined);
        };
        this.deleteWord = function(id, target) {
            if (crossword[target][id]) {
                delete crossword[target][id];
            }
        };
        this.randomizeEmptyFields = function() {
            forAllFields(function() {
                if (!this.letter) {
                    this.letter = basics.randomLetter("german");
                }
            });
        };
        this.emptyAllFields = function() {
            forAllFields(function() {
                this.letter = null;
            });
        };
        this.setWord = function(marking) {
            angular.forEach(marking.fields, function(field) {
                field.word = crossword.content[field.y][field.x];
            });
            return crossword.words[marking.id] = marking;
        };
        this.probeWord = function(marking) {
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
        };
        this.testWordBoundaries = function(change) {
            var critical = [];
            angular.forEach(crossword.words, function(word, id) {
                if (Math.min(word.start.x, word.stop.x) < -change.left || Math.max(word.start.x, word.stop.x) >= crossword.size.width + change.right || Math.min(word.start.y, word.stop.y) < -change.top || Math.max(word.start.y, word.stop.y) >= crossword.size.height + change.bottom) {
                    critical.push(parseInt(id, 10));
                }
            });
            return critical;
        };
        this.changeSize = function(change, critical) {
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
        };
    }
    return {
        getCrw: function() {
            return new Crw();
        }
    };
} ]);

crwApp.factory("markerFactory", [ "basics", function(basics) {
    function Markers() {
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
        this.setNewMarkers = function(marking) {
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
        };
        this.exchangeMarkers = function(fields, id, color) {
            angular.forEach(fields, function(field) {
                markers[field.x][field.y][id].marking.color = color;
            });
        };
        this.shiftMarkers = function(markings, shift_x, shift_y) {
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
        };
        this.getMarks = function(x, y) {
            if (markers[x] == null || y == null) {
                return undefined;
            }
            return markers[x][y];
        };
        this.deleteMarking = function(id) {
            angular.forEach(markers, function(x) {
                angular.forEach(x, function(y) {
                    delete y[id];
                });
            });
        };
        this.deleteAllMarking = function() {
            markers = {};
        };
    }
    return {
        getMarkers: function() {
            return new Markers();
        }
    };
} ]);

crwApp.controller("CrosswordController", [ "$scope", "qStore", "crosswordFactory", function($scope, qStore, crosswordFactory) {
    $scope.crw = crosswordFactory.getCrw();
    $scope.immediateStore = qStore.addStore();
} ]);

crwApp.controller("SizeController", [ "$scope", "$document", "basics", "StyleModelContainer", function($scope, $document, basics, StyleModelContainer) {
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
    $scope.crosswordData = $scope.crw.getCrosswordData();
    StyleModelContainer.add("size-left", -Infinity, ($scope.crosswordData.size.height - 3) * size + 1, 0, 0);
    StyleModelContainer.add("size-top", 0, 0, -Infinity, ($scope.crosswordData.size.width - 3) * size + 1);
    StyleModelContainer.add("size-right", 5 * size + 1, Infinity, 0, 0);
    StyleModelContainer.add("size-bottom", 0, 0, 5 * size + 1, Infinity);
    $scope.modLeft = StyleModelContainer.get("size-left");
    $scope.modTop = StyleModelContainer.get("size-top");
    $scope.modRight = StyleModelContainer.get("size-right");
    $scope.modBottom = StyleModelContainer.get("size-bottom");
    resetSizes($scope.crosswordData.size.width, $scope.crosswordData.size.height);
    $scope.$watch("crosswordData.size", function(newSize) {
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
            var critical = $scope.crw.testWordBoundaries(change);
            if (critical.length) {
                $scope.immediateStore.newPromise("invalidWords", critical).then(function() {
                    $scope.crw.changeSize(change, critical);
                }, function() {
                    resetSizes(currentSize.right + currentSize.left, currentSize.bottom + currentSize.top);
                });
            } else {
                $scope.$apply($scope.crw.changeSize(change, critical));
            }
        }
        $document.unbind("mouseup", stopResize);
    };
} ]);

crwApp.directive("crwSetFocus", function() {
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

crwApp.directive("crwCatchDragging", [ "$document", function($document) {
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

crwApp.directive("crwIndexChecker", function() {
    return {
        link: function(scope, element, attrs) {
            scope.$watch("$index", function(newIndex) {
                scope[attrs.crwIndexChecker] = newIndex;
            });
        }
    };
});

crwApp.controller("TableController", [ "$scope", "basics", "markerFactory", function($scope, basics, markerFactory) {
    var isMarking = false, currentMarking, mode;
    var markers = markerFactory.getMarkers();
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
            $scope.$watch("crosswordData.words", function(newWords, oldWords) {
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
                        markers.shiftMarkers($scope.crosswordData.words, shift_x, shift_y);
                    }
                }
            }, true);
        }
        if (mode === "solve") {
            var resetId = function() {
                var nextId = 0;
                angular.forEach($scope.crosswordData.words, function(word, id) {
                    nextId = Math.max(nextId, id);
                });
                return nextId;
            };
            currentMarking = {
                id: resetId()
            };
            $scope.$watch("crosswordData.solution", function(newWords, oldWords) {
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
        currentMarking.color = mode === "build" ? $scope.crw.randomColor() : "grey";
    };
    $scope.stopMark = function() {
        isMarking = false;
        if (!angular.equals(currentMarking.start, currentMarking.stop)) {
            if (mode === "build") {
                $scope.crw.setWord(currentMarking);
            } else {
                var word = $scope.crw.probeWord(currentMarking);
                if (!word.solved) {
                    $scope.immediateStore.newPromise("falseWord", word).then(function() {
                        $scope.crw.deleteWord(currentMarking.id, "solution");
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
        if (basics.letterRegEx.test(keychar)) {
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
            if (this.line < this.crosswordData.content.length - 1) {
                this.activate(this.line + 1, this.column);
            }
            break;
        }
    };
} ]);

crwApp.directive("cseContent", [ "basics", function(basics) {
    return {
        scope: {
            value: "="
        },
        template: '<img ng-src="' + basics.pluginPath + 'images/bullet-{{value}}.png">'
    };
} ]);

crwApp.filter("joinWord", function() {
    return function(input) {
        var word = "";
        angular.forEach(input, function(val) {
            word += val.word.letter || "_";
        });
        return word;
    };
});

crwApp.controller("EntryController", [ "$scope", "$filter", "basics", function($scope, $filter, basics) {
    $scope.colors = basics.colors;
    $scope.deleteWord = function(id) {
        $scope.crw.deleteWord(id, "words");
    };
    $scope.localizeDirection = basics.localize;
} ]);

crwApp.controller("WordController", [ "$scope", "$sanitize", function($scope, $sanitize) {
    var deferred, highlight = [];
    $scope.crosswordData = $scope.crw.getCrosswordData();
    $scope.wordsToArray = function(words) {
        var arr = [];
        angular.forEach(words, function(item) {
            arr.push(item);
        });
        return arr;
    };
    $scope.randomize = function() {
        $scope.crw.randomizeEmptyFields();
    };
    $scope.empty = function() {
        $scope.crw.emptyAllFields();
    };
    $scope.load = function() {
        $scope.crw.loadCrosswordData();
    };
    $scope.save = function() {
        $scope.immediateStore.newPromise("saveCrossword").then(function() {
            $scope.crosswordData.name = $sanitize($scope.crosswordData.name);
            console.log(angular.toJson($scope.crosswordData));
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
    $scope.immediateStore.register("invalidWords", function(invalidDeferred, critical) {
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
    $scope.immediateStore.register("falseWord", function(falseDeferred, word) {
        deferred = falseDeferred;
        highlight = [ word.id ];
        $scope.immediate = "falseWord";
    });
    $scope.deleteFalse = function() {
        $scope.immediate = null;
        deferred.resolve();
        highlight = [];
    };
    $scope.immediateStore.register("saveCrossword", function(saveDeferred) {
        deferred = saveDeferred;
        $scope.immediate = "saveCrossword";
    });
    $scope.upload = function() {
        $scope.immediate = null;
        deferred.resolve();
    };
} ]);