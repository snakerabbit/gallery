import React, { Component } from 'react';
import { Route } from 'react-router-dom';
import './App.css';
import EventFormContainer from './event_form_container';
import GalleryContainer from './gallery_container';

class App extends Component {
  render() {
    return (
      <div className="App">
          <Route exact path='/' component ={EventFormContainer}/>
          <Route path='/api/events/:event_id' component={GalleryContainer}/>
      </div>
    );
  }
}

export default App;
