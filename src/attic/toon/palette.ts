/** Bảng màu kiểu hoạt hình Việt: sáng, ấm, bão hoà, viền đen dày. */
export const T = {
  line: '#1a1410',
  cream: '#fff6e5',
  paper: '#ffffff',

  // da / lông nhân vật
  cow: '#c9a06a',
  cowDark: '#a8804c',
  bear: '#8b5a34',
  bearDark: '#6d4426',
  muzzle: '#f4a9b8',
  muzzleDark: '#e0899c',

  // áo quần
  green: '#2f7d4f',
  red: '#d93a3a',
  blue: '#3f6fd8',
  purple: '#6b4fa8',
  denim: '#4a6fa5',

  // bối cảnh
  wood: '#c98f4f',
  woodDark: '#a06f38',
  wall: '#e8c98f',
  awning: '#3d7a4a',
  sky: '#8fd0f0',
  grass: '#6fbf5a',
  floor: '#d9a55f',

  // nhấn
  gold: '#ffc31f',
  money: '#8fd48f',
  moneyDark: '#5da85d',
  alert: '#ff3b30',
  shadow: 'rgba(0,0,0,0.18)',
};

export const LINE = {
  stroke: T.line,
  strokeWidth: 6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

export const LINE_THIN = {...LINE, strokeWidth: 4} as const;
export const LINE_FAT = {...LINE, strokeWidth: 9} as const;
