const nlp = require('compromise');

const PRECEEDING_CONTEXT_PRONOUNS = [
    'they',
    'he',
    'she',
    'we',
    'it',
    'them',
    'those'
];

const context = (pronoun, previous) => {
    let topics = [],
        isPluralPronoun = pronoun.tags.indexOf('Plural') > -1;

    previous.topics.forEach(topic => {
        let isPluralTopic = !!nlp(topic.text).nouns().isPlural().out();
        if (isPluralTopic === isPluralPronoun) {
            topics.push({
                ...topic,
                start: null,
                end: null
            });
        }
    });

    let topic = topics[0];
    if (topics && topics.length > 1) {
        topics.forEach(inner => {
            if (inner.score > topic.score) {
                topic = inner;
            }
        });

        return topic;
    }

    return topic;
}

const inference = () => {
    return (terms, results) => {
        results.records.forEach((record, i) => {
            if (record && record.senti) {
                record.senti.forEach((senti, index) => {
                    if (!senti.topics.length && record.senti[index - 1]) {
                        let topics = [],
                            pronouns = nlp(senti.text).match('#Pronoun').terms().data();

                        pronouns.forEach(pronoun => {
                            if (PRECEEDING_CONTEXT_PRONOUNS.indexOf(pronoun.text) > -1) {
                                const inferred = context(pronoun, record.senti[index - 1]);
                                if (inferred) {
                                    topics.push(inferred);
                                }
                            }
                        });

                        senti.topics = topics;
                    }
                });
            }
        });

        return results;
    }
}

module.exports = inference;