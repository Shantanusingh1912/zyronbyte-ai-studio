import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, ExternalLink, Key, ShieldCheck } from 'lucide-react';
import { YoutubeIcon, InstagramIcon } from './Icons';
import { api } from '../api';

export default function SocialAccountsModal({ isOpen, onClose, onRefresh }) {
  if (!isOpen) return null;

  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Instagram form
  const [igToken, setIgToken] = useState('');
  const [igAccountId, setIgAccountId] = useState('');
  const [connectingIg, setConnectingIg] = useState(false);

  const fetchAccounts = async () => {
    try {
      const data = await api.getSocialAccounts();
      setAccounts(data);
    } catch (err) {
      setError('Failed to load connected accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleConnectYoutube = async () => {
    try {
      const { auth_url } = await api.getYoutubeAuthUrl();
      // Open Google OAuth consent page
      window.open(auth_url, '_blank', 'width=600,height=700');
    } catch (err) {
      alert(`YouTube OAuth initialization failed: ${err.message}. Please configure YouTube Client ID & Secret in Settings.`);
    }
  };

  const handleConnectInstagram = async (e) => {
    e.preventDefault();
    setConnectingIg(true);
    setError('');
    try {
      await api.connectInstagram(igToken, igAccountId);
      alert('Instagram Professional account connected successfully!');
      fetchAccounts();
      onRefresh();
    } catch (err) {
      setError(err.message || 'Instagram connection failed');
    } finally {
      setConnectingIg(false);
    }
  };

  const handleDisconnect = async (platform) => {
    if (!confirm(`Disconnect ${platform}?`)) return;
    try {
      await api.disconnectSocial(platform);
      fetchAccounts();
      onRefresh();
    } catch (err) {
      alert(`Disconnect failed: ${err.message}`);
    }
  };

  const ytAccount = accounts.find(a => a.platform === 'youtube');
  const igAccount = accounts.find(a => a.platform === 'instagram');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#121622] border border-[#232B3E] rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E2536] bg-[#0E121B]">
          <div className="flex items-center space-x-2.5">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="text-base font-bold text-white">Social Media Channel Auth</h2>
              <p className="text-xs text-slate-400">Official OAuth authentication for YouTube Shorts & Instagram Reels</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* YouTube Card */}
          <div className="bg-[#0A0D15] border border-[#1E2536] rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20">
                  <YoutubeIcon className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">YouTube Data API v3</h3>
                  <p className="text-xs text-slate-400">Direct Shorts upload to channel ZyronByteYT</p>
                </div>
              </div>

              {ytAccount?.is_connected ? (
                <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Connected</span>
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 text-xs font-medium">
                  Not Connected
                </span>
              )}
            </div>

            {ytAccount?.is_connected ? (
              <div className="pt-2 flex items-center justify-between border-t border-[#1E2536] text-xs">
                <span className="text-slate-300 font-medium">
                  Channel: <strong className="text-white">{ytAccount.channel_title || ytAccount.account_name}</strong>
                </span>
                <button
                  onClick={() => handleDisconnect('youtube')}
                  className="text-rose-400 hover:text-rose-300 font-medium transition"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <div className="pt-2 flex items-center justify-between border-t border-[#1E2536]">
                <p className="text-[11px] text-slate-500">
                  Uses Google OAuth2 with secure offline refresh tokens.
                </p>
                <button
                  onClick={handleConnectYoutube}
                  className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-md shadow-red-600/20 transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Connect Channel</span>
                </button>
              </div>
            )}
          </div>

          {/* Instagram Card */}
          <div className="bg-[#0A0D15] border border-[#1E2536] rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-pink-500/10 text-pink-500 border border-pink-500/20">
                  <InstagramIcon className="w-6 h-6 text-pink-500" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Instagram Graph API</h3>
                  <p className="text-xs text-slate-400">Publish Reels to Instagram Professional / Creator account</p>
                </div>
              </div>

              {igAccount?.is_connected ? (
                <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Connected</span>
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 text-xs font-medium">
                  Not Connected
                </span>
              )}
            </div>

            {igAccount?.is_connected ? (
              <div className="pt-2 flex items-center justify-between border-t border-[#1E2536] text-xs">
                <span className="text-slate-300 font-medium">
                  Account: <strong className="text-white">{igAccount.account_name}</strong>
                </span>
                <button
                  onClick={() => handleDisconnect('instagram')}
                  className="text-rose-400 hover:text-rose-300 font-medium transition"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <form onSubmit={handleConnectInstagram} className="pt-2 space-y-2.5 border-t border-[#1E2536]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="password"
                    placeholder="Instagram Graph Access Token"
                    value={igToken}
                    onChange={(e) => setIgToken(e.target.value)}
                    className="bg-[#121622] border border-[#232B3E] rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Instagram Business Account ID"
                    value={igAccountId}
                    onChange={(e) => setIgAccountId(e.target.value)}
                    className="bg-[#121622] border border-[#232B3E] rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
                    required
                  />
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-slate-500">
                    Never stores passwords; only uses scoped Graph API tokens.
                  </p>
                  <button
                    type="submit"
                    disabled={connectingIg}
                    className="px-3.5 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold shadow-md shadow-pink-600/20 transition disabled:opacity-50"
                  >
                    {connectingIg ? 'Verifying...' : 'Connect Instagram'}
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
