'use strict';

module.exports = function(grunt) {
    grunt.registerTask('writel10n', 'write l10n.php file', function() {
        var options = this.options({
            dest: 'plugin/l10n.php',
            text_domain: 'messages',
            letterFile: 'src/json/letter.json',
            localeFile: 'src/json/locale.json',
            encoding: 'utf8'
        });

        grunt.verbose.writeflags(options, 'Pot options');
        var php = '<?php\n' +
        'function crw_get_locale_data () {\n';

        var recurseObject = function (obj, wrapFn, key) {
            if (key) {
                php += "'" + key + "' => "
            }
            var kind = grunt.util.kindOf(obj);
            switch (kind) {
            case 'object':
                php += "array(";
                for (var prop in obj) {
                    if (obj.hasOwnProperty(prop) ) {
                        recurseObject(obj[prop], wrapFn, prop);
                    }
                }
                php += ")" + (key ? "," : ";\n");
                break;
            case 'string':
                php += (wrapFn ? wrapFn(obj) : "'" + obj + "'") + ",";
                break;
            case 'number':
                php += obj + ",";
                break;
            }
        };

        var letterData = grunt.file.readJSON(options.letterFile, options.encoding);
        php += "    $letter_data = ";
        recurseObject(letterData);

        var localeData = grunt.file.readJSON(options.localeFile, options.encoding);
        php += "    $locale_data = ";
        recurseObject(localeData, function (str) {
            return "__('" + str + "','" + options.text_domain + "')";
        });

        php += "    $lang = get_locale();\n" +
            "    $lang = array_key_exists($lang, $letter_data) ? $lang : 'en';\n" +
            "    return array_merge($locale_data, $letter_data[$lang]);\n" +
            "}\n";

        if( !grunt.file.exists(options.dest) ){
            grunt.file.write(options.dest);
        }
        grunt.log.writeln('Destination: ' + options.dest);
        grunt.file.write(options.dest, php, options.encoding);

        grunt.verbose.ok();
    });
};
