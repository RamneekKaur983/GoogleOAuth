const Workspace = require("../models/Workspace");
const mongooose= require("mongoose")

module.exports.get_tasks =  async(req,res)=>
{
    try{
        const tasks= await Workspace.find({})
        res.send(tasks)
    }
    catch(err)
    {
        res.json(err)
    }
        


}

module.exports.post_tasks = async(req, res) =>
{
    try{

      const {taskName , taskType ,taskDescription , dueDate , conversations  } = req.body
      const newTask = await new Workspace({taskName , taskType , taskDescription , dueDate ,conversations})
        await newTask.save()
        res.status(200).send('Task created successfully')

    }
    catch(err)
{
    res.json(err)
}
}