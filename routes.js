
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


const job = schedule.scheduleJob(sys.clockOutString, function () {
  db.clockOutAll(function (err) {
    console.log("It is now midnight, all users have been clocked out.");
  });
});

module.exports = function (app) {

// app.get('/location', mid.isAuth, (req,res) => {
// // make json req to get query location history from bouncie
// // get auth from 

// });
 
  app.get('/', mid.isAuth, (req, res) => {
    var render = defaultRender(req);

    if (req.isAuthenticated() && req.user && req.user.local) {


      if (req.user.local.user_type == 1 || req.user.local.user_type == 2 || req.user.local.user_type == 3) {


        var userEmail = req.user.local.email;
        var userId = req.user.local.id;
        db.getJobAssignments(userId, function (err, jobRoute) {
          // order by shortest distance to make it a "route"
          console.log(jobRoute);

          render.jobRoute = jobRoute;


            db.lookUpUser(userEmail, function (err, user) {
              render.isAdmin = (req.user.local.user_type == 1);
               console.log("User GET / :",user.name);
               //console.log("adminStatus", render.isAdmin )
              render.clockedIn = user.clockedIn;
              //res.send(render)
              render.clockedIn = user.clockedIn;

              db.getClockInDuration(req.user.local.id, function (err, row) {
                if (!err && err == null) {
                  render.clock_in = row[0].clock_in;
                }
                render.googleMapsApiKey = credentials.googleMapsApiKey;
                res.render("main.html", render);
              });
            });
        
        });
      }
    } else {
      res.render("welcome.html", render);
    }
  });


  app.post('/checkIn/:jobId', mid.isAuth, (req, res) => {
    if (req.isAuthenticated() && req.user && req.user.local) {
      var userId = req.user.local.id;
      var jobId = req.params.jobId;
      console.log("Checking in for job: ", jobId);
   //   db.checkIn(userId, jobId, function (err) {
        res.send('/dailyLog');
    //  });
    } else {
     // res.redirect('/');
    }
  }
  );

  app.get('/dailyLog/:jobId', mid.isAuth, (req, res) => {
    if (req.isAuthenticated() && req.user && req.user.local) {
      var render = defaultRender(req);
    //  db.getDailyLog(req.user.local.id, function (err, rows) {
        //render.dailyLog = rows;
        res.send("dailyLog.html");
     // });
    }
  }
  );

  //app.post("clockIn")

  app.post('/location', mid.isAuth, (req, res) => {
    if (req.isAuthenticated() && req.user && req.user.local) {
    console.log(req.user.local.id + " is located at: ", req.body.address , " at ", req.body.latitude+ ","+req.body.longitude,  moment().calendar()); // use system time
    console.log("Location Delta: ", req.body.locationDelta);
    var shortAddress = req.body.address.split(",")[0];
      
      db.updateLocation(req.user.local.id, shortAddress, function (err) {
        if (!err) {
          res.send("Location updated");
        } else {
          res.send(err);
        }
      });
    
  } else {
    res.send("You are not authenticated");
  }
  });


  app.post('/bouncieWebhook', (req, res) => { // this is the webhook for bouncie
    console.log("Bouncie Webhook received: ", req.body);


      // log some incomming info

      const eventType = req.body.eventType;
      const imei = req.body.imei;
      const transactionId = req.body.transactionId;
      
      let start = moment(req.body.start.timestamp);

      console.log("Event Type: ", eventType);
      console.log("IMEI: ", imei);
      console.log("Transaction ID: ", transactionId);
      console.log("Start: ", start.format("YYYY-MM-DD HH:mm:ss"));
      

      

     // first validate the webhook
     if (req.body.key != credentials.bouncieWebhookKey) {
      res.send("Invalid key");
      return;
     } 


    // search the most recent location events

    

    // this webhook will identify some event of some vehicle. 
    // if this function determines that the user is clocked_in, it will monitor the location of the user at a given interval
    // system must be stateless and if you have the urge to store data as a global variable, you are doing it wrong


  
   // res.send("Bouncie Webhook received");
   res.end();
  }
  );

  app.get('/clockInDuration', mid.isAuth, (req, res) => {
    if (req.isAuthenticated() && req.user && req.user.local) {

      db.getClockInDuration(req.user.local.id, function (clockInDuration) {
        res.send(clockInDuration);
      });

    }

  });

  app.get('/getUserHours', mid.isAuth, (req, res) => {

    if (req.isAuthenticated() && req.user && req.user.local) {
      db.getUserHours(req.user.local.id, function (err, rows) {
        res.send(rows);
      });
    }
    
  });


  app.get('/hours', mid.isAuth, (req, res) => {
    if (req.isAuthenticated() && req.user && req.user.local) {
      var render = defaultRender(req);

      db.getUserHours(req.user.local.id, function (err, rows) {
        if (!err){
          render.hours = rows;
          //console.log(rows);
          res.render("hours.html", render);
        } else {
          console.log(err);
        }
       
      });

    }

  });


  app.post('/addJob', mid.isAuth, function (req, res) {
    // start with default render object
    var render = defaultRender(req);
    // ensure given name exists
    if (req.body.jobName && req.body.address) {
      // create new job entry in DB
      db.createJob(req.body.jobName, req.body.address, function (err) {
        res.redirect('/admin');

      });
    } else {
      res.send(err);
    }
  });



    app.post('/clockIn', mid.isAuth, function (req, res) {

    var userId = req.user.local.id;
    db.clockIn(userId, function (err) { 
      if (!err) {
        res.redirect('/');
      } else {
        res.send(err);
      }
    });

  });

  // app.post('/clockIn', mid.isAuth, function (req, res) {
  //   var job = req.body.jobName;
  //   var task = req.body.taskName;
  //   var userId = req.user.local.id;
  //   db.clockIn(userId, job, task, function (err) { // this function now must add the clock_in time to the user table
  //     if (!err) {
  //       res.redirect('/');
  //     } else {
  //       res.send(err);
  //     }
  //   });

  // });

  app.post('/deleteJob', mid.isAuth, function (req, res) {
    var job = req.body.jobName;
    var userId = req.user.local.id;
    db.deleteJob(job, function (err) {
      if (!err) {
        res.redirect('/admin');
      } else {
        res.send(err);
      }
    });

  });


  app.post('/clockOut', mid.isAuth, function (req, res) {
    if (req.isAuthenticated() && req.user && req.user.local) {
        db.clockOut(req, function (err) { // this function must update the user table to set clockedIn to false and set the clock_in time to null (this shouldn't really search timesheet)
          if (!err) {
            res.redirect('/');
          } else {
            res.send(err);
          }
        });
    } else {
      res.redirect('/');
    }

  });

  app.post('/default_url_when_press_enter', mid.isAuth, function (req, res) {
    res.err({
      fr: "You pressed enter", 
      li: "/admin",
      ti: "Please choose a valid option: download or display"
    });  });

  app.post('/searchTimesheet', mid.isAuth, function (req, res) {

    if (req.isAuthenticated() && req.user && req.user.local) {

      if (req.user.local.user_type == 1) {


        var render = defaultRender(req);

        db.getCachedWeeks(function (err, getCachedWeeks) {

          render.weeks = getCachedWeeks;
          db.getJobs(req, res, function (err, jobs) {

            render.jobs = jobs;
            db.getTasks(req, res, function (err, tasks) {

              render.tasks = tasks;
              db.getUsers(function (err, rows) {

                // for each row, format the last_seen field use moment to get the 'x number of hours ago' format
                for (var i = 0; i < rows.length; i++) {
                  rows[i].last_seen = moment(rows[i].last_seen).fromNow();
                }
                render.users = rows;

                for (var i = 0; i < render.weeks.length; i++) {
                  if (render.weeks[i].id == req.body.weekId) {
                    render.weeks[i].selected = true;
                  }
                }

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

                db.getTimesheetQuery(req, res, startDate, endDate, req.body.userId, req.body.jobId, req.body.taskId, req.body.weekId, function (err, rows) {

                  if (!err && rows.length > 0) {
                    render.results = rows;
                  }

                  render.startDate = startDate;
                  render.endDate = endDate;



                  res.render("timesheet.html", render);
                });

              });

            });

          });

        });


      } else {

        res.send("You are not an admin :) sowwy bestie")
      }

    } else {

      res.render("/");

    }

  });






  app.post('/updateUser/', mid.isAuth, function (req, res) {
    if (req.user.local && req.user.local.user_type == 1) {
      if (req.user.local.user_type == 1) {


        db.updateUser(req, res, function (err) {
          res.redirect("/admin");
        });

      }
    }
  });

  app.get('/modifyUser/:id', mid.isAuth, function (req, res) {
    if (req.user.local && req.user.local.user_type == 1) {

      if (req.user.local.user_type == 1) {
        var userId = req.params.id;
        var render = defaultAdminRender(req);
        db.getUser(userId, function (user) {
          render.user = user;
          //console.log( render.user);
          res.render('modifyUser.html', render);
        });
      }

    }
  });

}

function arrayToCSV(objArray) {
  const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
  let str = `${Object.keys(array[0]).map(value => `"${value}"`).join(",")}` + '\r\n';

  return array.reduce((str, next) => {
    str += `${Object.values(next).map(value => `"${value}"`).join(",")}` + '\r\n';
    return str;
  }, str);
}



function defaultRender(req) {
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
        sysName: sys.SYSTEM_NAME
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
