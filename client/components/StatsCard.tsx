import { Card, CardContent } from "./ui/card";

export default function StatsCard() {
  return (
    <Card className="w-full max-w-[330px] rounded-3xl border border-[#b9dfb9] bg-[#D6F0D6] shadow-none">
      <CardContent className="space-y-3 p-6">
        <p className="text-[46px] font-semibold leading-none tracking-tight text-[#111]">92%</p>
        <p className="text-sm leading-relaxed text-black/75">
          model accuracy across glioma, meningioma, pituitary, and no tumor classification.
        </p>
        <p className="text-xs uppercase tracking-[0.14em] text-black/60">Healthcare AI demo results</p>
      </CardContent>
    </Card>
  );
}
