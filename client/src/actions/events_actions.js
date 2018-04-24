import * as EventsApiUtil from '../utils/event_utils';
export const RECEIVE_EVENTS  = "RECEIVE_EVENTS";
export const RECEIVE_EVENT = "RECEIVE_EVENT";
export const RECEIVE_METADATA = "RECEIVE_METADATA";

const receiveEvents = events => {
  return {
    type: RECEIVE_EVENTS,
    events
  };
};

const receiveEvent = event => {
  return {
    type: RECEIVE_EVENT,
    event
  };
};

const receiveMetaData = metadata => {
  return {
    type: RECEIVE_METADATA,
    metadata
  }
}


export const fetchEvents = () => dispatch => (
  EventsApiUtil.fetchEvents()
                 .then(events => dispatch(receiveEvents(events)))
);

export const fetchEvent = eventId => dispatch => (
  EventsApiUtil.fetchEvent(eventId)
                 .then(event => dispatch(receiveEvent(event)))
);

export const createEvent = newEvent => dispatch => (
  EventsApiUtil.createEvent(newEvent)
                 .then(event => dispatch(receiveEvent(event)))
);

export const updateEvent = event => dispatch =>(
  EventsApiUtil.updateEvent(event)
                 .then(updatedEvent => dispatch(receiveEvent(updatedEvent)))
);

export const setWebSocket = (id) => dispatch => {
  var HOST = window.location.origin.replace(/^http/, 'ws')
  console.log(HOST);
  var ws = new WebSocket(HOST);
  var ws2 = new WebSocket('ws://localhost:3001');
      setInterval(()=> {
        try{
                  ws.send('yay');
        }
        catch(err) {
                  ws2.send('yay');
        }
      }, 3000);

  ws.onmessage = function(){
        return dispatch(fetchEvent(id)).then(()=> dispatch(fetchMetaData(id)));
  }
  ws2.onmessage = function(){
        return dispatch(fetchEvent(id)).then(()=> dispatch(fetchMetaData(id)));
  }
}

export const fetchMetaData = id => dispatch => (
  EventsApiUtil.fetchEvent(id)
    .then(event => {
      let postsCount = event.posts.length;
      let users = event.posts.map(post => post.user) || [];
      let seen = new Set();
      let uniqueUsers=[];
      for(let i = 0; i< users.length; i++){
        if(!seen.has(users[i])){
          seen.add(users[i]);
          uniqueUsers.push(users[i])
        }
      }
      let userCount = uniqueUsers.length;
      return dispatch(receiveMetaData({
        postsCount: postsCount,
        userCount: userCount
      }))
    })
)
