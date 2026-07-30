# EventCanvas

EventCanvas (formerly Event Retail Coordinator) is a beautiful, intuitive, static local-first web application designed for visualizing land plots and meticulously planning event layouts, vendor stalls, custom landmarks, and routing infrastructure.

## ✨ Features

- **Offline / Local First Architecture:** The entire layout system runs 100% inside your browser. No backend dependency is required to draw, edit, and plan your events.
- **Land Dimension Tool:** Input your specific plot width and height. The canvas will scale and provide a graph-paper-style grid corresponding directly to real-world measurements (meters or feet).
- **Vendor & Stall Management:** Choose from various establishments (food trucks, retail, services, stages). Drag, drop, rotate, and resize stalls right on the map.
- **Orthogonal Road System:** The powerful road drawing tool makes infrastructure planning easy. Just click two points, and EventCanvas will automatically compute a perfect 90° orthogonal road path connecting them to ensure clean, professional layouts.
- **Custom Landmark Areas:** Define and color-code specific zones (e.g., "Main Stage", "Food Court") and draw them onto the canvas with customizable names.
- **AI Layout Advisor:** Integrates with Gemini AI to analyze your current stall placements, road infrastructure, and pedestrian chokepoints, providing actionable, intelligent layout suggestions. (Requires AI backend).
- **High-Res Export:** Take your digital sketch to the real world by exporting your map into a high-resolution PNG, making it perfect for printing or sending to event contractors.

## 🎨 Design Philosophy
The application features a gorgeous **Paper Sketch** aesthetic. From the subtle off-white tones and muted pencil-stroke borders to the beautifully sparse, uncluttered UI, the layout process feels exactly like sketching a blueprint on a fresh piece of drafting paper.

## 🚀 How to Run

1. Clone this repository.
2. Ensure you have Node installed, then run `npm install` to install frontend dependencies.
3. Start the development server using `npm run dev`.
4. Open the provided `localhost` URL in your browser. 

*(Note: The AI Advisor requires the backend to be running on port 3000. Start it using `npx tsx server.ts` if you want AI suggestions. Otherwise, the app functions entirely offline).*