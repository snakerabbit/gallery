import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import logger from 'redux-logger';
import EventsReducer from '../reducers/events_reducer';

const configureStore = (preloadedState = {}) =>(
  createStore(
    EventsReducer,
    preloadedState,
    applyMiddleware(thunk, logger)
  )
);

export default configureStore;
