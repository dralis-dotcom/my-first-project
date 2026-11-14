import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Discipline, disciplineById, DISCIPLINES, formatTime, humanTime, LevelKey } from '../data/disciplines';
import type { SessionConfig } from '../engine';
import { useStore } from '../store';
import { colors, radius } from '../theme';
import { Body, Button, Card, Eyebrow, Heading, IconBadge, Muted, Pill, Row, Screen, Title, TopBar } from '../ui';

export function startLevel(d: Discipline, key: LevelKey): SessionConfig {
  const level = d.levels.find((l) => l.key === key) ?? d.levels[0];
  return {
    disciplineId: d.id,
    levelKey: level.key,
    kind: d.kind,
    title: d.name,
    amount: level.amount,
    memSec: level.memSec,
    recallSec: level.recallSec,
    speed: d.speed,
  };
}

/** The list of all ten events (Train tab). */
export function TrainScreen({ navigation }: any) {
  const { state } = useStore();
  return (
    <Screen>
      <Eyebrow style={{ marginTop: 14 }}>World Memory Championships</Eyebrow>
      <Title style={{ marginTop: 6 }}>The ten events</Title>
      <Body style={{ marginTop: 8, marginBottom: 20 }}>
        These are the ten official disciplines. Each one has a gentle Starter level and the real
        national, international and world formats.
      </Body>
      <View style={{ gap: 12 }}>
        {DISCIPLINES.map((d, i) => {
          const plays = state.results.filter((r) => r.disciplineId === d.id).length;
          return (
            <Card key={d.id} onPress={() => navigation.navigate('Discipline', { id: d.id })}>
              <Row style={{ gap: 14 }}>
                <IconBadge name={d.icon} />
                <View style={{ flex: 1 }}>
                  <Text style={s.no}>EVENT {i + 1}</Text>
                  <Text style={s.name}>{d.name}</Text>
                  <Muted>{d.tagline}</Muted>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <Ionicons name="chevron-forward" size={20} color={colors.muted} />
                  {plays > 0 ? <Text style={s.plays}>{plays}×</Text> : null}
                </View>
              </Row>
            </Card>
          );
        })}
      </View>
    </Screen>
  );
}

/** One event: what it is, level picker, start button. */
export default function DisciplineScreen({ navigation, route }: any) {
  const d = disciplineById(route.params.id)!;
  const { state } = useStore();
  const [levelKey, setLevelKey] = useState<LevelKey>('starter');
  const level = d.levels.find((l) => l.key === levelKey)!;

  const best = state.results
    .filter((r) => r.disciplineId === d.id && r.levelKey === levelKey)
    .reduce<{ score: number; max: number; mem: number } | null>(
      (b, r) => (!b || r.score > b.score ? { score: r.score, max: r.max, mem: r.memSeconds } : b),
      null,
    );

  return (
    <Screen>
      <TopBar onBack={() => navigation.goBack()} />
      <Row style={{ gap: 14, marginTop: 6 }}>
        <IconBadge name={d.icon} size={54} />
        <View style={{ flex: 1 }}>
          <Eyebrow>Championship event</Eyebrow>
          <Title style={{ fontSize: 26, lineHeight: 32, marginTop: 4 }}>{d.name}</Title>
        </View>
      </Row>
      <Body style={{ marginTop: 16 }}>{d.how}</Body>

      <Heading style={{ marginTop: 26, marginBottom: 12 }}>Choose your level</Heading>
      <Row style={{ flexWrap: 'wrap', gap: 8 }}>
        {d.levels.map((l) => (
          <Pill key={l.key} label={l.label} active={l.key === levelKey} onPress={() => setLevelKey(l.key)} />
        ))}
      </Row>

      <Card tone="gold" style={{ marginTop: 14 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <Stat label={d.kind === 'spoken' ? 'Listening' : 'Memorise'} value={humanTime(level.memSec)} />
          <Stat label="Recall" value={humanTime(level.recallSec)} />
          <Stat label={d.unit} value={`${level.amount}`} />
        </Row>
        {levelKey === 'starter' ? (
          <Muted style={{ marginTop: 12 }}>Starter is a short, friendly round made for beginners.</Muted>
        ) : (
          <Muted style={{ marginTop: 12 }}>
            {level.label} championship format. You do not have to attempt everything — stop when you like.
          </Muted>
        )}
      </Card>

      {best ? (
        <Row style={s.best}>
          <Ionicons name="trophy" size={16} color={colors.gold} />
          <Text style={{ color: colors.textSoft, fontSize: 14 }}>
            Your best: <Text style={{ color: colors.text, fontWeight: '800' }}>{best.score}</Text> / {best.max}
            {d.speed && best.score === best.max ? `  ·  ${formatTime(best.mem)}` : ''}
          </Text>
        </Row>
      ) : null}

      <Button
        label="Start"
        icon="play"
        style={{ marginTop: 18 }}
        onPress={() => navigation.navigate('Session', { config: startLevel(d, levelKey) })}
      />

      <Heading style={{ marginTop: 30, marginBottom: 10 }}>How it is scored</Heading>
      <Body>{d.scoring}</Body>

      <Card style={{ marginTop: 20 }}>
        <Row style={{ gap: 10, marginBottom: 6 }}>
          <Ionicons name="bulb" size={18} color={colors.gold} />
          <Text style={{ color: colors.text, fontWeight: '700' }}>Champion's tip</Text>
        </Row>
        <Body>{d.tip}</Body>
      </Card>
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={s.statValue}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  no: { color: colors.faint, fontSize: 10, letterSpacing: 1.5, fontWeight: '700', marginBottom: 2 },
  name: { color: colors.text, fontSize: 16.5, fontWeight: '700', marginBottom: 2 },
  plays: { color: colors.gold, fontSize: 11, fontWeight: '700' },
  statValue: { color: colors.goldLight, fontSize: 20, fontWeight: '800' },
  statLabel: { color: colors.muted, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', marginTop: 2 },
  best: {
    gap: 8,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
});
