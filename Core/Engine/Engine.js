const _ = require('lodash');

const Senti = require('./Senti');
const Stream = require('./../Utilities/Stream');

class Engine {

    constructor(config) {

        this.senti = new Senti();

        this.plugins = config && config.plugins || [];
        this.middleware = config && config.middleware || [];

    }

    plugin(plugin) {

        if (this.plugins.indexOf(plugin) === -1) {
            this.plugins.push(plugin);
        }

        return this;

    }

    start(terms, options = {}) {

        options = _.pick(options, [
            'from',
            'to',
            'count',
            'language',
            'country'
        ]);

        let streams = [];
        this.plugins.forEach(plugin => {
            streams.push(plugin.search(terms, options));
        });

        return new Stream((give, reject, terminate, next) => {
            Stream.all(streams).throttle(500).take((results) => {
                this.senti.process(results).then(processed => {
                    let extractions = {};
                    this.middleware.forEach(middleware => {
                        extractions[middleware.id()] = middleware.run(terms, processed);
                    });

                    give(extractions);
                });
            }).finish(() => {
                terminate();
            });
        });

    }

    use(middleware) {

        if (this.middleware.indexOf(middleware) === -1) {
            this.middleware.push(middleware);
        }

        return this;

    }

}

module.exports = Engine;