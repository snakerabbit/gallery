var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
require('dotenv').config()
var app = express();
var router = express.Router();
var port = process.env.API_PORT || 3001;
mongoose.connect(process.env.MONGODB_URI || 'mongodb://user:password@ds243059.mlab.com:43059/eventgallery');
var Post = require('./model/posts');
var Event = require('./model/events');
//************************ REACT SERVE *************************************

var path = require("path");
app.use(express.static(path.join(__dirname, "client", "public")));

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
var wss = new WebSocketServer({port: 40510});
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


  // twitter.getSearch({'q':`#${dbEvent.hashtag}`,'count': 10, 'filter':'images', 'include_entities':true}, error, function success(data){
  //30 requests per minute == 1 request every 2 seconds maximum
  //https://developer.twitter.com/en/docs/basics/rate-limits.html;



//     let currentEvent= JSON.parse(event);
//     if(!clients[currentEvent._id]){
//       clients[currentEvent._id] = ws;
//     }
//     Event.findOne({_id: currentEvent._id}, function(err, event){
//       if(err){
//         console.log('didnt find event');
//       }
//       let dbEvent = event;
//       setInterval(function(){
//           twitter.getSearch({'q':`#${dbEvent.hashtag}`,'count': 10, 'filter':'images', 'include_entities':true}, error, function success(data){
//             let parsed = JSON.parse(data);
//             let statuses = parsed.statuses;
//             posts = statuses.filter(status => status.entities.media);
//             console.log(posts);
//             posts.forEach(post =>{
//               Post.findOne({tweet_id: post.id_str}, function(error, foundpost){
//                 if(foundpost){
//                   posts = posts.filter(otherpost => otherpost.id_str !== post.id_str);
//                   Post.remove({tweet_id: post.id});
//                 }
//                 let newPost = new Post();
//                 newPost.user = post.user.name;
//                 newPost.tweet_id = post.id_str;
//                 newPost.tweet_url = `https://twitter.com/${post.user.screen_name}/status/${post.id_str}`;
//                 newPost.created_at = post.created_at;
//                 newPost.media_url = post.entities.media[0].media_url;
//                 newPost.event_id = dbEvent.id;
//                 newPost.profile_pic_url = post.user.profile_image_url;
//                 newPost.save(function(err) {
//                   if (err){
//                     console.log(err);
//                   }
//                 });
//                   dbEvent.posts.unshift(newPost);
//
//               })
//
//               if(dbEvent.posts.length > 20){
//                 dbEvent.posts.shift();
//               }
//           });
//           dbEvent.save(function(err, ev){
//             ws.send(JSON.stringify(dbEvent));
//           });
//
//       });
//     }, 3000);
//   });
//
// })
//
// });


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
    res.sendFile(path.join(__dirname, "./client", "public", "index.html"));
});


app.listen(port, function() {
  console.log(`api running on port ${port}`);
});
