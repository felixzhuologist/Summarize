/**

<<<<<<< HEAD
Returns the user's input in text (regardless of how they gave us the data - plain text, PDF, etc.)
@return {String}    text to display

**/
function getInput(){
    var text = $("#inputText").val();
    return text;
=======
Returns the text the user wants to render, drawn from one of various sources.
@return {String}    The text to render

*/
function getInput(){
    return $('#inputText').val();
>>>>>>> neel
}