describe("reduce implementation", function () {
    beforeEach(module('crwApp'));

    it("iterates over an array", inject(function($injector) {
        var reduce = $injector.get('reduce');
        var mock = {
            func: function (old, value, key) {
                return old;
            },
            initial: 0,
            array: [1,2,3]
        };
        spyOn(mock, 'func').and.callThrough();

        var result = reduce(mock.array, mock.initial, mock.func);

        expect(mock.func.calls.count()).toEqual(mock.array.length);
        for (var i = 0; i < mock.array.length; i++) {
            expect(mock.func.calls.argsFor(i)).toEqual([mock.initial, mock.array[i], i]);
        }
        expect(result).toBe(mock.initial);
    }));
});

describe("basics factory", function () {
    var basics;

    beforeEach(function () {
        module('crwApp');
        inject(function($injector) {
            basics = $injector.get('basics');
        });
    });

    it("initializes properties", function () {
        expect(Array.isArray(basics.colors)).toBe(true);
        expect(typeof basics.colors[0]).toBe('string');
        expect(basics.pluginPath).toBe(crwBasics.pluginPath);
        expect("A").toMatch(basics.letterRegEx);
        var moveCharacters = String.fromCharCode(0x25, 0x26, 0x27, 0x28, 0x2E, 0x08);
        expect(moveCharacters).not.toMatch(basics.letterRegEx);
        expect(basics.fieldSize).toBeGreaterThan(0);
        expect(basics.fieldSize % 1).toBe(0);
        for (var key in basics.directionMapping) {
            expect(crwBasics.locale[key]).toBeDefined();
            expect(basics.directionMapping[key].end).toBeDefined();
            expect(basics.directionMapping[key].middle).toBeDefined();
        }
    });

    it("returns a random color", function () {
        var color, random;
        for (var i = 1; i < 4; i++) {
            color = basics.colors[i];
            random = basics.randomColor(color);
            expect(basics.colors).toContain(random);
            expect(random).not.toBe(color);
        }
    });

    it("returns a random letter", function () {
        for (var i = 0; i < 5; i++) {
            expect(basics.randomLetter()).toMatch(basics.letterRegEx);
        }
    });

    it("localizes a known string", function () {
        expect(basics.localize('down-right')).toBe('down and right');
        expect(basics.localize('abc')).toBe('abc');
    });
});