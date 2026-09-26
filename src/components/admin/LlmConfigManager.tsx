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
  Key,
  Globe,
  Loader2,
  X,
  ShieldCheck,
  Check,
  Layers,
  Workflow,
  Sparkles,
  Bot,
  FileQuestion,
  FileText,
  MessageSquare,
  CheckSquare,
  BarChart2,
  Binary,
  Scan
} from 'lucide-react';
import ApiServices from '../../services/ApiServices';

export interface LLMConfigItem {
  id: number;
  name?: string;
  displayTitle?: string;
  providerType?: string;
  providerName?: string;
  baseUrl?: string | null;
  apiKey?: string | null;
  apiKeyMasked?: string;
  hasApiKey?: boolean;
  modelName: string;
  timeoutSeconds?: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ScenarioItem {
  id: number;
  scenario: string;
  label: string;
  description: string;
  providerId: number;
  providerName: string;
  providerType: string;
  modelName: string;
  temperature?: number;
  maxTokens?: number;
}



const SCENARIO_ICONS: Record<string, React.ReactNode> = {
  exam_generation: <FileQuestion className="w-4 h-4 text-amber-600" />,
  pdf_generation: <FileText className="w-4 h-4 text-blue-600" />,
  doubt_chat: <MessageSquare className="w-4 h-4 text-emerald-600" />,
  evaluation: <CheckSquare className="w-4 h-4 text-purple-600" />,
  diagnostic: <BarChart2 className="w-4 h-4 text-rose-600" />,
  embeddings: <Binary className="w-4 h-4 text-cyan-600" />,
  vision_ocr: <Scan className="w-4 h-4 text-indigo-600" />
};

export const LlmConfigManager: React.FC = () => {
  // Tabs: 'providers' | 'scenarios'
  const [activeTab, setActiveTab] = useState<'providers' | 'scenarios'>('providers');

  // Provider list state
  const [configs, setConfigs] = useState<LLMConfigItem[]>([]);
  const [scenarios, setScenarios] = useState<ScenarioItem[]>([]);
  const [scenarioAssignments, setScenarioAssignments] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [providerFilter, setProviderFilter] = useState('ALL');

  // Modal State for Add / Edit Provider (5-Field minimal form)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<LLMConfigItem | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [savingScenarios, setSavingScenarios] = useState(false);

  // Form State
  const [formDisplayName, setFormDisplayName] = useState('');
  const [formProviderType, setFormProviderType] = useState('gemini');
  const [formModelName, setFormModelName] = useState('gemini-2.0-flash');
  const [formBaseUrl, setFormBaseUrl] = useState('');
  const [formApiKey, setFormApiKey] = useState('');
  const [formTimeoutSeconds, setFormTimeoutSeconds] = useState<number>(600);
  const [formIsActive, setFormIsActive] = useState<boolean>(true);

  // Test states
  const [testingId, setTestingId] = useState<number | null>(null);
  const [activatingId, setActivatingId] = useState<number | null>(null);
  const [modalTesting, setModalTesting] = useState(false);
  const [testResults, setTestResults] = useState<Record<number, { success: boolean; latency_ms?: number; message?: string }>>({});
  const [modalTestResult, setModalTestResult] = useState<{ success: boolean; latency_ms?: number; message?: string } | null>(null);

  // Feedback Notification
  const [alertBanner, setAlertBanner] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlertBanner({ type, message });
    setTimeout(() => {
      setAlertBanner(null);
    }, 5000);
  };

  // Load All Configs & Scenarios
  const loadData = async () => {
    setLoading(true);
    try {
      const [provRes, scenRes] = await Promise.all([
        ApiServices.getLlmConfigs().catch(() => null),
        ApiServices.getLlmScenarios().catch(() => null)
      ]);

      if (provRes && Array.isArray(provRes.configs)) {
        setConfigs(provRes.configs);
      } else {
        setConfigs([]);
      }

      if (scenRes && Array.isArray(scenRes.scenarios)) {
        setScenarios(scenRes.scenarios);
        const map: Record<string, number> = {};
        scenRes.scenarios.forEach((s: ScenarioItem) => {
          map[s.scenario] = s.providerId;
        });
        setScenarioAssignments(map);
      }
    } catch (err: any) {
      showAlert('error', err.response?.data?.message || 'Failed to load LLM configurations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Open Modal for Add
  const handleOpenAddModal = () => {
    setEditingConfig(null);
    setFormDisplayName('');
    setFormProviderType('');
    setFormModelName('');
    setFormBaseUrl('');
    setFormApiKey('');
    setFormTimeoutSeconds(600);
    setFormIsActive(true);
    setShowApiKey(false);
    setModalTestResult(null);
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEditModal = (item: LLMConfigItem) => {
    setEditingConfig(item);
    setFormDisplayName(item.name || item.displayTitle || '');
    setFormProviderType(item.providerType || item.providerName || '');
    setFormModelName(item.modelName || '');
    setFormBaseUrl(item.baseUrl || '');
    setFormApiKey(''); // Leave empty to keep existing key
    setFormTimeoutSeconds(item.timeoutSeconds || 600);
    setFormIsActive(item.isActive);
    setShowApiKey(false);
    setModalTestResult(null);
    setIsModalOpen(true);
  };

  // Save Provider (Add / Edit)
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDisplayName.trim() || !formModelName.trim()) {
      showAlert('error', 'Display Name and Model Name are required.');
      return;
    }

    setSubmitting(true);
    try {
      const payload: any = {
        name: formDisplayName.trim(),
        displayTitle: formDisplayName.trim(),
        providerType: formProviderType.trim().toLowerCase(),
        providerName: formProviderType.trim().toLowerCase(),
        modelName: formModelName.trim(),
        baseUrl: formBaseUrl.trim() || undefined,
        timeoutSeconds: Number(formTimeoutSeconds) || 600,
        isActive: formIsActive
      };

      if (formApiKey.trim()) {
        payload.apiKey = formApiKey.trim();
      }

      if (editingConfig) {
        const res = await ApiServices.updateLlmConfig(editingConfig.id, payload);
        if (res) {
          showAlert('success', res.message || 'LLM Provider updated successfully');
          setIsModalOpen(false);
          await loadData();
        }
      } else {
        const res = await ApiServices.createLlmConfig(payload);
        if (res) {
          showAlert('success', res.message || 'New LLM Provider created successfully');
          setIsModalOpen(false);
          await loadData();
        }
      }
    } catch (err: any) {
      showAlert('error', err.response?.data?.message || 'Failed to save configuration');
    } finally {
      setSubmitting(false);
    }
  };

  // Live Test from Modal
  const handleTestModal = async () => {
    if (!editingConfig) {
      showAlert('error', 'Please save the provider first to run live test verification.');
      return;
    }
    setModalTesting(true);
    setModalTestResult(null);
    try {
      const res: any = await ApiServices.testLlmConfig(editingConfig.id);
      const dataObj = (res && typeof res === 'object' && ('success' in res || 'status' in res)) ? res : (res?.data || res || {});
      const isSuccess = Boolean(dataObj.success === true || dataObj.status === true);
      const msg = dataObj.msg || dataObj.message || (isSuccess ? 'Verified Successfully' : 'Test failed');
      const latency = dataObj.latencyMs || dataObj.latency_ms;

      setModalTestResult({
        success: isSuccess,
        latency_ms: latency,
        message: msg
      });
    } catch (err: any) {
      const errMsg = err.response?.data?.data?.msg || err.response?.data?.data?.message || err.response?.data?.message || err.message || 'Connection test failed';
      setModalTestResult({
        success: false,
        message: errMsg
      });
    } finally {
      setModalTesting(false);
    }
  };

  // Live Test from Table Row
  const handleTestRow = async (item: LLMConfigItem) => {
    setTestingId(item.id);
    try {
      const res: any = await ApiServices.testLlmConfig(item.id);
      const dataObj = (res && typeof res === 'object' && ('success' in res || 'status' in res)) ? res : (res?.data || res || {});
      const isSuccess = Boolean(dataObj.success === true || dataObj.status === true);
      const msg = dataObj.msg || dataObj.message || (isSuccess ? 'Verified Successfully' : 'Test failed');
      const latency = dataObj.latencyMs || dataObj.latency_ms;

      setTestResults(prev => ({
        ...prev,
        [item.id]: {
          success: isSuccess,
          latency_ms: latency,
          message: msg
        }
      }));
    } catch (err: any) {
      const errMsg = err.response?.data?.data?.msg || err.response?.data?.data?.message || err.response?.data?.message || err.message || 'Connection test failed';
      setTestResults(prev => ({
        ...prev,
        [item.id]: {
          success: false,
          message: errMsg
        }
      }));
    } finally {
      setTestingId(null);
    }
  };

  // Toggle Active / Inactive Status
  const handleToggleActive = async (item: LLMConfigItem) => {
    setActivatingId(item.id);
    const targetState = !item.isActive;
    try {
      const res = await ApiServices.updateLlmConfig(item.id, { isActive: targetState });
      showAlert('success', res.message || `'${item.name || 'Provider'}' is now ${targetState ? 'Active' : 'Inactive'}`);
      await loadData();
    } catch (err: any) {
      showAlert('error', err.response?.data?.message || 'Failed to update status');
    } finally {
      setActivatingId(null);
    }
  };

  // Delete Provider
  const handleDeleteConfig = async (id: number) => {
    if (!window.confirm('Are you sure you want to remove this LLM configuration?')) return;
    try {
      const res = await ApiServices.deleteLlmConfig(id);
      if (res) {
        showAlert('success', 'Provider removed successfully');
        await loadData();
      }
    } catch (err: any) {
      showAlert('error', err.response?.data?.message || 'Failed to delete provider');
    }
  };

  // Save Scenario Assignments
  const handleSaveScenarioAssignments = async () => {
    setSavingScenarios(true);
    try {
      const assignments = Object.entries(scenarioAssignments).map(([scenario, providerId]) => ({
        scenario,
        provider_id: Number(providerId)
      }));

      const res = await ApiServices.updateLlmScenarios({ assignments });
      if (res) {
        showAlert('success', res.message || 'Scenario routing updated successfully!');
        await loadData();
      }
    } catch (err: any) {
      showAlert('error', err.response?.data?.message || 'Failed to update scenario routing');
    } finally {
      setSavingScenarios(false);
    }
  };

  // Filtered Provider configs
  const filteredConfigs = useMemo(() => {
    return configs.filter(c => {
      const name = c.name || c.displayTitle || '';
      const model = c.modelName || '';
      const prov = c.providerType || c.providerName || '';
      const url = c.baseUrl || '';

      const matchesSearch =
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prov.toLowerCase().includes(searchQuery.toLowerCase()) ||
        url.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesProvider =
        providerFilter === 'ALL' || prov.toLowerCase() === providerFilter.toLowerCase();

      return matchesSearch && matchesProvider;
    });
  }, [configs, searchQuery, providerFilter]);

  // Distinct provider types from DB configs for filtering
  const distinctProviderTypes = useMemo(() => {
    const types = new Set<string>();
    configs.forEach(c => {
      const t = (c.providerType || c.providerName || '').trim().toLowerCase();
      if (t) types.add(t);
    });
    return ['ALL', ...Array.from(types)];
  }, [configs]);

  const getProviderBadge = (provider: string) => {
    const p = (provider || '').toLowerCase();
    if (p.includes('gemini')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (p.includes('mistral')) return 'bg-orange-50 text-orange-700 border-orange-200';
    if (p.includes('openai') || p.includes('gpt')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (p.includes('claude') || p.includes('anthropic')) return 'bg-purple-50 text-purple-700 border-purple-200';
    return 'bg-stone-100 text-stone-700 border-stone-200';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* Compact Header & Tab Switcher Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-stone-200/90 shadow-xs">
        {/* 2 Tab Switch Buttons */}
        <div className="flex items-center gap-2 p-1 bg-stone-100/90 rounded-xl border border-stone-200/60 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab('providers')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2.5 px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer select-none ${
              activeTab === 'providers'
                ? 'bg-amber-500 text-stone-950 shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/70'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>1. AI Providers & Credentials</span>
            <span
              className={`px-2 py-0.5 text-xs rounded-full font-mono font-bold ${
                activeTab === 'providers' ? 'bg-black/15 text-stone-950' : 'bg-stone-200 text-stone-700'
              }`}
            >
              {configs.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('scenarios')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2.5 px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer select-none ${
              activeTab === 'scenarios'
                ? 'bg-amber-500 text-stone-950 shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/70'
            }`}
          >
            <Workflow className="w-4 h-4" />
            <span>2. Scenario-Wise AI Routing</span>
            <span
              className={`px-2 py-0.5 text-xs rounded-full font-mono font-bold ${
                activeTab === 'scenarios' ? 'bg-black/15 text-stone-950' : 'bg-stone-200 text-stone-700'
              }`}
            >
              {scenarios.length || 7} Services
            </span>
          </button>
        </div>

        {/* Dynamic Contextual Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="p-2 px-3.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 hover:text-stone-900 border border-stone-200 transition-all text-sm font-semibold flex items-center gap-2 cursor-pointer shadow-2xs"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          {activeTab === 'providers' ? (
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Provider</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSaveScenarioAssignments}
              disabled={savingScenarios}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {savingScenarios ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 stroke-[2.5]" />}
              <span>Save Scenario Routing</span>
            </button>
          )}
        </div>
      </div>

      {/* Alert Banner */}
      {alertBanner && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-semibold shadow-sm animate-in fade-in duration-200 ${alertBanner.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
        >
          <div className="flex items-center gap-2.5">
            {alertBanner.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            )}
            <span>{alertBanner.message}</span>
          </div>
          <button onClick={() => setAlertBanner(null)} className="text-stone-400 hover:text-stone-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 1: AI PROVIDERS & CREDENTIALS                            */}
      {/* ============================================================ */}
      {activeTab === 'providers' && (
        <div className="space-y-4">
          {/* Search and Filters Bar */}
          <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by provider, model name, or endpoint URL..."
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

            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              <span className="text-xs font-bold text-stone-500 mr-1 flex-shrink-0">Provider:</span>
              {distinctProviderTypes.map((prov) => (
                <button
                  key={prov}
                  onClick={() => setProviderFilter(prov)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition-colors flex-shrink-0 ${providerFilter === prov
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                >
                  {prov}
                </button>
              ))}
            </div>
          </div>

          {/* Providers Table */}
          <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-stone-400">
                <Loader2 className="w-8 h-8 animate-spin text-amber-600 mb-3" />
                <p className="text-sm font-semibold text-stone-600">Loading AI providers from database...</p>
              </div>
            ) : filteredConfigs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-stone-400">
                <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center mb-3">
                  <Cpu className="w-7 h-7 text-stone-400" />
                </div>
                <p className="text-base font-bold text-stone-700">No LLM providers found</p>
                <p className="text-xs text-stone-500 mt-1 max-w-sm text-center">
                  Click "Add Provider" above to configure your Google Gemini, Mistral, OpenAI, Claude, or Ollama model.
                </p>
                <button
                  onClick={handleOpenAddModal}
                  className="mt-4 px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-colors"
                >
                  Add First Provider
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-stone-50/80 border-b border-stone-200/80 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                      <th className="py-3.5 px-4 w-16">ID</th>
                      <th className="py-3.5 px-4">Provider & Name</th>
                      <th className="py-3.5 px-4">Model & Endpoint</th>
                      <th className="py-3.5 px-4">API Key</th>
                      <th className="py-3.5 px-4 text-center">Status</th>
                      <th className="py-3.5 px-4">Live Test</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-xs">
                    {filteredConfigs.map((item) => {
                      const testRes = testResults[item.id];
                      const isTesting = testingId === item.id;
                      const providerType = item.providerType || item.providerName || 'gemini';

                      return (
                        <tr
                          key={item.id}
                          className={`hover:bg-amber-50/30 transition-colors ${item.isActive ? 'bg-amber-50/20' : ''
                            }`}
                        >
                          {/* ID Column (Clean Integer) */}
                          <td className="py-4 px-4 font-mono font-bold text-stone-600">
                            #{item.id}
                          </td>

                          {/* Provider & Name */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-9 h-9 rounded-xl flex items-center justify-center border font-bold text-xs uppercase ${getProviderBadge(
                                  providerType
                                )}`}
                              >
                                {providerType.substring(0, 2)}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-stone-900">
                                    {item.name || item.displayTitle || 'AI Provider'}
                                  </span>
                                </div>
                                <span className="text-[11px] text-stone-500 capitalize">{providerType}</span>
                              </div>
                            </div>
                          </td>

                          {/* Model & Endpoint */}
                          <td className="py-4 px-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <code className="px-2 py-0.5 bg-stone-100 border border-stone-200 rounded text-stone-800 font-mono text-[11px] font-bold">
                                  {item.modelName}
                                </code>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 font-mono">
                                  ⏱️ {item.timeoutSeconds || 600}s
                                </span>
                              </div>
                              <div
                                className="text-[11px] text-stone-400 font-mono truncate max-w-xs"
                                title={item.baseUrl || 'Default Cloud Endpoint'}
                              >
                                {item.baseUrl || 'Default Cloud Endpoint'}
                              </div>
                            </div>
                          </td>

                          {/* API Key */}
                          <td className="py-4 px-4">
                            {item.hasApiKey || item.apiKeyMasked ? (
                              <span className="text-[11px] font-mono text-stone-700 font-medium">
                                {item.apiKeyMasked || '••••••••'}
                              </span>
                            ) : (
                              <span className="text-[11px] font-mono font-bold text-stone-400">
                                NA
                              </span>
                            )}
                          </td>

                          {/* Active Status Toggle Switch (Compact Green active / Red inactive with icons) */}
                          <td className="py-4 px-4 text-center">
                            <div className="flex items-center justify-center">
                              <button
                                type="button"
                                onClick={() => handleToggleActive(item)}
                                disabled={activatingId === item.id}
                                className={`relative inline-flex h-5 w-9.5 flex-shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none select-none shadow-inner ${
                                  item.isActive ? 'bg-[#5cb85c]' : 'bg-[#e74c3c]'
                                }`}
                                title={item.isActive ? 'Active (Click to deactivate)' : 'Inactive (Click to activate)'}
                              >
                                {/* Left icon: Checkmark when Active */}
                                <span
                                  className={`absolute left-1 flex items-center justify-center transition-opacity duration-150 pointer-events-none ${
                                    item.isActive ? 'opacity-100' : 'opacity-0'
                                  }`}
                                >
                                  <Check className="w-2.5 h-2.5 text-white stroke-[3.5]" />
                                </span>

                                {/* Right icon: Cross when Inactive */}
                                <span
                                  className={`absolute right-1 flex items-center justify-center transition-opacity duration-150 pointer-events-none ${
                                    !item.isActive ? 'opacity-100' : 'opacity-0'
                                  }`}
                                >
                                  <X className="w-2.5 h-2.5 text-white stroke-[3.5]" />
                                </span>

                                {/* Circular Slider Thumb */}
                                <span
                                  className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-md ring-0 transition-transform duration-200 ease-in-out flex items-center justify-center ${
                                    item.isActive ? 'translate-x-5' : 'translate-x-1'
                                  }`}
                                >
                                  {activatingId === item.id && (
                                    <Loader2 className="w-2 h-2 animate-spin text-stone-500" />
                                  )}
                                </span>
                              </button>
                            </div>
                          </td>

                          {/* Live Test Status */}
                          <td className="py-4 px-4">
                            {isTesting ? (
                              <div className="flex items-center gap-1.5 text-xs text-amber-600 font-semibold">
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Testing...</span>
                              </div>
                            ) : testRes ? (
                              testRes.success ? (
                                <div
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 truncate max-w-xs"
                                  title={testRes.message}
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                                  <span className="truncate">{testRes.message || `${testRes.latency_ms}ms (OK)`}</span>
                                </div>
                              ) : (
                                <div
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 truncate max-w-xs"
                                  title={testRes.message}
                                >
                                  <XCircle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                                  <span className="truncate">{testRes.message}</span>
                                </div>
                              )
                            ) : (
                              <span className="text-[11px] text-stone-400 italic">Not tested yet</span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => handleTestRow(item)}
                                disabled={isTesting}
                                className="p-2 text-amber-600 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 rounded-xl transition-all shadow-2xs cursor-pointer flex items-center justify-center disabled:opacity-50"
                                title="Live Connection Test"
                              >
                                {isTesting ? (
                                  <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                                ) : (
                                  <Zap className="w-4 h-4 stroke-[2.2]" />
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(item)}
                                className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200/80 rounded-xl transition-all shadow-2xs cursor-pointer flex items-center justify-center"
                                title="Edit Provider"
                              >
                                <Edit2 className="w-4 h-4 stroke-[2.2]" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteConfig(item.id)}
                                className="p-2 text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 rounded-xl transition-all shadow-2xs cursor-pointer flex items-center justify-center"
                                title="Delete Provider"
                              >
                                <Trash2 className="w-4 h-4 stroke-[2.2]" />
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
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: SCENARIO-WISE DYNAMIC ROUTING (Grid Overview Layout)  */}
      {/* ============================================================ */}
      {activeTab === 'scenarios' && (
        <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden">
          {/* Header Title Bar */}
          <div className="px-5 py-3.5 border-b border-stone-200/80 bg-stone-50/40 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-stone-700 uppercase tracking-wider">
              <Workflow className="w-4 h-4 text-stone-500" />
              <span>Scenario Routing Overview</span>
            </div>
          </div>

          {/* Grid Table Layout matching 2nd picture */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 border-stone-200/80">
            {scenarios.map((scen) => {
              const currentProviderId = scenarioAssignments[scen.scenario] || scen.providerId;
              const temp = scen.temperature !== undefined ? scen.temperature : 0.3;
              const maxTok = scen.maxTokens || 2048;

              return (
                <div
                  key={scen.scenario}
                  className="p-4 border-b border-r border-stone-200/80 hover:bg-stone-50/60 transition-colors flex flex-col justify-between space-y-2.5"
                >
                  {/* Top: Icon + Scenario Name */}
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="flex-shrink-0 text-stone-600">
                      {SCENARIO_ICONS[scen.scenario] || <Bot className="w-4 h-4" />}
                    </span>
                    <span className="text-sm font-bold text-stone-900 truncate" title={scen.label}>
                      {scen.label}
                    </span>
                  </div>

                  {/* Middle: Assigned Provider Selector in Blue */}
                  <div className="relative">
                    <select
                      value={currentProviderId}
                      onChange={(e) => {
                        const newId = Number(e.target.value);
                        setScenarioAssignments((prev) => ({
                          ...prev,
                          [scen.scenario]: newId,
                        }));
                      }}
                      className="w-full text-sm font-bold text-blue-600 hover:text-blue-700 bg-transparent border-0 p-0 pr-4 focus:ring-0 focus:outline-none cursor-pointer truncate"
                      title="Select Assigned LLM Engine"
                    >
                      {configs.map((p) => (
                        <option key={p.id} value={p.id} className="text-stone-900 font-medium">
                          {p.name || p.displayTitle}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Bottom: Parameters (t=0.3 • 2048 tok) */}
                  <div className="text-xs text-stone-500 font-mono tracking-tight flex items-center gap-1.5">
                    <span>t={temp}</span>
                    <span>•</span>
                    <span>{maxTok} tok</span>
                  </div>
                </div>
              );
            })}

            {/* Empty shaded placeholder cell for 4-column alignment */}
            {scenarios.length % 4 !== 0 && (
              <div className="hidden lg:block p-4 border-b border-r border-stone-200/80 bg-stone-50/40" />
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 5-FIELD CLEAN MODAL (Matching Reference UI Design)            */}
      {/* ============================================================ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-stone-200 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900">
                    {editingConfig ? 'Edit LLM Provider' : 'Add LLM Provider'}
                  </h3>
                  <p className="text-xs text-stone-500">
                    Enter direct credentials and endpoint for your AI engine.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveConfig} className="p-6 space-y-4">

              {/* Row 1: Display Name & Provider Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    DISPLAY NAME <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Gemini Flash / Mistral Local"
                    value={formDisplayName}
                    onChange={(e) => setFormDisplayName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    PROVIDER TYPE <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="gemini / mistral / openai / ollama / mistral_local"
                    value={formProviderType}
                    onChange={(e) => setFormProviderType(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-stone-900 font-mono"
                  />
                </div>
              </div>

              {/* Row 2: Model Name & Timeout */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    MODEL NAME <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Cpu className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="gemini-2.0-flash / mistral-small-latest / mistral:latest"
                      value={formModelName}
                      onChange={(e) => setFormModelName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-xs border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-stone-900 font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    TIMEOUT (SEC) <span className="text-stone-400 font-normal">(def: 600)</span>
                  </label>
                  <div className="relative">
                    <Zap className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      min={5}
                      max={3600}
                      placeholder="600"
                      value={formTimeoutSeconds}
                      onChange={(e) => setFormTimeoutSeconds(Number(e.target.value) || 600)}
                      className="w-full pl-9 pr-3 py-2.5 text-xs border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-stone-900 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Row 3: Base URL (Full Width - Wide so nothing is truncated) */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  BASE URL / FULL ENDPOINT <span className="text-stone-400 font-normal">(optional - e.g. http://122.163.121.176:3041/api/chat)</span>
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="http://122.163.121.176:3041/api/chat or https://api.mistral.ai/v1/chat/completions"
                    value={formBaseUrl}
                    onChange={(e) => setFormBaseUrl(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-stone-900 font-mono"
                  />
                </div>
              </div>

              {/* Row 4: API Key */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  API KEY <span className="text-stone-400 font-normal">(blank for local models)</span>
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    placeholder={editingConfig?.hasApiKey ? '•••••••• (leave empty to keep existing)' : 'Enter API Key...'}
                    value={formApiKey}
                    onChange={(e) => setFormApiKey(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 text-xs border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-stone-900 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Modal Connection Test Button (When editing existing provider) */}
              {editingConfig && (
                <div className="flex items-center justify-end pt-1">
                  <button
                    type="button"
                    onClick={handleTestModal}
                    disabled={modalTesting}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-xl border border-amber-200 transition-colors cursor-pointer"
                  >
                    {modalTesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                    <span>Test Connection</span>
                  </button>
                </div>
              )}

              {/* Modal Test Result Banner */}
              {modalTestResult && (
                <div
                  className={`p-3 rounded-xl border text-xs font-medium flex items-center gap-2 ${modalTestResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                    }`}
                >
                  {modalTestResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  )}
                  <span className="truncate">{modalTestResult.message}</span>
                </div>
              )}

              {/* Footer Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-stone-100">
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
                  <span>Save Provider</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LlmConfigManager;
