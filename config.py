import os
from dotenv import load_dotenv

load_dotenv()

# Pinecone Configuration
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_INDEX_NAME = "wikipedia-grokipedia"
PINECONE_ENVIRONMENT = "gcp-starter"

# LOCAL DKG NODE Configuration (Running on your machine)
DKG_ENDPOINT = os.getenv("DKG_ENDPOINT", "http://localhost:8900")
DKG_PUBLIC_KEY = os.getenv("DKG_PUBLIC_KEY", "")  # From MetaMask
DKG_PRIVATE_KEY = os.getenv("DKG_PRIVATE_KEY", "")  # From MetaMask

# OriginTrail Blockchain Configuration
BLOCKCHAIN_CHAIN_ID = 20430  # NeuroWeb Testnet
BLOCKCHAIN_RPC = "https://testnet-rpc.neuroweb.ai"

# Cerebras Configuration
CEREBRAS_MODEL = "qwen-3-235b-a22b-instruct-2507"
CEREBRAS_MAX_TOKENS = 2048
CEREBRAS_TEMPERATURE = 0.6
CEREBRAS_TOP_P = 0.95

# Flask Configuration
FLASK_DEBUG = os.getenv("FLASK_DEBUG", "True") == "True"
FLASK_PORT = int(os.getenv("FLASK_PORT", 5000))
