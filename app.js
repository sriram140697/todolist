//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose=require("mongoose");
const _=require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-sriram:Test123@cluster0-0irxy.mongodb.net/todolistDB",{useNewUrlParser:true});

const itemSchema=new mongoose.Schema({
  name:String,
});
const Item=mongoose.model("Item",itemSchema);

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

const item1=new Item({
  name:"welcome to todo list",
});
const item2=new Item({
  name:"schedule your tasks",
});
const item3=new Item({
  name:"<-- hit this to delete task",
});
const defaultItems=[item1,item2,item3];
const listSchema=new mongoose.Schema({
  name:String,
  items:[itemSchema],
});

const List=mongoose.model("List",listSchema);
// Item.deleteOne({name:"schedule your tasks"},function(err){
//   if(err){
//     console.log(err);
    
//   }
//   else{
//     console.log("success");
    
//   }
// });


app.get("/", function(req, res) {
  Item.find(function(err,foundItems){
if(foundItems.length===0){
  Item.insertMany([item1,item2,item3],function(err){
    if(err){
      console.log(err);
      
    }
    else{
      console.log("successfully added");
      }
  });
  res.redirect("/");
}else{
res.render("list",{listTitle:"Today",newListItems:foundItems});
}
});
});
app.get("/:urlname",function(req,res){
  const urlName=_.capitalize(req.params.urlname);
List.findOne({name:urlName},function(err,foundlist){
 
  if(!err){
    
  if(!foundlist){
    
    const list=new List({
      name:urlName,
      items:defaultItems
    });
    list.save();
    res.redirect("/"+urlName);
    
  }  
  else{
    res.render("list",{listTitle:foundlist.name,newListItems:foundlist.items});
    
  }
  
  }
  
});
});


app.post("/", function(req, res){
 const itemName=req.body.newItem;
 const listname=req.body.list;
 const item=new Item({
    name:itemName,
 });
if(listname==="Today"){
  item.save();
  res.redirect("/");
}
else{
List.findOne({name:listname},function(err,foundList){
 foundList.items.push(item);
foundList.save();
res.redirect("/" + listname);
})

}


});

app.post("/delete",function(req,res){
  const deleteItemId=req.body.checkbox;
const listName=req.body.listName;
  setTimeout(function(){ 
if(listName==="Today")
{
  Item.findByIdAndRemove(deleteItemId,function(err,deleteditem){
    if(err){
      console.log(err);
      
    }
    else{
      console.log(deleteditem);
      
      res.redirect("/");
      
    }
  });  
}
else
{
  List.findOneAndUpdate({name:listName},{$pull:{items:{_id:deleteItemId}}},function(err,foundList){
    if(!err)
    {
      res.redirect("/" + listName);
    }
  });
}








}, 1000);
  // console.log(deleteItem);
});



app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started successfully");
});
