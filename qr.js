const mid = require('./middleware.js');

module.exports = (app)=> {
    app.get('/qrGen/:jobId/', mid.isAuth, (req, res) => {
        var render = defaultRender(req);
        var jobId = req.params.jobId;

        if (req.isAuthenticated() && req.user && req.user.local) {
            db.getJobs(req, res, function (err, jobs) {
                render.jobs = jobs;
                db.getJobName(jobId, function (err, name) {
                    render.jobName = name;
                    db.getTasks(req, res, function (err, tasks) {
                        render.domain = sys.DOMAIN;
                        render.tasks = tasks;
                        // create job - task pair
                        render.jobTasks = [];

                        for (var j = 0; j < tasks.length; j++) {
                            var jobTaskPair = { job: jobId, task: tasks[j] };
                            render.jobTasks.push(jobTaskPair);
                        }

                        res.render('qr.html', render);
                    });
                });
            });
        }
    });

    app.get('/qr/:jobId/', mid.isAuth, (req, res) => {
        var render = defaultRender(req);
        if (req.isAuthenticated() && req.user && req.user.local) {
            db.clockInAndOut(req.user.local.id, req.params.jobId, function (err) {
                if (!err) {
                    res.redirect('/');
                } else {
                    var params = [];
                    params.fr = err;
                    res.err(params);
                }
            });
        }
    });
};
