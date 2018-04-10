Installation
============

I will not publish the modifications as part of the plugin in the repository at wordpress.org/plugins. Instead, you need to download it from  [here](https://github.com/ccprog/crosswordsearch/tree/lushootseed). If you know how to use `git`, you can pull the `lushootseed` branch, otherwise follow the link and download the ZIP with the green "Download" button on the right.

Then, copy the content of the `plugin/` folder to a `wp-content/plugins/crosswordsearch-lut/` folder on your webserver. You will notice that the plugin has a changed name. That is to avoid, in the case I update the mainstream plugin, that these updates will replace the custom version. Nonetheless, I will take care to apply fixes and new developments also to your custom version. The only thing is that you have to track them yourself and download the new versions by hand from github.

Deactivate **crosswordsearch**, activate **crosswordsearch-lut**. Do not activate the two at the same time. If you already have designed crosswords with the mainstram plugin that you might want to preserve, you will find them in the custom version as long as you don't delete **crosswordsearch** through the WordPress web interface. Deleting the `crosswordsearch/` folder from the webserver by hand is ok.

Usage
=====

You will still be able to design crosswords in English, (or any other implemented language) like before, by setting the language of the website. Similarily, all UI texts that are part of the plugin will remain in English.

The new thing is that you can now distinguish between the UI language and the language of the crossword itself.

If you enter a shortcode like

```
[crosswordsearch mode="build" project="test" name=""]
```

you can now add an attribute `lang="lut"`:

```
[crosswordsearch mode="build" project="test" lang="lut" name=""]
```

The shortcode wizzard you get by pressing the _Crosswordsearch Shortcode_ button above the editor does not support that option. You can still use it to get the basic syntax, but will need to amend it by hand afterwards.

Now, only letters from the Lushootseed alphabet can be entered for crosswords, and the automatic transposition to uppercase is disabled.

The attribute is not needed for `solve` shortcodes.

If you place multiple shortcodes in one post, the `lang` attribute must be the same for all of them, otherwise it will fail.

If you mix crosswords in English and Lushootseed in one project, you might get into a situation where you load an existing riddle in one language with the `build` shortcode of the other for editing. It will be displayed correctly, but neither will entering letters in the respective alphabet work, nor saving your edits. Bottom line: You should use distinct projects per crossword language.

Another thing you might want to do is to help the character display by defining appropriate fonts. That is part of theming and to be done by you.Follow the instructions in the [wiki](https://github.com/ccprog/crosswordsearch/wiki/Options#custom-theming). Your custom stylesheet that should probably have something like this:

```
.crw-field, .crw-word-sequence {
    font-family: "Lucida Sans Unicode", Arial, sans-serif;
}
```

Class `crw-field` describes the letters displayed in the crossword grid, class `crw-word-sequence` the word displayed in the solution list below.

Implementation notices
======================

b̓ (`b\u0313`) was missing in your list, but is listed in the [Wikipedia article](https://en.wikipedia.org/wiki/Lushootseed#Alphabet) and defined for the keyboard. I've made it enterable, even if it seems to be unused in praxis.

All letters need to be entered in the form of single keystrokes (with optional `SHIFT`). While the keyboard seems to define, for example, that the sequence `[K_K] + [K_O]` works for producing the letter kʷ (`k\u02B7`), entering that for a crosword will fail. You'll need to use `[SHIFT K_I]`. Consequently, the keys `[K_O]` and `[K_X]` do nothing.

The random letter functionality will not enter all 46 letters, but only the 34 most frequent (cutof is at f < 0.25%). All others will appear with the same probabilty as the table you provided stated.

Visually, you could get the impression that letters like ʔ (`\u0294`) or ə (`\u0259`) are over-represented. That is something that seems to happen in every language. (And it is probably the reason why Scrabble letter distributions are also not faithfull to measured letter distributions.) You can tone this down if you look into the `letter.json` entries, and, in key `"letterDist"`, set down the highest numbers for a bit: The lower the number, the less frequent the letter will appear. You can choose every number > 0. Remember to execute `grunt writel10n` afterwards.

Compatibility tests
===================

Linux (Debian)
--------------

Input was generated via [IBus](http://code.google.com/p/ibus/) and [KMFL](http://kmfl.sourceforge.net/) as input engine. Lushootseed input works with both Firefox and Chrome.

For some reason, I can't enter ɬ (`\u026C`) by pressing `[K_COLON]`, but that is even true for all other applications, so I suspect there is some incompatibility between my physical keyboard and the keyboard layout. ƛ̕ (`\u019B\u0315`) works as expected with `[SHIFT K_COLON]`.

Windows 10
----------

I have installed [Keyman Desktop](https://keyman.com/desktop/) with both versions of the Lushotseed layout offered on their website. The difference between the two seems to be unimportant.

Edge seems not to be able to pick up the letters, and displays QWERTY letters in all circumstances.

While Internet Explorer picks up the letters correctly, the input methodology fails and it is possible to enter multiple letters in one field. This makes it at least possible to work around the issue if you take care to only enter one letter per grid field.

Chrome generally works together with Keyman, but when entering crossword letters, it fails for all letters that are composed of unicode sequences.

Firefox works without problems.
