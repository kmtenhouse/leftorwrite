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
function createPageObj(linkName = "") {
    var id = $("#authorNotes").data("page-id"); // will be page id
    var pageTitle = $("#authorNotes").val().trim(); // will be author quick notes
    var pageContent = $("#pageContent").val().trim(); // page content, we need to add a return fixer here
    var storyid = $("#titleHeader").data("story-id"); // will be story id
    var ifStart = $("#titleHeader").data("start"); // boolean if this is a start page, set in the handlebars
    var ifEnd = $("#end").hasClass("active"); // should return a boolean, but the front end isn't built yet
    var ifTBC = $("#tbc").hasClass("active"); // same as the end button
    // .lenth returns number of items (with this class)
    console.log($(".link-text").length)
    var ifLinked = $(".link-text").length>0; // not sure if this syntax works, trying to get a boolean
    console.log(ifLinked);
    var links = $(".link-text");
    if(linkName){
        links = linkName;
    }
    if(links.length > 0){
        ifLinked = true;
    }
    console.log(ifLinked);
    var parentLinks = $("#titleHeader").data("incoming"); // should return the id(s) of the incoming links
    var parentLinksArr = parentLinks.split(",")
    parentLinksArr.pop();
    console.log("parentLinksArr = ", parentLinksArr);
    var ifOrphaned = parentLinksArr.length===0;
    console.log(ifOrphaned);
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
    return pageObj;
}
// Create page
async function savePage(pageObj){
    return $.ajax("/api/page/create/", {
        type: "POST",
        data: pageObj
    }).then(function (result, status) {
        if (status === "success") {
            if(pageObj.isLinked){
                return [result.authorId, result.pageId];
            }
            window.location = "/story/write/" + result.storyId + "/pages/" + result.pageId;
        }
    });

}
// Update page
async function editPage(){
    $.ajax("/api/story/update/" + id, {
        type: "PUT",
        data: pageObj
    }).then(function () {
        location.reload();
    });
}

// Creates blank pages, used for when creating links to new pages
function createBlankPage() {
    var pageObj = {
        title: "Default Title",
        content: "Default Content", 
        isStart: false,
        isTBC: false,
        isEnding: false,
        isLinked: false,
        isOrphaned: false,
        contentFinished: false,
        storyid: $("#titleHeader").data("story-id")
    };
    return $.ajax("/api/page/create/", {
        type: "POST",
        data: pageObj
    }).then(function (result, status) {
        if (status === "success") {
            return result.pageId;
        }
    });
}

// Creates a single link that is continue only
function createContinueLink(fromPageId, toPageId) {
    var linkObj = {
        linkName: "Continue",
        storyId: $("#titleHeader").data("story-id"),
        fromPageId: fromPageId,
        toPageId: toPageId
    };
    $.ajax("/api/link/create", {
        type: "POST",
        data: linkObj
    }).then(function(result, status){
        console.log(status);
        if(status === "success"){
            window.location = "/story/write/" + result.storyId + "/pages/" + result.toPageId;
        }
    });
}

function createMultipleLinks(linksArray, fromPageId, toPageArray, blankPageArray, AuthorId){
    var linkObjArray = [];
    for(var i = 0; i < linksArray.length; i ++){

        if(toPageArray[i] !== "blank"){
            var toPageId = toPageArray[i];
        }
        else{
            toPageId = blankPageArray[0];
            blankPageArray.splice(0,1);
        }
        var linkObj = {
            linkName: linksArray[i],
            AuthorId: AuthorId,
            StoryId: $("#titleHeader").data("story-id"),
            FromPageId: fromPageId,
            ToPageId: toPageId
        };
        linkObjArray.push(linkObj);
    }
    $.ajax("/api/link/bulkcreate", {
        type: "POST",
        data: {newLinks: JSON.stringify(linkObjArray)}
    }).then(function(result, status){
        if(status === "success"){
            var storyId = result[0].StoryId;
            var fromPageId = result[0].FromPageId;
            window.location = "/story/write/" + storyId + "/pages/" + fromPageId;
        }
    });
}

async function createMultipleBlankPages(toPageArray, AuthorId){
    var createPagesArray = [];
    for(var i = 0; i < toPageArray.length; i ++){
        if(toPageArray[i] === "blank"){
            var pageObj = {
                title: "Default Title",
                content: "Default Content", 
                isStart: false,
                isTBC: false,
                isEnding: false,
                isLinked: false,
                isOrphaned: false,
                contentFinished: false,
                StoryId: $("#titleHeader").data("story-id"),
                AuthorId: AuthorId
            };
            createPagesArray.push(pageObj);
        }
    }
    console.log(createPagesArray);
    return $.ajax("/api/page/bulkcreate", {
        type: "POST",
        data: {newPages: JSON.stringify(createPagesArray)}
    }).then(function(result, status){
        if(status === "success"){
            return(result);
        }
    });
}

function newBlankLink() {
    var newlink = $("<div>").addClass("form-row col-12 mb-3 px-0 link-row");
    var linkAddons = $("<div>").addClass("row col-12 col-md-4 pr-0 mr-0 input-group-append");
    var linkTextInput = $("<input id=\"link-new-text\" type=\"text\" maxlength=\"100\" placeholder=\"Link text -  what your readers will see.\" aria-label=\"Link text -  what your readers will see.\">");
    linkTextInput.addClass("form-control col-12 col-md-8 link-text");
    var linkPageDropdown = $("<select id=\"link-new-dropdown\"><option value=\"blank\">New Blank Page</option><option value=\"snake\">Other snake</option></select>");
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
    var pageObj = createPageObj();
    var links = $(".link-text");
    var linksArray = [];
    var toPageArray = [];
    for(var i = 0; i < links.length; i++){
        if($(links[i]).val().length === 0){
            $(links[i]).val("Continue");
        }
        linksArray.push($(links[i]).val());
        toPageArray.push($(links[i]).siblings(".input-group-append").children("#link-new-dropdown").val());
    }
    savePage(pageObj).then(function(result){
        var AuthorId = result[0];
        var FromPageId = result[1];
        createMultipleBlankPages(toPageArray, AuthorId).then(function(newPagesId){
            console.log(newPagesId);
            createMultipleLinks(linksArray, FromPageId, toPageArray, newPagesId, AuthorId);
        });
    }); 
});

// continue will also save a page, and create a "continue" link with a new blank page on the other end
// then redirect to the newly created page for editing
$(document).on("click", "#continue", function (event) {
    event.preventDefault(); 
    if (!$(this).hasClass("disabled")) {
        var pageObj = createPageObj("Continue");
        savePage(pageObj).then(function(result){
            var fromPageId = result[1];
            createBlankPage().then(function(toPageId){
                createContinueLink(fromPageId, toPageId);
            });
        });
    }
});

// choices will open the link editor
$(document).on("click", "#choices", function (event) {
    event.preventDefault(); 
    var newlink = newBlankLink();
    if (!$(this).hasClass("disabled")) {
        $(this).toggleClass("active");
        $("#continue, #end, #tbc").toggleClass("disabled");
        $("#link-editor").toggle(1000);
        if ($(this).hasClass("active")) {
            $("#link-list").append(newlink);
        }
        else {
            $("#link-list").empty();
            $("#add-link-btn").prop("disabled", false);
        }
    }
});
// button inside link editor, adds new link when clicked
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
// also inside the link editor, one per link row,
// the close/delete button for an individual link
$(document).on("click", ".close", function (event) {
    event.preventDefault();
    $(this).parent().parent().parent().remove();
    $("#add-link-btn").prop("disabled", false);
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
// same as end for tbc
$(document).on("click", "#tbc", function (event) {
    event.preventDefault(); 
    if (!$(this).hasClass("disabled")) {
        $(this).toggleClass("active");
        $("#continue, #choices, #end").toggleClass("disabled");
        // savePage();
    }
});
// uses the delete route, and will also need to remove all links from all decendants
// ideally has confirm modal
$(document).on("click", "#deletePage", function (event) {
    event.preventDefault(); 
    var id = $("#authorNotes").data("page-id"); // will be page id
});

// THOUGHTS ON DISPLAYING PAGES IN DROPDOWN
// NEED TO
// not display current page
// display page titles for reader friendliness
// include page id for ease of manipulation, and in case of duplicate titles
// query the database when choices is clicked and render
// POSSIBILITIES

// this allows to check value, may not be needed for functionality
$(document).change("select[class=\"link-page-dropdown\"]", function(event){
    var selected = $(this).find("option:selected");
    // value is different from displayed text
    var value = selected.attr("value");
    console.log(value);
});

