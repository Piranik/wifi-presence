const EventEmitter = require('events').EventEmitter;
const http = require('http');
const mongo = require('mongodb');
const assert = require('assert');

class Client {

  constructor(mac) {
    this.mac = mac.toLowerCase();
  }

  getVendor() {
    var self = this;
    return new Promise(function(fulfill, reject) {

      http.get('http://api.macvendors.com/' + self.mac, function(res) {
        var output = '';
        res.on('data', function(chunk) {
            output += chunk;
        });

        res.on('end', function() {
          self.vendor = output;
          fulfill(self);
        });

        res.on('error', function(e) {
          reject(e.message);
        });
      })

    });
  }
}

class ClientList extends EventEmitter {

  // socket should be optional,
  // if there is one it should be used to emit events to the
  // web frontend

  // macs should be an array or a string, optional
  constructor(settings) {
    super();
    this.socket = settings.socket;
    this.current_clients = [];
    this.vendor_promises = [];
    this.watched_users = [];

    var self = this;
    mongo.connect('mongodb://localhost:27017/presence', function(err, db) {
      assert.equal(null, err);

      var cursor = db.collection('users').find();
      cursor.each(function(err, doc) {
        assert.equal(null, err);
        if (doc != null) {
          self.watched_users.push(doc);
        }
      });
      self.emit('ready');
    });
  }

  // take a single mac address, returns User if the mac is registered, false if not
  isWatchedUser(mac) {
    for (var i in this.watched_users) {
      var watchedUserMacs = this.watched_users[i].macs;
      for (var i in watchedUserMacs) {
        if (watchedUserMacs[i] == mac) {
          return this.watched_users[i];
        }
      }
      return false;
    }
  }

  urlHandler(req, res) {
    console.log(req.url);
    var report = {
      connected_clients: this.current_clients,
      watched_users: this.watched_users
    };

  try {
    var clients = req.query.clients.trim().split(' ');
    this.addClients(clients);

    Promise.all(this.vendor_promises).then((clients)=> {
      if (this.socket) {
        this.socket.emit('wifi_clients', report);
      }
      res.json(report);
    });
  } catch (err) { res.json(report) }
}

  // clients is an array op mac addresses (string)
  addClients(clients) {
    this.current_clients = [];
    console.log('clients to be added: ', clients);
    for (var i in clients) {
      if (clients[i] == '') { continue; };
      var client = new Client(clients[i]);
      this.current_clients.push(client);
      this.vendor_promises.push(client.getVendor());
    }
    console.log(this.current_clients);
  }

  getClient(mac) {
    for (i in this.clientList) {
      if (mac == this.clientList[i].mac) {
        return this.clientList[i].mac;
      }
    }
  }
}

module.exports = ClientList;
