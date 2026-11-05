// 全站语言状态：zh / en，持久化到 localStorage，可用 ?lang=en 覆盖
const KEY = 'gd-lang';

function detect() {
  try {
    const q = new URLSearchParams(window.location.search).get('lang');
    if (q === 'zh' || q === 'en') return q;
    const saved = localStorage.getItem(KEY);
    if (saved === 'zh' || saved === 'en') return saved;
    return (navigator.language || 'zh').toLowerCase().startsWith('zh') ? 'zh' : 'en';
  } catch {
    return 'zh';
  }
}

let current = detect();
try { document.documentElement.lang = current === 'zh' ? 'zh-CN' : 'en'; } catch { /* ignore */ }
const subs = new Set();

export function getLang() { return current; }

export function setLang(l) {
  if (l !== 'zh' && l !== 'en') return;
  current = l;
  try { localStorage.setItem(KEY, l); } catch { /* ignore */ }
  document.documentElement.lang = l === 'zh' ? 'zh-CN' : 'en';
  subs.forEach((fn) => fn(l));
}

export function useLang(subscribe = null) {
  // 轻量订阅：组件自行 useState + useEffect 亦可
  return current;
}

export function subscribeLang(fn) {
  subs.add(fn);
  return () => subs.delete(fn);
}

export function tr(l, zh, en) { return l === 'en' ? en : zh; }
