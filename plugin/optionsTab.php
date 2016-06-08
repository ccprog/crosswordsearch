    <div class="crw-editors" ng-cloak ng-controller="OptionsController" ng-init="prepare('<?php echo wp_create_nonce(NONCE_OPTIONS); ?>')">
        <h3><?php _e('Editing rights', 'crosswordsearch') ?></h3>
        <form name="capsEdit">
        <table class="widefat">
            <thead>
            <tr>
                <th rowspan="2"><?php _e('Roles', 'crosswordsearch') ?></th>
                <th colspan="3"><?php _e('Editing rights', 'crosswordsearch') ?></th>
            </tr>
            <tr>
                <th class="check-column"><?php _e('none', 'crosswordsearch') ?></th>
                <th class="check-column"><?php _e('restricted', 'crosswordsearch') ?></th>
                <th class="check-column"><?php _e('full', 'crosswordsearch') ?></th>
            </tr>
            </thead>
            <tbody>
            <tr ng-class-odd="'alternate'" ng-repeat="role in capabilities">
                <th crw-bind-trusted="role.local"></th>
                <td class="check-column"><input type="radio" name="{{role.name}}" ng-model="role.cap" value=""></input></td>
                <td class="check-column"><input type="radio" name="{{role.name}}" ng-model="role.cap" value="<?php echo CRW_CAP_UNCONFIRMED ?>"></input></td>
                <td class="check-column"><input type="radio" name="{{role.name}}" ng-model="role.cap" value="<?php echo CRW_CAP_CONFIRMED ?>"></input></td>
            </tr>
            </tbody>
        </table>
        <p><button class="text" title="<?php _e('Save the updated assignment of editing capabilities', 'crosswordsearch') ?>" ng-click="update('capabilities')" ng-disabled="(capsEdit.$pristine)"><?php _e('Save', 'crosswordsearch') ?></button>
        </form>
<?php

if ( $child_css ) {

?>
        <h3><?php _e('Dimensions of the table grid', 'crosswordsearch') ?></h3>
        <p><?php _e('Do not change this without reviewing your CSS!', 'crosswordsearch') ?></p>
        <img class="illustration" title="<?php _e('Illustration of grid dimensions', 'crosswordsearch') ?>" src="<?php echo CRW_PLUGIN_URL ?>images/dimensioning.png" />
        <form name="dimEdit">
        <table class="form-table">
            <tr>
                <th><label for="tableBorder">a) <?php _e('Outer border size', 'crosswordsearch') ?></label></th>
                <td><input class="small-text" type="text" name="tableBorder" ng-model="dimensions.tableBorder" crw-integer="dimension" min="0"></input> px</td>
            </tr>
            <tr>
                <th><label for="field">b) <?php _e('Field size without borders', 'crosswordsearch') ?></label></th>
                <td><input class="small-text" type="text" name="field" ng-model="dimensions.field" crw-integer="dimension" min="0"></input> px</td>
            </tr>
            <tr>
                <th><label for="fieldBorder">c) <?php _e('Border size between adjecent fields', 'crosswordsearch') ?></label></th>
                <td><input class="small-text" type="text" name="fieldBorder" ng-model="dimensions.fieldBorder" crw-integer="dimension" min="0"></input> px</td>
            </tr>
            <tr>
                <th><label for="handleOutside">d) <?php _e('Size of the drag handle outside the grid borders', 'crosswordsearch') ?></label></th>
                <td><input class="small-text" type="text" name="handleOutside" ng-model="dimensions.handleOutside" crw-integer="dimension" min="0"></input> px</td>
            </tr>
            <tr>
                <th><label for="handleInside">e) <?php _e('Size of the drag handle inside the grid borders', 'crosswordsearch') ?></label></th>
                <td><input class="small-text" type="text" name="handleInside" ng-model="dimensions.handleInside" crw-integer="dimension" min="0"></input> px</td>
            </tr>
        </table>
        <p class="error" ng-if="dimEdit.$invalid"><?php _e('Each dimension needs to be an integer of 0 or more', 'crosswordsearch') ?></p>
        <p><button class="text" title="<?php _e('Save the updated grid dimensions', 'crosswordsearch') ?>" ng-click="update('dimensions')" ng-disabled="(dimEdit.$pristine || dimEdit.$invalid)"><?php _e('Save', 'crosswordsearch') ?></button>
        </form>
<?php

} else {

?>
        <h3 class="disabled"><?php _e('Dimensions of the table grid', 'crosswordsearch') ?></h3>
        <p><?php _e('These settings are only available if you use a custom stylesheet', 'crosswordsearch') ?></p>
<?php

}

?>
        <h3><?php _e('Solution submissions', 'crosswordsearch') ?></h3>
        <form name="submissions">
        <p><?php _e('Install and activate a plugin to submit a solution to it.', 'crosswordsearch') ?></p>
        <p><?php _e('Log submissions with:', 'crosswordsearch') ?></p>
        <ul>
            <li ng-repeat="(slug, plugin) in subscribers"><label for="crw-{{slug}}"><input id="crw-{{slug}}" type="checkbox" ng-model="plugin.active" ng-disabled="!plugin.loaded" />
                <a ng-href="<?php echo admin_url('plugin-install.php') ?>?tab=plugin-information&plugin={{slug}}&TB_iframe=true&width=600&height=550" class="thickbox">{{plugin.name}}</a>
            </label></li>
        </ul>
        <p><button class="text" title="<?php _e('Save the submission targets', 'crosswordsearch') ?>" ng-click="update('subscribers')" ng-disabled="submissions.$pristine"><?php _e('Save', 'crosswordsearch') ?></button>
        </form>
    </div>
