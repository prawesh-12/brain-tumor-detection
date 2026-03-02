import { Button } from "./ui/button";

export default function Navbar() {
  return (
    <header className="border-b border-black/10 bg-[#f5f5f0]">
      <nav className="mx-auto flex h-20 w-full max-w-[1360px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <a
            href="#home"
            className="rounded-full border border-black bg-[#111] px-4 py-2 text-[13px] font-medium uppercase tracking-[0.12em] text-white hover:bg-black/85"
          >
            Home
          </a>
        </div>

        <Button
          variant="ghost"
          className="rounded-full border border-black !bg-[#111] px-6 text-sm font-medium !text-white hover:!bg-black/85 hover:!text-white"
        >
          Sign In
        </Button>
      </nav>
    </header>
  );
}
