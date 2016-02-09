<?php
function crw_clgs_log ( $user, $submission ) {
    $category = 'Crosswordsearch submissions';
    extract( $submission );

    clgs_register( $category, __('User submitted solutions for crosswordsearch riddles', 'crosswordsearch' ) );

    $text = sprintf(__('Solution submitted for crossword %1$s in project %2$s:', 'crosswordsearch'),
            '<strong>' . $name . '</strong>', '<strong>' . $project . '</strong>' ) . '<br/>';
    if ( $total >  $solved ) {
        $text .= sprintf(__('%1$s of %2$s words were found in %3$s seconds.', 'crosswordsearch'),
                $solved, $total, $time );
    } else {
        $text .= sprintf(__('All %1$s words were found in %2$s seconds.', 'crosswordsearch'),
                $total, $time );
    }
    clgs_log( $category, $text, CLGS_NOSEVERITY, $user );
}
add_action( 'crw_solution_submitted', 'crw_clgs_log', 10, 2 );
