crosswordsearch
===============

Crosswordsearch is a WordPress plugin for designing and playing wordsearch-style crosswords.
It started as a development for [RadiJojo.de](radijojo.de), the International
Children's Media Network.

If you want to use this plugin on your Website, I strongly advise you to load it from
[the Wordpress Plugin repository](http://wordpress.org/plugins/crosswordsearch).

## For developers

Only releases will be in a consistent state. Latest: [![GitHub version](https://badge.fury.io/gh/ccprog%2Fcrosswordsearch.png)](http://badge.fury.io/gh/ccprog%2Fcrosswordsearch)

Crosswordsearch is compatible with Worpress 3.6 and above. It requires PHP 5.3 or above and a
MySQL DBMS that supports InnoDB tables.

All modern browsers as well as Internet Explorer 8 and newer are supported.

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

See the [wiki](https://github.com/ccprog/crosswordsearch/wiki).

### Adaptations

The plugin contains a mechanism for [custom theming](https://github.com/ccprog/crosswordsearch/wiki/Options#custom-theming) and
a [API](https://github.com/ccprog/crosswordsearch/wiki/Solution-submissions#submission-api) for consuming solution submissions.

### Grunt tasks

Please refer to http://gruntjs.com/getting-started to get grunt up and running. Running
```
npm install
```
in the base directory will install all needed dependencies for the defined tasks. This includes
some Jasmine test dependencies installed in `tests/vendor` with bower.

The following tasks are available for the development process:

+ `grunt jasmine` will execute the unit tests in `tests/unit/` (once for every minor version
  since 1.10 delivered by WordPress)
+ `grunt jshint:main` will lint the files in `src/js/`, `grunt jshint:spec` those in `tests/unit/`
+ `grunt uglify` will link the files in `src/js/` together as `plugin/js/crosswordsearch.js`
  and minify them as `plugin/js/crosswordsearch.min.js`. Please note that if you add a new file,
  you have to list it explicitely in `Gruntfile.js` to include for linting and uglifying.
+ `grunt writel10n` will compile `l10n.php` from json data that are also used in unit testing
+ `grunt cssmin` will link and minify the files in `src/css/` as `plugin/css/crosswordsearch.css`.
+ `grunt pot` extracts the localizable strings from the `plugin/` `.php` files to the
  `plugin/languages/crosswordsearch.pot` template.
+ `grunt msgmerge` will update all `.po` files in `plugin/languages/` to reflect
  `plugin/languages/crosswordsearch.pot`.
+ `grunt msgupdate` executes `pot` and `msgmerge` together.
+ `grunt` executes `jshint:main`, `uglify`, `writel10n`, `cssmin` and `msgupdate` together.

