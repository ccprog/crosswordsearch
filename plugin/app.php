
<?php // build mode has an action menu including a name selection for server reload

if ( 'build' == $mode ) {

?>
    <div><dl class="cse menu" cse-select="command" cse-options="commandList" cse-model="entry" cse-is-menu cse-template="crw-menu" ng-init="entry='<?php _e('Riddle...', 'crw-text') ?>'"></dl></div>
    <p class="error" ng-if="loadError">{{loadError.error}}</p>
    <p class="error" ng-repeat="msg in loadError.debug">{{msg}}</p>
    <p class="name">{{crosswordData.name}}</p>
    <form name="meta">
        <label for ="description"><?php _e('Give a hint which words should be found:', 'crw-text') ?></label><br/>
        <textarea ng-model="crosswordData.description" name="description" crw-add-parsers="sane"></textarea>
        <p class="error" ng-show="meta.$error.sane"><?php _e('Dont\'t try to be clever!', 'crw-text') ?></p>
    </form>
    <dl class="crw-level">
        <dt><span><?php _e('Select a difficulty level:', 'crw-text') ?></span>
            <dl class="cse" cse-select="level" cse-options="levelList" cse-model="crosswordData.level" cse-template="crw-level-number"></dl>
        </dt>
<?php // single solve/preview only shows the name

} else {

    if ( $is_single ) {

?>
    <p class="name">{{crosswordData.name}}</p>
<?php // multi solve has a name selection

    } else {

?>
    <div><dl class="cse name" title="<?php _e('Select a riddle', 'crw-text') ?>" cse-select="load" cse-options="namesInProject" cse-model="loadedName"></dl></div>
    <p class="error" ng-if="loadError">{{loadError.error}}</p>
    <p class="error" ng-repeat="msg in loadError.debug">{{msg}}</p>

<?php

    }

?>
    <p class="crw-description" ng-show="crosswordData.description"><em><?php _e('Find these words in the riddle:', 'crw-text') ?></em> {{crosswordData.description}}</p>
    <dl class="crw-level">
        <dt><?php _e('Difficulty level', 'crw-text') ?> {{crosswordData.level+1}}</dt>
<?php

}

?>
        <dd><?php _e('Word directions', 'crw-text') ?>:
            <strong ng-show="crw.getLevelRestriction('dir')"><?php _e('only to the right and down', 'crw-text') ?>,</strong>
            <strong ng-show="!crw.getLevelRestriction('dir')"><?php _e('any, including the diagonals and backwards', 'crw-text') ?>,</strong>
            <br /><?php _e('List of words that should be found', 'crw-text') ?>:
            <strong ng-show="crw.getLevelRestriction('sol')"><?php _e('visible before found', 'crw-text') ?></strong>
            <strong ng-show="!crw.getLevelRestriction('sol')"><?php _e('hidden before found', 'crw-text') ?></strong>
        </dd>
    </dl>
    <div class="crw-crossword<?php echo ( 'build' == $mode ? ' wide" ng-style="styleCrossword()' : '' ) ?>" ng-controller="SizeController" ng-if="crosswordData">
        <div ng-style="styleGridSize()" class="crw-grid<?php if ( 'build' == $mode ) echo ' divider' ?>">
<?php // resize handles

if ( 'build' == $mode ) {

?>
            <div crw-catch-mouse down="startResize" up="stopResize">
                <div title="<?php _e('Drag to move the border of the riddle', 'crw-text') ?>" id="handle-left" transform-multi-style style-name="size-left" ng-style="modLeft.styleObject['handle-left'].style"></div>
                <div title="<?php _e('Drag to move the border of the riddle', 'crw-text') ?>" id="handle-top" transform-multi-style style-name="size-top" ng-style="modTop.styleObject['handle-top'].style"></div>
                <div title="<?php _e('Drag to move the border of the riddle', 'crw-text') ?>" id="handle-right" transform-multi-style style-name="size-right" ng-style="modRight.styleObject['handle-right'].style"></div>
                <div title="<?php _e('Drag to move the border of the riddle', 'crw-text') ?>" id="handle-bottom" transform-multi-style style-name="size-bottom" ng-style="modBottom.styleObject['handle-bottom'].style"></div>
            </div>
<?php

}

?>
        </div>
        <div class="crw-mask" ng-style="styleGridSize()">
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
            <button class="fill" ng-click="randomize()" title="<?php _e('Fill all empty fields with random letters', 'crw-text') ?>" alt="<?php _e('Fill fields', 'crw-text') ?>"></button><button class="empty" ng-click="empty()" title="<?php _e('Empty all fields', 'crw-text') ?>" alt="<?php _e('Empty', 'crw-text') ?>"></button>
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
                <dl class="cse crw-color" title="{{word.color}}" cse-template="color-select" cse-select="color" cse-options="colors" cse-model="word.color"></dl>
                <span>{{word.fields | joinWord}} (<?php
                /// translators: first two arguments are line/column numbers, third is a direction like "to the right" or "down"
                printf( __('from line %1$s, column %2$s %3$s', 'crw-text'), '{{word.start.y + 1}}', '{{word.start.x + 1}}', '{{localizeDirection(word.direction)}}') ?>)</span>
                <button class="trash" ng-click="deleteWord(word.ID)" title="<?php _e('Delete', 'crw-text') ?>"></button>
            </li>
        </ul>
<?php // preview mode: wordlist

} elseif ( 'preview' == $mode ) {

?>
    <div class="crw-controls">
        <ul class="crw-word">
            <li ng-repeat="word in wordsToArray(crosswordData.words) | orderBy:'ID'" ng-controller="EntryController">
                <img title="{{word.color}}" ng-src="<?php echo CRW_PLUGIN_URL ?>images/bullet-{{word.color}}.png">
                <span>{{word.fields | joinWord}}</span>
            </li>
        </ul>
<?php // solve mode: solution status and restart button, wordlist as solution display

} else {

?>
    <div class="crw-controls">
        <p ng-show="crosswordData.name">
            <span ng-if="count.solution<count.words"><?php printf( __('You have found %1$s of %2$s words', 'crw-text'), '{{count.solution}}', '{{count.words}}' ) ?></span>
            <span ng-if="count.solution===count.words"><?php printf( __('You have found all %1$s words!', 'crw-text'), '{{count.words}}' ) ?></span>
            <button class="restart" ng-click="restart()" ng-disabled="loadedName!=crosswordData.name" title="<?php _e('Restart solving the riddle', 'crw-text') ?>" alt="<?php _e('Restart', 'crw-text') ?>"></button>
        </p>
        <ul class="crw-word" ng-class="{'palid': crw.getLevelRestriction('sol')}">
            <li ng-class="{'highlight': isHighlighted(), 'found': word.solved}" ng-repeat="word in wordsToArray(crosswordData.solution) | orderBy:'ID'" ng-controller="EntryController">
                <img ng-if="word.solved" title="{{word.color}}" ng-src="<?php echo CRW_PLUGIN_URL ?>images/bullet-{{word.color}}.png">
                <img ng-if="!word.solved" title="grey" ng-src="<?php echo CRW_PLUGIN_URL ?>images/bullet-grey.png">
                <span>{{word.fields | joinWord}}</span>
            </li>
        </ul>
<?php

}

?>
    </div>
    <p ng-show="crosswordData.author" class="copyright"><?php _e('Authored by', 'crw-text') ?> {{crosswordData.author}}</p>
