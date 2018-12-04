// This file is for lists of things we may want to use in multiple places,
// or may want to iterate over in handlebars, 
// eg. our warning buttons or the buttons for the story page.

var listsObj = {
    // Warnings buttons array
    warnings: [
        {id: "chooseNotToWarn", text: "Choose Not To Warn"}, 
        {id: "violence", text: "Violence/Gore"}, 
        {id: "characterDeath", text: "Character Death"}, 
        {id: "nsfw", text: "Not Safe For Work"}, 
        {id: "nonConsent", text: "NonConsent"}, 
        {id: "profanity", text: "Profanity"}
    ],
    warningsMatch: function(warns) {
        // FIXME: this code is to make all buttons marked when choose not to warn is marked,
            // but the other part doesn't work yet, so I am commenting this out for now.
        // if (warns.chooseNotToWarn) {
        //     return this.warnings.all = true; 
        // }
        // else {
            this.warnings.all = false;
            for (var i = 0; i < this.warnings.length; i++) {
                if (warns[this.warnings[i].id]) {
                    this.warnings[i].yes = true;
                }
                else {
                    this.warnings[i].yes = false;
                }
            }
        // }
    },
    storybuttons: [
        {id: "saveChanges", text: "Save Changes"}, 
        {id: "viewStory", text: "View Story"}, 
        {id: "createNewPage", text: "Create New Page"}, 
        {id: "markAsFinished", text: "Mark as Finished"}, 
        {id: "publishStory", text: "Publish Story"},
        {id: "deleteStory", text: "Delete Story"}
    ]
};


module.exports = listsObj;