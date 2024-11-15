import pandas as pd
import torch
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

# Load pre-trained Sentence-BERT model
model = SentenceTransformer('all-MiniLM-L6-v2')

# Load CSV containing hashtags, followers, and descriptions
df = pd.read_csv('db.csv')

# Example post description
post_description = "Last week, the Teladoc Health Asia team took the stage at the 5th Health Innovation Congress Asia Pacific 2024 in Singapore. Myra Yu, Managing Director of Asia, joined a panel discussion with industry leaders and experts to explore the digital health ecosystem in APAC, addressing challenges unique to Asia and the region's evolving regulatory landscapes. Myra shared Teladoc Health’s vision for the APAC ecosystem, underscoring our strategies for harnessing digital health ecosystems to improve service delivery and elevate customer engagement. She also highlighted Teladoc Health's role in enhancing members' healthcare experiences at every stage of life. We extend our gratitude to the 5th Health Innovation Congress for providing an invaluable platform for dialogue between healthcare and technology leaders."

# Get the embedding for the post description
post_embedding = model.encode(post_description)

# Generate embeddings for all hashtags with descriptions
hashtag_embeddings = []
for _, row in df.iterrows():
    # Concatenate the hashtag with its description

    # hashtag_with_desc = f"{row['hashtag']} {row['description']}"
    hashtag_with_desc = f"{row['hashtag']}"
    hashtag_embedding = model.encode(hashtag_with_desc)
    hashtag_embeddings.append(hashtag_embedding)

# Compute cosine similarity between the post description and each hashtag
similarities = cosine_similarity([post_embedding], hashtag_embeddings)[0]

# Add similarity scores to the dataframe
df['similarity'] = similarities

# Normalize follower count (e.g., by dividing by the maximum follower count)
df['normalized_followers'] = df['followers'] / df['followers'].max()

# Combine similarity and follower count into a final score (weighed by similarity and followers)
df['score'] = df['similarity'] * 1 + df['normalized_followers'] * 0

# Sort the hashtags based on the combined score
df_sorted = df.sort_values(by='score', ascending=False)

# Set the option to display all rows
pd.set_option('display.max_rows', None)

filtered_df = df_sorted[df_sorted['score'] > 0.15]

# Display best fitting hashtags
# print(filtered_df[['hashtag', 'followers', 'similarity', 'score']])
print(filtered_df[['hashtag', 'followers', 'similarity', 'score']].head(8))
