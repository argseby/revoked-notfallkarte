// The step that leaves this page: a revoked:// link the installed app opens.
// One dialog for the whole tool stays behind it, for a computer without the
// app, where the phone takes over by QR code.
export interface Handoff {
  title: string;
  body: string;
  link: string;
  // Shown for the owner to compare with the one revoked shows, when this page
  // collects the answer itself.
  code?: string;
}

class HandoffState {
  current = $state<Handoff | null>(null);
  #waiting: AbortController | null = null;

  // wait runs while the dialog is open — a page watching its server for the
  // answer — and is told when it closes.
  open(h: Handoff, wait?: (signal: AbortSignal) => Promise<void>) {
    this.close();
    this.current = h;
    if (wait) {
      this.#waiting = new AbortController();
      void wait(this.#waiting.signal);
    }
    window.location.href = h.link;
  }

  close() {
    this.#waiting?.abort();
    this.#waiting = null;
    this.current = null;
  }
}

export const handoff = new HandoffState();
