# We.js RSS plugin

> RSS plugin to add suport for RSS response type

## Configuration

Add the rss configuration for every model in you project **config/local.js** file

File: **config/local.js**
```js
module.exports = {
  // - others configs
  rss: {
    models: {
      article: { // model name
        title: 'My posts!', // title of your xml file
        description: 'my newest blog posts', // description for your xml file
        item: {
          title: 'title', // model attribute to get title
          description: 'teaser'  // model attribute to get description
        }
      }
    }
  }
  // - others configs
}
```

## Usage

After configure access your list with **responseType=rss** query param like:

```
http://localhost:4000/event?responseType=rss
```

## Links

> * We.js site: http://wejs.org

## License

MIT