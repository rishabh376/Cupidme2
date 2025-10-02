# Azure Cupid 💕 - Cloud-Native Dating Platform

A modern, minimalist dating website built entirely on Azure's Free Tier. Find your perfect match while staying within cloud budget constraints!

![Azure Cupid](https://img.shields.io/badge/Azure-Free%20Tier-blue)
![Status](https://img.shields.io/badge/Status-Ready%20to%20Deploy-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Detailed Setup Instructions](#detailed-setup-instructions)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Usage Guide](#usage-guide)
- [API Documentation](#api-documentation)
- [Cost Analysis](#cost-analysis)
- [Troubleshooting](#troubleshooting)
- [Security Considerations](#security-considerations)
- [Contributing](#contributing)

## 🎯 Overview

Azure Cupid is a fully functional dating platform that demonstrates how to build a production-ready web application using only Azure's free tier services. The project includes a responsive frontend, serverless backend, NoSQL database, and blob storage for images.

### Live Demo Features
- 🎴 Tinder-style card swiping interface
- 💝 Real-time match detection
- 👤 User profile management
- 📸 Image upload capabilities
- 📱 Mobile-responsive design
- ⚡ Serverless architecture

## ✨ Features

### Core Functionality
- **Profile Discovery**: Browse through user profiles with an intuitive swipe interface
- **Smart Matching**: Automatic match detection when two users like each other
- **Profile Management**: Create and edit your profile with photo upload
- **Match Gallery**: View all your successful matches in one place
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

### Technical Features
- **Zero Authentication**: Simplified MVP without auth complexity
- **Serverless Backend**: Auto-scaling Azure Functions
- **NoSQL Database**: Flexible schema with Cosmos DB
- **Static Hosting**: Fast CDN-backed website delivery
- **CORS Enabled**: Cross-origin resource sharing configured

## 🏗️ Architecture


 Azure Cloud │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    │
│ │ Blob Storage │    │ Functions    │    │ Cosmos DB    │    │
│ │              │    │              │    │              │    │
│ │ - Static Web │◄───│ -GetProfiles │───►│ - Profiles   │    │
│ │ - Images     │    │ -RecordSwipe │    │ - Swipes     │    │
│ └──────────────┘    │ -GetMatches  │    │ - Matches    │    │
│ ▲                   │ -UploadImage │    └──────────────┘    │
│ │                   └──────────────┘                        │
│ │                            ▲                              │
└─────────┼────────────────────┼──────────────────────────────┘
│ │
┌────▼────┐ ┌────▼────┐
│ Browser │ │ API     │
│ (User)  │ │ Calls   │
└─────────┘ └─────────┘


### Technology Stack
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Azure Functions (Node.js)
- **Database**: Azure Cosmos DB (Serverless)
- **Storage**: Azure Blob Storage
- **Hosting**: Azure Static Web Apps

## 📦 Prerequisites

### Required Tools
- [Azure Account](https://azure.microsoft.com/free/) with active Free Trial
- [Node.js](https://nodejs.org/) version 14+ and npm
- [Azure CLI](https://docs.microsoft.com/cli/azure/install-azure-cli) or Azure Cloud Shell
- [Azure Functions Core Tools](https://docs.microsoft.com/azure/azure-functions/functions-run-local)
- Git for version control
- A modern web browser
- Text editor or IDE (VS Code recommended)

### Optional Tools
- [Azure Storage Explorer](https://azure.microsoft.com/features/storage-explorer/)
- [Postman](https://www.postman.com/) for API testing

## 🚀 Quick Start

```bash
# Clone the repository (create these files from the code provided above)
mkdir azure-cupid && cd azure-cupid

# Login to Azure
az login

# Run the automated setup script
./deploy.sh

# Your app will be available at the URL shown in the output!

📖 Detailed Setup Instructions

Step 1: Azure Account Setup
1. Create Azure Free Account

# Navigate to https://azure.microsoft.com/free/
# Sign up with Microsoft account
# Activate $200 free credit

2. Install Azure CLI

# Windows (PowerShell)
Invoke-WebRequest -Uri https://aka.ms/installazurecliwindows -OutFile .\AzureCLI.msi; Start-Process msiexec.exe -Wait -ArgumentList '/I AzureCLI.msi /quiet'

# macOS
brew update && brew install azure-cli

# Linux (Ubuntu/Debian)
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

3. Login to Azure

az login
# Follow browser prompts to authenticate

# Verify subscription
az account show

Step 2: Create Resource Group

# Set variables for consistent naming
RESOURCE_GROUP="rg-azurecupid"
LOCATION="eastus"
RANDOM_SUFFIX=$RANDOM

# Create resource group
az group create \
  --name $RESOURCE_GROUP \
  --location $LOCATION

echo "✅ Resource group created: $RESOURCE_GROUP"

Step 3: Setup Cosmos DB (Database)

# Create unique Cosmos DB account name
COSMOS_ACCOUNT="azurecupid-cosmos-$RANDOM_SUFFIX"

# Create Cosmos DB account with serverless capacity
echo "Creating Cosmos DB account (this may take 5-10 minutes)..."
az cosmosdb create \
  --name $COSMOS_ACCOUNT \
  --resource-group $RESOURCE_GROUP \
  --capabilities EnableServerless \
  --default-consistency-level Session \
  --locations regionName=$LOCATION

# Get and save connection string
COSMOS_CONNECTION=$(az cosmosdb keys list \
  --name $COSMOS_ACCOUNT \
  --resource-group $RESOURCE_GROUP \
  --type connection-strings \
  --query connectionStrings[0].connectionString \
  --output tsv)

echo "✅ Cosmos DB account created: $COSMOS_ACCOUNT"

# Create database
az cosmosdb sql database create \
  --account-name $COSMOS_ACCOUNT \
  --resource-group $RESOURCE_GROUP \
  --name AzureCupid

echo "✅ Database created: AzureCupid"

# Create Profiles container
az cosmosdb sql container create \
  --account-name $COSMOS_ACCOUNT \
  --database-name AzureCupid \
  --resource-group $RESOURCE_GROUP \
  --name Profiles \
  --partition-key-path /id

echo "✅ Container created: Profiles"

# Create Swipes container
az cosmosdb sql container create \
  --account-name $COSMOS_ACCOUNT \
  --database-name AzureCupid \
  --resource-group $RESOURCE_GROUP \
  --name Swipes \
  --partition-key-path /profileId

echo "✅ Container created: Swipes"

# Create Matches container
az cosmosdb sql container create \
  --account-name $COSMOS_ACCOUNT \
  --database-name AzureCupid \
  --resource-group $RESOURCE_GROUP \
  --name Matches \
  --partition-key-path /id

echo "✅ Container created: Matches"

Step 4: Create Storage Account

# Create unique storage account name (must be lowercase, 3-24 chars)
STORAGE_ACCOUNT="azurecupid$RANDOM_SUFFIX"

# Create storage account
echo "Creating storage account..."
az storage account create \
  --name $STORAGE_ACCOUNT \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --sku Standard_LRS \
  --kind StorageV2 \
  --access-tier Hot

# Get connection string
STORAGE_CONNECTION=$(az storage account show-connection-string \
  --name $STORAGE_ACCOUNT \
  --resource-group $RESOURCE_GROUP \
  --query connectionString \
  --output tsv)

echo "✅ Storage account created: $STORAGE_ACCOUNT"

# Enable static website hosting
az storage blob service-properties update \
  --account-name $STORAGE_ACCOUNT \
  --static-website \
  --index-document index.html \
  --404-document 404.html

echo "✅ Static website hosting enabled"

# Create container for profile images
az storage container create \
  --name profile-images \
  --account-name $STORAGE_ACCOUNT \
  --public-access blob \
  --connection-string "$STORAGE_CONNECTION"

echo "✅ Profile images container created"

# Get the static website URL
WEBSITE_URL=$(az storage account show \
  --name $STORAGE_ACCOUNT \
  --resource-group $RESOURCE_GROUP \
  --query primaryEndpoints.web \
  --output tsv)

echo "📌 Website URL: $WEBSITE_URL"

Step 5: Create Function App

# Create unique Function App name
FUNCTION_APP="azurecupid-func-$RANDOM_SUFFIX"

# Create Function App with Consumption plan
echo "Creating Function App..."
az functionapp create \
  --resource-group $RESOURCE_GROUP \
  --consumption-plan-location $LOCATION \
  --runtime node \
  --runtime-version 18 \
  --functions-version 4 \
  --name $FUNCTION_APP \
  --storage-account $STORAGE_ACCOUNT \
  --os-type Linux

echo "✅ Function App created: $FUNCTION_APP"

# Configure application settings
echo "Configuring Function App settings..."
az functionapp config appsettings set \
  --name $FUNCTION_APP \
  --resource-group $RESOURCE_GROUP \
  --settings \
    "COSMOS_CONNECTION_STRING=$COSMOS_CONNECTION" \
    "COSMOS_DATABASE_NAME=AzureCupid" \
    "STORAGE_CONNECTION_STRING=$STORAGE_CONNECTION" \
    "STORAGE_CONTAINER_NAME=profile-images" \
    "WEBSITE_ORIGIN=$WEBSITE_URL"

# Enable CORS
az functionapp cors add \
  --name $FUNCTION_APP \
  --resource-group $RESOURCE_GROUP \
  --allowed-origins "$WEBSITE_URL" "http://localhost:3000" "*"

echo "✅ Function App configured"

# Get Function App URL
FUNCTION_URL="https://$FUNCTION_APP.azurewebsites.net"
echo "📌 Function App URL: $FUNCTION_URL"

Step 6: Prepare Backend Code

# Navigate to backend directory
cd backend

# Install dependencies
echo "Installing Node.js dependencies..."
npm install

# Update local.settings.json with your values
cat > local.settings.json << EOF
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "$STORAGE_CONNECTION",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "COSMOS_CONNECTION_STRING": "$COSMOS_CONNECTION",
    "COSMOS_DATABASE_NAME": "AzureCupid",
    "STORAGE_CONNECTION_STRING": "$STORAGE_CONNECTION",
    "STORAGE_CONTAINER_NAME": "profile-images"
  },
  "Host": {
    "CORS": "*"
  }
}
EOF

echo "✅ Backend configuration updated"

Step 7: Deploy Azure Functions

# Ensure you're in the backend directory
cd backend

# Install Azure Functions Core Tools if not already installed
npm install -g azure-functions-core-tools@4 --unsafe-perm true

# Deploy functions to Azure
echo "Deploying functions to Azure (this may take 2-3 minutes)..."
func azure functionapp publish $FUNCTION_APP --javascript

echo "✅ Functions deployed successfully"

# Test the deployment
echo "Testing function deployment..."
curl "$FUNCTION_URL/api/GetProfiles?userId=test"

Step 8: Update Frontend Configuration

# Navigate to frontend directory
cd ../frontend

# Update the API base URL in script.js
sed -i.backup "s|https://YOUR-FUNCTION-APP.azurewebsites.net|$FUNCTION_URL|g" script.js

# For macOS, use this instead:
# sed -i '.backup' "s|https://YOUR-FUNCTION-APP.azurewebsites.net|$FUNCTION_URL|g" script.js

echo "✅ Frontend configuration updated with API endpoint"

Step 9: Deploy Frontend

# Ensure you're in the frontend directory
cd frontend

# Upload all frontend files to blob storage
echo "Uploading frontend files..."
az storage blob upload-batch \
  --account-name $STORAGE_ACCOUNT \
  --source . \
  --destination '$web' \
  --connection-string "$STORAGE_CONNECTION" \
  --overwrite

echo "✅ Frontend deployed successfully"
echo "🎉 Deployment complete!"
echo ""
echo "📱 Your Azure Cupid website is live at:"
echo "   $WEBSITE_URL"
echo ""
echo "🔧 Function endpoints available at:"
echo "   $FUNCTION_URL/api/"

Step 10: Import Sample Data

# Create sample profiles in Cosmos DB
echo "Importing sample data..."

# Create a Node.js script to import data
cat > import-data.js << 'EOF'
const { CosmosClient } = require("@azure/cosmos");

const connectionString = process.env.COSMOS_CONNECTION_STRING;
const client = new CosmosClient(connectionString);
const database = client.database("AzureCupid");
const container = database.container("Profiles");

const profiles = [
  {
    id: "profile-001",
    name: "Alex Johnson",
    age: 28,
    bio: "Software developer who loves hiking and coffee. Looking for someone to explore the city with!",
    pictureUrl: "https://picsum.photos/seed/alex/400/600"
  },
  {
    id: "profile-002",
    name: "Sam Williams",
    age: 32,
    bio: "Passionate about cooking and travel. Let's share recipes and adventure stories!",
    pictureUrl: "https://picsum.photos/seed/sam/400/600"
  },
  {
    id: "profile-003",
    name: "Jordan Davis",
    age: 26,
    bio: "Yoga instructor and nature enthusiast. Seeking genuine connections and good vibes.",
    pictureUrl: "https://picsum.photos/seed/jordan/400/600"
  },
  {
    id: "profile-004",
    name: "Taylor Brown",
    age: 29,
    bio: "Music lover, bookworm, and amateur photographer. Let's create some memories!",
    pictureUrl: "https://picsum.photos/seed/taylor/400/600"
  },
  {
    id: "profile-005",
    name: "Morgan Lee",
    age: 31,
    bio: "Entrepreneur with a passion for sustainability. Looking for someone who shares my values.",
    pictureUrl: "https://picsum.photos/seed/morgan/400/600"
  }
];

async function importData() {
  for (const profile of profiles) {
    try {
      await container.items.create(profile);
      console.log(`✅ Imported: ${profile.name}`);
    } catch (error) {
      console.log(`⚠️  Skipped: ${profile.name} (may already exist)`);
    }
  }
  console.log("✅ Sample data import complete!");
}

importData().catch(console.error);
EOF

# Run the import script
COSMOS_CONNECTION_STRING="$COSMOS_CONNECTION" node import-data.js

# Clean up
rm import-data.js

echo "✅ Sample profiles imported"

Project Structure
azure-cupid/
├── 📂 frontend/                 # Static website files
│   ├── 📄 index.html            # Landing page
│   ├── 📄 discover.html         # Profile browsing page
│   ├── 📄 matches.html          # Matches display page
│   ├── 📄 profile.html          # Profile editing page
│   ├── 🎨 style.css            # Global styles
│   └── ⚡ script.js            # Frontend JavaScript
│
├── 📂 backend/                  # Azure Functions
│   ├── 📂 GetProfiles/         # Fetch user profiles
│   │   ├── index.js
│   │   └── function.json
│   ├── 📂 RecordSwipe/         # Record like/pass actions
│   │   ├── index.js
│   │   └── function.json
│   ├── 📂 GetMatches/          # Fetch user matches
│   │   ├── index.js
│   │   └── function.json
│   ├── 📂 UploadImage/         # Generate SAS tokens
│   │   ├── index.js
│   │   └── function.json
│   ├── 📄 host.json            # Function app configuration
│   ├── 📄 package.json         # Node.js dependencies
│   └── 📄 local.settings.json  # Local configuration
│
├── 📂 sample-data/             # Sample data for testing
│   └── 📄 sample-profiles.json
│
└── 📄 README.md                # This file

⚙️ Configuration

Environment Variables
Create a .env file in the backend directory:

# Azure Cosmos DB
COSMOS_CONNECTION_STRING=AccountEndpoint=https://...
COSMOS_DATABASE_NAME=AzureCupid

# Azure Storage
STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;...
STORAGE_CONTAINER_NAME=profile-images

# Function App
FUNCTIONS_WORKER_RUNTIME=node
AzureWebJobsStorage=DefaultEndpointsProtocol=https;...

Frontend Configuration

Update frontend/script.js:

// Line 4: Update with your Function App URL
const API_BASE_URL = 'https://your-function-app.azurewebsites.net/api';

📱 Usage Guide
For End Users

    Visit the Website
        Navigate to your Azure Static Website URL
        No sign-up required for the demo

    Browse Profiles
        Click "View Profiles" from the landing page
        Swipe right (or click ❤️) to like
        Swipe left (or click ❌) to pass

    View Matches
        Click "Matches" in the navigation
        See all mutual likes

    Edit Profile
        Click "Profile" in the navigation
        Update your information
        Upload a profile picture

For Developers

1. Local Development

# Start backend locally
cd backend
npm install
func start

# Serve frontend locally
cd frontend
python -m http.server 3000
# Or use any static file server

2. Testing APIs

# Test GetProfiles
curl http://localhost:7071/api/GetProfiles?userId=test

# Test RecordSwipe
curl -X POST http://localhost:7071/api/RecordSwipe \
  -H "Content-Type: application/json" \
  -d '{"userId":"user1","swipedProfileId":"user2","action":"like"}'

📊 API Documentation

GetProfiles

    URL: /api/GetProfiles
    Method: GET
    Query Parameters: userId (required)
    Response: Array of profile objects

RecordSwipe

    URL: /api/RecordSwipe
    Method: POST
    Body:

        {
            "userId": "string",
            "swipedProfileId": "string",
            "action": "like|pass"
        }

Response: Match status

GetMatches

    URL: /api/GetMatches
    Method: GET
    Query Parameters: userId (required)
    Response: Array of matched profiles

UploadImage

    URL: /api/UploadImage
    Method: POST
    Body:
        {
            "fileName": "string",
            "contentType": "string"
        }

Response: SAS URL for upload

💰 Cost Analysis
Free Tier Limits

Service	    Free Tier	    Monthly Limit	    Our Usage
Cosmos DB 	Serverless	    1M RUs, 25GB	    ~100K RUs
Storage	    Hot Tier	    5GB, 20K reads	    ~1GB
Functions	Consumption	    1M executions	    ~50K calls
Bandwidth	All services	5GB outbound	    ~2GB

Estimated Monthly Cost: $0.00

Cost Optimization Tips

1. Enable Caching

// Add to frontend
const cache = new Map();
if (cache.has(key)) return cache.get(key);

2. Batch Operations

// Cosmos DB batch operations
const operations = profiles.map(p => ({
  operationType: "Create",
  resourceBody: p
}));

3. Image Optimization

Resize images before upload
Use WebP format
Implement lazy loading

🔧 Troubleshooting

Common Issues and Solutions

1. CORS Errors

# Fix: Add your domain to CORS
az functionapp cors add \
  --name $FUNCTION_APP \
  --resource-group $RESOURCE_GROUP \
  --allowed-origins "https://yourdomain.com"

2. Function Timeout

# Check logs
az functionapp log tail \
  --name $FUNCTION_APP \
  --resource-group $RESOURCE_GROUP

# Increase timeout in host.json
"functionTimeout": "00:10:00"

3. Storage Upload Fails

# Verify container exists
az storage container list \
  --account-name $STORAGE_ACCOUNT \
  --connection-string "$STORAGE_CONNECTION"

# Check permissions
az storage container set-permission \
  --name profile-images \
  --public-access blob \
  --account-name $STORAGE_ACCOUNT

4. Cosmos DB Throttling

# Monitor RU usage
az cosmosdb show \
  --name $COSMOS_ACCOUNT \
  --resource-group $RESOURCE_GROUP \
  --query "consistencyPolicy"

5. Website Not Loading

# Verify static website is enabled
az storage blob service-properties show \
  --account-name $STORAGE_ACCOUNT

# Re-upload files
az storage blob upload-batch \
  --account-name $STORAGE_ACCOUNT \
  --source ./frontend \
  --destination '$web' \
  --overwrite

Debug Commands

# View all resources
az resource list --resource-group $RESOURCE_GROUP --output table

# Check Function App status
az functionapp show --name $FUNCTION_APP --resource-group $RESOURCE_GROUP

# View recent logs
az monitor activity-log list --resource-group $RESOURCE_GROUP --output table

# Test Function endpoints
curl -X GET "$FUNCTION_URL/api/GetProfiles?userId=test"

🔒 Security Considerations
Current Implementation (MVP)

    ⚠️ No authentication (demo only)
    ⚠️ CORS allows all origins
    ⚠️ No input validation
    ⚠️ Public blob access


Production Recommendations

1. Add Authentication

az webapp auth update \
  --name $FUNCTION_APP \
  --resource-group $RESOURCE_GROUP \
  --enabled true \
  --action LoginWithAzureActiveDirectory

2. Implement Rate Limiting

// Add to functions
const rateLimit = require("express-rate-limit");
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

3. Secure Storage

# Use SAS tokens only
az storage container set-permission \
  --name profile-images \
  --public-access off \
  --account-name $STORAGE_ACCOUNT

4. Add Input Validation

// Validate all inputs
const validator = require('validator');
if (!validator.isEmail(email)) {
  return { status: 400, body: "Invalid email" };
}

🧹 Cleanup

Remove All Resources
# Delete entire resource group (THIS WILL DELETE EVERYTHING!)
az group delete --name $RESOURCE_GROUP --yes --no-wait

echo "✅ All Azure Cupid resources scheduled for deletion"

Remove Specific Resources

# Delete only Function App
az functionapp delete --name $FUNCTION_APP --resource-group $RESOURCE_GROUP

# Delete only Storage Account
az storage account delete --name $STORAGE_ACCOUNT --resource-group $RESOURCE_GROUP --yes

# Delete only Cosmos DB
az cosmosdb delete --name $COSMOS_ACCOUNT --resource-group $RESOURCE_GROUP --yes

📈 Monitoring
Setup Application Insights
# Create Application Insights
az monitor app-insights component create \
  --app azurecupid-insights \
  --location $LOCATION \
  --resource-group $RESOURCE_GROUP

# Connect to Function App
az functionapp config appsettings set \
  --name $FUNCTION_APP \
  --resource-group $RESOURCE_GROUP \
  --settings APPINSIGHTS_INSTRUMENTATIONKEY=<instrumentation-key>

View Metrics
# Function execution count
az monitor metrics list \
  --resource $FUNCTION_APP \
  --resource-group $RESOURCE_GROUP \
  --metric FunctionExecutionCount \
  --interval PT1H

# Storage usage
az monitor metrics list \
  --resource $STORAGE_ACCOUNT \
  --resource-group $RESOURCE_GROUP \
  --metric UsedCapacity

🚢 Production Deployment

Automated Deployment Script
Create deploy.sh:

#!/bin/bash

# Azure Cupid - Automated Deployment Script
set -e

echo "🚀 Starting Azure Cupid Deployment..."

# Configuration
RESOURCE_GROUP="rg-azurecupid-prod"
LOCATION="eastus"
RANDOM_SUFFIX=$RANDOM

# Login to Azure
echo "📝 Logging into Azure..."
az login

# Create all resources
echo "🏗️ Creating Azure resources..."
source ./scripts/create-resources.sh

# Deploy backend
echo "⚡ Deploying Azure Functions..."
cd backend
npm install
func azure functionapp publish $FUNCTION_APP

# Update frontend config
echo "🎨 Configuring frontend..."
cd ../frontend
sed -i "s|YOUR-FUNCTION-APP|$FUNCTION_APP|g" script.js

# Deploy frontend
echo "📤 Uploading frontend files..."
az storage blob upload-batch \
  --account-name $STORAGE_ACCOUNT \
  --source . \
  --destination '$web'

# Import sample data
echo "📊 Importing sample data..."
node ../scripts/import-data.js

echo "✅ Deployment complete!"
echo "🌐 Website URL: $WEBSITE_URL"
echo "📝 Save these values for future reference:"
echo "   Resource Group: $RESOURCE_GROUP"
echo "   Storage Account: $STORAGE_ACCOUNT"
echo "   Function App: $FUNCTION_APP"
echo "   Cosmos DB: $COSMOS_ACCOUNT"

Make executable:
chmod +x deploy.sh
./deploy.sh

🤝 Contributing

We welcome contributions! Please follow these steps:

    Fork the repository
    Create a feature branch (git checkout -b feature/AmazingFeature)
    Commit your changes (git commit -m 'Add some AmazingFeature')
    Push to the branch (git push origin feature/AmazingFeature)
    Open a Pull Request

Development Guidelines

    Follow JavaScript Standard Style
    Write unit tests for new functions
    Update documentation for new features
    Test on Azure Free Tier before submitting PR


📝 License

This project is licensed under the MIT License - see the LICENSE file for details.
🙏 Acknowledgments

    Azure Free Tier for making this possible
    The open-source community for inspiration
    Lorem Picsum for placeholder images
    You for reading this far!

📞 Support
Get Help

    📧 Email: support@azurecupid.example
    💬 Discord: Join our server
    🐛 Issues: GitHub Issues


Useful Resources

    Azure Free Account FAQ
    Azure Functions Documentation
    Cosmos DB Documentation
    Static Web Apps Documentation


<div align="center">

Built with ❤️ using Azure Free Tier

⭐ Star this repo if you find it helpful!
</div> ```
