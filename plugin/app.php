<?php 

include 'images/sprites.svg';

// build mode has an action menu including a name selection for server reload
if ( 'build' == $mode ) {

?>
    <div><dl class="menu" cse-select="command" cse-options="commandList" cse-model="entry" is-menu="<?php _e('Riddle...', 'crosswordsearch') ?>" template="crw-menu"></dl></div>
    <p class="error" ng-if="loadError">{{loadError.error}}</p>
    <p class="error" ng-repeat="msg in loadError.debug">{{msg}}</p>
    <p class="name">{{crosswordData.name}}</p>
    <form name="meta">
        <label class="crw-instruction" for ="description"><?php _e('Describe which words should be found:', 'crosswordsearch') ?></label>
        <textarea ng-model="crosswordData.description" name="description" crw-add-parsers="sane"></textarea>
        <p class="error" ng-show="meta.$error.sane"><?php _e('Dont\'t try to be clever!', 'crosswordsearch') ?></p>
    </form>
    <dl class="crw-level">
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
    <dl class="crw-level">
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
    <div crw-timer-element="timer" countdown="<?php echo $countdown ?>" <?php if ($submitting) { echo 'submitting'; } ?>>
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
    <div class="crw-crossword<?php echo ( 'build' == $mode ? ' wide' : '' ) ?>" ng-if="crosswordData">
        <svg class="crw-gridtable" ng-controller="GridController" crw-gridsize 
            ng-Init="setMode('<?php echo $mode ?>')">
            <defs>
                <line id="crw-markerline-current" crw-gridline="currentMarking" stroke-linecap="round" />
                <mask id="crw-markermask-current" maskUnits="userSpaceOnUse" width="100%" height="100%">
                    <rect fill="white" width="100%" height="100%"/>
                    <use class="crw-markerline" stroke="black" xlink:href="#crw-markerline-current"/>
                </mask>
                <pattern id="crw-gridpattern" patternUnits="userSpaceOnUse">
                    <path class="gridlines"/>
                </pattern>
            </defs>
            <defs ng-repeat="word in crosswordData.words">
                <line id="crw-markerline-{{word.ID}}" crw-gridline="word" stroke-linecap="round" />
                <mask id="crw-markermask-{{word.ID}}" maskUnits="userSpaceOnUse" width="100%" height="100%">
                    <rect fill="white" width="100%" height="100%"/>
                    <use class="crw-markerline" stroke="black" xlink:href="{{getId('#crw-markerline-', word.ID)}}"/>
                </mask>
            </defs>
            <rect class="gridborder" ng-class="{invisible: gridVisible}" fill="url(#crw-gridpattern)"/>
            <g ng-if="mode == 'build'" crw-catch-mouse down="startResize" up="stopResize" prevent-default>
                <svg class="gridhandle top" x="20%" width="60%" ng-attr-height="{{handleSize.width}}"
                    ng-attr-transform="translate(0 {{handleSize.offset - handleSize.width}})">
                    <rect width="100%" height="100%" fill="none"/>
                    <use xlink:href="#crw-handle-top"/>
                </svg>
                <svg class="gridhandle bottom" x="20%" y="100%" width="60%" ng-attr-height="{{handleSize.width}}">
                    <rect width="100%" height="100%" fill="none"/>
                    <use xlink:href="#crw-handle-bottom"/>
                </svg>
                <svg class="gridhandle left" y="20%" ng-attr-width="{{handleSize.width}}" height="60%"
                    ng-attr-transform="translate({{handleSize.offset - handleSize.width}} 0)">
                    <rect width="100%" height="100%" fill="none"/>
                    <use xlink:href="#crw-handle-left"/>
                </svg>
                <svg class="gridhandle right" x="100%" y="20%" ng-attr-width="{{handleSize.width}}" height="60%">
                    <rect width="100%" height="100%" fill="none"/>
                    <use xlink:href="#crw-handle-right"/>
                </svg>
            </g>
            <g<?php if ( 'build' == $mode ) { ?> crw-catch-mouse down="startMark" up="stopMark" prevent-default<?php } ?>>
                <g ng-repeat="row in crosswordData.table" crw-index-checker="line">
                    <g ng-repeat="field in row" crw-index-checker="column" crw-gridfield>
                        <rect class="gridlight"/>
                        <text class="gridletter">{{field.letter}}</text>
                    </g>
                </g>
            </g>
            <use class="crw-marker" ng-class="word.color" ng-repeat="word in crosswordData.words" mask="url(#crw-markermask-{{word.ID}})" xlink:href="{{getId('#crw-markerline-', word.ID)}}"/>
            <use class="crw-marker" ng-class="currentMarking.color" ng-if="isMarking" mask="url(#crw-markermask-current)" xlink:href="#crw-markerline-current"/>
        </svg>
<?php // fill/empty buttons

if ( 'build' == $mode ) {

?>
        <p class="crw-extras">
            <svg class="crw-control-button" ng-click="randomize()" title="<?php _e('Fill all empty fields with random letters', 'crosswordsearch') ?>" alt="<?php _e('Fill fields', 'crosswordsearch') ?>">
                <use xlink:href="#crw-btn-fill"/>
            </svg>
            <svg class="crw-control-button" ng-click="empty()" title="<?php _e('Empty all fields', 'crosswordsearch') ?>" alt="<?php _e('Empty', 'crosswordsearch') ?>">
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
    <div class="crw-controls wide">
        <ul class="crw-word">
            <li ng-class="{'highlight': isHighlighted()}" ng-repeat="word in wordsToArray(crosswordData.words) | orderBy:'ID'" ng-controller="EntryController">
                <dl class="crw-color" template="color-select" cse-select="color" cse-options="colors" cse-model="word.color"></dl>
                <span class="crw-word-sequence">{{word.fields | joinWord}} (<?php
                /// translators: first two arguments are line/column numbers, third is a direction like "to the right" or "down"
                printf( __('from line %1$s, column %2$s %3$s', 'crosswordsearch'), '{{word.start.y + 1|localeNumber}}', '{{textIsLTR ? word.start.x + 1 : crosswordData.size.width - word.start.x|localeNumber}}', '{{localize(word.direction)}}') ?>)</span>
                <svg class="crw-control-button" ng-click="deleteWord(word.ID)" title="<?php _e('Delete', 'crosswordsearch') ?>">
                    <use xlink:href="#crw-btn-trash"/>
                </svg>
            </li>
        </ul>
<?php // preview mode: wordlist

} elseif ( 'preview' == $mode ) {

?>
    <div class="crw-controls">
        <ul class="crw-word">
            <li ng-repeat="word in wordsToArray(crosswordData.words) | orderBy:'ID'" ng-controller="EntryController">
                <svg class="crw-marker" ng-class="word.color" title="{{localize(word.color)}}"><use xlink:href="#crw-bullet"></svg>
                <span>{{word.fields | joinWord}}</span>
            </li>
        </ul>
<?php // solve mode: solution status and restart button, wordlist as solution display

} else {

?>
    <div class="crw-controls" ng-class="{invisible: !tableVisible}">
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
                <svg ng-class="word.solved ? word.color : 'grey'" title="{{localize(word.color)}}"><use xlink:href="#crw-bullet"></svg>
                <span>{{word.fields | joinWord}}</span>
            </li>
        </ul>
<?php

}

?>
    </div>
    <p ng-show="crosswordData.author" class="copyright"><?php _e('Authored by', 'crosswordsearch') ?> {{crosswordData.author}}</p>
