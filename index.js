const express=require("express");
const app=express();
const mongoose=require("mongoose");
const path=require("path");
const Chat=require("./models/chat.js");
const methodOverride = require("method-override");
const ExpressError=require("./ExpressError.js");


app.set("views",path.join(__dirname,"views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname,"public")));//for serving style of public folder
//to prase form data
app.use(express.urlencoded({extends:true}));
app.use(methodOverride("_method"));

main()
.then(()=> {
    console.log("Connection Successful");
})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/fakewhatsapp');
}

//Index route to see all chats(Home page)
app.get("/chats", async (req,res,next)=>{
    try{
    let chats=await Chat.find();
    res.render("index.ejs",{chats});
    }catch(err){
        next(err);
    }
});

//New route to render form to get new info to make new chat
app.get("/chats/new",(req,res) => {
    // throw new ExpressError(404,"Page Not Found");
    res.render("new.ejs");
});

//create route(To Actually adding the new chat in DB)
app.post("/chats",asyncWrap(async(req,res,next)=>{

    let {from,to,msg}=req.body;
    let newChat = new Chat({
        from: from,
        to: to,
        msg: msg,
        created_at: new Date()
    });
    await newChat.save();
    res.redirect("/chats");
}));

function asyncWrap(fn){
    return function(req,res,next){
        fn(req,res,next).catch(err => next(err));
    };
}

//New - Show Route
app.get("/chats/:id",asyncWrap(async(req,res,next)=>{

        let {id}=req.params;
        let chat=await Chat.findById(id);
        if(!chat){
            next(new ExpressError(404,"Chat Not Found"));
        }
        res.render("edit.ejs",{ chat });
}));

//edit route(render form to update msg)
app.get("/chats/:id/edit", async(req,res,next) => {
    try{
        let {id} =req.params;
        let chat =await Chat.findById(id);
        res.render("edit.ejs",{chat});
    }catch(err){
        next(err);
    }
});
//actually update msg in database
app.put("/chats/:id", async(req,res,next) => {
    try{
        let {id} =req.params;
        let {msg : newMsg}=req.body;
        let updatedChat=await Chat.findByIdAndUpdate(
            id,
            {msg:newMsg},
            { runValidators:true, new:true}
        );
        // console.log(updatedChat);
        res.redirect("/chats");
    }catch(err){
        next(err);
    }
});

//Destroy route
app.delete("/chats/:id", async(req,res) => {
    let {id} =req.params;
    console.log(id);
    let deletedChat= await Chat.findByIdAndDelete(id);
    // console.log(deletedChat);
    res.redirect("/chats");
});

app.get("/",(req,res)=>{
    res.send("Working Well!!");
});

const handlleValidationErr=(err)=>{
    console.log("This was is validation Error!! please follow rules..");
    // console.dir(err.message);
    return err;
}

//this called first before Err handing middleware
app.use((err,req,res,next)=>{
    console.log(err.name);
    if(err.name==='ValidationError'){
       err= handlleValidationErr(err);
    }
    next(err);
});

//Error handilng middleware
app.use((err,req,res,next)=>{
    try{
        let {status=500,message="Some Error Occur"}=err;
        res.status(status).send(message);
    }catch(err){
        next(err);
    }
});

app.listen(8080,()=>{
    console.log("Server is Listening");
});