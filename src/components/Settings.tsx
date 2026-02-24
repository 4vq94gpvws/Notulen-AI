import React, { useState } from 'react';
import { AppSettings } from '../types/meeting';
import { saveSettings } from '../lib/storage';
import { Settings as SettingsIcon, Eye, EyeOff, Save, ExternalLink } from 'lucide-react';

interface Props {
  settings: AppSettings;
  onSave: (s: AppSettings) => void;
  onClose: () => void;
}

const MODELS = [
  { value: 'meta-llama/llama-3.3-70b-instruct', label: 'Llama 3.3 70B' },
  { value: 'anthropic/claude-3.5-sonnet', label: 'Claude 3.5 Sonnet' },
  { value: 'google/gemini-2.0-flash-001', label: 'Gemini 2.0 Flash' },
  { value: 'openai/gpt-4o', label: 'GPT-4o' },
  { value: 'deepseek/deepseek-chat', label: 'DeepSeek V3' },
  { value: 'mistralai/mistral-large-2411', label: 'Mistral Large' },
];

export default function Settings({ settings, onSave, onClose }: Props) {
  const [form, setForm] = useState(settings);
  const [showGroq, setShowGroq] = useState(false);
  const [showOR, setShowOR] = useState(false);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    saveSettings(form);
    onSave(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card p-8 max-w-lg w-full space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600/20 rounded-xl">
            <SettingsIcon className="w-6 h-6 text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold">Instellingen</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Groq API Key
              <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-1 ml-2 text-indigo-400 hover:text-indigo-300">
                Ophalen <ExternalLink className="w-3 h-3" />
              </a>
            </label>
            <div className="relative">
              <input
                type={showGroq ? 'text' : 'password'}
                className="input-field pr-12"
                placeholder="gsk_..."
                value={form.groqApiKey}
                onChange={(e) => setForm({ ...form, groqApiKey: e.target.value })}
              />
              <button
                onClick={() => setShowGroq(!showGroq)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showGroq ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-1">Wordt gebruikt voor Whisper spraak-naar-tekst</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              OpenRouter API Key
              <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-1 ml-2 text-indigo-400 hover:text-indigo-300">
                Ophalen <ExternalLink className="w-3 h-3" />
              </a>
            </label>
            <div className="relative">
              <input
                type={showOR ? 'text' : 'password'}
                className="input-field pr-12"
                placeholder="sk-or-..."
                value={form.openRouterApiKey}
                onChange={(e) => setForm({ ...form, openRouterApiKey: e.target.value })}
              />
              <button
                onClick={() => setShowOR(!showOR)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showOR ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-1">Wordt gebruikt voor AI-analyse van het transcript</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">AI Model</label>
            <select
              className="input-field"
              value={form.openRouterModel}
              onChange={(e) => setForm({ ...form, openRouterModel: e.target.value })}
            >
              {MODELS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={handleSave} className="btn-primary flex items-center gap-2 flex-1 justify-center">
            <Save className="w-4 h-4" />
            {saved ? '✓ Opgeslagen!' : 'Opslaan'}
          </button>
          <button onClick={onClose} className="btn-ghost">Sluiten</button>
        </div>
      </div>
    </div>
  );
}
