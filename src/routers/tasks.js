const Task = require('../models/tasks')
const express = require('express');
const auth = require('../middleware/auth')
const router = new express.Router()

// CREATING NEW TASK
router.post('/tasks', auth, async(req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })

    try{
        await task.save()
        res.status(201).send(task)
    }catch(e){
        res.status(400).send(e)
    }
})

// READING ALL THE TASKS (GET /tasks?completed=true)
// GET /tasks?limit=10&skip=20
//GET /tasks?sortBy=createdAt:desc
router.get('/tasks', auth, async(req, res) => {
    const match = {}
    const sort = {}

    if(req.query.completed){
        match.completed = req.query.completed === "true"
    }

    if(req.query.sortBy){
        const part = req.query.sortBy.split(':')
        sort[part[0]] = part[1] === "desc"? -1 : 1
    }
    try{
        await req.user.populate({
            path:"tasks",
            match,
            options:{
                limit:parseInt(req.query.limit),
                skip:parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.send(req.user.tasks)
    }catch(e){
        res.status(500).send(e)
    }
})

// READING TASK BY ID
router.get('/tasks/:id', auth,async(req, res) => {
    const _id = req.params.id

    try{
        const task = await Task.findOne({ _id, owner: req.user._id })

        if(!task){
            return res.status(404).send()
        }

        res.send(task)
    }catch(e){
        res.status(500).send(e)
    }
})

// UPDATING TASK BY ID
router.patch('/tasks/:id', auth,async(req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if(!isValidOperation){
        return res.status(400).send('error: Invalid update')
    }

    try{
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })

        if(!task){
            return res.status(404).send()
        }

        updates.forEach((update) => task[update] = req.body[update])

        await task.save()

        res.send(task)
    }catch(e){
        res.status(500).send(e)
    }
})

// DELETING TASK BY ID
router.delete('/tasks/:id', auth, async(req, res) => {
    try{
        const task = await Task.findOneAndDelete({ _id:req.params.id, owner: req.user._id })
        if(!task){
            return res.status(404).send()
        }
        res.send(task)
    }catch(e){
        res.status(500).send(e)
    }
})

module.exports = router