var $ = require("jquery");

export const fetchPosts = (eventId) => {
  return $.ajax({
    method: "GET",
    url: `api/events/${eventId}/posts`
  });
};
