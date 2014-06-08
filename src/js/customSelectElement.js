/* Customizable Select Element (to be externalized) */
var customSelectElement = angular.module('customSelectElement', []);
/** Default template for element/option entries
  */
customSelectElement.directive('cseDefault', ["$compile", function($compile) {
    return {
        scope: { value: "=" },
        template: '{{value.value || value}}'
    };
}]);
/** intermediate template for option structure
  * Clicking on an option entry will $emit a 'select' event with this argument:
  * - if the option value is an object: property .value
  * - if the option value is a primitive or the option list is an array: value
  */
customSelectElement.directive('cseOption', ["$compile", function($compile) {
    return {
        scope: {
            value: "=",
            isMenu: '=',
            templ: '='

        },
        link: function (scope, element, attrs) {
            scope.select = function (value) {
                scope.$emit('select', value);
            };
            attrs.$observe('value', function() {
                var html;
                if (angular.isObject(scope.value) && scope.value.group) {
                    html = '<dl class="cse text" cse-select cse-options="value.group" ' +
                        'cse-model="head" ' + 'cse-template="' + attrs.templ + '"';
                    if (angular.isDefined(scope.isMenu)) {
                        html += ' cse-is-menu ng-init="head=value"';
                    }
                    html += '></dl>';
                    element.html(html);
                } else {
                     html = '<div ng-click=';
                     if (angular.isObject(scope.value) && angular.isDefined(scope.value.value)) {
                        html += '"select(value.value)" ';
                     } else {
                        html += '"select(value)" ';
                     }
                     html += attrs.templ + ' value="value"></div>';
                     element.html(html);
                }
                $compile(element.contents())(scope);
            });
        }
    };
}]);

/** Select element template
  * Usage:
  * <dl class="cse" cse-select cse-template="my-template" cse-model="..." cse-is-menu cse-options="...">
  * cse-model: binds a data model to the element
  * cse-options: provide a list of options. Anything that ng-repeat can take is ok.
  *  It is possible to nest objects. If an option value is an object and contains a property
  *  .group=true, a nested customSelectElement is inserted with the object as cse-model.
  * cse-is-menu: (optional) if present, the model will not update on selection. To set a
  *   static value to display, use ng-init.
  * What will be shown both as options and as current selection depends on a template
  * in the form
  * app.directive('myTemplate', function() {
  *     return {
  *         scope: { value: "=" },
  *         template: '...{{value}}...'
  *     };
  * });
  * Using cse-template is optional, if it is omitted, {{value}} will be shown directly,
  * or {{value.value}} in case of an object wioth that property.
  * {{value}} is resolved to one entry in the options list.
  */
customSelectElement.directive("cseSelect", ['$document', function($document) {
    return {
        restrict: 'A',
        scope: {
            options: '=cseOptions',
            model: '=cseModel',
            isMenu: '=cseIsMenu',
            cseTemplate: '='
        },
        link: function (scope, element, attrs) {
            scope.setModel = !angular.isDefined(attrs.cseIsMenu);
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
            
            scope.visible = false;

            scope.$watch('visible', function (newVisible) {
                if (newVisible) {
                    $document.bind('click', elementHide);
                } else {
                    $document.unbind('click', elementHide);
                }
            });

            element.on('$destroy', function () {
                $document.unbind('click', elementHide);
            });

            scope.$on('select', function (event, opt) {
                scope.visible = false;
                if (scope.setModel) {
                    scope.model = opt;
                }
            });
        },
        template: function (tElement, tAttr) {
            var templ = tAttr.cseTemplate || 'cse-default';
            var html = '<dt ng-click="visible=!visible"><div ng-show="!!(model)" ' +
                templ + ' value="model"></div></dt>' +
                '<dd ng-show="visible"><ul>' +
                '<li ng-repeat="opt in options | orderBy:\'order\'" ' +
                'cse-option value="opt" templ="' + templ + '"';
            if (angular.isDefined(tAttr.cseIsMenu)) {
                html += ' is-menu="1"';
            }
            html += '></li></ul></dd>';
            return html;
        }
    };
}]);
