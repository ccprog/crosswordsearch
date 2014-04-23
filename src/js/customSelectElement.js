/* Customizable Select Element (to be externalized) */
var customSelectElement = angular.module('customSelectElement', []);

/** Directive for focussing on visible options list
  * While the options list is visible, every click in the document window
  * will be caught and the list is closed. Event listener is cleaned up
  * on select element destruction.
  */
customSelectElement.directive('cseOutsideHide', ["$document", function($document) {
    return {
        link: function(scope, element, attrs) {
            //simple angular.element comparison since angular.equals
            //is hogging memory as if there was no tomorrow
            var elementEquals = function (el1, el2) {
                return el1[0] === el2[0];
            };
            var elementHide = function (event) {
                var clicked = angular.element(event.target);
                do {
                    if (elementEquals(clicked, element)) {
                        return;
                    }
                    clicked = clicked.parent();
                } while (clicked.length && !elementEquals($document, clicked));
                scope.$apply('visible = false');
            };

            element.on('$destroy', function () {
                $document.unbind('click', elementHide);
            });
            $document.bind('click', elementHide);
        }
    };
}]);
/** Select element template
  * Usage:
  * <dl class="cse" cse-select cse-model="..." cse-options="...">
  * cse-model: binds a data model to the element
  * cse-options: provide a list of options. Anything that ng-repeat can take is ok.
  * What will be shown both as options and as current selection depends on a template
  * in the form
  * app.directive('cseContent', function() {
  *     return {
  *         scope: { value: "=" },
  *         template: '...{{value}}...'
  *     };
  * });
  * {{value}} is resolved to one entry in the options list.
  */
customSelectElement.directive("cseSelect", function() {
    return {
        restrict: 'A',
        scope: {
            options: '=cseOptions',
            model: '=cseModel'
        },
        link: function (scope, element, attrs) {
            scope.select = function (opt) {
                scope.model = opt;
            };
        },
        template: '<dt cse-outside-hide ng-init="visible=false">' +
            '<a href="" ng-click="visible=!visible"><div ng-show="!!(model)" cse-content value="model">' +
            '</div></a></dt>' +
            '<dd ng-show="visible"><ul>' +
            '<li ng-repeat="opt in options"><a href="" ng-click="select(opt)" cse-content value="opt">' +
            '</a></li>' +
            '</ul></dd>'
    };
});
