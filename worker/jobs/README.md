We can access arbitrary data passed in to process via the job.data property.
When an error occurs we invoke done(err) to tell Kue something happened, 
otherwise we invoke done() only when the job is complete. If this function 
responds with an error it will be displayed in the UI and the job will be 
marked as a failure.

Workers can also pass job result as the second parameter to done done(null,result)
to store that in Job.result key. result is also passed through complete event 
handlers so that job producers can receive it if they like to.