import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FileText, AlertTriangle, UploadCloud, Map, Droplets, Sprout, TrendingUp, ShieldAlert, Sparkles, CloudRain, Gauge, FileDown, Loader2, Trash2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { PageHeader, Card, Button, Input, InputGroup, Badge, SectionHeader, Tilt } from '../design-system/components';
import { pageVariants, pageTransition, fadeInLeft, fadeInRight, slideUp } from '../design-system/animations';
import { API_BASE } from '../utils/api';

const Report = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    Nitrogen: 90,
    Phosphorus: 40,
    Potassium: 40,
    Temperature: 28,
    Humidity: 70,
    pH: 6.5,
    Rainfall: 200,
    Area: 'India',
    Crop: 'rice',
    Year: 2024,
    Season: 'Kharif'
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? (value === '' ? '' : parseFloat(value)) : value
    });
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    const payload = new FormData();
    if (file) payload.append('file', file);

    for (const key in formData) {
      payload.append(key, formData[key]);
    }

    try {
      const { data } = await axios.post(`${API_BASE}/chinar-agro-report`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(data.chinar_agro_report);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to request fused model report compilation.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    setExporting(true);
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      
      // --- Document Settings & Fonts ---
      doc.setFont("helvetica", "normal");
      
      // --- Branded Header ---
      // Top Accent Bar (Emerald)
      doc.setFillColor(16, 185, 129);
      doc.rect(0, 0, 210, 4, 'F');
      
      // Main Branding
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(15, 23, 42); // Slate 900
      doc.text("CHINAR AGRO AI", 14, 20);
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139); // Slate 500
      doc.text("FARM INTELLIGENCE REPORT", 14, 25);
      
      // Metadata Card
      doc.setFillColor(248, 250, 252); // Slate 50
      doc.setDrawColor(226, 232, 240); // Slate 200
      doc.roundedRect(14, 30, 182, 28, 2, 2, 'FD');
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105); // Slate 600
      
      doc.setFont("helvetica", "bold");
      doc.text("Area:", 20, 38);
      doc.setFont("helvetica", "normal");
      doc.text(String(formData.Area), 45, 38);
      
      doc.setFont("helvetica", "bold");
      doc.text("Target Crop:", 20, 44);
      doc.setFont("helvetica", "normal");
      doc.text(String(formData.Crop), 45, 44);
      
      doc.setFont("helvetica", "bold");
      doc.text("Season / Year:", 20, 50);
      doc.setFont("helvetica", "normal");
      doc.text(`${formData.Season || 'N/A'} ${formData.Year}`, 45, 50);
      
      doc.setFont("helvetica", "bold");
      doc.text("Generated Date:", 110, 38);
      doc.setFont("helvetica", "normal");
      doc.text(new Date().toLocaleDateString(undefined, {year: 'numeric', month: 'long', day: 'numeric'}), 142, 38);
      
      doc.setFont("helvetica", "bold");
      doc.text("Report Version:", 110, 44);
      doc.setFont("helvetica", "normal");
      doc.text("v3.1 (Ensemble)", 142, 44);
      
      // Separator Line
      doc.setDrawColor(226, 232, 240);
      doc.line(14, 66, 196, 66);
      
      // --- Section 1: Soil & Climatic Parameters ---
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text("1. Soil & Climatic Parameters", 14, 74);
      
      // Table Headers
      doc.setFillColor(241, 245, 249); // Slate 100
      doc.rect(14, 79, 182, 7, 'F');
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      doc.text("Parameter Name", 18, 84);
      doc.text("Measured Value", 90, 84);
      doc.text("Agronomic Status", 135, 84);
      
      // Table Rows
      const rows = [
        { name: "Nitrogen (N)", val: `${formData.Nitrogen} mg/kg`, status: formData.Nitrogen < 50 ? "Low (Deficient)" : formData.Nitrogen > 100 ? "High" : "Optimal" },
        { name: "Phosphorus (P)", val: `${formData.Phosphorus} mg/kg`, status: formData.Phosphorus < 30 ? "Low (Deficient)" : "Optimal" },
        { name: "Potassium (K)", val: `${formData.Potassium} mg/kg`, status: formData.Potassium < 40 ? "Low (Deficient)" : "Optimal" },
        { name: "Soil pH", val: `${formData.pH}`, status: formData.pH < 6.0 ? "Acidic" : formData.pH > 7.2 ? "Alkaline" : "Optimal Neutral" },
        { name: "Temperature", val: `${formData.Temperature} °C`, status: "Average" },
        { name: "Humidity", val: `${formData.Humidity} %`, status: "Average" },
        { name: "Rainfall", val: `${formData.Rainfall} mm`, status: "Seasonal Average" }
      ];
      
      let y = 86;
      doc.setFont("helvetica", "normal");
      rows.forEach((r, idx) => {
        y += 6;
        // Alternating row bg
        if (idx % 2 === 1) {
          doc.setFillColor(248, 250, 252);
          doc.rect(14, y - 4, 182, 6, 'F');
        }
        doc.setTextColor(71, 85, 105);
        doc.text(r.name, 18, y);
        doc.text(r.val, 90, y);
        
        // Status color coding
        if (r.status.includes("Low") || r.status.includes("Acidic") || r.status.includes("Alkaline")) {
          doc.setTextColor(217, 119, 6); // Amber
        } else if (r.status === "Optimal") {
          doc.setTextColor(16, 185, 129); // Emerald
        } else {
          doc.setTextColor(71, 85, 105);
        }
        doc.text(r.status, 135, y);
      });
      
      // --- Section 2: Predictive Intelligence ---
      y += 12;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text("2. AI Predictive Intelligence", 14, y);
      
      y += 5;
      // 3 Columns Cards
      // Card 1: Disease
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, y, 56, 28, 2, 2, 'FD');
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text("DISEASE DIAGNOSIS", 18, y + 6);
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      if (result.disease_prediction && !result.disease_prediction.error) {
        doc.setTextColor(225, 29, 72); // Rose 600
        doc.text(result.disease_prediction.disease, 18, y + 14);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(`Certainty: ${result.disease_prediction.confidence?.toFixed(1)}%`, 18, y + 22);
      } else {
        doc.setTextColor(100, 116, 139);
        doc.text("No Image Uploaded", 18, y + 14);
      }
      
      // Card 2: Crop Choice
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(77, y, 56, 28, 2, 2, 'FD');
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text("RECOMMENDED CROP", 81, y + 6);
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      if (result.crop_recommendation && !result.crop_recommendation.error) {
        doc.setTextColor(79, 70, 229); // Indigo 600
        doc.text(result.crop_recommendation.recommended_crop.toUpperCase(), 81, y + 14);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(`Match: ${result.crop_recommendation.confidence?.toFixed(1)}%`, 81, y + 22);
      } else {
        doc.setTextColor(100, 116, 139);
        doc.text("N/A", 81, y + 14);
      }
      
      // Card 3: Yield Forecast
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(140, y, 56, 28, 2, 2, 'FD');
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text("YIELD FORECAST", 144, y + 6);
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      if (result.yield_prediction && !result.yield_prediction.error) {
        const yieldVal = result.yield_prediction.predicted_yield;
        const isHgHa = result.yield_prediction.yield_unit === 'hg/ha';
        const yieldTons = isHgHa ? (yieldVal / 10000) : yieldVal;
        doc.setTextColor(217, 119, 6); // Amber 600
        doc.text(`${yieldTons?.toFixed(2)} t/ha`, 144, y + 14);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(`Level: ${result.yield_prediction.yield_level}`, 144, y + 22);
      } else {
        doc.setTextColor(100, 116, 139);
        doc.text("N/A", 144, y + 14);
      }
      
      // --- Section 3: Expert Advisory ---
      y += 38;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text("3. Expert Advisory", 14, y);
      
      y += 5;
      
      const advice = [];
      if (formData.pH < 6.0) {
        advice.push({ title: "Acidic Soil Treatment Required", desc: `Your soil pH of ${formData.pH} is acidic. We strongly recommend spreading agricultural lime (calcium carbonate) or dolomite to increase soil pH to the optimal range (6.0 - 7.0).` });
      } else if (formData.pH > 7.2) {
        advice.push({ title: "Alkaline Soil Mitigation", desc: `Your soil pH of ${formData.pH} is alkaline. We recommend adding elemental sulfur, ammonium sulfate, or peat moss to lower the pH.` });
      }
      if (formData.Nitrogen < 50) {
        advice.push({ title: "Nitrogen Deficient Advisory", desc: `Soil Nitrogen level is low (${formData.Nitrogen} mg/kg). Apply nitrogenous fertilizers like Urea (46% N) or plant Nitrogen-fixing legume cover crops.` });
      }
      if (formData.Phosphorus < 30) {
        advice.push({ title: "Phosphorus Supplement Recommendation", desc: "Phosphorus is deficient. Apply Diammonium Phosphate (DAP) or bone meal to stimulate healthy crop root systems." });
      }
      if (formData.Potassium < 40) {
        advice.push({ title: "Potassium Defense Recommendation", desc: "Potassium is low. Apply Muriate of Potash (MOP) to improve crop disease resistance and drought tolerance." });
      }
      if (advice.length === 0) {
        advice.push({ title: "Optimal Soil & Field Health", desc: "All macronutrients (N, P, K) and soil pH are in optimal growth ranges for the target crop. No correction needed." });
      }
      
      advice.forEach((item) => {
        // Background Box
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(14, y, 182, 16, 1.5, 1.5, 'F');
        
        // Bullet
        doc.setFillColor(16, 185, 129);
        doc.circle(18, y + 8, 1.2, 'F');
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(15, 23, 42);
        doc.text(item.title, 23, y + 6);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(71, 85, 105);
        
        // Split text to fit line width
        const splitText = doc.splitTextToSize(item.desc, 170);
        doc.text(splitText, 23, y + 11);
        
        y += 19;
      });
      
      // --- Footer ---
      doc.setDrawColor(241, 245, 249);
      doc.line(14, 282, 196, 282);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184); // Slate 400
      doc.text("Chinar Agro AI • Intelligent Agricultural Advisory System", 14, 287);
      doc.text("Page 1 of 1", 175, 287);
      
      doc.save(`Chinar_Agro_Report_${formData.Crop}_${formData.Year}.pdf`);
    } catch (err) {
      console.error('PDF export failed:', err);
      alert('Failed to generate PDF.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <motion.div
      {...pageVariants}
      transition={pageTransition}
      className="space-y-8 pb-16"
    >
      <PageHeader
        icon={FileText}
        title={t('report_title')}
        subtitle="Unified Farm Intelligence Report Compiler"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Data Fuser Entry Fields */}
        <motion.div {...fadeInLeft} className="lg:col-span-5 flex flex-col gap-6">
          <div className="flex flex-col">
            <h2 className="text-[11px] font-bold text-white/30 uppercase tracking-widest font-mono flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-brand-400" /> Pipeline Aggregators
            </h2>
            <p className="text-caption text-white/20 mt-1 leading-relaxed">
              Supply multi-spectral leaf photos, biosphere soil conditions, and target coordinates.
            </p>
          </div>

          <Tilt spotlight={true} intensity={20}>
            <Card variant="glass" padding="md" className="relative overflow-hidden group">
              <form onSubmit={handlePredict} className="space-y-6 relative z-10">

                {/* Leaf Image capture preview dropzone */}
                <div className="bg-white/[0.01] border border-white/[0.03] p-4 rounded-lg">
                  <SectionHeader
                    icon={UploadCloud}
                    title={t('report_plant_image')}
                    iconColor="text-brand-400"
                    className="mb-2"
                  />
                  <div
                    className="border border-dashed border-white/10 bg-surface-900/50 rounded-lg p-5 flex flex-col items-center justify-center text-center hover:border-brand-500/30 hover:bg-white/[0.02] transition-all cursor-pointer font-mono text-caption"
                    onClick={() => document.getElementById('report-file').click()}
                  >
                    <input id="report-file" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    {preview ? (
                      <div className="relative w-full flex items-center justify-center group/preview">
                        <motion.img
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          src={preview} alt="Leaf Specimen" className="h-20 object-contain rounded shadow"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFile(null);
                            setPreview(null);
                          }}
                          className="absolute -top-1 -right-1 p-1 rounded-md bg-surface-900/90 border border-white/10 text-white/60 hover:text-white hover:bg-danger/20 hover:border-danger/30 transition-all shadow-md z-30 flex items-center justify-center"
                          title="Remove Image"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-white/20 uppercase tracking-widest text-[9px] font-bold">specimen leaf image</span>
                    )}
                  </div>
                </div>

                {/* Soil elements */}
                <div className="space-y-3">
                  <SectionHeader
                    icon={Droplets}
                    title={t('report_biosphere_metrics')}
                    iconColor="text-brand-400"
                  />
                  <InputGroup cols={2} gap="gap-4">
                    {[
                      { name: 'Nitrogen', label: t('report_nitrogen'), unit: 'kg/ha' },
                      { name: 'Phosphorus', label: t('report_phosphorus'), unit: 'kg/ha' },
                      { name: 'Potassium', label: t('report_potassium'), unit: 'kg/ha' },
                      { name: 'Temperature', label: t('report_temperature'), unit: '°C' },
                      { name: 'Humidity', label: t('report_humidity'), unit: '%' },
                      { name: 'pH', label: t('report_ph'), unit: 'pH' },
                      { name: 'Rainfall', label: t('report_rainfall'), unit: 'mm' },
                    ].map(f => (
                      <Input
                        key={f.name}
                        type="number"
                        step="any"
                        name={f.name}
                        value={formData[f.name]}
                        onChange={handleChange}
                        required
                        label={f.label}
                        unit={f.unit}
                        inputClassName="font-mono text-caption"
                      />
                    ))}
                  </InputGroup>
                </div>

                {/* Spatial targets */}
                <div className="space-y-3 pt-2">
                  <SectionHeader
                    icon={Map}
                    title={t('report_location_details')}
                    iconColor="text-accent-500"
                  />
                  <InputGroup cols={2} gap="gap-4">
                    <Input
                      type="text"
                      name="Area"
                      value={formData.Area}
                      onChange={handleChange}
                      required
                      label={t('report_area')}
                      inputClassName="font-mono text-caption"
                    />
                    <Input
                      type="text"
                      name="Crop"
                      value={formData.Crop}
                      onChange={handleChange}
                      required
                      label={t('report_crop')}
                      inputClassName="font-mono text-caption"
                    />
                    <div>
                      <Input
                        type="number"
                        name="Year"
                        value={formData.Year}
                        onChange={handleChange}
                        required
                        label={t('report_year')}
                        inputClassName="font-mono text-caption"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-caption text-white/50 uppercase tracking-widest font-mono text-[9px]">
                        {t('report_season')}
                      </label>
                      <select
                        name="Season"
                        value={formData.Season}
                        onChange={handleChange}
                        required
                        className="w-full bg-surface-900 border border-white/[0.08] hover:border-white/20 focus:border-brand-500/50 rounded-lg px-4 py-2.5 text-white focus:outline-none transition-colors text-caption font-mono uppercase appearance-none"
                      >
                        {['Kharif', 'Rabi', 'Whole Year', 'Autumn', 'Summer', 'Winter'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </InputGroup>
                </div>

                <div className="pt-4 border-t border-white/[0.04]">
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    loading={loading}
                    type="submit"
                    icon={FileText}
                  >
                    Compile Aggregations
                  </Button>
                </div>
              </form>
            </Card>
          </Tilt>
        </motion.div>

        {/* RIGHT COLUMN: Fused Report display */}
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
                  <h4 className="font-bold">COMPILATION ERROR</h4>
                  <p className="text-white/50 mt-1">{error}</p>
                </div>
              </motion.div>
            )}

            {/* Placeholder */}
            {!result && !error && !loading && (
              <motion.div
                key="placeholder"
                {...slideUp}
                className="border border-dashed border-white/5 bg-surface-800/10 rounded-xl p-16 flex flex-col items-center justify-center text-center min-h-[500px]"
              >
                <div className="w-12 h-12 rounded-full bg-white/[0.01] border border-white/[0.04] flex items-center justify-center mb-4">
                  <FileText className="w-5 h-5 text-white/20" />
                </div>
                <h4 className="font-heading text-body-md text-white/50 font-semibold">Report Compiler Staged</h4>
                <p className="text-caption text-white/20 mt-1 max-w-xs leading-relaxed">
                  Provide variables in the pipeline console and compile to trigger unified farm intelligence fusion.
                </p>
              </motion.div>
            )}

            {/* Loading */}
            {loading && (
              <div className="border border-white/[0.03] bg-surface-800/20 rounded-xl p-16 flex flex-col items-center justify-center min-h-[500px] font-mono">
                <div className="w-10 h-10 border border-white/20 border-t-white animate-spin rounded-full mb-4" />
                <span className="text-[10px] text-white/40 uppercase tracking-widest animate-pulse">Running Fuser Agents...</span>
              </div>
            )}

            {/* Results output */}
            {result && !loading && (
              <motion.div
                key="result"
                {...slideUp}
                className="space-y-6"
              >
                <div id="chinar-report-print-area" className="relative">
                  <Tilt spotlight={true} intensity={15}>
                    <Card variant="glass" padding="md" className="relative overflow-hidden border-brand-500/10">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/[0.02] rounded-full blur-[60px]" />
                      
                      {/* Branded Header */}
                      <div className="border-b border-white/10 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
                        <div>
                          <h3 className="font-heading text-heading-md font-bold text-gradient-white uppercase tracking-wider">
                            Chinar Agro AI
                          </h3>
                          <span className="text-[9px] font-bold uppercase tracking-widest text-brand-300 font-mono mt-1">
                            Farm Intelligence Report
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs font-mono text-slate-400 bg-slate-900/40 p-4 rounded-xl border border-white/5">
                          <div><span className="text-slate-500 font-bold uppercase tracking-wider">Area:</span> <span className="text-slate-200 capitalize">{formData.Area}</span></div>
                          <div><span className="text-slate-500 font-bold uppercase tracking-wider">Crop:</span> <span className="text-slate-200 capitalize">{formData.Crop}</span></div>
                          <div><span className="text-slate-500 font-bold uppercase tracking-wider">Season:</span> <span className="text-slate-200 capitalize">{formData.Season}</span></div>
                          <div><span className="text-slate-500 font-bold uppercase tracking-wider">Year:</span> <span className="text-slate-200">{formData.Year}</span></div>
                        </div>
                      </div>

                      <div className="space-y-6 pt-6 relative z-10">
                        {/* Biosphere Inputs Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                          {/* Soil Health Card */}
                          <div className="bg-white/[0.01] border border-white/[0.03] rounded-lg p-5 flex flex-col justify-between h-full">
                            <SectionHeader
                              icon={Gauge}
                              title="Soil Nutrient Profile"
                              iconColor="text-emerald-400"
                              className="mb-4"
                            />
                            <div className="space-y-4 flex-1 flex flex-col justify-between">
                              <div>
                                <div className="flex justify-between text-xs font-bold mb-1">
                                  <span className="text-slate-400">Nitrogen (N)</span>
                                  <span className="text-emerald-400 font-mono">{formData.Nitrogen} mg/kg</span>
                                </div>
                                <div className="w-full bg-slate-900/60 h-2 rounded-full overflow-hidden border border-white/5">
                                  <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full" style={{ width: `${Math.min((formData.Nitrogen/140)*100, 100)}%` }}></div>
                                </div>
                              </div>
                              <div>
                                <div className="flex justify-between text-xs font-bold mb-1">
                                  <span className="text-slate-400">Phosphorus (P)</span>
                                  <span className="text-emerald-400 font-mono">{formData.Phosphorus} mg/kg</span>
                                </div>
                                <div className="w-full bg-slate-900/60 h-2 rounded-full overflow-hidden border border-white/5">
                                  <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full" style={{ width: `${Math.min((formData.Phosphorus/145)*100, 100)}%` }}></div>
                                </div>
                              </div>
                              <div>
                                <div className="flex justify-between text-xs font-bold mb-1">
                                  <span className="text-slate-400">Potassium (K)</span>
                                  <span className="text-emerald-400 font-mono">{formData.Potassium} mg/kg</span>
                                </div>
                                <div className="w-full bg-slate-900/60 h-2 rounded-full overflow-hidden border border-white/5">
                                  <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full" style={{ width: `${Math.min((formData.Potassium/205)*100, 100)}%` }}></div>
                                </div>
                              </div>
                              <div className="flex justify-between items-center pt-3 border-t border-white/5 mt-2">
                                <span className="text-xs font-bold text-slate-400">Soil pH</span>
                                <Badge variant={formData.pH >= 6.0 && formData.pH <= 7.0 ? 'success' : 'warning'} size="sm">
                                  {formData.pH} ({formData.pH < 6.0 ? 'Acidic' : formData.pH > 7.0 ? 'Alkaline' : 'Neutral'})
                                </Badge>
                              </div>
                            </div>
                          </div>

                          {/* Climate Analytics Card */}
                          <div className="bg-white/[0.01] border border-white/[0.03] rounded-lg p-5 flex flex-col justify-between h-full">
                            <SectionHeader
                              icon={CloudRain}
                              title="Climate Conditions"
                              iconColor="text-cyan-400"
                              className="mb-4"
                            />
                            <div className="grid grid-cols-2 gap-4 flex-1">
                              <div className="bg-slate-900/40 p-4 rounded-xl border border-white/5 flex flex-col justify-center">
                                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Temperature</span>
                                <span className="text-cyan-400 font-mono text-xl font-extrabold">{formData.Temperature}°C</span>
                              </div>
                              <div className="bg-slate-900/40 p-4 rounded-xl border border-white/5 flex flex-col justify-center">
                                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Humidity</span>
                                <span className="text-cyan-400 font-mono text-xl font-extrabold">{formData.Humidity}%</span>
                              </div>
                              <div className="bg-slate-900/40 p-4 rounded-xl border border-white/5 col-span-2 flex flex-col justify-center">
                                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Rainfall Volume</span>
                                <span className="text-cyan-400 font-mono text-xl font-extrabold">{formData.Rainfall} mm</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Predictions Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                          {/* Visual Condition Render */}
                          <div className="bg-white/[0.01] border border-white/[0.03] rounded-lg p-5 flex flex-col justify-between h-full">
                            <SectionHeader
                              icon={ShieldAlert}
                              title="Disease Detection"
                              iconColor="text-rose-400"
                              className="mb-4"
                            />
                            <div className="flex-1 flex flex-col justify-between">
                              {result.disease_prediction ? (
                                result.disease_prediction.error ? (
                                  <p className="text-rose-400 tracking-wide font-mono text-xs">{result.disease_prediction.error}</p>
                                ) : (
                                  <div className="space-y-3">
                                    <div>
                                      <p className="text-base font-extrabold text-white capitalize mb-1 tracking-wide truncate">
                                        {result.disease_prediction.disease}
                                      </p>
                                      <p className="text-[9px] text-rose-300 font-bold uppercase tracking-widest">{t('report_detected_signature')}</p>
                                    </div>
                                    <div className="flex justify-between items-center pt-2 border-t border-white/5">
                                      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{t('report_certainty')}</span>
                                      <span className="text-xs font-extrabold text-rose-400 font-mono">{result.disease_prediction.confidence?.toFixed(1)}%</span>
                                    </div>
                                  </div>
                                )
                              ) : (
                                <p className="text-slate-500 font-mono text-xs tracking-wide">{t('report_no_image')}</p>
                              )}
                            </div>
                          </div>

                          {/* Crop Array Render */}
                          {result.crop_recommendation && (
                            <div className="bg-white/[0.01] border border-white/[0.03] rounded-lg p-5 flex flex-col justify-between h-full">
                              <SectionHeader
                                icon={Sprout}
                                title="Crop Choice"
                                iconColor="text-indigo-400"
                                className="mb-4"
                              />
                              <div className="flex-1 flex flex-col justify-between">
                                {result.crop_recommendation.error ? (
                                  <p className="text-red-400 tracking-wide font-mono text-xs">{result.crop_recommendation.error}</p>
                                ) : (
                                  <div className="space-y-3">
                                    <div>
                                      <p className="text-base font-extrabold text-indigo-300 capitalize mb-1 tracking-wide truncate">
                                        {result.crop_recommendation.recommended_crop}
                                      </p>
                                      <p className="text-[9px] text-indigo-400 font-bold uppercase tracking-widest">{t('report_best_crop')}</p>
                                    </div>
                                    {result.crop_recommendation.confidence && (
                                      <div className="flex justify-between items-center pt-2 border-t border-white/5">
                                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{t('report_match')}</span>
                                        <span className="text-xs font-extrabold text-indigo-400 font-mono">{result.crop_recommendation.confidence.toFixed(1)}%</span>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Spatial Forecast Render */}
                          {result.yield_prediction && (
                            <div className="bg-white/[0.01] border border-white/[0.03] rounded-lg p-5 flex flex-col justify-between h-full">
                              <SectionHeader
                                icon={TrendingUp}
                                title="Yield Forecast"
                                iconColor="text-amber-400"
                                className="mb-4"
                              />
                              <div className="flex-1 flex flex-col justify-between">
                                {result.yield_prediction.error ? (
                                  <p className="text-red-400 tracking-wide font-mono text-xs">{result.yield_prediction.error}</p>
                                ) : (() => {
                                  const yieldVal = result.yield_prediction.predicted_yield;
                                  const isHgHa = result.yield_prediction.yield_unit === 'hg/ha';
                                  const yieldTons = isHgHa ? (yieldVal / 10000) : yieldVal;
                                  const yieldHg = isHgHa ? yieldVal : (yieldVal * 10000);
                                  return (
                                    <div className="space-y-3">
                                      <div>
                                        <p className="text-base font-extrabold text-amber-400 mb-1 tracking-wide flex items-baseline gap-1">
                                          {yieldTons?.toFixed(2)} <span className="text-xs text-amber-400/70 font-mono">t/ha</span>
                                        </p>
                                        <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wide">({yieldHg?.toLocaleString(undefined, {maximumFractionDigits:0})} hg/ha)</p>
                                      </div>
                                      <div className="flex justify-between items-center pt-2 border-t border-white/5">
                                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{t('report_yield_level')}</span>
                                        <Badge variant={result.yield_prediction.yield_level === 'HIGH' ? 'success' : result.yield_prediction.yield_level === 'MEDIUM' ? 'warning' : 'danger'} size="sm">
                                          {result.yield_prediction.yield_level}
                                        </Badge>
                                      </div>
                                    </div>
                                  );
                                })()}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Expert Agronomic Advisory */}
                        <div className="bg-white/[0.01] border border-white/[0.03] rounded-lg p-5 flex flex-col justify-between">
                          <SectionHeader
                            icon={Sparkles}
                            title="Expert Agricultural Advisory"
                            iconColor="text-brand-400"
                            className="mb-4"
                          />
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                            {(() => {
                              const advice = [];
                              if (formData.pH < 6.0) {
                                advice.push({ title: "Acidic Soil Warning", desc: "Your soil pH is acidic. We recommend adding agricultural lime (calcium carbonate) or dolomite to increase soil pH." });
                              } else if (formData.pH > 7.2) {
                                advice.push({ title: "Alkaline Soil Warning", desc: "Your soil pH is alkaline. Consider adding elemental sulfur, ammonium sulfate, or peat moss to lower the pH." });
                              }
                              if (formData.Nitrogen < 50) {
                                advice.push({ title: "Nitrogen Deficient", desc: "Nitrogen level is low. We recommend applying Nitrogen-rich fertilizers like Urea, Ammonium Nitrate, or organic blood meal." });
                              }
                              if (formData.Phosphorus < 30) {
                                advice.push({ title: "Phosphorus Deficient", desc: "Phosphorus level is low. Apply Diammonium Phosphate (DAP) or bone meal to stimulate healthy root development." });
                              }
                              if (formData.Potassium < 40) {
                                advice.push({ title: "Potassium Deficient", desc: "Potassium level is low. Consider applying Muriate of Potash (MOP) or sulfate of potash to improve drought resistance." });
                              }
                              if (advice.length === 0) {
                                advice.push({ title: "Optimal Soil Health", desc: "All macronutrients and pH are in optimal ranges. Keep up standard organic compost maintenance!" });
                              }
                              return advice.map((item, idx) => (
                                <div key={idx} className="bg-slate-900/60 p-4 rounded-xl border border-white/5 flex flex-col justify-between">
                                  <h5 className="text-xs font-extrabold text-white mb-1.5 uppercase tracking-wider flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-brand-400"></span> {item.title}
                                  </h5>
                                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans flex-1">{item.desc}</p>
                                </div>
                              ));
                            })()}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Tilt>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleExportPDF}
                    disabled={exporting}
                    icon={exporting ? Loader2 : FileDown}
                  >
                    {exporting ? t('report_btn_generating_pdf') || 'Generating PDF...' : t('report_export_pdf') || 'Export PDF Report'}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Report;
