
var chalk = require('chalk'),
  format = require('util').format,
  _ = require('underscore'),
  Spinner = require('./spinner').Spinner;


/*
 |--------------------------------------------------------------------------
 | Spinning
 |--------------------------------------------------------------------------
 |
 */

var spinner, stop;

var stop = function(){
   if(spinner){
     spinner.stop(' ');
   }
 };

exports.stopSpinner = function() {
  spin('');
  stop();
};

var spin = exports.spin = function(message) {
   stop();

   spinner = new Spinner(message, space);
   spinner.setSpinnerString(3);
   spinner.start();
 };


/*
 |--------------------------------------------------------------------------
 |  Logging
 |--------------------------------------------------------------------------
 |
 */

var logged, padded, space = '         ';

exports.log = function(){
  log('log', arguments);
};

exports.info = function(msg){
  log('log', arguments, 'cyan');
};

exports.newline = function(){
  log('error', '', '', ' ');
};

exports.success = function(msg){
  log('log', arguments, 'green');
};

exports.warn = function(msg){
  log('log', arguments, 'yellow');
};

exports.error = function(msg){
  log('log', arguments, 'red');
};

exports.fatal = function(err){
  if (err instanceof Error) {
    err = err.stack
      .replace(/\n/g, '\n        ')
      .replace(/\n$/, '\n\n');
  }

  log('error', arguments, 'red');
  process.exit(1);
};

exports.fatalWithMessages = function(err, messages){
    log('error', err, 'red');
    messages.forEach(function (msg) {
        log('error', msg, 'red', space + '    × ');
    });
    process.exit(1);
};

function log(type, args, color, prefixWith){
  if(typeof args === 'string'){
      args = [args];
  }

  pad();
  var msg = format.apply(format, args);
  if (color) msg = chalk[color](msg);
  var pre = prefixWith || prefix();
  console[type](pre, msg);
}

function prefix(){
  var pre = logged ? space : chalk.white('  dploybot ');
  logged = true;
  return pre + chalk.white('→');
}

function pad(){
  if (padded) return;
  console.log();
  process.on('exit', function(){ console.log(); });
  padded = true;
}
