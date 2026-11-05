// 整站语言应用层（防闪烁版）
// 规则：
//  · 短标签对（「关于我 / About Me」）→ 互换权重：当前语言做主文本，另一种做小字
//  · 长段落对（详细说明）→ 单语言：只显示当前语言
//  · 纯中文短文案 → 词典；中英混排小标题只留英文段；逐字标题整块替换
// 关键：apply 期间屏蔽 MutationObserver，每个元素只处理一次，
//      避免 innerHTML 反复重写触发观察器 → 无限循环 → 屏闪
import { getLang, subscribeLang } from './lang.js';

const hasZh = (s) => /[\u4e00-\u9fa5]/.test(s || '');
const hasLatin = (s) => /[A-Za-z]{2,}/.test(s || '');
const isDetail = (s) => {
  const t = (s || '').trim();
  return t.length >= 34 || (/[.。!！?？]$/.test(t) && t.length >= 22);
};

const DICT = {
  '精选': 'Selected',
  '作品': 'Works',
  '全部作品': 'All projects',
  '返回全部作品': 'Back to all projects',
  '返回作品总览': 'Back to all projects',
  '快速导航': 'Quick links',
  '联系方式': 'Contact',
  '下载简历': 'Download CV',
  '查看作品': 'View works',
  '查看全部作品': 'View all works',
  '有想法？': 'Have an idea?',
  '试验图示': 'Test setup',
  '声音作品': 'Sound piece',
  '交互演示': 'Interactive demo',
  '项目影片': 'Project film',
  '页面加载失败': 'Page failed to load',
  '请刷新页面；如果问题持续，请重启开发服务器。': 'Please refresh. If the problem persists, restart the dev server.',
  '三维试验室加载中 / LOADING 3D TESTBED…': 'Loading 3D testbed…',
  '演示地址：localhost:1952/menu.html · 请确保本地演示服务正在运行': 'Demo at localhost:1952/menu.html — make sure the local demo server is running',
  '演示地址：localhost:1952/menu.html / 请确保本地演示服务正在运行': 'Demo at localhost:1952/menu.html — make sure the local demo server is running',
  '科研工程': 'Research',
  '交互体验': 'Interactive',
  '游戏世界': 'Game worlds',
  '视听创作': 'Audiovisual',
  '创意技术': 'Creative tech',
  '研究': 'Research',
  '项目': 'Project',
  '项目介绍': 'Project',
  '关于我': 'About',
  '服务': 'Services',
  '联系': 'Contact',
  '三维试验室': '3D testbed',
  '首页': 'Home',
  '搜索': 'Search',
  '滚动翻转': 'Scroll to flip',
  '向下探索': 'Scroll to explore',
  '跨媒体创作': 'Cross-media practice',
  '交互设计师': 'Interaction designer',
  '武汉 / 中国': 'Wuhan / China',
  '武汉，中国': 'Wuhan, China',
  'UCL / 伦敦   约克 / UK': 'UCL / London · York / UK',
  '我的方法': 'My approach',
  '精选作品': 'Selected works',
  '精选思考': 'Notes',
  '让不可见变得可触': 'Making the invisible tangible',
  '研究也是一种材料': 'Research is a material',
  '基地：武汉': 'Based in Wuhan',
  '联系我': 'Get in touch',
  '保持好奇，持续创作。': 'Stay curious, keep making.',
  '伦敦': 'London',
  '和约克是我重要的背景，现在我正在中国制作下一阶段的作品。': 'London and York shaped my background; I am now making the next body of work in China.',
  '作品经常从难以被握住的东西开始：一种氛围、一段记忆、一个系统，或者一种感觉。': 'Work often begins with something hard to hold: an atmosphere, a memory, a system, or a feeling.',
  '参考、对话和观察帮助我在确定视觉之前，先找到项目的质感。': 'References, conversation and observation help me find the texture of a project before fixing its visuals.',
  '让创作保持流动与好奇，让不可见之物逐渐成为可以被感知的体验。': 'Keep the work fluid and curious, until the invisible becomes something you can feel.',
  '有项目或想法？': 'Have a project or an idea?',
  '新能源博士研究 / 交互设计 / 创意技术。': 'PhD research / interaction design / creative technology.',
  '研究压缩空气储能地下储气库，创造可以被人们感受的故事、世界和系统。': 'Researching underground gas storage for CAES, and creating stories, worlds and systems people can feel.',
  '交互设计师 / 创意技术工作者。': 'Interaction designer / creative technologist.',
  '创造可以被人感受的故事、世界和系统。': 'Creating stories, worlds and systems people can feel.',
  '试验平台与方案图示，展示研究的实际设计与试验内容。': 'Test platform and scheme drawings from the actual design work.',
  '影片自动循环播放，声音与进度通过播放器控制。': 'The film loops automatically; sound and progress are controlled by the player.',
  'UCL / 伦敦 / 约克 / 武汉': 'UCL / London / York / Wuhan',
  '三维试验台模型 / 3D TESTBED →': '3D testbed model →',
  '/ 跨媒体创作': '/ Cross-media practice',
  '/ 作品': '/ Work',
  '/ 我的方法': '/ My approach',
  '/ 精选作品': '/ Selected works',
  '/ 精选思考': '/ Notes',
  '/ 快速导航': '/ Quick links',
  '/ 联系方式': '/ Contact',
  '物理模型试验': 'Physical model test',
  '密封与防渗': 'Sealing and anti-seepage',
  '监测与评价': 'Monitoring and assessment',
  '网页体验': 'Web experience',
  '博物馆交互': 'Museum interaction',
  '空间叙事': 'Spatial narratives',
  '可玩环境': 'Playable environments',
  '世界构建': 'World building',
  '叙事系统': 'Narrative systems',
  '动态影像': 'Motion design',
  '声音与动画': 'Sound and animation',
  '艺术指导': 'Art direction',
  '创意编程': 'Creative coding',
  '研究与原型': 'Research and prototyping',
  '交互设计': 'Interaction design',
  '科研工程 / 物理模型试验': 'Research engineering / physical model test',
  '科研工程 / 可靠性评价': 'Research engineering / reliability assessment',
  '科研工程 / 试验方案与平台设计': 'Research engineering / test plan and platform design',
  '项目总负责人 / 试验设计': 'Project lead / test design',
  '项目总负责人': 'Project lead',
  '技术骨干': 'Technical lead',
  '试验方案编制 / 平台结构设计': 'Test plan / platform structure design',
  '这里按科研工程、交互体验、游戏世界、视听创作和创意技术编排作品，从我当前的博士科研工作开始，全面了解我的实践。': 'Projects are grouped by research engineering, interactive experience, game worlds, audiovisual work and creative technology — starting from my current PhD research.',
};

const HEAD_EN = {
  '新能源博士研究/交互设计/创意技术': 'PhD research / interaction design / creative technology',
  '常驻武汉/中国': 'Based in Wuhan, China',
};

/* ---------- 成对块 ---------- */
const touched = new Set();

function processPairs(el) {
  const smalls = [...el.querySelectorAll('small')];
  for (const sm of smalls) {
    const br = sm.previousSibling;
    const textNode = br && br.nodeName === 'BR' ? br.previousSibling : br;
    if (!textNode || textNode.nodeType !== 3) continue;
    const zh = textNode.nodeValue.trim();
    const en = sm.textContent.trim();
    if (!hasZh(zh) || !hasLatin(en)) continue;

    if (isDetail(en)) {
      // 详细说明：只保留英文，提为主文本
      if (br && br.nodeName === 'BR') br.remove();
      const text = document.createTextNode(en);
      const parent = sm.parentNode;
      parent.replaceChild(text, sm);
      textNode.nodeValue = '';
      if (!textNode.nodeValue.trim()) textNode.remove();
    } else {
      // 短标签：互换权重
      textNode.nodeValue = textNode.nodeValue.replace(zh, en);
      sm.textContent = zh;
      sm.setAttribute('data-lang-secondary', '1');
    }
  }
}

function translatePairs(root, toEn) {
  if (toEn) {
    root.querySelectorAll('div,span,p,h1,h2,h3,h4,a,small,strong,em,li').forEach((el) => {
      if (el.dataset && el.dataset.langDone === '1') return;
      if (!el.querySelector('small')) return;
      if (!el.__origHtml) el.__origHtml = el.innerHTML;
      processPairs(el);
      if (el.dataset) el.dataset.langDone = '1';
      touched.add(el);
    });
  } else {
    for (const el of touched) {
      if (el.__origHtml != null) el.innerHTML = el.__origHtml;
      delete el.__origHtml;
      if (el.dataset) delete el.dataset.langDone;
    }
    touched.clear();
  }
}

/* ---------- 词典（文本节点） ---------- */
function translateDict(root, toEn) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  let n;
  while ((n = walker.nextNode())) nodes.push(n);
  for (const node of nodes) {
    if (node.parentElement && node.parentElement.closest('[data-no-i18n]')) continue; // 设计元素（如首屏轮播词对）不翻译
    if (node.parentElement && node.parentElement.closest('small[data-lang-secondary="1"]')) continue;
    const raw = node.nodeValue;
    const t = (raw || '').trim();
    if (!t) continue;
    if (toEn) {
      if (node.__translated) continue;
      const en = DICT[t];
      if (!en) continue;
      const scope = (node.parentElement && node.parentElement.textContent) || '';
      const norm = (x) => x.replace(/\s+/g, '').toLowerCase();
      if (norm(scope).includes(norm(en))) continue; // 已有该英文，避免重复
      node.__orig = raw;
      node.__translated = true;
      node.nodeValue = raw.replace(t, en);
    } else if (node.__orig) {
      node.nodeValue = node.__orig;
      delete node.__orig;
      delete node.__translated;
    }
  }
}

/* ---------- 中英混排标签：只保留英文段 ---------- */
function stripMixedCjk(root, toEn) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  let n;
  while ((n = walker.nextNode())) nodes.push(n);
  for (const node of nodes) {
    if (node.__stripDone || node.__translated) continue;
    if (node.parentElement && node.parentElement.closest('[data-no-i18n]')) continue;
    const raw = node.nodeValue || '';
    if (!raw.includes(' / ') || !hasZh(raw)) continue;
    if (node.parentElement && node.parentElement.closest('small[data-lang-secondary="1"]')) continue;
    const parts = raw.split('/').map((x) => x.trim()).filter(Boolean);
    const latin = parts.filter((x) => !hasZh(x));
    if (!latin.some((x) => hasLatin(x))) continue;
    if (toEn) {
      node.__orig = raw;
      node.__stripDone = true;
      node.nodeValue = latin.join(' / ');
    } else if (node.__stripDone) {
      node.nodeValue = node.__orig;
      delete node.__orig;
      delete node.__stripDone;
    }
  }
}

/* ---------- 标题旁的全大写英文：隐藏中文段 ---------- */
function dropZhBesideUppercase(root, toEn) {
  if (!toEn) return;
  root.querySelectorAll('h1,h2,h3,h4,div,span').forEach((el) => {
    if (el.__zhDropped) return;
    if (el.children.length === 0 || el.children.length > 4) return;
    const caps = [...el.children].find((c) => {
      const t = (c.textContent || '').trim();
      return t.length >= 3 && /^[A-Z0-9\s&·'’.\-]+$/.test(t) && /[A-Z]{2,}/.test(t);
    });
    if (!caps) return;
    const zhNodes = [...el.childNodes].filter((x) => x.nodeType === 3 && hasZh(x.nodeValue));
    if (!zhNodes.length) return;
    el.__zhStash = zhNodes.map((x) => [x, x.nodeValue]);
    zhNodes.forEach((x) => { x.nodeValue = ''; });
    el.__zhDropped = true;
  });
}
function restoreDropped(root) {
  root.querySelectorAll('h1,h2,h3,h4,div,span').forEach((el) => {
    if (!el.__zhDropped) return;
    (el.__zhStash || []).forEach(([node, val]) => { node.nodeValue = val; });
    delete el.__zhStash;
    delete el.__zhDropped;
  });
}

/* ---------- 逐字标题 ---------- */
function translateHeads(root, toEn) {
  if (!toEn) return;
  root.querySelectorAll('[class*="rb-blur"], [class*="rb-split"]').forEach((el) => {
    if (el.__headDone) return;
    const key = (el.textContent || '').replace(/[\s\u00a0]/g, '').trim();
    const en = HEAD_EN[key];
    if (!en) return;
    const scope = (el.parentElement && el.parentElement.textContent) || '';
    if (scope.replace(/\s+/g, '').toLowerCase().includes(en.replace(/\s+/g, '').toLowerCase())) return;
    el.__origHtml = el.innerHTML;
    el.textContent = en;
    el.__headDone = true;
  });
}
function restoreHeads(root) {
  root.querySelectorAll('[class*="rb-blur"], [class*="rb-split"]').forEach((el) => {
    if (!el.__headDone) return;
    if (el.__origHtml != null) el.innerHTML = el.__origHtml;
    delete el.__origHtml;
    delete el.__headDone;
  });
}

/* ---------- 属性 ---------- */
const ATTRS = ['title', 'aria-label', 'placeholder'];
function translateAttrs(root, toEn) {
  root.querySelectorAll('*').forEach((el) => {
    for (const a of ATTRS) {
      const v = el.getAttribute(a);
      if (!v) continue;
      const key = 'data-en-' + a;
      if (toEn) {
        if (el.hasAttribute(key)) continue;
        const en = DICT[v.trim()];
        if (en) { el.setAttribute(key, v); el.setAttribute(a, en); }
      } else if (el.hasAttribute(key)) {
        el.setAttribute(a, el.getAttribute(key));
        el.removeAttribute(key);
      }
    }
  });
}

/* ---------- 应用（带防循环） ---------- */
let applying = false;
let mo = null;
let scheduled = 0;
let lastLang = null;

function run(lang) {
  const toEn = lang === 'en';
  if (toEn) {
    translatePairs(document.body, true);
    translateHeads(document.body, true);
    dropZhBesideUppercase(document.body, true);
    translateAttrs(document.body, true);
    translateDict(document.body, true);
    stripMixedCjk(document.body, true);
  } else {
    translatePairs(document.body, false);
    restoreHeads(document.body);
    restoreDropped(document.body);
    translateAttrs(document.body, false);
    translateDict(document.body, false);
    stripMixedCjk(document.body, false);
  }
}

function applyAll(lang) {
  if (applying || lang === lastLang) return;
  applying = true;
  if (mo) mo.takeRecords();
  try {
    run(lang);
    lastLang = lang;
  } finally {
    if (mo) mo.takeRecords();
    applying = false;
  }
}

function scheduleApply() {
  if (scheduled || applying) return;
  scheduled = setTimeout(() => {
    scheduled = 0;
    if (getLang() !== 'en' || applying) return;
    applying = true;
    if (mo) mo.takeRecords();
    try { run('en'); } finally {
      if (mo) mo.takeRecords();
      applying = false;
    }
  }, 160);
}

// 同步应用（在 React layout effect 中调用，避免切换瞬间闪出未翻译内容）
export function translateNow(lang) {
  if (applying) return;
  applying = true;
  if (mo) mo.takeRecords();
  try { run(lang); lastLang = lang; } finally {
    if (mo) mo.takeRecords();
    applying = false;
  }
}

export function initAutoTranslate() {
  applyAll(getLang());
  // 语言切换通过页面重载完成，这里无需订阅 */

  mo = new MutationObserver((records) => {
    if (applying) return;
    if (getLang() !== 'en') return;
    // 仅当真正新增了需要翻译的节点才处理，忽略自身写入
    const relevant = records.some((r) =>
      r.addedNodes && [...r.addedNodes].some((n) =>
        n.nodeType === 1 && ((n.querySelector && n.querySelector('small')) || hasZh(n.textContent || ''))
      )
    );
    if (relevant) scheduleApply();
  });
  mo.observe(document.body, { childList: true, subtree: true });
}
