var express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server);
	usernames = [];

server.listen(process.env.PORT || 3000);
console.log("App is running at localhost:3000")

// go to /, it will load index.html
app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

// connect to the socket
io.sockets.on('connection', function(socket){
	console.log('socket connected');

	//user login
	socket.on('new user', function(data, callback){
		if(usernames.indexOf(data) != -1){
			callback(false);
		} else {
			callback(true);
			socket.username = data;
			usernames.push(socket.username);
			updateUsernames();
		}
	});

	// Update usernames
	function updateUsernames(){
		io.sockets.emit('usernames', usernames);
	}


	// create socket to detect event 'send message' from client
	// whenever it provoke, emit the 'new message' with
	// message data and return it back to client
	socket.on('send message', function(data){
		io.sockets.emit('new message', {msg: data, user: socket.username});
	});

	//disconnect event
	socket.on('disconnect', function(data){
		if(!socket.username){
			return;
		}

		usernames.splice(usernames.indexOf(socket.username), 1);
		updateUsernames();
	});	
});