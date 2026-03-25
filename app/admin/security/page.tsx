import { SecuritySettingsPanel } from '@/components/SecuritySettingsPanel';
import { getAdminSecurityStatus } from '@/lib/auth';
import { maskSecret } from '@/lib/security-utils';
import { env } from '@/lib/env';

export default function AdminSecurityPage() {
  const status = getAdminSecurityStatus();
  return <SecuritySettingsPanel status={status} maskedSecret={maskSecret(env.admin2faSecret)} />;
}
