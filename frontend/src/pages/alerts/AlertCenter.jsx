import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuthStore } from '../../store/authStore';
import alertsService from '../../services/alertsService';
import { 
  AlertTriangle, 
  AlertOctagon, 
  Info, 
  Check, 
  Trash2, 
  Loader2,
  Bell,
  Inbox,
  Filter,
  X
} from 'lucide-react';
import useToastStore from '../../store/toastStore';

export default function AlertCenter() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusTab, setStatusTab] = useState('active'); // 'active' | 'resolved'
  const [categoryFilter, setCategoryFilter] = useState('all'); // 'all' | 'critical' | 'attention' | 'info'
  
  const { token } = useAuthStore();
  const toast = useToastStore.getState();

  const fetchAlerts = async () => {
    try {
      const data = await alertsService.getAlerts(token, statusTab, categoryFilter);
      setAlerts(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to retrieve active warnings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAlerts();
    }
  }, [token, statusTab, categoryFilter]);

  const handleResolveAlert = async (id) => {
    try {
      await alertsService.resolveAlert(token, id);
      fetchAlerts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAlert = async (id) => {
    try {
      await alertsService.deleteAlert(token, id);
      fetchAlerts();
    } catch (err) {
      console.error(err);
    }
  };

  // Helper to retrieve severity details
  const getSeverityStyle = (severity) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return {
          border: 'border-l-4 border-l-red-500 border-slate-200/50',
          bg: 'bg-red-50/5',
          iconBg: 'bg-red-50 text-red-500',
          icon: <AlertOctagon className="w-5 h-5" />
        };
      case 'attention':
      case 'warning':
        return {
          border: 'border-l-4 border-l-amber-500 border-slate-200/50',
          bg: 'bg-amber-50/5',
          iconBg: 'bg-amber-50 text-amber-500',
          icon: <AlertTriangle className="w-5 h-5" />
        };
      case 'info':
      default:
        return {
          border: 'border-l-4 border-l-blue-500 border-slate-200/50',
          bg: 'bg-blue-50/5',
          iconBg: 'bg-blue-50 text-blue-500',
          icon: <Info className="w-5 h-5" />
        };
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Alert Center" subtitle="Review expiring stock warnings and custom household alerts">
        <div className="flex h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
            <p className="text-sm text-gray-500 font-semibold">Scanning warning logs...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Alert Center" subtitle="System warning logs and kitchen indicators">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Hero Card */}
        <div className="clean-card-dark rounded-3xl p-6 md:p-8 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute inset-0 stripes-pattern opacity-5 pointer-events-none" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-4 bg-white/10 rounded-2xl">
              <Bell className="w-10 h-10 text-white animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-white">Kitchen Alert Center</h2>
              <p className="text-stone-300 text-xs md:text-sm mt-1 font-medium">Review active notifications and system warnings</p>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="clean-card-base rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          
          {/* Category selection */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5 text-slate-400" /> Filters:
            </span>
            
            {/* All */}
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-full border transition-all cursor-pointer ${categoryFilter === 'all' ? 'bg-orange-500 border-orange-500 text-white shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
            >
              All Alerts
            </button>
            
            {/* Critical */}
            <button
              onClick={() => setCategoryFilter('critical')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-full border transition-all cursor-pointer ${categoryFilter === 'critical' ? 'bg-red-500 border-red-500 text-white shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-500'}`}
            >
              Critical
            </button>

            {/* Attention */}
            <button
              onClick={() => setCategoryFilter('attention')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-full border transition-all cursor-pointer ${categoryFilter === 'attention' ? 'bg-amber-500 border-amber-500 text-white shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-amber-50 hover:text-amber-500'}`}
            >
              Attention
            </button>

            {/* Info */}
            <button
              onClick={() => setCategoryFilter('info')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-full border transition-all cursor-pointer ${categoryFilter === 'info' ? 'bg-blue-500 border-blue-500 text-white shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-blue-50 hover:text-blue-500'}`}
            >
              Info
            </button>
          </div>



        </div>

        {/* FEED SECTION */}
        <div className="space-y-4">
          
          {alerts.length === 0 ? (
            <div className="premium-card-orange rounded-2xl p-12 text-center shadow-sm max-w-xl mx-auto">
              <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Inbox className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">Inbox Clean!</h4>
              <p className="text-xs text-slate-400 mt-1.5 max-w-sm mx-auto leading-relaxed">
                {statusTab === 'active' 
                  ? 'All notifications cleared. Your kitchen inventory, budget, and dietary stock are fully on track!'
                  : 'No resolved history found.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {alerts.map(alert => {
                const style = getSeverityStyle(alert.severity);
                return (
                  <div
                    key={alert.id}
                    className={`flex items-center justify-between p-4.5 bg-white border border-slate-200/50 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 gap-4 ${style.border} ${style.bg}`}
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      {/* Icon */}
                      <div className={`p-2.5 rounded-xl shrink-0 ${style.iconBg}`}>
                        {style.icon}
                      </div>
                      
                      {/* Two lines information */}
                      <div className="truncate pr-2">
                        <h4 className="text-xs font-extrabold text-slate-800 truncate tracking-tight">{alert.title}</h4>
                        <p className="text-[11px] text-slate-550 truncate mt-1">{alert.description || alert.detail || 'System triggered alert warning.'}</p>
                      </div>
                    </div>

                    {/* Cross Mark Checkbox Action */}
                    <div className="shrink-0">
                      <button
                        onClick={() => handleResolveAlert(alert.id)}
                        className="w-6 h-6 rounded-full border-2 border-slate-300 hover:border-red-500 hover:bg-red-50 text-transparent hover:text-red-600 transition-all duration-200 flex items-center justify-center cursor-pointer group"
                        title="Dismiss warning"
                      >
                        <X className="w-3.5 h-3.5 stroke-[3] group-hover:scale-110" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>
    </DashboardLayout>
  );
}

