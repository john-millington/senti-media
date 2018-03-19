const SentiEngine = require('./../engine/Senti');

const senti = (config) => {
    const SentimentEngine = new SentiEngine(config);
    
    return async (terms, records) => {
        return {
            records: await Processor.process(records.records)
        };
    };
}

module.exports = senti;