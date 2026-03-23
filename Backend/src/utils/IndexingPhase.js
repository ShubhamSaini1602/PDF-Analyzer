const dotenv = require("dotenv");
dotenv.config();
const { PDFLoader } = require('@langchain/community/document_loaders/fs/pdf');
const { RecursiveCharacterTextSplitter } = require("@langchain/textsplitters");
const { GoogleGenerativeAIEmbeddings } = require('@langchain/google-genai');
const { Pinecone } = require('@pinecone-database/pinecone');
const { PineconeStore } = require('@langchain/pinecone');

// Indexing Phase
async function IndexingPhase(){
    // Load the Document
    const PDF_PATH = "./src/utils/gravitation.pdf";
    const pdfLoader = new PDFLoader(PDF_PATH);
    const rawDocs = await pdfLoader.load();

    // Chunking
    const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
    });
    const chunkedDocs = await textSplitter.splitDocuments(rawDocs);
    
    // Convert text chunks into vectors and store them in the vector database
    // 1) Configure Embedding Model
    const embeddings = new GoogleGenerativeAIEmbeddings({
        apiKey: process.env.GEMINI_API_KEY_3,
        // This embedding model generates 3072-dimensional vectors, so we configured 
        // our Pinecone index to 3072 dimensions.
        model: 'gemini-embedding-001',
    });
    // 2) Configure Pinecone
    const pinecone = new Pinecone();
    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);
    
    await PineconeStore.fromDocuments(chunkedDocs, embeddings, {
        pineconeIndex,
        maxConcurrency: 5,
    });
}

IndexingPhase();

// After completing the code, run this file using:
// node src/utils/IndexingPhase.js
// This will execute the indexing process and push vectors to Pinecone (our Vector DB)
// You can then visit the Pinecone dashboard to confirm that your vectors are stored.