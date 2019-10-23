function escapeXml (s)
{
	return s.replace(/[<>&"']/g,
	function (ch)
	{
		return {'<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;'}[ch];
	});
}
//-----------------------------------------------------------
function unescapeXml (s)
{
	return s.replace(/(&lt;|&gt;|&amp;|&quot;|&apos;)/g,
	function (ch)
	{
		return {'&lt;': '<', '&gt;': '>', '&amp;': '&', '&quot;': '"', '&apos;': "'"}[ch];
	});
}
//-----------------------------------------------------------
function escapeHtml (s)
{
	return s.replace(/[<>&"']/g,
	function (ch)
	{
		return {'<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;'}[ch];
	});
}
//-----------------------------------------------------------
function unescapeHtml (s)
{
	return s.replace(/(&lt;|&gt;|&amp;|&quot;|&#39;)/g,
	function (ch)
	{
		return {'&lt;': '<', '&gt;': '>', '&amp;': '&', '&quot;': '"', '&#39;': "'"}[ch];
	});
}
//-----------------------------------------------------------