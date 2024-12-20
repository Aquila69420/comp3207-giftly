from openai import AzureOpenAI
import os, logging, uuid

OPENAPI_END_POINT = os.getenv("OpenAIEndPoint")
OPENAPI_KEY = os.getenv("OpenAIKey")

client = AzureOpenAI(
    azure_endpoint = OPENAPI_END_POINT, 
    api_key = OPENAPI_KEY,  
    api_version="2024-02-01"
)

def get_previous_suggestion(container, username):
    try:
        suggestion = list(container.query_items(
            query="SELECT c.suggestion FROM c WHERE c.username=@username",
            parameters=[{'name': '@username', 'value': username}],
            enable_cross_partition_query=True
        ))
        if len(suggestion) == 0: 
            logging.info('Previous Suggestion: ""')
            return "" 
        else: 
            previous_suggestion = suggestion[0]['suggestion']
            logging.info(f"Previous Suggestion: {previous_suggestion}")
            return previous_suggestion  
    except Exception as e:
        logging.info(f"Error: {e}")
        return ""

def update_suggestion(container, username, suggestion):

    user = list(container.query_items(
        query="SELECT * FROM c WHERE c.username=@username",
        parameters=[{'name': '@username', 'value': username}],
        enable_cross_partition_query=True
    ))
    if len(user)==0:
        container.create_item(body={
            'id': str(uuid.uuid4()),
            'username': username,
            'suggestion': suggestion,
        }) 
        logging.info("Created new user suggestion")
    else:
        user_id = user[0]['id']
        user[0]['suggestion'] = suggestion
        container.replace_item(
            item = user_id,
            body = user[0],
            pre_trigger_include = None,
            post_trigger_include = None
        )
        logging.info("Update user suggestion")    

def llm_suggestion(prompt, container, username):
    logging.info(f"Prompt by {username}: {prompt}")
    previous_suggestion = get_previous_suggestion(container, username)
    response = client.chat.completions.create(
        model="quiplash-gpt-35-turbo", 
        messages=[
            {"role": "system", "content": 
                "You are assisting someone in choosing a gift. "
                "The user will describe the gift they want to give, the recipient, or the occasion. "
                "If the description is specific (like 'football'), just return that gift. "
                "Return an appropriate number of gift recommendations. "
                "The response format MUST be strictly 'rec:gift1,gift2,gift3'. "
                "If the user got recommendations before, they will be shared for context otherwise an empty string will be written."
                "If very different gift requirements are given then ignore the context and only follow the new requirements."
            },
            {"role": "assistant", "content": previous_suggestion},
            {"role": "user", "content": prompt},
        ]
    )
    suggestion = response.choices[0].message.content
    logging.info(f"GPT suggestion: {suggestion}")
    update_suggestion(container, username, suggestion)
    return suggestion