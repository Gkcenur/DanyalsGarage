// src/App.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const images = import.meta.glob("./assets/*.{avif,webp,png,jpg,jpeg}", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

type Car = { name: string; img: string };

export default function App() {
  const navigate = useNavigate();

  const cars: Car[] = useMemo(() => {
    return Object.entries(images)
      .map(([path, img]) => {
        const file = path.split("/").pop()!;
        const raw = file.replace(/\.[^.]+$/, "").replace(/^SIDE_THE_/, "");
        const name = raw.replace(/_/g, " ");
        return { name, img };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  // GARAGE için rastgele flicker tetikleyici
  const [flickerKey, setFlickerKey] = useState(0);
  useEffect(() => {
    let alive = true;
    const tick = () => {
      if (!alive) return;
      setFlickerKey((k) => k + 1);
      setTimeout(tick, 600 + Math.random() * 1800);
    };
    const t = setTimeout(tick, 800);
    return () => { alive = false; clearTimeout(t); };
  }, []);

  // >>> DÜZELTME: ref'i scroll eden kapsayıcıya veriyoruz
  const railWrapRef = useRef<HTMLDivElement | null>(null);
  const scrollBy = (dx: number) => {
    const el = railWrapRef.current;
    if (!el) return;
    el.scrollBy({ left: dx, behavior: "smooth" });
  };

  // klavyeden de kaydırma (←/→)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "ArrowLeft") scrollBy(-360);
      if (e.code === "ArrowRight") scrollBy(360);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const [selected, setSelected] = useState<string | null>(null);
  const onNext = (car: Car) => {
    navigate(`/play?car=${encodeURIComponent(car.name)}&img=${encodeURIComponent(car.img)}`);
  };

  return (
    <main className="page">
      <div className="center">
        <h1 className="title">
          <span style={{ display: "block" }}>DANYAL’S</span>
          <span key={flickerKey} className="flicker-active" style={{ display: "block" }}>
            GARAGE
          </span>
        </h1>

        <p className="section-label"></p>
        <div className="marquee-wrap">
          <div className="marquee">
            {cars.concat(cars).map((c, i) => (
              <span className="chip" key={`${c.name}-${i}`}>{c.name}</span>
            ))}
          </div>
        </div>

        <div className="select-area" style={{ position: "relative", width: "100%" }}>
          {/* Sol/Sağ okları */}
          <button
            type="button"
            aria-label="Scroll left"
            onClick={() => scrollBy(-360)}
            style={{
              position: "absolute",
              left: 0, top: "50%", transform: "translateY(-50%)",
              background: "rgba(0,0,0,.35)", border: "1px solid #23263a",
              color: "#e9eef3", borderRadius: 12, padding: "10px 12px",
              cursor: "pointer", zIndex: 5,
            }}
          >◀</button>
          <button
            type="button"
            aria-label="Scroll right"
            onClick={() => scrollBy(360)}
            style={{
              position: "absolute",
              right: 0, top: "50%", transform: "translateY(-50%)",
              background: "rgba(0,0,0,.35)", border: "1px solid #23263a",
              color: "#e9eef3", borderRadius: 12, padding: "10px 12px",
              cursor: "pointer", zIndex: 5,
            }}
          >▶</button>

          {/* >>> DÜZELTME: ref BURADA */}
          <div className="car-rail-wrap" ref={railWrapRef}>
            <div className="car-rail">
              {cars.map((car) => {
                const isSelected = selected === car.name;
                return (
                  <button
                    key={car.name}
                    className={`car-button ${isSelected ? "selected" : ""}`}
                    onClick={() => setSelected(car.name)}
                  >
                    <span className="name-badge">{car.name}</span>
                    <img src={car.img} alt={car.name} />
                    <span className="label">{car.name}</span>

                    {isSelected && (
                      <a
                        href={`/play?car=${encodeURIComponent(car.name)}&img=${encodeURIComponent(car.img)}`}
                        className="next-in-card"
                        onClick={(e) => { e.preventDefault(); onNext(car); }}
                      >
                        <span>NEXT</span>
                        <span>
                          <svg width="46" height="26" viewBox="0 0 66 43" xmlns="http://www.w3.org/2000/svg">
                            <g id="arrow" fill="none" fillRule="evenodd">
                              <path className="one" d="M40.154 3.895l3.822-3.756a.5.5 0 0 1 .701.001l21.015 20.646a1 1 0 0 1-.014 1.413L44.677 42.861a.5.5 0 0 1-.701-.001l-3.821-3.754a.5.5 0 0 1-.006-.707l16.839-16.536a.5.5 0 0 0-.007-.714L40.155 4.608a.5.5 0 0 1 0-.713z" fill="#fff"/>
                              <path className="two" d="M20.154 3.895l3.822-3.756a.5.5 0 0 1 .701.001l21.015 20.646a1 1 0 0 1-.014 1.413L24.677 42.861a.5.5 0 0 1-.701-.001l-3.821-3.754a.5.5 0 0 1-.006-.707l16.839-16.536a.5.5 0 0 0-.007-.714L20.155 4.608a.5.5 0 0 1 0-.713z" fill="#fff"/>
                              <path className="three" d="M.154 3.895L3.976.139a.5.5 0 0 1 .701.001l21.015 20.646a1 1 0 0 1-.014 1.413L4.677 42.861a.5.5 0 0 1-.701-.001L.155 39.106a.5.5 0 0 1-.006-.707L16.988 21.863a.5.5 0 0 0-.007-.714L.155 4.608a.5.5 0 0 1 0-.713z" fill="#fff"/>
                            </g>
                          </svg>
                        </span>
                      </a>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
