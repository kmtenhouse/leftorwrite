var usernameRegex = /^(?!_)(?!.*__)[\w+|\w+ ?\w+]{3,50}(?<!_\s)$/;

$("#newUsernameForm").on("submit", function(event){
    event.preventDefault();
    var newUsername = $("#username-input").val().trim();
    if(usernameRegex.test(newUsername)){
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
    }
    else{
        $("#username-input").popover({
            content: "Username must be 3-50 characters with only letters, numbers, underscores and spaces. Underscores and spaces cannot repeat.",
            placement: "bottom"
        });
        $("#username-input").popover("show");
    }
});


// PAGE CREATE AND EDIT FUNCTIONALITY
// save changes after edit
$(document).on("click", "#savePage", function (event) {
    event.preventDefault();
    var id = $("#authorNotes").data("page-id");
    var pageTitle = $("#authorNotes").val().trim();
    var pageContent = $("#pageContent").val().trim();
    var storyid = $("#titleHeader").data("story-id");
    var ifStart = $("#titleHeader").data("start");
    var ifEnd = 
    var ifLinked
    var ifOrphaned
    var contentFinished
    var pageObj = {
        title: pageTitle,
        content: pageContent,
        isStart: req.body.isStart,
        isTBC: req.body.isTBC,
        isEnding: req.body.isEnding,
        isLinked: req.body.isLinked,
        isOrphaned: req.body.isOrphaned,
        contentFinished: req.body.contentFinished,
        storyid: storyid,
        pageid: id
    }
    // CREATE
    if (id === "") {
        $.ajax("/api/story/create/", {
            type: "POST",
            data: storyObj
        }).then(function (result, status) {
            console.log(status);
            console.log(result);
            if (status === "success") {
                window.location = "/story/settings/" + result.id;
            }
        });
    }
    // UPDATE
    else{
        $.ajax("/api/story/update/" + id, {
            type: "PUT",
            data: storyObj
        }).then(function () {
            location.reload();
        });
    }

})

