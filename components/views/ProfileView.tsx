import React, { useState } from 'react';
import { User } from '../../types';
import { Card, CardHeader } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { updateUserProfile } from '@/app/actions';

interface ProfileViewProps {
  user: User;
  onUserUpdate: (updatedUser: User) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user, onUserUpdate }) => {
  const [name, setName] = useState(user.name ?? '');
  const [isLoading, setIsLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMsg(null);

    try {
      const result = await updateUserProfile(name);
      if (result.success && result.user) {
        onUserUpdate(result.user as User);
        setMsg({ type: 'success', text: 'Profile updated successfully.' });
      } else {
        setMsg({ type: 'error', text: 'Failed to update profile.' });
      }
    } catch (_err) {
      setMsg({ type: 'error', text: 'An unexpected error occurred.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">My Profile</h2>
      
      <Card>
        <CardHeader title="Personal Information" subtitle="Manage your account details." />
        <form onSubmit={handleUpdate} className="space-y-4">
            <Input 
                label="Full Name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
            />
            
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 opacity-60">
                    <label className="block text-sm font-medium text-slate-700">Email Address</label>
                    <div className="px-3 py-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-600 text-sm">
                        {user.email}
                    </div>
                    <p className="text-xs text-slate-400">Email cannot be changed.</p>
                </div>

                <div className="space-y-1.5 opacity-60">
                    <label className="block text-sm font-medium text-slate-700">Clerk ID</label>
                    <div className="px-3 py-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-600 text-sm">
                        {user.clerkId}
                    </div>
                </div>
            </div>

            {msg && (
                <div className={`p-3 rounded-lg text-sm ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                    {msg.text}
                </div>
            )}

            <div className="pt-2">
                <Button type="submit" isLoading={isLoading}>Save Changes</Button>
            </div>
        </form>
      </Card>

      <Card>
        <CardHeader title="Account Security" />
        <p className="text-sm text-slate-500 mb-4">
            Your security is managed by Clerk Authentication. To change your password or 2FA settings, please visit the security portal.
        </p>
        <Button variant="outline">Manage Security</Button>
      </Card>
    </div>
  );
};