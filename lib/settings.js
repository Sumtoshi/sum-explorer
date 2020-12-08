/**
* The Settings Module reads the settings out of settings.json and provides
* this information to the other modules
*/

var fs = require("fs");
var jsonminify = require("jsonminify");


//The app title, visible e.g. in the browser window
exports.title = "blockchain";

//The url it will be accessed from
exports.address = "explorer.example.com";

// logo
exports.logo = "/images/logo.png";
exports.headerlogo = false;


//The app favicon fully specified url, visible e.g. in the browser window
exports.favicon = "favicon.ico";

//Theme
exports.theme = "Cyborg";

//The Port ep-lite should listen to
exports.port = process.env.PORT || 3001;


//coin symbol, visible e.g. MAX, LTC, HVC
exports.symbol = "SUM";


//coin name, visible e.g. in the browser window
exports.coin = "Sumcoin";


//This setting is passed to MongoDB to set up the database
exports.dbsettings = {
  "user": "iquidus",
  "password": "3xp!0reR",
  "database": "blockchaindb",
  "address" : "localhost",
  "port" : 27017
};


//This setting is passed to the wallet
exports.wallet = { "host" : "127.0.0.1",
  "port" : 8669,
  "username" : "sumcoinrpc",
  "password" : "password"
};


//Locale file
exports.locale = "locale/en.json",


//Menu items to display
exports.display = {
  "api": true,
  "market": true,
  "twitter": true,
  "facebook": false,
  "googleplus": false,
  "youtube": false,
  "search": true,
  "richlist": true,
  "movement": true,
  "network": true,
  "navbar_dark": false,
  "navbar_light": false
};


//API view
exports.api = {
  "blockindex": 1337,
  "blockhash": "d2397272382205afe20d2b34d9d66340aa79bf2b1b413d0d5000b728ed07b094",
  "txhash": "2f42a95ea168bb6c6c7ad068e06034e0e12993ad8d6565e60529a0a1e230ae0a",
  "address": "SfAP5scg5JFq8ZgEYbt9uPn55rqWgk7uz3",
};

// markets
exports.markets = {
  "coin": "SUM",
  "exchange": "SUM",
  "enabled": ['bittrex'],
  "default": "bittrex"
};

// richlist/top100 settings
exports.richlist = {
  "distribution": true,
  "received": true,
  "balance": true
};

exports.movement = {
  "min_amount": 100,
  "low_flag": 1000,
  "high_flag": 10000
},

//index
exports.index = {
  "show_hashrate": false,
  "show_market_cap": false,
  "show_market_cap_over_price": false,
  "difficulty": "POW",
  "last_txs": 100,
  "txs_per_page": 10
};

// twitter
exports.twitter = "sumcoinindex";
exports.facebook = "sumcoinindex";
//exports.googleplus = "yourgooglepluspage";
exports.youtube = "sumcoinindex";

exports.confirmations = 6;

//timeouts
exports.update_timeout = 125;
exports.check_timeout = 250;
exports.block_parallel_tasks = 1;


//genesis
exports.genesis_tx = "b82fb0f59328af96928f3a7648461f3db41fbfc2fef4e5ec6f7cf78ca067eacc";
exports.genesis_block = "37d4696c5072cd012f3b7c651e5ce56a1383577e4edacc2d289ec9b25eebfd5e";

exports.use_rpc = true;
exports.heavy = false;
exports.lock_during_index = false;
exports.txcount = 100;
exports.txcount_per_page = 50;
exports.show_sent_received = true;
exports.supply = "COINBASE";
exports.nethash = "getnetworkhashps";
exports.nethash_units = "G";

exports.labels = {};

exports.reloadSettings = function reloadSettings() {
  // Discover where the settings file lives
  var settingsFilename = "settings.json";
  settingsFilename = "./" + settingsFilename;

  var settingsStr;
  try{
    //read the settings sync
    settingsStr = fs.readFileSync(settingsFilename).toString();
  } catch(e){
    console.warn('No settings file found. Continuing using defaults!');
  }

  // try to parse the settings
  var settings;
  try {
    if(settingsStr) {
      settingsStr = jsonminify(settingsStr).replace(",]","]").replace(",}","}");
      settings = JSON.parse(settingsStr);
    }
  }catch(e){
    console.error('There was an error processing your settings.json file: '+e.message);
    process.exit(1);
  }

  //loop trough the settings
  for(var i in settings)
  {
    //test if the setting start with a low character
    if(i.charAt(0).search("[a-z]") !== 0)
    {
      console.warn("Settings should start with a low character: '" + i + "'");
    }

    //we know this setting, so we overwrite it
    if(exports[i] !== undefined)
    {
      // 1.6.2 -> 1.7.X we switched to a new coin RPC with different auth methods
      // This check uses old .user and .pass config strings if they exist, and .username, .password don't.
      if (i == 'wallet')
      {
        if (!settings.wallet.hasOwnProperty('username') && settings.wallet.hasOwnProperty('user'))
        {
          settings.wallet.username = settings.wallet.user;
        }
        if (!settings.wallet.hasOwnProperty('password') && settings.wallet.hasOwnProperty('pass'))
        {
          settings.wallet.password = settings.wallet.pass;
        }
      }
      exports[i] = settings[i];
    }
    //this setting is unkown, output a warning and throw it away
    else
    {
      console.warn("Unknown Setting: '" + i + "'. This setting doesn't exist or it was removed");
    }
  }

};

// initially load settings
exports.reloadSettings();
