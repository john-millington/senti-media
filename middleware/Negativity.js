const _ = require('lodash');

const negativity = (tolerance) => {
    return (terms, results) => {
        results.negatives = _.filter(results.records, item => {
            item.senti = _.filter(item.senti, senti => {
                return senti.sentiment.prediction === 'NEGATIVE';
            });

            return item.senti.length;
        });

        return results;
    }
}

module.exports = negativity;
