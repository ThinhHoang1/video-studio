/**
 * Thư viện mẫu hành động + tiện ích chuyển động V2 — một cửa import cho renderer.
 *   import {sinhAct, trangThaiTai, MAU, zoomGag, popScale, layTuThe} from '../act';
 */
export {MAU, TEN_MAU, MAU_MO_TA} from './mau';
export type {TrangThaiAct, MocAct, Mau, DauVaoMau, ThamSoMau} from './mau';
export {sinhAct, trangThaiTai, trangThaiDienVien, coMau} from './ap-dung';
export type {HanhDongAct} from './ap-dung';
export {POP_SCALE, popScale, ZOOM_GAG, zoomGag, zoomGagFrame, nhipTrang, holdFrame, holdGiay, nhipHold, chiaBeat} from './camera';
export {TU_THE_MAY, layTuThe, coTuThe} from './tu-the-may';
export {FPS, W, H, frameCua, giayCua, HOLD, NHIP_TRANG, PX_CHAY, PX_DI, GIU_CHAY, GIU_DI, VUOT, NGOAI_KHUNG, LUI_LAO} from './nhip';
export type {MucHold, MucNhipTrang} from './nhip';
