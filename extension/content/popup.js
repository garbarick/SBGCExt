//-----------------------------------------------------------
document.addEventListener('DOMContentLoaded',
    function ()
    {
        chrome.extension.sendMessage({cmd : "SBGCExtPopupMenu"},
            function(response)
            {
                document.getElementById('popupMenu').innerHTML = response.html;
            }
        );
    }
);
//-----------------------------------------------------------
document.addEventListener("click",
    function(event)
    {
        var span = event.srcElement;
        if (span && span.tagName == "SPAN")
        {
            var script = span.parentElement.children[1];
            if (script && script.tagName == 'JS')
            {
                invokeScript(script.innerText);
            }
        }
    }
);
//-----------------------------------------------------------
function invokeScript(script)
{
    chrome.windows.getCurrent(
        function(window)
        {
            chrome.tabs.getSelected
            (
                window.id,
                function(tab)
                {
                    chrome.tabs.sendMessage(tab.id, {setEvent: false, js : script});
                }
            );
        }
    );
}
//-----------------------------------------------------------