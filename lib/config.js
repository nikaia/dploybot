var fs = require("fs"),
    nconf = require('nconf'),
    path = require("path"),
    logger = require("./logger");

function homePath() {
    return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}

function configDir() {
  return path.resolve(homePath(), ".dploybot");
}

function configFile() {
  return path.resolve(configDir(), "config.json");
}

function configExists() {
    return fs.existsSync(configFile());
}

function checkAndGetConfigItem(configItem) {
  var value = nconf.get(configItem);
  if(!value){
    logger.fatal(configItem + " seems to not be specified in config.json file. Run `dploybot openconfig` to edit/open the file.");
    process.exit(1);
  }

  return value;
}

function createConfigFile() {
  var dir = configDir();
  var file = configFile(dir);

  // Quit if already created
  if (configExists()){
    logger.fatal("config.json file already exists in " + file);
    process.exit(1);
  }

  // Create directory if it does not exists
  if(!fs.existsSync(dir)){
    fs.mkdirSync(dir, 0700);
  }

  // Create file
  var template = {
    account: "",
    email: "",
    token: "",
  };

  fs.writeFileSync(file, JSON.stringify(template, null, 4));
  console.log("Blank configuration file saved to: " + file);
  console.log("Please replace required configuration items in this file.");
}

function get() {
  var dir = configDir();
  var file = configFile(dir);

  // Check existance
  if (!configExists()){
    logger.fatal("config.json file does not exists. First create one using `dploybot config`");
    process.exit(1);
  }

  nconf.file(file);

  return {
    account: checkAndGetConfigItem('account'),
    email: checkAndGetConfigItem('email'),
    token: checkAndGetConfigItem('token')
  };
}


/*
 |--------------------------------------------------------------------------
 | Exports
 |--------------------------------------------------------------------------
 */
exports.file = configFile;
exports.createConfigFile = createConfigFile;
exports.get = get;
