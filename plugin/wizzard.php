<?php add_thickbox(); ?>
<div id="crw-shortcode-wizzard" style="display:none;" data-crw-nonce="<?php echo wp_create_nonce( NONCE_REVIEW ); ?>">
<table class="form-table">
    <tr>
        <th><label for="crw-option-mode"><?php _e('Mode', 'crosswordsearch') ?></label></th>
        <td><input type="radio" name="crw-option-mode" value="build"><?php _e('Design crosswords', 'crosswordsearch') ?></input>&emsp;
        <input type="radio" name="crw-option-mode" value="solve" checked="checked"><?php _e('Solve crosswords', 'crosswordsearch') ?></input></td>
    </tr>
    <tr>
        <th><label for="crw-option-project"><?php _e('Project', 'crosswordsearch') ?></label></th>
        <td><select name="crw-option-project"></select></td>
    </tr>
    <tr>
        <th><label for="crw-option-name"><?php _e('Crossword', 'crosswordsearch') ?></label></th>
        <td><select name="crw-option-name">
            <option value="no" class="crw-basic crw-for-solve" selected="selected" style="font-style:italic;">&lt;<?php _e('Choose from all', 'crosswordsearch') ?>&gt;</option>
            <option value="new" class="crw-basic crw-for-build" style="font-style:italic;">&lt;<?php _e('Empty crossword', 'crosswordsearch') ?>&gt;</option>
            <option value="dft" class="crw-basic crw-for-build" style="font-style:italic;">&lt;<?php _e('First crossword', 'crosswordsearch') ?>&gt;</option>
        </select><br/>
        <span class="description crw-for-solve"><?php _e('Select one or let the user to choose from all crosswords.', 'crosswordsearch') ?></span>
        <span class="description crw-for-build"><?php _e('Preselect the crossword initially displayed. All crosswords remain selectable.', 'crosswordsearch') ?></span></td>
    </tr>
    <tr class="crw-for-build">
        <th><label for="crw-option-restricted"><?php _e('Save opportunities', 'crosswordsearch') ?></label></th>
        <td><input type="checkbox" name="crw-option-restricted"><?php _e('Restricted', 'crosswordsearch') ?></input><br/>
        <span class="description"><?php _e('Uploads by restricted users must be reviewed.', 'crosswordsearch') ?></span></td>
    </tr>
    <tr class="crw-for-solve">
        <th><label for="crw-option-timer"><?php _e('Display timer', 'crosswordsearch') ?></label></th>
        <td><select name="crw-option-timer">
            <option value="none" selected="selected"><?php _e('None', 'crosswordsearch') ?></option>
            <option value="forward"><?php _e('Open-ended', 'crosswordsearch') ?></option>
            <option value="backward"><?php _e('Countdown', 'crosswordsearch') ?></option>
        </select>&emsp;
        <label for="crw-option-timer-value"><?php _e('Allowed time', 'crosswordsearch') ?></label>
        <input type="text" name="crw-option-timer-value" size="3" /><br>
        <span class="description"><?php _e('Leave allowed time at 0 for Open-ended.', 'crosswordsearch') ?></span></td>
    </tr>
    <tr class="crw-for-solve">
        <th><label for="crw-option-submitting"><?php _e('Submission', 'crosswordsearch') ?></label></th>
        <td><input type="checkbox" name="crw-option-submitting"><?php _e('Let users submit their result', 'crosswordsearch') ?></input></td>
    </tr>
</table>
<p>
    <a id="crw_insert" class="button-primary"><?php _e('Insert Shortcode', 'crosswordsearch') ?></a>
    <a id="crw_cancel" class="button-secondary"><?php _e('Cancel', 'crosswordsearch') ?></a>
</p>
</div>
