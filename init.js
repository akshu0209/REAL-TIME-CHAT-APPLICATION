const mongoose=require("mongoose");
const Chat=require("./models/chat.js");

main()
.then(()=> {
    console.log("Connection Successful");
})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/fakewhatsapp');
}

let allChats = [
    {
    from:"Ak",
    to:"Rj",
    msg:"Hii Bro",
    created_at:new Date(),
},
{
    from:"Panu",
    to:"Pranali",
    msg:"Hello Pranali",
    created_at:new Date(),
},
{
    from:"Lucky",
    to:"Yash",
    msg:"Kya bat hai!!",
    created_at:new Date(),
},
{
    from:"Rk",
    to:"AK",
    msg:"Good morging Ak",
    created_at:new Date(),
}
];
 Chat.insertMany(allChats);