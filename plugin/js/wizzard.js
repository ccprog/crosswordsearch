jQuery(document).ready(function ($) {
    var wizzard = $('#crw-shortcode-wizzard'),
        mode = wizzard.find('input[name=crw_option_mode]'),
        project = wizzard.find('input[name=crw_option_project]'),
        name = wizzard.find('input[name=crw_option_name]'),
        restricted = wizzard.find('input[name=crw_option_restricted]'),
        timer = wizzard.find('select[name=crw_option_timer]'),
        timer_value = wizzard.find('input[name=crw_option_timer_value]'),
        submitting = wizzard.find('input[name=crw_option_submitting]'),
        for_solve = wizzard.find('.crw-for-solve'),
        for_build = wizzard.find('.crw-for-build');

    function on_change () {
        if (mode.filter(':checked').val() === 'solve') {
            for_solve.show();
            for_build.hide();
            timer_value.add(submitting).prop('disabled', false);
            switch(timer.children(':selected').val()) {
            case 'none':
                timer_value.val('');
                timer_value.add(submitting).prop('disabled', true);
                break;
            case 'forward':
                timer_value.val(0);
                break;
            case 'backward':
                timer_value.val(60);
                break;
            }
        } else {
            for_solve.hide();
            for_build.show();
        }
    }
    mode.add(timer).change(on_change);

    on_change ();

    $('#crw_insert').click(function () {
        var code = {
            tag: 'crosswordsearch',
            type: 'single',
            attrs: {
                mode: mode.filter(':checked').val(),
                project: project.val()
            }
        };
        if (name.val().length) {
            code.attrs.name = name.val();
        }
        if (code.attrs.mode === 'build' && restricted.filter(':checked').val()) {
            code.attrs.restricted = 1;
        }
        var timing = timer.children(':selected').val() || 'none';
        var period = parseInt(timer_value.val(), 10) || 60;
        if (code.attrs.mode === 'solve' && timing !== 'none') {
            code.attrs.timer = timing === 'forward' ? 0 : period;
            if (submitting.filter(':checked').val()) {
                code.attrs.submitting = 1;
            }
        }
        window.send_to_editor(wp.shortcode.string(code));
        tb_remove();
    });

    $('#crw_cancel').click(function () {
        tb_remove();
    });
});
