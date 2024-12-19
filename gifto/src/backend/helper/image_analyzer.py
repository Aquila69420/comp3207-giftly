import os
from azure.ai.vision.imageanalysis import ImageAnalysisClient
from azure.ai.vision.imageanalysis.models import VisualFeatures
from azure.core.credentials import AzureKeyCredential
import requests

endpoint = "https://giftly-ai.cognitiveservices.azure.com/"
key = "EOXm8FHqmnU1F5kLdEOITVW8WFPVFRWc2YatMCyQ7Zc1DGUDiYU3JQQJ99ALACmepeSXJ3w3AAAEACOGkuNM"

def image_analysis(image_data):
    try: 
        response = requests.post(f"{endpoint}/vision/v3.2/analyze?visualFeatures=Objects,Brands", headers={"Ocp-Apim-Subscription-Key": key,"Content-Type": "application/octet-stream"}, data=image_data)
        if response.status_code == 200: 
            brands_data = response.json()['brands']
            objects_data = response.json()['objects']
            brands = list(set([brand['name'] for brand in brands_data if brand['confidence'] > 0.5]))
            objects = list(set([object['object'] for object in objects_data if object['confidence'] > 0.5]))
            print(f"Request Successful. \nBrands: {brands} \nObjects: {objects}") 
            return (brands, objects)
        else: print(f"Request failed with status code {response.status_code}: {response.text}")
    except Exception as e: print(f"An error occurred: {e}")

