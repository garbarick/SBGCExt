document.addEventListener("click",
    function(event)
    {
        var element = event.srcElement;
        switch (element.id)
        {
            case 'xmlContentImport':
            {
                var xmlContent = document.getElementById('xmlContent').value;
                chrome.extension.sendMessage({cmd : "SBGCExtContentImport", content : xmlContent});
            }
            break;

            case 'xmlFileImport':
            {
                var xmlPath = document.getElementById('xmlPath').value;
                chrome.extension.sendMessage({cmd : "SBGCExtFileImport", filePath : xmlPath});
            }
            break;

            case 'xmlExport':
            {
                chrome.extension.sendMessage({cmd : "SBGCExtExport"}, function(response)
                {
                    document.getElementById('xmlContent').value = formatXml(response.content);
                });
            }
            break;

            case 'xmlContentCopy':
            {
                var xmlContent = document.getElementById('xmlContent');
                xmlContent.select();
                document.execCommand('Copy');
            }
            break;
        }
    }
);
