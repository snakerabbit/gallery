var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var http = require('http');
require('dotenv').config()
var app = express();
var router = express.Router();
var port = process.env.PORT || 3001;
mongoose.connect(process.env.MONGODB_URI || 'mongodb://user:password@ds243059.mlab.com:43059/eventgallery');
var Post = require('./model/posts');
var Event = require('./model/events');
//************************ REACT SERVE *************************************

var path = require("path");
app.use(express.static(path.join(__dirname, "client", "build")));

//************************ TWITTER CLIENT SETUP     ************************
var config = {
    "consumerKey": process.env.CONSUMER_KEY,
    "consumerSecret": process.env.CONSUMER_SECRET,
    "accessToken": process.env.ACCESS_TOKEN,
    "accessTokenSecret": process.env.ACCESS_TOKEN_SECRET
};
var Twitter = require('twitter-node-client').Twitter;
var twitter = new Twitter(config);


//************************WEB SOCKET IMPLEMENTATION ************************

var WebSocketServer = require('ws').Server;
var server = http.createServer(app);
var wss = new WebSocketServer({server: app, port: 40510});
let posts;
let currentEvent;
var error = function (err, response, body) {
    console.log(err);
};


function savePost(post, event_id){
  var twitterPost = post;
  Post.find({tweet_id: twitterPost.id}, function(err, post){
    if(post.length === 0){
      console.log('new post created');
      let newPost = new Post();
      newPost.user = twitterPost.user.name;
      newPost.tweet_id = twitterPost.id;
      newPost.created_at = twitterPost.created_at;
      newPost.media_url = twitterPost.entities.media[0].media_url;
      newPost.tweet_url = `https://twitter.com/${twitterPost.user.screen_name}/status/${twitterPost.id_str}`;
      newPost.event_id = event_id;
      newPost.profile_pic_url = twitterPost.user.profile_image_url;
      newPost.save(error);
    }
  })
}

wss.on('connection', function(ws) {
  //find event just created
  console.log('connected');
  ws.send('server connected');
  ws.on('message', function (message){
    //find current event
    Event.findOne({_id: currentEvent._id}, function(err, event){
      if(err){
        console.log('not found');
      }
      //search twitter using event's hashtag
      var twitterQuery = {'q':`#${event.hashtag}`,
                          'count': 10,
                          'filter':'images',
                          'include_entities':true
                          };
      twitter.getSearch(twitterQuery, error, function(data){
        let statuses = JSON.parse(data).statuses;
        posts = statuses.filter(status => status.entities.media);
        if(posts){
          posts.forEach(currentPost =>{
            savePost(currentPost,currentEvent._id )
            });
        }


        });
        Post.find({event_id: event._id}, function(err, foundposts){
          console.log(foundposts);
          if(err){
            console.log(err);
          }
          event.posts = foundposts;
            event.save(error);
            ws.send(JSON.stringify(event));
        });
      });



  })

});

//************************ ROUTES ************************




app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(function(req, res, next) {
 res.setHeader('Access-Control-Allow-Origin', '*');
 res.setHeader('Access-Control-Allow-Credentials', 'true');
 res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT,DELETE');
 res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers');
 res.setHeader('Cache-Control', 'no-cache');
 next();
});


router.get('/', function(req, res) {
  res.json({message: 'API initialized'});
});


router.route('/events')
.get(function(req, res) {
  Event.find(function(err, events){
      res.json(events);
  })

})
.post(function(req, res){
  let newEvent = new Event();
  newEvent.name = req.body.event.name;
  newEvent.hashtag = req.body.event.hashtag;
  newEvent.save(function(err, event) {
    if (err){
            res.send(err);
    }
    currentEvent = newEvent;
    res.json(event);
  });
});

router.route('/events/:event_id')
  .get(function(req, res){
    Event.findOne({_id: req.params.event_id}, function(err, event){
      if(err){
        console.log(err);
      }
      console.log(event);
      currentEvent = event;
      console.log('currentEvent', currentEvent);
      res.json(event)
    })
  });

app.use('/api', router);

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "./client", "build", "index.html"));
});


app.listen(port, function() {
  console.log(`api running on port ${port}`);
});
