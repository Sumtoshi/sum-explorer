Iquidus Explorer - 1.7.4 - for Sumcoin/Bitcoin based protocol
================

An open source block explorer written in node.js.

### See it in action

*  [List of live explorers running Iquidus](https://github.com/iquidus/explorer/wiki/Live-Explorers)


*Note: If you would like your instance mentioned here contact me*

### Requirements

### Install Guide: https://github.com/Sumtoshi/sum-explorer/blob/master/requirements.md

*  Droplet Server of at least the Blockchains size in SSD & 4GB of Ram
*  OS of Ubuntu 16.04 or 18.04
*  node.js >= 8.17.0 (12.14.0 is advised for updated dependencies)
*  mongodb 4.2.x
*  sumcoind, bitcoind etc with v0.16 +

### Create Mongodb database

Enter MongoDB cli:

    $ mongo

Create databse:

    > use explorerdb

Create user with read/write access: (CHANGE the Usernames and Passwords, dont't just copy and paste the example)

    > db.createUser( { user: user: "iquidus", pwd: "3xp!0reR", roles: [ "readWrite" ] } )

*Note: If you're using mongo shell 4.2.x, use the following to create your user:

    > db.addUser( { user: user: "iquidus", pwd: "3xp!0reR", roles: [ "readWrite"] })

### Get the explorer source code 

    git clone https://github.com/Sumtoshi/sum-explorer.git

### Install the node modules

    cd explorer && npm install --production

### Configure

    cp ./settings.json.template ./settings.json

*Make required changes for your scenario in settings.json*

### Configure Node and Start sumcoind

Iquidus based Explorers are intended to be generic, so it can be used with any wallet following the usual standards. The wallet must be running with atleast the following flags

    -daemon -txindex

It is recommended you include these flags in your coins .conf
Minimum Example for Sumcoin:
    
    server=1
    daemon=1
    txindex=1
    rpcuser=Secure_User_Name
    rpcpassword=Secure_Password
    rpcport=3332
    rpcallowip=127.0.0.1
    
### Security

Ensure mongodb is not exposed to the outside world via your mongo config or a firewall to prevent outside tampering of the indexed chain data. 

### Start Explorer

Create TMUX Session to reduce memory constraints & ensure smooth usage. (Example name 'explorer')

    tmux new -s explorer

    npm start

Exit tmux using control+b & d

Reenter tmux session later with:

    tmux a -t explorer
  
### Stop Explorer  

Enter the tmux session as shown above and stop the session with:

    control+c
To stop the cluster you can also use
    
    npm stop
Exit tmux using 
    
    control+b & d    

## *Note: mongod must be running before starting the explorer*

As of version 1.4.0 the explorer defaults to cluster mode, forking an instance of its process to each cpu core. This results in increased performance and stability. Load balancing gets automatically taken care of and any instances that for some reason die, will be restarted automatically. For testing/development (or if you just wish to) a single instance can be launched with

    node --stack-size=10000 bin/instance


### Syncing databases with the blockchain

### Method 1
Create TMUX Session to reduce memory constraints & ensure smooth usage. (Example name 'sync')

    tmux new -s sync

    node scripts/sync.js index update
    
You will see the process start to populate the mongodb tx history (this will take a long time, several days depending on your server specs)

    1: 2419e91a99db41ba2842c5ffd843049b5424250e659c8e984583b4796eaa6ec7
    2: 77a86c65cbbdfa3f576126bcb696940b581d570bda495085f471e3722c707cc7
    3: 5712f2b221820c5344262f56c2f937bd245177a17427233181cfed433a5f23da
    4: 75b014e9acd45051c886975473bb7e043b19c5407eb832fd0c0918b1882727da
    5: d83eca3ee7c317bdfa78ed349b7cfad233798243c4e5acd84ec6978aabd680dd
    6: e5de12d039b27b7851d5c8db456847fe560b6eb5a7b744ffa9f64c4178ad9bdd
    7: 7a533650381a2bd1c019528d6149643c86c5d2fa2e49996bebf6597e39b075ea
    8: 689a928f2f4d037824b2158d11d4104b5781e7a243a129962fd6d009f7eed3eb
    9: 1bf29e1bcc4e49da0b4b06425d0fad06259cc821996f125d50cc1a84c1568cec
    10: 3feaadd84728265473fe3521529c5b484b5202bf6fd936a9060ead31c31854f1

### Method 2 - use cronjob (less reliable on initial sync) 
sync.js (located in scripts/) is used for updating the local databases. This script must be called from the explorers root directory.

    Usage: node scripts/sync.js [database] [mode]

    database: (required)
    index [mode] Main index: coin info/stats, transactions & addresses
    market       Market data: summaries, orderbooks, trade history & chartdata

    mode: (required for index database only)
    update       Updates index from last sync to current block
    check        checks index for (and adds) any missing transactions/addresses
    reindex      Clears index then resyncs from genesis to current block

    notes:
    * 'current block' is the latest created block when script is executed.
    * The market database only supports (& defaults to) reindex mode.
    * If check mode finds missing data(ignoring new data since last sync),
      index_timeout in settings.json is set too low.


*It is recommended to have this script launched via a cronjob at 1+ min intervals.*

**crontab** *Note, Markets.js is not required for Sumcoin since it pulls rate updates from the Index source.

*Example crontab; update index every minute and market data every 2 minutes*

    */1 * * * * cd /path/to/explorer && /usr/bin/nodejs scripts/sync.js index update > /dev/null 2>&1
    #*/2 * * * * cd /path/to/explorer && /usr/bin/nodejs scripts/sync.js market > /dev/null 2>&1
    */5 * * * * cd /path/to/explorer && /usr/bin/nodejs scripts/peers.js > /dev/null 2>&1


### Known Issues

**script is already running.**

If you receive this message when launching the sync script either a) a sync is currently in progress, or b) a previous sync was killed before it completed. If you are certian a sync is not in progress remove the index.pid and db_index.pid from the tmp folder in the explorer root directory.

    rm tmp/index.pid
    rm tmp/db_index.pid

**exceeding stack size**

    RangeError: Maximum call stack size exceeded

Nodes default stack size may be too small to index addresses with many tx's. If you experience the above error while running sync.js the stack size needs to be increased.

To determine the default setting run

    node --v8-options | grep -B0 -A1 stack_size

To run sync.js with a larger stack size launch with

    node --stack-size=[SIZE] scripts/sync.js index update

Where [SIZE] is an integer higher than the default.

*note: SIZE will depend on which blockchain you are using, you may need to play around a bit to find an optimal setting*

### License

Copyright (c) 2015, Iquidus Technology  
Copyright (c) 2015, Luke Williams
Copyright (c) 2016, Sumtoshi
Copyright (c) 2018, Sumcoin Index
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name of Iquidus Technology nor the names of its
  contributors may be used to endorse or promote products derived from
  this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
