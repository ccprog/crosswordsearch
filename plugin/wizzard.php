<?php add_thickbox(); ?>
<div id="crw-shortcode-wizzard" style="display:none;">
<table class="form-table">
    <tr>
        <th><label for="crw_option_mode"><?php _e('Mode', 'crosswordsearch') ?></label></th>
        <td><input type="radio" name="crw_option_mode" value="build"><?php _e('Design crosswords', 'crosswordsearch') ?></input>&emsp;
        <input type="radio" name="crw_option_mode" value="solve" checked="checked"><?php _e('Solve crosswords', 'crosswordsearch') ?></input></td>
    </tr>
    <tr>
        <th><label for="crw_option_project"><?php _e('Project', 'crosswordsearch') ?></label></th>
        <td><input type="text" name="crw_option_project" /></td>
    </tr>
    <tr>
        <th><label for="crw_option_name"><?php _e('Crossword', 'crosswordsearch') ?></label></th>
        <td><input type="text" name="crw_option_name" /><br/>
        <span class="description crw-for-solve"><?php _e('Leave empty for the user to choose from all crosswords.', 'crosswordsearch') ?></span>
        <span class="description crw-for-build"><?php _e('Preselect the crossword initially displayed. All crosswords remain selectable.', 'crosswordsearch') ?></span></td>
    </tr>
    <tr class="crw-for-build">
        <th><label for="crw_option_restricted"><?php _e('Save opportunities', 'crosswordsearch') ?></label></th>
        <td><input type="checkbox" name="crw_option_restricted"><?php _e('Restricted', 'crosswordsearch') ?></input><br/>
        <span class="description"><?php _e('Uploads by restricted users must be reviewed.', 'crosswordsearch') ?></span></td>
    </tr>
    <tr class="crw-for-solve">
        <th><label for="crw_option_timer"><?php _e('Display timer', 'crosswordsearch') ?></label></th>
        <td><select name="crw_option_timer">
            <option value="none" selected="selected"><?php _e('None', 'crosswordsearch') ?></option>
            <option value="forward"><?php _e('Open-ended', 'crosswordsearch') ?></option>
            <option value="backward"><?php _e('Countdown', 'crosswordsearch') ?></option>
        </select>&emsp;
        <label for="crw_option_timer_value"><?php _e('Allowed time', 'crosswordsearch') ?></label>
        <input type="text" name="crw_option_timer_value" size="3" /><br>
        <span class="description"><?php _e('Leave allowed time at 0 for Open-ended.', 'crosswordsearch') ?></span></td>
    </tr>
    <tr class="crw-for-solve">
        <th><label for="crw_option_submitting"><?php _e('Submission', 'crosswordsearch') ?></label></th>
        <td><input type="checkbox" name="crw_option_submitting"><?php _e('Let users submit their result', 'crosswordsearch') ?></input></td>
    </tr>
</table>
<p>
    <a id="crw_insert" class="button-primary"><?php _e('Insert Shortcode', 'crosswordsearch') ?></a>
    <a id="crw_cancel" class="button-secondary"><?php _e('Cancel', 'crosswordsearch') ?></a>
</p>
</div>
