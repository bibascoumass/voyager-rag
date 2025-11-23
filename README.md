# Overview
Voyager-RAG:
The goal is to enhance the VOYAGER agent loop by retrieving task relevant information from our Reddit/Wiki-based Minecraft knowledge base and injecting that into the prompt given to GPT-4 for code generation that is meant to execute that task. 

The current agent loop is roughly:
1. Automatic curriculum proposes a task "Craft a spyglass" 
    * System prompts GPT4 for a task based on its current environment. The prompt is composed of: directives, constraints, agent state (inventory, enviornment, status), exploration progress and additional context. 

2. Skill library is queried for relevant existing skills

3. GPT-4 is prompted with the output of the previous two components to generate executable code for the task. 
    * The code is executed in Minecraft and the agent is given the following feedback: environment feedback, execution errors, self-verification from a separate GPT-4 agent that  verify success or failure based on the voyager agent's state.
    * If the task isn't completed, env feedback and exec errors are added into the next prompt until success or the agent gets stuck.
    * On success, new skill is indexed by the embedding of its description (to be retrieved later for other tasks)

We're looking to either improve the additional context added for the task plan generation in step 1 or add additional information retrieval step before code generation at step 3. 

## Minecraft Knowledge Base
We'll need process the wiki/reddit data in order to build the knowledge base. The simplest form of this would be to just treat everything as raw text and look them up using some similarity search:
1. Clean up raw text of irrelevant info (e.g. HTML syntax, etc...)
2. Chunk the docs 
3. Embed each chunk into a vector using a text embedding model. 
4. Index the embeddings + chunks in some vector DB. 

# TODO
* Everyone should:
  * Get their own OPENAI_API_KEY
  * Download the datasets (https://github.com/MineDojo/MineDojo/tree/main/minedojo/data)

Objectives:
* Replicate Voyager GPT-4 baseline. (Do we even get similar results?)
* Build the minecraft knowledgebase 
    * Should use the same text embedding model used by voyager? 