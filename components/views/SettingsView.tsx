import React from 'react';
import { Card, CardHeader } from '../ui/Card';

export const SettingsView: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Settings</h2>
      
      <Card>
        <CardHeader title="Preferences" subtitle="Customize your banking experience." />
        
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h4 className="text-sm font-medium text-slate-900">Email Notifications</h4>
                    <p className="text-sm text-slate-500">Receive alerts for every transaction.</p>
                </div>
                <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                    <input type="checkbox" id="toggle1" className="peer sr-only" defaultChecked />
                    <label htmlFor="toggle1" className="block h-6 overflow-hidden rounded-full bg-slate-200 cursor-pointer peer-checked:bg-emerald-500"></label>
                    <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:left-7"></span>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div>
                    <h4 className="text-sm font-medium text-slate-900">Dark Mode</h4>
                    <p className="text-sm text-slate-500">Switch to a darker theme.</p>
                </div>
                <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                    <input type="checkbox" id="toggle2" className="peer sr-only" />
                    <label htmlFor="toggle2" className="block h-6 overflow-hidden rounded-full bg-slate-200 cursor-pointer peer-checked:bg-slate-900"></label>
                    <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:left-7"></span>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div>
                    <h4 className="text-sm font-medium text-slate-900">Currency</h4>
                    <p className="text-sm text-slate-500">Your primary display currency.</p>
                </div>
                <span className="text-sm font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-md">USD ($)</span>
            </div>
        </div>
      </Card>
      
      <div className="text-center text-xs text-slate-400 mt-8">
        Version 1.0.0 &bull; DiasporaLink Inc.
      </div>
    </div>
  );
};
