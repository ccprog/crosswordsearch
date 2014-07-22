    <div class="crw-editors" ng-controller="ReviewController" ng-init="prepare('<?php echo wp_create_nonce( NONCE_CROSSWORD ) . "','" . wp_create_nonce( NONCE_REVIEW ); ?>')">
        <table class="crw-options">
            <tr>
                <th class="project"><?php _e('Projects', 'crw-text') ?></th>
                <th><?php _e('Approved crosswords', 'crw-text') ?></th>
                <th class="between"></th>
                <th><?php _e('Crosswords pending approval', 'crw-text') ?></th>
            </tr>
            <tr>
                <td class="project">
                    <select size="10" ng-model="selectedProject" ng-options="project as project.name for project in projects | orderBy:'name'"></select>
                </td>
                <td class="crosswordname">
                    <select size="10" ng-model="selectedCrossword.confirmed" ng-options="name for name in selectedProject.confirmed | orderBy:'toString()'"  crw-option-click="confirmed"></select>
                </td>
                <td class="between aligned">
                    <button title="<?php _e('Approve the marked crossword to be displayed for everyone', 'crw-text') ?>" ng-click="confirm()" ng-disabled="!selectedProject || !selectedProject.pending.length">&lt;</button><br />
                </td>
                <td class="crosswordname">
                    <select size="10" ng-model="selectedCrossword.pending" ng-options="name for name in selectedProject.pending | orderBy:'toString()'" crw-option-click="pending"></select>
                </td>
            </tr>
            <tr class="actions">
                <td></td>
                <td>
                    <button title="<?php _e('Delete the selected approved crossword', 'crw-text') ?>" ng-click="deleteCrossword('confirmed')" ng-disabled="!selectedCrossword.confirmed">−</button>
                    <p class="error" ng-if="deleteError">{{deleteError.error}}</p>
                    <p class="error" ng-repeat="msg in deleteError.debug">{{msg}}</p>
                </td>
                <td class="between"></td>
                <td>
                    <button title="<?php _e('Delete the selected pending crossword', 'crw-text') ?>" ng-click="deleteCrossword('pending')" ng-disabled="!selectedCrossword.pending">−</button>
                    <p class="error" ng-if="deleteError">{{deleteError.error}}</p>
                    <p class="error" ng-repeat="msg in deleteError.debug">{{msg}}</p>
                </td>
            </tr>
        </table>
        <p class="error" ng-if="reviewError">{{loadError.error}}</p>
        <p class="error" ng-repeat="msg in reviewError.debug">{{msg}}</p>
        <h3><input type="checkbox" title="<?php _e('Show a preview of the selected crossword', 'crw-text') ?>" ng-model="preview"><?php _e('Preview', 'crw-text') ?></input></h3>
        <div ng-if="preview" class="crw-wrapper" ng-controller="CrosswordController" ng-init="commandState='preview'">
<?php

    $mode = 'preview';
    $is_single = true;
    include 'app.php';

?>
        </div>
    </div>
