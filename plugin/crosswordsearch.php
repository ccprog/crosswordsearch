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
$crw_has_crossword = false;

function crw_load_text() {
    load_plugin_textdomain( 'crw-text', false, 'crosswordsearch/languages/' );
}
add_action('plugins_loaded', 'crw_load_text');

function crw_add_angular_attribute ($attributes) {
    return $attributes . ' xmlns:ng="http://angularjs.org" id="ng-app" ng-app="crwApp"';
}

function add_crw_scripts () {
	global $crw_has_crossword;
    $plugin_path = plugins_url() . '/crosswordsearch/';
    
    $file = plugin_dir_path( __FILE__ ) . 'languages/crw-text-js-'.get_locale().'.json';
    if( !file_exists( $file ) ){
        $file = plugin_dir_path( __FILE__ ) . 'languages/crw-text-js-en.json';
    }
    $locale = json_decode( file_get_contents( $file ), true );
	
	if ( $crw_has_crossword ) {
        wp_enqueue_script('angular', $plugin_path . 'js/angular.min.js');
        wp_enqueue_script('angular-sanitize', $plugin_path . 'js/angular-sanitize.min.js', array( 'angular' ));
        wp_enqueue_script('quantic-stylemodel', $plugin_path . 'js/qantic.angularjs.stylemodel.min.js', array( 'angular' ));
        wp_enqueue_script('crw-js', $plugin_path . 'js/crosswordsearch.js', array( 'angular', 'angular-sanitize', 'quantic-stylemodel' ));
        wp_localize_script('crw-js', 'crwBasics', array_merge((array)$locale, array(
            'pluginPath' => $plugin_path
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

function crw_shortcode_handler( $atts, $content = null ) {
    $plugin_path = plugins_url() . '/crosswordsearch/';
	extract( shortcode_atts( array(
		'mode' => 'build',
	), $atts ) );
	// load stylesheet into page bottom to get it past theming
    wp_enqueue_style('crw-css', $plugin_path . 'css/crosswordsearch.css');
	
	// wrapper divs
	$html = '
<div class="crw-wrapper" ng-controller="CrosswordController">
    <div class="crw-crossword' . ( 'build' == $mode ? ' wide' : '' ) . '" ng-controller="SizeController">
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
                <tr ng-repeat="row in crosswordData.content" crw-index-checker="line">
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
        </div>
    </div>
    <div id="crw-controls" ng-controller="WordController" ng-switch on="immediate">';
    // controls and output area
    if ( 'build' == $mode ) {
        // build mode: global editing and wordlist with color chooser and delete button
        $html .= '
        <p>Felder:
            <button ng-click="randomize()" title="' . __('Fill all empty fields with random letters', 'crw-text') . '">' . __('Fill fields', 'crw-text') . '</button>
            <button ng-click="empty()" title="' . __('Empty all fields', 'crw-text') . '">' . __('Empty', 'crw-text') . '</button>
            <button ng-click="save()" title="' . __('Save the riddle', 'crw-text') . '">' . __('Save', 'crw-text') . '</button>
        </p>
        <ul class="crw-word">
            <li ng-class="{\'highlight\': isHighlighted(word.id)}" ng-repeat="word in wordsToArray(crosswordData.words) | orderBy:\'id\'" ng-controller="EntryController">
                <dl class="cse" cse-select cse-options="colors" cse-model="word.color"></dl>';
                /// translators: first two pars are line/column numbers, third is a direction like "to the right" or "down"
                $html .= '<span>{{word.fields | joinWord}} (' . sprintf( __('from line %1$s, column %2$s %3$s', 'crw-text'), '{{word.start.y + 1}}', '{{word.start.x + 1}}', '{{localizeDirection(word.direction)}}') . ')</span>
                <button ng-click="deleteWord(word.id)">' . __('Delete', 'crw-text') . '</button>
            </li>
        </ul>
        <div class="crw-immediate" ng-if="immediate"></div>
        <div ng-switch-when="invalidWords">
            <p ng-pluralize count="invalidCount" when="{
                \'one\': \'' . __('The marked word no longer fits into the crossword area. For a successfull resize this word must be deleted.', 'crw-text') . '\',
                \'other\': \'' . __('The marked words no longer fit into the crossword area. For a successfull resize these words must be deleted.', 'crw-text') . '\'}"></p>
            <p class="actions">
                <button ng-click="deleteInvalid()">' . __('Delete', 'crw-text') . '</button>
                <button ng-click="abortInvalid()">' . __('Abort', 'crw-text') . '</button>
            </p>
        </div>
        <div ng-switch-when="saveCrossword">
            <form name="uploader">
                <p>' . __('To save it, the riddle must get a name: (at least 4 letters)', 'crw-text') . '</p>
                <p class="actions">
                    <input type="text" ng-model="crosswordData.name" name="name" required="" ng-minlength="4">
                    <button ng-disabled="!uploader.name.$valid" ng-click="upload()">' . __('Save', 'crw-text') . '</button>
                </p>
                <p class="error" ng-show="uploader.name.$error.required">' . __('A name must be given!', 'crw-text') . '</p>
                <p class="error" ng-show="uploader.name.$error.minlength">' . __('The name is too short!', 'crw-text') . '</p>
                <p class="confirm" ng-show="uploader.name.$valid">' . __('That\'s the way!', 'crw-text') . '</p>
            </form>
        </div>';
    } elseif ( 'solve' == $mode ) {
        // solve mode: load/save functions and wordlist as solution display
        $html .= '
        <p>' . __('Riddle:', 'crw-text') . ' <button ng-click="load()" title="' . __('Load a new riddle', 'crw-text') . '">' . __('Load', 'crw-text') . '</button></p>
        <ul class="crw-word">
            <li ng-class="{\'highlight\': isHighlighted(word.id)}" ng-repeat="word in wordsToArray(crosswordData.solution) | orderBy:\'id\'" ng-controller="EntryController">
                <img ng-src="' . $plugin_path . 'images/bullet-{{word.color}}.png">
                <span>{{word.fields | joinWord}}</span>
            </li>
        </ul>
        <div class="crw-immediate" ng-if="immediate"></div>
        <div ng-switch-when="falseWord">
            <p>' . __('The marked word is not part of the solution.', 'crw-text') . '</p>
            <p class="actions">
                <button ng-click="deleteFalse()">' . __('Delete', 'crw-text') . '</button>
            </p>
        </div>';
    }
    $html .= '
    </div>
</div>';
	return $html;
}
add_shortcode( 'crosswordsearch', 'crw_shortcode_handler' );

