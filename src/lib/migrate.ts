import { supabase } from './supabase';

const ARREAR_FEE_OVERRIDES_KEY = 'exam_erp_arrear_fee_status';

/** Apply pending schema updates via Supabase RPC (requires migration SQL to be run once). */
export async function runMigrations(): Promise<boolean> {
  const { error } = await supabase.rpc('ensure_arrear_fee_status');
  if (error) {
    if (!error.message.includes('Could not find the function')) {
      console.warn('Migration ensure_arrear_fee_status:', error.message);
    }
    return false;
  }
  return true;
}

/** Check whether arrear_registrations.fee_status exists in the connected database. */
export async function arrearFeeStatusSupported(): Promise<boolean> {
  const { error } = await supabase.from('arrear_registrations').select('fee_status').limit(1);
  return !error;
}

export function getLocalArrearFeeStatus(id: string): string | null {
  try {
    const map = JSON.parse(localStorage.getItem(ARREAR_FEE_OVERRIDES_KEY) || '{}') as Record<string, string>;
    return map[id] ?? null;
  } catch {
    return null;
  }
}

export function setLocalArrearFeeStatus(id: string, feeStatus: string) {
  try {
    const map = JSON.parse(localStorage.getItem(ARREAR_FEE_OVERRIDES_KEY) || '{}') as Record<string, string>;
    map[id] = feeStatus;
    localStorage.setItem(ARREAR_FEE_OVERRIDES_KEY, JSON.stringify(map));
  } catch {
    /* ignore storage errors */
  }
}

export function resolveArrearFeeStatus(arrear: { id: string; fee_status?: string; status: string }) {
  if (arrear.fee_status) return arrear.fee_status;
  const local = getLocalArrearFeeStatus(arrear.id);
  if (local) return local;
  return arrear.status === 'approved' ? 'paid' : 'pending';
}
