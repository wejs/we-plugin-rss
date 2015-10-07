/**
 * RSS plugin, add suport to configure and respond with rss in find routes
 *
 * see http://wejs.org/docs/we/plugin
 */
module.exports = function loadPlugin(projectPath, Plugin) {
  var plugin = new Plugin(__dirname);
  // set plugin configs
  plugin.setConfigs({
    rss: {
      models: {}
    }
  });

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
    we.rss.parseRecordsToRss = function parseRecordsToRss(data, req, res) {
      var we = req.we;
      var cfg =  we.config.rss.models[res.locals.model];

      var xml = '<?xml version="1.0" encoding="utf8"?>'+
        '<rss version="2.0">'+
          '<channel>'+
            '<title>'+ cfg.title+'</title>'+
            '<description>'+cfg.description+'</description>'+
            '<link>'+ ( cfg.link || (we.config.hostname+req.url) ) +'</link>'+
            '<language>'+req.locale+'</language>'+
            '<atom:link href="'+we.config.hostname+req.url+
            '" rel="self" type="application/rss+xml" />';

      for (var i = 0; i < data.length; i++) {
        xml += '<item><title>'+data[i][cfg.item.title]+'</title>';

        if (data[i].creator && data[i].creator.displayName) {
          xml += '<author>'+data[i].creator.displayName+'</author>';
        }

        xml += '<guid>'+data[i].getLink(req)+'</guid>';
        xml += '<link>'+data[i].getLink(req)+'</link>';

        xml += '<pubDate>'+ we.utils.moment(data[i]).format('ddd, DD MMM YYYY HH:mm:ss ZZ') +'</pubDate>'

        // TODO
        //<category></category>


        if (cfg.item.description && data[i][cfg.item.description]) {
          xml += '<description><![CDATA['+ data[i][cfg.item.description] +']]></description>';
        }

        xml += '</item>';
      }

      xml += '</channel></rss>';
      return xml;
    }


    // -- Set the response type
    //
    // add in configs
    we.config.responseTypes.push('rss');

    /**
     * The RSS response formater
     *
     * @param  {Array} data records
     * @param  {Object} req  express.s request
     * @param  {Object} res  express.js response
     */
    we.responses.formaters.rss =  function rssFormater(data, req, res) {
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

      return we.rss.parseRecordsToRss(data, req, res);
    }
  });
  return plugin;
};