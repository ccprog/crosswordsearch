/* crossword data object contructor */
crwApp.factory('crosswordFactory', ['basics', 'ajaxFactory',
        function (basics, ajaxFactory) {
    function Crw () {
        // nonce keys are unique for every crossword instance
        var crwId = ajaxFactory.getId();
        var crwContext = 'crossword' + crwId,
            editContext = 'edit' + crwId;
        // parent data object
        var crossword = {};
        // default level for new crosswords
        var stdLevel = 1;
        // maximum level for crosswords
        var maxLevel = 3;
        // list of crossword names in project
        var namesList = [];
        // project name
        var project = '';
        // restriction context
        var restricted = false;
        // word count
        var count = {
            words: 0,
            solution: 0
        };

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
                solution: {},
                level: stdLevel
            });
            addRows(crossword.size.height, false);
        };

        // test whether a difficulty level enforces a restriction
        var _getLevelRestriction = function (restriction) {
            switch (restriction) {
            case 'dir':
                // only easy directions
                return !(crossword.level & 1);
            case 'sol':
                // show word before found
                return !(crossword.level & 2);
            }
        };

        var _makeField = function (x, y) {
            return { x: x, y: y, word: crossword.table[y][x] };
        }

        // add a new field sequence or exchange it with altered positioning
        // (as during mouse movement)
        // If it already exists, marking.fields will be overwritten or otherwise
        // added and the sequence of fields between .start and .stop computed
        var _setFields = function (word) {
            var from = word.start, to = word.stop;
            var i, dif_x = to.x - from.x, dif_y = to.y - from.y;
            var swap = dif_x < 0 || (dif_x === 0 && dif_y < 0);

            word.fields = [];
            if (dif_x * dif_y > 0) {
                word.direction = swap ? "up-left" : "down-right";
                for (i = 0; Math.abs(i) <= Math.abs(to.x - from.x); swap ? i-- : i++) {
                    word.fields.push(_makeField(from.x + i, from.y + i));
                }
            } else if (dif_x * dif_y < 0) {
                word.direction = swap ? "down-left" : "up-right";
                for (i = 0; Math.abs(i) <= Math.abs(to.x - from.x); swap ? i-- : i++) {
                    word.fields.push(_makeField(from.x + i, from.y - i));
                }
            } else {
                if (dif_x === 0 && dif_y === 0) {
                    word.direction = "origin";
                    word.fields.push(_makeField(from.x, from.y));
                } else if (dif_x === 0) {
                    word.direction = swap ? "up" : "down";
                    for (i = 0; Math.abs(i) <= Math.abs(to.y - from.y); swap ? i-- : i++) {
                        word.fields.push(_makeField(from.x, from.y + i));
                    }
                } else {
                    word.direction = swap ? "left" : "right";
                    for (i = 0; Math.abs(i) <= Math.abs(to.x - from.x); swap ? i-- : i++) {
                        word.fields.push(_makeField(from.x + i, from.y));
                    }
                }
            }
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
        // returns false instead if the word has already been saved with a different ID.
        var _setWord = function (marking) {
            var exists = false;
            angular.forEach(crossword.words, function (word) {
                // identical IDs are only possible on calls from crosswordController
                // during model update, where overwriting is needed.
                if (angular.equals(word.start, marking.start) && angular.equals(word.stop, marking.stop) &&
                        word.ID !== marking.ID) {
                    exists = true;
                }
            });
            if (exists) {
                return false;
            }
            _setFields(marking);
            return (crossword.words[marking.ID] = marking);
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
                    word.start = { x: word.start.x, y: word.start.y + number };
                    word.stop = { x: word.stop.x, y: word.stop.y + number };
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
                    word.start = { x: word.start.x + number, y: word.start.y };
                    word.stop = { x: word.stop.x + number, y: word.stop.y };
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

        // return list of adjustable levels for a crossword
        this.getLevelList = function () {
            var list = [];
            for (var i = 0; i <= maxLevel; i++) {
                list.push(i);
            }
            return list;
        };

        // set the project key, previewController will not set nonces
        this.setProject = function (p, nc, ne, r) {
            project = p;
            restricted = r;
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
        function onLoaded (data) {
            // if an empty string is sent for name, no object is returned
            stdLevel = data.default_level;
            maxLevel = data.maximum_level;
            namesList = data.namesList;
            if (angular.isObject(data.crossword)) {
                angular.extend(crossword, data.crossword);
                if (_getLevelRestriction('sol')) {
                    crossword.solution = angular.copy(crossword.words);
                }
            } else {
                _loadDefault();
            }
            count.words = 0;
            count.solution = 0;
            angular.forEach(crossword.words, function (word) {
                // count words in words/solution object
                count.words++;
                // refresh data binding for word objects
                _setWord(word);
            });
            return true;
        }
        this.loadCrosswordData = function (name) {
            return ajaxFactory.http({
                action: 'get_crossword',
                project: project,
                name: name,
                restricted: restricted + 0
            }, crwContext).then(onLoaded);
        };

        this.getCount = function () {
            return count;
        };

        // save a crossword
        this.saveCrosswordData = function (name, action, username, password) {
            crossword.solution = {};
            var content = {
                action: 'save_crossword',
                method: action,
                project: project,
                restricted: restricted + 0,
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

        // submit a solution to the server
        this.submitSolution = function (time, username, password) {
            return ajaxFactory.http({
                action: 'submit_solution',
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

        // return the highest id used for words
        this.getHighId = function () {
            return Object.keys(crossword.words).reduce(function (result, key) {
                return Math.max(result, crossword.words[key].ID);
            }, 0);
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
                    this.letter = basics.randomLetter();
                }
            });
        };

        // set all fields to empty
        this.emptyAllFields = function () {
            forAllFields(function () {
                this.letter = null;
            });
        };

        this.setWord = _setWord;

        this.getLevelRestriction = _getLevelRestriction;

        // look up whether a field sequence (format see above)
        // matches an entry in the words list. The sequence is added to the
        // solution list in any case. If it is not found in words,
        // .solved is set to false. Otherwise it is set to 
        // - null if the word has allready been solved, otherwise
        // - true and the id is set to that from words to preserve
        //   ordering. .markingId is added to identify the incoming object
        // The altered object is mirrored back.
        this.probeWord = function (marking) {
            var entry = marking;
            entry.fields.forEach(function (field) {
                field.word = crossword.table[field.y][field.x];
            });
            entry.solved = false;
            angular.forEach(crossword.words, function (word) {
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
            return (crossword.solution[entry.ID] = entry);
        };

        // test whether a size change will leave letter sequences running
        // across the altered border of the crossword.
        // change has the format {left: ..., right: ..., top: ..., bottom: ...}
        // with a positive number indicating an addition of rows/columns and
        // a negative number indicating a removal of rows/columns.
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

        // test words for easy directions
        this.testDirection = function () {
            var dir = basics.textIsLTR ? 'right' : 'left';
            var critical = [];
            angular.forEach(crossword.words, function (word, id) {
                if (word.direction !== dir && word.direction !== 'down') {
                    critical.push(parseInt(id, 10));
                }
            });
            return critical;
        };

        // change the size of the crossword (for change object see above)
        // critical is the list of words that must be removed to avoid sequences
        // crossing the table limits
        this.changeSize = function (change, critical) {
            critical.forEach(function (id) {
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
