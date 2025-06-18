import { BlobServiceClient } from "@azure/storage-blob";
import fs from "fs";
import pjson from "../package.json" assert { type: "json" };
import path from "path";
import dotenv from "dotenv";

// Load env variables
dotenv.config({
  path: path.resolve(
    process.cwd(),
    `../environments/.${process.env.NODE_ENV}.env` /** got to ./environments and choose current environment */
  ),
});

const version = pjson.version;
if (!version) process.exit(1);

// Your container name and the file you want to upload
const containerName = "globaldata";
const fileName = "build/output.zip";
const outputFileName = `DesignerBaseHtml/${version}.zip`;

if (!process.env.AZURE_STORAGE_CONNECTION_STRING) process.exit(1);

// Create a BlobServiceClient
const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING
);

// Get a reference to a container
const containerClient = blobServiceClient.getContainerClient(containerName);

// Get a block blob client
const blockBlobClient = containerClient.getBlockBlobClient(outputFileName);

// Read the file content
const data = fs.readFileSync(fileName);

// Upload the file to Azure Blob Storage
blockBlobClient
  .upload(data, data.length, {
    blobHTTPHeaders: { blobContentType: "application/octet-stream" },
  })
  .then((response) => {
    console.log(`File "${fileName}" uploaded to Azure Blob Storage.`);
  })
  .catch((error) => {
    console.error("Error uploading file to Azure Blob Storage:", error.message);
  });
