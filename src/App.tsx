import { useState, useMemo, useCallback, useRef } from 'react';
import {
  CloudSun,
  Upload,
  Table2,
  CalendarDays,
  TrendingUp,
  Infinity as InfinityIcon,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Plus,
  FileSpreadsheet,
  Calculator,
} from 'lucide-react';
import type {
  WeatherRecord,
  ValidationResult,
  WeatherState,
  ForecastResult,
  ConvergenceResult,
  StationaryResult,
  ComparisonResult,
} from '@/types';
import { WEATHER_STATES } from '@/types';
import { parseCSV } from '@/utils/csvParser';
import { getDemoData, DEMO_DATA_LABEL } from '@/data/demoWeatherData';
import { buildTransitionCounts, buildTransitionProbabilities } from '@/math/transitionMatrix';
import { validateTransitionMatrix } from '@/math/validation';
import { generateForecast, getWeatherLabel } from '@/math/forecast';
import { iterateToConvergence } from '@/math/convergence';
import { computeStationaryDistribution, compareIterativeAndGaussian } from '@/math/stationaryDistribution';
import { Card } from '@/components/Card';
import { WeatherIcon, WEATHER_COLORS } from '@/components/WeatherIcon';
import { MatrixDisplay } from '@/components/MatrixDisplay';
import { ForecastTable } from '@/components/ForecastTable';
import { ForecastChart } from '@/components/charts/ForecastChart';
import { LongTermChart } from '@/components/charts/LongTermChart';
import { MathDrawer } from '@/components/MathDrawer';

type TabMode = 'counts' | 'probabilities';

function App() {
  const [records, setRecords] = useState<WeatherRecord[]>([]);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [dataSource, setDataSource] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);
  const [showRejected, setShowRejected] = useState(false);
  const [matrixTab, setMatrixTab] = useState<TabMode>('probabilities');
  const [todayWeather, setTodayWeather] = useState<WeatherState>('Sunny');
  const [forecastDays, setForecastDays] = useState(7);
  const [forecast, setForecast] = useState<ForecastResult | null>(null);
  const [manualDate, setManualDate] = useState('');
  const [manualWeather, setManualWeather] = useState<WeatherState>('Sunny');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDemoData = useCallback(() => {
    const demo = getDemoData();
    setRecords(demo);
    setValidation(null);
    setDataSource(DEMO_DATA_LABEL);
    setForecast(null);
  }, []);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const result = parseCSV(text);
      setValidation(result);
      setRecords(result.records);
      setDataSource(file.name);
      setForecast(null);
    };
    reader.readAsText(file);
  }, []);

  const handleAddManual = useCallback(() => {
    if (!manualDate || !manualWeather) return;
    const newRecord: WeatherRecord = { date: manualDate, weather: manualWeather };
    const existing = records.find((r) => r.date === manualDate);
    let updated: WeatherRecord[];
    if (existing) {
      updated = records.map((r) => (r.date === manualDate ? newRecord : r));
    } else {
      updated = [...records, newRecord].sort((a, b) => a.date.localeCompare(b.date));
    }
    setRecords(updated);
    setValidation(null);
    setDataSource((prev) => (prev.includes('Manual') ? prev : prev + ' + Manual edits'));
    setForecast(null);
    setManualDate('');
  }, [manualDate, manualWeather, records]);

  const transitionData = useMemo(() => {
    if (records.length < 2) return null;
    const { counts, rowTotals, zeroRows } = buildTransitionCounts(records);
    const { matrix, zeroRows: probZeroRows } = buildTransitionProbabilities(counts, rowTotals);
    const matrixValidation = validateTransitionMatrix(matrix);
    return { counts, rowTotals, zeroRows, matrix, probZeroRows, matrixValidation };
  }, [records]);

  const convergence = useMemo<ConvergenceResult | null>(() => {
    if (!transitionData || !transitionData.matrixValidation.valid) return null;
    const startIndex = WEATHER_STATES.indexOf(todayWeather);
    const startVec = [0, 0, 0];
    startVec[startIndex] = 1;
    return iterateToConvergence(startVec, transitionData.matrix);
  }, [transitionData, todayWeather]);

  const stationary = useMemo<StationaryResult | null>(() => {
    if (!transitionData || !transitionData.matrixValidation.valid) return null;
    return computeStationaryDistribution(transitionData.matrix);
  }, [transitionData]);

  const comparison = useMemo<ComparisonResult | null>(() => {
    if (!convergence || !stationary) return null;
    return compareIterativeAndGaussian(convergence.finalDistribution, stationary.distribution);
  }, [convergence, stationary]);

  const handleGenerateForecast = useCallback(() => {
    if (!transitionData || !transitionData.matrixValidation.valid) return;
    const startIndex = WEATHER_STATES.indexOf(todayWeather);
    const result = generateForecast(startIndex, transitionData.matrix, forecastDays);
    setForecast(result);
  }, [transitionData, todayWeather, forecastDays]);

  const dataQuality = useMemo(() => {
    if (records.length === 0) return null;
    if (records.length < 2) return { good: false, message: 'Too few records to build transitions.' };
    if (transitionData && transitionData.zeroRows.length > 0) {
      const states = transitionData.zeroRows.map((i) => WEATHER_STATES[i]).join(', ');
      return {
        good: false,
        message: `Not enough transition data after: ${states}.`,
      };
    }
    return { good: true, message: 'Good' };
  }, [records, transitionData]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50/40 via-slate-50 to-slate-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/80 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center shadow-sm">
              <CloudSun className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Weather Prediction System</h1>
              <p className="text-sm text-slate-500">
                Explore how historical weather patterns can be used to estimate future weather.
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* Step 1 — Historical Weather */}
        <Card
          title="Historical Weather Data"
          subtitle="Load weather observations to build the prediction model."
          icon={<Table2 className="w-5 h-5" />}
          action={
            records.length > 0 && (
              <div className="text-right">
                <p className="text-sm font-medium text-slate-700">
                  Records loaded: {records.length}
                </p>
                {dataQuality && (
                  <p
                    className={`text-xs flex items-center justify-end gap-1 mt-0.5 ${
                      dataQuality.good ? 'text-emerald-600' : 'text-amber-600'
                    }`}
                  >
                    {dataQuality.good ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5" />
                    )}
                    {dataQuality.message}
                  </p>
                )}
              </div>
            )
          }
        >
          <div className="flex flex-wrap gap-3 mb-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2.5 bg-sky-600 text-white rounded-xl text-sm font-medium hover:bg-sky-700 transition-colors shadow-sm"
            >
              <Upload className="w-4 h-4" />
              Upload CSV
            </button>
            <button
              onClick={handleDemoData}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-slate-700 rounded-xl text-sm font-medium border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-sky-500" />
              Use Demo Data
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {dataSource && (
            <p className="text-xs text-slate-400 mb-4 italic">{dataSource}</p>
          )}


          {/* Validation errors */}
          {validation && !validation.valid && validation.errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm font-medium text-red-700">Validation Errors</span>
              </div>
              <ul className="text-sm text-red-600 list-disc list-inside space-y-1">
                {validation.errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Validation warnings */}
          {validation && validation.warnings.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-medium text-amber-700">Warnings</span>
              </div>
              <ul className="text-sm text-amber-600 list-disc list-inside space-y-1">
                {validation.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Rejected rows */}
          {validation && validation.rejected.length > 0 && (
            <div className="mb-4">
              <button
                onClick={() => setShowRejected(!showRejected)}
                className="text-sm text-amber-600 flex items-center gap-1.5 hover:text-amber-700"
              >
                {showRejected ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                {validation.rejected.length} rejected row(s)
              </button>
              {showRejected && (
                <div className="mt-2 overflow-x-auto border border-amber-200 rounded-lg">
                  <table className="w-full text-xs">
                    <thead className="bg-amber-50">
                      <tr>
                        <th className="text-left px-3 py-2 text-amber-700">Row</th>
                        <th className="text-left px-3 py-2 text-amber-700">Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {validation.rejected.map((r, i) => (
                        <tr key={i} className="border-t border-amber-100">
                          <td className="px-3 py-2 text-slate-600 font-mono">{r.row}</td>
                          <td className="px-3 py-2 text-amber-700">{r.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Preview */}
          {records.length > 0 && (
            <div>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="text-sm text-sky-600 flex items-center gap-1.5 hover:text-sky-700 mb-2"
              >
                {showPreview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                Preview first 10 records
              </button>
              {showPreview && (
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="text-left px-3 py-2 text-slate-500 font-medium">Date</th>
                        <th className="text-left px-3 py-2 text-slate-500 font-medium">Weather</th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.slice(0, 10).map((r, i) => (
                        <tr key={i} className="border-t border-slate-100">
                          <td className="px-3 py-2 text-slate-600 tabular-nums">{r.date}</td>
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-1.5">
                              <WeatherIcon weather={r.weather} size="sm" />
                              <span className="text-slate-600">{r.weather}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {records.length > 10 && (
                    <p className="px-3 py-2 text-xs text-slate-400 bg-slate-50 border-t border-slate-100">
                      Showing 10 of {records.length} records
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {records.length === 0 && !validation && (
            <div className="text-center py-8 text-slate-400">
              <FileSpreadsheet className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No data loaded yet. Upload a CSV or use the demo data to get started.</p>
            </div>
          )}
        </Card>

        {/* Step 2 — Weather Pattern */}
        {transitionData && (
          <Card
            title="Weather Pattern"
            subtitle="How often each weather change appeared in the historical data."
            icon={<TrendingUp className="w-5 h-5" />}
          >
            <p className="text-sm text-slate-500 mb-4">
              We look at consecutive days to learn how often Sunny, Cloudy, and Rainy weather
              changes into each other.
            </p>

            {/* Zero row warnings */}
            {transitionData.zeroRows.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-medium text-amber-700">Incomplete transition data</span>
                </div>
                <p className="text-sm text-amber-600">
                  There is not enough transition data to estimate what happens after{' '}
                  {transitionData.zeroRows.map((i) => WEATHER_STATES[i]).join(', ')}.
                  These states have no following observations. Their rows are left as zeros and
                  will not produce meaningful predictions from those starting states.
                </p>
              </div>
            )}

            {/* Matrix validation status */}
            {transitionData.matrixValidation.valid ? (
              <div className="flex items-center gap-2 mb-4 text-sm text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
                Valid transition matrix
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-medium text-red-700">Invalid transition matrix</span>
                </div>
                <ul className="text-sm text-red-600 list-disc list-inside">
                  {transitionData.matrixValidation.errors.map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tabs */}
            <div className="flex gap-1 mb-4 border-b border-slate-200">
              <button
                onClick={() => setMatrixTab('counts')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  matrixTab === 'counts'
                    ? 'border-sky-500 text-sky-600'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Counts
              </button>
              <button
                onClick={() => setMatrixTab('probabilities')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  matrixTab === 'probabilities'
                    ? 'border-sky-500 text-sky-600'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Probabilities
              </button>
            </div>

            {matrixTab === 'counts' ? (
              <div>
                <p className="text-xs text-slate-400 mb-2">
                  Transition Counts — how many times each weather change appeared in the historical data.
                </p>
                <MatrixDisplay
                  matrix={transitionData.counts}
                  type="counts"
                  rowSums={transitionData.rowTotals}
                />
              </div>
            ) : (
              <div>
                <p className="text-xs text-slate-400 mb-2">
                  Transition Probabilities — the actual matrix used for prediction. Each row sums to 1.
                </p>
                <MatrixDisplay
                  matrix={transitionData.matrix}
                  type="probabilities"
                  rowSums={transitionData.matrixValidation.rowSums}
                />
              </div>
            )}
          </Card>
        )}

        {/* Step 3 — Forecast */}
        {transitionData && transitionData.matrixValidation.valid && (
          <Card
            title="Forecast"
            subtitle="Choose today's weather and generate a 1–10 day estimate."
            icon={<CalendarDays className="w-5 h-5" />}
          >
            <div className="flex flex-wrap items-end gap-4 mb-6">
              <div>
                <label className="text-xs text-slate-500 block mb-1">Today's weather</label>
                <select
                  value={todayWeather}
                  onChange={(e) => setTodayWeather(e.target.value as WeatherState)}
                  className="px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-200 min-w-[140px]"
                >
                  {WEATHER_STATES.map((w) => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">Forecast length</label>
                <select
                  value={forecastDays}
                  onChange={(e) => setForecastDays(Number(e.target.value))}
                  className="px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-200"
                >
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d}>{d} {d === 1 ? 'day' : 'days'}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleGenerateForecast}
                className="px-5 py-2.5 bg-sky-600 text-white rounded-xl text-sm font-medium hover:bg-sky-700 transition-colors shadow-sm"
              >
                Generate Forecast
              </button>
            </div>

            {forecast && forecast.days.length > 0 && (
              <>
                {/* Tomorrow's card */}
                <div className="bg-gradient-to-br from-sky-50 to-slate-50 rounded-2xl p-6 mb-6 border border-sky-100">
                  <p className="text-sm text-slate-500 mb-2">Tomorrow's Most Likely Weather</p>
                  <div className="flex items-center gap-4">
                    <WeatherIcon
                      weather={getWeatherLabel(forecast.days[0].mostLikely)}
                      size="xl"
                    />
                    <div>
                      <p className="text-2xl font-bold text-slate-800">
                        {forecast.days[0].tie ? (
                          <span className="text-lg text-slate-500">Tie between states</span>
                        ) : (
                          getWeatherLabel(forecast.days[0].mostLikely)
                        )}
                      </p>
                      {!forecast.days[0].tie && (
                        <p className="text-sm text-slate-500">
                          {(forecast.days[0].distribution[forecast.days[0].mostLikely] * 100).toFixed(0)}% estimated probability
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-3">
                    This is a model estimate based on historical patterns, not a professional meteorological forecast.
                  </p>
                </div>

                {/* Chart */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">
                    {forecastDays}-Day Probability Forecast
                  </h3>
                  <ForecastChart distributions={forecast.distributions} />
                </div>

                {/* Table */}
                <ForecastTable forecast={forecast} />
              </>
            )}

            {!forecast && (
              <div className="text-center py-8 text-slate-400">
                <CalendarDays className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  Select today's weather and forecast length, then click "Generate Forecast."
                </p>
              </div>
            )}
          </Card>
        )}

        {/* Step 4 — Long-Term Pattern */}
        {transitionData && transitionData.matrixValidation.valid && convergence && stationary && comparison && (
          <Card
            title="Long-Term Weather Pattern"
            subtitle="The weather balance the model approaches when the transition process is repeated many times."
            icon={<InfinityIcon className="w-5 h-5" />}
          >
            <p className="text-sm text-slate-500 mb-4">
              The long-term distribution shows the overall weather pattern this model approaches when
              the transition process is repeated for a very large number of steps.
            </p>

            {stationary.valid && stationary.distribution ? (
              <>
                {/* Three percentages */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  {WEATHER_STATES.map((w, i) => (
                    <div
                      key={w}
                      className="rounded-xl p-4 border border-slate-200 bg-white"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <WeatherIcon weather={w} size="md" />
                        <span className="text-sm font-medium text-slate-600">{w}</span>
                      </div>
                      <p className="text-2xl font-bold text-slate-800 tabular-nums">
                        {(stationary.distribution![i] * 100).toFixed(1)}%
                      </p>
                    </div>
                  ))}
                </div>

                {/* Chart */}
                <LongTermChart distribution={stationary.distribution} />

                {/* Verification */}
                <div className="mt-6 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-emerald-600">
                    <CheckCircle2 className="w-4 h-4" />
                    {stationary.message}
                  </div>
                  {comparison.match && (
                    <div className="flex items-center gap-2 text-sm text-emerald-600">
                      <CheckCircle2 className="w-4 h-4" />
                      Long-term result verified — iterative and Gaussian methods agree.
                    </div>
                  )}
                  {!comparison.match && comparison.gaussian && (
                    <div className="flex items-center gap-2 text-sm text-amber-600">
                      <AlertTriangle className="w-4 h-4" />
                      {comparison.message}
                    </div>
                  )}
                  {!convergence.converged && (
                    <div className="flex items-center gap-2 text-sm text-amber-600">
                      <AlertTriangle className="w-4 h-4" />
                      {convergence.message}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-medium text-amber-700">
                    No unique stationary distribution
                  </span>
                </div>
                <p className="text-sm text-amber-600">{stationary.message}</p>
              </div>
            )}
          </Card>
        )}

        {/* Math Drawer */}
        {transitionData && transitionData.matrixValidation.valid && convergence && stationary && comparison && (
          <MathDrawer
            transitionMatrix={transitionData.matrix}
            rowSums={transitionData.matrixValidation.rowSums}
            convergence={convergence}
            stationary={stationary}
            comparison={comparison}
          />
        )}

        {/* Final Summary */}
        {forecast && convergence && stationary && stationary.distribution && (
          <Card
            title="Forecast Summary"
            subtitle="A quick recap of the model's predictions and status."
            icon={<Calculator className="w-5 h-5" />}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs text-slate-400 mb-1">Tomorrow</p>
                  <div className="flex items-center gap-2">
                    <WeatherIcon weather={getWeatherLabel(forecast.days[0].mostLikely)} size="lg" />
                    <div>
                      <p className="text-lg font-bold text-slate-800">
                        {getWeatherLabel(forecast.days[0].mostLikely)}
                      </p>
                      <p className="text-sm text-slate-500">
                        {(forecast.days[0].distribution[forecast.days[0].mostLikely] * 100).toFixed(1)}% estimated probability
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs text-slate-400 mb-2">Long-Term Pattern</p>
                  <div className="space-y-1">
                    {WEATHER_STATES.map((w, i) => (
                      <div key={w} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1.5">
                          <WeatherIcon weather={w} size="sm" />
                          <span className="text-slate-600">{w}</span>
                        </div>
                        <span className="font-medium text-slate-700 tabular-nums">
                          {(stationary.distribution![i] * 100).toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-1.5">
                <div className="flex items-center gap-2 text-sm text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                  Forecast generated
                </div>
                <div className="flex items-center gap-2 text-sm text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                  Transition matrix valid
                </div>
                {stationary.valid && (
                  <div className="flex items-center gap-2 text-sm text-emerald-600">
                    <CheckCircle2 className="w-4 h-4" />
                    Long-term solution verified
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}
      </main>

      <footer className="max-w-6xl mx-auto px-6 py-8 text-center">
        <p className="text-xs text-slate-400">
          Weather Prediction System — an educational tool for Numerical Linear Algebra.
          All calculations run locally in your browser. Model estimates, not professional forecasts.
        </p>
      </footer>
    </div>
  );
}

export default App;
