/* grid size controller */
crwApp.controller("SizeController", ['$scope', '$document', 'basics', 'StyleModelContainer',
        function ($scope, $document, basics, StyleModelContainer) {
    // one-letter sizes are pixel positions as they result from dragging,
    // -g sizes are adjusted to multiples of the grid size
    var size = basics.dimensions.field + basics.dimensions.fieldBorder,
        handleShift = basics.dimensions.handleOutside + basics.dimensions.tableBorder,
        handleSize = basics.dimensions.handleOutside + basics.dimensions.handleInside,
        t, b, l, r, lg, rg, tg, wg, hg, fwg, fhg, origin;

    // after each drag operation, irrespective of their success,
    // handles and left/top positioning of the table must be reset
    var resetSizes = function (cols, rows) {
        l = t = 0;
        r = (cols * size);
        b = (rows * size);
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

    // decide anchor side for horizontal styles
    var addSide = function (style) {
        if (basics.textIsLTR) {
            style.left = lg + 'px';
        } else {
            style.right = rg + 'px';
        }
    };
    // add a style model for each table side
    StyleModelContainer.add('size-left', -Infinity,
        (($scope.crosswordData.size.height - 3)*size), 0, 0);
    StyleModelContainer.add('size-top', 0, 0, -Infinity,
        (($scope.crosswordData.size.width - 3)*size));
    StyleModelContainer.add('size-right', (5*size), Infinity, 0, 0);
    StyleModelContainer.add('size-bottom', 0, 0, (5*size), Infinity);

    $scope.modLeft = StyleModelContainer.get('size-left');
    $scope.modTop = StyleModelContainer.get('size-top');
    $scope.modRight = StyleModelContainer.get('size-right');
    $scope.modBottom = StyleModelContainer.get('size-bottom');

    // init styles and setup watch for abstract size changes (fields, not pixels)
    resetSizes($scope.crosswordData.size.width, $scope.crosswordData.size.height);
    $scope.$watch('crosswordData.size', function (newSize) {
        resetSizes(newSize.width, newSize.height);
    });

    // style for left table side
    $scope.modLeft.addStyle('size-left', function (x, y) {
        l = x;
        lg = Math.ceil(l / size) * size;
        wg = Math.floor((r - lg) / size) * size;
        if ($scope.modRight) {
            $scope.modRight.minx = Math.floor(l / size) * size + (3*size);
        }
    });
    // style for left handle
    $scope.modLeft.addStyle('handle-left', function (x, y) {
        return {
            'left': (l - lg - handleShift) + 'px',
            'width': (lg - l + handleSize) + 'px'
        };
    });

    // style for top table side
    $scope.modTop.addStyle('size-top', function (x, y) {
        t = y;
        tg = Math.ceil(t / size) * size;
        hg = Math.floor((b - tg) / size) * size;
        if ($scope.modBottom) {
            $scope.modBottom.miny = Math.floor(t / size) * size + (3*size);
        }
    });
    // style for top handle
    $scope.modTop.addStyle('handle-top', function (x, y) {
        return {
            'top': (t - tg - handleShift) + 'px',
            'height': (tg - t + handleSize) + 'px'
        };
    });

    // style for right table side
    $scope.modRight.addStyle('size-right', function (x, y) {
        r = x;
        rg = Math.ceil((origin - r) / size) * size;
        wg = Math.floor((r - lg) / size) * size;
        if ($scope.modLeft) {
            $scope.modLeft.maxx = Math.floor(r / size) * size - (3*size);
        }
    });
    // style for right handle
    $scope.modRight.addStyle('handle-right', function (x, y) {
        return {
            'right': (lg + wg - r - handleShift) + 'px',
            'width': (r - lg - wg + handleSize) + 'px'
        };
    });

    // style for bottom table side
    $scope.modBottom.addStyle('size-bottom', function (x, y) {
        b = y;
        hg = Math.floor((b - tg) / size) * size;
        if ($scope.modTop) {
            $scope.modTop.maxy = Math.floor(b / size) * size - (3*size);
        }
    });
    // style for bottom handle
    $scope.modBottom.addStyle('handle-bottom', function (x, y) {
        return {
            'bottom': (tg + hg - b - handleShift) + 'px',
            'height': (b - tg - hg + handleSize) + 'px'
        };
    });

    // styles spanning multiple style models
    // table/grid wrapper changes only after stopResize
    $scope.styleCrossword = function () {
        return {
            'width': fwg + 'px',
            'height': (fhg + 40) + 'px'
        };
    };
    //background grid size spans changes during resize
    $scope.styleGridSize = function () {
        var style = {
            'width': (wg - basics.dimensions.fieldBorder) + 'px',
            'top': tg + 'px',
            'height': (hg - basics.dimensions.fieldBorder) + 'px'
        };
        addSide(style);
        return style;
    };
    // table and grid position changes during resize
    $scope.styleShift = function () {
        return {
            'top': -(tg + basics.dimensions.fieldBorder) + 'px',
            'left': -(lg + basics.dimensions.fieldBorder) + 'px'
        };
    };
    // fill/empty button position changes during resize
    $scope.styleExtras = function () {
        var style = {
            'top': (tg + hg + handleShift) + 'px',
            'width': (wg - basics.dimensions.fieldBorder) + 'px'
        };
        addSide(style);
        return style;
    };

    var currentSize;
    // resulting size in field units
    var abstractSize = function () {
        return {
            left: -lg / size,
            right: (lg + wg) / size,
            top: -tg / size,
            bottom: (tg + hg) / size
        };
    };

    // build page only: bind mouseup event handlers on mousedown
    $scope.startResize = function () {
        currentSize = abstractSize();
    };

    // build page only: inspect size change on mouseup
    $scope.stopResize = function () {
        var newSize = abstractSize();
        // test whether abstract size change results from dragging
        if (angular.equals(currentSize, newSize)) {
            resetSizes(currentSize.right + currentSize.left, currentSize.bottom + currentSize.top);
        } else {
            var change = {
                left: newSize.left - currentSize.left,
                right: newSize.right - currentSize.right,
                top: newSize.top - currentSize.top,
                bottom: newSize.bottom - currentSize.bottom
            };
            // test for words crossing the table boundaries
            var critical = $scope.crw.testWordBoundaries(change);
            if (critical.length) {
                // highlight words crossing the new table boundaries
                $scope.setHighlight(critical);
                // ask user whether change should be applied.
                $scope.immediateStore.newPromise('invalidWords', critical).then(function () {
                    // yes: apply all style changes.
                    $scope.crw.changeSize(change, critical);
                }, function () {
                    // no: reset styles
                    resetSizes(currentSize.right + currentSize.left, currentSize.bottom + currentSize.top);
                })['finally'](function () {
                    $scope.setHighlight([]);
                });
            } else {
                // reset styles
                $scope.crw.changeSize(change, critical);
            }
        }
    };
}]);
