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
var customSelectElement = angular.module("customSelectElement", []);

customSelectElement.directive("cseDefault", function() {
    return {
        scope: {
            value: "="
        },
        template: function(tElement, tAttr) {
            return "{{" + (tAttr.cseDefault || "value.value || value") + "}}";
        }
    };
});

customSelectElement.directive("cseOption", [ "$compile", function($compile) {
    return {
        scope: {
            value: "="
        },
        link: function(scope, element, attrs) {
            scope.select = function(value) {
                scope.$emit("cseSelect", attrs.name, value);
            };
            attrs.$observe("value", function() {
                var html;
                if (angular.isObject(scope.value) && scope.value.group) {
                    html = '<dl cse-select="' + attrs.name + '.sub" cse-model="head" cse-options="value.group" is-group ';
                    if (angular.isDefined(attrs.expr)) {
                        html += 'display="' + attrs.expr + '"';
                    } else {
                        html += 'template="' + attrs.templ + '"';
                    }
                    if (angular.isDefined(attrs.isMenu)) {
                        html += ' is-menu="' + scope.value.menu + '"';
                    }
                    html += "></dl>";
                    element.html(html);
                } else {
                    html = "<div ng-click=";
                    if (angular.isObject(scope.value) && angular.isDefined(scope.value.value)) {
                        html += '"select(value.value)" ';
                    } else {
                        html += '"select(value)" ';
                    }
                    html += attrs.templ;
                    if (angular.isDefined(attrs.expr)) {
                        html += '="' + attrs.expr + '"';
                    }
                    html += ' value="value"></div>';
                    element.html(html);
                }
                $compile(element.contents())(scope);
            });
        }
    };
} ]);

customSelectElement.directive("cseSelect", [ "$document", "$timeout", function($document, $timeout) {
    return {
        restrict: "A",
        scope: {
            options: "=cseOptions",
            model: "=cseModel"
        },
        link: function(scope, element, attrs) {
            var delayed;
            element.addClass("cse select");
            scope.isDefined = angular.isDefined;
            if (angular.isDefined(attrs.isMenu)) {
                scope.model = attrs.isMenu;
                scope.setModel = false;
            } else {
                scope.setModel = true;
            }
            scope.visible = false;
            scope.$watch("visible", function(newVisible) {
                if (newVisible) {
                    $document.bind("click", elementHideClick);
                } else {
                    $document.unbind("click", elementHideClick);
                }
            });
            scope.hideLeave = function() {
                delayed = $timeout(function() {
                    scope.visible = false;
                }, 200);
            };
            scope.showEnter = function() {
                scope.visible = true;
                if (delayed) {
                    $timeout.cancel(delayed);
                }
            };
            element.on("$destroy", function() {
                $document.unbind("click", elementHideClick);
                if (delayed) {
                    $timeout.cancel(delayed);
                }
            });
            scope.$on("cseSelect", function(event, name, opt) {
                scope.visible = false;
                if (scope.setModel) {
                    scope.model = opt;
                }
            });
            function elementHideClick(event) {
                var clicked = angular.element(event.target);
                do {
                    if (elementEquals(clicked, element)) {
                        return;
                    }
                    clicked = clicked.parent();
                } while (clicked.length && !elementEquals($document, clicked));
                scope.$apply("visible = false");
            }
            function elementEquals(el1, el2) {
                return el1[0] === el2[0];
            }
        },
        template: function(tElement, tAttr) {
            var templ = "cse-default", isExpression = false;
            if (angular.isDefined(tAttr.template)) {
                templ = tAttr.template;
            } else if (angular.isDefined(tAttr.display)) {
                isExpression = true;
            }
            var html = "<dt ";
            if (angular.isDefined(tAttr.isGroup)) {
                html += 'ng-mouseenter="showEnter()" ng-mouseleave="hideLeave()"';
            } else {
                html += 'ng-click="visible=!visible"';
            }
            html += '><div ng-show="isDefined(model)" ' + templ;
            if (isExpression) {
                html += '="' + tAttr.display + '"';
            }
            html += ' value="model" is-current></div><a class="btn"></a></dt><dd';
            if (angular.isDefined(tAttr.isGroup)) {
                html += ' ng-mouseenter="showEnter()" ng-mouseleave="hideLeave()"';
            }
            html += ' ng-show="visible"><ul>' + "<li ng-repeat=\"opt in options | orderBy:'order'\" " + 'cse-option name="' + tAttr.cseSelect + '" model="' + tAttr.cseModel + '" value="opt" templ="' + templ + '"';
            if (isExpression) {
                html += ' expr="' + tAttr.display + '"';
            }
            if (angular.isDefined(tAttr.isMenu)) {
                html += " is-menu";
            }
            html += "></li></ul></dd>";
            return html;
        }
    };
} ]);

var crwApp = angular.module("crwApp", [ "ngRoute", "qantic.angularjs.stylemodel", "customSelectElement" ]);

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
        textIsLTR: crwBasics.textDirection !== "rtl",
        dimensions: crwBasics.dimensions,
        imagesPath: crwBasics.imagesPath,
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

crwApp.factory("crosswordFactory", [ "basics", "reduce", "ajaxFactory", function(basics, reduce, ajaxFactory) {
    function Crw() {
        var crwId = ajaxFactory.getId();
        var crwContext = "crossword" + crwId, editContext = "edit" + crwId;
        var crossword = {};
        var stdLevel = 1;
        var maxLevel = 3;
        var namesList = [];
        var project = "";
        var restricted = false;
        var count = {
            words: 0,
            solution: 0
        };
        var _loadDefault = function() {
            angular.extend(crossword, {
                name: "",
                description: "",
                author: "",
                size: {
                    width: 10,
                    height: 10
                },
                table: [],
                words: {},
                solution: {},
                level: stdLevel
            });
            addRows(crossword.size.height, false);
        };
        var _getLevelRestriction = function(restriction) {
            switch (restriction) {
              case "dir":
                return !(crossword.level & 1);

              case "sol":
                return !(crossword.level & 2);
            }
        };
        var _setWord = function(marking) {
            var exists = false;
            angular.forEach(crossword.words, function(word) {
                if (angular.equals(word.start, marking.start) && angular.equals(word.stop, marking.stop) && word.ID !== marking.ID) {
                    exists = true;
                }
            });
            if (exists) {
                return false;
            }
            angular.forEach(marking.fields, function(field) {
                field.word = crossword.table[field.y][field.x];
            });
            return crossword.words[marking.ID] = marking;
        };
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
        this.getNamesList = function() {
            return namesList;
        };
        this.getLevelList = function() {
            var list = [];
            for (var i = 0; i <= maxLevel; i++) {
                list.push(i);
            }
            return list;
        };
        this.setProject = function(p, nc, ne, r) {
            project = p;
            restricted = r;
            if (nc) {
                ajaxFactory.setNonce(nc, crwContext);
            }
            if (ne) {
                ajaxFactory.setNonce(ne, editContext);
            }
        };
        this.loadDefault = _loadDefault;
        function onLoaded(data) {
            stdLevel = data.default_level;
            maxLevel = data.maximum_level;
            namesList = data.namesList;
            if (angular.isObject(data.crossword)) {
                angular.extend(crossword, data.crossword);
                if (_getLevelRestriction("sol")) {
                    crossword.solution = angular.copy(crossword.words);
                }
            } else {
                _loadDefault();
            }
            count.words = 0;
            count.solution = 0;
            angular.forEach(crossword.words, function(word) {
                count.words++;
                _setWord(word);
            });
            return true;
        }
        this.loadCrosswordData = function(name) {
            return ajaxFactory.http({
                action: "get_crossword",
                project: project,
                name: name,
                restricted: restricted + 0
            }, crwContext).then(onLoaded);
        };
        this.getCount = function() {
            return count;
        };
        this.saveCrosswordData = function(name, action, username, password) {
            crossword.solution = {};
            var content = {
                action: "save_crossword",
                method: action,
                project: project,
                restricted: restricted + 0,
                crossword: angular.toJson(crossword),
                username: username,
                password: password
            };
            if (action === "update") {
                content.old_name = name;
                content.name = crossword.name;
            } else {
                content.name = name;
            }
            return ajaxFactory.http(content, editContext).then(function(data) {
                namesList = data.namesList;
                return true;
            });
        };
        this.submitSolution = function(time, username, password) {
            return ajaxFactory.http({
                action: "submit_solution",
                project: project,
                name: crossword.name,
                time: time,
                solved: count.solution,
                total: count.words,
                username: username,
                password: password
            }, crwContext).then(function(data) {
                return data.submitted.toString();
            });
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
                    this.letter = basics.randomLetter();
                }
            });
        };
        this.emptyAllFields = function() {
            forAllFields(function() {
                this.letter = null;
            });
        };
        this.setWord = _setWord;
        this.getLevelRestriction = _getLevelRestriction;
        this.probeWord = function(marking) {
            var entry = marking;
            angular.forEach(entry.fields, function(field) {
                field.word = crossword.table[field.y][field.x];
            });
            entry.solved = false;
            angular.forEach(crossword.words, function(word) {
                if (angular.equals(word.start, entry.start) && angular.equals(word.stop, entry.stop)) {
                    if (word.solved) {
                        entry.solved = null;
                    } else {
                        entry = word;
                        word.solved = true;
                    }
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
        this.testDirection = function() {
            var dir = basics.textIsLTR ? "right" : "left";
            var critical = [];
            angular.forEach(crossword.words, function(word, id) {
                if (word.direction !== dir && word.direction !== "down") {
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
        this.redrawMarkers = function(markings) {
            angular.forEach(markings, function(marking) {
                var shift_x = 0, shift_y = 0;
                var from = marking.start, to = marking.stop;
                var swap = to.x < from.x || to.x === from.x && to.y < from.y;
                this.deleteMarking(marking.ID);
                if (marking.fields.length) {
                    shift_x = from.x - marking.fields[0].x;
                    shift_y = from.y - marking.fields[0].y;
                }
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

crwApp.directive("crwHelpFollow", [ "$document", function($document) {
    return {
        link: function(scope, element, attrs) {
            var helptabs = {};
            var matching = $document.find(".contextual-help-tabs li, .help-tab-content");
            helptabs.capabilities = matching.filter("[id*=crw-help-tab-options]");
            helptabs.editor = matching.filter("[id*=crw-help-tab-projects]");
            helptabs.review = matching.filter("[id*=crw-help-tab-review]");
            scope.$watch("activeTab", function(tab) {
                var tabName = /(capabilities|editor|review)/.exec(tab)[0];
                angular.forEach(helptabs, function(el, id) {
                    if (id === tabName) {
                        el.addClass("active").filter("[id*=tab-panel]").attr("style", null);
                    } else {
                        el.removeClass("active").filter("[id*=tab-panel]").css("display", "none");
                    }
                });
            });
        }
    };
} ]);

crwApp.directive("crwCatchThickboxLink", function($sce) {
    return {
        link: function(scope, element, attrs) {
            var data = jQuery.hasData(element[0]) && jQuery._data(element[0]);
            angular.forEach(data.events.click, function(event) {
                element.parent().on("click", ".thickbox", event.handler);
            });
            element.remove();
        }
    };
});

crwApp.controller("AdminController", [ "$scope", "$location", "qStore", "ajaxFactory", "crosswordFactory", function($scope, $location, qStore, ajaxFactory, crosswordFactory) {
    $scope.crw = crosswordFactory.getCrw();
    $scope.immediateStore = qStore.addStore();
    $scope.setActive = function(tabHash) {
        $location.path(tabHash);
    };
    $scope.$on("$locationChangeStart", function() {
        $scope.activeTab = $location.path();
    });
    $scope.prepare = function(tabHash, nonce) {
        ajaxFactory.setNonce(nonce, "settings");
        if (!$scope.activeTab && /^\/(capabilities|editor|review)/.test($location.path())) {
            $scope.activeTab = $location.path();
        } else {
            $scope.activeTab = tabHash;
            $scope.setActive(tabHash);
        }
    };
    $scope.setError = function(error) {
        if (!error) {
            $scope.globalError = null;
        } else if (error.heartbeat) {
            $location.path("");
        } else {
            $scope.globalError = error;
        }
    };
} ]);

crwApp.controller("OptionsController", [ "$scope", "ajaxFactory", function($scope, ajaxFactory) {
    var optionsContext = "options";
    var displayOptions = function(data) {
        $scope.capsEdit.$setPristine();
        if ($scope.dimEdit) {
            $scope.dimEdit.$setPristine();
        }
        $scope.submissions.$setPristine();
        $scope.setError(false);
        $scope.capabilities = data.capabilities;
        $scope.dimensions = data.dimensions;
        $scope.subscribers = data.subscribers;
    };
    $scope.update = function(part) {
        var data = {
            action: "update_crw_" + part
        };
        data[part] = angular.toJson($scope[part]);
        ajaxFactory.http(data, optionsContext).then(displayOptions, $scope.setError);
    };
    $scope.prepare = function(nonce) {
        ajaxFactory.setNonce(nonce, optionsContext);
        ajaxFactory.http({
            action: "get_crw_capabilities"
        }, optionsContext).then(displayOptions, $scope.setError);
    };
} ]);

crwApp.controller("EditorController", [ "$scope", "$filter", "ajaxFactory", function($scope, $filter, ajaxFactory) {
    var adminContext = "editors";
    $scope.levelList = function(which) {
        var min, max, list = [];
        if (which === "default") {
            min = 0;
            max = $scope.currentProject.maximum_level;
        } else {
            min = Math.max($scope.currentProject.default_level, $scope.currentProject.used_level);
            max = 3;
        }
        for (var i = min; i <= max; i++) {
            list.push(i);
        }
        return list;
    };
    $scope.getProjectList = function(current) {
        var list = [];
        angular.forEach($scope.admin.projects, function(project) {
            if (project.name !== current) {
                list.push(project.name);
            }
        });
        return list;
    };
    $scope.currentEditors = [];
    var showLoaded = function(admin, selected) {
        $scope.admin = admin;
        angular.forEach($scope.admin.projects, function(project) {
            project.pristine = true;
        });
        if (selected) {
            $scope.selectedProject = jQuery.grep($scope.admin.projects, function(project) {
                return project.name === selected;
            })[0];
        } else {
            $scope.selectedProject = $filter("orderBy")($scope.admin.projects, "name")[0];
        }
        getFilteredUsers();
        $scope.editorsPristine = true;
    };
    $scope.$watch("projectMod.$pristine", function(p) {
        var truePristine = true;
        angular.forEach([ "name", "defaultL", "maximumL" ], function(name) {
            truePristine &= $scope.projectMod[name].$pristine;
        });
        if (!p && truePristine) {
            $scope.projectMod.$setPristine();
        }
    });
    $scope.addProject = function() {
        $scope.selectedProject = null;
    };
    var emptyProject = {
        name: "",
        default_level: 1,
        maximum_level: 3,
        used_level: 0,
        editors: []
    };
    $scope.currentProject = angular.copy(emptyProject);
    $scope.$watch("selectedProject", function(newSel) {
        if (newSel) {
            $scope.currentProject = angular.copy(newSel);
            $scope.currentEditors = angular.copy(newSel.editors);
        } else {
            $scope.currentProject = angular.copy(emptyProject);
            $scope.currentEditors = [];
        }
        $scope.projectMod.$setPristine();
        $scope.editorsPristine = true;
        $scope.setError(false);
    });
    $scope.abortProject = function() {
        if (!$scope.selectedProject) {
            $scope.selectedProject = $filter("orderBy")($scope.admin.projects, "name")[0];
        }
        $scope.currentProject = angular.copy($scope.selectedProject);
        $scope.projectMod.$setPristine();
        $scope.setError(false);
    };
    $scope.saveProject = function() {
        ajaxFactory.http({
            action: "save_project",
            method: $scope.selectedProject ? "update" : "add",
            project: $scope.selectedProject ? $scope.selectedProject.name : undefined,
            new_name: $scope.currentProject.name,
            default_level: $scope.currentProject.default_level,
            maximum_level: $scope.currentProject.maximum_level
        }, adminContext).then(function(data) {
            showLoaded(data, $scope.currentProject.name);
        }, $scope.setError);
    };
    $scope.deleteProject = function() {
        var message = {
            which: "remove_project",
            project: $scope.selectedProject.name
        };
        $scope.immediateStore.newPromise("actionConfirmation", message).then(function() {
            ajaxFactory.http({
                action: "save_project",
                method: "remove",
                project: $scope.selectedProject.name
            }, adminContext).then(showLoaded, $scope.setError);
        });
    };
    $scope.filtered_users = [];
    var getFilteredUsers = function() {
        if (!$scope.admin) {
            return;
        }
        $scope.filtered_users = jQuery.grep($scope.admin.all_users, function(user) {
            return jQuery.inArray(user.user_id, $scope.currentEditors) < 0;
        });
        if (jQuery.inArray($scope.selectedEditor, $scope.currentEditors) < 0) {
            $scope.selectedEditor = $filter("orderBy")($scope.currentEditors, $scope.getUserName)[0];
        }
        if (jQuery.inArray($scope.selectedUser, $scope.filtered_users) < 0) {
            $scope.selectedUser = $filter("orderBy")($scope.filtered_users, "user_name")[0];
        }
        $scope.setError(false);
    };
    $scope.$watchCollection("currentEditors", getFilteredUsers);
    var addUser = function(user) {
        $scope.currentEditors.push(user.user_id);
    };
    var getUser = function(id) {
        return jQuery.grep($scope.admin.all_users, function(user) {
            return user.user_id === id;
        })[0];
    };
    $scope.getUserName = function(id) {
        return getUser(id).user_name;
    };
    $scope.addAll = function() {
        angular.forEach($scope.filtered_users, addUser);
        $scope.editorsPristine = false;
    };
    $scope.addOne = function() {
        var selected = $scope.selectedUser.user_id;
        addUser($scope.selectedUser);
        $scope.editorsPristine = false;
        $scope.selectedEditor = selected;
    };
    $scope.removeAll = function() {
        $scope.currentEditors.splice(0, $scope.currentEditors.length);
        $scope.editorsPristine = false;
    };
    $scope.removeOne = function() {
        var index = jQuery.inArray($scope.selectedEditor, $scope.currentEditors), selected = getUser($scope.selectedEditor);
        $scope.currentEditors.splice(index, 1);
        $scope.editorsPristine = false;
        $scope.selectedUser = selected;
    };
    $scope.abortEditors = function() {
        $scope.currentEditors = angular.copy($scope.selectedProject.editors);
        $scope.setError(false);
        $scope.editorsPristine = true;
    };
    $scope.saveEditors = function() {
        ajaxFactory.http({
            action: "update_editors",
            project: $scope.selectedProject.name,
            editors: angular.toJson($scope.currentEditors)
        }, adminContext).then(function(data) {
            showLoaded(data, $scope.selectedProject.name);
        }, $scope.setError);
    };
    $scope.prepare = function(nonce) {
        ajaxFactory.setNonce(nonce, adminContext);
        ajaxFactory.http({
            action: "get_admin_data"
        }, adminContext).then(showLoaded, $scope.setError);
    };
} ]);

crwApp.directive("crwOptionClick", function() {
    return {
        link: function(scope, element, attrs) {
            element.on("click", "option", function() {
                scope.$apply(function() {
                    scope.activateGroup(attrs.crwOptionClick);
                });
            });
        }
    };
});

crwApp.controller("ReviewController", [ "$scope", "$filter", "ajaxFactory", function($scope, $filter, ajaxFactory) {
    var reviewContext = "review", crosswordNonce;
    $scope.selectedCrossword = {
        confirmed: null,
        pending: null
    };
    $scope.activeGroup = "confirmed";
    var showLoaded = function(data, selected) {
        var newSelected;
        $scope.projects = data.projects;
        if (selected) {
            newSelected = jQuery.grep($scope.projects, function(project) {
                return project.name === selected;
            })[0];
        }
        if (newSelected) {
            $scope.selectedProject = newSelected;
        } else {
            $scope.selectedProject = $filter("orderBy")($scope.projects, "name")[0];
        }
        $scope.setError(false);
    };
    $scope.deleteCrossword = function(group) {
        var message = {
            which: "delete_crossword",
            crossword: $scope.selectedCrossword[group],
            project: $scope.selectedProject.name
        };
        $scope.immediateStore.newPromise("actionConfirmation", message).then(function() {
            ajaxFactory.http({
                action: "delete_crossword",
                project: $scope.selectedProject.name,
                name: $scope.selectedCrossword[group]
            }, reviewContext).then(function(data) {
                showLoaded(data, $scope.selectedProject.name);
            }, $scope.setError);
        });
    };
    $scope.confirm = function() {
        var name = $scope.selectedCrossword.pending;
        var message = {
            which: "approve_crossword",
            crossword: name,
            project: $scope.selectedProject.name
        };
        $scope.immediateStore.newPromise("actionConfirmation", message).then(function() {
            ajaxFactory.http({
                action: "approve_crossword",
                project: $scope.selectedProject.name,
                name: name
            }, reviewContext).then(function(data) {
                showLoaded(data, $scope.selectedProject.name);
                $scope.selectedCrossword.confirmed = name;
                $scope.selectedCrossword.pending = $filter("orderBy")($scope.selectedProject.pending, "toString()")[0];
                $scope.activateGroup("confirmed");
            }, $scope.setError);
        });
    };
    $scope.activateGroup = function(group) {
        $scope.activeGroup = group;
        $scope.previewCrossword = $scope.selectedCrossword[group];
    };
    $scope.$watch("selectedProject", function(newSel) {
        if (newSel) {
            if ($scope.preview) {
                $scope.$broadcast("previewProject", newSel.name, crosswordNonce);
            }
            angular.forEach($scope.selectedCrossword, function(name, group) {
                if (!name || jQuery.inArray(name, newSel[group]) < 0) {
                    $scope.selectedCrossword[group] = $filter("orderBy")(newSel[group], "toString()")[0];
                }
            });
        }
    });
    $scope.$watch("preview", function(newPre) {
        if (newPre && $scope.selectedProject) {
            $scope.$evalAsync(function(scope) {
                $scope.$broadcast("previewProject", $scope.selectedProject.name, crosswordNonce);
                $scope.previewCrossword = $scope.selectedCrossword[$scope.activeGroup];
                $scope.$broadcast("previewCrossword", $scope.previewCrossword);
            });
        }
    });
    $scope.$watchCollection("selectedCrossword", function(newSc) {
        $scope.previewCrossword = newSc[$scope.activeGroup];
    });
    $scope.$watch("previewCrossword", function(newName) {
        if ($scope.preview) {
            $scope.$broadcast("previewCrossword", newName);
        }
    });
    $scope.prepare = function(nonceCrossword, nonceReview) {
        crosswordNonce = nonceCrossword;
        ajaxFactory.setNonce(nonceReview, reviewContext);
        ajaxFactory.http({
            action: "list_projects_and_riddles"
        }, reviewContext).then(showLoaded, $scope.setError);
    };
} ]);

crwApp.config([ "$routeProvider", "nonces", function($routeProvider, nonces) {
    var lastPath = "";
    function getUrl(tab) {
        var url = crwBasics.ajaxUrl + "?action=get_option_tab&tab=";
        if (!nonces.settings) {
            return url + "invalid";
        }
        return url + tab + "&_crwnonce=" + nonces.settings;
    }
    $routeProvider.when("/capabilities", {
        templateUrl: function() {
            lastPath = "/capabilities";
            return getUrl("capabilities");
        }
    }).when("/editor", {
        templateUrl: function() {
            lastPath = "/editor";
            return getUrl("editor");
        }
    }).when("/review", {
        templateUrl: function() {
            lastPath = "/review";
            return getUrl("review");
        }
    }).otherwise({
        redirectTo: function() {
            return lastPath;
        }
    });
} ]);

crwApp.filter("duration", function() {
    return function(input) {
        if (typeof input === "number" && input >= 0) {
            var tenth = Math.round(input / 100), secs = (Math.floor(tenth % 600) / 1e3).toFixed(3).split(".")[1];
            return Math.floor(tenth / 600) + ":" + secs.substring(0, 2) + "." + secs.substring(2);
        } else {
            return null;
        }
    };
});

crwApp.factory("time", function() {
    return {
        getStamp: function() {
            return new Date().getTime();
        }
    };
});

crwApp.directive("crwTimerElement", [ "time", "$interval", function(time, $interval) {
    return {
        restrict: "A",
        transclude: true,
        scope: {
            timer: "=crwTimerElement"
        },
        link: function(scope, element, attrs, ctrl, transcludeFn) {
            var fixedTime = null, clock, countdown = parseInt(attrs.countdown, 10) * 1e3, submitting = angular.isDefined(attrs.submitting);
            scope.$interval = $interval;
            scope.timer = {};
            scope.texts = {};
            angular.element(transcludeFn()).filter("span").each(function(idx, elem) {
                var element = angular.element(elem);
                scope.texts[element.attr("state")] = {
                    alt: element.attr("alt"),
                    title: element.text()
                };
            });
            function timing() {
                scope.timer.time = time.getStamp() - fixedTime;
                if (countdown > 0 && scope.timer.time >= countdown) {
                    stop();
                }
            }
            function cancelClock() {
                if (clock) {
                    scope.$interval.cancel(clock);
                    clock = undefined;
                }
                fixedTime = null;
            }
            function stop() {
                if (scope.timer.state === "playing") {
                    scope.timer.time = time.getStamp() - fixedTime;
                    cancelClock();
                    scope.timer.state = submitting ? "final" : "scored";
                }
            }
            scope.$on("timerStop", stop);
            function init() {
                cancelClock();
                scope.timer = {
                    countdown: countdown > 0,
                    submitting: submitting,
                    state: "waiting",
                    time: undefined
                };
            }
            scope.$on("timerInit", init);
            scope.getTime = function() {
                return Math.abs(countdown - scope.timer.time);
            };
            scope.getTitle = function() {
                return scope.texts[scope.timer.countdown ? "down" : "up"].title;
            };
            scope.getDisabled = function() {
                return jQuery.inArray(scope.timer.state, [ "waiting", "scored" ]) < 0;
            };
            scope.play = function() {
                if (scope.timer.state === "waiting") {
                    fixedTime = time.getStamp();
                    scope.timer.time = 0;
                    scope.timer.state = "playing";
                    clock = scope.$interval(timing, 200);
                } else if (scope.timer.state === "scored") {
                    scope.timer.state = "waiting";
                }
            };
            scope.$on("$destroy", cancelClock);
        },
        template: '<button class="crw-control-button" ng-class="timer.state" ' + 'alt="{{texts[timer.state].alt}}" title="{{texts[timer.state].title}}" ' + 'ng-disabled="getDisabled()" ng-click="play()"></button>' + '<tt title="{{getTitle()}}">{{getTime() | duration}}</tt>'
    };
} ]);

crwApp.directive("crwCatchMouse", [ "$document", function($document) {
    return {
        link: function(scope, element, attrs) {
            var onMouseDown = function(event) {
                if (angular.isDefined(attrs.preventDefault)) {
                    event.preventDefault();
                }
                $document.bind("mouseup", onMouseUp);
                scope[attrs.down]();
            };
            var onMouseUp = function(event) {
                if (angular.isDefined(attrs.preventDefault)) {
                    event.preventDefault();
                }
                $document.unbind("mouseup", onMouseUp);
                scope.$apply(scope[attrs.up]());
            };
            element.bind("mousedown", onMouseDown);
            element.on("$destroy", function() {
                element.unbind("mousedown", onMouseDown);
                $document.unbind("mouseup", onMouseUp);
            });
        }
    };
} ]);

crwApp.directive("crwMenu", [ "$compile", function($compile) {
    return {
        scope: {
            value: "="
        },
        link: function(scope, element, attrs) {
            scope.$watch("value", function(val) {
                element.attr("title", scope.value.title);
            });
        },
        template: '<span crw-bind-trusted="value.display || value"></span>'
    };
} ]);

crwApp.controller("CrosswordController", [ "$scope", "qStore", "basics", "crosswordFactory", function($scope, qStore, basics, crosswordFactory) {
    if (!$scope.crw) {
        $scope.crw = crosswordFactory.getCrw();
    }
    if (!$scope.immediateStore) {
        $scope.immediateStore = qStore.addStore();
    }
    $scope.commandState = "full";
    $scope.highlight = [];
    $scope.levelList = $scope.crw.getLevelList();
    $scope.tableVisible = true;
    function updateLoadList(names) {
        jQuery.grep($scope.commandList, function(command) {
            return command.value === "load";
        })[0].group = names;
    }
    $scope.commands = {
        "new": "load()",
        load: "group",
        update: 'save("update")',
        insert: 'save("insert")',
        reload: "load(loadedName)"
    };
    $scope.prepare = function(project, nonceCrossword, nonceEdit, attr, name) {
        $scope.crw.setProject(project, nonceCrossword, nonceEdit, attr === "restricted");
        switch (attr) {
          case "restricted":
            $scope.commandState = "restricted";
            delete $scope.commands.load;
            delete $scope.commands.insert;
            break;

          case "timer":
            $scope.tableVisible = false;
            $scope.$watch("timer.state", function(newState, oldState) {
                if (newState === "playing") {
                    $scope.tableVisible = true;
                } else if (oldState === "scored" && newState === "waiting") {
                    $scope.restart();
                } else if (oldState === "playing" && newState !== "waiting") {
                    $scope.$broadcast("markingStop");
                    var dialogue = $scope.timer.submitting ? "submitSolution" : "solvedCompletely";
                    $scope.immediateStore.newPromise(dialogue, $scope.timer.time);
                }
            });
            break;
        }
        $scope.commandList = jQuery.map($scope.commands, function(value, command) {
            var obj = basics.localize(command);
            obj.value = command;
            if (command === "load") {
                obj.menu = obj.display;
                obj.group = [];
            }
            return obj;
        });
        var deregister = $scope.$on("immediateReady", function() {
            $scope.load($scope.commandState === "restricted" ? null : name);
            deregister();
        });
    };
    $scope.$on("cseSelect", function(event, source, value) {
        event.stopPropagation();
        switch (source) {
          case "command":
            $scope.$evalAsync($scope.commands[value]);
            break;

          case "command.sub":
            $scope.$evalAsync('load("' + value + '")');
            break;

          case "load":
            if ($scope.crosswordData && value === $scope.loadedName) {
                $scope.$evalAsync("restart()");
            } else {
                $scope.$evalAsync('load("' + value + '")');
            }
            break;

          case "level":
            var critical = $scope.crw.testDirection();
            var oldLevel = $scope.crosswordData.level;
            if (!(value & 1) && critical.length) {
                $scope.setHighlight(critical);
                var arg = {
                    count: critical.length,
                    level: value
                };
                $scope.immediateStore.newPromise("invalidDirections", arg).then(function() {
                    angular.forEach(critical, function(id) {
                        $scope.crw.deleteWord(id, "words");
                    });
                }, function() {
                    $scope.$evalAsync("crosswordData.level=" + oldLevel);
                })["finally"](function() {
                    $scope.setHighlight([]);
                });
            }
            break;
        }
    });
    $scope.$on("previewProject", function(event, project, nonceCrossword) {
        $scope.crw.setProject(project, nonceCrossword);
    });
    $scope.wordsToArray = function(words) {
        var arr = [];
        angular.forEach(words, function(item) {
            arr.push(item);
        });
        return arr;
    };
    var updateNames = function() {
        if ($scope.commandState === "full") {
            $scope.namesInProject = $scope.crw.getNamesList();
            updateLoadList($scope.namesInProject);
        }
        $scope.loadedName = $scope.crosswordData.name;
        $scope.setHighlight([]);
    };
    var updateModel = function() {
        $scope.crosswordData = $scope.crw.getCrosswordData();
        $scope.levelList = $scope.crw.getLevelList();
        $scope.count = $scope.crw.getCount();
        updateNames();
        if (typeof $scope.timer === "object") {
            $scope.tableVisible = false;
            $scope.$broadcast("timerInit");
        }
    };
    $scope.setHighlight = function(h) {
        $scope.highlight = h;
    };
    $scope.load = function(name) {
        $scope.loadError = null;
        if (name || typeof name === "string") {
            $scope.immediateStore.newPromise("loadCrossword", name).then(updateModel, function(error) {
                $scope.loadError = error;
            });
        } else {
            $scope.crw.loadDefault();
            updateModel();
        }
    };
    $scope.$on("previewCrossword", function(event, name) {
        $scope.load(name);
    });
    $scope.restart = function() {
        if ($scope.timer) {
            if ($scope.timer.submitting) {
                return;
            }
            $scope.tableVisible = false;
            $scope.$broadcast("timerInit");
        }
        if (!$scope.crw.getLevelRestriction("sol")) {
            $scope.crosswordData.solution = {};
        }
        angular.forEach($scope.crosswordData.words, function(word) {
            word.solved = false;
        });
        $scope.count.solution = 0;
    };
    $scope.$watch("count.solution", function(s) {
        if (s > 0 && s === $scope.count.words) {
            if ($scope.timer) {
                $scope.$broadcast("timerStop");
            } else {
                $scope.immediateStore.newPromise("solvedCompletely");
            }
        }
    });
    $scope.save = function(action) {
        if (!$scope.crosswordData.name) {
            action = "insert";
        }
        $scope.immediateStore.newPromise("saveCrossword", action).then(updateNames);
    };
    $scope.randomize = function() {
        $scope.crw.randomizeEmptyFields();
    };
    $scope.empty = function() {
        $scope.crw.emptyAllFields();
    };
} ]);

crwApp.controller("SizeController", [ "$scope", "$document", "basics", "StyleModelContainer", function($scope, $document, basics, StyleModelContainer) {
    var size = basics.dimensions.field + basics.dimensions.fieldBorder, handleShift = basics.dimensions.handleOutside + basics.dimensions.tableBorder, handleSize = basics.dimensions.handleOutside + basics.dimensions.handleInside, t, b, l, r, lg, rg, tg, wg, hg, fwg, fhg, origin;
    var resetSizes = function(cols, rows) {
        l = t = 0;
        r = cols * size;
        b = rows * size;
        lg = tg = 0;
        wg = cols * size;
        fwg = wg + 2 * basics.dimensions.tableBorder - basics.dimensions.fieldBorder;
        hg = fhg = rows * size;
        fhg = hg + 2 * basics.dimensions.tableBorder - basics.dimensions.fieldBorder;
        origin = basics.textIsLTR ? 0 : wg;
        $scope.modLeft.transform(l, 0);
        $scope.modTop.transform(0, t);
        $scope.modRight.transform(r, 0);
        $scope.modBottom.transform(0, b);
    };
    var addSide = function(style) {
        if (basics.textIsLTR) {
            style.left = lg + "px";
        } else {
            style.right = rg + "px";
        }
    };
    StyleModelContainer.add("size-left", -Infinity, ($scope.crosswordData.size.height - 3) * size, 0, 0);
    StyleModelContainer.add("size-top", 0, 0, -Infinity, ($scope.crosswordData.size.width - 3) * size);
    StyleModelContainer.add("size-right", 5 * size, Infinity, 0, 0);
    StyleModelContainer.add("size-bottom", 0, 0, 5 * size, Infinity);
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
        lg = Math.ceil(l / size) * size;
        wg = Math.floor((r - lg) / size) * size;
        if ($scope.modRight) {
            $scope.modRight.minx = Math.floor(l / size) * size + 3 * size;
        }
    });
    $scope.modLeft.addStyle("handle-left", function(x, y) {
        return {
            left: l - lg - handleShift + "px",
            width: lg - l + handleSize + "px"
        };
    });
    $scope.modTop.addStyle("size-top", function(x, y) {
        t = y;
        tg = Math.ceil(t / size) * size;
        hg = Math.floor((b - tg) / size) * size;
        if ($scope.modBottom) {
            $scope.modBottom.miny = Math.floor(t / size) * size + 3 * size;
        }
    });
    $scope.modTop.addStyle("handle-top", function(x, y) {
        return {
            top: t - tg - handleShift + "px",
            height: tg - t + handleSize + "px"
        };
    });
    $scope.modRight.addStyle("size-right", function(x, y) {
        r = x;
        rg = Math.ceil((origin - r) / size) * size;
        wg = Math.floor((r - lg) / size) * size;
        if ($scope.modLeft) {
            $scope.modLeft.maxx = Math.floor(r / size) * size - 3 * size;
        }
    });
    $scope.modRight.addStyle("handle-right", function(x, y) {
        return {
            right: lg + wg - r - handleShift + "px",
            width: r - lg - wg + handleSize + "px"
        };
    });
    $scope.modBottom.addStyle("size-bottom", function(x, y) {
        b = y;
        hg = Math.floor((b - tg) / size) * size;
        if ($scope.modTop) {
            $scope.modTop.maxy = Math.floor(b / size) * size - 3 * size;
        }
    });
    $scope.modBottom.addStyle("handle-bottom", function(x, y) {
        return {
            bottom: tg + hg - b - handleShift + "px",
            height: b - tg - hg + handleSize + "px"
        };
    });
    $scope.styleCrossword = function() {
        return {
            width: fwg + "px",
            height: fhg + 40 + "px"
        };
    };
    $scope.styleGridSize = function() {
        var style = {
            width: wg - basics.dimensions.fieldBorder + "px",
            top: tg + "px",
            height: hg - basics.dimensions.fieldBorder + "px"
        };
        addSide(style);
        return style;
    };
    $scope.styleShift = function() {
        return {
            top: -(tg + basics.dimensions.fieldBorder) + "px",
            left: -(lg + basics.dimensions.fieldBorder) + "px"
        };
    };
    $scope.styleExtras = function() {
        var style = {
            top: tg + hg + handleShift + "px",
            width: wg - basics.dimensions.fieldBorder + "px"
        };
        addSide(style);
        return style;
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
    };
    $scope.stopResize = function() {
        var newSize = abstractSize();
        if (angular.equals(currentSize, newSize)) {
            resetSizes(currentSize.right + currentSize.left, currentSize.bottom + currentSize.top);
        } else {
            var change = {
                left: newSize.left - currentSize.left,
                right: newSize.right - currentSize.right,
                top: newSize.top - currentSize.top,
                bottom: newSize.bottom - currentSize.bottom
            };
            var critical = $scope.crw.testWordBoundaries(change);
            if (critical.length) {
                $scope.setHighlight(critical);
                $scope.immediateStore.newPromise("invalidWords", critical).then(function() {
                    $scope.crw.changeSize(change, critical);
                }, function() {
                    resetSizes(currentSize.right + currentSize.left, currentSize.bottom + currentSize.top);
                })["finally"](function() {
                    $scope.setHighlight([]);
                });
            } else {
                $scope.crw.changeSize(change, critical);
            }
        }
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
    $scope.markers = markerFactory.getMarkers();
    function validMarking(newStop) {
        var isHorizontal, dif_x = currentMarking.start.x - newStop.x, dif_y = currentMarking.start.y - newStop.y;
        if ($scope.crw.getLevelRestriction("dir")) {
            if (basics.textIsLTR) {
                isHorizontal = dif_y === 0 && dif_x <= 0;
            } else {
                isHorizontal = dif_y === 0 && dif_x >= 0;
            }
            return dif_x === 0 && dif_y <= 0 || isHorizontal;
        } else {
            return Math.abs(dif_x) === Math.abs(dif_y) || dif_x === 0 || dif_y === 0;
        }
    }
    $scope.setMode = function(m) {
        mode = m;
        lastName = $scope.crosswordData.name;
        currentMarking = {
            ID: $scope.crw.getHighId()
        };
        if (mode === "build") {
            $scope.$watch("crosswordData.words", function(newWords, oldWords) {
                if (lastName !== $scope.crosswordData.name) {
                    lastName = $scope.crosswordData.name;
                    return;
                }
                var probe, len = 0;
                angular.forEach(oldWords, function(word, id) {
                    len++;
                    if (!newWords[id]) {
                        $scope.markers.deleteMarking(id);
                    } else {
                        probe = true;
                    }
                });
                if (probe || len === 0) {
                    $scope.markers.redrawMarkers($scope.crosswordData.words);
                }
            }, true);
        }
        if (mode === "solve") {
            $scope.$watch("crosswordData.solution", function(newWords, oldWords) {
                if (lastName !== $scope.crosswordData.name) {
                    lastName = $scope.crosswordData.name;
                    return;
                }
                angular.forEach(oldWords, function(word, id) {
                    if (!newWords[id] || !newWords[id].solved) {
                        $scope.markers.deleteMarking(word.markingId);
                    }
                });
                angular.forEach(newWords, function(word, id) {
                    if (!oldWords[id] || !oldWords[id].solved && word.solved) {
                        $scope.markers.exchangeMarkers(word.fields, currentMarking.ID, word.color);
                    }
                });
            }, true);
        }
    };
    $scope.$watch("crosswordData.name", function() {
        $scope.markers.deleteAllMarking();
        currentMarking = {
            ID: $scope.crw.getHighId()
        };
        if (mode !== "solve") {
            $scope.markers.redrawMarkers($scope.crosswordData.words);
        }
    });
    $scope.getMarks = function(line, column) {
        return $scope.markers.getMarks(column, line);
    };
    $scope.getImgClass = function(marker) {
        return [ marker.img, marker.marking.color ];
    };
    $scope.activate = function(row, col) {
        $scope.$broadcast("setFocus", row, col);
    };
    $scope.startMark = function() {
        isMarking = $scope.timer ? $scope.timer.state === "playing" : true;
        currentMarking = {
            ID: currentMarking.ID + 1
        };
        currentMarking.color = mode === "build" ? $scope.crw.randomColor() : "grey";
    };
    function dropMarking() {
        if (isMarking) {
            if (mode === "solve") {
                $scope.crw.deleteWord(currentMarking.ID, "solution");
            }
            $scope.markers.deleteMarking(currentMarking.ID);
            isMarking = false;
        }
    }
    $scope.$on("markingStop", dropMarking);
    $scope.stopMark = function() {
        var word;
        if (!isMarking) {
            return;
        }
        if (!angular.equals(currentMarking.start, currentMarking.stop)) {
            if (mode === "build") {
                word = $scope.crw.setWord(currentMarking);
                if (!word) {
                    dropMarking();
                }
            } else {
                word = $scope.crw.probeWord(currentMarking);
                if (word.solved) {
                    $scope.count.solution++;
                } else if (word.solved === null) {
                    dropMarking();
                } else {
                    $scope.setHighlight([ word.ID ]);
                    $scope.immediateStore.newPromise("falseWord", word.fields).then(function() {
                        $scope.crw.deleteWord(currentMarking.ID, "solution");
                        $scope.setHighlight([]);
                    });
                }
            }
        } else {
            $scope.markers.deleteMarking(currentMarking.ID);
        }
        isMarking = false;
    };
    $scope.intoField = function(row, col) {
        var newStop = {
            x: col,
            y: row
        };
        if (isMarking && currentMarking.start && validMarking(newStop)) {
            currentMarking.stop = newStop;
            $scope.markers.setNewMarkers(currentMarking);
        }
    };
    $scope.outofField = function(row, col) {
        if (isMarking && !currentMarking.start) {
            currentMarking.start = currentMarking.stop = {
                x: col,
                y: row
            };
            $scope.markers.setNewMarkers(currentMarking);
        }
    };
    $scope.move = function(event) {
        switch (event.which) {
          case 8:
          case 46:
            this.field.letter = null;
            event.preventDefault();
            event.stopPropagation();
            break;

          case 37:
            if (this.column > 0) {
                this.activate(this.line, this.column - 1);
            }
            event.preventDefault();
            event.stopPropagation();
            break;

          case 38:
            if (this.line > 0) {
                this.activate(this.line - 1, this.column);
            }
            event.preventDefault();
            event.stopPropagation();
            break;

          case 39:
            if (this.column < this.row.length - 1) {
                this.activate(this.line, this.column + 1);
            }
            event.preventDefault();
            event.stopPropagation();
            break;

          case 40:
            if (this.line < this.crosswordData.table.length - 1) {
                this.activate(this.line + 1, this.column);
            }
            event.preventDefault();
            event.stopPropagation();
            break;
        }
        var keychar = String.fromCharCode(event.which);
        if (basics.letterRegEx.test(keychar)) {
            event.stopPropagation();
        }
    };
    $scope.type = function(event) {
        var keychar = String.fromCharCode(event.which);
        if (basics.letterRegEx.test(keychar)) {
            this.field.letter = keychar.toUpperCase();
            event.preventDefault();
            event.stopPropagation();
        }
    };
} ]);

crwApp.directive("colorSelect", [ "basics", function(basics) {
    return {
        scope: {
            value: "="
        },
        link: function(scope, element, attrs) {
            scope.localize = basics.localize;
        },
        template: '<img title="{{localize(value)}}" ng-src="' + basics.imagesPath + 'bullet-{{value}}.png">'
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
    $scope.textIsLTR = basics.textIsLTR;
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
    $scope.localize = basics.localize;
    $scope.$on("select", function(event) {
        event.stopPropagation();
    });
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

crwApp.directive("crwAddParsers", function() {
    return {
        require: "ngModel",
        link: function(scope, element, attrs, ctrl) {
            var space = /\s+/;
            var parsers = attrs.crwAddParsers.split(space);
            if (jQuery.inArray("unique", parsers) >= 0) {
                var uniques = attrs.crwUnique.split(space);
                ctrl.$parsers.unshift(function(viewValue) {
                    if (viewValue === undefined) {
                        return viewValue;
                    }
                    var blacklist, i, result = viewValue;
                    for (i = 0; i < uniques.length; i++) {
                        blacklist = scope.$eval(uniques[i]);
                        if (jQuery.isArray(blacklist)) {
                            if (jQuery.inArray(viewValue, blacklist) >= 0) {
                                result = undefined;
                            }
                            continue;
                        } else if (typeof blacklist === "object") {
                            if (blacklist.hasOwnProperty(viewValue)) {
                                result = undefined;
                            }
                            continue;
                        } else if (typeof blacklist === "string" && blacklist === viewValue) {
                            result = undefined;
                            continue;
                        }
                    }
                    ctrl.$setValidity("unique", result !== undefined);
                    return result;
                });
            }
            if (jQuery.inArray("sane", parsers) >= 0) {
                ctrl.$parsers.unshift(function(viewValue) {
                    viewValue = viewValue.replace(space, " ");
                    var sanitized = viewValue.replace(/<|%[a-f0-9]{2}/, "");
                    if (sanitized === viewValue) {
                        ctrl.$setValidity("sane", true);
                        return viewValue;
                    } else {
                        ctrl.$setValidity("sane", false);
                        return undefined;
                    }
                });
            }
        }
    };
});

crwApp.directive("crwHasPassword", function() {
    return {
        link: function(scope, element, attrs, ctrl) {
            element.find("input[type=submit]").on("click", function() {
                scope.password = null;
            });
            element.on("$destroy", function() {
                element.find("[required]").attr("required", null);
            });
        }
    };
});

crwApp.controller("ImmediateController", [ "$scope", "$sce", function($scope, $sce) {
    var deferred;
    $scope.immediate = null;
    $scope.finish = function(resolution) {
        $scope.saveError = undefined;
        $scope.saveDebug = undefined;
        $scope.immediate = null;
        if (resolution) {
            deferred.resolve();
        } else {
            deferred.reject();
        }
    };
    $scope.immediateStore.register("loadCrossword", function(loadDeferred, name) {
        deferred = loadDeferred;
        $scope.message = {
            which: "load_crossword",
            buttons: {}
        };
        $scope.immediate = "dialogue";
        $scope.crw.loadCrosswordData(name).then($scope.finish, function(error) {
            $scope.immediate = null;
            deferred.reject(error);
        });
    });
    $scope.immediateStore.register("invalidWords", function(invalidDeferred, critical) {
        deferred = invalidDeferred;
        $scope.message = {
            which: "invalid_words",
            count: critical.length,
            buttons: {
                "delete": true,
                abort: true
            }
        };
        $scope.immediate = "dialogue";
    });
    $scope.immediateStore.register("invalidDirections", function(invalidDeferred, arg) {
        deferred = invalidDeferred;
        $scope.message = {
            which: "invalid_directions",
            count: arg.count,
            level: arg.level,
            buttons: {
                "delete": true,
                abort: true
            }
        };
        $scope.immediate = "dialogue";
    });
    function showSaveError(error) {
        $scope.progress = 0;
        $scope.saveError = error.error;
        $scope.saveDebug = error.debug;
    }
    function setupSolutionMessage(time) {
        $scope.message = {
            which: "solved_completely",
            buttons: {
                ok: true
            }
        };
        if ($scope.count.words > $scope.count.solution) {
            $scope.message.which = "solved_incomplete";
            $scope.message.words = $scope.count.words;
            $scope.message.solution = $scope.count.solution;
        }
        $scope.message.time = time || "false";
    }
    $scope.immediateStore.register("saveCrossword", function(saveDeferred, action) {
        deferred = saveDeferred;
        $scope.immediate = "save_crossword";
        $scope.action = action;
    });
    $scope.upload = function(username, password) {
        $scope.crw.saveCrosswordData($scope.action === "update" ? $scope.loadedName : $scope.crosswordData.name, $scope.loadedName === $scope.crosswordData.name ? "update" : $scope.action, username, password).then($scope.finish, showSaveError);
    };
    $scope.immediateStore.register("falseWord", function(falseDeferred, word) {
        deferred = falseDeferred;
        $scope.message = {
            which: "false_word",
            word: word,
            buttons: {
                "delete": true
            }
        };
        $scope.immediate = "dialogue";
    });
    $scope.immediateStore.register("solvedCompletely", function(solvedDeferred, time) {
        deferred = solvedDeferred;
        setupSolutionMessage(time);
        $scope.immediate = "dialogue";
    });
    $scope.immediateStore.register("submitSolution", function(submitDeferred, time) {
        deferred = submitDeferred;
        setupSolutionMessage(time);
        $scope.progress = 0;
        $scope.immediate = "submit_solution";
    });
    $scope.submit = function(username, password) {
        switch ($scope.progress) {
          case 0:
            $scope.saveError = undefined;
            $scope.saveDebug = undefined;
            $scope.progress = 1;
            $scope.crw.submitSolution(($scope.message.time / 1e3).toFixed(1), username, password).then(function(message) {
                if (message.length) {
                    $scope.progress = 2;
                    $scope.message.feedback = $sce.trustAsHtml(message);
                } else {
                    $scope.finish(true);
                }
            }, showSaveError);
            break;

          case 2:
            $scope.finish(true);
            break;
        }
    };
    $scope.immediateStore.register("actionConfirmation", function(actionDeferred, message) {
        deferred = actionDeferred;
        $scope.message = angular.extend(message, {
            buttons: {
                ok: true,
                abort: true
            }
        });
        $scope.immediate = "dialogue";
    });
    $scope.$emit("immediateReady");
} ]);