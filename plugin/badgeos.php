<?php
define( 'CRW_BADGEOS_PREFIX', '_crw_badgeos_rules_' );
$crw_badgeos_singular_name = __( 'CRW Riddle', 'crosswordsearch' );

if ( !get_page_by_title( $crw_badgeos_singular_name, 'OBJECT', 'achievement-type' ) ) {
    $crw_badgeos_type = wp_insert_post( array(
        'post_title'   => $crw_badgeos_singular_name,
        'post_content' => __( 'Solved Crosswordsearch Riddles', 'crosswordsearch' ),
        'post_status'  => 'publish',
        'post_author'  => 1,
        'post_type'    => 'achievement-type',
    ) );
    update_post_meta( $crw_badgeos_type, '_badgeos_singular_name', $crw_badgeos_singular_name );
    update_post_meta( $crw_badgeos_type, '_badgeos_plural_name', __( 'CRW Riddles', 'crosswordsearch' ) );
    update_post_meta( $crw_badgeos_type, '_badgeos_show_in_menu', true );
}

function crw_badgeos_earned_types ( $types ) {
    $types[] = array( 'name' => __( 'Crosswordsearch Submission (Reviewed)', 'crosswordsearch' ), 'value' => 'crw' );
    $types[] = array( 'name' => __( 'Crosswordsearch Submission (Auto-accepted)', 'crosswordsearch' ), 'value' => 'crw_auto' );
    return $types;
}
add_filter( 'badgeos_achievement_earned_by', 'crw_badgeos_earned_types' );

function crw_badgeos_admin_script() {
    global $post_type;
    if ( in_array( $post_type, badgeos_get_achievement_types_slugs() ) ) {
    	wp_enqueue_script('crw_badgeos_admin', CRW_PLUGIN_URL . 'js/badgeos_admin.js', array( 'jquery' ));
    }
}
add_action( 'admin_print_scripts-post-new.php', 'crw_badgeos_admin_script', 11 );
add_action( 'admin_print_scripts-post.php', 'crw_badgeos_admin_script', 11 );

function crw_badgeos_metabox ( array $meta_boxes ) {
	$meta_boxes[] = array(
		'id'         => 'crw_badgeos_rules',
		'title'      => __( 'Crosswordsearch Submission Rules', 'crosswordsearch' ),
		'pages'      => badgeos_get_achievement_types_slugs(),
		'context'    => 'advanced',
		'priority'   => 'high',
		'show_names' => true, // Show field names on the left
		'fields'     => array(
			array(
				'name'    => __( 'Review Method:', 'crosswordsearch' ),
				'desc'    => __( 'Should the submisson be reviewed manually?', 'crosswordsearch' ),
				'id'      => CRW_BADGEOS_PREFIX . 'method',
				'type'    => 'radio_inline',
				'options' => array(
                    array( 'name' => __( 'manually', 'crosswordsearch' ), 'value' => 'review' ),
                    array( 'name' => __( 'rule-based', 'crosswordsearch' ), 'value' => 'rule' ),
                ),
                'default' => 'review'
			),
			array(
				'name' => __( 'Rules', 'crosswordsearch' ),
				'desc' => __( 'Submissions shall be accepted based on the following rules:', 'crosswordsearch' ),
				'id'   => CRW_BADGEOS_PREFIX . 'group',
				'type' => 'title',
			),
			array(
				'name' => __( 'Solved completely', 'crosswordsearch' ),
				'desc' => __( 'The riddle must be solved completely.', 'crosswordsearch' ),
				'id'   => CRW_BADGEOS_PREFIX . 'solved',
				'type' => 'checkbox',
                'default' => true,
			),
			array(
				'name' => __( 'Minimum word count', 'crosswordsearch' ),
				'desc' => __( 'The minimum number of words that must be found. Does not apply if the riddle must be solved completely.', 'crosswordsearch' ),
				'id'   => CRW_BADGEOS_PREFIX . 'count',
				'type' => 'text_small',
                'default' => 1,
                'sanitization_cb' => 'crw_badgeos_sanitize'
			)
        )
    );

	return $meta_boxes;
}
add_filter( 'cmb_meta_boxes', 'crw_badgeos_metabox' );

function crw_badgeos_sanitize ( $meta_value, $field ) {

    if ( is_numeric( $meta_value ) && $meta_value >= 0 ) {
        return (int)$meta_value;
    } else {
        return null;
    }
}

function crw_badgeos_submit ( $user, $submission ) {
    global $crw_badgeos_singular_name;
    extract( $submission );

    $achievement_id = url_to_postid( wp_get_referer() );
    if ( !badgeos_is_achievement( $achievement_id) ) {
        return;
    }
    $options = array_flip( [ 'method', 'solved', 'count' ] );
    foreach( $options as $option => &$value ) {
        $value = get_post_meta( $achievement_id, CRW_BADGEOS_PREFIX . $option, true );
    }

    $answer = '';
    if ( 'review' == $options['method'] ) {
        $title = $crw_badgeos_singular_name . ': ' . get_post_field( 'post_title', $achievement_id );
        $text = sprintf(__('Solution submitted for crossword %1$s in project %2$s:', 'crosswordsearch'),
                '<strong>' . $name . '</strong>', '<strong>' . $project . '</strong>' ) . '<br/>';
        if ( $total >  $solved ) {
            $text .= sprintf(__('%1$s of %2$s words were found in %3$s seconds.', 'crosswordsearch'),
                    $solved, $total, $time );
        } else {
            $text .= sprintf(__('All %1$s words were found in %2$s seconds.', 'crosswordsearch'),
                    $total, $time );
        }
        badgeos_create_submission( $achievement_id, $title, $text, $user->ID );
        $answer = __('Submission saved successfully.', 'crosswordsearch');
    } else {
        if ( ( $options['solved'] && $solved == $total ) || $solved >= $options['count'] ) {
            badgeos_maybe_award_achievement_to_user( $achievement_id, $user->ID );
        }
        $answer = badgeos_render_earned_achievement_text( $achievement_id, $user->ID );
    }
    add_filter('crw_solution_message', function ( $message ) use ( $answer ) {
        if ( !empty( $message ) ) {
            $message .= '\n\n';
        }
        return $message . $answer;
    } );
}
add_action( 'crw_solution_submitted', 'crw_badgeos_submit', 10, 2 );
