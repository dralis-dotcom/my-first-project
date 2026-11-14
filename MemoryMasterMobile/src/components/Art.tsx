import React from 'react';
import { Image, Text, View } from 'react-native';
import Svg, { Circle, ClipPath, Defs, G, Path, Rect } from 'react-native-svg';
import { FACE_PHOTOS } from './facePhotos';
import { mulberry32 } from '../engine';
import type { Card } from '../engine';
import { colors } from '../theme';

// ---------- Faces (for Names & Faces) ----------

/** A portrait photo, like the photo sheets used in the Names & Faces event. */
export function Face({ photo, size = 96 }: { photo: string; size?: number }) {
  return (
    <Image
      source={FACE_PHOTOS[photo]}
      style={{ width: size, height: size, borderRadius: size * 0.16, backgroundColor: colors.surface2 }}
      accessibilityLabel="Portrait photo"
    />
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
