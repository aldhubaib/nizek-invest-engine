import { redirect } from "@tanstack/react-router";

import { supabase } from "@/integrations/supabase/client";
import { getInvestorContext, type InvestorContext } from "@/lib/investor.functions";

/**
 * Site-wide gate. The presentation is private: it opens for an investor who
 * arrived through their personalized link, or for a signed-in Nizek admin.
 * Everyone else is sent to the Google sign-in page.
 */
export async function requireSiteAccess(href: string): Promise<InvestorContext | null> {
  const investor = await getInvestorContext();
  if (investor) return investor;

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    throw redirect({ to: "/login", search: { next: href } });
  }

  const { data: isAdmin } = await supabase.rpc("has_role", {
    _user_id: data.user.id,
    _role: "admin",
  });
  if (!isAdmin) {
    throw redirect({ to: "/login", search: { next: href } });
  }

  return null;
}
