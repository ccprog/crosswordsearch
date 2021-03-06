    <div class="crw-editors" ng-cloak ng-controller="ReviewController" ng-init="prepare('<?php echo wp_create_nonce( NONCE_CROSSWORD ) . "','" . wp_create_nonce( NONCE_REVIEW ); ?>')">
        <table class="crw-options">
            <tr>
                <th class="project"><?php _e('Projects', 'crosswordsearch') ?></th>
                <th><?php _e('Approved crosswords', 'crosswordsearch') ?></th>
                <th class="between"></th>
                <th><?php _e('Crosswords pending approval', 'crosswordsearch') ?></th>
            </tr>
            <tr>
                <td class="project">
                    <select size="10" ng-model="selectedProject" ng-options="project as project.name for project in projects | orderBy:'name'"></select>
                </td>
                <td class="crosswordname">
                    <select size="10" ng-model="selectedCrossword.confirmed" ng-options="name for name in selectedProject.confirmed | orderBy:'toString()'"  crw-option-click="confirmed"></select>
                </td>
                <td class="between aligned">
                    <button title="<?php _e('Approve the marked crossword to be displayed for everyone', 'crosswordsearch') ?>" ng-click="confirm()" ng-disabled="!selectedProject || !selectedProject.pending.length">&lt;</button><br />
                </td>
                <td class="crosswordname">
                    <select size="10" ng-model="selectedCrossword.pending" ng-options="name for name in selectedProject.pending | orderBy:'toString()'" crw-option-click="pending"></select>
                </td>
            </tr>
            <tr class="actions">
                <td></td>
                <td>
                    <button title="<?php _e('Delete the selected approved crossword', 'crosswordsearch') ?>" ng-click="deleteCrossword('confirmed')" ng-disabled="!selectedCrossword.confirmed">−</button>
                </td>
                <td class="between"></td>
                <td>
                    <button title="<?php _e('Delete the selected pending crossword', 'crosswordsearch') ?>" ng-click="deleteCrossword('pending')" ng-disabled="!selectedCrossword.pending">−</button>
                </td>
            </tr>
        </table>
        <h3><input type="checkbox" title="<?php _e('Show a preview of the selected crossword', 'crosswordsearch') ?>" ng-model="preview"><?php _e('Preview', 'crosswordsearch') ?></input></h3>
        <div ng-if="preview" class="crw-wrapper" ng-controller="CrosswordController" ng-init="commandState='preview'">
<?php

    $mode = 'preview';
    $is_single = true;
    $image_dir = CRW_PLUGIN_URL . 'images/';
    $crw_scid = 0;
    include 'app.php';

?>
        </div>
    </div>
