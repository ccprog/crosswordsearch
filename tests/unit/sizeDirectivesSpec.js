describe("crwGridsize", function() {
    var $scope, element;

    beforeEach(module('crwApp'));
    beforeEach(inject(function($rootScope, basics, $compile) {
        basics.fieldSize = 30;
        basics.fieldShift = 2;
        $scope = $rootScope.$new();
        $scope.crosswordData = {
            size: { width: 8, height: 9 }
        };
        element = $compile('<svg crw-gridsize>' +
            '<pattern><path/></pattern>' +
            '<clipPath><rect/></clipPath>' +
            '</svg>')($scope);
        $scope.$apply();
    }));

    it("sizes the grid", function () {
        var pattern = element.find('pattern'),
            border = element.find('clipPath rect');
        expect(element.attr('viewBox')).toBe('0 0 240 270');
        expect(element.css('width')).toBe('240px');
        expect(element.css('height')).toBe('270px');
        expect(pattern.attr('x')).toBe('-2');
        expect(pattern.attr('y')).toBe('-2');
        expect(pattern.attr('width')).toBe('30');
        expect(pattern.attr('height')).toBe('30');
        expect(pattern.children('path').attr('d')).toBe('M 2 30 V 2 H 30');
        expect(border.attr('x')).toBe('0');
        expect(border.attr('y')).toBe('0');
        expect(border.attr('width')).toBe('240');
        expect(border.attr('height')).toBe('270');
    });

    it("changes the border size alone", function () {
        var border = element.find('clipPath rect');
        $scope.sizeBorder({
            x: -1, y: 2,
            width: 5, height: 12
        });
        expect(element.attr('viewBox')).toBe('0 0 240 270');
        expect(element.css('width')).toBe('240px');
        expect(element.css('height')).toBe('270px');
        expect(border.attr('x')).toBe('-30');
        expect(border.attr('y')).toBe('60');
        expect(border.attr('width')).toBe('150');
        expect(border.attr('height')).toBe('360');
    });

    it("changes all sizes on data change", function () {
        var border = element.find('clipPath rect');
        $scope.sizeBorder({
            x: -1, y: 2,
            width: 5, height: 12
        });
        $scope.$apply('crosswordData.size = { width: 6, height: 6}');
        expect(element.attr('viewBox')).toBe('0 0 180 180');
        expect(element.css('width')).toBe('180px');
        expect(element.css('height')).toBe('180px');
        expect(border.attr('x')).toBe('0');
        expect(border.attr('y')).toBe('0');
        expect(border.attr('width')).toBe('180');
        expect(border.attr('height')).toBe('180');
    });
});

describe("crwGridhandle", function () {
    var $compile, $rootScope, $scope, deferred, element, root;

    beforeEach(module('crwApp'));

    function compile (side) {
        var ns = 'http://www.w3.org/2000/svg';
        root = document.createElementNS(ns, 'svg');
        spyOn(root, 'getScreenCTM').and.callFake(function () {
            return {
                inverse: function () {
                    return root.createSVGMatrix();
                }
            };
        });
        var handle = document.createElementNS(ns, 'g');
        handle.setAttribute('crw-gridhandle', side);
        root.appendChild(handle);
        var outer = document.createElementNS(ns, 'svg');
        outer.setAttribute('class', 'gridhandle');
        handle.appendChild(outer);
        var inner = document.createElementNS(ns, 'svg');
        outer.appendChild(inner);
        inner.appendChild(document.createElementNS(ns, 'rect'));
        inner.appendChild(document.createElementNS(ns, 'use'));
        element = $compile(handle)($scope);
        $scope.$apply();
    }

    beforeEach(inject(function(_$rootScope_, basics, _$compile_, $q) {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        basics.fieldSize = 30;
        basics.handleWidth = 24;
        basics.handleOffset = 1;
        $scope = $rootScope.$new();
        $scope.crosswordData = {
            size: { width: 8, height: 9 }
        };
        $scope.sizeBorder = jasmine.createSpy('sizeBorder');
        $scope.testResize = jasmine.createSpy('testResize').and.callFake(function () {
            deferred = $q.defer();
            return deferred.promise;
        });
}));

    var handleData = [
        { side: 'top', forward: false, horizontal: false},
        { side: 'right', forward: true, horizontal: true},
        { side: 'bottom', forward: true, horizontal: false},
        { side: 'left', forward: false, horizontal: true}
    ];
    // positive: larger, negative: smaller
    var moveSequence = [
        { delta: 15, fields: 0, sizeBorder: false},
        { delta: 30, fields: 1, sizeBorder: true},
        { delta: 59, fields: 1, sizeBorder: false},
        { delta: -2, fields: -1, sizeBorder: true},
        { delta: -30, fields: -1, sizeBorder: false},
        { delta: -31, fields: -2, sizeBorder: true},
        { delta: -61, fields: -3, sizeBorder: true}
    ];

    handleData.forEach(function (data) {
        it("sizes the " + data.side + " handle", function () {
            var shift;
            compile(data.side);
            var outerSvg = element.children('.gridhandle');
            var innerSvg = outerSvg.children('svg');
            expect(element.scope().moving).toBe(false);
            if (data.horizontal) {
                shift = data.forward ? 239 : -23;
                expect(element.attr('transform')).toMatch(new RegExp('translate\\(' + shift + '( 0)*\\)'));
                expect(outerSvg.attr('width')).toBe('24');
                expect(outerSvg.attr('height')).toBe('60%');
                expect(innerSvg.attr('width')).toBe('24');
            } else {
                shift = data.forward ? 269 : -23;
                expect(element.attr('transform')).toBe('translate(0 ' + shift + ')');
                expect(outerSvg.attr('width')).toBe('60%');
                expect(outerSvg.attr('height')).toBe('24');
                expect(innerSvg.attr('height')).toBe('24');
            }
            innerSvg.children().each(function (idx, el) {
                var child = angular.element(el);
                var translate = data.horizontal ? 'translate\\(-24( 0)*\\)' : 'translate\\(0 -24\\)';
                if (data.forward) {
                    expect(child.attr('transform')).toMatch(new RegExp(translate));
                } else {
                    expect(child.attr('transform')).toBeUndefined();
                }
            });
            expect($scope.sizeBorder).not.toHaveBeenCalled();
        });

        it("repositions on data change", function () {
            var shift;
            compile(data.side);
            $scope.$apply('crosswordData.size = { width: 6, height: 6}');
            shift = data.forward ? 179 : -23;
            if (data.horizontal) {
                expect(element.attr('transform')).toMatch(new RegExp('translate\\(' + shift + '( 0)*\\)'));
            } else {
                expect(element.attr('transform')).toBe('translate(0 ' + shift + ')');
            }
            expect($scope.sizeBorder).not.toHaveBeenCalled();
        });

        it("moves the " + data.side + " handle", inject(function ($document) {
            var trueDelta, trueAbstract, shift, size, borderSize;
            compile(data.side);
            var outerSvg = element.children('.gridhandle');
            element.scope().startResize();
            expect(element.scope().moving).toBe(false);
            var event = jQuery.Event('mousemove');
            var start = 10;
            event.clientX = start;
            event.clientY = start;
            $document.trigger(event);
            expect(element.scope().moving).toBe(true);
            moveSequence.forEach(function (move) {
                //positive: right/bottom, negative: left/top
                trueDelta = data.forward ? move.delta : -move.delta;
                trueAbstract = data.forward ? move.fields : -move.fields;
                size = 24 + move.delta - move.fields * 30;
                borderSize = {
                    x: 0, y: 0, width: 8 , height: 9
                };
                if (data.horizontal) {
                    event.clientX = start + trueDelta;
                    event.clientY = start + Math.random() * 20 - 10;
                    $document.trigger(event);
                    shift = data.forward ? 239 + trueAbstract * 30 : -23 + trueDelta;
                    expect(element.attr('transform')).toMatch(new RegExp('translate\\(' + shift + '( 0)*\\)'));
                    expect(outerSvg.attr('width')).toBe(size.toString());
                    if (move.sizeBorder) {
                        if (!data.forward) {borderSize.x = trueAbstract;}
                        borderSize.width += move.fields;
                        expect($scope.sizeBorder.calls.argsFor(0)[0]).toEqual(borderSize);
                    }
                } else {
                    event.clientX = start + Math.random() * 20 - 10;
                    event.clientY = start + trueDelta;
                    $document.trigger(event);
                    shift = data.forward ? 269 + trueAbstract * 30 : -23 + trueDelta;
                    expect(element.attr('transform')).toBe('translate(0 ' + shift + ')');
                    expect(outerSvg.attr('height')).toBe(size.toString());
                    if (move.sizeBorder) {
                        if (!data.forward) {borderSize.y = trueAbstract;}
                        borderSize.height += move.fields;
                        expect($scope.sizeBorder.calls.argsFor(0)[0]).toEqual(borderSize);
                    }
                }
                if (!move.sizeBorder) {
                    expect($scope.sizeBorder).not.toHaveBeenCalled();
                }
                $scope.sizeBorder.calls.reset();
            });
            expect($scope.testResize).not.toHaveBeenCalled();
            element.scope().stopResize();
            expect(element.scope().moving).toBe(false);
            expect($scope.testResize).toHaveBeenCalledWith(data.side, trueAbstract);
            deferred.resolve();
            $scope.$apply();
            expect($scope.sizeBorder).not.toHaveBeenCalled();
        }));
    });

    it("resets position if testResize fails", inject(function ($document) {
        compile('right');
        var outerSvg = element.children('.gridhandle');
        element.scope().startResize();
        var event = jQuery.Event('mousemove');
        event.clientX = event.clientY = 10;
        $document.trigger(event);
        event.clientX = -10;
        $document.trigger(event);
        expect(element.attr('transform')).toMatch(new RegExp('translate\\(209( 0)*\\)'));
        expect(outerSvg.attr('width')).toBe('34');
        expect($scope.sizeBorder.calls.argsFor(0)[0]).toEqual({
            x: 0, y: 0, width: 7, height: 9
        });
        element.scope().stopResize();
        expect($scope.testResize).toHaveBeenCalledWith('right', -1);
        deferred.reject();
        $scope.$apply();
        expect(element.attr('transform')).toMatch(new RegExp('translate\\(239( 0)*\\)'));
        expect(outerSvg.attr('width')).toBe('24');
        expect($scope.sizeBorder.calls.argsFor(1)[0]).toEqual({
            x: 0, y: 0, width: 8, height: 9
        });
    }));

    it("does not resize below minimum size", inject(function ($document) {
        compile('right');
        element.scope().startResize();
        var event = jQuery.Event('mousemove');
        event.clientX = event.clientY = 0;
        $document.trigger(event);
        event.clientX = -148;
        $document.trigger(event);
        expect($scope.sizeBorder.calls.argsFor(0)[0]).toEqual({
            x: 0, y: 0, width: 3, height: 9
        });
        event.clientX = -152;
        $document.trigger(event);
        expect($scope.sizeBorder.calls.count()).toBe(1);
        element.scope().stopResize();
        expect($scope.testResize).toHaveBeenCalledWith('right', -5);
    }));
});

describe("crwGridfield", function() {
    var $compile, $rootScope, $scope, element;

    beforeEach(module('crwApp'));

    function compile (mode) {
        $scope.mode = mode;
        $scope.line = 2;
        $scope.column = 3;
        element = $compile('<g crw-gridfield>' +
            '<rect class="gridlight"/><text class="gridletter">{{field.letter}}</text>' +
            '</g>')($scope);
        $scope.$apply();
    }

    beforeEach(inject(function(_$rootScope_, basics, _$compile_) {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        basics.fieldSize = 30;
        basics.fieldShift = 2;
        $scope = $rootScope.$new();
    }));

    it("positions the field", function () {
        compile('solve');
        var highlight = element.children('.gridlight'),
            letter = element.children('.gridletter');
        expect(highlight.attr('x')).toBe('93');
        expect(highlight.attr('y')).toBe('63');
        expect(highlight.attr('width')).toBe('24');
        expect(highlight.attr('height')).toBe('24');
        expect(letter.attr('x')).toBe('105');
        expect(letter.attr('y')).toBe('75');
    });

    it("activates on click event in build mode", function () {
        $scope.activate = jasmine.createSpy('activate');
        compile('solve');
        element.trigger('click');
        expect($scope.activate).not.toHaveBeenCalled();
        compile('preview');
        element.trigger('click');
        expect($scope.activate).not.toHaveBeenCalled();
        compile('build');
        element.trigger('click');
        expect($scope.activate).toHaveBeenCalledWith(2, 3);
    });

    it("toggles highlight on setFocus event in build mode", function () {
        compile('solve');
        $rootScope.$broadcast('setFocus', 2, 3);
        expect(element.children('.gridlight').hasClass('active')).toBe(false);
        compile('preview');
        $rootScope.$broadcast('setFocus', 2, 3);
        expect(element.children('.gridlight').hasClass('active')).toBe(false);
        compile('build');
        $rootScope.$broadcast('setFocus', 2, 4);
        expect(element.children('.gridlight').hasClass('active')).toBe(false);
        $rootScope.$broadcast('setFocus', 2, 3);
        expect(element.children('.gridlight').hasClass('active')).toBe(true);
        $rootScope.$broadcast('setFocus', 1, 0);
        expect(element.children('.gridlight').hasClass('active')).toBe(false);
        $rootScope.$broadcast('setFocus', 5, 3);
        expect(element.children('.gridlight').hasClass('active')).toBe(false);
    });

    it("detects mouseenter and mouseleave events outside preview mode", function () {
        $scope.intoField = jasmine.createSpy('intoField');
        $scope.outofField = jasmine.createSpy('outofField');
        compile('preview');
        element.trigger('mouseenter');
        expect($scope.intoField).not.toHaveBeenCalled();
        element.trigger('mouseleave');
        expect($scope.outofField).not.toHaveBeenCalled();
        compile('solve');
        element.trigger('mouseenter');
        expect($scope.intoField).toHaveBeenCalledWith(2, 3);
        element.trigger('mouseleave');
        expect($scope.outofField).toHaveBeenCalledWith(2, 3);
        $scope.intoField.calls.reset();
        $scope.outofField.calls.reset();
        compile('solve');
        element.trigger('mouseenter');
        expect($scope.intoField).toHaveBeenCalledWith(2, 3);
        element.trigger('mouseleave');
        expect($scope.outofField).toHaveBeenCalledWith(2, 3);
    });
});

describe("crwGridline", function() {
    beforeEach(module('crwApp'));
    
    it("adjusts the line coordinates on marking change", inject(function($rootScope, basics, $compile) {
        basics.fieldSize = 30;
        var $scope = $rootScope.$new();
        var element = $compile('<line crw-gridline="marking" />')($scope);
        $scope.marking = {};
        $scope.$apply('marking.start = {x: 1, y: 0}');
        expect(element.attr('x1')).not.toBeDefined();
        expect(element.attr('y1')).not.toBeDefined();
        expect(element.attr('x2')).not.toBeDefined();
        expect(element.attr('y2')).not.toBeDefined();
        $scope.$apply('marking.stop = {x: 3, y: 4}');
        expect(element.attr('x1')).toBe('45');
        expect(element.attr('y1')).toBe('15');
        expect(element.attr('x2')).toBe('105');
        expect(element.attr('y2')).toBe('135');
        $scope.$apply('marking.stop = {x: 4, y: 4}');
        expect(element.attr('x1')).toBe('45');
        expect(element.attr('y1')).toBe('15');
        expect(element.attr('x2')).toBe('135');
        expect(element.attr('y2')).toBe('135');
        $scope.$apply('marking.start = {x: 2, y: 1}');
        expect(element.attr('x1')).toBe('75');
        expect(element.attr('y1')).toBe('45');
        expect(element.attr('x2')).toBe('135');
        expect(element.attr('y2')).toBe('135');
    }));
});
