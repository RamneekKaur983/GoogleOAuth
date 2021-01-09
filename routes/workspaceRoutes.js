const { Router } = require('express');
const workspaceController = require('../controllers/workspaceController');
const router = Router()
router.get("/task" ,workspaceController.get_tasks )
router.post("/task"  , workspaceController.post_tasks)
module.exports =router