require('dotenv').config(); // Ensure .env variables are available
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URL);

// Define the schema for the Post model
const postSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true,
  }, 
  url: {
    type: String,
    trim: true,
  },
  likes: {
    type: Array,
    default:[], // save users id who liked
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true,
  },
}, {
  timestamps: true, // Automatically manage createdAt and updatedAt
});

// Export the model
module.exports = mongoose.model('Post', postSchema);
