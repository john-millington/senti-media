const Config = require('./../../senti.config.js');
const NewsSources = require('./data/sources.json');

const NewsAPI = require('newsapi');
const _ = require('lodash');

const Plugin = require('./Plugin');
const Stream = require('./../Utilities/Stream');

const DEFAULT_PAGE_SIZE = 100;

class NewsPlugin extends Plugin {

    constructor() {

        super(...arguments);
        this.client = new NewsAPI(Config.NewsAPI.api_key);

    }

    postprocess(articles) {

        return articles.map(article => {
            return {
                text: article.title + '. ' + article.description,
                metadata: {
                    type: 'senti.news',
                    ...article
                }
            }
        });

    }

    search(terms, options = {}) {

        terms = terms instanceof Array ? terms.join(' OR ') : terms;

        let processedResults = 0;
        return new Stream((give, reject, terminate, next) => {
            let params = Object.assign(this.transform(options), { q: terms, page: 1 });

            const handle = (response) => {
                if (response.status === 'error') {
                    reject(response);
                } else {
                    give(this.postprocess(response.articles));

                    processedResults += response.articles.length;
                    if (response.totalResults > processedResults) {
                        params.page++;

                        next(() => {
                            this.client.v2.everything(params).then(handle);
                        });
                    } else {
                        terminate();
                    }
                }
            }

            this.client.v2.everything(params).then(handle);
        });

    }

    transform(options = {}) {

        let rectified = {
            language: options.language,
            pageSize: options.count || DEFAULT_PAGE_SIZE
        };

        if (options.from) {
            rectified.from = options.from.toISOString();
        }

        if (options.to) {
            rectified.to = options.to.toISOString();
        }

        if (options.country) {
            rectified.sources = _.filter(NewsSources.sources, source => source.country = options.country).map(source => source.id).join(',');
        }

        return rectified;

    }

}

module.exports = NewsPlugin;