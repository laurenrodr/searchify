/**
 * This is a modification of Spotify's example of a basic node.js script
 * that performs the Implicit Grant Authentication to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */
var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var querystring = require('querystring');
var app = express();

app.use(express.static(__dirname + '/public'));
console.log('Listening on 8888');
app.listen(8888);
