import { RECEIVE_EVENTS, RECEIVE_EVENT, RECEIVE_METADATA} from '../actions/events_actions';
import merge from 'lodash/merge';


const EventsReducer = (state = {}, action) => {
  Object.freeze(state);
  switch (action.type) {
    case RECEIVE_EVENTS:
      let eventsState = merge({}, state);
      return merge(eventsState, {events: action.events});
    case RECEIVE_EVENT:
      let newState = merge({}, state);
      return merge(newState, {event: action.event});
    case RECEIVE_METADATA:
      let thisState = merge({}, state);
      return merge(thisState, {metadata: action.metadata});
    default:
      return state;
  }
};

export default EventsReducer;
