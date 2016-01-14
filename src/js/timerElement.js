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
            var fixedTime = null, stopTime,
                countdown = parseInt(attrs.countdown, 10) * 1000, // 0 means free time
                submiting = angular.isDefined(attrs.submiting);

            // published for testing
            scope.$interval = $interval;
            scope.timer = {};
            // extract localized texts from child elements
            scope.texts = {};
            angular.element(transcludeFn()).each(function (idx, elem) {
                scope.texts[elem.getAttribute('state')] = {
                    alt: elem.getAttribute('alt'),
                    title: elem.textContent
                };
            });

            // interval callback updates time and stops on countdown
            function timing () {
                if (countdown > 0) {
                    scope.timer.time = fixedTime - time.getStamp();
                    if (scope.timer.time <= 0) {
                        stop();
                    }
                } else {
                    scope.timer.time = time.getStamp() - fixedTime;
                }
            }

            // alter state on game end and cancel interval
            function stop () {
                if (scope.timer.state === 'playing') {
                    if (countdown > 0) {
                        scope.timer.time = fixedTime - time.getStamp();
                     } else {
                        scope.timer.time = time.getStamp() - fixedTime;
                    }
                    scope.$interval.cancel(stopTime);
                    stopTime = undefined;
                    fixedTime = null;
                    scope.timer.state = submiting ? 'final' : 'scored';
                }
            }
            scope.$on('timerStop', stop);

            // init timer object, triggered by event broadcast
            function init () {
                scope.timer = {
                    countdown: countdown > 0,
                    submiting: submiting,
                    state: 'waiting',
                    time: null
                };
            }
            scope.$on('timerInit', init);

            // title attribute for time display
            scope.getTitle = function () {
                return scope.texts[scope.timer.countdown ? 'down' : 'up'].title;
            };

            // title attribute for time display
            scope.getDisabled = function () {
                return ['waiting', 'scored'].indexOf(scope.timer.state) < 0;
            };

            // button click
            scope.play = function () {
                if (scope.timer.state === 'waiting') {
                    // start game, init interval
                    fixedTime = time.getStamp() + countdown;
                    scope.timer.time = countdown;
                    scope.timer.state = 'playing';
                    stopTime = scope.$interval(timing, 200);
                } else if (scope.timer.state === 'scored') {
                    // return to pre-game state
                    scope.timer.state = 'waiting';
                }
            };
        },

        template: '<button ng-class="timer.state" ' +
            'alt="{{texts[timer.state].alt}}" title="{{texts[timer.state].title}}" ' +
            'ng-disabled="getDisabled()" ng-click="play()"></button>' +
            '<tt title="{{getTitle()}}">{{timer.time | duration}}</tt>'
    };
}]);
