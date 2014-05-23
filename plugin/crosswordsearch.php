<?php
/*
Plugin Name: crosswordsearch
Plugin URI: https://github.com/ccprog/crosswordseach
Version: 0.1.0
Author: Claus Colloseus
Author URI: http://browser-unplugged.net
Text Domain: crw-text
Description: Adds a wordsearch-style crossword in place of a shortcode. Crosswords can be in building-mode for developing new riddles, which then can be stored for later usage, or they can be in solving-mode, where existing riddles are loaded into the page for readers to solve.

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

/* plugin installation */
define('CRW_DB_VERSION', '0.1');
define('CRW_PROJECTS_OPTION', 'crw_projects');

global $wpdb, $data_table_name;
$wpdb->hide_errors();

$data_table_name = $wpdb->prefix . "crw_crosswords";
// WP_PLUGIN_DIR points to path in server fs, even if it traverses a symbolic link
// this form is needed for register_activation_hook (call to plugin_basename()),
$plugin_file = WP_PLUGIN_DIR . '/crosswordsearch/crosswordsearch.php';
// plugin_dir_path( __FILE__ ) points to the source path
// this is needed for include/require and file_get_contents

function crw_add_project ($project) {
    $project_list = get_option(CRW_PROJECTS_OPTION);

    if ( !in_array($project, $project_list) ) {
        array_push($project_list, $project);
        update_option(CRW_PROJECTS_OPTION, $project_list);
    }
}

function crw_get_locale_data () {
    $file = plugin_dir_path( __FILE__ ) . 'languages/crw-text-js-'.get_locale().'.json';
    if( !file_exists( $file ) ){
        $file = plugin_dir_path( __FILE__ ) . 'languages/crw-text-js-en.json';
    }
    return json_decode( file_get_contents( $file ), true );
}

function crw_install () {
    global $wpdb, $charset_collate, $data_table_name;
    require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );

    $sql = "
CREATE TABLE IF NOT EXISTS $data_table_name (
  project varchar(255) NOT NULL,
  name varchar(255) NOT NULL,
  crossword text NOT NULL,
  PRIMARY KEY  (project, name)
) $charset_collate;\n";
    dbDelta( $sql );

    add_option(CRW_PROJECTS_OPTION, (array)NULL);
    add_option( "crw_db_version", CRW_DB_VERSION );
}
register_activation_hook( $plugin_file, 'crw_install' );

// temporary test data
function crw_install_data () {
    global $wpdb, $data_table_name;

    crw_add_project('test');

    $data_files = array(
        '../tests/testCrossword.json',
        '../tests/chaimae.json'
    );

    foreach( $data_files as $file) {
        $json = file_get_contents(plugin_dir_path( __FILE__ ) . $file);
        $data = json_decode( $json );

        $rows_affected = $wpdb->replace($data_table_name, array(
            'project' => 'test',
            'name' => $data->name,
            'crossword' => $json,
        ));
    }
}
register_activation_hook( $plugin_file, 'crw_install_data' );

/* plugin load routines */

$crw_has_crossword = false;

function crw_load_text () {
    load_plugin_textdomain( 'crw-text', false, 'crosswordsearch/languages/' );
}
add_action('plugins_loaded', 'crw_load_text');

function crw_add_angular_attribute ($attributes) {
    return $attributes . ' xmlns:ng="http://angularjs.org" id="ng-app" ng-app="crwApp"';
}

function add_crw_scripts () {
	global $crw_has_crossword;
    $plugin_url = plugins_url() . '/crosswordsearch/';

    $file = plugin_dir_path( __FILE__ ) . 'languages/crw-text-js-'.get_locale().'.json';
    if( !file_exists( $file ) ){
        $file = plugin_dir_path( __FILE__ ) . 'languages/crw-text-js-en.json';
    }
    $locale_data = (array)crw_get_locale_data();

	if ( $crw_has_crossword ) {
        wp_enqueue_script('angular', $plugin_url . 'js/angular.min.js');
        wp_enqueue_script('angular-sanitize', $plugin_url . 'js/angular-sanitize.min.js', array( 'angular' ));
        wp_enqueue_script('quantic-stylemodel', $plugin_url . 'js/qantic.angularjs.stylemodel.min.js', array( 'angular' ));
        wp_enqueue_script('crw-js', $plugin_url . 'js/crosswordsearch.js', array( 'angular', 'angular-sanitize', 'quantic-stylemodel' ));
        wp_localize_script('crw-js', 'crwBasics', array_merge($locale_data, array(
            'pluginPath' => $plugin_url,
            'ajaxUrl' => admin_url( 'admin-ajax.php' )
        )));
	}
}

function crw_find_shortcode () {
	global $post, $crw_has_crossword;

	if ( has_shortcode( $post->post_content, 'crosswordsearch') ) {
        $crw_has_crossword = true;
        add_filter ( 'language_attributes', 'crw_add_angular_attribute' );
        add_action( 'wp_enqueue_scripts', 'add_crw_scripts');
    }
}
add_action( 'get_header', 'crw_find_shortcode');

function crw_test_shortcode ($atts, $names_list) {
    $projects_list = get_option(CRW_PROJECTS_OPTION);
    extract($atts);

    $html = '<strong>' . __('The shortcode usage is faulty:', 'crw-text') . '</strong> ';

    if ( !in_array( $mode, array('build', 'solve') ) ) {
        /// translators: argument %1 will be the literal 'mode'
        return $html . sprintf(__('Attribute %1$s needs to be set to one of "%2$s" or "%3$s".', 'crw-text'), '<em>mode</em>', 'build', 'solve');
    }

    if ( !in_array( $project, $projects_list ) ) {
        /// translators: argument %1 will be the literal 'project'
        return $html . sprintf(__('Attribute %1$s needs to be an existing project.', 'crw-text'), '<em>project</em>');
    }

    if ( 0 == count( $names_list ) ){
        return $html . sprintf(__('There is no crossword in project %1$s.', 'crw-text'), $project);
    }

    if ( '' !== $name && !in_array($name, $names_list ) ) {
        return $html . sprintf(__('There is no crossword with the name %1$s.', 'crw-text'), '<em>' . $name . '</em>');
    }
    return false;
}

/* load the crossword into a post */

function crw_shortcode_handler( $atts, $content = null ) {
    global $wpdb, $data_table_name;

    $plugin_url = plugins_url() . '/crosswordsearch/';

    $filtered_atts = shortcode_atts( array(
		'mode' => 'build',
        'project' => '',
        'name' => '',
	), $atts, 'crosswordsearch' );
	extract( $filtered_atts );

    $names_list = $wpdb->get_col( $wpdb->prepare("
        SELECT name
        FROM $data_table_name
        WHERE project = %s
        ORDER BY name
    ", $project) );

    $shortcode_error = crw_test_shortcode($filtered_atts, $names_list);
    if ( $shortcode_error ) {
        return '<p>' . $shortcode_error . '</p>';
    }

    if ( $name && 'build' !== $mode ) {
        $names_list = null;
    }
    if ( !$name && count($names_list) > 0 ) {
        $name = $names_list[0];
    }
    $prep_1 = esc_js($project);
    $prep_2 = esc_js($name);
    $prep_3 = $names_list ? esc_js( json_encode($names_list) ) : '';

	// load stylesheet into page bottom to get it past theming
    wp_enqueue_style('crw-css', $plugin_url . 'css/crosswordsearch.css');

	// wrapper divs
	$html = '
<div class="crw-wrapper" ng-controller="CrosswordController" ng-init="prepare(\'' . $prep_1 . '\', \'' . $prep_2 . '\', \'' . $prep_3 . '\')">
    <p class="crw-label">
        <span class="name" ng-if="!namesInProject">{{crosswordData.name}}</span>
        <span ng-if="namesInProject">
            <select ng-model="loadedName" ng-options="name for name in namesInProject"></select>
            <button ng-click="load(loadedName)" ng-if="loadedName!=crosswordData.name" title="' . __('Load a new riddle', 'crw-text') . '">' . __('Load', 'crw-text') . '</button>';
    if ( 'build' == $mode ) {
        $html .= '
            <button ng-click="load(loadedName)" ng-if="loadedName==crosswordData.name" title="' . __('Reset to the saved version', 'crw-text') . '">' . __('Reload', 'crw-text') . '</button>
        </span>
        <button ng-click="save()" title="' . __('Save the riddle', 'crw-text') . '">' . __('Save', 'crw-text') . '</button>';
    } else {
        $html .= '
            <button ng-click="restart()" ng-if="loadedName==crosswordData.name" title="' . __('Restart solving the riddle', 'crw-text') . '">' . __('Restart', 'crw-text') . '</button>
        </span>';
    }
	$html .= '
    </p>
    <p class="error" ng-if="loadError">{{loadError.error}}</p>
    <p class="error" ng-if="loadError">{{loadError.debug}}</p>
    <div class="crw-crossword' . ( 'build' == $mode ? ' wide' : '' ) . '" ng-controller="SizeController" ng-if="crosswordData">
        <div ng-style="styleGridSize()" class="crw-grid' . ( 'build' == $mode ? ' divider' : '' ) . '">';
	    // resize handles
	    if ( 'build' == $mode ) {
	        $html .=  '
            <div ng-mousedown="startResize()">
                <div id="handle-left" transform-multi-style style-name="size-left" ng-style="modLeft.styleObject[\'handle-left\'].style"></div>
                <div id="handle-top" transform-multi-style style-name="size-top" ng-style="modTop.styleObject[\'handle-top\'].style"></div>
                <div id="handle-right" transform-multi-style style-name="size-right" ng-style="modRight.styleObject[\'handle-right\'].style"></div>
                <div id="handle-bottom" transform-multi-style style-name="size-bottom" ng-style="modBottom.styleObject[\'handle-bottom\'].style"></div>
            </div>';
	    }
	    // crossword table
        $html .= '
        </div>
        <div class="crw-mask" ng-style="styleGridSize()">
            <table class="crw-table" ng-style="styleShift()" ng-controller="TableController" ng-Init="setMode(\'' . $mode . '\')" crw-catch-dragging>
                <tr ng-repeat="row in crosswordData.table" crw-index-checker="line">
                    <td class="crw-field" ng-repeat="field in row" crw-index-checker="column">
                        <div ';
                        // button clicking only for build mode
                        if ( 'build' == $mode ) {
                            $html .= 'ng-click="activate(line, column)" ';
                        }
                        $html .= 'ng-mouseenter="intoField(line, column)" ng-mouseleave="outofField(line, column)">
                            <button tabindex="-1" unselectable="on" ng-keypress="type($event)" crw-set-focus>{{field.letter}}</button>
                            <div unselectable="on" ng-repeat="marker in getMarks(line, column)" class="crw-marked" ng-class ="getImgClass(marker)"></div>
                        </div>
                    </td>
                </tr>
            </table>
        </div>';
	    if ( 'build' == $mode ) {
            $html .= '
        <p>
            <button ng-click="randomize()" title="' . __('Fill all empty fields with random letters', 'crw-text') . '">' . __('Fill fields', 'crw-text') . '</button>
            <button ng-click="empty()" title="' . __('Empty all fields', 'crw-text') . '">' . __('Empty', 'crw-text') . '</button>
        </p>';
        }
        $html .= '
    </div>
    <div class="crw-controls">';
    // controls and output area
    if ( 'build' == $mode ) {
        // build mode: wordlist with color chooser and delete button
        $html .= '
        <ul class="crw-word">
            <li ng-class="{\'highlight\': isHighlighted()}" ng-repeat="word in wordsToArray(crosswordData.words) | orderBy:\'ID\'" ng-controller="EntryController">
                <dl class="cse crw-color" cse-template ="color-select" cse-select cse-options="colors" cse-model="word.color"></dl>';
                /// translators: first two pars are line/column numbers, third is a direction like "to the right" or "down"
                $html .= '<span>{{word.fields | joinWord}} (' . sprintf( __('from line %1$s, column %2$s %3$s', 'crw-text'), '{{word.start.y + 1}}', '{{word.start.x + 1}}', '{{localizeDirection(word.direction)}}') . ')</span>
                <button ng-click="deleteWord(word.ID)">' . __('Delete', 'crw-text') . '</button>
            </li>
        </ul>';
    } elseif ( 'solve' == $mode ) {
        // solve mode: wordlist as solution display
        $html .= '
        <ul class="crw-word">
            <li ng-class="{\'highlight\': isHighlighted(word.ID)}" ng-repeat="word in wordsToArray(crosswordData.solution) | orderBy:\'ID\'" ng-controller="EntryController">
                <img ng-src="' . $plugin_url . 'images/bullet-{{word.color}}.png">
                <span>{{word.fields | joinWord}}</span>
            </li>
        </ul>';
    }
    // modal area
    $html .= '
    </div>
    <div class="crw-immediate" ng-controller="ImmediateController" ng-show="immediate" ng-switch on="immediate">
        <div class="blocker"></div>
        <div class="message">';
    if ( 'build' == $mode ) {
        $html .= '
            <div ng-switch-when="invalidWords">
                <p ng-pluralize count="invalidCount" when="{
                    \'one\': \'' . __('The marked word no longer fits into the crossword area. For a successfull resize this word must be deleted.', 'crw-text') . '\',
                    \'other\': \'' . __('The marked words no longer fit into the crossword area. For a successfull resize these words must be deleted.', 'crw-text') . '\'}"></p>
                <p class="actions">
                    <button ng-click="finish(true)">' . __('Delete', 'crw-text') . '</button>
                    <button ng-click="finish(false)">' . __('Abort', 'crw-text') . '</button>
                </p>
            </div>
            <div ng-switch-when="saveCrossword">
                <form name="uploader">
                    <p>' . __('To save it, the riddle must get a name: (at least 4 letters)', 'crw-text') . '<br />
                    <input type="text" ng-model="crosswordData.name" name="crosswordName" required="" ng-minlength="4" crw-sane-input></p>
                    <p class="error" ng-show="uploader.crosswordName.$error.required && !uploader.crosswordName.$error.sane">' . __('A name must be given!', 'crw-text') . '</p>
                    <p class="error" ng-show="uploader.crosswordName.$error.minlength">' . __('The name is too short!', 'crw-text') . '</p>
                    <p class="error" ng-show="uploader.crosswordName.$error.sane">' . __('Dont\'t try to be clever!', 'crw-text') . '</p>
                    <p class="confirm" ng-show="uploader.crosswordName.$valid && !saveError">' . __('That looks good!', 'crw-text') . '</p>
                    <p class="actions">
                        <button ng-disabled="!uploader.crosswordName.$valid" ng-click="upload()">' . __('Save', 'crw-text') . '</button>
                        <button ng-click="finish(false)">' . __('Abort', 'crw-text') . '</button>
                    </p>
                    <p class="error" ng-show="saveError">{{saveError}}</p>
                    <p class="error" ng-show="saveError">{{saveDebug}}</p>
                </form>
            </div>';
    } elseif ( 'solve' == $mode ) {
        $html .= '
            <div ng-switch-when="falseWord">
                <p>' . __('The marked word is not part of the solution.', 'crw-text') . '</p>
                <p class="actions">
                    <button ng-click="finish(true)">' . __('Delete', 'crw-text') . '</button>
                </p>
            </div>';
    }
    $html .= '
        </div>
    </div>
</div>';
	return $html;
}
add_shortcode( 'crosswordsearch', 'crw_shortcode_handler' );

/* ajax communication */

function crw_verify_json($json, &$msg) {
    include('schema/jsv4.php');
    include('schema/schema-store.php');

    //schema loading
    $raw_schema = json_decode( file_get_contents(plugin_dir_path( __FILE__ ) . 'schema/schema.json') );
    $url = $raw_schema->id;
    $store = new SchemaStore();
    $store->add($url, $raw_schema);
    $schema = $store->get($url);

    $locale_data = crw_get_locale_data();
    $schema->definitions->word->properties->letter->pattern = $locale_data["letterRegEx"];

    // json string decoding
    try {
        $crossword = json_decode($json);
    } catch (Exception $e) {
        $msg = 'decode exception';
        return false;
    }

    // schema validation
    $answer = Jsv4::validate($crossword, $schema);
    if ( !$answer->valid ) {
        $msg = 'schema error:\n';
        foreach ( $answer->errors as $err ) {
            $msg .= $err->dataPath ." ". $err->message ."\n";
        }
        return false;
    }

    // verify width and height are consistent
    if ( $crossword->size->height !== count($crossword->table)) {
        $msg = 'height inconsistency';
        return false;
    }
    foreach ( $crossword->table as $line ) {
        if ( $crossword->size->width !== count($line) ) {
            $msg = 'width inconsistency';
            return false;
        }
    }

    foreach ( $crossword->words as $key => $word ) {
        // verify keys match ID content
        if ( (int)$key !== $word->ID ) {
            $msg = 'word key inconsistency';
            return false;
        }
        // verify word lengths are consistent with start/stop positions
        $computed_length = max( abs( $word->stop->x - $word->start->x ), abs( $word->stop->y - $word->start->y ) ) + 1;
        if ( $computed_length !== count($word->fields) ) {
            $msg = 'word length inconsistency';
            return false;
        }
        // even more you could test:
        // direction fits start/stop position
        // each letter is in the right position
    }

    return $crossword->name;
}

function crw_send_error ( $error, $debug ) {
    $obj = array(
        'error' => $error
    );
    if ( WP_DEBUG && isset($debug) ) {
        $obj["debug"] = $debug;
    }
    wp_send_json($obj);
}

function crw_get_crossword() {
    global $wpdb, $data_table_name;

    $project = sanitize_text_field( wp_unslash($_POST['project']) );
    $name = sanitize_text_field( wp_unslash($_POST['name']) );
    $crossword = $wpdb->get_var( $wpdb->prepare("
        SELECT crossword
        FROM $data_table_name
        WHERE project = %s AND name = %s
    ", $project, $name) );

    if ($crossword) {
        echo $crossword;
        die();
    } else {
        $error = __('The crossword was not found.', 'crw-text');
        crw_send_error($error, $wpdb->last_error);
    }
}
add_action( 'wp_ajax_nopriv_get_crossword', 'crw_get_crossword' );
add_action( 'wp_ajax_get_crossword', 'crw_get_crossword' );

function crw_set_crossword() {
    global $wpdb, $data_table_name;
    $error = '';
    $debug = NULL;

    $project = sanitize_text_field( wp_unslash($_POST['project']) );
    $unsafe_name = wp_unslash($_POST['name']);
    $name = sanitize_text_field( $unsafe_name );
    $crossword = wp_unslash( $_POST['crossword'] );
    $verification = crw_verify_json( $crossword, $msg );

    if ( !$verification ) {
        $error = __('The crossword data sent are invalid.', 'crw-text');
        $debug = $msg;
    } elseif (  !in_array( $project, get_option(CRW_PROJECTS_OPTION), true ) ) {
        $error = __('The project does not exist.', 'crw-text');
        $debug = $project;
    } else if ( $name !== $unsafe_name ) {
        $error = __('The name has forbidden content.', 'crw-text');
        $debug = $name;
    } else if ( $name !== $verification ) {
        $error = __('The name sent is inconsistent with crossword data.', 'crw-text');
        $debug = $name . ' / ' . $verification;
    } else {
        $success = $wpdb->insert($data_table_name, array(
            'name' => $name,
            'project' => $project,
            'crossword' => $crossword,
        ));
        if ($success === false) {
            $error = __('The crossword could not be saved to the database.', 'crw-text');
            $debug = $wpdb->$last_error;
        }
    }

    crw_send_error($error, $debug);
    die();
}
add_action( 'wp_ajax_nopriv_set_crossword', 'crw_set_crossword' );
add_action( 'wp_ajax_set_crossword', 'crw_set_crossword' );
