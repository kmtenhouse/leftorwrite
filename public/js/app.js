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
// save page function
function savePage(event) {
    event.preventDefault();
    var id = $("#authorNotes").data("page-id");
    var pageTitle = $("#authorNotes").val().trim();
    var pageContent = $("#pageContent").val().trim();
    var storyid = $("#titleHeader").data("story-id");
    var ifStart = $("#titleHeader").data("start");
    var ifEnd = $("#end").hasclass("active");
    var ifTBC = $("#tbc").hasclass("active");
    // .lenth returns number of items (with this class)
    var ifLinked = $(".link").length>0;
    var ifOrphaned = $("#titleHeader").data("incoming");
    var contentFinished = true;
    var pageObj = {
        title: pageTitle,
        content: pageContent,
        isStart: ifStart,
        isTBC: ifTBC,
        isEnding: ifEnd,
        isLinked: ifLinked,
        isOrphaned: ifOrphaned,
        contentFinished: contentFinished,
        storyid: storyid,
        pageid: id
    }
    // CREATE
    if (id === "") {
        $.ajax("/api/story/create/", {
            type: "POST",
            data: pageObj
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
            data: pageObj
        }).then(function () {
            location.reload();
        });
    }
}

// connect the functions to the buttons
$(document).on("click", "#savePage", savePage(event));
$(document).on("click", "#continue", savePage(event));
$(document).on("click", "#choices", savePage(event));
$(document).on("click", "#end", savePage(event));
$(document).on("click", "#tbc", savePage(event));
$(document).on("click", "#delete", );

