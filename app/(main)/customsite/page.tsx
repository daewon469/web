"use client";

import TableGrid from "@/components/TableGrid";
import { Auth } from "@/lib/api";
import {
  INDUSTRY_OPTIONS,
  REGION_OPTIONS,
  ROLE_OPTIONS,
} from "@/lib/customSiteOptions";
import { getApiErrorMessage } from "@/lib/authErrors";
import type { RegionObj } from "@/lib/regionUtils";
import { regionCodeToObj, regionObjToCode, uniq } from "@/lib/regionUtils";
import { getSession } from "@/lib/session";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function CustomSitePage() {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [industries, setIndustries] = useState<string[]>([]);
  const [regions, setRegions] = useState<RegionObj[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const session = getSession();
    if (!session.isLogin || !session.username) {
      router.replace("/login");
      return;
    }
    setUsername(session.username);

    (async () => {
      try {
        const res = await Auth.getUser(session.username!);
        if (res.status !== 0 || !res.user) return;
        setIndustries(
          uniq((res.user.custom_industry_codes || []).map((s) => s.trim()).filter(Boolean)),
        );
        const parsed = (res.user.custom_region_codes || [])
          .map((s) => regionCodeToObj(String(s)))
          .filter(Boolean) as RegionObj[];
        const normalized = parsed.map((r) => {
          const p = (r.province || "").trim();
          if (!p) return r;
          if (p === "전체") return { province: "전체", city: "전체" };
          return { province: p, city: "전체" };
        });
        setRegions(
          Array.from(new Map(normalized.map((r) => [`${r.province}__${r.city}`, r])).values()),
        );
        setRoles(
          uniq((res.user.custom_role_codes || []).map((s) => String(s).trim()).filter(Boolean)),
        );
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  const hasNationwide = useMemo(
    () => regions.some((r) => (r.province || "").trim() === "전체"),
    [regions],
  );

  const selectedProvinces = useMemo(
    () =>
      uniq(
        regions
          .filter((r) => r.province && r.province !== "전체")
          .map((r) => r.province),
      ),
    [regions],
  );

  const toggleRegion = (label: (typeof REGION_OPTIONS)[number]) => {
    if (label === "전국") {
      setRegions((prev) =>
        prev.some((r) => r.province === "전체") ? [] : [{ province: "전체", city: "전체" }],
      );
      return;
    }
    setRegions((prev) => {
      const withoutAll = prev.filter((r) => r.province !== "전체");
      const exists = withoutAll.some((r) => r.province === label);
      const next = exists
        ? withoutAll.filter((r) => r.province !== label)
        : [...withoutAll, { province: label, city: "전체" }];
      return Array.from(new Map(next.map((r) => [`${r.province}__${r.city}`, r])).values());
    });
  };

  const save = async () => {
    if (!username) return;
    setSaving(true);
    setError(null);
    const regionCodes = uniq(regions.map(regionObjToCode).filter(Boolean));
    try {
      await Auth.updateUser(username, {
        custom_industry_codes: industries,
        custom_region_codes: regionCodes,
        custom_role_codes: roles,
      });
      router.replace("/customlike");
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
    <div className="rounded-2xl border border-black bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black">맞춤저장 설정</h1>
          <span className="text-[11px] font-semibold text-gray-400">(복수선택 가능)</span>
        </div>
        <button type="button" onClick={() => router.back()} className="text-sm font-bold text-gray-600">
          닫기
        </button>
      </div>

      <p className="mt-2 text-[15px] font-black">지역</p>
      <TableGrid
        items={REGION_OPTIONS}
        columns={6}
        isActive={(v) => (v === "전국" ? hasNationwide : selectedProvinces.includes(v))}
        onToggle={toggleRegion}
      />

      <p className="mt-4 text-[15px] font-black">업종</p>
      <TableGrid
        items={INDUSTRY_OPTIONS}
        columns={3}
        isActive={(v) => industries.includes(v)}
        onToggle={(v) =>
          setIndustries((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]))
        }
      />

      <p className="mt-4 text-[15px] font-black">모집</p>
      <div className="mt-3 overflow-hidden rounded-xl border border-black">
        <div className="flex">
          {ROLE_OPTIONS.map((r, idx) => {
            const active = roles.includes(r);
            return (
              <button
                key={r}
                type="button"
                onClick={() =>
                  setRoles((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]))
                }
                className={`flex-1 py-3 font-black ${
                  idx < ROLE_OPTIONS.length - 1 ? "border-r border-black" : ""
                } ${active ? "bg-[#4A6CF7] text-white" : "bg-white text-black"}`}
              >
                {r}
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => {
            setIndustries([]);
            setRegions([]);
            setRoles([]);
          }}
          disabled={saving}
          className="flex-1 rounded-xl border border-gray-300 py-3 font-black disabled:opacity-60"
        >
          초기화
        </button>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="flex-1 rounded-xl bg-[#4A6CF7] py-3 font-black text-white disabled:opacity-60"
        >
          {saving ? "저장 중..." : "저장"}
        </button>
      </div>
    </div>
  );
}
