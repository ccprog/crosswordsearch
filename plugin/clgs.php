<?php
/**
 * act on crossword submission
 *
 * Hooked to crw_solution_submitted filter
 *
 * @param WP_User $user
 * @param array $submission
 *
 * @return void
 */
function crw_clgs_log ( $user, $submission ) {
    $category = 'Crosswordsearch submissions';

    // register category
    clgs_register( $category, __('User submitted solutions for crosswordsearch riddles', 'crosswordsearch' ) );

    // submit log entry
    $text = crw_log_text( $submission );
    clgs_log( $category, $text, CLGS_NOSEVERITY, $user );
}
add_action( 'crw_solution_submitted', 'crw_clgs_log', 10, 2 );
