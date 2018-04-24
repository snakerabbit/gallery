import { connect } from 'react-redux';
import EventForm from './event_form';
import { createEvent, fetchEvents, fetchEvent } from '../actions/events_actions';


const mapStateToProps = state => {
  return({
    events: state.events,
    event: state.event
  });
};


const mapDispatchToProps = dispatch => {
  return({
    createEvent: (event) => dispatch(createEvent(event)),
    fetchEvents: () => dispatch(fetchEvents()),
    fetchEvent: id => dispatch(fetchEvent(id))
  });
};


export default connect(mapStateToProps, mapDispatchToProps)(EventForm);
