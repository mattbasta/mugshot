var babel = require('babel-core');
var cm = require('codemirror');
require('codemirror/mode/javascript/javascript');
var gzs = require('gzip-size');
var uglify = require('uglify-js');


var input = document.querySelector('.input');
var output = document.querySelector('.output');
var stats = document.querySelector('.stats');

function getOption(name) {
    return document.querySelector('.opt-' + name).checked;
}

var inputMirror = cm.fromTextArea(input, {mode: 'javascript'});
var outputMirror = cm.fromTextArea(output, {mode: 'javascript'});

document.querySelector('button.start').addEventListener('click', function(e) {
    e.preventDefault();

    stats.innerHTML = '';

    var raw = inputMirror.getValue();
    var processed = raw;
    if (getOption('babel')) {
        try {
            processed = babel.transform(raw, {
                stage: getOption('babel-stage0') ? 0 : 2,
            }).code;
        } catch (e) {
            outputMirror.setValue('/*\n' + e.toString() + '\n*/');
            return;
        }
    }
    var result;
    try {
        result = uglify.minify(processed, {
            fromString: true,
            mangle: getOption('mangle'),
            compress: getOption('compress') ? {unsafe: getOption('unsafe')} : false,
        }).code;
    } catch (e) {
        outputMirror.setValue('// ' + e.toString());
        return;
    }
    outputMirror.setValue(result);

    var statsData = raw.length + ' original (' + gzs.sync(raw) + ' gzip)';
    if (raw !== processed) {
        statsData += ', ' + processed.length + ' processed (' + gzs.sync(processed) + ' gzip)';
    }
    var finalGZ = gzs.sync(result);
    var finalPercent = Math.round(result.length / raw.length * 100).toString();
    var finalGZPercent = Math.round(finalGZ / raw.length * 100).toString();
    statsData += ', ' + result.length + ' min (' + finalPercent + '%)';
    statsData += ', ' + finalGZ + ' min+gzip (' + finalGZPercent + '%)';
    stats.innerHTML = statsData;
});
