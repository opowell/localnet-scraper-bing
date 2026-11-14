import { afterEach, describe, expect, it } from 'vitest'
import { parserLoader, resetPage, visit } from '#scraper-test'

// The parser, evaluated with the helpers it is injected with, as a scrape runs it.
const load = parserLoader(__dirname)

afterEach(resetPage)

describe('search engines', () => {
  // Bing's redirect names its result in base64url after "a1".
  const bing = (url: string) => `https://www.bing.com/ck/a?!&&p=x&u=a1${btoa(url).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')}&ntb=1`

  it.each([
    ['bing.js', 'parseBing', 'https://www.bing.com/search?q=rust', `
      <ol id="b_results">
        <li class="b_ad"><h2><a href="https://ad.example/">An ad</a></h2></li>
        <li class="b_algo"><h2><a href="${bing('https://one.example/a')}">One</a></h2></li>
        <li class="b_ans"><h2><a href="${bing('https://video.example/')}">Videos</a></h2></li>
        <li class="b_algo"><h2><a href="https://two.example/b">Two</a></h2></li>
      </ol>`],
  ])('%s reads %s\'s page as a listing of its results, in order, leaving out its ads and its own pages', async (file, parser, url, body) => {
    visit(url, body)
    expect(await load(file, [parser])[parser]()).toEqual({
      listing: true,
      content: [],
      links: [
        { url: 'https://one.example/a', title: 'One', score: 1 },
        { url: 'https://two.example/b', title: 'Two', score: 1 / 1.1 },
      ],
    })
  })

  it.each([
    ['bing.js', 'parseBing', 'https://www.bing.com/search?q=rust&first=11', '<ol id="b_results"><li class="b_algo"><h2><a href="https://one.example/">One</a></h2></li></ol>'],
  ])('%s ranks a later page\'s results after those of the pages before it', async (file, parser, url, body) => {
    visit(url, body)
    expect((await load(file, [parser])[parser]()).links).toEqual([{ url: 'https://one.example/', title: 'One', score: 0.5 }])
  })

  it.each([
    ['bing.js', 'parseBing', 'https://www.bing.com/search?q=rust', '<ol id="b_results"></ol>', 'Bing listed no results on this page'],
  ])('%s fails a page with no results, saying so', async (file, parser, url, body, failed) => {
    visit(url, body)
    expect(await load(file, [parser])[parser]()).toEqual({ listing: true, content: [], failed })
  })

  it.each([
    ['bing.js', 'parseBing', 'https://www.bing.com/images'],
  ])('%s leaves a page that is no search to the default parse', async (file, parser, url) => {
    visit(url, '<p>Text</p>')
    expect(await load(file, [parser])[parser]()).toBeNull()
  })
})
