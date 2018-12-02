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
$(document).on("click", "chooseNotToWarn", function () {
    $(".content-warning").toggleClass("active");
});