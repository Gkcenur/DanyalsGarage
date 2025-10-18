import { useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";

/* === Seçilen araba görsel adına göre renk paleti === */
const COLOR_MAP: Record<string, { body: string; stripes?: string[]; glow?: string }> = {
  "SIDE_THE_I4_M60_XDRIVE.AVIF": { body: "#0b6b2a" },
  "SIDE_THE_I5_M60_SEDAN.AVIF": { body: "#d90f28" },
  "SIDE_THE_I7_M70.AVIF": { body: "#1a1a1a", stripes: ["#4b2e05"], glow: "#3b1f05" },
  "SIDE_THE_IX_M70.AVIF": { body: "#2b2b2b" },
  "SIDE_THE_M2_COUPE.AVIF": { body: "#bfc2c5" },
  "SIDE_THE_M2_CS.AVIF": { body: "#3a124a" },
  "SIDE_THE_M3_COMPETITION_SEDAN.AVIF": { body: "#a6e22e" },
  "SIDE_THE_M3_COMPETITION_TOURING.AVIF": { body: "#1f64ff" },
  "SIDE_THE_M3_CS_TOURING.AVIF": { body: "#064b1c" },
  "SIDE_THE_M3_SEDAN.WEBP": { body: "#cfd0d2", stripes: ["#ffffff"], glow: "#f5f5f5" },
  "SIDE_THE_M4_COMPETITION_CONVERTIBLE.AVIF": { body: "#bfc2c5" },
  "SIDE_THE_M4_COMPETITION_COUPE.AVIF": { body: "#b36c77" },
  "SIDE_THE_M4_CS_EDITION_VR46.AVIF": { body: "#121a3a" },
  "SIDE_THE_M4_CS.AVIF": { body: "#6fa8dc" },
  "SIDE_THE_M5_SEDAN.AVIF": { body: "#2f2f2f" },
  "SIDE_THE_M5_TOURING.AVIF": { body: "#2f2f2f" },
  "SIDE_THE_M60_TOURING.AVIF": { body: "#c8c9cc" },
  "SIDE_THE_M801_EDITION_M_HERITAGE.AVIF": { body: "#000000" },
  "SIDE_THE_M135.AVIF": { body: "#fefefe" },
  "SIDE_THE_M235_GRAN_COUPE.AVIF": { body: "#c8c9cc" },
  "SIDE_THE_M340I_SEDAN.AVIF": { body: "#808080" },
  "SIDE_THE_M340I_TOURING.WEBP": { body: "#001f3f" },
  "SIDE_THE_M440I_CONVERTIBLE.AVIF": { body: "#001f3f" },
  "SIDE_THE_M440I_COUPE.AVIF": { body: "#c60021" },
  "SIDE_THE_M440I_GRAN_COUPE.AVIF": { body: "#001f3f" },
  "SIDE_THE_M760E.AVIF": { body: "#000000" },
  "SIDE_THE_MM240I_COUPE.WEBP": { body: "#d90f28" },
  "SIDE_THE_X1_M35I.AVIF": { body: "#c8c9cc" },
  "SIDE_THE_X2_M35I.AVIF": { body: "#001f3f" },
  "SIDE_THE_X3_M50.AVIF": { body: "#f4f1eb" },
  "SIDE_THE_X4_M40I.AVIF": { body: "#c8c9cc" },
  "SIDE_THE_X4_M_COMPETITION.AVIF": { body: "#f5d300" },
  "SIDE_THE_X5_M60I.AVIF": { body: "#001f3f" },
  "SIDE_THE_X5_M_COMPETITION.AVIF": { body: "#2078b4" },
  "SIDE_THE_X6_M60I.AVIF": { body: "#001f3f" },
  "SIDE_THE_X6_M_COMPETITION.AVIF": { body: "#c8c9cc" },
  "SIDE_THE_X7_M60I.AVIF": { body: "#001f3f" },
  "SIDE_THE_XM_50E.AVIF": { body: "#f5d300" },
  "SIDE_THE_XM_BY_KITH.AVIF": { body: "#3a124a" },
  "SIDE_THE_XM_LABEL.AVIF": { body: "#001f3f" },
  "SIDE_THE_Z4_M40I.AVIF": { body: "#001f3f" },
};

/* --- Üstten görünüm araba çizimi --- */
function drawPlayerCar(
  ctx: CanvasRenderingContext2D,
  size: number,
  bodyColor: string,
  accent = { glass: "#0e1a26", tire: "#0d0f15", stroke: "rgba(0,0,0,.55)", head:"#b7f0ff", tail:"#ff3b30" }
) {
  const W = size * 1.7;
  const H = size * 2.3;
  const R = Math.min(12, size);

  // gölge
  ctx.save();
  ctx.globalAlpha = 0.25;
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.ellipse(0, H * 0.22, W * 0.55, H * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // tekerlekler
  const tw = W * 0.22, th = H * 0.32, tr = Math.min(6, size * 0.45);
  ctx.fillStyle = accent.tire;
  const wheel = (x:number, y:number) => {
    ctx.beginPath();
    const x0 = x - tw / 2, y0 = y - th / 2;
    ctx.moveTo(x0 + tr, y0);
    ctx.lineTo(x0 + tw - tr, y0);
    ctx.quadraticCurveTo(x0 + tw, y0, x0 + tw, y0 + tr);
    ctx.lineTo(x0 + tw, y0 + th - tr);
    ctx.quadraticCurveTo(x0 + tw, y0 + th, x0 + tw - tr, y0 + th);
    ctx.lineTo(x0 + tr, y0 + th);
    ctx.quadraticCurveTo(x0, y0 + th, x0, y0 + th - tr);
    ctx.lineTo(x0, y0 + tr);
    ctx.quadraticCurveTo(x0, y0, x0 + tr, y0);
    ctx.closePath();
    ctx.fill();
  };
  wheel(-W * 0.52, -H * 0.10);
  wheel( W * 0.52, -H * 0.10);
  wheel(-W * 0.52,  H * 0.12);
  wheel( W * 0.52,  H * 0.12);

  // gövde
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  const x = -W / 2, y = -H / 2, r = R;
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + W - r, y);
  ctx.quadraticCurveTo(x + W, y, x + W, y + r);
  ctx.lineTo(x + W, y + H - r);
  ctx.quadraticCurveTo(x + W, y + H, x + W - r, y + H);
  ctx.lineTo(x + r, y + H);
  ctx.quadraticCurveTo(x, y + H, x, y + H - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();

  // cam + tavan bandı
  ctx.fillStyle = accent.glass;
  ctx.fillRect(-W * 0.34, -H * 0.12, W * 0.68, H * 0.25);
  ctx.globalAlpha = 0.25;
  ctx.fillRect(-W * 0.38, -H * 0.12, W * 0.76, H * 0.06);
  ctx.globalAlpha = 1;

  // far / stop
  ctx.fillStyle = accent.head;
  ctx.fillRect(-W * 0.25, -H * 0.48, W * 0.22, H * 0.06);
  ctx.fillRect( W * 0.03,  -H * 0.48, W * 0.22, H * 0.06);
  ctx.fillStyle = accent.tail;
  ctx.fillRect(-W * 0.25,  H * 0.42, W * 0.22, H * 0.06);
  ctx.fillRect( W * 0.03,   H * 0.42, W * 0.22, H * 0.06);

  // kontur
  ctx.strokeStyle = accent.stroke;
  ctx.lineWidth = 1.4;
  ctx.stroke();
}

export default function Play() {
  const [params] = useSearchParams();
  const carName = params.get("car") || "BMW M";
  const carImg = params.get("img") || "";

  return (
    <section className="play-page">
      <div className="play-top">
        <a
          className="back-link"
          href="/"
          onClick={(e) => { e.preventDefault(); window.location.replace("/"); }}
        >
          ← Back
        </a>

        <div className="play-title">
          <strong>Arcade • M-Sprint</strong>
          <span className="muted">Selected: {carName}</span>
        </div>
      </div>

      <GameCanvas carName={carName} carImg={carImg} />
    </section>
  );
}

function GameCanvas({ carName, carImg }: { carName: string; carImg: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const imgEl = useMemo(() => {
    if (!carImg) return null;
    const i = new Image();
    i.src = carImg;
    return i;
  }, [carImg]);

  // >>> Dosya adını normalize et (RENK İÇİN KRİTİK) <<<
  const imgKey = useMemo(() => {
    if (!carImg) return "";
    const last = carImg.split("/").pop() || "";
    const noQuery = last.split("?")[0];
    return decodeURIComponent(noQuery).toUpperCase();
  }, [carImg]);

  const palette = useMemo(() => COLOR_MAP[imgKey] ?? { body: "#cfd8e6" }, [imgKey]);

  // state
  const playerRef = useRef({ x: 0, y: 0, r: 16, lane: 1, nitro: 0 });
  const lanesRef = useRef<number[]>([]);
  const runningRef = useRef(true);
  const speedRef = useRef(3.2);
  const scoreRef = useRef(0);
  const bestRef = useRef(0);
  const obstaclesRef = useRef<{ x: number; y: number; w: number; h: number }[]>([]);
  const tRef = useRef(0);

  const moveLeft = () => { playerRef.current.lane = Math.max(0, playerRef.current.lane - 1); };
  const moveRight = () => { playerRef.current.lane = Math.min(2, playerRef.current.lane + 1); };
  const nitro = () => { playerRef.current.nitro = 18; };
  const togglePause = () => { runningRef.current = !runningRef.current; };
  const restart = () => {
    obstaclesRef.current = [];
    scoreRef.current = 0;
    speedRef.current = 3.2;
    playerRef.current.lane = 1;
    runningRef.current = true;
  };

  // klavye
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "ArrowLeft") moveLeft();
      if (e.code === "ArrowRight") moveRight();
      if (e.code === "Space") nitro();
      if (e.code === "KeyP") togglePause();
      if (!runningRef.current && e.code === "KeyR") restart();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const W = (canvas.width = 960);
    const H = (canvas.height = 540);

    lanesRef.current = [W * 0.3, W * 0.5, W * 0.7];
    playerRef.current.x = lanesRef.current[1];
    playerRef.current.y = H * 0.8;

    // dokunmatik: swipe
    let sx = 0, sy = 0;
    const ts = (e: TouchEvent) => { sx = e.changedTouches[0].clientX; sy = e.changedTouches[0].clientY; };
    const te = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - sx;
      const dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 30) { dx < 0 ? moveLeft() : moveRight(); }
    };

    canvas.addEventListener("touchstart", ts, { passive: true });
    canvas.addEventListener("touchend", te, { passive: true });

    const loop = () => {
      rafRef.current = requestAnimationFrame(loop);
      tRef.current++;
      const t = tRef.current;

      if (runningRef.current) {
        if (t % 36 === 0) {
          const lane = Math.floor(Math.random() * 3);
          const x = lanesRef.current[lane];
          const w = 30 + Math.random() * 26, h = 46 + Math.random() * 50;
          obstaclesRef.current.push({ x, y: -h, w, h });
        }
        speedRef.current = playerRef.current.nitro > 0 ? 4.6 : Math.min(speedRef.current + 0.002, 5.4);
        if (playerRef.current.nitro > 0) playerRef.current.nitro--;
        playerRef.current.x += (lanesRef.current[playerRef.current.lane] - playerRef.current.x) * 0.22;

        for (const o of obstaclesRef.current) o.y += speedRef.current * (1.2 + Math.random() * 0.15);
        obstaclesRef.current = obstaclesRef.current.filter((o) => {
          if (o.y > H + 20) { scoreRef.current += 10; return false; }
          return true;
        });

        for (const o of obstaclesRef.current) {
          if (
            Math.abs(playerRef.current.x - o.x) < o.w / 2 + playerRef.current.r * 0.8 &&
            playerRef.current.y - playerRef.current.r < o.y + o.h &&
            playerRef.current.y + playerRef.current.r > o.y
          ) {
            runningRef.current = false;
            bestRef.current = Math.max(bestRef.current, scoreRef.current);
          }
        }
      }

      // çizim
      ctx.clearRect(0, 0, W, H);

      // hız çizgileri
      for (let i = 0; i < 22; i++) {
        const y = ((t * speedRef.current * 4 + (i * H) / 22) % H);
        ctx.globalAlpha = 0.25;
        ctx.fillStyle = i % 3 === 0 ? "#00a0ff" : i % 3 === 1 ? "#0072ff" : "#d90f28";
        ctx.fillRect(W * 0.22, y, W * 0.56, 2);
      }
      ctx.globalAlpha = 1;

      // şeritler
      ctx.strokeStyle = "#1f2740";
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 16]);
      ctx.beginPath(); ctx.moveTo(W * 0.4, 0); ctx.lineTo(W * 0.4, H); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(W * 0.6, 0); ctx.lineTo(W * 0.6, H); ctx.stroke();
      ctx.setLineDash([]);

      // oyuncu
      ctx.save();
      ctx.translate(playerRef.current.x, playerRef.current.y);

      // nitro/glow
      const glow = palette.glow || "#147efb";
      if (playerRef.current.nitro > 0) {
        ctx.globalAlpha = 0.35; ctx.fillStyle = glow;
        ctx.beginPath(); ctx.ellipse(-6, 18, 6, 18, 0, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 0.2; ctx.fillStyle = "#d90f28";
        ctx.beginPath(); ctx.ellipse(6, 18, 6, 18, 0, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
      }

      // gövde + detaylar
      drawPlayerCar(ctx, playerRef.current.r, palette.body);

      // M-şeritleri


      ctx.restore();

      // engeller (yuvarlak köşeli dikdörtgen)
      ctx.fillStyle = "#2f3758";
      for (const o of obstaclesRef.current) {
        const ow = o.w * 0.6, oh = o.h * 0.7, r = 10;
        ctx.beginPath();
        const x = o.x - ow/2, y = o.y - oh/2;
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + ow - r, y);
        ctx.quadraticCurveTo(x + ow, y, x + ow, y + r);
        ctx.lineTo(x + ow, y + oh - r);
        ctx.quadraticCurveTo(x + ow, y + oh, x + ow - r, y + oh);
        ctx.lineTo(x + r, y + oh);
        ctx.quadraticCurveTo(x, y + oh, x, y + oh - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
        ctx.fill();
      }

      // HUD
      ctx.fillStyle = "#cfd8e6";
      ctx.font = "16px Inter, system-ui, sans-serif";
      ctx.fillText(`Score: ${scoreRef.current}`, 14, 24);
      ctx.fillStyle = "#9aa8b4";
      ctx.fillText(`Best: ${bestRef.current}`, 14, 44);
      if (carName) {
        ctx.fillStyle = "#dfe7f1";
        ctx.font = "14px Inter, system-ui, sans-serif";
        ctx.fillText(carName, W - 240, 24);
      }
      if (imgEl && imgEl.complete) {
        ctx.globalAlpha = 0.8;
        ctx.drawImage(imgEl, W - 150, 34, 130, 58);
        ctx.globalAlpha = 1;
      }

      if (!runningRef.current) {
        ctx.fillStyle = "rgba(0,0,0,.55)";
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "#e9eef3";
        ctx.font = "28px Inter, system-ui, sans-serif";
        ctx.fillText("Crash! Press R to restart", W / 2 - 180, H / 2);
      }
    };
    loop();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      canvas.removeEventListener("touchstart", ts);
      canvas.removeEventListener("touchend", te);
    };
  }, [carName, imgEl, palette]);

  return (
    <div className="play-wrap">
      <div className="controls">← → lanes • Space: Nitro • P: Pause • R: Restart</div>
      <div className="hud-controls">
        <button className="ctrl-btn left" onClick={moveLeft} aria-label="Move left">◀</button>
        <button className="ctrl-btn nitro" onClick={nitro} aria-label="Nitro">NITRO</button>
        <button className="ctrl-btn right" onClick={moveRight} aria-label="Move right">▶</button>
      </div>
      <canvas ref={canvasRef} className="play-canvas" />
      <div className="hud-bottom">
        <button className="small-btn" onClick={togglePause}>⏯ Pause</button>
        <button className="small-btn" onClick={restart}>↻ Restart</button>
      </div>
    </div>
  );
}
