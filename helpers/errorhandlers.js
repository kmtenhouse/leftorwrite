//Helper functions that will provide a useful status code or human-readable error message
//that we can send to users for apiroutes and html routes
//(TO-DO): think through better logic about how to redirect users where appropriate
module.exports = {
    messageTemplate: function (err) {
        if(typeof(err)!=="object") {
            throw new Error("Error handler module expects an object!");
        }
        //create an object to hold info about the error that we'll pass to the front end
        var errorInfo = {}; 
        //now look at the error object to figure out what to say!
        switch (err.message) {
        case "Invalid Story Id":
            errorInfo.errorMessage = "Sorry, that's not a story.";
            errorInfo.url = "/";
            errorInfo.linkDisplay = "← Return Home";
            break;
        case "Invalid Author Id":
            errorInfo.errorMessage = "Please log in first!";
            errorInfo.url = "/";
            errorInfo.linkDisplay = "← Return Home";
            break;
        case "Invalid Page Id": 
            errorInfo.errorMessage = "Sorry, that's not a page.";
            errorInfo.url = "/";
            errorInfo.linkDisplay = "← Return Home";
            break;   
        case "Invalid Tag Id":
            errorInfo.errorMessage = "What tag were you looking for?";
            errorInfo.url = "/tags";
            errorInfo.linkDisplay = "← See All Tags";
            break;      
        case "Story Not Found":
            errorInfo.errorMessage = "Sorry, we couldn't find that story.";
            errorInfo.url = "/";
            errorInfo.linkDisplay = "← Return Home";
            break;
        case "Page Not Found":
            errorInfo.errorMessage = "Sorry, we couldn't find that page.";
            errorInfo.url = "/";
            errorInfo.linkDisplay = "← Return Home";         
            break;
        case "Story Permission Denied":
            errorInfo.errorMessage = "Hands off!";
            errorInfo.url = "/";
            errorInfo.linkDisplay = "← Return Home";
            break;
        case "Story Not Public":
            errorInfo.errorMessage = "That story's not ready for prime-time!";
            errorInfo.url = "/";
            errorInfo.linkDisplay = "← Return Home";
            break;
        case "Page Permission Denied": 
            errorInfo.errorMessage = "Hands off!";
            errorInfo.url = "/";
            errorInfo.linkDisplay = "← Return Home";
            break;
        case "Orphaned Page": 
            errorInfo.errorMessage = "That page isn't ready for prime-time!";
            errorInfo.url = "/";
            errorInfo.linkDisplay = "← Return Home";
            break;
        case "Page Not Finished":
            errorInfo.errorMessage = "That page isn't ready for prime-time!";
            errorInfo.url = "/";
            errorInfo.linkDisplay = "← Return Home";
            break;
        default: //if we get a misc error, assume server error
            errorInfo.errorMessage = "Sorry, something went wrong.";
            errorInfo.url = "/";
            errorInfo.linkDisplay = "← Return Home";
            break;
        }
        return errorInfo;
    },
    statusCode: function(err) {
        if(typeof(err)!=="object") {
            throw new Error("Error handler module expects an object!");
        }
        //otherwise, send the right type of status (depending on the error)
        var statusNumber;
        switch(err.message) {
        //status numbers for malformed requests
        case "Invalid Story Id":
            statusNumber = 400;
            break;
        case "Invalid Author Id":
            statusNumber = 400;
            break;
        case "Invalid Page Id": 
            statusNumber = 400;
            break;
        case "Invalid Tag Id":
            statusNumber = 400;
            break;
            //status numbers for 404s (not found)
        case "Story Not Found":
            statusNumber = 404;
            break;
        case "Page Not Found":
            statusNumber = 404;
            break;
        case "Story Not Public": 
            statusNumber = 403;
            break;
        case "Story Permission Denied":
            statusNumber = 403;
            break;
        case "Page Permission Denied":
            statusNumber = 403;
            break;
        case "Orphaned Page":
            statusNumber = 403;
            break;
        case "Page Not Finished":
            statusNumber = 403;
            break;
        default: 
            statusNumber = 500;
            break;
        }
        return statusNumber;
    }
};