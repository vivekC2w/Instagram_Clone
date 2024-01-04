const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const requireLogin = require("../middleware/requireLogin");
const Post = mongoose.model("Post");
const User = mongoose.model("User");

router.get("/user/:id", requireLogin, (req, res) => {
  User.findOne({ _id: req.params.id })
    .select("-password")
    .then((user) => {
      Post.find({ postedBy: req.params.id })
        .populate("postedBy", "_id name")
        .then((posts) => {
          res.status(200).json({ user, posts });
        })
        .catch((err) => {
          return res.status(422).json({ error: err });
        });
    })
    .catch((err) => {
      return res.status(404).json({ error: "User not found" });
    });
});

router.put("/follow", requireLogin, async (req, res) => {
  try {
    const result = await User.findByIdAndUpdate(
      req.body.followId,
      {
        $push: { followers: req.user._id },
      },
      { new: true }
    ).exec();

    await User.findByIdAndUpdate(
      req.user._id,
      {
        $push: { following: req.body.followId },
      },
      { new: true }
    )
      .select("-password")
      .exec();

    res.status(200).json(result);
  } catch (err) {
    return res.status(422).json({ error: err });
  }
});

router.put("/unfollow", requireLogin, async (req, res) => {
  try {
    const result = await User.findByIdAndUpdate(
      req.body.unfollowId,
      {
        $pull: { followers: req.user._id },
      },
      { new: true }
    ).exec();

    await User.findByIdAndUpdate(
      req.user._id,
      {
        $pull: { following: req.body.unfollowId },
      },
      { new: true }
    )
      .select("-password")
      .exec();

    res.status(200).json(result);
  } catch (err) {
    return res.status(422).json({ error: err });
  }
});

router.put("/updatepic", requireLogin, async (req, res) => {
  try {
    const result = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { pic: req.body.pic } },
      { new: true }
    ).exec();

    res.status(200).json(result);
  } catch (err) {
    return res.status(422).json({ error: "pic cannot be posted" });
  }
});

router.get("/currentUser", requireLogin, async (req, res) => {
  try {
    const result = await User.findById(req.user._id);
    res.status(200).json(result);
  } catch (err) {
    return res.status(422).json({ error: "pic cannot be posted" });
  }
});

router.post("/search-users", (req, res) => {
  let userPattern = new RegExp(req.body.query, "i");
  User.find({
    $or: [
      { email: { $regex: userPattern } },
      { name: { $regex: userPattern } },
    ],
  })
    .select("pic email name")
    .then((user) => {
      res.status(200).json({ user });
    })
    .catch((err) => {
      console.log(err);
    });
});

module.exports = router;
