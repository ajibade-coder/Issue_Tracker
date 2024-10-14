'use strict';

let mongoose = require('mongoose')

module.exports = function (app) {
///////////////////////////////////////////
 //connect to moongoose//////
  mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  /////////////////////////////////

  //create schema model for the data ////////
let issue_schema = new mongoose.Schema({
    issue_title: {type: String, required: true},
    issue_text: {type: String, required: true},
    created_by : {type: String, required: true},
    assigned_to : String,
    status_text : String,
    open: {type: Boolean, required: true},
    created_on: {type: Date, required: true},
    updated_on: {type: Date, required: true},
    project: String
  })
  ////////////////////////////////////////


  //create a model using issue_schema //////////
  let Issue = mongoose.model('Issue', issue_schema)

/////////////////////////////////////////


  app.route('/api/issues/:project')
  
    .get(function (req, res){
      let project = req.params.project;
      console.log(req.query.open)


      //////////if there is a query to the get route
      if (Object.keys(req.query).length > 0) {
         Issue.find({project: project, ...req.query}, '-__v -project').exec((err, users) => {
          if (err){
              res.json([])
          } else {
              return res.json(users)
          }
        });

      } else {
           //////////////////////////////// exclude keys __v and project when returning data
     Issue.find({project: project}, '-__v -project').exec((err, users) => {
              if (err){
                  res.json([])
              } else {
                  return res.json(users)
              }
            });
  //////////////////////////////////
      }
    })
    
    .post(function (req, res){
      let project = req.params.project;
      ///////////////////////////////
      if(!req.body.issue_title || !req.body.issue_text || !req.body.created_by){
        return res.json({ error: 'required field(s) missing' })
      }
      let newIssue = new Issue({
        issue_title: req.body.issue_title,
        issue_text: req.body.issue_text,
        created_by: req.body.created_by,
        assigned_to: req.body.assigned_to || '',
        status_text: req.body.status_text || '',
        open: true,
        created_on: new Date().toUTCString(),
        updated_on: new Date().toUTCString(),
        project: project
      })
      newIssue.save((error, savedIssue) => {
        if(!error && savedIssue){
          return res.json({assigned_to:savedIssue.assigned_to,status_text:savedIssue.status_text,open:savedIssue.open,_id:savedIssue._id,issue_title:savedIssue.issue_title,issue_text:savedIssue.issue_text,created_by:savedIssue.created_by,created_on:savedIssue.created_on,updated_on:savedIssue.updated_on})
        } 
      })
      ////////////////////////////////////
      
    })
    
    .put(function (req, res){
      //////////////////////////////////
      const {
        _id,
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
        open
      } = req.body

      if (!_id) {
        return   res.json({ error: "missing _id" });
      } else if (
         !issue_title &&
        !issue_text &&
        !created_by &&
        !assigned_to &&
        !status_text &&
        !open
      ) {
            return  res.json({ error: "no update field(s) sent", _id: _id });

      } else {
      Issue.findByIdAndUpdate(
      _id,
      {...req.body, updated_on: new Date()},
      {new: true},
      (error, updatedIssue) => {
       if(!error && updatedIssue){
        console.log(req.body)
          return res.json({ result: "successfully updated", _id: _id })
        }else {
          return res.json({ error: "could not update", _id: _id })
        } 
      }
        )

      }



    })
    
    .delete(function (req, res){
      const { _id } = req.body
      /////////////////////////////////////
        if(!_id){
        return res.json({ error: 'missing _id' })
      }
      Issue.findByIdAndRemove(req.body._id, (error, deletedIssue) => {
        if(!error && deletedIssue){
          res.json({ result: 'successfully deleted', '_id': _id })
        }else if(!deletedIssue){
          res.json({ error: 'could not delete', '_id': _id })
        }
      })
      /////////////////////////////////
      
    });
    
};
