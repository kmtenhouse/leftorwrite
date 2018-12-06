// VARIABLES
// Regular expression to test input
// contains at least one special character, or repeating spaces/dashes
var specialCharTest = new RegExp(/[^- 0-9a-z]+|[ -]{2,}/i);

// message for the story title popover
var titleMustBe = "Titles must be 2-100 characters with only letters, numbers, dashes and spaces. Dashes and spaces cannot repeat.";
// messages for the tag popover
var tagsMustBe = "Tags must be 2-50 characters with only letters, numbers, dashes and spaces. Dashes and spaces cannot repeat.";
var tagAlreadyExists = "That tag already exists. If you can't find it using the searchbar, try saving your changes and refreshing the page.";

// multiuse functions
// test string from input against regex returns true if string is invalid
function badInputTest(string, min, max) {
    var containsSpecial = specialCharTest.test(string);
    if (string.length < min|| string.length > max || containsSpecial === true) {
        return true;
    }
}
// open popover function
function openPopover(location, message) {
    // if not dispose, text won't change (needed for tags)
    $(location).popover("dispose");
    $(location).popover({
        content: message,
        placement: "top"
    });
    $(location).popover("show");
}


$(document).ready(function() {
    var retVal;
    // make tags loaded with class checked actually checked
    $(".checked").prop("checked", true);
    $(".checked").each(function() {
        // if tag is checked
        if ($(this).hasClass("checked")) {
            var tag = $(this).data("tag-name");
            tagsArr.push(tag);
            tagsArr.sort();
            retVal = tagsArr.join(", ");
        }
    });
    // Populate to chosen tags field
    $("#chosenTags").val(retVal);
    // if on create page, disable story buttons other than save changes
    var thisurl = window.location.href;
    var pattern = new RegExp("story/create");
    if (pattern.test(thisurl)) {
        $("#viewStory, #createNewPage, #deleteStory").attr("disabled", "disabled");
    }
});

function filterTags() {
    // VARIABLES
    var input = document.getElementById("tagSearch");
    var filter = input.value.toUpperCase();
    var ul = document.getElementById("tagList");
    var li = ul.getElementsByTagName("li");

    // Loop through list items (except button at end), 
    // and hide those that don't match the search query
    for (var i = 0; i < li.length - 1; i++) {
        var txtValue = li[i].textContent || li[i].innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            li[i].style.display = "";
        } else {
            li[i].style.display = "none";
        }
    }
}
// Call filterTags function when anything is typed in the tag searchbar
$(document).on("keyup", "#tagSearch", filterTags);

// Declare tags array variable for sorting purposes.
var tagsArr = [];
// Display checked tags in chosen tags field.
$(document).on("click", ".tag", function () {
    var tag = $(this).data("tag-name");
    var retVal = "";
    // if tag is checked
    if ($(this).prop("checked") === true) {
        tagsArr.push(tag);
        tagsArr.sort();
        retVal = tagsArr.join(", ");
    }
    // if tag is not checked
    else if ($(this).prop("checked") === false) {
        for (var i = 0; i < tagsArr.length; i++) {
            if (tagsArr[i] === tag) {
                tagsArr.splice(i, 1);
                retVal = tagsArr.join(", ");
            }
        }
    }
    // Populate to chosen tags field
    $("#chosenTags").val(retVal);
});
// Populate searchbar input to input field on tag creation modal
$(document).on("click", "#tagModalButton", function () {
    $("#newTagInput").val($("#tagSearch").val());
});

// FIXME: This code doesn't work yet, but putting in on the back burner for now
// $(document).on("click", "#chooseNotToWarn", function () {
//     if ($(this).hasClass("active")) {
//         $(".content-warning").toggleClass("active");
//     }
// });

// API ROUTES

// CREATE AND UPDATE ROUTES FOR STORY
$(document).on("click", "#saveChanges", function (event) {
    event.preventDefault();
    var id = $("#storyTitle").data("id");
    var title = $("#storyTitle").val().trim();
    if (title !== "") { 
        if (badInputTest(title, 2, 100)) {
            $(window).scrollTop(0);
            return openPopover("#storyTitle", titleMustBe);
        }
    }
    var warns = {};
    var storytags = [];
    $(".content-warning").each(function() {
        var status = $(this).hasClass("active");
        var id = $(this).attr("id");
        warns[id] = status;
    });
    $(".tag").each(function() {
        if ($(this).prop("checked") === true) {
            var tag =  $(this).data("tag-id");
            storytags.push(tag);
        }
    });
    var storyObj = {
        title: $("#storyTitle").val().trim(),
        chooseNotToWarn: warns.chooseNotToWarn ,
        violence: warns.violence,
        nsfw: warns.nsfw,
        nonConsent: warns.nonConsent,
        characterDeath: warns.characterDeath,
        profanity: warns.profanity,
        tags: storytags.toString()
    }; 
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
});

// CREATE ROUTE FOR TAGS
$(document).on("click", "#saveTag", function() {
    event.preventDefault();
    var newtag = $("#newTagInput").val().trim();
    if (badInputTest(newtag, 2, 50)) {
        openPopover("#newTagInput", tagsMustBe);
    }
    else {
        $.ajax("/api/tag/create", {
            type: "POST",
            data: {
                tagName: newtag
            },
            error(xhr,status,error) {
                if (error === "Conflict") {
                    openPopover("#newTagInput", tagAlreadyExists);
                    // Populate modal input field value back to searchbar on save, 
                    // and call filter function again
                    $("#tagSearch").val(newtag);
                    filterTags();
                }
            }
        }).then(function (result, status) {
            if (status==="success") {
                console.log("success");
                console.log(result);
            }
            // add the new tag to the list without refreshing the page
            var successfulTag = "<li class=\"list-group-item\">" + 
            "<div class=\"form-check\">" +
            "<input type=\"checkbox\" class=\"form-check-input tag\" id=\"tag"+ result.id + 
            "\" data-tag-name=\""+ result.tagName + "\" data-tag-id=\""+ result.id +"\">" +
            "<label class=\"form-check-label\" for=\"tag"+ result.id + "\">" + result.tagName +"</label>" +
            "</div></li>";
            successfulTag.prop("checked", true);
            $("#tagList").children().last().before(successfulTag);
            // Populate new tag value back to searchbar on save, 
            // and call filter function again
            $("#tagSearch").val(newtag);
            filterTags();
            $("#createTagModal").modal("hide");
        });
    }
});

// DELETE ROUTE
$(document).on("click", "#deleteStory", function () {
    event.preventDefault();
    var id = $("#storyTitle").data("id");
    if (id !== "") {
        $.ajax("/api/story/" + id, {
            type: "DELETE"
        }).then(function (result, status) {
            if (status === "success") {
                window.location = "/";
            }
        });
    }
    // if no id, not created yet, therefore no delete. add error
    else{
        $.ajax("*", {
            type: "GET"
        });
    }
});

// OTHER BUTTONS 
// links to other pages 
// view story
$(document).on("click", "#viewStory", function(event) {
    event.preventDefault();
    var storyId = $("#storyTitle").data("id");
    var url = "/story/overview/" + storyId;
    window.location = url;
});
// create new page
$(document).on("click", "#createNewPage", function(event){
    event.preventDefault();
    var storyId = $("#storyTitle").data("id");
    var url = "/story/write/" + storyId + "/pages";
    window.location = url;
});
// buttons that change story's booleans
// mark as finished
// publish story
// done by default checkbox