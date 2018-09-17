// formats milliseconds as 0:00.0
crwApp.filter("duration",  function() {
    return function(input) {
        if (typeof input === 'number' && input >= 0) {
            var tenth = Math.round(input / 100),
                secs  =  (Math.floor(tenth % 600) / 1000).toFixed(3).split(".")[1];
            return Math.floor(tenth / 600) + ":" + secs.substring(0, 2) + "." + secs.substring(2);
         } else {
            return null;
        }
    };
});

// return a current timestamp
crwApp.factory("time", function () {
    return {
        getStamp: function () {
            return new Date().getTime();
        }
    };
});

// timer element for competitive solve mode
crwApp.directive("crwTimerElement", ['time', '$interval', function(time, $interval) {
    return {
        restrict: 'A',
        transclude: true,
        scope: {
            timer: '=crwTimerElement'
        },

        link: function (scope, element, attrs, ctrl, transcludeFn) {
            var fixedTime = null, clock,
                countdown = parseInt(attrs.countdown, 10) * 1000, // 0 means free time
                submitting = angular.isDefined(attrs.submitting);

            // published for testing
            scope.$interval = $interval;
            scope.timer = {};
            // extract localized texts from child elements
            scope.texts = {};
            angular.element(transcludeFn()).filter('span').each(function (idx, elem) {
                var element = angular.element(elem);
                scope.texts[element.attr('state')] = {
                    alt: element.attr('alt'),
                    title: element.text()
                };
            });

            // interval callback updates time and stops on countdown
            function timing () {
                scope.timer.time = time.getStamp() - fixedTime;
                if (countdown > 0 && scope.timer.time >= countdown) {
                    stop();
                }
            }

            function cancelClock() {
                if (clock) {
                    scope.$interval.cancel(clock);
                    clock = undefined;
                }
                fixedTime = null;
            }

            // alter state on game end and cancel interval
            function stop () {
                if (scope.timer.state === 'playing') {
                    scope.timer.time = time.getStamp() - fixedTime;
                    cancelClock();
                    scope.timer.state = submitting ? 'final' : 'scored';
                }
            }
            scope.$on('timerStop', stop);

            // init timer object, triggered by event broadcast
            function init () {
                cancelClock();
                scope.timer = {
                    countdown: countdown > 0,
                    submitting: submitting,
                    state: 'waiting',
                    time: undefined
                };
            }
            scope.$on('timerInit', init);

            // title attribute for time display
            scope.getTime = function () {
                return Math.abs(countdown - scope.timer.time);
            };

            // title attribute for time display
            scope.getTitle = function () {
                return scope.texts[scope.timer.countdown ? 'down' : 'up'].title;
            };

            // state of button
            scope.getDisabled = function () {
                return ['waiting', 'scored'].indexOf(scope.timer.state) < 0;
            };

            // button click
            scope.play = function () {
                if (scope.timer.state === 'waiting') {
                    // start game, init interval
                    fixedTime = time.getStamp();
                    scope.timer.time = 0;
                    scope.timer.state = 'playing';
                    clock = scope.$interval(timing, 200);
                } else if (scope.timer.state === 'scored') {
                    // return to pre-game state
                    scope.timer.state = 'waiting';
                }
            };

            scope.$on('$destroy', cancelClock);
        },

        template: '<button class="crw-control-button" ng-class="timer.state" ' +
            'alt="{{texts[timer.state].alt}}" title="{{texts[timer.state].title}}" ' +
            'ng-disabled="getDisabled()" ng-click="play()"></button>' +
            '<tt title="{{getTitle()}}">{{getTime() | duration}}</tt>'
    };
}]);
