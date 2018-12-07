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
    if (string.length < min || string.length > max || containsSpecial === true) {
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

$(document).ready(function () {
    var retVal;
    // make tags loaded with class checked actually checked
    $(".checked").prop("checked", true);
    $(".checked").each(function () {
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

//GLOBAL VARIABLES
//Locally store our tag variables so that we don't iterate over them all each time something is checked or unchecked ;)
var tagsArr = [];
//Helper function to display the currently selected tags to the user
function updateTagDisplay(newTag, checkedStatus) {
    // if it's a brand new tag (recently clicked as true)
    if (checkedStatus === true) {
        tagsArr.push(newTag);
        tagsArr.sort();
        $("#chosenTags").val(tagsArr.join(", "));
    }
    // if tag is not checked, see if it's in our current tag array -- and remove it!
    else if (checkedStatus === false) {
        //find it in the array:
        var currentIndex = tagsArr.indexOf(newTag);
        if (currentIndex >= 0) { //juuuust sanity checking that the index value is real ;)
            tagsArr.splice(currentIndex, 1);
            // Populate to chosen tags field
            $("#chosenTags").val(tagsArr.join(", "));
        }
    }

}

// Call filterTags function when anything is typed in the tag searchbar
$(document).on("keyup", "#tagSearch", filterTags);

// Display checked tags in chosen tags field.
$(document).on("click", ".tag", function () {
    //first, grab the name of this particular tag
    var tag = $(this).data("tag-name");
    //next, grab the checked/unchecked status
    //will be TRUE if checked, FALSE if not checked
    var newCheckedStatus = ($(this).prop("checked"));
    //finally, update the tag display!
    updateTagDisplay(tag, newCheckedStatus);
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
    $(".content-warning").each(function () {
        var status = $(this).hasClass("active");
        var id = $(this).attr("id");
        warns[id] = status;
    });
    $(".tag").each(function () {
        if ($(this).prop("checked") === true) {
            var tag = $(this).data("tag-id");
            storytags.push(tag);
        }
    });
    var storyObj = {
        title: $("#storyTitle").val().trim(),
        chooseNotToWarn: warns.chooseNotToWarn,
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
    else {
        $.ajax("/api/story/update/" + id, {
            type: "PUT",
            data: storyObj
        }).then(function () {
            location.reload();
        });
    }
});

// CREATE ROUTE FOR TAGS
$(document).on("click", "#saveTag", function () {
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
            error(xhr, status, error) {
                if (error === "Conflict") {
                    openPopover("#newTagInput", tagAlreadyExists);
                    // Populate modal input field value back to searchbar on save, 
                    // and call filter function again
                    $("#tagSearch").val(newtag);
                    filterTags();
                }
            }
        }).then(function (result, status) {
            //if we succeeded in adding the tag, we'll add it to the tag list, check it, and close the modal
            if (status === "success") {
                console.log("success");
                console.log(result);
            }
            // add the new tag to the list without refreshing the page
            var successfulTagListItem = $("<li class=\"list-group-item\">");
            var successfulTagHolder = $("<div class=\"form-check\">");
            var successfulTagLabel = $("<label class=\"form-check-label\" for=\"tag" + result.id + "\">" + result.tagName + "</label>");
            var successfulTagCheckBox = $("<input type=\"checkbox\" class=\"form-check-input tag\" id=\"tag" + result.id +
                "\" data-tag-name=\"" + result.tagName + "\" data-tag-id=\"" + result.id + "\">");
            successfulTagCheckBox.prop("checked", true);
            successfulTagHolder.append(successfulTagCheckBox);
            successfulTagHolder.append(successfulTagLabel);
            successfulTagListItem.append(successfulTagHolder);
            $("#tagList").children().last().before(successfulTagListItem);
            // Populate new tag value back to searchbar on save, 
            // and call filter function again
            $("#tagSearch").val(newtag);
            //narrow the filter down to showcase this new tag
            filterTags();
            //also show that we're including it 
            updateTagDisplay(result.tagName, true);
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
    else {
        $.ajax("*", {
            type: "GET"
        });
    }
});

// OTHER BUTTONS 
// links to other pages 
// view story
$(document).on("click", "#viewStory", function (event) {
    event.preventDefault();
    var storyId = $("#storyTitle").data("id");
    var url = "/story/overview/" + storyId;
    window.location = url;
});
// create new page
$(document).on("click", "#createNewPage", function (event) {
    event.preventDefault();
    var storyId = $("#storyTitle").data("id");
    var url = "/story/write/" + storyId + "/pages";
    window.location = url;
});
// buttons that change story's booleans
// mark as finished
// publish story
// done by default checkbox