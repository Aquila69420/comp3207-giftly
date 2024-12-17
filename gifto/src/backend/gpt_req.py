from openai import AzureOpenAI #type:ignore 

OPENAPI_END_POINT = "https://amcp1u21-openai-quiplash.openai.azure.com/"
OPENAPI_KEY = "466cb690aa3c4ddfa1b1654c1d505123"

client = AzureOpenAI(
    azure_endpoint = OPENAPI_END_POINT, 
    api_key = OPENAPI_KEY,  
    api_version="2024-02-01"
)

def llm_suggestion(keyword):

    response = client.chat.completions.create(
        model="quiplash-gpt-35-turbo", 
        messages=[
            {"role": "system", "content": 
                "You are assisting someone in choosing a gift. "
                "The user will describe the gift they want to give, the recipient, or the occasion. "
                "If the description is specific (like 'football'), just return that gift. "
                "For general descriptions (like 'sports' or 'birthday'), return an appropriate number of gift recommendations. "
                "If the description is unclear, ask clarifying questions. "
                "The response format MUST be strictly 'rec:gift1,gift2,gift3'. "
            },
            {"role": "user", "content": keyword}
        ]
    )

    return response.choices[0].message.content