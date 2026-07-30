import { EventLayoutProject } from '../types';

export interface ExportOptions {
  format: 'svg' | 'png' | 'json';
  pngScale: number; // 1 = 1000px width, 2 = 2000px, 4 = 4000px High-Res 4K
  includeLegend: boolean;
  includeTitleBlock: boolean;
  includeGrid: boolean;
  theme: 'light' | 'blueprint' | 'monochrome';
}

export function downloadJSONProject(project: EventLayoutProject) {
  const filename = `${project.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_layout.eventjson`;
  const jsonStr = JSON.stringify(project, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadSVG(svgElement: SVGSVGElement, project: EventLayoutProject, options: ExportOptions) {
  const filename = `${project.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_map.svg`;

  // Clone SVG so we don't manipulate DOM
  const svgClone = svgElement.cloneNode(true) as SVGSVGElement;
  svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svgClone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');

  // Apply theme background if needed
  if (options.theme === 'blueprint') {
    svgClone.style.backgroundColor = '#0f172a'; // slate-900
  } else if (options.theme === 'monochrome') {
    svgClone.style.backgroundColor = '#ffffff';
  } else {
    svgClone.style.backgroundColor = '#f8fafc'; // slate-50
  }

  const serializer = new XMLSerializer();
  let svgString = serializer.serializeToString(svgClone);

  // Add XML header
  if (!svgString.startsWith('<?xml')) {
    svgString = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n' + svgString;
  }

  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function downloadPNG(
  svgElement: SVGSVGElement,
  project: EventLayoutProject,
  options: ExportOptions
): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const filename = `${project.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_map_${options.pngScale}k.png`;

      // Get SVG bounding box or dimensions
      const landW = project.landDimensions.width;
      const landH = project.landDimensions.height;
      const aspectRatio = landW / landH;

      // Base width for PNG output: scale 1 = 1600px, scale 2 = 2500px, scale 4 = 4000px High-Res
      const targetCanvasWidth = 1200 * options.pngScale;
      const targetCanvasHeight = Math.round(targetCanvasWidth / aspectRatio) + (options.includeTitleBlock ? 180 : 0);

      // Clone and serialize SVG
      const svgClone = svgElement.cloneNode(true) as SVGSVGElement;
      svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      svgClone.setAttribute('width', `${targetCanvasWidth}`);
      svgClone.setAttribute('height', `${Math.round(targetCanvasWidth / aspectRatio)}`);

      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgClone);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = targetCanvasWidth;
        canvas.height = targetCanvasHeight;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Canvas 2D context unavailable'));
          return;
        }

        // Draw background theme
        if (options.theme === 'blueprint') {
          ctx.fillStyle = '#0f172a'; // dark blueprint background
        } else if (options.theme === 'monochrome') {
          ctx.fillStyle = '#ffffff';
        } else {
          ctx.fillStyle = '#f8fafc'; // clean architectural light
        }
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw SVG image onto canvas
        const mapDrawHeight = Math.round(targetCanvasWidth / aspectRatio);
        ctx.drawImage(img, 0, 0, targetCanvasWidth, mapDrawHeight);

        // Draw High-Res Title Block & Legend Banner at bottom if enabled
        if (options.includeTitleBlock) {
          const bannerY = mapDrawHeight;
          const bannerHeight = 180;

          // Header border line
          ctx.strokeStyle = options.theme === 'blueprint' ? '#334155' : '#cbd5e1';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(0, bannerY);
          ctx.lineTo(targetCanvasWidth, bannerY);
          ctx.stroke();

          // Banner fill
          ctx.fillStyle = options.theme === 'blueprint' ? '#1e293b' : '#ffffff';
          ctx.fillRect(0, bannerY, targetCanvasWidth, bannerHeight);

          // Text content
          ctx.fillStyle = options.theme === 'blueprint' ? '#f8fafc' : '#0f172a';
          ctx.font = `bold ${Math.round(24 * (targetCanvasWidth / 1200))}px system-ui, sans-serif`;
          ctx.fillText(project.title, 40, bannerY + 50);

          ctx.fillStyle = options.theme === 'blueprint' ? '#94a3b8' : '#475569';
          ctx.font = `${Math.round(16 * (targetCanvasWidth / 1200))}px system-ui, sans-serif`;
          ctx.fillText(
            `Host: ${project.hostName}  |  Location: ${project.locationName}  |  Date: ${project.eventDate}`,
            40,
            bannerY + 90
          );

          ctx.fillText(
            `Land Size: ${project.landDimensions.width}m x ${project.landDimensions.height}m (${project.landDimensions.width * project.landDimensions.height} m²)  |  Retail Stalls: ${project.establishments.length}`,
            40,
            bannerY + 125
          );

          // Right aligned badge
          ctx.textAlign = 'right';
          ctx.fillStyle = options.theme === 'blueprint' ? '#38bdf8' : '#2563eb';
          ctx.font = `bold ${Math.round(18 * (targetCanvasWidth / 1200))}px system-ui, sans-serif`;
          ctx.fillText('OFFICIAL EVENT MASTER PLAN', targetCanvasWidth - 40, bannerY + 50);

          ctx.fillStyle = options.theme === 'blueprint' ? '#64748b' : '#94a3b8';
          ctx.font = `${Math.round(14 * (targetCanvasWidth / 1200))}px system-ui, sans-serif`;
          ctx.fillText('Generated with Event Area & Retail Coordinator', targetCanvasWidth - 40, bannerY + 90);
        }

        // Trigger PNG download
        const pngUrl = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = pngUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        URL.revokeObjectURL(svgUrl);
        resolve();
      };

      img.onerror = (err) => {
        URL.revokeObjectURL(svgUrl);
        reject(err);
      };

      img.src = svgUrl;
    } catch (err) {
      reject(err);
    }
  });
}
