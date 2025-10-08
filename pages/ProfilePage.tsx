import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getUserId, getProfile, createOrUpdateProfile, getUserApps, uploadProfileImage, auth as supabaseAuth } from '../services/supabaseService';
import { Profile, PublishedApp, SavedProject } from '../types';
import UserIcon from '../components/icons/UserIcon';
import RocketIcon from '../components/icons/RocketIcon';
import CameraIcon from '../components/icons/CameraIcon';

interface ProfilePageProps {
  onLoadProject: (project: SavedProject) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ onLoadProject }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userApps, setUserApps] = useState<PublishedApp[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getUserId().then(setUserId);
  }, []);

  const fetchProfileData = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    setError(null);
    try {
      const profileData = await getProfile(userId);
      if (profileData) {
        setProfile(profileData);
        setUsername(profileData.username);
        const apps = await getUserApps(profileData.id);
        setUserApps(apps);
      } else {
        setIsEditing(true); // Force editing if no profile exists
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile.");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if(userId) {
        fetchProfileData();
    }
  }, [fetchProfileData, userId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      if (type === 'avatar') {
        setAvatarFile(file);
        setAvatarPreview(previewUrl);
      } else {
        setBannerFile(file);
        setBannerPreview(previewUrl);
      }
    }
  };

  const handleSaveProfile = async () => {
    if (!username.trim()) {
      setError("Username cannot be empty.");
      return;
    }
    if (!userId) {
      setError("User not identified.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      let avatarUrl = profile?.avatar_url;
      let bannerUrl = profile?.banner_url;

      if (avatarFile) {
        avatarUrl = await uploadProfileImage(avatarFile, userId, 'avatar');
      }
      if (bannerFile) {
        bannerUrl = await uploadProfileImage(bannerFile, userId, 'banner');
      }

      const updatedProfile = await createOrUpdateProfile(userId, { username, avatar_url: avatarUrl, banner_url: bannerUrl });
      
      setProfile(updatedProfile);
      setAvatarFile(null);
      setBannerFile(null);
      setAvatarPreview(null);
      setBannerPreview(null);
      setIsEditing(false);

      if (!profile) {
          const apps = await getUserApps(updatedProfile.id);
          setUserApps(apps);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleLoadApp = (app: PublishedApp) => {
    const project: SavedProject = {
      id: `published-${app.id}`,
      prompt: app.prompt,
      files: [{ path: 'index.html', content: app.html_content }],
      previewHtml: app.preview_html,
      summary: app.summary,
      createdAt: app.created_at,
    };
    onLoadProject(project);
  };
  
  const handleSignOut = async () => {
    await supabaseAuth.signOut();
    setProfile(null);
    setUsername('');
    setUserApps([]);
    setIsEditing(false);
    // Let the auth listener in App.tsx handle the rest
  };


  return (
    <div className="min-h-screen w-screen bg-black flex flex-col p-4 pl-[4.5rem] selection:bg-indigo-500 selection:text-white">
      <main className="w-full max-w-7xl mx-auto px-4 animate-fade-in-up">
        {isLoading && !profile && <div className="text-center text-slate-400">Loading profile...</div>}
        {error && <div className="text-center text-red-400 p-4 bg-red-900/50 border border-red-800 rounded-lg">{error}</div>}
        
        {!isLoading && !error && userId && (
            <>
                <div 
                  className="relative mb-12 rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/50 bg-cover bg-center min-h-[250px] flex flex-col justify-end"
                  style={{ backgroundImage: `url(${bannerPreview || profile?.banner_url || ''})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
                  
                  {isEditing && (
                    <>
                      <button onClick={() => bannerInputRef.current?.click()} className="absolute top-4 right-4 z-10 flex items-center gap-2 px-3 py-1.5 bg-black/50 backdrop-blur-sm border border-white/10 rounded-full text-xs text-white hover:bg-white/20 transition-colors">
                        <CameraIcon className="w-4 h-4" /> Change Banner
                      </button>
                      <input type="file" ref={bannerInputRef} onChange={(e) => handleFileChange(e, 'banner')} className="hidden" accept="image/*" />
                    </>
                  )}
                  
                  <div className="relative p-6 flex flex-col md:flex-row items-center gap-6">
                      <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 -mb-16 md:mb-0 border-4 border-slate-800">
                          {(avatarPreview || profile?.avatar_url) ? (
                            <img src={avatarPreview || profile.avatar_url} alt="Profile" className="w-full h-full object-cover rounded-full" />
                          ) : (
                            <UserIcon className="w-14 h-14 text-white" />
                          )}
                          {isEditing && (
                            <>
                              <button onClick={() => avatarInputRef.current?.click()} className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                <CameraIcon className="w-8 h-8 text-white" />
                              </button>
                              <input type="file" ref={avatarInputRef} onChange={(e) => handleFileChange(e, 'avatar')} className="hidden" accept="image/*" />
                            </>
                          )}
                      </div>
                      <div className="flex-grow text-center md:text-left">
                          {isEditing || !profile ? (
                              <input 
                                  type="text"
                                  value={username}
                                  onChange={(e) => setUsername(e.target.value)}
                                  placeholder="Enter your username"
                                  className="text-4xl font-bold bg-transparent border-b-2 border-slate-600 focus:border-indigo-500 outline-none transition-colors text-white w-full md:w-auto"
                              />
                          ) : (
                              <h1 className="text-4xl font-bold text-white">{profile?.username}</h1>
                          )}
                          <p className="text-slate-400 mt-1">User ID: <span className="font-mono text-xs">{userId}</span></p>
                      </div>
                      <div className="flex-shrink-0 flex items-center gap-4">
                          {isEditing || !profile ? (
                               <button onClick={handleSaveProfile} disabled={isLoading} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-full transition-colors disabled:bg-slate-500">
                                {isLoading ? 'Saving...' : 'Save Profile'}
                               </button>
                          ) : (
                               <button onClick={() => setIsEditing(true)} className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-full transition-colors">Edit Profile</button>
                          )}
                          {profile && !isEditing && (
                              <button onClick={handleSignOut} className="px-6 py-2 bg-red-900/50 hover:bg-red-900/80 text-red-300 font-semibold rounded-full transition-colors">Sign Out</button>
                          )}
                      </div>
                  </div>
                </div>

                <h2 className="text-3xl font-bold text-slate-200 mb-8 mt-16 md:mt-8">My Published Apps</h2>
                 {userApps.length === 0 ? (
                    <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-2xl">
                        <RocketIcon className="w-12 h-12 mx-auto text-slate-600 mb-4" />
                        <h2 className="text-2xl font-semibold text-slate-300">Nothing Published Yet</h2>
                        <p className="text-slate-500 mt-2">
                        Create an app in the builder and hit "Publish" to share it with the community!
                        </p>
                    </div>
                ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {userApps.map((app, index) => (
                    <div
                        key={app.id}
                        className="relative bg-slate-900 border border-slate-700 rounded-lg overflow-hidden group transition-all hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 animate-fade-in-up flex flex-col"
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        <div className="aspect-[16/10] bg-slate-800 cursor-pointer" onClick={() => handleLoadApp(app)}>
                        <iframe
                            srcDoc={app.preview_html}
                            title={app.prompt}
                            sandbox="allow-scripts"
                            scrolling="no"
                            className="w-full h-full transform scale-[1] origin-top-left bg-white pointer-events-none"
                        />
                        </div>
                        <div className="p-4 border-t border-slate-800">
                            <p className="font-semibold text-slate-100 truncate text-sm" title={app.prompt}>
                                {app.prompt}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                                {new Date(app.created_at).toLocaleString()}
                            </p>
                        </div>
                    </div>
                    ))}
                </div>
                )}
            </>
        )}
      </main>
      <style>{`
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fade-in-up 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default ProfilePage;
