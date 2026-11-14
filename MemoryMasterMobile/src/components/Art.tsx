import React from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle, ClipPath, Defs, Ellipse, G, Path, Rect } from 'react-native-svg';
import { mulberry32 } from '../engine';
import type { Card } from '../engine';
import { colors } from '../theme';

// ---------- Faces (for Names & Faces) ----------

const SKIN = ['#F6D7BD', '#EBC09C', '#D6A277', '#B97F56', '#8E5A3A', '#5E3A26'];
const HAIR = ['#1B1512', '#3B2618', '#6B4423', '#A8672E', '#D8B06A', '#8F8F96', '#B23A2E'];
const SHIRT = ['#3F5BA9', '#2E7D6B', '#A23B4E', '#6B4FA3', '#B8873A', '#3A4352', '#C0623A'];
const BG = ['#1D2540', '#23203F', '#1B2F33', '#33222A', '#2C2A1E', '#202838'];

export function Face({ seed, size = 96 }: { seed: number; size?: number }) {
  const r = mulberry32(seed);
  const pick = <T,>(arr: T[]) => arr[Math.floor(r() * arr.length)];
  const skin = pick(SKIN);
  const hair = pick(HAIR);
  const shirt = pick(SHIRT);
  const bg = pick(BG);
  const faceRx = 24 + r() * 6;
  const faceRy = 29 + r() * 5;
  const hairStyle = Math.floor(r() * 6); // 0 bald, 1 short, 2 long, 3 bun, 4 curly, 5 side
  const glasses = r() < 0.28;
  const beard = r() < 0.2;
  const brow = r() * 3;
  const eyeGap = 9 + r() * 4;
  const mouth = Math.floor(r() * 3);
  const earrings = r() < 0.15;

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Rect x={0} y={0} width={100} height={100} rx={18} fill={bg} />
      {/* long hair sits behind the head */}
      {hairStyle === 2 ? <Path d={`M${50 - faceRx - 5} 44 Q50 4 ${50 + faceRx + 5} 44 L${50 + faceRx + 7} 86 L${50 - faceRx - 7} 86 Z`} fill={hair} /> : null}
      {hairStyle === 3 ? <Circle cx={50} cy={13} r={9} fill={hair} /> : null}
      {/* shoulders */}
      <Path d="M12 100 Q14 78 38 74 L62 74 Q86 78 88 100 Z" fill={shirt} />
      <Rect x={43} y={66} width={14} height={14} fill={skin} />
      {/* ears */}
      <Circle cx={50 - faceRx} cy={49} r={4.5} fill={skin} />
      <Circle cx={50 + faceRx} cy={49} r={4.5} fill={skin} />
      {earrings ? <Circle cx={50 - faceRx} cy={55} r={1.8} fill={colors.gold} /> : null}
      {/* head */}
      <Ellipse cx={50} cy={46} rx={faceRx} ry={faceRy} fill={skin} />
      {/* hair on top */}
      {hairStyle === 1 || hairStyle === 2 || hairStyle === 3 ? (
        <Path d={`M${50 - faceRx} 42 Q${50 - faceRx} 14 50 15 Q${50 + faceRx} 14 ${50 + faceRx} 42 Q${50 + faceRx - 6} 27 50 27 Q${50 - faceRx + 6} 27 ${50 - faceRx} 42 Z`} fill={hair} />
      ) : null}
      {hairStyle === 4 ? (
        <G fill={hair}>
          {[-22, -11, 0, 11, 22].map((dx) => (
            <Circle key={dx} cx={50 + dx} cy={22 + Math.abs(dx) * 0.28} r={9.5} />
          ))}
        </G>
      ) : null}
      {hairStyle === 5 ? (
        <Path d={`M${50 - faceRx} 44 Q${50 - faceRx - 2} 12 54 14 Q${50 + faceRx + 2} 16 ${50 + faceRx} 40 Q62 24 40 28 Q${50 - faceRx + 4} 30 ${50 - faceRx} 44 Z`} fill={hair} />
      ) : null}
      {/* brows + eyes */}
      <Rect x={50 - eyeGap - 5} y={38 - brow} width={10} height={2} rx={1} fill={hair} />
      <Rect x={50 + eyeGap - 5} y={38 - brow} width={10} height={2} rx={1} fill={hair} />
      <Circle cx={50 - eyeGap} cy={45} r={2.6} fill="#1A1410" />
      <Circle cx={50 + eyeGap} cy={45} r={2.6} fill="#1A1410" />
      {glasses ? (
        <G stroke="#E8E2D2" strokeWidth={1.6} fill="none">
          <Circle cx={50 - eyeGap} cy={45} r={7} />
          <Circle cx={50 + eyeGap} cy={45} r={7} />
          <Path d={`M${50 - eyeGap + 7} 45 L${50 + eyeGap - 7} 45`} />
        </G>
      ) : null}
      {/* nose */}
      <Path d="M50 48 Q47 56 50 57" stroke="#00000033" strokeWidth={1.6} fill="none" />
      {beard ? (
        <Path d={`M${50 - faceRx + 3} 54 Q50 ${46 + faceRy + 8} ${50 + faceRx - 3} 54 Q50 68 ${50 - faceRx + 3} 54 Z`} fill={hair} opacity={0.92} />
      ) : null}
      {/* mouth */}
      {mouth === 0 ? <Path d="M42 62 Q50 69 58 62" stroke="#7A2E2E" strokeWidth={2.2} fill="none" strokeLinecap="round" /> : null}
      {mouth === 1 ? <Path d="M43 63 L57 63" stroke="#7A2E2E" strokeWidth={2.2} strokeLinecap="round" /> : null}
      {mouth === 2 ? <Path d="M42 61 Q50 71 58 61 Z" fill="#7A2E2E" /> : null}
    </Svg>
  );
}

// ---------- Abstract images ----------
// Black-and-white textured blobs, in the style of championship abstract-image sheets.

function blobPath(r: () => number, cx: number, cy: number, base: number, wobble: number, n: number) {
  const pts: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const ang = (i / n) * Math.PI * 2;
    const rad = base * (1 - wobble + r() * wobble * 2);
    pts.push([cx + Math.cos(ang) * rad, cy + Math.sin(ang) * rad]);
  }
  const mid = (a: [number, number], b: [number, number]) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const start = mid(pts[n - 1], pts[0]);
  let d = `M${start[0].toFixed(1)} ${start[1].toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const m = mid(pts[i], pts[(i + 1) % n]);
    d += ` Q${pts[i][0].toFixed(1)} ${pts[i][1].toFixed(1)} ${m[0].toFixed(1)} ${m[1].toFixed(1)}`;
  }
  return `${d} Z`;
}

const PAPER = '#F4F1EA';
const GREYS = ['#111111', '#2B2B2B', '#4A4A4A', '#6E6E6E'];

export function AbstractImage({ seed, size = 56 }: { seed: number; size?: number }) {
  const r = mulberry32(seed);
  const outer = blobPath(r, 50, 50, 35, 0.45, 5 + Math.floor(r() * 6));
  const fill = GREYS[Math.floor(r() * GREYS.length)];
  const light = r() < 0.5 ? PAPER : '#BDBDBD';
  const texture = Math.floor(r() * 6); // stripes, dots, rings, cross-hatch, checks, speckle
  const angle = Math.floor(r() * 180);
  const gap = 7 + Math.floor(r() * 7);
  const weight = 1.6 + r() * 2.6;
  const clipId = `ab${seed}`;
  const lines: number[] = [];
  for (let v = -30; v <= 130; v += gap) lines.push(v);
  const speckles = Array.from({ length: 26 }, () => [12 + r() * 76, 12 + r() * 76, 0.8 + r() * 3.2]);

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <ClipPath id={clipId}>
          <Path d={outer} />
        </ClipPath>
      </Defs>
      <Rect x={0} y={0} width={100} height={100} rx={14} fill={PAPER} />
      <Path d={outer} fill={fill} />
      <G clipPath={`url(#${clipId})`}>
        {texture === 0 || texture === 3 ? (
          <G rotation={angle} origin="50, 50" stroke={light} strokeWidth={weight}>
            {lines.map((v) => (
              <Path key={v} d={`M-30 ${v} L130 ${v}`} />
            ))}
          </G>
        ) : null}
        {texture === 3 ? (
          <G rotation={angle + 90} origin="50, 50" stroke={light} strokeWidth={weight}>
            {lines.map((v) => (
              <Path key={v} d={`M-30 ${v} L130 ${v}`} />
            ))}
          </G>
        ) : null}
        {texture === 1 ? (
          <G rotation={angle} origin="50, 50" fill={light}>
            {lines.map((y) => lines.map((x) => <Circle key={`${x}-${y}`} cx={x} cy={y} r={weight * 0.8} />))}
          </G>
        ) : null}
        {texture === 2
          ? [8, 8 + gap, 8 + gap * 2, 8 + gap * 3, 8 + gap * 4].map((rad) => (
              <Circle key={rad} cx={38 + (angle % 24)} cy={62 - (angle % 24)} r={rad} stroke={light} strokeWidth={weight} fill="none" />
            ))
          : null}
        {texture === 4 ? (
          <G rotation={angle} origin="50, 50" fill={light}>
            {lines.map((y, yi) =>
              lines.map((x, xi) =>
                (xi + yi) % 2 === 0 ? <Rect key={`${x}-${y}`} x={x} y={y} width={gap} height={gap} /> : null,
              ),
            )}
          </G>
        ) : null}
        {texture === 5 ? speckles.map((d, i) => <Circle key={i} cx={d[0]} cy={d[1]} r={d[2]} fill={light} />) : null}
      </G>
      <Path d={outer} fill="none" stroke="#111111" strokeWidth={1.6} />
    </Svg>
  );
}

// ---------- Playing cards ----------

const SUIT_CHAR = { S: '♠', H: '♥', D: '♦', C: '♣' } as const;

export function PlayingCard({
  card,
  width = 40,
  dim,
  highlight,
}: {
  card: Pick<Card, 'rank' | 'suit'>;
  width?: number;
  dim?: boolean;
  highlight?: 'good' | 'bad';
}) {
  const red = card.suit === 'H' || card.suit === 'D';
  return (
    <View
      style={{
        width,
        height: width * 1.36,
        borderRadius: width * 0.16,
        backgroundColor: '#F7F2E6',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: dim ? 0.18 : 1,
        borderWidth: highlight ? 2 : 0,
        borderColor: highlight === 'good' ? colors.success : colors.danger,
      }}
    >
      <Text
        style={{
          fontSize: width * 0.4,
          fontWeight: '800',
          color: red ? '#C0392B' : '#151821',
          lineHeight: width * 0.46,
        }}
      >
        {card.rank}
      </Text>
      <Text style={{ fontSize: width * 0.42, color: red ? '#C0392B' : '#151821', lineHeight: width * 0.5 }}>
        {SUIT_CHAR[card.suit]}
      </Text>
    </View>
  );
}
