# Azure Cupid - Deployment Guide

This guide will walk you through deploying Azure Cupid on Azure's Free Tier.

## Prerequisites
- Azure Account with Free Trial active
- Azure CLI installed (or use Azure Cloud Shell)
- Node.js 14+ installed locally
- Git installed

## Step 1: Create Resource Group

```bash
# Login to Azure
az login

# Create a resource group
az group create --name rg-azurecupid --location eastus