
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
                            <button tabindex="-1" unselectable="on" ng-keydown="move($event)" ng-keypress="type($event)" crw-set-focus>{{field.letter}}</button>
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
            <button class="crw-control-button fill" ng-click="randomize()" title="<?php _e('Fill all empty fields with random letters', 'crosswordsearch') ?>" alt="<?php _e('Fill fields', 'crosswordsearch') ?>"></button><button class="crw-control-button empty" ng-click="empty()" title="<?php _e('Empty all fields', 'crosswordsearch') ?>" alt="<?php _e('Empty', 'crosswordsearch') ?>"></button>
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
                <span>{{word.fields | joinWord}} (<?php
                /// translators: first two arguments are line/column numbers, third is a direction like "to the right" or "down"
                printf( __('from line %1$s, column %2$s %3$s', 'crosswordsearch'), '{{word.start.y + 1|localeNumber}}', '{{textIsLTR ? word.start.x + 1 : crosswordData.size.width - word.start.x|localeNumber}}', '{{localize(word.direction)}}') ?>)</span>
                <button class="crw-control-button trash" ng-click="deleteWord(word.ID)" title="<?php _e('Delete', 'crosswordsearch') ?>"></button>
            </li>
        </ul>
<?php // preview mode: wordlist

} elseif ( 'preview' == $mode ) {

?>
    <div class="crw-controls">
        <ul class="crw-word">
            <li ng-repeat="word in wordsToArray(crosswordData.words) | orderBy:'ID'" ng-controller="EntryController">
                <img title="{{localize(word.color)}}" ng-src="<?php echo $image_dir ?>bullet-{{word.color}}.png">
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
            <button class="crw-control-button restart" ng-click="restart()" ng-disabled="loadedName!=crosswordData.name" title="<?php _e('Restart solving the riddle', 'crosswordsearch') ?>" alt="<?php _e('Restart', 'crosswordsearch') ?>"></button>
<?php

    }

?>
        </p>
        <ul class="crw-word" ng-class="{'palid': crw.getLevelRestriction('sol')}">
            <li ng-class="{'highlight': isHighlighted(), 'found': word.solved}" ng-repeat="word in wordsToArray(crosswordData.solution) | orderBy:'ID'" ng-controller="EntryController">
                <img ng-if="word.solved" title="{{localize(word.color)}}" ng-src="<?php echo $image_dir ?>bullet-{{word.color}}.png">
                <img ng-if="!word.solved" title="localize('grey')" ng-src="<?php echo $image_dir ?>bullet-grey.png">
                <span>{{word.fields | joinWord}}</span>
            </li>
        </ul>
<?php

}

?>
    </div>
    <p ng-show="crosswordData.author" class="copyright"><?php _e('Authored by', 'crosswordsearch') ?> {{crosswordData.author}}</p>
