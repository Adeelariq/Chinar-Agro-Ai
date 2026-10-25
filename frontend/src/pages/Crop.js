import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Droplets, AlertTriangle, Brain, Leaf, Sun, CloudRain,
  FlaskConical, Layers, Hexagon, Sprout, Sparkles, Sliders,
  MapPin, Calendar, CheckCircle
} from 'lucide-react';
import { PageHeader, Card, Button, ProgressBar, SectionHeader, Tilt } from '../design-system/components';
import { pageVariants, pageTransition, fadeInLeft, fadeInRight, slideUp } from '../design-system/animations';
import { API_BASE } from '../utils/api';

const PRESETS = [
  {
    name: "Punjab Plains",
    tag: "Maize / Wheat belt",
    icon: "🌾",
    data: { Nitrogen: 100, Phosphorus: 45, Potassium: 40, Temperature: 28, Humidity: 65, pH: 7.2, Rainfall: 85, State: 'Punjab', Season: 'Kharif' }
  },
  {
    name: "Kashmir Valley",
    tag: "Maize / Apple / Rajma",
    icon: "🏔️",
    data: { Nitrogen: 70, Phosphorus: 40, Potassium: 35, Temperature: 18, Humidity: 60, pH: 6.8, Rainfall: 90, State: 'Jammu and Kashmir', Season: 'Kharif' }
  },
  {
    name: "Monsoon Basin",
    tag: "Paddy Rice belt",
    icon: "🌧️",
    data: { Nitrogen: 80, Phosphorus: 45, Potassium: 40, Temperature: 29, Humidity: 82, pH: 6.5, Rainfall: 220, State: 'West Bengal', Season: 'Kharif' }
  },
  {
    name: "Central Dryland",
    tag: "Cotton & Pulses",
    icon: "🌿",
    data: { Nitrogen: 60, Phosphorus: 35, Potassium: 30, Temperature: 27, Humidity: 50, pH: 7.5, Rainfall: 65, State: 'Maharashtra', Season: 'Kharif' }
  }
];

const STATES = [
  'Punjab', 'Jammu and Kashmir', 'Haryana', 'Uttar Pradesh', 'Maharashtra',
  'Rajasthan', 'Madhya Pradesh', 'West Bengal', 'Bihar', 'Gujarat',
  'Karnataka', 'Kerala', 'Tamil Nadu', 'Andhra Pradesh', 'Himachal Pradesh'
];

const SEASONS = ['Kharif', 'Rabi', 'Zaid'];

const Crop = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    Nitrogen: 100, Phosphorus: 45, Potassium: 40,
    Temperature: 28, Humidity: 65, pH: 7.2, Rainfall: 85,
    State: 'Punjab', Season: 'Kharif'
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [aiAdvice, setAiAdvice] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const applyPreset = (preset) => {
    setFormData({ ...preset.data });
    setError(null);
  };

  const handleAskAI = async () => {
    setAiLoading(true);
    try {
      const { data } = await axios.post(`${API_BASE}/ask-ai-crop`, formData);
      setAiAdvice(data.ai_advice);
    } catch (err) {
      if (err.response) {
        const d = err.response.data;
        const msg = d?.detail?.message || (typeof d?.detail === 'string' ? d.detail : null) || d?.message || d?.error || 'Advisory node error';
        setAiAdvice(`HTTP ${err.response.status}: ${msg}`);
      } else {
        setAiAdvice('AI advisory node is currently unreachable. Try again later.');
      }
    } finally {
      setAiLoading(false);
    }
  };

  const handleChange = (e) => {
    const val = e.target.value;
    const isNum = e.target.type === 'number';
    setFormData({ ...formData, [e.target.name]: isNum ? (val === '' ? '' : parseFloat(val)) : val });
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    setAiAdvice(null);
    try {
      const { data } = await axios.post(`${API_BASE}/predict-crop`, formData);
      setResult(data);
    } catch (err) {
      if (err.response) {
        const d = err.response.data;
        const msg = d?.detail?.message || (typeof d?.detail === 'string' ? d.detail : null) || d?.message || d?.error || (typeof d === 'string' ? d : null) || err.response.statusText || 'Prediction error';
        setError(`HTTP ${err.response.status}: ${msg}`);
      } else {
        setError(err.message ? `Server unreachable (${err.message})` : 'Server unreachable. Please verify the backend is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: 'Nitrogen', labelKey: 'crop_nitrogen', icon: Layers, unit: 'kg/ha', color: 'text-amber-500' },
    { name: 'Phosphorus', labelKey: 'crop_phosphorus', icon: Hexagon, unit: 'kg/ha', color: 'text-brand-400' },
    { name: 'Potassium', labelKey: 'crop_potassium', icon: Leaf, unit: 'kg/ha', color: 'text-emerald-500' },
    { name: 'Temperature', labelKey: 'crop_temperature', icon: Sun, unit: '°C', color: 'text-orange-500' },
    { name: 'Humidity', labelKey: 'crop_humidity', icon: Droplets, unit: '%', color: 'text-sky-500' },
    { name: 'pH', labelKey: 'crop_ph', icon: FlaskConical, unit: 'pH', color: 'text-brand-300' },
    { name: 'Rainfall', labelKey: 'crop_rainfall', icon: CloudRain, unit: 'mm', color: 'text-blue-500' },
  ];

  return (
    <motion.div
      {...pageVariants}
      transition={pageTransition}
      className="space-y-8 pb-16"
    >
      <PageHeader
        icon={Sprout}
        title={t('crop_title')}
        subtitle="Agro-Climatic Cultivar Recommendation & Feasibility Engine"
      />

      {/* REGIONAL PRESET SELECTOR */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest font-mono">
          Quick Agro-Ecological Presets
        </span>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {PRESETS.map((p) => {
            const isSelected = formData.State === p.data.State && formData.Nitrogen === p.data.Nitrogen;
            return (
              <button
                key={p.name}
                type="button"
                onClick={() => applyPreset(p)}
                className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-brand-500/15 border-brand-500/40 text-white shadow-lg shadow-brand-500/10'
                    : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] text-white/70'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base">{p.icon}</span>
                  <span className="font-semibold text-xs text-white">{p.name}</span>
                </div>
                <span className="text-[10px] text-white/40 font-mono truncate w-full">{p.tag}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Calibration Parameter Inputs */}
        <motion.div {...fadeInLeft} className="lg:col-span-5 flex flex-col gap-6">
          <div className="flex flex-col">
            <h2 className="text-[11px] font-bold text-white/30 uppercase tracking-widest font-mono flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-brand-400" /> Soil & Climate Parameters
            </h2>
            <p className="text-caption text-white/20 mt-1 leading-relaxed">
              Calibrate regional geography, soil fertility metrics, and seasonal conditions.
            </p>
          </div>

          <Tilt spotlight={true} intensity={20}>
            <Card variant="glass" padding="md" className="relative">
              <form onSubmit={handlePredict} className="space-y-5">
                {/* Region & Season Inputs */}
                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-white/[0.06]">
                  <div>
                    <label className="flex items-center gap-1.5 mb-1.5 text-white/50 text-[10px] uppercase tracking-wider font-semibold font-mono">
                      <MapPin className="w-3.5 h-3.5 text-brand-400" />
                      State / Region
                    </label>
                    <select
                      name="State"
                      value={formData.State}
                      onChange={handleChange}
                      className="console-input font-mono text-xs w-full bg-surface-900 text-white border border-white/10 rounded-lg p-2.5"
                    >
                      {STATES.map((s) => (
                        <option key={s} value={s} className="bg-surface-900 text-white">{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center gap-1.5 mb-1.5 text-white/50 text-[10px] uppercase tracking-wider font-semibold font-mono">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      Cropping Season
                    </label>
                    <select
                      name="Season"
                      value={formData.Season}
                      onChange={handleChange}
                      className="console-input font-mono text-xs w-full bg-surface-900 text-white border border-white/10 rounded-lg p-2.5"
                    >
                      {SEASONS.map((s) => (
                        <option key={s} value={s} className="bg-surface-900 text-white">{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {fields.map(f => (
                    <div key={f.name} className={f.name === 'Rainfall' ? 'col-span-2' : ''}>
                      <label className="flex items-center justify-between mb-1.5 text-white/50 text-[10px] uppercase tracking-wider font-semibold font-mono">
                        <span className="flex items-center gap-1.5">
                          <f.icon className={`w-3.5 h-3.5 ${f.color}`} />
                          {t(f.labelKey)}
                        </span>
                        <span className="text-white/20 text-[9px] font-normal font-sans">({f.unit})</span>
                      </label>
                      <input
                        type="number"
                        step="any"
                        name={f.name}
                        value={formData[f.name]}
                        onChange={handleChange}
                        required
                        className="console-input font-mono"
                      />
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t border-white/[0.04]">
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    loading={loading}
                    type="submit"
                    icon={Sprout}
                  >
                    Recommend Suitable Cultivar
                  </Button>
                </div>
              </form>
            </Card>
          </Tilt>
        </motion.div>

        {/* RIGHT COLUMN: Output matrix */}
        <motion.div {...fadeInRight} className="lg:col-span-7 space-y-6">
          <AnimatePresence mode="wait">
            
            {/* Error */}
            {error && (
              <motion.div
                key="error"
                {...slideUp}
                className="p-4 rounded-lg bg-danger/10 border border-danger/20 flex gap-3 text-danger-light text-body-sm font-mono"
              >
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold">METRIC ANOMALY</h4>
                  <p className="text-white/50 mt-1">{error}</p>
                </div>
              </motion.div>
            )}

            {/* Placeholder */}
            {!result && !error && !loading && (
              <motion.div
                key="placeholder"
                {...slideUp}
                className="border border-dashed border-white/5 bg-surface-800/10 rounded-xl p-16 flex flex-col items-center justify-center text-center min-h-[460px]"
              >
                <div className="w-12 h-12 rounded-full bg-white/[0.01] border border-white/[0.04] flex items-center justify-center mb-4">
                  <Sprout className="w-5 h-5 text-white/20" />
                </div>
                <h4 className="font-heading text-body-md text-white/50 font-semibold">Agro-Climatic Intelligence Ready</h4>
                <p className="text-caption text-white/20 mt-1 max-w-xs leading-relaxed">
                  Select your state and soil metrics to compute the optimal agronomic crop recommendation.
                </p>
              </motion.div>
            )}

            {/* Calibration output report */}
            {result && (
              <motion.div
                key="result"
                {...slideUp}
                className="space-y-6 animate-fadeIn"
              >
                {/* 1. Main Recommendation banner */}
                <Tilt spotlight={true} intensity={25}>
                  <Card variant="glass" padding="md" className="relative overflow-hidden border-brand-500/10">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/[0.02] rounded-full blur-[60px]" />
                    <div className="flex flex-col items-center justify-center text-center py-6">
                      <div className="w-12 h-12 bg-white/[0.02] border border-white/[0.04] rounded-full flex items-center justify-center mb-3">
                        <Sprout className="w-6 h-6 text-brand-400" />
                      </div>
                      <span className="text-[9px] text-white/30 uppercase tracking-widest font-mono font-bold">
                        {t('crop_recommended')}
                      </span>
                      <h2 className="font-heading text-display-md font-bold text-white capitalize tracking-tight mt-1">
                        {result.recommended_crop}
                      </h2>

                      {/* Agro-climatic ICAR validation tag */}
                      {result.regional_context?.note && (
                        <div className="mt-3 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 flex items-center gap-2 text-brand-300 text-[11px] font-mono">
                          <CheckCircle className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                          <span>{result.regional_context.note}</span>
                        </div>
                      )}

                      {result.confidence && (
                        <div className="w-full max-w-xs mt-6">
                          <ProgressBar
                            value={result.confidence}
                            label="Confidence Calibrator Match"
                            color={{ bar: 'from-brand-600 to-brand-400', glow: 'rgba(34,169,106,0.15)', text: 'text-brand-300' }}
                          />
                        </div>
                      )}
                    </div>
                  </Card>
                </Tilt>

                {/* 2. Top recommendations alternatives matrix */}
                {result.top_recommendations?.length > 0 && (
                  <Card variant="glass" padding="md">
                    <SectionHeader title={t('crop_alternatives')} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                      {result.top_recommendations.map((rec, i) => (
                        <div key={i} className="flex items-center justify-between bg-white/[0.01] border border-white/[0.03] p-3 rounded-lg font-mono text-body-sm">
                          <span className="font-semibold text-brand-200 capitalize">{rec.crop}</span>
                          <span className="text-brand-400 font-bold">{rec.confidence}%</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* 3. Agronomic Advice details */}
                {result.agronomic_advice?.length > 0 && (
                  <Card variant="glass" padding="md">
                    <SectionHeader title={t('crop_advice')} />
                    <ul className="space-y-3 font-light mt-4">
                      {result.agronomic_advice.map((advice, i) => (
                        <li key={i} className="flex gap-3 text-body-sm text-white/50 leading-relaxed">
                          <span className="w-1.5 h-1.5 bg-brand-500 rounded-full mt-2 shrink-0" />
                          <span>{advice}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}

                {/* 4. AI Advisory node */}
                <Card variant="glass" padding="md">
                  <SectionHeader icon={Brain} title={t('crop_ai_advisor')} iconColor="text-accent-500" />
                  <div className="mt-4">
                    {aiAdvice ? (
                      <div className="text-body-sm text-white/60 leading-relaxed bg-white/[0.01] border border-white/[0.03] p-5 rounded-lg whitespace-pre-wrap font-light">
                        {aiAdvice}
                      </div>
                    ) : (
                      <Button
                        variant="secondary"
                        fullWidth
                        loading={aiLoading}
                        icon={Sparkles}
                        onClick={handleAskAI}
                      >
                        Initiate AI Advisory Analysis
                      </Button>
                    )}
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Crop;
