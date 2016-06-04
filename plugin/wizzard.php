<?php add_thickbox(); ?>
<div id="crw-shortcode-wizzard" style="display:none;">
  <div ng-controller="WizzardController" ng-init="prepare('<?php echo wp_create_nonce( NONCE_REVIEW ); ?>')">
    <table class="form-table">
        <tr>
            <th><label for="crw-option-mode"><?php _e('Mode', 'crosswordsearch') ?></label></th>
            <td><input type="radio" name="crw-option-mode" value="build" ng-model="mode"></input><?php _e('Design crosswords', 'crosswordsearch') ?>&emsp;
            <input type="radio" name="crw-option-mode" value="solve" ng-model="mode"></input><?php _e('Solve crosswords', 'crosswordsearch') ?></td>
        </tr>
        <tr>
            <th><label for="crw-option-project"><?php _e('Project', 'crosswordsearch') ?></label></th>
            <td><select name="crw-option-project" ng-model="project" ng-options="value.name for value in projects"></select></td>
        </tr>
        <tr>
            <th><label for="crw-option-name"><?php _e('Crossword', 'crosswordsearch') ?></label></th>
            <td><select name="crw-option-name" ng-model="crossword" ng-options="key as value for (key, value) in names"></select><br/>
            <span class="description" ng-if="mode=='solve'"><?php _e('Select one or let the user choose from all crosswords.', 'crosswordsearch') ?></span>
            <span class="description" ng-if="mode=='build'"><?php _e('Preselect the crossword initially displayed. All crosswords remain selectable.', 'crosswordsearch') ?></span></td>
        </tr>
        <tr ng-show="mode=='build'">
            <th><label for="crw-option-restricted"><?php _e('Save opportunities', 'crosswordsearch') ?></label></th>
            <td><input type="checkbox" name="crw-option-restricted" ng-model="restricted"></input><?php _e('Restricted', 'crosswordsearch') ?><br/>
            <span class="description"><?php _e('Uploads by restricted users must be reviewed.', 'crosswordsearch') ?></span></td>
        </tr>
        <tr ng-show="mode=='solve'">
            <th><label for="crw-option-timer"><?php _e('Display timer', 'crosswordsearch') ?></label></th>
            <td><select name="crw-option-timer" ng-model="timer">
                <option value="none"><?php _e('None', 'crosswordsearch') ?></option>
                <option value="forward"><?php _e('Open-ended', 'crosswordsearch') ?></option>
                <option value="backward"><?php _e('Countdown', 'crosswordsearch') ?></option>
            </select>&emsp;
            <label for="crw-option-timer-value"><?php _e('Allowed time', 'crosswordsearch') ?></label>
            <input type="text" name="crw-option-timer-value" size="3" ng-model="timerValue" ng-disabled="timer=='none'" /><br>
            <span class="description"><?php _e('Leave allowed time at 0 for Open-ended.', 'crosswordsearch') ?></span></td>
        </tr>
        <tr ng-show="mode=='solve'">
            <th><label for="crw-option-submitting"><?php _e('Submission', 'crosswordsearch') ?></label></th>
            <td><input type="checkbox" name="crw-option-submitting" ng-model="submitting" ng-disabled="timer=='none'"></input><?php _e('Let users submit their result', 'crosswordsearch') ?></td>
        </tr>
    </table>
    <p>
        <button class="button-primary" ng-click="insert()"><?php _e('Insert Shortcode', 'crosswordsearch') ?></button>
        <button class="button-secondary" ng-click="cancel()"><?php _e('Cancel', 'crosswordsearch') ?></button>
    </p>
  </div>
</div>
