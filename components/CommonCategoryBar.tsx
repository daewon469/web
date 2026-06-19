"use client";

import CategoryBarShell, { CategoryTabButton } from "@/components/CategoryBarShell";
import {
  COMMON_CATEGORY_TABS,
  type CommonCategoryTabId,
  commonCategoryRequiresLogin,
  getActiveCommonCategoryTab,
  resolveCommonCategoryHref,
} from "@/lib/categoryNav";
import { getSession } from "@/lib/session";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export default function CommonCategoryBar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const mapOpen =
    searchParams.get("openMap") === "1" || searchParams.get("openMap") === "true";
  const active = getActiveCommonCategoryTab(pathname, mapOpen);

  const onSelect = useCallback(
    async (id: CommonCategoryTabId) => {
      if (commonCategoryRequiresLogin(id)) {
        const session = getSession();
        if (!session.isLogin || !session.username) {
          alert("로그인이 필요합니다.");
          router.push("/login");
          return;
        }
      }

      const href = await resolveCommonCategoryHref(id);
      if (id === "home") {
        router.replace("/list");
        return;
      }
      router.push(href);
    },
    [router],
  );

  return (
    <CategoryBarShell>
      {COMMON_CATEGORY_TABS.map((tab) => (
        <CategoryTabButton
          key={tab.id}
          active={active === tab.id}
          label={tab.label}
          onClick={() => onSelect(tab.id)}
        />
      ))}
    </CategoryBarShell>
  );
}
