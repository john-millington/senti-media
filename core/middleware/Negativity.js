const _ = require('lodash');
const Middleware = require('./Middleware');

class Negativity extends Middleware {

    id() {
        return 'senti.negativity';
    }

    run(terms, results) {
        return _.filter(results, item => {
            item.senti = _.filter(item.senti, senti => {
                return senti.Sentiment.Prediction === 'NEGATIVE';
            });

            return item.senti.length;
        });
    }

}

module.exports = Negativity;