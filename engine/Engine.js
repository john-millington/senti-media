const _ = require('lodash');

const Senti = require('./Senti');
const Stream = require('./../utilities/Stream');

class Engine {

    constructor(config) {

        this.senti = new Senti(config.aws);

        this.providers = config && config.providers || [];
        this.middleware = config && config.middleware || [];

    }

    provider(provider) {

        if (this.providers.indexOf(provider) === -1) {
            this.providers.push(provider);
        }

        return this;

    }

    start(terms, options = {}) {

        options = _.pick(options, [
            'from',
            'to',
            'count',
            'language',
            'country',
            'operator'
        ]);

        let streams = [];
        this.providers.forEach(provider => {
            streams.push(provider.search(terms, options));
        });

        return new Stream((give, reject, terminate, next) => {
            Stream.all(streams).throttle(500).take((results) => {
                this.senti.process(results).then(processed => {
                    let records = {
                        records: processed
                    };

                    let i = this.middleware.length;
                    while (i--) {
                        records = this.middleware[i](terms, records);
                    }

                    give(records);
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