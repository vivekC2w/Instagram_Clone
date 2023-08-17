const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const requireLogin = require('../middleware/requireLogin')
const Post = mongoose.model("Post")

router.get('/allpost',requireLogin,(req,res)=>{
    Post.find()
    .populate("postedBy", "_id name pic")
    .populate("comments.postedBy", "_id name")
    .then((posts)=>{
        res.json({posts})
    }).catch(err=>{
        console.log(err);
    })
})

router.get('/getsubpost',requireLogin,(req,res)=>{

    // if postedBy in following
    Post.find({postedBy:{$in:req.user.following}})
    .populate("postedBy","_id name")
    .populate("comments.postedBy","_id name")
    .sort('-createdAt')
    .then(posts=>{
        res.json({posts})
    })
    .catch(err=>{
        console.log(err)
    })
})

router.post('/createpost', requireLogin, (req, res) => {
    const {title, body, pic} = req.body
    if(!title || !body || !pic) {
        res.status(422).json({error:"Please add all the fields"})
    }
    req.user.password = undefined
    const post = new Post({
        title,
        body,
        photo:pic,
        postedBy: req.user
    })
    post.save().then(result => {
        res.json({post:result})
    })
    .catch(err=>{
        console.log(err)
    })
})

//list all the post created by that user who is logged in
router.get('/mypost', requireLogin, (req, res)=>{
    //quering in post model postedBy equal to id of user who is logged in
    Post.find({postedBy:req.user._id})
    .populate("postedBy", "_id name")
    .then(mypost=>{
        res.json({mypost})
    })
    .catch(err=>{
        console.log(err)
    })
})
 
//router for Like post
router.put('/like', requireLogin, (req, res)=> {
    Post.findByIdAndUpdate(req.body.postId, {
        $push:{likes:req.user._id}
    }, {
        new:true
    }).then(result => {
        res.json(result)
      })
      .catch(err => {
        return res.status(422).json({ error: err })
      })
  })

//router for Unlike post
router.put('/unlike', requireLogin, (req, res)=> {
    Post.findByIdAndUpdate(req.body.postId, {
        $pull:{likes:req.user._id}
    }, {
        new:true
    }).then(result => {
        res.json(result)
      })
      .catch(err => {
        return res.status(422).json({ error: err })
      })
  })

//router for comment the post
router.put('/comment', requireLogin, (req, res)=> {
    const comment = {
        text:req.body.text,
        postedBy:req.user._id
    }
    Post.findByIdAndUpdate(req.body.postId, {
        $push:{comments:comment}
    }, {
        new:true
    }).populate("comments.postedBy", "_id name") 
   .populate("postedBy", "_id name")  
    .then(result => {
        res.json(result)
      })
      .catch(err => {
        return res.status(422).json({ error: err })
      })
  })

  router.delete('/deletepost/:postId',requireLogin,(req,res)=>{
    Post.findOne({_id:req.params.postId})
    .populate('postedBy','_id')
    .then(post => {
        if(!post){
            return res.status(422).json({error: 'Post not found'})
        }
        if(post.postedBy._id.toString() !== req.user._id.toString()){
            return res.status(401).json({error: 'You are not authorized to delete this post'})
        }
        post.deleteOne()
        .then(result=>{
            res.json(result)
        }).catch(err=>{
            console.log(err)
            res.status(500).json({error: 'Internal server error'})
        })
    })
    .catch(err => {
        console.log(err)
        res.status(500).json({error: 'Internal server error'})
    })

})


module.exports = router