import { RECEIVE_POSTS} from '../actions/posts_actions';

const PostsReducer = (state = {}, action) => {
  Object.freeze(state);
  switch (action.type) {
    case RECEIVE_POSTS:
      return {posts: action.posts};
    default:
      return state;
  }
};

export default PostsReducer;
