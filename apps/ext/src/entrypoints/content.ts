export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_end',
  async main() {
    const { Readability } = await import('@mozilla/readability')

    const clonedDoc = document.cloneNode(true) as Document
    const article = new Readability(clonedDoc).parse()
    console.log('Article:', article)
  },
})
