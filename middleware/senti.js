const SentiEngine = require("./../engine/Senti");

const senti = config => {
    const SentimentEngine = new SentiEngine(config);

    return async (terms, records) => {
        console.log(records);
        return {
            records: await SentimentEngine.process(records.records)
        };
    };
};

module.exports = senti;
