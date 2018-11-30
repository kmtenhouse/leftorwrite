$("#newUsernameForm").on("submit", function(event){
    event.preventDefault();
    var newUsername = $("#username-input").val().trim();
    $.get("/api/user/" + newUsername).then(function(data, status){
        if(data.length === 0 && status === "success"){
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
        }
        else{
            $("#errorModal").modal("show");
            console.log("Username already exists!");
        }
    });
    
});
