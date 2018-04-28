import React from 'react';
import GalleryItem from './gallery_item';

class Gallery extends React.Component {
  constructor(props){
    super(props);

    this.state={
      text:'',
      posts:[],
      filteredPosts:[]
    }
    this.renderPosts = this.renderPosts.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleUndo = this.handleUndo.bind(this);
    this.renderUndo = this.renderUndo.bind(this);
  }

  componentDidMount(){
    let id = this.props.match.params.event_id;
    this.props.fetchEvent(id).then(()=>{
      this.setState({
        posts:this.props.event.posts
      })
    });
    this.props.fetchMetaData(id);
    this.props.setWebSocket(id);
    }

    handleChange(e){
      e.preventDefault();
      this.setState({
        text: e.target.value
      });
    }

    handleSubmit(e){
      e.preventDefault();
      this.setState({
        filteredPosts: this.state.posts.filter(post => {
          return post.user === this.state.text
        }),
        text:''
      })
    }

    handleUndo(){
      this.setState({
        filteredPosts:[],
      })
    }

    renderUndo(){
      if(this.state.filteredPosts.length){
        return(
          <div onClick ={this.handleUndo}>
            Undo Search Filter
          </div>
        )
      }
    }
  renderPosts(){
    if(this.props.event.posts.length === 0){
      return(
        <div>Looking for Posts...Please Wait!</div>
      )
    }
    else if (this.state.filteredPosts.length){
      return(
        <div className ='posts'>
          {this.state.filteredPosts.map(post =>{
            return(
              <div>
                    <GalleryItem post={post}/>
              </div>
            )
          })}
        </div>
      )
    }
    else {
      return(
        <div className ='posts'>
          {this.props.event.posts.map(post =>{
            return(
              <div>
                    <GalleryItem post={post}/>
              </div>
            )
          })}
        </div>
      )
    }

  }

  render(){
    if(this.props.event && this.props.metadata){
      return(
        <div className='gallery'>
          <h1 id='gallery-title'>{`${this.props.event.name}`}</h1>
          <div className='subheader'>
            <div className='metadata'>
              <p>{`#${this.props.event.hashtag}`}</p>
              <p style={{color:'lightgrey'}}>{`${this.props.metadata.postsCount} posts // ${this.props.metadata.userCount} users`}</p>
            </div>
            <form className='search-form' onSubmit={this.handleSubmit}>
              <input type='text' placeholder='Search' onChange={this.handleChange} value={this.state.text}/>
              <input style={{backgroundColor:'black', color:'white'}} type='submit' value='Search'/>
              <div>{this.renderUndo()}</div>
            </form>
            </div>
            {this.renderPosts()}
        </div>
      )
    } else{
      return(
        <div>
          loading
        </div>
      )
    }

  }
}

export default Gallery;
