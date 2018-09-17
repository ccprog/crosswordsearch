/* table markings data object provider */
crwApp.factory('markerFactory', ['basics', function (basics) {
    function Markers () {
        // wrapper object
        var markers = {};

        // add a marker to a field. For each field that has markers,
        // under its coordinates, an array is provided containing
        // an object {marking: ..., img: ...} for each individual image.
        // marking is a reference to the producing marking object,
        // img the CSS class name for the individual marker part
        function add (marking, x, y, img) {
            if (img != null) {
                if (markers[x] == null) {
                    markers[x] = {};
                }
                if (markers[x][y] == null) {
                    markers[x][y] = {};
                }
                markers[x][y][marking.ID] = {marking: marking, img: img};
            }
        }

        // loop through the fields of a marking object to set the individual markers
        // swap identifies reverse direction of the sequence
        // (identified by the calling function)
        function setMarkers (marking, swap) {
            var mapping = basics.directionMapping[marking.direction];

            angular.forEach(marking.fields, function (field, i) {
                if (i === 0) {
                    add(marking, field.x, field.y,marking.direction);
                    if (marking.direction === 'origin') {
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

        // add a new marking sequence or exchange it with altered positioning
        // (as during mouse movement)
        // If it already exists, marking.fields will be overwritten or otherwise
        // added and the sequence of fields between .start and .stop computed
        this.setNewMarkers = function (marking) {
            var from = marking.start, to = marking.stop;
            var i, dif_x = to.x - from.x, dif_y = to.y - from.y;
            var swap = dif_x < 0 || (dif_x === 0 && dif_y < 0);

            this.deleteMarking(marking.ID);
            marking.fields = [];
            if (dif_x * dif_y > 0) {
                marking.direction = swap ? "up-left" : "down-right";
                for (i = 0; Math.abs(i) <= Math.abs(to.x - from.x); swap ? i-- : i++) {
                    marking.fields.push({ x: from.x + i, y: from.y + i });
                }
            } else if (dif_x * dif_y < 0) {
                marking.direction = swap ? "down-left" : "up-right";
                for (i = 0; Math.abs(i) <= Math.abs(to.x - from.x); swap ? i-- : i++) {
                    marking.fields.push({ x: from.x + i, y: from.y - i });
                }
            } else {
                if (dif_x === 0 && dif_y === 0) {
                    marking.direction = "origin";
                    marking.fields.push({ x: from.x, y: from.y  });
                } else if (dif_x === 0) {
                    marking.direction = swap ? "up" : "down";
                    for (i = 0; Math.abs(i) <= Math.abs(to.y - from.y); swap ? i-- : i++) {
                        marking.fields.push({ x: from.x, y: from.y + i });
                    }
                } else {
                    marking.direction = swap ? "left" : "right";
                    for (i = 0; Math.abs(i) <= Math.abs(to.x - from.x); swap ? i-- : i++) {
                        marking.fields.push({ x: from.x + i, y: from.y });
                    }
                }
            }

            setMarkers(marking, swap);
        };

        // trigger the color change of a marking
        this.exchangeMarkers = function (fields, id, color) {
            fields.forEach(function(field) {
                markers[field.x][field.y][id].marking.color = color;
            });
        };

        // redraw all markers, either on initial load or as the result of a table resize
        // shift_x, shift_y shift marking positions and are left/down coordinates (optional))
        this.redrawMarkers = function (markings) {
            angular.forEach(markings, function (marking) {
                var shift_x = 0, shift_y = 0;
                var from = marking.start, to = marking.stop;
                var swap = to.x < from.x || (to.x === from.x && to.y < from.y);

                this.deleteMarking(marking.ID);
                if (marking.fields.length) {
                    shift_x = from.x - marking.fields[0].x;
                    shift_y = from.y - marking.fields[0].y;
                }
                marking.fields.forEach(function (field) {
                    field.x += shift_x;
                    field.y += shift_y;
                });

                setMarkers(marking, swap);
            }, this);
        };

        // return all markers for one field as an array
        this.getMarks = function (x, y) {
            if (markers[x] == null || y == null) {
                return undefined;
            }
            return markers[x][y];
        };

        // delete one marking identified by its id
        this.deleteMarking = function (id) {
            angular.forEach(markers, function(x) {
                angular.forEach(x, function (y) {
                    delete y[id];
                });
            });
        };

        // delete all markings
        this.deleteAllMarking = function () {
            markers = {};
        };
    }

    return {
        getMarkers: function () {
            return new Markers();
        }
    };
}]);
