/* constants */
crwApp.factory('basics', function () {
    var total = 0;
    var list = Object.keys(crwBasics.letterDist).reduce(function (result, key) {
        var value = crwBasics.letterDist[key];
        total += value;
        for (var i = 0; i < value; i++) {
            result.push(key);
        }
        return result;
    }, []);

    return {
        // the list of marking colors selectable on build page.
        colors: ["black", "red", "green", "blue", "orange", "violet", "aqua"],

        // text direction marker
        textIsLTR: crwBasics.textDirection !== 'rtl',

        // table sizing dimensions in pixels
        fieldSize: crwBasics.dimensions.field + crwBasics.dimensions.fieldBorder,
        fieldShift: crwBasics.dimensions.fieldBorder / 2,
        handleWidth: crwBasics.dimensions.handleInside + crwBasics.dimensions.handleOutside,
        handleOffset: crwBasics.dimensions.handleInside,

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
            return list[pos];
        },

        // return the regex describing allowed letters
        letterRegEx: new RegExp('^' + crwBasics.letterRegEx + '$'),

        normalizeLetter: function (letter) {
            if (!crwBasics.casesensitive) {
                letter = letter.toUpperCase();
            }
            if (crwBasics.accentMap) {
                Object.keys(crwBasics.accentMap).forEach(function (base) {
                    if (crwBasics.accentMap[base].indexOf(letter) > -1) {
                        letter = base;
                    }
                });
            }
            return letter;
        },

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
});
