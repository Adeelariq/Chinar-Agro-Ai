import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle, Info, Leaf, Bug, Eye, FileSearch, ChevronDown, ChevronUp, XCircle, Search, Fingerprint, CalendarCheck, Hash, ListChecks, MessageSquare, Trash2 } from 'lucide-react';
import { API_BASE } from '../utils/api';

export default function PesticideAuth() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [targetCrop, setTargetCrop] = useState('');
  const [targetDisease, setTargetDisease] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (key) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
      setError('');
    }
  };

  const handleReset = () => {
    setImage(null);
    setPreview(null);
    setResult(null);
    setError('');
  };


  const handleVerify = async () => {
    if (!image) return;
    setLoading(true);
    setError('');
    
    const formData = new FormData();
    formData.append('file', image);
    formData.append('target_crop', targetCrop);
    formData.append('target_disease', targetDisease);

    try {
      const response = await fetch(`${API_BASE}/verify-pesticide`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.status === 'success') {
        setResult(data);
        setExpandedSections({ ocr: true, product: true, reference: true, comparison: true, tampering: true, expiry: true, registration: true, similarity: true, decision: true, recommendation: true });
      } else {
        setError(data.message || data.detail?.message || 'Failed to analyze pesticide.');
      }
    } catch (err) {
      setError('Connection to the server failed.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Risk Config (static Tailwind classes) ───
  const riskLevel = result?.risk_assessment?.risk || '';
  const confidence = result?.risk_assessment?.confidence || 0;
  const similarity = result?.similarity?.packaging_similarity || 0;

  const riskStyles = {
    LOW:    { bannerBg: 'bg-emerald-900/20 border-emerald-500/50', iconBg: 'bg-emerald-500/20 text-emerald-400', title: 'text-emerald-400', label: 'Low Risk', icon: <ShieldCheck className="w-10 h-10" /> },
    MEDIUM: { bannerBg: 'bg-amber-900/20 border-amber-500/50',   iconBg: 'bg-amber-500/20 text-amber-400',   title: 'text-amber-400',   label: 'Medium Risk', icon: <ShieldAlert className="w-10 h-10" /> },
    HIGH:   { bannerBg: 'bg-red-900/20 border-red-500/50',       iconBg: 'bg-red-500/20 text-red-400',       title: 'text-red-400',     label: 'High Risk', icon: <ShieldAlert className="w-10 h-10" /> },
  };
  const rs = riskStyles[riskLevel] || riskStyles.MEDIUM;

  // ─── Similarity Ring Color ───
  const simColor = similarity >= 80 ? 'text-emerald-400' : similarity >= 50 ? 'text-amber-400' : 'text-red-400';
  const simTrack = similarity >= 80 ? 'stroke-emerald-400' : similarity >= 50 ? 'stroke-amber-400' : 'stroke-red-400';

  // ─── Helpers ───
  const DetailRow = ({ label, value }) => (
    <div className="bg-slate-900/50 p-3 rounded-lg border border-white/5">
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-sm font-medium text-slate-200 break-words">{value || 'Not Visible'}</p>
    </div>
  );

  const StatusBadge = ({ status }) => {
    const map = {
      'MATCH':            'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      'PARTIAL MATCH':    'bg-amber-500/15 text-amber-400 border-amber-500/30',
      'MISMATCH':         'bg-red-500/15 text-red-400 border-red-500/30',
      'UNABLE TO VERIFY': 'bg-slate-500/15 text-slate-400 border-slate-500/30',
      'PASS':             'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      'WARNING':          'bg-amber-500/15 text-amber-400 border-amber-500/30',
      'FAIL':             'bg-red-500/15 text-red-400 border-red-500/30',
    };
    const cls = map[status] || map['UNABLE TO VERIFY'];
    return <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${cls}`}>{status}</span>;
  };

  const CheckIcon = ({ result: r }) => {
    if (r === 'PASS' || r === 'MATCH') return <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />;
    if (r === 'WARNING' || r === 'PARTIAL MATCH' || r === 'UNABLE TO VERIFY') return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
    return <XCircle className="w-4 h-4 text-red-400 shrink-0" />;
  };

  const Section = ({ id, icon, title, iconColor, badge, children }) => {
    const isOpen = expandedSections[id] !== false;
    return (
      <div className="glass-card overflow-hidden">
        <button onClick={() => toggleSection(id)} className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition-colors">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={iconColor}>{icon}</div>
            <h4 className="text-sm font-bold text-white truncate">{title}</h4>
            {badge && <div className="ml-auto mr-3">{badge}</div>}
          </div>
          {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
              <div className="px-5 pb-5 pt-0">{children}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 w-full">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-emerald-300">
            Pesticide Authenticator
          </span>
        </h1>
        <p className="text-slate-300 text-lg max-w-2xl mx-auto">
          11-step AI verification pipeline: OCR, product identification, official reference comparison, tampering detection, similarity scoring & risk assessment.
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8 items-start">
        
        {/* ─── Upload Panel ─── */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-6 flex flex-col gap-6 lg:sticky lg:top-8">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Upload className="text-brand-400" /> Scan Product
          </h2>
          
          <div className="relative border-2 border-dashed border-white/20 rounded-2xl p-8 hover:border-brand-500/50 hover:bg-brand-500/5 transition-all group overflow-hidden">
            <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
            {preview ? (
              <div className="relative w-full h-full flex items-center justify-center group/preview">
                <img src={preview} alt="Preview" className="mx-auto max-h-[300px] object-contain rounded-xl shadow-lg" />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReset();
                  }}
                  className="absolute top-2 right-2 p-2 rounded-lg bg-surface-900/90 border border-white/10 text-white/60 hover:text-white hover:bg-danger/20 hover:border-danger/30 transition-all shadow-md z-30 flex items-center justify-center"
                  title="Remove Image"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-400 gap-4 py-12">
                <div className="p-4 rounded-full bg-slate-800/50 group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8 text-brand-400" />
                </div>
                <p className="font-medium text-lg">Click or Drag image here</p>
                <p className="text-sm">Upload bottle, label, or packaging</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1 flex items-center gap-1">
                <Leaf className="w-4 h-4 text-emerald-400" /> Target Crop
              </label>
              <input type="text" value={targetCrop} onChange={e => setTargetCrop(e.target.value)} placeholder="e.g. Rice" className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-500 transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1 flex items-center gap-1">
                <Bug className="w-4 h-4 text-red-400" /> Target Disease
              </label>
              <input type="text" value={targetDisease} onChange={e => setTargetDisease(e.target.value)} placeholder="e.g. Blast" className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-500 transition-colors" />
            </div>
          </div>

          <button onClick={handleVerify} disabled={!image || loading} className={`w-full py-4 rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(76,175,80,0.3)] transition-all ${!image ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-brand-600 to-emerald-500 text-white hover:shadow-[0_0_30px_rgba(76,175,80,0.5)] hover:-translate-y-1'}`}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Running 11-Step Analysis...
              </span>
            ) : 'Verify Pesticide'}
          </button>
          
          {error && (
            <div className="p-4 bg-red-900/40 border border-red-500/50 text-red-200 rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}
        </motion.div>

        {/* ─── Results Panel ─── */}
        <div className="flex flex-col gap-4">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div key="result" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="flex flex-col gap-4">
                
                {/* ═══ Risk Banner + Similarity ═══ */}
                <div className={`p-6 rounded-2xl border flex flex-col sm:flex-row items-center gap-5 ${rs.bannerBg}`}>
                  <div className={`p-3 rounded-full ${rs.iconBg}`}>{rs.icon}</div>
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className={`text-2xl font-bold ${rs.title}`}>{rs.label}</h3>
                    <p className="text-slate-300 mt-1 text-sm">Confidence: <strong className="font-mono">{confidence}%</strong></p>
                    {result.risk_assessment?.confidence_explanation && (
                      <p className="text-xs text-slate-400 mt-1 italic">{result.risk_assessment.confidence_explanation}</p>
                    )}
                  </div>
                  {/* Similarity Ring */}
                  <div className="relative w-20 h-20 shrink-0">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-700" />
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="2.5" strokeDasharray={`${similarity}, 100`} strokeLinecap="round" className={simTrack} />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className={`text-lg font-extrabold font-mono ${simColor}`}>{similarity}%</span>
                      <span className="text-[8px] text-slate-500 uppercase font-bold tracking-wider">Match</span>
                    </div>
                  </div>
                </div>

                {/* ═══ Step 1: OCR ═══ */}
                <Section id="ocr" icon={<Eye className="w-5 h-5" />} title="Step 1 — OCR Extraction" iconColor="text-cyan-400">
                  {result.ocr && (
                    <div className="grid sm:grid-cols-2 gap-3">
                      <DetailRow label="Product Name" value={result.ocr.product_name} />
                      <DetailRow label="Brand" value={result.ocr.brand} />
                      <DetailRow label="Manufacturer" value={result.ocr.manufacturer} />
                      <DetailRow label="Active Ingredient" value={result.ocr.active_ingredient} />
                      <DetailRow label="Concentration" value={result.ocr.concentration} />
                      <DetailRow label="Registration No." value={result.ocr.registration_number} />
                      <DetailRow label="Batch Number" value={result.ocr.batch_number} />
                      <DetailRow label="Mfg Date" value={result.ocr.manufacturing_date} />
                      <DetailRow label="Expiry Date" value={result.ocr.expiry_date} />
                      <DetailRow label="Net Content" value={result.ocr.net_content} />
                      <DetailRow label="QR Code" value={result.ocr.qr_code_present} />
                      <DetailRow label="Barcode" value={result.ocr.barcode_present} />
                      <DetailRow label="Hazard Symbols" value={result.ocr.hazard_symbols} />
                      <div className="sm:col-span-2"><DetailRow label="Dosage" value={result.ocr.dosage_instructions} /></div>
                      <div className="sm:col-span-2"><DetailRow label="Safety" value={result.ocr.safety_instructions} /></div>
                    </div>
                  )}
                </Section>

                {/* ═══ Step 2: Product ID ═══ */}
                <Section id="product" icon={<Search className="w-5 h-5" />} title="Step 2 — Product Identification" iconColor="text-indigo-400">
                  {result.product_id && (
                    <div className="grid sm:grid-cols-3 gap-3">
                      <DetailRow label="Brand" value={result.product_id.identified_brand} />
                      <DetailRow label="Product" value={result.product_id.identified_product} />
                      <DetailRow label="Category" value={result.product_id.product_category} />
                    </div>
                  )}
                </Section>

                {/* ═══ Step 3: Official Reference ═══ */}
                <Section id="reference" icon={<Info className="w-5 h-5" />} title="Step 3 — Official Reference" iconColor="text-violet-400"
                  badge={result.official_reference?.reference_available === 'Yes' 
                    ? <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-full">REF FOUND</span>
                    : <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded-full">NO REF</span>
                  }
                >
                  {result.official_reference && (
                    <div className="space-y-3">
                      <DetailRow label="Source" value={result.official_reference.source_description} />
                      <div className="grid sm:grid-cols-2 gap-3">
                        <DetailRow label="Known Active Ingredient" value={result.official_reference.known_active_ingredient} />
                        <DetailRow label="Known Manufacturer" value={result.official_reference.known_manufacturer} />
                      </div>
                      <DetailRow label="Known Reg. Number Format" value={result.official_reference.known_registration_format} />
                    </div>
                  )}
                </Section>

                {/* ═══ Step 4: Packaging Comparison ═══ */}
                <Section id="comparison" icon={<FileSearch className="w-5 h-5" />} title="Step 4 — Packaging Comparison" iconColor="text-amber-400">
                  {result.packaging_comparison?.comparisons && (
                    <div className="space-y-2">
                      {result.packaging_comparison.comparisons.map((c, i) => (
                        <div key={i} className="flex items-center gap-3 bg-slate-900/40 p-3 rounded-lg border border-white/5">
                          <CheckIcon result={c.status} />
                          <span className="text-sm text-slate-200 flex-1 min-w-0 truncate">{c.field_name}</span>
                          <StatusBadge status={c.status} />
                        </div>
                      ))}
                    </div>
                  )}
                </Section>

                {/* ═══ Step 5: Tampering Detection ═══ */}
                <Section id="tampering" icon={<Fingerprint className="w-5 h-5" />} title="Step 5 — Tampering Detection" iconColor="text-rose-400"
                  badge={result.tampering?.tampering_detected === 'No' 
                    ? <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-full">CLEAR</span>
                    : result.tampering?.tampering_detected === 'Yes'
                    ? <span className="px-2 py-0.5 text-[10px] font-bold bg-red-500/15 text-red-400 border border-red-500/30 rounded-full">DETECTED</span>
                    : <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded-full">INCONCLUSIVE</span>
                  }
                >
                  {result.tampering && (
                    <div className="space-y-3">
                      <div className="grid sm:grid-cols-2 gap-3">
                        <DetailRow label="Print Quality" value={result.tampering.print_quality} />
                        <DetailRow label="Label Integrity" value={result.tampering.label_integrity} />
                      </div>
                      {result.tampering.issues_found?.length > 0 && (
                        <div className="bg-red-900/20 border border-red-500/30 p-3 rounded-lg">
                          <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2">Issues Found</p>
                          <ul className="space-y-1">
                            {result.tampering.issues_found.map((issue, i) => (
                              <li key={i} className="text-sm text-red-200 flex items-start gap-2">
                                <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" /> {issue}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {(!result.tampering.issues_found || result.tampering.issues_found.length === 0) && (
                        <div className="bg-emerald-900/20 border border-emerald-500/30 p-3 rounded-lg flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                          <span className="text-sm text-emerald-300">No tampering indicators detected.</span>
                        </div>
                      )}
                    </div>
                  )}
                </Section>

                {/* ═══ Steps 6 & 7: Expiry + Registration ═══ */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <Section id="expiry" icon={<CalendarCheck className="w-5 h-5" />} title="Step 6 — Expiry" iconColor="text-teal-400"
                    badge={<StatusBadge status={result.expiry?.status === 'Valid' ? 'PASS' : result.expiry?.status === 'Expired' ? 'FAIL' : 'WARNING'} />}
                  >
                    {result.expiry && (
                      <div className="space-y-2">
                        <DetailRow label="Expiry Date" value={result.expiry.expiry_date_found} />
                        <DetailRow label="Detail" value={result.expiry.detail} />
                      </div>
                    )}
                  </Section>
                  <Section id="registration" icon={<Hash className="w-5 h-5" />} title="Step 7 — Registration" iconColor="text-sky-400"
                    badge={<StatusBadge status={
                      result.registration?.status === 'Verified Format' ? 'PASS' 
                      : result.registration?.status === 'Suspicious Format' ? 'FAIL' 
                      : 'WARNING'
                    } />}
                  >
                    {result.registration && (
                      <div className="space-y-2">
                        <DetailRow label="Reg. Number" value={result.registration.registration_number} />
                        <DetailRow label="Detail" value={result.registration.detail} />
                      </div>
                    )}
                  </Section>
                </div>

                {/* ═══ Step 10: Decision Checklist ═══ */}
                <Section id="decision" icon={<ListChecks className="w-5 h-5" />} title="Step 10 — Verification Checklist" iconColor="text-purple-400">
                  {result.decision?.checks && (
                    <div className="space-y-1.5">
                      {result.decision.checks.map((chk, i) => (
                        <div key={i} className="flex items-center gap-3 py-1.5 border-b border-white/5 last:border-0">
                          <CheckIcon result={chk.result} />
                          <span className="text-sm text-slate-200 flex-1 min-w-0">{chk.check}</span>
                          <StatusBadge status={chk.result} />
                        </div>
                      ))}
                    </div>
                  )}
                </Section>

                {/* ═══ Step 11: Final Recommendation ═══ */}
                <Section id="recommendation" icon={<MessageSquare className="w-5 h-5" />} title="Step 11 — Final Recommendation" iconColor="text-brand-400">
                  {result.recommendation && (
                    <div className="space-y-4">
                      <div className={`p-4 rounded-xl border ${
                        riskLevel === 'LOW' ? 'bg-emerald-900/20 border-emerald-500/30' 
                        : riskLevel === 'MEDIUM' ? 'bg-amber-900/20 border-amber-500/30'
                        : 'bg-red-900/20 border-red-500/30'
                      }`}>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Conclusion</p>
                        <p className="text-sm text-slate-200 leading-relaxed">{result.recommendation.conclusion}</p>
                      </div>
                      <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
                        <p className="text-xs font-bold text-brand-400 uppercase tracking-wider mb-1">Recommended Action</p>
                        <p className="text-sm text-slate-200 leading-relaxed">{result.recommendation.recommended_action}</p>
                      </div>
                      {result.recommendation.crop_suitability && result.recommendation.crop_suitability !== 'N/A' && (
                        <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
                          <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">Crop Suitability</p>
                          <p className="text-sm text-slate-200 leading-relaxed">{result.recommendation.crop_suitability}</p>
                        </div>
                      )}
                    </div>
                  )}
                </Section>

              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card h-full min-h-[400px] flex flex-col items-center justify-center p-12 text-center text-slate-400 border-dashed">
                <ShieldCheck className="w-16 h-16 mb-4 text-slate-600" />
                <h3 className="text-xl font-medium text-slate-300 mb-2">Awaiting Image</h3>
                <p className="max-w-sm text-sm">Upload a pesticide label to run the full 11-step authenticity verification pipeline with OCR, official reference comparison, tampering detection, and risk assessment.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
