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
    warningsMatch: function(check) {
        if (check.chooseNotToWarn) {
            return this.warnings.all = true; 
        }
        else {
            this.warnings.all = false;
            for (var i = 0; i < this.warnings.length; i++) {
                if (check[this.warnings[i].id]) {
                    this.warnings[i].yes = true;
                }
                else {
                    this.warnings[i].yes = false;
                }
            }
        }
    },
    storybuttons: [
        {id: "saveChanges", text: "Save Changes", link: ""}, 
        {id: "viewStory", text: "View Story", link: ""}, 
        {id: "createNewPage", text: "Create New Page", link: ""}, 
        {id: "markStoryAsFinished", text: "Mark Story as Finished", link: ""}, 
        {id: "publishYourStory", text: "Publish Your Story", link: ""}
    ]
};


module.exports = listsObj;