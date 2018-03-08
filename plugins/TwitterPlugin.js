const TwitterAPI = require('twitter');
const qs = require('qs');

const Plugin = require('./Plugin');
const Stream = require('./../utilities/Stream');

const DEFAULT_PAGE_SIZE = 100;

class TwitterPlugin extends Plugin {

    constructor(config) {

        super(...arguments);
        this.client = new TwitterAPI(config);

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

    search(terms, options = { operator: 'AND' }) {

        terms = terms instanceof Array ? terms.join(` ${options.operator} `) : terms;

        return new Stream((give, reject, terminate, next) => {
            let params = Object.assign(this.transform(options), { q: terms, tweet_mode: 'extended' });

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

    transform(options = {}) {

        let rectified = {
            lang: options.language,
            count: options.count || DEFAULT_PAGE_SIZE
        };

        if (options.from) {
            rectified.from = options.from.toISOString();
        }

        if (options.to) {
            rectified.until = options.to.toISOString().split('T')[0];
        }

        // TODO - Use twitter geo api to get place id for country search
        // https://stackoverflow.com/questions/17633378/how-can-we-get-tweets-from-specific-country
        // if (options.country) {

        // }

        return rectified;

    }

}

module.exports = TwitterPlugin;