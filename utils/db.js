const mongoose = require("mongoose")
const uri = "mongodb+srv://AxelCode:Axel1006@cluster0.sjievuu.mongodb.net/?retryWrites=true&w=majority"
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
}) 
