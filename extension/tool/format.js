function formatXml(xml)
{
    var formatted = '';
    xml = xml.replace(/(>)(<)(\/*)/g, '$1\r\n$2$3');
    var pad = 0;
    var nodes = xml.split('\r\n');
    for (var k = 0; k < nodes.length; k++)
    {
        var node = nodes[k];
        var indent = 0;
        if (node.match(/.+<\/\w[^>]*>$/))
        {
            indent = 0;
        }
        else if (node.match(/^<\/\w/))
        {
            if (pad != 0)
            {
                pad -= 1;
            }
        }
        else if (node.match(/^<\w[^>]*[^\/]>.*$/))
        {
            indent = 1;
        }
        else
        {
            indent = 0;
        }

        var padding = '';
        for (var i = 0; i < pad; i++)
        {
            padding += '  ';
        }

        formatted += padding + node + '\r\n';
        pad += indent;
    }
    return formatted;
}
