class pp2p {
  constructor(server, id) {
    this.server = server;
    this.id = id;
    this.peer = new Peer();
  }
  
  async getURL(url) {
    var response = await fetch(url).then((r)=>{return r.text()});
    console.log(response);
    return response;
  }
  
  async postURL(url, headers, jsoncontent) {
    var response = await fetch("https://fcosma.it/ip", {
      method: 'POST',
      headers: headers,
      body: jsoncontent
    }).then((r)=>{return r.text()})
      return response;
  }
  
  ping() {
    const start = Date.now();
    var res = this.getURL(this.server);
    const end = Date.now()
    return (end - start);
  }
  
  log(type, message) {
    if (type == 1) {
      var h = "[#INFO]";
    } else if (type == 2) {
      var h = "[#ERROR]";
    } else {
      var h = "[#UNDEFINED-ERROR]";
    }
    
    window.console.log("[PP2P.js]" + type + " >> " + message);
  }
 
  connect(peer) {
    this.connection = peer.connect(this.id);
    this.connection.on('open', function() {
      this.connection.send({"scope":"pp2p", "do":"connection" "content":"NIL"});
    });
    this.connection.on('data', function(data) {
      if (JSON.parse(data).scope == "pp2p" && JSON.parse(data).do == "connection" && JSON.parse(data).content == "DONE") {
        this.log(1, 'Connection enstabilished, now declaring dominant server!');
        this.validateConnection();
      } else {
        this.connection = false;
        return false;
      }
    });  
  } 
  
  validateConnection() {
    if (!this.connection) {
      this.log(2, 'This..connection is NUL / FALSE');
      return;
    }
    
    this.connection.send({"scope":"pp2p", "do":"ping", "content":"ConnectionEnstabilished"});
    this.log(1, "PingScope (PP2P) message P2P sent, awaiting response from upstream");
    this.connection.on('data', function(data) {
      if (JSON.parse(data).scope == "pp2p" && JSON.parse(data).do == "pingResponse") {
        this.log(1, 'Response received, analyzing content');
        var localPing = this.ping();
        
        if (JSON.parse(data).content > localPing) {
          this.dominant = false;
          this.connection.send({"scope":"pp2p", "do":"dominant", "content":true});
          this.log(1, 'Not dominant, send to 2nd client a dominant confirm');
        } else {
          this.dominant = true;
          this.connection.send({"scope":"pp2p", "do":"dominant", "content":false});
          this.log(1, 'Dominant, send to 2nd client a not-dominant confirm');
        }
        
        return this.connection;
      }
    });
  }
  
  this.peer.on('connection', function(connection) {
    this.connection = connection;
  });

  this.connection.on('data', function(data) {
    var get = JSON.parse(data);
    if (get.scope == "client") {
      CommonJS.makeEvent(document, 'clientData', {"detail":get.content});
    } else if (get.scope == "customServer") {
      if (get.content.type = "GET") {
        var response = this.getURL(get.content.url);
        this.connection.send({"scope":"response", "content":response});
      } else if (get.content.type = "POST") {
        var response = this.postURL(get.content.url, get.content.headers, get.content.body);
        this.connection.send({"scope":"response", "content":response});
      } else {
        this.log(2, 'Undefined requestType (customServer.type)');
      }
    } else if (get.scope == "response") {
      CommonJS.makeEvent(document, 'serverData', {"detail":get.content});
    } else if (get.scope == "pp2p" && get.do != undefined) {
      if (get.do == "ping") {
        var ping = this.ping();
        this.connection.send({"scope":"pp2p", "do":"pingResponse", "content":ping});
      } else if (get.do == "connection") {
        this.connection.send({"scope":"pp2p", "do":"connection", "content":"DONE");
                             
}
