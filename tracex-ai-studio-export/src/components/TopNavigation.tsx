import React, { useState } from 'react';
import { Search, X, FileText, ChevronDown, Check, Shield } from 'lucide-react';
import { ForensicCase, TerminalEntityNode } from '../types/forensics';

interface TopNavigationProps {
  currentCase: ForensicCase;
  allCases: ForensicCase[];
  onSelectCase: (c: ForensicCase) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSearchSelectTerminal: (node: TerminalEntityNode) => void;
  onOpenEvidence: () => void;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({
  currentCase,
  allCases,
  onSelectCase,
  searchQuery,
  onSearchChange,
  onSearchSelectTerminal,
  onOpenEvidence,
}) => {
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showCaseDropdown, setShowCaseDropdown] = useState(false);

  // Search across all terminal nodes and categories
  const allTerminals: TerminalEntityNode[] = currentCase.categories.flatMap((cat) => cat.terminalNodes);

  const matches = searchQuery.trim().length > 1
    ? allTerminals.filter(n =>
        n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.evidenceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  return (
    <nav className="h-12 bg-[#090B0E] border-b border-white/10 px-5 flex items-center justify-between text-xs text-[#EEEBE2] select-none z-30">
      {/* LEFT: Identity + Active Investigation Case Dropdown */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 pr-4 border-r border-white/10">
          <div className="w-5 h-5 rounded bg-gradient-to-tr from-[#8B5CF6] to-[#00F2FE] flex items-center justify-center text-black font-extrabold text-[11px] shadow-[0_0_10px_rgba(0,242,254,0.4)]">
            TX
          </div>
          <span className="font-bold tracking-wider text-xs text-white font-sans">TRACEX</span>
          <span className="text-[9.5px] text-[#71747E] font-mono tracking-widest uppercase">FORENSICS</span>
        </div>

        {/* Case Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowCaseDropdown(!showCaseDropdown)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white/5 transition text-left cursor-pointer border border-transparent hover:border-white/10"
          >
            <div className="flex items-baseline gap-2">
              <span className="text-xs text-white font-medium tracking-tight">
                {currentCase.title}
              </span>
              <span className="text-[10px] text-[#71747E] font-mono hidden sm:inline">
                {currentCase.firNumber}
              </span>
            </div>
            <ChevronDown className="w-3 h-3 text-[#71747E]" />
          </button>

          {showCaseDropdown && (
            <div className="absolute top-full left-0 mt-1 w-84 rounded-xl bg-[#0E1015] border border-white/10 shadow-2xl p-1.5 z-50 font-mono text-xs">
              <div className="text-[9px] text-[#71747E] px-2 py-1 uppercase tracking-wider">
                Active Forensic Dossiers
              </div>
              {allCases.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    onSelectCase(c);
                    setShowCaseDropdown(false);
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-white/10 flex items-center justify-between text-xs transition cursor-pointer"
                >
                  <div>
                    <div className="text-white font-sans font-medium">{c.title}</div>
                    <div className="text-[10px] text-[#71747E]">{c.firNumber} · {c.totalStolenEth} ETH</div>
                  </div>
                  {c.id === currentCase.id && (
                    <Check className="w-3.5 h-3.5 text-[#10B981]" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CENTER: Forensic Search */}
      <div className="relative flex-1 max-w-md mx-6 hidden md:block">
        <div className="relative flex items-center">
          <Search className="absolute left-3 w-3.5 h-3.5 text-[#71747E]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              onSearchChange(e.target.value);
              setShowSearchResults(true);
            }}
            onFocus={() => setShowSearchResults(true)}
            placeholder="Search address 0x..., entity, or evidence ID"
            className="w-full h-8 pl-8 pr-7 rounded-full bg-[#141720] border border-white/10 focus:border-[#00F2FE] focus:outline-none text-xs text-white placeholder:text-[#60636C] font-mono transition"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 text-[#71747E] hover:text-white cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Autocomplete Dropdown */}
        {showSearchResults && matches.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#0E1015] border border-white/10 rounded-xl shadow-2xl p-1.5 z-50 max-h-64 overflow-y-auto font-mono text-xs">
            <div className="text-[9px] text-[#71747E] px-2 py-1 uppercase tracking-wider">
              Target Entities ({matches.length})
            </div>
            {matches.map((term) => (
              <button
                key={term.id}
                onClick={() => {
                  onSearchSelectTerminal(term);
                  setShowSearchResults(false);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-white/10 flex items-center justify-between text-xs transition cursor-pointer"
              >
                <div className="truncate pr-2">
                  <div className="text-white font-medium font-sans">{term.name}</div>
                  <div className="text-[9.5px] text-[#71747E] truncate">{term.address}</div>
                </div>
                <div className="text-right whitespace-nowrap">
                  <span className="text-[10px] text-[#F59E0B]">{term.amountEth} ETH</span>
                  <div className="text-[9px] text-[#71747E]">{term.badgeTier}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT: Status & Evidence Docket */}
      <div className="flex items-center gap-3">
        {/* Evidence Docket Button */}
        <button
          onClick={onOpenEvidence}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[#A09D95] hover:text-white hover:bg-white/10 border border-white/10 transition cursor-pointer"
          title="Open Forensic Evidence Docket"
        >
          <FileText className="w-3.5 h-3.5 text-[#00F2FE]" />
          <span className="font-mono text-[11px]">Evidence Docket</span>
        </button>

        <div className="flex items-center gap-2.5 text-[11px] font-mono text-[#71747E] pl-2 border-l border-white/10">
          <span className="text-[#A09D95] hidden lg:inline">{currentCase.chain}</span>
          <span className="hidden xl:inline text-[#EEEBE2]">{currentCase.officerName}</span>
        </div>
      </div>
    </nav>
  );
};
