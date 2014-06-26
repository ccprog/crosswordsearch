<div class="wrap" ng-switch="activeTab" ng-init="activeTab=<?php echo (current_user_can('edit_users') ? "'admin'" : "'review'") ?>">
    <h2><?php _e('Crosswordsearch Administration', 'crw-text') ?></h2>
    <h3 class="nav-tab-wrapper">
<?php

if ( current_user_can('edit_users') ) {
?>
    <a class="nav-tab" ng-class="{'nav-tab-active':activeTab==='capabilities'}" href="#" ng-click="activeTab='capabilities'"><?php _e('Options', 'crw-text') ?></a>
    <a class="nav-tab" ng-class="{'nav-tab-active':activeTab==='admin'}" href="#" ng-click="activeTab='admin'"><?php _e('Assign projects and editors', 'crw-text') ?></a>
<?php

}

if ( current_user_can(CRW_CAP_CONFIRMED) ) {

?>
        <a class="nav-tab" ng-class="{'nav-tab-active':activeTab==='review'}" href="#" ng-click="activeTab='review'"><?php _e('Review riddles in projects', 'crw-text') ?></a>
<?php

}

?>
    </h3>
<?php

if ( current_user_can('edit_users') ) {

?>
    <div class="crw-editors" ng-switch-when="capabilities" ng-controller="OptionsController" ng-init="prepare('<?php echo wp_create_nonce(NONCE_CAP); ?>')">
        <p><?php _e('Riddles saved by restricted editors need the approval of full editors before they can appear for other users.', 'crw-text') ?></p>
        <form name="capsEdit">
        <table class="widefat">
            <thead>
            <tr>
                <th rowspan="2"><?php _e('Roles') ?></th>
                <th colspan="3"><?php _e('Editing rights', 'crw-text') ?></th>
            </tr>
            <tr>
                <th class="radiocol"><?php _e('none', 'crw-text') ?></th>
                <th class="radiocol"><?php _e('restricted', 'crw-text') ?></th>
                <th class="radiocol"><?php _e('full', 'crw-text') ?></th>
            </tr>
            </thead>
            <tbody>
            <tr ng-repeat="role in capabilities">
                <td>{{role.local}}</td>
                <td class="radiocol"><input type="radio" name="{{role.name}}" ng-model="role.cap" value=""></input></td>
                <td class="radiocol"><input type="radio" name="{{role.name}}" ng-model="role.cap" value="<?php echo CRW_CAP_UNCONFIRMED ?>"></input></td>
                <td class="radiocol"><input type="radio" name="{{role.name}}" ng-model="role.cap" value="<?php echo CRW_CAP_CONFIRMED ?>"></input></td>
            </tr>
            </tbody>
        </table>
        <p><button class="text" title="<?php _e('Save the updated assignment of editing capabilities', 'crw-text') ?>" ng-click="updateCaps()" ng-disabled="(capsEdit.$pristine)"><?php _e('Save', 'crw-text') ?></button>
        <p class="error" ng-if="capError">{{capError.error}}</p>
        <p class="error" ng-repeat="msg in capError.debug">{{msg}}</p>
        </form>
    </div>
    <div class="crw-editors" ng-switch-when="admin" ng-controller="EditorController" ng-init="prepare('<?php echo wp_create_nonce(NONCE_ADMIN); ?>')">
        <table class="crw-options">
            <tr>
                <th><?php _e('Projects', 'crw-text') ?></th>
                <th class="between"></th>
                <th><?php _e('Full project editors', 'crw-text') ?></th>
                <th class="between"></th>
                <th><?php _e('Other registered users', 'crw-text') ?></th>
            </tr>
            <tr>
                <td class="project">
                    <select size="10" ng-model="selectedProject" ng-options="project.name for project in admin.projects | orderBy:'name'" ng-disabled="!selectedProject.pristine"></select>
                </td>
                <td class="between"><?php _e('can be used by', 'crw-text') ?></td>
                <td class="username">
                    <select size="10" ng-model="selectedEditor" ng-options="getUserName(id) for id in current_users | orderBy:getUserName"></select>
                </td>
                <td class="between">
                    <button title="<?php _e('Add all users to the editors of the marked project', 'crw-text') ?>" ng-click="addAll()" ng-disabled="!selectedProject || addingProject || !filtered_users.length">&lt;&lt;</button><br />
                    <button title="<?php _e('Add the marked user to the editors of the marked project', 'crw-text') ?>" ng-click="addOne()" ng-disabled="!selectedProject || addingProject || !filtered_users.length">&lt;</button><br />
                    <button title="<?php _e('Remove the marked user from the editors of the marked project', 'crw-text') ?>" ng-click="removeOne()" ng-disabled="!selectedProject || addingProject || !current_users.length">&gt;</button><br />
                    <button title="<?php _e('Remove all users from the editors of the marked project', 'crw-text') ?>" ng-click="removeAll()" ng-disabled="!selectedProject || addingProject || !current_users.length">&gt;&gt;</button>
                </td>
                <td class="username">
                    <select size="10" ng-model="selectedUser" ng-options="user.user_name for user in filtered_users | orderBy:'user_name'"></select>
                </td>
            </tr>
            <tr class="actions">
                <td>
                    <form name="projectModify">
                    <button title="<?php _e('Delete the selected project', 'crw-text') ?>" ng-click="deleteProject()" ng-disabled="addingProject || !selectedProject || !selectedProject.pristine">−</button>
                    <button title="<?php _e('Add a new project', 'crw-text') ?>" ng-click="addingProject=true" ng-disabled="addingProject || (selectedProject && !selectedProject.pristine)">+</button><br />
                    <input class="project" type="text" name="name" ng-show="addingProject" ng-model="newProject" ng-minlength="4" ng-maxlength="255" required="" crw-add-parsers="sane unique" crw-unique="getProjectList()"></input>
                    <p class="error" ng-show="addingProject">
                        <span ng-show="projectModify.$error.required && !(projectModify.$error.sane || projectModify.$error.unique)"><?php _e('You must give a name!', 'crw-text') ?></span>
                        <span ng-show="projectModify.$error.minlength"><?php _e('The name is too short!', 'crw-text') ?></span>
                        <span ng-show="projectModify.$error.maxlength"><?php _e('You have exceeded the maximum length for a name!', 'crw-text') ?></span>
                        <span ng-show="projectModify.$error.unique"><?php _e('There is already another project with that name!', 'crw-text') ?></span>
                        <span ng-show="projectModify.$error.sane"><?php _e('Dont\'t try to be clever!', 'crw-text') ?></span>
                        <span ng-show="projectModify.$valid">&nbsp;</span>
                    </p>
                    <button class="text" title="<?php _e('Save the new project name', 'crw-text') ?>" ng-click="saveProject()" ng-show="addingProject" ng-disabled="!projectModify.$valid"><?php _e('Save', 'crw-text') ?></button>
                    <button class="text" title="<?php _e('Abort saving the project name', 'crw-text') ?>" ng-click="abortProject()" ng-show="addingProject"><?php _e('Abort', 'crw-text') ?></button><br />
                    <p class="error" ng-if="projectSaveError">{{projectSaveError.error}}</p>
                    <p class="error" ng-repeat="msg in projectSaveError.debug">{{msg}}</p>
                    </form>
                </td>
                <td class="between"></td>
                <td>
                    <button class="text" title="<?php _e('Save the editor list for this project', 'crw-text') ?>" ng-click="saveEditors()" ng-disabled="(selectedProject && selectedProject.pristine) || addingProject"><?php _e('Save', 'crw-text') ?></button>
                    <button class="text" title="<?php _e('Abort saving the editor list', 'crw-text') ?>" ng-click="abortEditors()" ng-disabled="(selectedProject && selectedProject.pristine) || addingProject"><?php _e('Abort', 'crw-text') ?></button>
                    <p class="error" ng-if="editorsSaveError">{{editorsSaveError.error}}</p>
                    <p class="error" ng-repeat="msg in editorsSaveError.debug">{{msg}}</p>
                </td>
            </tr>
        </table>
        <p class="error" ng-if="loadError">{{loadError.error}}</p>
        <p class="error" ng-repeat="msg in loadError.debug">{{msg}}</p>
    </div>
<?php

}

if ( current_user_can(CRW_CAP_CONFIRMED) ) {

?>
    <div class="crw-editors" ng-switch-when="review" ng-controller="ReviewController" ng-init="prepare('<?php echo wp_create_nonce( NONCE_CROSSWORD ) . "','" . wp_create_nonce( NONCE_REVIEW ); ?>')">
        <table class="crw-options">
            <tr>
                <th><?php _e('Projects', 'crw-text') ?></th>
                <th class="between"></th>
                <th><?php _e('Crosswords', 'crw-text') ?></th>
            </tr>
            <tr>
                <td class="project">
                    <select size="10" ng-model="selectedProject" ng-options="project as project.name for project in projects | orderBy:'name'"></select>
                </td>
                <td class="between"></td>
                <td class="crosswordname">
                    <select size="10" ng-model="selectedCrossword" ng-options="name for name in selectedProject.crosswords | orderBy:'toString()'"></select>
                </td>
            </tr>
            <tr class="actions">
                <td></td>
                <td class="between"></td>
                <td>
                    <input type="checkbox" title="<?php _e('Show a preview of the selected crossword', 'crw-text') ?>" ng-model="preview"><?php _e('Preview', 'crw-text') ?></input>
                    <button title="<?php _e('Delete the selected crossword', 'crw-text') ?>" ng-click="deleteCrossword()" ng-disabled="!selectedCrossword">−</button>
                    <p class="error" ng-if="deleteError">{{deleteError.error}}</p>
                    <p class="error" ng-repeat="msg in deleteError.debug">{{msg}}</p>
                </td>
            </tr>
        </table>
        <p class="error" ng-if="loadError">{{loadError.error}}</p>
        <p class="error" ng-repeat="msg in loadError.debug">{{msg}}</p>
        <div ng-if="preview" class="crw-wrapper" ng-controller="CrosswordController">
<?php

    $mode = 'preview';
    $is_single = true;
    include 'app.php';

?>
        </div>
    </div>
<?php

}

?>
</div>
