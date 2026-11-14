// A Bing search's page of results (/search?q=…, first=11 for the second page), read as a listing of what it found (see
// searchResultsOf): each result is a #b_results item of its own (li.b_algo), its title the link in its <h2>. The ads
// (li.b_ad) and Bing's answers (videos, "People also ask", li.b_ans) are other items. Bing sends each result through
// its own redirect, /ck/a?…&u=a1<the result's URL in base64url>, so the link is read as where it leads.
function parseBing() {
  if (location.hostname !== 'www.bing.com' || location.pathname !== '/search') {
    return null
  }
  const results = Array.from(document.querySelectorAll('#b_results > li.b_algo h2 a[href]'), a => ({ url: bingTarget(a.href), title: a.textContent }))
  return searchResultsOf('Bing', results, Math.max(0, queryNumber('first', 1) - 1))
}

// Where a result's link leads: the link itself, unless it is Bing's redirect, whose u is the URL in base64url after two
// characters of Bing's own ("a1"). Null if that cannot be read.
function bingTarget(href) {
  const url = new URL(href)
  if (url.hostname !== 'www.bing.com') {
    return href
  }
  const encoded = url.searchParams.get('u')?.slice(2).replace(/-/g, '+').replace(/_/g, '/')
  if (!encoded) {
    return null
  }
  try {
    const bytes = Uint8Array.from(atob(encoded.padEnd(Math.ceil(encoded.length / 4) * 4, '=')), c => c.charCodeAt(0))
    return new TextDecoder().decode(bytes)
  } catch {
    return null
  }
}

// The parser a scrape calls.
registerParser(parseBing)
