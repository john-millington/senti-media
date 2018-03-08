const _ = require('lodash');
const Middleware = require('./Middleware');

class Positivity extends Middleware {

    id() {
        return 'senti.positivity';
    }

    run(terms, results) {
        return _.filter(results, item => {
            item.senti = _.filter(item.senti, senti => {
                return senti.Sentiment.Prediction === 'POSITIVE';
            });

            return item.senti.length;
        });
    }

}

module.exports = Positivity;