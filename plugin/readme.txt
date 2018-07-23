=== crosswordsearch ===
Contributors: ccprog
Tags: game, gamification, crossword, shortcode, educational
Requires at least: 3.6
Tested up to: 4.9
Requires PHP: 5.3
Stable tag: trunk
License: see LICENCE file
License URI: https://github.com/ccprog/crosswordsearch/LICENCE

Adds a wordsearch-style crossword with a shortcode. Users can develop new riddles, save them depending on specific rights, or solve stored riddles.

== Description ==

Crosswordsearch is a WordPress plugin, based on the [AngularJs](http://angularjs.org/)
Javascript framework, for designing and playing wordsearch-style crosswords. 
Original development was done for [RadiJojo.de](http://radijojo.de), the International
Children's Media Network.

* Page visitors may try to solve the published riddles.
* Registered users may develop new riddles or modify existing ones depending on their rights.
* For saving their work, they must not be logged in, but only give their user name and
  password at the time of upload.
* Each crossword may contain a freetext description of the task to complete and the name of a
  copyright owner.
* Crosswords have a difficulty level that relates to the used word directions and the
  listing of the searched words before they have been found.
* Solving of riddles can be timed and solutions submitted back to the server, where they
  may be logged or interpreted by other plugins.
* Crosswords are organised in projects that share a common set of editors.
* Users may be given a *restricted editor* status, which gives them the right to upload
  new riddles. These riddles will only become visible for other users if a *full editor*
  approves them.
* Default and maximum difficulty levels are set for projects.
* Setting up projects and editors is reserved to the blog administrators.

Authors can add a shortcode tag to any page or post to add a Crossword game to that page.

For informations on usage and configuration,
[visit the Wiki](https://github.com/ccprog/crosswordsearch/wiki).

== Installation ==

1. Install from *Plugins -> Add New*
2. Or download the .zip and extract to `wp-content/plugins`
3. Activate the plugin from the *Plugins* menu
4. Consult the [Wiki](https://github.com/ccprog/crosswordsearch/wiki) for the
   next steps.

== Frequently Asked Questions ==

= I am geting "You do not have permission" errors =

Most of the time these errors are the result of using a caching mechanism. **Make
absolutely sure the posts containing the shortcode are not cached. Otherwise they
will stop working after 24 hours.** While
the plugin is compatible with most of the well-known cache plugins, there may be
cases not covered yet, especially if the caching is not done by a plugin, but by
your hosting service. Please let me know in the
[support forum](http://wordpress.org/support/plugin/crosswordsearch) so I can help
you iron this out.

= Is this plugin suitable for multisite installations? =

There is limited support for use in multisite environments. There is no option for a network
wide installation; the plugin **must** be enabled for each individual site. Projects and
their associated rights are also specific to the individual site, local administrators have
access to these settings as usual.

= What sort of personally identifiable information does this plugin generate? =

Please consult the
[privacy policy](https://github.com/ccprog/crosswordsearch/wiki/Privacy-policy).

= Which are the prerequsites for this plugin? =

Crosswordsearch is compatible with WordPress 3.6 and above. It requires PHP 5.3 or above and a
MySQL DBMS that supports InnoDB tables.

All modern browsers as well as Internet Explorer 8 and newer are supported.

= Which work flows for adding new riddles are possible? =

If you want to develop yourself and only present riddles for solving to your readers,
add the **build** mode shortcode to a private page and only add yourself to the list
of full project editors.

If you want to let others develop crosswords, there are two possible setups:

1. **Restrict development to trusted users:**  
    If you use pages with the app in **unrestricted build** mode, everyone assigned as an
    editor for the project has full control over the appearance of every crossword.
    This includes editing and deleting riddles by others.  
    A possible use for that scenario may be a classroom situation: students can work on
    riddles, but only the teacher knows the editor credentials and may approve
    anything for saving.

2. **Invite development and moderate:**  
    If you use pages with the app in **restricted build** mode, you treat new uploads as
    proposals. For example, you could confer to all subscribers or contributors the rights
    of a restricted editor. It would be the responsibility of the full editors to review and
    approve these proposals for publication.

= Is it possible to limit the restricted editing right to specific users? =

Restricted editing right is linked to a user role, and every user with that role has
the right. If you are not happy with the coupling to standard Wordpress roles, you
should consider introducing custom roles. There are plugins that deal with adding new
roles and managing their capabilities.

= Is it possible to limit the restricted editing to specific projects? =

That is quite simply done by publishing a **restricted build** page only for that project.

= Why is it impossible to edit riddles from the preview on the settings page? =

As the development of a crossword must be considered as an activity protected by copyright,
there should be no 'backdoor' for altering them. The preview page is meant for moderation.
Altering the name of crosswords from that page is considered for future versions.

= Is it possible to limit the editing of existing crosswords to their original authors? =

That possibility is considered for future versions. The user id of the uploader is already
saved to the database, albeit at this point this information is not used anywhere.

== Screenshots ==

1. The app in **solve** mode
2. The app in **build** mode
3. The *save* dialogue
4. The shortcode wizzard
5. The *Assign projects and editors* tab

== Changelog ==

= 1.1.0 =

* Implementation of the GDPR-compliant privacy tools
* Privacy policy suggestion text links the privacy policy in the wiki

= 1.0.3 =

* WordPress 4.9 compatibility
* improved persistance of options on deactivation
* Updates to the Persian translation - thanks to Mortaza Nejati Jeze again
* several internal code improvements

= 1.0.2 =

* WordPress 4.7 compatibility
* minor CSS issues with theme Twenty Seventeen
* mark the origin of Simple History log messages if it is used for logging submissions
* CSS fix for the layout of the options page if custom dimensions are used

= 1.0.1 =

* WordPress 4.6 compatibility
* minor string corrections
* due to a corruption in the release process, version 1.0.0 might have been broken.
  I had no reports of problems, so I hope nothing serious happened.
 
= 1.0.0 =

New or changed features:

* **new:** Introduces a wizzard for compiling shortcodes. When editing a post,
  pressing the **Create Crosswordsearch shortcode** button will open a dialog
  that will guide you through the process of writing the shortcode.

Internal improvements and bug fixes:

* Compatibility with cache plugins: block out known caching plugins for posts
  with shortcode; do not use nonces for XHR requests when no user is logged in.
* Usability: Display errors in more cases when loading a crossword fails.
* Bugfix: Hide control buttons until they are initialized.
* Bugfix: Make sure the nonce for crossword review actions is identified correctly.
* Compatibility: Correct some errors in the timer for Internet Explorer 8.
* Bugfix: Make sure the help always shows content after changing the tab.
* Bugfix: Distinguish between first and empty crossword in build mode, as
  documented in shortcode description.
* Bugfix: Fix solve marking after restart of a level 2/4 crossword.
* Design: suppress button animations more reliably.
* For developers: Minification or expansion of all Javascript is now controlled
  by the constant SCRIPT_DEBUG.
* Update AngularJS to version 1.5.6 for all browsers but Internet Explorer 8.

= 0.7.3 =

* bugfix: ensure uploading works independently if there are multiple app areas in one page

= 0.7.2 =

* bugfix: Compatibility with newer MySQL / MariaDB versions

= 0.7.1 =

* WP 4.5 compatibility
* bugfix: double entry in administrative Option tab

= 0.7.0 =

New features:

* **new:** Timer facility
* **new:** Solution submission to the server
* Submission API
* Predefined Submission processing for BadgeOS, Custom Logging Service and Simple History

Internal improvements and bug fixes:

* bugfix: allways display all crossword names in project on unrestricted build page
* avoid reloading of already loaded riddles in solve mode
* bugfix: correct data type for 'restricted' parameter on upload request
* Make sure Firefox does not complain about missing required fields when aborting a Form

= 0.6.1 =

* WP 4.4 compatibility: update header tags in admin screen
* bugfix: checking for double words broke editing of pre-existing crosswords

= 0.6.0 =

New or changed features:

* full support for right-to-left languages
* fa_IR locale support and translation (thanks to Mortaza Nejati Jeze)

Internal improvements and bug fixes:

* administrative tab headers should now update on browser history navigation
* prevent unitialized states to show up on adminstrative page and its tabs
* prevent multiple marking of the same word
* conformance with translate.wordpress.org naming conventions
* several compatibility issues with Internet Explorer 8 and Safari resolved

= 0.5.0 =

* notify administrator if PHP requirement is not met
* block network-wide installation on multisite
* adaptations for multisite use cases
* WP 4.3 compatibility: update header tags in admin screen

**If you have modified WordPress standard roles, please note:**
The right to adminstrate projects is now linked to the *list_users* capability instead of
*edit_users*. Please review which role has the *list_users* capability.

**Known bugs:** trying to activate the plugin network-wide in a multisite installation will
result in a non-informative error message. The non-activation is intentional, it is only
the wrong message displayed.
This is an upstream issue. (see https://core.trac.wordpress.org/ticket/33215 )

= 0.4.3 =

* Compatibility with MySQL >= 5.5.3 make it neccesary to shorten the maximum length of project
  and crossword names in new installs. This does not affect older installs.

= 0.4.2 =

* several CSS tweaks including Twenty Fifteen theme compatibility
* show a temporary message before AngularJs bootstraps
* avoid AngularJs loading on non-posts
* better DBMS detection

= 0.4.1 =

* show an instructional text above the crossword table
* security fixes: harden server-side tests
* fix automatic selection of help tab corresponding to admin tab
* stop keyboard events caught by TableController from propagating (Jetpack compatibility issue)

= 0.4.0 =

New or changed features:

* Custom theming support loads custom CSS file from active theme folder
* Error messages on adminstrative page are now collected in one place
* Urge user to reload the adminstrative page after a forced re-login triggerd by wp-auth-check

Internal improvements and bug fixes:

* Documentation of PHP code
* Stay on the correct administrative page tab after reload
* Bypass escape service for localized strings in expressions

= 0.3.3 =

* WordPress 4.0 compatibility
* minor improvements in level selection and editor assignment interface
* some bug fixes, one concerning IE8 compatibility
* customSelectElement improved, most notably submenus now open when mouse hovers over the parent entry

= 0.3.2 =
* Some CSS tweaks
* Installation fix: explicitly install InnoDB tables
* fix revision date and version for .po files


= 0.3.1 =
* Quick bugfix

= 0.3.0 =
* First public release

== Upgrade Notice ==

