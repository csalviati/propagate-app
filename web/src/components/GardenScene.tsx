/**
 * GardenScene: full-page illustrated English cottage garden.
 *
 * Style: hand-drawn botanical illustration — bold ink outlines, flat colour
 * fills, botanically recognizable plants. No animation (static illustration).
 *
 * ViewBox: 1440 × 900
 * Layout:
 *   y   0 – 340 : Open sky  ← text lives here
 *   y 340 – 410 : Brick garden wall
 *   y 410 – 760 : Garden floor (beds, pots, features)
 *   y 760 – 900 : Ground / soil strip
 *
 * Plants: lavender, roses, bougainvillea, poppies, rosemary, jasmine, tomatoes.
 * Features: terra cotta pots (various sizes), bird bath.
 */

import React from "react";

// ─── Colour palette ───────────────────────────────────────────────────────────

const C = {
  // Sky
  skyTop:      "#9ec8e0",
  skyMid:      "#bce0c8",
  skyLow:      "#a8c860",

  // Greens
  dkLeaf:      "#183c20",
  dkGreen:     "#1e4a28",
  mdGreen:     "#2a6838",
  ltGreen:     "#58a858",
  sageGreen:   "#78a86c",
  lavStem:     "#7a9878",
  tomatoGreen: "#508038",

  // Lavender
  lavPurple:   "#8870b8",
  lavLt:       "#b8a0d8",

  // Rose
  roseRed:     "#c83040",
  rosePink:    "#e870a0",
  roseDk:      "#8a1828",

  // Bougainvillea
  bougPink:    "#e83490",
  bougMag:     "#cc2878",

  // Poppy
  poppyRed:    "#e02020",
  poppyOrg:    "#e87020",

  // Jasmine
  jasmine:     "#f8f4e8",
  jasmineYlw:  "#f0d840",

  // Tomato
  tomatoRed:   "#e03828",

  // Terra cotta
  tc:          "#c86840",
  tcDk:        "#a04828",
  tcLt:        "#e08858",

  // Stone
  stone:       "#a89888",
  stoneDk:     "#786858",
  stoneLt:     "#c8b8a8",
  water:       "#78a8c8",
  waterLt:     "#a8c8e0",

  // Bark
  bark:        "#7a5030",
  barkDk:      "#503018",

  // Wall
  brick:       "#d8a050",
  brickDk:     "#b07830",
  mortar:      "#d8c8a0",

  // Ground
  soil:        "#a07848",
  soilDk:      "#785830",
  grass:       "#68a838",
  grassDk:     "#2a6838",

  ink:         "#1a1510",
};

// Stroke helper — shared "hand-drawn outline" attrs
const sk = (w: number) => ({
  stroke: C.ink,
  strokeWidth: w,
  strokeLinecap:  "round"  as const,
  strokeLinejoin: "round"  as const,
});

// ─── Rose ─────────────────────────────────────────────────────────────────────
// Stem → two trilobed leaves → calyx → layered petals → center.

function Rose({
  x, y, height = 140, color = C.roseRed, size = 22, lean = 0,
}: {
  x: number; y: number; height?: number;
  color?: string; size?: number; lean?: number;
}) {
  const fx = x + lean;
  const fy = y - height;
  const hw = size;

  return (
    <g>
      {/* Stem */}
      <path
        d={`M ${x},${y} Q ${x + lean * 0.4},${y - height * 0.5} ${fx},${fy + hw}`}
        fill="none" stroke={C.mdGreen} strokeWidth="2.5" strokeLinecap="round"
      />
      {/* Thorns */}
      <path d={`M ${x + lean*0.1},${y - height*0.22} L ${x + lean*0.1 - 6},${y - height*0.22 - 6}`}
            stroke={C.dkGreen} strokeWidth="1.5" strokeLinecap="round"/>
      <path d={`M ${x + lean*0.25},${y - height*0.48} L ${x + lean*0.25 + 6},${y - height*0.48 - 5}`}
            stroke={C.dkGreen} strokeWidth="1.5" strokeLinecap="round"/>
      {/* Leaf 1 — trilobed */}
      <g transform={`translate(${x + lean*0.12}, ${y - height*0.36})`}>
        <path d="M 0,0 Q -16,-8 -18,-22 Q -6,-30 0,-18 Q 6,-30 18,-22 Q 16,-8 0,0"
              fill={C.mdGreen} {...sk(1.2)} />
        <path d="M 0,0 L 0,-18" stroke={C.dkGreen} strokeWidth="0.8" fill="none" />
      </g>
      {/* Leaf 2 */}
      <g transform={`translate(${x + lean*0.28 + 8}, ${y - height*0.6}) rotate(-15)`}>
        <path d="M 0,0 Q -13,-6 -15,-18 Q -5,-25 0,-14 Q 5,-25 15,-18 Q 13,-6 0,0"
              fill={C.sageGreen} {...sk(1.2)} />
      </g>
      {/* Sepals */}
      <g transform={`translate(${fx}, ${fy + hw * 0.85})`}>
        {[0, 72, 144, 216, 288].map((a) => (
          <path key={a} d="M 0,0 Q -3,-5 0,-13 Q 3,-5 0,0"
                fill={C.mdGreen} stroke={C.dkGreen} strokeWidth="0.8"
                transform={`rotate(${a})`} />
        ))}
      </g>
      {/* Outer petals */}
      <g transform={`translate(${fx}, ${fy})`}>
        {[0, 72, 144, 216, 288].map((a) => (
          <path key={a}
            d={`M 0,0 C ${-hw*0.6},${-hw*0.35} ${-hw*0.5},${-hw} 0,${-hw*1.25} C ${hw*0.5},${-hw} ${hw*0.6},${-hw*0.35} 0,0`}
            fill={color} {...sk(1.3)} transform={`rotate(${a})`} />
        ))}
        {/* Inner petals */}
        {[36, 108, 180, 252, 324].map((a) => (
          <path key={a}
            d={`M 0,0 C ${-hw*0.44},${-hw*0.27} ${-hw*0.38},${-hw*0.7} 0,${-hw*0.88} C ${hw*0.38},${-hw*0.7} ${hw*0.44},${-hw*0.27} 0,0`}
            fill={color === C.roseRed ? C.roseDk : color} {...sk(1.0)}
            transform={`rotate(${a})`} />
        ))}
        <circle r={hw * 0.22} fill={C.roseDk} {...sk(1)} />
        <circle r={hw * 0.1}  fill="#ffd080" stroke="none" />
      </g>
    </g>
  );
}

// ─── Lavender ─────────────────────────────────────────────────────────────────
// Multiple thin stems each ending in a dense spike of tiny oval florets.

function LavenderClump({
  x, y, height = 100, count = 5,
}: {
  x: number; y: number; height?: number; count?: number;
}) {
  const spikes = Array.from({ length: count }, (_, i) => ({
    ox: (i - (count - 1) / 2) * 9,
    h:  height * (0.85 + (i % 3) * 0.08),
    lean: (i - (count - 1) / 2) * 3.5,
  }));

  return (
    <g>
      {/* Base foliage blades */}
      {[-1, 0, 1].map((i) => (
        <path key={i}
          d={`M ${x},${y} Q ${x + i*18},${y-28} ${x + i*24},${y-16}`}
          fill="none" stroke={C.lavStem} strokeWidth="2.2" strokeLinecap="round" />
      ))}
      {spikes.map((s, i) => (
        <g key={i}>
          {/* Stem */}
          <path
            d={`M ${x + s.ox},${y} Q ${x + s.ox + s.lean*0.3},${y - s.h*0.5} ${x + s.ox + s.lean},${y - s.h*0.55}`}
            fill="none" stroke={C.lavStem} strokeWidth="1.8" strokeLinecap="round" />
          {/* Florets */}
          {Array.from({ length: 10 }, (_, fi) => (
            <ellipse key={fi}
              cx={x + s.ox + s.lean + (fi % 2 === 0 ? -2.8 : 2.8)}
              cy={y - s.h * 0.55 - fi * 4.5}
              rx={3.2} ry={5.5}
              fill={fi < 3 ? C.lavLt : C.lavPurple} {...sk(0.9)} />
          ))}
        </g>
      ))}
    </g>
  );
}

// ─── Poppy ────────────────────────────────────────────────────────────────────
// 4 large rounded petals around a dark center with radiating stamens.

function Poppy({
  x, y, height = 145, color = C.poppyRed,
}: {
  x: number; y: number; height?: number; color?: string;
}) {
  const fx = x, fy = y - height, r = 26;
  return (
    <g>
      {/* Basal lobed leaves */}
      <path
        d={`M ${x},${y} Q ${x-26},${y-24} ${x-32},${y-46} Q ${x-10},${y-56} ${x},${y-38} Q ${x+10},${y-56} ${x+32},${y-46} Q ${x+26},${y-24} ${x},${y}`}
        fill="#607878" {...sk(1.5)} />
      {/* Hairy stem */}
      <path d={`M ${x},${y-50} Q ${x+6},${y-height*0.5} ${fx},${fy+r}`}
            fill="none" stroke="#607878" strokeWidth="2.5" strokeLinecap="round" />
      {/* Side bud on drooping pedicel */}
      <path d={`M ${x+12},${y-height*0.65} Q ${x+30},${y-height*0.63} ${x+34},${y-height*0.72}`}
            fill="none" stroke="#607878" strokeWidth="2" strokeLinecap="round" />
      <ellipse cx={x+34} cy={y-height*0.8} rx={7} ry={13} fill={C.mdGreen} {...sk(1.5)} />
      {/* 4 large petals */}
      {[0, 90, 180, 270].map((a) => (
        <path key={a}
          d={`M ${fx},${fy} C ${fx-r*0.7},${fy-r*0.3} ${fx-r*0.6},${fy-r} ${fx},${fy-r*1.4} C ${fx+r*0.6},${fy-r} ${fx+r*0.7},${fy-r*0.3} ${fx},${fy}`}
          fill={color} {...sk(1.5)} transform={`rotate(${a}, ${fx}, ${fy})`} />
      ))}
      {/* Dark center */}
      <circle cx={fx} cy={fy} r={r*0.28} fill="#1a1a1a" {...sk(1.2)} />
      {/* Stamens */}
      {Array.from({ length: 14 }, (_, i) => {
        const a = (i / 14) * Math.PI * 2;
        return (
          <line key={i}
            x1={fx + Math.cos(a) * r*0.3} y1={fy + Math.sin(a) * r*0.3}
            x2={fx + Math.cos(a) * r*0.5} y2={fy + Math.sin(a) * r*0.5}
            stroke="#ffe0a0" strokeWidth="0.9" />
        );
      })}
    </g>
  );
}

// ─── Bougainvillea ────────────────────────────────────────────────────────────
// Cluster of 3 papery triangular bracts + tiny white true flowers.

function BougCluster({
  x, y, rotate = 0, color = C.bougPink,
}: {
  x: number; y: number; rotate?: number; color?: string;
}) {
  return (
    <g transform={`translate(${x},${y}) rotate(${rotate})`}>
      {[0, 120, 240].map((a) => (
        <path key={a} d="M 0,0 Q -10,-7 -8,-24 Q 0,-30 8,-24 Q 10,-7 0,0"
              fill={color} {...sk(1.3)} transform={`rotate(${a})`} />
      ))}
      {[0, 72, 144, 216, 288].map((a) => (
        <path key={a} d="M 0,0 Q -2,-3 0,-7 Q 2,-3 0,0"
              fill={C.jasmine} stroke="none" transform={`rotate(${a})`} />
      ))}
      <circle r={2.5} fill={C.jasmineYlw} stroke="none" />
    </g>
  );
}

function BougVine({
  x, y, length = 200, color = C.bougPink,
}: {
  x: number; y: number; length?: number; color?: string;
}) {
  return (
    <g>
      <path
        d={`M ${x},${y} Q ${x-18},${y-length*0.3} ${x+12},${y-length*0.52} Q ${x-12},${y-length*0.76} ${x+5},${y-length}`}
        fill="none" stroke={C.mdGreen} strokeWidth="2.2" strokeLinecap="round" />
      {[0.2, 0.42, 0.65, 0.85].map((t, i) => {
        const vx = x + (i%2===0 ? 14 : -14);
        const vy = y - t * length;
        return (
          <ellipse key={i} cx={vx} cy={vy} rx={9} ry={14} fill={C.sageGreen} {...sk(1)}
            transform={`rotate(${i%2===0 ? -30 : 30}, ${vx}, ${vy})`} />
        );
      })}
      {[0.15, 0.38, 0.6, 0.82].map((t, i) => (
        <BougCluster key={i} x={x + (i%2===0 ? 18 : -18)} y={y - t * length - 14}
          rotate={i * 28} color={color} />
      ))}
    </g>
  );
}

// ─── Rosemary ────────────────────────────────────────────────────────────────
// Woody branching stems with dense needle leaves and tiny blue-purple flowers.

function Rosemary({
  x, y, w = 70, h = 85,
}: {
  x: number; y: number; w?: number; h?: number;
}) {
  const stems = [
    { ox: -w*0.4, angle: -22, len: h*0.9 },
    { ox: -w*0.12, angle: -6,  len: h },
    { ox:  w*0.14, angle:  9,  len: h*0.95 },
    { ox:  w*0.38, angle: 24,  len: h*0.85 },
  ];
  return (
    <g>
      {stems.map((s, si) => {
        const rad = (s.angle * Math.PI) / 180;
        const ex = x + s.ox + Math.sin(rad) * s.len;
        const ey = y - Math.cos(rad) * s.len;
        return (
          <g key={si}>
            <path d={`M ${x+s.ox},${y} L ${ex},${ey}`}
                  stroke={C.bark} strokeWidth="2.5" strokeLinecap="round" fill="none" />
            {Array.from({ length: 13 }, (_, li) => {
              const t = (li + 1) / 14;
              const lx = x + s.ox + (ex - x - s.ox) * t;
              const ly = y + (ey - y) * t;
              const la = s.angle + (li%2===0 ? 88 : -88);
              const laRad = (la * Math.PI) / 180;
              return (
                <line key={li}
                  x1={lx} y1={ly}
                  x2={lx + Math.cos(laRad) * 9}
                  y2={ly + Math.sin(laRad) * 9}
                  stroke={C.lavStem} strokeWidth="1.4" strokeLinecap="round" />
              );
            })}
            <circle cx={ex} cy={ey} r={4.5} fill={C.lavPurple} {...sk(1)} />
          </g>
        );
      })}
    </g>
  );
}

// ─── Jasmine ─────────────────────────────────────────────────────────────────
// Climbing vine with opposite oval leaves and 5-petal star flowers.

function JasmineStar({ cx, cy, r = 10 }: { cx: number; cy: number; r?: number }) {
  return (
    <g>
      {[0, 72, 144, 216, 288].map((deg) => {
        const a = ((deg - 90) * Math.PI) / 180;
        const ex = cx + Math.cos(a) * r;
        const ey = cy + Math.sin(a) * r;
        const px = cx + Math.cos(a + 0.4) * r * 0.4;
        const py = cy + Math.sin(a + 0.4) * r * 0.4;
        return (
          <path key={deg}
            d={`M ${cx},${cy} Q ${px},${py} ${ex},${ey} Q ${cx + Math.cos(a-0.4)*r*0.4},${cy + Math.sin(a-0.4)*r*0.4} ${cx},${cy}`}
            fill={C.jasmine} {...sk(0.8)} />
        );
      })}
      <circle cx={cx} cy={cy} r={r * 0.25} fill={C.jasmineYlw} stroke="none" />
    </g>
  );
}

function JasmineVine({ x, y, length = 180 }: { x: number; y: number; length?: number }) {
  return (
    <g>
      <path
        d={`M ${x},${y} Q ${x-22},${y-length*0.28} ${x+16},${y-length*0.54} Q ${x-14},${y-length*0.76} ${x+6},${y-length}`}
        fill="none" stroke={C.mdGreen} strokeWidth="2" strokeLinecap="round" />
      {[0.22, 0.48, 0.74].map((t, i) => {
        const lx = x + (i%2===0 ? 18 : -18);
        const ly = y - t * length;
        return (
          <ellipse key={i} cx={lx} cy={ly} rx={8} ry={13} fill={C.ltGreen} {...sk(1.2)}
            transform={`rotate(${i%2===0 ? -28 : 28}, ${lx}, ${ly})`} />
        );
      })}
      {[0.18, 0.44, 0.68, 0.9].map((t, i) => (
        <JasmineStar key={i} cx={x + (i%2===0 ? 22 : -22)} cy={y - t * length} r={9} />
      ))}
    </g>
  );
}

// ─── Tomato vine ─────────────────────────────────────────────────────────────
// Staked vine with compound leaves, yellow flowers, and red/green fruits.

function TomatoVine({ x, y, height = 165 }: { x: number; y: number; height?: number }) {
  const tomatoes = [
    { t: 0.28, ox: -16, r: 12, col: C.tomatoRed },
    { t: 0.44, ox:  18, r: 10, col: "#e05030" },
    { t: 0.62, ox:  -8, r: 11, col: "#e87030" },
    { t: 0.72, ox:  14, r:  9, col: C.mdGreen },
  ];
  return (
    <g>
      {/* Bamboo stake */}
      <path d={`M ${x+6},${y} L ${x+9},${y-height}`}
            stroke="#c8a060" strokeWidth="3" strokeLinecap="round" strokeDasharray="8,4" />
      {/* Main vine */}
      <path
        d={`M ${x},${y} Q ${x-12},${y-height*0.35} ${x+6},${y-height*0.55} Q ${x+22},${y-height*0.7} ${x},${y-height}`}
        fill="none" stroke={C.tomatoGreen} strokeWidth="2.8" strokeLinecap="round" />
      {/* Compound leaves */}
      {[0.26, 0.52, 0.76].map((t, i) => {
        const lx = x + (i%2===0 ? -20 : 24);
        const ly = y - t * height;
        const ang = i%2===0 ? -28 : 28;
        return (
          <g key={i} transform={`translate(${lx},${ly}) rotate(${ang})`}>
            <path d="M 0,0 Q -7,-8 0,-21 Q 7,-8 0,0" fill={C.tomatoGreen} {...sk(1.2)} />
            <path d="M -2,-10 Q -15,-13 -19,-5 Q -12,-2 -2,-10" fill={C.ltGreen} {...sk(1)} />
            <path d="M  2,-10 Q  15,-13  19,-5 Q  12,-2  2,-10" fill={C.ltGreen} {...sk(1)} />
          </g>
        );
      })}
      {/* Fruits */}
      {tomatoes.map((t, i) => {
        const tx = x + t.ox;
        const ty = y - t.t * height;
        return (
          <g key={i}>
            <circle cx={tx} cy={ty} r={t.r} fill={t.col} {...sk(1.5)} />
            {[0, 60, 120, 180, 240, 300].map((a) => (
              <path key={a}
                d={`M ${tx},${ty-t.r+1} L ${tx+Math.cos(a*Math.PI/180)*4},${ty-t.r-4}`}
                stroke={C.tomatoGreen} strokeWidth="1.2" strokeLinecap="round" />
            ))}
            <circle cx={tx-t.r*0.3} cy={ty-t.r*0.3} r={t.r*0.28}
                    fill="rgba(255,255,255,0.32)" stroke="none" />
          </g>
        );
      })}
    </g>
  );
}

// ─── Terra cotta pot ─────────────────────────────────────────────────────────

function Pot({
  x, y, w = 60, h = 55,
}: {
  x: number; y: number; w?: number; h?: number;
}) {
  const mw = w / 2;
  const bw = mw * 0.70;
  const rimH = 9;
  return (
    <g>
      {/* Body */}
      <path
        d={`M ${x-mw},${y-h+rimH} L ${x-bw},${y} L ${x+bw},${y} L ${x+mw},${y-h+rimH} Z`}
        fill={C.tc} {...sk(2)} />
      {/* Rim */}
      <rect x={x-mw-3} y={y-h} width={(mw+3)*2} height={rimH+4} rx={3}
            fill={C.tcDk} {...sk(2)} />
      {/* Highlight */}
      <path d={`M ${x-mw+8},${y-h+rimH+6} L ${x-bw+5},${y-5}`}
            stroke={C.tcLt} strokeWidth="3" strokeLinecap="round" fill="none" opacity={0.55} />
      {/* Soil */}
      <ellipse cx={x} cy={y-h+rimH+5} rx={mw-2} ry={4} fill={C.soilDk} stroke="none" />
    </g>
  );
}

// ─── Bird bath ───────────────────────────────────────────────────────────────

function BirdBath({ x, y, h = 125 }: { x: number; y: number; h?: number }) {
  const bw = 72;
  const pw = 13;
  const by = y - h;  // bowl top y
  return (
    <g>
      {/* Base slab */}
      <rect x={x-pw*1.6} y={y-9} width={pw*3.2} height={9} rx={2} fill={C.stoneLt} {...sk(2)} />
      {/* Pedestal */}
      <rect x={x-pw/2} y={by+24} width={pw} height={h-32} rx={4}
            fill={C.stoneDk} {...sk(2)} />
      {/* Cap under bowl */}
      <rect x={x-pw} y={by+14} width={pw*2} height={10} rx={3} fill={C.stone} {...sk(1.5)} />
      {/* Bowl outer shape */}
      <path
        d={`M ${x-bw/2},${by+6} Q ${x-bw/2-9},${by+18} ${x},${by+20} Q ${x+bw/2+9},${by+18} ${x+bw/2},${by+6} Q ${x},${by-2} ${x-bw/2},${by+6}`}
        fill={C.stone} {...sk(2)} />
      {/* Water surface */}
      <ellipse cx={x} cy={by+14} rx={bw/2-5} ry={5.5} fill={C.water} stroke="none" opacity={0.85} />
      {/* Ripple */}
      <ellipse cx={x} cy={by+13} rx={bw/4} ry={2.5}
               fill="none" stroke={C.waterLt} strokeWidth="1" opacity={0.7} />
    </g>
  );
}

// ─── Tree canopy ─────────────────────────────────────────────────────────────

function TreeCanopy({
  x, y, w, h, col = C.dkGreen,
}: {
  x: number; y: number; w: number; h: number; col?: string;
}) {
  return (
    <g>
      <ellipse cx={x}           cy={y-h*0.5}  rx={w*0.5}  ry={h*0.5}  fill={col}      {...sk(2.2)} />
      <ellipse cx={x-w*0.28}    cy={y-h*0.34} rx={w*0.3}  ry={h*0.3}  fill={col}       stroke="none" />
      <ellipse cx={x+w*0.26}    cy={y-h*0.37} rx={w*0.28} ry={h*0.28} fill={col}       stroke="none" />
      <ellipse cx={x}           cy={y-h*0.74} rx={w*0.3}  ry={h*0.24} fill={C.mdGreen} stroke="none" opacity={0.65} />
    </g>
  );
}

// ─── Brick wall ──────────────────────────────────────────────────────────────

function BrickWall({ y, W = 1440, H = 72 }: { y: number; W?: number; H?: number }) {
  const bw = 62, bh = 28;
  const cols = Math.ceil(W / bw) + 2;
  const rows = Math.ceil(H / bh);
  const fills = [C.brick, C.brickDk, "#c89040", C.brick, "#c09050"];
  return (
    <g>
      <rect x={0} y={y} width={W} height={H} fill={C.mortar} stroke="none" />
      {Array.from({ length: rows }, (_, ri) =>
        Array.from({ length: cols }, (_, ci) => (
          <rect key={`${ri}-${ci}`}
            x={ci*bw - (ri%2===0 ? 0 : bw/2) - 2}
            y={y + ri*bh + 2}
            width={bw-3} height={bh-3} rx={1.5}
            fill={fills[(ri*3+ci) % fills.length]}
            stroke={C.brickDk} strokeWidth={0.8} />
        ))
      )}
    </g>
  );
}

// ─── Ground / grass edge ─────────────────────────────────────────────────────

function Ground({ y, W = 1440 }: { y: number; W?: number }) {
  const blades = Array.from({ length: 90 }, (_, i) => i * 16);
  return (
    <g>
      <rect x={0} y={y} width={W} height={140} fill={C.soil} stroke="none" />
      {/* Grass edge — wavy path */}
      <path
        d={`M 0,${y} ` + blades.map((gx, i) => {
          const peak = y - (i%2===0 ? 11 : 6);
          return `Q ${gx+5},${peak} ${gx+8},${y} Q ${gx+11},${peak} ${gx+16},${y}`;
        }).join(" ")}
        fill={C.grass} stroke={C.grassDk} strokeWidth="1.2" />
      {/* Second richer grass layer */}
      <path
        d={`M 0,${y-4} ` + Array.from({ length: 55 }, (_, i) => i * 26 + 10).map((gx, i) => {
          const peak = y - 4 - (i%2===0 ? 8 : 4);
          return `Q ${gx+8},${peak} ${gx+13},${y-4} Q ${gx+18},${peak} ${gx+26},${y-4}`;
        }).join(" ")}
        fill={C.mdGreen} stroke="none" opacity={0.75} />
    </g>
  );
}

// ─── Scene ───────────────────────────────────────────────────────────────────

const W = 1440, H = 900;
const GY = 758;   // ground line (plants root here)
const WY = 340;   // brick wall top
const WH = 72;    // brick wall height

export default function GardenScene() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} xmlns="http://www.w3.org/2000/svg"
         className="w-full h-full" aria-hidden preserveAspectRatio="xMidYMid slice">

      {/* ── Sky gradient + sun glow ── */}
      <defs>
        <linearGradient id="gSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#9ec8e0" />
          <stop offset="52%"  stopColor="#bce0c8" />
          <stop offset="100%" stopColor="#a8c860" />
        </linearGradient>
        <radialGradient id="gSun" cx="14%" cy="12%">
          <stop offset="0%"   stopColor="rgba(255,245,160,0.7)" />
          <stop offset="100%" stopColor="rgba(255,245,160,0)"   />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill="url(#gSky)" />
      <rect width={W} height={H} fill="url(#gSun)" />

      {/* ══════════════════════════════════════
          BACKGROUND TREE CANOPIES  (upper corners)
          These frame the sky opening where text lives.
      ══════════════════════════════════════ */}
      {/* Far-left dark mass */}
      <TreeCanopy x={70}   y={WY+10} w={260} h={360} col={C.dkLeaf}  />
      <TreeCanopy x={195}  y={WY+10} w={200} h={300} col={C.dkGreen} />
      <TreeCanopy x={55}   y={WY+10} w={165} h={250} col={C.mdGreen} />
      {/* Lemons in left canopy */}
      {[[-30,-210],[15,-290],[-62,-255],[22,-320],[-12,-182],[40,-200]].map(([ox,oy],i)=>(
        <ellipse key={i} cx={70+ox} cy={WY+10+oy} rx={11} ry={8} fill="#f0e020" {...sk(1.2)} />
      ))}

      {/* Far-right dark mass */}
      <TreeCanopy x={1370} y={WY+10} w={260} h={360} col={C.dkLeaf}  />
      <TreeCanopy x={1250} y={WY+10} w={200} h={300} col={C.dkGreen} />
      <TreeCanopy x={1385} y={WY+10} w={165} h={250} col={C.mdGreen} />
      {/* Red fruits in right canopy */}
      {[[32,-210],[-15,-290],[62,-255],[-22,-320],[12,-182],[-40,-200]].map(([ox,oy],i)=>(
        <circle key={i} cx={1370+ox} cy={WY+10+oy} r={9} fill={C.tomatoRed} {...sk(1.2)} />
      ))}

      {/* Mid-canopy top of wall, partial */}
      <TreeCanopy x={320}  y={WY+WH} w={130} h={160} col={C.dkGreen} />
      <TreeCanopy x={1120} y={WY+WH} w={130} h={160} col={C.dkGreen} />

      {/* ══════════════════════════════════════
          BRICK WALL + GROUND
      ══════════════════════════════════════ */}
      <BrickWall y={WY} H={WH} />
      <Ground y={GY} />

      {/* Garden soil bed along base of wall */}
      <path
        d={`M 0,${WY+WH} Q 220,${WY+WH+14} 440,${WY+WH+6} Q 660,${WY+WH+16} 880,${WY+WH+6} Q 1100,${WY+WH+16} 1320,${WY+WH+8} Q 1400,${WY+WH+5} ${W},${WY+WH+10} L ${W},${WY+WH+44} L 0,${WY+WH+44} Z`}
        fill={C.soilDk} stroke="none" />

      {/* ══════════════════════════════════════
          CLIMBING PLANTS ON WALL
          Bougainvillea, jasmine, and rose canes climbing the wall.
      ══════════════════════════════════════ */}
      <BougVine x={460} y={WY+WH} length={240} color={C.bougPink} />
      <BougVine x={498} y={WY+WH} length={195} color={C.bougMag}  />
      <BougVine x={530} y={WY+WH} length={210} color={C.bougPink} />
      <JasmineVine x={840}  y={WY+WH} length={210} />
      <JasmineVine x={872}  y={WY+WH} length={170} />
      <BougVine x={1190} y={WY+WH} length={230} color={C.bougPink} />
      <BougVine x={1220} y={WY+WH} length={190} color={C.bougMag}  />

      {/* Scattered bougainvillea clusters along wall top */}
      {[350,420,545,590,670,980,1060,1140].map((wx,i)=>(
        <BougCluster key={i} x={wx} y={WY+20} rotate={i*35}
          color={i%2===0 ? C.bougPink : C.bougMag} />
      ))}
      {/* Jasmine stars along wall */}
      {[295,385,640,730,910,1000,1080,1290,1360].map((wx,i)=>(
        <JasmineStar key={i} cx={wx} cy={WY-8} r={10} />
      ))}

      {/* ══════════════════════════════════════
          GARDEN FLOOR — LEFT SECTION
          Lavender bed + rosemary in pots
      ══════════════════════════════════════ */}
      {/* Large lavender clump in tall pot */}
      <Pot x={155} y={GY} w={72} h={62} />
      <LavenderClump x={155} y={GY-58} height={110} count={8} />

      {/* Lavender planted in ground */}
      {[250, 285, 320, 355, 390].map((lx,i)=>(
        <LavenderClump key={i} x={lx} y={GY} height={92+i*7} count={4} />
      ))}

      {/* Rosemary bush */}
      <Rosemary x={435} y={GY} w={80} h={92} />

      {/* Small rosemary pot */}
      <Pot x={410} y={GY} w={48} h={42} />
      <Rosemary x={410} y={GY-40} w={52} h={64} />

      {/* ══════════════════════════════════════
          CENTER-LEFT: Rose bushes
      ══════════════════════════════════════ */}
      <Rose x={590} y={GY}     height={148} color={C.roseRed}  size={24} lean={-14} />
      <Rose x={622} y={GY}     height={118} color={C.roseRed}  size={20} lean={12}  />
      <Rose x={605} y={GY}     height={168} color={C.rosePink} size={22} lean={-4}  />
      <Rose x={648} y={GY}     height={130} color={C.rosePink} size={21} lean={18}  />

      {/* Rose in big pot */}
      <Pot x={695} y={GY} w={84} h={70} />
      <Rose x={682} y={GY-66} height={115} color={C.rosePink} size={22} lean={6}   />
      <Rose x={710} y={GY-66} height={88}  color={C.roseRed}  size={18} lean={-6}  />

      {/* ══════════════════════════════════════
          CENTER: Bird bath (focal feature) + poppies
      ══════════════════════════════════════ */}
      <BirdBath x={790} y={GY-5} h={148} />

      {/* Poppies flanking the bird bath */}
      <Poppy x={738} y={GY}    height={158} color={C.poppyRed} />
      <Poppy x={758} y={GY}    height={138} color={C.poppyOrg} />
      <Poppy x={838} y={GY}    height={152} color={C.poppyRed} />
      <Poppy x={860} y={GY}    height={130} color={C.poppyOrg} />

      {/* Small pot cluster near bird bath */}
      <Pot x={906} y={GY} w={45} h={38} />
      <LavenderClump x={906} y={GY-36} height={65} count={3} />

      {/* ══════════════════════════════════════
          CENTER-RIGHT: Tomato vine + pot cluster
      ══════════════════════════════════════ */}
      <TomatoVine x={960} y={GY} height={172} />

      <Pot x={1020} y={GY} w={50} h={44} />
      <Pot x={1072} y={GY} w={68} h={58} />
      <Pot x={1136} y={GY} w={54} h={46} />
      {/* Plants in pots */}
      <Rosemary   x={1020} y={GY-42} w={52} h={62} />
      <LavenderClump x={1072} y={GY-54} height={82} count={4} />
      <Rose       x={1136} y={GY-44} height={82} color={C.rosePink} size={16} lean={0} />

      {/* ══════════════════════════════════════
          RIGHT: More roses + bougainvillea + poppies
      ══════════════════════════════════════ */}
      <Rose x={1240} y={GY}    height={138} color={C.roseRed}  size={23} lean={14}  />
      <Rose x={1272} y={GY}    height={112} color={C.rosePink} size={20} lean={-10} />
      <Rose x={1258} y={GY}    height={155} color={C.roseRed}  size={22} lean={4}   />
      <Poppy x={1308} y={GY}   height={148} color={C.poppyOrg} />
      <Poppy x={1328} y={GY}   height={125} color={C.poppyRed} />

      {/* Large pot with tall rose, far right */}
      <Pot x={1392} y={GY} w={92} h={78} />
      <Rose x={1375} y={GY-74} height={125} color={C.roseRed}  size={24} lean={-8} />
      <Rose x={1410} y={GY-74} height={98}  color={C.rosePink} size={19} lean={8}  />

      {/* ══════════════════════════════════════
          FOREGROUND GRASS TUFTS
      ══════════════════════════════════════ */}
      {[95,142,195,510,558,875,920,1175,1210,1340].map((gx,i)=>(
        <g key={i}>
          <path d={`M ${gx},${GY} Q ${gx-5},${GY-20} ${gx-9},${GY-34}`}
                stroke={C.ltGreen} strokeWidth="1.8" fill="none" strokeLinecap="round"/>
          <path d={`M ${gx+6},${GY} Q ${gx+4},${GY-16} ${gx+3},${GY-27}`}
                stroke={C.mdGreen} strokeWidth="1.8" fill="none" strokeLinecap="round"/>
          <path d={`M ${gx+14},${GY} Q ${gx+17},${GY-18} ${gx+22},${GY-32}`}
                stroke={C.ltGreen} strokeWidth="1.8" fill="none" strokeLinecap="round"/>
        </g>
      ))}

      {/* ══════════════════════════════════════
          BUTTERFLIES
      ══════════════════════════════════════ */}
      {[[552,375],[872,352],[1048,385]].map(([bx,by],i)=>(
        <g key={i} transform={`translate(${bx},${by})`}>
          <path d="M 0,0 Q -15,-12 -8,-21 Q -2,-14 0,0" fill="#f0d060" {...sk(1)} />
          <path d="M 0,0 Q  15,-12  8,-21 Q  2,-14 0,0" fill="#f0d060" {...sk(1)} />
          <path d="M 0,0 Q -10, 8  -6,16 Q -1,10 0,0" fill="#e0b840" {...sk(1)} />
          <path d="M 0,0 Q  10, 8   6,16 Q  1,10 0,0" fill="#e0b840" {...sk(1)} />
          <line x1="0" y1="-4" x2="-6" y2="-16" stroke="#555" strokeWidth="1"/>
          <line x1="0" y1="-4" x2=" 6" y2="-16" stroke="#555" strokeWidth="1"/>
        </g>
      ))}

      {/* Fallen petals on ground */}
      {[[390,GY+14],[724,GY+10],[970,GY+15],[1158,GY+11]].map(([px,py],i)=>(
        <circle key={i} cx={px} cy={py} r={5}
                fill={i%2===0 ? C.bougPink : "#f0a0b0"} {...sk(0.8)} opacity={0.8} />
      ))}
    </svg>
  );
}
