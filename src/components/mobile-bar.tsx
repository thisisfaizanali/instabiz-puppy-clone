import { site } from "@/lib/site";

export function MobileBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-cocoa bg-milk px-3 pt-2.5 pb-[calc(0.6rem+env(safe-area-inset-bottom))] md:hidden">
      <div className="mx-auto flex max-w-md gap-2">
        <a
          href={site.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-whatsapp min-h-12! flex-1 shadow-none!"
        >
          WhatsApp us
        </a>
        <a href={site.phone.href} className="btn btn-ghost min-h-12! px-5!">
          Call
        </a>
      </div>
    </div>
  );
}
