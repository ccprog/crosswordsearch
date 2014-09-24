/* Customizable Select Element
   Copyright Claus Colloseus 2014 for RadiJojo.de

   This program is free software: Redistribution and use, with or
   without modification, are permitted provided that the following
   conditions are met:
    * If you redistribute this code, either as source code or in
      minimized, compacted or obfuscated form, you must retain the
      above copyright notice, this list of conditions and the
      following disclaimer.
    * If you modify this code, distributions must not misrepresent
      the origin of those parts of the code that remain unchanged,
      and you must retain the above copyright notice and the following
      disclaimer.
    * If you modify this code, distributions must include a license
      which is compatible to the terms and conditions of this license.

   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 */
var customSelectElement = angular.module('customSelectElement', []);

/** Default template for element/option entries
  */
customSelectElement.directive('cseDefault', function() {
    return {
        scope: { value: "=" },
        template: function (tElement, tAttr) {
            return '{{' + (tAttr.cseDefault || 'value.value || value') + '}}';
        }
    };
});

/** intermediate template for option structure
  * Clicking on an option entry will $emit a 'cseSelect' event with these arguments:
  * source: the value of cseSelect;
  *         in case of a submenu, this string is postfixed with ".sub"
  * value:  - if the option value is an object: property .value
  *         - if the option value is a primitive or the option list is an array: value
  */
customSelectElement.directive('cseOption', ["$compile", function($compile) {
    return {
        scope: {
            value: '='
        },
        link: function (scope, element, attrs) {
            scope.select = function (value) {
                scope.$emit('cseSelect', attrs.name, value);
            };

            attrs.$observe('value', function() {
                var html;
                if (angular.isObject(scope.value) && scope.value.group) {
                    html = '<dl cse-select="' + attrs.name +
                        '.sub" cse-model="head" cse-options="value.group" is-group ';
                    if (angular.isDefined(attrs.expr)) {
                        html += 'display="' + attrs.expr + '"';
                    } else {
                        html += 'template="' + attrs.templ + '"';
                    }
                    if (angular.isDefined(attrs.isMenu)) {
                        html += ' is-menu="' + scope.value.menu + '"';
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
                    html += attrs.templ;
                    if (angular.isDefined(attrs.expr)) {
                        html += '="' + attrs.expr + '"';
                    }
                    html += ' value="value"></div>';
                    element.html(html);
                }

                $compile(element.contents())(scope);
            });
        }
    };
}]);

/** Select element template
  * Usage:
  * <dl cse-select="myName" cse-model="..." cse-options="..." template="my-template" is-menu="Menu...">
  * cse-select: an arbitrary name to identify the element
  * cse-model: binds a data model to the element
  * cse-options: provide a list of options. Anything that ng-repeat can take is ok.
  *    It is possible to nest objects. If an option value is an object and contains a property
  *    .group={}, a nested customSelectElement is inserted with the group object as cse-model.
  *    For menus, the static heading is defined by .menu
  * is-menu: (optional) if present, the model will not update on selection. The content will be
  *     displayed as a static heading.
  * What will be shown both as options and as current selection depends on attributes template
  * and display.
  * template="my-template" links a template you can define with
  * app.directive('myTemplate', function() {
  *     return {
  *         scope: { value: "=" },
  *         template: '...{{value}}...'
  *     };
  * });
  * value is resolved to one entry in the options list.
  * If you want to distinguish between display in the option list, an entry group header
  * and the current selection, you can do this:
  *         template: function (tElement, tAttr) {
  *             if (angular.isDefined(tAttr.isCurrent)) {
  *                 return ...; // shown in current selection
  *             } else if (angular.isDefined(tAttr.isGroup)) {
  *                 return ...; // shown in entry group header
  *             } else {
  *                 return ...; // shown in option list
  *             }
  *         }
  * display="...value...". is interpreted as an expression whose result is shown directly.
  * If both template and display are given, template takes precedence.
  * If both are omitted, the expression "value.value || value" will be used.
  */

customSelectElement.directive("cseSelect", ['$document', '$timeout', function($document, $timeout) {
    return {
        restrict: 'A',
        scope: {
            options: '=cseOptions',
            model: '=cseModel'
        },
        link: function (scope, element, attrs) {
            var delayed;
            element.addClass('cse select');

            scope.isDefined = angular.isDefined;

            if (angular.isDefined(attrs.isMenu)) {
                scope.model = attrs.isMenu;
                scope.setModel = false;
            } else {
                scope.setModel = true;
            }
            
            scope.visible = false;
            scope.$watch('visible', function (newVisible) {
                if (newVisible) {
                    $document.bind('click', elementHideClick);
                } else {
                    $document.unbind('click', elementHideClick);
                }
            });

            scope.hideLeave = function () {
                delayed = $timeout(function () {
                    scope.visible = false;
                }, 200);
            };
            scope.showEnter = function () {
                scope.visible = true;
                if (delayed) {
                    $timeout.cancel(delayed);
                }
            };

            element.on('$destroy', function () {
                $document.unbind('click', elementHideClick);
                if (delayed) {
                    $timeout.cancel(delayed);
                }
            });

            scope.$on('cseSelect', function (event, name, opt) {
                scope.visible = false;
                if (scope.setModel) {
                    scope.model = opt;
                }
            });

            function elementHideClick (event) {
                var clicked = angular.element(event.target);
                do {
                    if (elementEquals(clicked, element)) {
                        return;
                    }
                    clicked = clicked.parent();
                } while (clicked.length && !elementEquals($document, clicked));
                scope.$apply('visible = false');
            }

            //simple angular.element comparison since angular.equals
            //is hogging memory as if there was no tomorrow
            function elementEquals (el1, el2) {
                return el1[0] === el2[0];
            }
        },
        template: function (tElement, tAttr) {
            var templ = 'cse-default', isExpression = false;
            if (angular.isDefined(tAttr.template)) {
                templ = tAttr.template;
            } else if (angular.isDefined(tAttr.display)) {
                isExpression = true;
            }
            var html = '<dt ';
            if (angular.isDefined(tAttr.isGroup)) {
                html += 'ng-mouseenter="showEnter()" ng-mouseleave="hideLeave()"';
            } else {
                html += 'ng-click="visible=!visible"';
            }
            html += '><div ng-show="isDefined(model)" ' + templ;
            if (isExpression) {
                html += '="' + tAttr.display + '"';
            }
            html += ' value="model" is-current></div><a class="btn"></a></dt><dd';
            if (angular.isDefined(tAttr.isGroup)) {
                html += ' ng-mouseenter="showEnter()" ng-mouseleave="hideLeave()"';
            }
            html += ' ng-show="visible"><ul>' +
                '<li ng-repeat="opt in options | orderBy:\'order\'" ' +
                'cse-option name="' + tAttr.cseSelect + '" model="' + tAttr.cseModel +
                '" value="opt" templ="' + templ + '"';
            if (isExpression) {
                html += ' expr="' + tAttr.display + '"';
            }
            if (angular.isDefined(tAttr.isMenu)) {
                html += ' is-menu';
            }
            html += '></li></ul></dd>';
            return html;
        }
    };
}]);
