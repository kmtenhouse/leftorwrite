$("#newUsernameForm").on("submit", function(event){
    event.preventDefault();
    var newUsername = $("#username-input").val();
    var newUser = {
        username: newUsername
    };
    $.ajax("/api/user", {
        type: "PUT",
        data: newUser
    }).then(function(){
        console.log("changed username!");
    });
});
