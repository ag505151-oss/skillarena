'use client';
import { useEffect, useRef } from 'react';

const mockTrend = [
  { label: 'Test 1', score: 55 },
  { label: 'Test 2', score: 62 },
  { label: 'Test 3', score: 58 },
  { label: 'Test 4', score: 70 },
  { label: 'Test 5', score: 65 },
  { label: 'Test 6', score: 74 },
  { label: 'Test 7', score: 78 },
  { label: 'Test 8', score: 72 },
  { label: 'Test 9', score: 80 },
  { label: 'Test 10', score: 74 },
];

const PLATFORM_AVG = 65;

export function TrendChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const pad = { top: 16, right: 16, bottom: 24, left: 32 };
    const chartW = W - pad.left - pad.right;
    const chartH = H - pad.top - pad.bottom;

    ctx.clearRect(0, 0, W, H);

    const scores = mockTrend.map((d) => d.score);
    const minScore = Math.min(...scores) - 10;
    const maxScore = Math.max(...scores) + 10;

    function xPos(i: number) { return pad.left + (i / (mockTrend.length - 1)) * chartW; }
    function yPos(v: number) { return pad.top + chartH - ((v - minScore) / (maxScore - minScore)) * chartH; }

    // Platform avg dashed line
    const avgY = yPos(PLATFORM_AVG);
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad.left, avgY);
    ctx.lineTo(pad.left + chartW, avgY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Gradient fill
    const gradient = ctx.createLinearGradient(0, pad.top, 0, pad.top + chartH);
    gradient.addColorStop(0, 'rgba(83,74,183,0.3)');
    gradient.addColorStop(1, 'rgba(83,74,183,0)');
    ctx.beginPath();
    mockTrend.forEach((d, i) => {
      if (i === 0) ctx.moveTo(xPos(i), yPos(d.score));
      else ctx.lineTo(xPos(i), yPos(d.score));
    });
    ctx.lineTo(xPos(mockTrend.length - 1), pad.top + chartH);
    ctx.lineTo(xPos(0), pad.top + chartH);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Line
    ctx.beginPath();
    mockTrend.forEach((d, i) => {
      if (i === 0) ctx.moveTo(xPos(i), yPos(d.score));
      else ctx.lineTo(xPos(i), yPos(d.score));
    });
    ctx.strokeStyle = '#534AB7';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Dots
    mockTrend.forEach((d, i) => {
      ctx.beginPath();
      ctx.arc(xPos(i), yPos(d.score), 3, 0, Math.PI * 2);
      ctx.fillStyle = '#534AB7';
      ctx.fill();
    });
  }, []);

  return (
    <div className="relative">
      <canvas ref={canvasRef} width={400} height={160} className="w-full" />
      <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><span className="inline-block h-0.5 w-4 bg-[#534AB7]" /> Your scores</span>
        <span className="flex items-center gap-1"><span className="inline-block h-0.5 w-4 border-t-2 border-dashed border-slate-400" /> Platform avg ({PLATFORM_AVG})</span>
      </div>
    </div>
  );
}
