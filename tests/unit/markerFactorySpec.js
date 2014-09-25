describe("markerFactory", function () {
    var markerFactory;

    beforeEach(function () {
        module('crwApp');
        inject(function ($injector) {
            markerFactory = $injector.get('markerFactory');
        });
    });

    it("initializes multiple instances" , function () {
        var markers1 = markerFactory.getMarkers();
        var markers2 = markerFactory.getMarkers();
        expect(typeof markers1).toBe('object');
        expect(typeof markers2).toBe('object');
        expect(markers1).not.toBe(markers2);
    });

    describe("markerFactory instance", function () {
        var markers;

        beforeEach(function () {
            markers = markerFactory.getMarkers();
        });

        it("handles non-existing markers", function () {
            markers.setNewMarkers({
                start: {x: 0, y: 0},
                stop: {x: 0, y: 0},
                ID: 2
            });
            expect(markers.getMarks(0,1)).toBeUndefined();
            expect(markers.getMarks(1,0)).toBeUndefined();
        });

        it("writes a marking object", function () {
            markers.setNewMarkers({
                start: {x: 0, y: 0},
                stop: {x: 0, y: 0},
                ID: 1
            });
            expect(markers.getMarks(0,0)).toEqual({ '1': {
                marking: {
                    start: {x: 0, y: 0},
                    stop: {x: 0, y: 0},
                    ID: 1,
                    fields: [ {x: 0, y: 0} ],
                    direction: 'origin' },
                img: 'origin' 
            } });
        });

        it("writes multiple marking objects", function () {
            markers.setNewMarkers({
                start: {x: 1, y: 0},
                stop: {x: 1, y: 2},
                ID: 1
            });
            markers.setNewMarkers({
                start: {x: 0, y: 1},
                stop: {x: 2, y: 1},
                ID: 2
            });
            expect(markers.getMarks(1,1)).toEqual({
                '1': {
                    marking: {
                        start: {x: 1, y: 0},
                        stop: {x: 1, y: 2},
                        ID: 1,
                        fields: [ {x: 1, y: 0}, {x: 1, y: 1}, {x: 1, y: 2} ],
                        direction: 'down' },
                    img: 'vertical' 
                },
                '2': {
                    marking: {
                        start: {x: 0, y: 1},
                        stop: {x: 2, y: 1},
                        ID: 2,
                        fields: [ {x: 0, y: 1}, {x: 1, y: 1}, {x: 2, y: 1} ],
                        direction: 'right' },
                    img: 'horizontal' 
                }
            });
        });

        it("sets images for direction right", function () {
            markers.setNewMarkers({
                start: {x: 2, y: 2},
                stop: {x: 4, y: 2},
                ID: 1
            });
            expect(markers.getMarks(2,2)['1'].marking.direction).toBe('right');
            expect(markers.getMarks(2,2)['1'].img).toBe('right');
            expect(markers.getMarks(3,2)['1'].img).toBe('horizontal');
            expect(markers.getMarks(4,2)['1'].img).toBe('left');
        });

        it("sets images for direction down", function () {
            markers.setNewMarkers({
                start: {x: 2, y: 2},
                stop: {x: 2, y: 4},
                ID: 1
            });
            expect(markers.getMarks(2,2)['1'].marking.direction).toBe('down');
            expect(markers.getMarks(2,2)['1'].img).toBe('down');
            expect(markers.getMarks(2,3)['1'].img).toBe('vertical');
            expect(markers.getMarks(2,4)['1'].img).toBe('up');
        });

        it("sets images for direction left", function () {
            markers.setNewMarkers({
                start: {x: 2, y: 2},
                stop: {x: 0, y: 2},
                ID: 1
            });
            expect(markers.getMarks(2,2)['1'].marking.direction).toBe('left');
            expect(markers.getMarks(2,2)['1'].img).toBe('left');
            expect(markers.getMarks(1,2)['1'].img).toBe('horizontal');
            expect(markers.getMarks(0,2)['1'].img).toBe('right');
        });

        it("sets images for direction up", function () {
            markers.setNewMarkers({
                start: {x: 2, y: 2},
                stop: {x: 2, y: 0},
                ID: 1
            });
            expect(markers.getMarks(2,2)['1'].marking.direction).toBe('up');
            expect(markers.getMarks(2,2)['1'].img).toBe('up');
            expect(markers.getMarks(2,1)['1'].img).toBe('vertical');
            expect(markers.getMarks(2,0)['1'].img).toBe('down');
        });

        it("sets images for direction down-right", function () {
            markers.setNewMarkers({
                start: {x: 2, y: 2},
                stop: {x: 4, y: 4},
                ID: 1
            });
            expect(markers.getMarks(2,2)['1'].marking.direction).toBe('down-right');
            expect(markers.getMarks(2,2)['1'].img).toBe('down-right');
            expect(markers.getMarks(3,2)['1'].img).toBe('corner-down-left');
            expect(markers.getMarks(2,3)['1'].img).toBe('corner-up-right');
            expect(markers.getMarks(3,3)['1'].img).toBe('diagonal-down');
            expect(markers.getMarks(4,3)['1'].img).toBe('corner-down-left');
            expect(markers.getMarks(3,4)['1'].img).toBe('corner-up-right');
            expect(markers.getMarks(4,4)['1'].img).toBe('up-left');
        });

        it("sets images for direction down-left", function () {
            markers.setNewMarkers({
                start: {x: 2, y: 2},
                stop: {x: 0, y: 4},
                ID: 1
            });
            expect(markers.getMarks(2,2)['1'].marking.direction).toBe('down-left');
            expect(markers.getMarks(1,2)['1'].img).toBe('corner-down-right');
            expect(markers.getMarks(2,2)['1'].img).toBe('down-left');
            expect(markers.getMarks(0,3)['1'].img).toBe('corner-down-right');
            expect(markers.getMarks(1,3)['1'].img).toBe('diagonal-up');
            expect(markers.getMarks(2,3)['1'].img).toBe('corner-up-left');
            expect(markers.getMarks(0,4)['1'].img).toBe('up-right');
            expect(markers.getMarks(1,4)['1'].img).toBe('corner-up-left');
        });

        it("sets images for direction up-right", function () {
            markers.setNewMarkers({
                start: {x: 2, y: 2},
                stop: {x: 4, y: 0},
                ID: 1
            });
            expect(markers.getMarks(2,2)['1'].marking.direction).toBe('up-right');
            expect(markers.getMarks(3,0)['1'].img).toBe('corner-down-right');
            expect(markers.getMarks(4,0)['1'].img).toBe('down-left');
            expect(markers.getMarks(2,1)['1'].img).toBe('corner-down-right');
            expect(markers.getMarks(3,1)['1'].img).toBe('diagonal-up');
            expect(markers.getMarks(4,1)['1'].img).toBe('corner-up-left');
            expect(markers.getMarks(2,2)['1'].img).toBe('up-right');
            expect(markers.getMarks(3,2)['1'].img).toBe('corner-up-left');
        });

        it("sets images for direction up-left", function () {
            markers.setNewMarkers({
                start: {x: 2, y: 2},
                stop: {x: 0, y: 0},
                ID: 1
            });
            expect(markers.getMarks(2,2)['1'].marking.direction).toBe('up-left');
            expect(markers.getMarks(0,0)['1'].img).toBe('down-right');
            expect(markers.getMarks(1,0)['1'].img).toBe('corner-down-left');
            expect(markers.getMarks(0,1)['1'].img).toBe('corner-up-right');
            expect(markers.getMarks(1,1)['1'].img).toBe('diagonal-down');
            expect(markers.getMarks(2,1)['1'].img).toBe('corner-down-left');
            expect(markers.getMarks(1,2)['1'].img).toBe('corner-up-right');
            expect(markers.getMarks(2,2)['1'].img).toBe('up-left');
        });

        it("exchanges the color of all markings in a word", function () {
            var fields = [{x: 0, y: 0}, {x: 1, y: 0}, {x: 2, y: 0}];
            markers.setNewMarkers({
                start: fields[0],
                stop: fields[2],
                ID: 1,
                color: 'red'
            });
            markers.setNewMarkers({
                start: fields[0],
                stop: fields[2],
                ID: 2,
                color: 'green'
            });
            markers.exchangeMarkers(fields, 1, 'blue');
            for (var i = 0; i < fields.length; i++) {
                expect(markers.getMarks(fields[i].x, fields[i].y)['1'].marking.color).toBe('blue');
                expect(markers.getMarks(fields[i].x, fields[i].y)['2'].marking.color).toBe('green');
            }
        });

        it("draws a set of markers", function () {
            markers.redrawMarkers(angular.copy(testdata.words));
            for (var ID in testdata.words) {
                if (testdata.words.hasOwnProperty(ID)) {
                    var fields = testdata.words[ID].fields;
                    for (var i = 0; i < fields.length; i++) {
                        expect(markers.getMarks(fields[i].x, fields[i].y)[ID]).toBeDefined();
                    }
                }
            }
            expect(markers.getMarks(0,2)).toBeUndefined();
        });

        it("shifts markers by redraw", function () {
            markers.setNewMarkers({
                start: {x: 0, y: 0},
                stop: {x: 2, y: 0},
                ID: 1
            });
            var word = angular.copy(markers.getMarks(0,0)['1'].marking);
            word.start.y = word.stop.y = 2;
            markers.redrawMarkers({'1': word});
            expect(markers.getMarks(0,0)['1']).toBeUndefined();
            expect(markers.getMarks(1,0)['1']).toBeUndefined();
            expect(markers.getMarks(2,0)['1']).toBeUndefined();
            expect(markers.getMarks(0,2)['1']).toBeDefined();
            expect(markers.getMarks(1,2)['1']).toBeDefined();
            expect(markers.getMarks(2,2)['1']).toBeDefined();
        });

        it("deletes a marker", function () {
            markers.redrawMarkers(angular.copy(testdata.words));
            markers.deleteMarking(6);
            var fields = testdata.words[6].fields;
            for (var i = 0; i < fields.length; i++) {
                expect(markers.getMarks(fields[i].x, fields[i].y)['6']).toBeUndefined();
            }
        });

        it("deletes all markings", function () {
            markers.redrawMarkers(angular.copy(testdata.words));
            markers.deleteAllMarking();
            for (var x = 0; x < 10; x++) {
                for (var y = 0; y < 7; y++) {
                    expect(markers.getMarks(x,y)).toBeUndefined();
                }
            }
        });
    });
});
