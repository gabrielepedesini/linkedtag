from flask import Flask, request, render_template, jsonify
import pandas as pd
import torch
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import json 

# init the flask app
app = Flask(__name__)

# load the ai model
model = SentenceTransformer('all-MiniLM-L6-v2')

# load the csv containing the hashtags 
df = pd.read_csv('db.csv', usecols=['hashtag', 'followers', "embedding"])

# home page
@app.route('/')

def home():
    return render_template('index.html')

# process to generate the hashtags
@app.route('/generate-hashtags', methods=['POST'])

def process():

    # input
    post_description = request.form['description']

    # get the embeddings for the input
    post_embedding = model.encode(post_description)

    # generate/use the embeddings of the hashtags
    hashtag_embeddings = []
    added = 0

    for index, row in df.iterrows():

        if pd.notna(row['embedding']):
            # load the hashtag embedding from csv
            embedding = json.loads(row['embedding'])
        else:
            # calculate and store the hashtag embedding
            hashtag = f"{row['hashtag']}"  
            embedding_array = model.encode(hashtag)  
            embedding = embedding_array.tolist()  
            df.at[index, 'embedding'] = json.dumps(embedding)
            added += 1

        hashtag_embeddings.append(embedding)

    # check if there is some new embedding to save
    if added > 0:
        df.to_csv('db.csv', index=False)

    # compute cosine similarity between the input and each hashtag
    similarities = cosine_similarity([post_embedding], hashtag_embeddings)[0]

    # save similarity scores
    df['similarity'] = similarities

    # calculate the score
    df['score'] = df['similarity'] * 1 + df['followers'] * 0

    # sort hashtags for score
    df_sorted = df.sort_values(by='score', ascending=False)

    # filter hashtag for score
    filtered_df = df_sorted[df_sorted['score'] > 0.15]

    # display output
    # print(filtered_df[['hashtag', 'followers', 'similarity', 'score']].head(8))

    # get top results
    top_results = filtered_df[['hashtag', 'followers', 'score']].head(10).to_dict(orient='records')

    return jsonify(top_results)

if __name__ == '__main__':
    app.run(debug=True)