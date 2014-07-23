<?php // tab loading nonce and tab routes

$options_nonce = wp_create_nonce(NONCE_SETTINGS);
if ( current_user_can(CRW_CAP_CONFIRMED) ) {
    $ref_active = '/review/' . $options_nonce;
    $ref_review = '#' . $ref_active;
}
if ( current_user_can('edit_users') ) {
    $ref_capabilities = '#/capabilities/' . $options_nonce;
    $ref_active = '/editor/' . $options_nonce;
    $ref_editor = '#' . $ref_active;
}

?>
<div class="wrap" ng-controller="AdminController" ng-init="setActive('<?php echo $ref_active ?>')">
    <h2><?php _e('Crosswordsearch Administration', 'crw-text') ?></h2>
    <h3 class="nav-tab-wrapper" crw-help-follow>
<?php

if ( current_user_can('edit_users') ) {

?>
    <a class="nav-tab" ng-class="{'nav-tab-active':$routeParams.tab==='capabilities'}" href="<?php echo $ref_capabilities ?>"><?php _e('Options', 'crw-text') ?></a>
    <a class="nav-tab" ng-class="{'nav-tab-active':$routeParams.tab==='editor'}" href="<?php echo $ref_editor ?>"><?php _e('Assign projects and editors', 'crw-text') ?></a>
<?php

}

if ( current_user_can(CRW_CAP_CONFIRMED) ) {

?>
    <a class="nav-tab" ng-class="{'nav-tab-active':$routeParams.tab==='review'}" href="<?php echo $ref_review ?>"><?php _e('Review riddles in projects', 'crw-text') ?></a>
<?php

}

?>
    </h3>
    <div ng-view></div>
<?php

$mode = 'admin';
include 'immediate.php';

?>
</div>
