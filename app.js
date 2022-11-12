//jshint esversion:6

const express = require("express");
const mongoose = require("mongoose")
const bodyParser = require("body-parser");
const _ = require("lodash")
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
main().catch(err=>console.log(err));



async function main(){


await  mongoose.connect('mongodb+srv://abdul:salam@trialclustor.wy7z5wd.mongodb.net/todolistDB');

const itemSchema= mongoose.Schema({ name: String})


const Item = mongoose.model('Item', itemSchema)


const wake = new Item({name:"wake"})
const eat = new Item({name:"eat"})
const sleep = new Item({name:"sleep"})

const defaultItems = [wake,eat,sleep]


const listSchema = mongoose.Schema( {
  name:String,
  items: [itemSchema]
})

const List = mongoose.model("List", listSchema)


// await Item.deleteMany({name:"wake"})




  app.get("/", function (req, res) {

    Item.find((err, addedItems) => {
      if (err) {
        console.log(err);
      }
      else {

        if (addedItems.length === 0) {
          Item.insertMany(defaultItems, (err) => {
            if (err) {
              console.log(err);
            } else {
              console.log("Items addedd");

            }
          });

          res.redirect("/");



        } else {
          res.render("list", { listTitle: "Today", newListItems: addedItems });

        }
      }
    });

  });


app.post("/", function(req, res){

  const itemName = req.body.newItem;

  const listName=  req.body.list;

  console.log(listName)

  const item = new Item({
    name: itemName
  })


  if (listName==="Today"){
    item.save();
    res.redirect("/")
  } 
  else{
    List.findOne({name:listName}, function(err,foundList){
      if (err){
        console.log(err)
      } 
      else
      {
        foundList.items.push(item);
        foundList.save();
        res.redirect("/"+listName)
      }


    })
  }
 
})


app.post("/delete", (req,res)=>{
  const checkedItemId= req.body.checkbox;
  const listName = req.body.listName
    if (listName==="Today"){

      Item.findByIdAndRemove(checkedItemId, (err)=>{ "You have deleted the time with ID: " + checkedItemId})
      res.redirect("/")
    
    } else{
      List.findOneAndUpdate({name:listName}, {$pull: {items:{_id:checkedItemId}}}, function(err,foundList){
      
        (!err)?res.redirect("/" + listName):console.log(err);

      })
    }

  })

app.get("/:customListName", function(req, res){
  const customListName= _.capitalize(req.params.customListName)

  

  List.findOne({name:customListName},function(err,foundList){

    if (!err){
      if(!foundList){
        const list = new List({
          name:customListName,
          items: defaultItems
        })
      
        list.save()   
        res.redirect("/"+customListName)  
      } 
      else{
          res.render("list", {listTitle: foundList.name, newListItems:foundList.items});

      }
    }

  })

})


}



app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
