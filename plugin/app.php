<?php 

include_once 'images/sprites.svg';

// build mode has an action menu including a name selection for server reload
if ( 'build' == $mode ) {

?>
    <div><dl class="menu" cse-select="command" cse-options="commandList" cse-model="entry" is-menu="<?php _e('Riddle...', 'crosswordsearch') ?>" template="crw-menu"></dl></div>
    <p class="error" ng-if="loadError">{{loadError.error}}</p>
    <p class="error" ng-repeat="msg in loadError.debug">{{msg}}</p>
    <p class="name">{{crosswordData.name}}</p>
    <form name="meta" ng-disabled="waitsForData">
        <label class="crw-instruction" for ="description"><?php _e('Describe which words should be found:', 'crosswordsearch') ?></label>
        <textarea ng-model="crosswordData.description" name="description" crw-add-parsers="sane"></textarea>
        <p class="error" ng-show="meta.$error.sane"><?php _e('Dont\'t try to be clever!', 'crosswordsearch') ?></p>
    </form>
    <dl class="crw-level" ng-class="{invisible: waitsForData}">
        <dt class="crw-instruction"><span><?php _e('Select a difficulty level:', 'crosswordsearch') ?></span>
            <dl cse-select="level" cse-options="levelList" cse-model="crosswordData.level" display="value + 1|localeNumber"></dl>
        </dt>
<?php // single solve/preview only shows the name

} else {

    if ( $is_single ) {

?>
    <p class="name">{{crosswordData.name}}</p>
<?php // multi solve has a name selection

    } else {

?>
    <div><dl class="name" title="<?php _e('Select a riddle', 'crosswordsearch') ?>" cse-select="load" cse-options="namesInProject" cse-model="loadedName"></dl></div>

<?php

    }

?>
    <p class="error" ng-if="loadError">{{loadError.error}}</p>
    <p class="error" ng-repeat="msg in loadError.debug">{{msg}}</p>
    <p class="crw-description" ng-show="crosswordData.description"><em><?php _e('Find these words in the riddle:', 'crosswordsearch') ?></em> {{crosswordData.description}}</p>
    <dl class="crw-level" ng-class="{invisible: waitsForData}">
        <dt><?php _e('Difficulty level', 'crosswordsearch') ?> {{crosswordData.level+1|localeNumber}}</dt>
<?php

}

?>
        <dd><?php _e('Word directions', 'crosswordsearch') ?>:
            <strong ng-show="crw.getLevelRestriction('dir')"><?php _e('only to the right and down', 'crosswordsearch') ?></strong>
            <strong ng-show="!crw.getLevelRestriction('dir')"><?php _e('any, including diagonal and backwards', 'crosswordsearch') ?></strong>
            <br /><?php _e('List of words that should be found', 'crosswordsearch') ?>:
            <strong ng-show="crw.getLevelRestriction('sol')"><?php _e('visible before found', 'crosswordsearch') ?></strong>
            <strong ng-show="!crw.getLevelRestriction('sol')"><?php _e('hidden before found', 'crosswordsearch') ?></strong>
        </dd>
    </dl>
<?php // usage instruction

if ( 'build' == $mode ) {

?>
    <p class="crw-instruction"><?php _e('Fill in the the letters and mark the words:', 'crosswordsearch') ?></p>
<?php

} elseif ( 'solve' == $mode ) {

?>
    <p class="crw-instruction"><?php _e('Mark the words:', 'crosswordsearch') ?></p>
<?php // competetive mode, inner elements only transport localized strings

    if ( $timer ) {

?>
    <div ng-class="{invisible: waitsForData}" crw-timer-element="timer" countdown="<?php echo $countdown ?>" <?php if ($submitting) { echo 'submitting'; } ?>>
        <span state="waiting" alt="<?php _e('Start', 'crosswordsearch') ?>"><?php _e('Start solving the riddle', 'crosswordsearch') ?></span>
        <span state="playing" alt="<?php _e('Time', 'crosswordsearch') ?>"></span>
        <span state="scored" alt="<?php _e('Restart', 'crosswordsearch') ?>"><?php _e('Restart solving the riddle', 'crosswordsearch') ?></span>
        <span state="final" alt="<?php _e('Result', 'crosswordsearch') ?>"></span>
        <span state="down"><?php _e('Remaining time', 'crosswordsearch') ?></span>
        <span state="up"><?php _e('Time used', 'crosswordsearch') ?></span>
    </div>
<?php

    }

}

?>
    <div class="crw-crossword<?php echo ( 'build' == $mode ? ' wide' : '' ) ?>" ng-class="{invisible: waitsForData}">
        <input type="text" tabindex="-1" crw-letter-input></input>
        <svg class="crw-spinner" ng-if="waitsForData" width="100%" height="100%">
            <title></title>
            <use xlink:href="#crw-spinner" x="50%" y="30%" width="64" height="64" transform="translate(-32 -32)"/>
            <text x="50%" y="90%" dy="-1.25em"><?php
               ///translators:  cut the following sentence into halves to distribute it over two lines; first half... 
               _e('Please be patient for the', 'crosswordsearch') ?></text>
            <text x="50%" y="90%"><?php
               ///translators: ...second half
               _e('crossword being loaded.', 'crosswordsearch') ?></text>
        </svg>
        <svg class="crw-gridtable" ng-if="crosswordData" ng-controller="GridController" crw-gridsize 
            ng-Init="setMode('<?php echo $mode ?>')">
            <defs>
                <line id="crw-markerline-<?php echo $crw_scid; ?>-current" crw-gridline="currentMarking" stroke-linecap="round" />
                <mask id="crw-markermask-<?php echo $crw_scid; ?>-current" maskUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%">
                    <rect fill="white" width="100%" height="100%"/>
                    <use class="crw-markerline" stroke="black" xlink:href="#crw-markerline-<?php echo $crw_scid; ?>-current"/>
                </mask>
                <pattern id="crw-gridpattern" patternUnits="userSpaceOnUse">
                    <path class="gridlines"/>
                </pattern>
                <clipPath id="crw-gridborderclip-<?php echo $crw_scid; ?>" clipPathUnits="userSpaceOnUse">
                    <rect id="crw-gridborder-<?php echo $crw_scid; ?>"/>
                </clipPath>
            </defs>
            <defs ng-repeat="word in crosswordData.words">
                <line id="crw-markerline-<?php echo $crw_scid; ?>-{{word.ID}}" crw-gridline="word" stroke-linecap="round" />
                <mask id="crw-markermask-<?php echo $crw_scid; ?>-{{word.ID}}" maskUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%">
                    <rect fill="white" width="100%" height="100%"/>
                    <use class="crw-markerline" stroke="black" xlink:href="{{getId('#crw-markerline-<?php echo $crw_scid; ?>-', word.ID)}}"/>
                </mask>
            </defs>
<?php // drag handles

if ( 'build' == $mode ) {

?>
            <g crw-gridhandle="top">
                <svg class="gridhandle top" ng-class="{moving: moving}" x="20%"
                    crw-catch-mouse down="startResize" up="stopResize" prevent-default>
                    <title><?php _e('Drag to move the border of the riddle', 'crosswordsearch') ?></title>
                    <svg y="0" style="overflow:visible">
                        <rect width="100%" height="100%" fill="none"/>
                        <use xlink:href="#crw-handle-top"/>
                    </svg>
                </svg>
            </g>
            <g crw-gridhandle="bottom">
                <svg class="gridhandle bottom" ng-class="{moving: moving}" x="20%"
                    crw-catch-mouse down="startResize" up="stopResize" prevent-default>
                    <title><?php _e('Drag to move the border of the riddle', 'crosswordsearch') ?></title>
                    <svg y="100%" style="overflow:visible">
                        <rect width="100%" height="100%" fill="none"/>
                        <use xlink:href="#crw-handle-bottom"/>
                    </svg>
                </svg>
            </g>
            <g crw-gridhandle="left">
                <svg class="gridhandle left" ng-class="{moving: moving}" y="20%"
                    crw-catch-mouse down="startResize" up="stopResize" prevent-default>
                    <title><?php _e('Drag to move the border of the riddle', 'crosswordsearch') ?></title>
                    <svg x="0" style="overflow:visible">
                        <rect width="100%" height="100%" fill="none"/>
                        <use xlink:href="#crw-handle-left"/>
                    </svg>
                </svg>
            </g>
            <g crw-gridhandle="right">
                <svg class="gridhandle right" ng-class="{moving: moving}" y="20%"
                    crw-catch-mouse down="startResize" up="stopResize" prevent-default>
                    <title><?php _e('Drag to move the border of the riddle', 'crosswordsearch') ?></title>
                    <svg x="100%" style="overflow:visible">
                        <rect width="100%" height="100%" fill="none"/>
                        <use xlink:href="#crw-handle-right"/>
                    </svg>
                </svg>
            </g>
<?php

}

?>
            <use xlink:href="#crw-gridborder-<?php echo $crw_scid; ?>" class="gridborder" ng-class="{invisible: mode != 'build' && riddleVisible}" fill="url(#crw-gridpattern)"/>
            <g ng-class="{invisible: !riddleVisible}" clip-path="url(#crw-gridborderclip-<?php echo $crw_scid; ?>)"<?php if ( 'preview' != $mode ) { ?> crw-catch-mouse down="startMark" up="stopMark" prevent-default<?php } ?>>
                <g ng-repeat="row in crosswordData.table" crw-index-checker="line">
                    <g ng-repeat="field in row" crw-index-checker="column" crw-gridfield>
                        <rect class="gridlight"/>
                        <text class="gridletter" dy=".4em">{{field.letter}}</text>
                    </g>
                </g>
            </g>
            <use class="crw-marker" ng-class="word.color"
<?php if ( 'solve' == $mode ) { //marker source ?>
                ng-repeat="word in wordsToArray(crosswordData.solution) | filter:{solved:true}"
<?php } else { ?>
                ng-repeat="word in crosswordData.words"
<?php } ?>
                mask="url(#crw-markermask-<?php echo $crw_scid; ?>-{{word.ID}})" xlink:href="{{getId('#crw-markerline-<?php echo $crw_scid; ?>-', word.ID)}}"/>
            <line class="crw-marker invalid" ng-class="currentMarking.color" crw-gridline="invalidMarking" ng-if="invalidMarking" stroke-linecap="round" />
            <use class="crw-marker" ng-class="currentMarking.color" ng-if="isMarking" mask="url(#crw-markermask-<?php echo $crw_scid; ?>-current)" xlink:href="#crw-markerline-<?php echo $crw_scid; ?>-current"/>
        </svg>
<?php // fill/empty buttons

if ( 'build' == $mode ) {

?>
        <p class="crw-extras">
            <svg class="crw-control-button" ng-click="randomize()">
                <title><?php _e('Fill all empty fields with random letters', 'crosswordsearch') ?></title>
                <use xlink:href="#crw-btn-fill"/>
            </svg>
            <svg class="crw-control-button" ng-click="empty()">
                <title><?php _e('Empty all fields', 'crosswordsearch') ?></title>
                <use xlink:href="#crw-btn-empty"/>
            </svg>
        </p>
<?php // controls and output area

}

?>
    </div>
<?php // build mode: wordlist with color chooser and delete button

if ( 'build' == $mode ) {

?>
    <div class="crw-controls wide" ng-class="{invisible: waitsForData}">
        <ul class="crw-word">
            <li ng-class="{'highlight': isHighlighted()}" ng-repeat="word in wordsToArray(crosswordData.words) | orderBy:'ID'" ng-controller="EntryController">
                <dl class="crw-color" template="color-select" cse-select="color" cse-options="colors" cse-model="word.color"></dl>
                <span class="crw-word-sequence">{{word.fields | joinWord}} (<?php
                /// translators: first two arguments are line/column numbers, third is a direction like "to the right" or "down"
                printf( __('from line %1$s, column %2$s %3$s', 'crosswordsearch'), '{{word.start.y + 1|localeNumber}}', '{{textIsLTR ? word.start.x + 1 : crosswordData.size.width - word.start.x|localeNumber}}', '{{localize(word.direction)}}') ?>)</span>
                <svg class="crw-control-button" ng-click="deleteWord(word.ID)">
                    <title><?php _e('Delete', 'crosswordsearch') ?></title>
                    <use xlink:href="#crw-btn-trash"/>
                </svg>
            </li>
        </ul>
<?php // preview mode: wordlist

} elseif ( 'preview' == $mode ) {

?>
    <div class="crw-controls" ng-class="{invisible: waitsForData}">
        <ul class="crw-word">
            <li ng-repeat="word in wordsToArray(crosswordData.words) | orderBy:'ID'" ng-controller="EntryController">
                <svg class="crw-marker" ng-class="word.color" title="{{localize(word.color)}}"><use xlink:href="#crw-bullet"></svg>
                <span>{{word.fields | joinWord}}</span>
            </li>
        </ul>
<?php // solve mode: solution status and restart button, wordlist as solution display

} else {

?>
    <div class="crw-controls" ng-class="{invisible: !riddleVisible ||waitsForData }">
        <p ng-show="crosswordData.name">
            <span ng-if="count.solution<count.words"><?php printf( __('You have found %1$s of %2$s words', 'crosswordsearch'), '{{count.solution|localeNumber}}', '{{count.words|localeNumber}}' ) ?></span>
            <span ng-if="count.solution===count.words"><?php printf( __('You have found all %1$s words!', 'crosswordsearch'), '{{count.words|localeNumber}}' ) ?></span>

<?php // normal solve mode

    if ( !$timer ) {

?>
            <svg class="crw-control-button" ng-click="restart()" ng-disabled="loadedName!=crosswordData.name" title="<?php _e('Restart solving the riddle', 'crosswordsearch') ?>" alt="<?php _e('Restart', 'crosswordsearch') ?>">
                <use xlink:href="#crw-btn-restart"/>
            </svg>
<?php

    }

?>
        </p>
        <ul class="crw-word" ng-class="{'palid': crw.getLevelRestriction('sol')}">
            <li ng-class="{'highlight': isHighlighted(), 'found': word.solved}" ng-repeat="word in wordsToArray(crosswordData.solution) | orderBy:'ID'" ng-controller="EntryController">
                <svg class="crw-marker" ng-class="word.solved ? word.color : 'grey'" title="{{localize(word.color)}}"><use xlink:href="#crw-bullet"></svg>
                <span>{{word.fields | joinWord}}</span>
            </li>
        </ul>
<?php

}

?>
    </div>
    <p ng-show="crosswordData.author" class="copyright"><?php _e('Authored by', 'crosswordsearch') ?> {{crosswordData.author}}</p>
