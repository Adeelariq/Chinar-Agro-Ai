import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wheat, AlertTriangle, CheckCircle, TrendingUp, TrendingDown,
  Minus, Thermometer, CloudRain, Wind, ShieldAlert, Lightbulb,
  FlaskConical, Droplets, Bug, BarChart3, Target, Activity,
  ChevronDown, ChevronUp, TriangleAlert, Info, Zap
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';
import { PageHeader, Card, Button, Badge, SectionHeader, Tilt } from '../design-system/components';
import { pageVariants, pageTransition, fadeInLeft, slideUp } from '../design-system/animations';
import { chartTheme } from '../design-system/tokens';
import { API_BASE } from '../utils/api';

/* ─── Dynamic Translations ─────────────────────────── */
const dynamicTranslations = {
  temperature_low: { en: "Temperature is below ideal for the crop. Cold stress may reduce yield.", hi: "तापमान आदर्श से कम है। ठंड के तनाव से उपज कम हो सकती है।", mr: "तापमान आदर्शापेक्षा कमी आहे. थंडीच्या ताणामुळे उत्पादन कमी होऊ शकते." },
  temperature_high: { en: "Temperature is above the ideal maximum. Heat stress may reduce grain filling.", hi: "तापमान आदर्श अधिकतम से ऊपर है। गर्मी के तनाव से दाने भरने में कमी आ सकती है।", mr: "तापमान आदर्श कमाल मर्यादेच्या वर आहे. उष्णतेच्या ताणामुळे दाणे भरण्यात अडथळा येऊ शकतो." },
  temperature_optimal: { en: "Temperature is within the optimal range.", hi: "तापमान इष्टतम है।", mr: "तापमान अनुकूल मर्यादेत आहे." },
  rainfall_low: { en: "Rainfall deficit detected. Supplemental irrigation is critical.", hi: "वर्षा की कमी। पूरक सिंचाई आवश्यक है।", mr: "पावसाची कमतरता. पूरक सिंचन आवश्यक आहे." },
  rainfall_high: { en: "Excess rainfall may cause waterlogging and increase disease pressure.", hi: "अत्यधिक वर्षा से बीमारियों का खतरा बढ़ सकता है।", mr: "जास्त पावसामुळे पाणी साचून रोगाचा धोका वाढू शकतो." },
  rainfall_optimal: { en: "Rainfall is adequate for crop requirements.", hi: "वर्षा फसल के लिए पर्याप्त है।", mr: "पाऊस पिकाच्या गरजेसाठीुरेसा आहे." },
  humidity_low: { en: "Low humidity may cause water stress.", hi: "कम आर्द्रता जल तनाव पैदा कर सकती है।", mr: "कमी आर्द्रतेमुळे पाण्याचा ताण येऊ शकतो." },
  humidity_high: { en: "High humidity increases fungal disease risk.", hi: "उच्च आर्द्रता फंगल रोगों के जोखिम को बढ़ाती है।", mr: "जास्त आर्द्रतेमुळे बुरशीजन्य आजारांचा धोका वाढतो." },
  humidity_optimal: { en: "Humidity is within the acceptable range.", hi: "आर्द्रता स्वीकार्य है।", mr: "आर्द्रता योग्य मर्यादेत आहे." },
  season_optimal: { en: "The current season is highly suitable.", hi: "वर्तमान मौसम उपयुक्त है।", mr: "सध्याचा हंगाम अनुकूल आहे." },
  season_suboptimal: { en: "The selected season is not ideal for this crop.", hi: "चयनित मौसम आदर्श नहीं है।", mr: "निवडलेला हंगाम योग्य नाही." },
  season_unknown: { en: "No strong season preference data available.", hi: "कोई मौसम डेटा उपलब्ध नहीं है।", mr: "हंगामाच्या पसंतीचा कोणताही डेटा उपलब्ध नाही." },
  year_trend_optimal: { en: "Recent year benefits from modern cultivar adoption.", hi: "आधुनिक खेती अपनाने से लाभ।", mr: "आधुनिक लागवड पद्धतींचा फायदा." },
  year_trend_neutral: { en: "Moderate technology adoption expected.", hi: "मध्यम तकनीक अपनाने की उम्मीद है।", mr: "मध्यम तंत्रज्ञानाचा वापर अपेक्षित आहे." },
  LOW_RAINFALL: { en: "Low rainfall detected. Drought risk elevated.", hi: "कम वर्षा। सूखे का जोखिम बढ़ा।", mr: "कमी पाऊस. दुष्काळाचा धोका." },
  SEVERE_DROUGHT_RISK: { en: "Severe drought risk. Immediate irrigation required.", hi: "गंभीर सूखे का जोखिम।", mr: "तीव्र दुष्काळाचा धोका." },
  HIGH_HEAT_STRESS: { en: "Extreme heat warning. Yield reduction possible.", hi: "अत्यधिक गर्मी की चेतावनी।", mr: "अति उष्णतेचा इशारा." },
  MILD_HEAT_STRESS: { en: "Mild heat stress. Use mulching if possible.", hi: "हल्की गर्मी का तनाव।", mr: "सौम्य उष्णतेचा ताण." },
  FROST_WARNING: { en: "Frost warning. Cold stress likely.", hi: "पाले की चेतावनी।", mr: "दव पडण्याची चेतावणी." },
  HIGH_DISEASE_RISK: { en: "High humidity indicates possible fungal disease.", hi: "उच्च आर्द्रता से फंगल बीमारी की संभावना।", mr: "जास्त आर्द्रतेमुळे बुरशीजन्य आजाराची शक्यता." },
  ELEVATED_DISEASE_RISK: { en: "Elevated disease risk detected.", hi: "बढ़ी हुई बीमारी का जोखिम।", mr: "रोगाचा धोका वाढला आहे." },
  WATERLOGGING_WARNING: { en: "Waterlogging risk. Improve drainage.", hi: "जलभराव का जोखिम।", mr: "पाणी साचण्याचा धोका." },
  YIELD_BELOW_REGIONAL_AVERAGE: { en: "Predicted yield is below the regional average.", hi: "तुलनात्मक उपज क्षेत्रीय औसत से कम है।", mr: "अपेक्षित उत्पादन प्रादेशिक सरासरीपेक्षा कमी आहे." },
  HIGH_PRODUCTION_RISK: { en: "High production risk. Consider immediate mitigations.", hi: "उच्च उत्पादन जोखिम।", mr: "उच्च उत्पादन जोखीम." },
  YIELD_ABOVE_REGIONAL_AVERAGE: { en: "Yield is tracking above regional averages.", hi: "उपज क्षेत्रीय औसत से ऊपर है।", mr: "उत्पादन प्रादेशिक सरासरीच्या वर आहे." },
};

const CROPS = ['Rice','Wheat','Maize','Barley','Bajra','Jowar','Sugarcane','Cotton(lint)','Groundnut','Soyabean','Sunflower','Potato','Onion','Banana','Coconut','Arhar/Tur','Gram','Jute','Turmeric','Ginger','Ragi','Linseed','Sesamum'];
const STATES = ['Andhra Pradesh','Assam','Bihar','Chhattisgarh','Gujarat','Haryana','Himachal Pradesh','Jammu and Kashmir','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal'];
const SEASONS = ['Kharif','Rabi','Whole Year','Autumn','Summer','Winter'];

/* ─── Helpers ──────────────────────────────────────── */
const yieldColor = (level) => ({
  HIGH:   { text: 'text-success-light', border: 'border-success/30', bg: 'bg-success-muted', glow: '#22c55e', variant: 'success' },
  MEDIUM: { text: 'text-warning-light', border: 'border-warning/30', bg: 'bg-warning-muted', glow: '#eab308', variant: 'warning' },
  LOW:    { text: 'text-danger-light', border: 'border-danger/30', bg: 'bg-danger-muted', glow: '#ef4444', variant: 'danger' },
}[level] || { text: 'text-white/40', border: 'border-white/10', bg: 'bg-white/5', glow: 'transparent', variant: 'neutral' });

const riskColor = (level) => ({ HIGH: 'text-danger-light', MEDIUM: 'text-warning-light', LOW: 'text-success-light' }[level] || 'text-white/40');

const severityStyle = (s) => ({
  CRITICAL: 'border-danger/20 bg-danger/5 text-danger-light',
  WARNING:  'border-warning/20 bg-warning/5 text-warning-light',
  INFO:     'border-info/20 bg-info/5 text-info-light',
}[s] || 'border-white/5 bg-white/[0.01] text-white/50');

const SeverityIcon = ({ s }) => ({
  CRITICAL: <TriangleAlert className="w-4 h-4 shrink-0 text-danger-light" />,
  WARNING:  <AlertTriangle className="w-4 h-4 shrink-0 text-warning-light" />,
  INFO:     <Info className="w-4 h-4 shrink-0 text-info-light" />,
}[s] || null);

const factorDot = (status) => ({ optimal: 'bg-success', low: 'bg-danger', high: 'bg-warning', suboptimal: 'bg-orange-500', unknown: 'bg-white/20' }[status] || 'bg-white/20');

/* ─── Recharts Tooltip ─────────────────────────────── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-800 border border-white/[0.04] p-3 rounded-lg text-caption font-mono">
      <p className="text-white/30 mb-1 uppercase tracking-wider">{label}</p>
      <p className="text-accent-500 font-bold">{Number(payload[0].value).toLocaleString()} hg/ha</p>
    </div>
  );
};

/* ─── Sub Cards ────────────────────────────────────── */
const YieldHeroCard = ({ result }) => {
  const c = yieldColor(result.yield_level);
  const yieldTons = (result.predicted_yield / 10000).toFixed(2);
  const { t } = useTranslation();
  return (
    <Tilt spotlight={true} intensity={35}>
      <Card variant="glass" padding="lg" className="relative overflow-hidden border-brand-500/10">
        <div className="absolute inset-0 blur-[60px] pointer-events-none opacity-5" style={{ background: c.glow }} />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 text-center md:text-left">
            <Badge variant={c.variant} icon={CheckCircle} className="mb-3">{t('yield_ready_badge')}</Badge>
            <p className="text-overline text-white/30 uppercase mb-1 font-mono tracking-wider">{t('yield_estimated')}</p>
            <div className="flex items-baseline gap-3 justify-center md:justify-start">
              <span className="font-heading text-6xl md:text-7xl font-black text-gradient-white tracking-tight tabular-nums">
                {Number(result.predicted_yield).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
              <span className="text-body-lg font-bold text-accent-500/50 tracking-widest font-mono">HG/HA</span>
            </div>
            <p className="text-white/40 text-body-sm mt-1.5 font-light">≈ <span className="text-white font-semibold font-mono">{yieldTons}</span> {t('yield_tonnes')}</p>
          </div>
          <div className="w-px h-24 bg-white/[0.04] hidden md:block" />
          <div className="flex flex-col gap-4 min-w-[180px] font-mono text-caption text-white/60">
            <div>
              <p className="text-white/20 uppercase tracking-widest text-[9px] font-bold">{t('yield_level')}</p>
              <Badge variant={c.variant} size="sm" className="mt-1">{result.yield_level}</Badge>
            </div>
            <div>
              <p className="text-white/20 uppercase tracking-widest text-[9px] font-bold">Crop · Region</p>
              <p className="text-white font-semibold mt-1 capitalize">{result.crop} · {result.area}</p>
            </div>
            <div>
              <p className="text-white/20 uppercase tracking-widest text-[9px] font-bold">Season · Year</p>
              <p className="text-white font-semibold mt-1">{result.season}{" // "}{result.year}</p>
            </div>
          </div>
        </div>
        <div className="relative z-10 mt-8 pt-6 border-t border-white/[0.04] flex flex-wrap gap-6 font-mono text-caption text-white/40">
          <div className="flex items-center gap-2"><Thermometer className="w-4 h-4 text-orange-500" /><span>{result.weather?.temperature}°C</span></div>
          <div className="flex items-center gap-2"><CloudRain className="w-4 h-4 text-brand-400" /><span>{result.weather?.rainfall} mm</span></div>
          <div className="flex items-center gap-2"><Wind className="w-4 h-4 text-emerald-400" /><span>{result.weather?.humidity}%</span></div>
          <span className="ml-auto text-[9px] text-white/20 uppercase tracking-widest">{t('yield_weather_src')}: {result.weather?.source}</span>
        </div>
      </Card>
    </Tilt>
  );
};

const ComparisonCard = ({ comparison }) => {
  const { t } = useTranslation();
  if (!comparison) return null;
  const isAbove = comparison.status === 'ABOVE_AVERAGE';
  const isBelow = comparison.status === 'BELOW_AVERAGE';
  const TrendIcon = isAbove ? TrendingUp : isBelow ? TrendingDown : Minus;
  const color = isAbove ? 'text-success-light' : isBelow ? 'text-danger-light' : 'text-warning-light';
  const pct = Math.abs(comparison.difference_percent);
  const barFill = Math.min(100, 50 + (comparison.difference_percent / 2));
  return (
    <Tilt spotlight={true} intensity={25}>
      <Card variant="glass" padding="md" className="h-full flex flex-col justify-between">
        <div>
          <SectionHeader icon={BarChart3} title={t('section_comparison')} iconColor="text-accent-500" />
          <div className="flex items-center gap-4 mt-4">
            <div className="p-3 bg-white/[0.01] border border-white/[0.03] rounded-lg">
              <TrendIcon className={`w-6 h-6 ${color}`} />
            </div>
            <div>
              <p className={`text-heading-md font-bold font-mono leading-none ${color}`}>{isAbove ? '+' : isBelow ? '-' : ''}{pct.toFixed(1)}%</p>
              <p className="text-[10px] text-white/30 uppercase tracking-wider font-mono mt-1">{comparison.label}</p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="relative h-1 bg-white/[0.03] rounded-full overflow-hidden mb-3">
            <div className="absolute top-1/2 -translate-y-1/2 left-1/2 w-px h-3 bg-white/10" />
            <motion.div initial={{ width: '50%' }} animate={{ width: `${barFill}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`h-full rounded-full ${isAbove ? 'bg-success' : isBelow ? 'bg-danger' : 'bg-warning'}`} />
          </div>
          <div className="flex justify-between text-[8px] text-white/20 uppercase tracking-widest font-mono mb-6">
            <span>{t('comparison_below_avg')}</span><span>{t('comparison_region_avg')}</span><span>{t('comparison_above_avg')}</span>
          </div>

          <div className="grid grid-cols-3 gap-3 border-t border-white/[0.04] pt-4 font-mono text-caption">
            {[
              [t('comparison_your_yield'), `${Number(comparison.difference + comparison.region_average).toLocaleString()}`, 'text-white'],
              [t('comparison_difference'), comparison.difference > 0 ? `+${Number(comparison.difference).toLocaleString()}` : Number(comparison.difference).toLocaleString(), color],
              [t('comparison_avg'), Number(comparison.region_average).toLocaleString(), 'text-white/40'],
            ].map(([l, v, c], i) => (
              <div key={i} className="flex flex-col">
                <span className="text-[8px] text-white/20 uppercase tracking-wider">{l}</span>
                <span className={`font-semibold mt-1 ${c}`}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </Tilt>
  );
};

const TrendCard = ({ trend }) => {
  const { t } = useTranslation();
  if (!trend?.data) return null;
  const chartData = trend.data.years.map((y, i) => ({ year: y, yield: trend.data.yields[i] }));
  const insightColor = { IMPROVING: 'text-success-light', DECLINING: 'text-danger-light', STABLE: 'text-warning-light', VOLATILE: 'text-orange-400' }[trend.insight] || 'text-white/40';
  const InsightIcon = { IMPROVING: TrendingUp, DECLINING: TrendingDown, STABLE: Minus, VOLATILE: Activity }[trend.insight] || Activity;
  return (
    <Tilt spotlight={true} intensity={25}>
      <Card variant="glass" padding="md" className="h-full flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <SectionHeader icon={TrendingUp} title={t('section_trend')} iconColor="text-accent-500" />
            <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider">
              <InsightIcon className={`w-3.5 h-3.5 ${insightColor}`} />
              <span className={`font-bold ${insightColor}`}>{trend.insight}</span>
            </div>
          </div>
          <div className="h-44 mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartTheme.accentStroke} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={chartTheme.accentStroke} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridStroke} vertical={false} />
                <XAxis dataKey="year" stroke={chartTheme.axisStroke} fontSize={chartTheme.axisFontSize} tickLine={false} axisLine={false} dy={8} />
                <YAxis stroke={chartTheme.axisStroke} fontSize={chartTheme.axisFontSize} tickLine={false} axisLine={false}
                  tickFormatter={v => `${(v / 1000).toFixed(0)}k`} width={30} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="yield" stroke={chartTheme.accentStroke} strokeWidth={1.5}
                  fill="url(#trendGrad)" dot={{ fill: chartTheme.accentStroke, r: 2.5, strokeWidth: 0 }}
                  activeDot={{ r: 4, fill: '#eab308' }} animationDuration={1000} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="mt-6 pt-4 border-t border-white/[0.04] flex gap-4 font-mono text-[9px] text-white/30 uppercase tracking-widest">
          <span>Change: <span className={insightColor}>{trend.change_pct > 0 ? '+' : ''}{trend.change_pct?.toFixed(1)}%</span></span>
          <span className="ml-auto">{trend.data.source === 'state' ? t('trend_state_data') : t('trend_national_est')}</span>
        </div>
      </Card>
    </Tilt>
  );
};

const AlertsCard = ({ alerts }) => {
  const { t, i18n } = useTranslation();
  if (!alerts?.length) return null;
  return (
    <Tilt spotlight={true} intensity={20}>
      <Card variant="glass" padding="md">
        <SectionHeader icon={Zap} title={`${t('section_alerts')} (${alerts.length})`} iconColor="text-danger-light" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          {alerts.map((a, i) => {
            const msg = dynamicTranslations[a.code]?.[i18n.language] || a.message;
            return (
              <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border text-body-sm font-mono leading-relaxed ${severityStyle(a.severity)}`}>
                <SeverityIcon s={a.severity} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[8px] uppercase tracking-widest font-bold opacity-60">{a.severity}</span>
                  </div>
                  <p className="text-[10px] text-white/60 leading-normal">{msg}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </Tilt>
  );
};

const ExplanationCard = ({ explanation }) => {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  if (!explanation) return null;
  return (
    <Card variant="glass" padding="md">
      <SectionHeader icon={Lightbulb} title={t('section_explanation')} iconColor="text-info-light"
        onClick={() => setOpen(o => !o)}
        action={open ? <ChevronUp className="w-4 h-4 text-white/30" /> : <ChevronDown className="w-4 h-4 text-white/30" />} />
      <p className="text-body-sm text-white/50 mb-4 leading-relaxed font-light mt-3">{explanation.summary}</p>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="flex flex-col gap-2 mt-4 border-t border-white/[0.04] pt-4">
              {explanation.factors?.map((f, i) => {
                const key = `${f.factor.toLowerCase().replace(' ', '_')}_${f.status}`;
                const msg = dynamicTranslations[key]?.[i18n.language] || f.message;
                return (
                  <div key={i} className="flex items-start gap-3 p-3 bg-white/[0.01] border border-white/[0.03] rounded-lg">
                    <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${factorDot(f.status)}`} />
                    <div className="flex-1 font-mono text-caption">
                      <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                        <span className="font-bold text-white/70">{f.factor}</span>
                        <span className="text-[9px] text-white/20">{f.value} · ideal {f.ideal}</span>
                      </div>
                      <p className="text-[10px] text-white/40 leading-normal font-sans">{msg}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

const RecommendationsCard = ({ recommendations }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  if (!recommendations) return null;
  const { fertilizer, irrigation, pest_disease, best_practices, priority } = recommendations;
  const priorityColor = { IMMEDIATE: 'text-danger-light', MODERATE: 'text-warning-light', ROUTINE: 'text-success-light' }[priority] || 'text-white/40';
  return (
    <Card variant="glass" padding="md">
      <SectionHeader icon={FlaskConical} title={t('section_recommendations')} iconColor="text-success-light"
        onClick={() => setOpen(o => !o)}
        action={<div className="flex items-center gap-2 font-mono text-[9px]">
          <span className={`font-bold uppercase tracking-widest ${priorityColor}`}>{priority}</span>
          {open ? <ChevronUp className="w-4 h-4 text-white/30" /> : <ChevronDown className="w-4 h-4 text-white/30" />}
        </div>} />
      <div className="grid sm:grid-cols-2 gap-3 mt-4">
        {best_practices?.slice(0, 4).map((p, i) => (
          <div key={i} className="flex gap-2.5 text-caption text-white/40 bg-white/[0.01] border border-white/[0.03] p-3 rounded-lg font-light leading-relaxed">
            <span className="text-brand-500 text-sm leading-none">•</span><span>{p}</span>
          </div>
        ))}
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="mt-6 space-y-4 border-t border-white/[0.04] pt-4">
              
              {/* Fertilizer */}
              <div className="bg-white/[0.01] border border-white/[0.03] rounded-lg p-4">
                <SectionHeader icon={FlaskConical} title={t('rec_fertilizer')} iconColor="text-accent-400" />
                <div className="flex gap-6 mb-3 font-mono mt-3">
                  {[['N', fertilizer?.N_kg_per_ha], ['P', fertilizer?.P_kg_per_ha], ['K', fertilizer?.K_kg_per_ha]].map(([k, v]) => (
                    <div key={k} className="text-left">
                      <p className="text-heading-md font-bold text-white leading-none">{v}</p>
                      <p className="text-[9px] text-white/20 mt-1 uppercase tracking-wider">{k} kg/ha</p>
                    </div>
                  ))}
                </div>
                <p className="text-caption text-white/40 leading-relaxed mt-2">{fertilizer?.timing}</p>
                <p className="text-caption text-white/20 mt-1 italic">{fertilizer?.note}</p>
              </div>

              {/* Irrigation */}
              <div className="bg-white/[0.01] border border-white/[0.03] rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <SectionHeader icon={Droplets} title={t('rec_irrigation')} iconColor="text-info-light" />
                  <Badge variant={irrigation?.status === 'deficit' ? 'danger' : irrigation?.status === 'surplus' ? 'warning' : 'success'} size="sm">{irrigation?.status}</Badge>
                </div>
                <p className="text-caption text-white/40 leading-relaxed mt-1">{irrigation?.advice}</p>
              </div>

              {/* Pest */}
              {pest_disease?.length > 0 && (
                <div className="bg-white/[0.01] border border-white/[0.03] rounded-lg p-4">
                  <SectionHeader icon={Bug} title={t('rec_pest')} iconColor="text-orange-400" />
                  <div className="flex flex-col gap-2 mt-3 font-mono text-caption">
                    {pest_disease.map((p, i) => (
                      <div key={i} className="flex items-center justify-between py-1.5 border-b border-white/[0.02] last:border-0">
                        <span className="text-white/60 font-medium">{p.name}</span>
                        <Badge variant={p.risk === 'high' ? 'danger' : p.risk === 'moderate' ? 'warning' : 'neutral'} size="sm">{p.risk}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

const RiskCard = ({ risk }) => {
  const { t } = useTranslation();
  if (!risk) return null;
  const score = risk.risk_score ?? 0;
  const color = riskColor(risk.overall_risk);
  return (
    <Tilt spotlight={true} intensity={25}>
      <Card variant="glass" padding="md" className="h-full flex flex-col justify-between">
        <div>
          <SectionHeader icon={ShieldAlert} title={t('section_risk')} iconColor="text-danger-light" />
          <div className="flex items-center gap-4 mt-4">
            <div className="relative w-14 h-14 shrink-0">
              <svg viewBox="0 0 36 36" className="w-14 h-14 -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="3" />
                <circle cx="18" cy="18" r="15.9" fill="none"
                  stroke={risk.overall_risk === 'HIGH' ? '#ef4444' : risk.overall_risk === 'MEDIUM' ? '#eab308' : '#22c55e'}
                  strokeWidth="3" strokeDasharray={`${score} ${100 - score}`}
                  strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center font-mono leading-none">
                <span className={`font-bold text-body-md ${color}`}>{score}</span>
              </div>
            </div>
            <div>
              <p className={`font-heading text-body-md font-bold leading-none ${color}`}>{risk.overall_risk}</p>
              <p className="text-[9px] text-white/20 uppercase tracking-widest font-mono mt-1.5">{t('risk_overall')}</p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="grid grid-cols-2 gap-2 mb-4 font-mono text-caption">
            {risk.risk_factors?.map((f, i) => (
              <div key={i} className="flex items-center justify-between bg-white/[0.01] border border-white/[0.03] px-3 py-2 rounded-lg">
                <span className="text-white/40 text-[10px]">{f.risk}</span>
                <Badge variant={f.severity === 'HIGH' ? 'danger' : f.severity === 'MEDIUM' ? 'warning' : 'success'} size="sm">{f.severity}</Badge>
              </div>
            ))}
          </div>
          {risk.mitigation?.length > 0 && (
            <div className="border-t border-white/[0.04] pt-4">
              <p className="text-[8px] text-white/20 uppercase tracking-widest font-mono font-bold mb-2">{t('risk_mitigation')}</p>
              <div className="flex flex-col gap-2 font-mono text-caption text-white/40">
                {risk.mitigation.map((m, i) => (
                  <div key={i} className="flex gap-2">
                    <Target className="w-3.5 h-3.5 shrink-0 mt-0.5 text-danger-light" /><span>{m}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </Tilt>
  );
};

/* ═══════════════════════════════════════════════════
   Yield Page
   ═══════════════════════════════════════════════════ */
const Yield = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ crop: 'Rice', state: 'Punjab', season: 'Kharif', year: 2022 });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const val = e.target.name === 'year' ? parseInt(e.target.value, 10) : e.target.value;
    setFormData(p => ({ ...p, [e.target.name]: val }));
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`${API_BASE}/predict-yield-v2/full`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const msg = data?.detail?.message || (typeof data?.detail === 'string' ? data.detail : null) || data?.message || data?.error || res.statusText || 'Prediction failed';
        throw new Error(`HTTP ${res.status}: ${msg}`);
      }
      setResult(data);
    } catch (err) {
      setError(err.message || 'Server unreachable. Please verify the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const intel = result?.intelligence || {};

  return (
    <motion.div
      {...pageVariants}
      transition={pageTransition}
      className="space-y-8 pb-16"
    >
      <PageHeader
        icon={Wheat}
        title={t('yield_page_title')}
        subtitle="Precision Agricultural Forecast Engine"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Input Matrix Form */}
        <motion.div {...fadeInLeft} className="lg:col-span-4">
          <Tilt spotlight={true} intensity={20}>
            <Card variant="glass" padding="md" className="relative overflow-hidden group">
              <div className="absolute inset-0 bg-accent-500/[0.01] blur-[50px] pointer-events-none" />
              <form onSubmit={handlePredict} className="relative z-10 space-y-4">
                <SectionHeader icon={Wheat} title={t('yield_form_title')} iconColor="text-accent-500" />
                
                {[
                  { label: t('yield_form_crop'), name: 'crop', options: CROPS },
                  { label: t('yield_form_state'), name: 'state', options: STATES },
                  { label: t('yield_form_season'), name: 'season', options: SEASONS },
                ].map(({ label, name, options }) => (
                  <div key={name}>
                    <label className="input-label flex text-white/50 text-[10px] uppercase tracking-wider font-semibold font-mono mb-1.5">{label}</label>
                    <select name={name} value={formData[name]} onChange={handleChange} className="console-select font-mono">
                      {options.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                ))}

                <div>
                  <label className="input-label flex text-white/50 text-[10px] uppercase tracking-wider font-semibold font-mono mb-1.5">{t('yield_form_year')}</label>
                  <input
                    type="number"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    min="2000"
                    max="2030"
                    className="console-input font-mono"
                  />
                </div>

                <div className="pt-4 border-t border-white/[0.04]">
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    loading={loading}
                    type="submit"
                    icon={Wheat}
                  >
                    Forecasting
                  </Button>
                </div>
              </form>
            </Card>
          </Tilt>
        </motion.div>

        {/* RIGHT COLUMN: Output display panels */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <AnimatePresence>
            {error && (
              <motion.div
                key="error"
                {...slideUp}
                className="p-4 rounded-lg bg-danger/10 border border-danger/20 flex gap-3 text-danger-light text-body-sm font-mono"
              >
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold">FORECAST ANOMALY</h4>
                  <p className="text-white/50 mt-1">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!result && !loading && !error && (
            <motion.div
              {...slideUp}
              className="border border-dashed border-white/5 bg-surface-800/10 rounded-xl p-16 flex flex-col items-center justify-center text-center min-h-[280px]"
            >
              <Wheat className="w-8 h-8 text-white/20 mb-4" />
              <h4 className="font-heading text-body-md text-white/50 font-semibold">Forecast Console Staged</h4>
              <p className="text-caption text-white/20 mt-1 max-w-xs leading-relaxed">
                Provide agricultural coordinates and trigger forecasting to generate yield outputs.
              </p>
            </motion.div>
          )}

          {loading && (
            <div className="border border-white/[0.03] bg-surface-800/20 rounded-xl p-16 flex flex-col items-center justify-center min-h-[280px] font-mono">
              <div className="w-10 h-10 border border-white/20 border-t-white animate-spin rounded-full mb-4" />
              <span className="text-[10px] text-white/40 uppercase tracking-widest animate-pulse">Running Spatial Regressors...</span>
            </div>
          )}

          <AnimatePresence>
            {result && !loading && (
              <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
                <YieldHeroCard result={result} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ComparisonCard comparison={result.comparison} />
                  <TrendCard trend={result.trend} />
                </div>
                <AlertsCard alerts={result.alerts} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ExplanationCard explanation={intel.explanation} />
                  <RiskCard risk={intel.risk} />
                </div>
                <RecommendationsCard recommendations={intel.recommendations} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default Yield;
