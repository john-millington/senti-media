# senti-social

Senti Social is an extensible framework for sentiment analysis on media sources. It comes with plugins for twitter and [NewsAPI](https://newsapi.org). The framework uses [AWS Comprehend](https://aws.amazon.com/comprehend), along with [compromise](http://compromise.cool/) to extract key phrases and do sentiment analysis.

It is designed for use with node, and may have issues running in a browser.

## Getting Started

### Install with npm

```
npm install senti-media
```

### Creating a instance of the Senti engine

```
const Engine = require('senti-media/engine');

const SentiEngine = new Engine({
    aws: {
        accessKeyId: '<YOUR_AWS_KEY>',
        secretAccessKey: '<YOUR_AWS_SECRET>',
        region: '<AWS_REGION>'
    }
});
```

### Adding Plugins

A plugin provides a media source that will called by the engine. If you have your own media source, you can create your own plugin extending the Plugin class. Senti comes with two plugins out of the box for Twitter and NewsAPI.

Plugins can be passed in the configuration object, in the plugins property, when the engine is instantiated or they can be added later using the plugins method on the engine instance. Plugins need to be added before the engine is started.

```
const { TwitterPlugin, NewsPlugin } = require('senti-media/plugins');

SentiEngine.plugin(new TwitterPlugin({
    consumer_key: '<YOUR_TWITTER_CONSUMER_KEY>',
    consumer_secret: '<YOUR_TWITTER_CONSUMER_SECRET>'
    access_token_key: '<YOUR_TWITTER_ACCESS_TOKEN>'
    access_token_secret: '<YOUR_TWITTER_ACCESS_TOKEN_SECRET>'
}));

SentiEngine.plugin(new NewsPlugin({
    api_key: '<YOUR_NEWS_API_KEY>'
}));
```

### Adding Middleware

Middleware provides data extraction methods that will be passed back to any method taking updates from the engine. The middleware is called after the sentiment analysis and key phrase extraction has been done, so that additional analysis can be performed. You can define your own middleware extending the Middleware class, but Senti comes with three out of the box that act as filters on the data: Positivity (extracts positive sentiment), Negativity (extracts negative sentiment), and Raw (returns all the analysed data).

Your application will not receive updates from the Senti engine unless middleware is added. It can be passed in the config object, in the middleware property, when the Engine is instantiated, or it can be added later using the middleware method on the engine.

```
const { Positivity, Negativity, Raw } = require('senti-media/middleware');

SentiEngine.middleware(new Positivity());
SentiEngine.middleware(new Negativity());
SentiEngine.middleware(new Raw());
```

### Starting the engine

```
SentiEngine.start('<search_term>', options).take((update) => {
    console.log(update);
});
```

## Author

**John Millington**

## License

This project is licensed under the GNU General Public License - see the [LICENSE.md](LICENSE.md) file for details