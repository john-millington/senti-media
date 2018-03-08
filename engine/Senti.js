const AWS = require('aws-sdk');
const nlp = require('compromise');
const _ = require('lodash');

const AWS_TEXT_LIST_LIMIT = 25;

class Senti {

    constructor(config) {

        AWS.config.update(config);
        this.service = new AWS.Comprehend();

    }

    batch(method, context, list, limit) {

        let promises = [];
        for (let index = 0; index < list.length; index += limit) {
            promises.push(this.call(method, context, list.slice(index, index + limit)));
        }

        return new Promise(resolve => {
            Promise.all(promises).then(response => {
                let ResultList = [],
                    ErrorList = [];

                response.forEach((item, position) => {
                    let itemResultList = item && item.ResultList;
                    if (itemResultList) {
                        itemResultList.forEach(result => {
                            result.Index = (position * limit) + result.Index;
                        });

                        ResultList = [...ResultList, ...itemResultList];
                    }

                    let itemErrorList = item && item.ErrorList;
                    if (itemErrorList) {
                        itemErrorList.forEach(error => {
                            error.Index = (position * limit) + error.Index;
                        });

                        ErrorList = [...ErrorList, ...itemErrorList];
                    }
                });

                resolve({
                    ResultList,
                    ErrorList
                });
            })
        });

    }

    call(method, context, list) {

        return new Promise(resolve => {
            method.call(context, {
                LanguageCode: 'en',
                TextList: list
            }, (err, data) => {
                resolve(data);
            });
        });

    }

    postprocess(results) {

        let processed = [];
        results.forEach(result => {
            if (!processed[result.index]) {
                processed[result.index] = result.entry;
                processed[result.index].senti = [];
            }

            processed[result.index].senti.push({
                Text: result.chunk,
                Sentiment: {
                    Prediction: result.sentiment.Sentiment,
                    Scores: result.sentiment.SentimentScore
                },
                KeyPhrases: result.phrases && result.phrases.KeyPhrases || [],
                Topics: result.topics
            });
        });

        return processed;

    }

    process(textlist) {

        return new Promise(resolve => {
            let processed = [],
                results = [];

            textlist.forEach((entry, index) => {
                let clauses = [], // nlp(entry.text).normalize().clauses().out('array'),
                    sentences = nlp(entry.text).normalize().sentences().out('array'),
                    chunks = _.uniq([...clauses, ...sentences]);

                chunks.forEach(chunk => {
                    processed.push(chunk);

                    results.push({
                        entry,
                        index,
                        chunk,
                        topics: this.topics(chunk)
                    });
                });

                this.batch(this.service.batchDetectKeyPhrases, this.service, processed, AWS_TEXT_LIST_LIMIT).then(phrases => {
                    phrases && phrases.ResultList.forEach(phrase => {
                        results[phrase.Index].phrases = phrase;
                    });

                    this.batch(this.service.batchDetectSentiment, this.service, processed, AWS_TEXT_LIST_LIMIT).then(sentiments => {
                        sentiments && sentiments.ResultList.forEach(sentiment => {
                            results[sentiment.Index].sentiment = sentiment;
                        });

                        resolve(this.postprocess(results));
                    });
                });
            });
        });

    }

    topics(chunk) {

        return nlp(chunk).nouns().out('array').map(topic => {
            return {
                Score: 1,
                Text: topic,
                BeginOffset: chunk.indexOf(topic),
                EndOffset: chunk.indexOf(topic) + topic.length
            };
        });

    }

}

module.exports = Senti;