function checkIn(jobId){
    console.log("Checking in for job: " + jobId);
    $.ajax({
        url: '/checkIn/' + jobId,
        type: 'POST',
        success: function(result){
            // redirect to /dailyLog/:jobId
            window.location.href = '/dailyLog/' + jobId;
        }
    })
}