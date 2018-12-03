$(document).ready(function() {
    var retVal;
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
// Populate modal input field value back to searchbar on save, 
// and call filter function again
$(document).on("click", "#saveTag", function () {
    $("#tagSearch").val($("#newTagInput").val());
    filterTags();
});

// FIXME: This code doesn't work yet, but putting in on the back burner for now
// $(document).on("click", "#chooseNotToWarn", function () {
//     if ($(this).hasClass("active")) {
//         $(".content-warning").toggleClass("active");
//     }
// });

// API ROUTES

// CREATE ROUTE AND UPDATE ROUTE
$(document).on("click", "#saveChanges", function (event) {
    event.preventDefault();
    var id = $("#storyTitle").data("id");
    
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
    console.log("storyObj: ", storyObj);
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

// DELETE ROUTE
$(document).on("click", "#deleteStory", function () {
    event.preventDefault();
    var id = $("#storyTitle").data("id");
    if (id !== "") {
        $.ajax("/api/story/" + id, {
            type: "DELETE"
        }).then(function (status) {
            console.log(status);
            if (status === "success") {
                window.location = "/";
            }
        });
    }
    // if no id, not created yet, therefore no delete. add error
    else{
        // some error handling here
    }
});