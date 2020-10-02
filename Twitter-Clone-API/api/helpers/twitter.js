const axios = require('axios');
const URL = 'https://api.twitter.com/1.1/search/tweets.json';

class Twitter {

    get = (count, query, maxId) => {
        const tweetsPromise = axios.get(URL, {
                'params': {
                    'q': query,
                    'count': count,
                    'tweet_mode': 'extended', // gives non-truncated version of tweet's text 
                    'max_id': maxId
                },
                'headers': {
                    'Authorization': `Bearer ${process.env.TWITTER_API_TOKEN}`
                }
                })
        
        return tweetsPromise; // returns a promise to get tweets             
    }
}

module.exports = Twitter;