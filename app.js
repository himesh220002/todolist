//jshint esversion:6

const express = require("express");
let favicon = require('serve-favicon');
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.use(favicon(__dirname +'/public/images/icons8-favicon-16.png'));
 
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


mongoose.connect("mongodb+srv://satyamhimesh:%4006452220002Hq@cluster0.ckkeqng.mongodb.net/todolistDB?retryWrites=true&w=majority");

const itemsSchema = {
  name: String
};
const Item = mongoose.model ("Item" , itemsSchema);

const item1 = new Item({
  name: "Welcome to todolist"
});
const item2 = new Item({
  name: "Hit + to add new list item"
});
const item3 = new Item({
  name: "<-- hit this to delete an item"
});

const defaultItems = [item1,item2,item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};
const List = mongoose.model("List",listSchema);



app.get("/", function(req, res) {

   Item.find({}).then((foundItems)=>{
    
    if(foundItems.length === 0){
      Item.insertMany(defaultItems).then(()=> {
        
        console.log("default items saved in Db");
        res.redirect("/");
      });
    }else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
   
   });
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  
  const item = new Item({
    name: itemName
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");

  }else{
    List.findOne({name: listName}).then((foundList)=>{
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }  
});

app.post("/delete", function(req, res){
  
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove( checkedItemId).then(()=>{
      console.log("deleted checked item");
      res.redirect("/");
    });
  }else{
  
    List.findOneAndUpdate({name: listName},{$pull:{items:{_id: checkedItemId}}}).then((foundList)=>{
    res.redirect("/" + listName);    
    });
  }
});

app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);
  
  List.findOne({name: customListName}).then((foundList)=>{

    if(!foundList){
      // create a new list
      const list = new List({
        name: customListName,
        items: defaultItems
      });

      list.save();
      res.redirect("/" + customListName);
  
    }else{
      // show existing list
      res.render("list", {listTitle: foundList.name , newListItems: foundList.items});
    }
  });
});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.port;
if(port == null || port == ""){
  port = 3000;
}
app.listen(port , function() {
  console.log("Server started succesfully");
});

