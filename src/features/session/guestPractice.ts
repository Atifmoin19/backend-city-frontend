/**
 * Practice a visitor cleared before signing up, kept in this browser until they have an
 * account. Attempt tokens expire after 2 h on the server, so older entries are dropped.
 */
const KEY = "bc-guest-practice";
const MAX_AGE_MS = 2 * 60 * 60 * 1000;

export interface GuestWin {
  slug: string;
  token: string;
  at: number;
}

function read(): GuestWin[] {
  try {
    const list = JSON.parse(localStorage.getItem(KEY) ?? "[]") as GuestWin[];
    return list.filter((w) => Date.now() - w.at < MAX_AGE_MS);
  } catch {
    return [];
  }
}

function write(list: GuestWin[]) {
  try {
    if (list.length) localStorage.setItem(KEY, JSON.stringify(list));
    else localStorage.removeItem(KEY);
  } catch {
    // storage blocked: the win just isn't carried over
  }
}

export function keepGuestWin(slug: string, token: string) {
  write([...read().filter((w) => w.slug !== slug), { slug, token, at: Date.now() }]);
}

/** Everything still claimable; clears the store. */
export function takeGuestWins(): GuestWin[] {
  const list = read();
  write([]);
  return list;
}
