import { connect } from 'react-redux';
import Gallery from './gallery';
import { fetchEvent, fetchMetaData, setWebSocket } from '../actions/events_actions';


const mapStateToProps = state => {
  return({
    event: state.event,
    metadata: state.metadata
  });
};


const mapDispatchToProps = dispatch => {
  return({
    fetchEvent: (id) => dispatch(fetchEvent(id)),
    fetchMetaData: (id) => dispatch(fetchMetaData(id)),
    setWebSocket: (id) => dispatch(setWebSocket(id))
  });
};


export default connect(mapStateToProps, mapDispatchToProps)(Gallery);
