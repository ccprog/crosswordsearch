jQuery(document).ready(function ($) {
    var wizzard = $('#crw-shortcode-wizzard'),
        mode = wizzard.find('input[name=crw-option-mode]'),
        projects = wizzard.find('select[name=crw-option-project]'),
        names = wizzard.find('select[name=crw-option-name]'),
        restricted = wizzard.find('input[name=crw-option-restricted]'),
        timer = wizzard.find('select[name=crw-option-timer]'),
        timer_value = wizzard.find('input[name=crw-option-timer-value]'),
        submitting = wizzard.find('input[name=crw-option-submitting]'),
        for_solve = wizzard.find('.crw-for-solve'),
        for_build = wizzard.find('.crw-for-build'),
        nonce = wizzard.data('crwNonce'); //TODO: test for IE8

    function is_mode (m) {
        return mode.filter(':checked').val() === m;
    }

    function on_public_list (data) {
        projects.empty();
        $.each(data, function (project, crosswords) {
            var option = $('<option value="' + project + '">' + project + '</option>')
                .data('crosswords', crosswords);
            option.appendTo(projects);
        });
        projects.change();
    }

    $('#crw-shortcode-button').click(function () {
        $.post(ajaxurl, {
            action: 'get_crw_public_list',
            _crwnonce: nonce
        }, on_public_list, 'json');
    });

    projects.change(function () {
        names.children().not('.crw-basic').remove();
        $.each($(this).children(':selected').data('crosswords'), function (idx, name) {
            $('<option value="' + name + '">' + name + '</option>').appendTo(names);
        });
        names.val(is_mode('solve') ? 'no' : 'new');
    });

    function on_mode () {
        if (is_mode('solve')) {
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
        if (names.children(':selected').hasClass('crw-basic')) {
            names.val(is_mode('solve') ? 'no' : 'new');
        }
    }
    mode.add(timer).change(on_mode);

    on_mode();

    $('#crw_insert').click(function () {
        var code = {
            tag: 'crosswordsearch',
            type: 'single',
            attrs: {
                mode: mode.filter(':checked').val(),
                project: projects.children(':selected').val()
            }
        };
        switch (names.children(':selected').val()) {
        case 'no':
        case 'dft':
            // nothing entered
            break;
        case 'new':
            code.attrs.name = '';
            break;
        default:
            code.attrs.name = names.children(':selected').val();
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
