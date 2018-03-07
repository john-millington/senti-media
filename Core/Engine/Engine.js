const _ = require('lodash');

const Senti = require('./Senti');
const Stream = require('./../Utilities/Stream');

class Engine {

    constructor(plugins) {

        this.plugins = plugins;
        this.senti = new Senti();

    }

    run(terms) {

        let streams = [];
        this.plugins.forEach(plugin => {
            streams.push(plugin.search(terms));
        });

        return new Stream((give, reject, terminate, next) => {
            Stream.all(streams).throttle(5000).take((results) => {
                this.senti.process(results).then(processed => {
                    give(processed);
                });
            }).finish(() => {
                terminate();
            });
        });

    }

}

module.exports = Engine;