/* grid size controller */
crwApp.controller("SizeController", ['$scope', '$document', 'basics', 'StyleModelContainer',
        function ($scope, $document, basics, StyleModelContainer) {
    // one-letter sizes are pixel positions as they result from dragging,
    // -g sizes are adjusted to multiples of the grid size
    var size = basics.fieldSize,
        t, b, l, r, lg, tg, wg, hg, fwg, fhg;

    // after each drag operation, irrespective of their success,
    // handles and left/top positioning of the table must be reset
    var resetSizes = function (cols, rows) {
        l = t = -1;
        r = (cols * size)+1;
        b = (rows * size)+1;
        lg = tg = 0;
        wg = fwg = cols * size;
        hg = fhg = rows * size;
        $scope.modLeft.transform(l, 0);
        $scope.modTop.transform(0, t);
        $scope.modRight.transform(r, 0);
        $scope.modBottom.transform(0, b);
    };

    // add a style model for each table side
    StyleModelContainer.add('size-left', -Infinity, (($scope.crosswordData.size.height - 3)*size)+1, 0, 0);
    StyleModelContainer.add('size-top', 0, 0, -Infinity, (($scope.crosswordData.size.width - 3)*size)+1);
    StyleModelContainer.add('size-right', (5*size)+1, Infinity, 0, 0);
    StyleModelContainer.add('size-bottom', 0, 0, (5*size)+1, Infinity);

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
        lg = Math.ceil((l + 1) / size) * size;
        wg = Math.floor((r - 1 - lg) / size) * size;
        if ($scope.modRight) {
            $scope.modRight.minx = Math.floor((l + 1) / size) * size + (3*size)+1;
        }
    });
    // style for left handle
    $scope.modLeft.addStyle('handle-left', function (x, y) {
        return {
            'left': (l - lg - 8) + 'px',
            'width': (lg - l + 12) + 'px'
        };
    });

    // style for top table side
    $scope.modTop.addStyle('size-top', function (x, y) {
        t = y;
        tg = Math.ceil((t + 1) / size) * size;
        hg = Math.floor((b - 1 - tg) / size) * size;
        if ($scope.modBottom) {
            $scope.modBottom.miny = Math.floor((t + 1) / size) * size + (3*size)+1;
        }
    });
    // style for top handle
    $scope.modTop.addStyle('handle-top', function (x, y) {
        return {
            'top': (t - tg - 8) + 'px',
            'height': (tg - t + 12) + 'px'
        };
    });

    // style for right table side
    $scope.modRight.addStyle('size-right', function (x, y) {
        r = x;
        wg = Math.floor((r - 1 - lg) / size) * size;
        if ($scope.modLeft) {
            $scope.modLeft.maxx = Math.floor((r - 1) / size) * size - (3*size)+1;
        }
    });
    // style for right handle
    $scope.modRight.addStyle('handle-right', function (x, y) {
        return {
            'right': (lg + wg - r - 8) + 'px',
            'width': (r - lg - wg + 12) + 'px'
        };
    });

    // style for bottom table side
    $scope.modBottom.addStyle('size-bottom', function (x, y) {
        b = y;
        hg = Math.floor((b - 1 - tg) / size) * size;
        if ($scope.modTop) {
            $scope.modTop.maxy = Math.floor((b - 1) / size) * size - (3*size)+1;
        }
    });
    // style for bottom handle
    $scope.modBottom.addStyle('handle-bottom', function (x, y) {
        return {
            'bottom': (tg + hg - b - 8) + 'px',
            'height': (b - tg - hg + 12) + 'px'
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
        return {
            'left': lg + 'px',
            'width': wg + 'px',
            'top': tg + 'px',
            'height': hg + 'px'
        };
    };
    // table and grid position changes during resize
    $scope.styleShift = function () {
        return {
            'left': -lg + 'px',
            'top': -tg + 'px'
        };
    };
    // fill/empty button position changes during resize
    $scope.styleExtras = function () {
        return {
            'left': lg + 'px',
            'top': (tg + hg + 8) + 'px'
        };
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
