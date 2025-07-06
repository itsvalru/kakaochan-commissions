import FormStepper from "@/components/commission/FormStepper";
import { FormProvider } from "@/context/FormContext";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export default async function NewCommissionPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <FormProvider>
          <FormStepper />
        </FormProvider>
      </div>
    </main>
  );
}
