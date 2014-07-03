<?php
/*
Plugin Name: crosswordsearch
Plugin URI: https://github.com/ccprog/crosswordseach
Version: 0.1.1
Author: Claus Colloseus
Author URI: http://browser-unplugged.net
Text Domain: crw-text
Description: Adds a wordsearch-style crossword in place of a shortcode. Crosswords can be in building-mode for developing new riddles, which then can be stored for later usage, or they can be in solving-mode, where existing riddles are loaded into the page for readers to solve.

Copyright Claus Colloseus 2014 for RadiJojo.de

This program is free software: Redistribution and use, with or
without modification, are permitted provided that the following
conditions are met:
 * If you redistribute this code, either as source code or in
   minimized, compacted or obfuscated form, you must retain the
   above copyright notice, this list of conditions and the
   following disclaimer.
 * If you modify this code, distributions must not misrepresent
   the origin of those parts of the code that remain unchanged,
   and you must retain the above copyright notice and the following
   disclaimer.
 * If you modify this code, distributions must include a license
   which is compatible to the terms and conditions of this license.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
*/

/* plugin installation */
define('CRW_DB_VERSION', '0.3');
define('CRW_PROJECTS_OPTION', 'crw_projects');
define('CRW_ROLES_OPTION', 'crw_roles_caps');
define('CRW_NONCE_NAME', '_crwnonce');
define('NONCE_CROSSWORD', 'crw_crossword_');
define('NONCE_EDIT', 'crw_edit_');
define('NONCE_PUSH', 'crw_push_');
define('NONCE_ADMIN', 'crw_admin_');
define('NONCE_CAP', 'crw_cap_');
define('NONCE_REVIEW', 'crw_review_');
define('CRW_CAP_CONFIRMED', 'edit_crossword');
define('CRW_CAP_UNCONFIRMED', 'push_crossword');

define('CRW_PLUGIN_URL', plugins_url( 'crosswordsearch/' ));
define('CRW_PLUGIN_FILE', WP_PLUGIN_DIR . '/crosswordsearch/' . basename(__FILE__));
define('CRW_PLUGIN_DIR', plugin_dir_path( __FILE__ ));

global $wpdb, $data_table_name, $editors_table_name;
$wpdb->hide_errors();

$data_table_name = $wpdb->prefix . "crw_crosswords";
$editors_table_name = $wpdb->prefix . "crw_editors";

function crw_change_project_list ( $project, $action ) {
    $project_list = get_option(CRW_PROJECTS_OPTION);

    if ( 'add' == $action ) {
        if ( mb_strlen($project, 'UTF-8') > 255 ) {
            crw_send_error( __('You have exceeded the maximum length for a name!', 'crw-text'), $project );
        } elseif ( in_array($project, $project_list) ) {
            return false;
        }
        array_push($project_list, $project);
    } elseif ( 'remove' == $action ) {
        $key = array_search($project, $project_list);
        if ( false === $key ) {
            return false;
        }
        unset($project_list[$key]);
    }

    return update_option(CRW_PROJECTS_OPTION, $project_list);
}

function crw_install () {
    global $wp_roles, $wpdb, $charset_collate, $data_table_name, $editors_table_name;
    require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );

    add_option( CRW_PROJECTS_OPTION, (array)NULL );
    update_option( "crw_db_version", CRW_DB_VERSION );
    $roles_caps = array();
    foreach ( $wp_roles->role_objects as $name => $role ) {
        if ( $role->has_cap('moderate_comments') ) {
            $roles_caps[$name] = CRW_CAP_CONFIRMED;
        } elseif ( 'subscriber' === $name ) {
            $roles_caps[$name] = CRW_CAP_UNCONFIRMED;
        }
    };
    add_option( CRW_ROLES_OPTION, $roles_caps );
    foreach ( get_option(CRW_ROLES_OPTION) as $role => $cap ) {
        get_role( $role )->add_cap( $cap );
    }

    dbDelta( "
CREATE TABLE IF NOT EXISTS $data_table_name (
  project varchar(255) NOT NULL,
  name varchar(255) NOT NULL,
  crossword text NOT NULL,
  first_user bigint(20) unsigned NOT NULL,
  last_user bigint(20) unsigned NOT NULL,
  pending boolean NOT NULL DEFAULT FALSE,
  PRIMARY KEY  (project, name)
) $charset_collate;\n"
    );

    dbDelta( "
CREATE TABLE IF NOT EXISTS $editors_table_name (
  project varchar(255) NOT NULL,
  user_id bigint(20) unsigned NOT NULL,
  PRIMARY KEY (project, user_id)
) $charset_collate;\n"
    );
}
register_activation_hook( CRW_PLUGIN_FILE, 'crw_install' );

function crw_deactivate () {
    global $wp_roles;

    foreach ( $wp_roles->role_objects as $name => $role ) {
        $role->remove_cap( CRW_CAP_CONFIRMED );
        $role->remove_cap( CRW_CAP_UNCONFIRMED );
    }
}
register_deactivation_hook( CRW_PLUGIN_FILE, 'crw_deactivate' );

// test data
function crw_install_data () {
    global $wpdb, $data_table_name;

    if (!WP_DEBUG) {
        return;
    }

    crw_change_project_list('test', 'add');

    $data_files = glob(CRW_PLUGIN_DIR . '../tests/*.json');

    foreach( $data_files as $file) {
        $json = file_get_contents( realpath($file) );
        $data = json_decode( $json );

        $wpdb->replace($data_table_name, array(
            'project' => 'test',
            'name' => $data->name,
            'crossword' => $json,
        ));
    }
}
register_activation_hook( CRW_PLUGIN_FILE, 'crw_install_data' );

/* plugin load routines */

$crw_has_crossword = false;

function crw_load_text () {
    load_plugin_textdomain( 'crw-text', false, 'crosswordsearch/languages/' );
}
add_action('plugins_loaded', 'crw_load_text');

function crw_add_angular_attribute ($attributes) {
    return $attributes . ' xmlns:ng="http://angularjs.org" id="ng-app" ng-app="crwApp"';
}

function add_crw_scripts ( $hook ) {
    require_once 'l10n.php';
    global $crw_has_crossword;

    $locale_data = crw_get_locale_data();

	if ( $crw_has_crossword || 'settings_page_crw_options' == $hook ) {
        wp_enqueue_script('angular', CRW_PLUGIN_URL . 'js/angular.min.js', array( 'jquery' ));
        wp_enqueue_script('quantic-stylemodel', CRW_PLUGIN_URL . 'js/qantic.angularjs.stylemodel.min.js', array( 'angular' ));
        wp_enqueue_script('crw-js', CRW_PLUGIN_URL . 'js/crosswordsearch.js', array( 'angular', 'quantic-stylemodel' ));
        wp_localize_script('crw-js', 'crwBasics', array_merge($locale_data, array(
            'pluginPath' => CRW_PLUGIN_URL,
            'ajaxUrl' => admin_url( 'admin-ajax.php' )
        )));
	}
}

function crw_set_header () {
	global $post, $crw_has_crossword;

	if ( has_shortcode( $post->post_content, 'crosswordsearch') ) {
        $crw_has_crossword = true;
        add_filter ( 'language_attributes', 'crw_add_angular_attribute' );
        add_action( 'wp_enqueue_scripts', 'add_crw_scripts');
    }
}
add_action( 'get_header', 'crw_set_header');

function crw_set_admin_header () {
    add_filter ( 'language_attributes', 'crw_add_angular_attribute' );
    add_action( 'admin_enqueue_scripts', 'add_crw_scripts');
    wp_enqueue_style('crw-css', CRW_PLUGIN_URL . 'css/crosswordsearch.css');
}
add_action( 'load-settings_page_crw_options', 'crw_set_admin_header');

function crw_test_shortcode ($atts, $names_list) {
    $projects_list = get_option(CRW_PROJECTS_OPTION);
    extract($atts);

    $html = '<strong>' . __('The shortcode usage is faulty:', 'crw-text') . '</strong> ';

    if ( !in_array( $mode, array('build', 'solve') ) ) {
        /// translators: argument %1 will be the literal 'mode'
        return $html . sprintf(__('Attribute %1$s needs to be set to one of "%2$s" or "%3$s".', 'crw-text'), '<em>mode</em>', 'build', 'solve');
    }

    if ( $restricted && $name ) {
        return $html . __('If attribute <em>restricted</em> is set, attribute <em>name</em> must be omitted.', 'crw-text');
    }

    if ( !in_array( $project, $projects_list ) ) {
        /// translators: argument %1 will be the literal 'project'
        return $html . sprintf(__('Attribute %1$s needs to be an existing project.', 'crw-text'), '<em>project</em>');
    }

    if ( 0 == count( $names_list ) && 'solve' == $mode ){
        return $html . sprintf(__('There is no crossword in project %1$s.', 'crw-text'), $project);
    }

    if ( $name && !in_array($name, $names_list ) ) {
        return $html . sprintf(__('There is no crossword with the name %1$s.', 'crw-text'), '<em>' . $name . '</em>');
    }
    return false;
}

function crw_get_names_list ($project) {
    global $wpdb, $data_table_name;

    return $wpdb->get_col( $wpdb->prepare("
        SELECT name
        FROM $data_table_name
        WHERE project = %s AND NOT pending
        ORDER BY name
    ", $project) );
}

/* load the crossword into a post */

function crw_shortcode_handler( $atts, $content = null ) {
    $filtered_atts = shortcode_atts( array(
		'mode' => 'build',
        'restricted' => 0,
        'project' => '',
        'name' => false,
	), $atts, 'crosswordsearch' );
    $filtered_atts['restricted'] = (int)$filtered_atts['restricted'];
	extract( $filtered_atts );

    $names_list = crw_get_names_list($project);

    $shortcode_error = crw_test_shortcode($filtered_atts, $names_list);
    if ( $shortcode_error ) {
        return '<p>' . $shortcode_error . '</p>';
    }

    $is_single = false;
    if ( $name === false && count($names_list) > 0 && !$restricted ) {
        $selected_name = $names_list[0];
    } else {
        $selected_name = $name;
        if ('solve' == $mode) {
            $is_single = true;
        }
    }
    $prep_1 = esc_js($project);
    $prep_2 = wp_create_nonce( NONCE_CROSSWORD );
    $prep_3 = wp_create_nonce( ($restricted ? NONCE_PUSH : NONCE_EDIT) . $project );
    $prep_4 = esc_js($selected_name);

    $current_user = wp_get_current_user();
    $is_auth = is_user_logged_in();
    if ($restricted) {
        $is_auth &= user_can($current_user, CRW_CAP_UNCONFIRMED) || ( user_can($current_user, CRW_CAP_CONFIRMED) && crw_is_editor($current_user, $project) );
    } else {
        $is_auth &= user_can($current_user, CRW_CAP_CONFIRMED) && crw_is_editor($current_user, $project);
    }

	// load stylesheet into page bottom to get it past theming
    wp_enqueue_style('crw-css', CRW_PLUGIN_URL . 'css/crosswordsearch.css');

    ob_start();
    include 'app.php';
    include 'immediate.php';
    $app_code = ob_get_clean();

	return '<div class="crw-wrapper" ng-controller="CrosswordController" ng-init="prepare(\'' . $prep_1 . '\', \'' . $prep_2 . '\', \'' . $prep_3 . '\', \'' . $prep_4 . '\', ' . $restricted . ')">' . $app_code . '</div>';
}
add_shortcode( 'crosswordsearch', 'crw_shortcode_handler' );

/* ajax communication */

// checks for json crossword data
function crw_verify_json($json, &$msg) {
    include('schema/jsv4.php');
    include('schema/schema-store.php');
    include('l10n.php');

    //schema loading
    $raw_schema = json_decode( file_get_contents(CRW_PLUGIN_DIR . 'schema/schema.json') );
    $url = $raw_schema->id;
    $store = new SchemaStore();
    $store->add($url, $raw_schema);
    $schema = $store->get($url);

    $locale_data = crw_get_locale_data();
    $schema->definitions->word->properties->letter->pattern = $locale_data["letterRegEx"];

    // json string decoding
    try {
        $crossword = json_decode($json);
    } catch (Exception $e) {
        $msg = 'decode exception';
        return false;
    }

    // schema validation
    $answer = Jsv4::validate($crossword, $schema);
    if ( !$answer->valid ) {
        $msg = array('schema error:');
        foreach ( $answer->errors as $err ) {
            array_push($msg, $err->dataPath ." ". $err->message);
        }
        return false;
    }

    // verify width and height are consistent
    if ( $crossword->size->height !== count($crossword->table)) {
        $msg = 'height inconsistency';
        return false;
    }
    foreach ( $crossword->table as $line ) {
        if ( $crossword->size->width !== count($line) ) {
            $msg = 'width inconsistency';
            return false;
        }
    }

    foreach ( $crossword->words as $key => $word ) {
        // verify keys match ID content
        if ( (int)$key !== $word->ID ) {
            $msg = 'word key inconsistency';
            return false;
        }
        // verify word lengths are consistent with start/stop positions
        $computed_length = max( abs( $word->stop->x - $word->start->x ), abs( $word->stop->y - $word->start->y ) ) + 1;
        if ( $computed_length !== count($word->fields) ) {
            $msg = 'word length inconsistency';
            return false;
        }
        // even more you could test:
        // direction fits start/stop position
        // each letter is in the right position
    }

    return $crossword->name;
}

// format and send errors as json
function crw_send_error ( $error, $debug ) {
    $obj = array(
        'error' => $error
    );
    // debug messages only for developers
    if ( WP_DEBUG && isset($debug) ) {
        if ( is_string($debug) ) {
            $debug = array($debug);
        }
        $obj["debug"] = $debug;
    }
    wp_send_json($obj);
}

function crw_is_editor ( $user, $project ) {
    global $wpdb, $editors_table_name;

    return (bool)$wpdb->get_var( $wpdb->prepare("
        SELECT count(*)
        FROM $editors_table_name
        WHERE user_id = $user->ID AND project = %s
    ", $project) );
}

// three-part permission test:
// 1. correct nonce for action?
// 2. correct capability for user and action?
// 3. for editing, editing rights in project for user?
function crw_test_permission ( $for, $user, $project=null ) {
    $error = __('You do not have permission.', 'crw-text');

    if ( $user && is_wp_error($user) ) {
        $debug = $user->get_error_messages();
        crw_send_error($error, $debug);
    }

    $restricted = false;
    $for_project = true;
    switch ( $for ) {
    case 'crossword':
        // can the logged in user review unconfirmed crosswords?
        if ( is_user_logged_in() ) {
            $user = wp_get_current_user();
            $restricted = !user_can( $user, CRW_CAP_CONFIRMED ) || !crw_is_editor( $user, $project );
        } else {
            $restricted = true;
        }
        $nonce_source = NONCE_CROSSWORD;
        break;
    case 'cap':
        $nonce_source = NONCE_CAP;
        $capability = 'edit_users';
        break;
    case 'admin':
        $nonce_source = NONCE_ADMIN;
        $capability = 'edit_users';
        break;
    case 'push':
        // can the user push unconfirmed crosswords?
        $restricted = user_can($user, CRW_CAP_UNCONFIRMED);
        if ( $restricted ) {
            $capability = CRW_CAP_UNCONFIRMED;
        } else {
            $capability = CRW_CAP_CONFIRMED;
            $for_project = crw_is_editor( $user, $project );
        }
        $nonce_source = NONCE_PUSH . $project;
        break;
    case 'edit':
        $for_project = crw_is_editor( $user, $project );
        $capability = CRW_CAP_CONFIRMED;
        $nonce_source = NONCE_EDIT . $project;
        break;
    case 'review':
        $nonce_source = NONCE_REVIEW;
        $capability = CRW_CAP_CONFIRMED;
        break;
    }

    if ( !wp_verify_nonce( $_POST[CRW_NONCE_NAME], $nonce_source ) ) {
        $debug = 'nonce not verified for ' . $nonce_source;
        crw_send_error($error, $debug);
    } elseif ( 'crossword' !== $for && !user_can($user, $capability) ) {
        $debug = 'no ' . $capability . ' permission for user';
        crw_send_error($error, $debug);
    } elseif ( !$for_project ) {
        $debug = 'no permission for user in project ' . $project;
        crw_send_error($error, $debug);
    }

    return $restricted;
}

// data for Settings->Options tab
function crw_send_capabilities () {
    global $wp_roles;

    crw_test_permission( 'cap', wp_get_current_user() );

    $roles_caps = get_option(CRW_ROLES_OPTION);
    $capabilities = array();
    foreach ( $wp_roles->get_names() as $name => $role ) {
        array_push($capabilities, array(
            'name' => $name,
            'local' => translate_user_role( $role ),
            'cap' => isset($roles_caps[$name]) ? $roles_caps[$name] : ''
        ) );
    };

    wp_send_json( array(
        'capabilities' => $capabilities,
        CRW_NONCE_NAME => wp_create_nonce(NONCE_CAP)
    ) );
}
add_action( 'wp_ajax_get_crw_capabilities', 'crw_send_capabilities' );

// update capabilities list in (backup) option entry and in live role data
function crw_update_capabilities () {
    global $wp_roles;
    $error = __('Editing rights could not be updated.', 'crw-text');

    crw_test_permission( 'cap', wp_get_current_user() );

    $capabilities = json_decode( wp_unslash( $_POST['capabilities'] ) );
    if ( !is_array($capabilities) ) {
        $debug = 'invalid data: no array';
        crw_send_error($error, $debug);
    }

    $allowed = array(CRW_CAP_CONFIRMED, CRW_CAP_UNCONFIRMED, '');
    $roles_caps = array();
    foreach ( $wp_roles->role_objects as $name => $role ) {
        $list = array_filter($capabilities, function ($entry) use ($name) {
            return is_object($entry) && $entry->name === $name;
        } );
        $cap_obj = current( $list );
        if ( !$cap_obj ) {
            $debug = 'role missing: ' . $name;
            crw_send_error($error, $debug);
        } elseif ( !in_array( $cap_obj->cap, $allowed, true ) ) {
            $debug = 'corrupt role: ' . $name . ', ' . $cap_obj->cap;
            crw_send_error($error, $debug);
        }
        if ('' !== $cap_obj->cap) {
            $roles_caps[$name] = $cap_obj->cap;
        }
    };

    update_option(CRW_ROLES_OPTION, $roles_caps);
    foreach ( $wp_roles->role_objects as $name => $role ) {
        $role->remove_cap( CRW_CAP_CONFIRMED );
        $role->remove_cap( CRW_CAP_UNCONFIRMED );
        if ( array_key_exists($name, $roles_caps) ) {
            $role->add_cap( $roles_caps[$name] );
        }
    }

    crw_send_capabilities();
}
add_action( 'wp_ajax_update_crw_capabilities', 'crw_update_capabilities' );

// data for Settings->Projects tab
function crw_send_admin_data () {
    global $wpdb, $editors_table_name;

    crw_test_permission( 'admin', wp_get_current_user() );

    $projects = get_option(CRW_PROJECTS_OPTION);
    // rule out deleted users
    $editors_list = array_filter( $wpdb->get_results("
        SELECT et.*
        FROM $editors_table_name AS et
        INNER JOIN $wpdb->users as wpu ON wpu.ID = et.user_id
    "), function ($entry) {
        // rule out users whos editor capability was revoked
        return user_can( get_user_by('id', $entry->user_id), CRW_CAP_CONFIRMED );
    } );

    $projects_list = array_map( function ($project) use (&$editors_list) {
        $editors = array();
        array_walk( $editors_list, function ($entry) use ($project, &$editors) {
            if ( $entry->project === $project ) {
                array_push( $editors, $entry->user_id );
            }
        } );
        return array(
            'name' => $project,
            'editors' => $editors
        );
    }, $projects );

    $users_list = array();
    $user_query = new WP_User_Query( array(
        'fields' => array( 'ID', 'display_name' )
    ) );
    array_walk( $user_query->results, function ($user) use (&$users_list) {
        if ( user_can($user->ID, CRW_CAP_CONFIRMED) ) {
            array_push($users_list, array(
                'user_id' => $user->ID,
                'user_name' => $user->display_name
            ));
        }
    } );

    wp_send_json( array(
        'projects' => array_values($projects_list),
        'all_users' => $users_list,
        'capabilities' => get_option(CRW_ROLES_OPTION),
        CRW_NONCE_NAME => wp_create_nonce(NONCE_ADMIN)
    ) );
}
add_action( 'wp_ajax_get_admin_data', 'crw_send_admin_data' );

// add a project
function crw_add_project () {
    crw_test_permission( 'admin', wp_get_current_user() );

    $project = sanitize_text_field( wp_unslash($_POST['project']) );

    $success = crw_change_project_list( $project, 'add' );
    if ( $success ) {
        crw_send_admin_data();
    } else {
        $error = __('The project name already exists.', 'crw-text');
        $debug = $project;
        crw_send_error($error, $debug);
    }
}
add_action( 'wp_ajax_add_project', 'crw_add_project' );

// remove a project
function crw_remove_project () {
    global $wpdb, $data_table_name, $editors_table_name;
    $error = __('The project could not be removed.', 'crw-text');

    crw_test_permission( 'admin', wp_get_current_user() );

    $project = sanitize_text_field( wp_unslash($_POST['project']) );

    $name_count = $wpdb->get_var( $wpdb->prepare("
        SELECT count(*)
        FROM $data_table_name
        WHERE project = %s
    ", $project) );
    if ( $name_count > 0 ) {
        $error = __('There are still riddles saved for that project. You need to delete them before you can remove the project.', 'crw-text');
        $debug = $project . ': ' . $name_count . ' entries';
        crw_send_error($error, $debug);
    }

    $success = crw_change_project_list( $project, 'remove' );
    if ( $success ) {
        $deleted = $wpdb->delete( $editors_table_name, array( 'project' => $project ), array( '%s' ) );
        if ( false === $deleted ) {
            // not really a substitute for rollback, but should do
            crw_change_project_list( $project, 'add' );
            $debug = $wpdb->last_error;
            crw_send_error($error, $debug);
        }
        crw_send_admin_data();
    } else {
        $debug = 'Not in options: ' . $project;
        crw_send_error($error, $debug);
    }
}
add_action( 'wp_ajax_remove_project', 'crw_remove_project' );

// update editors list
function crw_update_editors () {
    global $wpdb, $editors_table_name;
    $error = __('The editors could not be updated.', 'crw-text');

    crw_test_permission( 'admin', wp_get_current_user() );

    $project = sanitize_text_field( wp_unslash($_POST['project']) );
    $esc_project = esc_sql($project);
    $editors = json_decode( wp_unslash( $_POST['editors'] ) );

    if ( !in_array( $project, get_option(CRW_PROJECTS_OPTION), true ) ) {
        $debug = 'invalid project name: ' . $project;
        crw_send_error($error, $debug);
    } elseif ( !is_array($editors) ) {
        $debug = 'invalid data: no array';
        crw_send_error($error, $debug);
    }
    $insertion = array_map( function ($id) use ($esc_project, $error) {
        if ( (string)(integer)$id !== $id ) {
            $debug = 'invalid data: no integer';
            crw_send_error($error, $debug);
        }
        $user = get_userdata($id);
        if ( !( $user && user_can($user, CRW_CAP_CONFIRMED) ) ) {
            $debug = 'invalid user id: ' . $id;
            crw_send_error($error, $debug);
        }

        return "('" . $esc_project . "', $id)";
    }, $editors );

    $success = $wpdb->delete( $editors_table_name, array( 'project' => $project ) );
    if ( false !== $success && count($insertion) ) {
        $success = $wpdb->query( "
            INSERT INTO $editors_table_name (project, user_id)
            VALUES " . implode( ",", $insertion )
        );
    }
    if (false === $success) {
        $debug = $wpdb->last_error;
        crw_send_error($error, $debug);
    }
    crw_send_admin_data();
}
add_action( 'wp_ajax_update_editors', 'crw_update_editors' );

// data for Settings->Review tab
function crw_send_projects_and_riddles ($user) {
    global $wpdb, $data_table_name, $editors_table_name;

    $crosswords_list = $wpdb->get_results("
        SELECT dt.project, dt.name, dt.pending
        FROM $data_table_name AS dt
        INNER JOIN $editors_table_name AS et ON dt.project = et.project
        WHERE et.user_id = $user->ID
    ");

    $projects_list = array();
    array_walk($crosswords_list, function ($entry) use (&$projects_list) {
        if ( !array_key_exists($entry->project, $projects_list) ) {
            $projects_list[$entry->project] = array(
                'name' => $entry->project,
                'confirmed' => array(),
                'pending' => array()
                );
        }
        $target = $entry->pending ? 'pending' : 'confirmed';
        array_push( $projects_list[$entry->project][$target], $entry->name );
    } );

    wp_send_json( array(
        'projects' => array_values($projects_list),
        CRW_NONCE_NAME => wp_create_nonce(NONCE_REVIEW)
    ) );
}

function crw_list_projects_and_riddles () {
    $user = wp_get_current_user();
    crw_test_permission( 'review', $user );

    crw_send_projects_and_riddles($user);
}
add_action( 'wp_ajax_list_projects_and_riddles', 'crw_list_projects_and_riddles' );

// delete a crossword
function crw_delete_crossword() {
    global $wpdb, $data_table_name;
    $error = __('The crossword could not be deleted.', 'crw-text');

    // sanitize fields
    $project = sanitize_text_field( wp_unslash($_POST['project']) );
    $name = sanitize_text_field( wp_unslash($_POST['name']) );

    $user = wp_get_current_user();
    crw_test_permission( 'review', $user );

    // call database
    $success = $wpdb->delete( $data_table_name, array(
        'project' => $project,
        'name' => $name
    ) );

    // check for database errors
    if (false !== $success) {
        crw_send_projects_and_riddles($user);
    } else {
        crw_send_error($error, $wpdb->last_error);
    }
}
add_action( 'wp_ajax_delete_crossword', 'crw_delete_crossword' );

// approve a crossword
function crw_approve_crossword() {
    global $wpdb, $data_table_name;
    $error = __('The crossword could not be approved.', 'crw-text');

    // sanitize fields
    $project = sanitize_text_field( wp_unslash($_POST['project']) );
    $name = sanitize_text_field( wp_unslash($_POST['name']) );

    $user = wp_get_current_user();
    crw_test_permission( 'review', $user );

    // call database
    $success = $wpdb->update( $data_table_name, array(
        'pending' => 0,
    ), array(
        'name' => $name,
        'project' => $project
    ) );

    // check for database errors
    if (false !== $success) {
        crw_send_projects_and_riddles($user);
    } else {
        crw_send_error($error, $wpdb->last_error);
    }
}
add_action( 'wp_ajax_approve_crossword', 'crw_approve_crossword' );

// common function for insert and update shares data testing tasks and error handling
function crw_save_crossword () {
    global $wpdb, $data_table_name;
    $error = __('You are not allowed to save the crossword.', 'crw-text');
    $debug = NULL;

    // sanitize fields
    $project = sanitize_text_field( wp_unslash($_POST['project']) );
    $unsafe_name = wp_unslash($_POST['name']);
    $name = sanitize_text_field( $unsafe_name );
    $restricted_page = (bool)wp_unslash($_POST['restricted']);
    $method = sanitize_text_field( wp_unslash($_POST['method']) );
    if ( 'update' == $method ) {
        $unsafe_old_name = wp_unslash($_POST['old_name']);
        $old_name = sanitize_text_field( $unsafe_old_name );
    }
    $exists = $wpdb->get_var( $wpdb->prepare("
        SELECT count(*)
        FROM $data_table_name
        WHERE project = %s AND name = %s
    ", $project, ('update' == $method ? $old_name : $name) ) );

    // if a username is sent, use it for authentication
    if ( $_POST['username'] ) {
        $user = wp_authenticate_username_password(NULL, $_POST['username'], $_POST['password']);
    } else {
        $user = wp_get_current_user();
    }
    $for = $restricted_page ? 'push' : 'edit';
    $restricted_permission = crw_test_permission( $for, $user, $project );

    // verify crossword data
    $crossword = wp_unslash( $_POST['crossword'] );
    $verification = crw_verify_json( $crossword, $msg );

    // set errors on inconsistencies
    if ( !in_array( $method, array('insert', 'update') ) ) {
        $debug = 'No valid method: ' . $method;
    } elseif ( !$verification ) {
        $debug = array_unshift($msg, 'The crossword data sent are invalid.');
    } elseif ( !in_array( $project, get_option(CRW_PROJECTS_OPTION), true ) ) {
        $debug = 'The project does not exist: ' . $project;
    } else if ( $name !== $unsafe_name ) {
        $debug = 'The name has forbidden content: ' . $name;
    } else if ( 'update' == $method && $old_name !== $unsafe_old_name ) {
        $debug = 'The old name has forbidden content: ' . $old_name;
    } else if ( $name !== $verification ) {
        $debug = array(
            'The name sent is inconsistent with crossword data.',
            $name . ' / ' . $verification
        );
    // errors on asynchronous effects or "blind" writing from restricted page
    } elseif ( 'insert' == $method && $exists ) {
        $error = __('There is already another riddle with that name!', 'crw-text');
        $debug = $name;
    } elseif ( 'update' == $method && !$exists ) {
        $error = __('The riddle you tried to update can not be found!', 'crw-text');
        if ( $restricted_page ) {
            $error .= ' ' . __('A moderator might have deleted it already. You must start a new one.', 'crw-text');
        } else {
            $error .= ' ' . __('Someone else might have renamed or deleted it in the meantime. Look into the list of existing riddles.', 'crw-text');
        }
        $debug = $old_name;
    } else {
        // if all data are ok, call database depending on method
        if ( 'update' == $method ) {
            $success = $wpdb->update($data_table_name, array(
                'name' => $name,
                'crossword' => $crossword,
                'last_user' => $user->ID,
                'pending' => $restricted_permission,
            ), array(
                'name' => $old_name,
                'project' => $project
            ));
        } else if ( 'insert' == $method ) {
            $success = $wpdb->insert($data_table_name, array(
                'name' => $name,
                'project' => $project,
                'crossword' => $crossword,
                'first_user' => $user->ID,
                'last_user' => $user->ID,
                'pending' => $restricted_permission,
            ));
        }

        // check for database errors
        if ($success !== false) {
            if ($restricted_page) {
                wp_send_json( array(
                    CRW_NONCE_NAME => wp_create_nonce( NONCE_PUSH . $project )
                ) );
            } else {
                // send updated list of (non-pending) names in project
                $names_list = crw_get_names_list($project);
                wp_send_json( array(
                    'namesList' => $names_list,
                    CRW_NONCE_NAME => wp_create_nonce( NONCE_EDIT . $project )
                ) );
            }
        } else {
            $error = __('The crossword could not be saved to the database.', 'crw-text');
            $debug = $wpdb->last_error;
        }
    }

    //send error message
    crw_send_error($error, $debug);
}
add_action( 'wp_ajax_nopriv_save_crossword', 'crw_save_crossword' );
add_action( 'wp_ajax_save_crossword', 'crw_save_crossword' );

// select crossword data
function crw_get_crossword() {
    global $wpdb, $data_table_name;
    $error = __('The crossword could not be retrieved.', 'crw-text');

    // sanitize fields
    $project = sanitize_text_field( wp_unslash($_POST['project']) );
    $name = sanitize_text_field( wp_unslash($_POST['name']) );

    $restricted_permission = crw_test_permission( 'crossword', null, $project );

    // call database
    if ( $name === '' ) {
        $crossword = true;
    } else {
        $crossword = $wpdb->get_var( $wpdb->prepare("
            SELECT crossword
            FROM $data_table_name
            WHERE project = %s AND name = %s AND NOT (%d AND pending)
        ", $project, $name, (int)$restricted_permission) );
    }

    // check for database errors
    if ($crossword) {
        // send updated list of (non-pending) names in project
        $names_list = crw_get_names_list($project);
        echo '{"crossword":' . $crossword .
            ',"namesList":' . json_encode($names_list) .
            ',"' . CRW_NONCE_NAME . '": "' . wp_create_nonce( NONCE_CROSSWORD ) .
            '"}';
        die();
    } else {
        crw_send_error($error, $wpdb->last_error);
    }
}
add_action( 'wp_ajax_nopriv_get_crossword', 'crw_get_crossword' );
add_action( 'wp_ajax_get_crossword', 'crw_get_crossword' );

/* settings page load routines */

function crw_admin_menu () {
    add_options_page( 'Crosswordsearch', 'Crosswordsearch', CRW_CAP_CONFIRMED, 'crw_options', 'crw_show_options' );
};
add_action('admin_menu', 'crw_admin_menu');
function crw_show_options() {

	if ( !current_user_can( CRW_CAP_CONFIRMED ) )  {
		wp_die( __( 'You do not have sufficient permissions to access this page.' ) );
	}
	include(WP_PLUGIN_DIR . '/crosswordsearch/options.php');
}
