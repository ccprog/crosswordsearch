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

    beforeEach(module('crwCommon'));
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

describe("ajaxFactory", function () {
    var $httpBackend, ajaxFactory, answer;

    beforeEach(function () {
        answer = {nonce: 'nonce2'};
        module('crwCommon');
        inject(function ($injector) {
            $httpBackend = $injector.get('$httpBackend');
            $httpBackend.when('POST', crwBasics.ajaxUrl).respond(JSON.stringify(answer));
            ajaxFactory = $injector.get('ajaxFactory');
        });
    });

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it("provides unique ids - loose test", function () {
            expect(ajaxFactory.getId()).toBe(0);
            expect(ajaxFactory.getId()).toBe(1);
            expect(ajaxFactory.getId()).toBe(2);
    });

    it("sets Content-Type header", function () {
        ajaxFactory.setNonce('nonce1', 'context');
        $httpBackend.expectPOST(crwBasics.ajaxUrl, undefined, function(headers) {
            expect(headers['Content-Type']).toBe('application/x-www-form-urlencoded');
            return true;
        });
        ajaxFactory.http({}, 'context');
        $httpBackend.flush();
    });

    it("sends url-encoded data", function () {
        ajaxFactory.setNonce('nonce1', 'context');
        $httpBackend.expectPOST(crwBasics.ajaxUrl, function (data) {
            expect(URI.parseQuery(data)).toEqual({
                action: 'action',
                _crwnonce: 'nonce1'
            });
            return true;
        });
        ajaxFactory.http({action: 'action'}, 'context');
        $httpBackend.flush();
    });

    it("exchanges nonce", function () {
        ajaxFactory.setNonce('nonce1', 'context');
        $httpBackend.expectPOST(crwBasics.ajaxUrl, function (data) {
            expect(URI.parseQuery(data)).toEqual({
                _crwnonce: 'nonce1'
            });
            return true;
        });
        ajaxFactory.http({}, 'context').then(function (data) {
            expect(data).toEqual(answer);
        });
        $httpBackend.flush();
        $httpBackend.expectPOST(crwBasics.ajaxUrl, function (data) {
            expect(URI.parseQuery(data)).toEqual({
                _crwnonce: 'nonce2'
            });
            return true;
        });
        ajaxFactory.http({}, 'context');
        $httpBackend.flush();
    });

    it("detects wp-auth-check", inject(function (nonces) {
        nonces.context = 'nonce1';
        nonces.other = 'nonce2';
        jQuery(document).trigger('heartbeat-tick', {content: true});
        expect(nonces.context).toBe('nonce1');
        jQuery(document).trigger('heartbeat-tick', {'wp-auth-check': true});
        expect(nonces.context).toBe('nonce1');
        jQuery(document).trigger('heartbeat-tick', {'wp-auth-check': false});
        expect(nonces).toEqual({});
    }));

    it("detects missing nonces", inject(function (nonces) {
        var called = jasmine.createSpy("called");
        delete nonces.context;
        ajaxFactory.http({action: 'action'}, 'context').then(called, function (error) {
            expect(error).toEqual({heartbeat: true});
        });
        expect(called).not.toHaveBeenCalled();
    }));

    it("detects errors", function () {
        var called = jasmine.createSpy("called");
        ajaxFactory.setNonce('nonce1', 'context');
        $httpBackend.expectPOST(crwBasics.ajaxUrl).respond(400, 'string');
        ajaxFactory.http({}, 'context').then(called, function (error) {
            expect(error).toEqual({
                error: 'server error',
                debug: ['status 400']
            });
        });
        ajaxFactory.setNonce('nonce1', 'context');
        $httpBackend.expectPOST(crwBasics.ajaxUrl).respond(200, 'string');
        ajaxFactory.http({}, 'context').then(called, function (error) {
            expect(error).toEqual({error: 'malformed request'});
        });
        $httpBackend.expectPOST(crwBasics.ajaxUrl).respond(JSON.stringify({error:'error'}));
        ajaxFactory.http({}, 'context').then(called, function (error) {
            expect(error).toEqual({error: 'error'});
        });
        $httpBackend.expectPOST(crwBasics.ajaxUrl).respond(JSON.stringify({}));
        ajaxFactory.http({}, 'context').then(function (data) {
            expect(data).toEqual({});
        }, called);
        $httpBackend.flush();
        expect(called.calls.any()).toBe(false);
    });
});
