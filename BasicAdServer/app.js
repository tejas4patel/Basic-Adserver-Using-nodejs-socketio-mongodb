var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')
  , Db = require('mongodb').Db
  , Connection = require('mongodb').Connection
  , Server = require('mongodb').Server
  , format = require('util').format
  , host = 'localhost'
  , port = Connection.DEFAULT_PORT;
app.listen(8080);

function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }
    res.writeHead(200);
    res.end(data);
  });
}
io.sockets.on('connection', function (socket) {
	socket.on('profile', function (profiledata) {
		var region = profiledata[0], 
    state = profiledata[1], 
    city = profiledata[2], 
    gender = profiledata[3], 
    age = Number(profiledata[4]), 
		maritalstatus = profiledata[5], 
    children = profiledata[6], 
    intent = profiledata[7], 
    intrest = profiledata[8];
		Db.connect(format("mongodb://%s:%s/ads", host, port), function(err, db) {
		var collection = db.collection('adlookup');
        collection.find({'agelow':{'$lte':age},'agehigh':{'$gte':age}, $or: [{'region':region}, {'region':'all'}],  $or: [{'state':state}, {'state':'all'}],$or: [{'city':city}, {'city':'all'}] , $or: [{'gender':gender}, {'gender':'all'}],  $or: [{'maritalstatus' :maritalstatus}, {'maritalstatus':'all'}],$or: [{'children' :children}, {'children':'all'}], $or: [{ 'intent' : intent }, { 'intrest' : intrest },{ 'intent' : 'all' },{ 'intrest' : 'all' }]}, 
		      {ad: 1, _id:0}).sort({rank: 1}).limit(1).each(function(err, doc) {
          if(doc != null){
		        socket.emit('ad',JSON.stringify(doc));
          };
          db.close();
        });
     }); 	
   });  
});
