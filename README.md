# Giftly Web App

Giftly is a cloud-based web application developed as part of the COMP3207 Cloud App Development coursework at the University of Southampton. The app provides a seamless platform for users to create and manage gift wish lists, making gift-giving more organized and efficient.

These optimizations help in delivering a fast and smooth user experience.

## Table of Contents
- [About the Project](#about-the-project)
- [Features](#features)
- [Technologies Used](#technologies-used)

## About the Project
Giftly is designed to simplify the process of gifting by allowing users to:
- Create personalized wish lists.
- Share their wish lists with family and friends.
- Manage their gift preferences in one centralized location.

This project demonstrates proficiency in modern cloud application development practices.

## Features
- **User Authentication**: Secure login and registration.
- **Wishlist Management**: Add, edit, and delete gift items.
- **Sharing Capabilities**: Share wish lists via links or emails.
- **Cloud Hosting**: The app is hosted on a cloud platform ensuring scalability and reliability.

## Technologies Used
- **Frontend**: HTML, CSS, JavaScript, React.js
- **Backend**: Flask/Azure Functions
- **Database**: CosmosDB
- **Cloud Platform**: Azure / GCP 

## Frontend Optimization

The frontend of the Giftly web app is optimized using the following techniques:

- **Code Splitting**: Implemented using React's lazy loading to load components only when needed, reducing initial load time.
- **Minification**: JavaScript and CSS files are minified to reduce the size of the assets being sent to the client.
- **Caching**: Leveraged browser caching to store static assets, reducing the need to re-download them on subsequent visits.
- **Responsive Design**: Ensured the app is mobile-friendly and performs well on various devices by using responsive design principles.
- **Image Optimization**: Used modern image formats like WebP and optimized image sizes to improve load times.

# Deployment Instructions

## Backend Deployment

The backend is built using Azure Function App.

### Prerequisites

Ensure you have the following:
- An Azure account.
- `az` CLI and `func` CLI tools installed and available on your command line. 

#### Install Azure CLI and Function Core Tools:
- [Azure CLI Installation Guide](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli-windows?tabs=azure-cli)
- [Azure Functions Core Tools Installation Guide](https://learn.microsoft.com/en-us/azure/azure-functions/functions-run-local?tabs=windows%2Cisolated-process%2Cnode-v4%2Cpython-v2%2Chttp-trigger%2Ccontainer-apps&pivots=programming-language-python#install-the-azure-functions-core-tools)

### Steps to Deploy

1. **Navigate to the backend folder:**

   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment:**

   Create the virtual environment:
   ```bash
   python -m venv venv
   ```

   Activate the virtual environment:
   - For Windows:
     ```bash
     .\venv\Scripts\Activate.ps1
     ```
   - For Linux/Unix:
     ```bash
     source venv/bin/activate
     ```

3. **Install required Python libraries:**

   ```bash
   pip install -r requirements.txt
   ```

4. **Deploy the Function App:**

   ```bash
   func azure functionapp publish giftly
   ```

5. **Add Environment Variables:**

   Use the `local.settings.json` file to add environment variables. Navigate to the settings for the function app in Azure, and use the advanced edit option to add all the variables listed in `local.settings.json`.

6. **Save the backend URL:**

   Keep the link for your backend function app handy. It will be required during the frontend setup.

---

## Frontend Deployment

The frontend is built using React JS and deployed using Google App Engine (GAE).

### Steps to Deploy

1. **Navigate to the frontend folder:**

   ```bash
   cd frontend
   ```

2. **Install required libraries and frameworks:**

   ```bash
   npm i
   ```

3. **Update the backend URL in the configuration file:**

   Navigate to the `src/config.json` file:
   ```bash
   cd src
   ```

   Update the `backendURL` to your function app URL:
   ```json
   {
     "backendURL": "<Your-Function-App-Url>" // Example: https://giftly.azurewebsites.net
   }
   ```

4. **Return to the frontend folder:**

   ```bash
   cd ..
   ```

5. **Deploy the frontend using Google Cloud:**

   Ensure you have set up a Google Cloud App with GAE. Follow tutorials or slides to set up a budget, enable billing, and prepare your project.

   Verify you can deploy using `gcloud`:
   ```bash
   gcloud app deploy
   ```

6. **Access your site:**

   After deployment, your site should be live and accessible.

7. **Enable CORS on Azure Function App**

   Now you have the link for the website for the frontend, You need to enable CORS on Azure

---

### Notes
- Ensure all required configurations, billing, and permissions are set up in both Azure and Google Cloud.
- If any issues arise, refer to the respective cloud provider's documentation or support.

Happy deploying!
