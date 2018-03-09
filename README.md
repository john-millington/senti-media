# senti-media

Senti is an extensible framework for sentiment analysis and NLP on media sources. It comes with providers for the [Twitter API](https://developer.twitter.com/) and [NewsAPI](https://newsapi.org). The framework uses [AWS Comprehend](https://aws.amazon.com/comprehend), along with [compromise](http://compromise.cool/) to extract key phrases and do sentiment analysis.

It is designed for use with node, and may have issues running in a browser.

## Getting Started

### Install with npm

```
npm install senti-media
```

### Creating an instance of the Senti engine

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

### Adding Providers

A provider is a media source that adheres to the pattern defined in the base Provider class (senti-media/providers/Provider). It exposes a search method that returns a Stream (senti-media/utilities/Stream). The Senti engine will call the Provider and listen for any updates before queuing them for analysis. Updates should be an array of object with each object containing a 'text' property, any other data will be retained but will not be used by the engine.

Senti comes with two pre-defined Providers: TwitterProvider and NewsProvider.

Providers can be passed in the configuration object, in the providers property, when the engine is instantiated or they can be added later using the provider method on the engine instance. Providers need to be added before the engine is started.

```
const { TwitterProvider, NewsProvider } = require('senti-media/providers');

SentiEngine.provider(new TwitterProvider({
    consumer_key: '<YOUR_TWITTER_CONSUMER_KEY>',
    consumer_secret: '<YOUR_TWITTER_CONSUMER_SECRET>'
    access_token_key: '<YOUR_TWITTER_ACCESS_TOKEN>'
    access_token_secret: '<YOUR_TWITTER_ACCESS_TOKEN_SECRET>'
}));

SentiEngine.provider(new NewsProvider({
    api_key: '<YOUR_NEWS_API_KEY>'
}));
```

### Adding Middleware

Middleware functions run after the text analysis has been done and can apply postprocessing to the results. They are run in the order they are added to the engine, and can either be defined in the config passed to the engine on instantiation, in the middleware property, or can be added using the 'use' method on the engine. A middleware function should take two argument, the terms passed to the engine, and the results, and it should return the modified results object. It must be a syncronous function.

Senti supplies three simple middleware functions:

- inference - this tries to determine to topic data by infering the context from previous text samples in the document
- positivity - A helper to extract positive sentiment
- negativity - A helper to extract negative sentiment

```
const { positivity, negativity, inference } = require('senti-media/middleware');

SentiEngine.use(inference());
SentiEngine.use(positivity());
SentiEngine.use(negativity());
```

### Starting the engine

```
const SentiStream = SentiEngine.start('<search_term>', options);

SentiStream.take((update) => {
    console.log(update);
});
```

Starting the engine returns a Stream object. Conceptually the Stream object works similarly to a Promise, you can pass your update function to the take method on the Stream and it will receive updates for all media sources being run by the engine. Depending on the media type and the middleware used, this will include some metadata about the original source of the text.

A stream also has catch and finish methods which are called when exceptions occur or when the stream is terminated:

```
SentiStream.catch((exception) => {
    console.log(exception);
});

SentiStream.finish(() => {
    console.log('Stream terminated');
});
```

## Author

**John Millington**

## License

This project is licensed under the GNU General Public License - see the [LICENSE.md](LICENSE.md) file for details