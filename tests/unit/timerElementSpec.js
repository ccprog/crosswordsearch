describe ("duration filter", function () {
    var duration, wsp = /^\s+$/;

    beforeEach(function () {
        module('crwApp');
        inject(function($injector) {
            duration = $injector.get('durationFilter');
        });
    });

    it("formats to minutes and seconds", function () {
        expect(duration(23004)).toBe('0:23.0');
        expect(duration(64273)).toBe('1:04.3');
        expect(duration(833520)).toBe('13:53.5');
        expect(duration(4000000)).toBe('66:40.0');
    });

    it("rejects negative numbers", function () {
        expect(duration(-1234)).toMatch(wsp);
    });

    it("rejects non-numbers", function () {
        expect(duration()).toMatch(wsp);
        expect(duration('1234')).toMatch(wsp);
        expect(duration(new Date())).toMatch(wsp);
        expect(duration(null)).toMatch(wsp);
    });
});

describe("crwTimerElement", function() {
    var $root, $scope, $isolate, $compile, time, $interval, element, wsp = /^\s+$/;

    function mockTime () {
        var stamp = 0;
        return {
            getStamp: function () {
                return stamp;
            },
            addToStamp: function (d) {
                stamp += d;
            }
        };
    }

    function compile (countdown, submitting) {
        $scope = $root.$new();
        var html = '<span crw-timer-element="timer" ';
        html += 'countdown="' + countdown + '"';
        if (submitting) {
            html += 'submitting ';
        }
        html += '><span state="waiting" alt="Start">Start solving the riddle</span>' +
            '<span state="playing" alt="Time"></span>' +
            '<span state="scored" alt="Restart">Restart solving the riddle</span>' +
            '<span state="final" alt="Result"></span>' +
            '<span state="down">Remaining time</span>' +
            '<span state="up">Time used</span></span>';
        element = $compile(html)($scope);
        $isolate = $scope.$$childHead;
        $scope.$apply();
    }

    beforeEach(function() {
        module('crwApp');
        angular.mock.module({ 
            'time': mockTime()
        });
    });
    beforeEach(inject(function($rootScope, _time_, _$interval_, _$compile_) {
        time = _time_;
        $compile = _$compile_;
        $interval = _$interval_;
        $root = $rootScope.$new();
    }));

    it("builds html", function() {
        compile(0);
        var button = element.children('svg');
        expect(button).toBeDefined();
        expect(button.attr('alt')).toBeDefined();
        expect(button.attr('title')).toBeDefined();
        expect(button.attr('ng-class')).toBeDefined();
        expect(button.attr('ng-click')).toBe('play()');
        var tt = element.children('tt');
        expect(tt).toBeDefined();
        expect(tt.attr('title')).toBeDefined();
    });

    it("inits timer object", function() {
        compile(0);
        expect($isolate.timer).toEqual({});
        $scope.$apply('$broadcast("timerInit")');
        expect($isolate.timer).toEqual({
            countdown: false,
            submitting: false,
            state: 'waiting',
            time: undefined
        });
        expect($scope.timer).toBe($isolate.timer);
    });

    it("cancels runing clock on init", function() {
        spyOn($interval, 'cancel').and.callThrough();
        compile(0);
        $scope.$apply('$broadcast("timerInit")');
        $isolate.play();
        $scope.$apply('$broadcast("timerInit")');
        expect($interval.cancel).toHaveBeenCalled();
    });

    it("inits timer acoording to attributes", function() {
        compile(10);
        $scope.$apply('$broadcast("timerInit")');
        expect($isolate.timer.countdown).toBe(true);
        expect($isolate.timer.submitting).toBe(false);
        compile(0, true);
        $scope.$apply('$broadcast("timerInit")');
        expect($isolate.timer.countdown).toBe(false);
        expect($isolate.timer.submitting).toBe(true);
    });

    it("sets links and attributes according to state", function() {
        compile(0);
        $scope.$apply('$broadcast("timerInit")');
        var button = element.children('svg');
        var use = button.children('use');
        var tt = element.children('tt');
        expect(use.attr('xlink:href')).toContain('#crw-btn-waiting');
        expect(button.attr('alt')).toBe('Start');
        expect(button.attr('title')).toBe('Start solving the riddle');
        expect(button.attr('class').split(' ')).not.toContain('disabled');
        expect(tt.attr('title')).toBe('Time used');
        expect(tt.text()).toMatch(wsp);
        $isolate.timer.state = 'playing';
        $isolate.timer.time = 1600;
        $scope.$apply();
        expect(use.attr('xlink:href')).toContain('#crw-btn-playing');
        expect(button.attr('alt')).toBe('Time');
        expect(button.attr('title')).toBe('');
        expect(button.attr('class').split(' ')).toContain('disabled');
        expect(tt.text()).toBe('0:01.6');
        $isolate.timer.state = 'scored';
        $scope.$apply();
        expect(use.attr('xlink:href')).toContain('#crw-btn-scored');
        expect(button.attr('alt')).toBe('Restart');
        expect(button.attr('title')).toBe('Restart solving the riddle');
        expect(button.attr('class').split(' ')).not.toContain('disabled');
        $isolate.timer.state = 'final';
        $scope.$apply();
        expect(use.attr('xlink:href')).toContain('#crw-btn-final');
        expect(button.attr('alt')).toBe('Result');
        expect(button.attr('title')).toBe('');
        expect(button.attr('class').split(' ')).toContain('disabled');
    });

    it("sets title attribute for countdown", function() {
        compile(10);
        $scope.$apply('$broadcast("timerInit")');
        var tt = element.children('tt');
        expect(tt.attr('title')).toBe('Remaining time');
        $isolate.timer.state = 'playing';
        $isolate.timer.time = 1600;
        $scope.$apply();
        expect(tt.text()).toBe('0:08.4');
    });

    it("evaluates button click", function() {
        compile(0);
        spyOn($isolate, '$interval').and.callThrough();
        $scope.$apply('$broadcast("timerInit")');
        $isolate.play();
        expect($scope.timer.state).toBe('playing');
        expect($isolate.$interval.calls.count()).toBe(1);
        $isolate.play();
        expect($scope.timer.state).toBe('playing');
        expect($isolate.$interval.calls.count()).toBe(1);
        $scope.timer.state = 'scored';
        $isolate.play();
        expect($scope.timer.state).toBe('waiting');
        expect($isolate.$interval.calls.count()).toBe(1);
        $scope.timer.state = 'final';
        $isolate.play();
        expect($scope.timer.state).toBe('final');
        expect($isolate.$interval.calls.count()).toBe(1);
    });

    it("starts and stops positive timekeeping", function() {
        spyOn($interval, 'cancel').and.callThrough();
        compile(0);
        $scope.$apply('$broadcast("timerInit")');
        $isolate.play();
        expect($scope.timer.time).toBe(0);
        time.addToStamp(200);
        $interval.flush(250);
        expect($scope.timer.time).toBe(200);
        time.addToStamp(400);
        $scope.$apply('$broadcast("timerStop")');
        expect($scope.timer.time).toBe(600);
        expect($interval.cancel).toHaveBeenCalled();
        expect($scope.timer.state).toBe('scored');
        time.addToStamp(300);
        $scope.$apply('$broadcast("timerStop")');
        expect($scope.timer.time).toBe(600);
    });

    it("starts and stops negative timekeeping", function() {
        spyOn($interval, 'cancel').and.callThrough();
        compile(1, true);
        $scope.$apply('$broadcast("timerInit")');
        $isolate.play();
        expect($scope.timer.time).toBe(0);
        time.addToStamp(200);
        $interval.flush(250);
        expect($scope.timer.time).toBe(200);
        time.addToStamp(400);
        $scope.$apply('$broadcast("timerStop")');
        expect($scope.timer.time).toBe(600);
        expect($interval.cancel).toHaveBeenCalled();
        expect($scope.timer.state).toBe('final');
    });
});
