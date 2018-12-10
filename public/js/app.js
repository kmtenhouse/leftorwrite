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
                    /* console.log("changed username!"); */
                });
            }
            else{
                $("#errorModal").modal("show");
/*                 console.log("Username already exists!"); */
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
function createPageObj(linksArr) {
   /*  console.log("inside createPageObj function ");
    console.log("linksArr = ", linksArr); */
    var id = $("#authorNotes").data("page-id"); // will be page id
    var pageTitle = $("#authorNotes").val().trim(); // will be author quick notes
    var pageContent = $("#pageContent").val().trim(); // page content, we need to add a return fixer here
    var storyid = $("#titleHeader").data("story-id"); // will be story id
    var ifStart = $("#titleHeader").data("start"); // boolean if this is a start page, set in the handlebars
    var ifEnd = $("#end").hasClass("active"); // should return a boolean, but the front end isn't built yet
    var ifTBC = $("#tbc").hasClass("active"); // same as the end button
    var ifLinked = false; 
    if(linksArr.length > 0){
        ifLinked = true;
    }
    var parentLinks = $("#titleHeader").data("incoming"); // should return the id(s) of the incoming links
    /* console.log(parentLinks); */
    if (parentLinks) {
        var parentLinksArr = parentLinks.split(",");
        // need the pop because of the way I did the page in handlebars. It's messy.
        parentLinksArr.pop();
        var ifOrphaned = parentLinksArr.length===0;
    }
    else {
        ifOrphaned = true;
    }
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
        pageid: id,
        children: JSON.stringify(linksArr)
    };
/*     console.log("pageObj = ", pageObj); */
    return pageObj;
}
// Create links object
function createLinks() {
    var links = $(".link-text");
    var linksArray = [];
    var toPageArray = [];
    var linkObjArray = [];
    for(var i = 0; i < links.length; i++){
        if($(links[i]).val().length === 0){
            $(links[i]).val("Continue");
        }
        linksArray.push($(links[i]).val());
        toPageArray.push($(links[i]).siblings(".input-group-append").children(".link-page-dropdown").val());
        /* console.log("toPageArray = ", toPageArray); */
        var linkObj = {
            linkName: linksArray[i],
            ToPageId: toPageArray[i]
        };
        linkObjArray.push(linkObj);
    }
    console.log(linkObjArray);
    return linkObjArray;
}
// Create page
function savePage(pageObj, clickedContinue){
    // console.log("");
  /*   console.log("pageObj = ", pageObj);
    console.log(clickedContinue); */
    if($("#authorNotes").data("page-id") === ""){
        return $.ajax("/api/page/create/", {
            type: "POST",
            data: pageObj
        }).then(function (result, status) {
            if (status === "success") {
                // if(pageObj.isLinked){
                //     return [result.authorId, result.pageId];
                // }
                window.location = "/story/write/" + result.storyId + "/pages/" + result.pageId;
            }
        });
    }
    else {
        $.ajax("/api/page/update/" + pageObj.pageid, {
            type: "PUT",
            data: pageObj
        }).then(function (result, status) {
            if(status === "success"){
                if(clickedContinue){
                    window.location = "/story/write/" + result.storyId + "/pages/" + result.toPageId;
                }
                else{
                    location.reload();
                }
            }
        });
    }
}

async function newBlankLink(pagesArray) {
    var currentPage = $("#authorNotes").data("page-id");
    var newlink = $("<div>").addClass("form-row col-12 mb-3 px-0 link-row");
    var linkAddons = $("<div>").addClass("row col-12 col-md-5 pr-0 mr-0 input-group-append");
    var linkTextInput = $("<input id=\"link-new-text\" type=\"text\" maxlength=\"100\" placeholder=\"Link text -  what your readers will see.\" aria-label=\"Link text -  what your readers will see.\">");
    linkTextInput.addClass("form-control col-12 col-md-7 link-text");
    var linkPageDropdown = $("<select>").attr("id", "link-new-dropdown");
    var blankPageOption = $("<option value=\"blank\">New Blank Page</option>");
    linkPageDropdown.append(blankPageOption);
    for(var i = 0; i < pagesArray.length; i++){
        if(pagesArray[i].id !== currentPage){
            var newOption = $("<option>").val(pagesArray[i].id).text(pagesArray[i].title);
            linkPageDropdown.append(newOption);
        }
    }
    linkPageDropdown.addClass("form-control input-group-text col-8 link-page-dropdown");
    var linkClose = $("<span class=\"input-group-text col-2\"><button type=\"button\" class=\"close\" id=\"link-new-close\" data-line-id=\"new\" aria-label=\"delete link\"><span aria-hidden=\"true\">&times;</span></button></span>");
    linkAddons.append(linkPageDropdown, linkClose);
    newlink.append(linkTextInput, linkAddons);
    return newlink;
}

// connect the functions to the buttons
// save page needs to just save the page info and it's links, if it has any. 
// Will have logic for create new vs update existing
$(document).on("click", "#savePage", async function (event) { 
    event.preventDefault();
    var links = createLinks();
    var pageObj = createPageObj(links);
    /* console.log(pageObj); */
    savePage(pageObj);
});

// continue will also save a page, and create a "continue" link with a new blank page on the other end
// then redirect to the newly created page for editing
$(document).on("click", "#continue", function (event) {
    event.preventDefault(); 
    var clickedContinue = true;
    if (!$(this).hasClass("disabled")) {
        var links = [{
            linkName: "Continue",
            ToPageId: "blank"
        }];
        var pageObj = createPageObj(links);
        savePage(pageObj, clickedContinue);
    }
});

// choices will open the link editor
$(document).on("click", "#choices", function (event) {
    event.preventDefault(); 
    var that = $(this);
    var storyId = $("#titleHeader").data("story-id");
    $.ajax("/api/story/" + storyId + "/allpages", {
        type: "GET"
    }).then(function(pages){
        newBlankLink(pages).then(function(newlink){
            /* console.log(newlink); */
            if (!that.hasClass("disabled")) {
                that.toggleClass("active");
                $("#continue, #end, #tbc").toggleClass("disabled");
                $("#link-editor").toggle(1000);
                if (that.hasClass("active")) {
/*                     console.log("append new links"); */
                    $("#link-list").append(newlink);
        
                }
                else {
                    $("#link-list").empty();
                    $("#add-link-btn").prop("disabled", false);
                }
            }
        });
    });
    
});
// button inside link editor, adds new link when clicked
$(document).on("click", "#add-link-btn", function(event) {
    event.preventDefault();
    $(".next-page").addClass("disabled");
    var that = $(this);
    var storyId = $("#titleHeader").data("story-id");
    $.ajax("/api/story/" + storyId + "/allpages", {
        type: "GET"
    }).then(function(pages){
        newBlankLink(pages).then(function(newlink){
            $("#link-list").append(newlink);
            // console.log($(".link-text").length);
            var listLength = $(".link-text").length;
            if (listLength === 3) {
                that.prop("disabled", true);
            }
        });
    });
});
// end will mark this page, save changes, and disable other buttons. Needs to toggle.
$(document).on("click", "#end", function (event) {
    event.preventDefault(); 
    if (!$(this).hasClass("disabled")) {
        $(this).toggleClass("active");
        $("#continue, #choices, #tbc").toggleClass("disabled");
    }
});
// same as end for tbc
$(document).on("click", "#tbc", function (event) {
    event.preventDefault(); 
    if (!$(this).hasClass("disabled")) {
        $(this).toggleClass("active");
        $("#continue, #choices, #end").toggleClass("disabled");
    }
});
// uses the delete route, and will also need to remove all links from all decendants
// ideally has confirm modal
$(document).on("click", "#deletePage", function (event) {
    event.preventDefault(); 
});

$(document).change("select[class=\"link-page-dropdown\"]", function(){
    $(".next-page").addClass("disabled");
});

$(document).on("click", ".close", function () {
    $(this).parent().parent().parent().remove();
    $("#add-link-btn").prop("disabled", false);
});