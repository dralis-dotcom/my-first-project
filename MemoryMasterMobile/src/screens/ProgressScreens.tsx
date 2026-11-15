import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getApiKey, setApiKey } from '../ai';
import { disciplineById, DISCIPLINES, formatTime } from '../data/disciplines';
import { LESSONS } from '../data/lessons';
import { currentStreak, useStore } from '../store';
import { colors, radius } from '../theme';
import { Body, Button, Card, Eyebrow, Heading, IconBadge, Muted, Pill, Row, Screen, Title, TopBar } from '../ui';

const LEVEL_LABEL: Record<string, string> = {
  starter: 'Starter',
  national: 'National',
  international: 'International',
  world: 'World',
  custom: 'Custom',
};

export function ProgressScreen({ navigation }: any) {
  const { state } = useStore();
  const streak = currentStreak(state.activeDays);

  return (
    <Screen>
      <Row style={{ justifyContent: 'space-between', marginTop: 14 }}>
        <View>
          <Eyebrow>Your journey</Eyebrow>
          <Title style={{ marginTop: 6 }}>Progress</Title>
        </View>
        <Pressable onPress={() => navigation.navigate('Settings')} style={s.gear} hitSlop={8}>
          <Ionicons name="settings-outline" size={20} color={colors.text} />
        </Pressable>
      </Row>

      <Row style={{ gap: 10, marginTop: 20 }}>
        <Tile value={`${streak}`} label="Day streak" icon="flame" />
        <Tile value={`${state.results.length}`} label="Rounds" icon="barbell" />
        <Tile value={`${state.lessonsDone.length}/${LESSONS.length}`} label="Lessons" icon="school" />
      </Row>

      <Heading style={{ marginTop: 28, marginBottom: 12 }}>Personal bests</Heading>
      <View style={{ gap: 10 }}>
        {DISCIPLINES.map((d) => {
          const rs = state.results.filter((r) => r.disciplineId === d.id);
          // show the best result at the highest level played
          const order = ['world', 'international', 'national', 'starter', 'custom'];
          const levelKey = order.find((k) => rs.some((r) => r.levelKey === k));
          const best = rs
            .filter((r) => r.levelKey === levelKey)
            .reduce<(typeof rs)[number] | null>((b, r) => (!b || r.score > b.score ? r : b), null);
          return (
            <Card key={d.id} onPress={() => navigation.navigate('Discipline', { id: d.id })} style={{ paddingVertical: 13 }}>
              <Row style={{ gap: 12 }}>
                <IconBadge name={d.icon} size={38} tone={best ? 'gold' : 'muted'} />
                <View style={{ flex: 1 }}>
                  <Text style={s.name}>{d.name}</Text>
                  <Muted>{best ? `${LEVEL_LABEL[best.levelKey]} · ${rs.length} ${rs.length === 1 ? 'round' : 'rounds'}` : 'Not tried yet'}</Muted>
                </View>
                {best ? (
                  <Text style={s.best}>
                    {d.speed && best.score === best.max ? formatTime(best.memSeconds) : best.score}
                    {d.speed && best.score === best.max ? '' : <Text style={s.bestMax}> /{best.max}</Text>}
                  </Text>
                ) : (
                  <Ionicons name="chevron-forward" size={18} color={colors.faint} />
                )}
              </Row>
            </Card>
          );
        })}
      </View>

      <Heading style={{ marginTop: 28, marginBottom: 12 }}>Recent rounds</Heading>
      {state.results.length === 0 ? (
        <Card>
          <Muted>Your finished rounds will appear here.</Muted>
        </Card>
      ) : (
        <Card style={{ paddingVertical: 4 }}>
          {state.results.slice(0, 12).map((r, i, arr) => {
            const d = disciplineById(r.disciplineId);
            return (
              <Row key={r.id} style={[s.recent, i === arr.length - 1 && { borderBottomWidth: 0 }]}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text, fontWeight: '600', fontSize: 14.5 }}>{d?.name ?? r.disciplineId}</Text>
                  <Muted>
                    {LEVEL_LABEL[r.levelKey] ?? r.levelKey} · {new Date(r.date).toLocaleDateString()}
                  </Muted>
                </View>
                <Text style={{ color: colors.goldLight, fontWeight: '800', fontSize: 15 }}>
                  {r.score}
                  <Text style={s.bestMax}> /{r.max}</Text>
                </Text>
              </Row>
            );
          })}
        </Card>
      )}
    </Screen>
  );
}

function Tile({ value, label, icon }: { value: string; label: string; icon: React.ComponentProps<typeof Ionicons>['name'] }) {
  return (
    <Card style={{ flex: 1, paddingVertical: 16, paddingHorizontal: 12 }}>
      <Ionicons name={icon} size={18} color={colors.gold} />
      <Text style={s.tileValue}>{value}</Text>
      <Text style={s.tileLabel}>{label}</Text>
    </Card>
  );
}

export function SettingsScreen({ navigation }: any) {
  const { state, update, reset } = useStore();
  const [key, setKey] = useState('');
  const [saved, setSaved] = useState(false);
  const [hasKey, setHasKey] = useState(false);
  const [askReset, setAskReset] = useState(false);

  useEffect(() => {
    getApiKey().then((k) => setHasKey(!!k));
  }, []);

  const saveKey = async () => {
    await setApiKey(key);
    setHasKey(!!key.trim());
    setKey('');
    setSaved(true);
  };

  return (
    <Screen>
      <TopBar onBack={() => navigation.goBack()} title="Settings" />

      <Heading style={{ marginBottom: 8 }}>AI key for the mnemonic maker</Heading>
      <Body>
        The Medicine tab uses the Claude AI from Anthropic. Paste your Anthropic API key here. It is
        stored only on this phone, in its encrypted storage, and is sent only to Anthropic.
      </Body>
      <Row style={s.status}>
        <Ionicons
          name={hasKey ? 'checkmark-circle' : 'ellipse-outline'}
          size={18}
          color={hasKey ? colors.success : colors.faint}
        />
        <Text style={{ color: colors.textSoft, fontSize: 14 }}>{hasKey ? 'A key is saved on this phone.' : 'No key saved yet.'}</Text>
      </Row>
      <TextInput
        style={s.input}
        value={key}
        onChangeText={(t) => {
          setKey(t);
          setSaved(false);
        }}
        placeholder="sk-ant-…"
        placeholderTextColor={colors.faint}
        autoCapitalize="none"
        autoCorrect={false}
        secureTextEntry
      />
      <Row style={{ gap: 10, marginTop: 12 }}>
        <Button label={saved ? 'Saved ✓' : 'Save key'} small onPress={saveKey} disabled={!key.trim()} style={{ flex: 1 }} />
        {hasKey ? (
          <Button
            label="Remove key"
            small
            variant="ghost"
            style={{ flex: 1 }}
            onPress={async () => {
              await setApiKey('');
              setHasKey(false);
            }}
          />
        ) : null}
      </Row>
      <Muted style={{ marginTop: 10 }}>
        You get a key at console.anthropic.com → API keys. Using the AI costs a small amount per
        mnemonic, billed by Anthropic to the key's owner.
      </Muted>

      <Heading style={{ marginTop: 30, marginBottom: 8 }}>Number grouping</Heading>
      <Body>How digits are grouped on screen when you memorise numbers.</Body>
      <Row style={{ gap: 8, marginTop: 12 }}>
        <Pill label="Pairs · 12 34 56" active={state.digitGroup === 2} onPress={() => update({ digitGroup: 2 })} />
        <Pill label="Threes · 123 456" active={state.digitGroup === 3} onPress={() => update({ digitGroup: 3 })} />
      </Row>

      <Heading style={{ marginTop: 30, marginBottom: 8 }}>Your data</Heading>
      <Body>Everything is saved on this phone only. There is no account and nothing is uploaded.</Body>
      {askReset ? (
        <Card style={{ marginTop: 12 }}>
          <Text style={{ color: colors.text, fontWeight: '700', marginBottom: 4 }}>Erase all progress?</Text>
          <Muted style={{ marginBottom: 12 }}>Lessons, scores, palaces and saved mnemonics will be deleted. This cannot be undone.</Muted>
          <Row style={{ gap: 10 }}>
            <Button label="Cancel" small style={{ flex: 1 }} onPress={() => setAskReset(false)} />
            <Button
              label="Erase"
              small
              variant="ghost"
              style={{ flex: 1 }}
              onPress={() => {
                reset();
                setAskReset(false);
              }}
            />
          </Row>
        </Card>
      ) : (
        <Pressable onPress={() => setAskReset(true)} style={{ marginTop: 14 }}>
          <Text style={{ color: colors.danger, fontWeight: '600' }}>Erase all progress</Text>
        </Pressable>
      )}

      <Muted style={{ marginTop: 34, textAlign: 'center' }}>
        MemoryMaster · Event formats follow the World Memory Championships. This app is not
        affiliated with the World Memory Sports Council.
      </Muted>
    </Screen>
  );
}

const s = StyleSheet.create({
  gear: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileValue: { color: colors.text, fontSize: 24, fontWeight: '800', marginTop: 10 },
  tileLabel: { color: colors.muted, fontSize: 11, letterSpacing: 0.8, textTransform: 'uppercase', marginTop: 2 },
  name: { color: colors.text, fontSize: 15, fontWeight: '700', marginBottom: 1 },
  best: { color: colors.goldLight, fontSize: 18, fontWeight: '800' },
  bestMax: { color: colors.muted, fontSize: 12, fontWeight: '600' },
  recent: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.borderSoft },
  status: { gap: 8, marginTop: 14, marginBottom: 12 },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    color: colors.text,
    fontSize: 15.5,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
});
