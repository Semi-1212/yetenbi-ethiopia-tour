// Sample API endpoint for post statistics
// This is an example of how to create a backend API to serve real data

const express = require('express');
const app = express();

// Sample database of post statistics
const postStats = {
  'https://example.com/post1': {
    likes: 45,
    comments: 12,
    views: 234
  },
  'https://example.com/post2': {
    likes: 67,
    comments: 8,
    views: 456
  },
  'https://example.com/post3': {
    likes: 23,
    comments: 15,
    views: 189
  }
};

// API endpoint to get post statistics
app.get('/api/posts/:postId/stats', (req, res) => {
  const postId = decodeURIComponent(req.params.postId);
  
  // Check if we have stats for this post
  if (postStats[postId]) {
    res.json(postStats[postId]);
  } else {
    // Return default stats for new posts
    res.json({
      likes: 0,
      comments: 0,
      views: 0
    });
  }
});

// API endpoint to update post statistics
app.post('/api/posts/:postId/stats', (req, res) => {
  const postId = decodeURIComponent(req.params.postId);
  const { likes, comments, views } = req.body;
  
  // Update or create stats for this post
  postStats[postId] = {
    likes: likes || 0,
    comments: comments || 0,
    views: views || 0
  };
  
  res.json({ success: true, stats: postStats[postId] });
});

// API endpoint to increment views (called when post is viewed)
app.post('/api/posts/:postId/view', (req, res) => {
  const postId = decodeURIComponent(req.params.postId);
  
  if (!postStats[postId]) {
    postStats[postId] = { likes: 0, comments: 0, views: 0 };
  }
  
  postStats[postId].views += 1;
  
  res.json({ success: true, views: postStats[postId].views });
});

// API endpoint to like a post
app.post('/api/posts/:postId/like', (req, res) => {
  const postId = decodeURIComponent(req.params.postId);
  
  if (!postStats[postId]) {
    postStats[postId] = { likes: 0, comments: 0, views: 0 };
  }
  
  postStats[postId].likes += 1;
  
  res.json({ success: true, likes: postStats[postId].likes });
});

// API endpoint to add a comment
app.post('/api/posts/:postId/comment', (req, res) => {
  const postId = decodeURIComponent(req.params.postId);
  
  if (!postStats[postId]) {
    postStats[postId] = { likes: 0, comments: 0, views: 0 };
  }
  
  postStats[postId].comments += 1;
  
  res.json({ success: true, comments: postStats[postId].comments });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});

module.exports = app; 