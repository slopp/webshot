
// This must be executed with phantomjs
// Take a screenshot of a URL and saves it to a .png file
// phantomjs webshot.js <url> <filename> [options]

var utils = require('./utils');
var system = require('system');

phantom.casperPath = phantom.libraryPath + '/casperjs';
phantom.injectJs(phantom.casperPath + '/bin/bootstrap.js');
var casper = require('casper').create();

var opt_defaults = {
  delay: 0.2,
  vwidth: 992,
  vheight: 744
};

// =====================================================================
// Command line arguments
// =====================================================================
var args = system.args;

if (args.length < 3) {
  console.log('Usage:\n' +
    '  phantomjs webshot.js <url> <name>.png [options]');
}

var url = args[1];
var filename = args[2];
var opts = utils.parseArgs(args.slice(3));
opts = utils.merge(opt_defaults, opts);

// This should be four numbers separated by ","
if (opts.cliprect) {
  opts.cliprect = opts.cliprect.split(",");
}


// =====================================================================
// Screenshot
// =====================================================================
casper.start(url).viewport(opts.vwidth, opts.vheight);

if (+opts.delay > 0)
  casper.wait(opts.delay * 1000);

casper.then(function() {
  var cr = findClipRect(opts, null);
  this.capture(filename, cr);
});

casper.run();


// =====================================================================
// Utility functions
// =====================================================================

// Given the options object, return an object representing the clipping
// rectangle. If opts.cliprect and opts.selector are both not present,
// return null.
function findClipRect(opts, page) {
  if (opts.cliprect) {
    return {
      top:    opts.cliprect[0],
      left:   opts.cliprect[1],
      width:  opts.cliprect[2],
      height: opts.cliprect[3]
    };
  } else if (opts.selector) {
    var cr = page.evaluate(function (s) {
      return document.querySelector(s).getBoundingClientRect();
    }, opts.selector);

    return {
      top:    cr.top,
      left:   cr.left,
      width:  cr.width,
      height: cr.height
    };
  } else {
    return null;
  }
}


// Exit on error, instead of just hanging
phantom.onError = function(msg, trace) {
  var msgStack = ['PHANTOM ERROR: ' + msg];
  if (trace && trace.length) {
    msgStack.push('TRACE:');
    trace.forEach(function(t) {
      msgStack.push(' -> ' + (t.file || t.sourceURL) + ': ' + t.line + (t.function ? ' (in function ' + t.function +')' : ''));
    });
  }
  console.error(msgStack.join('\n'));
  phantom.exit(1);
};