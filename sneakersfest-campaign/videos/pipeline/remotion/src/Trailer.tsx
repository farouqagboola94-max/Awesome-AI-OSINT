import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  random,
  staticFile,
  delayRender,
  continueRender,
  Sequence,
} from 'remotion';

export type TrailerProps = {
  id: number;
  slug: string;
  slamWord: string;
  hook: string[];
  beat1: string;
  beat2: string;
  cta: string;
  accent: string;
  accentDark: boolean;
};

const INK = '#14141A';
const CHALK = '#F4F1EA';
const FLAME = '#FF4D00';
const VOLT = '#D8FF3D';
const GRAPE = '#6C4CF1';

// ---- font loading (local TTFs from public/) ----
let fontsLoaded = false;
const loadHandle = typeof window !== 'undefined' ? delayRender('fonts') : null;
if (typeof window !== 'undefined' && !fontsLoaded) {
  Promise.all([
    new FontFace('Bebas', `url(${staticFile('bebas.ttf')})`).load(),
    new FontFace('Hanken', `url(${staticFile('hanken-blackitalic.ttf')})`, {
      weight: '900',
      style: 'italic',
    }).load(),
  ]).then((faces) => {
    faces.forEach((f) => document.fonts.add(f));
    fontsLoaded = true;
    if (loadHandle !== null) continueRender(loadHandle);
  });
}

const disp: React.CSSProperties = { fontFamily: 'Bebas', lineHeight: 0.98, color: CHALK };
const acc: React.CSSProperties = { fontFamily: 'Hanken', fontWeight: 900, fontStyle: 'italic' };
const center: React.CSSProperties = {
  justifyContent: 'center',
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  textAlign: 'center',
};

const Watermark: React.FC = () => (
  <div
    style={{
      ...acc,
      position: 'absolute',
      top: 52,
      width: '100%',
      textAlign: 'center',
      fontSize: 30,
      letterSpacing: 6,
      color: 'rgba(255,255,255,0.5)',
      zIndex: 40,
    }}
  >
    @SNEAKERSFEST
  </div>
);

const Flash: React.FC<{ at: number; len?: number }> = ({ at, len = 5 }) => {
  const f = useCurrentFrame();
  const op = interpolate(f, [at, at + len], [0.95, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  if (f < at || f > at + len) return null;
  return <AbsoluteFill style={{ background: '#FFF', opacity: op, zIndex: 50 }} />;
};

// ---------- Scene 1: SLAM (0-20) ----------
const Slam: React.FC<{ word: string }> = ({ word }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f, fps, config: { damping: 12, stiffness: 190, mass: 0.8 } });
  const burst = interpolate(f, [8, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ ...center, background: INK }}>
      {[...Array(8)].map((_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 540 + Math.cos(a) * (200 + burst * 520),
              top: 960 + Math.sin(a) * (200 + burst * 520),
              width: 16,
              height: 16,
              borderRadius: 8,
              background: i % 2 ? FLAME : VOLT,
              opacity: 1 - burst,
              transform: 'translate(-50%,-50%)',
            }}
          />
        );
      })}
      <div
        style={{
          ...disp,
          fontSize: 310,
          transform: `scale(${3.4 - 2.4 * s}) rotate(${(1 - s) * -9}deg)`,
          opacity: Math.min(1, f / 3),
        }}
      >
        {word}
      </div>
    </AbsoluteFill>
  );
};

// ---------- per-wave background FX for hook scene ----------
const WaveFX: React.FC<{ accent: string; dark: boolean }> = ({ accent, dark }) => {
  const f = useCurrentFrame();
  const tint = dark ? 'rgba(255,255,255,0.14)' : 'rgba(20,20,26,0.12)';
  if (accent === FLAME) {
    // rising shoebox rects
    return (
      <>
        {[...Array(7)].map((_, i) => {
          const seed = random(`box-${i}`);
          const x = 60 + seed * 940;
          const speed = 260 + random(`sp-${i}`) * 320;
          const y = 2100 - ((f * speed) / 30 + seed * 900) % 2400;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: x,
                top: y,
                width: 150,
                height: 96,
                borderRadius: 10,
                background: tint,
                transform: `rotate(${(seed - 0.5) * 30}deg)`,
              }}
            />
          );
        })}
      </>
    );
  }
  if (accent === VOLT) {
    // popping stickers
    return (
      <>
        {[...Array(9)].map((_, i) => {
          const seed = random(`st-${i}`);
          const born = i * 4 + 2;
          const k = interpolate(f, [born, born + 8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const shape = i % 3;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: 80 + seed * 880,
                top: 200 + random(`sy-${i}`) * 1500,
                width: 90,
                height: 90,
                borderRadius: shape === 0 ? 45 : 14,
                background: tint,
                transform: `scale(${k}) rotate(${seed * 360 + f}deg)`,
              }}
            />
          );
        })}
      </>
    );
  }
  // GRAPE: parallax dot grid
  return (
    <>
      {[...Array(48)].map((_, i) => {
        const col = i % 6;
        const row = Math.floor(i / 6);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 90 + col * 180 + Math.sin(f / 14 + row) * 16,
              top: 140 + row * 220 + Math.cos(f / 17 + col) * 14,
              width: 14,
              height: 14,
              borderRadius: 7,
              background: tint,
            }}
          />
        );
      })}
    </>
  );
};

// ---------- Scene 2: HOOK (20-70) ----------
const Hook: React.FC<TrailerProps> = (p) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const color = p.accentDark ? CHALK : INK;
  return (
    <AbsoluteFill style={{ ...center, background: p.accent, padding: '0 70px', overflow: 'hidden' }}>
      <WaveFX accent={p.accent} dark={p.accentDark} />
      <div style={{ zIndex: 5 }}>
        {p.hook.map((line, i) => {
          const s = spring({ frame: f - i * 4, fps, config: { damping: 14, stiffness: 160 } });
          return (
            <div
              key={i}
              style={{
                ...disp,
                color,
                fontSize: 150,
                transform: `translateY(${(1 - s) * 130}px) scale(${1 + f * 0.0009})`,
                opacity: s,
              }}
            >
              {line}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------- Scene 3: BEAT1 word-by-word (70-112) ----------
const Beat1: React.FC<TrailerProps> = (p) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = p.beat1.replace(/<br>/g, ' \n ').split(' ');
  let wi = 0;
  return (
    <AbsoluteFill style={{ ...center, background: INK, padding: '0 80px' }}>
      <div style={{ maxWidth: 940 }}>
        {words.map((w, i) => {
          if (w === '\n') return <br key={i} />;
          const s = spring({ frame: f - wi++ * 3, fps, config: { damping: 13, stiffness: 200 } });
          return (
            <span
              key={i}
              style={{
                ...disp,
                fontSize: 132,
                display: 'inline-block',
                marginRight: 26,
                transform: `translateY(${(1 - s) * 90}px)`,
                opacity: s,
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
      <div
        style={{
          height: 16,
          borderRadius: 8,
          marginTop: 60,
          background: p.accent,
          width: interpolate(f, [6, 26], [40, 480], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
        }}
      />
    </AbsoluteFill>
  );
};

// ---------- Scene 4: BEAT2 wipe reveal (112-152) ----------
const Beat2: React.FC<TrailerProps> = (p) => {
  const f = useCurrentFrame();
  const wipe = interpolate(f, [0, 16], [0, 100], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const under = p.accent === CHALK ? FLAME : p.accent;
  return (
    <AbsoluteFill style={{ ...center, background: CHALK, padding: '0 80px' }}>
      <div style={{ clipPath: `inset(0 ${100 - wipe}% 0 0)` }}>
        {p.beat2.split('<br>').map((l, i) => (
          <div key={i} style={{ ...disp, color: INK, fontSize: 132 }}>
            {l}
          </div>
        ))}
      </div>
      <div
        style={{
          height: 20,
          borderRadius: 10,
          marginTop: 56,
          background: under,
          width: interpolate(f, [8, 30], [0, 860], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
        }}
      />
    </AbsoluteFill>
  );
};

// ---------- Scene 5: BRAND (152-198) ----------
const Brand: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const LEN = 400;
  const draw = interpolate(f, [0, 24], [LEN, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const letters = 'SNEAKERSFEST'.split('');
  return (
    <AbsoluteFill style={{ ...center, background: INK, overflow: 'hidden' }}>
      <svg width={560} height={320} viewBox="0 0 300 170" style={{ overflow: 'visible' }}>
        <path
          d="M40 120 C 40 40, 140 40, 150 85 C 160 130, 260 130, 260 55"
          fill="none"
          stroke={FLAME}
          strokeWidth={18}
          strokeLinecap="round"
          strokeDasharray={LEN}
          strokeDashoffset={draw}
        />
        {f > 2 && <rect x={24} y={108} width={30} height={20} rx={9} fill={VOLT} />}
        {f > 22 && <rect x={246} y={42} width={30} height={20} rx={9} fill={VOLT} />}
      </svg>
      <div style={{ marginTop: 40 }}>
        {letters.map((ch, i) => {
          const s = spring({ frame: f - 8 - i * 1.4, fps, config: { damping: 13, stiffness: 220 } });
          return (
            <span
              key={i}
              style={{
                ...disp,
                fontSize: 170,
                color: i >= 8 ? FLAME : CHALK,
                display: 'inline-block',
                transform: `translateY(${(1 - s) * 120}px)`,
                opacity: s,
              }}
            >
              {ch}
            </span>
          );
        })}
      </div>
      <svg width={1400} height={80} viewBox="0 0 1400 80" style={{ position: 'absolute', bottom: 180, left: -((f * 6) % 100) }}>
        <path
          d={Array.from({ length: 15 }, (_, i) => `${i === 0 ? 'M' : 'L'}${i * 100} ${i % 2 ? 60 : 20}`).join(' ')}
          fill="none"
          stroke={VOLT}
          strokeWidth={14}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </AbsoluteFill>
  );
};

// ---------- Scene 6: CTA (198-240) ----------
const Cta: React.FC<TrailerProps> = (p) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f, fps, config: { damping: 11, stiffness: 150 } });
  const color = p.accentDark ? CHALK : INK;
  const shine = interpolate(f, [10, 30], [-300, 900], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const pulse = interpolate(f, [34, 42], [1, 1.06], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ ...center, background: p.accent, padding: '0 90px', transform: `scale(${pulse})` }}>
      <div
        style={{
          ...acc,
          fontSize: 66,
          padding: '38px 64px',
          borderRadius: 28,
          background: INK,
          color: CHALK,
          transform: `scale(${s})`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {p.cta}
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: shine,
            width: 120,
            background: 'rgba(255,255,255,0.25)',
            transform: 'skewX(-20deg)',
          }}
        />
      </div>
      <div style={{ ...acc, fontSize: 52, marginTop: 70, color, opacity: interpolate(f, [10, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
        SEE YOU ON THE FLOOR.
      </div>
      <div style={{ ...disp, fontSize: 60, marginTop: 26, color, opacity: interpolate(f, [16, 26], [0, 0.85], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
        @SNEAKERSFEST
      </div>
    </AbsoluteFill>
  );
};

export const Trailer: React.FC<TrailerProps> = (p) => {
  return (
    <AbsoluteFill style={{ background: INK }}>
      <Sequence durationInFrames={20}>
        <Slam word={p.slamWord} />
      </Sequence>
      <Sequence from={20} durationInFrames={50}>
        <Hook {...p} />
      </Sequence>
      <Sequence from={70} durationInFrames={42}>
        <Beat1 {...p} />
      </Sequence>
      <Sequence from={112} durationInFrames={40}>
        <Beat2 {...p} />
      </Sequence>
      <Sequence from={152} durationInFrames={46}>
        <Brand />
      </Sequence>
      <Sequence from={198} durationInFrames={42}>
        <Cta {...p} />
      </Sequence>
      <Watermark />
      <Flash at={17} />
      <Flash at={152} />
      <Flash at={234} len={6} />
    </AbsoluteFill>
  );
};
