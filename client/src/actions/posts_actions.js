import * as PostApiUtil from '../utils/post_utils';
export const RECEIVE_POSTS = "RECEIVE_POSTS";

const receivePosts = posts => {
  return {
    type: RECEIVE_POSTS,
    posts
  };
};

export const fetchPosts = () => dispatch => (
  PostApiUtil.fetchPosts()
                 .then(posts => dispatch(receivePosts(posts)))
);
