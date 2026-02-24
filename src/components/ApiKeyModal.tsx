import React, { useState } from 'react';
import { Key, X, ExternalLink } from 'lucide-react';
import type { ApiKeys } from '../types/meeting';

interface Props {
  onSave: (keys: ApiKeys) => void;
  onClose: () => void;
  initial?: ApiKeys;
}

export default function ApiKeyModal({ onSave, onClose, initial }: Props) {
  const [groqKey, setGroqKey] = useState(initial?.groqKey || '');
  const [openRouterKey, setOpenRouterKey] = useState(initial?.openRouterKey || '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="glass-card p-8 max-w-lg w-full fade-in">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 rounded-xl">
              <Key className="w-5 h-5 text-indigo-400" />
            </div>
            <h2 className="text-xl font-semibold">API Keys instellen</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Groq API Key
              <span className="text-gray-500 font-normal"> — voor Whisper transcriptie</span>
            </label>
            <input
              type="password"
              className="input-field"
              placeholder="gsk_..."
              value={groqKey}
              onChange={(e) => setGroqKey(e.target.value)}
            />
            <a
              href="https://console.groq.com/keys"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 mt-1.5"
            >
              Key aanmaken bij Groq <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              OpenRouter API Key
              <span className="text-gray-500 font-normal"> — voor samenvatting & analyse</span>
            </label>
            <input
              type="password"
              className="input-field"
              placeholder="sk-or-..."
              value={openRouterKey}
              onChange={(e) => setOpenRouterKey(e.target.value)}
            />
            <a
              href="https://openrouter.ai/keys"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 mt-1.5"
            >
              Key aanmaken bij OpenRouter <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <button
            onClick={() => onSave({ groqKey, openRouterKey })}
            disabled={!groqKey || !openRouterKey}
            className="btn-primary w-full mt-2"
          >
            Opslaan
          </button>
        </div>
      </div>
    </div>
  );
}
