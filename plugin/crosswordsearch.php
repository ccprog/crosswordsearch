<?php
/*
Plugin Name: crosswordsearch
Plugin URI: https://github.com/ccprog/crosswordseach
Version: 0.1.0
Author: Claus Colloseus
Author URI: http://browser-unplugged.net
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

function add_crw_scripts () {
	global $post;
    $plugin_path = plugins_url() . '/crosswordsearch/';
	if ( has_shortcode( $post->post_content, 'crosswordsearch') ) {
        wp_enqueue_script('angular', $plugin_path . 'js/angular.min.js');
        wp_enqueue_script('angular-sanitize', $plugin_path . 'js/angular-sanitize.min.js', array( 'angular' ));
        wp_enqueue_script('quantic-stylemodel', $plugin_path . 'js/qantic.angularjs.stylemodel.min.js', array( 'angular' ));
        wp_enqueue_script('crw-js', $plugin_path . 'js/crosswordsearch.js', array( 'angular', 'angular-sanitize', 'quantic-stylemodel' ));
	}
}

add_action( 'wp_enqueue_scripts', 'add_crw_scripts');

function crw_shortcode_handler( $atts, $content = null ) {
    $plugin_path = plugins_url() . '/crosswordsearch/';
	extract( shortcode_atts( array(
		'mode' => 'build',
	), $atts ) );
	// load stylesheet into page bottom to get it past theming
    wp_enqueue_style('crw-css', $plugin_path . 'css/crosswordsearch.css');
	
	// wrapper divs
	$html = '
<div ng-app="app">
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
                <tr ng-repeat="row in crw.content" crw-index-checker="line">
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
            <button ng-click="randomize()" title="Leere Felder mit zufälligen Buchstaben auffüllen">Auffüllen</button>
            <button ng-click="empty()" title="Alle Felder leeren">Leeren</button>
            <button ng-click="save()">Testausgabe</button>
        </p>
        <ul class="crw-word">
            <li ng-class="{\'highlight\': isHighlighted(word.id)}" ng-repeat="word in wordsToArray(crw.words) | orderBy:\'id\'" ng-controller="EntryController">
                <dl class="cse" cse-select cse-options="colors" cse-model="word.color"></dl>
                <span>{{word.fields | joinWord}} (ab [{{word.start.x + 1}}, {{word.start.y + 1}}] nach {{word.direction}})</span>
                <button ng-click="deleteWord(word.id)">Löschen</button>
            </li>
        </ul>
        <div class="crw-immediate" ng-if="immediate"></div>
        <div ng-switch-when="invalidWords" crw-invalid-words></div>
        <div ng-switch-when="saveCrossword" crw-save-crossword></div>';
    } elseif ( 'solve' == $mode ) {
        // solve mode: load/save functions and wordlist as solution display
        $html .= '
        <p>Rätsel: <button ng-click="load()" title="">Laden</button></p>
        <ul class="crw-word">
            <li ng-class="{\'highlight\': isHighlighted(word.id)}" ng-repeat="word in wordsToArray(crw.solution) | orderBy:\'id\'" ng-controller="EntryController">
                <img ng-src="' . $plugin_path . 'images/bullet-{{word.color}}.png">
                <span>{{word.fields | joinWord}}</span>
            </li>
        </ul>
        <div class="crw-immediate" ng-if="immediate"></div>
        <div ng-switch-when="falseWord" crw-false-word></div>';
    }
    $html .= '
    </div>
</div>';
	return $html;
}

add_shortcode( 'crosswordsearch', 'crw_shortcode_handler' );

