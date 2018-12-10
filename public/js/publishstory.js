function showDynamicModal(headerMsg, bodyMsg, buttonMsg) {
    $("#dynamicModalLabel").text(headerMsg);
    $("#dynamicModalBody").text(bodyMsg);
    $("#dynamicModalCloseBtn").text(buttonMsg);
    $("#dynamicModal").modal("show");
}

function publishStory(myStoryId) {
    //takes in a story id and attempts to publish the story!
    $.ajax({
        url: "/api/story/publish",
        type: "PUT",
        dataType: "json",
        data: { storyId: myStoryId, isPublic: true },
        success: function (data) {
            //upon success, check the object we got back...
            if (data.success) {
                //and if our publish was successful, we update the text to show success, and set the status to published!
                $(".publish-btn").text("Your story is LIVE!");
                $(".publish-btn").addClass("success");
                $(".publish-btn").data("publish-status", "published");
            }
            else {
                //otherwise, give the user feedback...
                showDynamicModal("Whoops, your story's not quite ready...", "Before you go live, you'll need to fix your story up a little bit. Please make sure you have at least two pages (a start and an ending) and no unlinked or unfinished pages in your story.", "Okay, I got it!");
            }
        },
        error: function (xhr, textStatus, errorThrown) {
            showDynamicModal("Whoops, something went wrong here!", "Please try again later.", "Close");
        }
    });
}

function unpublishStory(myStoryId) {
    //takes in a story id and attempts to unpublish the story!
    $.ajax({
        url: "/api/story/publish",
        type: "PUT",
        dataType: "json",
        data: { storyId: myStoryId, isPublic: false },
        success: function (data) {
            //upon success, check the object we got back...
            if (data.success) {
                //and if our publish was successful, we update the text to show success, and set the status to published!
                $(".publish-btn").text("Publish Story");
                $(".publish-btn").removeClass("success");
                $(".publish-btn").data("publish-status", "unpublished");
            }
            else { //otherwise give the user an error
                showDynamicModal("Whoops, something went wrong!", "Please try again later.", "Close");
            }
        },
        error: function (xhr, textStatus, errorThrown) {
          showDynamicModal("Whoops, something went wrong here!", "Please try again later.", "Close");
        }
    });
}


$(document).on("click", ".publish-btn", function (event) {
    event.preventDefault();
    //grab whichever story this is from the button's story-id data attribute
    var thisStory = $(this).data("story-id");
    //now figure out what the current status is
    var currentStatus = $(this).data("publish-status");
    //we're going to toggle the status 
    if(currentStatus==="published") {
        unpublishStory(thisStory); //if it's currently published, we undo that action
    }
    else if(currentStatus==="unpublished") {
        publishStory(thisStory); //otherwise if it's not yet published, we attempt to publish
    }
}); 
