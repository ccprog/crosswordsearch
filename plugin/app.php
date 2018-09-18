<svg width="0" height="0">
  <symbol id="crw-btn-fill" viewBox="0 0 31 31">
    <path d="M 0,15 C 1,16 2,17 4,17 H 7.5 V 13.7 L 13.3,19 7.5,24.3 V 21 H 4 C 2,21 0,20 0,18 Z M 10.8,7.7 9,12.4 13,16.1 H 14.3 L 14.9,17.9 H 17.6 L 13.8,7.7 Z M 12.3,10.3 13.5,13.9 H 11.1 Z M 18.7,19.5 17.7,20.7 H 23.2 V 22.9 H 14.6 V 20.7 L 15.6,19.5 Z M 18.55,15.9 19.7,14.5 H 18 L 17.2,12.3 H 22.9 V 14.5 L 19.54,18.5 Z M 6,22.5 V 25 H 25 V 6 H 6 V 15.5 H 4 V 6 A 2,2 0 0 1 6,4 H 25 A 2,2 0 0 1 27,6 V 25 A 2,2 0 0 1 25,27 H 6 A 2,2 0 0 1 4,25 V 22.5 Z" />
  </symbol>
  <symbol id="crw-btn-empty" viewBox="0 0 31 31">
    <path d="M 17,17.3 C 18,16.3 19,15.3 21,15.3 H 24.5 V 18.6 L 30.3,13.3 24.5,8 V 11.3 H 21 C 19,11.3 17,12.3 17,14.3 Z M 25.2,6 H 6 V 25 H 25 V 20.8 L 27,19 V 25 A 2,2 0 0 1 25,27 H 6 A 2,2 0 0 1 4,25 V 6 A 2,2 0 0 1 6,4 H 25 A 2,2 0 0 1 27,6 V 7.6 Z" />
  </symbol>
  <symbol id="crw-btn-trash" viewBox="0 0 31 31">
    <path d="M 13.5,7 H 17.5 A 1,1 0 0 1 17.5,9 H 13.5 A 1,1 0 0 1 13.5,7 Z M 13,5 A 2,2 0 0 0 11,7 L 6,9 V 11 H 25 V 9 L 20,7 A 2,2 0 0 0 18,5 Z M 8.1,12.5 8.5,24 A 2,2 0 0 0 10.5,26 H 20.5 A 2,2 0 0 0 22.5,24 L 22.9,12.5 H 20.9 L 20.5,24 H 18.5 L 18.7,12.5 H 16.7 L 16.5,24 H 14.5 L 14.3,12.5 H 12.3 L 12.5,24 H 10.5 L 10.1,12.5 Z" />
  </symbol>
  <symbol id="crw-btn-restart" viewBox="0 0 31 31">
    <path d="M 23.5,5.5 24.5,13.5 16.5,12.5 18.95,10.03 A 6.5,6.5 0 1 0 21.125,18.75 L 23.719,20.25 A 9.5,9.5 0 1 1 21.125,7.875 Z" />
  </symbol>
  <symbol id="crw-btn-waiting" viewBox="0 0 31 31">
    <path d="M 15.5,4 A 11.5,11.5 0 0 0 15.5,27 11.5,11.5 0 0 0 15.5,4 Z M 15.5,6 A 9.5,9.5 0 0 1 15.5,25 9.5,9.5 0 0 1 15.5,6 Z M 12,22 22,15.5 12,9 Z" />
  </symbol>
  <symbol id="crw-btn-playing" viewBox="0 0 31 31">
    <path d="M 15.5,8 A 9.5,9.5 0 0 0 15.5,27 9.5,9.5 0 0 0 15.5,8 Z M 15.5,10 A 7.5,7.5 0 0 1 15.5,25 7.5,7.5 0 0 1 15.5,10 Z M 15.5,4 A 3,3 0 0 0 15.5,10 3,3 0 0 0 15.5,4 Z M 15.5,6 A 1,1 0 0 1 15.5,8 1,1 0 0 1 15.5,6 Z M 11,11 9,9 7,11 9,13 M 16.5,13 A 1,1 0 0 0 14.5,13 V 16 A 2.2,2.2 0 1 0 16.5,16 Z" />
  </symbol>
  <symbol id="crw-btn-final" viewBox="0 0 31 31">
    <path d="M 15.5,4 A 11.5,11.5 0 0 0 15.5,27 11.5,11.5 0 0 0 15.5,4 Z M 15.5,6 A 9.5,9.5 0 0 1 15.5,25 9.5,9.5 0 0 1 15.5,6 Z M 15.5,7.5 17.73,12.43 23.11,13.03 19.1,16.7 20.2,21.97 15.5,19.3 10.8,21.97 11.89,16.67 7.89,13.03 13.27,12.43 Z" />
  </symbol>
  <symbol id="crw-bullet" viewBox="0 0 17 17">
      <circle cx="8.5" cy="8.5" r="6.5" stroke-width="2" fill="none" />
  </symbol>
</svg>
<?php // build mode has an action menu including a name selection for server reload

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
    <div class="crw-crossword<?php echo ( 'build' == $mode ? ' wide" ng-style="styleCrossword()' : '' ) ?>" ng-controller="SizeController" ng-if="crosswordData">
        <div ng-style="styleGridSize()" class="crw-grid" ng-class="{divider: <?php echo ( 'build' == $mode ? 'true' : 'false' ) ?> || !tableVisible}">
<?php // resize handles

if ( 'build' == $mode ) {

?>
            <div crw-catch-mouse down="startResize" up="stopResize">
                <div title="<?php _e('Drag to move the border of the riddle', 'crosswordsearch') ?>" id="handle-left" transform-multi-style style-name="size-left" ng-style="modLeft.styleObject['handle-left'].style"></div>
                <div title="<?php _e('Drag to move the border of the riddle', 'crosswordsearch') ?>" id="handle-top" transform-multi-style style-name="size-top" ng-style="modTop.styleObject['handle-top'].style"></div>
                <div title="<?php _e('Drag to move the border of the riddle', 'crosswordsearch') ?>" id="handle-right" transform-multi-style style-name="size-right" ng-style="modRight.styleObject['handle-right'].style"></div>
                <div title="<?php _e('Drag to move the border of the riddle', 'crosswordsearch') ?>" id="handle-bottom" transform-multi-style style-name="size-bottom" ng-style="modBottom.styleObject['handle-bottom'].style"></div>
            </div>
<?php

}

?>
        </div>
        <div class="crw-mask" ng-style="styleGridSize()" ng-class="{invisible: !tableVisible}">
<?php // crossword table

if ( 'preview' == $mode ) {

?>
            <table class="crw-table" ng-style="styleShift()" ng-controller="TableController" ng-Init="setMode('<?php echo $mode ?>')">
                <tr ng-repeat="row in crosswordData.table" crw-index-checker="line">
                    <td class="crw-field" ng-repeat="field in row" crw-index-checker="column">
                        <div><span>{{field.letter}}</span>
<?php

} else {

?>
            <table class="crw-table" ng-style="styleShift()" ng-controller="TableController" ng-Init="setMode('<?php echo $mode ?>')" crw-catch-mouse down="startMark" up="stopMark" prevent-default>
                <tr ng-repeat="row in crosswordData.table" crw-index-checker="line">
                    <td class="crw-field" ng-repeat="field in row" crw-index-checker="column">
                        <div <?php if ( 'build' == $mode ) { echo 'ng-click="activate(line, column)"'; } ?> ng-mouseenter="intoField(line, column)" ng-mouseleave="outofField(line, column)">
                            <span tabindex="-1" unselectable="on" contenteditable="true" ng-model="field.letter"></span>
<?php

}

?>
                            <div unselectable="on" ng-repeat="marker in getMarks(line, column)" class="crw-marked" ng-class ="getImgClass(marker)"></div>
                        </div>
                    </td>
                </tr>
            </table>
        </div>
<?php // fill/empty buttons

if ( 'build' == $mode ) {

?>
        <p ng-style="styleExtras()">
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
                <svg ng-class="word.color" title="{{localize(word.color)}}"><use xlink:href="#crw-bullet"></svg>
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
