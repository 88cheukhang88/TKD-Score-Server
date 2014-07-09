##IN DEVLEOPMENT - NOT READY YET

TKD-Score-Server
================
Build Status: [![Codeship Status for MickCrozier/TKD-Score-Server](https://codeship.io/projects/88ab60a0-e98e-0131-eba0-368dc75eab9e/status)](https://codeship.io/projects/26201)


Part of TKD Score
A Web based Taekwondo scoring system using node and angular

This is an experiment in using Express, Mongo and Socket.io to create a real time match scoring server.


Dependancies and setup
======
**Node and npm** (download from node website)

**Grunt-cli**
```shell
npm install -g grunt-cli
```


Install dependencies
```shell
cd projectDir
npm install
```


Start the server
```shell
grunt serve
or
node app.js
```


Environment variables
======
There is no need to set these for development or testing. The defaults are fine


TKD_ENV = 'production' || 'staging' ||  'testing' (auto set for tests) ||  'development' (default)

TKD_PORT = 3000 (default)


### Setting environment variables
Nix and Mac
```shell
export TKD_ENV=production
```

Windows command prompt
```cmd
set TKD_ENV="production"
```

Windows Powershell
```powershell
$env:TKD_ENV="production"
```



Testing
======

Unit and Integration tests
```shell
grunt test
```

### Options
**--watch** watches for changed files and re-runs tests automatically


Integration tests require a mongodb server to running


License
======
MIT License
Copyright 2014 Mick Crozier

