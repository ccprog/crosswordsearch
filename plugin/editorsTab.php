    <div class="crw-editors" ng-cloak ng-controller="EditorController" ng-init="prepare('<?php echo wp_create_nonce(NONCE_EDITORS); ?>')">
        <form name="projectMod">
        <table class="crw-options">
            <tr>
                <th class="project"><?php _e('Projects', 'crosswordsearch') ?></th>
                <th colspan="3"></th>
            </tr>
            <tr>
                <td class="project" rowspan="7">
                    <select size="10" ng-model="selectedProject" ng-options="project as project.name for project in admin.projects | orderBy:'name'" ng-disabled="!selectedProject || !projectMod.$pristine || !editorsPristine"></select>
                </td>
                <td><?php _e('Project Name', 'crosswordsearch') ?></td>
                <td colspan="2" class="projectname aligned">
                    <input type="text" name="name" ng-model="currentProject.name" ng-minlength="4" ng-maxlength="190" required="" crw-add-parsers="sane unique" crw-unique="getProjectList(selectedProject.name)"></input>
                </td>
            </tr>
            <tr>
                <td></td>
                <td colspan="2" class="aligned error">
                    <span ng-show="projectMod.$error.required && !(projectMod.$error.sane || projectMod.$error.unique)"><?php _e('You must give a name!', 'crosswordsearch') ?></span>
                    <span ng-show="projectMod.$error.minlength"><?php _e('The name is too short!', 'crosswordsearch') ?></span>
                    <span ng-show="projectMod.$error.maxlength"><?php _e('You have exceeded the maximum length for a name!', 'crosswordsearch') ?></span>
                    <span ng-show="projectMod.$error.unique"><?php _e('There is already another project with that name!', 'crosswordsearch') ?></span>
                    <span ng-show="projectMod.$error.sane"><?php _e('Dont\'t try to be clever!', 'crosswordsearch') ?></span>
                    <span ng-show="projectMod.$valid">&nbsp;</span>
                </td>
            </tr>
            <tr>
                <td><?php _e('Default difficulty level', 'crosswordsearch') ?></td>
                <td class="between aligned">
                    <select class="spin" name="defaultL" ng-model="currentProject.default_level" ng-options="num+1 for num in levelList('default')"></select>
                </td>
            </tr>
            <tr>
                <td><?php _e('Maximum difficulty level', 'crosswordsearch') ?></td>
                <td class="between aligned">
                    <select class="spin" name="maximumL" ng-model="currentProject.maximum_level" ng-options="num+1 for num in levelList('maximum')"></select>
                </td>
            </tr>
            <tr class="actions">
                <td colspan="3">
                    <button class="text" title="<?php _e('Save the project', 'crosswordsearch') ?>" ng-click="saveProject()" ng-disabled="projectMod.$invalid || projectMod.$pristine"><?php _e('Save', 'crosswordsearch') ?></button>
                    <button class="text" title="<?php _e('Abort saving the project', 'crosswordsearch') ?>" ng-click="abortProject()" ng-disabled="projectMod.$pristine && selectedProject"><?php _e('Abort', 'crosswordsearch') ?></button><br />
                </td>
            </tr>
            <tr class="separate">
                <th class="username"><?php _e('Full project editors', 'crosswordsearch') ?></th>
                <th class="between"></th>
                <th class="username"><?php _e('Other users with full editor rights', 'crosswordsearch') ?></th>
            </tr>
            <tr>
                <td class="username">
                    <select size="10" name="editors" ng-model="selectedEditor" ng-options="getUserName(id) for id in currentEditors | orderBy:getUserName"></select>
                </td>
                <td class="between aligned">
                    <button title="<?php _e('Add all users to the editors of the marked project', 'crosswordsearch') ?>" ng-click="addAll()" ng-disabled="!selectedProject || !filtered_users.length">&lt;&lt;</button><br />
                    <button title="<?php _e('Add the marked user to the editors of the marked project', 'crosswordsearch') ?>" ng-click="addOne()" ng-disabled="!selectedProject || !filtered_users.length">&lt;</button><br />
                    <button title="<?php _e('Remove the marked user from the editors of the marked project', 'crosswordsearch') ?>" ng-click="removeOne()" ng-disabled="!selectedProject || !currentEditors.length">&gt;</button><br />
                    <button title="<?php _e('Remove all users from the editors of the marked project', 'crosswordsearch') ?>" ng-click="removeAll()" ng-disabled="!selectedProject || !currentEditors.length">&gt;&gt;</button>
                </td>
                <td class="username">
                    <select size="10" name="noneditors" ng-model="selectedUser" ng-options="user.user_name for user in filtered_users | orderBy:'user_name'"></select>
                </td>
            </tr>
            <tr class="actions">
                <td class="project">
                    <button title="<?php _e('Add a new project', 'crosswordsearch') ?>" ng-click="addProject()" ng-disabled="!selectedProject || !projectMod.$pristine || !editorsPristine">+</button>
                    <button title="<?php _e('Delete the selected project', 'crosswordsearch') ?>" ng-click="deleteProject()" ng-disabled="!selectedProject || !projectMod.$pristine || !editorsPristine">−</button>
                </td>
                <td colspan="3">
                    <button class="text" title="<?php _e('Save the editor list for this project', 'crosswordsearch') ?>" ng-click="saveEditors()" ng-disabled="!selectedProject || editorsPristine"><?php _e('Save', 'crosswordsearch') ?></button>
                    <button class="text" title="<?php _e('Abort saving the editor list', 'crosswordsearch') ?>" ng-click="abortEditors()" ng-disabled="!selectedProject || editorsPristine"><?php _e('Abort', 'crosswordsearch') ?></button>
                </td>
            </tr>
        </table>
        </form>
    </div>
