var express = require('express');
var router = express.Router();
const userModel = require("../models/users");
const postModel = require("../models/posts");
const passport = require('passport');
const upload = require('./multer');


const localStrategy = require("passport-local");
passport.use(new localStrategy(userModel.authenticate()));


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// Profile Route 

router.get("/profile" , isLoggedIn , async(req , res)=>{
  const user = await userModel.findOne({
    username:req.session.passport.user
  }).populate("posts");
  res.render("profile" , {username : user.username , name:user.name , posts:user.posts});
})

// Feed route

router.get("/feed" , (req,res)=>{
  const dummyPosts = [
    {
        _id: '1',
        title: 'Beautiful Sunset',
        description: 'A stunning view of the sunset over the mountains.',
        imageUrl: 'https://via.placeholder.com/600x400?text=Sunset',
        user: {
            _id: 'user1',
            username: 'john_doe',
            bio: 'Nature lover, photographer.',
            profilePic: 'https://via.placeholder.com/40x40?text=JD'
        },
        likes: ['user1', 'user2', 'user3'],  // Users who liked this post
        createdAt: new Date(),
    },
    {
        _id: '2',
        title: 'City Lights',
        description: 'The city skyline glowing at night.',
        imageUrl: 'https://via.placeholder.com/600x400?text=City+Lights',
        user: {
            _id: 'user2',
            username: 'jane_doe',
            bio: 'Urban explorer and photographer.',
            profilePic: 'https://via.placeholder.com/40x40?text=JD'
        },
        likes: ['user1', 'user3'],  // Users who liked this post
        createdAt: new Date(),
    },
    {
        _id: '3',
        title: 'Mountain Adventure',
        description: 'Trekking through the mountains.',
        imageUrl: 'https://via.placeholder.com/600x400?text=Mountain',
        user: {
            _id: 'user3',
            username: 'alice_smith',
            bio: 'Adventurer and traveler.',
            profilePic: 'https://via.placeholder.com/40x40?text=AS'
        },
        likes: ['user2'],  // Users who liked this post
        createdAt: new Date(),
    },
    {
        _id: '4',
        title: 'Wildlife Photography',
        description: 'A close-up of a majestic lion in the wild.',
        imageUrl: 'https://via.placeholder.com/600x400?text=Wildlife',
        user: {
            _id: 'user4',
            username: 'bob_jones',
            bio: 'Wildlife enthusiast and photographer.',
            profilePic: 'https://via.placeholder.com/40x40?text=BJ'
        },
        likes: ['user1', 'user2', 'user3'],  // Users who liked this post
        createdAt: new Date(),
    }
];  

  res.render("feed" ,  {
    posts: dummyPosts,
    user: { _id: 'user1', username: 'john_doe' }  // Mock logged-in user data
  })
})

// Upload route
router.post("/upload" ,isLoggedIn, upload.single('file') , async(req,res,next)=>{
  if (!req.file){
    return res.status(400).send("No file uploaded.")
  }

  // Save file as a post and give post id to user and give userid to post.
  const user = await userModel.findOne({username:req.session.passport.user});
  const postData = await postModel.create({
    text: req.body.caption,
    url:req.file.filename,
    author:user._id
  })
  user.posts.push(postData._id)
  await user.save();
  res.redirect("/profile");
  // res.send("Done");
})

// Login and signup frontend 
router.get("/login" ,isNotLoggedIn, (req , res)=>{
  res.render("login" , {err:req.flash("error")});
})

router.get("/register" ,isNotLoggedIn, (req , res)=>{
  res.render("signup" , {err:req.flash("error")});
})


// -----------------------------------Auth code ----------------------------------------

// Register 
// Register
router.post("/register", isNotLoggedIn, async (req, res) => {
    // Create a new user instance with the provided data
    const userData = new userModel({
      username: req.body.username,
      email: req.body.email,
      name: req.body.name,
    });

    // Attempt to register the user
    await userModel.register(userData, req.body.password);

    // Authenticate the user after successful registration
    passport.authenticate("local")(req, res, () => {
      res.redirect("/profile");
    });
});


// Login
router.post("/login" ,isNotLoggedIn, passport.authenticate("local" ,{
  successRedirect:"/profile",
  failureRedirect:"/login",
  failureFlash:true
}));

// Logout
router.get('/logout', function(req, res, next){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});


// isLoggedIn middleware

function isLoggedIn(req , res , next){
  if(req.isAuthenticated()){
    return next();
  }

  res.redirect("/login");
}

// isNotLoggedIn middleware

function isNotLoggedIn(req , res , next){
  if(req.isAuthenticated()){
    res.redirect("/profile");
  }

  return next();
}

module.exports = router;
