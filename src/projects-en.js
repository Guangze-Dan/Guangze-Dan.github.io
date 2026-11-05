// 作品数据的英文文案：英文模式下中文与英文互换权重（英文做主标题，中文做副标题）
// 只有这里列出的条目会切换；未列出的保持原样
export const PROJECT_EN = {
  'animating-the-invisible': {
    title: 'Making the Invisible Visible',
    type: 'MA project / audiovisual work',
    role: 'Research / motion / sound',
    text: 'A research-led moving image work that makes hidden forces and feelings perceptible.',
    intro: 'Making the Invisible Visible asks how audiovisual experience can give form to forces that are usually only felt, never seen.',
    detail: 'My MA graduation project: observation, animation, sound and creative coding turn an invisible system into an atmospheric journey you can sense.',
  },
  wish: {
    title: 'The Wish',
    type: 'Game / world building',
    role: 'Game design / world building / interaction',
    text: 'A playable world shaped by atmosphere, character and environmental storytelling.',
    intro: 'The Wish is a game world about movement, encounters and small choices.',
    detail: 'Visual language, environmental logic and interaction rhythm were developed into one coherent system, so the story is discovered through play.',
  },
  project: {
    title: 'Road Crack Detection System',
    type: 'Interactive web / creative code',
    role: 'Interaction / web design / creative coding',
    text: 'An experimental digital space where information becomes something to explore.',
    intro: 'Road Crack Detection combines AI detection with geospatial data in an interactive experiment.',
    detail: 'Responsive layout, motion and visual hierarchy are used as an experiment, keeping the interface restrained so content stays central.',
  },
  'sanhe-drifters': {
    title: 'Sanhe Drifters',
    type: 'Moving image / sound',
    role: 'Film / sound / edit',
    text: 'An audiovisual study of place, memory and everyday movement.',
    intro: 'Sanhe Drifters is a moving image study of everyday movement, distance and the feeling of being between two places.',
    detail: 'Fragments, rhythm and ambient sound replace a fixed storyline, letting a sense of place build up through observation.',
  },
  'caes-multiscale-cavern': {
    title: 'Multi-scale Cavern Cyclic Pressure Test',
    type: 'Research engineering / physical model test',
    role: 'Project lead / test design',
    text: 'A combined UPVC main cavern, multi-scale flexible caverns and discontinuous precast crack zones that reproduces the loading environment of a CAES cavern group.',
    intro: 'An extension test under the NSFC regional joint fund, studying cavern response and damage evolution under cyclic internal pressure.',
    detail: 'As project lead I built the combined test system — UPVC main cavern, multi-scale flexible caverns and discontinuous precast crack zones — to reproduce the real loading environment of a CAES cavern group at large model scale. Staged pressurisation and cyclic charge/discharge parameters (pressure path, rate, cycle count) are controlled precisely while stress and strain transfer and damage evolution in the crack zones are monitored synchronously, revealing how multi-scale caverns and crack configurations govern the rock response.',
  },
  'abandoned-mine-caes': {
    title: 'Abandoned Mine CAES Storage',
    type: 'Research engineering / reliability assessment',
    role: 'Technical lead',
    text: 'An NSFC project: a large model platform for rock degradation in a storage cavern, studying degradation, fatigue and air tightness under cyclic loading.',
    intro: 'Stability and air-tightness of an abandoned-mine compressed air store, with reliability assessment — an NSFC regional joint fund project.',
    detail: 'Part of the NSFC regional joint fund. As technical lead I helped build the large model platform for rock degradation: the test reproduces the loading environment of a lined CAES store, controls cyclic loading parameters (amplitude, frequency, cycle count) and rate precisely, and monitors mechanical response and damage evolution to study degradation, fatigue, damage and crack distribution — supporting operating decisions and reliability assessment.',
  },
  'hp-flexible-sealing': {
    title: 'High-Pressure Flexible Sealing Test',
    type: 'Research engineering / test plan and platform design',
    role: 'Test plan / platform structure design',
    text: 'A 20 MPa anti-seepage test plan and platform for the sealing needs of a CAES store, commissioned by Chengdu Engineering Corporation.',
    intro: 'Anti-seepage performance of a high-pressure flexible sealing system for CAES — commissioned by PowerChina Chengdu Engineering Corporation.',
    detail: 'For PowerChina Chengdu Engineering I wrote the 20 MPa test plan and designed the platform: flexible sealing bag, polyurethane fill and steel reaction barrel. The 500 mm barrel was structurally calculated and its pressure boundary checked (22 MPa design, 24 × M48 studs). I defined stepped pressurisation (0.5–20 MPa), constant-pressure holds and cyclic loading, integrated pressure, humidity and strain channels with overpressure interlock, and set up the comparison of three candidate materials with failure criteria.',
  },
  'ds-final': {
    title: 'DS Final',
    type: 'Sound design / audio case',
    role: 'Sound design',
    text: 'A sound design case study.',
  },
  'the-most-of-us': {
    title: 'The Most of Us',
    type: 'Interactive narrative / Twine',
    role: 'Narrative / interaction',
    text: 'An interactive Twine narrative about migration, labour and social mobility.',
  },
  'guangze-project-demo': {
    title: 'GuangzeDan Project Demo',
    type: 'Unreal Engine / BIM / animation',
    role: 'UE5 / BIM / animation',
    text: 'A Yorkshire BIM walkthrough built with a homemade animation editor in UE5.',
  },
  'solar-hater': {
    title: 'Solar Hater',
    type: 'Moving image / visual experiment',
    role: 'Motion / visual',
    text: 'An audiovisual experiment on light, shadow and environment.',
  },
  'student-roamer': {
    title: 'Student Roamer',
    type: 'Service design / interface',
    role: 'Service design / UI',
    text: 'An experience design that helps students discover places in a city.',
  },
  'railway-museum-storytelling': {
    title: 'Interactive Storytelling for National Railway Museum',
    type: 'Museum interaction / public experience',
    role: 'Interaction / exhibit design',
    text: 'An interactive storytelling experience designed for the National Railway Museum.',
  },
  'yun-house': {
    title: 'Yun House',
    type: 'Web experience / digital environment',
    role: 'Web / interaction',
    text: 'A digital environment built around the atmosphere of a space.',
  },
};

// 就地切换：英文模式把英文放到主标题位，中文降为副标题；中文模式完全还原
export function localizeProject(p, lang) {
  const en = PROJECT_EN[p.slug];
  if (!en) return p;
  if (!p.__zh) {
    p.__zh = { title: p.title, titleCn: p.titleCn, type: p.type, role: p.role, text: p.text, intro: p.intro, detail: p.detail };
  }
  if (lang === 'en') {
    p.titleCn = en.title || p.__zh.title;
    p.title = p.__zh.titleCn;            // 副标题变成中文
    p.type = en.type || p.__zh.type;
    p.role = en.role || p.__zh.role;
    p.text = en.text || p.__zh.text;
    if (p.__zh.intro) p.intro = en.intro || p.__zh.intro;
    if (p.__zh.detail) p.detail = en.detail || p.__zh.detail;
  } else {
    Object.assign(p, p.__zh);
  }
  return p;
}

export function localizeProjects(list, lang) {
  list.forEach((p) => localizeProject(p, lang));
  return list;
}
