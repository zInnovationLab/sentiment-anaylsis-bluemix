import os
from flask import Flask
import tweety

app = Flask(__name__)

@app.route('/update/<int:count>')
def update(count):
	tweety.update_all(count)	
	return "Finished update with count=%d" % count

port = os.getenv('PORT', '5000')
if __name__ == '__main__':
	app.run(host='0.0.0.0', port=int(port))