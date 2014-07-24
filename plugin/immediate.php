    <div class="crw-immediate" ng-controller="ImmediateController" ng-cloak ng-show="immediate" ng-switch on="immediate">
        <div class="blocker"></div>
        <div class="message">
<?php

if ( 'build' == $mode ) {

?>
            <div ng-switch-when="save_crossword">
                <form name="uploader" crw-has-password>
                    <p ng-switch on="action">
                        <span ng-switch-when="insert"><?php _e('To save it, you must give the riddle a new name.', 'crw-text') ?></span>
                        <span ng-switch-when="update"><?php _e('You can change the additional informations that are saved about the riddle.', 'crw-text') ?></span>
                    </p>
                    <table>
                        <tr>
                            <td><label for ="crosswordName"><?php _e('Name:', 'crw-text') ?></label></td>
                            <td><input type="text" ng-model="crosswordData.name" name="crosswordName" required="" ng-minlength="4" ng-maxlength="255" crw-add-parsers="sane unique" crw-unique="namesInProject commands"></td>
                        </tr>
                        <tr>
                            <td></td>
                            <td>
                                <p class="error" ng-show="uploader.crosswordName.$error.required && !(uploader.crosswordName.$error.sane || uploader.crosswordName.$error.unique)"><?php _e('You must give a name!', 'crw-text') ?></p>
                                <p class="error" ng-show="uploader.crosswordName.$error.minlength"><?php _e('The name is too short!', 'crw-text') ?></p>
                                <p class="error" ng-show="uploader.crosswordName.$error.maxlength"><?php _e('You have exceeded the maximum length for a name!', 'crw-text') ?></p>
                                <p class="error" ng-show="uploader.crosswordName.$error.unique"><?php _e('There is already another riddle with that name!', 'crw-text') ?></p>
                                <p class="confirm" ng-show="uploader.crosswordName.$valid && !saveError"><?php _e('That looks good!', 'crw-text') ?></p>
                            </td>
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
                        <button ng-click="finish(false)"><?php echo _e('Abort', 'crw-text') ?></button>
                    </p>
                    <p class="error" ng-show="saveError">{{saveError}}</p>
                    <p class="error" ng-repeat="msg in saveDebug">{{msg}}</p>
                </form>
            </div>
<?php

}

?>
            <div ng-switch-when="dialogue" ng-switch="message.which">
<?php

if ( 'build' == $mode ) {

?>
                <p ng-switch-when="invalid_words" ng-pluralize count="message.count" when="{
                    'one': '<?php _e('The marked word no longer fits into the crossword area. For a successful resize you must delete this word.', 'crw-text') ?>',
                    'other': '<?php _e('The marked words no longer fit into the crossword area. For a successful resize you must delete these words.', 'crw-text') ?>'}"></p>
                <p ng-switch-when="invalid_directions" ng-pluralize count="message.count" when="{
                    'one': '<?php printf( __('The marked word goes into a direction that is excluded for difficulty level %1$s. For a successful level change you must delete this word.', 'crw-text'), '{{message.level + 1}}' ) ?>',
                    'other': '<?php printf( __('The marked words go into directions that are excluded for difficulty level %1$s. For a successful level change you must delete these words.', 'crw-text'), '{{message.level + 1}}' ) ?>'}"></p>
<?php

} elseif ( 'solve' == $mode ) {

?>
                <p ng-switch-when="false_word"><?php printf( __('The marked word %1$s is not part of the solution.', 'crw-text'), '{{message.word | joinWord}}' ) ?></p>
                <p ng-switch-when="solved_completely"><?php _e('Congratulation, you have solved the riddle!', 'crw-text') ?></p>
<?php

} elseif ( 'admin' == $mode ) {

?>
                <p ng-if="message.which!=='load_crossword'"><?php _e('Do you really want to do this?', 'crw-text') ?></p>
                <p ng-switch-when="remove_project"><?php printf( __('Delete project %1$s', 'crw-text'), '<strong>{{message.project}}</strong>' ) ?></p>
                <p ng-switch-when="delete_crossword"><?php printf( __('Delete crossword %1$s from project %2$s', 'crw-text'), '<strong>{{message.crossword}}</strong>', '<strong>{{message.project}}</strong>' ) ?></p>
                <p ng-switch-when="approve_crossword"><?php printf( __('Approve crossword %1$s for project %2$s', 'crw-text'), '<strong>{{message.crossword}}</strong>', '<strong>{{message.project}}</strong>' ) ?></p>
<?php

}

?>
                <p ng-switch-when="load_crossword"><?php _e('Please be patient for the crossword being loaded.', 'crw-text') ?></p>
                <p class="actions">
                    <button ng-if="message.buttons.ok" ng-click="finish(true)"><?php _e('OK', 'crw-text') ?></button>
                    <button ng-if="message.buttons.delete" ng-click="finish(true)"><?php _e('Delete', 'crw-text') ?></button>
                    <button ng-if="message.buttons.abort" ng-click="finish(false)"><?php echo _e('Abort', 'crw-text') ?></button>
                </p>
            </div>
        </div>
    </div>
