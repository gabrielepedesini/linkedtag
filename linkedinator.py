import pandas as pd
import torch
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import json 

# load the ai model
model = SentenceTransformer('all-MiniLM-L6-v2')

# load the csv containing the hashtags 
df = pd.read_csv('db.csv', usecols=['hashtag', 'followers', "embedding"])

# input
post_description = "Some time ago, a new company named Inflection AI presented itself as a promising bridge between computers and humans: Throughout computing history, humans have had to learn the language of machines. In the new paradigm, machines will understand our language. It's a significant venture supported by Greylock, with a founding team that includes Reid Hoffman, co-founder of LinkedIn (his first venture post-LinkedIn!), and Mustafa Suleyman, co-founder of Google DeepMind, alongside Karén Simonyan, the chief scientist theyve recruited for operations, products, security, and technology. Today, cars are driving and fly autonomously, surgeons are saving lives and transplanting organs globally, and quantum computing is rendering the impossible possible in many fields. There are also Web3, IoT, NFTs, blockchain, 3D printing, government tokenization, cryptocurrencies, and nanobots. Kudos to all the visionaries, luminaries, innovators, entrepreneurs, data scientists, futurists, and technologists worldwide."

# get the embeddings for the input
post_embedding = model.encode(post_description)

# if 'embedding' in df.columns:
#     df['embedding'] = None

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

# set the option to display all rows
pd.set_option('display.max_rows', None)

# filter hashtag for score
filtered_df = df_sorted[df_sorted['score'] > 0.15]

# display input
print(filtered_df[['hashtag', 'followers', 'similarity', 'score']].head(8))
