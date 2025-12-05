import sys
import os
from langchain.vectorstores import Chroma
from langchain.embeddings.openai import OpenAIEmbeddings

# Configuration: Path to the vectordb folder you want to check
# Default matches the trial3 path seen in your logs
DEFAULT_DB_PATH = "./skill_library/trial3/skill/vectordb"
# DEFAULT_DB_PATH = "./knowledge_base/kb1"

def inspect_db():
    # Allow passing path as argument, otherwise use default
    persist_dir = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_DB_PATH

    print(f"--- Inspecting VectorDB at: {persist_dir} ---")

    # Voyager uses OpenAIEmbeddings, so we must initialize with it to load the DB correctly.
    # This requires the API key to be set, even just to read.
    if "OPENAI_API_KEY" not in os.environ:
        print("\n[!] Error: OPENAI_API_KEY environment variable is not set.")
        print("    Export it with: export OPENAI_API_KEY='sk-...'")
        return

    try:
        # [cite_start]Initialize Chroma client exactly how SkillManager does [cite: 40-44]
        vectordb = Chroma(
            collection_name="skill_vectordb",
            embedding_function=OpenAIEmbeddings(),
            persist_directory=persist_dir,
        )

        # Access the underlying collection to get raw data
        collection = vectordb._collection
        count = collection.count()
        
        print(f"\nTotal Skills stored: {count}")

        if count > 0:
            print("\nStored Skills:")
            # Retrieve all metadata to show names
            data = collection.get()
            for idx, meta in enumerate(data['metadatas']):
                name = meta.get('name', 'Unknown')
                print(f"  {idx + 1}. {name}")
        else:
            print("\n[!] The database is empty.")
            
    except Exception as e:
        print(f"\n[!] Failed to load database: {e}")
        print("    This usually implies a version mismatch between the created DB and your installed libraries.")

if __name__ == "__main__":
    inspect_db()