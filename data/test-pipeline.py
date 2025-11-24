import json
import os
import argparse
from typing import List, Dict
import chromadb
from chromadb.utils import embedding_functions

# wiki dataset details: https://docs.minedojo.org/sections/getting_started/data.html#wiki-database

client = chromadb.PersistentClient(path= "./voyager_knowledge_base")

# chroma DB wrapper for openAI
openai_ef = embedding_functions.OpenAIEmbeddingFunction(
    api_key=os.environ.get("OPENAI_API_KEY"), # ensure OPENAI_API_KEY env var is for api key
    model_name="text-embedding-ada-002" 
)

# https://cookbook.chromadb.dev/core/collections/
embeddings = client.get_or_create_collection(
    name="minedojo_wiki",
    embedding_function=openai_ef
)

def process_entry(entry: Dict) -> List[Dict]:
    # print(f"ENTRY: {entry}")
    page_title = entry.get('metadata.title', 'Unknown Page') 
    
    chunks = []
        
    if 'texts' in entry: # other data types are 'metadata', 'tables', 'images', 'sprites', 'texts', 'screenshot'
        for idx, text_item in enumerate(entry['texts']):
            # TODO - determine if we need to do anymore data cleaning here. 
            clean_text = text_item.get('text', '').strip()            
            
            chunk = {
                "text": f"Wiki Page '{page_title}': {clean_text}",
                "metadata": {
                    "source": "text_section",
                    "title": page_title,
                    "url": entry.get('url', '')
                },
                # chunk ID = title + idx
                "id": f"{page_title.replace(' ', '_')}_text_{idx}"
            }
            chunks.append(chunk)
            # print(f"CHUNK: {chunk}")
    
                
    return chunks

parser = argparse.ArgumentParser()
parser.add_argument("dataset_path", type=str, help="")
args = parser.parse_args()

if not os.path.exists(args.dataset_path):
    print(f"dataset_path '{args.dataset_path}' not found")
    exit

docs = []
metas = []
ids = []
BATCH_SIZE = 100 # arbitrary
file_cnt = 0

for root, dirs, files in os.walk(args.dataset_path):
    if "data.json" in files:
        json_path = os.path.join(root, "data.json")
        
        try:
            with open(json_path, 'r', encoding='utf-8') as f:
                entry_data = json.load(f)

            chunks = process_entry(entry_data)
            
            if chunks:
                file_cnt += 1
                print(f"Processing: {entry_data.get('title', 'Untitled')} ({len(chunks)} chunks)") # todo fix metadata reference

                for chunk in chunks:
                    docs.append(chunk['text'])
                    metas.append(chunk['metadata'])
                    ids.append(chunk['id'])
                                    
                    if len(docs) >= BATCH_SIZE:
                        embeddings.add(
                            documents=docs,
                            metadatas=metas,
                            ids=ids
                        )                        
                        docs, metas, ids = [], [], []

        except Exception as e:
            print(f"Failed processing file {json_path}: {e}")

if docs:
    embeddings.add(
        documents=docs,
        metadatas=metas,
        ids=ids
    )

print(f"finished processing {file_cnt} files")

# TESTING
query = "recipe for iron pickaxe"
results = embeddings.query( # https://cookbook.chromadb.dev/core/advanced/queries/#query-pipeline
    query_texts=[query],
    n_results=1
)

if results['documents'] and results['documents'][0]:
    print(f"query: '{query}'")
    print(f"result: {results['documents'][0][0]}")
else:
    print("result: NONE")
