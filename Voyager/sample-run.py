from voyager import Voyager
import os

mc_port = # PORT will be listed in minecraft chat
openai_api_key = os.environ.get("OPENAI_API_KEY") # i use env vars for api keys

voyager = Voyager(
    mc_port=mc_port,
    openai_api_key=openai_api_key,
)

# start lifelong learning
voyager.learn()