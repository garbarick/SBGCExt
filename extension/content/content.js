var SBEvent;
//-----------------------------------------------------------
document.addEventListener("mousedown",
    function(event)
    {
        if (event.button == 2)
        {
            SBEvent = event;
        }
    },
    true
);
//-----------------------------------------------------------
chrome.extension.onMessage.addListener
(
    function(request, sender)
    {
        if (request.setEvent)
        {
            event = SBEvent;
        }
        eval(request.js);
    }
);
//-----------------------------------------------------------
chrome.extension.sendMessage({cmd : "SBGCExtContextMenu"});