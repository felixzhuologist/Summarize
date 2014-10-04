$(function(){
    var text = "Four score and seven years ago..."
    // convert text to index
    sendIDOLAPICall("querytextindex", {text: "Dog", database_match: "wiki_eng"});
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