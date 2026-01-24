import React from 'react';
import { TransferForm } from '../TransferForm';

interface TransfersViewProps {
  senderId: string;
  onReview: (email: string, amount: number) => void;
}

export const TransfersView: React.FC<TransfersViewProps> = ({ senderId, onReview }) => {
  return (
    <div className="max-w-xl mx-auto space-y-6 mt-10">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900">Send Money</h2>
        <p className="text-slate-500 mt-2">Fast, secure, and fee-free transfers within the network.</p>
      </div>
      
      <TransferForm 
        key={senderId} /* force remount if user changes */
        onReview={onReview}
      />
      
      <div className="mt-8 grid grid-cols-3 gap-4">
        <div className="text-center p-4 bg-white rounded-lg border border-slate-100 shadow-sm">
            <div className="w-10 h-10 mx-auto bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            </div>
            <p className="text-xs font-semibold text-slate-900">Instant</p>
        </div>
        <div className="text-center p-4 bg-white rounded-lg border border-slate-100 shadow-sm">
             <div className="w-10 h-10 mx-auto bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
            </div>
            <p className="text-xs font-semibold text-slate-900">Secure</p>
        </div>
        <div className="text-center p-4 bg-white rounded-lg border border-slate-100 shadow-sm">
             <div className="w-10 h-10 mx-auto bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <p className="text-xs font-semibold text-slate-900">Global</p>
        </div>
      </div>
    </div>
  );
};
