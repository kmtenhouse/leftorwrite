//
var validators = {
    //Check if a given id is valid for a story or page
    //Ids are 'valid' when they are positive, non-zero integers
    //NOTE: we could either expect a string OR an integer here
    //It will be VALID if the item CAN successfully be parsed by parseInt
    //We still have to do that parsing 
    isvalidid: function(idToTest) {
        //We expect a string from the front end -- anything else is automatically invalid
        //(For example, objects)
        if(typeof(idToTest)!=="string") {
            return false;
        }
        //now check if the string contains any invalid characters
        //(because javascript parses do dumb things when you start with numbers but end with letters
        var numbersOnly = /^[0-9]*$/;
        if(!idToTest.toString().match(numbersOnly)) {
            return false;
        }
        //now, cast the item to an integer and check the value -- 
        //it needs to be positive and non-zero!
        if(parseInt(idToTest) <= 0) {
            return false;
        }
        //if we passed all these checks, we are good!
        return true;
    }
}

module.exports = validators;