const _ = require('lodash');

const positivity = (tolerance = 0) => {
    return (terms, results) => {
        results.positives = _.filter(results.records, item => {
            item.senti = _.filter(item.senti, senti => {
                // let scores = senti.sentiment.scores;
                // return Math.max(scores.positive, scores.negative, scores.neutral, scores.mixed) - scores.positive < tolerance;

                return senti.sentiment.prediction === 'POSITIVE';
            });

            return item.senti.length;
        });

        return results;
    }
}

module.exports = positivity;