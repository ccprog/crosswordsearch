crosswordsearch
===============

Crosswordsearch is a WordPress plugin for designing and playing wordsearch-style crosswords.
It is being developed for [RadiJojo.de](radijojo.de), the International Children's Media Network.

If you want to use this plugin on your Website, I strongly advise you to load it from
[the Wordpress Plugin repository](http://wordpress.org/plugins/crosswordsearch). Please be
aware that it is still in a beta stage.

## For developers

Only releases will be in a consistent state. Latest: [![GitHub version](https://badge.fury.io/gh/ccprog%2Fcrosswordsearch.png)](http://badge.fury.io/gh/ccprog%2Fcrosswordsearch)

Crosswordsearch is compatible with Worpress 3.6 and above.

### Installation in Wordpress

I recommend to create a softlink under the name `crosswordsearch` in your wordpress plugin
directory pointing at the `plugin` directory. Copying and renaming the directory will work also,
with the exception of the test data install.

Activating the plugin from the Wordpress administrative interface will
+ install three additional database tables `wp_crw_projects`, `wp_crw_editors` and
  `wp_crw_crosswords`, explicitly as InnoDB tables. Make sure your MySQL server supports
  this engine.
+ introduce two specialized capabilities: `edit_crossword` will be given to roles that have
  the `moderate_comments` capability, `push_crossword` will be given to the Subscriber role.
  These are defaults that can be altered on the Settings/Crosswordsearch adminstrative page.

If your WP installation is in debug mode, additionally some test data will be added to
`wp_crw_projects` and `wp_crw_crosswords`. *(Debug mode will break if you use a WP version
&lt; 3.8 together with PHP 5.5. This is actually a general issue with class $wpdb. Read
[this Blog post](http://make.wordpress.org/core/2014/04/07/mysql-in-wordpress-3-9/) for more
information.)*

On plugin deactivation, the special roles will be removed, but the data tables are left in place.

### Usage in Wordpress

Crosswords are organised in projects that share a common set of editors. On a page for building a
new crossword,
+ either all saved riddles belonging to the project are available for editing to 'full' editors
  (`edit_crossword` capability),
+ or only new riddles can be saved by 'restricted' editors to be added to a moderation queue
  (`push_crossword` capability).

Administrators can add, update and delete projects and assign editors on the Settings/Crosswordsearch
administrative page.

Editors assigned for projects can review Crosswords from the Settings/Crosswordsearch administrative
page and moderate (approve or delete) them.

Authors can add a shortcode tag to any page or post to add a Crossword game to that page:

```
[crosswordsearch mode="solve" project="MyProject"]
```

will add a game area for solving riddles that belong to the project `MyProject`. All saved
and approved riddles belonging to the project can be loaded through a menu.

```
[crosswordsearch mode="solve" project="MyProject" name="MyFirstCrossword"]
```
will show only the crossword `MyFirstCrossword` for solving. No other crossword will be
selectable.

```
[crosswordsearch mode="build" project="MyProject"]
```
will add a game area for developing new and editing existing riddles that belong to the
project `MyProject`. All saved and approved riddles belonging to the project can be
loaded through a menu. Initially visible will be the riddle with the alphabetically first
name.

```
[crosswordsearch mode="build" project="MyProject" name="MyFirstCrossword"]
```
works as above, but will initially show the crossword saved under the name `MyFirstCrossword`.
All other riddles can still be loaded through the menu.

```
[crosswordsearch mode="build" project="MyProject" name=""]
```
works as above, but will initially show an empty new crossword.

```
[crosswordsearch mode="build" restricted="1" project="MyProject"]
```
will add a game area for developing new riddles for the project `MyProject` by restricted
editors. Restricted editors can work on a riddle as long as they stay on the page,
but it will not be visible for anyone else. No menu for selecting other riddles is
presented, and on page load an empty new crossword will be shown.

#### Custom theming

It is possible to override the design for this plugin by placing a file
`crosswordsearch.css` into the base folder of the active theme. It will be loaded
directly after the default plugin CSS.

Since some dimension values for the crossword grid are used in computations during
drag operations, it might be necessary to adjust them to customizations. Therefore
the Options tab on the Settings/Crosswordsearch page exposes the required values
if it finds an active custom CSS file.

### Grunt tasks

Please refer to http://gruntjs.com/getting-started to get grunt up and running. Running
```
npm install
```
in the base directory will install all needed dependencies for the defined tasks. This includes
some Jasmine test dependencies installed in `tests/vendor` with bower.

The following tasks are available for the development process:

+ `grunt jasmine` will execute the unit tests in `tests/unit/` (twice, against jQuery 1.10.2
  for WP 3.x versions and 1.11.1 for WP 4.0)
+ `grunt jshint:main` will lint the files in `src/js/`, `grunt jshint:spec` those in `tests/unit/`
+ `grunt uglify` will link the files in `src/js/` together as `plugin/js/crosswordsearch.js`
  and minify them as `plugin/js/crosswordsearch.min.js`. Please note that if you add a new file,
  you have to list it explicitely in `Gruntfile.js` to include for linting and uglifying.
+ `grunt writel10n` will compile `l10n.php` from json data that are also used in unit testing
+ `grunt cssmin` will link and minify the files in `src/css/` as `plugin/css/crosswordsearch.css`.
+ `grunt pot` extracts the localizable strings from the `plugin/` `.php` files to the
  `plugin/languages/crw-text.pot` template.
+ `grunt msgmerge` will update all `.po` files in `plugin/languages/` to reflect
  `plugin/languages/crw-text.pot`.
+ `grunt msgupdate` executes `pot` and `msgmerge` together.
+ `grunt` executes `jshint:main`, `uglify`, `writel10n`, `cssmin` and `msgupdate` together.

