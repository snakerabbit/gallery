import { combineReducers} from 'redux';
import PostsReducer from './posts_reducer';
import EventsReducer from './events_reducer';

export default combineReducers({
  events: EventsReducer,
  posts: PostsReducer
});
