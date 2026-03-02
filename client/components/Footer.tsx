export default function Footer() {
  return (
    <footer id="docs" className="border-t border-black/10 bg-[#f5f5f0]">
      <div className="mx-auto grid w-full max-w-[1360px] gap-3 px-4 py-8 text-xs uppercase tracking-[0.12em] text-black/60 sm:px-6 lg:grid-cols-3 lg:px-8">
        <p className="text-left">BrainShield AI - Deep learning MRI tumor classification demo.</p>
        <a href="#" className="text-left font-medium text-[#111] underline-offset-4 hover:underline lg:text-center">
          GitHub Repository
        </a>
        <p className="text-left lg:text-right">Not for clinical use.</p>
      </div>
    </footer>
  );
}
