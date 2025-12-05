from voyager import Voyager
import os

mc_port = 57801
openai_api_key = os.environ.get("OPENAI_API_KEY")

ZERO_SHOT_TASKS = [
    "Craft a Diamond Pickaxe",
    "Craft a Golden Sword",
    "Collect a Lava Bucket",
    "Craft a Compass"
]


voyager = Voyager(
    mc_port=mc_port,    
    openai_api_key=os.environ.get("DEEPSEEK_API_KEY"),  
    skill_library_dir="./skill_library/trial2",
    # skill_library_dir="./results/checkpoints",
    max_iterations=10,    
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