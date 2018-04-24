import React from 'react';
import { Redirect } from 'react-router-dom';
class EventForm extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      name:'',
      hashtag:'',
      redirect: false
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(field){
    return e => this.setState({
      [field]: e.target.value
    });
  }

  handleSubmit(e){
    e.preventDefault();
    const newEvent = {
      name:this.state.name,
      hashtag:this.state.hashtag
    };
    this.props.createEvent(newEvent).then(
      this.setState({
      name:'',
      hashtag:'',
      redirect: true
      }));

  }
  componentDidMount(){
    this.props.fetchEvents();
  }

  render(){
    if(this.state.redirect && this.props.event){
      return(
        <Redirect to={`/api/events/${this.props.event._id}`}/>
      )

    } else{
      return(
        <div className='event-form' >
          <form>
            <input type="text" className='button' onChange={this.handleChange('name')} placeholder="Event Name" value={this.state.name}></input>
            <input type="text" className='button' onChange={this.handleChange('hashtag')} placeholder="Hashtag" value={this.state.hashtag}></input>
            <div id='submit' className='button' onClick={this.handleSubmit}>Start Event</div>
          </form>
        </div>
      )
    }

  }
}

export default EventForm;
