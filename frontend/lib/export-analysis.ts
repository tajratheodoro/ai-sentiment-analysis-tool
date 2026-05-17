import type { LocalAnalysis } from "@/lib/client-analysis";

export async function downloadAnalysisZip(analysis: LocalAnalysis, chartElement: HTMLElement | null) {
  const [{ default: JSZip }, chartBlob] = await Promise.all([import("jszip"), chartElementToPng(chartElement)]);
  const zip = new JSZip();

  zip.file("analysis-data.json", JSON.stringify(analysis, null, 2));
  if (chartBlob) {
    zip.file("analysis-chart.png", chartBlob);
  }

  const blob = await zip.generateAsync({ type: "blob" });
  triggerDownload(blob, `sentiment-analysis-${new Date().toISOString().slice(0, 10)}.zip`);
}

async function chartElementToPng(element: HTMLElement | null) {
  const svg = element?.querySelector("svg");
  if (!svg) return null;

  const serializer = new XMLSerializer();
  const svgText = serializer.serializeToString(svg);
  const svgBlob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);

  try {
    const image = await loadImage(url);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(900, svg.clientWidth * 2);
    canvas.height = Math.max(520, svg.clientHeight * 2);
    const context = canvas.getContext("2d");
    if (!context) return null;

    context.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--background").trim()
      ? `hsl(${getComputedStyle(document.documentElement).getPropertyValue("--background")})`
      : "#f7f5ef";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    return await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png", 0.95));
  } finally {
    URL.revokeObjectURL(url);
  }
}

function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = url;
  });
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
