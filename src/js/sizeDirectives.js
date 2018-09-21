// directive for sizing static elements
crwApp.directive("crwGridsize", ['basics', function (basics) {
    return {
        link: function (scope, element, attrs) {
            var pattern = element.find('#crw-gridpattern'),
                border = element.children('.gridborder');

            var path = [
                'M', basics.dimensions.shift, basics.dimensions.size,
                'V', basics.dimensions.shift,
                'H', basics.dimensions.size
            ].join(' ');
            pattern.attr('x', -basics.dimensions.shift)
                .attr('y', -basics.dimensions.shift)
                .attr('width', basics.dimensions.size)
                .attr('height', basics.dimensions.size);
                pattern.children('path').attr('d', path);

            if (scope.mode = 'build') {
                // to be determined from basics.dimensions
                scope.handleSize = {
                    width: 20,
                    offset: 0
                };
            }

            scope.$watch('crosswordData.size', function (newSize) {
                if(!newSize) return;
                var viewBox = [
                    0,
                    0,
                    basics.dimensions.size * newSize.width,
                    basics.dimensions.size * newSize.height
                ];
                element.attr('viewBox', viewBox.join(' '));
                element.css({
                    width: viewBox[2],
                    height: viewBox[3]
                });

                border.attr('width', viewBox[2]);
                border.attr('height', viewBox[3]);
            });
        }
    };
}]);

// directive for sizing letter fields
crwApp.directive('crwGridfield', ['basics', function (basics) {
    return {
        link: function (scope, element) {
            var highlight = element.children('.gridlight'),
                letter = element.children('.gridletter');

            highlight.attr('width', basics.dimensions.size - 2 * (basics.dimensions.shift + 1))
                .attr('height', basics.dimensions.size - 2 * (basics.dimensions.shift + 1));

            if (scope.mode === 'build') {
                element.on('click', function () {
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

            scope.$watchGroup(['line', 'column'], function (newValues, oldValues) {
                if  (!newValues) return;

                highlight.attr('x', basics.dimensions.size * newValues[1] + basics.dimensions.shift + 1)
                    .attr('y', basics.dimensions.size * newValues[0] + basics.dimensions.shift + 1);

                letter.attr('x', basics.dimensions.size * newValues[1] + basics.dimensions.size / 2)
                    .attr('y', basics.dimensions.size * newValues[0] + basics.dimensions.size / 2);
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
                if (!newValues[0] || !newValues[1]) return;
                element.attr('x1', basics.dimensions.size * newValues[0].x + basics.dimensions.size / 2);
                element.attr('y1', basics.dimensions.size * newValues[0].y + basics.dimensions.size / 2);
                element.attr('x2', basics.dimensions.size * newValues[1].x + basics.dimensions.size / 2);
                element.attr('y2', basics.dimensions.size * newValues[1].y + basics.dimensions.size / 2);
            });
        }
    };
}]);
