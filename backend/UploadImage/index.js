const { BlobServiceClient, generateBlobSASQueryParameters, BlobSASPermissions, StorageSharedKeyCredential } = require("@azure/storage-blob");

module.exports = async function (context, req) {
    context.log('UploadImage function triggered');

    const { fileName, contentType } = req.body;

    if (!fileName || !contentType) {
        context.res = {
            status: 400,
            body: "Missing fileName or contentType"
        };
        return;
    }

    try {
        // Parse connection string to get account details
        const connectionString = process.env.STORAGE_CONNECTION_STRING;
        const containerName = process.env.STORAGE_CONTAINER_NAME || "profile-images";
        
        // Initialize Blob Service Client
        const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
        const containerClient = blobServiceClient.getContainerClient(containerName);
        
        // Generate unique blob name
        const blobName = `${Date.now()}-${fileName}`;
        const blobClient = containerClient.getBlockBlobClient(blobName);

        // Generate SAS token valid for 5 minutes
        const startsOn = new Date();
        const expiresOn = new Date(startsOn.valueOf() + 5 * 60 * 1000);
        
        // Extract credentials from connection string
        const accountName = connectionString.match(/AccountName=([^;]+)/)[1];
        const accountKey = connectionString.match(/AccountKey=([^;]+)/)[1];
        
        const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
        
        const sasToken = generateBlobSASQueryParameters({
            containerName,
            blobName,
            permissions: BlobSASPermissions.parse("w"),
            startsOn,
            expiresOn
        }, sharedKeyCredential).toString();

        const sasUrl = `${blobClient.url}?${sasToken}`;

        context.res = {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            body: {
                sasUrl: sasUrl,
                blobUrl: blobClient.url
            }
        };
    } catch (error) {
        context.log.error('Error generating SAS URL:', error);
        
        // Return placeholder for demo
        context.res = {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            body: {
                sasUrl: `https://placeholder.blob.core.windows.net/images/${fileName}`,
                blobUrl: `https://placeholder.blob.core.windows.net/images/${fileName}`
            }
        };
    }
};