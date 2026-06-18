import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  BarChart3, 
  Plus, 
  Trash2, 
  Lock, 
  Unlock, 
  Vote, 
  Check, 
  Loader2, 
  HelpCircle, 
  ListPlus, 
  X, 
  Settings,
  AlertCircle
} from "lucide-react";
import { Poll, PollOption } from "../types";

interface PollsSectionProps {
  polls: Poll[];
  userToken: string | null;
  onVotePoll: (pollId: number, optionId: string) => Promise<void>;
  onSavePoll: (poll: any) => Promise<void>;
  onDeletePoll: (pollId: number) => Promise<void>;
}

export default function PollsSection({
  polls = [],
  userToken,
  onVotePoll,
  onSavePoll,
  onDeletePoll
}: PollsSectionProps) {
  // Local storage lookup for fan's already-voted options, key: pollId -> optionId
  const [votedPolls, setVotedPolls] = useState<Record<number, string>>(() => {
    try {
      const saved = localStorage.getItem("tfc_fan_polls_voted");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isSubmitVoting, setIsSubmitVoting] = useState<Record<number, boolean>>({});
  
  // Admin form state
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [isActive, setIsActive] = useState(true);
  const [formError, setFormError] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);

  // Sync to local storage when voted status changes
  const saveVoteStatus = (pollId: number, optionId: string) => {
    const updated = { ...votedPolls, [pollId]: optionId };
    setVotedPolls(updated);
    try {
      localStorage.setItem("tfc_fan_polls_voted", JSON.stringify(updated));
    } catch (e) {
      console.error("Local storage sync error:", e);
    }
  };

  // Vote handler
  const handleVote = async (pollId: number, optionId: string) => {
    if (votedPolls[pollId] || isSubmitVoting[pollId]) return;
    
    setIsSubmitVoting(prev => ({ ...prev, [pollId]: true }));
    try {
      await onVotePoll(pollId, optionId);
      saveVoteStatus(pollId, optionId);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitVoting(prev => ({ ...prev, [pollId]: false }));
    }
  };

  // Admin: options list handlers
  const handleAddOption = () => {
    if (options.length >= 6) return;
    setOptions([...options, ""]);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) return;
    const nextOpts = [...options];
    nextOpts.splice(index, 1);
    setOptions(nextOpts);
  };

  const handleOptionChange = (value: string, index: number) => {
    const nextOpts = [...options];
    nextOpts[index] = value;
    setOptions(nextOpts);
  };

  // Admin: publish poll
  const handlePublishPoll = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!question.trim()) {
      setFormError("Please enter a poll question.");
      return;
    }

    const filteredOptions = options.map(o => o.trim()).filter(Boolean);
    if (filteredOptions.length < 2) {
      setFormError("Please provide at least 2 non-empty choices.");
      return;
    }

    setIsPublishing(true);
    try {
      const pollData = {
        question: question.trim(),
        options: filteredOptions.map(text => ({ text, votes: 0 })),
        active: isActive,
        createdAt: new Date().toISOString()
      };
      await onSavePoll(pollData);

      // Reset form
      setQuestion("");
      setOptions(["", ""]);
      setFormError("");
      setIsAdminPanelOpen(false);
    } catch (err: any) {
      setFormError(err.message || "Failed to create new poll.");
    } finally {
      setIsPublishing(false);
    }
  };

  // Admin: Toggle active state of an existing poll
  const handleTogglePollStatus = async (poll: Poll) => {
    try {
      const updatedPoll = {
        ...poll,
        active: !poll.active
      };
      await onSavePoll(updatedPoll);
    } catch (err: any) {
      alert("Error changing poll status: " + err.message);
    }
  };

  // Sort polls so active polls are on top, then newer ones first
  const sortedPolls = [...polls].sort((a, b) => {
    if (a.active !== b.active) {
      return a.active ? -1 : 1;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const activePolls = sortedPolls.filter(p => p.active);
  const closedPolls = sortedPolls.filter(p => !p.active);

  // Helper to calculate score percentage
  const getPercentage = (optionVotes: number, totalVotes: number) => {
    if (totalVotes === 0) return 0;
    return Math.round((optionVotes / totalVotes) * 100);
  };

  return (
    <div className="bg-[#0b1929] border border-white/10 rounded-2xl p-5 shadow-xl relative" id="polls-widget-block">
      {/* Header section with branding & admin togglent */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-4 mb-5 gap-3">
        <div>
          <h3 className="text-white text-md font-black tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-500 animate-pulse" />
            Poll of the Week
          </h3>
          <p className="text-gray-400 text-xxs mt-0.5">
            Voice of Masvingo Fans — Cast your vote &amp; see real-time community results
          </p>
        </div>

        {userToken && (
          <button
            onClick={() => setIsAdminPanelOpen(!isAdminPanelOpen)}
            className="self-start sm:self-center bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 hover:text-white border border-blue-500/20 hover:border-blue-500/40 text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all duration-150"
            id="admin-polls-portal-btn"
          >
            <Settings className="w-3.5 h-3.5" />
            {isAdminPanelOpen ? "Close Admin Portal" : "Manage Polls"}
          </button>
        )}
      </div>

      {/* Admin Panel Creator Dropdown */}
      <AnimatePresence>
        {isAdminPanelOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-white/5 mb-6 pb-6"
            id="admin-polls-form-container"
          >
            <div className="bg-[#07111f] border border-white/5 rounded-2xl p-4.5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                <span className="text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                  <ListPlus className="text-blue-400 w-4 h-4" />
                  Create Weekly Poll
                </span>
                <span className="text-amber-500 text-[10px] uppercase font-mono font-black">
                  Admin Authorized
                </span>
              </div>

              <form onSubmit={handlePublishPoll} className="space-y-4">
                {formError && (
                  <div className="bg-red-500/10 border border-red-500/20 p-2.5 rounded-xl text-red-400 text-xxs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-gray-400 text-xxs uppercase tracking-wider font-bold">
                    Poll Question / Topic
                  </label>
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="e.g., Should Tango FC prioritize cup games or local league focus?"
                    className="w-full bg-[#0b1929] border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-blue-500/50 transition-colors placeholder:text-gray-600"
                    id="new-poll-question-field"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-gray-400 text-xxs uppercase tracking-wider font-bold block">
                    Voting Answers (2 to 6 options)
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {options.map((opt, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <span className="text-gray-500 text-xxs font-mono">{idx + 1}.</span>
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => handleOptionChange(e.target.value, idx)}
                          placeholder={`Option ${idx + 1}`}
                          className="flex-1 bg-[#0b1929] border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none focus:border-blue-500/50 transition-colors placeholder:text-gray-600"
                        />
                        {options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(idx)}
                            className="bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white p-2.5 rounded-xl transition-all border border-red-500/10"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {options.length < 6 && (
                    <button
                      type="button"
                      onClick={handleAddOption}
                      className="mt-2 text-xxs font-black uppercase text-blue-400 hover:text-white bg-blue-500/5 border border-blue-500/10 hover:border-blue-500/30 px-3.5 py-1.5 rounded-lg flex items-center gap-1 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Option Choice
                    </button>
                  )}
                </div>

                {/* Switch to auto publish active or draft */}
                <div className="flex items-center gap-4 pt-1.5 border-t border-white/5">
                  <label className="flex items-center gap-2 cursor-pointer text-xxs text-gray-400 uppercase tracking-wider font-bold">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="accent-blue-600 w-3.5 h-3.5"
                    />
                    Publish in ACTIVE (Open) status
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAdminPanelOpen(false)}
                    className="bg-white/5 hover:bg-white/10 text-gray-300 font-bold px-4 py-2 rounded-xl text-xxs uppercase tracking-wider transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPublishing}
                    className="bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 text-white font-black px-5 py-2 rounded-xl text-xxs uppercase tracking-wider transition-all flex items-center gap-1.5 shadow"
                    id="publish-new-poll-btn"
                  >
                    {isPublishing ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Publishing...
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        Launch Poll
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* List of polls for administration purposes (toggle active, delete) */}
            <div className="mt-4 bg-[#07111f] border border-white/5 rounded-2xl p-4.5 space-y-3">
              <span className="text-gray-400 text-[9px] font-black uppercase tracking-wider block border-b border-white/5 pb-1.5">
                Current Registered Surveys ({polls.length})
              </span>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {polls.length === 0 ? (
                  <p className="text-gray-500 italic text-xxs">No surveys created yet in database.</p>
                ) : (
                  polls.map(p => (
                    <div key={p.id} className="flex items-center justify-between bg-[#0b1929] border border-white/5 rounded-xl p-2.5 text-xxs">
                      <div className="min-w-0 flex-1 pr-3">
                        <p className="text-white font-extrabold truncate">{p.question}</p>
                        <span className="text-[10px] text-gray-500 font-mono">
                          {p.options.reduce((sum, opt) => sum + opt.votes, 0)} votes casted
                        </span>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleTogglePollStatus(p)}
                          title={p.active ? "Close poll voting" : "Re-open poll voting"}
                          className={`p-2 rounded-lg border transition-all ${
                            p.active 
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20" 
                              : "bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20"
                          }`}
                        >
                          {p.active ? <Unlock className="w-3.2 h-3.2" /> : <Lock className="w-3.2 h-3.2" />}
                        </button>

                        <button
                          onClick={() => onDeletePoll(p.id)}
                          title="Delete poll"
                          className="bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-400 hover:text-white p-2 rounded-lg transition-all"
                        >
                          <Trash2 className="w-3.2 h-3.2" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main active polls section layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Active Poll Area */}
        <div className="space-y-4">
          <div className="bg-[#07111f] border border-white/5 p-4.5 rounded-2xl flex flex-col justify-between h-full space-y-4">
            {activePolls.length > 0 ? (
              (() => {
                const currentPoll = activePolls[0];
                const selectedOptionId = votedPolls[currentPoll.id];
                const hasVoted = !!selectedOptionId;
                const totalVotes = currentPoll.options.reduce((sum, o) => sum + o.votes, 0);

                return (
                  <div className="space-y-4 flex flex-col justify-between h-full">
                    {/* Poll banner info */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1 bg-blue-500/15 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                          <Vote className="w-3 h-3 text-blue-400 animate-bounce" />
                          Live &amp; Active
                        </span>
                        <span className="text-gray-500 font-mono text-[9px]">
                          Created {new Date(currentPoll.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>

                      <h4 className="text-white text-[14px] sm:text-[15px] font-black leading-tight tracking-tight">
                        {currentPoll.question}
                      </h4>
                    </div>

                    {/* Poll Option List */}
                    <div className="space-y-2.5 py-2">
                      {currentPoll.options.map((opt) => {
                        const percent = getPercentage(opt.votes, totalVotes);
                        const isPicked = selectedOptionId === opt.id;

                        if (hasVoted) {
                          // Voted results layout
                          return (
                            <div key={opt.id} className="relative bg-[#0b1929] border border-white/5 rounded-xl p-3 overflow-hidden">
                              {/* Background fill percentage visual bar */}
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${percent}%` }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className={`absolute inset-y-0 left-0 ${
                                  isPicked ? "bg-blue-600/15" : "bg-white/[0.02]"
                                }`}
                              />

                              <div className="relative flex items-center justify-between text-xs z-10 gap-3">
                                <span className={`font-semibold flex items-center gap-1.5 min-w-0 pr-2 ${
                                  isPicked ? "text-blue-400 font-black" : "text-gray-200"
                                }`}>
                                  {isPicked && <Check className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />}
                                  <span className="truncate">{opt.text}</span>
                                </span>

                                <div className="flex items-center gap-3 flex-shrink-0 font-mono text-xxs font-extrabold text-right">
                                  <span className="text-gray-500">({opt.votes} {opt.votes === 1 ? 'vote' : 'votes'})</span>
                                  <span className={isPicked ? "text-blue-400 font-black" : "text-white"}>
                                    {percent}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        } else {
                          // Unvoted - standard button layout
                          return (
                            <motion.button
                              whileHover={{ scale: 1.005, backgroundColor: "rgba(59, 130, 246, 0.04)" }}
                              whileTap={{ scale: 0.995 }}
                              key={opt.id}
                              onClick={() => handleVote(currentPoll.id, opt.id)}
                              disabled={isSubmitVoting[currentPoll.id]}
                              className="w-full text-left bg-[#0b1929] hover:border-blue-500/40 border border-white/10 rounded-xl p-3 text-xs text-gray-200 transition-all duration-150 flex items-center justify-between gap-3 group"
                            >
                              <span className="font-medium group-hover:text-blue-400 transition-colors truncate">
                                {opt.text}
                              </span>
                              <div className="w-4 h-4 rounded-full border border-gray-600 group-hover:border-blue-400 flex-shrink-0 flex items-center justify-center">
                                <span className="w-1.5 h-1.5 bg-transparent group-hover:bg-blue-400 rounded-full transition-all"></span>
                              </div>
                            </motion.button>
                          );
                        }
                      })}
                    </div>

                    {/* Metadata Footer summary */}
                    <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-1 text-[10px] text-gray-500">
                      <span>Total Casted Votes: <strong className="font-extrabold text-gray-300">{totalVotes}</strong></span>
                      {hasVoted && (
                        <span className="text-emerald-400 font-extrabold flex items-center gap-1">
                          ✓ Selection Recorded
                        </span>
                      )}
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-12 space-y-2.5 h-full">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/5 text-gray-500 mb-1">
                  <HelpCircle className="w-6 h-6 opacity-40" />
                </div>
                <h5 className="text-white text-xs font-black uppercase">No Active Weekly Survey</h5>
                <p className="text-gray-500 text-xxs px-6 leading-relaxed max-w-[280px]">
                  Board directors &amp; managers have not deployed an open poll for this week's rotation cycle.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Previous Polls & Archive Area (Right Column) */}
        <div className="flex flex-col justify-between">
          <div className="bg-[#07111f] border border-white/5 p-4.5 rounded-2xl h-full flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <span className="text-gray-400 text-xxs uppercase tracking-wider font-extrabold block border-b border-white/5 pb-2">
                Survey Archives &amp; Historic Votes
              </span>

              <div className="space-y-3.5 max-h-[290px] overflow-y-auto pr-1">
                {closedPolls.length === 0 ? (
                  <p className="text-gray-500 italic text-xxs py-6 text-center">
                    No completed historic polls on current ledger book.
                  </p>
                ) : (
                  closedPolls.map(p => {
                    const totalVotes = p.options.reduce((sum, o) => sum + o.votes, 0);
                    // Find the winning option
                    const sortedOptions = [...p.options].sort((a, b) => b.votes - a.votes);
                    const winner = sortedOptions[0];

                    return (
                      <div key={p.id} className="bg-[#0b1929] border border-white/5 rounded-xl p-3 space-y-2 text-xxs">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500 font-mono text-[9px]">
                            {new Date(p.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                          </span>
                          <span className="bg-white/5 text-gray-400 border border-white/5 text-[8px] font-bold uppercase px-1.5 py-0.5 rounded">
                            Ended
                          </span>
                        </div>

                        <p className="text-gray-300 font-bold leading-snug">{p.question}</p>

                        <div className="space-y-1 bg-[#07111f]/50 p-2 rounded-lg border border-white/5">
                          {p.options.map(o => {
                            const pct = getPercentage(o.votes, totalVotes);
                            const isWin = winner && winner.id === o.id && o.votes > 0;
                            return (
                              <div key={o.id} className="flex items-center justify-between text-[10px] py-0.5">
                                <span className={`truncate max-w-[170px] ${isWin ? "text-amber-400 font-black" : "text-gray-400"}`}>
                                  {isWin ? "🏆 " : ""}{o.text}
                                </span>
                                <span className={`font-mono ${isWin ? "text-amber-400 font-bold" : "text-gray-500"}`}>
                                  {pct}%
                                </span>
                              </div>
                            );
                          })}
                        </div>
                        <div className="text-[9px] text-gray-500 text-right">
                          Completed with <strong className="text-gray-400 font-bold">{totalVotes} cumulative votes</strong>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="bg-[#0b1929]/40 border border-white/5 rounded-xl p-3 text-[10px] text-gray-400 leading-relaxed">
              💡 <strong>Grassroots Governance</strong>: Tango FC is deeply connected to our local Masvingo audience. Fan voting aggregates support indicators to directly influence stadium infrastructure focus and community-led events.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
