/**
 * RSS plugin, add suport to configure and respond with rss in find routes
 *
 * see http://wejs.org/docs/we/plugin
 */
module.exports = function loadPlugin(projectPath, Plugin) {
  const plugin = new Plugin(__dirname);
  // set plugin configs
  plugin.setConfigs({
    rss: {
      models: {}
    }
  });

  /**
   * The RSS response formater
   *
   * @param  {Array} data records
   * @param  {Object} req  express.s request
   * @param  {Object} res  express.js response
   */
  plugin.rssFormater = function (req, res) {
    let data = res.locals.data || {};
    const we = req.we;

    if (!res.locals.model) {
      // set messages
      data.messages = res.locals.messages;
      return data;
    }

    // not found configurations for this record
    if (!we.config.rss.models[res.locals.model]) {
      res.status(400);
      return;
    }
    // not is a array of records
    if (!we.utils._.isArray(data)) {
      res.status(400);
      return;
    }
    // set response header
    res.set('Content-Type', 'application/xml');

    res.send(we.rss.parseRecordsToRss(data, req, res));
  }

  // after load all plugins set response formatters
  plugin.events.on('we:after:load:plugins', function (we) {
    // -- Add the we.rss object
    if (!we.rss) we.rss = {};

    /**
     * Parser to parse a records list in one xml file
     *
     * @param  {Array} data records
     * @param  {Object} req  express.s request
     * @param  {Object} res  express.js response
     * @return {String} the xml file
     */
    we.rss.parseRecordsToRss = function (data, req, res) {
      const we = req.we;
      let cfg =  we.config.rss.models[res.locals.model];

      let xml = '<?xml version="1.0" encoding="utf-8" ?>\n'+
        '<rss xmlns:atom="http://www.w3.org/2005/Atom" version="2.0">\n'+
          '<channel>\n'+
            '<title>'+ cfg.title+'</title>\n'+
            '<description>'+cfg.description+'</description>\n'+
            '<link>'+ ( cfg.link || (we.config.hostname+req.url) ) +'</link>\n'+
            '<language>'+ req.getLocale() +'</language>\n'+
            '<atom:link href="'+we.config.hostname+req.url+
            '" rel="self" type="application/rss+xml" />\n';

      for (let i = 0; i < data.length; i++) {
        let item = data[i];

        xml += '<item><title>'+item[cfg.item.title]+'</title>\n';

        xml += '<guid>'+item.getLink(req)+'</guid>\n';
        xml += '<link>'+item.getLink(req)+'</link>\n';

        let pubDate = item.publishedAt || item.createdAt;

        xml += '<pubDate>'+ we.utils.moment(pubDate).format('ddd, DD MMM YYYY HH:mm:ss ZZ') +'</pubDate>\n'

        if (cfg.item.description && item[cfg.item.description]) {
          xml += '<description><![CDATA['+ item[cfg.item.description] +']]></description>\n';
        }

        xml += '</item>\n';
      }

      xml += '</channel></rss>\n';
      return xml;
    }

    we.responses.addResponseFormater('application/rss+xml', plugin.rssFormater);
    we.responses.addResponseFormater('rss', plugin.rssFormater);
  });

  // add rss feed metadata
  plugin.events.on('we-html-metadata', function (data){
    if (data.we.config.rss && data.we.config.rss.models[data.locals.model] && data.locals.action == 'find') {
      data.metatags += '<link rel="alternate" type="application/rss+xml" title="RSS" href="'+
        data.we.config.hostname + data.locals.req.path+'?responseType=rss">';
    }

  })

  return plugin;
};
