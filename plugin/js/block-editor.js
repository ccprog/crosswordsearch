"use strict";

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

(function (wp, _) {
    var el = wp.element.createElement;
    var RawHTML = wp.element.RawHTML;
    var __ = wp.i18n.__;
    var sprintf = wp.i18n.sprintf;
    var blocks = wp.blocks;
    var Components = wp.components;
    var withAPIData = wp.components.withAPIData;
    var withInstanceId = wp.compose.withInstanceId;
    var withSafeTimeout = wp.compose.withSafeTimeout;
    var apiFetch = wp.apiFetch;
    var shortcode = wp.shortcode;

    wp.i18n.setLocaleData(crwBasics.locale, 'crosswordsearch');

    function Icon() {
        return el(
            "svg",
            {
                "aria-hidden": "true",
                role: "img",
                focusable: "false",
                viewBox: "0 0 256 256",
                height: "20",
                width: "20",
                className: "dashicon",
                style: { fill: 'none', strokeWidth: 16 }
            },
            el("path", { d: "M 44,76 A 32,32 0 0 1 44,12 H 212 A 32,32 0 0 1 212,76 Z", style: { stroke: '#0000dd' } }),
            el("path", { d: "M 100,44 A 32,32 0 1 1 164,44 V 212 A 32,32 0 0 1 100,212 Z", style: { stroke: '#dd0000' } }),
            el("path", { d: "M 189.373,21.3726 A 32,32 0 0 1 234.627,66.6274 L 66.6269,234.627 A 32,32 0 0 1 21.3729,189.373 Z", style: { stroke: '#008800' } })
        );
    }

    var modeOptions = [{ value: 'build', label: __('Design crosswords', 'crosswordsearch') }, { value: 'solve', label: __('Solve crosswords', 'crosswordsearch') }];

    var namesOptions = [{ value: 'new', mode: 'build', label: '<' + __('Empty Crossword', 'crosswordsearch') + '>' }, { value: 'dft', mode: 'build', label: '<' + __('First crossword', 'crosswordsearch') + '>' }, { value: 'no', mode: 'solve', label: '<' + __('Choose from all', 'crosswordsearch') + '>' }];

    var timerOptions = [{ value: 'none', number: undefined, label: __('None', 'crosswordsearch') }, { value: 'forward', number: 0, label: __('Open-ended', 'crosswordsearch') }, { value: 'backward', number: 60, label: __('Countdown', 'crosswordsearch') }];

    function SelectWithErrors(props) {
        if (props.faulty) {
            props = _.assign({}, props, {
                className: 'crw-control-error',
                help: __('Select something.', 'crosswordsearch'),
                value: '',
                options: [{ value: '', label: '' }].concat(props.options)
            });
        }
        return el(Components.SelectControl, props);
    }

    var RangeControl = withInstanceId(function (_ref) {
        var label = _ref.label,
            instanceId = _ref.instanceId,
            setAttributes = _ref.setAttributes,
            timer = _ref.timer;

        return el(
            Components.BaseControl,
            {
                label: label,
                id: "timer-range-control-" + instanceId
            },
            el("input", {
                id: "timer-range-control-" + instanceId,
                className: "components-range-control__number",
                type: "number",
                "aria-label": label,
                min: "1",
                disabled: !(timer > 0),
                value: typeof timer === 'number' ? timer : '',
                onChange: function onChange(event) {
                    setAttributes({ timer: Math.round(Number(event.target.value)) });
                }
            }),
            ' s'
        );
    });

    function writeShortcode(attrs) {
        var code = {
            tag: 'crosswordsearch',
            type: 'single',
            attrs: {
                mode: attrs.mode,
                project: attrs.project
            }
        };

        if (attrs.name !== undefined) code.attrs.name = attrs.name;

        if (attrs.mode === 'build' && attrs.restricted) {
            code.attrs.restricted = '1';
        } else if (attrs.mode === 'solve' && typeof attrs.timer === 'number') {
            code.attrs.timer = attrs.timer;
            if (attrs.submitting) {
                code.attrs.submitting = 1;
            }
        }

        return shortcode.string(code);
    }

    function constructNames(attributes, projects) {
        var options = _.filter(namesOptions, function (opt) {
            return opt.mode === attributes.mode;
        });
        if (!attributes.project) return options;
        var project = _.find(projects, function (p) {
            return p.name === attributes.project;
        });
        if (!project) return options;
        project.crosswords.forEach(function (name) {
            options.push({ value: name, label: name });
        });

        return options;
    }

    function DesignControls(_ref2) {
        var _el;

        var attributes = _ref2.attributes,
            setAttributes = _ref2.setAttributes,
            setTimeout = _ref2.setTimeout,
            response = _ref2.response;

        if (!response.data) {
            return el(
                Components.Notice,
                { status: "info", isDismissible: false },
                __('Waiting for data...', 'crosswordsearch')
            );
        } else if (!response.data.projects.length) {
            return el(
                Components.Notice,
                { status: "error", isDismissible: false },
                __('No projects found.', 'crosswordsearch')
            );
        }

        var faulty = {},
            crosswordNames = [],
            projects = response.data.projects,
            projectNames = projects.map(function (p) {
            return p.name;
        });

        if (!attributes.mode || !attributes.project) {
            setTimeout(function () {
                return setAttributes(_.assign({
                    mode: 'solve',
                    project: projectNames[0]
                }, attributes));
            }, 0);
            return null;
        }

        crosswordNames = constructNames(attributes, projects);

        faulty.mode = _.findIndex(modeOptions, function (opt) {
            return opt.value === attributes.mode;
        }) < 0;
        faulty.project = !_.includes(projectNames, attributes.project);
        faulty.solve = !faulty.project && attributes.mode === 'solve' && crosswordNames.length === 1;
        faulty.name = !faulty.project && attributes.name && attributes.name.length && _.findIndex(crosswordNames, function (obj) {
            return obj.value === attributes.name;
        }) < 0;
        faulty.timer = attributes.timer !== undefined && !/^\d+$/.test(attributes.timer);

        var controls = [];

        if (_.filter(faulty, _.identity).length) {
            controls.push(el(
                Components.Notice,
                { status: "error", isDismissible: false },
                __('The shortcode usage is faulty:', 'crosswordsearch')
            ));
        }

        return el(
            React.Fragment,
            null,
            el(Components.RadioControl, (_el = {
                label: __('Mode', 'crosswordsearch'),
                className: "crw-mode-control",
                selected: attributes.mode,
                options: modeOptions
            }, _defineProperty(_el, "className", faulty.mode || faulty.solve ? 'crw-control-error' : undefined), _defineProperty(_el, "help", faulty.mode ? __('Select something.', 'crosswordsearch') : faulty.solve ? sprintf(__('There is no crossword in project %1$s.', 'crosswordsearch'), attributes.project) : undefined), _defineProperty(_el, "onChange", function onChange(newValue) {
                var newAttrs = { mode: newValue };
                if (newValue === 'build') {
                    newAttrs.timer = undefined;
                    newAttrs.submitting = undefined;
                } else {
                    if (attributes.name === '') newAttrs.name = undefined;
                }
                setAttributes(newAttrs);
            }), _el)),
            el(SelectWithErrors, {
                label: __('Project', 'crosswordsearch'),
                value: projectNames.indexOf(attributes.project) < 0 ? null : attributes.project,
                faulty: faulty.project,
                options: projectNames.map(function (name) {
                    return { label: name, value: name };
                }),
                onChange: function onChange(newValue) {
                    return setAttributes({ project: newValue });
                }
            }),
            el(SelectWithErrors, {
                label: __('Crossword', 'crosswordsearch'),
                value: attributes.name === '' ? 'new' : attributes.name || (attributes.mode === 'build' ? 'dft' : 'no'),
                faulty: faulty.name,
                help: attributes.mode === 'build' ? __('Preselect the crossword initially displayed. All crosswords remain selectable.', 'crosswordsearch') : __('Select one or let the user choose from all crosswords.', 'crosswordsearch'),
                options: crosswordNames,
                onChange: function onChange(newValue) {
                    var newName,
                        option = _.find(namesOptions, function (opt) {
                        return opt.value === newValue;
                    });
                    if (!option) {
                        newName = newValue;
                    } else if (option.value === 'new') {
                        newName = '';
                    }
                    setAttributes({ name: newName });
                }
            }),
            attributes.mode === 'build' ? el(Components.CheckboxControl, {
                heading: __('Save opportunities', 'crosswordsearch'),
                label: __('Restricted', 'crosswordsearch'),
                help: __('Uploads by restricted users must be reviewed.', 'crosswordsearch'),
                checked: attributes.restricted,
                onChange: function onChange(newValue) {
                    return setAttributes({ restricted: newValue ? 1 : undefined });
                }
            }) : el(
                "div",
                { className: "crw-timer-control" },
                el(SelectWithErrors, {
                    label: __('Display timer', 'crosswordsearch'),

                    value: attributes.timer > 0 ? 'backward' : attributes.timer === 0 ? 'forward' : 'none',
                    faulty: faulty.timer,
                    options: timerOptions,
                    onChange: function onChange(newValue) {
                        setAttributes({ timer: _.find(timerOptions, function (obj) {
                                return obj.value === newValue;
                            }).number });
                    }
                }),
                el(RangeControl, {
                    label: __('Allowed time', 'crosswordsearch'),
                    timer: attributes.timer,
                    setAttributes: setAttributes
                }),
                el(Components.CheckboxControl, {
                    heading: __('Submission', 'crosswordsearch'),
                    label: __('Let users submit their result', 'crosswordsearch'),
                    checked: attributes.submitting,
                    disabled: typeof attributes.timer !== 'number',
                    onChange: function onChange(newValue) {
                        return setAttributes({ submitting: newValue ? 1 : undefined });
                    }
                })
            )
        );
    }

    var attributeTypes = [{ name: 'mode', type: 'string', importType: 'string' }, { name: 'project', type: 'string', importType: 'string' }, { name: 'name', type: 'string', importType: 'string' }, { name: 'restricted', type: 'number', importType: 'string', coerce: true }, { name: 'timer', type: 'number', importType: 'number' }, { name: 'submitting', type: 'number', importType: 'number', coerce: true }];

    blocks.registerBlockType('crw-block-editor/shortcode', {
        title: __('Crosswordsearch Shortcode', 'crosswordsearch'),

        description: __('Define how a Crosswordsearch block should be displayed', 'crosswordsearch'),

        icon: el(Icon, null),

        category: 'widgets',

        attributes: attributeTypes.reduce(function (obj, attr) {
            obj[attr.name] = { type: attr.type };
            return obj;
        }, {}),

        transforms: {
            from: [{
                type: 'shortcode',
                tag: 'crosswordsearch',
                attributes: attributeTypes.reduce(function (obj, attrType) {
                    obj[attrType.name] = {
                        type: attrType.importType,
                        shortcode: function shortcode(attrs) {
                            var value = attrs.named[attrType.name];
                            return attrType.coerce ? value ? 1 : undefined : value;
                        }
                    };
                    return obj;
                }, {}),
                priority: 15
            }, {
                type: 'block',
                blocks: ['core/shortcode'],
                isMatch: function isMatch(_ref3) {
                    var text = _ref3.text;

                    var re = shortcode.regexp('crosswordsearch');
                    return re.exec(text);
                },
                transform: function transform(_ref4) {
                    var text = _ref4.text;

                    return blocks.rawHandler({
                        HTML: '<p>' + text + '</p>',
                        mode: 'BLOCKS'
                    });
                },
                priority: 15
            }]
        },

        supports: {
            customClassName: false,
            className: false,
            html: false
        },

        edit: withAPIData(function () {
            return {
                response: '/crosswordsearch/v1/projects/public'
            };
        })(withSafeTimeout(function (props) {
            return el(
                React.Fragment,
                null,
                el(
                    "div",
                    { className: "wp-block-shortcode wp-block-preformatted crw-preview-block" },
                    el(
                        "label",
                        null,
                        el(Components.Dashicon, { icon: "shortcode" }),
                        __('Shortcode', 'crosswordsearch')
                    ),
                    el(
                        "pre",
                        null,
                        writeShortcode(props.attributes)
                    )
                ),
                el(
                    "div",
                    { className: "crw-editor-block" },
                    el(DesignControls, props)
                )
            );
        })),

        save: function save(props) {
            return el(
                RawHTML,
                null,
                writeShortcode(props.attributes)
            );
        }
    });
})(window.wp, window.lodash);
