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
        $("#newUsername").html(newUsername);
        $("#updateUsernameModal").modal("show");
        console.log("changed username!");
    });
});
