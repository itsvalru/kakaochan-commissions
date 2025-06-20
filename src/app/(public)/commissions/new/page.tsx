import CommissionForm from '@/components/commission/CommissionForm';
import FormStepper from '@/components/commission/FormStepper';
import { FormProvider } from '@/context/FormContext';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';

export default async function NewCommissionPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <main className="min-h-screen bg-[#0a0000] py-12 px-4">
      <h1 className="text-2xl font-bold mb-6">Start a New Commission</h1>
      <FormProvider>
        <FormStepper />
      </FormProvider>
    </main>
  );
}
