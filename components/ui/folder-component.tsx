"use client";

import React, { useId, useMemo, useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

type RGB = { r: number; g: number; b: number };

function parseHex(h: string): RGB | null {
  let s = h.startsWith("#") ? h.slice(1) : h;
  if (s.length === 3 || s.length === 4) {
    s = [...s.slice(0, 3)].map((c) => c + c).join("");
  } else if (s.length === 8) {
    s = s.slice(0, 6);
  }
  if (s.length !== 6 || /[^0-9a-f]/i.test(s)) return null;
  return {
    r: parseInt(s.slice(0, 2), 16),
    g: parseInt(s.slice(2, 4), 16),
    b: parseInt(s.slice(4, 6), 16),
  };
}

const NAMED: Record<string, RGB> = Object.fromEntries(
  "black:000000,silver:c0c0c0,gray:808080,grey:808080,white:ffffff,maroon:800000,red:ff0000,purple:800080,fuchsia:ff00ff,magenta:ff00ff,green:008000,lime:00ff00,olive:808000,yellow:ffff00,navy:000080,blue:0000ff,teal:008080,aqua:00ffff,cyan:00ffff,orange:ffa500,aliceblue:f0f8ff,antiquewhite:faebd7,aquamarine:7fffd4,azure:f0ffff,beige:f5f5dc,bisque:ffe4c4,blanchedalmond:ffebcd,blueviolet:8a2be2,brown:a52a2a,burlywood:deb887,cadetblue:5f9ea0,chartreuse:7fff00,chocolate:d2691e,coral:ff7f50,cornflowerblue:6495ed,cornsilk:fff8dc,crimson:dc143c,darkblue:00008b,darkcyan:008b8b,darkgoldenrod:b8860b,darkgray:a9a9a9,darkgrey:a9a9a9,darkgreen:006400,darkkhaki:bdb76b,darkmagenta:8b008b,darkolivegreen:556b2f,darkorange:ff8c00,darkorchid:9932cc,darkred:8b0000,darksalmon:e9967a,darkseagreen:8fbc8f,darkslateblue:483d8b,darkslategray:2f4f4f,darkslategrey:2f4f4f,darkturquoise:00ced1,darkviolet:9400d3,deeppink:ff1493,deepskyblue:00bfff,dimgray:696969,dimgrey:696969,dodgerblue:1e90ff,firebrick:b22222,floralwhite:fffaf0,forestgreen:228b22,gainsboro:dcdcdc,ghostwhite:f8f8ff,gold:ffd700,goldenrod:daa520,greenyellow:adff2f,honeydew:f0fff0,hotpink:ff69b4,indianred:cd5c5c,indigo:4b0082,ivory:fffff0,khaki:f0e68c,lavender:e6e6fa,lavenderblush:fff0f5,lawngreen:7cfc00,lemonchiffon:fffacd,lightblue:add8e6,lightcoral:f08080,lightcyan:e0ffff,lightgoldenrodyellow:fafad2,lightgray:d3d3d3,lightgrey:d3d3d3,lightgreen:90ee90,lightpink:ffb6c1,lightsalmon:ffa07a,lightseagreen:20b2aa,lightskyblue:87cefa,lightslategray:778899,lightslategrey:778899,lightsteelblue:b0c4de,lightyellow:ffffe0,limegreen:32cd32,linen:faf0e6,mediumaquamarine:66cdaa,mediumblue:0000cd,mediumorchid:ba55d3,mediumpurple:9370db,mediumseagreen:3cb371,mediumslateblue:7b68ee,mediumspringgreen:00fa9a,mediumturquoise:48d1cc,mediumvioletred:c71585,midnightblue:191970,mintcream:f5fffa,mistyrose:ffe4e1,moccasin:ffe4b5,navajowhite:ffdead,oldlace:fdf5e6,olivedrab:6b8e23,orangered:ff4500,orchid:da70d6,palegoldenrod:eee8aa,palegreen:98fb98,paleturquoise:afeeee,palevioletred:db7093,papayawhip:ffefd5,peachpuff:ffdab9,peru:cd853f,pink:ffc0cb,plum:dda0dd,powderblue:b0e0e6,rebeccapurple:663399,rosybrown:bc8f8f,royalblue:4169e1,saddlebrown:8b4513,salmon:fa8072,sandybrown:f4a460,seagreen:2e8b57,seashell:fff5ee,sienna:a0522d,skyblue:87ceeb,slateblue:6a5acd,slategray:708090,slategrey:708090,snow:fffafa,springgreen:00ff7f,steelblue:4682b4,tan:d2b48c,thistle:d8bfd8,tomato:ff6347,turquoise:40e0d0,violet:ee82ee,wheat:f5deb3,whitesmoke:f5f5f5,yellowgreen:9acd32"
    .split(",")
    .map((pair) => {
      const [name, hex] = pair.split(":");
      return [name, parseHex(hex)!];
    }),
);

function channel(v: string, scale = 255) {
  const t = v.trim();
  if (t.endsWith("%")) return Math.round((parseFloat(t) / 100) * scale);
  return Math.round(parseFloat(t));
}

function parseRgbArgs(args: string): RGB | null {
  const parts = args.split(/[\s,/]+/).filter(Boolean);
  if (parts.length < 3) return null;
  const r = channel(parts[0]);
  const g = channel(parts[1]);
  const b = channel(parts[2]);
  if ([r, g, b].some((n) => Number.isNaN(n))) return null;
  return { r, g, b };
}

function hslToRgb(h: number, s: number, l: number): RGB {
  const sat = s / 100;
  const light = l / 100;
  const a = sat * Math.min(light, 1 - light);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return light - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
  };
  return {
    r: Math.round(f(0) * 255),
    g: Math.round(f(8) * 255),
    b: Math.round(f(4) * 255),
  };
}

function parseHslArgs(args: string): RGB | null {
  const parts = args.split(/[\s,/]+/).filter(Boolean);
  if (parts.length < 3) return null;
  const h = parseFloat(parts[0]);
  const s = parseFloat(parts[1]);
  const l = parseFloat(parts[2]);
  if ([h, s, l].some((n) => Number.isNaN(n))) return null;
  return hslToRgb(((h % 360) + 360) % 360, s, l);
}

let probe: CanvasRenderingContext2D | null | undefined;

function parseColor(input: string): RGB {
  const s = input.trim();
  const named = NAMED[s.toLowerCase()];
  if (named) return named;
  const hex = parseHex(s);
  if (hex) return hex;
  const rgb = /^rgba?\(\s*([\s\S]+)\)$/i.exec(s);
  if (rgb) {
    const parsed = parseRgbArgs(rgb[1]);
    if (parsed) return parsed;
  }
  const hsl = /^hsla?\(\s*([\s\S]+)\)$/i.exec(s);
  if (hsl) {
    const parsed = parseHslArgs(hsl[1]);
    if (parsed) return parsed;
  }
  if (typeof document !== "undefined") {
    if (probe === undefined) {
      probe = document.createElement("canvas").getContext("2d");
    }
    if (probe) {
      probe.fillStyle = "#000000";
      probe.fillStyle = s;
      const v = String(probe.fillStyle);
      const fromHex = v.startsWith("#") ? parseHex(v) : null;
      if (fromHex) return fromHex;
      const m = v.match(/\d+/g);
      if (m && m.length >= 3) return { r: +m[0], g: +m[1], b: +m[2] };
    }
  }
  return { r: 0, g: 0, b: 0 };
}

function mix(a: RGB, t: number, b: RGB): RGB {
  return {
    r: Math.round(a.r + (b.r - a.r) * t),
    g: Math.round(a.g + (b.g - a.g) * t),
    b: Math.round(a.b + (b.b - a.b) * t),
  };
}

function toHex({ r, g, b }: RGB) {
  return `#${[r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("")}`;
}

function feMatrix({ r, g, b }: RGB, a: number) {
  return `0 0 0 0 ${r / 255} 0 0 0 0 ${g / 255} 0 0 0 0 ${b / 255} 0 0 0 ${a} 0`;
}

const WHITE: RGB = { r: 255, g: 255, b: 255 };
const BLACK: RGB = { r: 0, g: 0, b: 0 };

function themeFromColor(color: string) {
  const rgb = parseColor(color);
  const lum = (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255;
  const light = lum > 0.82;
  const flapFill =
    lum < 0.08 ? mix(rgb, 0.16, WHITE) : mix(rgb, light ? 0.04 : 0.18, BLACK);
  const flapStroke = light
    ? mix(rgb, 0.17, { r: 212, g: 212, b: 212 })
    : mix(rgb, lum < 0.08 ? 0.59 : 0.22, WHITE);

  return {
    backFill: color,
    backInsetShadow: light
      ? "inset 0 0 6px 2px rgba(178,178,178,0.25)"
      : `inset 0 0 6px 2px rgba(255,255,255,${lum < 0.08 ? 0.37 : 0.35})`,
    flapFill: toHex(flapFill),
    flapFillOpacity: light ? 0.85 : lum < 0.08 ? 0.25 : 0.45,
    flapStroke: toHex(flapStroke),
    flapInsetColor: light
      ? feMatrix({ r: 153, g: 153, b: 153 }, 0.15)
      : feMatrix(lum < 0.08 ? BLACK : WHITE, lum < 0.08 ? 0.08 : 0.12),
    cardFill: light ? "#262626" : "#F1F1F1",
    cardStroke: light ? "#404040" : "#E0E0E0",
    cardLineFill: light ? "#737373" : "#D4D4D4",
    cardInsetColor: feMatrix(WHITE, light ? 0.15 : 1),
  };
}

const sizeScales = {
  sm: 0.65,
  md: 1,
  lg: 1.35,
} as const;

type FolderComponentProps = Omit<React.ComponentProps<"div">, "color"> & {
  color?: string;
  size?: "sm" | "md" | "lg";
};

type Theme = ReturnType<typeof themeFromColor>;

const BASE_WIDTH = 321;
const BASE_HEIGHT = 270;

const FLAP_PATH =
  "M0 25C0 11.1929 11.1929 0 25 0H136.084C143.044 0 149.689 2.90139 154.42 8.00608L178.08 33.5343C182.811 38.639 189.456 41.5404 196.416 41.5404H296C309.807 41.5404 321 52.7333 321 66.5404V216C321 229.807 309.807 241 296 241H25C11.1929 241 0 229.807 0 216V25Z";

const FolderComponent = ({
  color = "black",
  size = "md",
  className,
  ...props
}: FolderComponentProps) => {
  const theme = useMemo(() => themeFromColor(color), [color]);
  const uid = useId().replace(/:/g, "");
  const scale = sizeScales[size];
  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const flapFilterId = `folder-flap-${uid}`;

  return (
    <div
      data-slot="folder"
      className={cn(
        "relative w-full h-full flex items-center justify-center",
        className,
      )}
      {...props}
    >
      <div
        className="relative cursor-pointer select-none"
        style={{
          width: BASE_WIDTH * scale,
          height: BASE_HEIGHT * scale,
          touchAction: "manipulation",
          WebkitTapHighlightColor: "transparent",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setIsOpen(false);
        }}
        onClick={() => setIsOpen((o) => !o)}
      >
        <div
          className="absolute top-1/2 left-1/2"
          style={{
            width: BASE_WIDTH,
            height: BASE_HEIGHT,
            transform: `translate(-50%, -50%) scale(${scale})`,
            perspective: 800 * scale,
          }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div
              style={{
                width: BASE_WIDTH,
                height: BASE_HEIGHT,
                borderRadius: 25,
                backgroundColor: theme.backFill,
                boxShadow: theme.backInsetShadow,
              }}
            />
          </div>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
            <motion.div
              className="absolute"
              animate={{
                y: isOpen ? -160 : isHovered ? -30 : -10,
                x: isOpen ? 70 : 40,
                rotate: isOpen ? 18 : isHovered ? 14 : 10,
              }}
              transition={{
                type: "spring",
                stiffness: 120,
                damping: 13,
                delay: isOpen ? 0.1 : isHovered ? 0.12 : 0,
              }}
            >
              <Card id={1} uid={uid} theme={theme} />
            </motion.div>
            <motion.div
              className="absolute"
              animate={{
                y: isOpen ? -180 : isHovered ? -35 : -20,
                x: isOpen ? 0 : 3,
                rotate: isOpen ? -3 : isHovered ? -1 : 2,
              }}
              transition={{
                type: "spring",
                stiffness: 120,
                damping: 13,
                delay: isOpen ? 0.05 : isHovered ? 0.06 : 0,
              }}
            >
              <Card id={2} uid={uid} theme={theme} />
            </motion.div>
            <motion.div
              className="absolute"
              animate={{
                y: isOpen ? -170 : isHovered ? -44 : -22,
                x: isOpen ? -65 : -40,
                rotate: isOpen ? -14 : isHovered ? -9 : -5,
              }}
              transition={{
                type: "spring",
                stiffness: 120,
                damping: 13,
                delay: isOpen ? 0 : 0,
              }}
            >
              <Card id={3} uid={uid} theme={theme} />
            </motion.div>
          </div>

          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-4"
            style={{
              transformOrigin: "bottom center",
              transformStyle: "preserve-3d",
              width: 321,
              height: 241,
            }}
            animate={{ rotateX: isOpen ? -55 : isHovered ? -45 : -15 }}
            transition={{ type: "spring", stiffness: 120, damping: 14 }}
          >
            <div
              className="absolute inset-0"
              style={{
                backdropFilter: "blur(6px)",
                WebkitBackdropFilter: "blur(6px)",
                clipPath: `path('${FLAP_PATH}')`,
                WebkitClipPath: `path('${FLAP_PATH}')`,
                transform: "translateZ(0)",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                willChange: "transform",
              }}
            />
            <svg
              className="absolute inset-0"
              width="321"
              height="241"
              viewBox="0 0 321 241"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g filter={`url(#${flapFilterId})`}>
                <path
                  d={FLAP_PATH}
                  fill={theme.flapFill}
                  fillOpacity={theme.flapFillOpacity}
                />
                <path
                  d="M25 0.5H136.084C142.905 0.5 149.417 3.3431 154.054 8.3457L177.713 33.874C182.539 39.0808 189.317 42.04 196.416 42.04H296C309.531 42.04 320.5 53.0092 320.5 66.54V216C320.5 229.531 309.531 240.5 296 240.5H25C11.469 240.5 0.5 229.531 0.5 216V25C0.5 11.469 11.469 0.5 25 0.5Z"
                  stroke={theme.flapStroke}
                />
              </g>
              <defs>
                <filter
                  id={flapFilterId}
                  x="-25.4"
                  y="-25.4"
                  width="371.8"
                  height="291.8"
                  filterUnits="userSpaceOnUse"
                  colorInterpolationFilters="sRGB"
                >
                  <feFlood floodOpacity="0" result="BackgroundImageFix" />
                  <feBlend
                    mode="normal"
                    in="SourceGraphic"
                    in2="BackgroundImageFix"
                    result="shape"
                  />
                  <feColorMatrix
                    in="SourceAlpha"
                    type="matrix"
                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                    result="hardAlpha"
                  />
                  <feOffset />
                  <feGaussianBlur stdDeviation="2.65" />
                  <feComposite
                    in2="hardAlpha"
                    operator="arithmetic"
                    k2="-1"
                    k3="1"
                  />
                  <feColorMatrix type="matrix" values={theme.flapInsetColor} />
                  <feBlend
                    mode="normal"
                    in2="shape"
                    result="effect1_innerShadow_171_13"
                  />
                </filter>
              </defs>
            </svg>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default FolderComponent;

export { FolderComponent as Folder };
export type { FolderComponentProps };

const Card = ({
  id,
  uid,
  theme,
}: {
  id: number;
  uid: string;
  theme: Theme;
}) => {
  const filterId = `folder-card-${uid}-${id}`;
  return (
    <div data-slot="folder-card">
      <svg
        width="164"
        height="214"
        viewBox="0 0 164 214"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g filter={`url(#${filterId})`}>
          <rect
            width="163.078"
            height="213.262"
            rx="20"
            fill={theme.cardFill}
          />
        </g>
        <rect
          x="0.5"
          y="0.5"
          width="162.078"
          height="212.262"
          rx="19.5"
          stroke={theme.cardStroke}
        />
        <rect
          x="14.1193"
          y="31.2091"
          width="134.84"
          height="11.8892"
          rx="5.94459"
          fill={theme.cardLineFill}
        />
        <rect
          width="64.5183"
          height="5.88276"
          rx="2.94138"
          transform="matrix(1 -0.000409158 0.00201956 0.999998 14.8253 60.9939)"
          fill={theme.cardLineFill}
        />
        <rect
          width="64.5183"
          height="5.88276"
          rx="2.94138"
          transform="matrix(1 -0.000461045 0.00179228 0.999998 84.4303 60.9617)"
          fill={theme.cardLineFill}
        />
        <rect
          width="64.5183"
          height="5.88276"
          rx="2.94138"
          transform="matrix(1 -0.000409158 0.00201956 0.999998 14.8253 75.1122)"
          fill={theme.cardLineFill}
        />
        <rect
          width="64.5183"
          height="5.88276"
          rx="2.94138"
          transform="matrix(1 -0.000461045 0.00179228 0.999998 84.4303 75.0801)"
          fill={theme.cardLineFill}
        />
        <rect
          width="64.5183"
          height="5.88276"
          rx="2.94138"
          transform="matrix(1 -0.000409158 0.00201956 0.999998 14.8253 89.2306)"
          fill={theme.cardLineFill}
        />
        <rect
          width="64.5183"
          height="5.88276"
          rx="2.94138"
          transform="matrix(1 -0.000461045 0.00179228 0.999998 84.4303 89.1985)"
          fill={theme.cardLineFill}
        />
        <rect
          width="64.5183"
          height="5.88276"
          rx="2.94138"
          transform="matrix(1 -0.000409158 0.00201956 0.999998 14.8253 103.349)"
          fill={theme.cardLineFill}
        />
        <rect
          width="64.5183"
          height="5.88276"
          rx="2.94138"
          transform="matrix(1 -0.000461045 0.00179228 0.999998 84.4303 103.317)"
          fill={theme.cardLineFill}
        />
        <rect
          width="64.5183"
          height="5.88276"
          rx="2.94138"
          transform="matrix(1 -0.000409158 0.00201956 0.999998 14.8253 117.467)"
          fill={theme.cardLineFill}
        />
        <rect
          width="64.5183"
          height="5.88276"
          rx="2.94138"
          transform="matrix(1 -0.000461045 0.00179228 0.999998 84.4303 117.435)"
          fill={theme.cardLineFill}
        />
        <rect
          width="64.5183"
          height="5.88276"
          rx="2.94138"
          transform="matrix(1 -0.000409158 0.00201956 0.999998 14.8253 131.586)"
          fill={theme.cardLineFill}
        />
        <rect
          width="64.5183"
          height="5.88276"
          rx="2.94138"
          transform="matrix(1 -0.000461045 0.00179228 0.999998 84.4303 131.554)"
          fill={theme.cardLineFill}
        />
        <rect
          width="64.5183"
          height="5.88276"
          rx="2.94138"
          transform="matrix(1 -0.000409158 0.00201956 0.999998 14.8253 145.704)"
          fill={theme.cardLineFill}
        />
        <rect
          width="64.5183"
          height="5.88276"
          rx="2.94138"
          transform="matrix(1 -0.000461045 0.00179228 0.999998 84.4303 145.672)"
          fill={theme.cardLineFill}
        />
        <rect
          width="64.5183"
          height="5.88276"
          rx="2.94138"
          transform="matrix(1 -0.000409158 0.00201956 0.999998 14.8253 159.823)"
          fill={theme.cardLineFill}
        />
        <rect
          width="64.5183"
          height="5.88276"
          rx="2.94138"
          transform="matrix(1 -0.000461045 0.00179228 0.999998 84.4303 159.79)"
          fill={theme.cardLineFill}
        />
        <rect
          width="64.5183"
          height="5.88276"
          rx="2.94138"
          transform="matrix(1 -0.000409158 0.00201956 0.999998 14.8253 173.941)"
          fill={theme.cardLineFill}
        />
        <rect
          width="64.5183"
          height="5.88276"
          rx="2.94138"
          transform="matrix(1 -0.000461045 0.00179228 0.999998 84.4303 173.909)"
          fill={theme.cardLineFill}
        />
        <defs>
          <filter
            id={filterId}
            x="0"
            y="0"
            width="166.078"
            height="218.262"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="BackgroundImageFix"
              result="shape"
            />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feMorphology
              radius="2"
              operator="erode"
              in="SourceAlpha"
              result={`effect1_innerShadow_${id}`}
            />
            <feOffset dx="3" dy="5" />
            <feGaussianBlur stdDeviation="3.05" />
            <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
            <feColorMatrix type="matrix" values={theme.cardInsetColor} />
            <feBlend
              mode="normal"
              in2="shape"
              result={`effect1_innerShadow_${id}`}
            />
          </filter>
        </defs>
      </svg>
    </div>
  );
};
