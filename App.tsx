import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Pill, Activity, AlertCircle, FileText, Menu, Plus, Upload, Camera, Trash2, Phone, HeartPulse, FileBadge, Calendar, User } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { AppState, Medication, UserProfile, VitalRecord, VitalType, MedicalReport } from './types';
import { Card, Button, Badge } from './components/UIComponents';

// --- Global Context ---
interface AppContextType extends AppState {
  addMedication: (med: Medication) => void;
  removeMedication: (id: string) => void;
  addVitalLog: (log: VitalRecord) => void;
  takeDose: (medId: string) => void;
  addReport: (report: MedicalReport) => void;
  removeReport: (id: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
};

// --- Mock Initial Data ---
const initialUser: UserProfile = {
  name: "Vikalp",
  age: 18,
  bloodType: "O+",
  allergies: ["Penicillin", "Peanuts"],
  emergencyContact: {
    name: "Sarah Miller (Daughter)",
    phone: "+1 (555) 123-4567",
    relation: "Daughter"
  }
};

const initialMeds: Medication[] = [
  { id: '1', name: 'Lisinopril', dosage: '10mg', frequency: 'Daily', times: ['09:00'], inventory: 24, refillThreshold: 7, instructions: "Take with food" },
  { id: '2', name: 'Metformin', dosage: '500mg', frequency: 'Twice Daily', times: ['09:00', '18:00'], inventory: 12, refillThreshold: 10, instructions: "After meals" },
];

const initialVitals: VitalRecord[] = [
  { id: '1', type: VitalType.BloodPressure, value: '128/82', unit: 'mmHg', timestamp: Date.now() - 86400000 * 2, status: 'normal' },
  { id: '2', type: VitalType.BloodPressure, value: '135/88', unit: 'mmHg', timestamp: Date.now() - 86400000, status: 'warning' },
  { id: '3', type: VitalType.BloodPressure, value: '125/80', unit: 'mmHg', timestamp: Date.now(), status: 'normal' },
];

const initialReports: MedicalReport[] = [
  { id: '1', title: 'Annual Blood Work', type: 'Lab Report', date: '2023-10-15', summary: 'Cholesterol slightly elevated, other values normal.' },
  { id: '2', title: 'Chest X-Ray', type: 'Radiology', date: '2023-11-02', summary: 'Clear lungs, no signs of infection.' },
];

// --- Pages ---

// 1. Dashboard
const Dashboard = () => {
  const { user, medications, vitals, healthScore, takeDose } = useAppContext();
  
  const todaysMeds = medications;

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Good Morning, {user.name.split(' ')[0]}</h1>
          <p className="text-slate-500 text-lg mt-1">Here is your daily health overview.</p>
        </div>
        <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-500 md:hidden">Health Score</span>
            <div className="flex flex-col items-center justify-center w-16 h-16 rounded-full bg-emerald-100 border-4 border-emerald-500 shadow-sm">
              <span className="text-xl font-bold text-emerald-800">{healthScore}</span>
            </div>
        </div>
      </header>

      {/* Quick Alerts */}
      {medications.some(m => m.inventory <= m.refillThreshold) && (
        <Card className="bg-amber-50 border-amber-200">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-6 h-6 text-amber-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-amber-900 text-lg">Refill Needed</h3>
              <p className="text-amber-800">You are running low on Metformin. Contact your pharmacy.</p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Timeline / Today's Plan */}
        <section>
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Today's Schedule</h2>
          <div className="space-y-4">
            {todaysMeds.map(med => (
              <Card key={med.id} className="flex items-center justify-between transition hover:shadow-md">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-100 rounded-xl text-blue-600 flex-shrink-0">
                    <Pill className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{med.name}</h3>
                    <p className="text-slate-500">{med.dosage} • {med.times[0]}</p>
                  </div>
                </div>
                <Button 
                  size="md" 
                  variant="primary" 
                  onClick={() => takeDose(med.id)}
                  className="flex-shrink-0"
                >
                  Take
                </Button>
              </Card>
            ))}
          </div>
        </section>

        {/* Vital Snapshot */}
        <section>
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Recent Vitals</h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
            <Card className="text-center py-6 flex flex-col justify-center items-center hover:bg-slate-50 transition">
              <p className="text-slate-500 font-medium">Blood Pressure</p>
              <p className="text-3xl font-bold text-emerald-600 mt-2">125/80</p>
              <p className="text-sm text-slate-400 mt-1">Today</p>
            </Card>
            <Card className="text-center py-6 flex flex-col justify-center items-center hover:bg-slate-50 transition">
              <p className="text-slate-500 font-medium">Heart Rate</p>
              <p className="text-3xl font-bold text-slate-800 mt-2">72 <span className="text-base text-slate-400">bpm</span></p>
              <p className="text-sm text-slate-400 mt-1">Yesterday</p>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
};

// 2. Medications
const Medications = () => {
  const { medications, addMedication, removeMedication } = useAppContext();
  const [isAdding, setIsAdding] = useState(false);

  // Form State
  const [newMedName, setNewMedName] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('');

  const handleAddMed = () => {
    if (!newMedName) return;
    addMedication({
      id: Date.now().toString(),
      name: newMedName,
      dosage: newMedDosage,
      frequency: 'Daily',
      times: ['09:00'],
      inventory: 30,
      refillThreshold: 5,
    });
    setNewMedName('');
    setNewMedDosage('');
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
       <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">My Medicine</h1>
        <Button variant="primary" size="md" onClick={() => setIsAdding(!isAdding)}>
          {isAdding ? "Cancel" : <><Plus className="w-5 h-5 mr-1" /> Add New</>}
        </Button>
      </header>

      {isAdding && (
        <Card className="border-emerald-100 bg-emerald-50 max-w-2xl mx-auto">
          <h3 className="text-xl font-bold mb-4">Add New Medicine</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="order-2 md:order-1 space-y-4">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Medicine Name</label>
                <input 
                  value={newMedName}
                  onChange={(e) => setNewMedName(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 text-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="e.g. Aspirin"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-medium mb-1">Dosage</label>
                <input 
                  value={newMedDosage}
                  onChange={(e) => setNewMedDosage(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 text-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="e.g. 100mg"
                />
              </div>
            </div>
            
            <div className="order-1 md:order-2">
              <label className="block text-slate-700 font-medium mb-2">Add by Photo</label>
              <div className="flex items-center justify-center w-full h-full min-h-[140px] rounded-xl bg-white border border-slate-200">
                 <span className="text-slate-500">Photo upload is optional. Add medicines manually using the form.</span>
              </div>
            </div>
          </div>
          <Button fullWidth onClick={handleAddMed} disabled={!newMedName}>Save Medicine</Button>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {medications.map(med => (
          <Card key={med.id} className="h-full flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{med.name}</h3>
                <p className="text-slate-500 text-lg">{med.dosage}</p>
              </div>
              <button 
                onClick={() => removeMedication(med.id)}
                className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                title="Remove medication"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-auto">
                <span className="px-3 py-1 bg-slate-100 rounded-lg text-sm font-medium text-slate-600">
                  {med.frequency}
                </span>
                <span className={`px-3 py-1 rounded-lg text-sm font-medium ${med.inventory <= med.refillThreshold ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                  {med.inventory} left
                </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// 3. Vitals
const Vitals = () => {
  const { vitals, addVitalLog } = useAppContext();
  const [selectedType, setSelectedType] = useState<VitalType>(VitalType.BloodPressure);
  const [insight, setInsight] = useState<string>("");
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const filteredVitals = vitals
    .filter(v => v.type === selectedType)
    .sort((a, b) => a.timestamp - b.timestamp);
  
  const chartData = filteredVitals.map(v => ({
    time: new Date(v.timestamp).toLocaleDateString(undefined, {  day: 'numeric', month: 'short' }),
    value: parseFloat(v.value.split('/')[0])
  }));

  const handleAnalyze = async () => {
    setLoadingInsight(true);
    // Simple local analysis: average systolic value
    const values = filteredVitals.map(v => parseFloat((v.value || '').split('/')[0]) || 0).filter(n => n > 0);
    if (values.length === 0) {
      setInsight('No vitals available to analyze.');
    } else {
      const avg = Math.round(values.reduce((a,b)=>a+b,0)/values.length);
      setInsight(`Average ${selectedType} in view: ${avg}. Keep monitoring and consult your doctor if needed.`);
    }
    setLoadingInsight(false);
  }; 

  const handleLog = () => {
    if(!inputValue) return;
    addVitalLog({
      id: Date.now().toString(),
      type: selectedType,
      value: inputValue,
      unit: selectedType === VitalType.Weight ? 'kg' : 'unit',
      timestamp: Date.now(),
      status: 'normal'
    });
    setInputValue("");
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Vitals & Trends</h1>
      </header>

      {/* Type Selector */}
      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide md:flex-wrap">
        {Object.values(VitalType).map(type => (
           <button
             key={type}
             onClick={() => { setSelectedType(type); setInsight(""); }}
             className={`whitespace-nowrap px-6 py-3 rounded-xl font-semibold transition-all flex-shrink-0 ${
               selectedType === type 
               ? 'bg-slate-800 text-white shadow-lg scale-105' 
               : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
             }`}
           >
             {type}
           </button>
        ))}
      </div>

      {/* Chart */}
      <Card>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-slate-700">{selectedType} Trend</h3>
          <Badge status="normal">7 Days</Badge>
        </div>
        <div className="h-64 w-full">
           <ResponsiveContainer width="100%" height="100%">
             <LineChart data={chartData}>
               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
               <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
               <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
               <Tooltip 
                 contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
               />
               <Line 
                 type="monotone" 
                 dataKey="value" 
                 stroke="#059669" 
                 strokeWidth={4} 
                 dot={{ r: 6, fill: "#059669", strokeWidth: 2, stroke: "#fff" }} 
                 activeDot={{ r: 8 }}
               />
             </LineChart>
           </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input */}
        <Card className="flex flex-col gap-4">
          <h3 className="font-bold text-slate-800">Log New Entry</h3>
          <div className="flex gap-4">
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Value (e.g. 120/80)"
              className="flex-1 p-4 rounded-xl border border-slate-300 text-lg outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <Button onClick={handleLog} size="md">Log</Button>
          </div>
        </Card>

        {/* Insights */}
        <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-100">
          <div className="flex items-start gap-4 h-full">
            <div className="p-3 bg-white rounded-full shadow-sm flex-shrink-0">
               <Activity className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="flex-1 flex flex-col justify-between h-full">
               <div>
                 <h3 className="text-xl font-bold text-indigo-900 mb-2">Health Insights</h3>
                 {insight ? (
                   <p className="text-indigo-800 text-lg leading-relaxed">{insight}</p>
                 ) : (
                   <p className="text-indigo-600 mb-4">Tap analyze to get personalized insights.</p>
                 )}
               </div>
               {!insight && (
                 <Button 
                   onClick={handleAnalyze} 
                   variant="secondary" 
                   className="mt-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white border-none"
                   disabled={loadingInsight}
                 >
                   {loadingInsight ? "Analyzing..." : "Analyze Trends"}
                 </Button>
               )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

// 4. Documents
const Documents = () => {
  const { reports, addReport, removeReport } = useAppContext();
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [newReport, setNewReport] = useState<Partial<MedicalReport> | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsAnalyzing(true);
      setIsUploading(true);
      try {
        const reader = new FileReader();
        reader.onload = () => {
          setNewReport({
            title: file.name,
            type: 'Other',
            date: new Date().toISOString().split('T')[0],
            summary: '',
            imageUrl: reader.result as string
          });
          setIsUploading(false);
          setIsAnalyzing(false);
        };
        reader.readAsDataURL(file);
      } catch (err) {
        alert("Failed to process document.");
        setIsUploading(false);
        setIsAnalyzing(false);
      }
    }
  };

  const handleSaveReport = () => {
    if (newReport && newReport.title) {
      addReport({
        id: Date.now().toString(),
        title: newReport.title,
        type: newReport.type as any || 'Other',
        date: newReport.date || new Date().toISOString().split('T')[0],
        summary: newReport.summary || '',
        imageUrl: newReport.imageUrl
      });
      setNewReport(null);
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Medical Records</h1>
        <Button variant="primary" size="md" onClick={() => setIsUploading(!isUploading)}>
          {isUploading ? "Cancel" : <><Upload className="w-5 h-5 mr-1" /> Upload</>}
        </Button>
      </header>

      {isUploading && (
        <Card className="border-indigo-100 bg-indigo-50 max-w-2xl mx-auto">
          <h3 className="text-xl font-bold mb-4">Upload New Document</h3>
          
          {!newReport ? (
             <div className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-indigo-300 rounded-xl bg-white cursor-pointer hover:bg-indigo-50 transition relative">
               {isAnalyzing ? (
                 <div className="text-center">
                   <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-2"></div>
                   <span className="text-indigo-600 font-bold animate-pulse">Processing...</span>
                 </div>
               ) : (
                 <>
                   <FileText className="w-10 h-10 text-indigo-400 mb-2" />
                   <span className="text-indigo-700 font-medium">Tap to upload or take photo</span>
                   <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileUpload} />
                 </>
               )}
             </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                   <label className="block text-slate-700 font-medium mb-1">Title</label>
                   <input 
                     value={newReport.title}
                     onChange={(e) => setNewReport({...newReport, title: e.target.value})}
                     className="w-full p-3 rounded-xl border border-slate-300"
                   />
                </div>
                <div>
                   <label className="block text-slate-700 font-medium mb-1">Date</label>
                   <input 
                     type="date"
                     value={newReport.date}
                     onChange={(e) => setNewReport({...newReport, date: e.target.value})}
                     className="w-full p-3 rounded-xl border border-slate-300"
                   />
                </div>
              </div>
              
              <div>
                 <label className="block text-slate-700 font-medium mb-1">Type</label>
                 <select 
                   value={newReport.type}
                   onChange={(e) => setNewReport({...newReport, type: e.target.value as any})}
                   className="w-full p-3 rounded-xl border border-slate-300 bg-white"
                 >
                   <option>Lab Report</option>
                   <option>Radiology</option>
                   <option>Prescription</option>
                   <option>Discharge Summary</option>
                   <option>Other</option>
                 </select>
              </div>

              <div>
                 <label className="block text-slate-700 font-medium mb-1">Summary</label>
                 <textarea 
                   value={newReport.summary}
                   onChange={(e) => setNewReport({...newReport, summary: e.target.value})}
                   className="w-full p-3 rounded-xl border border-slate-300 h-24"
                 />
              </div>

              <Button fullWidth onClick={handleSaveReport}>Confirm & Save</Button>
            </div>
          )}
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map(report => (
          <Card key={report.id} className="hover:shadow-md transition-all flex flex-col h-full">
            <div className="flex justify-between items-start mb-3">
              <div className={`p-2 rounded-lg ${
                report.type === 'Lab Report' ? 'bg-blue-100 text-blue-600' :
                report.type === 'Radiology' ? 'bg-purple-100 text-purple-600' :
                'bg-slate-100 text-slate-600'
              }`}>
                <FileBadge className="w-6 h-6" />
              </div>
              <button onClick={() => removeReport(report.id)} className="text-slate-300 hover:text-red-500">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            
            <h3 className="text-lg font-bold text-slate-900 mb-1 line-clamp-1">{report.title}</h3>
            <div className="flex items-center text-slate-500 text-sm mb-3">
              <Calendar className="w-4 h-4 mr-1" />
              {report.date}
            </div>
            
            <p className="text-slate-600 text-sm line-clamp-3 mb-4 flex-1">
              {report.summary}
            </p>

            <div className="mt-auto pt-3 border-t border-slate-100 flex justify-between items-center">
               <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                 {report.type}
               </span>
               <span className="text-xs text-indigo-600 font-bold cursor-pointer">View File</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// 5. Emergency
const Emergency = () => {
  const { user, medications } = useAppContext();
  
  return (
    <div className="space-y-6 pt-4">
      <div className="bg-red-50 border-l-4 border-red-600 p-6 rounded-r-xl mb-6 shadow-sm">
        <h1 className="text-3xl font-extrabold text-red-700 uppercase tracking-wide">Emergency ID</h1>
        <p className="text-red-600 font-medium">Show this screen to First Responders</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <Card title="Patient Identity">
            <div className="space-y-2">
              <p className="text-3xl font-bold text-slate-900">{user.name}</p>
              <p className="text-xl text-slate-600">Age: {user.age}</p>
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-white border-slate-200">
               <h3 className="text-slate-500 font-bold uppercase text-sm mb-1">Blood Type</h3>
               <p className="text-4xl font-extrabold text-slate-800">{user.bloodType}</p>
            </Card>
            <Card className="bg-white border-slate-200">
               <h3 className="text-slate-500 font-bold uppercase text-sm mb-1">Allergies</h3>
               <div className="flex flex-wrap gap-2">
                 {user.allergies.map(a => (
                   <span key={a} className="text-red-700 bg-red-50 px-2 py-1 rounded font-bold">{a}</span>
                 ))}
               </div>
            </Card>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <Card title="Emergency Contact" variant="danger" className="h-full flex flex-col justify-center">
             <div className="text-center py-4">
               <p className="text-2xl font-bold text-slate-900">{user.emergencyContact.name}</p>
               <p className="text-lg text-slate-600 mb-6">{user.emergencyContact.relation}</p>
               <a 
                 href={`tel:${user.emergencyContact.phone}`}
                 className="inline-flex items-center justify-center w-full bg-red-600 text-white text-xl font-bold py-5 rounded-xl hover:bg-red-700 shadow-lg shadow-red-200 transition-all active:scale-95"
               >
                 <Phone className="w-8 h-8 mr-3" />
                 Call Now
               </a>
             </div>
          </Card>
        </div>
      </div>

      <Card title="Active Medications">
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 list-disc list-inside">
          {medications.map(m => (
            <li key={m.id} className="text-lg text-slate-800 p-2 odd:bg-slate-50 rounded">
              <span className="font-bold">{m.name}</span> ({m.dosage})
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
};

// --- Responsive Nav Item Component ---
const NavItem = ({ to, icon: Icon, label, isEmergency }: { to: string, icon: any, label: string, isEmergency?: boolean }) => (
  <NavLink to={to} className={({ isActive }) => `
     flex flex-col items-center justify-center w-full h-full transition-all
     ${isActive 
        ? (isEmergency ? 'text-red-600' : 'text-emerald-600') 
        : 'text-slate-400 hover:text-slate-600'
     }
  `}>
    {({ isActive }) => (
       <>
         <div className={`
            p-1.5 rounded-xl transition-all mb-0.5
            ${isActive && isEmergency ? 'bg-red-50' : ''}
            ${isActive && !isEmergency ? 'bg-emerald-50' : ''} 
         `}>
           <Icon className={`w-6 h-6 ${isActive ? 'stroke-2' : 'stroke-1.5'}`} />
         </div>
         <span className={`text-[10px] font-medium leading-none ${isActive ? 'font-bold' : ''}`}>{label}</span>
       </>
    )}
  </NavLink>
);

// --- Main Layout & Navigation ---
const AppContent = () => {
  const { user } = useAppContext();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-100 flex flex-col">
      
      {/* Top Header: Brand + Profile */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Branding (Left) */}
            <div className="flex items-center gap-2">
              <div className="bg-emerald-600 p-1.5 rounded-lg shadow-sm">
                <HeartPulse className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">VitalTrack</span>
            </div>

            {/* Profile Section (Right) */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block leading-tight">
                <p className="text-sm font-bold text-slate-900">{user.name}</p>
                <p className="text-xs text-slate-500 font-medium">Age: {user.age}</p>
              </div>
              <div className="h-10 w-10 bg-slate-100 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 font-bold shadow-sm">
                <User className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 pb-24">
         <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/meds" element={<Medications />} />
            <Route path="/vitals" element={<Vitals />} />
            <Route path="/docs" element={<Documents />} />
            <Route path="/emergency" element={<Emergency />} />
         </Routes>
      </main>

      {/* Bottom Navigation Footer (Fixed) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-2xl mx-auto px-2">
            <div className="flex justify-around items-center h-16 sm:h-20">
                <NavItem to="/" icon={LayoutDashboard} label="Home" />
                <NavItem to="/meds" icon={Pill} label="Meds" />
                <NavItem to="/vitals" icon={Activity} label="Vitals" />
                <NavItem to="/docs" icon={FileText} label="Docs" />
                <NavItem to="/emergency" icon={AlertCircle} label="SOS" isEmergency />
            </div>
        </div>
      </nav>

    </div>
  );
};

// --- App Provider Wrapper ---
const App = () => {
  const [user] = useState<UserProfile>(initialUser);
  const [medications, setMedications] = useState<Medication[]>(initialMeds);
  const [vitals, setVitals] = useState<VitalRecord[]>(initialVitals);
  const [reports, setReports] = useState<MedicalReport[]>(initialReports);
  const [healthScore, setHealthScore] = useState(85);

  const addMedication = (med: Medication) => setMedications([...medications, med]);
  const removeMedication = (id: string) => setMedications(medications.filter(m => m.id !== id));
  
  const addVitalLog = (log: VitalRecord) => {
    setVitals([...vitals, log]);
    setHealthScore(prev => Math.min(100, prev + 2));
  };

  const takeDose = (medId: string) => {
    setMedications(medications.map(m => 
      m.id === medId ? { ...m, inventory: Math.max(0, m.inventory - 1) } : m
    ));
    setHealthScore(prev => Math.min(100, prev + 1));
  };

  const addReport = (report: MedicalReport) => setReports([report, ...reports]);
  const removeReport = (id: string) => setReports(reports.filter(r => r.id !== id));

  return (
    <AppContext.Provider value={{ 
      user, medications, vitals, healthScore, reports,
      addMedication, removeMedication, addVitalLog, takeDose, addReport, removeReport 
    }}>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </AppContext.Provider>
  );
};

export default App;