export default function ComingSoonPage({ title }: { title: string }) {
  return (
    <div className="rounded-xl bg-white p-8 text-center shadow-sm">
      <h1 className="text-xl font-bold text-[#0B1B3A]">{title}</h1>
      <p className="mt-3 text-gray-500">웹 버전에서 준비 중입니다.</p>
    </div>
  );
}
