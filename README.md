crosswordsearch
===============

Crosswordsearch is a WordPress plugin for designing and playing wordsearch-style crosswords.
It is being developed for [RadiJojo.de](radijojo.de), the International Children's Media Network.

The project is currently under active development. If you want to use this plugin on your
Website, I'd ask you to wait until it shows up in
[the Wordpress Plugin repository](http://wordpress.org/plugins/).

## For developers

Only releases will be in a consistent state. Latest: [![GitHub version](https://badge.fury.io/gh/ccprog%2Fcrosswordsearch.png)](http://badge.fury.io/gh/ccprog%2Fcrosswordsearch)

Crosswordsearch is compatible with Worpress 3.6 and above.

### Installation in Wordpress

I recommend to create a softlink under the name `crosswordsearch` in your wordpress plugin
directory pointing at the `plugin` directory. Copying and renaming the directory will work also,
with the exception of the test data install.

Activating the plugin from the Wordpress administrative interface will
+ install two additional database tables `wp_crw_editors` and `wp_crw_crosswords`
+ give the Administrator and Contributer roles a specialized capability `edit_crossword`

If your WP installation is in debug mode, additionally some test data will be added to
`wp_crw_crosswords`. *(Debug mode will break if you use a WP version &lt; 3.8 together with PHP 5.5.
This is actually a general issue with class $wpdb. Read
[this Blog post](http://make.wordpress.org/core/2014/04/07/mysql-in-wordpress-3-9/) for more
information.)*

On plugin deactivation, the special role will be removed, but the data tables are left in place.

### Usage in Wordpress

Crosswords are organised in projects that share a common set of editors. On a page for building a
new crossword, all saved riddles belonging to the project are available for editing. Administrators
can add/delete projects and assign editors on the Options/Crosswordsearch administrative page.

Editors assigned for projects can review Crosswords from the Options/Crosswordsearch administrative
page and delete them.

Authors can add a shortcode tag to any page or post to add a Crossword game to that page:

```
[crosswordsearch mode="build" project="MyProject"]
```
will add a game area for building and editing riddles that belong to the project `MyProject`.

```
[crosswordsearch mode="build" project="MyProject" name="MyFirstCrossword"]
```
will initially show the crossword saved under the name `MyFirstCrossword`. All other riddles are
presented in a menu for loading.

```
[crosswordsearch mode="build" project="MyProject" name=""]
```
will initially show an empty new crossword.

```
[crosswordsearch mode="solve" project="MyProject"]
```
will show all saved crosswords in `MyProject` for solving. The one displayed can be selected
through a menu.

```
[crosswordsearch mode="solve" project="MyProject" name="MyFirstCrossword"]
```
will show only the crossword `MyFirstCrossword` for solving. No other crossword will be
selectable.

### Grunt tasks

Please refer to http://gruntjs.com/getting-started to get grunt up and running. Running
```
npm install
```
in the base directory will install all needed dependencies for the defined tasks.

The following tasks are available for the development process:

+ `grunt jshint` will lint the files in `src/js/`
+ `grunt uglify` will link the files in `src/js/` together as `plugin/js/crosswordsearch.js`
  and minify them as `plugin/js/crosswordsearch.min.js`. Please note that if you add a new file,
  you have to list it explicitely in `Gruntfile.js` to include for linting and uglifying.
+ `grunt cssmin` will link and minify the files in `src/css/` as `plugin/css/crosswordsearch.css`.
+ `grunt pot` extracts the localizable strings from the `plugin/` `.php` files to the
  `plugin/languages/crw-text.pot` template.
+ `grunt msgmerge` will update all `.po` files in `plugin/languages/` to reflect
  `plugin/languages/crw-text.pot`.
+ `grunt msgupdate` executes `pot` and `msgmerge` together.
+ `grunt` executes `jshint`, `uglify` and `cssmin` together.

