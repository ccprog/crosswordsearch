
<?php // build mode has an action menu including a name selection for server reload

if ( 'build' == $mode ) {

?>
    <div><dl class="cse menu" cse-select cse-options="commandList" cse-model="entry" cse-is-menu cse-template="crw-menu" ng-init="entry='<?php _e('Riddle...', 'crw-text') ?>'"></dl></div>
    <p class="error" ng-if="loadError">{{loadError.error}}</p>
    <p class="error" ng-repeat="msg in loadError.debug">{{msg}}</p>
    <p class="name">{{crosswordData.name}}</p>
<?php // single solve/preview only shows the name

} elseif ( $is_single ) {

?>
    <p class="name">{{crosswordData.name}}</p>
<?php // multi solve has a name selection

} else {

?>
    <div><dl class="cse name" title="<?php _e('Select a riddle', 'crw-text') ?>" cse-select cse-options="namesInProject" cse-model="loadedName"></dl></div>
    <p class="error" ng-if="loadError">{{loadError.error}}</p>
    <p class="error" ng-repeat="msg in loadError.debug">{{msg}}</p>
<?php

}

?>
    <p class="crw-description" ng-show="crosswordData.description"><em><?php _e('Find these words in the riddle:', 'crw-text') ?></em> {{crosswordData.description}}</p>
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
    <div class="crw-controls">
<?php // build mode: wordlist with color chooser and delete button

if ( 'build' == $mode ) {

?>
        <ul class="crw-word">
            <li ng-class="{'highlight': isHighlighted()}" ng-repeat="word in wordsToArray(crosswordData.words) | orderBy:'ID'" ng-controller="EntryController">
                <dl class="cse crw-color" title="{{word.color}}" cse-template ="color-select" cse-select cse-options="colors" cse-model="word.color"></dl>
                <span>{{word.fields | joinWord}} (<?php
                /// translators: first two arguments are line/column numbers, third is a direction like "to the right" or "down"
                printf( __('from line %1$s, column %2$s %3$s', 'crw-text'), '{{word.start.y + 1}}', '{{word.start.x + 1}}', '{{localizeDirection(word.direction)}}') ?>)</span>
                <button class="trash" ng-click="deleteWord(word.ID)" title="<?php _e('Delete', 'crw-text') ?>"></button>
            </li>
        </ul>
<?php // preview mode: wordlist

} elseif ( 'preview' == $mode ) {

?>
        <ul class="crw-word">
            <li ng-repeat="word in wordsToArray(crosswordData.words) | orderBy:'ID'" ng-controller="EntryController">
                <img title="{{word.color}}" ng-src="<?php echo CRW_PLUGIN_URL ?>images/bullet-{{word.color}}.png">
                <span>{{word.fields | joinWord}}</span>
            </li>
        </ul>
<?php // solve mode: solution status and restart button, wordlist as solution display

} else {

?>
        <p ng-show="crosswordData.name">
            <span ng-if="count.solution<count.words"><?php printf( __('You have found %1$s of %2$s words', 'crw-text'), '{{count.solution}}', '{{count.words}}' ) ?></span>
            <span ng-if="count.solution===count.words"><?php printf( __('You have found all %1$s words!', 'crw-text'), '{{count.words}}' ) ?></span>
            <button class="restart" ng-click="restart()" ng-disabled="loadedName!=crosswordData.name" title="<?php _e('Restart solving the riddle', 'crw-text') ?>" alt="<?php _e('Restart', 'crw-text') ?>"></button>
        </p>
        <ul class="crw-word">
            <li ng-class="{'highlight': isHighlighted(word.ID)}" ng-repeat="word in wordsToArray(crosswordData.solution) | orderBy:'ID'" ng-controller="EntryController">
                <img title="{{word.color}}" ng-src="<?php echo CRW_PLUGIN_URL ?>images/bullet-{{word.color}}.png">
                <span>{{word.fields | joinWord}}</span>
            </li>
        </ul>
<?php

}

?>
    </div>
    <p ng-show="crosswordData.author" class="copyright"><?php _e('Authored by', 'crw-text') ?> {{crosswordData.author}}</p>
    <div class="crw-immediate" ng-controller="ImmediateController" ng-show="immediate" ng-switch on="immediate">
        <div class="blocker"></div>
        <div class="message">
<?php // modal area

if ( 'build' == $mode ) {

?>
            <div ng-switch-when="invalidWords">
                <p ng-pluralize count="invalidCount" when="{
                    'one': '<?php _e('The marked word no longer fits into the crossword area. For a successful resize you must delete this word.', 'crw-text') ?>',
                    'other': '<?php _e('The marked words no longer fit into the crossword area. For a successful resize you must delete these word.', 'crw-text') ?>'}"></p>
                <p class="actions">
                    <button ng-click="finish(true)"><?php _e('Delete', 'crw-text') ?></button>
                    <button ng-click="finish(false)"><?php _e('Abort', 'crw-text') ?></button>
                </p>
            </div>
            <div ng-switch-when="saveCrossword">
                <form name="uploader">
                    <p ng-switch on="action">
                        <span ng-switch-when="insert"><?php _e('To save it, you must give the riddle a new name.', 'crw-text') ?></span>
                        <span ng-switch-when="update"><?php _e('You can change the additional informations that are saved about the riddle.', 'crw-text') ?></span>
                    </p>
                    <table>
                        <tr>
                            <td><label for ="crosswordName"><?php _e('Name:', 'crw-text') ?></label></td>
                            <td><input type="text" ng-model="crosswordData.name" name="crosswordName" required="" ng-minlength="4" crw-add-parsers="sane unique" crw-unique="namesInProject commands"></td>
                        </tr>
                        <tr>
                            <td></td>
                            <td>
                                <p class="error" ng-show="uploader.crosswordName.$error.required && !(uploader.crosswordName.$error.sane || uploader.crosswordName.$error.unique)"><?php _e('You must give a name!', 'crw-text') ?></p>
                                <p class="error" ng-show="uploader.crosswordName.$error.minlength"><?php _e('The name is too short!', 'crw-text') ?></p>
                                <p class="error" ng-show="uploader.crosswordName.$error.unique"><?php _e('There is already another riddle with that name!', 'crw-text') ?></p>
                                <p class="confirm" ng-show="uploader.crosswordName.$valid && !saveError"><?php _e('That looks good!', 'crw-text') ?></p>
                            </td>
                        </tr>
                        <tr>
                            <td><label for ="description"><?php _e('Give a hint which words should be found:', 'crw-text') ?></label></td>
                            <td><textarea ng-model="crosswordData.description" name="description" crw-add-parsers="sane"></textarea></td>
                        </tr>
                        <tr>
                            <td><label for ="author"><?php _e('Author:', 'crw-text') ?></label></td>
                            <td><input type="text" ng-model="crosswordData.author" name="author" crw-add-parsers="sane"></td>
                        </tr>
<?php

    if (!$is_auth) {

?>
                        <tr>
                            <td><label for="username"><?php _e('Username:', 'crw-text') ?></label></td>
                            <td><input type="text" name="username" class="authenticate" required="" ng-model="username"></td>
                        </tr>
                        <tr>
                            <td><label for="password"><?php _e('Password:', 'crw-text') ?></label></td>
                            <td><input type="password" name="password" class="authenticate" required="" ng-model="password"></td>
                        </tr>
                        <tr>
                            <td></td><td>
                                <p class="error" ng-show="uploader.username.$error.required || uploader.password.$error.required"><?php _e('A username and password is required for saving!', 'crw-text') ?></p>
                                <p class="confirm" ng-show="uploader.username.$valid && uploader.password.$valid">&nbsp;</p>
                            </td>
                        </tr>
<?php

    }

?>
                    </table>
                    <p class="error" ng-show="uploader.$error.sane"><?php _e('Dont\'t try to be clever!', 'crw-text') ?></p>
                    <p class="actions">
                        <input type="submit" ng-disabled="!uploader.$valid" ng-click="upload(username, password)" value="<?php _e('Save', 'crw-text') ?>"></input>
                        <button ng-click="finish(false)"><?php _e('Abort', 'crw-text') ?></button>
                    </p>
                    <p class="error" ng-show="saveError">{{saveError}}</p>
                    <p class="error" ng-repeat="msg in saveDebug">{{msg}}</p>
                </form>
            </div>
<?php

} elseif ( 'solve' == $mode ) {

?>
            <div ng-switch-when="falseWord">
                <p><?php _e('The marked word is not part of the solution.', 'crw-text') ?></p>
                <p class="actions">
                    <button ng-click="finish(true)"><?php _e('Delete', 'crw-text') ?></button>
                </p>
            </div>
            <div ng-switch-when="solvedCompletely">
                <p><?php _e('Congratulation, you have solved the riddle!', 'crw-text') ?></p>
                <p class="actions">
                    <button ng-click="finish(true)"><?php _e('OK', 'crw-text') ?></button>
                </p>
            </div>
<?php

}

?>
            <div ng-switch-when="loadCrossword">
                <p><?php _e('Please be patient for the crossword being loaded.', 'crw-text') ?></p>
            </div>
        </div>
    </div>
