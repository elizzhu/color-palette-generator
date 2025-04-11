export default async function handler(req, res) {
    const { photoReference, maxWidth, maxHeight } = req.query;
    
    if (!photoReference) {
        return res.status(400).json({ error: 'Photo reference is required' });
    }

    try {
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/place/photo?` +
            `maxwidth=${maxWidth || 800}&` +
            `maxheight=${maxHeight || 600}&` +
            `photo_reference=${photoReference}&` +
            `key=${process.env.GOOGLE_MAPS_API_KEY}`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch photo');
        }

        // Forward the response headers
        response.headers.forEach((value, key) => {
            res.setHeader(key, value);
        });

        // Stream the response body
        const buffer = await response.arrayBuffer();
        res.send(Buffer.from(buffer));
    } catch (error) {
        console.error('Error fetching photo:', error);
        res.status(500).json({ error: 'Failed to fetch photo' });
    }
} 