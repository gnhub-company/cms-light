export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query') || 'nature';
    const page = searchParams.get('page') || 1;

    const res = await fetch(`https://api.pexels.com/v1/search?query=${query}&per_page=15&page=${page}`, {
      headers: { Authorization: process.env.NEXT_PUBLIC_PEXELS_API_KEY }
    });

    if (!res.ok) {
      throw new Error(`Pexels API error: ${res.status}`);
    }

    const data = await res.json();
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    console.error('Pexels API Error:', error.message);
    // Return empty results instead of crashing
    return new Response(JSON.stringify({ photos: [], error: error.message }), { status: 200 });
  }
}
