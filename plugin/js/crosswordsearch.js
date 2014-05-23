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
            scope.$watch("visible", function(newVisible) {
                if (newVisible) {
                    $document.bind("click", elementHide);
                } else {
                    $document.unbind("click", elementHide);
                }
            });
            element.on("$destroy", function() {
                $document.unbind("click", elementHide);
            });
        }
    };
} ]);

customSelectElement.directive("cseSelect", function() {
    return {
        restrict: "A",
        scope: {
            options: "=cseOptions",
            model: "=cseModel",
            cseTemplate: "="
        },
        link: function(scope, element, attrs) {
            scope.select = function(opt) {
                scope.model = opt;
            };
        },
        template: function(tElement, tAttr) {
            return '<dt cse-outside-hide ng-init="visible=false">' + '<a href="" ng-click="visible=!visible"><div ng-show="!!(model)" ' + tAttr.cseTemplate + ' value="model">' + "</div></a></dt>" + '<dd ng-show="visible"><ul>' + '<li ng-repeat="opt in options"><a href="" ng-click="select(opt)" ' + tAttr.cseTemplate + ' value="opt">' + "</a></li>" + "</ul></dd>";
        }
    };
});

var crwApp = angular.module("crwApp", [ "ngSanitize", "qantic.angularjs.stylemodel", "customSelectElement" ]);

crwApp.factory("reduce", function() {
    return function(array, initial, func) {
        angular.forEach(array, function(value, key) {
            initial = func.apply(value, [ initial, value, key ]);
        });
        return initial;
    };
});

crwApp.factory("basics", [ "reduce", function(reduce) {
    var total = 0;
    var list = reduce(crwBasics.letterDist, "", function(result, value, key) {
        total += value;
        for (var i = 0; i < value; i++) {
            result += key;
        }
        return result;
    });
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
        }
    };
} ]);

crwApp.factory("crosswordFactory", [ "$http", "$q", "basics", "reduce", function($http, $q, basics, reduce) {
    $http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
    $http.defaults.transformRequest = jQuery.param;
    var httpDefaults = {
        method: "POST",
        url: crwBasics.ajaxUrl
    };
    function Crw() {
        var crossword = {};
        var project = "";
        var addRows = function(number, top) {
            if (number > 0) {
                for (var i = 0; i < number; i++) {
                    var row = [];
                    addFields(row, crossword.size.width, false);
                    if (top) {
                        crossword.table.unshift(row);
                    } else {
                        crossword.table.push(row);
                    }
                }
            } else {
                crossword.table.splice(top ? 0 : crossword.table.length + number, -number);
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
            for (var i = 0; i < crossword.table.length; i++) {
                addFields(crossword.table[i], number, left);
            }
            if (left) {
                angular.forEach(crossword.words, function(word) {
                    word.start.x += number;
                    word.stop.x += number;
                });
            }
        };
        var forAllFields = function(func) {
            angular.forEach(crossword.table, function(line, row) {
                angular.forEach(line, function(field, col) {
                    func.call(field, row, col);
                });
            });
        };
        this.getCrosswordData = function() {
            return crossword;
        };
        var serverError = function(response) {
            return $q.reject({
                error: "server error",
                debug: "status " + response.status
            });
        };
        var phpError = function(response) {
            if (typeof response.data !== "object") {
                return {
                    error: "malformed request"
                };
            }
            if (response.data.error) {
                return response.data;
            }
            return false;
        };
        this.setProject = function(p) {
            project = p;
        };
        this.loadDefault = function() {
            angular.extend(crossword, {
                name: "",
                size: {
                    width: 10,
                    height: 10
                },
                table: [],
                words: {},
                solution: {}
            });
            addRows(crossword.size.height, false);
        };
        this.loadCrosswordData = function(name) {
            return $http(angular.extend({
                data: {
                    action: "get_crossword",
                    project: project,
                    name: name
                }
            }, httpDefaults)).then(function(response) {
                var error = phpError(response);
                if (error) {
                    return $q.reject(error);
                }
                angular.extend(crossword, response.data);
            }, serverError);
        };
        this.saveCrosswordData = function(name) {
            return $http(angular.extend({
                data: {
                    action: "set_crossword",
                    name: name,
                    project: project,
                    crossword: angular.toJson(crossword)
                }
            }, httpDefaults)).then(function(response) {
                var error = phpError(response);
                if (error) {
                    return $q.reject(error);
                }
                return true;
            }, serverError);
        };
        this.setName = function(str) {
            crossword.name = str;
        };
        this.getHighId = function() {
            return reduce(crossword.words, 0, function(result, word) {
                return Math.max(result, word.ID);
            });
        };
        this.randomColor = function() {
            var highID = this.getHighId();
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
                field.word = crossword.table[field.y][field.x];
            });
            return crossword.words[marking.ID] = marking;
        };
        this.probeWord = function(marking) {
            var entry = marking;
            angular.forEach(entry.fields, function(field) {
                field.word = crossword.table[field.y][field.x];
            });
            entry.solved = false;
            angular.forEach(crossword.words, function(word) {
                if (angular.equals(word.start, entry.start) && angular.equals(word.stop, entry.stop)) {
                    entry = word;
                    word.solved = true;
                }
            });
            entry.markingId = marking.ID;
            return crossword.solution[entry.ID] = entry;
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
                markers[x][y][marking.ID] = {
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
            this.deleteMarking(marking.ID);
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
        this.redrawMarkers = function(markings, shift_x, shift_y) {
            angular.forEach(markings, function(marking) {
                var from = marking.start, to = marking.stop;
                var swap = to.x < from.x || to.x === from.x && to.y < from.y;
                this.deleteMarking(marking.ID);
                angular.forEach(marking.fields, function(field) {
                    field.x += shift_x || 0;
                    field.y += shift_y || 0;
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
    $scope.highlight = [];
    $scope.prepare = function(project, name, namesList) {
        $scope.crw.setProject(project);
        if (namesList) {
            $scope.namesInProject = angular.fromJson(namesList);
        }
        $scope.load(name);
    };
    $scope.wordsToArray = function(words) {
        var arr = [];
        angular.forEach(words, function(item) {
            arr.push(item);
        });
        return arr;
    };
    $scope.setHighlight = function(h) {
        $scope.highlight = h;
    };
    $scope.load = function(name) {
        $scope.loadError = null;
        if (name) {
            $scope.crw.loadCrosswordData(name).then(function() {
                $scope.loadedName = name;
                $scope.crosswordData = $scope.crw.getCrosswordData();
            }, function(error) {
                if (error) {
                    $scope.loadError = error;
                }
            });
        } else {
            $scope.crw.loadDefault();
            $scope.loadedName = name;
            $scope.crosswordData = $scope.crw.getCrosswordData();
        }
    };
    $scope.restart = function() {
        $scope.crosswordData.solution = {};
    };
    $scope.save = function() {
        $scope.immediateStore.newPromise("saveCrossword");
    };
    $scope.randomize = function() {
        $scope.crw.randomizeEmptyFields();
    };
    $scope.empty = function() {
        $scope.crw.emptyAllFields();
    };
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
    var isMarking = false, currentMarking, mode, lastName;
    var markers = markerFactory.getMarkers();
    function validMarking(newStop) {
        var dif_x = currentMarking.start.x - newStop.x, dif_y = currentMarking.start.y - newStop.y;
        return Math.abs(dif_x) === Math.abs(dif_y) || dif_x === 0 || dif_y === 0;
    }
    $scope.setMode = function(m) {
        mode = m;
        currentMarking = {
            ID: $scope.crw.getHighId()
        };
        if (mode === "build") {
            markers.redrawMarkers($scope.crosswordData.words);
            lastName = $scope.crosswordData.name;
            $scope.$watch("crosswordData.words", function(newWords, oldWords) {
                var probe, shift_x = 0, shift_y = 0;
                if ($scope.crosswordData.name !== lastName) {
                    markers.redrawMarkers(newWords);
                    lastName = $scope.crosswordData.name;
                } else {
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
                            markers.redrawMarkers($scope.crosswordData.words, shift_x, shift_y);
                        }
                    }
                }
            }, true);
        }
        if (mode === "solve") {
            $scope.$watch("crosswordData.solution", function(newWords, oldWords) {
                angular.forEach(oldWords, function(word, id) {
                    if (!newWords[id]) {
                        markers.deleteMarking(word.markingId);
                    }
                });
                var probe = false;
                angular.forEach(newWords, function(word, id) {
                    if (!oldWords[id]) {
                        markers.exchangeMarkers(word.fields, currentMarking.ID, word.color);
                    }
                    probe = true;
                });
                if (!probe) {
                    currentMarking.ID = $scope.crw.getHighId();
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
            ID: currentMarking.ID + 1
        };
        currentMarking.color = mode === "build" ? $scope.crw.randomColor() : "grey";
    };
    $scope.stopMark = function() {
        if (!isMarking) {
            return;
        }
        isMarking = false;
        if (!angular.equals(currentMarking.start, currentMarking.stop)) {
            if (mode === "build") {
                $scope.crw.setWord(currentMarking);
            } else {
                var word = $scope.crw.probeWord(currentMarking);
                if (!word.solved) {
                    $scope.immediateStore.newPromise("falseWord", word).then(function() {
                        $scope.crw.deleteWord(currentMarking.ID, "solution");
                    });
                }
            }
        } else {
            markers.deleteMarking(currentMarking.ID);
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
            if (this.line < this.crosswordData.table.length - 1) {
                this.activate(this.line + 1, this.column);
            }
            break;
        }
    };
} ]);

crwApp.directive("colorSelect", [ "basics", function(basics) {
    return {
        scope: {
            value: "="
        },
        template: '<img ng-src="' + basics.pluginPath + 'images/bullet-{{value}}.png">'
    };
} ]);

crwApp.filter("joinWord", [ "reduce", function(reduce) {
    return function(input) {
        return reduce(input, "", function(result, value) {
            return result + (value.word.letter || "_");
        });
    };
} ]);

crwApp.controller("EntryController", [ "$scope", "$filter", "basics", function($scope, $filter, basics) {
    $scope.colors = basics.colors;
    $scope.isHighlighted = function() {
        for (var i = 0; i < $scope.highlight.length; i++) {
            if ($scope.highlight[i] === $scope.word.ID) {
                return true;
            }
        }
        return false;
    };
    $scope.deleteWord = function(id) {
        $scope.crw.deleteWord(id, "words");
    };
    $scope.localizeDirection = basics.localize;
} ]);

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

crwApp.directive("crwSaneInput", [ "$sanitize", function($sanitize) {
    return {
        require: "ngModel",
        link: function(scope, element, attrs, ctrl) {
            ctrl.$parsers.unshift(function(viewValue) {
                viewValue = viewValue.replace(/\s+/, " ");
                var sanitized = viewValue.replace(/<|%[a-f0-9]{2}/, "");
                sanitized = $sanitize(sanitized);
                if (sanitized === viewValue) {
                    ctrl.$setValidity("sane", true);
                    return viewValue;
                } else {
                    ctrl.$setValidity("sane", false);
                    return undefined;
                }
            });
        }
    };
} ]);

crwApp.controller("ImmediateController", [ "$scope", function($scope) {
    var deferred;
    $scope.immediate = null;
    $scope.finish = function(resolution) {
        $scope.setHighlight([]);
        $scope.immediate = null;
        if (resolution) {
            deferred.resolve();
        } else {
            deferred.reject();
        }
    };
    $scope.immediateStore.register("invalidWords", function(invalidDeferred, critical) {
        deferred = invalidDeferred;
        $scope.setHighlight(critical);
        $scope.invalidCount = critical.length;
        $scope.immediate = "invalidWords";
    });
    $scope.immediateStore.register("falseWord", function(falseDeferred, word) {
        deferred = falseDeferred;
        $scope.setHighlight([ word.ID ]);
        $scope.immediate = "falseWord";
    });
    $scope.immediateStore.register("saveCrossword", function(saveDeferred) {
        deferred = saveDeferred;
        $scope.immediate = "saveCrossword";
    });
    $scope.upload = function() {
        $scope.crw.saveCrosswordData($scope.crosswordData.name).then($scope.finish, function(error) {
            $scope.saveError = error.error;
            $scope.saveDebug = error.debug;
        });
    };
} ]);