const Config = require('./../../senti.config.js');

const TwitterAPI = require('twitter');
const qs = require('qs');

const Plugin = require('./Plugin');
const Stream = require('./../Utilities/Stream');

class TwitterPlugin extends Plugin {

    constructor() {

        super(...arguments);

        this.client = new TwitterAPI({
            consumer_key: Config.TwitterAPI.consumer_key,
            consumer_secret: Config.TwitterAPI.consumer_secret,
            access_token_key: Config.TwitterAPI.access_token_key,
            access_token_secret: Config.TwitterAPI.access_token_secret
        });

    }

    postprocess(tweets) {

        return tweets.map(tweet => {
            return {
                text: tweet.full_text || tweet.text,
                metadata: {
                    type: 'senti.tweet',
                    id: tweet.id,
                    user_id: tweet.user.id,
                    name: tweet.user.name,
                    geo: tweet.geo,
                    location: tweet.user.location,
                    timezone: tweet.user.time_zone,
                    coordinates: tweet.coordinates,
                    description: tweet.user.description,
                    followers: tweet.user.followers_count,
                    verified: tweet.user.verified,
                    statuses_count: tweet.user.statuses_count,
                    favourites_count: tweet.user.favourites_count,
                    place: tweet.place,
                    retweet_count: tweet.retweet_count,
                    favourite_count: tweet.favourite_count,
                    lang: tweet.lang
                }
            }
        });

    }

    search(terms, options) {

        terms = terms instanceof Array ? terms.join(' ') : terms;
        options = options || {};

        return new Stream((give, reject, terminate, next) => {
            let params = Object.assign(options, { q: terms, tweet_mode: 'extended' });

            const handle = (error, tweets) => {
                if (error) {
                    reject(error);
                } else {
                    give(this.postprocess(tweets.statuses));

                    if (tweets.search_metadata && tweets.search_metadata.next_results) {
                        let query_string = tweets.search_metadata.next_results.replace('?', ''),
                            query_params = Object.assign(qs.parse(query_string), params);

                        next(() => {
                            this.client.get('search/tweets', query_params, handle);
                        });
                    } else {
                        terminate();
                    }
                }
            }

            this.client.get('search/tweets', params, handle);
        });

    }

}

module.exports = TwitterPlugin;