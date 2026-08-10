import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './majd-theme.css';
import './reactbits-effects.css';
import { SplitText, BlurText, ShinyText, GradientText, PressureWord, WordReveal, TiltedCard, GlareHover, Magnet, ScrollProgress, Noise, ClickSpark, CustomCursor, TrailCursor } from './reactbits-effects.jsx';

const name = '&#20294;&#20809;&#27901;';

const projects = [
  { slug: 'animating-the-invisible', n: '01', title: 'Animating the Invisible', titleCn: '\u8ba9\u4e0d\u53ef\u89c1\u53ef\u89c1', type: '\u7855\u58eb\u6bd5\u4e1a\u9879\u76ee / \u89c6\u542c\u4f5c\u54c1', text: '\u4ee5\u7814\u7a76\u4e3a\u57fa\u7840\u7684\u52a8\u6001\u5f71\u50cf\u4f5c\u54c1\uff0c\u8ba9\u9690\u85cf\u7684\u529b\u91cf\u548c\u611f\u53d7\u53d8\u5f97\u53ef\u611f\u77e5\u3002', tone: 'project-dark', mark: 'AI', year: '2025', role: '\u7814\u7a76 / \u52a8\u6001\u5f71\u50cf / \u58f0\u97f3', intro: '\u300a\u8ba9\u4e0d\u53ef\u89c1\u53ef\u89c1\u300b\u601d\u8003\u5982\u4f55\u901a\u8fc7\u89c6\u542c\u4f53\u9a8c\uff0c\u8ba9\u90a3\u4e9b\u901a\u5e38\u53ea\u80fd\u88ab\u611f\u53d7\u3001\u5374\u65e0\u6cd5\u88ab\u770b\u89c1\u7684\u529b\u91cf\u83b7\u5f97\u5f62\u5f0f\u3002', detail: '\u8fd9\u662f\u6211\u7684\u7855\u58eb\u6bd5\u4e1a\u9879\u76ee\uff0c\u7ed3\u5408\u89c2\u5bdf\u3001\u52a8\u753b\u3001\u58f0\u97f3\u548c\u521b\u610f\u7f16\u7a0b\uff0c\u5c06\u4e0d\u53ef\u89c1\u7684\u7cfb\u7edf\u8f6c\u5316\u4e3a\u4e00\u6bb5\u53ef\u611f\u77e5\u7684\u6c14\u6c1b\u65c5\u7a0b\u3002' },
  { slug: 'wish', n: '02', title: 'WISH', titleCn: '\u613f\u671b', type: '\u6e38\u620f / \u4e16\u754c\u6784\u5efa', text: '\u4e00\u4e2a\u7531\u6c14\u6c1b\u3001\u89d2\u8272\u548c\u73af\u5883\u53d9\u4e8b\u5171\u540c\u5851\u9020\u7684\u53ef\u73a9\u4e16\u754c\u3002', tone: 'project-acid', mark: 'W', year: '2024', role: '\u6e38\u620f\u8bbe\u8ba1 / \u4e16\u754c\u6784\u5efa / \u4ea4\u4e92', intro: '\u300a\u613f\u671b\u300b\u662f\u4e00\u4e2a\u5173\u4e8e\u79fb\u52a8\u3001\u76f8\u9047\u548c\u7ec6\u5c0f\u9009\u62e9\u7684\u6e38\u620f\u4e16\u754c\u3002', detail: '\u6211\u5c06\u89c6\u89c9\u8bed\u8a00\u3001\u73af\u5883\u903b\u8f91\u548c\u4ea4\u4e92\u8282\u594f\u53d1\u5c55\u4e3a\u4e00\u4e2a\u8fde\u8d2f\u7684\u7cfb\u7edf\uff0c\u8ba9\u89c2\u4f17\u901a\u8fc7\u6e38\u73a9\u81ea\u5df1\u53d1\u73b0\u6545\u4e8b\u3002' },
  { slug: 'project', n: '03', title: 'Project', titleCn: '\u4ea4\u4e92\u5b9e\u9a8c', type: '\u4ea4\u4e92\u7f51\u9875 / \u521b\u610f\u4ee3\u7801', text: '\u4e00\u4e2a\u8ba9\u4fe1\u606f\u53d8\u6210\u53ef\u4ee5\u63a2\u7d22\u7684\u5b9e\u9a8c\u6027\u6570\u5b57\u7a7a\u95f4\u3002', tone: 'project-blue', mark: 'P', year: '2024', role: '\u4ea4\u4e92 / \u7f51\u9875\u8bbe\u8ba1 / \u521b\u610f\u7f16\u7a0b', intro: '\u300a\u4ea4\u4e92\u5b9e\u9a8c\u300b\u5c06\u590d\u6742\u7684\u4fe1\u606f\u8f6c\u5316\u4e3a\u4e00\u4e2a\u53ef\u4ee5\u88ab\u6f2b\u6e38\u3001\u88ab\u6ce8\u610f\u548c\u88ab\u7406\u89e3\u7684\u7a7a\u95f4\u3002', detail: '\u9879\u76ee\u901a\u8fc7\u54cd\u5e94\u5f0f\u5e03\u5c40\u3001\u52a8\u6548\u548c\u89c6\u89c9\u5c42\u7ea7\u8fdb\u884c\u5b9e\u9a8c\uff0c\u4fdd\u6301\u514b\u5236\u7684\u754c\u9762\uff0c\u8ba9\u5185\u5bb9\u59cb\u7ec8\u5904\u4e8e\u4e2d\u5fc3\u3002' },
  { slug: 'sanhe-drifters', n: '04', title: 'Sanhe Drifters', titleCn: '\u4e09\u6cb3\u6f02\u6d41\u8005', type: '\u52a8\u6001\u5f71\u50cf / \u58f0\u97f3', text: '\u5173\u4e8e\u5730\u65b9\u3001\u8bb0\u5fc6\u548c\u65e5\u5e38\u79fb\u52a8\u7684\u89c6\u542c\u7814\u7a76\u3002', tone: 'project-pink', mark: 'SD', year: '2024', role: '\u5f71\u50cf / \u58f0\u97f3 / \u526a\u8f91', intro: '\u300a\u4e09\u6cb3\u6f02\u6d41\u8005\u300b\u662f\u4e00\u6b21\u5173\u4e8e\u65e5\u5e38\u79fb\u52a8\u3001\u8ddd\u79bb\u548c\u5904\u4e8e\u4e24\u5730\u4e4b\u95f4\u611f\u53d7\u7684\u52a8\u6001\u5f71\u50cf\u7814\u7a76\u3002', detail: '\u4f5c\u54c1\u4f7f\u7528\u7247\u6bb5\u3001\u8282\u594f\u548c\u73af\u5883\u58f0\u97f3\uff0c\u800c\u4e0d\u662f\u56fa\u5b9a\u7684\u6545\u4e8b\u7ebf\uff0c\u8ba9\u5730\u65b9\u611f\u5728\u89c2\u5bdf\u4e2d\u6162\u6162\u5efa\u7acb\u3002' }
];

const makeArchiveProject = (slug, n, title, titleCn, type, text, mark, tone) => ({ slug, n, title, titleCn, type, text, mark, tone, year: '2024', role: type, intro: text, detail: text });
projects.push(
  makeArchiveProject('ds-final', '05', 'DS Final', '\u58f0\u97f3\u8bbe\u8ba1', '\u58f0\u97f3\u8bbe\u8ba1 / \u97f3\u9891\u6848\u4f8b', '\u6211\u7684\u58f0\u97f3\u8bbe\u8ba1\u6848\u4f8b\u3002', 'DS', 'project-dark'),
  makeArchiveProject('the-most-of-us', '06', 'The Most of Us', '\u5927\u591a\u6570', '\u4ea4\u4e92\u6545\u4e8b / Twine', '\u4e00\u4e2a\u57fa\u4e8e Twine \u5236\u4f5c\u7684\u4ea4\u4e92\u6545\u4e8b\u3002', 'TW', 'project-acid'),
  makeArchiveProject('guangze-project-demo', '07', 'GuangzeDan Project Demo', '\u7ea6\u514b\u90e1 BIM \u5b9e\u666f\u52a8\u753b\u5c55\u793a\u7cfb\u7edf', '\u865a\u5b9e\u5f15\u64ce / BIM / \u52a8\u753b', '\u57fa\u4e8e\u7ea6\u514b\u90e1\u5236\u4f5c\u7684 BIM \u5b9e\u666f\u52a8\u753b\u5c55\u793a\u7cfb\u7edf\uff0c\u4f7f\u7528 UE5 \u81ea\u5236\u52a8\u753b\u7f16\u8f91\u5668\u5b8c\u6210\u3002', 'UE5', 'project-blue'),
  makeArchiveProject('solar-hater', '08', 'Solar Hater', '\u9010\u65e5\u8005', '\u52a8\u6001\u5f71\u50cf / \u89c6\u89c9\u5b9e\u9a8c', '\u56f4\u7ed5\u5149\u3001\u9634\u5f71\u4e0e\u73af\u5883\u5173\u7cfb\u7684\u89c6\u542c\u5b9e\u9a8c\u3002', 'SH', 'project-pink'),
  makeArchiveProject('student-roamer', '10', 'Student Roamer', '\u5b66\u751f\u6f2b\u6e38\u8005', '\u670d\u52a1\u8bbe\u8ba1 / \u754c\u9762', '\u4e3a\u5b66\u751f\u5728\u57ce\u5e02\u4e2d\u53d1\u73b0\u5730\u65b9\u7684\u4f53\u9a8c\u8bbe\u8ba1\u3002', 'SR', 'project-blue'),
  makeArchiveProject('railway-museum-storytelling', '12', 'Interactive Storytelling for National Railway Museum', '\u56fd\u5bb6\u94c1\u8def\u535a\u7269\u9986\u4ea4\u4e92\u53d9\u4e8b', '\u535a\u7269\u9986\u4ea4\u4e92 / \u516c\u5171\u4f53\u9a8c', '\u4e3a\u56fd\u5bb6\u94c1\u8def\u535a\u7269\u9986\u8bbe\u8ba1\u7684\u4ea4\u4e92\u53d9\u4e8b\u4f53\u9a8c\u3002', 'NRM', 'project-pink'),
  makeArchiveProject('yun-house', '16', 'Yun House', '\u4e91\u5c4b', '\u7f51\u9875\u4f53\u9a8c / \u6570\u5b57\u73af\u5883', '\u4e00\u4e2a\u4ee5\u7a7a\u95f4\u6c14\u8d28\u4e3a\u6838\u5fc3\u7684\u6570\u5b57\u73af\u5883\u3002', 'YH', 'project-pink')
);

Object.assign(projects[0], { title: 'Making the Invisible Visible', titleCn: '\u4f7f\u4e0d\u53ef\u89c1\u4e4b\u7269\u663e\u73b0', intro: '\u300a\u4f7f\u4e0d\u53ef\u89c1\u4e4b\u7269\u663e\u73b0\u300b\u601d\u8003\u5982\u4f55\u901a\u8fc7\u89c6\u542c\u4f53\u9a8c\uff0c\u8ba9\u90a3\u4e9b\u901a\u5e38\u53ea\u80fd\u88ab\u611f\u53d7\u3001\u5374\u65e0\u6cd5\u88ab\u770b\u89c1\u7684\u529b\u91cf\u83b7\u5f97\u5f62\u5f0f\u3002' });
Object.assign(projects[1], { title: 'The Wish', titleCn: '\u300a\u613f\u300b', intro: '\u300a\u613f\u300b\u662f\u4e00\u4e2a\u5173\u4e8e\u79fb\u52a8\u3001\u76f8\u9047\u548c\u7ec6\u5c0f\u9009\u62e9\u7684\u6e38\u620f\u4e16\u754c\u3002' });
Object.assign(projects[2], { title: 'Road Crack Detection System', titleCn: '\u9053\u8def\u88c2\u7f1d\u68c0\u6d4b\u7cfb\u7edf', intro: '\u300a\u9053\u8def\u88c2\u7f1d\u68c0\u6d4b\u7cfb\u7edf\u300b\u5c06\u590d\u6742\u7684\u9053\u8def\u4fe1\u606f\u8f6c\u5316\u4e3a\u4e00\u4e2a\u53ef\u4ee5\u63a2\u7d22\u3001\u88ab\u6ce8\u610f\u548c\u88ab\u7406\u89e3\u7684\u6570\u5b57\u7a7a\u95f4\u3002' });
Object.assign(projects[3], { title: 'Sanhe Daxian', titleCn: '\u4e09\u548c\u5927\u795e', intro: '\u300a\u4e09\u548c\u5927\u795e\u300b\u662f\u4e00\u6b21\u5173\u4e8e\u65e5\u5e38\u79fb\u52a8\u3001\u8ddd\u79bb\u548c\u5904\u4e8e\u4e24\u5730\u4e4b\u95f4\u611f\u53d7\u7684\u52a8\u6001\u5f71\u50cf\u7814\u7a76\u3002' });
Object.assign(projects.find((project) => project.slug === 'the-most-of-us'), { titleCn: '\u5927\u591a\u6570' });

const mediaBySlug = {
  'animating-the-invisible': { media: '/projects/media/animating-the-invisible.mp4', mediaType: 'video' },
  wish: { media: '/projects/media/wish-trailer.mp4', mediaType: 'video' },
  project: { media: '/projects/media/road-crack-detection.mp4', mediaType: 'video' },
  'sanhe-drifters': { media: '/projects/media/sanhe-drifters.mp4', mediaType: 'video' },
  'ds-final': { media: '/projects/media/ds-final.mp3', mediaType: 'audio' },
  'guangze-project-demo': { media: '/projects/media/guangze-project-demo.mp4', mediaType: 'video' },
  'student-roamer': { media: '/projects/media/student-roamer.mp4', mediaType: 'video' },
  'railway-museum-storytelling': { media: '/projects/media/great-western-railway-diesel-railcar.mp4', mediaType: 'video' },
  'solar-hater': { media: '/projects/media/solar-hater.mp4', mediaType: 'video' },
  'the-most-of-us': { demoUrl: '/projects/source/the-most-of-us/The%20Most%20of%20Us.html' },
  'yun-house': { demoUrl: '/projects/source/yun-house/menu.html' }
};
projects.forEach((project) => Object.assign(project, mediaBySlug[project.slug] || {}));
Object.assign(projects[0], { title: 'Animating the Invisible' });
Object.assign(projects[1], { title: 'WISH' });
Object.assign(projects[3], { title: 'Sanhe Drifters' });
Object.assign(projects.find((project) => project.slug === 'ds-final'), { title: 'Hi!', titleCn: '\u55e8\uff01' });
Object.assign(projects.find((project) => project.slug === 'the-most-of-us'), { title: 'The most of us' });
Object.assign(projects.find((project) => project.slug === 'guangze-project-demo'), { title: 'Yorkshire BIM Visualisation & Real-Time Animation System' });
Object.assign(projects.find((project) => project.slug === 'solar-hater'), { title: '\u9010\u65e5\u8005' });
Object.assign(projects.find((project) => project.slug === 'the-most-of-us'), {
  titleCn: '\u5927\u591a\u6570',
  type: '\u4e92\u52a8\u53d9\u4e8b\u6587\u5b57\u6e38\u620f / Twine',
  role: '\u4ea4\u4e92\u5199\u4f5c / Twine / \u97f3\u4e50',
  intro: '\u300aThe Most of Us\u300b\u662f\u4e00\u6b3e\u57fa\u4e8e Twine \u5f00\u53d1\u7684\u4e92\u52a8\u6587\u5b57\u6e38\u620f\uff0c\u901a\u8fc7\u5206\u652f\u9009\u62e9\u63a2\u7d22\u57ce\u4e61\u8fc1\u79fb\u3001\u52b3\u52a8\u3001\u751f\u5b58\u538b\u529b\u4e0e\u793e\u4f1a\u6d41\u52a8\u7b49\u4e3b\u9898\u3002',
  detail: '\u300aThe Most of Us\u300b\u662f\u4e00\u6b3e\u57fa\u4e8e Twine \u5f00\u53d1\u7684\u4e92\u52a8\u6587\u5b57\u6e38\u620f\uff0c\u901a\u8fc7\u5206\u652f\u9009\u62e9\u63a2\u7d22\u57ce\u4e61\u8fc1\u79fb\u3001\u52b3\u52a8\u3001\u751f\u5b58\u538b\u529b\u4e0e\u793e\u4f1a\u6d41\u52a8\u7b49\u4e3b\u9898\u3002\u73a9\u5bb6\u5c06\u5728\u8fdb\u5165\u57ce\u5e02\u540e\u7684\u4e0d\u540c\u4eba\u751f\u8def\u5f84\u4e2d\u4f53\u9a8c\u73b0\u5b9e\u7684\u4e0d\u786e\u5b9a\u6027\uff0c\u5e76\u601d\u8003\u4e2a\u4eba\u9009\u62e9\u4e0e\u793e\u4f1a\u7ed3\u6784\u4e4b\u95f4\u7684\u5173\u7cfb\u3002\n\n\u4f5c\u54c1\u7ed3\u5408\u6587\u5b57\u53d9\u4e8b\u3001\u97f3\u4e50\u4e0e\u7f51\u9875\u4ea4\u4e92\uff0c\u5c1d\u8bd5\u901a\u8fc7\u6570\u5b57\u5a92\u4f53\u5448\u73b0\u666e\u901a\u52b3\u52a8\u8005\u96be\u4ee5\u88ab\u770b\u89c1\u7684\u751f\u6d3b\u7ecf\u9a8c\u3002'
});

Object.assign(projects.find((project) => project.slug === 'ds-final'), {
  detail: '\u300aHi\uff01\u300b\u662f\u4e00\u4ef6\u58f0\u97f3\u53d9\u4e8b\u4f5c\u54c1\uff0c\u6784\u5efa\u4e86\u4e00\u4e2a\u5e9f\u571f\u98ce\u683c\u7684\u8352\u829c\u57ce\u5e02\u3002\u4f5c\u54c1\u901a\u8fc7\u58f0\u97f3\u3001\u73af\u5883\u97f3\u6548\u4e0e\u53d9\u4e8b\u8bbe\u8ba1\uff0c\u8bb2\u8ff0\u4e00\u540d\u5b64\u72ec\u7684\u63a2\u7d22\u8005\u5728\u5e9f\u589f\u4e2d\u5bfb\u627e\u7ebf\u7d22\uff0c\u5e76\u906d\u9047\u4e00\u573a\u8352\u8bde\u800c\u672a\u77e5\u7684\u201c\u5047\u70b8\u5f39\u602a\u7269\u201d\u7684\u6545\u4e8b\u3002\u901a\u8fc7\u8d85\u73b0\u5b9e\u7684\u60c5\u8282\u4e0e\u6c89\u6d78\u5f0f\u58f0\u97f3\u4f53\u9a8c\uff0c\u4f5c\u54c1\u63a2\u7d22\u5b64\u72ec\u3001\u6050\u60e7\u4e0e\u8352\u8bde\u4e16\u754c\u4e2d\u7684\u751f\u5b58\u611f\u3002',
  type: '\u58f0\u97f3\u53d9\u4e8b / \u89c6\u542c\u827a\u672f'
});
Object.assign(projects.find((project) => project.slug === 'wish'), {
  type: '3D \u6e38\u620f / Interactive Narrative',
  detail: '\u300a\u613f\u300b\u662f\u4e00\u6b3e\u63a2\u7d22\u73af\u5883\u4f26\u7406\u4e0e\u751f\u6001\u5371\u673a\u7684 3D \u4e92\u52a8\u4f5c\u54c1\u3002\u901a\u8fc7\u6784\u5efa\u4e00\u4e2a\u53d7\u5230\u4eba\u7c7b\u6d3b\u52a8\u5f71\u54cd\u7684\u865a\u62df\u4e16\u754c\uff0c\u4f5c\u54c1\u53cd\u601d\u6280\u672f\u53d1\u5c55\u4e0e\u81ea\u7136\u4fdd\u62a4\u4e4b\u95f4\u7684\u51b2\u7a81\uff0c\u5e76\u5c1d\u8bd5\u4ee5\u6e38\u620f\u5a92\u4ecb\u5524\u8d77\u89c2\u4f17\u5bf9\u73af\u5883\u8d23\u4efb\u7684\u601d\u8003\u3002'
});
Object.assign(projects.find((project) => project.slug === 'sanhe-drifters'), {
  type: 'Stop-motion Animation / Social Commentary',
  detail: '\u300a\u4e09\u548c\u5927\u795e\u300b\u662f\u4e00\u90e8\u4ee5\u5b9a\u683c\u52a8\u753b\u5f62\u5f0f\u521b\u4f5c\u7684\u793e\u4f1a\u89c2\u5bdf\u4f5c\u54c1\uff0c\u901a\u8fc7\u8352\u8bde\u5316\u7684\u89c6\u89c9\u8bed\u8a00\u4e0e\u8c61\u5f81\u6027\u53d9\u4e8b\uff0c\u63a2\u8ba8\u5e95\u5c42\u52b3\u52a8\u8005\u3001\u4e34\u65f6\u52b3\u52a8\u4e0e\u73b0\u4ee3\u793e\u4f1a\u7ecf\u6d4e\u7ed3\u6784\u4e4b\u95f4\u7684\u5173\u7cfb\u3002\u4f5c\u54c1\u7ed3\u5408\u624b\u7ed8\u89d2\u8272\u3001\u5b9e\u4f53\u6750\u6599\u3001\u73b0\u5b9e\u62db\u8058\u4fe1\u606f\u4e0e\u5b9a\u683c\u52a8\u753b\u6280\u672f\uff0c\u901a\u8fc7\u591a\u5c42\u6b21\u58f0\u97f3\u8bbe\u8ba1\u4e0e\u65c1\u767d\u53d9\u4e8b\uff0c\u5c06\u52b3\u52a8\u8005\u7684\u60c5\u7eea\u4f53\u9a8c\u4e0e\u751f\u6d3b\u7ecf\u9a8c\u7f6e\u4e8e\u4f5c\u54c1\u6838\u5fc3\u3002'
});
Object.assign(projects.find((project) => project.slug === 'solar-hater'), {
  titleCn: '\u9010\u65e5\u8005',
  title: 'Solar Hater',
  detail: '\u4e00\u652f\u57fa\u4e8e AIGC \u5236\u4f5c\u7684\u50cf\u7d20\u98ce\u6e38\u620f\u524d\u5bfc\u5ba3\u4f20\u7247\uff0c\u901a\u8fc7\u5149\u5f71\u3001\u73af\u5883\u4e0e\u53d9\u4e8b\u8bbe\u8ba1\u6784\u5efa\u5e7b\u60f3\u4e16\u754c\u3002\u4f5c\u54c1\u4ee5\u73a9\u5bb6\u8fdb\u5165\u6b27\u6d32\u65c5\u884c\u5e76\u610f\u5916\u9677\u5165\u5730\u7262\u4e3a\u5f00\u7aef\uff0c\u5c55\u73b0\u6e38\u620f\u4e16\u754c\u89c2\u3001\u89d2\u8272\u5904\u5883\u4e0e\u5192\u9669\u5e8f\u7ae0\uff0c\u63a2\u7d22 AI \u751f\u6210\u6280\u672f\u5728\u6e38\u620f\u89c6\u89c9\u5f00\u53d1\u4e2d\u7684\u5e94\u7528\u3002'
});
Object.assign(projects.find((project) => project.slug === 'animating-the-invisible'), {
  type: '\u52a8\u753b / \u89c6\u542c\u827a\u672f / Practice-based Research',
  detail: '\u300aAnimating the Invisible\u300b\u662f\u4e00\u9879\u57fa\u4e8e\u52a8\u753b\u7684\u5b9e\u8df5\u7814\u7a76\u9879\u76ee\uff0c\u901a\u8fc7\u89c6\u89c9\u53d9\u4e8b\u4e0e\u58f0\u97f3\u8bbe\u8ba1\uff0c\u5c06\u6570\u5b57\u5e73\u53f0\u80cc\u540e\u4e0d\u53ef\u89c1\u7684\u5185\u5bb9\u5ba1\u6838\u52b3\u52a8\u4e0e\u7b97\u6cd5\u6cbb\u7406\u673a\u5236\u8f6c\u5316\u4e3a\u53ef\u611f\u77e5\u7684\u4f53\u9a8c\u3002\u4f5c\u54c1\u63a2\u7d22\u5ba1\u6838\u5458\u5728\u7b97\u6cd5\u7cfb\u7edf\u4e2d\u7684\u91cd\u590d\u52b3\u52a8\u3001\u5fc3\u7406\u538b\u529b\u4e0e\u8eab\u4efd\u6d88\u89e3\u3002'
});
Object.assign(projects.find((project) => project.slug === 'student-roamer'), {
  detail: '\u300a\u5b66\u751f\u6f2b\u6e38\u8005\u300b\u662f\u4e00\u6b3e\u9762\u5411\u5b66\u751f\u7528\u6237\u7684\u4e2a\u6027\u5316\u65c5\u6e38\u7f51\u7ad9\uff0c\u901a\u8fc7\u5206\u6790\u7528\u6237\u5174\u8da3\u3001\u9884\u7b97\u4e0e\u65c5\u884c\u9700\u6c42\uff0c\u751f\u6210\u5b9a\u5236\u5316\u65c5\u884c\u65b9\u6848\u3002\u9879\u76ee\u7ed3\u5408\u4ea4\u4e92\u8bbe\u8ba1\u4e0e\u4fe1\u606f\u67b6\u6784\uff0c\u63a2\u7d22\u5982\u4f55\u5229\u7528\u6570\u5b57\u4f53\u9a8c\u5e2e\u52a9\u7528\u6237\u66f4\u8f7b\u677e\u5730\u89c4\u5212\u65c5\u7a0b\u3002'
});
Object.assign(projects.find((project) => project.slug === 'railway-museum-storytelling'), {
  detail: '\u4e3a\u82f1\u56fd\u56fd\u5bb6\u94c1\u8def\u535a\u7269\u9986\u8bbe\u8ba1\u7684\u4ea4\u4e92\u5f0f\u5c55\u89c8\u4f53\u9a8c\uff0c\u4ee5 Diesel Railcar No.4 \u4e3a\u4e3b\u9898\uff0c\u901a\u8fc7\u6570\u5b57\u5c55\u677f\u3001\u89c6\u9891\u3001\u56fe\u5e93\u548c AVG \u6e38\u620f\u5c06\u94c1\u8def\u5386\u53f2\u8f6c\u5316\u4e3a\u53ef\u63a2\u7d22\u7684\u4e92\u52a8\u53d9\u4e8b\u3002\u9879\u76ee\u7ed3\u5408\u5b9e\u4f53\u5c55\u793a\u88c5\u7f6e\u4e0e NFC \u6280\u672f\uff0c\u63a2\u7d22\u6570\u5b57\u4f53\u9a8c\u4e0e\u65e0\u969c\u788d\u535a\u7269\u9986\u5c55\u793a\u7684\u7ed3\u5408\u3002'
});
Object.assign(projects.find((project) => project.slug === 'yun-house'), {
  detail: '\u300a\u4e91\u5c4b\u300b\u662f\u4e00\u6b3e\u9762\u5411\u82f1\u56fd\u4e2d\u9910\u5385\u4e0e\u4e91\u5357\u9910\u996e\u54c1\u724c\u7684\u6570\u5b57\u5316\u70b9\u9910\u7cfb\u7edf\uff0c\u901a\u8fc7\u4ea4\u4e92\u8bbe\u8ba1\u4f18\u5316\u987e\u5ba2\u70b9\u9910\u6d41\u7a0b\uff0c\u5e76\u7ed3\u5408\u83dc\u54c1\u5c55\u793a\u4e0e\u6587\u5316\u4fe1\u606f\u4f20\u9012\uff0c\u63a2\u7d22\u4f20\u7edf\u9910\u996e\u5728\u6d77\u5916\u73af\u5883\u4e2d\u7684\u6570\u5b57\u5316\u4f53\u9a8c\u3002'
});
const cardDescriptions = {
  'animating-the-invisible': '\u300a\u4f7f\u4e0d\u53ef\u89c1\u4e4b\u7269\u663e\u73b0\u300b\u5c06\u5185\u5bb9\u5ba1\u6838\u52b3\u52a8\u4e0e\u7b97\u6cd5\u6cbb\u7406\u8f6c\u5316\u4e3a\u53ef\u611f\u77e5\u7684\u89c6\u542c\u4f53\u9a8c\u3002',
  wish: '\u300a\u613f\u300b\u662f\u4e00\u6b3e\u63a2\u7d22\u73af\u5883\u4f26\u7406\u4e0e\u751f\u6001\u5371\u673a\u7684 3D \u4e92\u52a8\u4f5c\u54c1\u3002',
  project: '\u300a\u9053\u8def\u88c2\u7f1d\u68c0\u6d4b\u7cfb\u7edf\u300b\u662f\u4e00\u4e2a\u7ed3\u5408 AI \u8bc6\u522b\u4e0e\u5730\u7406\u4fe1\u606f\u7684\u4ea4\u4e92\u5b9e\u9a8c\u3002',
  'sanhe-drifters': '\u300a\u4e09\u548c\u5927\u795e\u300b\u662f\u4e00\u6b21\u5173\u4e8e\u65e5\u5e38\u79fb\u52a8\u3001\u8ddd\u79bb\u548c\u5904\u4e8e\u4e24\u5730\u4e4b\u95f4\u611f\u53d7\u7684\u52a8\u6001\u5f71\u50cf\u7814\u7a76\u3002',
  'guangze-project-demo': '\u7ea6\u514b\u90e1 BIM \u5b9e\u666f\u52a8\u753b\u5c55\u793a\u7cfb\u7edf\uff0c\u4f7f\u7528 UE5 \u81ea\u5236\u52a8\u753b\u7f16\u8f91\u5668\u5b8c\u6210\u3002',
  'solar-hater': '\u4e00\u652f\u57fa\u4e8e AIGC \u5236\u4f5c\u7684\u50cf\u7d20\u98ce\u6e38\u620f\u524d\u5bfc\u5ba3\u4f20\u7247\u3002',
  'student-roamer': '\u300a\u5b66\u751f\u6f2b\u6e38\u8005\u300b\u662f\u4e00\u6b3e\u9762\u5411\u5b66\u751f\u7528\u6237\u7684\u4e2a\u6027\u5316\u65c5\u6e38\u7f51\u7ad9\u3002',
  'railway-museum-storytelling': '\u4e3a\u82f1\u56fd\u56fd\u5bb6\u94c1\u8def\u535a\u7269\u9986\u8bbe\u8ba1\u7684\u4ea4\u4e92\u5f0f\u5c55\u89c8\u4f53\u9a8c\uff0c\u4ee5 Diesel Railcar No.4 \u4e3a\u4e3b\u9898\u3002',
  'ds-final': '\u300aHi\uff01\u300b\u662f\u4e00\u4ef6\u5173\u4e8e\u5e9f\u571f\u57ce\u5e02\u3001\u5b64\u72ec\u4e0e\u8352\u8bde\u7684\u58f0\u97f3\u53d9\u4e8b\u4f5c\u54c1\u3002',
  'the-most-of-us': '\u300aThe Most of Us\u300b\u662f\u4e00\u6b3e\u57fa\u4e8e Twine \u5f00\u53d1\u7684\u4e92\u52a8\u6587\u5b57\u6e38\u620f\u3002',
  'yun-house': '\u300a\u4e91\u5c4b\u300b\u662f\u4e00\u6b3e\u9762\u5411\u82f1\u56fd\u4e2d\u9910\u5385\u4e0e\u4e91\u5357\u9910\u996e\u54c1\u724c\u7684\u6570\u5b57\u5316\u70b9\u9910\u7cfb\u7edf\u3002'
};
projects.forEach((project) => { if (cardDescriptions[project.slug]) project.text = cardDescriptions[project.slug]; });

const overviewOrder = [
  'animating-the-invisible', 'wish', 'project', 'sanhe-drifters',
  'guangze-project-demo', 'student-roamer', 'railway-museum-storytelling',
  'ds-final', 'the-most-of-us', 'solar-hater', 'yun-house'
];
const overviewProjects = overviewOrder.map((slug) => projects.find((project) => project.slug === slug)).filter(Boolean);
const categoryAnchors = new Set();
overviewProjects.forEach((project) => { project.categoryAnchor = categoryAnchors.has(project.category) ? undefined : project.category; categoryAnchors.add(project.category); });

const coverBySlug = {
  'animating-the-invisible': '/projects/covers/p1-invisible.jpg', wish: '/projects/covers/p2-wish.jpg', project: '/projects/covers/p3-road.jpg',
  'sanhe-drifters': '/projects/covers/p4-sanhe.jpg', 'guangze-project-demo': '/projects/covers/p5-bim.jpg', 'solar-hater': '/projects/covers/p6-solar.jpg',
  'student-roamer': '/projects/covers/p7-student.jpg', 'railway-museum-storytelling': '/projects/covers/p8-railway.svg', 'yun-house': '/projects/covers/p9-yun-house.jpg', 'the-most-of-us': '/projects/covers/p10-the-most-of-us.jpg', 'ds-final': '/projects/covers/p11-hi.jpg'
};
const categoryBySlug = {
  'animating-the-invisible': 'creative-technology', wish: 'game-worlds', project: 'interactive-experiences', 'sanhe-drifters': 'audiovisual-creation',
  'guangze-project-demo': 'creative-technology', 'solar-hater': 'audiovisual-creation', 'student-roamer': 'interactive-experiences',
  'railway-museum-storytelling': 'interactive-experiences', 'ds-final': 'audiovisual-creation',
  'the-most-of-us': 'interactive-experiences', 'yun-house': 'interactive-experiences'
};
projects.forEach((project) => Object.assign(project, { cover: coverBySlug[project.slug], category: categoryBySlug[project.slug] }));
projects.forEach((project) => { if (project.mediaType === 'video' && project.cover) project.gif = project.cover.replace(/\.(png|svg|jpe?g)$/, '.gif'); });
projects.forEach((project) => { if (project.mediaType === 'video' && project.media) project.poster = project.media.replace('/media/', '/media/posters/').replace(/\.(mp4|mov)$/, '.jpg'); });

const services = [
  ['01', '\u4ea4\u4e92\u4f53\u9a8c', ['\u7f51\u9875\u4f53\u9a8c', '\u535a\u7269\u9986\u4ea4\u4e92', '\u7a7a\u95f4\u53d9\u4e8b'], '/work#interactive-experiences'],
  ['02', '\u6e38\u620f\u4e16\u754c', ['\u53ef\u73a9\u73af\u5883', '\u4e16\u754c\u6784\u5efa', '\u53d9\u4e8b\u7cfb\u7edf'], '/work#game-worlds'],
  ['03', '\u89c6\u542c\u521b\u4f5c', ['\u52a8\u6001\u5f71\u50cf', '\u58f0\u97f3\u4e0e\u52a8\u753b', '\u827a\u672f\u6307\u5bfc'], '/work#audiovisual-creation'],
  ['04', '\u521b\u610f\u6280\u672f', ['\u521b\u610f\u7f16\u7a0b', '\u7814\u7a76\u4e0e\u539f\u578b', '\u4ea4\u4e92\u8bbe\u8ba1'], '/work#creative-technology']
];
const archiveGroups = [
  { id: 'interactive-experiences', title: '\u4ea4\u4e92\u4f53\u9a8c', english: 'INTERACTIVE EXPERIENCES', slugs: ['project', 'student-roamer', 'railway-museum-storytelling', 'yun-house', 'the-most-of-us'] },
  { id: 'game-worlds', title: '\u6e38\u620f\u4e16\u754c', english: 'GAME WORLDS', slugs: ['wish'] },
  { id: 'audiovisual-creation', title: '\u89c6\u542c\u521b\u4f5c', english: 'AUDIOVISUAL CREATION', slugs: ['animating-the-invisible', 'sanhe-drifters', 'solar-hater', 'ds-final'] },
  { id: 'creative-technology', title: '\u521b\u610f\u6280\u672f', english: 'CREATIVE TECHNOLOGY', slugs: ['guangze-project-demo'] }
];

function Arrow() {
  return <span className="m-arrow" aria-hidden="true">-&gt;</span>;
}

function usePageMotion(withFlip = false) {
  const [avatarRotation, setAvatarRotation] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('in');
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.m-reveal').forEach((element) => observer.observe(element));

    let ticking = false;
    const update = () => {
      const x = (window.innerWidth ? window.innerWidth : 1);
      document.documentElement.style.setProperty('--pointer-x', `${(((window.__pointerX || 0) / x) - 0.5) * 2}`);
      if (withFlip) {
        const progress = Math.max(0, Math.min(1, (window.scrollY - 80) / 760));
        setAvatarRotation(Math.round(progress * 180));
      }
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };
    const onPointerMove = (event) => {
      window.__pointerX = event.clientX;
      const y = (event.clientY / window.innerHeight - 0.5) * 2;
      document.documentElement.style.setProperty('--pointer-y', `${y.toFixed(3)}`);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    update();
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointermove', onPointerMove);
    };
  }, [withFlip]);

  return avatarRotation;
}

function AvatarCard({ rotation = 0, className = '' }) {
  return (
    <div className={`m-avatar-flip ${className}`} style={{ transform: `perspective(1200px) rotateY(${rotation}deg)` }}>
      <div className="m-avatar-face m-avatar-front">
        <img src="/avatar.jpg" alt="Portfolio portrait" />
        <span className="m-image-tag">{`\u6b66\u6c49 / \u4e2d\u56fd`}</span>
      </div>
      <div className="m-avatar-face m-avatar-back">
        <div className="m-avatar-back-name" dangerouslySetInnerHTML={{ __html: name }} />
        <span>{`\u4ea4\u4e92\u8bbe\u8ba1\u5e08`}</span>
        <span>{`\u521b\u610f\u6280\u672f`}</span>
        <div className="m-avatar-back-line" />
        <small>{`UCL / \u4f26\u6566   \u7ea6\u514b / UK`}<br />{`\u6b66\u6c49 / \u4e2d\u56fd`}</small>
      </div>
    </div>
  );
}

function SiteNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);
  return (
    <header className={`m-nav ${menuOpen ? 'is-open' : ''}`}>
      <div className="m-nav-pill">
        <a className="m-logo" href="/#home" dangerouslySetInnerHTML={{ __html: name }} onClick={closeMenu} />
        <button className="m-menu" type="button" aria-label="\u6253\u5f00\u5bfc\u822a" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
          <span />
          <span />
          <span />
        </button>
      </div>
      <nav className="m-menu-panel" aria-label="Main navigation">
        <a href="/#about" onClick={closeMenu}>{`\u5173\u4e8e\u6211`} <Arrow /></a>
        <a href="/#services" onClick={closeMenu}>{`\u670d\u52a1`} <Arrow /></a>
        <a href="/work" onClick={closeMenu}>{`\u4f5c\u54c1`} <Arrow /></a>
        <a href="/#contact" onClick={closeMenu}>{`\u8054\u7cfb`} <Arrow /></a>
      </nav>
    </header>
  );
}

function AudioVisualizer({ src }) {
  const audioRef = useRef(null);
  const barsRef = useRef(null);
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;
    let context;
    let analyser;
    let source;
    let frame;
    const start = () => {
      if (!context) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;
        context = new AudioContextClass();
        analyser = context.createAnalyser();
        analyser.fftSize = 64;
        source = context.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(context.destination);
      }
      context.resume();
      const values = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(values);
        [...(barsRef.current?.children || [])].forEach((bar, index) => {
          const value = values[index % values.length] / 255;
          bar.style.transform = `scaleY(${Math.max(.18, value * 1.45)})`;
        });
        frame = requestAnimationFrame(tick);
      };
      cancelAnimationFrame(frame);
      tick();
    };
    audio.addEventListener('play', start);
    return () => { audio.removeEventListener('play', start); cancelAnimationFrame(frame); source?.disconnect(); analyser?.disconnect(); context?.close(); };
  }, [src]);
  return <><div className="m-audio-visualizer" ref={barsRef} aria-label="Hi! \u58f0\u97f3\u53ef\u89c6\u5316">{Array.from({ length: 32 }, (_, index) => <span key={index} style={{ '--bar-height': `${30 + ((index * 17) % 50)}%` }} />)}</div><audio ref={audioRef} src={src} controls preload="metadata" /></>;
}

function ProjectVisual({ project, large = false }) {
  const [hover, setHover] = useState(false);
  useEffect(() => {
    if (!project.gif) return undefined;
    const img = new Image();
    img.src = project.gif;
    return undefined;
  }, [project.gif]);
  const coverSrc = hover && project.gif ? project.gif : project.cover;
  return (
    <div className={`m-project-image ${project.tone} ${large ? 'is-large' : ''}`} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      {!large && project.cover && <GlareHover className="rb-cover-glare"><TiltedCard className="rb-cover-tilt"><img className="m-project-cover" src={coverSrc} alt={project.titleCn} /></TiltedCard></GlareHover>}
      {large && project.mediaType === 'video' && <video src={project.media} poster={project.poster} controls loop autoPlay playsInline preload="metadata" />}
      {large && project.mediaType === 'audio' && <AudioVisualizer src={project.media} />}
      {large && project.demoUrl && <iframe src={project.demoUrl} title={project.title} loading="lazy" />}
    </div>
  );
}

function ProjectCard({ project }) {
  const cardRef = useRef(null);
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return undefined;
    const onMove = (event) => {
      const rect = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${event.clientX - rect.left}px`);
      el.style.setProperty('--my', `${event.clientY - rect.top}px`);
    };
    el.addEventListener('pointermove', onMove);
    return () => el.removeEventListener('pointermove', onMove);
  }, []);
  return (
    <a ref={cardRef} id={project.categoryAnchor} data-category={project.category} className={`m-project m-reveal ${project.tone}`} href={`/work/${project.slug}`}>
      <span className="rb-card-spotlight" aria-hidden="true" />
      <ProjectVisual project={project} />
      <div className="m-project-meta">
        <div><small>{project.type}</small><h3>{project.titleCn}<small>{project.title}</small></h3></div>
        <p>{project.text}</p>
      </div>
    </a>
  );
}

function WarpText({ text, color = '#111', style }) {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return undefined;
    const ctx = canvas.getContext('2d');
    const pointer = { x: .5, y: .5, active: false };
    let width = 0;
    let height = 0;
    let frame;
    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    const move = (event) => { const rect = wrap.getBoundingClientRect(); pointer.x = (event.clientX - rect.left) / rect.width; pointer.y = (event.clientY - rect.top) / rect.height; pointer.active = true; };
    const leave = () => { pointer.active = false; };
    const draw = (time) => {
      ctx.clearRect(0, 0, width, height);
      const fontSize = Math.min(132, Math.max(48, width * .095));
      ctx.font = `800 ${fontSize}px 'Space Grotesk', Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const baseX = width / 2;
      const baseY = height / 2;
      const metrics = ctx.measureText(text);
      const start = baseX - metrics.width / 2;
      const slice = Math.max(3, Math.min(8, width / 150));
      for (let x = 0; x < metrics.width; x += slice) {
        const wave = Math.sin(time * .0012 + x * .018) * 3;
        const distance = Math.abs((start + x) / width - pointer.x);
        const bend = pointer.active ? Math.max(0, 1 - distance * 3) * (pointer.x - .5) * 70 : 0;
        const y = baseY + wave + bend;
        ctx.save();
        ctx.beginPath();
        ctx.rect(start + x, 0, slice + 1, height);
        ctx.clip();
        ctx.fillStyle = color;
        ctx.fillText(text, baseX, y);
        ctx.restore();
      }
      frame = requestAnimationFrame(draw);
    };
    resize();
    window.addEventListener('resize', resize);
    wrap.addEventListener('pointermove', move);
    wrap.addEventListener('pointerleave', leave);
    frame = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('resize', resize); wrap.removeEventListener('pointermove', move); wrap.removeEventListener('pointerleave', leave); };
  }, [text, color]);
  return <div ref={wrapRef} className="m-warp-text" style={style}><canvas ref={canvasRef} aria-label={text} /></div>;
}

function TextLoop({ text, separator = '✦', speed = 90, uppercase = false }) {
  const items = Array.from({ length: 8 }, (_, index) => <span key={index}>{uppercase ? text.toUpperCase() : text}<i>{separator}</i></span>);
  return <div className="m-text-loop" style={{ '--loop-duration': `${Math.max(8, 7200 / speed)}ms` }} aria-label={text}><div className="m-text-loop-track">{items}</div><div className="m-text-loop-track" aria-hidden="true">{items}</div></div>;
}

function AccordionGallery({ items, defaultIndex = 2, expandRatio = .52, trigger = 'hover' }) {
  const [active, setActive] = useState(defaultIndex);
  return <div className="m-accordion-gallery" style={{ '--expand-ratio': expandRatio }} onMouseLeave={() => setActive(defaultIndex)}>{items.map((item, index) => <a className={`m-accordion-item ${active === index ? 'is-active' : ''}`} href={item.link} key={item.label} onMouseEnter={() => trigger === 'hover' && setActive(index)}><img src={item.image} alt="" /><span>{item.label}</span><small>{String(index + 1).padStart(2, '0')}</small></a>)}</div>;
}

function DepthCarousel({ items, autoplay = true, loop = true, interval = 2600 }) {
  const [active, setActive] = useState(0);
  const previous = () => setActive((current) => (current - 1 + items.length) % items.length);
  const next = () => setActive((current) => loop ? (current + 1) % items.length : Math.min(current + 1, items.length - 1));
  const activeItem = items[active];
  useEffect(() => {
    if (!autoplay || items.length < 2) return undefined;
    const timer = window.setInterval(() => setActive((current) => loop ? (current + 1) % items.length : Math.min(current + 1, items.length - 1)), interval);
    return () => window.clearInterval(timer);
  }, [autoplay, interval, items.length, loop]);
  return <div className="m-depth-carousel" aria-label="Selected works carousel"><div className="m-depth-title"><strong>{activeItem.titleCn}</strong><small>{activeItem.title}</small></div><button type="button" className="m-depth-arrow m-depth-arrow-left" onClick={previous} aria-label="Previous work">←</button>{items.map((item, index) => { const offset = (index - active + items.length) % items.length; const distance = Math.min(offset, items.length - offset); const side = offset === 1 ? 1 : offset === items.length - 1 ? -1 : 0; return <a className={`m-depth-card ${offset === 0 ? 'is-active' : ''}`} href={item.href || '#work'} key={item.alt} onClick={(event) => { if (offset !== 0) { event.preventDefault(); setActive(index); } }} style={{ transform: `translate(calc(-50% + ${side * 245}px), -50%) rotateY(${side * -22}deg) scale(${offset === 0 ? 1 : .78})`, zIndex: 5 - distance, opacity: distance > 1 ? .18 : offset === 0 ? 1 : .48, filter: `blur(${distance > 1 ? 1 : 0}px) saturate(${offset === 0 ? 1 : .72})`, pointerEvents: distance > 1 ? 'none' : 'auto' }}><img src={item.image} alt={item.alt} /></a>; })}<button type="button" className="m-depth-arrow m-depth-arrow-right" onClick={next} aria-label="Next work">→</button><div className="m-depth-dots" aria-hidden="true">{items.map((item, index) => <button type="button" className={index === active ? 'is-active' : ''} key={item.alt} onClick={() => setActive(index)} aria-label={`Show ${item.alt}`} />)}</div></div>;
}

function HomePage() {
  const avatarRotation = usePageMotion(true);
  useEffect(() => {
    const html = (selector, value) => { const element = document.querySelector(selector); if (element) element.innerHTML = value; };
    const all = (selector, values) => document.querySelectorAll(selector).forEach((element, index) => { if (values[index]) element.innerHTML = values[index]; });
    html('.m-logo', '\u4f46\u5149\u6cfd <small>Guangze Dan</small>');
    all('.m-menu-panel a', ['\u5173\u4e8e\u6211 <small>About Me</small> <span class="m-arrow">-&gt;</span>', '\u670d\u52a1 <small>Services</small> <span class="m-arrow">-&gt;</span>', '\u4f5c\u54c1 <small>Works</small> <span class="m-arrow">-&gt;</span>', '\u8054\u7cfb <small>Contact</small> <span class="m-arrow">-&gt;</span>']);
    html('.m-hero-orbit span', ['UCL - London', 'UOY - York, UK', 'Wuhan, China']);
    html('.m-resume-button', '<strong>\u4e0b\u8f7d\u7b80\u5386<br><small>Download CV</small></strong><span class="m-arrow">-&gt;</span>');
    html('.m-avatar-back-name', '\u4f46\u5149\u6cfd<br><small>Guangze Dan</small>');
    html('.m-footer-top h2', '\u4f46\u5149\u6cfd<small>Guangze Dan</small>');
    html('.m-intro-lead p', '\u6211\u662f\u4f46\u5149\u6cfd\uff0c\u4e00\u540d\u5728\u5730\u65b9\u3001\u5a92\u4ecb\u4e0e\u60f3\u6cd5\u4e4b\u95f4\u8fdb\u884c\u521b\u4f5c\u7684\u8bbe\u8ba1\u5e08\u3002<br><small>I\'m Guangze Dan, a designer working across places, mediums, and ideas.</small>');
    const intro = document.querySelectorAll('.m-intro-copy p');
    if (intro[0]) intro[0].innerHTML = '\u6211\u662f\u4e00\u540d\u4ea4\u4e92\u8bbe\u8ba1\u5e08\u548c\u521b\u610f\u6280\u672f\u5de5\u4f5c\u8005\uff0c\u4e13\u6ce8\u4e8e\u6e38\u620f\u3001\u7f51\u9875\u4f53\u9a8c\u3001\u89c6\u542c\u4f5c\u54c1\u4e0e\u521b\u610f\u7f16\u7a0b\u7b49\u8de8\u5a92\u4f53\u5b9e\u8df5\u3002<br><small>I am an Interaction Designer and Creative Technologist working across games, web experiences, audiovisual works, and creative coding.</small>';
    if (intro[1]) intro[1].innerHTML = '\u6211\u5728\u4f26\u6566 UCL \u7684\u7855\u58eb\u5b66\u4e60\u7ecf\u5386\uff0c\u4ee5\u53ca\u5728\u7ea6\u514b\u79ef\u7d2f\u7684\u521b\u610f\u6280\u672f\u5b9e\u8df5\uff0c\u5171\u540c\u6784\u6210\u4e86\u6211\u7684\u521b\u4f5c\u80cc\u666f\u3002<br><small>My master\'s study at UCL - London and my creative technology practice in UOY - York have shaped the foundation of my work.</small><br><br>\u5982\u4eca\uff0c\u6211\u4ee5\u6b66\u6c49\uff0c\u4e2d\u56fd\u4e3a\u521b\u4f5c\u57fa\u5730\uff0c\u5728\u7814\u7a76\u3001\u6982\u5ff5\u4e0e\u5236\u4f5c\u4e4b\u95f4\u63a2\u7d22\uff0c\u521b\u9020\u6e05\u6670\u3001\u6709\u6c1b\u56f4\u611f\u5e76\u5177\u6709\u4eba\u60c5\u6e29\u5ea6\u7684\u4f53\u9a8c\u3002<br><small>Now based in Wuhan, China, I work between research, concepts, and making — creating experiences that are clear, atmospheric, and deeply human.</small>';
    html('.m-location-line', '<span>UCL - London</span><span>UOY - York, UK</span><span>Wuhan, China</span>');
    if (intro[1]) intro[1].innerHTML = intro[1].innerHTML.replace(/<br><br>/g, '<br>');
    html('.m-underlink', '\u67e5\u770b\u4f5c\u54c1 <small>View Works</small> <span class="m-arrow">-&gt;</span>');
    const serviceEnglish = [['Interactive Experiences', 'Web Experiences', 'Museum Interaction', 'Spatial Narratives'], ['Game Worlds', 'Playable Environments', 'World Building', 'Narrative Systems'], ['Audiovisual Creation', 'Motion Design', 'Sound & Animation', 'Art Direction'], ['Creative\u00a0Technology', 'Creative Coding', 'Research & Prototyping', 'Interaction Design']];
    document.querySelectorAll('.m-service').forEach((service, index) => { const data = serviceEnglish[index]; if (!data) return; service.querySelector('h3').innerHTML = `${service.querySelector('h3').innerText}<small>${data[0]}</small>`; service.querySelectorAll('.m-service-tags span').forEach((tag, tagIndex) => { tag.innerHTML = `${tag.innerText}<small>${data[tagIndex + 1]}</small>`; }); });
    html('.m-work-head a', '\u67e5\u770b\u5168\u90e8\u4f5c\u54c1 <small>View All Works</small> <span class="m-arrow">-&gt;</span>');
    html('.m-contact p', '\u544a\u8bc9\u6211\u4f60\u7684\u60f3\u6cd5\uff0c\u6211\u4f1a\u5c3d\u5feb\u56de\u590d\u3002<br><small>Tell me about your project or idea, and I\'ll get back to you soon.</small>');
    html('.m-footer-top p', '\u4ea4\u4e92\u8bbe\u8ba1\u5e08 / \u521b\u610f\u6280\u672f\u5de5\u4f5c\u8005\u3002<br><small>Interaction Designer / Creative Technologist.</small><br><br>\u521b\u9020\u53ef\u4ee5\u88ab\u4eba\u611f\u53d7\u7684\u6545\u4e8b\u3001\u4e16\u754c\u4e0e\u7cfb\u7edf\u3002<br><small>Creating stories, worlds, and systems that people can experience and feel.</small>');
    html('.m-footer-links span', '/ \u5feb\u901f\u5bfc\u822a <small>QUICK NAVIGATION</small>');
    html('.m-footer-contact span:first-child', '/ \u8054\u7cfb\u65b9\u5f0f <small>CONTACT</small>');
    html('.m-footer-contact span:last-child', 'UCL - London / UOY - York / Wuhan');
  }, []);
  useEffect(() => {
    const set = (selector, value) => { const element = document.querySelector(selector); if (element) element.innerHTML = value; };
    set('.m-intro-lead p', '\u6211\u662f\u4f46\u5149\u6cfd\uff0c\u4e00\u540d\u5728\u5730\u65b9\u3001\u5a92\u4ecb\u4e0e\u60f3\u6cd5\u4e4b\u95f4\u8fdb\u884c\u521b\u4f5c\u7684\u8bbe\u8ba1\u5e08\u3002<br><small>I\'m Guangze Dan, a designer working across places, mediums, and ideas.</small>');
    const intro = document.querySelectorAll('.m-intro-copy p');
    if (intro[0]) intro[0].innerHTML = '\u6211\u662f\u4e00\u540d\u4ea4\u4e92\u8bbe\u8ba1\u5e08\u548c\u521b\u610f\u6280\u672f\u5de5\u4f5c\u8005\uff0c\u4e13\u6ce8\u4e8e\u6e38\u620f\u3001\u7f51\u9875\u4f53\u9a8c\u3001\u89c6\u542c\u4f5c\u54c1\u4e0e\u521b\u610f\u7f16\u7a0b\u7b49\u8de8\u5a92\u4f53\u5b9e\u8df5\u3002<br><small>I am an Interaction Designer and Creative Technologist working across games, web experiences, audiovisual works, and creative coding.</small>';
    if (intro[1]) intro[1].innerHTML = '\u6211\u5728\u4f26\u6566 UCL \u7684\u7855\u58eb\u5b66\u4e60\u7ecf\u5386\uff0c\u4ee5\u53ca\u5728\u7ea6\u514b\u79ef\u7d2f\u7684\u521b\u610f\u6280\u672f\u5b9e\u8df5\uff0c\u5171\u540c\u6784\u6210\u4e86\u6211\u7684\u521b\u4f5c\u80cc\u666f\u3002<br><small>My master\'s study at UCL - London and my creative technology practice in UOY - York have shaped the foundation of my work.</small><br><br>\u5982\u4eca\uff0c\u6211\u4ee5\u6b66\u6c49\uff0c\u4e2d\u56fd\u4e3a\u521b\u4f5c\u57fa\u5730\uff0c\u5728\u7814\u7a76\u3001\u6982\u5ff5\u4e0e\u5236\u4f5c\u4e4b\u95f4\u63a2\u7d22\uff0c\u521b\u9020\u6e05\u6670\u3001\u6709\u6c1b\u56f4\u611f\uff0c\u5e76\u5177\u6709\u4eba\u60c5\u6e29\u5ea6\u7684\u4f53\u9a8c\u3002<br><small>Now based in Wuhan, China, I work between research, concepts, and making — creating experiences that are clear, atmospheric, and deeply human.</small>';
    set('.m-location-line', '<span>UCL - London</span><span>UOY - York, UK</span><span>Wuhan, China</span>');
    if (intro[1]) intro[1].innerHTML = intro[1].innerHTML.replace(/<br><br>/g, '<br>');
    document.querySelectorAll('.m-testimonials article > span').forEach((item, index) => { const labels = ['\u65b9\u6cd5 / APPROACH', '\u8fc7\u7a0b / PROCESS', '\u5f53\u4e0b / PRESENT']; if (labels[index]) item.textContent = `${String(index + 1).padStart(2, '0')} / ${labels[index]}`; });
  }, []);
  useEffect(() => {
    const photo = document.querySelector('.m-intro-photo');
    const button = document.querySelector('.m-intro-copy .m-underlink');
    if (!photo || !button) return undefined;
    const syncBottom = () => {
      const shift = photo.getBoundingClientRect().bottom - button.getBoundingClientRect().bottom;
      button.style.setProperty('--works-align-shift', `${shift.toFixed(1)}px`);
    };
    syncBottom();
    window.addEventListener('resize', syncBottom);
    return () => window.removeEventListener('resize', syncBottom);
  }, []);
  useEffect(() => {
    const section = document.querySelector('.m-statement');
    if (!section) return undefined;
    let ticking = false;
    const update = () => {
      const rect = section.getBoundingClientRect();
      const total = section.offsetHeight - window.innerHeight;
      const progress = total > 0 ? Math.min(Math.max(-rect.top / total, 0), 1) : 1;
      section.style.setProperty('--reveal-progress', progress.toFixed(3));
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);
  return (
    <div className="majd-site">
      <SiteNav />
      <main>
        <section className="m-hero" id="home">
          <div className="m-hero-meta"><span><BlurText>{`\u4ea4\u4e92\u8bbe\u8ba1\u5e08 / \u521b\u610f\u6280\u672f`}</BlurText></span><span><BlurText delay={90}>{`\u5e38\u9a7b\u6b66\u6c49 / \u4e2d\u56fd`}</BlurText></span></div>
          <div className="m-hero-orbit" aria-hidden="true"><span>{`UCL / \u4f26\u6566`}</span><span>{`\u7ea6\u514b`}</span><span>{`\u6b66\u6c49`}</span></div>
          <div className="m-hero-word m-hero-word-one"><SplitText delay={45}>{`\u521b\u610f\u6280\u672f`}</SplitText></div>
          <div className="m-hero-word m-hero-word-two"><i><SplitText delay={28}>{`CREATIVE TECHNOLOGY`}</SplitText></i></div>
          <figure className="m-hero-image"><AvatarCard rotation={avatarRotation} /></figure>
          <div className="m-hero-side m-hero-side-left">&copy; 2026</div>
          <div className="m-hero-side m-hero-side-right"><ShinyText>/ {`\u8de8\u5a92\u4f53\u521b\u4f5c`}</ShinyText><br /><small>/ Transmedia Practice</small></div>
          <a className="m-hero-cta" href="#about">{`\u5411\u4e0b\u63a2\u7d22`} <Arrow /></a>
          <a className="m-resume-button" href="/guangze-resume.docx" download="Guangze-Resume.docx"><strong>{`\u4e0b\u8f7d\u7b80\u5386`}<small>Download CV</small></strong><Arrow /></a>
        </section>

        <section className="m-intro" id="about">
          <div className="m-section-kicker"><ShinyText>/ {`\u5173\u4e8e\u6211`} <small>About Me</small></ShinyText></div>
          <div className="m-intro-grid">
            <div className="m-intro-lead"><h2><SplitText>{`\u4f60\u597d\uff01`}</SplitText><small>HELLO!</small></h2><p>{`\u6211\u662f `}<span dangerouslySetInnerHTML={{ __html: name }} />{`\uff0c\u4e00\u540d\u5728\u5730\u65b9\u3001\u5a92\u4ecb\u548c\u60f3\u6cd5\u4e4b\u95f4\u5de5\u4f5c\u7684\u8bbe\u8ba1\u5e08\u3002`}</p></div>
                <figure className="m-intro-photo"><img src="/about-avatar.jpg" alt="Portfolio portrait" /></figure>
            <div className="m-intro-copy">
              <p className="m-large">{`\u6211\u662f\u4e00\u540d\u4ea4\u4e92\u8bbe\u8ba1\u5e08\u548c\u521b\u610f\u6280\u672f\u5de5\u4f5c\u8005\uff0c\u6d89\u53ca\u6e38\u620f\u3001\u7f51\u9875\u4f53\u9a8c\u3001\u89c6\u542c\u4f5c\u54c1\u4e0e\u521b\u610f\u7f16\u7a0b\u3002`}</p>
              <p>{`\u6211\u5728\u4f26\u6566 UCL \u7684\u7855\u58eb\u5b66\u4e60\uff0c\u4ee5\u53ca\u5728\u7ea6\u514b\u79ef\u7d2f\u7684\u521b\u610f\u6280\u672f\u7ecf\u9a8c\uff0c\u6784\u6210\u4e86\u6211\u7684\u5b9e\u8df5\u80cc\u666f\u3002\u73b0\u5728\u6211\u4ee5\u6b66\u6c49\u3001\u4e2d\u56fd\u4e3a\u57fa\u5730\uff0c\u5728\u7814\u7a76\u3001\u6982\u5ff5\u548c\u5236\u4f5c\u4e4b\u95f4\u5de5\u4f5c\uff0c\u521b\u9020\u6e05\u6670\u3001\u6709\u6c1b\u56f4\u611f\u5e76\u4e14\u5177\u6709\u4eba\u60c5\u5473\u7684\u4f53\u9a8c\u3002`}</p>
              <div className="m-location-line"><span>{`UCL / \u4f26\u6566`}</span><span>{`\u7ea6\u514b / UK`}</span><span>{`\u6b66\u6c49 / \u4e2d\u56fd`}</span></div>
              <Magnet strength={0.3}><a className="m-underlink" href="/work">{`\u67e5\u770b\u4f5c\u54c1`} <Arrow /></a></Magnet>
            </div>
          </div>
        </section>

        <section className="m-statement">
          <div className="m-statement-sticky">
            <p>
              <PressureWord text={`\u4ece\u60f3\u6cd5\u5230\u4f53\u9a8c`} />
              <span>FROM IDEA TO EXPERIENCE</span>
              <small>{`\u8ba9\u521b\u4f5c\u4fdd\u6301\u6d41\u52a8\u4e0e\u597d\u5947\uff0c\u8ba9\u4e0d\u53ef\u89c1\u4e4b\u7269\u9010\u6e10\u6210\u4e3a\u53ef\u4ee5\u88ab\u611f\u77e5\u7684\u4f53\u9a8c\u3002`}<br />Keeping creativity fluid and curious, I transform invisible ideas into experiences that can be felt.</small>
            </p>
          </div>
        </section>

        <section className="m-services" id="services">
          <div className="m-section-kicker"><ShinyText>/ {`\u6211\u7684\u65b9\u6cd5`} <small>MY APPROACH</small></ShinyText></div><h2><SplitText>{`\u670d\u52a1`}</SplitText><i>SERVICES</i></h2>
          <div className="m-service-list">{services.map(([n, title, tags, href]) => <a className="m-service m-reveal" href={href} key={n}><span>{n}</span><h3>{title}</h3><div className="m-service-tags">{tags.map((tag) => <span key={tag}>{tag}</span>)}</div><Arrow /></a>)}</div>
        </section>

        <section className="m-work" id="work">
          <div className="m-work-head"><div className="m-section-kicker"><ShinyText>/ {`\u7cbe\u9009\u4f5c\u54c1`} <small>SELECTED WORKS</small></ShinyText></div><Magnet strength={0.3}><a href="/work">{`\u67e5\u770b\u5168\u90e8\u4f5c\u54c1`} <Arrow /></a></Magnet></div>
          <DepthCarousel items={overviewProjects.slice(0, 5).map((project) => ({ image: project.cover, alt: project.titleCn, titleCn: project.titleCn, title: project.title, href: `/work/${project.slug}` }))} depth={220} spread={90} tilt={22} perspective={1400} visibleCards={4} falloff={.2} blur={6} autoplay loop />
        </section>

        <section className="m-testimonials"><div className="m-section-kicker"><ShinyText>/ {`\u7cbe\u9009\u601d\u8003`} <small>SELECTED THOUGHTS</small></ShinyText></div><div className="m-testimonials-grid"><article className="m-reveal"><span>01 / {`\u65b9\u6cd5`}</span><h3>{`\u8ba9\u4e0d\u53ef\u89c1\u53d8\u5f97\u53ef\u89e6`}<small>MAKE THE INVISIBLE TANGIBLE</small></h3><p><WordReveal>{`\u4f5c\u54c1\u7ecf\u5e38\u4ece\u96be\u4ee5\u88ab\u63e1\u4f4f\u7684\u4e1c\u897f\u5f00\u59cb\uff1a\u4e00\u79cd\u6c1b\u56f4\u3001\u4e00\u6bb5\u8bb0\u5fc6\u3001\u4e00\u4e2a\u7cfb\u7edf\uff0c\u6216\u8005\u4e00\u79cd\u611f\u89c9\u3002`}</WordReveal></p></article><article className="m-reveal"><span>02 / {`\u8fc7\u7a0b`}</span><h3>{`\u7814\u7a76\u4e5f\u662f\u4e00\u79cd\u6750\u6599`}<small>RESEARCH IS A MATERIAL</small></h3><p><WordReveal>{`\u53c2\u8003\u3001\u5bf9\u8bdd\u548c\u89c2\u5bdf\u5e2e\u52a9\u6211\u5728\u786e\u5b9a\u89c6\u89c9\u4e4b\u524d\uff0c\u5148\u627e\u5230\u9879\u76ee\u7684\u8d28\u611f\u3002`}</WordReveal></p></article><article className="m-reveal"><span>03 / {`\u5f53\u4e0b`}</span><h3>{`\u57fa\u5730\uff1a\u6b66\u6c49`}<small>BASED IN WUHAN</small></h3><p><WordReveal>{`\u4f26\u6566 UCL \u548c\u7ea6\u514b\u662f\u6211\u91cd\u8981\u7684\u80cc\u666f\uff0c\u73b0\u5728\u6211\u6b63\u5728\u4e2d\u56fd\u5236\u4f5c\u4e0b\u4e00\u9636\u6bb5\u7684\u4f5c\u54c1\u3002`}</WordReveal></p></article></div></section>

        <ContactSection />
      </main>
      <SiteFooter />
    </div>
  );
}

function ContactSection() {
  return <section className="m-contact" id="contact"><div className="m-section-kicker"><ShinyText>/ {`\u8054\u7cfb\u6211`} <small>CONTACT</small></ShinyText></div><h2><SplitText>{`\u6709\u9879\u76ee\u6216\u60f3\u6cd5\uff1f`}</SplitText><i>HAVE AN IDEA?</i></h2><p>{`\u544a\u8bc9\u6211\u4f60\u7684\u60f3\u6cd5\uff0c\u6211\u4f1a\u5c3d\u5feb\u56de\u590d\u3002`}<br /><small>Tell me about your project or idea, and I'll get back to you soon.</small></p><div className="m-contact-details"><a href="mailto:guangze.dan.24@alumni.ucl.ac.uk">guangze.dan.24@alumni.ucl.ac.uk</a><a href="mailto:Guangze.Dan@alumni.york.ac.uk">Guangze.Dan@alumni.york.ac.uk</a><a href="mailto:322044089@qq.com">322044089@qq.com</a><a href="tel:+8618083893420">+86 18083893420</a></div></section>;
}

function SiteFooter() {
  return <footer className="m-footer"><div className="m-footer-top"><h2 dangerouslySetInnerHTML={{ __html: name }} /><p>{`\u4ea4\u4e92\u8bbe\u8ba1\u5e08 / \u521b\u610f\u6280\u672f\u5de5\u4f5c\u8005\u3002`}<br />{`\u521b\u9020\u53ef\u4ee5\u88ab\u4eba\u611f\u53d7\u7684\u6545\u4e8b\u3001\u4e16\u754c\u548c\u7cfb\u7edf\u3002`}</p></div><div className="m-footer-links"><span>/ {`\u5feb\u901f\u5bfc\u822a`}</span><a href="/#home">{`\u9996\u9875`}</a><a href="/#about">{`\u5173\u4e8e\u6211`}</a><a href="/#services">{`\u670d\u52a1`}</a><a href="/work">{`\u4f5c\u54c1`}</a><a href="/#contact">{`\u8054\u7cfb`}</a></div><small>&copy; 2026 / <GradientText>{`\u4fdd\u6301\u597d\u5947\uff0c\u6301\u7eed\u521b\u4f5c\u3002`}</GradientText></small></footer>;
}

function WorkPage() {
  usePageMotion(false);
  useEffect(() => {
    const index = document.querySelector('.m-archive-index');
    if (index) index.textContent = overviewProjects.map((project) => project.titleCn).join(' / ');
    const slug = window.location.hash.slice(1);
    if (slug) requestAnimationFrame(() => (document.getElementById(slug) || document.querySelector(`a[href="/work/${slug}"]`))?.scrollIntoView({ block: 'center', behavior: 'smooth' }));
  }, []);
  return <div className="majd-site m-work-page"><SiteNav /><main><section className="m-archive-hero"><div className="m-section-kicker"><ShinyText>/ {`\u4f5c\u54c1 / SELECTED PROJECTS`}</ShinyText></div><h1><SplitText>{`\u7cbe\u9009`}</SplitText><br /><i>SELECTED PROJECTS</i></h1><p>{`\u8fd9\u91cc\u6309\u4ea4\u4e92\u4f53\u9a8c\u3001\u6e38\u620f\u4e16\u754c\u3001\u89c6\u542c\u521b\u4f5c\u548c\u521b\u610f\u6280\u672f\u7f16\u6392\u4f5c\u54c1\uff0c\u4ece\u6700\u91cd\u8981\u7684\u9879\u76ee\u5f00\u59cb\u4e86\u89e3\u6211\u7684\u5b9e\u8df5\u3002`}</p><div className="m-archive-index">{`\u4f7f\u4e0d\u53ef\u89c1\u4e4b\u7269\u663e\u73b0 / \u613f / \u9053\u8def\u88c2\u7f1d\u68c0\u6d4b\u7cfb\u7edf / \u4e09\u548c\u5927\u795e`}</div><nav className="m-category-nav" aria-label={`\u4f5c\u54c1\u5206\u7c7b`}><a href="#interactive-experiences">{`\u4ea4\u4e92\u4f53\u9a8c`}<small>INTERACTIVE</small></a><a href="#game-worlds">{`\u6e38\u620f\u4e16\u754c`}<small>GAME WORLDS</small></a><a href="#audiovisual-creation">{`\u89c6\u542c\u521b\u4f5c`}<small>AUDIOVISUAL</small></a><a href="#creative-technology">{`\u521b\u610f\u6280\u672f`}<small>CREATIVE TECH</small></a></nav></section><div className="m-archive-groups">{archiveGroups.map((group) => <section className="m-archive-group" id={group.id} key={group.id}><div className="m-archive-group-heading"><span>{group.title}</span><small>{group.english}</small></div><div className="m-archive-grid">{group.slugs.map((slug) => overviewProjects.find((project) => project.slug === slug)).filter(Boolean).map((project) => <ProjectCard project={project} key={project.slug} />)}</div></section>)}</div><section className="m-archive-footer"><a href="/#contact">{`\u6709\u60f3\u6cd5\uff1f`} <Arrow /></a><span>{`UCL / \u4f26\u6566 / \u7ea6\u514b / \u6b66\u6c49`}</span></section></main><SiteFooter /></div>;
}

function ProjectPage({ project }) {
  usePageMotion(false);
  useEffect(() => {
    return undefined;
    if (project.slug !== 'project') return undefined;
    const media = document.querySelector('.m-detail-media');
    if (!media || document.querySelector('.m-system-demo')) return undefined;
    const demo = document.createElement('section');
    demo.className = 'm-system-demo';
    demo.innerHTML = '<div class="m-section-kicker">/ 现场演示 / LIVE DEMO</div><div class="m-system-demo-head"><h2>道路裂缝检测系统 <i>ROAD CRACK DETECTION SYSTEM</i></h2><p>将原始检测界面接入作品叙事，下面的窗口可以直接操作演示系统。</p><a href="http://localhost:1952/menu.html" target="_blank" rel="noreferrer">在新窗口打开演示 -&gt;</a></div><div class="m-system-demo-frame"><iframe src="http://localhost:1952/menu.html" title="道路裂缝检测系统演示" loading="lazy"></iframe></div><small class="m-system-demo-note">演示地址：localhost:1952/menu.html · 请确保本地演示服务正在运行</small>';
    media.after(demo);
    return () => demo.remove();
  }, [project.slug]);
  useEffect(() => {
    const hero = document.querySelector('.m-detail-hero');
    if (!hero || hero.querySelector('.m-detail-back')) return undefined;
    const back = document.createElement('a');
    back.className = 'm-detail-back';
    back.href = `/work#${project.slug}`;
    back.innerHTML = '<span aria-hidden="true">&larr;</span> 返回作品总览 <small>BACK TO WORKS</small>';
    hero.prepend(back);
    return () => back.remove();
  }, [project.slug]);
  useEffect(() => {
    return undefined;
    const demo = document.querySelector('.m-system-demo');
    if (demo) demo.innerHTML = '<div class="m-section-kicker">/ \u73b0\u573a\u6f14\u793a / LIVE DEMO</div><div class="m-system-demo-head"><h2>\u9053\u8def\u88c2\u7f1d\u68c0\u6d4b\u7cfb\u7edf <i>ROAD CRACK DETECTION SYSTEM</i></h2><p>\u5c06\u539f\u59cb\u68c0\u6d4b\u754c\u9762\u63a5\u5165\u4f5c\u54c1\u53d9\u4e8b\uff0c\u4e0b\u9762\u7684\u7a97\u53e3\u53ef\u4ee5\u76f4\u63a5\u64cd\u4f5c\u6f14\u793a\u7cfb\u7edf\u3002</p><a href="http://localhost:1952/menu.html" target="_blank" rel="noreferrer">\u5728\u65b0\u7a97\u53e3\u6253\u5f00\u6f14\u793a -&gt;</a></div><div class="m-system-demo-frame"><iframe src="http://localhost:1952/menu.html" title="\u9053\u8def\u88c2\u7f1d\u68c0\u6d4b\u7cfb\u7edf\u6f14\u793a" loading="lazy"></iframe></div><small class="m-system-demo-note">\u6f14\u793a\u5730\u5740\uff1alocalhost:1952/menu.html / \u8bf7\u786e\u4fdd\u672c\u5730\u6f14\u793a\u670d\u52a1\u6b63\u5728\u8fd0\u884c</small>';
  }, [project.slug]);
  useEffect(() => {
    const link = document.querySelector('.m-detail-copy .m-underlink');
    if (link) link.href = `/work#${project.slug}`;
  }, [project.slug]);
  const next = overviewProjects[(overviewProjects.findIndex((item) => item.slug === project.slug) + 1) % overviewProjects.length];
  return <div className="majd-site m-project-page"><SiteNav /><main><section className={`m-detail-hero ${project.tone}`}><div className="m-section-kicker">/ {`\u4f5c\u54c1`} {project.n} / {project.year}</div><h1><SplitText>{project.titleCn}</SplitText><i>{project.title}</i></h1><p>{project.intro}</p><div className="m-detail-meta"><span>{project.type}</span><span>{project.role}</span><span><span dangerouslySetInnerHTML={{ __html: name }} /> / {`\u6b66\u6c49\uff0c\u4e2d\u56fd`}</span></div></section><section className="m-detail-media"><ProjectVisual project={project} large /><div className="m-detail-caption"><span>{`\u9879\u76ee\u5f71\u7247`}</span><p>{`\u5f71\u7247\u5c55\u793a\u9879\u76ee\u7684\u5b9e\u9645\u8fd0\u884c\u6548\u679c\uff0c\u70b9\u51fb\u64ad\u653e\u53ef\u542f\u7528\u58f0\u97f3\u3002`}</p></div></section><section className="m-detail-copy"><div className="m-section-kicker">/ {`\u9879\u76ee\u4ecb\u7ecd`}</div><div><h2>{project.titleCn}{` \u662f\u4e00\u6b21\u8ba9\u60f3\u6cd5 `}<i>{`\u53d8\u5f97\u53ef\u611f\u7684\u5b9e\u8df5\u3002`}</i></h2><p>{project.detail}</p><a className="m-underlink" href="/work">{`\u8fd4\u56de\u5168\u90e8\u4f5c\u54c1`} <Arrow /></a></div></section><section className="m-next-project"><span>{`\u4e0b\u4e00\u4e2a\u4f5c\u54c1`}</span><a href={`/work/${next.slug}`}><small>{next.n} / {next.type}</small><h2>{next.titleCn}<small>{next.title}</small> <Arrow /></h2></a></section></main><SiteFooter /></div>;
}

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error) {
    console.error('Portfolio render error:', error);
  }

  render() {
    if (this.state.error) {
      return <main style={{ minHeight: '100vh', padding: '80px 8vw', background: '#f1f0e8', color: '#111', fontFamily: 'DM Mono, monospace' }}><h1 style={{ fontSize: 'clamp(32px, 6vw, 80px)' }}>页面加载失败</h1><p>请刷新页面；如果问题持续，请重启开发服务器。</p><pre style={{ marginTop: 30, whiteSpace: 'pre-wrap', color: '#a33' }}>{this.state.error.message}</pre></main>;
    }
    return <App />;
  }
}

function App() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  useEffect(() => {
    if (path === '/work') {
      document.title = `\u4f5c\u54c1 / SELECTED PROJECTS \u00b7 \u4f46\u5149\u6cfd\u4f5c\u54c1\u96c6`;
    } else if (path.startsWith('/work/')) {
      const project = projects.find((item) => item.slug === path.slice('/work/'.length));
      document.title = project ? `${project.titleCn} \u00b7 \u4f46\u5149\u6cfd\u4f5c\u54c1\u96c6` : `\u4f5c\u54c1 / SELECTED PROJECTS \u00b7 \u4f46\u5149\u6cfd\u4f5c\u54c1\u96c6`;
    } else {
      document.title = `\u4f46\u5149\u6cfd \u00b7 Guangze Dan \u2014 \u4ea4\u4e92\u8bbe\u8ba1\u5e08 / \u521b\u610f\u6280\u672f\u4f5c\u54c1\u96c6`;
    }
  }, [path]);
  let page;
  if (path === '/work') {
    page = <WorkPage />;
  } else if (path.startsWith('/work/')) {
    const project = projects.find((item) => item.slug === path.slice('/work/'.length));
    page = project ? <ProjectPage project={project} /> : <WorkPage />;
  } else {
    page = <HomePage />;
  }
  return (
    <>
      <ScrollProgress />
      <Noise />
      <ClickSpark />
      <CustomCursor />
      <TrailCursor />
      {page}
    </>
  );
}

createRoot(document.getElementById('root')).render(<AppErrorBoundary />);
