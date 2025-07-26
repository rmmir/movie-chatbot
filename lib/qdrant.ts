import { QdrantClient } from '@qdrant/js-client-rest';
import { getScrapedPage } from './contentScraper';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { v4 as uuid } from 'uuid';

export const COLLECTION_NAME = 'knowledge-base';
export const VECTOR_SIZE = 768; // nomic-embed-text dimension

const client = new QdrantClient({ host: 'localhost', port: 6333 });

const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 300,
    chunkOverlap: 50,
});

export const createCollection = async () => {
    const result = await client.createCollection(COLLECTION_NAME, {
        vectors: {
            size: VECTOR_SIZE,
            distance: 'Dot',
        },
        shard_number: 1,
    });

    console.log('Collection created:', result);
};

export const loadSampleData = async (url: string) => {
    try {
        console.log('Loading data from URL:', url);

        const content = await getScrapedPage(url);
        const chunks = await splitter.splitText(content);
        for await (const chunk of chunks) {
            const response = await fetch(
                'http://localhost:11434/api/embeddings',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        model: 'nomic-embed-text',
                        prompt: chunk,
                    }),
                },
            );

            if (!response.ok) {
                const err = await response.text();
                throw new Error(`Failed to embed chunk: ${err}`);
            }

            const data = await response.json();
            console.log('Embedding response:', data);
            const vector = data.embedding as number[];
            console.log('Vector: ', data.embedding);
            await client.upsert(COLLECTION_NAME, {
                points: [
                    {
                        id: uuid(),
                        vector,
                        payload: {
                            text: chunk,
                            source: url,
                        },
                    },
                ],
            });
        }
    } catch (error) {
        console.error('Error loading sample data:', error);
        throw error;
    }
};

export { client as qdrantClient };
