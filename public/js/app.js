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

$(".scroll-to").on("click", function(e){
    var jump = $(this).attr("href");
    var newPosition = $(jump).offset();
    $("html, body").stop().animate({ scrollTop: newPosition.top }, 500);
    e.preventDefault();
});


// PAGE CREATE AND EDIT FUNCTIONALITY
// save changes after edit
// save page function
function savePage() {
    var id = $("#authorNotes").data("page-id"); // will be page id
    var pageTitle = $("#authorNotes").val().trim(); // will be author quick notes
    var pageContent = $("#pageContent").val().trim(); // page content, we need to add a return fixer here
    var storyid = $("#titleHeader").data("story-id"); // will be story id
    var ifStart = $("#titleHeader").data("start"); // boolean if this is a start page, set in the handlebars
    var ifEnd = $("#end").hasClass("active"); // should return a boolean, but the front end isn't built yet
    var ifTBC = $("#tbc").hasClass("active"); // same as the end button
    // .lenth returns number of items (with this class)
    var ifLinked = $(".link-text").length>0; // not sure if this syntax works, trying to get a boolean
    var links = $(".link-text");
    console.log("Link texts = ", links);
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
        $.ajax("/api/page/create/", {
            type: "POST",
            data: pageObj
        }).then(function (result, status) {
            if (status === "success") {
                window.location = "/story/write/" + result.storyId + "/pages/" + result.pageId;
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

function newBlankLink() {
    var newlink = $("<div>").addClass("form-row col-12 mb-3 px-0");
    var linkAddons = $("<div>").addClass("row col-12 col-md-4 pr-0 mr-0 input-group-append");
    var linkTextInput = $("<input id=\"link-new-text\" type=\"text\" maxlength=\"100\" placeholder=\"Link text -  what your readers will see.\" aria-label=\"Link text -  what your readers will see.\">");
    linkTextInput.addClass("form-control col-12 col-md-8 link-text");
    var linkPageDropdown = $("<select id=\"link-new-dropdown\"><option>New Blank Page</option></select>");
    linkPageDropdown.addClass("form-control input-group-text col-10 link-page-dropdown");
    var linkClose = $("<span class=\"input-group-text col-2\"><button type=\"button\" class=\"close\" id=\"link-new-close\" data-line-id=\"new\" aria-label=\"delete link\"><span aria-hidden=\"true\">&times;</span></button></span>");
    linkAddons.append(linkPageDropdown, linkClose);
    newlink.append(linkTextInput, linkAddons);
    return newlink;
}

// connect the functions to the buttons
// save page needs to just save the page info and it's links, if it has any. 
// Will have logic for create new vs update existing
$(document).on("click", "#savePage", function (event) { 
    event.preventDefault();
    savePage(); 
});
// continue will also save a page, and create a "continue" link with a new blank page on the other end
// then redirect to the newly created page for editing
$(document).on("click", "#continue", function (event) {
    event.preventDefault(); 
    if (!$(this).hasClass("disabled")) {
        // savePage();
    }
});
// choices will open the link editor
$(document).on("click", "#choices", function (event) {
    event.preventDefault(); 
    var newlink = newBlankLink();
    if (!$(this).hasClass("disabled")) {
        $(this).toggleClass("active");
        $("#continue, #end, #tbc").toggleClass("disabled");
        $("#link-editor").toggle();
        if ($(this).hasClass("active")) {
            $("#link-list").append(newlink);

        }
        else {
            $("#link-list").empty();
            $("#add-link-btn").prop("disabled", false);
        }
        // savePage();
    }
});
// button that only appears when "choices" is clicked, adds new link
$(document).on("click", "#add-link-btn", function(event) {
    event.preventDefault();
    var newlink = newBlankLink();
    $("#link-list").append(newlink);
    console.log($(".link-text").length);
    var listLength = $(".link-text").length;
    if (listLength === 3) {
        $(this).prop("disabled", true);
    }
});
// end will mark this page, save changes, and disable other buttons. Needs to toggle.
$(document).on("click", "#end", function (event) {
    event.preventDefault(); 
    if (!$(this).hasClass("disabled")) {
        $(this).toggleClass("active");
        $("#continue, #choices, #tbc").toggleClass("disabled");
        // savePage();
    }
});
// same as end
$(document).on("click", "#tbc", function (event) {
    event.preventDefault(); 
    if (!$(this).hasClass("disabled")) {
        $(this).toggleClass("active");
        $("#continue, #choices, #end").toggleClass("disabled");
        // savePage();
    }
});
// uses the delete route, and will also need to remove all links from all decendants
$(document).on("click", "#deletePage", function (event) {
    event.preventDefault(); 
    var id = $("#authorNotes").data("page-id"); // will be page id
});

