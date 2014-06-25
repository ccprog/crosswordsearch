/* crossword data object contructor */
crwApp.factory('crosswordFactory', ['basics', 'reduce', 'ajaxFactory',
        function (basics, reduce, ajaxFactory) {
    function Crw () {
        var crwContext = 'crossword', editContext = 'edit';
        // parent data object
        var crossword = {}, namesList = [];
        // project key
        var project = '';

        // default empty crossword object
        var _loadDefault = function () {
            angular.extend(crossword, {
                'name': '',
                'description': '',
                'author': '',
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

        // return crossword data object
        this.getCrosswordData = function () {
            return crossword;
        };

        // return list of all named crosswords in project
        this.getNamesList = function () {
            return namesList;
        };

        // set the project key, previewController will not set nonces
        this.setProject = function (p, nc, ne) {
            project = p;
            if (nc) {
                ajaxFactory.setNonce(nc, crwContext);
            }
            if (ne) {
                ajaxFactory.setNonce(ne, editContext);
            }
        };

        // default empty crossword object
        this.loadDefault = _loadDefault;

        // load a crossword
        this.loadCrosswordData = function (name) {
            return ajaxFactory.http({
                    action: 'get_crossword',
                    project: project,
                    name: name
            }, crwContext).then(function(data) {
                // if an empty string is sent for name, no object is returned
                if (angular.isObject(data.crossword)) {
                    angular.extend(crossword, data.crossword);
                } else {
                    _loadDefault();
                }
                namesList = data.namesList;
                return true;
            });
        };

        // save a crossword
        this.saveCrosswordData = function (name, action, username, password) {
            var content = {
                action: action + '_crossword',
                project: project,
                crossword: angular.toJson(crossword),
                username: username,
                password: password
            };
            if (action === 'update') {
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

        // return the highest id used for words
        this.getHighId = function () {
            return reduce(crossword.words, 0, function (result, word) {
                return Math.max(result, word.ID);
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
        // { ID: ...,
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
            return (crossword.words[marking.ID] = marking);
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
            entry.markingId = marking.ID;
            return (crossword.solution[entry.ID] = entry);
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
