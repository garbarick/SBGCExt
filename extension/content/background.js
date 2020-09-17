if ("undefined" == typeof(SBGCExt))
{
    var SBGCExt =
    {
        init : function()
        {
            this.iterator = 0;
            this.scripts = [];
            this.menuArray = [];

            chrome.storage.local.get('menuArray',
                function (result)
                {
                    SBGCExt.menuArray = result.menuArray;
                }
            );
        },

        getMenuItemId : function()
        {
            return "SBGCExtContextMenu" + (this.iterator++);
        },

        updateContextMenu : function()
        {
            this.iterator = 0;
            this.scripts = [];

            chrome.contextMenus.removeAll();
            var parentId = chrome.contextMenus.create({"title": "SBGCExt", "contexts": ["all"], "id": this.getMenuItemId()});
            this.parseArrayToMenu(this.menuArray, parentId);
        },

        parseArrayToMenu : function(menuArray, parentId)
        {
            for (var i = 0; i < menuArray.length; i++)
            {
                var itemArray = menuArray[i];
                var menuId = this.getMenuItemId();
                if (itemArray[1] instanceof Array)
                {
                    chrome.contextMenus.create({"title": itemArray[0], "contexts": ["all"], "parentId": parentId, "id": menuId});
                    this.parseArrayToMenu(itemArray[1], menuId);
                }
                else
                {
                    var script = itemArray[1];
                    this.scripts[menuId] = script;
                    chrome.contextMenus.create({"title": itemArray[0], "contexts": ["all"], "parentId": parentId, "id": menuId});
                }
            }
        },

        getScript : function(menuId)
        {
            return this.scripts[menuId];
        },

        updatePopupMenu : function()
        {
            return this.parseArrayToPopup(this.menuArray);
        },

        parseArrayToPopup : function(menuArray)
        {
            var content = "";
            for (var i = 0; i < menuArray.length; i++)
            {
                var itemArray = menuArray[i];
                if (itemArray[1] instanceof Array)
                {
                    content += "<li><span>" + escapeHtml(itemArray[0]) + "</span><dir>" + this.parseArrayToPopup(itemArray[1]) + "</dir></li>";
                }
                else
                {
                    content += "<li><span>" + escapeHtml(itemArray[0]) + "</span><js>" + escapeHtml(itemArray[1]) + "</js></li>";
                }
            }
            return content;
        },

        loadItems : function(content)
        {
            var result = [];
            var items = document.evaluate('*/item | item', content, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
            var item;
            while (item = items.iterateNext())
            {
                result[result.length] = this.loadItem(item);
            }
            return result;
        },

        loadItem : function(item)
        {
            var name = document.evaluate("name", item, null, XPathResult.STRING_TYPE, null).stringValue;
            var script = document.evaluate("script", item, null, XPathResult.STRING_TYPE, null).stringValue;
            var items = document.evaluate("items", item, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

            if (items)
            {
                var subArray = this.loadItems(items);
                return [name, subArray];
            }
            else
            {
                return [name, script];
            }
        },

        getMenuArrayFromFile : function(xmlPath, onLoadMenuArray)
        {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', xmlPath);
            xhr.onreadystatechange = function()
            {
                if (xhr.readyState == 4)
                {
                    try
                    {
                        var array = SBGCExt.getMenuArrayFromString(xhr.responseText);
                        onLoadMenuArray(array);
                    }
                    catch (exception)
                    {
                        console.log(exception);
                    }
                }
            }
            xhr.send();
        },

        getMenuArrayFromString : function(string)
        {
            var content = new DOMParser().parseFromString(string, "text/xml");
            return this.loadItems(content);
        },

        getXMLFromMenuArray : function()
        {
            var xml = new DOMParser().parseFromString("<SBIEExt></SBIEExt>", "text/xml");
            this.parseArrayToXML(this.menuArray, xml, xml.children[0]);
            return new XMLSerializer().serializeToString(xml);
        },

        parseArrayToXML : function(menuArray, doc, xml)
        {
            for (var i = 0; i < menuArray.length; i++)
            {
                var itemArray = menuArray[i];
                var item = doc.createElement("item");
                item.appendChild(this.textToNode(doc, "name", itemArray[0]));
                if (itemArray[1] instanceof Array)
                {
                    var items = doc.createElement("items");
                    this.parseArrayToXML(itemArray[1], doc, items);
                    item.appendChild(items);
                }
                else
                {
                    item.appendChild(this.textToNode(doc, "script", itemArray[1]));
                }
                xml.appendChild(item);
            }
        },

        textToNode : function(doc, name, text)
        {
            var node = doc.createElement(name);
            var textNode = doc.createTextNode("");
            textNode.nodeValue = text;
            node.appendChild(textNode);
            return node;
        },

        parseArrayForEdit : function(menuArray)
        {
            var content = "";
            for (var i = 0; i < menuArray.length; i++)
            {
                var itemArray = menuArray[i];
                if (itemArray[1] instanceof Array)
                {
                    content += "<li><folder>" + escapeHtml(itemArray[0]) + "</folder><input type='checkbox' checked='checked'/><ol>" + this.parseArrayForEdit(itemArray[1]) + "</ol></li>";
                }
                else
                {
                    content += "<li class='file'><file>" + escapeHtml(itemArray[0]) + "</file><js>" + escapeHtml(itemArray[1]) + "</js></li>";
                }
            }
            return content;
        },

        getEditContent : function()
        {
            return this.parseArrayForEdit(this.menuArray);
        },

        getMenuArrayFromEditContent : function(editContent)
        {
            var content = new DOMParser().parseFromString(editContent, "text/xml");
            return this.loadItemsFromEditContent(content);
        },

        nsResolver : function (p)
        {
            return 'http://www.w3.org/1999/xhtml';
        },

        loadItemsFromEditContent : function(content)
        {
            var result = [];
            var items = document.evaluate('*/x:li | x:li', content, this.nsResolver, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
            var item;
            while (item = items.iterateNext())
            {
                result[result.length] = this.loadItemFromEditContent(item);
            }
            return result;
        },

        loadItemFromEditContent : function(item)
        {
            var name = document.evaluate("x:folder | x:file", item, this.nsResolver, XPathResult.STRING_TYPE, null).stringValue;
            var script = document.evaluate("x:js", item, this.nsResolver, XPathResult.STRING_TYPE, null).stringValue;
            var items = document.evaluate("x:ol", item, this.nsResolver, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

            if (items)
            {
                var subArray = this.loadItemsFromEditContent(items);
                return [name, subArray];
            }
            else
            {
                return [name, script];
            }
        }
    };

    (function() {this.init();}).apply(SBGCExt);
}
//-----------------------------------------------------------
chrome.extension.onMessage.addListener
(
    function(request, sender, sendResponse)
    {
        if (request.cmd == "SBGCExtContextMenu")
        {
            SBGCExt.updateContextMenu();
        }
        else if (request.cmd == "SBGCExtPopupMenu")
        {
            sendResponse({html: SBGCExt.updatePopupMenu()});
        }
        else if (request.cmd == "SBGCExtContentImport")
        {
            var menuArray = SBGCExt.getMenuArrayFromString(request.content);
            chrome.storage.local.set({'menuArray': menuArray});
            SBGCExt.menuArray = menuArray;
            SBGCExt.updateContextMenu();
        }
        else if (request.cmd == "SBGCExtFileImport")
        {
            SBGCExt.getMenuArrayFromFile(request.filePath, function(menuArray)
            {
                chrome.storage.local.set({'menuArray': menuArray});
                SBGCExt.menuArray = menuArray;
                SBGCExt.updateContextMenu();
            });
        }
        else if (request.cmd == "SBGCExtExport")
        {
            sendResponse({content: SBGCExt.getXMLFromMenuArray()});
        }
        else if (request.cmd == "SBGCExtEditContent")
        {
            sendResponse({html: SBGCExt.getEditContent()});
        }
        else if (request.cmd == "SBGCExtEditContentImport")
        {
            var menuArray = SBGCExt.getMenuArrayFromEditContent(request.content);
            chrome.storage.local.set({'menuArray': menuArray});
            SBGCExt.menuArray = menuArray;
            SBGCExt.updateContextMenu();
        }
    }
);
//-----------------------------------------------------------
chrome.contextMenus.onClicked.addListener
(
    function(info, tab)
    {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs)
        {
            chrome.tabs.sendMessage(tabs[0].id, {setEvent: true, js: SBGCExt.getScript(info.menuItemId)}); 
        });
    }
);
//-----------------------------------------------------------
