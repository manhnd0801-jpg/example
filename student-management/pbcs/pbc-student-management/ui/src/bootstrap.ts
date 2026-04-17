// Bootstrap entry — export default cho App Shell (Module Federation)
// App Shell load './bootstrap' để mount PBC vào main-content
// StandaloneApp chỉ dùng khi chạy dev độc lập (npm run dev trong pbc folder)
import StudentListSlot from './slots/StudentListSlot';

export default StudentListSlot;
export * from './index';
