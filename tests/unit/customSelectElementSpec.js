describe("cseDefault", function() {
    var $scope, $compile;

    beforeEach(module('customSelectElement'));
    beforeEach(inject(function($rootScope, _$compile_) {
        $compile = _$compile_;
        $scope = $rootScope.$new();
    }));

    it("default template handles values and objects", function() {
        var element = $compile('<span cse-default value="model"></span>')($scope);
        $scope.model = 'value1';
        $scope.$apply();
        expect(element.html()).toBe('value1');
        $scope.model = {value: 'value2'};
        $scope.$apply();
        expect(element.html()).toBe('value2');
    });

    it("evaluates custom expressions", function() {
        var element = $compile('<span cse-default="value.substr(0, 3) + \'..\'" value="model"></span>')($scope);
        $scope.model = 'green';
        $scope.$apply();
        expect(element.html()).toBe('gre..');
    });
});

describe("cseOption", function() {
    var $root, $scope, $isolate, $compile;

    function compile (attributes, initial) {
        $scope = $root.$new();
        var html = '<li cse-option name="theSelect" value="opt" templ="cse-default"';
        for (item in attributes) {
            html += ' ' + item;
            if (attributes[item] !== null) {
                html += '="' + attributes[item] + '"';
            }
        }
        html += '></li>';
        if (angular.isDefined(initial)) {
            $scope.opt = initial;
        }
        element = $compile(html)($scope);
        $isolate = $scope.$$childHead;
        spyOn($isolate, 'select');
        $scope.$apply();
    }

    beforeEach(module('customSelectElement'));
    beforeEach(inject(function($rootScope, _$compile_) {
        $compile = _$compile_;
        $root = $rootScope.$new();
    }));

    it("emits cseSelect event", function() {
        compile({});
        $root.listener = jasmine.createSpy('listener');
        $root.$on('cseSelect', $root.listener);
        $isolate.select.and.callThrough();
        $isolate.select('value');
        expect($root.listener.calls.argsFor(0)[1]).toBe('theSelect');
        expect($root.listener.calls.argsFor(0)[2]).toBe('value');
    });

    it("passes through expression", function() {
        compile({}, 'value');
        expect(element.find('div').attr('cse-default')).toBe('');
        expect(element.find('div').attr('value')).toBe('value');
        compile({expr: 'expr'}, 'value');
        expect(element.find('div').attr('cse-default')).toBe('expr');
    });

    it("handles values and objects", function() {
        compile({}, 'value1');
        expect(element.find('div').attr('ng-click')).toBe('select(value)');
        compile({}, {value: 'value2'});
        expect(element.find('div').attr('ng-click')).toBe('select(value.value)');
    });

    it("handles submenus", function() {
        compile({}, {group: 'group', menu: 'sub1'});
        var sub = element.find('dl');
        expect(sub.attr('cse-select')).toBe('theSelect.sub');
        expect(sub.attr('cse-model')).toBe('head');
        expect(sub.attr('cse-options')).toBe('value.group');
        expect(sub.attr('cse-select')).toBe('theSelect.sub');
        expect(sub.attr('is-group')).toBe('');
        expect(sub.attr('template')).toBe('cse-default');
        compile({expr: 'expr', 'is-menu': null}, {group: 'group', menu: 'sub2'});
        sub = element.find('dl');
        expect(sub.attr('display')).toBe('expr');
        expect(sub.attr('is-menu')).toBe('sub2');
    });
});

describe("cseSelect", function() {
    var $root, $scope, $isolate, $compile, element;

    function compile (attributes, list) {
        $scope = $root.$new();
        var html = '<dl cse-select="theSelect" cse-model="result" cse-options="list"';
        for (item in attributes) {
            html += ' ' + item;
            if (attributes[item] !== null) {
                html += '="' + attributes[item] + '"';
            }
        }
        html += '></dl>';
        $scope.list = list;
        element = $compile(html)($scope);
        $isolate = $scope.$$childHead;
        $scope.$apply();
    }

    beforeEach(module('customSelectElement'));
    beforeEach(inject(function($rootScope, _$compile_) {
        $compile = _$compile_;
        $root = $rootScope.$new();
    }));

    it("sets classes on wrapper", function() {
        compile({}, []);
        expect(element.hasClass('cse')).toBe(true);
        expect(element.hasClass('select')).toBe(true);
    });

    it("builds html", function() {
        compile({}, ['entry']);
        var dt = element.children('dt');
        expect(dt).toBeDefined();
        var div = dt.children('div');
        expect(div.attr('ng-show')).toBe('isDefined(model)');
        expect(div.attr('value')).toBe('model');
        expect(div.attr('is-current')).toBe('');
        var a = dt.children('a');
        expect(a.hasClass('btn')).toBe(true);
        var dd = element.children('dd');
        expect(dd.attr('ng-show')).toBe('visible');
        var li = dd.find('ul li');
        expect(li.attr('ng-repeat')).toBe('opt in options | orderBy:\'order\'');
        expect(li.attr('cse-option')).toBe('');
        expect(li.attr('name')).toBe('theSelect');
        expect(li.attr('model')).toBe('result');
        expect(li.attr('value')).toBe('opt');
    });

    it("handles expressions and templates", function() {
        compile({}, ['entry']);
        expect(element.find('dt div').attr('cse-default')).toBe('');
        expect(element.find('dd ul li').attr('templ')).toBe('cse-default');
        expect(element.find('dd ul li').attr('expr')).toBeUndefined();
        compile({display: 'compute'}, ['entry']);
        expect(element.find('dt div').attr('cse-default')).toBe('compute');
        expect(element.find('dd ul li').attr('templ')).toBe('cse-default');
        expect(element.find('dd ul li').attr('expr')).toBe('compute');
        compile({template: 'template'}, ['entry']);
        expect(element.find('dt div').attr('template')).toBe('');
        expect(element.find('dd ul li').attr('templ')).toBe('template');
        expect(element.find('dd ul li').attr('expr')).toBeUndefined();
    });

    it("handles groups and menus", function() {
        compile({}, ['entry']);
        expect(element.find('dt').attr('ng-click')).toBe('visible=!visible');
        expect($isolate.setModel).toBe(true);
        compile({'is-group': null, 'is-menu': 'Menu...'}, ['entry']);
        expect(element.find('dt').attr('ng-mouseenter')).toBe('showEnter()');
        expect(element.find('dt').attr('ng-mouseleave')).toBe('hideLeave()');
        expect(element.find('dd').attr('ng-mouseenter')).toBe('showEnter()');
        expect(element.find('dd').attr('ng-mouseleave')).toBe('hideLeave()');
        expect($scope.result).toBe('Menu...');
        expect($isolate.setModel).toBe(false);
        expect(element.find('dd ul li').attr('is-menu')).toBe('');
    });

    it("sets visibility", function() {
        compile({}, ['entry']);
        expect($isolate.visible).toBe(false);
        element.find('dt a').click();
        expect($isolate.visible).toBe(true);
        element.find('dt a').click();
        expect($isolate.visible).toBe(false);
    });

    it("sets visibility on hover for group", inject(function($timeout) {
        compile({'is-group': null}, ['entry']);
        spyOn($isolate, 'showEnter').and.callThrough();
        spyOn($isolate, 'hideLeave').and.callThrough();
        expect($isolate.visible).toBe(false);
        element.find('dt').mouseenter();
        expect($isolate.showEnter).toHaveBeenCalled();
        expect($isolate.visible).toBe(true);
        element.find('dt').mouseleave();
        expect($isolate.hideLeave).toHaveBeenCalled();
        $timeout.flush(190);
        expect($isolate.visible).toBe(true);
        $timeout.flush(10);
        expect($isolate.visible).toBe(false);
        element.find('dt').mouseenter();
        element.find('dt').mouseleave();
        $timeout.flush(150);
        element.find('dt').mouseenter();
        element.find('dt').mouseleave();
        expect($isolate.visible).toBe(true);
        $timeout.flush(190);
        expect($isolate.visible).toBe(true);
        $timeout.flush(10);
        expect($isolate.visible).toBe(false);
    }));

    it("sets model on cseSelect event", function() {
        compile({}, ['entry']);
        element.find('dt a').click();
        expect($isolate.visible).toBe(true);
        $isolate.$emit('cseSelect', null, 'value');
        $scope.$apply();
        expect($isolate.visible).toBe(false);
        expect($scope.result).toBe('value');
        compile({'is-menu': 'Menu...'}, ['entry']);
        element.find('dt a').click();
        $isolate.$emit('cseSelect', null, 'value');
        $scope.$apply();
        expect($scope.result).toBe('Menu...');
    });
});
