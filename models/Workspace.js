const mongoose= require('mongoose')

const workspaceSchema= new mongoose.Schema ({

    taskName : String ,
    taskType : String ,
    taskDescription : String, 
    dueDate : Date , 
    conversations : [String] 

})
const Workspace = mongoose.model('workspace' , workspaceSchema)

module.exports= Workspace