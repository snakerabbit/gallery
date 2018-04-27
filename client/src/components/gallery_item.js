import React from 'react';
import twittericon from '../static/twittericon.png';
class GalleryItem extends React.Component {
  constructor(props){
    super(props)
    this.handleClick = this.handleClick.bind(this);
  }

  renderTime(){
    let time;
    let seconds = Math.floor((Date.now() - Date.parse(this.props.post.created_at))/1000);
    let minutes = Math.floor(seconds/60);
    let hours = Math.floor(minutes/60);
    if (seconds > 3600){
      return `${hours} hours ago`;
    }
    if(seconds > 60){
      return `${minutes} minutes ago`;
    }
    return `${seconds} seconds ago`;

  }

  handleClick(e){
    e.preventDefault();
    window.open(this.props.post.tweet_url);
  }

  render(){
    return(
      <div className='gallery-item'>
        <div className='overlay'>
          <div className='user-info'>
            <img className='profile-pic' src={this.props.post.profile_pic_url}/>
            <div className='user-info-text'>
              <div>{this.props.post.user}</div>
              <div>{this.renderTime()}</div>
            </div>
            <img style={{float: 'right', width:'10px', height:'10px'}} src={twittericon}/>
          </div>
          <div className='view-post' onClick={this.handleClick}>View Post</div>
        </div>
        <img className='post-img' src={this.props.post.media_url}/>
      </div>
    )
  }
}

export default GalleryItem;
