    <div class="crw-editors" ng-controller="OptionsController" ng-init="prepare('<?php echo wp_create_nonce(NONCE_OPTIONS); ?>')">
        <h3><?php _e('Editing rights', 'crw-text') ?></h3>
        <form name="capsEdit">
        <table class="widefat">
            <thead>
            <tr>
                <th rowspan="2"><?php _e('Roles', 'crw-text') ?></th>
                <th colspan="3"><?php _e('Editing rights', 'crw-text') ?></th>
            </tr>
            <tr>
                <th class="check-column"><?php _e('none', 'crw-text') ?></th>
                <th class="check-column"><?php _e('restricted', 'crw-text') ?></th>
                <th class="check-column"><?php _e('full', 'crw-text') ?></th>
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
        <p><button class="text" title="<?php _e('Save the updated assignment of editing capabilities', 'crw-text') ?>" ng-click="update('capabilities')" ng-disabled="(capsEdit.$pristine)"><?php _e('Save', 'crw-text') ?></button>
        </form>
<?php

if ( $child_css ) {

?>
        <h3><?php _e('Dimensions of the table grid', 'crw-text') ?></h3>
        <p><?php _e('Do not change this without reviewing your CSS!', 'crw-text') ?></p>
        <img class="illustration" title="<?php _e('Illustration of grid dimensions', 'crw-text') ?>" src="<?php echo CRW_PLUGIN_URL ?>images/dimensioning.png" />
        <form name="dimEdit">
        <table class="form-table">
            <tr>
                <th><label for="tableBorder">a) <?php _e('Outer border size', 'crw-text') ?></label></th>
                <td><input class="small-text" type="text" name="tableBorder" ng-model="dimensions.tableBorder" crw-dimension></input> px</td>
            </tr>
            <tr>
                <th><label for="field">b) <?php _e('Field size without borders', 'crw-text') ?></label></th>
                <td><input class="small-text" type="text" name="field" ng-model="dimensions.field" crw-dimension></input> px</td>
            </tr>
            <tr>
                <th><label for="fieldBorder">c) <?php _e('Border size between adjecent fields', 'crw-text') ?></label></th>
                <td><input class="small-text" type="text" name="fieldBorder" ng-model="dimensions.fieldBorder" crw-dimension></input> px</td>
            </tr>
            <tr>
                <th><label for="handleOutside">d) <?php _e('Size of the drag handle outside the grid borders', 'crw-text') ?></label></th>
                <td><input class="small-text" type="text" name="handleOutside" ng-model="dimensions.handleOutside" crw-dimension></input> px</td>
            </tr>
            <tr>
                <th><label for="handleInside">e) <?php _e('Size of the drag handle inside the grid borders', 'crw-text') ?></label></th>
                <td><input class="small-text" type="text" name="handleInside" ng-model="dimensions.handleInside" crw-dimension></input> px</td>
            </tr>
        </table>
        <p class="error" ng-if="dimEdit.$invalid"><?php _e('Each dimension needs to be an integer of 0 or more', 'crw-text') ?></p>
        <p><button class="text" title="<?php _e('Save the updated grid dimensions', 'crw-text') ?>" ng-click="update('dimensions')" ng-disabled="(dimEdit.$pristine || dimEdit.$invalid)"><?php _e('Save', 'crw-text') ?></button>
        </form>
<?php

} else {

?>
        <h3 class="disabled"><?php _e('Dimensions of the table grid', 'crw-text') ?></h3>
        <p><?php _e('These settings are only available if you use a custom stylesheet', 'crw-text') ?></p>
<?php

}

?>
    </div>
