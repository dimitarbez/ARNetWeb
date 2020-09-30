const mongoose = require('mongoose');
const Post = require('./models/post.js');
const Comment = require('./models/comment.js');

function createData(numberOfPosts)
{
    let data = [];
    for (let i = 0; i < numberOfPosts; i++) {
        let post = {
            title: Math.random() * 10,
            description: Math.random() * 10,
            author: Math.random() * 10,
            created: Date(Math.random()),
        }
        data.push(post);
    }
    return data;
}

function seedDB() {
    //remove all posts
    Post.remove({}, (err) => {
        if(err)
        {
            console.log(err);
        }
        console.log("removed posts");
    });

    /*// add a feq posts
    createData(20).forEach((item) => {
        Post.create(item, (err, post) =>{
            if(err){
                console.log(err);
            }
            else{
                console.log("added post");
                Comment.create({
                    text: "sucks",
                    author: "horhe"
                }, (err, comment) => {
                    if(err)
                    {
                        console.log(err);
                    }
                    else
                    {
                        post.comments.push(comment);
                        post.save();
                        console.log('added comment');
                    }
                });
            }
        })
    })

    // add a few comments
    */
}
module.exports = seedDB;