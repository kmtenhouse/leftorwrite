$(document).on("click", ".publish-btn", function(event) {
    event.preventDefault();
    console.log("Clicked publish!");
    //grab whichever story this is from the button's story-id data attribute
    var thisStory = $(this).data("story-id");
    //initialize an ajax call using the storyId
    $.ajax({
        url: "/api/story/publish",
        type: "PUT",
        dataType: "json",
        data: { storyId: thisStory },
        success: function(data, textStatus, xhr) {
            //upon success, check the object we got back...
            if(data.success) {
                //disable any publish buttons and show the user that they succeeded in publishing!
                $(".publish-btn").text("Your story is LIVE!");
                $(".publish-btn").addClass("disabled");
            }
            else {
                //otherwise, give the user feedback...
                console.log("We suck");
                console.log(data);
                $("#dynamicModalLabel").text("Whoops, your story's not quite ready...");
                //create a specific error message depending on what's wrong
                $("#dynamicModalBody").text("Before you go live, you'll need to fix your story up a little bit. Please make sure you have at least two pages (a start and an ending) and no unlinked or unfinished pages in your story.");
                $("#dynamicModalCloseBtn").text("Okay, I got it!");
                $("#dynamicModal").modal("show");
            }
        },
        error: function(xhr, textStatus, errorThrown) {
            console.log("Error time: " + errorThrown);
            $("#dynamicModalLabel").text("Whoops, something went wrong!");
            $("#dynamicModalBody").text("Please try again later.");
            $("#dynamicModalCloseBtn").text("Close");
            $("#dynamicModal").modal("show");
        }
    });
}); 