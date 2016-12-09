<?php
function crw_simple_history_logger ( $simpleHistory ) {

    class crw_logger extends SimpleLogger {

        public $slug = __CLASS__;

        function getInfo() {
            return array(
                "name" => __( 'Crosswordsearch submissions', 'crosswordsearch' ),
                'name_via' => 'Crosswordsearch',
                "description" => __('User submitted solutions for crosswordsearch riddles', 'crosswordsearch' ),
                'messages' => array(
                    'submission' => 'Crosswordsearch submission'
                ),
                'labels' => array(
                    'search' => array(
                        'label' => 'Crosswordsearch',
                        'options' => array(
                            __( 'Solution submissions', 'crosswordsearch' ) => array( 'submission' )
                        )
                    )
                )
            );
        }

        function loaded() {
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
            add_action( 'crw_solution_submitted', function  ( $user, $submission ) {
                // submit log entry
                $context = array_merge( $submission, array(
                    '_message_key' => 'submission',
                    '_user_id' => $user->ID,
                    '_initiator' => SimpleLoggerLogInitiators::WP_USER
                ) );
                $this->info( 'Crosswordsearch submission', $context );
            }, 10, 2 );

        }

        function getLogRowPlainTextOutput($row) {
            return crw_log_text( $row->context );
        }
    }

    $simpleHistory->register_logger('crw_logger');
};
add_action("simple_history/add_custom_logger", 'crw_simple_history_logger' );
