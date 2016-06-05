// fixes static thickbox size setting, see
// https://core.trac.wordpress.org/ticket/33365#comment:2
(function ($) {
    var old_position = tb_position;
    tb_position = function () {
        old_position();
        $('#TB_ajaxContent').attr('style', null);
    }
})(jQuery);