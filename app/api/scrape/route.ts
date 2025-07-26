import { NextRequest } from 'next/server';
import { loadSampleData } from '@/lib/qdrant';

export async function POST(req: NextRequest) {
    try {
        const { url } = await req.json();
        if (!url) {
            return new Response(JSON.stringify({ error: 'Missing URL' }), {
                status: 400,
            });
        }

        await loadSampleData(url);

        return Response.json({ success: true });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
        });
    }
}
