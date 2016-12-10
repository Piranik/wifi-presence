var ClientList = require('./wifi_clients');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var client_list = new ClientList({
  socket: io
});


app.get('/', function(req, res) {
  res.sendFile(__dirname + '/www/src/index.html');
});

app.get('/wificlients', function(req, res) {
  client_list.urlHandler(req, res);
});

io.on('connection', function(socket) {
  console.log('socket connection was made');
  io.emit('wifi_clients', {currentClients: client_list.clientList });
});

client_list.on('ready', function() {
  http.listen(3000, ()=> console.log('app is listening'));
});

client_list.on('has_entered', function(e) {
  console.log(e.user + " has entered");
})

client_list.on('watchedUser', function(e) {
  console.log(e.user + ' has connected');
})
