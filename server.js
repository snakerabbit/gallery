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
  searchTwitter(newEvent);
  Post.find({event_id: newEvent._id}, function(err, foundposts){
    if(err){
      console.log(err);
    }
    newEvent.posts = foundposts;
  });

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


var server = app.listen(port, function() {
  console.log(`api running on port ${port}`);
});
//************************WEB SOCKET IMPLEMENTATION ************************

var WebSocketServer = require('ws').Server;

var wss = new WebSocketServer({server: server});
let posts;
let currentEvent;
var error = function (err, response, body) {
    console.log(err);
};
//
// function savePost(post, event_id){
//   var twitterPost = post;
//
// }

function searchTwitter(event){
  var twitterQuery = {'q':`#${event.hashtag}`,
                      'count': 10,
                      'filter':'images',
                      'include_entities':true
                      };
  twitter.getSearch(twitterQuery, error, function(data){
    let statuses = JSON.parse(data).statuses;
    posts = statuses.filter(status => status.entities.media);
    if(posts){
      posts.map(currentPost =>{
        Post.find({tweet_id: currentPost.id}, function(err, post){
          if(post.length === 0){
            let newPost = new Post();
            newPost.user = currentPost.user.name;
            newPost.tweet_id = currentPost.id;
            newPost.created_at = currentPost.created_at;
            newPost.media_url = currentPost.entities.media[0].media_url;
            newPost.tweet_url = `https://twitter.com/${currentPost.user.screen_name}/status/${currentPost.id_str}`;
            newPost.event_id = event._id;
            newPost.profile_pic_url = currentPost.user.profile_image_url;
            newPost.save(error);
            return newPost;
          }

        })
        });
    }
    console.log('searchTwitter posts', posts);
})
}

wss.on('connection', function(ws) {
  //find event just created
  console.log('connected');
  ws.send('server connected');
  ws.on('message', function (message){
    //find current event
    Event.findOne({_id: JSON.parse(message)}, function(err, event){
      if(err){
        console.log('not found');
      }
      searchTwitter(event);
        Post.find({event_id: event._id}, function(err, foundposts){
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
