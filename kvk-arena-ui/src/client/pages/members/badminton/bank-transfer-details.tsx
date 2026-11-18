import { getEnv } from "@/env";
import type { BankTransferDetails } from "@/services/member-badminton-api";

export default function BankTransferInstructions({ details }: { details?: BankTransferDetails | null }) {
  const env = getEnv();
  const configured = {
    bankName: String(env.BADMINTON_BANK_NAME).trim(),
    accountOwnerName: String(env.BADMINTON_ACCOUNT_OWNER_NAME).trim(),
    accountNumber: String(env.BADMINTON_ACCOUNT_NUMBER).trim(),
    branchName: String(env.BADMINTON_BRANCH_NAME).trim(),
  };
  const bank = details ?? (Object.values(configured).every(Boolean) ? configured : null);
  if (!bank) {
    return env.BADMINTON_PAYMENT_INSTRUCTIONS
      ? <p className="whitespace-pre-line">{env.BADMINTON_PAYMENT_INSTRUCTIONS}</p>
      : <p><a href="https://wa.me/94765605885" target="_blank" rel="noreferrer">Contact KVK Arena for bank transfer details</a>.</p>;
  }

  return <dl className="mb-receipt w-full">
    <div><dt>Bank name</dt><dd>{bank.bankName}</dd></div>
    <div><dt>Account owner</dt><dd>{bank.accountOwnerName}</dd></div>
    <div><dt>Account number</dt><dd>{bank.accountNumber}</dd></div>
    <div><dt>Branch name</dt><dd>{bank.branchName}</dd></div>
  </dl>;
}
