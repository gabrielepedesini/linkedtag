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
post_description = "Food sorting automation is not easy if you’re working with products sourced from Mother Nature like peaches; traditional machine vision just cannot handle nature’s variety. That’s why QING | Forward Engineering integrated Robovision’s Vision AI Platform into their newest machine. This vision AI-powered system: Automates quality control on a conveyor belt Sorts peaches at 1,000 pieces per minute Works with superhuman precision. The application was trained to qualify and sort the peaches for abnormalities, such as bruises or kernels. The end customers' operators can now use and retrain it on their own. Want to know more about Vision AI in food processing?"

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
df['score'] = df['similarity'] * 1 + df['normalized_followers'] * 0

# sort hashtags for score
df_sorted = df.sort_values(by='score', ascending=False)

# set the option to display all rows
pd.set_option('display.max_rows', None)

# filter hashtag for score
filtered_df = df_sorted[df_sorted['score'] > 0.15]

# display input
print(filtered_df[['hashtag', 'followers', 'similarity', 'score']].head(8))
