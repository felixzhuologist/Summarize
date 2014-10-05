$(function(){
    // bind handlers
    $("#btn-submit").click(function(){
        var text = getInput();
        render(text);
    });
    
    $('#uploadfilebutton').click(function(){
        $('#upload-digitized-pdf').ajaxSubmit(function(referenceObject, textStatus){
            if(referenceObject && referenceObject.reference){
                var promise = sendIDOLAPICall("extracttext", {
                    reference: referenceObject.reference
                });
                promise.done(function success(result, data){
                    console.log(result);
                    if(result){
                        var text = result.document[0].content;
                        render(text, referenceObject.reference);
                    }
                });
            }
        });
    });
});

/**

Shows the given text or reference, annotates it, and summarizes it.

@param {String} text    The raw text
@param {String} reference   [optional] if passed, we'll use this for the API call.

*/
function render(text, reference){
    
    // interface
    $('#inputs').hide();
    $('#output').show();

    console.log("...");

    // show spinner
    var spinner = $('<span><span class="glyphicon glyphicon-refresh"></span> Analyzing...</span>');
    $("#text-main").html(spinner.outerHTML());
    $('#summary-main').html(spinner.outerHTML());
            
    
    // find entities (key people, places, etc.)
    
    var promise;
    if(reference){
        promise = sendIDOLAPICall("extractentities", {
            reference: reference,
            entity_type: ["people_eng", "places_eng", "date_eng", "companies_eng"]
        });        
    }
    else{

        promise = sendIDOLAPICall("extractentities", {
            text: text,
            entity_type: ["people_eng", "places_eng", "date_eng", "companies_eng"]
        });         
    }   
    promise.done(function success(data, textStatus){
        // remove duplicates
        if(data.entities){
            data.entities = data.entities.unique(function(entity){
                return entity.normalized_text;
            });
        }
        
        // mark up text
        text = markupByEntity(text, data);
        $("#text-main").html(text);
        
        // on hover/click, show 0-click info with DuckDuckGo
        $('.hover-info').empty();
        $("#text-main strong").on('mouseover click', function(){
            var text = $(this).data("normalized");
            
            showHoverInfo(text);
        });
        
        // summarize it too
        var categories = data.entities.groupBy("type");
        console.log(categories);
        template("template-outline", $("#summary-main"), categories);
        $("#summary-main li").on('mouseover click', function(){
            var text = $(this).html();
            
            showHoverInfo(text);
        });        
    });          
}

/**
    Shows DuckDuckGo 0-Click information when the given text is hovered or clicked.
*/
function showHoverInfo(text){
    var baseURL = "https://api.duckduckgo.com/?";
    var args = {
        q: text,
        format: "json",
        skip_disambig: 1
    };
    var url = baseURL + Object.toQueryString(args);
    $.get(
        url,
        function(j){},
        'jsonp'
    ).success(function(data){
        // render
        if(data.Heading != "" && data.Abstract != ""){
            template("template-hover-info", $('.hover-info'), data);
        }
    });
    
    /*
    $.ajax({
        url: "https://api.duckduckgo.com",
        type: "GET",
        data: {
            q: text,
            format: "jsonp",
            skip_disambig: 1,
            callback: "abc"
        },

        success: function(data, textStatus){
            console.log(data);
        }
    });
    */
}

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
            
            // oh and color it too
            var cssClass = "";
            switch(entity.type){
                    case "people_eng":
                        cssClass = "text-success";
                        break;
                    case "places_eng":
                        cssClass = "text-info";
                        break;
                    case "date_eng":
                        cssClass = "text-danger";
                        break;                    
                    case "companies_eng":
                        cssClass = "text-warning";
                        // normalized text is bad for 0-click so use original text
                        entity.normalized_text = entity.original_text;
                        break;
            }
            
            // to replace all, first replace 
            
            var replacement = $('<strong></strong');
            replacement.addClass('entity').addClass(cssClass);
            replacement.html(original);
            replacement.attr('data-normalized', entity.normalized_text);
            text = text.replace(new RegExp(RegExp.escape(original), "g"), replacement.outerHTML());
        });
        return text;
    }
    else{
        return text;
    }
}

/**
 * Loads the container with HTML from the source, with the data supplied. This uses Handlebars.
 * @param {String}  source    the name of the index. Omit the hashtag. e.g. "template-xyz".
 * @param {jQuery}  container the element to put the rendered HTML into.
 * @param {Object}  data      the data used to render the template.
 * @param {boolean} append    [optional; default false] if true, container will have HTML appended, not replaced.
 * @return {jQuery} the jQuery items that were loaded into the container. This is just a collection of items, so to find something inside use [return value].closest([selector]).
 */
function template(source, container, data, append){
     var sourceHTML = $('#' + source).html();
     var templateFn = Handlebars.compile(sourceHTML);
     var html = templateFn(data);
     var jQ = $(html);
     if(append)
          container.append(jQ);
     else
          container.empty().append(jQ);
     return jQ;
}

$.fn.outerHTML = function(){
    return this.clone().wrap('<p>').parent().html();
}