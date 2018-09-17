describe ("localeNumber filter", function () {
    var localeNumber;

    beforeEach(function () {
        module('crwApp');
        inject(function($injector) {
            localeNumber = $injector.get('localeNumberFilter');
        });
    });

    it("does not alter latin numerals", function () {
        expect(localeNumber(1234)).toBe(1234);
    });

    it("returns arabic numerals", function () {
        crwBasics.numerals = "arab";
        expect(localeNumber(1234)).toBe('١٢٣٤');
    });

    it("returns arabic extended numerals", function () {
        crwBasics.numerals = "arabext";
        expect(localeNumber(1234)).toBe('۱۲۳۴');
    });
});

describe("crwInteger", function() {
    var $scope, $compile, element, model;
    var testArray = [
        { val: null, integer: false },
        { val: '-2', integer: true },
        { val: '-1', integer: true },
        { val: '0', integer: true },
        { val: '1', integer: true },
        { val: '1.3', integer: false },
        { val: '563', integer: true },
        { val: 'abc', integer: false },
        { val: '3s', integer: false }
    ];

    function compile (min) {
        element = $compile('<form name="frm"><input name="dim" type="text" ng-model="value" ' +
            'ng-disabled="disabled" crw-integer="type" min="' + min + '"></input></form>')($scope);
        model = element.find('input').controller('ngModel');
    }

    beforeEach(module('crwApp'));
    beforeEach(inject(function($rootScope, _$compile_) {
        $compile = _$compile_;
        $scope = $rootScope.$new();
        $scope.value = 1;
    }));

    angular.forEach([0, 1], function (min) {
        it("accepts only integers of " + min + " and above", function() {
            compile(min);
            $scope.$apply('disabled=false');
            angular.forEach(testArray, function (test) {
                model.$setViewValue(test.val);
                if (test.integer && test.val * 1 >= min) {
                    expect($scope.frm.dim.$valid).toBe(true);
                    expect($scope.value).toBe(test.val * 1);
                } else {
                    expect($scope.frm.dim.$error.type).toBe(true);
                    expect($scope.value).toBe(undefined);
                }
            });
        });
    });

    it("does not test if disabled", function() {
        compile(0);
        $scope.$apply('disabled=true');
        angular.forEach(testArray, function (test) {
            model.$setViewValue(test.val);
            expect($scope.frm.dim.$valid).toBe(true);
            expect($scope.value).toBe(test.val);
        });
    });
});

describe("crwBindTrusted", function() {
    beforeEach(module('crwApp'));

    it("bypasses escape service", inject(function($rootScope, $compile) {
        var $scope = $rootScope.$new();
        var element = $compile('<div crw-bind-trusted="value"></div>')($scope);
        $scope.value = "string";
        $scope.$apply();
        expect(element.html()).toBe("string");
        $scope.value = "&ndash;";
        $scope.$apply();
        expect(element.html()).toBe("–");
        $scope.value = "&#248;";
        $scope.$apply();
        expect(element.html()).toBe("ø");
    }));
});
