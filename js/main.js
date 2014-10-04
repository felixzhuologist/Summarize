$(function(){
    var text = "George Washington was in Valley Forge, Pennsylvania"
    // convert text to index
    // sendIDOLAPICall("createtextindex", {flavor: "standard"});
    
    // TODO mark up text
    
    // display raw text
    $("#text-main").html(text);
});

/**

Queries for data synchronously through the IDOL API.

@param {String} apiName     The name of the API command, like "createtextindex"
@param {Object} args        A key:value set that will be converted into query line arguments.

*/
function sendIDOLAPICall(apiName, args){
    // add api key
    args.apikey = API_KEY;
    var queryURL = "https://api.idolondemand.com/1/api/sync/" + apiName + "/v1";
    
    $.ajax({
       url: queryURL,
        data: args,
        type: "GET",
        success: function(data, textStatus){
            console.log(data);
        },
        error: function(xhr, textStatus, errorThrown){
            console.log(errorThrown);
        }
    });
}