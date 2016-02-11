jQuery(document).ready(function($) {
    var rulebox_cb = $('#crw_badgeos_rules-hide'),
        rulebox = $('#crw_badgeos_rules'),
        prefix = '_crw_badgeos_rules_',
        method = $('input[name=' + prefix + 'method]'),
        rules = $();
    $.each(['group', 'solved', 'count'], function (i, id) {
        rules = rules.add('.cmb_id_' + prefix + id);
    });

	// Dynamically show/hide CRW metabox based on "Award By" selection
	$("#_badgeos_earned_by").change( function() {
        var show = 'crw' === $(this).val();
        rulebox.toggle(show);
        rulebox_cb.prop('checked', show);
	}).change();

	// Dynamically show/hide CRW rule entries based on "Method" selection
	method.change( function() {
        rules.toggle($(this).val() === 'rule');
    });
    method.filter(':checked').change();
});