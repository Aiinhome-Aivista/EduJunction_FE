import React, { useState, useEffect, useMemo } from 'react';
import {
  Cpu,
  Plus,
  Search,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Edit2,
  Trash2,
  Zap,
  Star,
  Eye,
  EyeOff,
  Server,
  Sliders,
  Clock,
  Key,
  Globe,
  Loader2,
  X,
  ChevronRight,
  ShieldCheck,
  Check,
  Activity
} from 'lucide-react';
import ApiServices from '../../services/ApiServices';

export interface LLMConfigItem {
  id: number;
  config_name: string;
  provider: string;
  base_url?: string | null;
  api_key?: string | null;
  has_api_key?: boolean;
  model_name: string;
  max_tokens: number;
  temperature: number;
  timeout_seconds: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

interface ProviderPreset {
  name: string;
  provider: string;
  defaultModel: string;
  defaultBaseUrl: string;
  requiresKey: boolean;
  badgeColor: string;
  description: string;
}

const PROVIDER_PRESETS: ProviderPreset[] = [
  {
    name: 'Google Gemini',
    provider: 'gemini',
    defaultModel: 'gemini-1.5-flash',
    defaultBaseUrl: 'https://generativelanguage.googleapis.com',
    requiresKey: true,
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    description: 'High-speed reasoning & multimodal support with Gemini 1.5'
  },
  {
    name: 'OpenAI',
    provider: 'openai',
    defaultModel: 'gpt-4o-mini',
    defaultBaseUrl: 'https://api.openai.com/v1',
    requiresKey: true,
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    description: 'Industry standard GPT-4o and GPT-4o-mini models'
  },
  {
    name: 'Anthropic Claude',
    provider: 'claude',
    defaultModel: 'claude-3-5-sonnet-20241022',
    defaultBaseUrl: 'https://api.anthropic.com/v1',
    requiresKey: true,
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    description: 'Claude 3.5 Sonnet for top academic analysis'
  },
  {
    name: 'DeepSeek',
    provider: 'deepseek',
    defaultModel: 'deepseek-chat',
    defaultBaseUrl: 'https://api.deepseek.com/v1',
    requiresKey: true,
    badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
    description: 'DeepSeek V3 / R1 reasoning engine with OpenAI-compatible API'
  },
  {
    name: 'Groq',
    provider: 'groq',
    defaultModel: 'llama-3.3-70b-versatile',
    defaultBaseUrl: 'https://api.groq.com/openai/v1',
    requiresKey: true,
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    description: 'Ultra-low latency inference for Llama 3.3 and Mixtral'
  },
  {
    name: 'Ollama (Local / Self-Hosted)',
    provider: 'ollama',
    defaultModel: 'llama3:8b',
    defaultBaseUrl: 'http://localhost:11434',
    requiresKey: false,
    badgeColor: 'bg-stone-100 text-stone-800 border-stone-300',
    description: 'On-premise zero-cost local LLM execution'
  },
  {
    name: 'Custom / OpenAI-Compatible',
    provider: 'custom',
    defaultModel: 'mistral-small-latest',
    defaultBaseUrl: 'http://localhost:8000/v1',
    requiresKey: false,
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    description: 'vLLM, LocalAI, Mistral API, or custom AI gateway'
  }
];

export const LlmConfigManager: React.FC = () => {
  const [configs, setConfigs] = useState<LLMConfigItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [providerFilter, setProviderFilter] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<LLMConfigItem | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formConfigName, setFormConfigName] = useState('');
  const [formProvider, setFormProvider] = useState('gemini');
  const [formBaseUrl, setFormBaseUrl] = useState('');
  const [formApiKey, setFormApiKey] = useState('');
  const [formModelName, setFormModelName] = useState('gemini-1.5-flash');
  const [formMaxTokens, setFormMaxTokens] = useState<number>(2048);
  const [formTemperature, setFormTemperature] = useState<number>(0.7);
  const [formTimeout, setFormTimeout] = useState<number>(60);
  const [formIsActive, setFormIsActive] = useState<boolean>(false);

  // Live Test states
  const [testingId, setTestingId] = useState<number | null>(null);
  const [modalTesting, setModalTesting] = useState(false);
  const [testResults, setTestResults] = useState<Record<number, { success: boolean; latency_ms?: number; message?: string; sample_response?: string }>>({});
  const [modalTestResult, setModalTestResult] = useState<{ success: boolean; latency_ms?: number; message?: string; sample_response?: string } | null>(null);

  // Delete State
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Feedback Notification
  const [alertBanner, setAlertBanner] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlertBanner({ type, message });
    setTimeout(() => {
      setAlertBanner(null);
    }, 5000);
  };

  // Load configs
  const loadConfigs = async () => {
    setLoading(true);
    try {
      const res = await ApiServices.getLlmConfigs();
      if (res.status === 'success' && Array.isArray(res.data)) {
        setConfigs(res.data);
      } else {
        setConfigs([]);
      }
    } catch (err: any) {
      showAlert('error', err.response?.data?.message || 'Failed to load LLM configurations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfigs();
  }, []);

  const activeConfig = useMemo(() => configs.find(c => c.is_active), [configs]);

  // Open Modal for Add
  const handleOpenAddModal = () => {
    setEditingConfig(null);
    const preset = PROVIDER_PRESETS[0];
    setFormConfigName('Google Gemini 1.5 Flash (Primary)');
    setFormProvider(preset.provider);
    setFormBaseUrl(preset.defaultBaseUrl);
    setFormModelName(preset.defaultModel);
    setFormApiKey('');
    setFormMaxTokens(2048);
    setFormTemperature(0.7);
    setFormTimeout(60);
    setFormIsActive(configs.length === 0);
    setShowApiKey(false);
    setModalTestResult(null);
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEditModal = (item: LLMConfigItem) => {
    setEditingConfig(item);
    setFormConfigName(item.config_name);
    setFormProvider(item.provider);
    setFormBaseUrl(item.base_url || '');
    setFormModelName(item.model_name);
    setFormApiKey(''); // Keep blank unless updating
    setFormMaxTokens(item.max_tokens || 2048);
    setFormTemperature(item.temperature ?? 0.7);
    setFormTimeout(item.timeout_seconds || 60);
    setFormIsActive(item.is_active);
    setShowApiKey(false);
    setModalTestResult(null);
    setIsModalOpen(true);
  };

  // Handle Provider preset change in form
  const handleSelectProvider = (provKey: string) => {
    setFormProvider(provKey);
    const preset = PROVIDER_PRESETS.find(p => p.provider === provKey);
    if (preset) {
      if (!editingConfig) {
        setFormConfigName(`${preset.name} - ${preset.defaultModel}`);
      }
      setFormBaseUrl(preset.defaultBaseUrl);
      setFormModelName(preset.defaultModel);
    }
  };

  // Save / Update LLM Config
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formConfigName.trim() || !formModelName.trim() || !formProvider) {
      showAlert('error', 'Please fill in all required fields (Config Name, Provider, Model Name)');
      return;
    }

    setSubmitting(true);
    try {
      const payload: any = {
        config_name: formConfigName.trim(),
        provider: formProvider,
        base_url: formBaseUrl.trim() || null,
        model_name: formModelName.trim(),
        max_tokens: Number(formMaxTokens),
        temperature: Number(formTemperature),
        timeout_seconds: Number(formTimeout),
        is_active: formIsActive
      };

      if (formApiKey.trim()) {
        payload.api_key = formApiKey.trim();
      }

      if (editingConfig) {
        const res = await ApiServices.updateLlmConfig(editingConfig.id, payload);
        if (res.status === 'success') {
          showAlert('success', 'LLM Configuration updated successfully');
          setIsModalOpen(false);
          await loadConfigs();
        }
      } else {
        const res = await ApiServices.createLlmConfig(payload);
        if (res.status === 'success') {
          showAlert('success', 'New LLM Configuration created successfully');
          setIsModalOpen(false);
          await loadConfigs();
        }
      }
    } catch (err: any) {
      showAlert('error', err.response?.data?.message || 'Failed to save configuration');
    } finally {
      setSubmitting(false);
    }
  };

  // Activate Config
  const handleActivate = async (id: number) => {
    try {
      const res = await ApiServices.activateLlmConfig(id);
      if (res.status === 'success') {
        showAlert('success', 'LLM Provider activated successfully for all mock tests and evaluation');
        await loadConfigs();
      }
    } catch (err: any) {
      showAlert('error', err.response?.data?.message || 'Failed to activate LLM configuration');
    }
  };

  // Test from Row
  const handleTestRow = async (item: LLMConfigItem) => {
    setTestingId(item.id);
    try {
      const res = await ApiServices.testLlmConfig({
        config_id: item.id,
        provider: item.provider,
        model_name: item.model_name
      });
      if (res.status === 'success') {
        setTestResults(prev => ({
          ...prev,
          [item.id]: {
            success: true,
            latency_ms: res.data?.latency_ms,
            message: res.data?.message || 'Connection verified successfully',
            sample_response: res.data?.sample_response
          }
        }));
      } else {
        setTestResults(prev => ({
          ...prev,
          [item.id]: {
            success: false,
            message: res.message || 'Connection test failed'
          }
        }));
      }
    } catch (err: any) {
      setTestResults(prev => ({
        ...prev,
        [item.id]: {
          success: false,
          message: err.response?.data?.message || err.message || 'Connection test failed'
        }
      }));
    } finally {
      setTestingId(null);
    }
  };

  // Test from inside Modal
  const handleTestModal = async () => {
    setModalTesting(true);
    setModalTestResult(null);
    try {
      const res = await ApiServices.testLlmConfig({
        config_id: editingConfig?.id,
        provider: formProvider,
        base_url: formBaseUrl.trim() || undefined,
        api_key: formApiKey.trim() || undefined,
        model_name: formModelName.trim(),
        temperature: Number(formTemperature),
        max_tokens: Number(formMaxTokens),
        timeout_seconds: Number(formTimeout)
      });

      if (res.status === 'success') {
        setModalTestResult({
          success: true,
          latency_ms: res.data?.latency_ms,
          message: res.data?.message || 'Test connection successful!',
          sample_response: res.data?.sample_response
        });
      } else {
        setModalTestResult({
          success: false,
          message: res.message || 'Connection failed'
        });
      }
    } catch (err: any) {
      setModalTestResult({
        success: false,
        message: err.response?.data?.message || err.message || 'Connection failed'
      });
    } finally {
      setModalTesting(false);
    }
  };

  // Delete Config
  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    setDeleting(true);
    try {
      const res = await ApiServices.deleteLlmConfig(deleteConfirmId);
      if (res.status === 'success') {
        showAlert('success', 'Configuration removed successfully');
        setDeleteConfirmId(null);
        await loadConfigs();
      }
    } catch (err: any) {
      showAlert('error', err.response?.data?.message || 'Failed to delete configuration');
    } finally {
      setDeleting(false);
    }
  };

  // Filtered configs
  const filteredConfigs = useMemo(() => {
    return configs.filter(c => {
      const matchesSearch =
        c.config_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.model_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.base_url && c.base_url.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesProvider =
        providerFilter === 'ALL' ||
        c.provider.toLowerCase() === providerFilter.toLowerCase();

      return matchesSearch && matchesProvider;
    });
  }, [configs, searchQuery, providerFilter]);

  const getProviderBadge = (provider: string) => {
    const preset = PROVIDER_PRESETS.find(p => p.provider.toLowerCase() === provider.toLowerCase());
    return preset ? preset.badgeColor : 'bg-stone-100 text-stone-700 border-stone-200';
  };

  return (
    <div className="space-y-6">
      {/* Alert Banner */}
      {alertBanner && (
        <div
          className={`flex items-center gap-3 p-4 rounded-xl border animate-fadeIn ${
            alertBanner.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {alertBanner.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
          ) : (
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          )}
          <p className="text-sm font-semibold flex-1">{alertBanner.message}</p>
          <button
            onClick={() => setAlertBanner(null)}
            className="p-1 text-stone-400 hover:text-stone-600 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header & Active Status Card */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 flex-shrink-0">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-stone-900 tracking-tight">
                  LLM Provider Configuration
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  {configs.length} Configured
                </span>
              </div>
              <p className="text-sm text-stone-500 mt-1">
                Configure AI models, API keys, endpoints, parameters, and switch active engines on-the-fly.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadConfigs}
              disabled={loading}
              className="flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-xl transition-colors"
              title="Refresh configurations"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-600' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleOpenAddModal}
              id="admin-btn-add-llm"
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 active:bg-amber-800 rounded-xl shadow-xs transition-all transform hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add LLM Config</span>
            </button>
          </div>
        </div>

        {/* Active Engine Summary Pill */}
        {activeConfig ? (
          <div className="mt-5 p-3.5 bg-gradient-to-r from-amber-500/10 via-yellow-50 to-stone-50 border border-amber-300/60 rounded-xl flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <div>
                <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                  Currently Active Engine:
                  <span className="text-amber-700 underline font-extrabold">{activeConfig.config_name}</span>
                </span>
                <div className="flex items-center gap-2 text-xs text-stone-600 mt-0.5">
                  <span className="capitalize font-semibold">{activeConfig.provider}</span>
                  <span>•</span>
                  <code className="bg-white/80 px-1.5 py-0.5 rounded border border-stone-200 text-stone-800 text-[11px] font-mono">
                    {activeConfig.model_name}
                  </code>
                  <span>•</span>
                  <span>Temp: {activeConfig.temperature}</span>
                  <span>•</span>
                  <span>Max Tokens: {activeConfig.max_tokens}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleTestRow(activeConfig)}
              disabled={testingId === activeConfig.id}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-600 text-white hover:bg-amber-700 transition-colors shadow-2xs"
            >
              {testingId === activeConfig.id ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Zap className="w-3.5 h-3.5" />
              )}
              <span>Live Test Active</span>
            </button>
          </div>
        ) : (
          <div className="mt-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-700 text-xs font-medium">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>No active LLM configuration selected. Please activate a configuration to enable AI question generation and evaluation.</span>
          </div>
        )}
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by config name, model, provider, or URL..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-stone-900"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Provider Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 custom-scrollbar">
          <span className="text-xs font-bold text-stone-500 mr-1 flex-shrink-0">Provider:</span>
          {['ALL', 'gemini', 'openai', 'claude', 'deepseek', 'groq', 'ollama', 'custom'].map((prov) => (
            <button
              key={prov}
              onClick={() => setProviderFilter(prov)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition-colors flex-shrink-0 ${
                providerFilter === prov
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {prov}
            </button>
          ))}
        </div>
      </div>

      {/* Configurations Table */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-stone-400">
            <Loader2 className="w-8 h-8 animate-spin text-amber-600 mb-3" />
            <p className="text-sm font-semibold text-stone-600">Loading configurations from master database...</p>
          </div>
        ) : filteredConfigs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-stone-400">
            <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center mb-3">
              <Cpu className="w-7 h-7 text-stone-400" />
            </div>
            <p className="text-base font-bold text-stone-700">No LLM configurations found</p>
            <p className="text-xs text-stone-500 mt-1 max-w-sm text-center">
              {searchQuery || providerFilter !== 'ALL'
                ? 'No matching configuration for your search/filter criteria.'
                : 'Click "Add LLM Config" above to add your Google Gemini, OpenAI, Claude, or local Ollama model.'}
            </p>
            {!searchQuery && providerFilter === 'ALL' && (
              <button
                onClick={handleOpenAddModal}
                className="mt-4 px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-colors"
              >
                Add First Configuration
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50/80 border-b border-stone-200/80 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Configuration & Provider</th>
                  <th className="py-3.5 px-4">Model & Endpoint</th>
                  <th className="py-3.5 px-4">Parameters</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Health / Test Result</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs">
                {filteredConfigs.map((item) => {
                  const testRes = testResults[item.id];
                  const isTesting = testingId === item.id;

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-amber-50/30 transition-colors ${
                        item.is_active ? 'bg-amber-50/20 font-medium' : ''
                      }`}
                    >
                      {/* Column 1: Config & Provider */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center border font-bold text-xs uppercase ${getProviderBadge(
                              item.provider
                            )}`}
                          >
                            {item.provider.substring(0, 2)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-stone-900">{item.config_name}</span>
                              {item.is_active && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  <Star className="w-3 h-3 fill-emerald-600 text-emerald-600" />
                                  Active
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[11px] text-stone-500 capitalize">{item.provider}</span>
                              <span className="text-stone-300">•</span>
                              <span className="text-[11px] text-stone-400">
                                {item.has_api_key ? '🔑 API Key Saved' : '🔓 No Key Required'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Model & Endpoint */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <code className="px-2 py-0.5 bg-stone-100 border border-stone-200 rounded text-stone-800 font-mono text-[11px] font-bold">
                              {item.model_name}
                            </code>
                          </div>
                          <div className="text-[11px] text-stone-400 font-mono truncate max-w-xs" title={item.base_url || 'Default Cloud URL'}>
                            {item.base_url || 'Default Cloud API Endpoint'}
                          </div>
                        </div>
                      </td>

                      {/* Column 3: Parameters */}
                      <td className="py-4 px-4">
                        <div className="text-[11px] text-stone-600 space-y-0.5">
                          <div>
                            <span className="text-stone-400">Max Tokens:</span>{' '}
                            <span className="font-semibold text-stone-800">{item.max_tokens?.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-stone-400">Temp:</span>{' '}
                            <span className="font-semibold text-stone-800">{item.temperature}</span>
                            <span className="text-stone-400 ml-2">Timeout:</span>{' '}
                            <span className="font-semibold text-stone-800">{item.timeout_seconds}s</span>
                          </div>
                        </div>
                      </td>

                      {/* Column 4: Status */}
                      <td className="py-4 px-4">
                        {item.is_active ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Primary Engine
                          </span>
                        ) : (
                          <button
                            onClick={() => handleActivate(item.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 border border-stone-200 transition-colors"
                          >
                            Set Active
                          </button>
                        )}
                      </td>

                      {/* Column 5: Test / Latency */}
                      <td className="py-4 px-4">
                        {isTesting ? (
                          <div className="flex items-center gap-1.5 text-xs text-amber-600 font-semibold">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Testing endpoint...</span>
                          </div>
                        ) : testRes ? (
                          <div className="space-y-0.5">
                            {testRes.success ? (
                              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>{testRes.latency_ms}ms (OK)</span>
                              </div>
                            ) : (
                              <div
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 truncate max-w-xs"
                                title={testRes.message}
                              >
                                <XCircle className="w-3 h-3 text-rose-600 flex-shrink-0" />
                                <span className="truncate">{testRes.message}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-stone-400 italic">Not tested yet</span>
                        )}
                      </td>

                      {/* Column 6: Actions Column */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Test Button */}
                          <button
                            onClick={() => handleTestRow(item)}
                            disabled={isTesting}
                            className="p-1.5 text-stone-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Test connection"
                          >
                            {isTesting ? (
                              <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                            ) : (
                              <Zap className="w-4 h-4" />
                            )}
                          </button>

                          {/* Edit Button */}
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                            title="Edit configuration"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => setDeleteConfirmId(item.id)}
                            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete configuration"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Add / Edit Modal ──────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50/50 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900">
                    {editingConfig ? 'Edit LLM Configuration' : 'Add New LLM Provider'}
                  </h3>
                  <p className="text-xs text-stone-500">
                    Configure endpoint credentials and parameter controls.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveConfig} className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
              {/* Provider Selector Cards */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Select Provider Preset
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PROVIDER_PRESETS.map((preset) => {
                    const isSelected = formProvider === preset.provider;
                    return (
                      <button
                        type="button"
                        key={preset.provider}
                        onClick={() => handleSelectProvider(preset.provider)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-amber-50/80 border-amber-500 ring-2 ring-amber-500/20 text-stone-900 shadow-2xs'
                            : 'bg-white border-stone-200 hover:border-stone-300 text-stone-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold truncate">{preset.name}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />}
                        </div>
                        <p className="text-[10px] text-stone-500 truncate font-mono">{preset.defaultModel}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Config Name */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Configuration Label / Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Production Google Gemini Flash"
                  value={formConfigName}
                  onChange={(e) => setFormConfigName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-stone-900"
                />
              </div>

              {/* Model Identifier & Base URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Model Name / Identifier <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. gemini-1.5-flash, gpt-4o, llama3:8b"
                    value={formModelName}
                    onChange={(e) => setFormModelName(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs border border-stone-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    API Base URL (Optional / Custom Endpoint)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. https://api.openai.com/v1 or http://localhost:11434"
                    value={formBaseUrl}
                    onChange={(e) => setFormBaseUrl(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs border border-stone-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-stone-900"
                  />
                </div>
              </div>

              {/* API Key Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-stone-700">
                    API Key {editingConfig?.has_api_key ? '(Leave empty to keep existing key)' : ''}
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="text-[11px] text-stone-500 hover:text-stone-800 flex items-center gap-1"
                  >
                    {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showApiKey ? 'Hide' : 'Show'}</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    placeholder={
                      editingConfig?.has_api_key
                        ? '••••••••••••••••••••••••••••••••'
                        : 'Enter provider API secret key...'
                    }
                    value={formApiKey}
                    onChange={(e) => setFormApiKey(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs border border-stone-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-stone-900 pr-10"
                  />
                  <Key className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                </div>
                <p className="text-[11px] text-stone-400 mt-1">
                  API keys are securely encrypted at rest in the master database.
                </p>
              </div>

              {/* Generation Parameters */}
              <div className="p-4 bg-stone-50/80 rounded-xl border border-stone-200/80 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-stone-800">
                  <Sliders className="w-4 h-4 text-stone-600" />
                  <span>Inference Parameters</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Max Tokens */}
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">
                      Max Output Tokens
                    </label>
                    <input
                      type="number"
                      min="256"
                      max="32768"
                      step="256"
                      value={formMaxTokens}
                      onChange={(e) => setFormMaxTokens(Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-xs border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 bg-white"
                    />
                    <div className="flex gap-1 mt-1.5">
                      {[1024, 2048, 4096, 8192].map((tok) => (
                        <button
                          type="button"
                          key={tok}
                          onClick={() => setFormMaxTokens(tok)}
                          className={`text-[10px] px-1.5 py-0.5 rounded border ${
                            formMaxTokens === tok
                              ? 'bg-amber-100 text-amber-800 border-amber-300 font-bold'
                              : 'bg-white text-stone-500 border-stone-200 hover:bg-stone-100'
                          }`}
                        >
                          {tok}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Temperature Slider */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[11px] font-bold text-stone-600">
                        Temperature
                      </label>
                      <span className="text-[11px] font-mono font-bold text-amber-700">
                        {formTemperature}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.0"
                      max="1.0"
                      step="0.05"
                      value={formTemperature}
                      onChange={(e) => setFormTemperature(parseFloat(e.target.value))}
                      className="w-full accent-amber-600"
                    />
                    <div className="flex justify-between text-[10px] text-stone-400 mt-1">
                      <span>0.0 (Strict)</span>
                      <span>1.0 (Creative)</span>
                    </div>
                  </div>

                  {/* Timeout */}
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">
                      Timeout (Seconds)
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="300"
                      value={formTimeout}
                      onChange={(e) => setFormTimeout(Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-xs border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 bg-white"
                    />
                    <span className="text-[10px] text-stone-400 mt-1 block">Default: 60 seconds</span>
                  </div>
                </div>
              </div>

              {/* Set Active Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="formIsActiveCheckbox"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 accent-amber-600"
                />
                <label htmlFor="formIsActiveCheckbox" className="text-xs font-bold text-stone-800 cursor-pointer">
                  Set as Active Primary LLM Engine immediately upon saving
                </label>
              </div>

              {/* Test Connection Preview inside Modal */}
              <div className="pt-2">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleTestModal}
                    disabled={modalTesting || !formModelName}
                    className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors"
                  >
                    {modalTesting ? (
                      <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                    ) : (
                      <Zap className="w-4 h-4 text-amber-600" />
                    )}
                    <span>Test Connection Before Saving</span>
                  </button>
                </div>

                {modalTestResult && (
                  <div
                    className={`mt-2.5 p-3 rounded-xl border text-xs animate-fadeIn ${
                      modalTestResult.success
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-rose-50 border-rose-200 text-rose-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold">
                      {modalTestResult.success ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-600" />
                      )}
                      <span>
                        {modalTestResult.success
                          ? `Success! Latency: ${modalTestResult.latency_ms}ms`
                          : 'Test Failed'}
                      </span>
                    </div>
                    {modalTestResult.sample_response && (
                      <p className="mt-1 text-[11px] text-stone-600 font-mono bg-white/80 p-1.5 rounded border border-emerald-200">
                        {modalTestResult.sample_response}
                      </p>
                    )}
                    {!modalTestResult.success && modalTestResult.message && (
                      <p className="mt-1 text-[11px]">{modalTestResult.message}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 active:bg-amber-800 rounded-xl shadow-xs transition-colors"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{editingConfig ? 'Update Configuration' : 'Save Configuration'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ──────────────── */}
      {deleteConfirmId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">Delete LLM Configuration?</h3>
              <p className="text-xs text-stone-500 mt-1">
                Are you sure you want to delete this provider configuration? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors"
              >
                {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LlmConfigManager;
