    <div class="crw-editors" ng-controller="EditorController" ng-init="prepare('<?php echo wp_create_nonce(NONCE_EDITORS); ?>')">
        <form name="projectMod">
        <table class="crw-options">
            <tr>
                <th class="project"><?php _e('Projects', 'crw-text') ?></th>
                <th colspan="3"></th>
            </tr>
            <tr>
                <td class="project" rowspan="7">
                    <select size="10" ng-model="selectedProject" ng-options="project as project.name for project in admin.projects | orderBy:'name'" ng-disabled="!selectedProject || !projectMod.$pristine || !editorsPristine"></select>
                </td>
                <td><?php _e('Project Name', 'crw-text') ?></td>
                <td colspan="2" class="projectname aligned">
                    <input type="text" name="name" ng-model="currentProject.name" ng-minlength="4" ng-maxlength="190" required="" crw-add-parsers="sane unique" crw-unique="getProjectList(selectedProject.name)"></input>
                </td>
            </tr>
            <tr>
                <td></td>
                <td colspan="2" class="aligned error">
                    <span ng-show="projectMod.$error.required && !(projectMod.$error.sane || projectMod.$error.unique)"><?php _e('You must give a name!', 'crw-text') ?></span>
                    <span ng-show="projectMod.$error.minlength"><?php _e('The name is too short!', 'crw-text') ?></span>
                    <span ng-show="projectMod.$error.maxlength"><?php _e('You have exceeded the maximum length for a name!', 'crw-text') ?></span>
                    <span ng-show="projectMod.$error.unique"><?php _e('There is already another project with that name!', 'crw-text') ?></span>
                    <span ng-show="projectMod.$error.sane"><?php _e('Dont\'t try to be clever!', 'crw-text') ?></span>
                    <span ng-show="projectMod.$valid">&nbsp;</span>
                </td>
            </tr>
            <tr>
                <td><?php _e('Default difficulty level', 'crw-text') ?></td>
                <td class="between aligned">
                    <select class="spin" name="defaultL" ng-model="currentProject.default_level" ng-options="num+1 for num in levelList('default')"></select>
                </td>
            </tr>
            <tr>
                <td><?php _e('Maximum difficulty level', 'crw-text') ?></td>
                <td class="between aligned">
                    <select class="spin" name="maximumL" ng-model="currentProject.maximum_level" ng-options="num+1 for num in levelList('maximum')"></select>
                </td>
            </tr>
            <tr class="actions">
                <td colspan="3">
                    <button class="text" title="<?php _e('Save the project', 'crw-text') ?>" ng-click="saveProject()" ng-disabled="projectMod.$invalid || projectMod.$pristine"><?php _e('Save', 'crw-text') ?></button>
                    <button class="text" title="<?php _e('Abort saving the project', 'crw-text') ?>" ng-click="abortProject()" ng-disabled="projectMod.$pristine && selectedProject"><?php _e('Abort', 'crw-text') ?></button><br />
                </td>
            </tr>
            <tr class="separate">
                <th class="username"><?php _e('Full project editors', 'crw-text') ?></th>
                <th class="between"></th>
                <th class="username"><?php _e('Other users with full editor rights', 'crw-text') ?></th>
            </tr>
            <tr>
                <td class="username">
                    <select size="10" name="editors" ng-model="selectedEditor" ng-options="getUserName(id) for id in currentEditors | orderBy:getUserName"></select>
                </td>
                <td class="between aligned">
                    <button title="<?php _e('Add all users to the editors of the marked project', 'crw-text') ?>" ng-click="addAll()" ng-disabled="!selectedProject || !filtered_users.length">&lt;&lt;</button><br />
                    <button title="<?php _e('Add the marked user to the editors of the marked project', 'crw-text') ?>" ng-click="addOne()" ng-disabled="!selectedProject || !filtered_users.length">&lt;</button><br />
                    <button title="<?php _e('Remove the marked user from the editors of the marked project', 'crw-text') ?>" ng-click="removeOne()" ng-disabled="!selectedProject || !currentEditors.length">&gt;</button><br />
                    <button title="<?php _e('Remove all users from the editors of the marked project', 'crw-text') ?>" ng-click="removeAll()" ng-disabled="!selectedProject || !currentEditors.length">&gt;&gt;</button>
                </td>
                <td class="username">
                    <select size="10" name="noneditors" ng-model="selectedUser" ng-options="user.user_name for user in filtered_users | orderBy:'user_name'"></select>
                </td>
            </tr>
            <tr class="actions">
                <td class="project">
                    <button title="<?php _e('Add a new project', 'crw-text') ?>" ng-click="addProject()" ng-disabled="!selectedProject || !projectMod.$pristine || !editorsPristine">+</button>
                    <button title="<?php _e('Delete the selected project', 'crw-text') ?>" ng-click="deleteProject()" ng-disabled="!selectedProject || !projectMod.$pristine || !editorsPristine">−</button>
                </td>
                <td colspan="3">
                    <button class="text" title="<?php _e('Save the editor list for this project', 'crw-text') ?>" ng-click="saveEditors()" ng-disabled="!selectedProject || editorsPristine"><?php _e('Save', 'crw-text') ?></button>
                    <button class="text" title="<?php _e('Abort saving the editor list', 'crw-text') ?>" ng-click="abortEditors()" ng-disabled="!selectedProject || editorsPristine"><?php _e('Abort', 'crw-text') ?></button>
                </td>
            </tr>
        </table>
        </form>
    </div>
