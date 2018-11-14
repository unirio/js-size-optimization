@echo off
cd DFAHC

cd browserify
mkdir text-diff
fc /N HC\0.js HC\original.js > text-diff\tdiff-0.json

cd ..\d3-node
mkdir text-diff
fc /N HC\0.js HC\original.js > text-diff\tdiff-0.json

cd ..\decimal.js
mkdir text-diff
fc /N HC\0.js HC\original.js > text-diff\tdiff-0.json

cd ..\esprima
mkdir text-diff
fc /N HC\0.js HC\original.js > text-diff\tdiff-0.json

cd ..\exectimer
mkdir text-diff
fc /N HC\0.js HC\original.js > text-diff\tdiff-0.json

cd ..\express
mkdir text-diff
fc /N HC\0.js HC\original.js > text-diff\tdiff-0.json

cd ..\jquery
mkdir text-diff
fc /N HC\0.js HC\original.js > text-diff\tdiff-0.json

cd ..\lodash
mkdir text-diff
fc /N HC\0.js HC\original.js > text-diff\tdiff-0.json

cd ..\mathjs
mkdir text-diff
fc /N HC\0.js HC\original.js > text-diff\tdiff-0.json

cd ..\minimist
mkdir text-diff
fc /N HC\0.js HC\original.js > text-diff\tdiff-0.json

cd ..\moment
mkdir text-diff
fc /N HC\0.js HC\original.js > text-diff\tdiff-0.json

cd ..\node-semver
mkdir text-diff
fc /N HC\0.js HC\original.js > text-diff\tdiff-0.json

cd ..\plivo-node
mkdir text-diff
fc /N HC\0.js HC\original.js > text-diff\tdiff-0.json

cd ..\pug
mkdir text-diff
fc /N HC\0.js HC\original.js > text-diff\tdiff-0.json

cd ..\tleaf
mkdir text-diff
fc /N HC\0.js HC\original.js > text-diff\tdiff-0.json

cd ..\UglifyJS2
mkdir text-diff
fc /N HC\0.js HC\original.js > text-diff\tdiff-0.json

cd ..\underscore
mkdir text-diff
fc /N HC\0.js HC\original.js > text-diff\tdiff-0.json

cd ..\uuid
mkdir text-diff
fc /N HC\0.js HC\original.js > text-diff\tdiff-0.json

cd ..\xml2js
mkdir text-diff
fc /N HC\0.js HC\original.js > text-diff\tdiff-0.json
