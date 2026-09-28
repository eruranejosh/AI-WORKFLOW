# Import os so we can read environment variables
import os

# Import FastAPI
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import BaseModel so we can define the data our API receives
from pydantic import BaseModel

# Import dotenv so Python can load our .env file
from dotenv import load_dotenv

# Import the OpenAI-compatible client
from openai import OpenAI


# Load the values stored inside .env
load_dotenv()

# Create a client that connects to OpenRouter
client = OpenAI(
    # Get our OpenRouter API key from .env
    api_key=os.getenv("OPENROUTER_API_KEY"),

    # Tell the OpenAI SDK to send requests to OpenRouter instead
    base_url="https://openrouter.ai/api/v1",
)


# Create our FastAPI application
app = FastAPI()


# Allow our Next.js frontend to communicate with this backend
app.add_middleware(
    CORSMiddleware,

    # Allow requests from our frontend
    allow_origins=["http://localhost:3000"],

    # Allow cookies and authentication information
    allow_credentials=True,

    # Allow all HTTP methods such as GET and POST
    allow_methods=["*"],

    # Allow all request headers
    allow_headers=["*"],
)


# Define the format of the request we expect
class DecisionRequest(BaseModel):
    # The message we want the AI to classify
    message: str

    # The question this decision node should answer
    prompt: str


# Create our home endpoint
@app.get("/")
def home():
    # Return a simple message to confirm the API is running
    return {"message": "AI Workflow Backend is running"}


# Create our AI decision endpoint
@app.post("/decide")
def decide(request: DecisionRequest):

    # Send the user's message and decision question to the AI
    response = client.responses.create(
        # OpenRouter model
        model="openai/gpt-4o-mini",

        # Tell the AI exactly what decision we want
        input=f"""
        Decision question:
        {request.prompt}

        Message:
        {request.message}

        Reply with only YES or NO.
        """
    )

    # Get the AI's text response
    decision = response.output_text.strip().upper()

    # Return the AI's decision as JSON
    return {"decision": decision}