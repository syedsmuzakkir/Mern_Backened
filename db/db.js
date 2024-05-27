const mongoose=require("mongoose")

mongoose.connect('mongodb+srv://'+process.env.USER+':'+process.env.PASSWORD+'@cluster0.j7hjakb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
.then(()=>{
    console.log("connected")
}).catch(()=>{
    console.log("err")
})








// mongodb+srv://syedsmuzakkir46:<password>@cluster0.j7hjakb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0