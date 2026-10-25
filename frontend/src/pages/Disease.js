import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  UploadCloud, Leaf, Activity, AlertTriangle,
  ShieldCheck, ShieldAlert, ShieldX, Info, Bug,
  ThermometerSun, Eye, Layers, Image as ImageIcon, ChevronRight,
  Zap, Heart, Microscope, Pill, Lightbulb, Trash2, Sprout
} from 'lucide-react';
import { PageHeader, Button, Badge, ProgressBar, SectionHeader, Tilt, Card } from '../design-system/components';
import { pageVariants, pageTransition, fadeInLeft, fadeInRight, slideUp, staggerContainer } from '../design-system/animations';
import { API_BASE } from '../utils/api';

const getSeverityColor = (level) => {
  const l = (level || '').toLowerCase();
  if (l.includes('severe') || l.includes('high')) return { bar: 'from-danger-dark to-danger', glow: 'rgba(244,63,94,0.4)', text: 'text-danger-light', variant: 'danger' };
  if (l.includes('moderate')) return { bar: 'from-warning-dark to-warning', glow: 'rgba(245,158,11,0.4)', text: 'text-warning-light', variant: 'warning' };
  return { bar: 'from-success-dark to-success', glow: 'rgba(16,185,129,0.4)', text: 'text-success-light', variant: 'success' };
};

const getConfidenceVariant = (conf) => {
  if (conf >= 75) return 'success';
  if (conf >= 50) return 'warning';
  return 'danger';
};

const getRiskIcon = (level) => {
  const l = (level || '').toLowerCase();
  if (l.includes('high')) return <ShieldX className="w-5 h-5 text-danger-light" />;
  if (l.includes('moderate')) return <ShieldAlert className="w-5 h-5 text-warning-light" />;
  return <ShieldCheck className="w-5 h-5 text-success-light" />;
};

/* ─── Treatment Tabs ───────────────────────────────── */
const TreatmentPanel = ({ treatment }) => {
  const [activeTab, setActiveTab] = useState('immediate');
  const tabs = [
    { key: 'immediate', label: 'Immediate', icon: Zap, color: 'text-danger-light' },
    { key: 'prevention', label: 'Prevention', icon: ShieldCheck, color: 'text-info-light' },
    { key: 'organic', label: 'Organic', icon: Leaf, color: 'text-success-light' },
  ];
  const items = treatment?.[activeTab] || [];

  return (
    <div>
      <div className="flex gap-1 mb-4 bg-white/[0.02] border border-white/[0.04] rounded-lg p-1">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded text-caption font-semibold tracking-wide transition-all ${
              activeTab === tab.key
                ? 'bg-white/[0.04] text-white border border-white/[0.04]'
                : 'text-white/40 hover:text-white/60'
            }`}
          >
            <tab.icon className={`w-3.5 h-3.5 ${activeTab === tab.key ? tab.color : ''}`} />
            {tab.label}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.ul key={activeTab} {...slideUp} className="space-y-2.5">
          {items.map((step, i) => (
            <li key={i} className="flex gap-3 items-start text-body-sm text-white/50 leading-relaxed font-light">
              <ChevronRight className="w-3.5 h-3.5 mt-0.5 text-brand-400 shrink-0" />
              <span>{step}</span>
            </li>
          ))}
          {items.length === 0 && (
            <li className="text-body-sm text-white/20 italic">No instructions logged.</li>
          )}
        </motion.ul>
      </AnimatePresence>
    </div>
  );
};

/* ─── Differential Diagnosis list ──────────────────── */
const TopPredictions = ({ predictions = [] }) => (
  <div className="space-y-3 font-mono">
    {predictions.slice(0, 4).map((pred, i) => (
      <div key={i} className="text-caption">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-white/40 truncate max-w-[200px]">{pred.name || pred.disease}</span>
          <span className={`font-bold ${pred.confidence >= 75 ? 'text-success-light' : pred.confidence >= 50 ? 'text-warning-light' : 'text-danger-light'}`}>
            {pred.confidence?.toFixed(1)}%
          </span>
        </div>
        <div className="h-1 bg-white/[0.03] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pred.confidence}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`h-full rounded-full ${i === 0 ? 'bg-brand-500' : 'bg-white/10'}`}
          />
        </div>
      </div>
    ))}
  </div>
);

/* ═══════════════════════════════════════════════════
   Disease Page
   ═══════════════════════════════════════════════════ */
const Disease = () => {
  const { t } = useTranslation();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [rejection, setRejection] = useState(null);
  const [supportedCrops, setSupportedCrops] = useState([]);
  const [imageView, setImageView] = useState('original');
  const fileRef = useRef(null);

  useEffect(() => {
    const fetchSupportedCrops = async () => {
      try {
        const { data } = await axios.get(`${API_BASE}/supported-crops`);
        if (data?.supported_crops) {
          setSupportedCrops(data.supported_crops);
        }
      } catch (e) {
        // Fallback default list if backend offline
        setSupportedCrops(['Apple', 'Corn', 'Grape', 'Potato', 'Rice', 'Tomato', 'Strawberry', 'Pepper']);
      }
    };
    fetchSupportedCrops();
  }, []);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setResult(null);
      setError(null);
      setRejection(null);
      setImageView('original');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const selected = e.dataTransfer.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setResult(null);
      setError(null);
      setRejection(null);
      setImageView('original');
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setRejection(null);
    setResult(null);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const { data } = await axios.post(`${API_BASE}/plant-doctor`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000,
      });
      setResult(data);
      setRejection(null);
      setImageView('original');
    } catch (err) {
      if (err.response?.status === 422 && err.response?.data?.error === 'not_a_plant') {
        setRejection(err.response.data);
        setError(null);
      } else {
        setRejection(null);
        setError(err.response?.data?.detail?.message || err.response?.data?.error || err.message || 'Analysis failure.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    setRejection(null);
    setImageView('original');
  };

  const severity = result?.severity || {};
  const risk = result?.risk || {};
  const explanation = result?.explanation || {};
  const treatment = result?.treatment || {};

  return (
    <motion.div
      {...pageVariants}
      transition={pageTransition}
      className="space-y-8 pb-16"
    >
      <PageHeader
        icon={Microscope}
        title={t('disease_title')}
        subtitle="Spectral Analysis Laboratory"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Diagnostics Interface */}
        <motion.div {...fadeInLeft} className="lg:col-span-5 flex flex-col gap-6">
          <div className="flex flex-col">
            <h2 className="text-[11px] font-bold text-white/30 uppercase tracking-widest font-mono flex items-center gap-2">
              <Eye className="w-3.5 h-3.5 text-brand-400" /> Image Capture Terminal
            </h2>
            <p className="text-caption text-white/20 mt-1 leading-relaxed">
              Drop botanical specimen leaf files into the calibration viewport.
            </p>
          </div>

          {/* Toggle Tab */}
          {result && (
            <div className="flex gap-1 bg-white/[0.02] border border-white/[0.04] p-1 rounded-lg font-mono">
              {[
                { key: 'original', label: 'Original Capture', icon: ImageIcon },
                { key: 'overlay', label: 'Grad-CAM Heatmap', icon: Layers }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setImageView(tab.key)}
                  className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded text-caption font-semibold tracking-wider uppercase transition-all ${
                    imageView === tab.key
                      ? 'bg-brand-500/10 text-brand-400 border border-brand-500/10'
                      : 'text-white/40 hover:text-white/60'
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {/* Core Viewport */}
          <Tilt spotlight={true} intensity={30} className="w-full">
            <div
              className={`relative overflow-hidden flex flex-col items-center justify-center bg-surface-800/20 border border-white/[0.03] rounded-xl cursor-pointer group ${
                !preview ? 'border-dashed border-white/10 hover:border-brand-500/30' : ''
              }`}
              style={{ minHeight: '380px' }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => !preview && fileRef.current?.click()}
            >
              <input ref={fileRef} type="file" className="hidden" accept="image/*" onChange={handleFileChange} />

              {/* Lab viewport hair-cross target */}
              <div className="absolute top-4 left-4 w-4 h-4 border-t border-l border-white/10" />
              <div className="absolute top-4 right-4 w-4 h-4 border-t border-r border-white/10" />
              <div className="absolute bottom-4 left-4 w-4 h-4 border-b border-l border-white/10" />
              <div className="absolute bottom-4 right-4 w-4 h-4 border-b border-r border-white/10" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 border border-white/[0.04] rounded-full pointer-events-none" />

              {/* Active Scanner Line */}
              {loading && preview && <div className="scanner-laser-line" />}

              <AnimatePresence mode="wait">
                {!preview ? (
                  <motion.div key="upload" {...slideUp} className="p-10 text-center flex flex-col items-center">
                    <UploadCloud className="w-8 h-8 text-white/20 mb-4 group-hover:text-brand-400 transition-colors" />
                    <span className="text-body-sm font-semibold text-white/50 tracking-wider">SPECIMEN VIEWPORT</span>
                    <span className="text-[9px] text-white/20 mt-1 uppercase tracking-widest font-mono">click or drag leaf file</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key={imageView}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="relative w-full h-full flex items-center justify-center p-3 group"
                  >
                    <img
                      src={imageView === 'overlay' && result?.visual_output ? `${result.visual_output}?t=${Date.now()}` : preview}
                      alt="Botanical Capture"
                      className="w-full max-h-[350px] object-contain rounded-lg"
                    />
                    
                    {/* Delete Specimen Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReset();
                      }}
                      className="absolute top-4 right-4 p-2 rounded-lg bg-surface-900/90 border border-white/10 text-white/60 hover:text-white hover:bg-danger/20 hover:border-danger/30 transition-all shadow-md z-30 flex items-center justify-center"
                      title="Remove Specimen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {imageView === 'overlay' && result && (
                      <div className="absolute bottom-4 left-4 right-4 p-2 bg-surface-900/80 backdrop-blur-md rounded border border-white/[0.04] text-[9px] font-mono tracking-widest text-brand-400 uppercase text-center">
                        Grad-CAM Output Calibration Matrix
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Loader */}
              {loading && (
                <div className="absolute inset-0 bg-surface-900/85 backdrop-blur-sm flex flex-col items-center justify-center z-20 font-mono">
                  {/* Blueprint Grid background overlay */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
                  <div className="relative mb-4">
                    <div className="w-12 h-12 rounded-full border border-brand-500/20 border-t-brand-400 animate-spin" />
                  </div>
                  <span className="text-[10px] text-brand-400 font-bold uppercase tracking-widest animate-pulse">ANALYZING SPECIMEN</span>
                  <span className="text-[8px] text-white/25 mt-1 tracking-widest uppercase">resolving leaf cellular matrix</span>
                </div>
              )}
            </div>
          </Tilt>

          <div className="flex gap-3">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              disabled={!file}
              icon={Activity}
              onClick={handleAnalyze}
            >
              Run Diagnostic
            </Button>
            {(result || rejection) && (
              <Button variant="secondary" size="lg" onClick={handleReset}>
                Reset Specimen
              </Button>
            )}
          </div>

          {/* Supported Crops List */}
          {supportedCrops.length > 0 && (
            <div className="p-4 rounded-xl bg-surface-850/80 border border-white/[0.04]">
              <div className="flex items-center gap-2 mb-2">
                <Sprout className="w-3.5 h-3.5 text-brand-400" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/50">
                  {t('disease_supported_crops_title', 'Supported Crops')} ({supportedCrops.length})
                </span>
              </div>
              <p className="text-caption text-white/30 mb-3 text-[11px] leading-relaxed">
                {t('disease_supported_crops_desc', 'Trained diagnostic vision covers these crop varieties:')}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {supportedCrops.map((crop, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-white/[0.02] text-white/70 border border-white/[0.05] hover:border-brand-500/30 hover:text-white transition-colors"
                  >
                    {crop}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* RIGHT COLUMN: Diagnostic findings */}
        <motion.div {...fadeInRight} className="lg:col-span-7 space-y-6">
          <AnimatePresence mode="wait">
            
            {/* Calm Input Validation Gate Rejection (422 not_a_plant) */}
            {rejection && !loading && (
              <motion.div
                key="rejection"
                {...slideUp}
                className="p-6 rounded-xl bg-surface-800/80 border border-amber-500/30 flex flex-col gap-5 shadow-2xl backdrop-blur-md"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
                    <Leaf className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <span className="text-[10px] text-amber-400 font-mono font-bold uppercase tracking-widest block mb-1">
                      {"// SPECIMEN VALIDATION ADVISORY"}
                    </span>
                    <h3 className="font-heading font-semibold text-white text-heading-xs tracking-tight">
                      {t('gate_rejected_title', 'Photo Could Not Be Verified as a Leaf')}
                    </h3>
                    <p className="text-white/70 mt-1.5 text-body-sm leading-relaxed font-light">
                      {t(`gate_reason_${rejection.reason}`, rejection.message)}
                    </p>
                  </div>
                </div>

                {/* Helpful Guidance Hint Box */}
                <div className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.06] flex items-start gap-3">
                  <Lightbulb className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                  <div className="text-body-sm text-white/80">
                    <span className="font-semibold text-amber-300 block mb-0.5 text-caption uppercase tracking-wider font-mono">
                      {t('gate_rejected_hint_label', 'Helpful Advice')}
                    </span>
                    <p className="text-white/60 text-body-sm leading-relaxed">
                      {rejection.hint || t('gate_default_hint', 'Take a clear, close photo of a single leaf in daylight.')}
                    </p>
                  </div>
                </div>

                {/* Try another photo action */}
                <div className="pt-2 flex items-center gap-3">
                  <Button
                    variant="primary"
                    size="md"
                    icon={ImageIcon}
                    onClick={() => {
                      handleReset();
                      if (fileRef.current) fileRef.current.click();
                    }}
                  >
                    {t('gate_try_another', 'Try another photo')}
                  </Button>
                  <Button variant="secondary" size="md" onClick={handleReset}>
                    Clear Viewport
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Error */}
            {error && !rejection && (
              <motion.div
                key="error"
                {...slideUp}
                className="p-4 rounded-lg bg-danger/10 border border-danger/20 flex gap-3 text-danger-light text-body-sm font-mono"
              >
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold">SYSTEM ANOMALY</h4>
                  <p className="text-white/50 mt-1">{error}</p>
                </div>
              </motion.div>
            )}

            {/* Placeholder */}
            {!result && !error && !rejection && !loading && (
              <motion.div
                key="placeholder"
                {...slideUp}
                className="border border-dashed border-white/5 bg-surface-800/10 rounded-xl p-16 flex flex-col items-center justify-center text-center min-h-[460px]"
              >
                <div className="w-12 h-12 rounded-full bg-white/[0.01] border border-white/[0.04] flex items-center justify-center mb-4">
                  <Leaf className="w-5 h-5 text-white/20" />
                </div>
                <h4 className="font-heading text-body-md text-white/50 font-semibold">Diagnostic Report Waiting</h4>
                <p className="text-caption text-white/20 mt-1 max-w-xs leading-relaxed">
                  Supply leaf specimen image in the capture terminal to compute precision diagnostics.
                </p>
              </motion.div>
            )}

            {/* Diagnostic Report Panel */}
            {result && (
              <motion.div
                key="results"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="space-y-6"
              >
                {/* 1. Header Specimen Panel */}
                <Tilt spotlight={true} intensity={25}>
                  <Card variant="glass" padding="md" className="relative overflow-hidden border-brand-500/10">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/[0.02] rounded-full blur-[60px]" />
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center shrink-0">
                        {result.disease?.toLowerCase() === 'healthy' ? (
                          <Heart className="w-6 h-6 text-success-light" />
                        ) : (
                          <Bug className="w-6 h-6 text-warning-light" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[9px] text-white/30 uppercase tracking-widest font-mono font-bold block">{result.plant || 'Specimen Type'}</span>
                        <h3 className="font-heading text-heading-md font-bold text-white capitalize tracking-tight mt-1">{result.disease || 'Undetected'}</h3>
                        <p className="text-caption text-white/40 mt-1.5 leading-relaxed font-light">{result.disease_description}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-5 font-mono">
                      <Badge variant={getConfidenceVariant(result.confidence)} size="sm">
                        Confidence {result.confidence?.toFixed(1)}%
                      </Badge>
                      <Badge variant="neutral" size="sm">Source: {result.final_source || 'CNN'}</Badge>
                      <Badge variant="neutral" size="sm">Status: {result.status || 'Active'}</Badge>
                    </div>
                  </Card>
                </Tilt>

                {/* 2. Analysis Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Severity */}
                  <Card variant="glass" padding="md" className="flex flex-col justify-between">
                    <div>
                      <SectionHeader icon={ThermometerSun} title="Calculated Severity" iconColor={getSeverityColor(severity.level).text} />
                      <ProgressBar value={severity.percentage || 0} label="Infection Density" color={getSeverityColor(severity.level)} />
                    </div>
                    <div className="flex justify-between items-center mt-6 pt-3 border-t border-white/[0.03] font-mono text-[10px]">
                      <span className="text-white/20 uppercase tracking-wider">Urgency</span>
                      <span className={`font-semibold ${getSeverityColor(severity.level).text}`}>{severity.level}</span>
                    </div>
                  </Card>

                  {/* Risk Profile */}
                  <Card variant="glass" padding="md" className="flex flex-col justify-between">
                    <div>
                      <SectionHeader icon={ShieldAlert} title="Risk Assessment" iconColor="text-danger-light" />
                      <div className="flex items-center gap-3 bg-white/[0.01] border border-white/[0.03] rounded-lg p-3 mt-3">
                        {getRiskIcon(risk.level)}
                        <div className="flex-1 min-w-0">
                          <p className="text-caption text-white/70 font-semibold truncate leading-none">{risk.meaning}</p>
                          <p className="text-[10px] text-white/30 mt-1 leading-none">{risk.urgency}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-6 pt-3 border-t border-white/[0.03] font-mono text-[10px]">
                      <span className="text-white/20 uppercase tracking-wider">Security State</span>
                      <span className="text-white/60 font-semibold">{risk.level || 'Neutral'}</span>
                    </div>
                  </Card>
                </div>

                {/* 3. Findings Summary */}
                {result.summary && (
                  <Card variant="glass" padding="md">
                    <SectionHeader icon={Info} title="Diagnostic Analysis Summary" iconColor="text-info-light" />
                    <p className="text-body-sm text-white/50 leading-relaxed font-light">{result.summary}</p>
                  </Card>
                )}

                {/* 4. Practical Actions */}
                {result.final_advice && (
                  <Card
                    variant="glass"
                    padding="md"
                    className={`border ${
                      severity.level?.toLowerCase().includes('severe')
                        ? 'border-danger/10 bg-danger/[0.02]'
                        : 'border-white/[0.03]'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-white/[0.02] border border-white/[0.04] rounded-lg">
                        <Lightbulb className={`w-4 h-4 ${getSeverityColor(severity.level).text}`} />
                      </div>
                      <div>
                        <span className="text-[9px] text-white/30 uppercase tracking-widest font-mono font-bold">Recommended Immediate Intervention</span>
                        <p className="text-body-sm text-white/70 leading-relaxed font-medium mt-1">{result.final_advice}</p>
                      </div>
                    </div>
                  </Card>
                )}

                {/* 5. Treatment Plan Tabs */}
                {(treatment.immediate?.length > 0 || treatment.prevention?.length > 0 || treatment.organic?.length > 0) && (
                  <Card variant="glass" padding="md">
                    <SectionHeader icon={Pill} title="Botany Treatment Index" iconColor="text-brand-400" />
                    <TreatmentPanel treatment={treatment} />
                  </Card>
                )}

                {/* 6. Diagnostic Pathology Causes */}
                {explanation.causes?.length > 0 && (
                  <Card variant="glass" padding="md">
                    <SectionHeader icon={Microscope} title="Pathology Pathogen Identification" iconColor="text-purple-400" />
                    <div className="flex flex-wrap gap-2 mb-4 font-mono">
                      {explanation.type && <Badge variant="neutral" size="sm">{explanation.type}</Badge>}
                      {explanation.pathogen && <Badge variant="neutral" size="sm">{explanation.pathogen}</Badge>}
                    </div>
                    <ul className="space-y-3 font-light">
                      {explanation.causes.map((cause, i) => (
                        <li key={i} className="flex gap-3 text-body-sm text-white/50 leading-relaxed">
                          <span className="w-1.5 h-1.5 bg-purple-400 mt-2 shrink-0 rounded-full" />
                          <span>{cause}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}

                {/* 7. Differential Diagnosis List */}
                {result.top_predictions?.length > 0 && (
                  <Card variant="glass" padding="md">
                    <SectionHeader icon={Activity} title="Differential Matrix Model Output" iconColor="text-info-light" />
                    <TopPredictions predictions={result.top_predictions} />
                  </Card>
                )}

                {/* System Diagnostics Metrics */}
                <div className="text-center font-mono text-[9px] text-white/20 tracking-wider">
                  SPECIMEN PROCESSED IN {result.diagnosis_time_ms?.toFixed(0)}MS // SECURE SSL CONSOLE DIAGNOSTIC REPORT
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Disease;
