describe("basics factory", function () {
    var basics;

    afterEach(function () {
        delete crwBasics.dimensions;
        delete crwBasics.casesensitive;
        delete crwBasics.accentMap;
        crwBasics.textDirection = 'ltr';
    });

    describe("basics factory instance", function () {

        beforeEach(function () {
            module('crwApp');
            crwBasics.dimensions = {data: 'data'};
            inject(function($injector) {
                basics = $injector.get('basics');
            });
        });

        it("initializes properties", function () {
            expect(Array.isArray(basics.colors)).toBe(true);
            expect(typeof basics.colors[0]).toBe('string');
            expect(typeof basics.textIsLTR).toBe('boolean');
            expect(basics.dimensions).toEqual(crwBasics.dimensions);
            expect(basics.imagesPath).toBe(crwBasics.imagesPath);
            expect(basics.letterRegEx.toString()).toBe('/^' + crwBasics.letterRegEx + '$/');
            expect("A").toMatch(basics.letterRegEx);
            var moveCharacters = String.fromCharCode(0x25, 0x26, 0x27, 0x28, 0x2E, 0x08);
            expect(moveCharacters).not.toMatch(basics.letterRegEx);
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

        it("passes letter capitalization if instructed", function () {
            expect(basics.normalizeLetter('a')).toBe('A');
            expect(basics.normalizeLetter('é')).toBe('É');
            expect(basics.normalizeLetter('ĩ')).toBe('Ĩ');
            expect(basics.normalizeLetter('ò')).toBe('Ò');
            expect(basics.normalizeLetter('û')).toBe('Û');
            crwBasics.casesensitive = true;
            expect(basics.normalizeLetter('a')).toBe('a');
        });

        it("maps letters if instructed", function () {
            expect(basics.normalizeLetter('É')).toBe('É');
            expect(basics.normalizeLetter('Ĩ')).toBe('Ĩ');
            expect(basics.normalizeLetter('Ò')).toBe('Ò');
            expect(basics.normalizeLetter('Û')).toBe('Û');
            crwBasics.accentMap = { "A": "ÁÀÂ", "E": "ÉÈÊ", "I": "ÍÌÎ", "O": "ÓÒÔ", "U": "ÚÙÛ" };
            expect(basics.normalizeLetter('É')).toBe('E');
            expect(basics.normalizeLetter('Ĩ')).toBe('Ĩ');
            expect(basics.normalizeLetter('Ò')).toBe('O');
            expect(basics.normalizeLetter('Û')).toBe('U');
        });

        it("localizes a known string", function () {
            expect(basics.localize('down-right')).toBe('down and right');
            expect(basics.localize('abc')).toBe('abc');
        });
    });

    it("detects ltr language", function () {
        crwBasics.textDirection = 'ltr';
        module('crwApp');
        inject(function($injector) {
            basics = $injector.get('basics');
        });
        expect(basics.textIsLTR).toBe(true);
    });

    it("detects rtl language", function () {
        crwBasics.textDirection = 'rtl';
        module('crwApp');
        inject(function($injector) {
            basics = $injector.get('basics');
        });
        expect(basics.textIsLTR).toBe(false);
    });
});
