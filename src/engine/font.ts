import {loadFont} from '@remotion/google-fonts/BeVietnamPro';

// Be Vietnam Pro: sans-serif thiết kế riêng cho tiếng Việt — dấu không bị đè
// lên nhau ở weight 900 như các font Latin.
const {fontFamily} = loadFont('normal', {weights: ['400', '700', '800', '900'], subsets: ['vietnamese', 'latin']});

export const FONT = `${fontFamily}, "Helvetica Neue", Arial, sans-serif`;
