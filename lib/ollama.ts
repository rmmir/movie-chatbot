import axios from 'axios';

const OLLAMA_BASE_URL = 'http://localhost:11434';

export async function embedWithOllama(
    text: string,
    model = 'nomic-embed-text',
): Promise<number[]> {
    try {
        const response = await axios.post(`${OLLAMA_BASE_URL}/api/embeddings`, {
            model,
            prompt: text,
        });
        return response.data.embedding;
    } catch (error) {
        console.error('Error embedding with Ollama:', error);
        throw error;
    }
}

export async function generateWithOllama(
    prompt: string,
    model = 'llama3',
): Promise<string> {
    try {
        const response = await axios.post(`${OLLAMA_BASE_URL}/api/generate`, {
            model,
            prompt,
            stream: false,
        });
        return response.data.response;
    } catch (error) {
        console.error('Error generating with Ollama:', error);
        throw error;
    }
}

export async function streamWithOllama(prompt: string, model = 'llama3') {
    try {
        const response = await axios.post(
            `${OLLAMA_BASE_URL}/api/generate`,
            {
                model,
                prompt,
                stream: true,
            },
            {
                responseType: 'stream',
            },
        );
        return response.data;
    } catch (error) {
        console.error('Error streaming with Ollama:', error);
        throw error;
    }
}
