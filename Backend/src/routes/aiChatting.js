// aiChatting.js
const express = require("express");
const aiRouter = express.Router();
const { GoogleGenerativeAIEmbeddings } = require('@langchain/google-genai');
const { Pinecone } = require('@pinecone-database/pinecone');
const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
const { PromptTemplate } = require('@langchain/core/prompts');
const { StringOutputParser } = require('@langchain/core/output_parsers');
const { RunnableSequence } = require('@langchain/core/runnables');

// Configure Embedding Model
const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GEMINI_API_KEY_2,
    model: 'gemini-embedding-001',
});

// Configure Pinecone (Vector DB)
const pinecone = new Pinecone();
const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);

// Configure GEMINI API
const model = new ChatGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY_2,
    model: 'gemini-2.5-flash',  
    temperature: 0.3, 
});

aiRouter.post("/chat", async(req,res) => {
    try{
        const { messages } = req.body;

        const lastIndex = messages.length - 1;
        // E.g., "user: Hello\nmodel: Hi there! How can I help?"
        const history = messages.slice(0, lastIndex).map(m => `${m.role}: ${m.parts[0].text}`).join("\n");
        const currentMsg = messages[lastIndex].parts[0].text;

        async function main(){
            // Intent Model
            let framedQuery = currentMsg;
            if (history.length > 0) {
                const intentPrompt = PromptTemplate.fromTemplate(`
                    Given the following previous conversation and a current message, rephrase the current message to be a standalone question.
                    
                    Chat History:
                    {history}
                    
                    Current Message: {question}
                    
                    Standalone Question (just the question, no other text):
                `);

                const intentChain = RunnableSequence.from([
                    intentPrompt,
                    model,
                    new StringOutputParser(),
                ]);

                framedQuery = await intentChain.invoke({
                    history: history,
                    question: currentMsg,
                });

                console.log(`✨ Original: "${currentMsg}"`);
                console.log(`🚀 Framed: "${framedQuery}"`);
            }

            // Convert the user query into a vector
            const queryVector = await embeddings.embedQuery(framedQuery);  

            // Search Relevant documents into vector DB
            const searchResults = await pineconeIndex.query({
                topK: 10,
                vector: queryVector,
                includeMetadata: true,
            });
    
            const context = searchResults.matches
                                .map(match => match.metadata.text)
                                .join("\n\n---\n\n");

            // Query + Context to LLM
            const promptTemplate = PromptTemplate.fromTemplate(`
                You are a helpful assistant answering questions based on the provided documentation.

                Context from the documentation:
                {context}

                Question: {question}

                Instructions (IMPORTANT):
                - Answer the question using ONLY the information from the context above
                - If the answer is not in the context, say "I don't have enough information to answer that question."
                - Be concise and clear
                - Use code examples from the context if relevant

                FORMATTING RULES (STRICT):
                - Do NOT use markdown code blocks (triple backticks).
                - Do NOT use code fences.
                - Format code snippets using **bold text** or standard text with indentation.
                - Make it look like code using spacing, but keep it as plain text.

                Answer:
            `);
        
            const chain = RunnableSequence.from([
                promptTemplate,
                model,
                new StringOutputParser(),
            ]);

            const answer = await chain.invoke({
                // Whatever key-value pair you pass here (e.g., `question: framedQuery`),
                // the value of that key will be injected into the corresponding placeholder
                // (like `{question}`) inside the promptTemplate defined above.
                context: context,
                question: framedQuery,
            }); 

        
            res.status(201).json({
                message: answer,
            });
            console.log("✅ Answer:", answer);
        }

        main();
    }   
    catch(err){
        res.status(500).send("Error:" + err.message);
    }
})

module.exports = aiRouter;




