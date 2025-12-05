from voyager import Voyager
import os

azure_login = {
    "client_id": os.environ.get("CLIENT_ID"),
    "redirect_url": "https://127.0.0.1/auth-response",
    "secret_value": os.environ.get("CLIENT_SECRET"),
    "version": "fabric-loader-0.14.18-1.19",
}
ZERO_SHOT_TASKS = [
    "Craft a Wooden Button",
    "Craft a Wooden Trapdoor"
]

voyager = Voyager(
    azure_login=azure_login,    
    openai_api_key=os.environ.get("DEEPSEEK_API_KEY"),  
    skill_library_dir="./skill_library/trial2",
    # skill_library_dir="./results/checkpoints",
    ckpt_dir="./zero_shot_trial",
    max_iterations=8,    
    # kb_dir="./knowledge_base/knowledge_base1",
    resume=False,  #  Ensures we don't load previous agent state (like completed tasks), just skills
    action_agent_model_name="deepseek-coder",
    curriculum_agent_model_name="deepseek-chat",
    curriculum_agent_qa_model_name="deepseek-chat",
    critic_agent_model_name="deepseek-chat",
    skill_manager_model_name="deepseek-chat",
)

for task in ZERO_SHOT_TASKS:
    print("\n" + "="*50)
    print(f"STARTING ZERO-SHOT TASK: {task}")

    try:
        # The 'inference' method implements the zero-shot logic:
        # 1. Decompose the high-level task into sub-goals
        # 2. Reset the environment (clear inventory, reset position if configured)
        # 3. Execute sub-goals using the skill library
        voyager.inference(
            task=task,
            reset_mode="hard", # Ensures inventory is cleared ("Fresh Start")
            reset_env=True
        )

    except Exception as e:
        print(f"Error: {e}")

voyager.close()