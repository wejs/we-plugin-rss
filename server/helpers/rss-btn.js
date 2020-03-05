/**
 * We {{rss-btn}}  helper
 *
 * usage:  {{rss-btn locals=locals}}
 */

module.exports = function(we) {
  return function helper() {
    const options = arguments[arguments.length-1];

    if (
      options.hash.locals &&
      we.config.rss &&
      we.config.rss.models[options.hash.locals.model] &&
      options.hash.locals.action == 'find'
    ) {
      let html = '<a class="rss-link" href="'+we.config.hostname + options.hash.locals.req.path+'?responseType=rss ">'
      html += '<img src="/public/plugin/we-plugin-rss/files/rss.png" alt="Feed RSS">';
      html += '</a>';
      return new we.hbs.SafeString(html);
    } else {
      return '';
    }
  }
}