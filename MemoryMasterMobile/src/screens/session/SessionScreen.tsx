import React, { useEffect, useMemo, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { Answers, generate, Score, scoreSession, SessionConfig } from '../../engine';
import { formatTime } from '../../data/disciplines';
import { LESSONS } from '../../data/lessons';
import { useStore } from '../../store';
import { colors, fonts, radius } from '../../theme';
import { Body, Button, Eyebrow, Heading, Muted, ProgressBar } from '../../ui';
import { MemorizeView } from './MemorizeViews';
import { RecallView } from './RecallViews';
import { ReviewView } from './ReviewViews';

type Phase = 'countdown' | 'memorize' | 'recall' | 'results';

/** Counts down from `seconds` while `running`, then calls onEnd once. */
function useCountdown(seconds: number, running: boolean, onEnd: () => void) {
  const [left, setLeft] = useState(seconds);
  const endRef = useRef(onEnd);
  endRef.current = onEnd;
  useEffect(() => {
    if (!running) return;
    const endAt = Date.now() + seconds * 1000;
    setLeft(seconds);
    const t = setInterval(() => {
      const remaining = Math.max(0, (endAt - Date.now()) / 1000);
      setLeft(remaining);
      if (remaining <= 0) {
        clearInterval(t);
        endRef.current();
      }
    }, 250);
    return () => clearInterval(t);
  }, [running, seconds]);
  return left;
}

export default function SessionScreen({ navigation, route }: any) {
  const config: SessionConfig = route.params.config;
  const { state, addResult, completeLesson } = useStore();
  const content = useMemo(() => generate(config), [config]);

  const [phase, setPhase] = useState<Phase>('countdown');
  const [answers, setAnswers] = useState<Answers>({});
  const [score, setScore] = useState<Score | null>(null);
  const [memUsed, setMemUsed] = useState(0);
  const [isBest, setIsBest] = useState(false);
  const [confirmExit, setConfirmExit] = useState(false);
  const [spokenIndex, setSpokenIndex] = useState(0);
  const memStart = useRef(0);
  const answersRef = useRef(answers);
  answersRef.current = answers;

  const isSpoken = content.kind === 'spoken';

  const startRecall = () => {
    setMemUsed(Math.min(config.memSec, Math.round((Date.now() - memStart.current) / 1000)));
    setPhase('recall');
  };

  const finish = () => {
    const result = scoreSession(content, answersRef.current, config.speed, config.simple);
    const used = Math.min(config.memSec, Math.round((Date.now() - memStart.current) / 1000));
    const mem = memUsed || used;
    if (config.lessonId) {
      completeLesson(config.lessonId);
    } else {
      const previous = state.results.filter(
        (r) => r.disciplineId === config.disciplineId && r.levelKey === config.levelKey,
      );
      const bestBefore = previous.reduce((m, r) => Math.max(m, r.score), 0);
      setIsBest(result.score > 0 && result.score > bestBefore);
      addResult({
        disciplineId: config.disciplineId,
        levelKey: config.levelKey,
        score: result.score,
        max: result.max,
        memSeconds: mem,
      });
    }
    setScore(result);
    setPhase('results');
  };

  // 3-2-1 before the material appears
  const countLeft = useCountdown(3, phase === 'countdown', () => {
    memStart.current = Date.now();
    setPhase('memorize');
  });
  const memLeft = useCountdown(config.memSec, phase === 'memorize' && !isSpoken, startRecall);
  const recallLeft = useCountdown(config.recallSec, phase === 'recall', finish);

  // Spoken Numbers: read one digit per second, then go straight to recall.
  useEffect(() => {
    if (phase !== 'memorize' || content.kind !== 'spoken') return;
    let i = 0;
    const digits = content.digits;
    const speakNext = () => {
      if (i >= digits.length) {
        clearInterval(t);
        setTimeout(startRecall, 900);
        return;
      }
      Speech.speak(digits[i], { rate: 1.05, language: 'en-US' });
      i += 1;
      setSpokenIndex(i);
    };
    const t = setInterval(speakNext, 1000);
    speakNext();
    return () => {
      clearInterval(t);
      Speech.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, content]);

  const lessonIndex = config.lessonId ? LESSONS.findIndex((l) => l.id === config.lessonId) : -1;
  const nextLesson = lessonIndex >= 0 ? LESSONS[lessonIndex + 1] : undefined;

  // ---------- header ----------
  const total = phase === 'memorize' ? config.memSec : config.recallSec;
  const left = phase === 'memorize' ? memLeft : recallLeft;
  const urgent = left <= 10;

  const header =
    phase === 'memorize' || phase === 'recall' ? (
      <View style={st.header}>
        <View style={st.headerRow}>
          <Pressable onPress={() => setConfirmExit(true)} hitSlop={12}>
            <Ionicons name="close" size={24} color={colors.muted} />
          </Pressable>
          <View style={{ alignItems: 'center' }}>
            <Text style={st.phase}>{phase === 'memorize' ? (isSpoken ? 'Listen' : 'Memorise') : 'Recall'}</Text>
            {phase === 'memorize' && isSpoken ? (
              <Text style={st.timer}>
                {spokenIndex}/{config.amount}
              </Text>
            ) : (
              <Text style={[st.timer, urgent && { color: colors.danger }]}>{formatTime(left)}</Text>
            )}
          </View>
          <View style={{ width: 24 }} />
        </View>
        {phase === 'memorize' && isSpoken ? (
          <ProgressBar value={spokenIndex / config.amount} />
        ) : (
          <ProgressBar value={left / total} />
        )}
      </View>
    ) : null;

  // ---------- body ----------
  let body: React.ReactNode = null;
  let footer: React.ReactNode = null;

  if (phase === 'countdown') {
    body = (
      <View style={st.center}>
        <Eyebrow>{config.title}</Eyebrow>
        <Text style={st.bigCount}>{Math.max(1, Math.ceil(countLeft))}</Text>
        <Muted>{isSpoken ? 'Turn your sound on and listen.' : 'Get ready to memorise.'}</Muted>
      </View>
    );
  } else if (phase === 'memorize' && isSpoken) {
    body = (
      <View style={st.center}>
        <View style={st.pulse}>
          <Ionicons name="volume-high" size={56} color={colors.gold} />
        </View>
        <Heading style={{ marginTop: 28 }}>Listen carefully</Heading>
        <Muted style={{ marginTop: 6, textAlign: 'center' }}>
          One digit each second. You will type them when the voice stops.
        </Muted>
      </View>
    );
  } else if (phase === 'memorize') {
    body = (
      <ScrollView contentContainerStyle={st.scroll} showsVerticalScrollIndicator={false}>
        <MemorizeView content={content} digitGroup={state.digitGroup} />
      </ScrollView>
    );
    footer = (
      <Button
        label={config.speed ? 'Done — stop the clock' : 'I am ready — start recall'}
        icon="arrow-forward"
        onPress={startRecall}
      />
    );
  } else if (phase === 'recall') {
    body = (
      <ScrollView
        contentContainerStyle={st.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <RecallView content={content} answers={answers} setAnswers={(fn) => setAnswers(fn)} />
      </ScrollView>
    );
    footer = <Button label="Finish and see my score" icon="checkmark" onPress={finish} />;
  } else if (phase === 'results' && score) {
    const pct = score.max ? score.score / score.max : 0;
    const speedWin = config.speed && score.perfect;
    const message = score.perfect
      ? 'Perfect. Every single one.'
      : pct >= 0.7
        ? 'Strong round. You are getting it.'
        : pct >= 0.35
          ? 'Good start. The pictures get easier each time.'
          : 'This is how everyone begins. Make the pictures bigger and sillier.';
    body = (
      <ScrollView contentContainerStyle={st.scroll} showsVerticalScrollIndicator={false}>
        <View style={st.resultCard}>
          <Eyebrow>{config.lessonId ? 'Lesson practice' : config.title}</Eyebrow>
          {speedWin ? (
            <Text style={st.score}>{formatTime(memUsed)}</Text>
          ) : (
            <Text style={st.score}>
              {score.score}
              <Text style={st.scoreMax}> / {score.max}</Text>
            </Text>
          )}
          <Body style={{ textAlign: 'center' }}>
            {speedWin ? 'Whole deck correct. That is your time.' : score.detail}
          </Body>
          {isBest ? (
            <View style={st.best}>
              <Ionicons name="trophy" size={14} color={colors.bg} />
              <Text style={st.bestText}>New personal best</Text>
            </View>
          ) : null}
          <Muted style={{ marginTop: 12, textAlign: 'center' }}>{message}</Muted>
          {!isSpoken ? (
            <Muted style={{ marginTop: 4 }}>Memorising time used: {formatTime(memUsed)}</Muted>
          ) : null}
        </View>
        {config.lessonId ? (
          <View style={st.lessonDone}>
            <Ionicons name="checkmark-circle" size={22} color={colors.success} />
            <Text style={{ color: colors.text, fontWeight: '700', flex: 1 }}>
              Lesson complete{nextLesson ? ' — the next one is unlocked.' : '. You finished the course!'}
            </Text>
          </View>
        ) : null}
        <Heading style={{ marginTop: 26, marginBottom: 6 }}>Check your answers</Heading>
        <Muted style={{ marginBottom: 8 }}>The correct answer is shown with what you gave.</Muted>
        <ReviewView content={content} answers={answers} />
      </ScrollView>
    );
    footer = (
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Button
          label="Again"
          variant="ghost"
          icon="refresh"
          style={{ flex: 1 }}
          onPress={() => navigation.replace('Session', { config: { ...config } })}
        />
        <Button label="Done" style={{ flex: 1 }} onPress={() => navigation.goBack()} />
      </View>
    );
  }

  return (
    <SafeAreaView style={st.screen} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={st.frame}>
          {header}
          <View style={{ flex: 1 }}>{body}</View>
          {footer ? <View style={st.footer}>{footer}</View> : null}
        </View>
      </KeyboardAvoidingView>
      {confirmExit ? (
        <View style={st.overlay}>
          <View style={st.dialog}>
            <Heading>Stop this round?</Heading>
            <Muted style={{ marginTop: 6, marginBottom: 18 }}>Your progress in this round will not be saved.</Muted>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button label="Keep going" style={{ flex: 1 }} onPress={() => setConfirmExit(false)} />
              <Button label="Stop" variant="ghost" style={{ flex: 1 }} onPress={() => navigation.goBack()} />
            </View>
          </View>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  frame: { flex: 1, width: '100%', maxWidth: 560, alignSelf: 'center' },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12, gap: 10 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  phase: { color: colors.gold, fontSize: 11, letterSpacing: 2, fontWeight: '700', textTransform: 'uppercase' },
  timer: { color: colors.text, fontFamily: fonts.mono, fontSize: 26, fontWeight: '700', marginTop: 2 },
  scroll: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 30 },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
    backgroundColor: colors.bg,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
  bigCount: { color: colors.gold, fontFamily: fonts.serif, fontSize: 120, lineHeight: 140, fontWeight: '600' },
  pulse: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#1A1509',
    borderWidth: 1,
    borderColor: '#4A3B1C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultCard: {
    alignItems: 'center',
    backgroundColor: '#15120B',
    borderColor: '#4A3B1C',
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingVertical: 28,
    paddingHorizontal: 20,
    marginTop: 12,
  },
  score: { color: colors.goldLight, fontFamily: fonts.serif, fontSize: 64, lineHeight: 76, fontWeight: '600', marginTop: 6 },
  scoreMax: { color: colors.muted, fontSize: 26 },
  best: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.gold,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    marginTop: 14,
  },
  bestText: { color: colors.bg, fontWeight: '800', fontSize: 12.5 },
  lessonDone: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: '#0F1C17',
    borderWidth: 1,
    borderColor: '#1F4435',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000B8',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  dialog: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.surface2,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 22,
  },
});
