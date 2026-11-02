"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
export function Sheet({
  open,
  onOpenChange,
  title,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/50" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white p-6 md:w-[580px]"
        >
          <div className="mb-8 flex items-center justify-between gap-4 border-b border-ink/10 pb-6">
            <Dialog.Title className="flex items-center gap-3 text-2xl font-bold tracking-tight">
              <span aria-hidden="true" className="h-0.5 w-6 bg-brand-orange" />
              {title}
            </Dialog.Title>
            <Dialog.Close
              className="flex size-11 items-center justify-center rounded-xs border border-ink/15 transition-colors hover:border-brand-blue hover:text-brand-blue"
              aria-label="Close"
            >
              <X size={20} />
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
