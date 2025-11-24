from voyager import Voyager
import os

mc_port = # PORT will be listed in minecraft chat
openai_api_key = os.environ.get("OPENAI_API_KEY") # i use env vars for api keys

voyager = Voyager(
    mc_port=mc_port,    
    openai_api_key=openai_api_key,    
    ckpt_dir="./ckpt_5_iterations", # check point dir created by the agent.
    max_iterations=5,    # small test. 
    kb_dir="./knowledge_base/knowledge_base1",
    # DO NOT use the default gpt-4 for testing. Expensive.
    action_agent_model_name = "gpt-4o-mini",
    curriculum_agent_model_name  = "gpt-4o-mini",        
    critic_agent_model_name = "gpt-4o-mini",
    # skill_library_dir="./skill_library/trial1",
    # resume=True
)

# start lifelong learning
voyager.learn()