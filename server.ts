import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // AI Layout Advisor & Analysis Endpoint using Gemini API
  app.post('/api/ai/analyze-layout', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' });
      }

      const { landDimensions, establishments, roads, waypoints } = req.body;

      const ai = new GoogleGenAI({ apiKey });
      
      const prompt = `You are an expert event master planner, retail layout architect, and crowd safety specialist.
Analyze the following event layout configuration:
- Land Dimensions: ${landDimensions.width}m x ${landDimensions.height}m (Shape: ${landDimensions.shape || 'Rectangular'}, Total Area: ${landDimensions.width * landDimensions.height} sq meters)
- Placed Retail Establishments (${establishments?.length || 0} total):
${JSON.stringify(establishments, null, 2)}
- Roads & Walkways (${roads?.length || 0} total):
${JSON.stringify(roads, null, 2)}
- Waypoints & Entrances (${waypoints?.length || 0} total):
${JSON.stringify(waypoints, null, 2)}

Provide a structured, insightful JSON response with the following keys:
1. "spatialEfficiencyScore": number from 0 to 100
2. "crowdSafetyScore": number from 0 to 100
3. "recommendations": array of 3 to 5 actionable suggestions (e.g. "Add a 4m aisle near Food Truck cluster", "Shift Medical tent closer to Main Entrance")
4. "commercialPotential": brief paragraph evaluating revenue generation and tenant distribution
5. "suggestedAdditions": array of strings listing missing retail or safety amenities (e.g. ["Trash Stations", "Information Kiosk near Gate A"])

Return ONLY valid JSON matching this schema without markdown codeblocks or extra conversational text.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        }
      });

      const responseText = response.text || '{}';
      const resultData = JSON.parse(responseText);

      return res.json({ success: true, data: resultData });
    } catch (error: any) {
      console.error('Error in AI layout analysis:', error);
      return res.status(500).json({
        error: 'Failed to analyze layout with AI',
        message: error?.message || 'Unknown error',
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
