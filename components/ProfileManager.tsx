
import React, { useState } from 'react';
import UserIcon from './icons/UserIcon';

interface ProfileManagerProps {
  existingProfiles: string[];
  onSelectProfile: (name: string) => void;
  onCreateProfile: (name: string) => void;
}

const ProfileManager: React.FC<ProfileManagerProps> = ({ existingProfiles, onSelectProfile, onCreateProfile }) => {
  const [newProfileName, setNewProfileName] = useState('');
  const [error, setError] = useState('');

  const handleCreate = () => {
    const trimmedName = newProfileName.trim();
    if (!trimmedName) {
      setError('Profile name cannot be empty.');
      return;
    }
    if (existingProfiles.map(p => p.toLowerCase()).includes(trimmedName.toLowerCase())) {
      setError('A profile with this name already exists.');
      return;
    }
    onCreateProfile(trimmedName);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCreate();
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center text-white p-4 animate-[fadeIn_0.5s_ease-in-out]">
        <div className="w-full max-w-md mx-auto bg-slate-900/50 border border-slate-800 rounded-2xl p-8 shadow-2xl backdrop-blur-sm text-center">
            <div className="inline-block mb-6 p-4 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full shadow-lg">
                <UserIcon className="w-8 h-8 text-white"/>
            </div>
            
            <h1 className="text-3xl font-bold mb-2">Welcome to Prompt Vault</h1>
            <p className="text-slate-400 mb-8">Create a new profile or select an existing one to continue.</p>

            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-200">Create New Profile</h2>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newProfileName}
                        onChange={(e) => {
                            setNewProfileName(e.target.value);
                            setError('');
                        }}
                        onKeyPress={handleKeyPress}
                        placeholder="Enter your profile name"
                        className="flex-grow p-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        aria-label="New profile name"
                    />
                    <button
                        onClick={handleCreate}
                        className="bg-blue-600 text-white font-bold py-3 px-5 rounded-lg shadow-md hover:bg-blue-700 transition-colors"
                    >
                        Create
                    </button>
                </div>
                {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            </div>

            {existingProfiles.length > 0 && (
                <div className="mt-10">
                    <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="w-full border-t border-slate-700" />
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-slate-900/0 px-2 text-sm text-slate-400 backdrop-blur-sm">Or select a profile</span>
                        </div>
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                        {existingProfiles.map(profile => (
                            <button
                                key={profile}
                                onClick={() => onSelectProfile(profile)}
                                className="w-full text-left p-3 rounded-lg bg-slate-800/70 border border-slate-700/50 hover:bg-slate-700/90 hover:border-slate-600 transition-all"
                            >
                                {profile}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
        <style>{`
            @keyframes fadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
        `}</style>
    </div>
  );
};

export default ProfileManager;
