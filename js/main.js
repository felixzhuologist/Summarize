$(function(){
    var text = "George Washington was in Valley Forge, Pennsylvania";
    // convert text to index
    // sendIDOLAPICall("createtextindex", {flavor: "standard"});
    
    // find entities (key people, places, etc.)
    
    var entityTypes = [
        { entityType: "people_eng", cssClass: "entity-people" },
        { entityType: "places_eng", cssClass: "entity-places" },
        { entityType: "date_eng", cssClass: "entity-date" },
    ];
    entityTypes.forEach(function(type){
        var promise = sendIDOLAPICall("extractentities", {
            text: text,
            entity_type: type.entityType
        });
        promise.done(function success(data, textStatus){
            console.log(5);
            text = markupByEntity(text, type.cssClass, data);
        });       
    });

    // display marked-up text
    $("#text-main").html(text);
});

/**

Queries for data synchronously through the IDOL API.

@param {String} apiName     The name of the API command, like "createtextindex"
@param {Object} args        A key:value set that will be converted into query line arguments.
@return {Promise}   The $.ajax Promise object. Call "promise.done(function(){...})" to attach a success handler.

*/
function sendIDOLAPICall(apiName, args){
    // add api key
    args.apikey = API_KEY;
    var queryURL = "https://api.idolondemand.com/1/api/sync/" + apiName + "/v1";
    
    var promise = $.ajax({
       url: queryURL,
        data: args,
        type: "GET"
    });
    
    promise.error(function error(xhr, textStatus, errorThrown){
        console.log("ERROR: ");
        console.log(errorThrown);
    });
    
    return promise;
}

/**

Adds a <span class="entity"> tag to terms mentioned in the api response.
@param {String} text    The raw text
@param {String} cssClass    The custom CSS class to add to the highlighted terms.
@param {Object} apiResponse The raw response data delivered from the "extractentities" call to the IDOL API.

*/
function markupByEntity(text, cssClass, apiResponse){
    if(apiResponse.entities){
        apiResponse.entities.forEach(function(entity){
            // replace all instances of original text w/ text wrapped in tag
            var original = entity.original_text;
            // to replace all, first replace 
            text = text.replace(new RegExp(RegExp.escape(original), "g"), 
                                "<strong class='entity'>" + original + "</strong>");
        });
                
        return text;
    }
    else{
        return text;
    }
}