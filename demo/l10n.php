<?php
require_once('pomo/mo.php');

function esc_attr ( $text ) { return $text; }
function esc_html ( $text ) { return $text; }

$translations = null;

/**
 * Retrieve the translation of $text.
 *
 * If there is no translation, or the text domain isn't loaded, the original text is returned.
 *
 * *Note:* Don't use translate() directly, use __() or related functions.
 *
 * @param string $text   Text to translate.
 * @return string Translated text
 */
function translate( $text ) {
	global $translations;

	return $translations->translate( $text );
}

/**
 * Retrieve the translation of $text in the context defined in $context.
 *
 * If there is no translation, or the text domain isn't loaded the original
 * text is returned.
 *
 * *Note:* Don't use translate_with_gettext_context() directly, use _x() or related functions.
 *
 * @param string $text    Text to translate.
 * @param string $context Context information for the translators.
 * @return string Translated text on success, original text on failure.
 */
function translate_with_gettext_context( $text, $context ) {
	global $translations;
	
	return $translations->translate( $text, $context );
}

/**
 * Retrieve the translation of $text.
 *
 * If there is no translation, or the text domain isn't loaded, the original text is returned.
 *
 * @param string $text   Text to translate.
 * @param string $domain ignored
 * @return string Translated text.
 */
function __( $text, $domain = 'default' ) {
	return translate( $text );
}

/**
 * Retrieve the translation of $text and escapes it for safe use in an attribute.
 *
 * If there is no translation, or the text domain isn't loaded, the original text is returned.
 *
 * @param string $text   Text to translate.
 * @param string $domain ignored
 * @return string Translated text on success, original text on failure.
 */
function esc_attr__( $text, $domain = 'default' ) {
	return esc_attr( translate( $text ) );
}

/**
 * Retrieve the translation of $text and escapes it for safe use in HTML output.
 *
 * If there is no translation, or the text domain isn't loaded, the original text is returned.
 *
 * @param string $text   Text to translate.
 * @param string $domain ignored
 * @return string Translated text
 */
function esc_html__( $text, $domain = 'default' ) {
	return esc_html( translate( $text ) );
}

/**
 * Display translated text.
 *
 * @param string $text   Text to translate.
 * @param string $domain ignored
 */
function _e( $text, $domain = 'default' ) {
	echo translate( $text );
}

/**
 * Display translated text that has been escaped for safe use in an attribute.
 *
 * @param string $text   Text to translate.
 * @param string $domain ignored
 */
function esc_attr_e( $text, $domain = 'default' ) {
	echo esc_attr( translate( $text ) );
}

/**
 * Display translated text that has been escaped for safe use in HTML output.
 *
 * @param string $text   Text to translate.
 * @param string $domain ignored
 */
function esc_html_e( $text, $domain = 'default' ) {
	echo esc_html( translate( $text ) );
}

/**
 * Retrieve translated string with gettext context.
 *
 * Quite a few times, there will be collisions with similar translatable text
 * found in more than two places, but with different translated context.
 *
 * By including the context in the pot file, translators can translate the two
 * strings differently.
 *
 * @param string $text    Text to translate.
 * @param string $context Context information for the translators.
 * @param string $domain  ignored
 * @return string Translated context string without pipe.
 */
function _x( $text, $context, $domain = 'default' ) {
	return translate_with_gettext_context( $text, $context );
}

/**
 * Display translated string with gettext context.
 *
 * @param string $text    Text to translate.
 * @param string $context Context information for the translators.
 * @param string $domain  ignored
 * @return string Translated context string without pipe.
 */
function _ex( $text, $context, $domain = 'default' ) {
	echo _translate_with_gettext_context( $text, $context );
}

/**
 * Translate string with gettext context, and escapes it for safe use in an attribute.
 *
 * @param string $text    Text to translate.
 * @param string $context Context information for the translators.
 * @param string $domain  ignored
 * @return string Translated text
 */
function esc_attr_x( $text, $context, $domain = 'default' ) {
	return esc_attr( translate_with_gettext_context( $text, $context ) );
}

/**
 * Translate string with gettext context, and escapes it for safe use in HTML output.
 *
 * @param string $text    Text to translate.
 * @param string $context Context information for the translators.
 * @param string $domain  ignored
 * @return string Translated text.
 */
function esc_html_x( $text, $context, $domain = 'default' ) {
	return esc_html( translate_with_gettext_context( $text, $context ) );
}

/**
 * Translates and retrieves the singular or plural form based on the supplied number.
 *
 * Used when you want to use the appropriate form of a string based on whether a
 * number is singular or plural.
 *
 * Example:
 *
 *     printf( _n( '%s person', '%s people', $count, 'text-domain' ), number_format_i18n( $count ) );
 *
 * @param string $single The text to be used if the number is singular.
 * @param string $plural The text to be used if the number is plural.
 * @param int    $number The number to compare against to use either the singular or plural form.
 * @param string $domain ignored
 * @return string The translated singular or plural form.
 */
function _n( $single, $plural, $number, $domain = 'default' ) {
	global $translations;
	
	return $translations->translate_plural( $single, $plural, $number );
}

/**
 * Translates and retrieves the singular or plural form based on the supplied number, with gettext context.
 *
 * This is a hybrid of _n() and _x(). It supports context and plurals.
 *
 * Used when you want to use the appropriate form of a string with context based on whether a
 * number is singular or plural.
 *
 * Example of a generic phrase which is disambiguated via the context parameter:
 *
 *     printf( _nx( '%s group', '%s groups', $people, 'group of people', 'text-domain' ), number_format_i18n( $people ) );
 *     printf( _nx( '%s group', '%s groups', $animals, 'group of animals', 'text-domain' ), number_format_i18n( $animals ) );
 *
 * @param string $single  The text to be used if the number is singular.
 * @param string $plural  The text to be used if the number is plural.
 * @param int    $number  The number to compare against to use either the singular or plural form.
 * @param string $context Context information for the translators.
 * @param string $domain  ignored
 * @return string The translated singular or plural form.
 */
function _nx($single, $plural, $number, $context, $domain = 'default') {
	global $translations;
	
	return $translations->translate_plural( $single, $plural, $number, $context );
}

/**
 * Registers plural strings in POT file, but does not translate them.
 *
 * Used when you want to keep structures with translatable plural
 * strings and use them later when the number is known.
 *
 * Example:
 *
 *     $message = _n_noop( '%s post', '%s posts', 'text-domain' );
 *     ...
 *     printf( translate_nooped_plural( $message, $count, 'text-domain' ), number_format_i18n( $count ) );
 *
 * @param string $singular Singular form to be localized.
 * @param string $plural   Plural form to be localized.
 * @param string $domain   Optional. Text domain. Unique identifier for retrieving translated strings.
 *                         Default null.
 * @return array {
 *     Array of translation information for the strings.
 *
 *     @type string $0        Singular form to be localized. No longer used.
 *     @type string $1        Plural form to be localized. No longer used.
 *     @type string $singular Singular form to be localized.
 *     @type string $plural   Plural form to be localized.
 *     @type null   $context  Context information for the translators.
 *     @type string $domain   Text domain.
 * }
 */
function _n_noop( $singular, $plural, $domain = null ) {
	return array( 0 => $singular, 1 => $plural, 'singular' => $singular, 'plural' => $plural, 'context' => null, 'domain' => $domain );
}

/**
 * Registers plural strings with gettext context in POT file, but does not translate them.
 *
 * Used when you want to keep structures with translatable plural
 * strings and use them later when the number is known.
 *
 * Example of a generic phrase which is disambiguated via the context parameter:
 *
 *     $messages = array(
 *      	'people'  => _nx_noop( '%s group', '%s groups', 'people', 'text-domain' ),
 *      	'animals' => _nx_noop( '%s group', '%s groups', 'animals', 'text-domain' ),
 *     );
 *     ...
 *     $message = $messages[ $type ];
 *     printf( translate_nooped_plural( $message, $count, 'text-domain' ), number_format_i18n( $count ) );
 *
 * @param string $singular Singular form to be localized.
 * @param string $plural   Plural form to be localized.
 * @param string $context  Context information for the translators.
 * @param string $domain   Optional. Text domain. Unique identifier for retrieving translated strings.
 *                         Default null.
 * @return array {
 *     Array of translation information for the strings.
 *
 *     @type string $0        Singular form to be localized. No longer used.
 *     @type string $1        Plural form to be localized. No longer used.
 *     @type string $2        Context information for the translators. No longer used.
 *     @type string $singular Singular form to be localized.
 *     @type string $plural   Plural form to be localized.
 *     @type string $context  Context information for the translators.
 *     @type string $domain   Text domain.
 * }
 */
function _nx_noop( $singular, $plural, $context, $domain = null ) {
	return array( 0 => $singular, 1 => $plural, 2 => $context, 'singular' => $singular, 'plural' => $plural, 'context' => $context, 'domain' => $domain );
}

/**
 * Translates and retrieves the singular or plural form of a string that's been registered
 * with _n_noop() or _nx_noop().
 *
 * Used when you want to use a translatable plural string once the number is known.
 *
 * Example:
 *
 *     $message = _n_noop( '%s post', '%s posts', 'text-domain' );
 *     ...
 *     printf( translate_nooped_plural( $message, $count, 'text-domain' ), number_format_i18n( $count ) );
 *
 * @param array  $nooped_plural Array with singular, plural, and context keys, usually the result of _n_noop() or _nx_noop().
 * @param int    $count         Number of objects.
 * @param string $domain        Optional. Text domain. Unique identifier for retrieving translated strings. If $nooped_plural contains
 *                              a text domain passed to _n_noop() or _nx_noop(), it will override this value. Default 'default'.
 * @return string Either $single or $plural translated text.
 */
function translate_nooped_plural( $nooped_plural, $count, $domain = 'default' ) {
	if ( $nooped_plural['domain'] )
		$domain = $nooped_plural['domain'];

	if ( $nooped_plural['context'] )
		return _nx( $nooped_plural['singular'], $nooped_plural['plural'], $count, $nooped_plural['context'], $domain );
	else
		return _n( $nooped_plural['singular'], $nooped_plural['plural'], $count, $domain );
}

/**
 * Load a .mo file.
 *
 * If the locale is en, an empty translations object is placed in the $translations global.
 *
 * On success, the .mo file will be placed in the $translations global.
 *
 * @param string $locale
 * @return bool True on success, false on failure.
 */
function load_textdomain( $locale ) {
	global $translations;

	if ( 'en' === $locale) {
		$translations = new NOOP_Translations;

		return true;
	}

	$mofile = '../plugin/languages/crosswordsearch-' . $locale . '.mo';

	if ( !is_readable( $mofile ) ) return false;

	$translations = new MO();
	if ( !$translations->import_from_file( $mofile ) ) return false;

	return true;
}
