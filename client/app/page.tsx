import Footer from "../components/Footer";
import Hero from "../components/Hero";
import Navbar from "../components/Navbar";
import UploadMRI from "../components/UploadMRI";

export default function Page() {
  return (
    <main className="min-h-screen bg-[#F5F5F0] text-[#111]">
      <section className="flex h-screen flex-col overflow-hidden">
        <Navbar />
        <Hero />
      </section>

      <section
        id="about-model"
        className="mx-auto w-full max-w-[1360px] space-y-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8"
      >
        <div className="w-full rounded-3xl border border-black/10 bg-[#f8f8f6] p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-black/55">Model Snapshot</p>
          <h3 className="mt-2 text-3xl font-semibold text-[#111] sm:text-4xl">Built for fast MRI classification demos</h3>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-black/10 bg-white px-4 py-3">
              <p className="text-xs uppercase tracking-[0.12em] text-black/55">Input Size</p>
              <p className="mt-1 text-base font-semibold text-[#111]">128 x 128</p>
            </div>
            <div className="rounded-2xl border border-black/10 bg-white px-4 py-3">
              <p className="text-xs uppercase tracking-[0.12em] text-black/55">Classes</p>
              <p className="mt-1 text-base font-semibold text-[#111]">Glioma / Meningioma / Pituitary / No Tumor</p>
            </div>
            <div className="rounded-2xl border border-black/10 bg-white px-4 py-3">
              <p className="text-xs uppercase tracking-[0.12em] text-black/55">Inference</p>
              <p className="mt-1 text-base font-semibold text-[#111]">&lt; 1 second</p>
            </div>
          </div>
        </div>

        <div className="w-full rounded-3xl border border-black/10 bg-white p-6 sm:p-8">
          <h2 className="text-2xl font-semibold text-[#111]">About Model</h2>
          <p className="mt-3 w-full text-sm leading-relaxed text-black/70 sm:text-base">
            <span className="block">
              This healthcare AI demo accepts MRI scans, preprocesses images to 128x128, and predicts one of four
              classes: glioma, meningioma, pituitary, or no tumor.
            </span>
            <span className="block">
              It provides a fast confidence score for each prediction to help showcase deep-learning-based brain tumor
              screening workflows in a research-oriented setting.
            </span>
          </p>
        </div>
      </section>

      <UploadMRI />
      <Footer />
    </main>
  );
}
