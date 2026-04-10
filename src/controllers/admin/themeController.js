'use strict';

const settingService = require('../../services/settingService');

const PRESET_THEMES = [
  {
    id: 'rustic',
    name: 'Rustic Warmth',
    description: 'Warm browns and earthy tones — the default handcrafted feel.',
    preview: { primary: '#8B4513', accent: '#D4A574', bg: '#FDFAF6', text: '#2C1810' },
    vars: {
      themePrimary:      '#8B4513',
      themePrimaryLight: '#A0522D',
      themePrimaryDark:  '#6B3410',
      themeAccent:       '#D4A574',
      themeAccentLight:  '#F5E6D3',
      themeBg:           '#FDFAF6',
      themeBgWarm:       '#FEF6EE',
      themeText:         '#2C1810',
      themeTextMuted:    '#6B5A4E',
      themeBorder:       '#E8DDD4',
      themeHeroBgFrom:   '#FEF6EE',
      themeHeroBgMid:    '#F5E6D3',
      themeHeroBgTo:     '#EDD9C0',
      themeFooterBg:     '#1a1207',
    },
  },
  {
    id: 'midnight',
    name: 'Midnight Noir',
    description: 'Deep charcoal and gold — bold and luxurious.',
    preview: { primary: '#C9A84C', accent: '#E8C97A', bg: '#F8F8F6', text: '#1A1A1A' },
    vars: {
      themePrimary:      '#C9A84C',
      themePrimaryLight: '#D4B86A',
      themePrimaryDark:  '#A8892F',
      themeAccent:       '#E8C97A',
      themeAccentLight:  '#FAF3DC',
      themeBg:           '#F8F8F6',
      themeBgWarm:       '#F4F2EC',
      themeText:         '#1A1A1A',
      themeTextMuted:    '#555555',
      themeBorder:       '#E0DCCC',
      themeHeroBgFrom:   '#F4F2EC',
      themeHeroBgMid:    '#EEE9D8',
      themeHeroBgTo:     '#E5DEC4',
      themeFooterBg:     '#111111',
    },
  },
  {
    id: 'sage',
    name: 'Sage Garden',
    description: 'Soft greens and creams — fresh and organic.',
    preview: { primary: '#4A7C59', accent: '#8FBC8B', bg: '#F6FAF6', text: '#1A2E1A' },
    vars: {
      themePrimary:      '#4A7C59',
      themePrimaryLight: '#5E9470',
      themePrimaryDark:  '#376045',
      themeAccent:       '#8FBC8B',
      themeAccentLight:  '#E4F1E3',
      themeBg:           '#F6FAF6',
      themeBgWarm:       '#EEF6EE',
      themeText:         '#1A2E1A',
      themeTextMuted:    '#4A5E4A',
      themeBorder:       '#D4E6D4',
      themeHeroBgFrom:   '#EEF6EE',
      themeHeroBgMid:    '#E4F1E3',
      themeHeroBgTo:     '#D6E8D4',
      themeFooterBg:     '#1A2E1A',
    },
  },
  {
    id: 'slate',
    name: 'Slate & Blush',
    description: 'Cool slate grey with a soft blush accent.',
    preview: { primary: '#5B7FA6', accent: '#E8A89C', bg: '#F8F9FA', text: '#1E2A38' },
    vars: {
      themePrimary:      '#5B7FA6',
      themePrimaryLight: '#7095B8',
      themePrimaryDark:  '#446690',
      themeAccent:       '#E8A89C',
      themeAccentLight:  '#FAEAE7',
      themeBg:           '#F8F9FA',
      themeBgWarm:       '#F2F4F7',
      themeText:         '#1E2A38',
      themeTextMuted:    '#556070',
      themeBorder:       '#DDE3EB',
      themeHeroBgFrom:   '#F2F4F7',
      themeHeroBgMid:    '#EAEEF4',
      themeHeroBgTo:     '#DFEAF5',
      themeFooterBg:     '#1E2A38',
    },
  },
  {
    id: 'rose',
    name: 'Rose & Ivory',
    description: 'Romantic dusty rose with warm ivory backgrounds.',
    preview: { primary: '#B5636A', accent: '#E8A0A6', bg: '#FDFBF9', text: '#2E1A1A' },
    vars: {
      themePrimary:      '#B5636A',
      themePrimaryLight: '#C97880',
      themePrimaryDark:  '#964F55',
      themeAccent:       '#E8A0A6',
      themeAccentLight:  '#FAECEE',
      themeBg:           '#FDFBF9',
      themeBgWarm:       '#FBF4F4',
      themeText:         '#2E1A1A',
      themeTextMuted:    '#6E4E50',
      themeBorder:       '#EEE0E0',
      themeHeroBgFrom:   '#FBF4F4',
      themeHeroBgMid:    '#F8ECEC',
      themeHeroBgTo:     '#F2E0E2',
      themeFooterBg:     '#2E1A1A',
    },
  },
  {
    id: 'custom',
    name: 'Custom',
    description: 'Define your own colors.',
    preview: null,
    vars: null,
  },
];

const CUSTOM_VAR_KEYS = [
  { key: 'themePrimary',      label: 'Primary Color',         hint: 'Buttons, links, accents' },
  { key: 'themePrimaryDark',  label: 'Primary (Dark)',         hint: 'Hover states' },
  { key: 'themeAccent',       label: 'Accent Color',           hint: 'Badges, highlights' },
  { key: 'themeAccentLight',  label: 'Accent (Light)',         hint: 'Background tints' },
  { key: 'themeBg',           label: 'Page Background',        hint: 'Main background' },
  { key: 'themeBgWarm',       label: 'Section Background',     hint: 'Alternate sections' },
  { key: 'themeText',         label: 'Body Text',              hint: 'Main text color' },
  { key: 'themeTextMuted',    label: 'Muted Text',             hint: 'Subtitles, captions' },
  { key: 'themeBorder',       label: 'Border Color',           hint: 'Dividers, card borders' },
  { key: 'themeFooterBg',     label: 'Footer Background',      hint: 'Footer background' },
];

exports.PRESET_THEMES = PRESET_THEMES;

exports.index = async (req, res, next) => {
  try {
    const activeThemeId = await settingService.getSetting('activeTheme') || 'rustic';
    const customVars = {};
    for (const { key } of CUSTOM_VAR_KEYS) {
      customVars[key] = await settingService.getSetting(key) || '';
    }
    res.render('admin/theme/index', {
      title: 'Theme',
      presets: PRESET_THEMES,
      activeThemeId,
      customVars,
      customVarKeys: CUSTOM_VAR_KEYS,
    });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { themeId, ...customColors } = req.body;

    await settingService.upsertSetting('activeTheme', themeId || 'rustic');

    if (themeId === 'custom') {
      // Save each custom color
      for (const { key } of CUSTOM_VAR_KEYS) {
        if (customColors[key]) {
          await settingService.upsertSetting(key, customColors[key]);
        }
      }
    } else {
      // Apply preset vars into settings so they're available globally
      const preset = PRESET_THEMES.find(p => p.id === themeId);
      if (preset && preset.vars) {
        for (const [key, value] of Object.entries(preset.vars)) {
          await settingService.upsertSetting(key, value);
        }
      }
    }

    req.flash('success', 'Theme saved.');
    res.redirect('/admin/theme');
  } catch (err) {
    next(err);
  }
};
