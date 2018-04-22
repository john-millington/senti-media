const nlp = require('compromise');

const phrases = () => {
    return (terms, results) => {
        results.records.forEach(record => {
            record.phrases = nlp(record.text).nouns().data().map(noun => {
                return {
                    text: noun.text,
                    score: 1
                };
            })
        });
    }
}

module.exports = phrases;