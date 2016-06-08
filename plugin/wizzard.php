<?php add_thickbox(); ?>
<div id="crw-shortcode-wizzard" style="display:none;">
  <form name="crwForm" ng-controller="WizzardController" ng-init="prepare('<?php echo wp_create_nonce( NONCE_REVIEW ); ?>')">
    <table class="form-table">
      <thead>
        <tr ng-show="noData"><td class="description"><?php _e('Waiting for data...', 'crosswordsearch') ?></td></tr>
        <tr ng-hide="noData || projects.length"><td class="description"><?php _e('No projects found.', 'crosswordsearch') ?></td></tr>
      </thead>
      <tbody ng-hide="noData || !projects.length">
        <tr>
            <th><label for="optionMode"><?php _e('Mode', 'crosswordsearch') ?></label></th>
            <td><input type="radio" name="optionMode" value="build" ng-model="mode"></input><?php _e('Design crosswords', 'crosswordsearch') ?>&emsp;
            <input type="radio" name="optionMode" value="solve" ng-model="mode"></input><?php _e('Solve crosswords', 'crosswordsearch') ?><br>
            <span class="description" style="color:red;" ng-show="!crwForm.optionMode.$valid"><?php _e('Select something.', 'crosswordsearch') ?></span>&nbsp;</td>
        </tr>
        <tr>
            <th><label for="optionProject"><?php _e('Project', 'crosswordsearch') ?></label></th>
            <td><select name="optionProject" ng-model="project" ng-options="value.name for value in projects" required></select><br>
            <span class="description" style="color:red;" ng-show="!crwForm.optionProject.$valid"><?php _e('Select something.', 'crosswordsearch') ?></span>&nbsp;</td>
        </tr>
        <tr>
            <th><label for="optionName"><?php _e('Crossword', 'crosswordsearch') ?></label></th>
            <td><select name="optionName" ng-model="crossword" ng-options="obj.key as obj.label for obj in names" required></select><br/>
            <span class="description" ng-if="mode=='solve'"><?php _e('Select one or let the user choose from all crosswords.', 'crosswordsearch') ?></span>
            <span class="description" ng-if="mode=='build'"><?php _e('Preselect the crossword initially displayed. All crosswords remain selectable.', 'crosswordsearch') ?></span><br>
            <span class="description" style="color:red;" ng-show="!crwForm.optionName.$valid"><?php _e('Select something.', 'crosswordsearch') ?></span>&nbsp;</td>
        </tr>
        <tr ng-show="mode=='build'">
            <th><label for="optionRestricted"><?php _e('Save opportunities', 'crosswordsearch') ?></label></th>
            <td><input type="checkbox" name="optionRestricted" ng-model="restricted"></input><?php _e('Restricted', 'crosswordsearch') ?><br/>
            <span class="description"><?php _e('Uploads by restricted users must be reviewed.', 'crosswordsearch') ?></span></td>
        </tr>
        <tr ng-show="mode=='solve'">
            <th><label for="optionTimer"><?php _e('Display timer', 'crosswordsearch') ?></label></th>
            <td><select name="optionTimer" ng-model="timer" required>
                <option value="none"><?php _e('None', 'crosswordsearch') ?></option>
                <option value="forward"><?php _e('Open-ended', 'crosswordsearch') ?></option>
                <option value="backward"><?php _e('Countdown', 'crosswordsearch') ?></option>
            </select>&emsp;
            <label for="optionTimerValue"><?php _e('Allowed time', 'crosswordsearch') ?></label>
            <input type="text" name="optionTimerValue" size="2" ng-model="timerValue" ng-disabled="timer!='backward'" ng-required="timer!='none'" crw-integer="time" min="1" />&nbsp;s<br>
            <span class="description" style="color:red;" ng-show="!crwForm.optionTimerValue.$valid"><?php _e('Give time in seconds (a positive integer).', 'crosswordsearch') ?></span>&nbsp;</td>
        </tr>
        <tr ng-show="mode=='solve'">
            <th><label for="optionSubmitting"><?php _e('Submission', 'crosswordsearch') ?></label></th>
            <td><input type="checkbox" name="optionSubmitting" ng-model="submitting" ng-disabled="timer=='none'"></input><?php _e('Let users submit their result', 'crosswordsearch') ?></td>
        </tr>
      </tbody>
    </table>
    <p>
        <button class="button-primary" ng-click="insert()" ng-disabled="invalid()"><?php _e('Insert Shortcode', 'crosswordsearch') ?></button>
        <button class="button-secondary" ng-click="cancel()"><?php _e('Cancel', 'crosswordsearch') ?></button>
    </p>
  </form>
</div>
