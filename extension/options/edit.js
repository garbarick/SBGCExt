window.addEventListener("load",
    function(event)
    {
        chrome.extension.sendMessage({cmd : "SBGCExtEditContent"},
            function(response)
            {
                document.getElementById('treeContent').innerHTML = response.html;
            }
        );
    }
);
//-----------------------------------------------------------
document.addEventListener("click",
    function(event)
    {
        var element = event.srcElement;
        switch(element.tagName)
        {
            case 'FILE':
            case 'FOLDER':
                clickFileFolder(element);
                break;

            case 'BUTTON':
                clickFuncButton(element);
                break;
        }
    }
);
//-----------------------------------------------------------
function disableControl(id)
{
    var element = document.getElementById(id);
    element.value = '';
    element.disabled = true;
}
//-----------------------------------------------------------
function clickFileFolder(element)
{
    var tagName = element.tagName;

    var currents = document.getElementsByClassName('current');
    for (var i in currents)
    {
        var current = currents[i];
        current.className = '';
        if (element == current)
        {
            disableControl('name');
            disableControl('script');
            return;
        }
    }

    element.className = 'current';

    var name = document.getElementById('name');
    name.disabled = false;
    name.value = unescapeHtml(element.innerHTML);

    if ('FILE' == tagName)
    {
        var script = document.getElementById('script');
        script.value = unescapeHtml(element.nextSibling.innerHTML);
        script.disabled = false;
    }
    else if ('FOLDER' == tagName)
    {
        disableControl('script');
    }
}
//-----------------------------------------------------------
function clickFuncButton(element)
{
    var currents = document.getElementsByClassName('current');
    var current = currents.length > 0 ? currents[0] : null;
    var li = current ? current.parentElement : null;
    var result;
    switch (element.id)
    {
        case 'moveUp':
            result = moveUpFuncButton(li);
            break;

        case 'moveDown':
            result = moveDownFuncButton(li);
            break;

        case 'addFolder':
            result = addFolderFuncButton(li);
            break;

        case 'addFile':
            result = addFileFuncButton(li);
            break;

        case 'save':
            result = saveFuncButton(current);
            break;

        case 'delete':
            result = deleteFuncButton(li);
            break;
    }

    if (result)
    {
        var editContent = new XMLSerializer().serializeToString(document.getElementById('treeContent'));
        chrome.extension.sendMessage({cmd : "SBGCExtEditContentImport", content : editContent});
    }
}
//-----------------------------------------------------------
function moveUpFuncButton(li)
{
    if (!li) return;
    var prevLi = li.previousElementSibling;
    if (!prevLi) return;
    prevLi.insertAdjacentElement("beforeBegin", li);
    return 1;
}
//-----------------------------------------------------------
function moveDownFuncButton(li)
{
    if (!li) return;
    var nextLi = li.nextElementSibling;
    if (!nextLi) return;
    nextLi.insertAdjacentElement("afterEnd", li);
    return 1;
}
//-----------------------------------------------------------
function deleteFuncButton(li)
{
    if (!li) return;
    li.parentElement.removeChild(li);
    disableControl('name');
    disableControl('script');
    return 1;
}
//-----------------------------------------------------------
function getParentforNew(li)
{
    if (li)
    {
        var ols = li.getElementsByTagName('OL');
        if (ols.length > 0)
        {
            return ols[0];
        }
    }
    else
    {
        return document.getElementById('treeContent');
    }
}
//-----------------------------------------------------------
function addFolderFuncButton(li)
{
    var ol = getParentforNew(li);
    if (!ol) return;

    var newLi = document.createElement('li');

    var folder = document.createElement('folder');
    folder.innerHTML = 'new';
    newLi.appendChild(folder);

    var input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = true;
    newLi.appendChild(input);

    var newOl = document.createElement('ol');
    newLi.appendChild(newOl);

    newLi = ol.appendChild(newLi);
    newLi.scrollIntoView();
    return 1;
}
//-----------------------------------------------------------
function addFileFuncButton(li)
{
    var ol = getParentforNew(li);
    if (!ol) return;

    var newLi = document.createElement('li');
    newLi.className = 'file';

    var file = document.createElement('file');
    file.innerHTML = 'new';
    newLi.appendChild(file);

    var js = document.createElement('js');
    js.innerHTML = 'alert("test")';
    newLi.appendChild(js);

    newLi = ol.appendChild(newLi);
    newLi.scrollIntoView();
    return 1;
}
//-----------------------------------------------------------
function saveFuncButton(current)
{
    if (!current) return;

    var name = document.getElementById('name');
    current.innerHTML = name.value;

    var js = current.nextSibling;
    if ('JS' == js.tagName)
    {
        var script = document.getElementById('script');
        js.innerHTML = script.value;
    }
    return 1;
}
//-----------------------------------------------------------
