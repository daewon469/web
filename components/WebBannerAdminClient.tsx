"use client";

import { UIConfig, resolveMediaUrl, type UIConfigBannerItem, type UIConfigResponse } from "@/lib/api";
import { uploadImageFile } from "@/lib/upload";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";

type BannerKey = "web_top_banner" | "web_banner";
type BannerSlot = UIConfigBannerItem | null;

const COLS_PER_ROW = 3;
const MIN_INTERVAL_ROWS = 1;
const MAX_INTERVAL_ROWS = 100;
const MIN_BANNER_ROWS = 1;
const MAX_BANNER_ROWS = 10;
const MIN_HEIGHT = 60;
const MAX_HEIGHT = 260;

function clampInteger(value: unknown, fallback: number, min: number, max: number) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Math.max(min, Math.min(max, Number.isFinite(parsed) ? parsed : fallback));
}

function createSlots(items: UIConfigBannerItem[], length: number): BannerSlot[] {
  const valid = items.filter((item) => String(item.image_url ?? "").trim()).slice(0, length);
  return Array.from({ length }, (_, index) => valid[index] ?? null);
}

export default function WebBannerAdminClient({
  bannerKey,
  title,
}: {
  bannerKey: BannerKey;
  title: string;
}) {
  const isTopBanner = bannerKey === "web_top_banner";
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [intervalRows, setIntervalRows] = useState("3");
  const [rowsPerInterval, setRowsPerInterval] = useState("3");
  const [height, setHeight] = useState("160");
  const [resizeMode, setResizeMode] =
    useState<NonNullable<UIConfigBannerItem["resize_mode"]>>("contain");
  const [slots, setSlots] = useState<BannerSlot[]>(() => createSlots([], isTopBanner ? 3 : 9));
  const [fullConfig, setFullConfig] = useState<UIConfigResponse["config"] | null>(null);

  const bannerRows = isTopBanner
    ? 1
    : clampInteger(rowsPerInterval, 3, MIN_BANNER_ROWS, MAX_BANNER_ROWS);
  const slotCount = bannerRows * COLS_PER_ROW;
  const filledCount = useMemo(() => slots.filter(Boolean).length, [slots]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await UIConfig.get();
      if (res.status !== 0) {
        alert("설정을 불러올 수 없습니다.");
        return;
      }
      setFullConfig(res.config);
      const section =
        bannerKey === "web_top_banner" ? res.config.web_top_banner : res.config.web_banner;
      const nextRows = isTopBanner
        ? 1
        : clampInteger(
            section?.rows_per_interval ?? section?.rotation_count,
            3,
            MIN_BANNER_ROWS,
            MAX_BANNER_ROWS,
          );
      const nextHeight = clampInteger(section?.height, 160, MIN_HEIGHT, MAX_HEIGHT);
      const nextResizeMode =
        section?.resize_mode === "cover" || section?.resize_mode === "stretch"
          ? section.resize_mode
          : "contain";

      setEnabled(section?.enabled !== false);
      setRowsPerInterval(String(nextRows));
      setIntervalRows(
        String(
          clampInteger(section?.interval_rows, 3, MIN_INTERVAL_ROWS, MAX_INTERVAL_ROWS),
        ),
      );
      setHeight(String(nextHeight));
      setResizeMode(nextResizeMode);
      setSlots(createSlots(section?.items ?? [], nextRows * COLS_PER_ROW));
    } finally {
      setLoading(false);
    }
  }, [bannerKey, isTopBanner]);

  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  const resizeSlots = (nextRows: number) => {
    const nextLength = nextRows * COLS_PER_ROW;
    setSlots((previous) =>
      Array.from({ length: nextLength }, (_, index) => previous[index] ?? null),
    );
  };

  const updateSlot = (index: number, patch: Partial<UIConfigBannerItem>) => {
    setSlots((previous) =>
      previous.map((slot, slotIndex) =>
        slotIndex === index && slot ? { ...slot, ...patch } : slot,
      ),
    );
  };

  const uploadSlot = async (index: number, file: File | null) => {
    if (!file) return;
    try {
      setSaving(true);
      const imageUrl = await uploadImageFile(file);
      const defaultHeight = clampInteger(height, 160, MIN_HEIGHT, MAX_HEIGHT);
      setSlots((previous) =>
        previous.map((slot, slotIndex) =>
          slotIndex === index
            ? {
                image_url: imageUrl,
                link_url: slot?.link_url ?? null,
                click_action: slot?.click_action ?? "link",
                height: slot?.height ?? defaultHeight,
                resize_mode: slot?.resize_mode ?? resizeMode,
              }
            : slot,
        ),
      );
    } catch {
      alert("이미지 업로드에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const onSave = async () => {
    if (!fullConfig) return;

    const nextRows = isTopBanner
      ? 1
      : clampInteger(rowsPerInterval, 3, MIN_BANNER_ROWS, MAX_BANNER_ROWS);
    const nextInterval = clampInteger(
      intervalRows,
      3,
      MIN_INTERVAL_ROWS,
      MAX_INTERVAL_ROWS,
    );
    const nextHeight = clampInteger(height, 160, MIN_HEIGHT, MAX_HEIGHT);
    const expectedSlots = nextRows * COLS_PER_ROW;
    const savedItems = slots
      .slice(0, expectedSlots)
      .filter((slot): slot is UIConfigBannerItem => Boolean(slot));

    if (enabled && savedItems.length > 0 && savedItems.length !== expectedSlots) {
      alert(
        isTopBanner
          ? "상단 배너는 3개 슬롯을 모두 채우거나 모두 비워 주세요."
          : `하단 배너는 ${nextRows}행 × 3열, 총 ${expectedSlots}개 슬롯을 모두 채우거나 모두 비워 주세요.`,
      );
      return;
    }

    setSaving(true);
    try {
      const next = { ...fullConfig };
      const base = {
        enabled,
        items: savedItems,
        cols_per_row: COLS_PER_ROW,
        height: nextHeight,
        resize_mode: resizeMode,
      };

      if (isTopBanner) {
        next.web_top_banner = {
          ...(next.web_top_banner ?? { items: [] }),
          ...base,
          rotation_count: 1,
          auto_play_ms: 0,
        };
      } else {
        next.web_banner = {
          ...(next.web_banner ?? { items: [] }),
          ...base,
          interval_rows: nextInterval,
          rows_per_interval: nextRows,
          rotation_count: nextRows,
        };
      }

      const res = await UIConfig.update(next);
      const savedSection =
        bannerKey === "web_top_banner" ? res.config.web_top_banner : res.config.web_banner;
      const savedRows = isTopBanner
        ? 1
        : clampInteger(savedSection?.rows_per_interval, 3, MIN_BANNER_ROWS, MAX_BANNER_ROWS);
      const savedCount = (savedSection?.items ?? []).filter((item) =>
        String(item.image_url ?? "").trim(),
      ).length;

      if (res.status !== 0 || savedRows !== nextRows || savedCount !== savedItems.length) {
        alert("저장 결과를 확인하지 못했습니다. 다시 시도해 주세요.");
        return;
      }

      alert("저장되었습니다.");
      await load();
    } catch {
      alert("저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-bold text-[#0B1B3A]">{title}</h1>
        <p className="mt-1 text-sm text-[#666]">
          {isTopBanner
            ? "S유형 카드와 1유형 카드 사이에 고정 1행 × 3열로 표시됩니다."
            : "1·2유형 카드행을 기준으로 n줄마다 m개의 3열 배너행을 반복 표시합니다."}
        </p>
      </div>

      {loading && <p className="py-8 text-center text-gray-500">불러오는 중...</p>}

      {!loading && (
        <>
          <section className="grid gap-3 rounded-xl border border-black bg-white p-4 sm:grid-cols-3">
            <label className="flex items-center gap-2 text-sm font-bold">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(event) => setEnabled(event.target.checked)}
              />
              배너 사용
            </label>

            {!isTopBanner && (
              <>
                <label className="flex flex-col gap-1 text-sm font-bold">
                  n줄마다
                  <input
                    type="number"
                    min={MIN_INTERVAL_ROWS}
                    max={MAX_INTERVAL_ROWS}
                    className="rounded-lg border border-black bg-[#f9f9f9] px-3 py-2"
                    value={intervalRows}
                    onChange={(event) => setIntervalRows(event.target.value)}
                    onBlur={() =>
                      setIntervalRows(
                        String(
                          clampInteger(
                            intervalRows,
                            3,
                            MIN_INTERVAL_ROWS,
                            MAX_INTERVAL_ROWS,
                          ),
                        ),
                      )
                    }
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm font-bold">
                  m개 배너행
                  <input
                    type="number"
                    min={MIN_BANNER_ROWS}
                    max={MAX_BANNER_ROWS}
                    className="rounded-lg border border-black bg-[#f9f9f9] px-3 py-2"
                    value={rowsPerInterval}
                    onChange={(event) => {
                      setRowsPerInterval(event.target.value);
                      const parsed = Number.parseInt(event.target.value, 10);
                      if (Number.isFinite(parsed) && parsed >= 1 && parsed <= 10) {
                        resizeSlots(parsed);
                      }
                    }}
                    onBlur={() => {
                      const nextRows = clampInteger(
                        rowsPerInterval,
                        3,
                        MIN_BANNER_ROWS,
                        MAX_BANNER_ROWS,
                      );
                      setRowsPerInterval(String(nextRows));
                      resizeSlots(nextRows);
                    }}
                  />
                </label>
              </>
            )}

            <label className="flex flex-col gap-1 text-sm font-bold">
              기본 높이(px)
              <input
                type="number"
                min={MIN_HEIGHT}
                max={MAX_HEIGHT}
                className="rounded-lg border border-black bg-[#f9f9f9] px-3 py-2"
                value={height}
                onChange={(event) => setHeight(event.target.value)}
                onBlur={() =>
                  setHeight(String(clampInteger(height, 160, MIN_HEIGHT, MAX_HEIGHT)))
                }
              />
            </label>

            <label className="flex flex-col gap-1 text-sm font-bold">
              기본 이미지 맞춤
              <select
                className="rounded-lg border border-black bg-[#f9f9f9] px-3 py-2"
                value={resizeMode}
                onChange={(event) =>
                  setResizeMode(event.target.value as typeof resizeMode)
                }
              >
                <option value="contain">원본 비율 유지</option>
                <option value="cover">영역 채우기</option>
                <option value="stretch">늘려서 채우기</option>
              </select>
            </label>
          </section>

          <div className="flex items-center justify-between text-sm">
            <strong>
              {isTopBanner ? "상단 1행" : `하단 ${bannerRows}행`} · {slotCount}개 슬롯
            </strong>
            <span className="text-[#666]">
              등록 {filledCount} / {slotCount}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            {slots.slice(0, slotCount).map((slot, index) => {
              const rowNo = Math.floor(index / COLS_PER_ROW) + 1;
              const colNo = (index % COLS_PER_ROW) + 1;
              const src = slot ? resolveMediaUrl(slot.image_url) : "";
              return (
                <section
                  key={`banner-slot-${index}`}
                  className="flex min-w-0 flex-col gap-2 rounded-xl border border-black bg-white p-3"
                >
                  <p className="text-xs font-bold text-[#4A6CF7]">
                    {rowNo}행 {colNo}열
                  </p>

                  <div className="flex h-32 items-center justify-center overflow-hidden rounded-lg bg-[#f2f2f2]">
                    {src ? (
                      <Image
                        src={src}
                        alt=""
                        width={480}
                        height={160}
                        className="h-full w-full object-contain"
                        unoptimized
                      />
                    ) : (
                      <span className="text-sm text-[#999]">빈 슬롯</span>
                    )}
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    disabled={saving}
                    className="w-full text-xs"
                    onChange={(event) => {
                      void uploadSlot(index, event.target.files?.[0] ?? null);
                      event.currentTarget.value = "";
                    }}
                  />

                  {slot && (
                    <>
                      <label className="flex flex-col gap-1 text-xs font-bold">
                        클릭 동작
                        <select
                          className="rounded-lg border px-2 py-2 text-sm"
                          value={slot.click_action === "referral_modal" ? "referral_modal" : "link"}
                          onChange={(event) =>
                            updateSlot(index, {
                              click_action: event.target.value as "link" | "referral_modal",
                            })
                          }
                        >
                          <option value="link">링크 열기</option>
                          <option value="referral_modal">추천 모달 열기</option>
                        </select>
                      </label>

                      {slot.click_action !== "referral_modal" && (
                        <input
                          className="w-full rounded-lg border px-3 py-2 text-sm"
                          placeholder="링크 URL (선택)"
                          value={slot.link_url ?? ""}
                          onChange={(event) =>
                            updateSlot(index, { link_url: event.target.value || null })
                          }
                        />
                      )}

                      <div className="grid grid-cols-2 gap-2">
                        <label className="flex flex-col gap-1 text-xs font-bold">
                          높이(px)
                          <input
                            type="number"
                            min={MIN_HEIGHT}
                            max={MAX_HEIGHT}
                            className="rounded-lg border px-2 py-2 text-sm"
                            value={slot.height ?? height}
                            onChange={(event) =>
                              updateSlot(index, {
                                height: clampInteger(
                                  event.target.value,
                                  160,
                                  MIN_HEIGHT,
                                  MAX_HEIGHT,
                                ),
                              })
                            }
                          />
                        </label>
                        <label className="flex flex-col gap-1 text-xs font-bold">
                          맞춤
                          <select
                            className="rounded-lg border px-2 py-2 text-sm"
                            value={slot.resize_mode ?? resizeMode}
                            onChange={(event) =>
                              updateSlot(index, {
                                resize_mode: event.target.value as typeof resizeMode,
                              })
                            }
                          >
                            <option value="contain">비율 유지</option>
                            <option value="cover">채우기</option>
                            <option value="stretch">늘리기</option>
                          </select>
                        </label>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setSlots((previous) =>
                            previous.map((item, slotIndex) =>
                              slotIndex === index ? null : item,
                            ),
                          )
                        }
                        className="self-start text-sm font-medium text-red-500"
                      >
                        슬롯 비우기
                      </button>
                    </>
                  )}
                </section>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => void onSave()}
            disabled={saving}
            className="rounded-xl bg-[#4A6CF7] py-3 font-bold text-white disabled:opacity-50"
          >
            {saving ? "저장 중..." : "저장"}
          </button>
        </>
      )}
    </div>
  );
}
