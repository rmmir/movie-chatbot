import { COLLECTION_NAME, qdrantClient } from '@/lib/qdrant';

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();
        const lastMessage = messages[messages.length - 1];

        const embedResponse = await fetch(
            'http://localhost:11434/api/embeddings',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'nomic-embed-text',
                    prompt: lastMessage.content,
                }),
            },
        );

        if (!embedResponse.ok) {
            const errText = await embedResponse.text();
            throw new Error(`Failed to get embedding from Ollama: ${errText}`);
        }

        const embedData = await embedResponse.json();
        const questionVector = embedData.embedding as number[];

        const searchResult = await qdrantClient.search(COLLECTION_NAME, {
            vector: questionVector,
            limit: 5,
            with_payload: true,
        });

        const contextChunks = searchResult
            .map((r) => r.payload?.text || '')
            .join('\n\n');

        // Create enhanced prompt with context
        const systemPrompt = `
            You are a helpful assistant that responds with information about movies, TV Series, actors and anything related to Hollywood entertainment related.
            If you don't know the answer, say "I don't know" instead of making up an answer.
            If the user asks for anything outside of your expertise, politely decline to answer mentioning that you are focused on movies information. 
                        
            Answer the user's question based on the context below if the question is related to any of it.
            If the question is not related to the context, answer based on your knowledge.
            Do not mention the context in your answer, just use it to inform your response.

            Context:
            ${contextChunks}
        `;

        const prompt = `${systemPrompt}\n\nUser Question: ${lastMessage.content}`;

        // Stream response from Ollama
        const ollamaResponse = await fetch(
            'http://localhost:11434/api/generate',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'llama3.1',
                    prompt: prompt,
                    stream: true,
                }),
            },
        );

        if (!ollamaResponse.ok) {
            throw new Error('Failed to generate response from Ollama');
        }

        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                const reader = ollamaResponse.body?.getReader();
                const decoder = new TextDecoder();

                if (!reader) {
                    controller.close();
                    return;
                }

                try {
                    let fullContent = '';

                    while (true) {
                        const { done, value } = await reader.read();

                        if (done) {
                            break;
                        }

                        const chunk = decoder.decode(value, { stream: true });
                        const lines = chunk
                            .split('\n')
                            .filter((line) => line.trim());

                        for (const line of lines) {
                            try {
                                const parsed = JSON.parse(line);

                                if (parsed.response) {
                                    fullContent += parsed.response;

                                    // Send chunk in format expected by useChat
                                    const streamChunk = `0:"${parsed.response.replace(/"/g, '\\"')}"\n`;
                                    controller.enqueue(
                                        encoder.encode(streamChunk),
                                    );
                                }

                                if (parsed.done) {
                                    // Send final message
                                    const finalMessage = {
                                        id: crypto.randomUUID(),
                                        role: 'assistant',
                                        content: fullContent,
                                    };
                                    const finalChunk = `d:${JSON.stringify([finalMessage])}\n`;
                                    controller.enqueue(
                                        encoder.encode(finalChunk),
                                    );
                                    controller.close();
                                    return;
                                }
                            } catch (parseError) {
                                console.warn('Failed to parse chunk:', line);
                            }
                        }
                    }
                } catch (error) {
                    console.error('Streaming error:', error);
                    controller.error(error);
                } finally {
                    reader.releaseLock();
                }
            },
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Cache-Control': 'no-cache',
                Connection: 'keep-alive',
            },
        });
    } catch (error) {
        console.error('Error in chat API:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}
