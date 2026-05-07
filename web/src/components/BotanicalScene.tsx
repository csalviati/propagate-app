"use client";

/**
 * BotanicalScene: an animated SVG garden illustration for the hero section.
 *
 * Inspired by the hand-drawn, densely-layered illustration style of the
 * NYT T Magazine gardening animation — thick ink outlines, flat colour fills,
 * a variety of plant species, and a staggered "growing in" reveal on page load
 * followed by continuous gentle swaying.
 *
 * Coordinate space: viewBox "0 0 1440 310"
 * Plants are rooted at y ≈ 290 (the ground line) and grow upward.
 */

import { motion } from "framer-motion";

// ─── Colour palette ───────────────────────────────────────────────────────────

const C = {
  dkGreen:     "#1e4a2a",
  mdGreen:     "#2d6e3f",
  ltGreen:     "#5aaa6a",
  sageGreen:   "#78a86c",
  mossGreen:   "#4a6838",
  darkMoss:    "#303f22",
  burgundy:    "#7a2538",
  wine:        "#5a1828",
  wisteria:    "#a88cc8",
  ltWisteria:  "#c4b0e0",
  rose:        "#d47888",
  ltRose:      "#f0a8b0",
  yellow:      "#d4b430",
  slate:       "#487888",
  dkSlate:     "#2c5060",
  periwinkle:  "#7888c8",
  ltPeriwinkle:"#a8b4e0",
  bark:        "#7a5032",
  dkBark:      "#503418",
  ground:      "#b8cc68",
  groundDark:  "#8a9e48",
};

// ─── SVG attribute helpers ────────────────────────────────────────────────────

/** Shared stroke attrs to give every shape the hand-drawn outline look. */
function st(w: number) {
  return {
    stroke: "#111" as const,
    strokeWidth: String(w),
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
}

// ─── Animation wrapper ────────────────────────────────────────────────────────

/**
 * Wraps SVG children so they:
 *  1. Grow upward from their bottom edge on mount (scaleY 0 → 1).
 *  2. Sway gently thereafter on an infinite loop.
 */
function Plant({
  children,
  delay = 0,
  sway = 1.5,
  swayDur = 5,
  sd = 0,
}: {
  children: React.ReactNode;
  delay?: number;
  /** Max rotation degrees for the sway. */
  sway?: number;
  /** Duration of one sway cycle in seconds. */
  swayDur?: number;
  /** Delay before sway starts. */
  sd?: number;
}) {
  return (
    <motion.g
      initial={{ scaleY: 0, opacity: 0 }}
      animate={{ scaleY: 1, opacity: 1 }}
      transition={{
        scaleY: { duration: 1.1, delay, ease: [0.34, 1.1, 0.64, 1] },
        opacity: { duration: 0.25, delay },
      }}
      style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }}
    >
      <motion.g
        animate={{ rotate: [0, sway, -sway * 0.55, sway * 0.25, 0] }}
        transition={{
          duration: swayDur,
          delay: sd,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }}
      >
        {children}
      </motion.g>
    </motion.g>
  );
}

// ─── Scene ────────────────────────────────────────────────────────────────────

export default function BotanicalScene() {
  return (
    <svg
      viewBox="0 0 1440 310"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto block"
      aria-hidden
      preserveAspectRatio="xMidYMax slice"
    >
      {/* ── Ground strip ── */}
      <rect x="0" y="286" width="1440" height="24" fill={C.ground} {...st(1.5)} />
      <rect x="0" y="292" width="1440" height="18" fill={C.groundDark} stroke="none" />

      {/* ══════════════════════════════════════════════════
          FAR LEFT: Tall conifer + foreground grass
      ══════════════════════════════════════════════════ */}
      <Plant delay={0.05} sway={0.8} swayDur={8} sd={0}>
        {/* Layered triangular conifer */}
        <polygon
          points="55,286 80,222 60,228 88,162 65,168 92,100 120,168 97,162 124,228 104,222 130,286"
          fill={C.dkGreen} {...st(2)} />
        <polygon
          points="70,286 88,240 72,244 94,195 78,200 96,158 115,200 99,195 120,244 104,240 122,286"
          fill={C.mdGreen} stroke="none" />
        {/* Grass blades */}
        <path d="M 10,286 Q 4,258 0,225" fill="none" stroke={C.sageGreen} strokeWidth="2.2" strokeLinecap="round" />
        <path d="M 16,286 Q 18,260 20,225" fill="none" stroke={C.mdGreen} strokeWidth="2" strokeLinecap="round" />
        <path d="M 22,286 Q 28,262 34,228" fill="none" stroke={C.ltGreen} strokeWidth="2" strokeLinecap="round" />
        <path d="M 30,286 Q 38,264 44,232" fill="none" stroke={C.sageGreen} strokeWidth="1.8" strokeLinecap="round" />
        <path d="M 140,286 Q 144,268 148,248" fill="none" stroke={C.mdGreen} strokeWidth="1.8" strokeLinecap="round" />
        <path d="M 148,286 Q 155,270 162,250" fill="none" stroke={C.ltGreen} strokeWidth="1.8" strokeLinecap="round" />
      </Plant>

      {/* ══════════════════════════════════════════════════
          LEFT: Large burgundy / wine-dark plant
          Mirrors the dark-leaved shrubs in the illustration
      ══════════════════════════════════════════════════ */}
      <Plant delay={0.18} sway={2.8} swayDur={6} sd={0.4}>
        {/* Main dark form */}
        <path
          d="M 192,286 Q 172,258 150,230 Q 132,204 138,178 Q 145,150 164,154
             Q 180,158 186,186 Q 194,162 210,146 Q 228,128 240,150
             Q 248,172 235,200 Q 220,226 205,255 Q 196,270 192,286 Z"
          fill={C.burgundy} {...st(2.2)} />
        {/* Inner shadow layer for depth */}
        <path
          d="M 188,286 Q 170,262 152,240 Q 140,220 150,208 Q 162,196 175,215
             Q 182,200 194,188 Q 208,172 218,190 Q 224,210 210,234 Q 196,258 190,278 Z"
          fill={C.wine} stroke="none" />
        {/* A few lighter leaf highlights */}
        <ellipse cx="185" cy="190" rx="10" ry="16" transform="rotate(-15,185,190)"
                 fill={C.burgundy} {...st(1.2)} opacity="0.7" />
        <ellipse cx="208" cy="172" rx="9" ry="14" transform="rotate(20,208,172)"
                 fill={C.wine} stroke="none" opacity="0.8" />
      </Plant>

      {/* ══════════════════════════════════════════════════
          LEFT-CENTER: Green shrub cluster
      ══════════════════════════════════════════════════ */}
      <Plant delay={0.28} sway={1.6} swayDur={5.5} sd={0.7}>
        <ellipse cx="295" cy="240" rx="58" ry="52" fill={C.mdGreen} {...st(2)} />
        <ellipse cx="338" cy="248" rx="42" ry="44" fill={C.sageGreen} {...st(2)} />
        <ellipse cx="260" cy="258" rx="30" ry="32" fill={C.ltGreen} {...st(1.8)} />
        {/* Trunk stubs */}
        <path d="M 292,286 L 294,264" stroke={C.bark} strokeWidth="5" strokeLinecap="round" />
        <path d="M 336,286 L 338,262" stroke={C.bark} strokeWidth="4" strokeLinecap="round" />
        {/* Leaf highlights */}
        <ellipse cx="285" cy="220" rx="22" ry="18" fill={C.ltGreen} stroke="none" opacity="0.45" />
        <ellipse cx="332" cy="228" rx="18" ry="16" fill={C.ltGreen} stroke="none" opacity="0.4" />
      </Plant>

      {/* ══════════════════════════════════════════════════
          HOLLYHOCK / FLOWER STEMS  (left-center)
      ══════════════════════════════════════════════════ */}
      <Plant delay={0.38} sway={3.2} swayDur={4.5} sd={0.9}>
        {/* Stem A */}
        <path d="M 385,286 Q 383,256 384,224 Q 385,196 384,162"
              stroke={C.mdGreen} strokeWidth="3" fill="none" strokeLinecap="round" />
        <circle cx="384" cy="156" r="14" fill={C.rose} {...st(1.8)} />
        <circle cx="383" cy="192" r="11" fill={C.ltRose} {...st(1.5)} />
        <circle cx="384" cy="226" r="9"  fill={C.rose} {...st(1.5)} />
        {/* Leaves on stem A */}
        <ellipse cx="395" cy="238" rx="11" ry="19" transform="rotate(28,395,238)"
                 fill={C.sageGreen} {...st(1.2)} />
        <ellipse cx="373" cy="205" rx="10" ry="17" transform="rotate(-22,373,205)"
                 fill={C.mdGreen} {...st(1.2)} />
      </Plant>
      <Plant delay={0.42} sway={2.8} swayDur={5} sd={1.3}>
        {/* Stem B */}
        <path d="M 415,286 Q 413,258 415,230 Q 417,204 414,172"
              stroke={C.sageGreen} strokeWidth="2.8" fill="none" strokeLinecap="round" />
        <circle cx="414" cy="166" r="12" fill={C.ltRose} {...st(1.6)} />
        <circle cx="416" cy="200" r="10" fill={C.rose} {...st(1.5)} />
        <circle cx="413" cy="234" r="9"  fill={C.ltRose} {...st(1.4)} />
      </Plant>

      {/* ══════════════════════════════════════════════════
          CENTER: The Wisteria Tree  — focal element
      ══════════════════════════════════════════════════ */}
      <Plant delay={0.12} sway={0.6} swayDur={9} sd={0}>
        {/* Trunk */}
        <rect x="540" y="162" width="24" height="124" rx="9"
              fill={C.bark} {...st(2.2)} />
        {/* Root flare */}
        <path d="M 537,286 Q 530,278 524,286" fill={C.dkBark} stroke="none" />
        <path d="M 567,286 Q 574,278 580,286" fill={C.dkBark} stroke="none" />
        {/* Main canopy */}
        <ellipse cx="553" cy="120" rx="95" ry="80" fill={C.dkGreen} {...st(2.8)} />
        {/* Sub-canopy masses for depth */}
        <ellipse cx="510" cy="138" rx="58" ry="50" fill={C.mdGreen} {...st(2)} />
        <ellipse cx="598" cy="134" rx="52" ry="46" fill={C.mdGreen} {...st(2)} />
        {/* Light highlight on top */}
        <ellipse cx="550" cy="98"  rx="56" ry="42" fill={C.sageGreen} {...st(1.5)} />
        <ellipse cx="548" cy="85"  rx="30" ry="24" fill={C.ltGreen} stroke="none" opacity="0.45" />
        {/* Ivy-vine tendrils */}
        <path d="M 505,162 Q 498,148 490,138 Q 482,128 476,118"
              fill="none" stroke={C.mdGreen} strokeWidth="2" strokeLinecap="round" />
        <ellipse cx="480" cy="132" rx="9" ry="14" transform="rotate(-20,480,132)"
                 fill={C.sageGreen} {...st(1.2)} />
        <path d="M 600,158 Q 608,146 618,135 Q 625,126 632,118"
              fill="none" stroke={C.mdGreen} strokeWidth="2" strokeLinecap="round" />
        <ellipse cx="625" cy="130" rx="8" ry="12" transform="rotate(18,625,130)"
                 fill={C.sageGreen} {...st(1.2)} />
      </Plant>

      {/* Wisteria hanging clusters — separate layer so they sway independently */}
      <Plant delay={0.55} sway={2.2} swayDur={5.5} sd={0.6}>
        <ellipse cx="488" cy="182" rx="11" ry="24" fill={C.wisteria}    {...st(1.5)} />
        <ellipse cx="508" cy="196" rx="10" ry="20" fill={C.ltWisteria}  {...st(1.4)} />
        <ellipse cx="527" cy="186" rx="9"  ry="22" fill={C.wisteria}    {...st(1.4)} />
        <ellipse cx="544" cy="198" rx="8"  ry="18" fill={C.ltWisteria}  {...st(1.3)} />
        <ellipse cx="562" cy="188" rx="9"  ry="22" fill={C.wisteria}    {...st(1.4)} />
        <ellipse cx="580" cy="196" rx="10" ry="20" fill={C.ltWisteria}  {...st(1.4)} />
        <ellipse cx="598" cy="184" rx="11" ry="24" fill={C.wisteria}    {...st(1.5)} />
        {/* Stray smaller clusters */}
        <ellipse cx="516" cy="210" rx="7" ry="13" fill={C.ltWisteria} {...st(1.2)} />
        <ellipse cx="570" cy="208" rx="7" ry="14" fill={C.wisteria}   {...st(1.2)} />
      </Plant>

      {/* ══════════════════════════════════════════════════
          CENTER: Vine-climbing plant on brick wall  
      ══════════════════════════════════════════════════ */}
      <Plant delay={0.62} sway={1.2} swayDur={7} sd={1.1}>
        <path d="M 470,286 Q 475,258 482,234 Q 490,210 488,186 Q 486,165 490,148"
              fill="none" stroke={C.mdGreen} strokeWidth="2.2" strokeLinecap="round" />
        <ellipse cx="484" cy="238" rx="9"  ry="14" transform="rotate(-18,484,238)"
                 fill={C.sageGreen} {...st(1.2)} />
        <ellipse cx="490" cy="210" rx="8"  ry="12" transform="rotate(15,490,210)"
                 fill={C.ltGreen} {...st(1.2)} />
        <ellipse cx="489" cy="182" rx="9"  ry="13" transform="rotate(-10,489,182)"
                 fill={C.sageGreen} {...st(1.2)} />
      </Plant>

      {/* ══════════════════════════════════════════════════
          CENTER-RIGHT: Blue-green reeds / tall grasses
      ══════════════════════════════════════════════════ */}
      <Plant delay={0.48} sway={3.8} swayDur={4} sd={1.1}>
        <path d="M 650,286 Q 642,252 638,214 Q 634,180 641,150"
              fill="none" stroke={C.dkSlate} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 662,286 Q 660,254 661,220 Q 663,190 659,158"
              fill="none" stroke={C.slate}   strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 672,286 Q 675,256 678,218 Q 681,184 676,156"
              fill="none" stroke={C.dkSlate} strokeWidth="2.2" strokeLinecap="round" />
        <path d="M 682,286 Q 687,258 690,228 Q 692,200 688,172"
              fill="none" stroke={C.slate}   strokeWidth="2"   strokeLinecap="round" />
        {/* Seed heads */}
        <ellipse cx="641" cy="144" rx="5" ry="12" fill={C.dkSlate} {...st(1.2)} />
        <ellipse cx="659" cy="152" rx="4" ry="11" fill={C.slate}   {...st(1.2)} />
        <ellipse cx="676" cy="148" rx="4" ry="10" fill={C.dkSlate} {...st(1.2)} />
        <ellipse cx="688" cy="165" rx="4" ry="10" fill={C.slate}   {...st(1.2)} />
      </Plant>

      {/* ══════════════════════════════════════════════════
          CENTER-RIGHT: Blue hydrangea bush
      ══════════════════════════════════════════════════ */}
      <Plant delay={0.52} sway={1.8} swayDur={6.5} sd={0.8}>
        {/* Bush body */}
        <ellipse cx="770" cy="248" rx="56" ry="42" fill={C.mdGreen}  {...st(2)} />
        <ellipse cx="742" cy="256" rx="32" ry="30" fill={C.dkGreen}  {...st(1.8)} />
        {/* Hydrangea flower heads — clusters of circles */}
        <circle cx="742" cy="222" r="17" fill={C.ltPeriwinkle} {...st(1.6)} />
        <circle cx="763" cy="212" r="15" fill={C.periwinkle}   {...st(1.6)} />
        <circle cx="784" cy="218" r="16" fill={C.ltPeriwinkle} {...st(1.6)} />
        <circle cx="752" cy="232" r="12" fill={C.periwinkle}   {...st(1.4)} />
        <circle cx="773" cy="228" r="12" fill={C.ltPeriwinkle} {...st(1.4)} />
        {/* Mini dot highlights */}
        <circle cx="742" cy="222" r="6" fill="#d0cce8" stroke="none" opacity="0.7" />
        <circle cx="763" cy="212" r="5" fill="#d0cce8" stroke="none" opacity="0.7" />
        <circle cx="784" cy="218" r="5" fill="#d0cce8" stroke="none" opacity="0.7" />
      </Plant>

      {/* ══════════════════════════════════════════════════
          RIGHT: Large rounded tree mass
      ══════════════════════════════════════════════════ */}
      <Plant delay={0.22} sway={0.9} swayDur={7.5} sd={0.3}>
        <rect x="876" y="182" width="22" height="104" rx="8" fill={C.bark} {...st(2)} />
        {/* Canopy layers */}
        <ellipse cx="888" cy="146" rx="85" ry="74" fill={C.dkGreen}  {...st(2.8)} />
        <ellipse cx="850" cy="164" rx="55" ry="48" fill={C.mdGreen}  {...st(2)} />
        <ellipse cx="926" cy="160" rx="50" ry="44" fill={C.mdGreen}  {...st(2)} />
        <ellipse cx="886" cy="124" rx="52" ry="40" fill={C.sageGreen} {...st(1.5)} />
        <ellipse cx="884" cy="108" rx="28" ry="22" fill={C.ltGreen} stroke="none" opacity="0.4" />
      </Plant>

      {/* ══════════════════════════════════════════════════
          RIGHT: Yellow flowering stems
      ══════════════════════════════════════════════════ */}
      <Plant delay={0.58} sway={3.2} swayDur={4.8} sd={1.4}>
        <path d="M 970,286 Q 968,260 970,232 Q 972,208 970,180"
              stroke={C.mdGreen} strokeWidth="2.8" fill="none" strokeLinecap="round" />
        <path d="M 988,286 Q 991,262 993,236 Q 995,212 991,188"
              stroke={C.sageGreen} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {/* Flowers */}
        <circle cx="970" cy="174" r="13" fill={C.yellow}     {...st(1.8)} />
        <circle cx="992" cy="182" r="11" fill={C.yellow}     {...st(1.6)} />
        <circle cx="970" cy="174" r="5"  fill="#f0d460" stroke="none" />
        <circle cx="992" cy="182" r="4"  fill="#f0d460" stroke="none" />
        {/* Leaf */}
        <ellipse cx="978" cy="218" rx="10" ry="17" transform="rotate(22,978,218)"
                 fill={C.sageGreen} {...st(1.2)} />
      </Plant>

      {/* ══════════════════════════════════════════════════
          FAR RIGHT: Dark slate-blue / purple plant
          (represents dark-toned foliage on right of illustration)
      ══════════════════════════════════════════════════ */}
      <Plant delay={0.32} sway={2.4} swayDur={6.5} sd={0.6}>
        <path
          d="M 1090,286 Q 1072,260 1052,234 Q 1036,210 1044,185
             Q 1052,160 1070,164 Q 1085,168 1088,196
             Q 1096,170 1112,154 Q 1130,138 1142,158
             Q 1150,178 1136,206 Q 1120,232 1104,258
             Q 1096,272 1090,286 Z"
          fill={C.dkSlate} {...st(2.2)} />
        {/* Inner shadow */}
        <path
          d="M 1086,286 Q 1070,264 1055,244 Q 1046,226 1056,215
             Q 1068,204 1080,222 Q 1088,208 1100,196
             Q 1114,182 1122,200 Q 1128,220 1114,244
             Q 1100,264 1090,280 Z"
          fill={C.dkSlate} stroke="none" opacity="0.55" />
      </Plant>

      {/* ══════════════════════════════════════════════════
          FAR RIGHT: Large rounded tree + grass
      ══════════════════════════════════════════════════ */}
      <Plant delay={0.18} sway={1} swayDur={7.2} sd={0.35}>
        <rect x="1278" y="196" width="20" height="90" rx="7" fill={C.dkBark} {...st(2)} />
        <ellipse cx="1288" cy="160" rx="78" ry="68" fill={C.dkGreen}  {...st(2.8)} />
        <ellipse cx="1252" cy="178" rx="50" ry="44" fill={C.mdGreen}  {...st(2)} />
        <ellipse cx="1324" cy="174" rx="46" ry="40" fill={C.mdGreen}  {...st(2)} />
        <ellipse cx="1286" cy="138" rx="46" ry="36" fill={C.sageGreen} {...st(1.5)} />
        {/* Far-right grass blades */}
        <path d="M 1370,286 Q 1363,260 1358,232" fill="none" stroke={C.sageGreen} strokeWidth="2" strokeLinecap="round" />
        <path d="M 1380,286 Q 1382,262 1386,234" fill="none" stroke={C.ltGreen}   strokeWidth="2" strokeLinecap="round" />
        <path d="M 1392,286 Q 1398,264 1404,236" fill="none" stroke={C.mdGreen}   strokeWidth="2" strokeLinecap="round" />
        <path d="M 1404,286 Q 1412,266 1418,240" fill="none" stroke={C.sageGreen} strokeWidth="1.8" strokeLinecap="round" />
        <path d="M 1430,286 Q 1435,268 1440,244" fill="none" stroke={C.ltGreen}   strokeWidth="1.8" strokeLinecap="round" />
      </Plant>

      {/* ══════════════════════════════════════════════════
          FOREGROUND ACCENTS: small detail plants
          These animate last and are at the very front
      ══════════════════════════════════════════════════ */}
      {/* Small pink flower, left-center foreground */}
      <Plant delay={0.68} sway={4} swayDur={3.5} sd={2.0}>
        <path d="M 455,286 Q 453,272 455,256 Q 457,242 454,226"
              stroke={C.mdGreen} strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <circle cx="454" cy="220" r="10" fill={C.ltRose} {...st(1.5)} />
        <circle cx="454" cy="220" r="4"  fill={C.rose}   stroke="none" />
      </Plant>

      {/* Small blue flowers, right-center foreground */}
      <Plant delay={0.72} sway={3.5} swayDur={4} sd={2.4}>
        <path d="M 1030,286 Q 1028,272 1030,256 Q 1032,242 1028,228"
              stroke={C.sageGreen} strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <circle cx="1028" cy="222" r="9"  fill={C.periwinkle}   {...st(1.4)} />
        <path d="M 1048,286 Q 1051,274 1053,260 Q 1055,247 1051,235"
              stroke={C.mdGreen} strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <circle cx="1051" cy="228" r="8" fill={C.ltPeriwinkle} {...st(1.3)} />
      </Plant>

      {/* Tiny scattered daisies, center foreground */}
      <Plant delay={0.75} sway={5} swayDur={3} sd={2.8}>
        <path d="M 720,286 Q 718,276 720,264 Q 722,254 720,242"
              stroke={C.ltGreen} strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <circle cx="720" cy="236" r="7" fill="#f5e870" {...st(1.3)} />
        <circle cx="720" cy="236" r="3" fill="#e8b830" stroke="none" />
      </Plant>

      {/* Small rose bud, right foreground */}
      <Plant delay={0.78} sway={4.5} swayDur={3.8} sd={3.0}>
        <path d="M 1160,286 Q 1158,274 1160,260 Q 1162,248 1159,235"
              stroke={C.mdGreen} strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <circle cx="1159" cy="228" r="9" fill={C.rose}   {...st(1.5)} />
        <circle cx="1159" cy="228" r="4" fill={C.ltRose} stroke="none" />
      </Plant>
    </svg>
  );
}
