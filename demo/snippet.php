<?php
require_once('l10n.php');

$uri = array(
    'lib' => '',    // stock libraries
    'js' => '',     // own scripts
    'css' => '',    // css
    'images' => '', // assets
    'ajax' => ''    // ajax
);
$locale = 'en';

$dimensions = array(
    'fieldBorder' => 1,
    'tableBorder' => 1,
    'field' => 30,
    'handleInside' => 4,
    'handleOutside' => 8
);

function get_locale() {
    global $locale;
    return $locale;
}

function set_directories($paths) {
    global $uri;
    $uri = array_merge($uri, $paths);
}

function compose_style ( ) {
    global $dimensions, $uri;

    echo '    <link rel="stylesheet" type="text/css" href="' . $uri['css'] . 'crosswordsearch.css" />
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
}
    </style>';
}

/*
 * array(
 *   'mode' => 'build' or 'solve'
 *   'timer' => boolean
 *   'project' => string
 *   'name' => string | false
 * )
 */
function compile ($atts, $loc, $target) {
    global $locale, $uri, $dimensions;

    $locale = $loc;
    require_once 'l10n.php';
    if (!load_textdomain( $locale )) {
        user_error('failed loading text domain', E_USER_ERROR );
        return;
    }

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
    
    require_once '../plugin/l10n.php';
    $locale_data = crw_get_locale_data();
    $localize = array_merge($locale_data, array(
        'textDirection' => 'ltr',
        'imagesPath' => $uri['images'],
        'ajaxUrl' => $uri['ajax'],
        'dimensions' => $dimensions
    ));
    $image_dir = $uri['images'];

    ob_start();

?>
<p ng-hide="true"><strong><?php _e('Loading the crossword has yet to start.', 'crosswordsearch') ?></strong></p>
<div class="crw-wrapper" ng-cloak ng-controller="CrosswordController" ng-init="prepare('<?php echo implode( '\', \'', $prep ) ?>')">
    <script type="text/javascript" src="<?php echo $uri['lib'] ?>angular.min.js" />
    <script type="text/javascript" src="<?php echo $uri['lib'] ?>qantic.angularjs.stylemodel.min.js" />
    <script type="text/javascript" src="<?php echo $uri['js'] ?>crosswordsearch.min.js" />
    <script type="text/javascript"><?php echo 'var crwBasics = ' . json_encode( $localize ) ?>;</script>
<?php

    compose_style();

    include '../plugin/app.php';
    include '../plugin/immediate.php';

    echo '</div>';

    $app_code = ob_get_clean();

    $fp = fopen($target, 'w+');
    fwrite($fp, $app_code);
    fclose($fp);
}