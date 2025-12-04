import json
import os
import argparse
import sys
import re
import uuid
from typing import List, Dict
import chromadb
from chromadb.utils import embedding_functions
from chromadb.config import Settings
import hashlib
from math import ceil

# wiki dataset details: https://docs.minedojo.org/sections/getting_started/data.html#wiki-database

script_dir = os.path.dirname(os.path.abspath(__file__))
db_path = os.path.join(script_dir, "kb1")

# client = chromadb.PersistentClient(path=db_path)
client = chromadb.Client(
    Settings(
        chroma_db_impl="duckdb+parquet",   # local persistent backend used in 0.3.x
        persist_directory=db_path
    )
)

try:
    from openai import OpenAI
except Exception as e:
    raise RuntimeError(
        "Failed importing OpenAI client. Ensure you have openai>=1.0 installed "
        "or pin to openai==0.28 if you want to keep the old API."
    ) from e

OPENAI_API_KEY = os.environ.get("CHROMA_OPENAI_API_KEY") or os.environ.get("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise RuntimeError("Please set CHROMA_OPENAI_API_KEY or OPENAI_API_KEY in the environment.")

_openai_client = OpenAI(api_key=OPENAI_API_KEY)

def openai_embedding_function(texts: List[str]) -> List[List[float]]:
    """
    Callable matching chroma's expected embedding_function signature:
      input: list[str] (or single str)
      output: list[list[float]] embeddings (one list per input)
    Uses OpenAI's new embeddings endpoint (openai-python >=1.0 style).
    """
    if isinstance(texts, str):
        texts = [texts]
    if not isinstance(texts, (list, tuple)):
        raise ValueError("texts must be a string or list/tuple of strings")

    model_name = "text-embedding-3-small"   # recommended for new API; change if you want text-embedding-3-large
    batch_size = 128
    all_embeddings = []
    for i in range(0, len(texts), batch_size):
        batch = texts[i : i + batch_size]
        resp = _openai_client.embeddings.create(model=model_name, input=batch)
        # resp.data is a list; each item has .embedding
        for item in resp.data:
            all_embeddings.append(item.embedding)
    return all_embeddings

# hook the callable into the Chroma collection the same way
embeddings = client.get_or_create_collection(
    name="minedojo_wiki",
    embedding_function=openai_embedding_function
)

def sanitize_for_id(s: str) -> str:
    """Make a string safe for use in an id (replace non-alnum with underscore)."""
    if not s:
        return "unknown"
    # Unescape percent-encoding if present
    try:
        from urllib.parse import unquote
        s = unquote(s)
    except Exception:
        pass
    s = s.strip()
    s = re.sub(r'[^0-9A-Za-z]+', '_', s)
    s = re.sub(r'_+', '_', s)
    return s.strip('_') or "unknown"

def make_unique_ids(ids_list: List[str]) -> List[str]:
    """
    If any IDs are duplicated, make them unique by appending a short uuid.
    This avoids add-time failures while keeping the original id readable when unique.
    """
    seen = {}
    new_ids = []
    for i, id_ in enumerate(ids_list):
        if id_ not in seen:
            seen[id_] = 1
            new_ids.append(id_)
        else:
            seen[id_] += 1
            # append a short uuid suffix to make it unique
            suffix = uuid.uuid4().hex[:8]
            new_id = f"{id_}__dup{seen[id_]}__{suffix}"
            new_ids.append(new_id)
    return new_ids

def process_entry(entry: Dict, file_key: str) -> List[Dict]:
    """
    Turn a single data.json entry into chunk dicts.
    file_key should be a string identifying the file/dir (used to make ids unique across files).
    """
    # Try a few places for the title
    title = None
    if isinstance(entry, dict):
        # common patterns: entry['title'] or entry['metadata']['title']
        title = entry.get('title')
        if not title:
            metadata = entry.get('metadata') or {}
            # metadata might be a dict with key 'title' or 'title' nested differently
            if isinstance(metadata, dict):
                title = metadata.get('title')
            # sometimes keys are flattened; try fallback:
            if not title:
                title = entry.get('metadata.title')

    page_title = title or "Unknown Page"

    chunks = []

    if 'texts' in entry and isinstance(entry['texts'], list):
        for idx, text_item in enumerate(entry['texts']):
            clean_text = (text_item.get('text', '') if isinstance(text_item, dict) else str(text_item)).strip()
            # sanitize parts used in id
            small_title = sanitize_for_id(page_title)
            small_filekey = sanitize_for_id(file_key)
            base_id = f"{small_filekey}__{small_title}__text_{idx}"

            chunk = {
                "text": f"Wiki Page '{page_title}': {clean_text}",
                "metadata": {
                    "source": "text_section",
                    "title": page_title,
                    "url": entry.get('url', '')
                },
                "id": base_id
            }
            chunks.append(chunk)
    return chunks

def get_existing_ids(collection, ids_to_check: List[str], batch_size=256) -> set:
    """Check which IDs already exist in the collection."""
    existing = set()
    # check in batches
    for i in range(0, len(ids_to_check), batch_size):
        batch = ids_to_check[i:i+batch_size]
        try:
            response = collection.get(ids=batch)
            found_ids = response.get('ids') or []
            if isinstance(found_ids, (list, tuple, set)):
                existing.update(found_ids)
        except Exception:
            for single in batch:
                try:
                    resp = collection.get(ids=[single])
                    if resp.get('ids'):
                        existing.add(single)
                except Exception:
                    pass
    return existing

def add_only_new(collection, documents, metadatas, ids, batch_check_size=256):
    if not ids:
        return
    existing_ids = get_existing_ids(collection, ids, batch_size=batch_check_size) #get existing ids already in colelction

    new_docs = []
    new_metadata = []
    new_ids = []
    for doc, meta, id in zip(documents, metadatas, ids):
        if id in existing_ids:
            continue
        new_docs.append(doc)
        new_metadata.append(meta)
        new_ids.append(id)

    if len(new_ids) > 0:
        collection.add(documents=new_docs, metadatas=new_metadata, ids=new_ids)
        print(f"Added {len(new_ids)} new docs, skipped {len(ids) - len(new_ids)} already existing ids")
    else:
        print("No new docs to add (all ids already present).")

parser = argparse.ArgumentParser(
    description="Builds knowledge base as a ChromaDB database by recursively processing the data.json files under the specified dataset_path ."
)
parser.add_argument("dataset_path", type=str, help="Path to raw data directories")
args = parser.parse_args()

if not os.path.exists(args.dataset_path):
    print(f"dataset_path '{args.dataset_path}' not found")
    sys.exit(1)

docs = []
metas = []
ids = []
BATCH_SIZE = 100  # arbitrary
file_cnt = 0

for root, dirs, files in os.walk(args.dataset_path):
    if "data.json" in files:
        json_path = os.path.join(root, "data.json")

        try:
            with open(json_path, 'r', encoding='utf-8') as f:
                entry_data = json.load(f)

            # build a file_key based on relative path from dataset root
            file_key = os.path.relpath(root, args.dataset_path).replace(os.sep, '_') or 'root'
            chunks = process_entry(entry_data, file_key)

            if chunks:
                file_cnt += 1
                print(f"Processing: {entry_data.get('title', 'Untitled')} ({len(chunks)} chunks)")

                for chunk in chunks:
                    docs.append(chunk['text'])
                    metas.append(chunk['metadata'])
                    ids.append(chunk['id'])

                    if len(docs) >= BATCH_SIZE:
                        # ensure ids are unique before adding
                        if len(ids) != len(set(ids)):
                            print("Duplicate IDs detected in batch; making them unique automatically.")
                            ids = make_unique_ids(ids)
                        # embeddings.add(
                        #     documents=docs,
                        #     metadatas=metas,
                        #     ids=ids
                        # )
                        add_only_new(embeddings, docs, metas, ids)
                        docs, metas, ids = [], [], []

        except Exception as e:
            print(f"Failed processing file {json_path}: {e}")

if docs:
    if len(ids) != len(set(ids)):
        print("Duplicate IDs detected in final batch; making them unique automatically.")
        ids = make_unique_ids(ids)
    # embeddings.add(
    #     documents=docs,
    #     metadatas=metas,
    #     ids=ids
    # )
    add_only_new(embeddings, docs, metas, ids)

client.persist()

print(f"finished processing {file_cnt} files")

# TESTING
query = "recipe for iron pickaxe"
results = embeddings.query(
    query_texts=[query],
    n_results=1
)

if results.get('documents') and results['documents'][0]:
    print(f"query: '{query}'")
    print(f"result: {results['documents'][0][0]}")
else:
    print("result: NONE")
