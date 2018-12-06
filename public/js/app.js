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
    var id = $("#authorNotes").data("page-id"); // will be page id
    var pageTitle = $("#authorNotes").val().trim(); // will be author quick notes
    var pageContent = $("#pageContent").val().trim(); // page content, we need to add a return fixer here
    var storyid = $("#titleHeader").data("story-id"); // will be story id
    var ifStart = $("#titleHeader").data("start"); // boolean if this is a start page, set in the handlebars
    var ifEnd = $("#end").hasclass("active"); // should return a boolean, but the front end isn't built yet
    var ifTBC = $("#tbc").hasclass("active"); // same as the end button
    // .lenth returns number of items (with this class)
    var ifLinked = $(".link").length>0; // not sure if this syntax works
    var ifOrphaned = $("#titleHeader").data("incoming"); // should return the id(s) of the incoming links
    var contentFinished = true; // using this temporarily, eventually will be set by author.
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
    };
    // have logic for create and update, but may need to further separate
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
// save page needs to just save the page info and it's links, if it has any. 
// Will have logic for create new vs update existing
$(document).on("click", "#savePage", savePage(event));
// continue will also save a page, and create a "continue" link with a new blank page on the other end
// then redirect to the newly created page for editing
$(document).on("click", "#continue", savePage(event));
// choices will open the link editor
$(document).on("click", "#choices", savePage(event));
// end will mark this page, save changes, and disable other buttons. Needs to toggle.
$(document).on("click", "#end", savePage(event));
// same as end
$(document).on("click", "#tbc", savePage(event));
// uses the delete route, and will also need to remove all links from all decendants
$(document).on("click", "#deletePage", );

