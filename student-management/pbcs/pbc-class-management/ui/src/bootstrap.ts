// Bootstrap entry — export default cho App Shell (Module Federation)
// App Shell load './bootstrap' để mount PBC vào main-content
// StandaloneApp chỉ dùng khi chạy dev độc lập (npm run dev trong pbc folder)
import ClassListSlot from './slots/ClassListSlot';

export default ClassListSlot;
export * from './index';
