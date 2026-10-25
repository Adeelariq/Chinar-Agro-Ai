import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Leaf, Sprout, Wheat, ArrowRight, BrainCircuit,
  FileText, Activity, Terminal, UploadCloud, Lightbulb,
  Image as ImageIcon, AlertTriangle
} from 'lucide-react';
import { Button, Card, Tilt } from '../design-system/components';
import { pageVariants, pageTransition, slideUp } from '../design-system/animations';

const Home = () => {
  const { t } = useTranslation();
  const [leafPreview, setLeafPreview] = useState(null);
  const [leafLoading, setLeafLoading] = useState(false);
  const [leafResult, setLeafResult] = useState(null);
  const [leafError, setLeafError] = useState(null);
  const [leafRejection, setLeafRejection] = useState(null);
  const leafInputRef = useRef(null);

  const handleLeafSelect = async (file) => {
    if (!file) return;
    setLeafPreview(URL.createObjectURL(file));
    setLeafError(null);
    setLeafRejection(null);
    setLeafResult(null);
    setLeafLoading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/detect-disease`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 30000 }
      );
      setLeafResult(data);
    } catch (err) {
      if (err.response?.status === 422 && err.response?.data?.error === 'not_a_plant') {
        setLeafRejection(err.response.data);
      } else {
        setLeafError(err.response?.data?.detail?.message || err.response?.data?.error || 'Diagnostic inspection failed.');
      }
    } finally {
      setLeafLoading(false);
    }
  };

  const handleLeafReset = () => {
    setLeafPreview(null);
    setLeafResult(null);
    setLeafError(null);
    setLeafRejection(null);
  };

  const pipelines = [
    {
      id: '01',
      title: 'Neural Disease Vision',
      tag: 'CNN Ensemble',
      status: 'Ready',
      desc: 'Ensemble Convolutional Networks (ResNet-50 + EfficientNet-B1) for diagnostic leaf blight identification.',
      path: '/disease',
      icon: Leaf,
      glow: '#22c55e',
    },
    {
      id: '02',
      title: 'Biosphere Calibration',
      tag: 'Soft Voting',
      status: 'Ready',
      desc: 'Stratified voting classifier matching N-P-K soil matrices and localized moisture readings with suitable cultivars.',
      path: '/crop',
      icon: Sprout,
      glow: '#eab308',
    },
    {
      id: '03',
      title: 'Yield Forecast Engine',
      tag: 'Regression Pipeline',
      status: 'Ready',
      desc: 'Spatial-temporal regressors computing regional district production forecasts metric tonnes per hectare.',
      path: '/yield',
      icon: Wheat,
      glow: '#eab308',
    },
    {
      id: '04',
      title: 'Gemini Assistant CLI',
      tag: 'Generative AI',
      status: 'Active',
      desc: 'Generative agricultural advisory model answering treatment methods, crop rotation cycles, and irrigation planning.',
      path: '/farm-assistant',
      icon: BrainCircuit,
      glow: '#3b82f6',
    },
    {
      id: '05',
      title: 'Report Compiler',
      tag: 'Multi-Agent Fuser',
      status: 'Compiled',
      desc: 'Fusion pipeline aggregating soil parameters, crop suggestions, regional projections, and diagnosed blights.',
      path: '/report',
      icon: FileText,
      glow: '#6366f1',
    }
  ];

  return (
    <motion.div
      {...pageVariants}
      transition={pageTransition}
      className="space-y-12 pb-16"
    >
      {/* ─── Header ───────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/[0.04] pb-8 gap-6">
        <div>
          <span className="text-[10px] text-brand-400 font-mono font-bold tracking-widest uppercase">
            {"// PRECISION AGRICULTURE INTELLIGENCE"}
          </span>
          <h1 className="font-heading text-4xl md:text-5xl font-bold tracking-tight text-white mt-2">
            Workspace Console
          </h1>
          <p className="text-body-md text-white/40 mt-3 max-w-2xl font-light leading-relaxed">
            An enterprise precision agronomy platform integrating neural vision pipelines, spatial regional yield forecasts, and context-aware generative advisory nodes.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="md" icon={Terminal} to="/farm-assistant">
            Quick Terminal
          </Button>
          <Button variant="primary" size="md" icon={FileText} to="/report">
            Fuser Report
          </Button>
        </div>
      </div>

      {/* ─── Status Bar ───────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-white/[0.01] border border-white/[0.03] font-mono">
        {[
          { label: 'System Load', val: '0.04%' },
          { label: 'API Latency', val: '24ms' },
          { label: 'Vision Model', val: 'Calibrated' },
          { label: 'Connection', val: 'SECURE SSL' },
        ].map((s, i) => (
          <div key={i} className="flex flex-col px-4 border-l border-white/[0.06] first:border-l-0">
            <span className="text-[9px] uppercase tracking-wider text-white/30">{s.label}</span>
            <span className="text-body-sm font-semibold text-white/80 mt-1">{s.val}</span>
          </div>
        ))}
      </div>

      {/* ─── Quick Leaf Health Check ──────────────────── */}
      <div className="p-6 rounded-2xl bg-surface-850/80 border border-white/[0.05] relative overflow-hidden">
        <input
          type="file"
          ref={leafInputRef}
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleLeafSelect(e.target.files[0]);
            }
          }}
        />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-400">
              <Leaf className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-400">
                {"// INSTANT LEAF CHECK"}
              </span>
              <h3 className="font-heading text-heading-xs text-white font-semibold">
                Rapid Botanical Health Validation
              </h3>
            </div>
          </div>

          {!leafPreview && (
            <Button
              variant="secondary"
              size="sm"
              icon={UploadCloud}
              onClick={() => leafInputRef.current && leafInputRef.current.click()}
            >
              Upload Leaf Photo
            </Button>
          )}
        </div>

        {/* State 1: Dropzone (idle) */}
        {!leafPreview && !leafLoading && !leafRejection && !leafResult && (
          <div
            onClick={() => leafInputRef.current && leafInputRef.current.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleLeafSelect(e.dataTransfer.files[0]);
              }
            }}
            className="border border-dashed border-white/10 hover:border-brand-500/30 rounded-xl p-6 text-center cursor-pointer transition-colors bg-white/[0.01] hover:bg-brand-500/[0.02]"
          >
            <p className="text-body-sm text-white/50">
              Drag & drop a crop leaf photo here or <span className="text-brand-400 font-semibold underline">browse file</span> for instant AI validation.
            </p>
            <span className="text-[10px] text-white/25 font-mono mt-1 block">
              Automated leaf gate validates against non-plant objects and blurry captures
            </span>
          </div>
        )}

        {/* State 2: Loading */}
        {leafLoading && (
          <div className="p-8 rounded-xl bg-white/[0.02] border border-white/[0.04] flex flex-col items-center justify-center font-mono">
            <div className="w-8 h-8 rounded-full border border-brand-500/20 border-t-brand-400 animate-spin mb-3" />
            <span className="text-caption font-bold uppercase tracking-wider text-brand-400">
              VALIDATING SPECIMEN QUALITY...
            </span>
          </div>
        )}

        {/* State 3: Calm 422 Rejection Card */}
        {leafRejection && !leafLoading && (
          <motion.div
            {...slideUp}
            className="p-5 rounded-xl bg-surface-900 border border-amber-500/30 flex flex-col gap-4 shadow-xl"
          >
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
                <Leaf className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-heading font-semibold text-white text-body-md tracking-tight">
                  {t('gate_rejected_title', 'Photo Could Not Be Verified as a Leaf')}
                </h4>
                <p className="text-white/70 mt-1 text-body-sm leading-relaxed font-light">
                  {t(`gate_reason_${leafRejection.reason}`, leafRejection.message)}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.05] flex items-start gap-2.5">
              <Lightbulb className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
              <div className="text-body-sm text-white/80">
                <span className="font-semibold text-amber-300 block mb-0.5 text-caption uppercase tracking-wider font-mono">
                  {t('gate_rejected_hint_label', 'Helpful Advice')}
                </span>
                <p className="text-white/60 text-body-sm leading-relaxed">
                  {leafRejection.hint || t('gate_default_hint', 'Take a clear, close photo of a single leaf in daylight.')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <Button
                variant="primary"
                size="sm"
                icon={ImageIcon}
                onClick={() => {
                  handleLeafReset();
                  if (leafInputRef.current) leafInputRef.current.click();
                }}
              >
                {t('gate_try_another', 'Try another photo')}
              </Button>
              <Button variant="secondary" size="sm" onClick={handleLeafReset}>
                Dismiss
              </Button>
            </div>
          </motion.div>
        )}

        {/* State 4: Standard Anomaly Error */}
        {leafError && !leafRejection && !leafLoading && (
          <motion.div
            {...slideUp}
            className="p-4 rounded-xl bg-danger/10 border border-danger/20 flex items-center justify-between gap-3 text-danger-light text-body-sm font-mono"
          >
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{leafError}</span>
            </div>
            <Button variant="secondary" size="sm" onClick={handleLeafReset}>
              Retry
            </Button>
          </motion.div>
        )}

        {/* State 5: Result Card */}
        {leafResult && !leafLoading && (
          <motion.div
            {...slideUp}
            className="p-5 rounded-xl bg-brand-500/10 border border-brand-500/25 flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3.5">
              {leafPreview && (
                <img src={leafPreview} alt="Leaf Preview" className="w-14 h-14 object-cover rounded-lg border border-white/10" />
              )}
              <div>
                <span className="text-[10px] font-mono text-brand-300 font-bold uppercase tracking-wider block">
                  Diagnosis Verified (Confidence: {leafResult.confidence}%)
                </span>
                <h4 className="font-heading text-heading-xs text-white font-bold mt-0.5">
                  {leafResult.prediction}
                </h4>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Button variant="secondary" size="sm" onClick={handleLeafReset}>
                Check Another
              </Button>
              <Button variant="primary" size="sm" to="/disease" icon={ArrowRight}>
                Open Disease Lab
              </Button>
            </div>
          </motion.div>
        )}
      </div>

      {/* ─── Pipeline Modules ──────────────────────────── */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-brand-400" />
          <h2 className="text-[11px] font-bold text-white/40 uppercase tracking-widest font-mono">
            Active Workspace Pipelines
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pipelines.map((p) => (
            <Tilt key={p.id} spotlight={true} intensity={25} className="h-full">
              <Link to={p.path} className="block h-full">
                <Card
                  variant="glass"
                  padding="lg"
                  className="h-full flex flex-col justify-between group hover:border-brand-500/20"
                >
                  <div>
                    {/* Header line */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04] group-hover:border-brand-500/25 transition-colors">
                        <p.icon className="w-4 h-4 text-brand-400 group-hover:scale-105 transition-transform" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold text-white/20 uppercase tracking-wider font-mono">
                          {p.tag}
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                      </div>
                    </div>

                    <h3 className="font-heading text-heading-sm font-semibold text-white group-hover:text-brand-300 transition-colors">
                      {p.title}
                    </h3>
                    <p className="text-body-sm text-white/40 mt-3 leading-relaxed font-light line-clamp-3">
                      {p.desc}
                    </p>
                  </div>

                  <div className="mt-8 pt-4 border-t border-white/[0.03] flex items-center justify-between text-caption font-semibold tracking-wider uppercase text-white/30 group-hover:text-brand-400 transition-colors font-mono">
                    <span>Pipeline {p.id}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Card>
              </Link>
            </Tilt>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default Home;

