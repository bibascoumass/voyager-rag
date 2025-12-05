from voyager import Voyager
import os

mc_port = 57801
openai_api_key = os.environ.get("OPENAI_API_KEY") # i use env vars for api keys

voyager = Voyager(
    mc_port=mc_port,
    openai_api_key=os.environ.get("DEEPSEEK_API_KEY"),    
    ckpt_dir="./new_learning_trial2", # check point dir created by the agent.
    max_iterations=25,    # small test. 
    # kb_dir="./knowledge_base/kb1", # agent uses default behavior when kb_dir is None.
    # DO NOT use the default gpt-4 for testing. Expensive.
    action_agent_model_name="deepseek-coder",
    curriculum_agent_model_name="deepseek-chat",
    curriculum_agent_qa_model_name="deepseek-chat",
    critic_agent_model_name="deepseek-chat",
    skill_manager_model_name="deepseek-chat",
    # skill_library_dir="./skill_library/trial1",
)

    # start lifelong learning
voyager.learn()