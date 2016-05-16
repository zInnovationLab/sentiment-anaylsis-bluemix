from datetime import date, timedelta
import os
import json
import sys
import tweepy
import pymongo

COLLECTION_NAME = 'tweets'

# Gets the Mongo DB URL and DB from VCAP_SERVICES if present, else
# assumes the Mongo instance is running locally
url = 'mongodb://mongo_server:27017/tweets'
if os.environ.has_key('VCAP_SERVICES'):
    vcapJson = json.loads(os.environ['VCAP_SERVICES'])
    for key, value in vcapJson.iteritems():
        #Only find the services with the name todo-mongo-db, there should only be one
        mongoServices = filter(lambda s: s['name'].find('mongo') != -1, value)
        if len(mongoServices) != 0:
            mongoService = mongoServices[0]
            if "uri" in mongoService['credentials']:
                url = mongoService['credentials']['uri']
            else:
                url = mongoService['credentials']['url']

client = pymongo.MongoClient(url)
db = client.get_default_database()
tweet_col = db[COLLECTION_NAME]

twitter_key = os.environ.get('TWITTER_APIKEY', '''{
        "consumer_key": "",
        "consumer_secret": "",
	"access_token": "",
	"access_token_secret": ""
	}''')
twitter_key = json.loads(twitter_key)

CONSUMER_KEY = twitter_key['consumer_key']
CONSUMER_SECRET = twitter_key['consumer_secret']
ACCESS_TOKEN = twitter_key['access_token']
ACCESS_TOKEN_SECRET = twitter_key['access_token_secret']

# https://dev.twitter.com/rest/reference/get/search/tweets
TWEETS_PER_PAGE=100  # max
until = date.today() - timedelta(days=7)  # not used.  also, has a 7 day limit
result_type = 'mixed' # popular, mixed, recent.  popular doesn't return many results
# twitter auth
auth = tweepy.OAuthHandler(CONSUMER_KEY, CONSUMER_SECRET)
auth.set_access_token(ACCESS_TOKEN, ACCESS_TOKEN_SECRET)
api = tweepy.API(auth)
# call twitter api and return
def get_tweets(query, max_id=None):
    if max_id:
        res_tweets = api.search(query, max_id=max_id, count=TWEETS_PER_PAGE, show_user=True, result_type=result_type)
    else:
        res_tweets = api.search(query, count=TWEETS_PER_PAGE, show_user=True, result_type=result_type)
    tweets = []
    for tweet in res_tweets:
    #tweet = tweet._json
        t = {}
        try:
            t['id'] = str(tweet.id)
            t['favCount'] = tweet.favorite_count
            t['place'] = '' #tweet.place.coordinates if tweet.place else ''
            t['time'] = tweet.created_at.strftime('%c')
            t['text'] = tweet.text
            t['coord'] = tweet.coordinates if tweet.coordinates else ''
        except Exception, ex:
            print repr(ex)
        tweets.append(t)
        print t
        print '========================================================'
    return tweets

def update_all(count):
    # collect tweets until we reach count
    #last_count = 0
    with open("searches.txt", "rb") as searches:
        allsearches = searches.readlines()
        for query in allsearches:
            tweets = []
            last_count = 0
            print query
            while len(tweets) < count:
                if len(tweets) == 0:
                    tweets = get_tweets(query)
                else:
                    tweets += get_tweets(query, tweets[-1]['id'])
                    print "found %d tweets" % len(tweets)
                    if last_count == len(tweets):
                        break  # no progress
                        last_count = len(tweets)
        # insert all results into mongo
        tweet_col.insert_many(tweets)


if __name__ == "__main__":
    # get parameters
    if len(sys.argv) > 1:
        count = int(sys.argv[1])
    else:
        print "USAGE: %s count" % sys.argv[0]
        sys.exit(8)

    update_all(count)
