import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { AiError, generateMnemonic, getApiKey } from '../ai';
import { useStore } from '../store';
import { colors, fonts, radius } from '../theme';
import { Body, Button, Card, Eyebrow, Heading, IconBadge, Muted, Pill, Row, Screen, Title, TopBar } from '../ui';

const IDEAS = [
  'Cranial nerves in order',
  'Causes of acute pancreatitis',
  'Side effects of corticosteroids',
  'Branches of the external carotid artery',
  'Features of nephrotic syndrome',
  'Carpal bones',
  'Causes of clubbing',
  'Drugs that induce liver enzymes',
];

/** Medicine tab: type a topic → AI builds a mnemonic, a story and an image key. */
export function MedicineScreen({ navigation }: any) {
  const { state, saveMnemonic } = useStore();
  const [topic, setTopic] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [hasKey, setHasKey] = useState<boolean | null>(null);

  useFocusEffect(
    useCallback(() => {
      getApiKey().then((k) => setHasKey(!!k));
    }, []),
  );

  const make = async () => {
    if (!topic.trim() || busy) return;
    setBusy(true);
    setError('');
    try {
      const draft = await generateMnemonic(topic);
      const saved = saveMnemonic(draft);
      setTopic('');
      navigation.navigate('Mnemonic', { id: saved.id });
    } catch (e) {
      const msg = e instanceof AiError ? e.message : 'Something went wrong. Please try again.';
      if (msg === 'NO_KEY') setHasKey(false);
      else setError(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <Eyebrow style={{ marginTop: 14 }}>For medical study</Eyebrow>
      <Title style={{ marginTop: 6 }}>Mnemonic maker</Title>
      <Body style={{ marginTop: 8 }}>
        Type any topic you need to memorise. The AI gives you a mnemonic, a short story set in one
        place, and a key that explains what every image stands for.
      </Body>

      {hasKey === false ? (
        <Card tone="gold" style={{ marginTop: 18 }}>
          <Row style={{ gap: 10, marginBottom: 8 }}>
            <Ionicons name="key" size={18} color={colors.gold} />
            <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15.5 }}>One-time setup</Text>
          </Row>
          <Body>
            The mnemonic maker uses the Claude AI and needs an AI key. Add your key once in Settings
            and it stays safely on this phone.
          </Body>
          <Button label="Open Settings" icon="settings" small style={{ marginTop: 14, alignSelf: 'flex-start' }} onPress={() => navigation.navigate('Settings')} />
        </Card>
      ) : null}

      <View style={s.inputWrap}>
        <TextInput
          style={s.input}
          value={topic}
          onChangeText={setTopic}
          placeholder="e.g. Causes of acute pancreatitis"
          placeholderTextColor={colors.faint}
          multiline
          editable={!busy}
        />
      </View>
      <Row style={{ flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
        {IDEAS.map((idea) => (
          <Pill key={idea} label={idea} onPress={() => setTopic(idea)} />
        ))}
      </Row>

      {error ? (
        <Row style={s.error}>
          <Ionicons name="alert-circle" size={18} color={colors.danger} />
          <Text style={{ color: colors.textSoft, flex: 1, fontSize: 14, lineHeight: 20 }}>{error}</Text>
        </Row>
      ) : null}

      {busy ? (
        <Card style={{ marginTop: 18, alignItems: 'center', paddingVertical: 26 }}>
          <ActivityIndicator color={colors.gold} />
          <Text style={{ color: colors.text, fontWeight: '700', marginTop: 12 }}>Building your mnemonic…</Text>
          <Muted style={{ marginTop: 4 }}>This can take up to a minute.</Muted>
        </Card>
      ) : (
        <Button
          label="Make my mnemonic"
          icon="sparkles"
          style={{ marginTop: 18 }}
          disabled={!topic.trim() || hasKey === false}
          onPress={make}
        />
      )}

      <Heading style={{ marginTop: 30, marginBottom: 12 }}>My library</Heading>
      {state.mnemonics.length === 0 ? (
        <Card>
          <Muted>Every mnemonic you make is saved here so you can review it and test yourself.</Muted>
        </Card>
      ) : (
        <View style={{ gap: 10 }}>
          {state.mnemonics.map((m) => (
            <Card key={m.id} onPress={() => navigation.navigate('Mnemonic', { id: m.id })}>
              <Row style={{ gap: 14 }}>
                <IconBadge name="medkit" tone="violet" size={40} />
                <View style={{ flex: 1 }}>
                  <Text style={s.itemTitle}>{m.title}</Text>
                  <Text style={s.itemMnemonic} numberOfLines={1}>
                    {m.mnemonic}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.muted} />
              </Row>
            </Card>
          ))}
        </View>
      )}

      <Muted style={{ marginTop: 24, textAlign: 'center' }}>
        AI can make mistakes. Always check medical facts against your textbook or lecture notes.
      </Muted>
    </Screen>
  );
}

/** One saved mnemonic, with a "test me" mode that hides the meanings. */
export function MnemonicScreen({ navigation, route }: any) {
  const { state, deleteMnemonic } = useStore();
  const m = state.mnemonics.find((x) => x.id === route.params.id);
  const [testing, setTesting] = useState(false);
  const [shown, setShown] = useState<number[]>([]);
  const [askDelete, setAskDelete] = useState(false);

  if (!m) {
    return (
      <Screen>
        <TopBar onBack={() => navigation.goBack()} />
        <Muted>This mnemonic was deleted.</Muted>
      </Screen>
    );
  }

  return (
    <Screen>
      <TopBar
        onBack={() => navigation.goBack()}
        right={
          <Pressable onPress={() => setAskDelete(true)} hitSlop={12}>
            <Ionicons name="trash-outline" size={20} color={colors.muted} />
          </Pressable>
        }
      />
      <Eyebrow>{m.topic}</Eyebrow>
      <Title style={{ marginTop: 6, fontSize: 26, lineHeight: 33 }}>{m.title}</Title>

      {askDelete ? (
        <Card style={{ marginTop: 14 }}>
          <Text style={{ color: colors.text, fontWeight: '700', marginBottom: 12 }}>Delete this mnemonic?</Text>
          <Row style={{ gap: 10 }}>
            <Button label="Keep" small style={{ flex: 1 }} onPress={() => setAskDelete(false)} />
            <Button
              label="Delete"
              small
              variant="ghost"
              style={{ flex: 1 }}
              onPress={() => {
                deleteMnemonic(m.id);
                navigation.goBack();
              }}
            />
          </Row>
        </Card>
      ) : null}

      <View style={s.mnemonicBox}>
        <Text style={s.boxLabel}>MNEMONIC</Text>
        <Text style={s.mnemonicText}>{m.mnemonic}</Text>
      </View>

      <Row style={{ justifyContent: 'space-between', marginTop: 26, marginBottom: 10 }}>
        <Heading>What each part means</Heading>
        <Pill
          label={testing ? 'Show all' : 'Test me'}
          icon={testing ? 'eye' : 'eye-off'}
          active={testing}
          onPress={() => {
            setTesting(!testing);
            setShown([]);
          }}
        />
      </Row>
      {testing ? <Muted style={{ marginBottom: 8 }}>Say the meaning out loud, then tap a row to check.</Muted> : null}
      <View style={s.list}>
        {m.parts.map((p, i) => {
          const hidden = testing && !shown.includes(i);
          return (
            <Pressable
              key={i}
              disabled={!testing}
              onPress={() => setShown((x) => (x.includes(i) ? x : [...x, i]))}
              style={[s.part, i === m.parts.length - 1 && { borderBottomWidth: 0 }]}
            >
              <Text style={s.cue}>{p.cue}</Text>
              <Text style={[s.meaning, hidden && { color: colors.faint }]}>
                {hidden ? 'Tap to reveal' : p.meaning}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Heading style={{ marginTop: 28, marginBottom: 10 }}>The story</Heading>
      <Row style={s.location}>
        <Ionicons name="location" size={16} color={colors.violet} />
        <Text style={{ color: colors.text, fontWeight: '700', flex: 1, fontSize: 14.5 }}>{m.location}</Text>
      </Row>
      <Text style={s.story}>{m.story}</Text>

      <Heading style={{ marginTop: 28, marginBottom: 10 }}>What each image refers to</Heading>
      <View style={s.list}>
        {m.imageKey.map((p, i) => (
          <View key={i} style={[s.part, i === m.imageKey.length - 1 && { borderBottomWidth: 0 }]}>
            <Text style={[s.cue, { color: colors.violet }]}>{p.cue}</Text>
            <Text style={s.meaning}>{p.meaning}</Text>
          </View>
        ))}
      </View>

      {m.tip ? (
        <Card style={{ marginTop: 22 }}>
          <Row style={{ gap: 10, marginBottom: 6 }}>
            <Ionicons name="bulb" size={18} color={colors.gold} />
            <Text style={{ color: colors.text, fontWeight: '700' }}>Review tip</Text>
          </Row>
          <Body>{m.tip}</Body>
        </Card>
      ) : null}

      <Muted style={{ marginTop: 22, textAlign: 'center' }}>
        Made by AI. Check the facts against your textbook before you rely on them.
      </Muted>
    </Screen>
  );
}

const s = StyleSheet.create({
  inputWrap: {
    marginTop: 20,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: { color: colors.text, fontSize: 16.5, lineHeight: 23, padding: 16, minHeight: 92, textAlignVertical: 'top' },
  error: {
    gap: 10,
    marginTop: 14,
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: '#241312',
    borderWidth: 1,
    borderColor: '#4E2522',
  },
  itemTitle: { color: colors.text, fontSize: 15.5, fontWeight: '700', marginBottom: 2 },
  itemMnemonic: { color: colors.gold, fontSize: 13.5, fontFamily: fonts.serif },
  mnemonicBox: {
    marginTop: 20,
    padding: 20,
    borderRadius: radius.lg,
    backgroundColor: '#15120B',
    borderWidth: 1,
    borderColor: '#4A3B1C',
  },
  boxLabel: { color: colors.gold, fontSize: 10.5, letterSpacing: 2, fontWeight: '800', marginBottom: 8 },
  mnemonicText: { color: colors.goldLight, fontFamily: fonts.serif, fontSize: 24, lineHeight: 32, fontWeight: '600' },
  list: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
  },
  part: {
    flexDirection: 'row',
    gap: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  cue: { color: colors.gold, fontWeight: '800', fontSize: 15, width: 92 },
  meaning: { color: colors.textSoft, fontSize: 15, lineHeight: 21, flex: 1 },
  location: {
    gap: 8,
    padding: 12,
    borderRadius: radius.sm,
    backgroundColor: colors.violetSoft,
    marginBottom: 12,
  },
  story: { color: colors.text, fontFamily: fonts.serif, fontSize: 17, lineHeight: 28 },
});
