<?php
//define('CRW_PLUGIN_URL', ?);
//define('CRW_PLUGIN_DIR', ?);

$locale = 'en';

$dimensions = array(
    'fieldBorder' => 1,
    'tableBorder' => 1,
    'field' => 30,
    'handleInside' => 4,
    'handleOutside' => 8
);

function compose_style ( ) {
    global $dimensions;

    echo '
<link rel="stylesheet" type="text/css" href="crosswordsearch.css" />
<style>
.crw-grid, .crw-mask {
    border-width: ' . $dimensions['tableBorder'] . 'px;
}
table.crw-table {
    border-spacing: ' . $dimensions['fieldBorder'] . 'px;
}
td.crw-field, td.crw-field  > div {
    height: ' . $dimensions['field'] . 'px;
    width: ' . $dimensions['field'] . 'px;
    min-width: ' . $dimensions['field'] . 'px;
}
td.crw-field span {
    height: ' . ($dimensions['field'] - 2) . 'px;
    width: ' . ($dimensions['field'] - 2) . 'px;
}
td.crw-field button {
    height: ' . ($dimensions['field'] - 4) . 'px;
    width: ' . ($dimensions['field'] - 4) . 'px;
}
div.crw-marked {
    width: ' . ($dimensions['field'] + $dimensions['fieldBorder']) . 'px;
    height: ' . ($dimensions['field'] + $dimensions['fieldBorder']) . 'px;
}';
}

/*
 * array(
 *   'mode' => 'build' or 'solve'
 *   'timer' => boolean
 *   'project' => string
 *   'name' => string | false
 * )
 */
function compile ($atts, $target) {
    global $dimensions;

    extract( $atts );
    $is_auth = true;
    $countdown = 0;
    $submitting = false;

    $is_single = $name && 'solve' == $mode;

    if ( $timer ) {
        $message = __('Do you want to submit your result?', 'crosswordsearch');
    }
    $prep = array(
        $project,
        'dummy',
        'dummy',
        $timer ? 'timer' : 'restricted'
    );
    if ( $name ) {
        array_push( $prep, $name );
    }

	require_once 'l10n.php';
    $locale_data = crw_get_locale_data();
    $localize = array_merge($locale_data, array(
        'textDirection' => 'ltr',
        'pluginPath' => CRW_PLUGIN_URL,
        'ajaxUrl' => admin_url( 'admin-ajax.php' ), //TODO
        'dimensions' => $dimensions
    ));

    $scripts = array(
        'angular' => 'angular',
        'quantic-stylemodel' => 'qantic.angularjs.stylemodel',
        'crw-js' => 'crosswordsearch'
    );

    ob_start();

    foreach( $scripts as $slug => $script ) {
        echo '<script type="text/javascript" src="' . CRW_PLUGIN_URL . 'js/' . $script .'.min.js" />\n';
    }

    echo '<script type="text/javascript">var crwBasics = ' . json_encode( $localize ) . ';</script>';
    compose_style();

    include '../plugin/app.php';
    include '../plugin/immediate.php';

    $app_code = ob_get_clean();
    $delay_message = '<p ng-hide="true"><strong>' . __('Loading the crossword has yet to start.', 'crosswordsearch') . '</strong></p>';

	return $delay_message . '<div class="crw-wrapper" ng-cloak ng-controller="CrosswordController" ng-init="prepare(\'' . implode( '\', \'', $prep ) . '\')">' . $app_code . '</div>';
}