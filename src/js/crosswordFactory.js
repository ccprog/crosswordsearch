/* crossword data object contructor */
crwApp.factory('crosswordFactory', ['$http', '$q', 'basics', 'reduce',
        function ($http, $q, basics, reduce) {
    $http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
    $http.defaults.transformRequest = jQuery.param;
    var httpDefaults = {
        method: 'POST',
        url: crwBasics.ajaxUrl
    };

    function Crw () {
        // parent data object
        var crossword = {};

        // add or delete the given number of rows
        // if number is negative, rows will be removed
        // top == true at the top of the table, false at the bottom
        // word positioning indices are adjusted
        var addRows = function (number, top) {
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
                angular.forEach(crossword.words, function (word) {
                    word.start.y += number;
                    word.stop.y += number;
                });
            }
        };

        // add or delete the given number of fields in one row
        // if number is negative, fields will be removed
        // left == true at the left side of the table, right at the right side
        var addFields = function (row, number, left) {
                if (number > 0) {
                    for (var i = 0; i < number; i++) {
                        var field = { letter: null };
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

        // loop through all rows to add/remove fields
        // word positioning indices are adjusted
        var addAdditionalFields = function (number, left) {
            for (var i=0; i < crossword.table.length; i++) {
                addFields(crossword.table[i], number, left);
            }
            if (left) {
                angular.forEach(crossword.words, function (word) {
                    word.start.x += number;
                    word.stop.x += number;
                });
            }
        };

        // convenience loop through all fields in all rows
        var forAllFields = function (func) {
            angular.forEach(crossword.table, function (line, row) {
                angular.forEach(line, function (field, col) {
                    func.call(field, row, col);
                });
            });
        };

        // default empty crossword object
        var loadDefault = function () {
            angular.extend(crossword, {
                'name': '',
                size: {
                    width: 10,
                    height: 10
                },
                // crossword table containing the letters
                table: [],
                // all letter sequences that have been saved as solution words
                words: {},
                // letter sequences that have been marked on the solve page,
                // irrespective of their status as a valid solution
                solution: {}
            });
            addRows(crossword.size.height, false);
        };
        // init default crossword
        loadDefault();

        // return crossword data object
        this.getCrosswordData = function () {
            return crossword;
        };

        // web server error messages
        var serverError = function (response) {
            return $q.reject('server error, status ' + response.status);
        };

        // php error messages
        var phpError = function (response) {
            // look for admin-ajax.php errors
            if (typeof response.data !== 'object') {
                return 'malformed request';
            }
            // look for php execution errors
            if(response.data.error) {
                return response.data.error;
            }
            return false;
        };

        // load a crossword
        this.loadCrosswordData = function (name) {
            if (name) {
                return $http(angular.extend({
                    data: {
                        action: 'get_crossword',
                        name: name
                    }
                }, httpDefaults)).then(function(response) {
                    var errorMessage = phpError(response);
                    if (errorMessage) {
                        return $q.reject(errorMessage);
                    }
                    // do not exchange the top level object to make watching it possible
                    angular.extend(crossword, response.data);
                }, serverError);
            } else {
                loadDefault();
                return $q.reject();
            }
        };

        // save a crossword
        this.saveCrosswordData = function (name) {
            return $http(angular.extend({
                data: {
                    action: 'set_crossword',
                    name: name,
                    crossword: angular.toJson(crossword)
                }
            }, httpDefaults)).then(function(response) {
                var errorMessage = phpError(response);
                if (errorMessage) {
                    return $q.reject(errorMessage);
                }
            }, serverError);
        };

        // set a name for a crossword
        this.setName = function (str) {
            crossword.name = str;
        };

        // return the highest id used for words
        this.getHighId = function () {
            return reduce(crossword.words, 0, function (result, word) {
                return Math.max(result, word.id);
            });
        };

        // identify a color that is different from the one used
        // for the last marked sequence
        this.randomColor = function () {
            var highID = this.getHighId();
            return basics.randomColor(highID > 0 ? crossword.words[highID].color : undefined);
        };

        // delete the letter sequence identified by id from the target list
        // target can be 'words' or 'solution'
        this.deleteWord = function (id, target) {
            if (crossword[target][id]) {
                delete crossword[target][id];
            }
        };

        // fill all empty fields with a random letter
        this.randomizeEmptyFields = function () {
            forAllFields(function () {
                if (!this.letter) {
                    this.letter = basics.randomLetter("german");
                }
            });
        };

        // set all fields to empty
        this.emptyAllFields = function () {
            forAllFields(function () {
                this.letter = null;
            });
        };

        // save a field sequence in the words list
        // marking must be an object of the form
        // { id: ...,
        // color: ...,
        // start: {x: ..., y: ...},
        // stop: {x: ..., y: ...},
        // fields: [ {x: ..., y: ...}, ... ] }
        // each field will get matched with its letter content
        // and the enhanced object is mirrored back
        this.setWord = function (marking) {
            angular.forEach(marking.fields, function (field) {
                field.word = crossword.table[field.y][field.x];
            });
            return (crossword.words[marking.id] = marking);
        };

        // look up whether a field sequence (format see above)
        // matches an entry in the words list. The sequence is added to the
        // solution list in any case. If it is not found in words,
        // .solved is set to false. Otherwise it is set to true and
        // the id is set to that from words to preserve ordering.
        // .markingId is added to identify the incoming object
        // The altered object is mirrored back.
        this.probeWord = function (marking) {
            var entry = marking;
            angular.forEach(entry.fields, function (field) {
                field.word = crossword.table[field.y][field.x];
            });
            entry.solved = false;
            angular.forEach(crossword.words, function (word) {
                if (angular.equals(word.start, entry.start) && angular.equals(word.stop, entry.stop)) {
                    entry = word;
                    word.solved = true;
                }
            });
            entry.markingId = marking.id;
            return (crossword.solution[entry.id] = entry);
        };

        // test whether a size change will leave letter sequences running
        // across the altered border of the crossword.
        // change has the format {left: ..., right: ..., top: ..., bottom: ...}
        // with the number indicating the border movement indicated in top/left
        // coordinates (that means left = 2 and right = -2 would both _remove_ two
        // fields on their respective side)
        // returns an array of word ids that would run across a changed border
        this.testWordBoundaries = function (change) {
            var critical = [];
            angular.forEach(crossword.words, function (word, id) {
                if (Math.min(word.start.x, word.stop.x) < -change.left ||
                        Math.max(word.start.x, word.stop.x) >= crossword.size.width + change.right ||
                        Math.min(word.start.y, word.stop.y) < -change.top ||
                        Math.max(word.start.y, word.stop.y) >= crossword.size.height + change.bottom) {
                    critical.push(parseInt(id, 10));
                }
            });
            return critical;
        };

        // change the size of the crossword (for change object see above)
        // critical is the list of words that must be removed to avoid sequences
        // crossing the table limits
        this.changeSize = function (change, critical) {
            angular.forEach(critical, function (id) {
                this.deleteWord(id, 'words');
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
        getCrw: function () {
            return new Crw();
        }
    };
}]);
