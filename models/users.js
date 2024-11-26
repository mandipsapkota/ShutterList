require('dotenv').config(); // Ensure .env variables are available
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URL);

const plm = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
  },
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post', // Reference to a 'Post' model
    },
  ],
  dp:{
    type:String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt timestamps
});

userSchema.plugin(plm);

// Export the model
module.exports = mongoose.model('User', userSchema);
