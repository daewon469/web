"use client";

import CustomRegionMultiSelect from "@/components/CustomRegionMultiSelect";
import { Auth } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/authErrors";
import type { RegionObj } from "@/lib/regionUtils";
import { regionCodeToObj, regionObjToCode, uniq } from "@/lib/regionUtils";
import { getSession } from "@/lib/session";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function AreaSitePage() {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedRegions, setSelectedRegions] = useState<RegionObj[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const session = getSession();
    if (!session.isLogin || !session.username) {
      router.replace("/login");
      return;
    }
    setUsername(session.username);
    try {
      const res = await Auth.getUser(session.username);
      const codes = res.user?.area_region_codes ?? [];
      const parsed = codes
        .map((x) => regionCodeToObj(String(x)))
        .filter(Boolean) as RegionObj[];
      setSelectedRegions(parsed);
    } catch {
      setSelectedRegions([]);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  const onApply = async (regions: RegionObj[]) => {
    if (!username) return;
    setSaving(true);
    setError(null);
    try {
      const codes = uniq(regions.map(regionObjToCode).map((s) => s.trim()).filter(Boolean));
      await Auth.updateUser(username, { area_region_codes: codes });
      router.replace("/arealike");
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, "저장에 실패했습니다."));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="py-12 text-center text-gray-500">불러오는 중...</p>;
  }

  return (
    <div>
      {error && (
        <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}
      <CustomRegionMultiSelect
        selectedRegions={selectedRegions}
        onApply={onApply}
        loading={saving}
        onClose={() => router.back()}
      />
    </div>
  );
}
