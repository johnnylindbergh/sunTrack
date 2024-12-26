
/*
  routes.js: System routes for most requests
*/
"use strict";
const db = require('./database.js');
const sys = require('./settings.js');
const mid = require('./middleware.js');
const moment = require('moment');
const schedule = require('node-schedule');
const fs = require('fs');
const { GOOGLE_CLIENT_ID } = require('./credentials.js');
const credentials = require('./credentials.js');


const job = schedule.scheduleJob('0 0 * * *', function () {
  db.clockOutAll(function (err) {
    console.log("It is now midnight, all users have been clocked out.");
  });
});

module.exports = (app) =>{
      // GET requests
      app.get('/admin', mid.isAuth, (req, res) => {
    
        if (req.isAuthenticated() && req.user && req.user.local) {
          if (req.user.local.user_type == 1) {
  
          var render = defaultAdminRender(req);
          db.getJobs(req, res, function (err, jobs) {
            render.jobs = jobs;
              db.getWholeTimesheet(req, res, function (times) {
                render.times = times;
                //console.log(times);
                db.getWeeks(times, function (nominalWeeks) {
                  render.nominalWeeks = nominalWeeks;
                  db.getUsers(function (err, users) {
                    render.users = users;
                    // console.log("Users: ",users);
                    db.getUsersHours(function (err, userHours) {
  
                      //console.log("Timesheet Error:",err);
  
                      render.times = userHours;
  
                      db.getInventory(function (err, inventory) {
                        //console.log("inventory error:", err);
                        render.inventory = inventory;
                        res.render("admin.html", render);
                      });
  
                    });
  
  
                  });
  
                });
  
  
              });
    
            
    
            });
    
          } else {
            var params = [];
            params.fr = "You are not an admin"
            res.err(params)
          }
    
        } else {
    
          res.render("/");
    
        }
      });
    
      app.get('/getTimesheet', mid.isAuth, (req, res) => {
        db.getTimesheet(req, res, function (err, times) {
          // must process first
          res.send(times);
        });
    
      });
      app.post('/admin', mid.isAuth, (req, res) => {
    
        if (req.isAuthenticated() && req.user && req.user.local) {
          if (req.user.local.user_type == 1) {
    
            var render = defaultAdminRender(req);
            db.getJobs(req, res, function (err, jobs) {
    
              render.jobs = jobs;
              db.getTasks(req, res, function (err, tasks) {
    
                render.tasks = tasks;
                db.getTimesheet(req, res, function (err, times) {
    
                  render.times = times;
    
                  db.getWholeTimesheet(req, res, function (times) {
                    db.getWeeks(times, function (nominalWeeks) {
    
                      render.nominalWeeks = nominalWeeks;
                      db.getUsers(function (err, users) {
    
                        for (var i = 0; i < users.length; i++) {
                          if (users[i].last_seen != null){
                            users[i].last_seen = moment(users[i].last_seen).fromNow();
                          }
                        }
                        render.users = users;
    
                        db.getUsersHours(function (err, userHours) {
                          render.times = userHours;
    
                          db.getInventory(function (err, inventory) {
                            render.inventory = inventory;
    
                            // now filter
                            for (var i = 0; i < render.users.length; i++) {
                              if (render.users[i].id == req.body.userId) {
                                render.users[i].selected = true;
                              }
                            }
    
                            for (var i = 0; i < render.jobs.length; i++) {
                              if (render.jobs[i].id == req.body.jobId) {
    
                                render.jobs[i].selected = true;
                              }
                            }
                            for (var i = 0; i < render.tasks.length; i++) {
                              if (render.tasks[i].id == req.body.taskId) {
    
                                render.tasks[i].selected = true;
                              }
                            }
    
    
                            // parse dates from request into moment objects
                            var startDate = moment(req.body.startDate);
                            var endDate = moment(req.body.endDate);
    
                            if (req.body.weekId == -1) {
                              req.body.weekId = null;
                            }
    
                            if (req.body.userId == -1) {
                              req.body.userId = null;
                            }
    
                            if (req.body.jobId == -1) {
                              req.body.jobId = null;
                            }
    
                            if (req.body.taskId == -1) {
                              req.body.taskId = null;
                            }
    
                            db.getTimesheetQuery(req, res, startDate, endDate, req.body.userId, req.body.jobId, req.body.taskId, req.body.weekId, function (err, rows) {
                              if (!err && rows.length > 0) {
                                //console.log(rows);
                                render.results = rows;
                              }
    
                              render.startDate = startDate;
                              render.endDate = endDate;
                              //render.nominalWeeks = db.nominalWeeks;
                              render.searchScroll = true;
                              
                              res.render("admin.html", render);
                            });
    
    
                          });
    
    
                        });
    
    
                      });
    
                    });
    
                  });
    
    
    
    
    
                });
    
              });
    
            });
    
          } else {
    
            var params = [];
            params.fr = "You are not an admin."
            res.err(params)
          }
    
        } else {
    
          res.render("/");
    
        }
      });


      app.post('/searchTimesheetToCSV', mid.isAuth, function (req, res) {

        if (req.isAuthenticated() && req.user && req.user.local) {
    
          if (req.user.local.user_type == 1) {
    
    
            var render = defaultRender(req);
            db.getJobs(req, res, function (err, jobs) {
    
              render.jobs = jobs;
              db.getTasks(req, res, function (err, tasks) {
    
                render.tasks = tasks;
                db.getUsers(function (err, rows) {
                  for (var i = 0; i < rows.length; i++) {
                    if (rows[i].last_seen != null){
                      rows[i].last_seen = moment(rows[i].last_seen).fromNow();
                    }
                  }
                  render.users = rows;
    
                  for (var i = 0; i < render.users.length; i++) {
                    if (render.users[i].id == req.body.userId) {
                      render.users[i].selected = true;
                    }
                  }
    
                  for (var i = 0; i < render.jobs.length; i++) {
                    if (render.jobs[i].id == req.body.jobId) {
    
                      render.jobs[i].selected = true;
                    }
                  }
                  for (var i = 0; i < render.tasks.length; i++) {
                    if (render.tasks[i].id == req.body.taskId) {
    
                      render.tasks[i].selected = true;
                    }
                  }
    
    
                  // parse dates from request into moment objects
                  var startDate = moment(req.body.startDate);
                  var endDate = moment(req.body.endDate);
    
                  if (req.body.userId == -1) {
                    req.body.userId = null;
                  }
    
                  if (req.body.jobId == -1) {
                    req.body.jobId = null;
                  }
    
                  if (req.body.taskId == -1) {
                    req.body.taskId = null;
                  }
    
    
                  if (req.body.weekId == -1) {
                    req.body.weekId = null;
                  }
    
                  db.getTimesheetQuery(req, res, startDate, endDate, req.body.userId, req.body.jobId, req.body.taskId, req.body.weekId, function (err, timesheetData) {
    
                    if (!err && timesheetData.length > 0) {
                      render.startDate = startDate;
                      render.endDate = endDate;
                      render.results = timesheetData;
                     // console.log(rows);
                      fs.writeFile('timesheet.csv', arrayToCSV(timesheetData), function () {
                        res.download('timesheet.csv');
                      });
                    } else {
                      res.err({
                        fr: "Unable to find hours for this user", 
                        li: "/admin",
                        ti: "Maybe they have never clocked in"
                      });
                    }
    
    
    
    
    
                  });
    
                });
    
              });
    
            });
    
          } else {
    
            res.send("You are not an admin.")
          }
    
        } else {
    
          res.render("/");
    
        }
    
      });
    
}

function defaultAdminRender(req) {
  if (req.isAuthenticated() && req.user && req.user.local) {
    // basic render object for fully authenticated user
    return {
      inDevMode: sys.DEV_MODE,
      auth: {
        isAuthenticated: true,
        userIsAdmin: req.user.local.isAdmin,
        message: "Welcome,  " + req.user.name.givenName + "!"
      },
      defaults: {
        sysName: sys.SYSTEM_NAME,
        domain: sys.DOMAIN,
      }
    };
  } else {
    // default welcome message for unauthenticated user
    return {
      inDevMode: sys.inDevMode,
      auth: {
        message: "Welcome! Please log in."
      }
    };
  }
}