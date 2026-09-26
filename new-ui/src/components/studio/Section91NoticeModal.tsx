import React, { useState } from 'react';
import { X, Copy, Check, Printer, ShieldCheck } from 'lucide-react';
import { GraphNodeData } from '../../types/graph3d';

interface Section91NoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  node: GraphNodeData | null;
  firNumber?: string;
  victimEntity?: string;
}

export const Section91NoticeModal: React.FC<Section91NoticeModalProps> = ({
  isOpen,
  onClose,
  node,
  firNumber = 'FIR No. 402/2026 Special Cell (Cyber)',
  victimEntity = 'Aegis Protocol Treasury Reserve',
}) => {
  const [copied, setCopied] = useState(false);
  const [isSigned, setIsSigned] = useState(false);

  if (!isOpen || !node) return null;

  const nodeName = node.label || 'Target Custodial Node';
  const nodeAddress = node.address || '0x0000000000000000000000000000000000000000';
  const nodeEth = typeof node.balanceEth === 'number' && isFinite(node.balanceEth) ? node.balanceEth : 45.2;
  const nodeUsd = typeof node.balanceUsd === 'number' && isFinite(node.balanceUsd) ? node.balanceUsd : 158200;
  const taint = typeof node.riskScore === 'number' && isFinite(node.riskScore) ? node.riskScore : 94;
  const targetVasp = (node.label || '').includes('Binance') ? 'Binance Holdings Ltd (FIU-IND Compliance)' : 'Virtual Asset Service Provider Compliance Team';
  const noticeDate = '24th September 2026';
  const evidenceRef = node.evidenceIds?.[0] || 'EVD-001-VASP';
  const dispatchRef = `LE/CYBER/SEC91/2026/${evidenceRef}`;

  const noticeBody = `OFFICE OF THE SUPERINTENDENT OF POLICE
SPECIAL CELL (CYBER CRIME INVESTIGATION DIVISION)
NEW DELHI — 110003

STATUTORY NOTICE UNDER SECTION 91 Cr.P.C. / SECTION 94 BHARATIYA NAGARIK SURAKSHA SANHITA (BNSS), 2023

REF NO: ${dispatchRef}
DATED: ${noticeDate}

TO:
THE NODAL / COMPLIANCE OFFICER (LAW ENFORCEMENT LIAISON)
${targetVasp.toUpperCase()}

SUBJECT: IMMEDIATE DEBIT-FREEZE REQUISITION AND URGENT PRODUCTION OF KYC / IP LOGS PERTAINING TO ON-CHAIN FRAUD PROCEEDS IN ${firNumber.toUpperCase()}

1. WHEREAS an investigation into high-value cyber financial fraud and unlawful asset diversion is underway vide ${firNumber} registered under Sections 316(2), 318(4) of Bharatiya Nyaya Sanhita (BNS) 2023 and Section 66D of Information Technology Act 2000.

2. AND WHEREAS cryptographic ledger analysis conducted on the Ethereum blockchain confirms that stolen funds originating from ${victimEntity} were channeled through rapid mule hops and peel chains into the custodial deposit infrastructure operated by your exchange:
   - TARGET VASP DEPOSIT ADDRESS: ${nodeAddress}
   - IDENTIFIED ENTITY / TAG: ${nodeName}
   - DETECTED TAINTED AMOUNT: ${nodeEth} ETH (Approx. $${nodeUsd.toLocaleString()} USD)
   - TAINT RATIO: ${taint}%
   - FORENSIC EVIDENCE RECORD: ${evidenceRef}

3. YOU ARE HEREBY COMMANDED under the statutory powers conferred by Section 91 of the Code of Criminal Procedure, 1973 (read with Section 94 of BNSS, 2023):
   a. To IMMEDIATELY IMPOSE AN ADMINISTRATIVE DEBIT FREEZE on the user account(s) associated with the aforementioned blockchain deposit address within TWO (2) HOURS of receipt of this notice to prevent dissipation of criminal proceeds.
   b. To FURNISH COMPLETE KYC PARTICULARS including:
      - Full legal name, date of birth, and verified identity documents (Passport / Aadhaar / National ID)
      - Associated phone numbers, email addresses, and registered bank accounts
      - Complete fiat/crypto transaction ledger for the preceding 180 days
      - Inbound / outbound login IP access logs with timestamps and port numbers

4. Take notice that failure to comply with this lawful requisition shall render your organization and responsible compliance nodal officers liable for penal action under Section 223 / 228 of BNS 2023 for obstruction of public servant and destruction of evidence.

ISSUED UNDER THE OFFICIAL SEAL AND SIGNATURE:
Investigating Officer: Insp. R. K. Sharma
Designation: Inspector of Police, Cyber Crime Cell
Cadre Badge: I4C-CYB-4092
State Police Cyber Command & Control Centre`;

  const handleCopy = () => {
    navigator.clipboard.writeText(noticeBody);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none text-xs pointer-events-auto">
      <div className="w-full max-w-3xl rounded-2xl bg-[#0A0B0E] border border-white/10 shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* Modal Top Bar */}
        <div className="h-12 px-5 border-b border-white/10 flex items-center justify-between bg-[#08090C]">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[#EEEBE2] font-semibold text-xs tracking-tight">
              STATUTORY SECTION 91 POLICE NOTICE
            </span>
            <span className="text-[10px] font-mono text-[#10B981] px-2 py-0.5 rounded-full bg-[#10B981]/15 border border-[#10B981]/30">
              VASP FREEZE REQUISITION
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-[#A09D95] hover:text-[#EEEBE2] hover:bg-white/10 border border-white/10 transition cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied Notice' : 'Copy Notice Text'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-[#A09D95] hover:text-[#EEEBE2] hover:bg-white/10 border border-white/10 transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="text-[#60636C] hover:text-[#EEEBE2] p-1 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Official Document Canvas */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#08090C] text-[#D8D4C8] font-mono text-[11px] leading-relaxed">
          <div className="max-w-2xl mx-auto p-6 rounded-xl bg-[#0D0F13] border border-white/10 space-y-4 shadow-inner">
            {/* Header Stamp */}
            <div className="text-center pb-4 border-b border-white/10">
              <div className="text-[10px] text-[#8E8B83] tracking-widest uppercase">
                GOVERNMENT OF NCT OF DELHI · DELHI POLICE
              </div>
              <div className="text-base font-semibold text-[#EEEBE2] mt-0.5 tracking-wide font-sans">
                SPECIAL CELL (CYBER CRIME INVESTIGATION DIVISION)
              </div>
              <div className="text-[10px] text-[#60636C] mt-0.5">
                PS Cyber Crime, Mandir Marg, New Delhi — 110001
              </div>
            </div>

            {/* Reference Details */}
            <div className="flex items-start justify-between text-[10px] pt-1 text-[#8E8B83]">
              <div>
                <div><span className="text-[#555861]">DISPATCH NO:</span> {dispatchRef}</div>
                <div><span className="text-[#555861]">CASE FIR:</span> {firNumber}</div>
              </div>
              <div className="text-right">
                <div><span className="text-[#555861]">DATE:</span> {noticeDate}</div>
                <div><span className="text-[#555861]">JURISDICTION:</span> Sec 91 CrPC / Sec 94 BNSS</div>
              </div>
            </div>

            {/* Target Address Card */}
            <div className="p-3.5 rounded-lg bg-[#090A0E] border border-white/10 space-y-1">
              <div className="text-[9.5px] uppercase tracking-wider text-[#60636C]">
                TARGET VASP COMPLIANCE DESK
              </div>
              <div className="text-sm font-semibold text-[#EEEBE2] font-sans">
                {targetVasp}
              </div>
              <div className="text-[10.5px] text-[#A09D95] font-mono break-all">
                Target Deposit Address: <span className="text-[#10B981] font-semibold">{node.address}</span>
              </div>
              <div className="text-[10px] text-[#8E8B83]">
                Identified Seizure Amount: <strong className="text-[#EEEBE2]">{nodeEth} ETH</strong> (~${nodeUsd.toLocaleString()} USD) · Taint: {taint}%
              </div>
            </div>

            {/* Formal Text */}
            <div className="text-[11px] text-[#B0ACA0] space-y-3 leading-relaxed whitespace-pre-line font-sans">
              <p>
                <strong>1. URGENT DEBIT FREEZE MANDATE:</strong> An investigation into high-volume decentralized treasury siphon ($498,750 USD) is being conducted. Forensic ledger verification proves tainted assets were deposited into your exchange infrastructure at the aforementioned address.
              </p>
              <p>
                <strong>2. STATUTORY REQUISITION:</strong> Under powers conferred by Section 91 Cr.P.C. / Section 94 BNSS 2023, you are directed to freeze all debit operations on accounts associated with address <code>{node.address.slice(0, 14)}...</code> within two hours, and produce KYC records, login IP access history, and counterparty settlement details.
              </p>
            </div>

            {/* Signatory Footer */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[10px]">
              <div>
                <div className="text-[#555861]">OFFICER IN CHARGE:</div>
                <div className="text-xs font-semibold text-[#EEEBE2]">Insp. R. K. Sharma</div>
                <div className="text-[#8E8B83]">I4C-CYB-4092 · Cyber Crime Division</div>
              </div>

              <div className="text-right">
                <button
                  onClick={() => setIsSigned(!isSigned)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition cursor-pointer ${
                    isSigned
                      ? 'bg-[#10B981]/15 border-[#10B981]/40 text-[#10B981]'
                      : 'bg-white/5 border-white/10 text-[#8E8B83] hover:text-[#EEEBE2]'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{isSigned ? 'Digitally Sealed (e-Sign)' : 'Affix Digital e-Sign'}</span>
                </button>
                <div className="text-[9px] text-[#555861] mt-1">
                  {isSigned ? 'Cryptographic Hash: 0x9f1a...e4d2' : 'Pending Verification'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Bar */}
        <div className="h-11 px-5 border-t border-white/10 flex items-center justify-between bg-[#08090C] text-[10.5px] font-mono text-[#60636C]">
          <span>EVIDENCE CHAIN RECORD: {evidenceRef}</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-[#EEEBE2] transition cursor-pointer"
          >
            Close Notice
          </button>
        </div>
      </div>
    </div>
  );
};
