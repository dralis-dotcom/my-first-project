import Anthropic from '@anthropic-ai/sdk';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SavedMnemonic } from './store';

const KEY_NAME = 'anthropic_api_key';

// The key is kept in the phone's encrypted storage (Keystore / Keychain).
// On the web preview there is no secure store, so it falls back to local storage.
export async function getApiKey(): Promise<string> {
  try {
    if (Platform.OS === 'web') return (await AsyncStorage.getItem(KEY_NAME)) ?? '';
    return (await SecureStore.getItemAsync(KEY_NAME)) ?? '';
  } catch {
    return '';
  }
}

export async function setApiKey(key: string): Promise<void> {
  const k = key.trim();
  if (Platform.OS === 'web') {
    if (k) await AsyncStorage.setItem(KEY_NAME, k);
    else await AsyncStorage.removeItem(KEY_NAME);
    return;
  }
  if (k) await SecureStore.setItemAsync(KEY_NAME, k);
  else await SecureStore.deleteItemAsync(KEY_NAME);
}

export type MnemonicDraft = Omit<SavedMnemonic, 'id' | 'date'>;

const SYSTEM = `You are a medical memory coach inside a study app for medical students, nurses and doctors.
The user gives you a medical topic or a list of facts they must memorise. You build a memory aid for it.

Accuracy comes first. Only include facts that are standard, textbook-level medicine. If the topic is a list (causes, features, side effects, branches, criteria), include the items a mainstream textbook would list. Never invent a fact to make the mnemonic fit; change the mnemonic instead.

Write in very simple, everyday English, as if the reader is new to both medicine and memory techniques. Short sentences.

Return these fields:
- title: a short clear name for the topic.
- mnemonic: one catchy acronym, phrase or sentence that encodes the facts. If a well-known classic mnemonic exists and is accurate, prefer it.
- parts: one entry per letter or word of the mnemonic. "cue" is the letter or word, "meaning" is the medical fact it stands for, with a few plain words of explanation.
- location: one specific, familiar place where the story happens (for example "a hospital cafeteria at lunch time"). It should suit the topic.
- story: a vivid, funny, slightly absurd short story of 5 to 9 sentences set in that location. Every fact from "parts" must appear as a concrete, moving image, in the same order as the mnemonic. Write the image words in CAPITALS.
- imageKey: one entry per image in the story. "cue" is the image or character, "meaning" is the medical fact it refers to.
- tip: one sentence on how to review this (for example which stop of a memory palace to place it on, or when to review it again).`;

const SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    mnemonic: { type: 'string' },
    parts: {
      type: 'array',
      items: {
        type: 'object',
        properties: { cue: { type: 'string' }, meaning: { type: 'string' } },
        required: ['cue', 'meaning'],
        additionalProperties: false,
      },
    },
    location: { type: 'string' },
    story: { type: 'string' },
    imageKey: {
      type: 'array',
      items: {
        type: 'object',
        properties: { cue: { type: 'string' }, meaning: { type: 'string' } },
        required: ['cue', 'meaning'],
        additionalProperties: false,
      },
    },
    tip: { type: 'string' },
  },
  required: ['title', 'mnemonic', 'parts', 'location', 'story', 'imageKey', 'tip'],
  additionalProperties: false,
} as const;

export class AiError extends Error {}

export async function generateMnemonic(topic: string): Promise<MnemonicDraft> {
  const apiKey = await getApiKey();
  if (!apiKey) throw new AiError('NO_KEY');

  // The request goes straight from the phone to Anthropic with the user's own key.
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true, maxRetries: 1 });

  try {
    const response = await client.beta.messages.create({
      model: 'claude-opus-5-5',
      max_tokens: 16000,
      // If the main model declines a request, the API retries it on a fallback model.
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      system: SYSTEM,
      output_config: { format: { type: 'json_schema', schema: SCHEMA } },
      messages: [{ role: 'user', content: `Topic to memorise:\n${topic.trim()}` }],
    });

    if (response.stop_reason === 'refusal') {
      throw new AiError('The AI could not help with this topic. Try wording it as a study topic.');
    }
    if (response.stop_reason === 'max_tokens') {
      throw new AiError('The answer was too long. Try a smaller topic.');
    }
    let text = '';
    for (const block of response.content) {
      if (block.type === 'text') text += block.text;
    }
    const data = JSON.parse(text) as Omit<MnemonicDraft, 'topic'>;
    return { ...data, topic: topic.trim() };
  } catch (error) {
    if (error instanceof AiError) throw error;
    if (error instanceof Anthropic.AuthenticationError) {
      throw new AiError('Your AI key was not accepted. Check it in Settings.');
    }
    if (error instanceof Anthropic.PermissionDeniedError) {
      throw new AiError('Your AI key is not allowed to use this model.');
    }
    if (error instanceof Anthropic.RateLimitError) {
      throw new AiError('Too many requests right now. Wait a minute and try again.');
    }
    if (error instanceof Anthropic.APIConnectionError) {
      throw new AiError('No internet connection. The AI mnemonic maker needs to be online.');
    }
    if (error instanceof Anthropic.APIError) {
      throw new AiError(`The AI service returned an error (${error.status ?? 'unknown'}). Please try again.`);
    }
    if (error instanceof SyntaxError) {
      throw new AiError('The AI answer could not be read. Please try again.');
    }
    throw new AiError('Something went wrong. Please try again.');
  }
}
