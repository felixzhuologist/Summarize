$(function(){
    var text = "George Washington was in Valley Forge, Pennsylvania";
    // convert text to index
    // sendIDOLAPICall("createtextindex", {flavor: "standard"});
    
    // find entities (key people, places, etc.)
    
    var promise = sendIDOLAPICall("extractentities", {
        text: text,
        entity_type: "people_eng"
    });
    promise.done(function success(data, textStatus){
        var people_entities = data.entities;
        console.log(people_entities);
        text = markupByEntity(text, people_entities);

        // display marked-up text
        $("#text-main").html(text);
    });
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
@param {Object} apiResponse The raw response data delivered from the "extractentities" call to the IDOL API.

*/
function markupByEntity(text, apiResponse){
    if(apiResponse.entities){
        apiResponse.entities.forEach(function(entity){
            // replace all instances of original text w/ text wrapped in tag
            var original = entity.original_text;
            while(Object.has(text, original)){
                text = text.replace(entity.original, "<span class='entity'>" + entity.original + "</span>");
            }
        });
                
        return text;
    }
    else{
        return text;
    }
}