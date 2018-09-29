// directive for sizing the grid
crwApp.directive("crwGridsize", ['basics', function (basics) {
    return {
        link: function (scope, element) {
            var pattern = element.find('pattern'),
                border = element.find('clipPath rect');

            var path = [
                'M', basics.fieldShift, basics.fieldSize,
                'V', basics.fieldShift,
                'H', basics.fieldSize
            ].join(' ');
            pattern.attr({
                x: -basics.fieldShift,
                y: -basics.fieldShift,
                width: basics.fieldSize,
                height: basics.fieldSize
            });
            pattern.children('path').attr('d', path);

            function computeBorderBox (abstractSize) {
                var boxSize = {};
                angular.forEach(abstractSize, function (size, key) {
                    boxSize[key] = size * basics.fieldSize;
                });
                return boxSize;
            }

            scope.sizeBorder = function (abstractSize) {
                border.attr(computeBorderBox(abstractSize));
            };

            scope.$watch('crosswordData.size', function (newSize) {
                if(!newSize) { return; }
                var viewBox = computeBorderBox({
                    x: 0, y: 0,
                    width: newSize.width, height: newSize.height
                });

                element.attr('viewBox', jQuery.map(viewBox, angular.identity).join(' '));
                border.attr(viewBox);
                delete viewBox.x;
                delete viewBox.y;
                element.css(viewBox);
            });
        }
    };
}]);

// directive for moving the handles
crwApp.directive('crwGridhandle', ['$document', 'basics', function ($document, basics) {
    return {
        scope: true,
        link: function (scope, element, attrs) {
            var root = element[0].ownerSVGElement;
            var from = root.createSVGPoint(),
                to = root.createSVGPoint();
            from.x = from.y = to.x = to.y = 0;
            var delta = 0;

            var outerSvg = element.children('.gridhandle');
            var innerSvg = outerSvg.children('svg');

            scope.moving = false;

            function move () {
                var translate = [0, 0], abstract, length;
                var borderSize = angular.copy(scope.crosswordData.size);
                borderSize.x = borderSize.y = 0;
                var handleSize = {
                    height: '60%',
                    width: '60%'
                };

                switch (attrs.crwGridhandle) {
                case 'top':
                    abstract = Math.ceil((to.y - from.y) / basics.fieldSize);
                    borderSize.y = abstract;
                    borderSize.height = length = scope.crosswordData.size.height - abstract;
                    handleSize.height = basics.handleWidth;
                    translate[1] = basics.handleOffset - basics.handleWidth;
                    if (scope.moving) {
                        handleSize.height += -to.y + from.y + abstract * basics.fieldSize;
                        translate[1] += to.y - from.y;
                    } else {
                        translate[1] += abstract * basics.fieldSize;
                    }
                    break;
                case 'bottom':
                    abstract = Math.floor((to.y - from.y) / basics.fieldSize);
                    borderSize.height = length = scope.crosswordData.size.height + abstract;
                    handleSize.height = basics.handleWidth;
                    if (scope.moving) {
                        handleSize.height += to.y - from.y - abstract * basics.fieldSize;
                    }
                    translate[1] = borderSize.height * basics.fieldSize - basics.handleOffset;
                    break;
                case 'left':
                    abstract = Math.ceil((to.x - from.x) / basics.fieldSize);
                    borderSize.x = abstract;
                    borderSize.width = length = scope.crosswordData.size.width - abstract;
                    handleSize.width = basics.handleWidth;
                    translate[0] = basics.handleOffset - basics.handleWidth;
                    if (scope.moving) {
                        handleSize.width += -to.x + from.x + abstract * basics.fieldSize;
                        translate[0] += to.x - from.x;
                    } else {
                        translate[0] += abstract * basics.fieldSize;
                    }
                    break;
                case 'right':
                    abstract = Math.floor((to.x - from.x) / basics.fieldSize);
                    borderSize.width = length = scope.crosswordData.size.width + abstract;
                    handleSize.width = basics.handleWidth;
                    if (scope.moving) {
                        handleSize.width += to.x - from.x - abstract * basics.fieldSize;
                    }
                    translate[0] = borderSize.width * basics.fieldSize - basics.handleOffset;
                    break;
                }

                if (length > 2) {
                    element.attr('transform', 'translate(' + translate.join(' ') + ')');
                    outerSvg.attr(handleSize);
                    if (abstract !== delta) {
                        delta = abstract;
                        scope.sizeBorder(borderSize);
                    }
                    return abstract;
                }
                return delta;
            }
            scope.$watch('crosswordData.size', move);

            switch (attrs.crwGridhandle) {
            case 'bottom':
                innerSvg.children().attr('transform', 'translate(0 -' + basics.handleWidth + ')');
                /* falls through */
            case 'top':
                innerSvg.attr('height', basics.handleWidth);
                break;
            case 'right':
                innerSvg.children().attr('transform', 'translate(-' + basics.handleWidth + ' 0)');
                /* falls through */
            case 'left':
                innerSvg.attr('width', basics.handleWidth);
                break;
            }

            function onMouseMove (event) {
                var transform = root.getScreenCTM().inverse();
                if (!scope.moving) {
                    from.x = event.clientX;
                    from.y = event.clientY;
                    from = from.matrixTransform(transform);
                    scope.moving = true;
                }
                to.x = event.clientX;
                to.y = event.clientY;
                to = to.matrixTransform(transform);
                move();
            }

            scope.startResize = function () {
                $document.on('mousemove', onMouseMove);
            };

            scope.stopResize = function () {
                $document.off('mousemove', onMouseMove);
                scope.moving = false;
                var change = move();
                from.x = from.y = to.x = to.y = 0;
                if (change) {
                    scope.testResize(attrs.crwGridhandle, change).then(angular.noop, move);
                }
            };
        }
    };
}]);

// directive for sizing letter fields
crwApp.directive('crwGridfield', ['basics', function (basics) {
    return {
        link: function (scope, element) {
            var highlight = element.children('.gridlight'),
                letter = element.children('.gridletter');

            highlight.attr({
                width: basics.fieldSize - 2 * (basics.fieldShift + 1),
                height: basics.fieldSize - 2 * (basics.fieldShift + 1)
            });

            if (scope.mode === 'build') {
                element.on('click', function (event) {
                    event.preventDefault();
                    scope.$apply('activate(line, column)');
                });
                scope.$on('setFocus', function(event, line, column) {
                    highlight.toggleClass('active', line === scope.line && column === scope.column);
                });
            }

            if (scope.mode !== 'preview') {
                element.on('mouseenter', function () {
                    scope.$apply('intoField(line, column)');
                });
                element.on('mouseleave', function () {
                    scope.$apply('outofField(line, column)');
                });
            }

            scope.$watchGroup(['line', 'column'], function (newValues) {
                if  (!newValues) { return; }

                highlight.attr({
                    x: basics.fieldSize * newValues[1] + basics.fieldShift + 1,
                    y: basics.fieldSize * newValues[0] + basics.fieldShift + 1
                });
                letter.attr({
                    x: basics.fieldSize * newValues[1] + basics.fieldSize / 2,
                    y: basics.fieldSize * newValues[0] + basics.fieldSize / 2
                });
            });
        }
    };
}]);

// directive for sizing word markings
crwApp.directive("crwGridline", ['basics', function (basics) {
    return {
        link: function (scope, element, attrs) {
            var start = attrs.crwGridline + '.start',
                stop = attrs.crwGridline + '.stop';
            scope.$watchGroup([start, stop], function (newValues) {
                if (!newValues[0] || !newValues[1]) { return; }
                element.attr({
                    x1: basics.fieldSize * newValues[0].x + basics.fieldSize / 2,
                    y1: basics.fieldSize * newValues[0].y + basics.fieldSize / 2,
                    x2: basics.fieldSize * newValues[1].x + basics.fieldSize / 2,
                    y2: basics.fieldSize * newValues[1].y + basics.fieldSize / 2
                });
            });
        }
    };
}]);
