from voyager import Voyager
import os

azure_login = {
    "client_id": os.environ.get("CLIENT_ID"),
    "redirect_url": "https://127.0.0.1/auth-response",
    "secret_value": os.environ.get("CLIENT_SECRET"),
    "version": "fabric-loader-0.14.18-1.19",
}

i = 2
print(f"\033[34m=== Starting lifelong learning trial {i + 1} ===\033[0m")
voyager = Voyager(
    azure_login=azure_login,    
    openai_api_key=os.environ.get("DEEPSEEK_API_KEY"),    
    ckpt_dir="./new_learning_trial_" + str(i + 1), # check point dir created by the agent.
    max_iterations=25,    # small test. 
    # kb_dir="./knowledge_base/knowledge_base1", # agent uses default behavior when kb_dir is None.
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