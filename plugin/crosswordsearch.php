<?php
/*
Plugin Name: crosswordsearch
Plugin URI: https://github.com/ccprog/crosswordsearch
Version: 0.5.0
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

/* ----------------------------------
 * Bootstrap
 * ---------------------------------- */

define('CRW_DB_VERSION', '0.5');
define('CRW_DIMENSIONS_OPTION', 'crw_dimensions');
define('CRW_CUSTOM_DIMENSIONS_OPTION', 'crw_custom_dimensions');
define('CRW_ROLES_OPTION', 'crw_roles_caps');
define('CRW_NONCE_NAME', '_crwnonce');
define('NONCE_CROSSWORD', 'crw_crossword_');
define('NONCE_EDIT', 'crw_edit_');
define('NONCE_PUSH', 'crw_push_');
define('NONCE_SETTINGS', 'crw_settings_');
define('NONCE_EDITORS', 'crw_editors_');
define('NONCE_OPTIONS', 'crw_options_');
define('NONCE_REVIEW', 'crw_review_');
define('CRW_CAP_CONFIRMED', 'edit_crossword');
define('CRW_CAP_UNCONFIRMED', 'push_crossword');
define('CRW_CAP_ADMINISTRATE', 'list_users'); //WP standard (local) admin capability

define('CRW_PLUGIN_URL', plugins_url( 'crosswordsearch/' ));
define('CRW_PLUGIN_FILE', WP_PLUGIN_DIR . '/crosswordsearch/' . basename(__FILE__));
define('CRW_PLUGIN_DIR', plugin_dir_path( __FILE__ ));

global $wpdb, $project_table_name, $data_table_name, $editors_table_name;
$wpdb->hide_errors();

$project_table_name = $wpdb->prefix . "crw_projects";
$data_table_name = $wpdb->prefix . "crw_crosswords";
$editors_table_name = $wpdb->prefix . "crw_editors";

$child_css = crw_get_child_stylesheet();

/* ----------------------------------
 * Plugin Installation
 * ---------------------------------- */

/**
 * Installation routine executed on activation.
 *
 * @global WP_Roles $wp_roles
 * @global wpdb $wpdb
 * @global string $charset_collate
 * @global string $project_table_name
 * @global string $data_table_name
 * @global string $editors_table_name
 *
 * @return void
 */
function crw_install ( $network_wide = null ) {
    global $wp_roles, $wpdb, $charset_collate, $project_table_name, $data_table_name, $editors_table_name;
    require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );

    if ( $network_wide ) {
        trigger_error( 'Please activate the plugin individually on each site.', E_USER_ERROR );
    }

    if ( version_compare( PHP_VERSION, '5.3', '<' ) ) {
        trigger_error( 'This plugin requires at least version 5.3 of PHP. Please contact your server administrator before you activate this plugin.', E_USER_ERROR );
    }

    $have_innodb = $wpdb->get_var("
        SHOW VARIABLES LIKE 'have_innodb';
    ");
    if (is_null($have_innodb) || 'NO' === $have_innodb ) {
        trigger_error( 'This plugin requires MySQL to support the InnoDB table engine. Please contact your server administrator before you activate this plugin', E_USER_ERROR );
    }

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
CREATE TABLE IF NOT EXISTS $project_table_name (
  project varchar(190) NOT NULL,
  default_level int NOT NULL,
  maximum_level int NOT NULL,
  used_level int NOT NULL,
  PRIMARY KEY  (project)
) ENGINE=InnoDB $charset_collate;\n"
    );

    dbDelta( "
CREATE TABLE IF NOT EXISTS $data_table_name (
  project varchar(190) NOT NULL,
  name varchar(190) NOT NULL,
  crossword text NOT NULL,
  first_user bigint(20) unsigned NOT NULL,
  last_user bigint(20) unsigned NOT NULL,
  pending boolean NOT NULL DEFAULT FALSE,
  PRIMARY KEY  (project, name)
) ENGINE=InnoDB $charset_collate;\n"
    );

    dbDelta( "
CREATE TABLE IF NOT EXISTS $editors_table_name (
  project varchar(190) NOT NULL,
  user_id bigint(20) unsigned NOT NULL,
  PRIMARY KEY (project, user_id)
) ENGINE=InnoDB $charset_collate;\n"
    );

    $wpdb->query("
        ALTER TABLE $data_table_name
        ADD CONSTRAINT " . $wpdb->prefix . "project_crossword FOREIGN KEY (project)
        REFERENCES $project_table_name (project)
        ON UPDATE CASCADE
    ");

    $wpdb->query("
        ALTER TABLE $editors_table_name
        ADD CONSTRAINT " . $wpdb->prefix . "project_editors FOREIGN KEY (project)
        REFERENCES $project_table_name (project)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    ");
}
register_activation_hook( CRW_PLUGIN_FILE, 'crw_install' );


/**
 * Update tasks.
 *
 * Hooked to plugins_loaded.
 *
 * @return void
 */
function crw_update () {
    // v0.3.3 -> v0.4.0
    $dimensions = array(
        'fieldBorder' => 1,
        'tableBorder' => 1,
        'field' => 30,
        'handleInside' => 4,
        'handleOutside' => 8
    );
    add_option( CRW_DIMENSIONS_OPTION, $dimensions );
    add_option( CRW_CUSTOM_DIMENSIONS_OPTION, $dimensions );
}
add_action( 'plugins_loaded', 'crw_update' );

/**
 * Option reset routine executed on deactivation.
 *
 * @global WP_Roles $wp_roles
 *
 * @return void
 */
function crw_deactivate () {
    global $wp_roles;

    foreach ( $wp_roles->role_objects as $name => $role ) {
        $role->remove_cap( CRW_CAP_CONFIRMED );
        $role->remove_cap( CRW_CAP_UNCONFIRMED );
    }
}
register_deactivation_hook( CRW_PLUGIN_FILE, 'crw_deactivate' );


/**
 * Test data installation routine executed on activation
 *
 * Only executed on WP_DEBUG === true.
 *
 * @global wpdb $wpdb
 * @global string $data_table_name
 *
 * @return void
 */
function crw_install_data () {
    global $wpdb, $data_table_name;

    if (!WP_DEBUG) {
        return;
    }

    crw_change_project_list('add', null, array(
        'default_level' => 1,
        'maximum_level' => 3,
        'project' => 'test'
    ) );

    $data_files = glob(CRW_PLUGIN_DIR . '../tests/*.json');
    $user = wp_get_current_user();

    foreach( $data_files as $file) {
        $json = file_get_contents( realpath($file) );
        $data = json_decode( $json );

        $wpdb->replace($data_table_name, array(
            'project' => 'test',
            'name' => $data->name,
            'crossword' => $json,
            'first_user' => $user->ID,
            'last_user' => $user->ID,
        ));
    }
}
register_activation_hook( CRW_PLUGIN_FILE, 'crw_install_data' );

/* ----------------------------------
 * Plugin Load Routines
 * ---------------------------------- */

$crw_has_crossword = false;

/**
 * Load localization.
 *
 * Hooked to plugins_loaded.
 *
 * @return void
 */
function crw_load_text () {
    load_plugin_textdomain( 'crw-text', false, 'crosswordsearch/languages/' );
}
add_action('plugins_loaded', 'crw_load_text');

/**
 * Add attributes needed for Angular to html tag.
 *
 * @return void
 */
function crw_add_angular_attribute ($attributes) {
    return $attributes . ' xmlns:ng="http://angularjs.org" id="ng-app" ng-app="crwApp"';
}

/**
 * Enqueue scripts and js data.
 *
 * The js data have the following format:
 *
 *     object crwBasics {
 *         object letterDist {
 *             number <letter name> Percentage of letter usage.
 *         }
 *         string letterRegEx Regex for allowed letters.
 *         object locale List of localized strings, see l10n.php.
 *         string pluginPath Plugin URI.
 *         string ajaxUrl Ajax URI.
 *         object dimensions {
 *             number tableBorder
 *             number field
 *             number fieldBorder
 *             number handleOutside
 *             number handleInside
 *         }
 *     }
 *
 * @global boolean $crw_has_crossword
 * @global boolean $child_css
 *
 * @param  string $hook The calling action hook.
 *
 * @return void
 */
function add_crw_scripts ( $hook ) {
    require_once 'l10n.php';
    global $crw_has_crossword, $child_css;

    $locale_data = crw_get_locale_data();

	if ( $crw_has_crossword || 'settings_page_crw_options' == $hook ) {
        wp_enqueue_script('angular', CRW_PLUGIN_URL . 'js/angular.min.js', array( 'jquery' ));
        wp_enqueue_script('angular-route', CRW_PLUGIN_URL . 'js/angular-route.min.js', array( 'angular' ));
        wp_enqueue_script('quantic-stylemodel', CRW_PLUGIN_URL . 'js/qantic.angularjs.stylemodel.min.js', array( 'angular' ));
        wp_enqueue_script('crw-js', CRW_PLUGIN_URL . 'js/crosswordsearch' . (WP_DEBUG ? '' : '.min') . '.js', array( 'angular', 'angular-route', 'quantic-stylemodel' ));
        wp_localize_script('crw-js', 'crwBasics', array_merge($locale_data, array(
            'pluginPath' => CRW_PLUGIN_URL,
            'ajaxUrl' => admin_url( 'admin-ajax.php' ),
            'dimensions' => get_option( $child_css ? CRW_CUSTOM_DIMENSIONS_OPTION : CRW_DIMENSIONS_OPTION )
        )));
	}
}

/**
 * Hook up attribute addition and script loading for pages containing the shortcode.
 *
 * Hooked to get_header.
 *
 * @global WP $post
 * @global boolean $crw_has_crossword
 *
 * @return void
 */
function crw_set_header () {
	global $post, $crw_has_crossword;

	if ( is_object( $post ) && has_shortcode( $post->post_content, 'crosswordsearch') ) {
        $crw_has_crossword = true;
        add_filter ( 'language_attributes', 'crw_add_angular_attribute' );
        add_action( 'wp_enqueue_scripts', 'add_crw_scripts');
    }
}
add_action( 'get_header', 'crw_set_header');

/**
 * Retrieve URI of an optional extra stylesheet in the theme directory.
 *
 * @return mixed URI string if stylesheet exists, false else.
 */
function crw_get_child_stylesheet () {
    $css_file = '/crosswordsearch.css';

    if ( file_exists( get_stylesheet_directory() . $css_file ) ) {
        return get_stylesheet_directory_uri() . $css_file;
    } elseif ( file_exists( get_template_directory() . $css_file ) ) {
        return get_template_directory_uri() . $css_file;
    } else {
        return false;
    }
}

/**
 * Add inline stylesheet composed from dimensions option data.
 *
 * @global WP_Styles $wp_styles
 * @global boolean $child_css
 *
 * @return void
 */
function crw_compose_style () {
    global $wp_styles, $child_css;

    $dimensions = get_option( $child_css ? CRW_CUSTOM_DIMENSIONS_OPTION : CRW_DIMENSIONS_OPTION );

    $code = '.crw-grid, .crw-mask {
    border-width: ' . $dimensions['tableBorder'] . 'px;
}
table.crw-table {
    border-spacing: ' . $dimensions['fieldBorder'] . 'px;
}
td.crw-field, td.crw-field  > div {
    height: ' . $dimensions['field'] . 'px;
    width: ' . $dimensions['field'] . 'px;
    min-width: ' . $dimensions['field'] . 'px;
}
td.crw-field span {
    height: ' . ($dimensions['field'] - 2) . 'px;
    width: ' . ($dimensions['field'] - 2) . 'px;
}
td.crw-field button {
    height: ' . ($dimensions['field'] - 4) . 'px;
    width: ' . ($dimensions['field'] - 4) . 'px;
}
div.crw-marked {
    width: ' . ($dimensions['field'] + $dimensions['fieldBorder']) . 'px;
    height: ' . ($dimensions['field'] + $dimensions['fieldBorder']) . 'px;
}';

    wp_enqueue_style('crw', CRW_PLUGIN_URL . 'css/crosswordsearch.css');
    if ( $child_css ) {
        wp_enqueue_style('crw-child', $child_css, 'crw');
        $dep = 'crw-child';
    } else {
        $dep = 'crw';
    }
        $wp_styles->add_inline_style( $dep, $code );
}

/**
 * Hook up attribute addition and script loading for settings pages.
 *
 * Hooked to load-settings_page_crw_options.
 *
 * @return void
 */
function crw_set_admin_header () {
    add_filter ( 'language_attributes', 'crw_add_angular_attribute' );
    add_action( 'admin_enqueue_scripts', 'add_crw_scripts');
    crw_compose_style();
}
add_action( 'load-settings_page_crw_options', 'crw_set_admin_header');

/**
 * Validity test for shortcode.
 *
 * @global wpdb $wpdb
 * @global string $project_table_name
 *
 * @param array $atts {
 *     Shortcode attributes.
 *
 *     @type string mode Accepts 'build', 'solve', or 'preview'.
 *     @type boolean restricted
 *     @type string project
 *     @type string name
 * }
 * @param array(string) $names_list List of existing crossword names in project.
 *
 * @return mixed HTML formatted error message or false for valid usage.
 */
function crw_test_shortcode ($atts, $names_list) {
    global $wpdb, $project_table_name;

    extract($atts);
    $project_found = $wpdb->get_var($wpdb->prepare("
        SELECT count(*)
        FROM $project_table_name
        WHERE project = %s
    ", $project) );

    $html = '<strong>' . __('The shortcode usage is faulty:', 'crw-text') . '</strong> ';

    if ( !in_array( $mode, array('build', 'solve') ) ) {
        /// translators: argument %1 will be the literal 'mode'
        return $html . sprintf(__('Attribute %1$s needs to be set to one of "%2$s" or "%3$s".', 'crw-text'), '<em>mode</em>', 'build', 'solve');
    }

    if ( $restricted && $name ) {
        return $html . __('If attribute <em>restricted</em> is set, attribute <em>name</em> must be omitted.', 'crw-text');
    }

    if ( false == $project_found ) {
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

/**
 * Load the crossword into a post.
 *
 * Hooked to 'crosswordsearch' shortcode
 *
 * @param array $atts Raw shortcode attributes.
 * @param string $content Optional. Not evaluated, defaults to null.
 *
 * @return string Angular app HTML partial including app.php and immediate.php.
 */
function crw_shortcode_handler( $atts, $content = null ) {
    $filtered_atts = shortcode_atts( array(
		'mode' => 'build',
        'restricted' => 0,
        'project' => '',
        'name' => '',
	), $atts, 'crosswordsearch' );
    $filtered_atts['restricted'] = (int)$filtered_atts['restricted'];
	extract( $filtered_atts );

    $names_list = crw_get_names_list($project);

    $shortcode_error = crw_test_shortcode($filtered_atts, $names_list);
    if ( $shortcode_error ) {
        return '<p>' . $shortcode_error . '</p>';
    }

    $is_single = false;
    if ( $name === '' && count($names_list) > 0 && !$restricted ) {
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
    crw_compose_style();

    ob_start();
    include 'app.php';
    include 'immediate.php';
    $app_code = ob_get_clean();
    $delay_message = '<p ng-hide="true"><strong>' . __('Loading the crossword has yet to start.', 'crw-text') . '</strong></p>';

	return $delay_message . '<div class="crw-wrapper" ng-cloak ng-controller="CrosswordController" ng-init="prepare(\'' . $prep_1 . '\', \'' . $prep_2 . '\', \'' . $prep_3 . '\', \'' . $prep_4 . '\', ' . $restricted . ')">' . $app_code . '</div>';
}
add_shortcode( 'crosswordsearch', 'crw_shortcode_handler' );

/* ----------------------------------
 * Ajax Communication: Utilities
 * ---------------------------------- */

/**
 * Tests the JSON crossword data
 *
 * @param string $json Raw json string.
 * @param array(string) &$msg By reference. List of debug error messages.
 *
 * @return mixed {
 *     Crossword metadata or false if not valid.
 *
 *     @type string $name Crossword name.
 *     @type int $name Difficulty level.
 * }
 */
function crw_verify_json($json, &$msg) {
    $easy_directions = array('right', 'down');
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
        $msg = array('decode exception');
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
        $msg = array('height inconsistency');
        return false;
    }
    foreach ( $crossword->table as $line ) {
        if ( $crossword->size->width !== count($line) ) {
            $msg = array('width inconsistency');
            return false;
        }
    }

    foreach ( $crossword->words as $key => $word ) {
        // verify keys match ID content
        if ( (int)$key !== $word->ID ) {
            $msg = array('word key inconsistency');
            return false;
        }
        // verify word lengths are consistent with start/stop positions
        $computed_length = max( abs( $word->stop->x - $word->start->x ), abs( $word->stop->y - $word->start->y ) ) + 1;
        if ( $computed_length !== count($word->fields) ) {
            $msg = array('word length inconsistency');
            return false;
        }
        // verify direction restriction by level
        if ( !($crossword->level & 1) && !in_array($word->direction, $easy_directions) ) {
            $msg = array('word level and direction inconsistency');
            return false;
        }
        // even more you could test:
        // direction fits start/stop position
        // each letter is in the right position
    }

    return array(
        'name' => $crossword->name,
        'level' => $crossword->level,
    );
}

/**
 * Send error data.
 *
 * Sends JSON data:
 *
 *     object {
 *         string error Error message.
 *         array debug [
 *             string Debug message.
 *         ]
 *     }
 *
 * @param string $error Localized error message.
 * @param mixed $debug List of debug error messages or single string is only
 * sent if WP_DEBUG === true.
 *
 * @return void
 */
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

/**
 * Test if a user is assigned to a project.
 *
 * @global wpdb $wpdb
 * @global string $editors_table_name
 *
 * @param WP_User $user User object.
 * @param string $project Project name.
 *
 * @return boolean
 */
function crw_is_editor ( $user, $project ) {
    global $wpdb, $editors_table_name;

    return (bool)$wpdb->get_var( $wpdb->prepare("
        SELECT count(*)
        FROM $editors_table_name
        WHERE user_id = $user->ID AND project = %s
    ", $project) );
}

/**
 * Permission test for all Ajax requests.
 *
 * 1. correct nonce for action?
 * 2. correct capability for user and action?
 * 3. for editing, editing rights in project for user?
 * Calls crw_send_error() if it does not pass.
 *
 * @see crw_send_error()
 *
 * @param string $for Context string. Accepts 'crossword', 'cap', 'admin', 'push',
 * 'edit' and 'review'.
 * @param WP_User $user User object. Also catches invalid users.
 * @param string $project Optional. Project name.
 *
 * @return boolean True if the user has restricted rights.
 */
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
        $nonce_source = NONCE_OPTIONS;
        $capability = CRW_CAP_ADMINISTRATE;
        break;
    case 'admin':
        $nonce_source = NONCE_EDITORS;
        $capability = CRW_CAP_ADMINISTRATE;
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
        if ( $project ) {
            $for_project = crw_is_editor( $user, $project );
        }
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

/**
 * List existing crossword names in project.
 *
 * @global wpdb $wpdb
 * @global string $data_table_name
 *
 * @return array(string)
 */
function crw_get_names_list ($project) {
    global $wpdb, $data_table_name;

    return $wpdb->get_col( $wpdb->prepare("
        SELECT name
        FROM $data_table_name
        WHERE project = %s AND NOT pending
        ORDER BY name
    ", $project) );
}

/**
 * Change Project list.
 *
 * @global wpdb $wpdb
 * @global string $project_table_name
 *
 * @param  string $method Action to execute. Accepts 'add', 'update' and 'delete'.
 * @param  string $project Project name known to the database. Not evaluated for $method = 'add'.
 * @param  array $args {
 *     Database fields.
 *     @type int $default_level Default difficulty level.
 *     @type int $maximum_level Default difficulty level.
 *     @type string $project New project name.
 * }
 * @param  string &$var debug Optional, by reference. Debug message string. Defaults to ''.
 * @return boolean Action success.
 */
function crw_change_project_list ( $method, $project, $args, &$debug = '' ) {
    global $wpdb, $project_table_name;

    if ( 'add' == $method ) {
        ksort($args);
        // resulting order: default_level, maximum_level, project
        $success = $wpdb->insert( $project_table_name, $args, array('%d', '%d', '%s') );
    } elseif ( 'remove' == $method ) {
        $success = $wpdb->query( $wpdb->prepare("
            DELETE FROM $project_table_name
            WHERE project = %s
        ", $project) );
        if ( $success === false ) {
            // not really true, but I can't read error numbers...
            $error = __('There are still riddles saved for that project. You need to delete them before you can remove the project.', 'crw-text');
            $debug = array( $wpdb->last_error, $wpdb->last_query );
            crw_send_error($error, $debug);
        }
    } elseif ( 'update' == $method ) {
        $success = $wpdb->query( $wpdb->prepare("
            UPDATE $project_table_name
            SET project=%s, default_level=%d, maximum_level=%d
            WHERE project=%s
        ", $args['project'], $args['default_level'], $args['maximum_level'], $project) );
        // no row altered is not considered an error
        if (0 === $success) {
            $success = true;
        }
    }

    $debug = array( $wpdb->last_error, $wpdb->last_query );
    return $success;
}

/* ----------------------------------
 * Ajax Communication: Settings page
 * ---------------------------------- */

/**
 * Answer request for Options tab data.
 *
 * Hooked to wp_ajax_get_crw_capabilities.
 * Sends JSON data:
 *
 *     object {
 *         array capabilities [
 *             object {
 *                 string name Role name.
 *                 string local Localized role name.
 *                 string cap Capability. 'edit_crossword', 'push_crossword', or ''.
 *             }
 *         ]
 *         object dimensions {
 *             number tableBorder
 *             number field
 *             number fieldBorder
 *             number handleOutside
 *             number handleInside
 *         }
 *         string _crwnonce
 *     }
 *
 * @global WP_Roles $wp_roles
 *
 * @return void
 */
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
        'dimensions' => get_option(CRW_CUSTOM_DIMENSIONS_OPTION),
        CRW_NONCE_NAME => wp_create_nonce(NONCE_OPTIONS)
    ) );
}
add_action( 'wp_ajax_get_crw_capabilities', 'crw_send_capabilities' );

/**
 * Update capabilities list in (backup) option entry and in live role data.
 *
 * Hooked to wp_ajax_update_crw_capabilities.
 * Calls crw_send_capabilities() to send data.
 *
 * @see crw_send_capabilities()
 *
 * @global WP_Roles $wp_roles
 *
 * @return void
 */
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

/**
 * Update dimensions list in option entry.
 *
 * Hooked to wp_ajax_update_crw_dimensions.
 * Calls crw_send_capabilities() to send data.
 *
 * @see crw_send_capabilities()
 *
 * @return void
 */
function crw_update_dimensions () {
    $error = __('Dimensions could not be updated.', 'crw-text');

    crw_test_permission( 'cap', wp_get_current_user() );

    $dimensions_raw = json_decode( wp_unslash( $_POST['dimensions'] ), true );
    if ( !is_array($dimensions_raw) ) {
        $debug = 'invalid data: no array';
        crw_send_error($error, $debug);
    } else {
        $dimensions = get_option(CRW_CUSTOM_DIMENSIONS_OPTION);
        foreach ( $dimensions as $key => $dim ) {
            if ( !key_exists($key, $dimensions_raw) ) {
                $debug = 'invalid data: missing key ' . $key;
                crw_send_error($error, $debug);
            } elseif ( !is_int($dimensions_raw[$key]) || $dimensions_raw[$key] < 0 ) {
                $debug = 'invalid data: invalid size ' . $key . ':'. $dimensions_raw[$key];
                crw_send_error($error, $debug);
            } else {
                $dimensions[$key] = $dimensions_raw[$key];
            }
        }
    }

    update_option(CRW_CUSTOM_DIMENSIONS_OPTION, $dimensions);

    crw_send_capabilities();
}
add_action( 'wp_ajax_update_crw_dimensions', 'crw_update_dimensions' );

/**
 * Answer request for Projects tab data.
 *
 * Hooked to wp_ajax_get_admin_data.
 * Sends JSON data:
 *
 *     object {
 *         array projects [
 *             object {
 *                 string name
 *                 number default_level
 *                 number maximum_level
 *                 number used_level
 *                 array editors [
 *                     string user_id
 *                 ]
 *             }
 *         ]
 *         array all_users [
 *             object {
 *                 string user_id
 *                 string user_name Display name.
 *             }
 *         ]
 *         string _crwnonce
 *     }
 *
 * @global wpdb $wpdb
 * @global string $project_table_name
 * @global string $editors_table_name
 *
 * @return void
 */
function crw_send_admin_data () {
    global $wpdb, $project_table_name, $editors_table_name;

    crw_test_permission( 'admin', wp_get_current_user() );

    // rule out deleted users
    $editors_list = array_filter( $wpdb->get_results("
        SELECT pt.project AS project, pt.default_level AS default_level,
        pt.maximum_level AS maximum_level, pt.used_level AS used_level,
        et.user_id AS user_id
        FROM $project_table_name AS pt
        LEFT JOIN ($editors_table_name AS et
        INNER JOIN $wpdb->users as wpu ON wpu.ID = et.user_id)
        ON et.project = pt.project
    "), function ($entry) {
        // rule out users whose editor capability was revoked
        return !$entry->user_id || user_can( get_user_by('id', $entry->user_id), CRW_CAP_CONFIRMED );
    } );

    $projects_list = array();
    array_walk( $editors_list, function ($entry) use (&$projects_list) {
        if ( !array_key_exists($entry->project, $projects_list) ) {
            $projects_list[$entry->project] = array(
                'name' => $entry->project,
                'default_level' => (int)$entry->default_level,
                'maximum_level' => (int)$entry->maximum_level,
                'used_level' => (int)$entry->used_level,
                'editors' => array(),
            );
        }
        if ($entry->user_id) {
            array_push( $projects_list[$entry->project]['editors'], $entry->user_id );
        }
    } );

    $users_list = array();
    $user_query = new WP_User_Query( array(
        'fields' => array( 'ID', 'display_name' )
    ) );
    foreach( $user_query->get_results() as $user) {
        if ( user_can($user->ID, CRW_CAP_CONFIRMED) ) {
            array_push($users_list, array(
                'user_id' => $user->ID,
                'user_name' => $user->display_name
            ));
        }
    };

    wp_send_json( array(
        'projects' => array_values($projects_list),
        'all_users' => $users_list,
        CRW_NONCE_NAME => wp_create_nonce(NONCE_EDITORS)
    ) );
}
add_action( 'wp_ajax_get_admin_data', 'crw_send_admin_data' );

/**
 * Add, update or remove a project.
 *
 * Hooked to wp_ajax_save_project.
 * Calls crw_change_project_list() to execute action and
 * crw_send_admin_data() to send data.
 *
 * @see crw_change_project_list()
 * @see crw_send_admin_data()
 *
 * @return void
 */
function crw_save_project () {
    $level_list = range(0, 3);

    crw_test_permission( 'admin', wp_get_current_user() );

    $method = sanitize_text_field( wp_unslash($_POST['method']) );
    $project = sanitize_text_field( wp_unslash($_POST['project']) );

    if ( 'remove' == $method ) {
        $args =  null;
        $error = __('The project could not be removed.', 'crw-text');
    } else {
        $args = array(
            'project' => sanitize_text_field( wp_unslash( $_POST['new_name']) ),
            'default_level' => (int)wp_unslash( $_POST['default_level']),
            'maximum_level' => (int)wp_unslash( $_POST['maximum_level']),
        );

        if ( mb_strlen($args['project'], 'UTF-8') > 190 ) {
            crw_send_error( __('You have exceeded the maximum length for a name!', 'crw-text'), $args['project'] );
        } elseif ( mb_strlen($args['project'], 'UTF-8') < 4 ) {
            crw_send_error( __('The name is too short!', 'crw-text'), $args['project'] );
        } elseif ( !in_array($args['default_level'], $level_list) ||
                !in_array($args['maximum_level'], $level_list) ||
                $args['default_level'] > $args['maximum_level'] ) {
            $debug = 'Invalid levels: default ' . $default_level . ' / maximum ' . $maximum_level;
            crw_send_error($error, $debug);
        }

        if ( 'add' == $method ) {
            $project = null;
            $error = __('The project could not be added.', 'crw-text');
        } elseif ( 'update' == $method ) {
            $error = __('The project could not be altered.', 'crw-text');
        }
    }
    $success = crw_change_project_list( $method, $project, $args, $debug );

    if ( $success ) {
        crw_send_admin_data();
    } else {
        crw_send_error($error, $debug);
    }
}
add_action( 'wp_ajax_save_project', 'crw_save_project' );

/**
 * Update editors list.
 *
 * Hooked to wp_ajax_update_editors.
 * Calls crw_send_admin_data() to send data.
 *
 * @see crw_send_admin_data()
 *
 * @global wpdb $wpdb
 * @global string $project_table_name
 * @global string $editors_table_name
 *
 * @return void
 */
function crw_update_editors () {
    global $wpdb, $editors_table_name, $project_table_name;
    $error = __('The editors could not be updated.', 'crw-text');

    crw_test_permission( 'admin', wp_get_current_user() );

    $project = sanitize_text_field( wp_unslash($_POST['project']) );
    $esc_project = esc_sql($project);
    $project_found = $wpdb->get_var( $wpdb->prepare("
        SELECT count(*)
        FROM $project_table_name
        WHERE project = %s
    ", $project ) );

    $editors = json_decode( wp_unslash( $_POST['editors'] ) );

    if ( !$project_found ) {
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
        $debug = array( $wpdb->last_error, $wpdb->last_query );
        crw_send_error($error, $debug);
    }
    crw_send_admin_data();
}
add_action( 'wp_ajax_update_editors', 'crw_update_editors' );

/**
 * Sends Review tab data.
 *
 * Sends JSON data:
 *
 *     object {
 *         array projects [
 *             object {
 *                 string name Project name.
 *                 array confirmed [
 *                     string Crossword name.
 *                 ]
 *                 array pending [
 *                     string Crossword name.
 *                 ]
 *             }
 *         ]
 *         string _crwnonce
 *     }
 *
 * @global wpdb $wpdb
 * @global string $project_table_name
 * @global string $editors_table_name
 *
 * @param WP_User $user User Object.
 *
 * @return void
 */
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

/**
 * Answer request for Review tab data.
 *
 * Hooked to wp_ajax_list_projects_and_riddles.
 * Calls crw_send_projects_and_riddles() to send data.
 *
 * @see crw_send_projects_and_riddles()
 *
 * @return void
 */
function crw_list_projects_and_riddles () {
    $user = wp_get_current_user();
    crw_test_permission( 'review', $user );

    crw_send_projects_and_riddles($user);
}
add_action( 'wp_ajax_list_projects_and_riddles', 'crw_list_projects_and_riddles' );

/**
 * Delete a crossword.
 *
 * Hooked to wp_ajax_delete_crossword.
 * Calls crw_send_projects_and_riddles() to send data.
 *
 * @see crw_send_projects_and_riddles()
 *
 * @global wpdb $wpdb
 * @global string $data_table_name
 *
 * @return void
 */
function crw_delete_crossword() {
    global $wpdb, $data_table_name;
    $error = __('The crossword could not be deleted.', 'crw-text');

    // sanitize fields
    $project = sanitize_text_field( wp_unslash($_POST['project']) );
    $name = sanitize_text_field( wp_unslash($_POST['name']) );

    $user = wp_get_current_user();
    crw_test_permission( 'review', $user, $project );

    // call database
    $success = $wpdb->delete( $data_table_name, array(
        'project' => $project,
        'name' => $name
    ) );

    // check for database errors
    if (false !== $success) {
        crw_send_projects_and_riddles($user);
    } else {
        $debug = array( $wpdb->last_error, $wpdb->last_query );
        crw_send_error($error, $debug);
    }
}
add_action( 'wp_ajax_delete_crossword', 'crw_delete_crossword' );

/**
 * Approve a crossword.
 *
 * Hooked to wp_ajax_approve_crossword.
 * Calls crw_send_projects_and_riddles() to send data.
 *
 * @see crw_send_projects_and_riddles()
 *
 * @global wpdb $wpdb
 * @global string $data_table_name
 *
 * @return void
 */
function crw_approve_crossword() {
    global $wpdb, $data_table_name;
    $error = __('The crossword could not be approved.', 'crw-text');

    // sanitize fields
    $project = sanitize_text_field( wp_unslash($_POST['project']) );
    $name = sanitize_text_field( wp_unslash($_POST['name']) );

    $user = wp_get_current_user();
    crw_test_permission( 'review', $user, $project );

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
        $debug = array( $wpdb->last_error, $wpdb->last_query );
        crw_send_error($error, $debug);
    }
}
add_action( 'wp_ajax_approve_crossword', 'crw_approve_crossword' );

/* ----------------------------------
 * Ajax Communication: Posts
 * ---------------------------------- */

 /**
 * Insert or update a crossword.
 *
 * Hooked to wp_ajax_save_crossword and wp_ajax_nopriv_save_crossword.
 * Sends JSON data:
 *
 *     object {
 *         array namesList [
 *             string Crossword name.
 *         ]
 *         string _crwnonce
 *     }
 *
 * @global wpdb $wpdb
 * @global string $project_table_name
 * @global string $data_table_name
 *
 * @return void
 */
function crw_save_crossword () {
    global $wpdb, $project_table_name, $data_table_name;
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
    $verification = crw_verify_json( $crossword, $debug );

    // as a drive-by, finds if a project exists
    $maximum_level = $wpdb->get_var( $wpdb->prepare("
        SELECT maximum_level
        FROM $project_table_name
        WHERE project = %s
    ", $project ) );
    $crossword_found = $wpdb->get_var( $wpdb->prepare("
        SELECT count(*)
        FROM $data_table_name
        WHERE project = %s AND name = %s
    ", $project, ('update' == $method ? $old_name : $name) ) );

    // set errors on inconsistencies
    if ( !in_array( $method, array('insert', 'update') ) ) {
        $debug = 'No valid method: ' . $method;
    } elseif ( !$verification ) {
        array_unshift($debug, 'The crossword data sent are invalid.');
    } elseif ( is_null($maximum_level) ) {
        $debug = 'The project does not exist: ' . $project;
    } else if ( $name !== $unsafe_name ) {
        $debug = 'The name has forbidden content: ' . $name;
    } else if ( 'update' == $method && $old_name !== $unsafe_old_name ) {
        $debug = 'The old name has forbidden content: ' . $old_name;
    } else if ( $name !== $verification['name'] ) {
        $debug = array(
            'The name sent is inconsistent with crossword data.',
            $name . ' / data: ' . $verification['name']
        );
    } else if ( $verification['level'] > $maximum_level ) {
        $debug = array(
            'The difficulty level surpasses the maximum.',
            $verification['level'] . ' / maximum: ' . $maximum_level
        );
    // errors on asynchronous effects or "blind" writing from restricted page
    } elseif ( 'insert' == $method && $crossword_found ) {
        $error = __('There is already another riddle with that name!', 'crw-text');
        $debug = $name;
    } elseif ( 'update' == $method && !$crossword_found ) {
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
            $wpdb->query($wpdb->prepare("
                UPDATE $project_table_name
                SET used_level = %d
                WHERE project = %s
                AND used_level < %d
            ", $verification['level'], $project, $verification['level']) );
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
            $debug = array( $wpdb->last_error, $wpdb->last_query );
        }
    }

    //send error message
    crw_send_error($error, $debug);
}
add_action( 'wp_ajax_nopriv_save_crossword', 'crw_save_crossword' );
add_action( 'wp_ajax_save_crossword', 'crw_save_crossword' );

/**
 * Answer request for crossword data.
 *
 * Hooked to wp_ajax_get_crossword and wp_ajax_nopriv_get_crossword.
 * Sends JSON data:
 *
 *     object {
 *         object crossword See schema/schema.json for data format.
 *         number default_level
 *         number maximum_level
 *         array namesList [
 *             string Crossword name.
 *         ]
 *         string _crwnonce
 *     }
 *
 * @return void
 */
function crw_get_crossword() {
    global $wpdb, $data_table_name, $project_table_name;
    $error = __('The crossword could not be retrieved.', 'crw-text');

    // sanitize fields
    $project = sanitize_text_field( wp_unslash($_POST['project']) );
    $name = sanitize_text_field( wp_unslash($_POST['name']) );
    $restricted_page = (bool)wp_unslash($_POST['restricted']);

    $restricted_permission = crw_test_permission( 'crossword', null, $project );

    // call database
    if ( $name === '' ) {
        $data = $wpdb->get_row( $wpdb->prepare("
            SELECT NULL AS crossword, default_level, maximum_level
            FROM $project_table_name
            WHERE project = %s
        ", $project) );
    } else {
        // the $restricted_permission test is only used for previews,
        // in posts pending riddles never show in $names_list
        $data = $wpdb->get_row( $wpdb->prepare("
            SELECT dt.crossword AS crossword, pt.default_level AS default_level,
            pt.maximum_level AS maximum_level
            FROM $project_table_name AS pt
            LEFT JOIN $data_table_name AS dt ON pt.project = dt.project
            WHERE pt.project = %s AND dt.name = %s AND NOT (%d AND dt.pending)
        ", $project, $name, (int)$restricted_permission) );
    }
    // check for database errors
    if ($data) {
        // send updated list of (non-pending) names in project
        $names_list = crw_get_names_list($project);
        echo '{"crossword":' . ($data->crossword ? $data->crossword : 'null') .
            ',"default_level":' . $data->default_level .
            ',"maximum_level":' . $data->maximum_level .
            ',"namesList":' . ($restricted_page ? '[]' : json_encode($names_list)) .
            ',"' . CRW_NONCE_NAME . '": "' . wp_create_nonce( NONCE_CROSSWORD ) .
            '"}';
        die();
    } else {
        $debug = array( $wpdb->last_error, $wpdb->last_query );
        crw_send_error($error, $debug);
    }
}
add_action( 'wp_ajax_nopriv_get_crossword', 'crw_get_crossword' );
add_action( 'wp_ajax_get_crossword', 'crw_get_crossword' );

/* ----------------------------------
 * Settings Page Load Routines
 * ---------------------------------- */

/**
 * Add context sensitive help.
 *
 * Hooked to load-$settings_page.
 *
 * @see WP_Screen::add_help_tab()
 *
 * @return void
 */
function crw_add_help_tab () {
    $screen = get_current_screen();

    if ( current_user_can(CRW_CAP_ADMINISTRATE) ) {
        $screen->add_help_tab( array(
            'id'	=> 'crw-help-tab-options',
            'title'	=> __('Options', 'crw-text'),
            'content'	=> '<p>' . __('Riddles saved by restricted editors need the approval of full editors before they can appear for other users.', 'crw-text') . '</p><p>' .
                __('Full editors can only act on the projects they are assigned to.', 'crw-text') . '</p><p>' .
                sprintf( __('For custom theming, place a file %1$s with overrides to the default theme into your theme folder.', 'crw-text'), '<code>crosswordsearch.css</code>') . '</p><p>' .
                __('There are some dimension values that are used in computations during drag operations. If you have a custom theme, you might have to additionally adjust these values.', 'crw-text') . '</p><p>' .
                __('Dimension settings are pixel values and used uniformly for heights and widths.', 'crw-text') . '</p><p>' . '</p>',
        ) );
        $screen->add_help_tab( array(
            'id'	=> 'crw-help-tab-projects',
            'title'	=> __('Projects', 'crw-text'),
            'content'	=> '<p>' . __('If you change the name of a project, remember that you need to change it also in every shortcode referring to it.', 'crw-text') . '</p><p>' . __('The lowest eligible maximum difficulty level is either the the default level or the highest level used in an existing riddle, whatever is higher.', 'crw-text') . '</p><p>'
                . __('You need to assign editors to a project in order for them to see its riddles in the <em>Review</em> tab.', 'crw-text') . '</p><p>' .
                __('If you want to delete a project, you need first to delete all its riddles.', 'crw-text') . '</p>',
        ) );
    }
    if ( current_user_can(CRW_CAP_CONFIRMED) ) {
        $screen->add_help_tab( array(
            'id'	=> 'crw-help-tab-review',
            'title'	=> __('Review', 'crw-text'),
            'content'	=> '<p>' . __('To preview a riddle, check the <em>Preview</em> box and then click on the name of the riddle', 'crw-text') . '</p>',
        ) );
    }
}

/**
 * Init Settings page and hook up context sensitive help.
 *
 * Hooked to admin_menu.
 *
 * @see add_options_page()
 *
 * @return void
 */
function crw_admin_menu () {
    $settings_page = add_options_page( __('Crosswordsearch Administration', 'crw-text'), 'Crosswordsearch', CRW_CAP_CONFIRMED, 'crw_options', 'crw_show_options' );
    add_action('load-'.$settings_page, 'crw_add_help_tab');
};
add_action('admin_menu', 'crw_admin_menu');

/**
 * Answer request for single tab template.
 *
 * Hooked to wp_ajax_get_option_tab.
 * Sends HTML partial optionsTab.php, editorsTab.php or reviewTab.php.
 * reviewTab.php also includes app.php.
 *
 * @global $child_css
 *
 * @return void
 */
function crw_get_option_tab () {
    global $child_css;

    if ('invalid' == $_GET['tab'] ) {
        wp_die( __( 'You need to hit your browser\'s Reload button.', 'crw-text' ) );
    } elseif ( !wp_verify_nonce( $_GET[CRW_NONCE_NAME], NONCE_SETTINGS ) ) {
        wp_die( __( 'You do not have sufficient permissions to access this page.' ) );
    }

    if ('capabilities' == $_GET['tab'] && current_user_can(CRW_CAP_ADMINISTRATE) ) {
        include WP_PLUGIN_DIR . '/crosswordsearch/optionsTab.php';
    } elseif ('editor' == $_GET['tab'] && current_user_can(CRW_CAP_ADMINISTRATE) ) {
        include WP_PLUGIN_DIR . '/crosswordsearch/editorsTab.php';
    } elseif ('review' == $_GET['tab'] && current_user_can(CRW_CAP_CONFIRMED) ) {
        include WP_PLUGIN_DIR . '/crosswordsearch/reviewTab.php';
    } else {
        wp_die( __( 'You do not have sufficient permissions to access this page.' ) );
    }
    die();
}
add_action( 'wp_ajax_get_option_tab', 'crw_get_option_tab' );

/**
 * Send wrapper settings page template.
 *
 * Sends HTML partial settings.php, which also includes immediate.php.
 *
 * @return void
 */
function crw_show_options() {
    global $wp_version;

	if ( !current_user_can( CRW_CAP_CONFIRMED ) )  {
		wp_die( __( 'You do not have sufficient permissions to access this page.' ) );
	}
	include(WP_PLUGIN_DIR . '/crosswordsearch/settings.php');
}
