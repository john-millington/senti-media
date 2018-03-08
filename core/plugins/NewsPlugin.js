const Config = require('./../../senti.config.js');
const NewsSources = require('./data/sources.json');

const curl = require('curl');
const unfluff = require('unfluff');
const NewsAPI = require('newsapi');
const _ = require('lodash');

const Plugin = require('./Plugin');
const Stream = require('./../utilities/Stream');

const DEFAULT_PAGE_SIZE = 100;

class NewsPlugin extends Plugin {

    constructor() {

        super(...arguments);
        this.client = new NewsAPI(Config.NewsAPI.api_key);

    }

    articles(articles) {

        let promises = [];
        articles.forEach(article => {
            promises.push(this.extract(article));
        });

        return new Promise(resolve => {
            Promise.all(promises).then(articles => {
                resolve(articles);
            });
        });

    }

    extract(article) {

        return new Promise(resolve => {
            curl.get(article.url, {}, (error, response, body) => {
                let resolution = {
                        text: article.title + '. ' + article.description,
                        metadata: {
                            type: 'senti.news',
                            ...article
                        }
                    };

                if (body) {
                    let parsed = unfluff(body);
                    resolution.text = parsed.text;
                }

                resolve(resolution);
            });
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
                    this.articles(response.articles).then(articles => {
                        give(articles);
                    
                        processedResults += response.articles.length;
                        if (response.totalResults > processedResults) {
                            params.page++;

                            next(() => {
                                this.client.v2.everything(params).then(handle);
                            });
                        } else {
                            terminate();
                        }
                    });
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
            rectified.sources = _.filter(NewsSources.sources, source => source.country === options.country).map(source => source.id).join(',');
        }

        return rectified;

    }

}

module.exports = NewsPlugin;