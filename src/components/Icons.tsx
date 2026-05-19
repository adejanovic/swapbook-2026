const sw = 1.7;

interface P { s?: number }

export const Icons = {
  home:     ({ s = 22 }: P) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"><path d="M3 11.5L12 4l9 7.5M5.5 10.5V20h13v-9.5"/></svg>,
  book:     ({ s = 22 }: P) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"><path d="M4 4.5h7a3 3 0 013 3v13M20 4.5h-7a3 3 0 00-3 3v13M4 4.5v15h6M20 4.5v15h-6"/></svg>,
  copy:     ({ s = 22 }: P) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"><rect x="8" y="8" width="12" height="12" rx="2.5"/><path d="M16 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h2"/></svg>,
  people:   ({ s = 22 }: P) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="9" r="3.2"/><path d="M3.5 19c.5-3.4 3-5.2 5.5-5.2s5 1.8 5.5 5.2"/><circle cx="17" cy="7.5" r="2.5"/><path d="M15 13.4c2.5 0 5 1.8 5.5 5.2"/></svg>,
  user:     ({ s = 22 }: P) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="9" r="3.5"/><path d="M4.5 20c.7-3.7 3.6-5.7 7.5-5.7s6.8 2 7.5 5.7"/></svg>,
  search:   ({ s = 20 }: P) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/></svg>,
  share:    ({ s = 20 }: P) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"><path d="M12 15V4M12 4l-4 4M12 4l4 4M5 13v5a2 2 0 002 2h10a2 2 0 002-2v-5"/></svg>,
  chev:     ({ s = 18 }: P) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6"/></svg>,
  chevDown: ({ s = 18 }: P) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>,
  close:    ({ s = 20 }: P) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg>,
  plus:     ({ s = 18 }: P) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>,
  minus:    ({ s = 18 }: P) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/></svg>,
  check:    ({ s = 18 }: P) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw+0.2} strokeLinecap="round" strokeLinejoin="round"><path d="M4 12.5l5 5L20 6"/></svg>,
  trash:    ({ s = 18 }: P) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16M10 7V5a2 2 0 012-2h0a2 2 0 012 2v2M6 7l1 12a2 2 0 002 2h6a2 2 0 002-2l1-12"/></svg>,
  scan:     ({ s = 20 }: P) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"><path d="M4 8V6a2 2 0 012-2h2M20 8V6a2 2 0 00-2-2h-2M4 16v2a2 2 0 002 2h2M20 16v2a2 2 0 01-2 2h-2M8 12h8"/></svg>,
};
