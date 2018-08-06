( function( wp ) {
	var el = wp.element.createElement;
	var __ = wp.i18n.__;
    var Components = wp.components;
    var withAPIData = wp.components.withAPIData;
    var withInstanceId = wp.compose.withInstanceId;
    var withSafeTimeout = wp.compose.withSafeTimeout;

    wp.i18n.setLocaleData( crwBasics.locale, 'crosswordsearch' );

    var timerOptions = {
        'none': {val: undefined, text: __('None', 'crosswordsearch')},
        'forward': {val: 0, text: __('Open-ended', 'crosswordsearch')},
        'backward': {val: 60, text: __('Countdown', 'crosswordsearch')}
    };

    var CrwTimerControl = withInstanceId( function ( {
        instanceId,
        timerAttribute,
        setAttributes
    } ) {
        var id = `crw-timer-control-${ instanceId }`;
        var isNone = !(timerAttribute > 0);

        return <div id={id} className="components-base-control">
            <label  className="components-base-control__label">{__('Display timer', 'crosswordsearch')}</label>
            <div className="components-base-control__field">
                <select
                    className="components-select-control__input"
                    style={{'width': 'auto'}}
                    value={timerAttribute > 0 ?
                        'backward' :
                        timerAttribute === 0 ? 'forward' : 'none'}
                    onChange={( event ) => {
                        setAttributes({ timer: timerOptions[event.target.value].val })
                    }}
                >
                { lodash.map(timerOptions, ({text}, name) => 
                    <option key={`${text}-${name}`} value={name}>{text}</option>
                ) }
                </select>
            </div>
            <div className="components-base-control__field" style={{'margin-top':'0.5em'}}>
                <label 
                    className="components-base-control__label" 
                    style={{'display': 'inline'}}
                    htmlFor={id + '-range'}
                >{__('Allowed time', 'crosswordsearch')}</label>
                <input
                    className="components-range-control__number"
                    id={id + '-range'}
                    type="number"
                    min="1"
                    disabled={isNone}
                    value={timerAttribute}
                    onChange={ ( event ) => {
                        setAttributes({ timer: parseInt(event.target.value, 10) })
                    } }
                />{' s'}
            </div>
        </div>;
    } )

    function writeShortcode (attrs) {
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

        return wp.shortcode.string(code);
    }

    var basicNames = ['new', 'dft', 'no'];

    function constructNames (attributes, projects) {
        var options;
        if (attributes.mode === 'build') {
            options = [
                { value: 'new', label: '<' + __('Empty Crossword', 'crosswordsearch') + '>' },
                { value: 'dft', label: '<' + __('First crossword', 'crosswordsearch') + '>' }
            ];
        } else {
            options = [
                { value: 'no', label: '<' + __('Choose from all', 'crosswordsearch') + '>' }
            ]; 
        }
        if (attributes.project) {
            lodash.find(projects, p => p.name === attributes.project)
            .crosswords.forEach(name => {
                options.push({ value: name, label: name });
            });
        }

        return options;
    }

    function setInspectorControls (attributes, setAttributes, setTimeout, posts) {
        if ( ! posts.data ) {
            return <p>{__('Waiting for data...', 'crosswordsearch')}</p>;
        } else if ( !posts.data.projects.length) {
            return <p>{__('No projects found.', 'crosswordsearch')}</p>;
        }

        var projects = posts.data.projects,
            projectNames = projects.map(p => p.name);

        if ( !attributes.mode || !attributes.project ) {
            setTimeout(() => setAttributes(lodash.assign({
                mode: 'solve',
                project: projectNames[0]
            }, attributes)), 0);
        }

        var controls = [
            <Components.RadioControl
                label={__('Mode', 'crosswordsearch')}
                selected={attributes.mode}
                options={ [
                    { label: __('Design crosswords', 'crosswordsearch'), value: 'build' },
                    { label: __('Solve crosswords', 'crosswordsearch'), value: 'solve' }
                ] }
                onChange={ (newValue) => {
                    var newAttrs = { mode: newValue };
                    if (newValue === 'build') {
                        newAttrs.timer = undefined;
                        newAttrs.submitting = undefined;
                    } else {
                        if (attributes.name === '') newAttrs.name = undefined;
                    }
                    setAttributes(newAttrs);
                } }
            />,
            <Components.SelectControl
                label={__('Project', 'crosswordsearch')}
                value={projectNames.indexOf(attributes.project) < 0 ? null : attributes.project}
                options={ projectNames.map(name => {
                    return {label: name, value: name};
                }) }
                onChange={(newValue) => setAttributes({ project: newValue })}
            />,
            <Components.SelectControl
                label={__('Crossword', 'crosswordsearch')}
                help={ attributes.mode === 'build' ?
                    __('Preselect the crossword initially displayed. All crosswords remain selectable.', 'crosswordsearch') :
                    __('Select one or let the user choose from all crosswords.', 'crosswordsearch') }
                value={ attributes.name === '' ? 'new' :
                    (attributes.name || (attributes.mode === 'build' ? 'dft' : 'no')) }
                options={constructNames(attributes, projects)}
                onChange={ (newValue) => {
                    var basic = basicNames.indexOf(newValue);
                    if (basic === 0) {
                        setAttributes({ name: '' })
                    } else {
                        setAttributes({ name:  basic < 0 ? newValue : undefined })
                    }
                } }
            />
        ];

        if (attributes.mode === 'build') {
            controls.push(<Components.CheckboxControl
                heading={ __('Save opportunities', 'crosswordsearch') }
                label={ __('Restricted', 'crosswordsearch') }
                help={ __('Uploads by restricted users must be reviewed.', 'crosswordsearch') }
                checked={attributes.restricted}
                onChange={(newValue) => setAttributes({ restricted: newValue ? 1 : undefined })}
            />)
        } else {
            const timerProps = {
                setAttributes,
                timerAttribute: attributes.timer
            }
            controls.push(
                <CrwTimerControl {...timerProps} />,
                <Components.CheckboxControl
                    heading={__('Submission', 'crosswordsearch')}
                    label={__('Let users submit their result', 'crosswordsearch')}
                    checked={attributes.submitting}
                    disabled={typeof attributes.timer !== 'number'}
                    onChange={(newValue) => setAttributes({ submitting: newValue ? 1 : undefined })}
                />
            );
        }
        return controls;
    }

    var attributeTypes = [
        { name: 'mode', type: 'string', importType: 'string'},
        { name: 'project', type: 'string', importType: 'string'},
        { name: 'name', type: 'string', importType: 'string'},
        { name: 'restricted', type: 'number', importType: 'string', coerce: true},
        { name: 'timer', type: 'number', importType: 'number'},
        { name: 'submitting', type: 'number', importType: 'number', coerce: true},
    ];

    wp.blocks.registerBlockType( 'crw-block-editor/shortcode', {
        title: __( 'Crosswordsearch Shortcode', 'crosswordsearch' ),

        description: __( 'Define how a Crosswordsearch block should be displayed', 'crosswordsearch' ),

        icon: 'shortcode',

        category: 'widgets',

        attributes: attributeTypes.reduce(( obj, attr ) => {
            obj[attr.name] = { type: attr.type };
            return obj;
        }, {}),

        supports: {
            customClassName: false,
            className: false,
            html: false
        },

        edit: withAPIData( function() {
            return {
                posts: '/crosswordsearch/v1/projects/public'
            };
        } )(withSafeTimeout( ( { attributes, setAttributes, setTimeout, posts } ) => {
            return <div className="wp-block-shortcode wp-block-preformatted">
                <label><Components.Dashicon icon="shortcode"/>{__( 'Shortcode', 'crosswordsearch' )}</label> 
                <pre>{writeShortcode(attributes)}</pre>
                <wp.editor.InspectorControls>{
                    setInspectorControls(attributes, setAttributes, setTimeout, posts)
                }</wp.editor.InspectorControls>
            </div>
        } ) ),

        save: function( props ) {
            return <wp.element.RawHTML>{writeShortcode(props.attributes)}</wp.element.RawHTML>;
        }
    });

} )(
	window.wp
);