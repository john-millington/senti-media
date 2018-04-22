const _ = require("lodash");

const Stream = require("./../utilities/Stream");
const senti = require("./../middleware/senti");

class Engine {
    constructor(config = {}) {
        this.providers = config.providers || [];
        this.middleware = config.middleware || [];

        if (config.aws) {
            this.middleware.unshift(senti(config.aws));
        }
    }

    provider(provider) {
        if (this.providers.indexOf(provider) === -1) {
            this.providers.push(provider);
        }

        return this;
    }

    start(terms, options = {}) {
        options = _.pick(options, ["from", "to", "count", "language", "country", "operator"]);

        let streams = [];
        this.providers.forEach(provider => {
            streams.push(provider.search(terms, options));
        });

        return new Stream((give, reject, terminate, next) => {
            Stream.all(streams)
                .throttle(500)
                .take(async results => {
                    let records = {
                        records: results
                    };

                    let i = this.middleware.length;
                    while (i--) {
                        let result = await this.middleware[i](terms, records);
                    }

                    give(records);
                })
                .finish(() => {
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
