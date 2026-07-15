import { useState, useEffect, useCallback } from "react";

// ─── Storage compatibility shim ────────────────────────────────────────────────
// window.storage only exists inside Claude.ai's Artifact preview. When this app
// runs standalone (e.g. deployed on Vercel), we transparently fall back to
// localStorage so every window.storage.get/set call in the app keeps working.
if (typeof window !== "undefined" && !window.storage) {
  window.storage = {
    async get(key) {
      try {
        const raw = localStorage.getItem(key);
        return raw === null ? null : { key, value: raw };
      } catch {
        return null;
      }
    },
    async set(key, value) {
      try {
        localStorage.setItem(key, value);
        return { key, value };
      } catch {
        return null;
      }
    },
    async delete(key) {
      try {
        localStorage.removeItem(key);
        return { key, deleted: true };
      } catch {
        return null;
      }
    },
    async list(prefix) {
      try {
        const keys = Object.keys(localStorage).filter(k => !prefix || k.startsWith(prefix));
        return { keys };
      } catch {
        return { keys: [] };
      }
    },
  };
}

// ─── i18n ─────────────────────────────────────────────────────────────────────
const T = {
  zh: {
    appName:"ES Online Course Platform", login:"登入", logout:"登出", username:"帳號", password:"密碼",
    loginBtn:"登入", loginError:"帳號或密碼錯誤",
    role_student:"學生", role_teacher:"老師", role_admin:"管理員",
    weekSchedule:"本週課表", teacher:"老師", student:"學生", time:"時間",
    join:"加入會議", material:"教材", noClass:"本週無課程",
    days:["週一","週二","週三","週四","週五","週六","週日"],
    daysShort:["一","二","三","四","五","六","日"],
    subject:"科目", adminPanel:"管理後台",
    addCourse:"新增課程", editCourse:"編輯", deleteCourse:"刪除", save:"儲存", cancel:"取消",
    confirmDelete:"確認刪除此課程？", courseAdded:"課程已新增", courseUpdated:"課程已更新", courseDeleted:"課程已刪除",
    selectDay:"選擇星期（可多選）", startTime:"開始時間", endTime:"結束時間（自動計算）",
    selectTeacher:"選擇老師", selectStudent:"選擇學生",
    subjectName:"課程名稱", meetingUrl:"會議連結 (URL)",
    manageUsers:"帳號管理", addUser:"新增帳號", name:"姓名", roleLabel:"角色",
    courses:"課程管理", tabSchedule:"課表", tabAdmin:"後台管理",
    deleteUser:"刪除", confirmDeleteUser:"確認刪除此帳號？",
    userAdded:"帳號已新增", userDeleted:"帳號已刪除", passwordLabel:"密碼", langToggle:"English",
    calendarView:"行事曆", listView:"清單",
    duration:"課程長度", min25:"25 分鐘", min50:"50 分鐘",
    absent:"請假", absentTooLate:"距離上課時間不足60分鐘，無法請假",
    absentNotif:"請假通知", absentAlready:"已請假",
    teacherStats:"老師統計", studentStats:"學生統計",
    selectTeacherStats:"選擇老師", selectStudentStats:"選擇學生",
    completedClasses:"完課數", absentClasses:"請假數", totalClasses:"總排課",
    studentAbsent:"學生請假", teacherAbsent:"老師請假",
    editUser:"編輯", editUserTitle:"編輯帳號", newPassword:"新密碼（留空不更改）",
    userUpdated:"帳號已更新",
    sessionsPerWeek:"每週堂數",
    autoSubjectHint:"預設：ES English Study - 學生 and 老師",
    absentModal:"請假確認", absentModalDesc:"以下通知將同時發送給管理者：",
    absentSendEmail:"發送 Email", absentSendFB:"發送 Facebook 訊息", absentSendLINE:"發送 LINE 訊息",
    confirmAbsent:"確認送出請假",
    notifySuccess:"✓ 已通知管理者", leaveRecord:"請假紀錄",
    courseDetails:"課程明細", completedNote:"完課 = 總排課 − 請假數",
    absenceHistory:"請假紀錄", by:"by",
    // Materials
    materials:"教材管理", addMaterial:"新增教材", materialTitle:"教材名稱", materialUrl:"教材網址",
    materialDate:"上課日期", materialDesc:"備註（選填）", materialSaved:"教材已儲存",
    materialDeleted:"教材已刪除", confirmDeleteMaterial:"確認刪除此教材？",
    noMaterials:"尚無教材紀錄", openMaterial:"開啟",
    editMaterial:"編輯", manageMaterials:"管理教材",
    allMaterials:"所有教材", filterByDay:"依星期篩選", allDays:"全部",
    matCourse:"課程", matSortNewest:"最新優先", matSortOldest:"最舊優先",
    matCount:"筆教材", matForDay:"當天教材", matDayLabel:"上課日",
    matUrlCopied:"連結已複製", matCopy:"複製連結",
    // Batch materials
    batchMaterials:"批次教材管理", batchSelectStudent:"選擇學生", batchSelectTeacher:"選擇老師",
    batchHelp:"每列填寫一筆教材，指定星期與日期，可同時套用到多個課程",
    batchAddRow:"＋ 新增一列", batchSaveAll:"全部儲存", batchSaved:"已儲存 {n} 筆教材",
    batchSelectCourse:"篩選課程（可選）", batchAllCourses:"所有符合課程",
    batchMatchCourses:"符合的課程", today:"今天",
    // Enrollment & attendance
    enrollments:"付費與排課", addEnrollment:"新增付費記錄",
    payDate:"付款日期", totalSessions:"購買堂數", startDate:"起始上課日期",
    enrollSaved:"排課已儲存", enrollDeleted:"排課已刪除",
    previewSchedule:"預覽排課", confirmSchedule:"確認並儲存",
    scheduledDates:"排課日期預覽",
    absenceTypeLabel:"出缺勤類型",
    leaveExcused:"正規請假（順延）", leaveAbsent:"學生缺勤（扣課）",
    teacherLeaveExcused:"老師正規請假（順延）",
    markAttendance:"記錄出缺勤", attendanceSaved:"出缺勤已記錄",
    excusedLeave:"正規請假", absentDeducted:"缺勤扣課", teacherExcused:"老師假",
    totalPurchased:"購買總堂數", remaining:"剩餘堂數",
    noEnrollments:"尚無付費記錄",
    deferred:"順延",
    scheduleInfo:"排課資訊",
    sessionLabel:"第 {n} 堂",
    dateRange:"統計區間", dateFrom:"開始日期", dateTo:"結束日期",
    applyRange:"套用", allTime:"全部時間",
    statsFor:"統計對象",
    // Leave review
    leaveReview:"請假審核", leaveReviewAll:"全部人員", leaveReviewStudents:"學生請假",
    leaveReviewTeachers:"老師請假", leaveDate:"請假日", leaveType:"類型",
    leaveReason:"事由", leaveRequester:"請假人", leaveCourseName:"課程",
    noLeaveRecords:"目前無請假紀錄", attendanceRate:"出席率",
    leaveCount:"請假次數", absentCount:"缺勤次數", leaveOverview:"出缺勤總覽",
    filterAll:"全部", filterStudent:"學生", filterTeacher:"老師",
    adminSessionEdit:"編輯課堂狀態", sessionNormal:"正常上課",
    sessionStudentLeave:"學生請假（順延）", sessionTeacherLeave:"老師請假（順延）",
    sessionAbsent:"學生缺勤（扣課）", sessionOther:"其他備註",
    sessionNote:"備註說明（選填）", sessionSaved:"課堂狀態已儲存",
    sessionDeleted:"已清除課堂記錄", sessionStatus:"課堂狀態",
    clearRecord:"清除記錄",
    // Feedback (課後反饋)
    feedback:"課後反饋", feedbackShort:"反饋",
    feedbackLabel:"課後反饋 (Comments / Suggestions / New Vocabulary, Sentence)",
    feedbackPlaceholder:"這堂課的表現、建議、學到的新單字或例句…",
    feedbackWrite:"填寫反饋", feedbackEdit:"編輯反饋", feedbackView:"查看老師回饋",
    feedbackSave:"送出審核", feedbackSaved:"反饋已送出，待管理員審核",
    feedbackStatusPending:"審核中", feedbackStatusApproved:"已核准", feedbackStatusRejected:"已退回",
    feedbackNone:"尚未填寫反饋", feedbackApprove:"核准", feedbackReject:"退回",
    feedbackApproved:"已核准，學生現在看得到了", feedbackRejected:"已退回",
    feedbackReview:"反饋審核", feedbackReviewDesc:"檢視老師填寫的課後反饋，核准後學生才會看到",
    feedbackNoPending:"目前沒有待審核的反饋", feedbackAllReviewed:"全部反饋",
    feedbackBy:"填寫者", feedbackFor:"學生", feedbackDate:"上課日期",
    feedbackRejectReason:"退回原因（選填，會顯示給老師）",
    feedbackFromTeacher:"老師的課後反饋",
    // Batch feedback review & input
    feedbackSelectAll:"全選待審核", feedbackSelected:"已選 {n} 筆",
    feedbackBatchApprove:"批次核准", feedbackBatchReject:"批次退回",
    feedbackBatchApproved:"已核准 {n} 筆反饋", feedbackBatchRejected:"已退回 {n} 筆反饋",
    feedbackBatchInput:"批次輸入反饋", feedbackBatchInputDesc:"協助老師填寫：貼上 Excel 資料自動比對日期並建立反饋（直接核准，學生馬上看得到）",
    feedbackPasteHint:"直接從 Excel 複製並貼上（Tab 分隔，欄位順序：日期、反饋內容）",
    feedbackExcelCols:"日期 | Comments/Suggestions/New Vocabulary, Sentence",
    feedbackParseRows:"解析資料", feedbackImport:"匯入並核准",
    feedbackMatched:"已比對", feedbackNoMatch:"找不到對應課堂（略過）",
    feedbackSelectCourse:"選擇課程", feedbackImportDone:"已匯入 {n} 筆反饋",
    // Student directory
    studentDir:"學生資料庫", pasteFromExcel:"貼上 Excel 資料",
    pasteHint:"直接從 Excel 複製並貼上（Tab 分隔，欄位順序：英文姓名、中文姓名、年齡、首次登記日、正式上課日、課程長度）",
    excelCols:"英文姓名 | 中文姓名 | 年齡 | 首次登記日 | 正式上課日 | 課程長度",
    parseRows:"解析資料", parsedPreview:"解析結果預覽",
    createAccounts:"建立選取帳號", selectAll:"全選", deselectAll:"取消全選",
    accountCreated:"帳號已建立", accountExists:"帳號已存在",
    randomPwd:"預設密碼（可至帳號管理修改）",
    dirStudentName:"英文姓名", dirCnName:"中文姓名", dirAge:"年齡",
    dirRegDate:"首次登記日", dirStartDate:"正式上課日", dirDuration:"課程長度",
    dirStatus:"帳號狀態", dirHasAccount:"已建立", dirNoAccount:"未建立",
    importDone:"{n} 個帳號已建立",
    stuDirList:"學生列表",
    dirManualSessions:"手動積分", dirRegYear:"加入年份",
    dirAddManual:"手動新增學生", dirEdit:"編輯", dirSave:"儲存",
    dirAgeDisplay:"歲", dirAgeFormat:"{current}（{year}：{join}加入）",
    // Student progress
    myProgress:"我的學習進度",
    mySchedule:"本週課表",
    totalSessions:"累積完課",
    fullSession:"堂",
    halfSession:"半堂",
    fullLabel:"完整堂（50分）",
    halfLabel:"迷你堂（25分）",
    progressBadge:"目前等級",
    nextBadge:"下一個等級",
    sessionsToNext:"還差",
    sessionsToNextUnit:"堂就升級！",
    alreadyMax:"已達最高等級 🏆",
    bronze:"銅牌 Bronze",silver:"銀牌 Silver",gold:"金牌 Gold",
    platinum:"白金 Platinum",diamond:"鑽石 Diamond",
    badgeProgress:"距離 {badge} 還差 {n} 堂！",
    completedHint:"持續上課，累積更多堂數，解鎖下一個等級！",
    sessionBreakdown:"堂數明細",
  },
  en: {
    appName:"ES Online Course Platform", login:"Login", logout:"Logout", username:"Username", password:"Password",
    loginBtn:"Sign In", loginError:"Invalid username or password",
    role_student:"Student", role_teacher:"Teacher", role_admin:"Admin",
    weekSchedule:"This Week's Schedule", teacher:"Teacher", student:"Student", time:"Time",
    join:"Join", material:"Materials", noClass:"No classes this week",
    days:["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
    daysShort:["M","T","W","T","F","S","S"],
    subject:"Subject", adminPanel:"Admin Panel",
    addCourse:"Add Course", editCourse:"Edit", deleteCourse:"Delete", save:"Save", cancel:"Cancel",
    confirmDelete:"Delete this course?", courseAdded:"Course added", courseUpdated:"Course updated", courseDeleted:"Course deleted",
    selectDay:"Day of Week (multi-select)", startTime:"Start Time", endTime:"End Time (auto)",
    selectTeacher:"Teacher", selectStudent:"Student",
    subjectName:"Course Name", meetingUrl:"Meeting URL",
    manageUsers:"User Management", addUser:"Add User", name:"Full Name", roleLabel:"Role",
    courses:"Courses", tabSchedule:"Schedule", tabAdmin:"Admin",
    deleteUser:"Delete", confirmDeleteUser:"Delete this user?",
    userAdded:"User added", userDeleted:"User deleted", passwordLabel:"Password", langToggle:"中文",
    calendarView:"Calendar", listView:"List",
    duration:"Duration", min25:"25 min", min50:"50 min",
    absent:"Request Leave", absentTooLate:"Cannot request leave within 60 min of class",
    absentNotif:"Leave Notice", absentAlready:"Absent",
    teacherStats:"Teacher Stats", studentStats:"Student Stats",
    selectTeacherStats:"Select Teacher", selectStudentStats:"Select Student",
    completedClasses:"Completed", absentClasses:"Absences", totalClasses:"Total Scheduled",
    studentAbsent:"Student Leave", teacherAbsent:"Teacher Leave",
    editUser:"Edit", editUserTitle:"Edit User", newPassword:"New Password (blank = no change)",
    userUpdated:"User updated",
    sessionsPerWeek:"Sessions/Week",
    autoSubjectHint:"Default: ES English Study - Student and Teacher",
    absentModal:"Confirm Leave", absentModalDesc:"The following will be sent to admin:",
    absentSendEmail:"Send Email", absentSendFB:"Send Facebook Message", absentSendLINE:"Send LINE Message",
    confirmAbsent:"Confirm Leave Request",
    notifySuccess:"✓ Admin notified", leaveRecord:"Leave Record",
    courseDetails:"Course Details", completedNote:"Completed = Total − Absences",
    absenceHistory:"Absence History", by:"by",
    // Materials
    materials:"Materials", addMaterial:"Add Material", materialTitle:"Title", materialUrl:"URL",
    materialDate:"Class Date", materialDesc:"Notes (optional)", materialSaved:"Material saved",
    materialDeleted:"Material deleted", confirmDeleteMaterial:"Delete this material?",
    noMaterials:"No materials yet", openMaterial:"Open",
    editMaterial:"Edit", manageMaterials:"Manage Materials",
    allMaterials:"All Materials", filterByDay:"Filter by Day", allDays:"All",
    matCourse:"Course", matSortNewest:"Newest first", matSortOldest:"Oldest first",
    matCount:"materials", matForDay:"Today's materials", matDayLabel:"Class day",
    matUrlCopied:"Link copied", matCopy:"Copy link",
    // Batch materials
    batchMaterials:"Batch Material Manager", batchSelectStudent:"Select Student", batchSelectTeacher:"Select Teacher",
    batchHelp:"Each row is one material entry. Set the day and date, then save to all matching courses.",
    batchAddRow:"+ Add Row", batchSaveAll:"Save All", batchSaved:"{n} materials saved",
    batchSelectCourse:"Filter by Course (optional)", batchAllCourses:"All Matching Courses",
    batchMatchCourses:"Matching Courses", today:"Today",
    // Enrollment & attendance
    enrollments:"Payments & Schedule", addEnrollment:"Add Payment Record",
    payDate:"Payment Date", totalSessions:"Sessions Purchased", startDate:"Course Start Date",
    enrollSaved:"Schedule saved", enrollDeleted:"Record deleted",
    previewSchedule:"Preview Schedule", confirmSchedule:"Confirm & Save",
    scheduledDates:"Scheduled Dates Preview",
    absenceTypeLabel:"Attendance Type",
    leaveExcused:"Excused Leave (deferred)", leaveAbsent:"Unexcused Absence (deducted)",
    teacherLeaveExcused:"Teacher Leave (deferred)",
    markAttendance:"Record Attendance", attendanceSaved:"Attendance saved",
    excusedLeave:"Excused Leave", absentDeducted:"Absent (deducted)", teacherExcused:"Teacher Leave",
    totalPurchased:"Total Purchased", remaining:"Remaining",
    noEnrollments:"No payment records yet",
    deferred:"Deferred",
    scheduleInfo:"Schedule Info",
    sessionLabel:"Session {n}",
    dateRange:"Date Range", dateFrom:"From", dateTo:"To",
    applyRange:"Apply", allTime:"All Time",
    statsFor:"Stats For",
    // Leave review
    leaveReview:"Leave Review", leaveReviewAll:"Everyone", leaveReviewStudents:"Student Leave",
    leaveReviewTeachers:"Teacher Leave", leaveDate:"Date", leaveType:"Type",
    leaveReason:"Reason", leaveRequester:"Requested By", leaveCourseName:"Course",
    noLeaveRecords:"No leave records yet", attendanceRate:"Attendance Rate",
    leaveCount:"Leave Count", absentCount:"Absent Count", leaveOverview:"Attendance Overview",
    filterAll:"All", filterStudent:"Students", filterTeacher:"Teachers",
    adminSessionEdit:"Edit Session Status", sessionNormal:"Normal (attended)",
    sessionStudentLeave:"Student Leave (deferred)", sessionTeacherLeave:"Teacher Leave (deferred)",
    sessionAbsent:"Absent (deducted)", sessionOther:"Other / Note only",
    sessionNote:"Notes (optional)", sessionSaved:"Session status saved",
    sessionDeleted:"Record cleared", sessionStatus:"Session Status",
    clearRecord:"Clear Record",
    // Feedback
    feedback:"Post-Class Feedback", feedbackShort:"Feedback",
    feedbackLabel:"Post-Class Feedback (Comments / Suggestions / New Vocabulary, Sentence)",
    feedbackPlaceholder:"How the student did, suggestions, new vocabulary or sentences learned…",
    feedbackWrite:"Write Feedback", feedbackEdit:"Edit Feedback", feedbackView:"View Teacher's Feedback",
    feedbackSave:"Submit for Review", feedbackSaved:"Feedback submitted, awaiting admin review",
    feedbackStatusPending:"Pending Review", feedbackStatusApproved:"Approved", feedbackStatusRejected:"Rejected",
    feedbackNone:"No feedback yet", feedbackApprove:"Approve", feedbackReject:"Reject",
    feedbackApproved:"Approved — now visible to the student", feedbackRejected:"Rejected",
    feedbackReview:"Feedback Review", feedbackReviewDesc:"Review feedback teachers have submitted — approved ones become visible to students",
    feedbackNoPending:"No feedback pending review", feedbackAllReviewed:"All Feedback",
    feedbackBy:"Submitted by", feedbackFor:"Student", feedbackDate:"Class Date",
    feedbackRejectReason:"Reason for rejection (optional, shown to teacher)",
    feedbackFromTeacher:"Teacher's Feedback",
    // Batch feedback review & input
    feedbackSelectAll:"Select all pending", feedbackSelected:"{n} selected",
    feedbackBatchApprove:"Batch Approve", feedbackBatchReject:"Batch Reject",
    feedbackBatchApproved:"{n} feedback approved", feedbackBatchRejected:"{n} feedback rejected",
    feedbackBatchInput:"Batch Input Feedback", feedbackBatchInputDesc:"Help teachers fill it in: paste Excel data, dates auto-match sessions and get approved instantly (visible to students right away)",
    feedbackPasteHint:"Paste directly from Excel (Tab-separated, columns: Date, Feedback text)",
    feedbackExcelCols:"Date | Comments/Suggestions/New Vocabulary, Sentence",
    feedbackParseRows:"Parse Rows", feedbackImport:"Import & Approve",
    feedbackMatched:"Matched", feedbackNoMatch:"No matching session (skipped)",
    feedbackSelectCourse:"Select Course", feedbackImportDone:"{n} feedback imported",
    // Student directory
    studentDir:"Student Directory", pasteFromExcel:"Paste from Excel",
    pasteHint:"Paste directly from Excel (Tab-separated, columns: English Name, Chinese Name, Age, First Registration Date, Course Start Date, Duration)",
    excelCols:"English Name | Chinese Name | Age | Reg. Date | Start Date | Duration",
    parseRows:"Parse Data", parsedPreview:"Preview",
    createAccounts:"Create Selected Accounts", selectAll:"Select All", deselectAll:"Deselect All",
    accountCreated:"Account Created", accountExists:"Already Exists",
    randomPwd:"Default password (changeable in User Management)",
    dirStudentName:"English Name", dirCnName:"Chinese Name", dirAge:"Age",
    dirRegDate:"Reg. Date", dirStartDate:"Start Date", dirDuration:"Duration",
    dirStatus:"Account", dirHasAccount:"Created", dirNoAccount:"Not yet",
    importDone:"{n} account(s) created",
    stuDirList:"Student List",
    dirManualSessions:"Manual Points", dirRegYear:"Join Year",
    dirAddManual:"Add Student", dirEdit:"Edit", dirSave:"Save",
    dirAgeDisplay:"yrs", dirAgeFormat:"{current}（{year}: joined at {join}）",
    // Student progress
    myProgress:"My Progress",
    mySchedule:"This Week",
    totalSessions:"Completed Sessions",
    fullSession:"session",
    halfSession:"half",
    fullLabel:"Full session (50 min)",
    halfLabel:"Mini session (25 min)",
    progressBadge:"Current Badge",
    nextBadge:"Next Badge",
    sessionsToNext:"Only",
    sessionsToNextUnit:"more sessions to go!",
    alreadyMax:"Maximum badge achieved 🏆",
    bronze:"Bronze",silver:"Silver",gold:"Gold",
    platinum:"Platinum",diamond:"Diamond",
    badgeProgress:"{n} sessions away from {badge}!",
    completedHint:"Keep going to unlock the next badge!",
    sessionBreakdown:"Breakdown",
  },
};

const COLORS = [
  {bg:"#E3F2FD",border:"#1565C0",text:"#0D47A1"},
  {bg:"#E8F5E9",border:"#4CAF50",text:"#1B5E20"},
  {bg:"#FFF3E0",border:"#E65100",text:"#BF360C"},
  {bg:"#FCE4EC",border:"#C2185B",text:"#880E4F"},
  {bg:"#EDE7F6",border:"#5E35B1",text:"#311B92"},
  {bg:"#FBE9E7",border:"#BF360C",text:"#BF360C"},
];

const DEFAULT_USERS = [
  {id:"u1",username:"admin",password:"admin123",name:"Admin 管理員",role:"admin"},
  {id:"u2",username:"teacher1",password:"pass123",name:"王大明",role:"teacher"},
  {id:"u3",username:"teacher2",password:"pass123",name:"林小華",role:"teacher"},
  {id:"u4",username:"student1",password:"pass123",name:"陳美玲",role:"student"},
  {id:"u5",username:"student2",password:"pass123",name:"張志偉",role:"student"},
  {id:"u6",username:"student3",password:"pass123",name:"李雅婷",role:"student"},
];

const DEFAULT_COURSES = [
  {id:"c1",subject:"ES English Study - 陳美玲 and 王大明",teacherId:"u2",studentId:"u4",days:[0,2,4],start:"09:00",duration:50,meetingUrl:"https://meet.google.com/abc-defg"},
  {id:"c2",subject:"ES English Study - 張志偉 and 林小華",teacherId:"u3",studentId:"u5",days:[1,3],start:"14:00",duration:25,meetingUrl:"https://zoom.us/j/123456789"},
  {id:"c3",subject:"ES English Study - 李雅婷 and 王大明",teacherId:"u2",studentId:"u6",days:[2,4],start:"11:00",duration:50,meetingUrl:"https://meet.google.com/xyz-abcd"},
];

// materials = [{id, courseId, dayIndex, date:"YYYY-MM-DD", title, url, desc, addedBy, addedAt}]

const DEFAULT_ENROLLMENTS = []; // {id, courseId, studentId, payDate, totalSessions, startDate, scheduledDates:[{date,dayIndex,sessionNo}]}
const DEFAULT_ATTENDANCE  = []; // {id, enrollmentId, courseId, date, dayIndex, type:"excused"|"absent"|"teacher_leave", note, recordedAt, recordedBy}

// ─── Storage hook ─────────────────────────────────────────────────────────────
// ─── Global save-sync tracker ──────────────────────────────────────────────────
// Tracks which storage keys failed to save (after retry) so the UI can warn
// the user instead of silently losing data.
const _syncListeners = new Set();
const _syncFailures = new Map(); // key -> { message, timestamp }
function _notifySync() {
  const snapshot = new Map(_syncFailures);
  _syncListeners.forEach(fn => fn(snapshot));
}
function useSyncStatus() {
  const [failures, setFailures] = useState(() => new Map(_syncFailures));
  useEffect(() => {
    _syncListeners.add(setFailures);
    return () => _syncListeners.delete(setFailures);
  }, []);
  return failures;
}

function useStorage(key, def) {
  const [val, setVal] = useState(def);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    let unsub = null;
    let cancelled = false;
    (async () => {
      try { const r = await window.storage.get(key); if (!cancelled && r?.value) setVal(JSON.parse(r.value)); } catch (e) { console.error(`[Storage] Failed to load "${key}"`, e); }
      if (!cancelled) setLoaded(true);
      // If the storage backend supports real-time sync (Firestore does), subscribe
      // so changes made on another device/tab are reflected here automatically.
      if (window.storage.subscribe) {
        unsub = window.storage.subscribe(key, (value) => {
          if (cancelled) return;
          try { if (value) setVal(JSON.parse(value)); } catch (e) { console.error(`[Storage] Failed to parse live update for "${key}"`, e); }
        });
      }
    })();
    return () => { cancelled = true; if (unsub) unsub(); };
  }, [key]);
  const save = useCallback(async (v) => {
    const next = typeof v === "function" ? v(val) : v;
    setVal(next); // update UI immediately (optimistic)
    const payload = JSON.stringify(next);
    let ok = false;
    for (let attempt = 0; attempt < 2 && !ok; attempt++) {
      if (attempt > 0) await new Promise(r => setTimeout(r, 700)); // brief retry delay
      try {
        const result = await window.storage.set(key, payload);
        ok = !!result;
      } catch (e) {
        ok = false;
      }
    }
    if (!ok) {
      console.error(`[Storage] FAILED to save "${key}" after retry — this data has NOT persisted.`);
      _syncFailures.set(key, { message: key, timestamp: Date.now() });
    } else if (_syncFailures.has(key)) {
      _syncFailures.delete(key);
    }
    _notifySync();
  }, [key, val]);
  return [val, save, loaded];
}

const genId = () => "id_" + Math.random().toString(36).slice(2,9);

function addMins(timeStr, mins) {
  const [h,m] = timeStr.split(":").map(Number);
  const t = h*60+m+mins;
  return `${String(Math.floor(t/60)).padStart(2,"0")}:${String(t%60).padStart(2,"0")}`;
}

// Returns array of 7 Date objects for Mon-Sun of the week at weekOffset (0=this week, -1=last, +1=next)
function getWeekDates(weekOffset=0) {
  const now = new Date();
  const todayDow = (now.getDay() + 6) % 7;
  return Array.from({length:7}, (_,i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - todayDow + i + weekOffset*7);
    d.setHours(0,0,0,0);
    return d;
  });
}

function fmtMD(date) { return `${date.getMonth()+1}/${date.getDate()}`; }
function fmtYMD(date) { // YYYY-MM-DD
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
}

// Compute class start DateTime for a given dayOfWeek in a specific week (weekDates array)
function classDateTime(weekDates, dayOfWeek, startTime) {
  const d = new Date(weekDates[dayOfWeek]);
  const [h,m] = startTime.split(":").map(Number);
  d.setHours(h,m,0,0);
  return d;
}

// canRequestLeave: only if class is >60 min in the future (based on actual date in week)
function canRequestLeaveForWeek(weekDates, dayOfWeek, startTime, durationMins) {
  const start = classDateTime(weekDates, dayOfWeek, startTime);
  const end = new Date(start.getTime() + (durationMins||50)*60000);
  const now = new Date();
  if (now >= end) return false;      // already ended
  return (start - now) / 60000 > 60; // > 60 min away
}

function classStatusForWeek(weekDates, dayOfWeek, startTime, durationMins) {
  const start = classDateTime(weekDates, dayOfWeek, startTime);
  const end = new Date(start.getTime() + (durationMins||50)*60000);
  const now = new Date();
  if (now >= end) return "past";
  if (now >= start) return "ongoing";
  return "future";
}
function getDateForDow(dow) {
  const now = new Date();
  const todayDow = (now.getDay()+6)%7;
  const d = new Date(now);
  d.setDate(now.getDate() + (dow - todayDow));
  return d.toISOString().slice(0,10);
}

// Given a literal calendar date (YYYY-MM-DD) + start time "HH:MM" + duration,
// returns true only once the session has actually ENDED (not just "today or earlier").
// This fixes the bug where a same-day class showed as "completed" before it even started.
function isSessionOver(dateStr, startTime, durationMins) {
  if (!dateStr) return false;
  const [h,m] = (startTime||"00:00").split(":").map(Number);
  const start = new Date(dateStr+"T00:00:00");
  start.setHours(h||0, m||0, 0, 0);
  const end = new Date(start.getTime() + (durationMins||50)*60000);
  return new Date() >= end;
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg }) {
  if (!msg) return null;
  return <div style={{position:"fixed",top:16,right:16,background:"#4CAF50",color:"#fff",borderRadius:8,padding:"11px 18px",fontSize:13,zIndex:9999,maxWidth:320,lineHeight:1.4,boxShadow:"0 2px 12px rgba(0,0,0,0.18)"}}>{msg}</div>;
}

// ─── Absence modal ────────────────────────────────────────────────────────────
function AbsenceModal({ course, dayIndex, users, lang, currentUser, onConfirm, onClose }) {
  const t = T[lang];
  const teacher = users.find(u=>u.id===course.teacherId);
  const student = users.find(u=>u.id===course.studentId);
  const endTime = addMins(course.start, course.duration);

  // ── Step 1: reason; Step 2: notify ──
  const [step, setStep] = useState(1);
  const [reason, setReason] = useState("sick"); // "sick" | "personal"
  const [personalNote, setPersonalNote] = useState("");
  const [sent, setSent] = useState({email:false,fb:false,line:false});

  const reasonLabel = reason === "sick"
    ? (lang==="zh" ? "病假" : "Sick Leave")
    : (lang==="zh" ? `事假（${personalNote||"…"}）` : `Personal Leave (${personalNote||"…"})`);

  const msgBody = `[${t.absentNotif}] ${course.subject}\n${t.teacher}: ${teacher?.name} · ${t.student}: ${student?.name}\n${T[lang].days[dayIndex]} ${course.start}–${endTime}\n${lang==="zh"?"請假人":"By"}: ${currentUser.name}\n${lang==="zh"?"事由":"Reason"}: ${reasonLabel}`;

  const handleSend = (ch) => {
    setSent(s=>({...s,[ch]:true}));
    if (ch==="email") window.open(`mailto:admin@example.com?subject=${encodeURIComponent((lang==="zh"?"[請假通知] ":"[Leave Notice] ")+course.subject)}&body=${encodeURIComponent(msgBody)}`);
    else if (ch==="line") window.open(`https://line.me/R/msg/text/?${encodeURIComponent(msgBody)}`);
    else if (ch==="fb") window.open("https://www.facebook.com/messages/");
  };

  const iStyle = {width:"100%",boxSizing:"border-box",padding:"8px 10px",borderRadius:6,border:"0.5px solid #CFD8DC",background:"#FAFAFA",color:"#172F39",fontSize:13,marginTop:4};

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:8888,padding:"1rem"}}>
      <div style={{background:"#FFFFFF",borderRadius:14,padding:"1.5rem",width:"100%",maxWidth:420,boxSizing:"border-box",boxShadow:"0 8px 32px rgba(0,0,0,0.4)"}}>

        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1rem"}}>
          <h3 style={{margin:0,fontSize:16,fontWeight:600,color:"#172F39"}}>{t.absentModal}</h3>
          <span style={{fontSize:12,color:"#9E9E9E",background:"#F5F5F5",borderRadius:5,padding:"2px 8px"}}>{step}/2</span>
        </div>

        {/* Course info pill */}
        <div style={{background:"#F5F5F5",borderRadius:8,padding:"8px 12px",fontSize:12,color:"#546E7A",marginBottom:"1.25rem",lineHeight:1.6}}>
          <strong style={{color:"#172F39"}}>{course.subject}</strong><br/>
          {T[lang].days[dayIndex]} · {course.start}–{endTime}
        </div>

        {/* ── Step 1: Reason ── */}
        {step === 1 && (
          <div>
            <p style={{fontSize:13,color:"#546E7A",margin:"0 0 12px"}}>{lang==="zh"?"請選擇請假事由：":"Select leave reason:"}</p>

            {/* Sick leave */}
            <button onClick={()=>setReason("sick")} style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"11px 14px",borderRadius:8,border:`1.5px solid ${reason==="sick"?"#1A6B8A":"#CFD8DC"}`,background:reason==="sick"?"rgba(26,107,138,0.1)":"transparent",color:reason==="sick"?"#1A6B8A":"#546E7A",fontSize:13,cursor:"pointer",marginBottom:8,textAlign:"left"}}>
              <span style={{fontSize:18}}>🤒</span>
              <div>
                <div style={{fontWeight:500}}>{lang==="zh"?"病假":"Sick Leave"}</div>
                <div style={{fontSize:11,opacity:0.7}}>{lang==="zh"?"身體不適、就醫等":"Illness, medical appointment, etc."}</div>
              </div>
              {reason==="sick" && <span style={{marginLeft:"auto",color:"#1A6B8A"}}>✓</span>}
            </button>

            {/* Personal leave */}
            <button onClick={()=>setReason("personal")} style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"11px 14px",borderRadius:8,border:`1.5px solid ${reason==="personal"?"#1A6B8A":"#CFD8DC"}`,background:reason==="personal"?"rgba(26,107,138,0.1)":"transparent",color:reason==="personal"?"#1A6B8A":"#546E7A",fontSize:13,cursor:"pointer",marginBottom:reason==="personal"?6:0,textAlign:"left"}}>
              <span style={{fontSize:18}}>📋</span>
              <div>
                <div style={{fontWeight:500}}>{lang==="zh"?"事假":"Personal Leave"}</div>
                <div style={{fontSize:11,opacity:0.7}}>{lang==="zh"?"其他個人事由":"Other personal reasons"}</div>
              </div>
              {reason==="personal" && <span style={{marginLeft:"auto",color:"#1A6B8A"}}>✓</span>}
            </button>

            {/* Personal note input */}
            {reason==="personal" && (
              <div style={{marginTop:6}}>
                <label style={{fontSize:12,color:"#546E7A"}}>{lang==="zh"?"請說明原因（必填）：":"Please state your reason (required):"}</label>
                <input style={iStyle} value={personalNote} onChange={e=>setPersonalNote(e.target.value)} placeholder={lang==="zh"?"例：家庭事務、出差…":"e.g. Family matter, business trip…"} autoFocus/>
              </div>
            )}

            <div style={{display:"flex",gap:8,marginTop:"1.25rem"}}>
              <button
                onClick={()=>setStep(2)}
                disabled={reason==="personal" && !personalNote.trim()}
                style={{flex:1,background:reason==="personal"&&!personalNote.trim()?"#CFD8DC":"#1A6B8A",border:"none",borderRadius:7,color:reason==="personal"&&!personalNote.trim()?"#9E9E9E":"#fff",padding:"10px",fontSize:13,fontWeight:500,cursor:reason==="personal"&&!personalNote.trim()?"not-allowed":"pointer"}}>
                {lang==="zh"?"下一步 →":"Next →"}
              </button>
              <button onClick={onClose} style={{flex:1,background:"#F5F5F5",border:"0.5px solid #CFD8DC",borderRadius:7,color:"#172F39",padding:"10px",fontSize:13,cursor:"pointer"}}>{t.cancel}</button>
            </div>
          </div>
        )}

        {/* ── Step 2: Notify & confirm ── */}
        {step === 2 && (
          <div>
            <div style={{background:"#FAFAFA",borderRadius:8,padding:"10px 14px",fontSize:12,color:"#546E7A",marginBottom:"1rem",whiteSpace:"pre-line",lineHeight:1.7,borderLeft:"3px solid #4A9FD4"}}>{msgBody}</div>
            <p style={{fontSize:13,color:"#546E7A",margin:"0 0 10px"}}>{t.absentModalDesc}</p>
            <div style={{display:"flex",flexDirection:"column",gap:7,marginBottom:"1.25rem"}}>
              {[
                {key:"email",label:t.absentSendEmail,icon:"✉️",color:"#1565C0"},
                {key:"fb",   label:t.absentSendFB,   icon:"📘",color:"#1877F2"},
                {key:"line", label:t.absentSendLINE, icon:"💬",color:"#06C755"},
              ].map(ch=>(
                <button key={ch.key} onClick={()=>handleSend(ch.key)} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 14px",borderRadius:7,border:`1px solid ${sent[ch.key]?"#CFD8DC":ch.color}`,background:sent[ch.key]?"#F5F5F5":"transparent",color:sent[ch.key]?"#9E9E9E":ch.color,fontSize:13,cursor:sent[ch.key]?"default":"pointer"}}>
                  <span>{ch.icon}</span>
                  <span style={{flex:1}}>{ch.label}</span>
                  {sent[ch.key]&&<span style={{fontSize:11,color:"#4CAF50"}}>✓ {lang==="zh"?"已開啟":"Opened"}</span>}
                </button>
              ))}
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setStep(1)} style={{padding:"10px 14px",background:"#F5F5F5",border:"0.5px solid #CFD8DC",borderRadius:7,color:"#546E7A",fontSize:13,cursor:"pointer"}}>← {lang==="zh"?"返回":"Back"}</button>
              <button onClick={()=>onConfirm(reason, personalNote)} style={{flex:1,background:"#D32F2F",border:"none",borderRadius:7,color:"#fff",padding:"10px",fontSize:13,fontWeight:500,cursor:"pointer"}}>{t.confirmAbsent}</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// ─── Confirm Modal ────────────────────────────────────────────────────────────
function ConfirmModal({ title, message, confirmLabel, onConfirm, onCancel, danger }) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:99999,padding:"1rem"}}>
      <div style={{background:"#FFFFFF",borderRadius:12,width:"100%",maxWidth:360,boxSizing:"border-box",boxShadow:"0 8px 32px rgba(23,47,57,0.18)",overflow:"hidden"}}>
        <div style={{background:"#172F39",padding:"13px 18px"}}>
          <span style={{fontSize:14,fontWeight:600,color:"#FFFFFF"}}>{title || "確認"}</span>
        </div>
        <div style={{padding:"18px 18px 14px"}}>
          <p style={{margin:"0 0 18px",fontSize:14,color:"#172F39",lineHeight:1.6}}>{message}</p>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <button onClick={onCancel} style={{padding:"8px 18px",borderRadius:7,border:"0.5px solid #CFD8DC",background:"#F5F5F5",color:"#546E7A",fontSize:13,cursor:"pointer"}}>
              取消 / Cancel
            </button>
            <button onClick={onConfirm} style={{padding:"8px 18px",borderRadius:7,border:"none",background:danger?"#D32F2F":"#1A6B8A",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer"}}>
              {confirmLabel || "確認刪除"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Material Panel (modal — full course, all sessions) ──────────────────────
// Shows ALL materials for a course, optionally pre-filtered to a specific day.
// Each entry stores: courseId, dayIndex (0-6), date (YYYY-MM-DD), title, url, desc
function MaterialPanel({ course, initialDayFilter, users, lang, currentUser, materials, setMaterials, setToast, onClose }) {
  const t = T[lang];
  const canEdit = currentUser.role === "admin" || currentUser.role === "teacher";

  // ── filter / sort state ──
  // initialDayFilter: number 0-6 or null (show all)
  const [dayFilter, setDayFilter] = useState(initialDayFilter ?? -1); // -1 = all
  const [sortOrder, setSortOrder] = useState("newest"); // newest | oldest
  const [confirmDelId, setConfirmDelId] = useState(null); // material id pending delete

  // ── form state ──
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const today = new Date().toISOString().slice(0, 10);
  // Default day must be one the course actually meets on — falling back to a
  // hardcoded 0 (Monday) here was the bug: if the course doesn't meet on
  // Monday, materials saved without explicitly re-picking a day silently got
  // tagged with a dayIndex the course never has, so they never showed up
  // on the schedule (the batch editor already guarded against this).
  const validDefaultDay = (dayFilter >= 0 && course.days?.includes(dayFilter)) ? dayFilter : (course.days?.[0] ?? 0);
  const blankDate = getDateForDow(validDefaultDay);
  const blank = { title:"", url:"", date: blankDate, desc:"", dayIndex: validDefaultDay };
  const [form, setForm] = useState(blank);
  const fset = (k, v) => setForm(f => ({...f, [k]: v}));

  // ── derived list ──
  let visible = materials.filter(m => m.courseId === course.id);
  if (dayFilter >= 0) visible = visible.filter(m => m.dayIndex === dayFilter);
  visible = [...visible].sort((a, b) => {
    const da = a.date || a.addedAt?.slice(0,10) || "";
    const db = b.date || b.addedAt?.slice(0,10) || "";
    return sortOrder === "newest" ? db.localeCompare(da) : da.localeCompare(db);
  });

  // Which days have materials (for filter pills)
  const daysWithMat = [...new Set(materials.filter(m => m.courseId === course.id).map(m => m.dayIndex))];

  const openAdd = () => {
    setEditing(null);
    const d = (dayFilter >= 0 && course.days?.includes(dayFilter)) ? dayFilter : (course.days?.[0] ?? 0);
    setForm({...blank, date: getDateForDow(d), dayIndex: d});
    setShowForm(true);
  };

  const save = () => {
    if (!form.url.trim()) return;
    // Guard: the selected day must be one the course actually meets on,
    // otherwise the material silently never shows up on the schedule.
    if (course.days?.length && !course.days.includes(form.dayIndex)) {
      setToast(lang==="zh" ? "請選擇該課程有安排的星期" : "Please select a day this course actually meets on");
      return;
    }
    const titleFinal = form.title.trim() || form.url.trim();
    if (editing) {
      setMaterials(ms => ms.map(m => m.id === editing.id ? {...m, ...form, title: titleFinal} : m));
    } else {
      setMaterials(ms => [...ms, {id: genId(), courseId: course.id, ...form, title: titleFinal, addedBy: currentUser.id, addedAt: new Date().toISOString()}]);
    }
    setToast(t.materialSaved);
    setForm(blank); setShowForm(false); setEditing(null);
  };

  const del = (id) => { setConfirmDelId(id); };
  const doDelMaterial = () => {
    setMaterials(ms => ms.filter(m => m.id !== confirmDelId));
    setToast(t.materialDeleted);
    setConfirmDelId(null);
  };

  const startEdit = (m) => {
    setEditing(m);
    setForm({title: m.title, url: m.url, date: m.date || "", desc: m.desc || "", dayIndex: m.dayIndex ?? 0});
    setShowForm(true);
  };

  const copyUrl = (url) => {
    navigator.clipboard?.writeText(url).then(() => setToast(t.matUrlCopied)).catch(() => {});
  };

  const iStyle = {width:"100%",boxSizing:"border-box",padding:"8px 10px",borderRadius:6,border:"0.5px solid #CFD8DC",background:"#FFFFFF",color:"#172F39",fontSize:13};
  const lStyle = {display:"block",fontSize:12,color:"#546E7A",marginBottom:4,marginTop:10};

  // Group visible materials by date for section headers
  const grouped = {};
  visible.forEach(m => {
    const key = m.date || m.addedAt?.slice(0,10) || "—";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(m);
  });
  const groupKeys = Object.keys(grouped); // already sorted by the sort above

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:8900}}>
      {confirmDelId && <ConfirmModal title={lang==="zh"?"刪除教材":"Delete Material"} message={lang==="zh"?"確認刪除此教材？此操作無法復原。":"Delete this material? This cannot be undone."} confirmLabel={lang==="zh"?"確認刪除":"Delete"} onConfirm={doDelMaterial} onCancel={()=>setConfirmDelId(null)} danger/>}
      <div style={{background:"#FFFFFF",borderRadius:"18px 18px 0 0",width:"100%",maxWidth:560,maxHeight:"90vh",display:"flex",flexDirection:"column",boxSizing:"border-box"}}>

        {/* ── Header ── */}
        <div style={{padding:"1.25rem 1.25rem 0",flexShrink:0}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"0.75rem"}}>
            <div>
              <div style={{fontWeight:600,fontSize:15,color:"#172F39"}}>{t.materials}</div>
              <div style={{fontSize:12,color:"#546E7A",marginTop:2,lineHeight:1.4}}>{course.subject}</div>
            </div>
            <button onClick={onClose} style={{background:"#F5F5F5",border:"none",width:28,height:28,borderRadius:"50%",cursor:"pointer",color:"#546E7A",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>×</button>
          </div>

          {/* ── Day filter pills ── */}
          <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:"0.75rem"}}>
            <button onClick={()=>setDayFilter(-1)} style={{padding:"4px 11px",borderRadius:20,fontSize:11,cursor:"pointer",border:dayFilter===-1?"none":"0.5px solid #CFD8DC",background:dayFilter===-1?"#1A6B8A":"transparent",color:dayFilter===-1?"#fff":"#546E7A"}}>
              {t.allDays} ({materials.filter(m=>m.courseId===course.id).length})
            </button>
            {course.days?.map(d => {
              const cnt = materials.filter(m => m.courseId===course.id && m.dayIndex===d).length;
              return (
                <button key={d} onClick={()=>setDayFilter(d)} style={{padding:"4px 11px",borderRadius:20,fontSize:11,cursor:"pointer",border:dayFilter===d?"none":"0.5px solid #CFD8DC",background:dayFilter===d?"#1A6B8A":"transparent",color:dayFilter===d?"#fff":"#546E7A"}}>
                  {T[lang].days[d]}{cnt > 0 ? ` (${cnt})` : ""}
                </button>
              );
            })}
          </div>

          {/* ── Toolbar: sort + add ── */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.75rem",gap:8}}>
            <div style={{display:"flex",gap:4}}>
              {["newest","oldest"].map(s => (
                <button key={s} onClick={()=>setSortOrder(s)} style={{padding:"4px 10px",borderRadius:5,fontSize:11,cursor:"pointer",border:sortOrder===s?"none":"0.5px solid #CFD8DC",background:sortOrder===s?"#EEF2F5":"transparent",color:sortOrder===s?"#172F39":"#9E9E9E"}}>
                  {s==="newest"?t.matSortNewest:t.matSortOldest}
                </button>
              ))}
            </div>
            {canEdit && !showForm && (
              <button onClick={openAdd} style={{display:"flex",alignItems:"center",gap:5,padding:"6px 14px",borderRadius:7,background:"#1A6B8A",border:"none",color:"#fff",fontSize:12,cursor:"pointer",fontWeight:500}}>
                + {t.addMaterial}
              </button>
            )}
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div style={{flex:1,overflowY:"auto",padding:"0 1.25rem 1.5rem"}}>

          {/* Add / Edit Form */}
          {showForm && canEdit && (
            <div style={{background:"#F5F5F5",borderRadius:12,border:"0.5px solid #E0E0E0",padding:"1rem",marginBottom:"1rem"}}>
              <div style={{fontWeight:500,fontSize:13,color:"#172F39",marginBottom:4}}>{editing ? t.editMaterial : t.addMaterial}</div>

              {/* Day selector inside form */}
              <label style={lStyle}>{t.matDayLabel}</label>
              <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:4}}>
                {course.days?.map(d => (
                  <button key={d} type="button" onClick={()=>fset("dayIndex",d)} style={{padding:"4px 9px",borderRadius:5,fontSize:11,cursor:"pointer",border:`1px solid ${form.dayIndex===d?"#1A6B8A":"#CFD8DC"}`,background:form.dayIndex===d?"#1A6B8A":"transparent",color:form.dayIndex===d?"#fff":"#546E7A"}}>
                    {T[lang].days[d]}
                  </button>
                ))}
              </div>

              <label style={lStyle}>{t.materialDate}</label>
              <input type="date" style={iStyle} value={form.date} onChange={e=>fset("date",e.target.value)}/>

              <label style={{...lStyle,color:"#D32F2F"}}>{t.materialUrl} *</label>
              <input style={iStyle} value={form.url} onChange={e=>fset("url",e.target.value)} placeholder="https://..."/>

              <label style={lStyle}>{t.materialTitle}</label>
              <input style={iStyle} value={form.title} onChange={e=>fset("title",e.target.value)} placeholder={lang==="zh"?"例：Unit 3 Reading / 第3課練習":"e.g. Unit 3 Reading"}/>

              <label style={lStyle}>{t.materialDesc}</label>
              <input style={iStyle} value={form.desc} onChange={e=>fset("desc",e.target.value)} placeholder={lang==="zh"?"備註（選填）":"Notes (optional)"}/>

              <div style={{display:"flex",gap:8,marginTop:12}}>
                <button onClick={save} style={{flex:1,background:"#1A6B8A",border:"none",borderRadius:6,color:"#fff",padding:"9px",fontSize:13,fontWeight:500,cursor:"pointer"}}>{t.save}</button>
                <button onClick={()=>{setShowForm(false);setEditing(null);}} style={{flex:1,background:"transparent",border:"0.5px solid #CFD8DC",borderRadius:6,color:"#172F39",padding:"9px",fontSize:13,cursor:"pointer"}}>{t.cancel}</button>
              </div>
            </div>
          )}

          {/* Empty state */}
          {visible.length === 0 && !showForm && (
            <div style={{textAlign:"center",padding:"3rem 0"}}>
              <div style={{fontSize:32,marginBottom:8}}>📄</div>
              <p style={{color:"#9E9E9E",fontSize:13}}>{t.noMaterials}</p>
              {canEdit && <button onClick={openAdd} style={{marginTop:8,padding:"7px 18px",borderRadius:7,background:"#1A6B8A",border:"none",color:"#fff",fontSize:13,cursor:"pointer"}}>+ {t.addMaterial}</button>}
            </div>
          )}

          {/* Grouped material list */}
          {groupKeys.map(dateKey => (
            <div key={dateKey} style={{marginBottom:"1rem"}}>
              {/* Date section header */}
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                <span style={{fontSize:11,fontWeight:600,color:"#9E9E9E",whiteSpace:"nowrap"}}>
                  {dateKey !== "—" ? new Date(dateKey).toLocaleDateString(lang==="zh"?"zh-TW":"en-US",{month:"short",day:"numeric",weekday:"short"}) : "—"}
                </span>
                <div style={{flex:1,height:"0.5px",background:"#E0E0E0"}}/>
                <span style={{fontSize:10,color:"#9E9E9E",whiteSpace:"nowrap"}}>{T[lang].days[grouped[dateKey][0]?.dayIndex]}</span>
              </div>

              {grouped[dateKey].map((m, idx) => {
                const isOrphanDay = course.days?.length && !course.days.includes(m.dayIndex);
                return (
                <div key={m.id} style={{background:"#F5F5F5",border:`0.5px solid ${isOrphanDay?"#FFB74D":"#E0E0E0"}`,borderRadius:10,padding:"12px 14px",marginBottom:6}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
                    <div style={{flex:1,minWidth:0}}>
                      {/* Index badge + title */}
                      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2,flexWrap:"wrap"}}>
                        <span style={{fontSize:10,background:"#FFFFFF",border:"0.5px solid #CFD8DC",borderRadius:4,padding:"1px 6px",color:"#9E9E9E",flexShrink:0}}>#{idx+1}</span>
                        <span style={{fontWeight:500,fontSize:13,color:"#172F39",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.title}</span>
                        {isOrphanDay && (
                          <span style={{fontSize:10,background:"#FFF3E0",color:"#E65100",borderRadius:4,padding:"1px 7px",fontWeight:600,flexShrink:0}} title={lang==="zh"?"此教材的星期跟課程實際排課不符，不會顯示在課表上，請點編輯修正":"This material's day doesn't match the course's actual schedule — it won't show up. Click Edit to fix."}>
                            ⚠️ {lang==="zh"?"星期不符":"Day mismatch"}
                          </span>
                        )}
                      </div>
                      {m.desc && <div style={{fontSize:12,color:"#546E7A",marginBottom:4}}>{m.desc}</div>}
                      {/* URL preview — truncated, clickable */}
                      <div style={{fontSize:11,color:"#1A6B8A",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginBottom:4}}>{m.url}</div>
                    </div>
                  </div>
                  {/* Action row */}
                  <div style={{display:"flex",gap:5,flexWrap:"wrap",marginTop:4}}>
                    <a href={m.url} target="_blank" rel="noreferrer" style={{fontSize:12,background:"#1A6B8A",color:"#fff",borderRadius:5,padding:"4px 12px",textDecoration:"none",fontWeight:500}}>
                      ↗ {t.openMaterial}
                    </a>
                    <button onClick={()=>copyUrl(m.url)} style={{fontSize:11,background:"transparent",border:"0.5px solid #CFD8DC",borderRadius:5,color:"#546E7A",padding:"3px 9px",cursor:"pointer"}}>
                      📋 {t.matCopy}
                    </button>
                    {canEdit && (
                      <>
                        <button onClick={()=>startEdit(m)} style={{fontSize:11,background:"transparent",border:"0.5px solid #CFD8DC",borderRadius:5,color:"#546E7A",padding:"3px 9px",cursor:"pointer"}}>{t.editMaterial}</button>
                        <button onClick={()=>del(m.id)} style={{fontSize:11,background:"transparent",border:"0.5px solid #C0392B",borderRadius:5,color:"#D32F2F",padding:"3px 9px",cursor:"pointer"}}>{t.deleteCourse}</button>
                      </>
                    )}
                  </div>
                </div>
                );})}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Course Detail Modal ──────────────────────────────────────────────────────
function CourseDetailModal({ course, dayIndex, users, lang, materials, onClose }) {
  const t = T[lang];
  const teacher = users.find(u=>u.id===course.teacherId);
  const student  = users.find(u=>u.id===course.studentId);
  const endTime  = addMins(course.start, course.duration);
  const dayMats  = materials.filter(m=>m.courseId===course.id&&m.dayIndex===dayIndex)
    .sort((a,b)=>(b.date||"").localeCompare(a.date||""));
  const [copied, setCopied] = useState(false);

  // Build the date for this day-of-week (this week)
  const classDate = getDateForDow(dayIndex); // YYYY-MM-DD

  // Latest material for this day (or first overall)
  const latestMat = dayMats[0] || materials.filter(m=>m.courseId===course.id)[0];
  const matLine = latestMat
    ? (latestMat.title && latestMat.title !== latestMat.url ? `${latestMat.title}\n ** ${latestMat.url}` : latestMat.url)
    : "—";

  const copyText =
`===== ES English Today =====

 Date / 日期
**${classDate}

 Time&Student / 時間&學生
**${course.start}-${endTime} **${student?.name||""}

 Teacher / 老師: **${teacher?.name||""}

 Lesson Material / 課程教材
 ** ${matLine}

 Class Link / 上課連結
 ${course.meetingUrl||"—"}


 Let's have a great class together! 上課順利！

========================`;

  const handleCopy = () => {
    navigator.clipboard?.writeText(copyText).then(()=>{
      setCopied(true); setTimeout(()=>setCopied(false), 2500);
    }).catch(()=>{
      // fallback
      const ta = document.createElement("textarea");
      ta.value = copyText; document.body.appendChild(ta);
      ta.select(); document.execCommand("copy"); document.body.removeChild(ta);
      setCopied(true); setTimeout(()=>setCopied(false), 2500);
    });
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:8800,padding:"1rem"}}>
      <div style={{background:"#FFFFFF",borderRadius:16,width:"100%",maxWidth:440,boxSizing:"border-box",boxShadow:"0 8px 40px rgba(0,0,0,0.5)",overflow:"hidden"}}>

        {/* Header bar */}
        <div style={{background:"#172F39",padding:"14px 18px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontSize:14,fontWeight:600,color:"#FFFFFF",flex:1,marginRight:12,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{course.subject}</div>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.15)",border:"none",width:28,height:28,borderRadius:"50%",cursor:"pointer",color:"#FFFFFF",fontSize:17,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>×</button>
        </div>

        <div style={{padding:"16px 18px"}}>
          {/* Info grid */}
          {[
            {icon:"📅", label: lang==="zh"?"日期":"Date",      val: classDate},
            {icon:"⏰", label: lang==="zh"?"時間":"Time",      val: `${course.start} – ${endTime} (${course.duration}min)`},
            {icon:"👤", label: lang==="zh"?"學生":"Student",   val: student?.name||"—"},
            {icon:"🎓", label: lang==="zh"?"老師":"Teacher",   val: teacher?.name||"—"},
          ].map(row=>(
            <div key={row.label} style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:10}}>
              <span style={{fontSize:15,width:22,flexShrink:0}}>{row.icon}</span>
              <div>
                <div style={{fontSize:10,color:"#9E9E9E",marginBottom:1}}>{row.label}</div>
                <div style={{fontSize:13,color:"#172F39",fontWeight:500}}>{row.val}</div>
              </div>
            </div>
          ))}

          {/* Meeting link */}
          {course.meetingUrl && (
            <div style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:10}}>
              <span style={{fontSize:15,width:22,flexShrink:0}}>🔗</span>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:10,color:"#9E9E9E",marginBottom:1}}>{lang==="zh"?"上課連結":"Class Link"}</div>
                <a href={course.meetingUrl} target="_blank" rel="noreferrer" style={{fontSize:12,color:"#1A6B8A",wordBreak:"break-all"}}>{course.meetingUrl}</a>
              </div>
            </div>
          )}

          {/* Materials for this day */}
          <div style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:14}}>
            <span style={{fontSize:15,width:22,flexShrink:0}}>📄</span>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:10,color:"#9E9E9E",marginBottom:4}}>{lang==="zh"?"本日教材":"Today's Materials"} {dayMats.length>0?`(${dayMats.length})`:""}</div>
              {dayMats.length===0
                ? <div style={{fontSize:12,color:"#9E9E9E"}}>—</div>
                : dayMats.map(m=>(
                  <div key={m.id} style={{marginBottom:5}}>
                    <div style={{fontSize:12,color:"#172F39",marginBottom:1}}>{m.title}</div>
                    <a href={m.url} target="_blank" rel="noreferrer" style={{fontSize:11,color:"#1A6B8A",wordBreak:"break-all"}}>{m.url}</a>
                    {m.desc&&<div style={{fontSize:11,color:"#9E9E9E",marginTop:1}}>{m.desc}</div>}
                  </div>
                ))
              }
            </div>
          </div>

          {/* Copy preview box */}
          <div style={{background:"#FAFAFA",borderRadius:8,padding:"10px 12px",fontFamily:"monospace",fontSize:10,color:"#546E7A",lineHeight:1.7,whiteSpace:"pre-wrap",marginBottom:12,maxHeight:130,overflowY:"auto",border:"0.5px solid #E0E0E0"}}>
            {copyText}
          </div>

          {/* Copy button */}
          <button onClick={handleCopy} style={{width:"100%",background:copied?"#4CAF50":"#1A6B8A",border:"none",borderRadius:8,color:"#fff",padding:"11px",fontSize:14,fontWeight:600,cursor:"pointer",transition:"background 0.2s",letterSpacing:"0.02em"}}>
            {copied ? (lang==="zh"?"✓ 已複製！":"✓ Copied!") : (lang==="zh"?"📋 複製課程資訊":"📋 Copy Class Info")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Slot-based List View ─────────────────────────────────────────────────────
// Receives `slots` from enrollment scheduledDates — enrollment is the source of truth
function SlotListView({ slots, users, lang, currentUser, absences, materials, setMaterials, onAbsent, setToast, weekDates, weekOffset, attendance, setAttendance, enrollments, setEnrollments, courses, feedback, setFeedback }) {
  const t = T[lang];
  const todayDow = (new Date().getDay()+6)%7;
  const isThisWeek = weekOffset===0;
  // Group slots by dayIndex
  const byDay = {};
  slots.forEach(s=>{ if(!byDay[s.dayIndex]) byDay[s.dayIndex]=[]; byDay[s.dayIndex].push(s); });

  return (
    <div>
      {t.days.map((day,i)=>{
        const daySlotsRaw = byDay[i]||[];
        const isToday = isThisWeek && i===todayDow;
        if (daySlotsRaw.length===0) return (
          <div key={i} style={{marginBottom:"1rem"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
              <div style={{display:"flex",alignItems:"baseline",gap:5,minWidth:80}}>
                <span style={{fontSize:13,fontWeight:600,color:isToday?"#1A6B8A":"#9E9E9E"}}>{day}</span>
                <span style={{fontSize:11,color:isToday?"#1A6B8A":"#CFD8DC"}}>{fmtMD(weekDates[i])}</span>
              </div>
              <div style={{flex:1,height:"0.5px",background:"#F0F0F0"}}/>
              <span style={{fontSize:11,color:"#CFD8DC"}}>—</span>
            </div>
          </div>
        );
        return (
          <div key={i} style={{marginBottom:"1.25rem"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
              <div style={{display:"flex",alignItems:"baseline",gap:5,minWidth:80}}>
                <span style={{fontSize:13,fontWeight:600,color:isToday?"#1A6B8A":"#546E7A"}}>{day}</span>
                <span style={{fontSize:11,color:isToday?"#1A6B8A":"#9E9E9E"}}>{fmtMD(weekDates[i])}</span>
                {isToday&&<span style={{fontSize:9,background:"#1A6B8A",color:"#fff",borderRadius:3,padding:"1px 5px",fontWeight:600}}>{t.today}</span>}
              </div>
              <div style={{flex:1,height:"0.5px",background:isToday?"rgba(26,107,138,0.3)":"#E0E0E0"}}/>
              <span style={{fontSize:11,color:"#9E9E9E"}}>{daySlotsRaw.length} {lang==="zh"?"堂":"class"}</span>
            </div>
            {daySlotsRaw.map((sl,si)=>{
              const colorIdx = (sl.course.id.charCodeAt(0)||0) % COLORS.length;
              return <SlotCourseCard key={sl.course.id+sl.date+sl.sessionNo} slot={sl} colorIdx={colorIdx} users={users} lang={lang} currentUser={currentUser} absences={absences} materials={materials} setMaterials={setMaterials} onAbsent={onAbsent} setToast={setToast} weekDates={weekDates} weekOffset={weekOffset} attendance={attendance} setAttendance={setAttendance} enrollments={enrollments} setEnrollments={setEnrollments} courses={courses} feedback={feedback} setFeedback={setFeedback}/>;
            })}
          </div>
        );
      })}
    </div>
  );
}

// ─── Slot-based Calendar View ─────────────────────────────────────────────────
function SlotCalendarView({ slots, users, lang, currentUser, absences, materials, setMaterials, onAbsent, setToast, weekDates, weekOffset, attendance, setAttendance, enrollments, setEnrollments, courses, feedback, setFeedback }) {
  const t = T[lang];
  const todayDow = (new Date().getDay()+6)%7;
  const isThisWeek = weekOffset===0;
  const [matTarget, setMatTarget] = useState(null);
  const [detTarget, setDetTarget] = useState(null);
  const [adminEditTarget, setAdminEditTarget] = useState(null); // slot being edited by admin
  const [fbTarget, setFbTarget] = useState(null); // slot being written/viewed for feedback
  const isAdmin = currentUser.role==="admin";
  const isTeacher = currentUser.role==="teacher";
  const isStudent = currentUser.role==="student";
  const byDay = {};
  slots.forEach(s=>{ if(!byDay[s.dayIndex]) byDay[s.dayIndex]=[]; byDay[s.dayIndex].push(s); });

  return (
    <div style={{overflowX:"auto"}}>
      {matTarget&&<MaterialPanel course={matTarget.course} initialDayFilter={matTarget.dayIndex} users={users} lang={lang} currentUser={currentUser} materials={materials} setMaterials={setMaterials} setToast={setToast} onClose={()=>setMatTarget(null)}/>}
      {detTarget&&<CourseDetailModal course={detTarget.course} dayIndex={detTarget.dayIndex} users={users} lang={lang} materials={materials} onClose={()=>setDetTarget(null)}/>}
      {adminEditTarget&&<AdminSessionModal slot={adminEditTarget} users={users} lang={lang} attendance={attendance||[]} setAttendance={setAttendance} enrollments={enrollments||[]} setEnrollments={setEnrollments} courses={courses||[]} setToast={setToast} onClose={()=>setAdminEditTarget(null)}/>}
      {fbTarget&&<FeedbackModal slot={fbTarget} currentUser={currentUser} users={users} lang={lang} feedback={feedback||[]} setFeedback={setFeedback} setToast={setToast} onClose={()=>setFbTarget(null)} readOnly={isStudent}/>}
      <div style={{minWidth:520}}>
        {/* Day headers */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,minmax(0,1fr))",gap:3,marginBottom:3}}>
          {t.days.map((d,i)=>{
            const isToday=isThisWeek&&i===todayDow;
            const hasSlots=(byDay[i]||[]).length>0;
            return (
              <div key={i} style={{textAlign:"center",padding:"5px 2px",background:isToday?"#1A6B8A":hasSlots?"#EEF6FB":"#F5F5F5",borderRadius:5}}>
                <div style={{fontSize:11,fontWeight:600,color:isToday?"#fff":hasSlots?"#1A6B8A":"#9E9E9E"}}>{t.daysShort[i]}</div>
                <div style={{fontSize:10,color:isToday?"rgba(255,255,255,0.85)":hasSlots?"#1A6B8A":"#CFD8DC",marginTop:1}}>{fmtMD(weekDates[i])}</div>
                {isToday&&<div style={{fontSize:8,color:"rgba(255,255,255,0.8)"}}>{t.today}</div>}
              </div>
            );
          })}
        </div>
        {/* Grid */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,minmax(0,1fr))",gap:3,minHeight:160}}>
          {t.days.map((_,i)=>{
            const daySlots = byDay[i]||[];
            const isToday=isThisWeek&&i===todayDow;
            return (
              <div key={i} style={{background:isToday?"rgba(26,107,138,0.05)":"#F9F9F9",border:isToday?"1px solid rgba(26,107,138,0.2)":"1px solid transparent",borderRadius:7,padding:"4px 3px",minHeight:100}}>
                {daySlots.length===0&&<div style={{fontSize:10,color:"#E0E0E0",textAlign:"center",marginTop:16}}>—</div>}
                {daySlots.map(sl=>{
                  const col=COLORS[(sl.course.id.charCodeAt(0)||0)%COLORS.length];
                  const isAbsent=absences.some(a=>a.courseId===sl.course.id&&a.dateStr===sl.date);
                  const status=classStatusForWeek(weekDates,sl.dayIndex,sl.course.start,sl.course.duration);
                  const isPast=status==="past";
                  const isOngoing=status==="ongoing";
                  const leaveOk=canRequestLeaveForWeek(weekDates,sl.dayIndex,sl.course.start,sl.course.duration);
                  const canAbsent=currentUser.role==="student"||currentUser.role==="teacher";
                  const endTime=addMins(sl.course.start,sl.course.duration);
                  const teacher=users.find(u=>u.id===sl.course.teacherId);
                  const student=users.find(u=>u.id===sl.course.studentId);
                  const attRec=attendance.find(a=>a.enrollmentId===sl.enrollment.id&&a.date===sl.date);
                  const fbRec=(feedback||[]).find(f=>f.enrollmentId===sl.enrollment.id&&f.date===sl.date);
                  const dayMatCount=materials.filter(m=>m.courseId===sl.course.id&&m.dayIndex===sl.dayIndex).length;
                  const dimText=isAbsent||isPast?"#9E9E9E":col.text;
                  const dimBorder=isAbsent||isPast?"#CFD8DC":col.border;
                  const showTeacherFbBtn = isTeacher && isPast;
                  const showStudentFbBtn = isStudent && isPast && fbRec?.status==="approved";
                  const fbColor = fbRec ? {pending:"#E65100",approved:"#2E7D32",rejected:"#D32F2F"}[fbRec.status] : "#7B1FA2";
                  return (
                    <div key={sl.course.id+sl.date+sl.sessionNo} style={{background:isAbsent?"#F9F9F9":col.bg,border:`1px solid ${dimBorder}`,borderRadius:6,padding:"5px 6px",marginBottom:3,opacity:isAbsent?0.55:isPast?0.6:1}}>
                      <div onClick={()=>setDetTarget({course:sl.course,dayIndex:sl.dayIndex})} style={{cursor:"pointer",marginBottom:2,display:"flex",justifyContent:"space-between",gap:2}}>
                        <div style={{fontSize:10,fontWeight:600,color:dimText,lineHeight:1.3,wordBreak:"break-word",flex:1}}>{sl.course.subject.length>18?sl.course.subject.slice(0,16)+"…":sl.course.subject}</div>
                        <span style={{fontSize:9,color:dimText,opacity:0.5}}>ℹ</span>
                      </div>
                      <div style={{fontSize:9,color:dimText,opacity:0.8,marginBottom:1}}>{sl.course.start}–{endTime}</div>
                      <div style={{fontSize:8,color:"#9E9E9E",marginBottom:2}}>#{sl.sessionNo}</div>
                      {currentUser.role==="admin"&&teacher&&<div style={{fontSize:9,color:dimText,opacity:0.7}}>{teacher.name}</div>}
                      {currentUser.role!=="student"&&student&&<div style={{fontSize:9,color:dimText,opacity:0.7}}>{student.name}</div>}
                      {isAbsent&&<div style={{fontSize:8,color:"#D32F2F",fontWeight:600}}>{lang==="zh"?"已請假":"Absent"}</div>}
                      {isOngoing&&<div style={{fontSize:8,color:"#4CAF50",fontWeight:600}}>{lang==="zh"?"進行中":"Live"}</div>}
                      {attRec&&<div style={{fontSize:8,color:attRec.type==="absent"?"#D32F2F":attRec.type==="excused"?"#1A6B8A":attRec.type==="teacher_leave"?"#FF9800":"#9E9E9E",fontWeight:600}}>{attRec.type==="absent"?(lang==="zh"?"缺勤":"Absent"):attRec.type==="excused"?(lang==="zh"?"請假":"Leave"):attRec.type==="teacher_leave"?(lang==="zh"?"師假":"T.Leave"):(lang==="zh"?"備註":"Note")}</div>}
                      <div style={{display:"flex",flexWrap:"wrap",gap:2,marginTop:3,alignItems:"center"}}>
                        {!isAbsent&&!isPast&&sl.course.meetingUrl&&<a href={sl.course.meetingUrl} target="_blank" rel="noreferrer" style={{fontSize:9,fontWeight:500,background:col.border,color:"#fff",borderRadius:3,padding:"2px 5px",textDecoration:"none"}}>{t.join}</a>}
                        <button onClick={()=>setMatTarget({course:sl.course,dayIndex:sl.dayIndex})} style={{fontSize:9,background:"transparent",border:`1px solid ${dimBorder}`,color:dimText,borderRadius:3,padding:"2px 5px",cursor:"pointer"}}>📄{dayMatCount>0?` ${dayMatCount}`:""}</button>
                        {canAbsent&&!isAbsent&&!isPast&&!attRec&&<button onClick={()=>{if(leaveOk)onAbsent(sl.course,sl.dayIndex);else setToast(t.absentTooLate);}} style={{fontSize:8,background:"transparent",border:`1px solid ${leaveOk?"#9E9E9E":"#E0E0E0"}`,color:leaveOk?"#9E9E9E":"#CFD8DC",borderRadius:3,padding:"2px 4px",cursor:leaveOk?"pointer":"not-allowed",opacity:leaveOk?0.6:0.25,marginLeft:"auto"}} title={leaveOk?t.absent:t.absentTooLate}>{lang==="zh"?"假":"Lv"}</button>}
                        {/* Teacher: write/edit feedback */}
                        {showTeacherFbBtn&&<button onClick={()=>setFbTarget(sl)} title={t.feedbackShort} style={{fontSize:9,background:fbRec?`${fbColor}18`:"transparent",border:`1px solid ${fbColor}`,color:fbColor,borderRadius:3,padding:"2px 5px",cursor:"pointer",marginLeft:"auto",fontWeight:600}}>💬</button>}
                        {/* Student: view approved feedback */}
                        {showStudentFbBtn&&<button onClick={()=>setFbTarget(sl)} title={t.feedbackFromTeacher} style={{fontSize:9,background:"rgba(46,125,50,0.12)",border:"1px solid #2E7D32",color:"#2E7D32",borderRadius:3,padding:"2px 5px",cursor:"pointer",marginLeft:"auto",fontWeight:600}}>💬</button>}
                        {/* Admin: edit session status — works for past AND future sessions */}
                        {isAdmin&&<button onClick={()=>setAdminEditTarget(sl)} title={t.adminSessionEdit} style={{fontSize:9,background:attRec?"rgba(26,107,138,0.12)":"transparent",border:`1px solid ${attRec?"#1A6B8A":dimBorder}`,color:attRec?"#1A6B8A":dimText,borderRadius:3,padding:"2px 5px",cursor:"pointer",marginLeft:isAdmin&&!canAbsent?"auto":0,fontWeight:attRec?700:400}}>📝</button>}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Admin Session Modal ──────────────────────────────────────────────────────
// Admin can set/edit the status of ANY session (past or future) from the schedule
function AdminSessionModal({ slot, users, lang, attendance, setAttendance, enrollments, setEnrollments, courses, setToast, onClose }) {
  const t = T[lang];
  const {course, date, dayIndex, sessionNo, enrollment} = slot;
  const teacher = users.find(u=>u.id===course.teacherId);
  const student  = users.find(u=>u.id===course.studentId);
  const endTime  = addMins(course.start, course.duration);

  // Existing record for this session
  const existing = attendance.find(a=>a.enrollmentId===enrollment.id&&a.date===date);
  const [type, setType] = useState(existing?.type||"normal");
  const [note, setNote] = useState(existing?.note||"");

  const OPTS = [
    {k:"normal",         icon:"✅", zh:"正常上課",          en:"Normal (attended)",        color:"#2E7D32", hint:lang==="zh"?"清除異常狀態":"Marks as attended"},
    {k:"excused",        icon:"📘", zh:"學生請假（順延）",   en:"Student Leave (deferred)", color:"#1A6B8A", hint:lang==="zh"?"不扣課，自動順延至下一堂":"Not deducted, auto-deferred"},
    {k:"teacher_leave",  icon:"👨‍🏫",zh:"老師請假（順延）",   en:"Teacher Leave (deferred)", color:"#FF9800", hint:lang==="zh"?"老師假，學生不扣課":"Teacher absent, not deducted"},
    {k:"absent",         icon:"❌", zh:"學生缺勤（扣課）",   en:"Absent (deducted)",        color:"#D32F2F", hint:lang==="zh"?"此堂扣課，不順延":"Session deducted"},
    {k:"other",          icon:"📝", zh:"其他備註",           en:"Other / Note only",        color:"#9E9E9E", hint:lang==="zh"?"僅記錄備註，不影響計算":"Note only, no effect"},
  ];

  const save = () => {
    if (type==="normal") {
      // Remove any existing record — session is simply normal
      setAttendance(prev=>prev.filter(a=>!(a.enrollmentId===enrollment.id&&a.date===date)));
      setToast(t.sessionDeleted);
    } else {
      const rec = {
        id: existing?.id||genId(),
        enrollmentId: enrollment.id,
        courseId: course.id,
        date, dayIndex, sessionNo,
        type, note,
        recordedAt: new Date().toISOString(),
        recordedBy: "admin",
        _adminEdit: true,
      };
      if (existing) {
        setAttendance(prev=>prev.map(a=>a.id===existing.id?rec:a));
      } else {
        setAttendance(prev=>[...prev,rec]);
      }
      // If excused/teacher_leave → rebuild schedule to defer
      if (type==="excused"||type==="teacher_leave") {
        const nextAtt = existing
          ? attendance.map(a=>a.id===existing.id?rec:a)
          : [...attendance,rec];
        const excusedDates = nextAtt
          .filter(a=>a.courseId===course.id&&(a.type==="excused"||a.type==="teacher_leave"))
          .map(a=>a.date);
        const newSched = buildSchedule(course, enrollment.startDate, enrollment.totalSessions, excusedDates);
        setEnrollments(es=>es.map(e=>e.id===enrollment.id?{...e,scheduledDates:newSched}:e));
      }
      // If changed FROM excused/teacher_leave TO something else → re-include that date
      if (existing && (existing.type==="excused"||existing.type==="teacher_leave") && type!=="excused" && type!=="teacher_leave") {
        const nextAtt = attendance.map(a=>a.id===existing.id?rec:a);
        const excusedDates = nextAtt
          .filter(a=>a.courseId===course.id&&(a.type==="excused"||a.type==="teacher_leave"))
          .map(a=>a.date);
        const newSched = buildSchedule(course, enrollment.startDate, enrollment.totalSessions, excusedDates);
        setEnrollments(es=>es.map(e=>e.id===enrollment.id?{...e,scheduledDates:newSched}:e));
      }
      setToast(t.sessionSaved);
    }
    onClose();
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9100,padding:"1rem"}}>
      <div style={{background:"#FFFFFF",borderRadius:16,width:"100%",maxWidth:440,boxSizing:"border-box",boxShadow:"0 8px 36px rgba(23,47,57,0.2)",overflow:"hidden"}}>
        {/* Header */}
        <div style={{background:"#172F39",padding:"13px 18px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:14,fontWeight:600,color:"#fff"}}>📝 {t.adminSessionEdit}</span>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.15)",border:"none",borderRadius:"50%",width:28,height:28,cursor:"pointer",color:"#fff",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
        </div>
        <div style={{padding:"16px 18px"}}>
          {/* Session info */}
          <div style={{background:"#F5F5F5",borderRadius:8,padding:"10px 13px",marginBottom:14,fontSize:12,color:"#546E7A",lineHeight:1.7}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div>
                <div style={{fontWeight:600,color:"#172F39",fontSize:13}}>{course.subject}</div>
                <div>{date} ({T[lang].days[dayIndex]}) · {course.start}–{endTime}</div>
                <div>{lang==="zh"?"學生":"Student"}: {student?.name||"—"} · {lang==="zh"?"老師":"Teacher"}: {teacher?.name||"—"}</div>
              </div>
              <span style={{fontSize:11,background:"rgba(26,107,138,0.1)",color:"#1A6B8A",borderRadius:4,padding:"2px 7px",fontWeight:500,flexShrink:0}}>#{sessionNo}</span>
            </div>
            {existing&&<div style={{marginTop:5,fontSize:11,color:"#FF9800"}}>⚠ {lang==="zh"?"目前有記錄：":"Current record: "}<strong>{OPTS.find(o=>o.k===existing.type)?.[lang==="zh"?"zh":"en"]||existing.type}</strong>{existing.note?` — ${existing.note}`:""}</div>}
          </div>

          {/* Status options */}
          <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:14}}>
            {OPTS.map(o=>(
              <button key={o.k} onClick={()=>setType(o.k)}
                style={{display:"flex",alignItems:"flex-start",gap:10,padding:"10px 13px",borderRadius:8,border:`1.5px solid ${type===o.k?o.color:"#E0E0E0"}`,background:type===o.k?`${o.color}11`:"transparent",color:type===o.k?o.color:"#546E7A",fontSize:12,cursor:"pointer",textAlign:"left"}}>
                <span style={{fontSize:16,flexShrink:0,marginTop:1}}>{o.icon}</span>
                <div style={{flex:1}}>
                  <div style={{fontWeight:type===o.k?600:400}}>{lang==="zh"?o.zh:o.en}</div>
                  <div style={{fontSize:10,opacity:0.7,marginTop:1}}>{o.hint}</div>
                </div>
                {type===o.k&&<span style={{color:o.color,fontWeight:700,flexShrink:0}}>✓</span>}
              </button>
            ))}
          </div>

          {/* Note — hide for "normal" */}
          {type!=="normal" && (
            <div style={{marginBottom:14}}>
              <label style={{fontSize:12,color:"#546E7A",display:"block",marginBottom:4}}>{t.sessionNote}</label>
              <input
                style={{width:"100%",boxSizing:"border-box",padding:"8px 10px",borderRadius:6,border:"0.5px solid #CFD8DC",background:"#FFFFFF",color:"#172F39",fontSize:13}}
                value={note}
                onChange={e=>setNote(e.target.value)}
                placeholder={lang==="zh"?"例：學生發燒、老師出差…":"e.g. Student sick, teacher traveling…"}
                autoFocus
              />
            </div>
          )}

          {/* Buttons */}
          <div style={{display:"flex",gap:8}}>
            <button onClick={save} style={{flex:1,background:"#1A6B8A",border:"none",borderRadius:7,color:"#fff",padding:"10px",fontSize:13,fontWeight:600,cursor:"pointer"}}>
              ✓ {lang==="zh"?"儲存":"Save"}
            </button>
            <button onClick={onClose} style={{padding:"10px 16px",borderRadius:7,background:"transparent",border:"0.5px solid #CFD8DC",color:"#546E7A",fontSize:13,cursor:"pointer"}}>
              {t.cancel}
            </button>
          </div>
          {/* Clear existing record */}
          {existing && (
            <button onClick={()=>{setType("normal");save();}} style={{width:"100%",marginTop:7,padding:"7px",borderRadius:6,background:"transparent",border:"0.5px solid #FFCDD2",color:"#D32F2F",fontSize:11,cursor:"pointer"}}>
              🗑 {t.clearRecord}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Feedback Modal ───────────────────────────────────────────────────────────
// Used by teachers to write/edit post-class feedback for a completed session,
// and by students (read-only) to view feedback once admin has approved it.
function FeedbackModal({ slot, currentUser, users, lang, feedback, setFeedback, setToast, onClose, readOnly }) {
  const t = T[lang];
  const {course, date, dayIndex, sessionNo, enrollment} = slot;
  const teacher = users.find(u=>u.id===course.teacherId);
  const student  = users.find(u=>u.id===course.studentId);
  const endTime  = addMins(course.start, course.duration);

  const existing = feedback.find(f=>f.enrollmentId===enrollment.id && f.date===date);
  const [text, setText] = useState(existing?.text || "");

  const STATUS_META = {
    pending:  {label:t.feedbackStatusPending,  color:"#E65100", bg:"#FFF3E0"},
    approved: {label:t.feedbackStatusApproved, color:"#2E7D32", bg:"#E8F5E9"},
    rejected: {label:t.feedbackStatusRejected, color:"#D32F2F", bg:"#FFEBEE"},
  };
  const statusMeta = existing ? STATUS_META[existing.status] : null;

  const save = () => {
    if (!text.trim()) return;
    const rec = {
      id: existing?.id || genId(),
      enrollmentId: enrollment.id,
      courseId: course.id,
      studentId: course.studentId,
      teacherId: course.teacherId,
      date, dayIndex, sessionNo,
      text: text.trim(),
      status: "pending", // (re)submitting always resets to pending for review
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      reviewedAt: "",
      reviewedBy: "",
    };
    if (existing) {
      setFeedback(prev => prev.map(f => f.id===existing.id ? rec : f));
    } else {
      setFeedback(prev => [...prev, rec]);
    }
    setToast(t.feedbackSaved);
    onClose();
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9100,padding:"1rem"}}>
      <div style={{background:"#FFFFFF",borderRadius:16,width:"100%",maxWidth:460,boxSizing:"border-box",boxShadow:"0 8px 36px rgba(23,47,57,0.2)",overflow:"hidden"}}>
        {/* Header */}
        <div style={{background:"#172F39",padding:"13px 18px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:14,fontWeight:600,color:"#fff"}}>💬 {readOnly ? t.feedbackView : (existing ? t.feedbackEdit : t.feedbackWrite)}</span>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.15)",border:"none",borderRadius:"50%",width:28,height:28,cursor:"pointer",color:"#fff",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
        </div>
        <div style={{padding:"16px 18px"}}>
          {/* Session info */}
          <div style={{background:"#F5F5F5",borderRadius:8,padding:"10px 13px",marginBottom:14,fontSize:12,color:"#546E7A",lineHeight:1.7}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div>
                <div style={{fontWeight:600,color:"#172F39",fontSize:13}}>{course.subject}</div>
                <div>{date} ({T[lang].days[dayIndex]}) · {course.start}–{endTime}</div>
                <div>{lang==="zh"?"學生":"Student"}: {student?.name||"—"} · {lang==="zh"?"老師":"Teacher"}: {teacher?.name||"—"}</div>
              </div>
              <span style={{fontSize:11,background:"rgba(26,107,138,0.1)",color:"#1A6B8A",borderRadius:4,padding:"2px 7px",fontWeight:500,flexShrink:0}}>#{sessionNo}</span>
            </div>
            {statusMeta && (
              <div style={{marginTop:6}}>
                <span style={{fontSize:11,background:statusMeta.bg,color:statusMeta.color,borderRadius:4,padding:"2px 8px",fontWeight:600}}>● {statusMeta.label}</span>
                {existing.status==="rejected" && existing.reviewNote && (
                  <div style={{marginTop:4,fontSize:11,color:"#D32F2F"}}>↳ {existing.reviewNote}</div>
                )}
              </div>
            )}
          </div>

          {/* Feedback text */}
          <label style={{fontSize:12,color:"#546E7A",display:"block",marginBottom:5,fontWeight:500}}>{t.feedbackLabel}</label>
          {readOnly ? (
            <div style={{background:"#F5F5F5",borderRadius:8,padding:"12px 14px",fontSize:13,color:"#172F39",lineHeight:1.7,whiteSpace:"pre-wrap",minHeight:100}}>
              {existing?.text || t.feedbackNone}
            </div>
          ) : (
            <textarea
              value={text}
              onChange={e=>setText(e.target.value)}
              rows={6}
              placeholder={t.feedbackPlaceholder}
              style={{width:"100%",boxSizing:"border-box",padding:"10px 12px",borderRadius:8,border:"0.5px solid #CFD8DC",background:"#FFFFFF",color:"#172F39",fontSize:13,lineHeight:1.6,resize:"vertical",fontFamily:"inherit"}}
              autoFocus
            />
          )}

          {/* Buttons */}
          {!readOnly && (
            <div style={{display:"flex",gap:8,marginTop:14}}>
              <button onClick={save} disabled={!text.trim()} style={{flex:1,background:text.trim()?"#1A6B8A":"#E0E0E0",border:"none",borderRadius:7,color:text.trim()?"#fff":"#9E9E9E",padding:"10px",fontSize:13,fontWeight:600,cursor:text.trim()?"pointer":"not-allowed"}}>
                ✓ {t.feedbackSave}
              </button>
              <button onClick={onClose} style={{padding:"10px 16px",borderRadius:7,background:"transparent",border:"0.5px solid #CFD8DC",color:"#546E7A",fontSize:13,cursor:"pointer"}}>
                {t.cancel}
              </button>
            </div>
          )}
          {readOnly && (
            <button onClick={onClose} style={{width:"100%",marginTop:14,padding:"10px",borderRadius:7,background:"#1A6B8A",border:"none",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer"}}>
              {lang==="zh"?"關閉":"Close"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Slot course card (for list view) ────────────────────────────────────────
function SlotCourseCard({ slot, colorIdx, users, lang, currentUser, absences, materials, setMaterials, onAbsent, setToast, weekDates, weekOffset, attendance, setAttendance, enrollments, setEnrollments, courses, feedback, setFeedback }) {
  const t = T[lang];
  const {course, dayIndex, date, enrollment, sessionNo} = slot;
  const teacher = users.find(u=>u.id===course.teacherId);
  const student  = users.find(u=>u.id===course.studentId);
  const col = COLORS[colorIdx%COLORS.length];
  const endTime = addMins(course.start, course.duration);
  const isAbsent = absences.some(a=>a.courseId===course.id&&a.dateStr===date);
  const canAbsent = currentUser.role==="student"||currentUser.role==="teacher";
  const isAdmin = currentUser.role==="admin";
  const isTeacher = currentUser.role==="teacher";
  const isStudent = currentUser.role==="student";
  const leaveOk  = canRequestLeaveForWeek(weekDates, dayIndex, course.start, course.duration);
  const status   = classStatusForWeek(weekDates, dayIndex, course.start, course.duration);
  const isPast   = status==="past";
  const isOngoing= status==="ongoing";
  const attRec   = (attendance||[]).find(a=>a.enrollmentId===enrollment.id&&a.date===date);
  const totalMatCount = materials.filter(m=>m.courseId===course.id).length;
  const dayMatCount   = materials.filter(m=>m.courseId===course.id&&m.dayIndex===dayIndex).length;
  const fbRec = (feedback||[]).find(f=>f.enrollmentId===enrollment.id&&f.date===date);
  const [showMat, setShowMat] = useState(false);
  const [matInitDay, setMatInitDay] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showAdminEdit, setShowAdminEdit] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const openMat = (d) => { setMatInitDay(d); setShowMat(true); };

  const cardOpacity = isAbsent?0.55:isPast?0.5:1;
  const cardBg = isAbsent?"#F5F5F5":col.bg;
  const cardBorder = isAbsent?"#CFD8DC":isPast?col.border+"88":col.border;
  const textCol = (isAbsent||isPast)?"#9E9E9E":col.text;

  const attBadge = attRec ? {
    absent:        {label:lang==="zh"?"缺勤扣課":"Absent",  color:"#D32F2F", bg:"rgba(211,47,47,0.1)"},
    excused:       {label:lang==="zh"?"正規請假":"Leave",    color:"#1A6B8A", bg:"rgba(26,107,138,0.1)"},
    teacher_leave: {label:lang==="zh"?"老師假":"T.Leave",   color:"#FF9800", bg:"rgba(255,152,0,0.1)"},
    other:         {label:lang==="zh"?"備註":"Note",        color:"#9E9E9E", bg:"rgba(158,158,158,0.1)"},
  }[attRec.type] : null;

  const FB_STATUS = {
    pending:  {label:t.feedbackStatusPending,  color:"#E65100"},
    approved: {label:t.feedbackStatusApproved, color:"#2E7D32"},
    rejected: {label:t.feedbackStatusRejected, color:"#D32F2F"},
  };

  // Teacher: can write/edit feedback once the session is over
  const showTeacherFbBtn = isTeacher && isPast;
  // Student: can view feedback only once it's approved
  const showStudentFbBtn = isStudent && isPast && fbRec?.status==="approved";

  return (
    <>
      {showDetail&&<CourseDetailModal course={course} dayIndex={dayIndex} users={users} lang={lang} materials={materials} onClose={()=>setShowDetail(false)}/>}
      {showMat&&<MaterialPanel course={course} initialDayFilter={matInitDay} users={users} lang={lang} currentUser={currentUser} materials={materials} setMaterials={setMaterials} setToast={setToast} onClose={()=>setShowMat(false)}/>}
      {showAdminEdit&&<AdminSessionModal slot={slot} users={users} lang={lang} attendance={attendance||[]} setAttendance={setAttendance} enrollments={enrollments||[]} setEnrollments={setEnrollments} courses={courses||[]} setToast={setToast} onClose={()=>setShowAdminEdit(false)}/>}
      {showFeedback&&<FeedbackModal slot={slot} currentUser={currentUser} users={users} lang={lang} feedback={feedback||[]} setFeedback={setFeedback} setToast={setToast} onClose={()=>setShowFeedback(false)} readOnly={isStudent}/>}
      <div style={{background:cardBg,border:`1.5px solid ${cardBorder}`,borderRadius:10,padding:"10px 14px",marginBottom:8,opacity:cardOpacity}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:4}}>
          <div style={{display:"flex",alignItems:"center",gap:6,flex:1,minWidth:0}}>
            <span style={{fontSize:10,background:col.border+"22",color:col.text,borderRadius:3,padding:"1px 5px",flexShrink:0,fontWeight:500}}>#{sessionNo}</span>
            <span onClick={()=>setShowDetail(true)} style={{fontWeight:500,fontSize:14,color:textCol,cursor:"pointer",textDecoration:"underline dotted",textDecorationColor:textCol+"66",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{course.subject}</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:5,flexShrink:0}}>
            {isPast&&<span style={{fontSize:10,background:"#F0F0F0",color:"#9E9E9E",borderRadius:4,padding:"1px 6px"}}>{lang==="zh"?"已結束":"Ended"}</span>}
            {isOngoing&&<span style={{fontSize:10,background:"rgba(76,175,80,0.15)",color:"#4CAF50",borderRadius:4,padding:"1px 6px"}}>{lang==="zh"?"進行中":"Live"}</span>}
            <span style={{fontSize:12,color:textCol,opacity:0.9,whiteSpace:"nowrap"}}>{course.start}–{endTime}·{course.duration}m</span>
            <button onClick={()=>setShowDetail(true)} style={{background:"transparent",border:`1px solid ${textCol}44`,borderRadius:4,color:textCol,fontSize:11,padding:"1px 6px",cursor:"pointer",opacity:0.7}}>ℹ</button>
            {/* Admin session edit button — all sessions, all times */}
            {isAdmin&&<button onClick={()=>setShowAdminEdit(true)} title={t.adminSessionEdit} style={{background:attRec?"rgba(26,107,138,0.1)":"transparent",border:`1px solid ${attRec?"#1A6B8A":"#CFD8DC"}`,borderRadius:4,color:attRec?"#1A6B8A":"#9E9E9E",fontSize:11,padding:"1px 6px",cursor:"pointer",fontWeight:attRec?600:400}}>📝</button>}
          </div>
        </div>
        {currentUser.role!=="teacher"&&teacher&&<div style={{fontSize:12,color:textCol,opacity:0.85,marginTop:3}}>{t.teacher}: {teacher.name}</div>}
        {currentUser.role!=="student"&&student&&<div style={{fontSize:12,color:textCol,opacity:0.85}}>{t.student}: {student.name}</div>}
        {isAdmin&&<div style={{fontSize:11,color:"#9E9E9E",marginTop:1}}>{lang==="zh"?"付費排課":"Enrollment"}: {enrollment.payDate} · {enrollment.totalSessions}{lang==="zh"?"堂":"sess."}</div>}
        {isAbsent&&<div style={{fontSize:11,color:"#D32F2F",marginTop:3,fontWeight:500}}>● {t.absentAlready}</div>}
        {attBadge&&<div style={{fontSize:11,color:attBadge.color,background:attBadge.bg,borderRadius:4,padding:"2px 8px",marginTop:4,display:"inline-block",fontWeight:500}}>● {attBadge.label}{attRec?.note?` — ${attRec.note}`:""}</div>}
        {/* Feedback status badge — visible to teacher (their own submission) and admin */}
        {fbRec && (isTeacher||isAdmin) && (
          <div style={{fontSize:11,color:FB_STATUS[fbRec.status].color,marginTop:4,fontWeight:500}}>💬 {t.feedbackShort}: {FB_STATUS[fbRec.status].label}</div>
        )}
        <div style={{display:"flex",gap:6,marginTop:8,flexWrap:"wrap",alignItems:"center"}}>
          {!isAbsent&&!isPast&&course.meetingUrl&&<a href={course.meetingUrl} target="_blank" rel="noreferrer" style={{fontSize:13,fontWeight:500,background:col.border,color:"#fff",borderRadius:6,padding:"5px 14px",textDecoration:"none"}}>{t.join}</a>}
          <button onClick={()=>openMat(dayIndex)} style={{fontSize:13,fontWeight:500,background:"transparent",border:`1.5px solid ${isAbsent||isPast?"#CFD8DC":col.border}`,color:textCol,borderRadius:6,padding:"5px 14px",cursor:"pointer"}}>
            📄 {t.matForDay}{dayMatCount>0?` (${dayMatCount})`:""}
          </button>
          {totalMatCount>dayMatCount&&<button onClick={()=>openMat(null)} style={{fontSize:13,fontWeight:500,background:"transparent",border:`1.5px solid ${isAbsent||isPast?"#CFD8DC":col.border}`,color:textCol,borderRadius:6,padding:"5px 14px",cursor:"pointer"}}>📚 {t.allMaterials} ({totalMatCount})</button>}
          {/* Teacher: write/edit post-class feedback */}
          {showTeacherFbBtn && (
            <button onClick={()=>setShowFeedback(true)} style={{fontSize:13,fontWeight:500,background:fbRec?"transparent":"#7B1FA2",border:fbRec?`1.5px solid ${FB_STATUS[fbRec.status].color}`:"1.5px solid #7B1FA2",color:fbRec?FB_STATUS[fbRec.status].color:"#fff",borderRadius:6,padding:"5px 14px",cursor:"pointer"}}>
              💬 {fbRec?t.feedbackEdit:t.feedbackWrite}
            </button>
          )}
          {/* Student: view approved feedback */}
          {showStudentFbBtn && (
            <button onClick={()=>setShowFeedback(true)} style={{fontSize:13,fontWeight:500,background:"#E8F5E9",border:"1.5px solid #2E7D32",color:"#2E7D32",borderRadius:6,padding:"5px 14px",cursor:"pointer"}}>
              💬 {t.feedbackFromTeacher}
            </button>
          )}
          {canAbsent&&!isAbsent&&!isPast&&!attRec&&(
            <button onClick={()=>{if(leaveOk)onAbsent(course,dayIndex);else setToast(t.absentTooLate);}}
              style={{marginLeft:"auto",fontSize:10,background:"transparent",border:`1px solid ${leaveOk?"#9E9E9E":"#E0E0E0"}`,color:leaveOk?"#9E9E9E":"#CFD8DC",borderRadius:5,padding:"3px 8px",cursor:leaveOk?"pointer":"not-allowed",opacity:leaveOk?0.7:0.35}}
              title={leaveOk?t.absent:t.absentTooLate}>{t.absent}</button>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Schedule view ────────────────────────────────────────────────────────────
function getWeekSlots(courses, enrollments, weekDates) {
  const slots = [];
  const weekDateStrs = weekDates.map(fmtYMD);
  enrollments.forEach(enr => {
    const course = courses.find(c=>c.id===enr.courseId);
    if (!course) return;
    (enr.scheduledDates||[]).forEach(s => {
      const idx = weekDateStrs.indexOf(s.date);
      if (idx !== -1) {
        slots.push({ course, dayIndex: s.dayIndex, date: s.date, enrollment: enr, sessionNo: s.sessionNo });
      }
    });
  });
  // Sort by dayIndex then start time
  slots.sort((a,b) => a.dayIndex - b.dayIndex || a.course.start.localeCompare(b.course.start));
  return slots;
}

function ScheduleView({ currentUser, users, courses, lang, absences, setAbsences, materials, setMaterials, enrollments, setEnrollments, attendance, setAttendance, setToast, feedback, setFeedback }) {
  const t = T[lang];
  const [viewMode, setViewMode] = useState("calendar");
  const [weekOffset, setWeekOffset] = useState(0);
  const [absentTarget, setAbsentTarget] = useState(null);
  const isAdmin = currentUser.role==="admin";

  // Admin filter state
  const [adminFilterType, setAdminFilterType] = useState("all"); // "all" | "teacher" | "student"
  const [adminFilterId, setAdminFilterId] = useState("all");

  const weekDates = getWeekDates(weekOffset);
  const weekStart = weekDates[0];
  const weekEnd   = weekDates[6];
  const isThisWeek = weekOffset === 0;

  const teachers = users.filter(u=>u.role==="teacher");
  const students = users.filter(u=>u.role==="student");

  // Filter enrollments by role + admin filter
  const myEnrollments = enrollments.filter(enr => {
    const course = courses.find(c=>c.id===enr.courseId);
    if (!course) return false;
    if (!isAdmin) return currentUser.role==="teacher" ? course.teacherId===currentUser.id : enr.studentId===currentUser.id;
    // Admin filters
    if (adminFilterType==="teacher" && adminFilterId!=="all") return course.teacherId===adminFilterId;
    if (adminFilterType==="student" && adminFilterId!=="all") return enr.studentId===adminFilterId || course.studentId===adminFilterId;
    return true;
  });
  const weekSlots = getWeekSlots(courses, myEnrollments, weekDates);

  const enrolledCourseIds = new Set(myEnrollments.map(e=>e.courseId));
  const unenrolledCount = isAdmin ? courses.filter(c=>!enrolledCourseIds.has(c.id)).length : 0;

  // Label for current filter
  const filterLabel = isAdmin && adminFilterType!=="all" && adminFilterId!=="all"
    ? users.find(u=>u.id===adminFilterId)?.name
    : null;

  const rangeLabel = `${fmtMD(weekStart)} – ${fmtMD(weekEnd)}`;
  const weekLabel = weekOffset===0?(lang==="zh"?"本週":"This week")
    :weekOffset===-1?(lang==="zh"?"上週":"Last week")
    :weekOffset===-2?(lang==="zh"?"上上週":"2 weeks ago")
    :weekOffset===1?(lang==="zh"?"下週":"Next week")
    :weekOffset===2?(lang==="zh"?"下下週":"In 2 weeks")
    :`${weekOffset>0?"+":""}${weekOffset} ${lang==="zh"?"週":"wk"}`;

  const handleAbsent = (course, dayIndex) => {
    if (!canRequestLeaveForWeek(weekDates, dayIndex, course.start, course.duration)) {
      setToast(t.absentTooLate); return;
    }
    setAbsentTarget({course, dayIndex});
  };
  const confirmAbsent = (reason, note) => {
    const {course, dayIndex} = absentTarget;
    const dateStr = fmtYMD(weekDates[dayIndex]);
    setAbsences(prev=>[...prev,{id:genId(),courseId:course.id,day:dayIndex,weekOffset,dateStr,requestedAt:new Date().toISOString(),requestedBy:currentUser.id,requesterRole:currentUser.role,reason:reason||"sick",note:note||""}]);
    setAbsentTarget(null);
    setToast(t.notifySuccess);
  };

  const btnStyle = (active) => ({padding:"6px 13px",borderRadius:6,border:active?"none":"0.5px solid #CFD8DC",background:active?"#1A6B8A":"transparent",color:active?"#fff":"#546E7A",fontSize:12,cursor:"pointer"});
  const iStyle = {padding:"6px 10px",borderRadius:6,border:"0.5px solid #CFD8DC",background:"#FFFFFF",color:"#172F39",fontSize:12,cursor:"pointer"};

  return (
    <div>
      {absentTarget&&<AbsenceModal course={absentTarget.course} dayIndex={absentTarget.dayIndex} users={users} lang={lang} currentUser={currentUser} onConfirm={confirmAbsent} onClose={()=>setAbsentTarget(null)}/>}

      {/* ── Top bar ── */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.75rem",flexWrap:"wrap",gap:8}}>
        <div>
          <h2 style={{fontSize:17,fontWeight:500,color:"#172F39",margin:"0 0 2px"}}>{t.weekSchedule}</h2>
          <div style={{fontSize:12,color:isThisWeek?"#1A6B8A":"#546E7A",display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
            <span>{weekLabel} · {rangeLabel}</span>
            {weekSlots.length>0&&<span style={{background:"rgba(26,107,138,0.1)",color:"#1A6B8A",borderRadius:4,padding:"1px 7px",fontSize:11}}>{weekSlots.length} {lang==="zh"?"堂":"sessions"}</span>}
            {filterLabel&&<span style={{background:"#EEF6FB",color:"#1A6B8A",borderRadius:4,padding:"1px 8px",fontSize:11,fontWeight:500}}>👤 {filterLabel}</span>}
          </div>
        </div>
        <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
          {["calendar","list"].map(m=>(
            <button key={m} onClick={()=>setViewMode(m)} style={btnStyle(viewMode===m)}>
              {m==="calendar"?t.calendarView:t.listView}
            </button>
          ))}
        </div>
      </div>

      {/* ── Admin filter bar ── */}
      {isAdmin && (
        <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap",background:"#F5F5F5",borderRadius:8,padding:"8px 10px",marginBottom:"0.75rem"}}>
          <span style={{fontSize:11,color:"#9E9E9E",fontWeight:500,whiteSpace:"nowrap"}}>{lang==="zh"?"篩選：":"Filter:"}</span>
          {/* Type selector */}
          <div style={{display:"flex",gap:3}}>
            {[["all",lang==="zh"?"全部":"All"],["teacher",lang==="zh"?"老師":"Teacher"],["student",lang==="zh"?"學生":"Student"]].map(([k,l])=>(
              <button key={k} onClick={()=>{setAdminFilterType(k);setAdminFilterId("all");}} style={{padding:"4px 10px",borderRadius:5,fontSize:11,cursor:"pointer",border:adminFilterType===k?"none":"0.5px solid #CFD8DC",background:adminFilterType===k?"#1A6B8A":"transparent",color:adminFilterType===k?"#fff":"#546E7A"}}>
                {l}
              </button>
            ))}
          </div>
          {/* Person selector — only show when type is selected */}
          {adminFilterType==="teacher" && (
            <select style={iStyle} value={adminFilterId} onChange={e=>setAdminFilterId(e.target.value)}>
              <option value="all">{lang==="zh"?"所有老師":"All Teachers"}</option>
              {teachers.map(u=><option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          )}
          {adminFilterType==="student" && (
            <select style={iStyle} value={adminFilterId} onChange={e=>setAdminFilterId(e.target.value)}>
              <option value="all">{lang==="zh"?"所有學生":"All Students"}</option>
              {students.map(u=><option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          )}
          {/* Clear filter */}
          {(adminFilterType!=="all"||adminFilterId!=="all") && (
            <button onClick={()=>{setAdminFilterType("all");setAdminFilterId("all");}} style={{fontSize:11,padding:"3px 8px",borderRadius:4,border:"0.5px solid #CFD8DC",background:"transparent",color:"#9E9E9E",cursor:"pointer"}}>✕ {lang==="zh"?"清除":"Clear"}</button>
          )}
        </div>
      )}

      {/* ── Week navigation ── */}
      <div style={{display:"flex",alignItems:"center",gap:4,marginBottom:"1rem",flexWrap:"wrap"}}>
        <button onClick={()=>setWeekOffset(o=>o-2)} style={{padding:"5px 11px",borderRadius:6,border:"0.5px solid #CFD8DC",background:"transparent",color:"#546E7A",fontSize:12,cursor:"pointer"}}>«</button>
        <button onClick={()=>setWeekOffset(o=>o-1)} style={{padding:"5px 13px",borderRadius:6,border:"0.5px solid #CFD8DC",background:"transparent",color:"#546E7A",fontSize:12,cursor:"pointer"}}>‹</button>
        <button onClick={()=>setWeekOffset(0)} style={{padding:"5px 14px",borderRadius:6,border:isThisWeek?"none":"0.5px solid #1A6B8A",background:isThisWeek?"#1A6B8A":"transparent",color:isThisWeek?"#fff":"#1A6B8A",fontSize:12,cursor:"pointer",fontWeight:isThisWeek?500:400}}>
          {lang==="zh"?"本週":"Today"}
        </button>
        <button onClick={()=>setWeekOffset(o=>o+1)} style={{padding:"5px 13px",borderRadius:6,border:"0.5px solid #CFD8DC",background:"transparent",color:"#546E7A",fontSize:12,cursor:"pointer"}}>›</button>
        <button onClick={()=>setWeekOffset(o=>o+2)} style={{padding:"5px 11px",borderRadius:6,border:"0.5px solid #CFD8DC",background:"transparent",color:"#546E7A",fontSize:12,cursor:"pointer"}}>»</button>
        <span style={{fontSize:11,color:"#9E9E9E",marginLeft:4}}>{weekDates[0].getFullYear()}</span>
      </div>

      {weekSlots.length===0 ? (
        <div style={{textAlign:"center",padding:"2.5rem 0",color:"#9E9E9E"}}>
          <div style={{fontSize:28,marginBottom:8}}>📭</div>
          <div style={{fontSize:13}}>{lang==="zh"?"本週無排課":"No scheduled sessions this week"}</div>
          {isAdmin&&unenrolledCount>0&&adminFilterType==="all"&&<div style={{marginTop:6,fontSize:12,color:"#546E7A"}}>{lang==="zh"?`（${unenrolledCount} 個課程尚未建立付費排課）`:`(${unenrolledCount} course(s) have no enrollment yet)`}</div>}
          {!isAdmin&&<div style={{marginTop:6,fontSize:12,color:"#9E9E9E"}}>{lang==="zh"?"請聯絡管理員確認排課狀況":"Please contact admin to confirm your schedule"}</div>}
        </div>
      ) : (
        viewMode==="list"
          ?<SlotListView slots={weekSlots} users={users} lang={lang} currentUser={currentUser} absences={absences} materials={materials} setMaterials={setMaterials} onAbsent={handleAbsent} setToast={setToast} weekDates={weekDates} weekOffset={weekOffset} attendance={attendance} setAttendance={setAttendance} setEnrollments={setEnrollments} enrollments={enrollments} courses={courses} feedback={feedback} setFeedback={setFeedback}/>
          :<SlotCalendarView slots={weekSlots} users={users} lang={lang} currentUser={currentUser} absences={absences} materials={materials} setMaterials={setMaterials} onAbsent={handleAbsent} setToast={setToast} weekDates={weekDates} weekOffset={weekOffset} attendance={attendance} setAttendance={setAttendance} setEnrollments={setEnrollments} enrollments={enrollments} courses={courses} feedback={feedback} setFeedback={setFeedback}/>
      )}
    </div>
  );
}

// ─── Course form ──────────────────────────────────────────────────────────────
function CourseForm({ course, users, onSave, onCancel, lang }) {
  const t = T[lang];
  const teachers = users.filter(u=>u.role==="teacher");
  const students = users.filter(u=>u.role==="student");
  const defT = teachers[0]?.id||"";
  const defS = students[0]?.id||"";
  const autoSubject = (sId,tId) => `ES English Study - ${students.find(u=>u.id===sId)?.name||""} and ${teachers.find(u=>u.id===tId)?.name||""}`;
  const blank = {subject:autoSubject(defS,defT),teacherId:defT,studentId:defS,days:[0],start:"09:00",duration:50,meetingUrl:"",_edited:false};
  const [form,setForm] = useState(()=>course?{...course,_edited:true}:blank);
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const handleTeacher = v => setForm(f=>({...f,teacherId:v,subject:f._edited?f.subject:autoSubject(f.studentId,v)}));
  const handleStudent = v => setForm(f=>({...f,studentId:v,subject:f._edited?f.subject:autoSubject(v,f.teacherId)}));
  const toggleDay = d => { const cur=form.days||[]; const next=cur.includes(d)?cur.filter(x=>x!==d):[...cur,d].sort((a,b)=>a-b); set("days",next.length?next:[d]); };
  const endTime = addMins(form.start, form.duration);
  const iStyle = {width:"100%",boxSizing:"border-box",padding:"8px 10px",borderRadius:6,border:"0.5px solid #CFD8DC",background:"#FFFFFF",color:"#172F39",fontSize:13};
  const lStyle = {display:"block",fontSize:12,color:"#546E7A",marginBottom:4,marginTop:12};

  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <div><label style={lStyle}>{t.selectTeacher}</label><select style={iStyle} value={form.teacherId} onChange={e=>handleTeacher(e.target.value)}>{teachers.map(te=><option key={te.id} value={te.id}>{te.name}</option>)}</select></div>
        <div><label style={lStyle}>{t.selectStudent}</label><select style={iStyle} value={form.studentId} onChange={e=>handleStudent(e.target.value)}>{students.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
      </div>
      <label style={lStyle}>{t.subjectName}</label>
      <input style={iStyle} value={form.subject} onChange={e=>setForm(f=>({...f,subject:e.target.value,_edited:true}))} placeholder={t.autoSubjectHint}/>
      <label style={lStyle}>{t.selectDay}</label>
      <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:4}}>
        {t.days.map((d,i)=>(
          <button key={i} type="button" onClick={()=>toggleDay(i)} style={{padding:"5px 10px",borderRadius:5,fontSize:12,cursor:"pointer",border:`1px solid ${form.days?.includes(i)?"#1A6B8A":"#CFD8DC"}`,background:form.days?.includes(i)?"#1A6B8A":"transparent",color:form.days?.includes(i)?"#fff":"#546E7A"}}>{d}</button>
        ))}
      </div>
      <div style={{fontSize:11,color:"#9E9E9E",marginBottom:8}}>{t.sessionsPerWeek}: <strong style={{color:"#172F39"}}>{form.days?.length||0}</strong> {lang==="zh"?"堂/週":"sessions/week"}</div>
      <label style={lStyle}>{t.duration}</label>
      <div style={{display:"flex",gap:8}}>
        {[25,50].map(d=>(
          <button key={d} type="button" onClick={()=>set("duration",d)} style={{flex:1,padding:"8px",borderRadius:6,fontSize:13,cursor:"pointer",border:`1px solid ${form.duration===d?"#1A6B8A":"#CFD8DC"}`,background:form.duration===d?"#1A6B8A":"transparent",color:form.duration===d?"#fff":"#546E7A"}}>
            {d===25?t.min25:t.min50}
          </button>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <div><label style={lStyle}>{t.startTime}</label><input type="time" style={iStyle} value={form.start} onChange={e=>set("start",e.target.value)}/></div>
        <div><label style={lStyle}>{t.endTime}</label><div style={{...iStyle,background:"#F5F5F5",color:"#9E9E9E",borderStyle:"dashed",cursor:"not-allowed",display:"flex",alignItems:"center",marginTop:16}}>{endTime}</div></div>
      </div>
      <label style={lStyle}>{t.meetingUrl}</label>
      <input style={iStyle} value={form.meetingUrl} onChange={e=>set("meetingUrl",e.target.value)} placeholder="https://..."/>
      <div style={{display:"flex",gap:8,marginTop:16}}>
        <button onClick={()=>{const{_edited,...clean}=form;onSave(clean);}} style={{flex:1,background:"#1A6B8A",border:"none",borderRadius:6,color:"#fff",padding:"9px",fontSize:13,fontWeight:500,cursor:"pointer"}}>{t.save}</button>
        <button onClick={onCancel} style={{flex:1,background:"#F5F5F5",border:"0.5px solid #CFD8DC",borderRadius:6,color:"#172F39",padding:"9px",fontSize:13,cursor:"pointer"}}>{t.cancel}</button>
      </div>
    </div>
  );
}

// ─── Batch Material Modal ─────────────────────────────────────────────────────
// Admin can pick student + teacher → see matched courses → enter multiple material rows at once
// Can also load existing materials for bulk-edit
function BatchMaterialModal({ users, courses, materials, setMaterials, lang, setToast, onClose }) {
  const t = T[lang];
  const teachers = users.filter(u=>u.role==="teacher");
  const students = users.filter(u=>u.role==="student");

  const [selTeacher, setSelTeacher] = useState(teachers[0]?.id||"");
  const [selStudent, setSelStudent] = useState(students[0]?.id||"");
  const [selCourseId, setSelCourseId] = useState(""); // "" = all matched

  // Matched courses
  const matched = courses.filter(c=>
    (selTeacher===""||c.teacherId===selTeacher) &&
    (selStudent===""||c.studentId===selStudent)
  );
  const targetCourses = selCourseId ? matched.filter(c=>c.id===selCourseId) : matched;

  // Rows: each has {id, dayIndex, date, title, url, desc}
  const today = new Date().toISOString().slice(0,10);
  const blankRow = () => ({_rid:genId(), dayIndex:0, date:today, title:"", url:"", desc:""});
  const [rows, setRows] = useState([blankRow()]);
  const setRow = (rid, k, v) => setRows(rs=>rs.map(r=>r._rid===rid?{...r,[k]:v}:r));
  const addRow = () => setRows(rs=>[...rs, blankRow()]);
  const delRow = rid => setRows(rs=>rs.length>1?rs.filter(r=>r._rid!==rid):rs);

  // Mode: "add" or "edit existing"
  const [mode, setMode] = useState("add");

  // Edit mode: load existing materials for selected courses
  const [editRows, setEditRows] = useState([]);
  const loadExisting = () => {
    const existing = materials.filter(m=>targetCourses.some(c=>c.id===m.courseId));
    setEditRows(existing.map(m=>({...m, _dirty:false})));
    setMode("edit");
  };

  const [confirmBatchDelId, setConfirmBatchDelId] = useState(null);
  const setEditRow = (id, k, v) => setEditRows(rs=>rs.map(r=>r.id===id?{...r,[k]:v,_dirty:true}:r));
  const delEditRow = id => { setConfirmBatchDelId(id); };
  const doDelEditRow = () => {
    setMaterials(ms=>ms.filter(m=>m.id!==confirmBatchDelId));
    setEditRows(rs=>rs.filter(r=>r.id!==confirmBatchDelId));
    setConfirmBatchDelId(null);
  };

  const saveAdd = () => {
    const valid = rows.filter(r=>r.url.trim());
    if (!valid.length) return;
    const newMats = [];
    valid.forEach(r=>{
      targetCourses.forEach(c=>{
        // Only add to courses that have this dayIndex in their schedule
        if (!c.days?.includes(r.dayIndex)) return;
        newMats.push({id:genId(), courseId:c.id, dayIndex:r.dayIndex, date:r.date,
          title:r.title.trim()||r.url.trim(), url:r.url.trim(), desc:r.desc,
          addedBy:"admin", addedAt:new Date().toISOString()});
      });
    });
    setMaterials(ms=>[...ms,...newMats]);
    setToast((t.batchSaved||"{n} materials saved").replace("{n}", newMats.length));
    setRows([blankRow()]);
  };

  const saveEdit = () => {
    const dirty = editRows.filter(r=>r._dirty);
    if (!dirty.length) return;
    setMaterials(ms=>ms.map(m=>{
      const d = dirty.find(r=>r.id===m.id);
      if (!d) return m;
      const {_dirty,...clean}=d; return clean;
    }));
    setToast((t.batchSaved||"{n} saved").replace("{n}", dirty.length));
    setEditRows(rs=>rs.map(r=>({...r,_dirty:false})));
  };

  const iStyle={width:"100%",boxSizing:"border-box",padding:"7px 9px",borderRadius:5,border:"0.5px solid #CFD8DC",background:"#FAFAFA",color:"#172F39",fontSize:12};
  const lStyle={fontSize:11,color:"#546E7A",display:"block",marginBottom:3};

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",display:"flex",alignItems:"flex-start",justifyContent:"center",zIndex:8700,padding:"1rem",overflowY:"auto"}}>
      {confirmBatchDelId && <ConfirmModal title={lang==="zh"?"刪除教材":"Delete Material"} message={lang==="zh"?"確認刪除此教材？":"Delete this material?"} confirmLabel={lang==="zh"?"確認刪除":"Delete"} onConfirm={doDelEditRow} onCancel={()=>setConfirmBatchDelId(null)} danger/>}
      <div style={{background:"#FFFFFF",borderRadius:16,width:"100%",maxWidth:680,boxSizing:"border-box",boxShadow:"0 8px 40px rgba(0,0,0,0.5)",marginTop:"2rem",marginBottom:"2rem"}}>

        {/* Header */}
        <div style={{background:"#172F39",padding:"14px 20px",borderRadius:"16px 16px 0 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:15,fontWeight:600,color:"#FFFFFF"}}>📦 {t.batchMaterials}</span>
          <button onClick={onClose} style={{background:"#F5F5F5",border:"none",width:28,height:28,borderRadius:"50%",cursor:"pointer",color:"#546E7A",fontSize:17,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
        </div>

        <div style={{padding:"18px 20px"}}>
          {/* Filter row */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:14}}>
            <div>
              <label style={lStyle}>{t.batchSelectTeacher}</label>
              <select style={iStyle} value={selTeacher} onChange={e=>{setSelTeacher(e.target.value);setSelCourseId("");}}>
                <option value="">{lang==="zh"?"全部老師":"All Teachers"}</option>
                {teachers.map(u=><option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div>
              <label style={lStyle}>{t.batchSelectStudent}</label>
              <select style={iStyle} value={selStudent} onChange={e=>{setSelStudent(e.target.value);setSelCourseId("");}}>
                <option value="">{lang==="zh"?"全部學生":"All Students"}</option>
                {students.map(u=><option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div>
              <label style={lStyle}>{t.batchSelectCourse}</label>
              <select style={iStyle} value={selCourseId} onChange={e=>setSelCourseId(e.target.value)}>
                <option value="">{t.batchAllCourses} ({matched.length})</option>
                {matched.map(c=><option key={c.id} value={c.id}>{c.subject}</option>)}
              </select>
            </div>
          </div>

          {/* Matched courses preview chips */}
          {targetCourses.length > 0 && (
            <div style={{marginBottom:14}}>
              <div style={{fontSize:11,color:"#9E9E9E",marginBottom:5}}>{t.batchMatchCourses}:</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                {targetCourses.map(c=>(
                  <span key={c.id} style={{fontSize:11,background:"#F5F5F5",border:"0.5px solid #CFD8DC",borderRadius:5,padding:"3px 9px",color:"#546E7A"}}>
                    {c.subject} · {c.days?.map(d=>T[lang].days[d]).join("、")}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Mode tabs */}
          <div style={{display:"flex",gap:5,marginBottom:14}}>
            <button onClick={()=>setMode("add")} style={{padding:"6px 14px",borderRadius:6,fontSize:12,cursor:"pointer",border:mode==="add"?"none":"0.5px solid #CFD8DC",background:mode==="add"?"#1A6B8A":"transparent",color:mode==="add"?"#fff":"#546E7A"}}>
              ＋ {lang==="zh"?"批次新增":"Batch Add"}
            </button>
            <button onClick={loadExisting} style={{padding:"6px 14px",borderRadius:6,fontSize:12,cursor:"pointer",border:mode==="edit"?"none":"0.5px solid #CFD8DC",background:mode==="edit"?"#1A6B8A":"transparent",color:mode==="edit"?"#fff":"#546E7A"}}>
              ✏️ {lang==="zh"?"批次修改":"Batch Edit"}
            </button>
          </div>

          {/* ── Add mode ── */}
          {mode==="add" && (
            <>
              <p style={{fontSize:11,color:"#9E9E9E",margin:"0 0 10px",lineHeight:1.5}}>{t.batchHelp}</p>
              {/* Column headers */}
              <div style={{display:"grid",gridTemplateColumns:"80px 100px 1fr 1fr 80px 28px",gap:6,marginBottom:4}}>
                {[lang==="zh"?"星期":"Day", lang==="zh"?"日期":"Date", "URL *", lang==="zh"?"名稱(選填)":"Title", lang==="zh"?"備註":"Notes", ""].map((h,i)=>(
                  <div key={i} style={{fontSize:10,color:"#9E9E9E",fontWeight:500}}>{h}</div>
                ))}
              </div>
              {rows.map((r,idx)=>(
                <div key={r._rid} style={{display:"grid",gridTemplateColumns:"80px 100px 1fr 1fr 80px 28px",gap:6,marginBottom:6,alignItems:"center"}}>
                  <select style={iStyle} value={r.dayIndex} onChange={e=>setRow(r._rid,"dayIndex",parseInt(e.target.value))}>
                    {T[lang].days.map((d,i)=><option key={i} value={i}>{d}</option>)}
                  </select>
                  <input type="date" style={iStyle} value={r.date} onChange={e=>setRow(r._rid,"date",e.target.value)}/>
                  <input style={iStyle} value={r.url} onChange={e=>setRow(r._rid,"url",e.target.value)} placeholder="https://..."/>
                  <input style={iStyle} value={r.title} onChange={e=>setRow(r._rid,"title",e.target.value)} placeholder={lang==="zh"?"Unit 3…":"Unit 3…"}/>
                  <input style={iStyle} value={r.desc} onChange={e=>setRow(r._rid,"desc",e.target.value)} placeholder={lang==="zh"?"備註…":"Notes…"}/>
                  <button onClick={()=>delRow(r._rid)} style={{background:"transparent",border:"0.5px solid #C0392B",borderRadius:4,color:"#D32F2F",fontSize:14,cursor:"pointer",height:28,width:28}}>×</button>
                </div>
              ))}
              <div style={{display:"flex",gap:8,marginTop:8}}>
                <button onClick={addRow} style={{padding:"7px 14px",borderRadius:6,background:"#F5F5F5",border:"0.5px solid #CFD8DC",color:"#546E7A",fontSize:12,cursor:"pointer"}}>{t.batchAddRow}</button>
                <button onClick={saveAdd} disabled={!targetCourses.length} style={{flex:1,padding:"9px",borderRadius:7,background:targetCourses.length?"#1A6B8A":"#F5F5F5",border:"none",color:targetCourses.length?"#fff":"#9E9E9E",fontSize:13,fontWeight:500,cursor:targetCourses.length?"pointer":"not-allowed"}}>
                  {t.batchSaveAll} → {targetCourses.length} {lang==="zh"?"個課程":"course(s)"}
                </button>
              </div>
            </>
          )}

          {/* ── Edit mode ── */}
          {mode==="edit" && (
            <>
              {editRows.length===0 && <p style={{color:"#9E9E9E",fontSize:13,textAlign:"center",padding:"2rem 0"}}>{t.noMaterials}</p>}
              {editRows.length > 0 && (
                <>
                  <div style={{display:"grid",gridTemplateColumns:"80px 100px 1fr 1fr 80px 28px",gap:6,marginBottom:4}}>
                    {[lang==="zh"?"星期":"Day", lang==="zh"?"日期":"Date", "URL", lang==="zh"?"名稱":"Title", lang==="zh"?"備註":"Notes",""].map((h,i)=>(
                      <div key={i} style={{fontSize:10,color:"#9E9E9E",fontWeight:500}}>{h}</div>
                    ))}
                  </div>
                  <div style={{maxHeight:320,overflowY:"auto"}}>
                    {editRows.map(r=>(
                      <div key={r.id} style={{display:"grid",gridTemplateColumns:"80px 100px 1fr 1fr 80px 28px",gap:6,marginBottom:6,alignItems:"center",background:r._dirty?"rgba(26,107,138,0.06)":"transparent",borderRadius:4,padding:"2px 0"}}>
                        <select style={iStyle} value={r.dayIndex??0} onChange={e=>setEditRow(r.id,"dayIndex",parseInt(e.target.value))}>
                          {T[lang].days.map((d,i)=><option key={i} value={i}>{d}</option>)}
                        </select>
                        <input type="date" style={iStyle} value={r.date||""} onChange={e=>setEditRow(r.id,"date",e.target.value)}/>
                        <input style={iStyle} value={r.url||""} onChange={e=>setEditRow(r.id,"url",e.target.value)}/>
                        <input style={iStyle} value={r.title||""} onChange={e=>setEditRow(r.id,"title",e.target.value)}/>
                        <input style={iStyle} value={r.desc||""} onChange={e=>setEditRow(r.id,"desc",e.target.value)}/>
                        <button onClick={()=>delEditRow(r.id)} style={{background:"transparent",border:"0.5px solid #C0392B",borderRadius:4,color:"#D32F2F",fontSize:14,cursor:"pointer",height:28,width:28}}>×</button>
                      </div>
                    ))}
                  </div>
                  <button onClick={saveEdit} style={{width:"100%",marginTop:10,padding:"9px",borderRadius:7,background:"#1A6B8A",border:"none",color:"#fff",fontSize:13,fontWeight:500,cursor:"pointer"}}>
                    {t.batchSaveAll} ({editRows.filter(r=>r._dirty).length} {lang==="zh"?"項已修改":"modified"})
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Course manager ───────────────────────────────────────────────────────────
function CourseManager({ users, courses, setCourses, lang, setToast, materials, setMaterials }) {
  const t = T[lang];
  const [showAdd,setShowAdd] = useState(false);
  const [editing,setEditing] = useState(null);
  const [matTarget,setMatTarget] = useState(null);
  const [showBatch,setShowBatch] = useState(false);
  const [confirmDelCourseId, setConfirmDelCourseId] = useState(null);
  const getName = id=>users.find(u=>u.id===id)?.name||id;
  const save = form => {
    if (editing) { setCourses(courses.map(c=>c.id===editing.id?{...form,id:editing.id}:c)); setToast(t.courseUpdated); }
    else { setCourses([...courses,{...form,id:genId()}]); setToast(t.courseAdded); }
    setShowAdd(false); setEditing(null);
  };
  const del = id => { setConfirmDelCourseId(id); };
  const doDelCourse = () => {
    setCourses(courses.filter(c=>c.id!==confirmDelCourseId));
    setToast(t.courseDeleted);
    setConfirmDelCourseId(null);
  };
  const fakeAdmin = { id:"admin", role:"admin", name:"Admin" };

  return (
    <div>
      {confirmDelCourseId && <ConfirmModal title={lang==="zh"?"刪除課程":"Delete Course"} message={lang==="zh"?"確認要刪除此課程？此操作無法復原，相關教材紀錄也將失效。":"Delete this course? This cannot be undone."} confirmLabel={lang==="zh"?"確認刪除":"Delete"} onConfirm={doDelCourse} onCancel={()=>setConfirmDelCourseId(null)} danger/>}
      {matTarget && <MaterialPanel course={matTarget} initialDayFilter={null} users={users} lang={lang} currentUser={fakeAdmin} materials={materials} setMaterials={setMaterials} setToast={setToast} onClose={()=>setMatTarget(null)}/>}
      {showBatch && <BatchMaterialModal users={users} courses={courses} materials={materials} setMaterials={setMaterials} lang={lang} setToast={setToast} onClose={()=>setShowBatch(false)}/>}
      <div style={{display:"flex",gap:8,marginBottom:"1rem",flexWrap:"wrap"}}>
        <button onClick={()=>{setShowAdd(true);setEditing(null);}} style={{background:"#1A6B8A",border:"none",borderRadius:7,color:"#fff",padding:"8px 16px",fontSize:13,cursor:"pointer"}}>+ {t.addCourse}</button>
        <button onClick={()=>setShowBatch(true)} style={{background:"transparent",border:"1px solid #4A9FD4",borderRadius:7,color:"#1A6B8A",padding:"8px 16px",fontSize:13,cursor:"pointer"}}>📦 {t.batchMaterials}</button>
      </div>
      {(showAdd||editing)&&(
        <div style={{background:"#F5F5F5",borderRadius:10,border:"0.5px solid #E0E0E0",padding:"1.25rem",marginBottom:"1rem"}}>
          <div style={{fontWeight:500,fontSize:14,color:"#172F39",marginBottom:10}}>{editing?t.editCourse:t.addCourse}</div>
          <CourseForm course={editing} users={users} lang={lang} onSave={save} onCancel={()=>{setShowAdd(false);setEditing(null);}}/>
        </div>
      )}
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {courses.map(c=>{
          const matCount = materials.filter(m=>m.courseId===c.id).length;
          return (
          <div key={c.id} style={{background:"#FFFFFF",border:"0.5px solid #E0E0E0",borderRadius:10,padding:"12px 14px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:6}}>
              <div>
                <span style={{fontWeight:500,fontSize:14,color:"#172F39"}}>{c.subject}</span>
                <div style={{fontSize:12,color:"#546E7A",marginTop:2}}>{c.days?.map(d=>t.days[d]).join("、")} ({c.days?.length}{lang==="zh"?"堂/週":"x/wk"}) · {c.start}–{addMins(c.start,c.duration)} · {c.duration}min</div>
                <div style={{fontSize:12,color:"#546E7A"}}>{getName(c.teacherId)} → {getName(c.studentId)}</div>
              </div>
              <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                <button onClick={()=>setMatTarget(c)} style={{fontSize:12,padding:"5px 11px",borderRadius:5,border:"0.5px solid #4A9FD4",background:"transparent",color:"#1A6B8A",cursor:"pointer"}}>
                  📄 {t.materials}{matCount>0?` (${matCount})`:""}
                </button>
                <button onClick={()=>{setEditing(c);setShowAdd(false);}} style={{fontSize:12,padding:"5px 11px",borderRadius:5,border:"0.5px solid #CFD8DC",background:"transparent",color:"#546E7A",cursor:"pointer"}}>{t.editCourse}</button>
                <button onClick={()=>del(c.id)} style={{fontSize:12,padding:"5px 11px",borderRadius:5,border:"0.5px solid #C0392B",background:"transparent",color:"#D32F2F",cursor:"pointer"}}>{t.deleteCourse}</button>
              </div>
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── User manager ─────────────────────────────────────────────────────────────
function UserManager({ users, setUsers, lang, setToast }) {
  const t = T[lang];
  const [showAdd,setShowAdd] = useState(false);
  const [editing,setEditing] = useState(null);
  const [newUser,setNewUser] = useState({username:"",password:"",name:"",role:"student"});
  const [confirmDelUserId, setConfirmDelUserId] = useState(null);
  const [dupError, setDupError] = useState("");
  const iStyle={width:"100%",boxSizing:"border-box",padding:"8px 10px",borderRadius:6,border:"0.5px solid #CFD8DC",background:"#FFFFFF",color:"#172F39",fontSize:13};
  const lStyle={display:"block",fontSize:12,color:"#546E7A",marginBottom:4,marginTop:10};

  const addUser = () => {
    if (!newUser.username||!newUser.password||!newUser.name) return;
    if (users.some(u=>u.username===newUser.username)) { setDupError(lang==="zh"?"此帳號已存在":"Username already exists"); return; }
    setDupError("");
    setUsers([...users,{...newUser,id:genId()}]);
    setNewUser({username:"",password:"",name:"",role:"student"}); setShowAdd(false); setToast(t.userAdded);
  };
  const delUser = id => { setConfirmDelUserId(id); };
  const doDelUser = () => {
    setUsers(users.filter(u=>u.id!==confirmDelUserId));
    setToast(t.userDeleted);
    setConfirmDelUserId(null);
  };
  const saveEdit = () => {
    setUsers(users.map(u=>u.id!==editing.id?u:{...u,name:editing.name,username:editing.username,...(editing.newPwd?{password:editing.newPwd}:{}),...(u.role!=="admin"?{role:editing.role}:{})}));
    setEditing(null); setToast(t.userUpdated);
  };

  const delTargetUser = users.find(u=>u.id===confirmDelUserId);

  return (
    <div>
      {confirmDelUserId && <ConfirmModal title={lang==="zh"?"刪除帳號":"Delete User"} message={lang==="zh"?`確認刪除「${delTargetUser?.name}」的帳號？此操作無法復原。`:`Delete user "${delTargetUser?.name}"? This cannot be undone.`} confirmLabel={lang==="zh"?"確認刪除":"Delete"} onConfirm={doDelUser} onCancel={()=>setConfirmDelUserId(null)} danger/>}
      <button onClick={()=>{setShowAdd(!showAdd);setEditing(null);setDupError("");}} style={{marginBottom:"1rem",background:"#1A6B8A",border:"none",borderRadius:7,color:"#fff",padding:"8px 16px",fontSize:13,cursor:"pointer"}}>+ {t.addUser}</button>
      {showAdd&&(
        <div style={{background:"#F5F5F5",borderRadius:10,border:"0.5px solid #E0E0E0",padding:"1.25rem",marginBottom:"1rem"}}>
          <label style={lStyle}>{t.name}</label><input style={iStyle} value={newUser.name} onChange={e=>setNewUser(u=>({...u,name:e.target.value}))}/>
          <label style={lStyle}>{t.username}</label><input style={iStyle} value={newUser.username} onChange={e=>setNewUser(u=>({...u,username:e.target.value}))}/>
          <label style={lStyle}>{t.passwordLabel}</label><input type="password" style={iStyle} value={newUser.password} onChange={e=>setNewUser(u=>({...u,password:e.target.value}))}/>
          <label style={lStyle}>{t.roleLabel}</label>
          <select style={iStyle} value={newUser.role} onChange={e=>setNewUser(u=>({...u,role:e.target.value}))}>
            <option value="student">{t.role_student}</option><option value="teacher">{t.role_teacher}</option>
          </select>
          {dupError && <p style={{color:"#D32F2F",fontSize:12,margin:"6px 0 0"}}>{dupError}</p>}
          <div style={{display:"flex",gap:8,marginTop:14}}>
            <button onClick={addUser} style={{flex:1,background:"#1A6B8A",border:"none",borderRadius:6,color:"#fff",padding:"9px",fontSize:13,cursor:"pointer"}}>{t.save}</button>
            <button onClick={()=>setShowAdd(false)} style={{flex:1,background:"#F5F5F5",border:"0.5px solid #CFD8DC",borderRadius:6,color:"#172F39",padding:"9px",fontSize:13,cursor:"pointer"}}>{t.cancel}</button>
          </div>
        </div>
      )}
      {editing&&(
        <div style={{background:"#F5F5F5",borderRadius:10,border:"0.5px solid #2980B9",padding:"1.25rem",marginBottom:"1rem"}}>
          <div style={{fontWeight:500,fontSize:14,marginBottom:8,color:"#172F39"}}>{t.editUserTitle}</div>
          <label style={lStyle}>{t.name}</label><input style={iStyle} value={editing.name} onChange={e=>setEditing(v=>({...v,name:e.target.value}))}/>
          <label style={lStyle}>{t.username}</label><input style={iStyle} value={editing.username} onChange={e=>setEditing(v=>({...v,username:e.target.value}))}/>
          <label style={lStyle}>{t.newPassword}</label><input type="password" style={iStyle} value={editing.newPwd||""} onChange={e=>setEditing(v=>({...v,newPwd:e.target.value}))} placeholder={lang==="zh"?"留空不更改":"Leave blank to keep"}/>
          {editing.role!=="admin"&&<><label style={lStyle}>{t.roleLabel}</label>
          <select style={iStyle} value={editing.role} onChange={e=>setEditing(v=>({...v,role:e.target.value}))}>
            <option value="student">{t.role_student}</option><option value="teacher">{t.role_teacher}</option>
          </select></>}
          <div style={{display:"flex",gap:8,marginTop:14}}>
            <button onClick={saveEdit} style={{flex:1,background:"#1A6B8A",border:"none",borderRadius:6,color:"#fff",padding:"9px",fontSize:13,cursor:"pointer"}}>{t.save}</button>
            <button onClick={()=>setEditing(null)} style={{flex:1,background:"#F5F5F5",border:"0.5px solid #CFD8DC",borderRadius:6,color:"#172F39",padding:"9px",fontSize:13,cursor:"pointer"}}>{t.cancel}</button>
          </div>
        </div>
      )}
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {users.map(u=>(
          <div key={u.id} style={{background:"#FFFFFF",border:"0.5px solid #E0E0E0",borderRadius:10,padding:"12px 14px",display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,flexWrap:"wrap"}}>
            <div>
              <span style={{fontWeight:500,fontSize:14,color:"#172F39"}}>{u.name}</span>
              <span style={{fontSize:12,color:"#546E7A",marginLeft:8}}>@{u.username}</span>
              <span style={{fontSize:11,marginLeft:8,background:u.role==="admin"?"#EDE7F6":u.role==="teacher"?"#E3F2FD":"#E8F5E9",color:u.role==="admin"?"#311B92":u.role==="teacher"?"#1565C0":"#2E7D32",borderRadius:4,padding:"2px 7px"}}>{t[`role_${u.role}`]}</span>
            </div>
            <div style={{display:"flex",gap:6}}>
              {u.role!=="admin"&&<button onClick={()=>{setEditing({...u,newPwd:""});setShowAdd(false);}} style={{fontSize:12,padding:"5px 12px",borderRadius:5,border:"0.5px solid #CFD8DC",background:"transparent",color:"#546E7A",cursor:"pointer"}}>{t.editUser}</button>}
              {u.role!=="admin"&&<button onClick={()=>delUser(u.id)} style={{fontSize:12,padding:"5px 12px",borderRadius:5,border:"0.5px solid #C0392B",background:"transparent",color:"#D32F2F",cursor:"pointer"}}>{t.deleteUser}</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Stats helpers ────────────────────────────────────────────────────────────
function DateRangePicker({ lang, dateFrom, dateTo, setDateFrom, setDateTo, allTime, setAllTime }) {
  const t = T[lang];
  const iStyle={padding:"7px 10px",borderRadius:6,border:"0.5px solid #CFD8DC",background:"#FFFFFF",color:"#172F39",fontSize:12};
  return (
    <div style={{background:"#F5F5F5",borderRadius:10,padding:"12px 14px",marginBottom:"1.25rem",display:"flex",flexWrap:"wrap",gap:10,alignItems:"center"}}>
      <span style={{fontSize:12,color:"#546E7A",fontWeight:500}}>{t.dateRange}:</span>
      <button onClick={()=>setAllTime(true)} style={{padding:"5px 12px",borderRadius:6,fontSize:12,cursor:"pointer",border:allTime?"none":"0.5px solid #CFD8DC",background:allTime?"#1A6B8A":"transparent",color:allTime?"#fff":"#546E7A"}}>{t.allTime}</button>
      <button onClick={()=>setAllTime(false)} style={{padding:"5px 12px",borderRadius:6,fontSize:12,cursor:"pointer",border:!allTime?"none":"0.5px solid #CFD8DC",background:!allTime?"#1A6B8A":"transparent",color:!allTime?"#fff":"#546E7A"}}>{t.dateRange}</button>
      {!allTime&&<>
        <input type="date" style={iStyle} value={dateFrom} onChange={e=>setDateFrom(e.target.value)}/>
        <span style={{color:"#9E9E9E",fontSize:12}}>–</span>
        <input type="date" style={iStyle} value={dateTo} onChange={e=>setDateTo(e.target.value)}/>
      </>}
    </div>
  );
}

function StatCards({ total, completed, studentAbsent, teacherAbsent, lang }) {
  const t = T[lang];
  const absent = studentAbsent + teacherAbsent;
  return (
    <>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:8}}>
        {[
          {label:t.totalClasses,val:total,bg:"#E3F2FD",col:"#1565C0"},
          {label:t.completedClasses,val:completed,bg:"#E8F5E9",col:"#2E7D32"},
          {label:t.studentAbsent,val:studentAbsent,bg:"#FCE4EC",col:"#880E4F"},
          {label:t.teacherAbsent,val:teacherAbsent,bg:"#FBE9E7",col:"#BF360C"},
        ].map(x=>(
          <div key={x.label} style={{background:x.bg,borderRadius:8,padding:"12px 8px",textAlign:"center"}}>
            <div style={{fontSize:24,fontWeight:600,color:x.col}}>{x.val}</div>
            <div style={{fontSize:10,color:x.col,opacity:0.8,marginTop:2,lineHeight:1.2}}>{x.label}</div>
          </div>
        ))}
      </div>
      <p style={{fontSize:11,color:"#9E9E9E",margin:"0 0 1.25rem"}}>{t.completedNote}</p>
    </>
  );
}

// Compute stats for a set of courses using enrollment data as source of truth
// enrollments gives actual scheduled sessions; absences gives leave requests from course view
// attendance gives admin-recorded attendance (excused/absent/teacher_leave)
function computeStats(courses, absences, allTime, dateFrom, dateTo, enrollments, attendance) {
  const today = new Date().toISOString().slice(0,10);
  let total = 0, studentAbsent = 0, teacherAbsent = 0, completed = 0;
  courses.forEach(c => {
    // Total = all scheduledDates across enrollments for this course
    const courseEnrollments = (enrollments||[]).filter(e=>e.courseId===c.id);
    const allSessions = courseEnrollments.flatMap(e=>e.scheduledDates||[]);

    // Filter sessions by date range if needed
    const filteredSessions = allTime
      ? allSessions
      : allSessions.filter(s=>(!dateFrom||s.date>=dateFrom)&&(!dateTo||s.date<=dateTo));

    total += filteredSessions.length;

    filteredSessions.forEach(s => {
      // Check admin attendance record first
      const enr = courseEnrollments.find(e=>e.scheduledDates?.some(sd=>sd.date===s.date&&sd.dayIndex===s.dayIndex));
      const attRec = enr && (attendance||[]).find(a=>a.enrollmentId===enr.id&&a.date===s.date);
      if (attRec) {
        if (attRec.type==="absent") studentAbsent++;
        else if (attRec.type==="teacher_leave") teacherAbsent++;
        else if (attRec.type==="excused") studentAbsent++; // excused still counts as student leave
        return;
      }
      // Fall back to self-reported absences from course view
      const selfAbsence = (absences||[]).find(a=>a.courseId===c.id&&a.dateStr===s.date);
      if (selfAbsence) {
        if (selfAbsence.requesterRole==="teacher") teacherAbsent++;
        else studentAbsent++;
        return;
      }
      // Past session with no record = completed (only once the session has actually ended)
      if (isSessionOver(s.date, c.start, c.duration)) completed++;
    });
  });
  return { total, studentAbsent, teacherAbsent, completed };
}

// ─── Teacher stats ────────────────────────────────────────────────────────────
function TeacherStats({ users, courses, absences, attendance, enrollments, lang }) {
  const t = T[lang];
  const teachers = users.filter(u=>u.role==="teacher");
  const [selId, setSelId] = useState(teachers[0]?.id||"");
  const [allTime, setAllTime] = useState(true);
  const today = new Date().toISOString().slice(0,10);
  const [dateFrom, setDateFrom] = useState(today.slice(0,7)+"-01");
  const [dateTo, setDateTo] = useState(today);
  const getName = id => users.find(u=>u.id===id)?.name||id;
  const iStyle={padding:"8px 10px",borderRadius:6,border:"0.5px solid #CFD8DC",background:"#FFFFFF",color:"#172F39",fontSize:13};

  const myCourses = courses.filter(c=>c.teacherId===selId);
  const stats = computeStats(myCourses, absences, allTime, dateFrom, dateTo, enrollments, attendance);

  const allAbsences = absences.filter(a => {
    const c = myCourses.find(x=>x.id===a.courseId);
    if (!c) return false;
    if (!allTime && a.requestedAt) { const d=a.requestedAt.slice(0,10); if ((dateFrom&&d<dateFrom)||(dateTo&&d>dateTo)) return false; }
    return true;
  });

  return (
    <div>
      <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:"1.25rem",flexWrap:"wrap"}}>
        <div>
          <label style={{display:"block",fontSize:12,color:"#546E7A",marginBottom:4}}>{t.selectTeacherStats}</label>
          <select style={{...iStyle,minWidth:160}} value={selId} onChange={e=>setSelId(e.target.value)}>
            {teachers.map(te=><option key={te.id} value={te.id}>{te.name}</option>)}
          </select>
        </div>
      </div>
      <DateRangePicker lang={lang} dateFrom={dateFrom} dateTo={dateTo} setDateFrom={setDateFrom} setDateTo={setDateTo} allTime={allTime} setAllTime={setAllTime}/>
      <StatCards {...stats} lang={lang}/>
      <div style={{fontSize:13,color:"#546E7A",marginBottom:8,fontWeight:500}}>{t.courseDetails}</div>
      {myCourses.length===0&&<p style={{color:"#9E9E9E",fontSize:13}}>—</p>}
      {myCourses.map(c=>{
        const courseEnrs = (enrollments||[]).filter(e=>e.courseId===c.id);
        const totalSessions = courseEnrs.reduce((sum,e)=>(e.scheduledDates?.length||0)+sum, 0);
        const cAbs = absences.filter(a=>{
          if(a.courseId!==c.id) return false;
          if(!allTime&&a.requestedAt){const d=a.requestedAt.slice(0,10);if((dateFrom&&d<dateFrom)||(dateTo&&d>dateTo))return false;}
          return true;
        });
        const attRecs=(attendance||[]).filter(a=>courseEnrs.some(e=>e.id===a.enrollmentId));
        const sAbs=cAbs.filter(a=>a.requesterRole!=="teacher").length + attRecs.filter(a=>a.type==="absent"||a.type==="excused").length;
        const tAbs=cAbs.filter(a=>a.requesterRole==="teacher").length + attRecs.filter(a=>a.type==="teacher_leave").length;
        return (
          <div key={c.id} style={{background:"#FFFFFF",border:"0.5px solid #E0E0E0",borderRadius:8,padding:"10px 14px",marginBottom:8}}>
            <div style={{fontWeight:500,fontSize:13,color:"#172F39"}}>{c.subject}</div>
            <div style={{fontSize:12,color:"#546E7A",marginTop:2}}>{getName(c.studentId)} · {c.days?.map(d=>t.days[d]).join("、")} · {c.start} ({c.duration}min)</div>
            <div style={{fontSize:12,marginTop:4,display:"flex",gap:12,flexWrap:"wrap"}}>
              <span style={{color:"#1565C0"}}>{lang==="zh"?"總排課":"Total"}: {totalSessions}</span>
              <span style={{color:"#880E4F"}}>{t.studentAbsent}: {sAbs}</span>
              <span style={{color:"#BF360C"}}>{t.teacherAbsent}: {tAbs}</span>
              <span style={{color:"#2E7D32"}}>{lang==="zh"?"完課":"Done"}: {Math.max(0,totalSessions-sAbs-tAbs)}</span>
            </div>
          </div>
        );
      })}
      {allAbsences.length>0&&(
        <>
          <div style={{fontSize:13,color:"#546E7A",marginBottom:8,marginTop:"1.5rem",fontWeight:500}}>{t.absenceHistory}</div>
          {allAbsences.map(a=>{
            const c=myCourses.find(x=>x.id===a.courseId);
            const requester=users.find(u=>u.id===a.requestedBy);
            if(!c) return null;
            const isTeacherLeave = a.requesterRole==="teacher";
            return (
              <div key={a.id} style={{background:isTeacherLeave?"#FBE9E7":"#FCE4EC",border:`0.5px solid ${isTeacherLeave?"#BF360C":"#C2185B"}`,borderRadius:7,padding:"8px 12px",marginBottom:6,fontSize:12,display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                <span style={{background:isTeacherLeave?"#BF360C":"#C2185B",color:"#fff",borderRadius:4,padding:"1px 6px",fontSize:10}}>{isTeacherLeave?t.teacherAbsent:t.studentAbsent}</span>
                <span style={{fontWeight:500,color:"#172F39"}}>{c.subject}</span>
                <span style={{color:"#546E7A"}}>{t.days[a.day]}</span>
                <span style={{color:"#546E7A"}}>{t.by} {requester?.name||"?"}</span>
                <span style={{color:"#9E9E9E",marginLeft:"auto"}}>{a.requestedAt?.slice(0,10)}</span>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

// ─── Student stats ────────────────────────────────────────────────────────────
function StudentStats({ users, courses, absences, attendance, enrollments, lang }) {
  const t = T[lang];
  const students = users.filter(u=>u.role==="student");
  const [selId, setSelId] = useState(students[0]?.id||"");
  const [allTime, setAllTime] = useState(true);
  const today = new Date().toISOString().slice(0,10);
  const [dateFrom, setDateFrom] = useState(today.slice(0,7)+"-01");
  const [dateTo, setDateTo] = useState(today);
  const getName = id => users.find(u=>u.id===id)?.name||id;
  const iStyle={padding:"8px 10px",borderRadius:6,border:"0.5px solid #CFD8DC",background:"#FFFFFF",color:"#172F39",fontSize:13};

  const myCourses = courses.filter(c=>c.studentId===selId);
  const stats = computeStats(myCourses, absences, allTime, dateFrom, dateTo, enrollments, attendance);

  // Load dirEntries to get confirmed session count
  const [dirEntries, setDirEntries] = useState([]);
  useEffect(()=>{
    (async()=>{
      try{ const r=await window.storage.get("cp3_student_dir"); if(r?.value) setDirEntries(JSON.parse(r.value)); }catch{}
    })();
  },[]);

  // Medal info for selected student — use confirmed override if set
  const stuMedalInfo = selId ? (()=>{
    const dir = dirEntries.find(d=>d.linkedUserId===selId);
    const confirmedOverride = dir?.confirmedSessions || null;
    const {full,half,total:tot}=calcStudentSessions(selId,enrollments,attendance,courses,confirmedOverride);
    const {current,next}=getMedalInfo(tot);
    return {full,half,total:tot,current,next,isConfirmed:!!confirmedOverride,confirmedVal:confirmedOverride};
  })() : null;

  const allAbsences = absences.filter(a=>{
    const c=myCourses.find(x=>x.id===a.courseId);
    if(!c) return false;
    if(!allTime&&a.requestedAt){const d=a.requestedAt.slice(0,10);if((dateFrom&&d<dateFrom)||(dateTo&&d>dateTo))return false;}
    return true;
  });

  return (
    <div>
      <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:"1.25rem",flexWrap:"wrap"}}>
        <div>
          <label style={{display:"block",fontSize:12,color:"#546E7A",marginBottom:4}}>{t.selectStudentStats}</label>
          <select style={{...iStyle,minWidth:160}} value={selId} onChange={e=>setSelId(e.target.value)}>
            {students.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </div>
      <DateRangePicker lang={lang} dateFrom={dateFrom} dateTo={dateTo} setDateFrom={setDateFrom} setDateTo={setDateTo} allTime={allTime} setAllTime={setAllTime}/>
      {/* Medal banner */}
      {stuMedalInfo&&(()=>{const{full,half,total:tot,current:cm,next:nm}=stuMedalInfo;const medal=cm||{icon:"🎯",zh:"尚無獎牌",en:"No medal yet",color:"#9E9E9E",bg:"#F5F5F5"};const prevT=cm?cm.sessions:0;const pct=nm?Math.min(100,Math.round(((tot-prevT)/(nm.sessions-prevT))*100)):100;const toNext=nm?Math.ceil(nm.sessions-tot):0;return(<div style={{background:medal.bg,border:`1px solid ${medal.color}44`,borderRadius:10,padding:"12px 16px",marginBottom:"1.25rem",display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}><span style={{fontSize:36,flexShrink:0}}>{medal.icon}</span><div style={{flex:1,minWidth:0}}><div style={{fontSize:14,fontWeight:700,color:medal.color}}>{lang==="zh"?medal.zh:medal.en}</div><div style={{fontSize:12,color:"#546E7A",marginTop:1}}>{lang==="zh"?"累積積分 ":"Total: "}<strong>{full}</strong>{lang==="zh"?"點":" pts"}{stuMedalInfo?.isConfirmed&&<span style={{fontSize:10,background:"#E8F5E9",color:"#2E7D32",borderRadius:3,padding:"1px 5px",marginLeft:4,fontWeight:600}}>✓ {lang==="zh"?"已確認":"Confirmed"}</span>}</div>{nm&&<div style={{marginTop:6}}><div style={{background:"#E0E0E0",borderRadius:99,height:5,overflow:"hidden",marginBottom:2}}><div style={{width:`${pct}%`,height:"100%",borderRadius:99,background:`linear-gradient(90deg,${medal.color},${nm.color})`}}/></div><div style={{fontSize:11,color:nm.color}}>{lang==="zh"?`距 ${nm.zh} 還差 ${toNext} 點`:`${toNext} more to ${nm.en}`}</div></div>}</div></div>);})()}
      <StatCards {...stats} lang={lang}/>
      <div style={{fontSize:13,color:"#546E7A",marginBottom:8,fontWeight:500}}>{t.courseDetails}</div>
      {myCourses.length===0&&<p style={{color:"#9E9E9E",fontSize:13}}>—</p>}
      {myCourses.map(c=>{
        const courseEnrs = (enrollments||[]).filter(e=>e.courseId===c.id);
        const totalSessions = courseEnrs.reduce((sum,e)=>(e.scheduledDates?.length||0)+sum, 0);
        const cAbs=absences.filter(a=>{
          if(a.courseId!==c.id) return false;
          if(!allTime&&a.requestedAt){const d=a.requestedAt.slice(0,10);if((dateFrom&&d<dateFrom)||(dateTo&&d>dateTo))return false;}
          return true;
        });
        const attRecs=(attendance||[]).filter(a=>courseEnrs.some(e=>e.id===a.enrollmentId));
        const sAbs=cAbs.filter(a=>a.requesterRole!=="teacher").length + attRecs.filter(a=>a.type==="absent"||a.type==="excused").length;
        const tAbs=cAbs.filter(a=>a.requesterRole==="teacher").length + attRecs.filter(a=>a.type==="teacher_leave").length;
        const done = totalSessions - sAbs - tAbs;
        return (
          <div key={c.id} style={{background:"#FFFFFF",border:"0.5px solid #E0E0E0",borderRadius:8,padding:"10px 14px",marginBottom:8}}>
            <div style={{fontWeight:500,fontSize:13,color:"#172F39"}}>{c.subject}</div>
            <div style={{fontSize:12,color:"#546E7A",marginTop:2}}>{getName(c.teacherId)} · {c.days?.map(d=>t.days[d]).join("、")} · {c.start} ({c.duration}min)</div>
            <div style={{fontSize:12,marginTop:4,display:"flex",gap:12,flexWrap:"wrap"}}>
              <span style={{color:"#1565C0"}}>{lang==="zh"?"總排課":"Total"}: {totalSessions}</span>
              <span style={{color:"#880E4F"}}>{t.studentAbsent}: {sAbs}</span>
              <span style={{color:"#BF360C"}}>{t.teacherAbsent}: {tAbs}</span>
              <span style={{color:"#2E7D32"}}>{lang==="zh"?"完課":"Done"}: {Math.max(0,done)}</span>
            </div>
          </div>
        );
      })}
      {allAbsences.length>0&&(
        <>
          <div style={{fontSize:13,color:"#546E7A",marginBottom:8,marginTop:"1.5rem",fontWeight:500}}>{t.absenceHistory}</div>
          {allAbsences.map(a=>{
            const c=myCourses.find(x=>x.id===a.courseId);
            const requester=users.find(u=>u.id===a.requestedBy);
            if(!c) return null;
            const isTeacherLeave=a.requesterRole==="teacher";
            return (
              <div key={a.id} style={{background:isTeacherLeave?"#FBE9E7":"#FCE4EC",border:`0.5px solid ${isTeacherLeave?"#BF360C":"#C2185B"}`,borderRadius:7,padding:"8px 12px",marginBottom:6,fontSize:12,display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                <span style={{background:isTeacherLeave?"#BF360C":"#C2185B",color:"#fff",borderRadius:4,padding:"1px 6px",fontSize:10}}>{isTeacherLeave?t.teacherAbsent:t.studentAbsent}</span>
                <span style={{fontWeight:500,color:"#172F39"}}>{c.subject}</span>
                <span style={{color:"#546E7A"}}>{t.days[a.day]}</span>
                <span style={{color:"#546E7A"}}>{t.by} {requester?.name||"?"}</span>
                <span style={{color:"#9E9E9E",marginLeft:"auto"}}>{a.requestedAt?.slice(0,10)}</span>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

// ─── Schedule builder ────────────────────────────────────────────────────────
// Given a course, startDate (YYYY-MM-DD), totalSessions, and excused-leave dates (YYYY-MM-DD[]),
// returns an array of {date, dayIndex, sessionNo} — one per session, skipping excused leaves.
function buildSchedule(course, startDateStr, totalSessions, excusedDates=[]) {
  const results = [];
  const excusedSet = new Set(excusedDates);
  const start = new Date(startDateStr + "T00:00:00");
  const dow = course.days || []; // [0..6] Mon-based
  if (!dow.length || !totalSessions) return results;

  // Sort days so we go Mon→Sun each week
  const sortedDow = [...dow].sort((a,b)=>a-b);
  let d = new Date(start);
  let session = 1;
  let safety = 0; // prevent infinite loop
  while (session <= totalSessions && safety < 1000) {
    safety++;
    const thisDow = (d.getDay() + 6) % 7; // 0=Mon
    if (sortedDow.includes(thisDow)) {
      const dateStr = fmtYMD(d);
      if (dateStr >= startDateStr) {
        if (excusedSet.has(dateStr)) {
          // Skip this slot — deferred (don't count as session)
        } else {
          results.push({ date: dateStr, dayIndex: thisDow, sessionNo: session });
          session++;
        }
      }
    }
    d.setDate(d.getDate() + 1);
  }
  return results;
}

// ─── Enrollment Manager ───────────────────────────────────────────────────────
function EnrollmentManager({ users, courses, enrollments, setEnrollments, attendance, setAttendance, lang, setToast }) {
  const t = T[lang];
  const students = users.filter(u=>u.role==="student");
  const getName = id => users.find(u=>u.id===id)?.name||id;
  const iStyle={width:"100%",boxSizing:"border-box",padding:"8px 10px",borderRadius:6,border:"0.5px solid #CFD8DC",background:"#FFFFFF",color:"#172F39",fontSize:13};
  const lStyle={display:"block",fontSize:12,color:"#546E7A",marginBottom:4,marginTop:10};
  const today = new Date().toISOString().slice(0,10);

  // ── Form state ──
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const blank = { courseId:"", payDate:today, totalSessions:10, startDate:today };
  const [form, setForm] = useState(blank);
  const fset = (k,v) => setForm(f=>({...f,[k]:v}));

  // ── Preview state ──
  const [preview, setPreview] = useState(null);

  // ── Attendance recording state ──
  const [attTarget, setAttTarget] = useState(null); // {enrollment, sessionEntry}
  const [confirmDelEnrollId, setConfirmDelEnrollId] = useState(null);

  // Courses for selected form (all courses)
  const allCourses = courses;

  const selectedCourse = allCourses.find(c=>c.id===form.courseId);

  // Compute excused dates for this course (from attendance records)
  const getExcusedDates = (courseId) =>
    attendance.filter(a=>a.courseId===courseId && (a.type==="excused"||a.type==="teacher_leave")).map(a=>a.date);

  const handlePreview = () => {
    if (!selectedCourse || !form.startDate || !form.totalSessions) return;
    const excused = editingId
      ? getExcusedDates(form.courseId).filter(d => {
          const enr = enrollments.find(e=>e.id===editingId);
          return enr?.scheduledDates?.some(s=>s.date===d);
        })
      : getExcusedDates(form.courseId);
    const sched = buildSchedule(selectedCourse, form.startDate, Number(form.totalSessions), excused);
    setPreview(sched);
  };

  const handleSave = () => {
    if (!preview) return;
    const enr = {
      id: editingId || genId(),
      courseId: form.courseId,
      studentId: selectedCourse?.studentId,
      payDate: form.payDate,
      totalSessions: Number(form.totalSessions),
      startDate: form.startDate,
      scheduledDates: preview,
      savedAt: new Date().toISOString(),
    };
    if (editingId) {
      setEnrollments(es=>es.map(e=>e.id===editingId?enr:e));
    } else {
      setEnrollments(es=>[...es,enr]);
    }
    setToast(t.enrollSaved);
    setShowForm(false); setPreview(null); setEditingId(null); setForm(blank);
  };

  const deleteEnrollment = (id) => { setConfirmDelEnrollId(id); };
  const doDelEnrollment = () => {
    setEnrollments(es=>es.filter(e=>e.id!==confirmDelEnrollId));
    setAttendance(as=>as.filter(a=>a.enrollmentId!==confirmDelEnrollId));
    setToast(t.enrollDeleted);
    setConfirmDelEnrollId(null);
  };

  const startEdit = (enr) => {
    setForm({courseId:enr.courseId,payDate:enr.payDate,totalSessions:enr.totalSessions,startDate:enr.startDate});
    setEditingId(enr.id);
    setPreview(enr.scheduledDates);
    setShowForm(true);
  };

  // ── Attendance recording ──
  const saveAttendance = (type, note) => {
    const {enrollment, sessionEntry} = attTarget;
    const newAttRecord = {id:genId(),enrollmentId:enrollment.id,courseId:enrollment.courseId,date:sessionEntry.date,dayIndex:sessionEntry.dayIndex,sessionNo:sessionEntry.sessionNo,type,note,recordedAt:new Date().toISOString(),recordedBy:"admin"};

    // Build next attendance state first so deferred rebuild uses it
    const existingIdx = attendance.findIndex(a=>a.enrollmentId===enrollment.id&&a.date===sessionEntry.date&&a.dayIndex===sessionEntry.dayIndex);
    const nextAttendance = existingIdx>=0
      ? attendance.map((a,i)=>i===existingIdx?{...a,type,note,recordedAt:new Date().toISOString()}:a)
      : [...attendance, newAttRecord];
    setAttendance(nextAttendance);

    // If excused/teacher leave → rebuild schedule skipping ALL excused dates (including new one)
    if (type==="excused"||type==="teacher_leave") {
      const excusedDates = nextAttendance
        .filter(a=>a.courseId===enrollment.courseId&&(a.type==="excused"||a.type==="teacher_leave"))
        .map(a=>a.date);
      const course = allCourses.find(c=>c.id===enrollment.courseId);
      if (course) {
        const newSched = buildSchedule(course, enrollment.startDate, enrollment.totalSessions, excusedDates);
        setEnrollments(es=>es.map(e=>e.id===enrollment.id?{...e,scheduledDates:newSched}:e));
      }
    }
    setAttTarget(null);
    setToast(t.attendanceSaved);
  };

  // ── Helpers ──
  const getAttendance = (enrollmentId, date) => attendance.find(a=>a.enrollmentId===enrollmentId&&a.date===date);
  const attLabel = (type) => type==="excused"?(lang==="zh"?"正規請假":"Excused"):type==="teacher_leave"?(lang==="zh"?"老師假":"Teacher Lv"):(lang==="zh"?"缺勤扣課":"Absent");
  const attColor = (type) => type==="excused"?"#1A6B8A":type==="teacher_leave"?"#FF9800":"#D32F2F";

  // Session status: "completed" | "absent" | "excused" | "teacher_leave" | "overdue" | "upcoming"
  const getSessionStatus = (enr, s) => {
    const att = getAttendance(enr.id, s.date);
    if (att) return att.type; // "excused" | "teacher_leave" | "absent"
    const course = allCourses.find(c=>c.id===enr.courseId);
    if (isSessionOver(s.date, course?.start, course?.duration)) return "completed"; // ended → completed
    return "upcoming";
  };

  // Stats for enrollment — accurate counts
  const getStats = (enr) => {
    const total = enr.totalSessions;
    const attRecords = attendance.filter(a=>a.enrollmentId===enr.id);
    const excused      = attRecords.filter(a=>a.type==="excused"||a.type==="teacher_leave").length;
    const absent       = attRecords.filter(a=>a.type==="absent").length;
    const completed    = (enr.scheduledDates||[]).filter(s=>getSessionStatus(enr,s)==="completed").length;
    const upcoming     = (enr.scheduledDates||[]).filter(s=>getSessionStatus(enr,s)==="upcoming").length;
    return { excused, absent, completed, upcoming, total };
  };

  return (
    <div>
      {confirmDelEnrollId && (() => {
        const enr = enrollments.find(e=>e.id===confirmDelEnrollId);
        const course = courses.find(c=>c.id===enr?.courseId);
        return <ConfirmModal
          title={lang==="zh"?"刪除排課紀錄":"Delete Enrollment"}
          message={lang==="zh"?`確認刪除「${course?.subject||""}」的排課紀錄？所有出缺勤記錄也將一併刪除，此操作無法復原。`:`Delete enrollment for "${course?.subject||""}"? All attendance records will also be deleted.`}
          confirmLabel={lang==="zh"?"確認刪除":"Delete"}
          onConfirm={doDelEnrollment}
          onCancel={()=>setConfirmDelEnrollId(null)}
          danger/>;
      })()}
      {/* Attendance recording modal */}
      {attTarget && (
        <AttendanceModal
          enrollment={attTarget.enrollment}
          sessionEntry={attTarget.sessionEntry}
          existing={getAttendance(attTarget.enrollment.id, attTarget.sessionEntry.date)}
          users={users} lang={lang}
          onSave={saveAttendance}
          onClose={()=>setAttTarget(null)}
        />
      )}

      <button onClick={()=>{setShowForm(true);setEditingId(null);setForm(blank);setPreview(null);}} style={{marginBottom:"1rem",background:"#1A6B8A",border:"none",borderRadius:7,color:"#fff",padding:"8px 16px",fontSize:13,cursor:"pointer"}}>+ {t.addEnrollment}</button>

      {/* ── Form ── */}
      {showForm && (
        <div style={{background:"#F5F5F5",borderRadius:12,border:"0.5px solid #E0E0E0",padding:"1.25rem",marginBottom:"1.5rem"}}>
          <div style={{fontWeight:500,fontSize:14,color:"#172F39",marginBottom:12}}>{editingId?(lang==="zh"?"編輯排課":"Edit Schedule"):t.addEnrollment}</div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div>
              <label style={lStyle}>{lang==="zh"?"選擇課程":"Select Course"}</label>
              <select style={iStyle} value={form.courseId} onChange={e=>{fset("courseId",e.target.value);setPreview(null);}}>
                <option value="">{lang==="zh"?"—請選擇—":"—Select—"}</option>
                {allCourses.map(c=><option key={c.id} value={c.id}>{c.subject} ({getName(c.studentId)})</option>)}
              </select>
            </div>
            <div>
              <label style={lStyle}>{t.payDate}</label>
              <input type="date" style={iStyle} value={form.payDate} onChange={e=>fset("payDate",e.target.value)}/>
            </div>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div>
              <label style={lStyle}>{t.totalSessions}</label>
              <input type="number" min={1} max={200} style={iStyle} value={form.totalSessions} onChange={e=>fset("totalSessions",e.target.value)}/>
            </div>
            <div>
              <label style={lStyle}>{t.startDate}</label>
              <input type="date" style={iStyle} value={form.startDate} onChange={e=>{fset("startDate",e.target.value);setPreview(null);}}/>
            </div>
          </div>

          {selectedCourse && (
            <div style={{marginTop:10,fontSize:12,color:"#546E7A",background:"#FFFFFF",borderRadius:6,padding:"8px 12px"}}>
              {lang==="zh"?"每週":"Weekly"}: {selectedCourse.days?.map(d=>T[lang].days[d]).join("、")} · {selectedCourse.start} ({selectedCourse.duration}min)
            </div>
          )}

          <div style={{display:"flex",gap:8,marginTop:14}}>
            <button onClick={handlePreview} disabled={!form.courseId||!form.startDate} style={{flex:1,padding:"9px",borderRadius:7,background:form.courseId?"#F5F5F5":"#FFFFFF",border:"1px solid #4A9FD4",color:"#1A6B8A",fontSize:13,cursor:form.courseId?"pointer":"not-allowed"}}>
              🔍 {t.previewSchedule}
            </button>
            <button onClick={()=>{setShowForm(false);setPreview(null);setEditingId(null);}} style={{padding:"9px 16px",borderRadius:7,background:"transparent",border:"0.5px solid #CFD8DC",color:"#546E7A",fontSize:13,cursor:"pointer"}}>{t.cancel}</button>
          </div>

          {/* Preview */}
          {preview && (
            <div style={{marginTop:14}}>
              <div style={{fontSize:12,fontWeight:500,color:"#172F39",marginBottom:8}}>
                {t.scheduledDates} — {preview.length} {lang==="zh"?"堂":"sessions"} ({lang==="zh"?"起":"from"} {form.startDate} {lang==="zh"?"至":"to"} {preview[preview.length-1]?.date})
              </div>
              <div style={{maxHeight:220,overflowY:"auto",display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:5,marginBottom:12}}>
                {preview.map((s,i)=>(
                  <div key={i} style={{background:"#FFFFFF",border:"0.5px solid #CFD8DC",borderRadius:6,padding:"6px 9px",fontSize:11}}>
                    <div style={{color:"#9E9E9E",marginBottom:1}}>#{s.sessionNo}</div>
                    <div style={{color:"#172F39",fontWeight:500}}>{s.date}</div>
                    <div style={{color:"#546E7A"}}>{T[lang].days[s.dayIndex]}</div>
                  </div>
                ))}
              </div>
              <button onClick={handleSave} style={{width:"100%",padding:"10px",borderRadius:7,background:"#4CAF50",border:"none",color:"#fff",fontSize:13,fontWeight:500,cursor:"pointer"}}>
                ✓ {t.confirmSchedule}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Enrollment list ── */}
      {enrollments.length===0 && !showForm && (
        <p style={{color:"#9E9E9E",fontSize:13,textAlign:"center",padding:"2rem 0"}}>{t.noEnrollments}</p>
      )}
      {enrollments.map(enr=>{
        const course = allCourses.find(c=>c.id===enr.courseId);
        const stats = getStats(enr);
        const now = today;
        return (
          <div key={enr.id} style={{background:"#FFFFFF",border:"0.5px solid #E0E0E0",borderRadius:12,padding:"14px 16px",marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:8,marginBottom:10}}>
              <div>
                <div style={{fontWeight:500,fontSize:14,color:"#172F39"}}>{course?.subject||"—"}</div>
                <div style={{fontSize:12,color:"#546E7A",marginTop:2}}>
                  {lang==="zh"?"學生":"Student"}: {getName(enr.studentId)} · {t.payDate}: {enr.payDate}
                </div>
                <div style={{fontSize:12,color:"#546E7A"}}>
                  {t.startDate}: {enr.startDate} · {t.totalSessions}: {enr.totalSessions}
                </div>
              </div>
              {/* Stats pills */}
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                <span style={{fontSize:11,background:"rgba(76,175,80,0.15)",color:"#2E7D32",borderRadius:5,padding:"3px 9px",fontWeight:500}}>✓ {stats.completed} {lang==="zh"?"完課":""}</span>
                <span style={{fontSize:11,background:"rgba(26,107,138,0.1)",color:"#9E9E9E",borderRadius:5,padding:"3px 9px"}}>📅 {enr.totalSessions} {lang==="zh"?"堂":""}</span>
                {stats.upcoming>0&&<span style={{fontSize:11,background:"rgba(158,158,158,0.12)",color:"#9E9E9E",borderRadius:5,padding:"3px 9px"}}>○ {stats.upcoming} {lang==="zh"?"未完成":""}</span>}
                {stats.excused>0&&<span style={{fontSize:11,background:"rgba(255,152,0,0.15)",color:"#E65100",borderRadius:5,padding:"3px 9px"}}>{lang==="zh"?"假":"Lv"} {stats.excused}</span>}
                {stats.absent>0&&<span style={{fontSize:11,background:"rgba(211,47,47,0.15)",color:"#D32F2F",borderRadius:5,padding:"3px 9px"}}>✗ {stats.absent} {lang==="zh"?"缺勤":""}</span>}
              </div>
            </div>

            {/* Session list — 3-color system */}
            <div style={{maxHeight:220,overflowY:"auto",display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:5,marginBottom:10}}>
              {(enr.scheduledDates||[]).map((s,i)=>{
                const status = getSessionStatus(enr, s);
                const att = getAttendance(enr.id, s.date);
                const STATE = {
                  completed:     {bg:"#E8F5E9",border:"#4CAF50", icon:"✓", iconColor:"#2E7D32"},
                  absent:        {bg:"#FFEBEE",border:"#D32F2F", icon:"✗", iconColor:"#D32F2F"},
                  excused:       {bg:"#E3F2FD",border:"#1A6B8A", icon:"假", iconColor:"#1A6B8A"},
                  teacher_leave: {bg:"#FFF8E1",border:"#FF9800", icon:"師", iconColor:"#E65100"},
                  upcoming:      {bg:"#FAFAFA",border:"#E0E0E0", icon:"",  iconColor:"#9E9E9E"},
                };
                const st = STATE[status]||STATE.upcoming;
                return (
                  <div key={i} style={{background:st.bg,borderRadius:7,padding:"8px 10px",fontSize:11,border:`1.5px solid ${st.border}`,transition:"all 0.15s"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
                      <span style={{color:"#9E9E9E",fontSize:10}}>#{s.sessionNo}</span>
                      {st.icon && <span style={{fontSize:10,color:st.iconColor,fontWeight:700}}>{st.icon}</span>}
                    </div>
                    <div style={{color:"#172F39",fontWeight:600,marginBottom:1}}>{s.date}</div>
                    <div style={{color:"#546E7A",fontSize:10}}>{T[lang].days[s.dayIndex]}</div>
                    {att?.note && <div style={{fontSize:9,color:st.iconColor,marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}} title={att.note}>{att.note}</div>}
                    {s.date <= today && (
                      <button onClick={()=>setAttTarget({enrollment:enr,sessionEntry:s})}
                        style={{marginTop:5,width:"100%",fontSize:9,padding:"2px 0",borderRadius:4,background:"transparent",border:`0.5px solid ${st.border}`,color:st.iconColor,cursor:"pointer"}}>
                        {att?(lang==="zh"?"修改":"Edit"):(lang==="zh"?"記錄":"Record")}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{display:"flex",gap:6}}>
              <button onClick={()=>startEdit(enr)} style={{fontSize:12,padding:"5px 12px",borderRadius:5,border:"0.5px solid #CFD8DC",background:"transparent",color:"#546E7A",cursor:"pointer"}}>{lang==="zh"?"編輯排課":"Edit"}</button>
              <button onClick={()=>deleteEnrollment(enr.id)} style={{fontSize:12,padding:"5px 12px",borderRadius:5,border:"0.5px solid #C0392B",background:"transparent",color:"#D32F2F",cursor:"pointer"}}>{t.deleteCourse}</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Attendance modal ─────────────────────────────────────────────────────────
function AttendanceModal({ enrollment, sessionEntry, existing, users, lang, onSave, onClose }) {
  const t = T[lang];
  const [type, setType] = useState(existing?.type || "excused");
  const [note, setNote] = useState(existing?.note || "");
  const opts = [
    { key:"excused",      label:t.leaveExcused,      icon:"📘", color:"#1A6B8A", desc:lang==="zh"?"不扣課，自動順延至下一堂":"Not deducted, auto-deferred to next slot" },
    { key:"teacher_leave",label:t.teacherLeaveExcused,icon:"👨‍🏫",color:"#FF9800", desc:lang==="zh"?"老師請假，不扣學生課":"Teacher absent, student not deducted" },
    { key:"absent",       label:t.leaveAbsent,        icon:"❌", color:"#D32F2F", desc:lang==="zh"?"學生缺勤，此堂扣課":"Student no-show, session is deducted" },
  ];
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9000,padding:"1rem"}}>
      <div style={{background:"#FFFFFF",borderRadius:14,width:"100%",maxWidth:400,boxSizing:"border-box",boxShadow:"0 8px 40px rgba(0,0,0,0.5)"}}>
        <div style={{background:"#172F39",padding:"14px 18px",borderRadius:"14px 14px 0 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:14,fontWeight:600,color:"#FFFFFF"}}>{t.markAttendance}</span>
          <button onClick={onClose} style={{background:"#F5F5F5",border:"none",width:28,height:28,borderRadius:"50%",cursor:"pointer",color:"#546E7A",fontSize:17}}>×</button>
        </div>
        <div style={{padding:"16px 18px"}}>
          <div style={{background:"#F5F5F5",borderRadius:8,padding:"8px 12px",marginBottom:14,fontSize:12,color:"#546E7A"}}>
            <strong style={{color:"#172F39"}}>#{sessionEntry.sessionNo}</strong> · {sessionEntry.date} · {T[lang].days[sessionEntry.dayIndex]}
          </div>
          {opts.map(o=>(
            <button key={o.key} onClick={()=>setType(o.key)} style={{width:"100%",display:"flex",alignItems:"flex-start",gap:10,padding:"10px 12px",borderRadius:8,border:`1.5px solid ${type===o.key?o.color:"#CFD8DC"}`,background:type===o.key?`rgba(${o.key==="excused"?"74,159,212":o.key==="teacher_leave"?"245,200,66":"231,76,60"},0.1)`:"transparent",color:type===o.key?o.color:"#546E7A",fontSize:13,cursor:"pointer",marginBottom:7,textAlign:"left"}}>
              <span style={{fontSize:16,flexShrink:0}}>{o.icon}</span>
              <div>
                <div style={{fontWeight:500}}>{o.label}</div>
                <div style={{fontSize:11,opacity:0.75,marginTop:1}}>{o.desc}</div>
              </div>
              {type===o.key&&<span style={{marginLeft:"auto",color:o.color}}>✓</span>}
            </button>
          ))}
          <div style={{marginTop:6,marginBottom:14}}>
            <label style={{fontSize:12,color:"#546E7A",display:"block",marginBottom:4}}>{lang==="zh"?"備註（選填）":"Notes (optional)"}</label>
            <input style={{width:"100%",boxSizing:"border-box",padding:"8px 10px",borderRadius:6,border:"0.5px solid #CFD8DC",background:"#FAFAFA",color:"#172F39",fontSize:13}} value={note} onChange={e=>setNote(e.target.value)}/>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>onSave(type,note)} style={{flex:1,background:"#1A6B8A",border:"none",borderRadius:7,color:"#fff",padding:"10px",fontSize:13,fontWeight:500,cursor:"pointer"}}>{t.save}</button>
            <button onClick={onClose} style={{padding:"10px 16px",borderRadius:7,background:"transparent",border:"0.5px solid #CFD8DC",color:"#546E7A",fontSize:13,cursor:"pointer"}}>{t.cancel}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Leave Review ─────────────────────────────────────────────────────────────
function LeaveReview({ users, courses, absences, setAbsences, attendance, setAttendance, enrollments, lang }) {
  const t = T[lang];
  const today = new Date().toISOString().slice(0,10);
  const [filterRole, setFilterRole] = useState("all");
  const [selUserId, setSelUserId] = useState("all");
  const [allTime, setAllTime] = useState(true);
  const [dateFrom, setDateFrom] = useState(today.slice(0,7)+"-01");
  const [dateTo, setDateTo] = useState(today);

  // ── Edit state ──
  const [editTarget, setEditTarget] = useState(null); // the merged record r
  const [editType, setEditType] = useState("");
  const [editNote, setEditNote] = useState("");

  const openEdit = (r) => {
    setEditTarget(r);
    setEditType(r.type);
    setEditNote(r.note||"");
  };

  const saveEdit = () => {
    if (!editTarget) return;
    if (editTarget.source==="self") {
      // Update absences array
      setAbsences(prev => prev.map(a => {
        if (a.id !== editTarget._id) return a;
        if (editType === "delete") return null; // will filter
        // Map display type back to absence fields
        return {
          ...a,
          reason: editType==="teacher_leave" ? "teacher" : editType==="excused" ? "sick" : "personal",
          requesterRole: editType==="teacher_leave" ? "teacher" : "student",
          note: editNote,
          _editedAt: new Date().toISOString(),
          _editedBy: "admin",
        };
      }).filter(Boolean));
    } else {
      // Update attendance array
      setAttendance(prev => prev.map(a => {
        if (a.id !== editTarget._id) return a;
        if (editType === "delete") return null;
        return { ...a, type: editType, note: editNote, _editedAt: new Date().toISOString(), _editedBy: "admin" };
      }).filter(Boolean));
    }
    setEditTarget(null);
    setEditType(""); setEditNote("");
  };

  const deleteRecord = () => {
    if (!editTarget) return;
    if (editTarget.source==="self") {
      setAbsences(prev=>prev.filter(a=>a.id!==editTarget._id));
    } else {
      setAttendance(prev=>prev.filter(a=>a.id!==editTarget._id));
    }
    setEditTarget(null);
  };

  const getName = id => users.find(u=>u.id===id)?.name||id;
  const getCourse = id => courses.find(c=>c.id===id);

  // Merge absences (self-reported) + attendance records (admin-recorded excused/teacher_leave/absent)
  const allRecords = [
    // Self-reported leave (from AbsenceModal)
    ...absences.map(a=>({
      _id: a.id, source:"self", courseId:a.courseId, date:a.dateStr||a.requestedAt?.slice(0,10)||"",
      requestedAt:a.requestedAt, requesterRole:a.requesterRole, requestedBy:a.requestedBy,
      type: a.requesterRole==="teacher"?"teacher_leave": a.reason==="sick"?"sick":"personal",
      note:a.note||a.reason||"", reason:a.reason,
    })),
    // Admin-recorded attendance
    ...attendance.map(a=>({
      _id:a.id, source:"admin", courseId:a.courseId, date:a.date,
      requestedAt:a.recordedAt, requesterRole: a.type==="teacher_leave"?"teacher":"student",
      requestedBy: enrollments.find(e=>e.id===a.enrollmentId)?.studentId||"",
      type:a.type, note:a.note||"",
    })),
  ];

  // Filter by role
  const roleFiltered = filterRole==="all" ? allRecords
    : filterRole==="student" ? allRecords.filter(r=>r.requesterRole!=="teacher")
    : allRecords.filter(r=>r.requesterRole==="teacher");

  // Filter by user
  const userFiltered = selUserId==="all" ? roleFiltered
    : roleFiltered.filter(r=>r.requestedBy===selUserId);

  // Filter by date
  const dateFiltered = allTime ? userFiltered
    : userFiltered.filter(r=>(!dateFrom||r.date>=dateFrom)&&(!dateTo||r.date<=dateTo));

  // Sort newest first
  const sorted = [...dateFiltered].sort((a,b)=>(b.requestedAt||"").localeCompare(a.requestedAt||""));

  // Per-user stats
  const relevantUsers = users.filter(u=>{
    if (u.role==="admin") return false;
    if (filterRole==="student") return u.role==="student";
    if (filterRole==="teacher") return u.role==="teacher";
    return u.role==="student"||u.role==="teacher";
  });

  const getUserStats = (uid) => {
    const recs = allRecords.filter(r=>r.requestedBy===uid);
    const inRange = allTime ? recs : recs.filter(r=>(!dateFrom||r.date>=dateFrom)&&(!dateTo||r.date<=dateTo));
    const leave = inRange.filter(r=>r.type!=="absent").length;
    const absent = inRange.filter(r=>r.type==="absent").length;
    // Attendance rate: total scheduled sessions in range vs (leave+absent)
    const myEnrollments = enrollments.filter(e=>{
      const c=getCourse(e.courseId);
      if(!c) return false;
      return c.studentId===uid||c.teacherId===uid;
    });
    const totalSess = myEnrollments.reduce((s,e)=>{
      const sessions = (e.scheduledDates||[]).filter(sd=>allTime||((!dateFrom||sd.date>=dateFrom)&&(!dateTo||sd.date<=dateTo)));
      return s+sessions.length;
    },0);
    const rate = totalSess>0 ? Math.round(((totalSess-leave-absent)/totalSess)*100) : null;
    return {leave, absent, totalSess, rate};
  };

  const typeLabel = (type, lang) => ({
    sick:          lang==="zh"?"病假":"Sick Leave",
    personal:      lang==="zh"?"事假":"Personal Leave",
    excused:       lang==="zh"?"正規請假":"Excused",
    teacher_leave: lang==="zh"?"老師假":"Teacher Leave",
    absent:        lang==="zh"?"缺勤":"Absent",
  }[type]||(lang==="zh"?"請假":"Leave"));

  const typeColor = type => ({
    sick:"#1A6B8A", personal:"#546E7A", excused:"#1A6B8A",
    teacher_leave:"#FF9800", absent:"#D32F2F",
  }[type]||"#546E7A");

  const iStyle={padding:"7px 10px",borderRadius:6,border:"0.5px solid #CFD8DC",background:"#FFFFFF",color:"#172F39",fontSize:12};

  return (
    <div>
      <h3 style={{fontSize:16,fontWeight:500,color:"#172F39",margin:"0 0 1.25rem"}}>{t.leaveReview}</h3>

      {/* Filters */}
      <div style={{background:"#F5F5F5",borderRadius:10,padding:"12px 14px",marginBottom:"1.25rem",display:"flex",flexWrap:"wrap",gap:10,alignItems:"center"}}>
        {/* Role filter */}
        <div style={{display:"flex",gap:4}}>
          {[["all",t.filterAll],["student",t.filterStudent],["teacher",t.filterTeacher]].map(([k,l])=>(
            <button key={k} onClick={()=>{setFilterRole(k);setSelUserId("all");}} style={{padding:"5px 12px",borderRadius:6,fontSize:12,cursor:"pointer",border:filterRole===k?"none":"0.5px solid #CFD8DC",background:filterRole===k?"#1A6B8A":"transparent",color:filterRole===k?"#fff":"#546E7A"}}>{l}</button>
          ))}
        </div>
        {/* User filter */}
        <select style={iStyle} value={selUserId} onChange={e=>setSelUserId(e.target.value)}>
          <option value="all">{t.leaveReviewAll}</option>
          {relevantUsers.map(u=><option key={u.id} value={u.id}>{u.name} ({t[`role_${u.role}`]})</option>)}
        </select>
        {/* Date range */}
        <DateRangePicker lang={lang} dateFrom={dateFrom} dateTo={dateTo} setDateFrom={setDateFrom} setDateTo={setDateTo} allTime={allTime} setAllTime={setAllTime}/>
      </div>

      {/* Per-user overview cards */}
      {selUserId==="all" && (
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:8,marginBottom:"1.5rem"}}>
          {relevantUsers.map(u=>{
            const st=getUserStats(u.id);
            const rateColor=st.rate===null?"#9E9E9E":st.rate>=80?"#2E7D32":st.rate>=60?"#E65100":"#D32F2F";
            return (
              <div key={u.id} onClick={()=>setSelUserId(u.id)} style={{background:"#FFFFFF",border:"0.5px solid #E0E0E0",borderRadius:10,padding:"12px 14px",cursor:"pointer",transition:"box-shadow 0.15s"}}
                onMouseEnter={e=>e.currentTarget.style.boxShadow="0 2px 8px rgba(26,107,138,0.15)"}
                onMouseLeave={e=>e.currentTarget.style.boxShadow="none"}>
                <div style={{fontWeight:500,fontSize:13,color:"#172F39",marginBottom:2}}>{u.name}</div>
                <div style={{fontSize:11,color:"#9E9E9E",marginBottom:8}}>{t[`role_${u.role}`]}</div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  {st.rate!==null&&<span style={{fontSize:12,fontWeight:600,color:rateColor}}>{st.rate}%</span>}
                  {st.leave>0&&<span style={{fontSize:11,color:"#1A6B8A"}}>假 {st.leave}</span>}
                  {st.absent>0&&<span style={{fontSize:11,color:"#D32F2F"}}>缺 {st.absent}</span>}
                  {st.rate===null&&<span style={{fontSize:11,color:"#9E9E9E"}}>{lang==="zh"?"無排課":"No sessions"}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail for selected user */}
      {selUserId!=="all" && (() => {
        const u=users.find(x=>x.id===selUserId);
        const st=getUserStats(selUserId);
        const rateColor=st.rate===null?"#9E9E9E":st.rate>=80?"#2E7D32":st.rate>=60?"#E65100":"#D32F2F";
        return (
          <div style={{background:"#F5F5F5",borderRadius:10,padding:"12px 16px",marginBottom:"1.25rem",display:"flex",gap:16,alignItems:"center",flexWrap:"wrap"}}>
            <div>
              <div style={{fontWeight:500,fontSize:14,color:"#172F39"}}>{u?.name}</div>
              <div style={{fontSize:12,color:"#9E9E9E"}}>{u&&t[`role_${u.role}`]}</div>
            </div>
            <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
              {st.rate!==null&&<div style={{textAlign:"center"}}><div style={{fontSize:22,fontWeight:700,color:rateColor}}>{st.rate}%</div><div style={{fontSize:10,color:"#9E9E9E"}}>{t.attendanceRate}</div></div>}
              <div style={{textAlign:"center"}}><div style={{fontSize:22,fontWeight:600,color:"#172F39"}}>{st.totalSess}</div><div style={{fontSize:10,color:"#9E9E9E"}}>{t.totalClasses}</div></div>
              <div style={{textAlign:"center"}}><div style={{fontSize:22,fontWeight:600,color:"#1A6B8A"}}>{st.leave}</div><div style={{fontSize:10,color:"#9E9E9E"}}>{t.leaveCount}</div></div>
              <div style={{textAlign:"center"}}><div style={{fontSize:22,fontWeight:600,color:"#D32F2F"}}>{st.absent}</div><div style={{fontSize:10,color:"#9E9E9E"}}>{t.absentCount}</div></div>
            </div>
            <button onClick={()=>setSelUserId("all")} style={{marginLeft:"auto",fontSize:12,padding:"5px 12px",borderRadius:6,border:"0.5px solid #CFD8DC",background:"transparent",color:"#546E7A",cursor:"pointer"}}>← {t.filterAll}</button>
          </div>
        );
      })()}

      {/* Records list */}
      <div style={{fontSize:12,color:"#546E7A",fontWeight:500,marginBottom:8}}>
        {sorted.length} {lang==="zh"?"筆紀錄":"records"}
      </div>
      {sorted.length===0 && <p style={{color:"#9E9E9E",fontSize:13,textAlign:"center",padding:"2rem 0"}}>{t.noLeaveRecords}</p>}

      {/* ── Edit Modal ── */}
      {editTarget && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9200,padding:"1rem"}}>
          <div style={{background:"#FFFFFF",borderRadius:14,width:"100%",maxWidth:420,boxSizing:"border-box",boxShadow:"0 8px 32px rgba(23,47,57,0.18)",overflow:"hidden"}}>
            {/* Header */}
            <div style={{background:"#172F39",padding:"13px 18px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:14,fontWeight:600,color:"#FFFFFF"}}>✏️ {lang==="zh"?"修正請假紀錄":"Edit Leave Record"}</span>
              <button onClick={()=>setEditTarget(null)} style={{background:"rgba(255,255,255,0.15)",border:"none",borderRadius:"50%",width:26,height:26,cursor:"pointer",color:"#fff",fontSize:15}}>×</button>
            </div>
            <div style={{padding:"16px 18px"}}>
              {/* Info */}
              <div style={{background:"#F5F5F5",borderRadius:8,padding:"9px 12px",marginBottom:14,fontSize:12,color:"#546E7A",lineHeight:1.6}}>
                <div><strong style={{color:"#172F39"}}>{users.find(u=>u.id===editTarget.requestedBy)?.name||"—"}</strong> · {editTarget.date}</div>
                <div style={{color:"#9E9E9E",fontSize:11}}>{courses.find(c=>c.id===editTarget.courseId)?.subject||"—"}</div>
                <div style={{fontSize:10,color:"#9E9E9E",marginTop:2}}>{lang==="zh"?"來源：":"Source: "}{editTarget.source==="admin"?(lang==="zh"?"管理員記錄":"Admin"):(lang==="zh"?"自行申請":"Self-reported")}</div>
              </div>

              {/* Type selector */}
              <div style={{fontSize:12,color:"#546E7A",fontWeight:500,marginBottom:8}}>{lang==="zh"?"修改為：":"Change to:"}</div>
              <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:14}}>
                {[
                  {k:"excused",       icon:"📘", zh:"正規請假（順延，不扣課）",en:"Excused Leave (deferred)"},
                  {k:"teacher_leave", icon:"👨‍🏫",zh:"老師假（順延，不扣課）", en:"Teacher Leave (deferred)"},
                  {k:"absent",        icon:"❌", zh:"缺勤（扣課）",           en:"Absent (deducted)"},
                  {k:"sick",          icon:"🤒", zh:"病假",                   en:"Sick Leave"},
                  {k:"personal",      icon:"📋", zh:"事假",                   en:"Personal Leave"},
                ].map(opt=>(
                  <button key={opt.k} onClick={()=>setEditType(opt.k)} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:8,border:`1.5px solid ${editType===opt.k?"#1A6B8A":"#E0E0E0"}`,background:editType===opt.k?"rgba(26,107,138,0.07)":"transparent",color:editType===opt.k?"#1A6B8A":"#546E7A",fontSize:12,cursor:"pointer",textAlign:"left"}}>
                    <span>{opt.icon}</span>
                    <span style={{flex:1}}>{lang==="zh"?opt.zh:opt.en}</span>
                    {editType===opt.k&&<span style={{color:"#1A6B8A",fontWeight:700}}>✓</span>}
                  </button>
                ))}
              </div>

              {/* Note */}
              <div style={{fontSize:12,color:"#546E7A",marginBottom:5}}>{lang==="zh"?"備註：":"Note:"}</div>
              <input
                style={{width:"100%",boxSizing:"border-box",padding:"8px 10px",borderRadius:6,border:"0.5px solid #CFD8DC",background:"#FFFFFF",color:"#172F39",fontSize:13,marginBottom:16}}
                value={editNote}
                onChange={e=>setEditNote(e.target.value)}
                placeholder={lang==="zh"?"備註說明（選填）":"Notes (optional)"}
              />

              {/* Actions */}
              <div style={{display:"flex",gap:8}}>
                <button onClick={saveEdit} style={{flex:1,background:"#1A6B8A",border:"none",borderRadius:7,color:"#fff",padding:"10px",fontSize:13,fontWeight:600,cursor:"pointer"}}>
                  ✓ {lang==="zh"?"儲存修正":"Save Changes"}
                </button>
                <button onClick={()=>setEditTarget(null)} style={{padding:"10px 14px",borderRadius:7,background:"transparent",border:"0.5px solid #CFD8DC",color:"#546E7A",fontSize:13,cursor:"pointer"}}>
                  {lang==="zh"?"取消":"Cancel"}
                </button>
              </div>
              {/* Delete option */}
              <button onClick={deleteRecord} style={{width:"100%",marginTop:8,padding:"8px",borderRadius:7,background:"transparent",border:"0.5px solid #FFCDD2",color:"#D32F2F",fontSize:12,cursor:"pointer"}}>
                🗑 {lang==="zh"?"刪除此筆紀錄":"Delete this record"}
              </button>
            </div>
          </div>
        </div>
      )}

      {sorted.map((r,i)=>{
        const course=getCourse(r.courseId);
        const requester=users.find(u=>u.id===r.requestedBy);
        const isTeacher=r.requesterRole==="teacher";
        return (
          <div key={r._id||i} style={{display:"flex",gap:10,alignItems:"flex-start",background:"#FFFFFF",border:"0.5px solid #E0E0E0",borderRadius:9,padding:"10px 14px",marginBottom:6,flexWrap:"wrap"}}>
            {/* Date */}
            <div style={{minWidth:70,flexShrink:0}}>
              <div style={{fontSize:13,fontWeight:600,color:"#172F39"}}>{r.date||"—"}</div>
              <div style={{fontSize:10,color:"#9E9E9E"}}>{r.requestedAt?.slice(0,10)}</div>
            </div>
            {/* Type badge */}
            <span style={{flexShrink:0,fontSize:11,background: r.type==="absent"?"rgba(211,47,47,0.1)": r.type==="teacher_leave"?"rgba(255,152,0,0.1)":"rgba(26,107,138,0.1)",color:typeColor(r.type),borderRadius:5,padding:"2px 8px",fontWeight:500,marginTop:1}}>{typeLabel(r.type,lang)}</span>
            {/* Person & course */}
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:13,color:"#172F39",fontWeight:500}}>{requester?.name||"—"}
                <span style={{fontSize:11,color:"#9E9E9E",marginLeft:6,fontWeight:400}}>{isTeacher?(lang==="zh"?"老師":"Teacher"):(lang==="zh"?"學生":"Student")}</span>
              </div>
              {course&&<div style={{fontSize:12,color:"#546E7A",marginTop:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{course.subject}</div>}
              {r.note&&<div style={{fontSize:11,color:"#9E9E9E",marginTop:2}}>{r.note}</div>}
              {r._editedAt&&<div style={{fontSize:10,color:"#FF9800",marginTop:2}}>✏️ {lang==="zh"?"已修正":"Edited"} {r._editedAt.slice(0,10)}</div>}
            </div>
            {/* Source badge */}
            <span style={{fontSize:10,color:"#9E9E9E",flexShrink:0,marginTop:2}}>{r.source==="admin"?(lang==="zh"?"管理員":"Admin"):(lang==="zh"?"自行申請":"Self")}</span>
            {/* Edit button */}
            <button onClick={()=>openEdit(r)} style={{flexShrink:0,padding:"4px 10px",borderRadius:5,border:"0.5px solid #CFD8DC",background:"transparent",color:"#1A6B8A",fontSize:11,cursor:"pointer",fontWeight:500}}>
              ✏️ {lang==="zh"?"修正":"Edit"}
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ─── Student Directory ────────────────────────────────────────────────────────
// Compute current age from join age + join year
function computeCurrentAge(joinAge, regYear) {
  if (!joinAge || !regYear) return null;
  const age = parseInt(joinAge);
  const year = parseInt(regYear);
  if (isNaN(age) || isNaN(year)) return null;
  const currentYear = new Date().getFullYear();
  return age + (currentYear - year);
}

// Format age display: "16（2025：15 加入）"
function fmtAge(joinAge, regYear, lang) {
  const currentAge = computeCurrentAge(joinAge, regYear);
  if (!currentAge) return joinAge || "—";
  const currentYear = new Date().getFullYear();
  if (!regYear || parseInt(regYear) === currentYear) return `${currentAge}`;
  return `${currentAge}（${regYear}：${joinAge}${lang==="zh"?"加入":"joined"}）`;
}

function StudentDirectory({ users, setUsers, lang, setToast, enrollments, attendance, courses }) {
  const t = T[lang];
  const students = users.filter(u=>u.role==="student");

  // Compute real sessions for a student (from enrollments+attendance) + manual supplement
  // Compute sessions with full breakdown
  // confirmedSessions (if set) = admin-confirmed official count → used for medal
  // otherwise: system (from enrollments) + manual supplement
  const getSessions = (linkedUserId, manualSessions, confirmedSessions) => {
    const manual = parseInt(manualSessions||0)||0;
    const confirmed = confirmedSessions!==undefined && confirmedSessions!==""
      ? (parseInt(confirmedSessions)||0)
      : null;
    const system = linkedUserId
      ? calcStudentSessions(linkedUserId, enrollments||[], attendance||[], courses||[]).full
      : 0;
    const unofficial = system + manual;
    return {
      system,
      manual,
      unofficial,           // system + manual, before confirmation
      confirmed,            // null if not yet confirmed
      total: confirmed !== null ? confirmed : unofficial,  // what medal uses
      isConfirmed: confirmed !== null,
    };
  };

  const getMedal = (linkedUserId, manualSessions, confirmedSessions) => {
    const {total} = getSessions(linkedUserId, manualSessions, confirmedSessions);
    return getMedalInfo(total);
  };

  const [dirEntries, setDirEntries] = useState([]);
  const [pasteText, setPasteText] = useState("");
  const [parsed, setParsed] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [showPaste, setShowPaste] = useState(false);
  const [editingId, setEditingId] = useState(null);  // id of entry being edited
  const [editForm, setEditForm] = useState({});       // form state for editing
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({nameEn:"",nameCn:"",age:"",regYear:String(new Date().getFullYear()),regDate:"",startDate:"",duration:"",manualSessions:"",linkedUserId:""});
  const [confirmDelDirId, setConfirmDelDirId] = useState(null);

  useEffect(()=>{
    (async()=>{
      try{ const r=await window.storage.get("cp3_student_dir"); if(r?.value) setDirEntries(JSON.parse(r.value)); }catch{}
    })();
  },[]);
  const saveDirEntries = async (next) => {
    setDirEntries(next);
    try{ await window.storage.set("cp3_student_dir",JSON.stringify(next)); }catch{}
  };

  // ── Parse from Excel ──
  const parseExcel = () => {
    const rows = pasteText.trim().split(/\r?\n/).map(row=>row.split(/\t/).map(c=>c.trim()));
    const result = rows.filter(r=>r.length>=1&&r[0]).map(r=>({
      nameEn:r[0]||"", nameCn:r[1]||"", age:r[2]||"",
      regDate:r[3]||"", startDate:r[4]||"", duration:r[5]||"",
      // Auto-extract year from regDate if available
      regYear: r[3]? (r[3].match(/(\d{4})/)||[])[1]||String(new Date().getFullYear()) : String(new Date().getFullYear()),
      manualSessions:"",
    }));
    setParsed(result);
    setSelected(new Set(result.map((_,i)=>i)));
  };

  const genPassword = () => Math.random().toString(36).slice(2,8).toUpperCase();
  const isLinked = (nameEn) => {
    const lower = nameEn.toLowerCase().replace(/\s/g,"");
    return users.find(u=>u.role==="student"&&(u.name.toLowerCase().replace(/\s/g,"")===lower||u.username.toLowerCase()===lower));
  };

  const createAccounts = () => {
    let created = 0;
    const newUsers = [...users];
    const newDir = [...dirEntries];
    parsed.forEach((row, i) => {
      if (!selected.has(i)) return;
      const existing = isLinked(row.nameEn);
      if (existing) return;
      const pwd = genPassword();
      const username = row.nameEn.toLowerCase().replace(/\s+/g,".");
      const newUser = { id:genId(), username, password:pwd, name:row.nameEn+(row.nameCn?` (${row.nameCn})`:""), role:"student", _defaultPwd:pwd };
      newUsers.push(newUser);
      const existingDirIdx = newDir.findIndex(d=>d.nameEn===row.nameEn);
      const entry = { id:genId(), ...row, linkedUserId:newUser.id };
      if (existingDirIdx>=0) newDir[existingDirIdx]=entry; else newDir.push(entry);
      created++;
    });
    setUsers(newUsers);
    saveDirEntries(newDir);
    setParsed([]); setPasteText(""); setShowPaste(false);
    setToast(t.importDone.replace("{n}",created));
  };

  const toggleSel = (i) => setSelected(s=>{const n=new Set(s);n.has(i)?n.delete(i):n.add(i);return n;});

  // ── Edit ──
  const startEdit = (d) => { setEditingId(d.id||d.linkedUserId); setEditForm({...d}); setShowAddForm(false); };
  const saveEdit = () => {
    const next = dirEntries.map(d => (d.id===editingId||d.linkedUserId===editingId) ? {...d,...editForm} : d);
    // Also handle students not yet in dirEntries
    if (!next.some(d=>d.id===editingId||d.linkedUserId===editingId)) {
      next.push({id:genId(),...editForm});
    }
    saveDirEntries(next);
    setEditingId(null); setEditForm({});
    setToast(lang==="zh"?"已儲存":"Saved");
  };
  const cancelEdit = () => { setEditingId(null); setEditForm({}); };

  // ── Add manual ──
  const saveAdd = () => {
    if (!addForm.nameEn.trim()) return;
    const entry = { id:genId(), ...addForm };
    // Optionally auto-create account
    saveDirEntries([...dirEntries, entry]);
    setAddForm({nameEn:"",nameCn:"",age:"",regYear:String(new Date().getFullYear()),regDate:"",startDate:"",duration:"",manualSessions:"",linkedUserId:""});
    setShowAddForm(false);
    setToast(lang==="zh"?"學生資料已新增":"Student added");
  };

  // ── Delete ──
  const doDelDir = () => {
    saveDirEntries(dirEntries.filter(d=>d.id!==confirmDelDirId&&d.linkedUserId!==confirmDelDirId));
    setConfirmDelDirId(null);
    setToast(lang==="zh"?"已刪除":"Deleted");
  };

  // Merge: directory entries + system users not yet in directory
  const allStudents = [
    ...dirEntries.map(d=>({...d, _fromDir:true})),
    ...students.filter(u=>!dirEntries.some(d=>d.linkedUserId===u.id)).map(u=>({
      id:u.id, nameEn:u.name, nameCn:"", age:"", regYear:"", regDate:"", startDate:"", duration:"", manualSessions:"", linkedUserId:u.id, _fromDir:false,
    })),
  ];

  const iStyle={width:"100%",boxSizing:"border-box",padding:"7px 9px",borderRadius:6,border:"0.5px solid #CFD8DC",background:"#FFFFFF",color:"#172F39",fontSize:12};
  const thStyle={fontSize:11,fontWeight:600,color:"#546E7A",padding:"8px 10px",textAlign:"left",borderBottom:"1px solid #E0E0E0",whiteSpace:"nowrap",background:"#F5F5F5"};
  const tdStyle={fontSize:12,color:"#172F39",padding:"8px 10px",borderBottom:"0.5px solid #F0F0F0",verticalAlign:"middle"};
  const lStyle={fontSize:11,color:"#546E7A",display:"block",marginBottom:3,marginTop:8};

  const cols = [
    t.dirStudentName, t.dirCnName, t.dirAge,
    lang==="zh"?"加入年":"Join Yr",
    t.dirRegDate, t.dirStartDate, t.dirDuration,
    lang==="zh"?"積分":"Points",
    t.dirStatus, "",
  ];

  return (
    <div>
      {confirmDelDirId && <ConfirmModal title={lang==="zh"?"刪除學生資料":"Delete Student"} message={lang==="zh"?"確認刪除此學生的資料？":"Delete this student record?"} confirmLabel={lang==="zh"?"確認刪除":"Delete"} onConfirm={doDelDir} onCancel={()=>setConfirmDelDirId(null)} danger/>}

      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.6rem",flexWrap:"wrap",gap:8}}>
        <h3 style={{fontSize:16,fontWeight:500,color:"#172F39",margin:0}}>{t.studentDir} ({allStudents.length})</h3>
        <div style={{display:"flex",gap:7}}>
          <button onClick={()=>{setShowAddForm(!showAddForm);setEditingId(null);}} style={{background:showAddForm?"#546E7A":"#4CAF50",border:"none",borderRadius:7,color:"#fff",padding:"7px 14px",fontSize:12,cursor:"pointer"}}>
            ＋ {t.dirAddManual}
          </button>
          <button onClick={()=>setShowPaste(!showPaste)} style={{background:"#1A6B8A",border:"none",borderRadius:7,color:"#fff",padding:"7px 14px",fontSize:12,cursor:"pointer"}}>
            📋 {t.pasteFromExcel}
          </button>
        </div>
      </div>
      {/* Points rule note */}
      <div style={{display:"inline-flex",alignItems:"center",gap:6,background:"#F5F5F5",border:"0.5px solid #E0E0E0",borderRadius:20,padding:"4px 12px",marginBottom:"1rem",fontSize:11,color:"#546E7A"}}>
        <span style={{fontSize:12}}>🏅</span>
        {lang==="zh"
          ? <span>積分規則：25 分鐘 = <strong style={{color:"#1A6B8A"}}>1 點</strong>；50 分鐘 = <strong style={{color:"#7B1FA2"}}>2 點</strong></span>
          : <span>Points: 25-min = <strong style={{color:"#1A6B8A"}}>1 pt</strong> · 50-min = <strong style={{color:"#7B1FA2"}}>2 pts</strong></span>
        }
      </div>

      {/* Manual add form */}
      {showAddForm && (
        <div style={{background:"#F5F5F5",borderRadius:12,border:"0.5px solid #E0E0E0",padding:"1.25rem",marginBottom:"1.25rem"}}>
          <div style={{fontWeight:500,fontSize:14,color:"#172F39",marginBottom:12}}>{t.dirAddManual}</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:10}}>
            {[
              {k:"nameEn",  l:t.dirStudentName, ph:"John Smith"},
              {k:"nameCn",  l:t.dirCnName,      ph:"中文姓名"},
              {k:"age",     l:lang==="zh"?"加入時年齡":"Age at Join",    ph:"15"},
              {k:"regYear", l:lang==="zh"?"加入年份":"Join Year",         ph:"2025"},
              {k:"regDate", l:t.dirRegDate,     ph:"2025-01-01"},
              {k:"startDate",l:t.dirStartDate,  ph:"2025-02-01"},
              {k:"duration",l:t.dirDuration,    ph:"25 or 50"},
              {k:"manualSessions",l:lang==="zh"?"手動積分":"Manual Points",ph:"0"},
            ].map(({k,l,ph})=>(
              <div key={k}>
                <label style={lStyle}>{l}</label>
                <input style={iStyle} value={addForm[k]||""} onChange={e=>setAddForm(f=>({...f,[k]:e.target.value}))} placeholder={ph}/>
              </div>
            ))}
            <div>
              <label style={lStyle}>{lang==="zh"?"連結帳號（選填）":"Link Account (optional)"}</label>
              <select style={iStyle} value={addForm.linkedUserId||""} onChange={e=>setAddForm(f=>({...f,linkedUserId:e.target.value}))}>
                <option value="">{lang==="zh"?"—不連結—":"—None—"}</option>
                {students.filter(u=>!dirEntries.some(d=>d.linkedUserId===u.id)).map(u=><option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
          </div>
          <div style={{display:"flex",gap:8,marginTop:14}}>
            <button onClick={saveAdd} style={{padding:"8px 20px",borderRadius:7,background:"#4CAF50",border:"none",color:"#fff",fontSize:13,fontWeight:500,cursor:"pointer"}}>✓ {t.dirSave}</button>
            <button onClick={()=>setShowAddForm(false)} style={{padding:"8px 14px",borderRadius:7,background:"transparent",border:"0.5px solid #CFD8DC",color:"#546E7A",fontSize:13,cursor:"pointer"}}>{t.cancel}</button>
          </div>
        </div>
      )}

      {/* Paste panel */}
      {showPaste && (
        <div style={{background:"#F5F5F5",borderRadius:12,border:"0.5px solid #E0E0E0",padding:"1.25rem",marginBottom:"1.5rem"}}>
          <p style={{fontSize:12,color:"#546E7A",margin:"0 0 8px",lineHeight:1.6}}>{t.pasteHint}</p>
          <div style={{fontSize:11,background:"#E3F2FD",color:"#1565C0",borderRadius:5,padding:"5px 10px",marginBottom:10,fontFamily:"monospace"}}>{t.excelCols}</div>
          <textarea value={pasteText} onChange={e=>setPasteText(e.target.value)} placeholder={lang==="zh"?"在此貼上從 Excel 複製的內容…":"Paste Excel content here…"} style={{...iStyle,height:110,resize:"vertical",fontFamily:"monospace",lineHeight:1.5}}/>
          <div style={{display:"flex",gap:8,marginTop:10}}>
            <button onClick={parseExcel} disabled={!pasteText.trim()} style={{padding:"7px 16px",borderRadius:7,background:pasteText.trim()?"#1A6B8A":"#E0E0E0",border:"none",color:pasteText.trim()?"#fff":"#9E9E9E",fontSize:12,cursor:pasteText.trim()?"pointer":"not-allowed"}}>🔍 {t.parseRows}</button>
            <button onClick={()=>{setPasteText("");setParsed([]);}} style={{padding:"7px 12px",borderRadius:7,background:"transparent",border:"0.5px solid #CFD8DC",color:"#546E7A",fontSize:12,cursor:"pointer"}}>{t.cancel}</button>
          </div>
          {parsed.length>0 && (
            <div style={{marginTop:"1.25rem"}}>
              <div style={{fontSize:13,fontWeight:500,color:"#172F39",marginBottom:8}}>{t.parsedPreview} — {parsed.length} {lang==="zh"?"筆":"rows"}</div>
              <div style={{overflowX:"auto",borderRadius:8,border:"0.5px solid #E0E0E0",marginBottom:12}}>
                <table style={{width:"100%",borderCollapse:"collapse",minWidth:520}}>
                  <thead style={{background:"#F5F5F5"}}>
                    <tr>
                      <th style={{...thStyle,width:36}}><input type="checkbox" checked={selected.size===parsed.length} onChange={e=>{if(e.target.checked)setSelected(new Set(parsed.map((_,i)=>i)));else setSelected(new Set());}} style={{cursor:"pointer"}}/></th>
                      {[t.dirStudentName,t.dirCnName,t.dirAge,t.dirRegDate,t.dirStartDate,t.dirDuration,t.dirStatus].map(h=><th key={h} style={thStyle}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {parsed.map((row,i)=>{
                      const exists=isLinked(row.nameEn);
                      return (
                        <tr key={i} style={{background:selected.has(i)?"rgba(26,107,138,0.04)":"transparent"}}>
                          <td style={{...tdStyle,width:36}}><input type="checkbox" checked={selected.has(i)} onChange={()=>toggleSel(i)} disabled={!!exists} style={{cursor:exists?"not-allowed":"pointer"}}/></td>
                          <td style={tdStyle}>{row.nameEn}</td>
                          <td style={tdStyle}>{row.nameCn}</td>
                          <td style={tdStyle}>{row.age}</td>
                          <td style={tdStyle}>{row.regDate}</td>
                          <td style={tdStyle}>{row.startDate}</td>
                          <td style={tdStyle}>{row.duration}</td>
                          <td style={tdStyle}>{exists?<span style={{fontSize:11,background:"#E8F5E9",color:"#2E7D32",borderRadius:4,padding:"2px 7px"}}>✓ {t.accountCreated}</span>:<span style={{fontSize:11,background:"#FFF3E0",color:"#E65100",borderRadius:4,padding:"2px 7px"}}>{t.dirNoAccount}</span>}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div style={{fontSize:11,color:"#546E7A",marginBottom:10}}>{t.randomPwd}</div>
              <button onClick={createAccounts} disabled={selected.size===0} style={{padding:"8px 18px",borderRadius:7,background:selected.size>0?"#4CAF50":"#E0E0E0",border:"none",color:selected.size>0?"#fff":"#9E9E9E",fontSize:13,fontWeight:500,cursor:selected.size>0?"pointer":"not-allowed"}}>
                ✓ {t.createAccounts} ({[...selected].filter(i=>!isLinked(parsed[i]?.nameEn)).length})
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main table */}
      {allStudents.length===0 ? (
        <p style={{color:"#9E9E9E",fontSize:13,textAlign:"center",padding:"2rem 0"}}>{lang==="zh"?"尚無學生資料":"No student data yet"}</p>
      ) : (
        <div style={{overflowX:"auto",borderRadius:10,border:"0.5px solid #E0E0E0"}}>
          <table style={{width:"100%",borderCollapse:"collapse",minWidth:780}}>
            <thead>
              <tr>{cols.map((h,i)=><th key={i} style={thStyle}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {allStudents.map((d,i)=>{
                const linkedUser = users.find(u=>u.id===d.linkedUserId);
                const entryId = d.id||d.linkedUserId;
                const isEditing = editingId===entryId;
                const ageDisplay = fmtAge(d.age, d.regYear, lang);
                const sess = getSessions(d.linkedUserId, d.manualSessions, d.confirmedSessions);
                const {current: medal} = getMedal(d.linkedUserId, d.manualSessions, d.confirmedSessions);

                if (isEditing) {
                  // Inline edit row — show current real sessions read-only, manual is editable
                  const ef = editForm;
                  const inEd = (k,ph) => <input style={{...iStyle,minWidth:70}} value={ef[k]||""} onChange={e=>setEditForm(f=>({...f,[k]:e.target.value}))} placeholder={ph||""}/>;
                  const editSess = getSessions(d.linkedUserId, ef.manualSessions, ef.confirmedSessions);
                  return (
                    <tr key={entryId} style={{background:"#EEF6FB"}}>
                      <td style={tdStyle}>{inEd("nameEn","John Smith")}</td>
                      <td style={tdStyle}>{inEd("nameCn","中文")}</td>
                      <td style={tdStyle}>{inEd("age","15")}</td>
                      <td style={tdStyle}>{inEd("regYear","2025")}</td>
                      <td style={tdStyle}>{inEd("regDate","2025-01")}</td>
                      <td style={tdStyle}>{inEd("startDate","2025-02")}</td>
                      <td style={tdStyle}>{inEd("duration","50")}</td>
                      {/* Sessions: show system (read-only) + manual (editable) */}
                      <td style={tdStyle}>
                        <div style={{fontSize:10,color:"#9E9E9E",marginBottom:3}}>
                          {lang==="zh"?"系統":"System"}: <strong style={{color:"#172F39"}}>{editSess.system}</strong>
                        </div>
                        <div style={{display:"flex",alignItems:"center",gap:4}}>
                          <span style={{fontSize:10,color:"#9E9E9E",whiteSpace:"nowrap"}}>{lang==="zh"?"手動補充:":"Manual:"}</span>
                          {inEd("manualSessions","0")}
                        </div>
                      </td>
                      <td style={tdStyle} colSpan={2}>
                        <div style={{display:"flex",gap:5}}>
                          <button onClick={saveEdit} style={{padding:"5px 12px",borderRadius:5,background:"#1A6B8A",border:"none",color:"#fff",fontSize:11,cursor:"pointer"}}>✓ {t.dirSave}</button>
                          <button onClick={cancelEdit} style={{padding:"5px 10px",borderRadius:5,background:"transparent",border:"0.5px solid #CFD8DC",color:"#546E7A",fontSize:11,cursor:"pointer"}}>{t.cancel}</button>
                        </div>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={entryId} style={{background:i%2===0?"#FFFFFF":"#FAFAFA"}} onMouseEnter={e=>e.currentTarget.style.background="#EEF6FB"} onMouseLeave={e=>e.currentTarget.style.background=i%2===0?"#FFFFFF":"#FAFAFA"}>
                    <td style={tdStyle}>
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        {medal && <span title={lang==="zh"?medal.zh:medal.en} style={{fontSize:16,flexShrink:0}}>{medal.icon}</span>}
                        <div>
                          <div style={{fontWeight:500}}>{d.nameEn||"—"}</div>
                          {linkedUser&&<div style={{fontSize:10,color:"#9E9E9E"}}>@{linkedUser.username}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={tdStyle}>{d.nameCn||"—"}</td>
                    <td style={tdStyle}>
                      {ageDisplay!=="—"
                        ? <span title={`加入年份: ${d.regYear||"?"}, 加入年齡: ${d.age||"?"}`}>{ageDisplay}</span>
                        : "—"}
                    </td>
                    <td style={tdStyle}>{d.regYear||"—"}</td>
                    <td style={tdStyle}>{d.regDate||"—"}</td>
                    <td style={tdStyle}>{d.startDate||"—"}</td>
                    <td style={tdStyle}>{d.duration?(d.duration+" min"):"—"}</td>
                    {/* Sessions column — with confirmation flow */}
                    <td style={tdStyle}>
                      {d.linkedUserId ? (
                        <div>
                          {/* Official count badge (if confirmed) */}
                          {sess.isConfirmed ? (
                            <div>
                              <div style={{display:"flex",alignItems:"baseline",gap:4,marginBottom:2}}>
                                <span style={{fontSize:15,fontWeight:800,color:medal?medal.color:"#2E7D32"}}>{sess.confirmed}</span>
                                <span style={{fontSize:10,color:"#9E9E9E"}}>{lang==="zh"?"點":"pt"}</span>
                                <span style={{fontSize:10,background:"#E8F5E9",color:"#2E7D32",borderRadius:3,padding:"1px 5px",fontWeight:600}}>✓ {lang==="zh"?"已確認":"Confirmed"}</span>
                              </div>
                              {medal&&<div style={{fontSize:10,color:medal.color,fontWeight:500}}>{lang==="zh"?medal.zh:medal.en}</div>}
                              <div style={{fontSize:10,color:"#9E9E9E",marginTop:2}}>
                                {lang==="zh"?"(系統":"(Sys"}: {sess.system} + {lang==="zh"?"手動":"M"}: {sess.manual})
                              </div>
                            </div>
                          ) : (
                            <div>
                              {/* Unconfirmed: show total prominently with confirm CTA */}
                              <div style={{display:"flex",alignItems:"baseline",gap:4,marginBottom:2}}>
                                <span style={{fontSize:14,fontWeight:700,color:"#546E7A"}}>{sess.unofficial}</span>
                                <span style={{fontSize:10,color:"#9E9E9E"}}>{lang==="zh"?"點":"pt"}</span>
                                <span style={{fontSize:10,background:"#FFF3E0",color:"#E65100",borderRadius:3,padding:"1px 5px"}}>{lang==="zh"?"未確認":"Pending"}</span>
                              </div>
                              <div style={{fontSize:10,color:"#9E9E9E",marginBottom:4}}>
                                {lang==="zh"?"系統":"Sys"}: {sess.system}
                                {sess.manual>0&&<span style={{color:"#1A6B8A"}}> + {lang==="zh"?"手動":"M"}: {sess.manual}</span>}
                              </div>
                              {/* Confirm button */}
                              <button
                                onClick={()=>{
                                  const next = dirEntries.map(x=>
                                    (x.id===entryId||x.linkedUserId===entryId)
                                      ? {...x, confirmedSessions: sess.unofficial, confirmedAt: new Date().toISOString()}
                                      : x
                                  );
                                  saveDirEntries(next);
                                  setToast(lang==="zh"?`已確認 ${sess.unofficial} 堂為正式完課數`:`${sess.unofficial} sessions confirmed`);
                                }}
                                style={{fontSize:11,padding:"3px 10px",borderRadius:5,background:"#1A6B8A",border:"none",color:"#fff",cursor:"pointer",fontWeight:500}}
                              >
                                ✓ {lang==="zh"?"確認為正式":"Confirm"}
                              </button>
                            </div>
                          )}
                          {/* Reset confirmed (allow re-editing) */}
                          {sess.isConfirmed && (
                            <button
                              onClick={()=>{
                                const next = dirEntries.map(x=>
                                  (x.id===entryId||x.linkedUserId===entryId)
                                    ? {...x, confirmedSessions:"", confirmedAt:""}
                                    : x
                                );
                                saveDirEntries(next);
                                setToast(lang==="zh"?"已取消確認，可重新編輯":"Confirmation reset");
                              }}
                              style={{fontSize:10,padding:"2px 7px",borderRadius:4,background:"transparent",border:"0.5px solid #CFD8DC",color:"#9E9E9E",cursor:"pointer",marginTop:4,display:"block"}}
                            >
                              {lang==="zh"?"取消確認":"Unconfirm"}
                            </button>
                          )}
                        </div>
                      ) : (
                        // No linked account — show manual only
                        <div>
                          {sess.manual>0
                            ? <span style={{fontSize:13,fontWeight:600,color:"#546E7A"}}>{sess.manual} <span style={{fontSize:10,fontWeight:400,color:"#9E9E9E"}}>{lang==="zh"?"手動":"manual"}</span></span>
                            : <span style={{color:"#CFD8DC",fontSize:12}}>—</span>}
                        </div>
                      )}
                    </td>
                    <td style={tdStyle}>
                      {linkedUser
                        ? <span style={{fontSize:11,background:"#E8F5E9",color:"#2E7D32",borderRadius:4,padding:"2px 7px"}}>✓ {t.dirHasAccount}</span>
                        : <span style={{fontSize:11,background:"#FFF3E0",color:"#E65100",borderRadius:4,padding:"2px 7px"}}>{t.dirNoAccount}</span>}
                    </td>
                    <td style={tdStyle}>
                      <div style={{display:"flex",gap:4}}>
                        <button onClick={()=>startEdit(d)} style={{padding:"4px 9px",borderRadius:4,border:"0.5px solid #CFD8DC",background:"transparent",color:"#1A6B8A",fontSize:11,cursor:"pointer"}}>{t.dirEdit}</button>
                        {d._fromDir && <button onClick={()=>setConfirmDelDirId(entryId)} style={{padding:"4px 9px",borderRadius:4,border:"0.5px solid #FFCDD2",background:"transparent",color:"#D32F2F",fontSize:11,cursor:"pointer"}}>✕</button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Admin panel ──────────────────────────────────────────────────────────────
function AdminPanel({ users, setUsers, courses, setCourses, absences, setAbsences, materials, setMaterials, enrollments, setEnrollments, attendance, setAttendance, lang, setToast, introText, setIntroText, feedback, setFeedback }) {
  const t = T[lang];
  const [tab, setTab] = useState("courses");
  const pendingFbCount = (feedback||[]).filter(f=>f.status==="pending").length;
  const tabs = [
    {key:"courses", label:t.courses},
    {key:"enroll",  label:t.enrollments},
    {key:"leave",   label:t.leaveReview},
    {key:"feedback",label:t.feedbackReview, badge:pendingFbCount},
    {key:"studir",  label:t.studentDir},
    {key:"users",   label:t.manageUsers},
    {key:"tstats",  label:t.teacherStats},
    {key:"sstats",  label:t.studentStats},
    {key:"settings",label:lang==="zh"?"網站設定":"Site Settings"},
  ];
  return (
    <div>
      <h2 style={{fontSize:18,fontWeight:500,color:"#172F39",margin:"0 0 1.25rem"}}>{t.adminPanel}</h2>
      <div style={{display:"flex",gap:2,marginBottom:"1.5rem",flexWrap:"wrap",borderBottom:"0.5px solid #E0E0E0",paddingBottom:0}}>
        {tabs.map(tb=>(
          <button key={tb.key} onClick={()=>setTab(tb.key)} style={{position:"relative",padding:"7px 12px",borderRadius:"6px 6px 0 0",border:"none",borderBottom:tab===tb.key?"2px solid #1A6B8A":"2px solid transparent",background:tab===tb.key?"#EEF6FB":"transparent",color:tab===tb.key?"#1A6B8A":"#546E7A",fontSize:12,cursor:"pointer",marginBottom:-1,whiteSpace:"nowrap"}}>
            {tb.label}
            {!!tb.badge && <span style={{position:"absolute",top:-2,right:-2,background:"#D32F2F",color:"#fff",borderRadius:"50%",width:16,height:16,fontSize:9,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>{tb.badge}</span>}
          </button>
        ))}
      </div>
      {tab==="courses"&&<CourseManager users={users} courses={courses} setCourses={setCourses} lang={lang} setToast={setToast} materials={materials} setMaterials={setMaterials}/>}
      {tab==="enroll" &&<EnrollmentManager users={users} courses={courses} enrollments={enrollments} setEnrollments={setEnrollments} attendance={attendance} setAttendance={setAttendance} lang={lang} setToast={setToast}/>}
      {tab==="leave"  &&<LeaveReview users={users} courses={courses} absences={absences} setAbsences={setAbsences} attendance={attendance} setAttendance={setAttendance} enrollments={enrollments} lang={lang}/>}
      {tab==="feedback"&&<FeedbackReview users={users} courses={courses} enrollments={enrollments} feedback={feedback||[]} setFeedback={setFeedback} lang={lang} setToast={setToast}/>}
      {tab==="studir" &&<StudentDirectory users={users} setUsers={setUsers} lang={lang} setToast={setToast} enrollments={enrollments} attendance={attendance} courses={courses}/>}
      {tab==="users"  &&<UserManager users={users} setUsers={setUsers} lang={lang} setToast={setToast}/>}
      {tab==="tstats" &&<TeacherStats users={users} courses={courses} absences={absences} attendance={attendance} enrollments={enrollments} lang={lang}/>}
      {tab==="sstats" &&<StudentStats users={users} courses={courses} absences={absences} attendance={attendance} enrollments={enrollments} lang={lang}/>}
      {tab==="settings"&&<SiteSettings introText={introText} setIntroText={setIntroText} lang={lang} setToast={setToast}/>}
    </div>
  );
}

// ─── Feedback Review (admin) ──────────────────────────────────────────────────
// Simple check-and-approve flow: view the teacher's written feedback, then
// one click to Approve (becomes visible to the student) or Reject.
function FeedbackReview({ users, courses, enrollments, feedback, setFeedback, lang, setToast }) {
  const t = T[lang];
  const [filter, setFilter] = useState("pending"); // pending | all
  const [rejectTarget, setRejectTarget] = useState(null); // feedback id (or "_batch") pending a reject-reason prompt
  const [rejectNote, setRejectNote] = useState("");
  const [selected, setSelected] = useState(new Set()); // selected feedback ids (pending only)
  const [showBatchInput, setShowBatchInput] = useState(false);

  const getCourse = id => courses.find(c=>c.id===id);
  const getUser = id => users.find(u=>u.id===id);

  const list = (feedback||[])
    .filter(f => filter==="all" || f.status==="pending")
    .sort((a,b) => (b.updatedAt||"").localeCompare(a.updatedAt||""));

  const pendingIds = list.filter(f=>f.status==="pending").map(f=>f.id);
  const allPendingSelected = pendingIds.length>0 && pendingIds.every(id=>selected.has(id));

  const toggleSel = (id) => setSelected(s=>{const n=new Set(s); n.has(id)?n.delete(id):n.add(id); return n;});
  const toggleSelAll = () => setSelected(allPendingSelected ? new Set() : new Set(pendingIds));

  const approve = (f) => {
    setFeedback(prev => prev.map(x => x.id===f.id ? {...x, status:"approved", reviewedAt:new Date().toISOString(), reviewedBy:"admin", reviewNote:""} : x));
    setToast(t.feedbackApproved);
  };
  const openReject = (f) => { setRejectTarget(f); setRejectNote(""); };
  const confirmReject = () => {
    if (rejectTarget === "_batch") {
      setFeedback(prev => prev.map(x => selected.has(x.id) ? {...x, status:"rejected", reviewedAt:new Date().toISOString(), reviewedBy:"admin", reviewNote:rejectNote.trim()} : x));
      setToast(t.feedbackBatchRejected.replace("{n}", selected.size));
      setSelected(new Set());
    } else {
      setFeedback(prev => prev.map(x => x.id===rejectTarget.id ? {...x, status:"rejected", reviewedAt:new Date().toISOString(), reviewedBy:"admin", reviewNote:rejectNote.trim()} : x));
      setToast(t.feedbackRejected);
    }
    setRejectTarget(null); setRejectNote("");
  };

  const batchApprove = () => {
    if (selected.size===0) return;
    setFeedback(prev => prev.map(x => selected.has(x.id) ? {...x, status:"approved", reviewedAt:new Date().toISOString(), reviewedBy:"admin", reviewNote:""} : x));
    setToast(t.feedbackBatchApproved.replace("{n}", selected.size));
    setSelected(new Set());
  };
  const batchReject = () => {
    if (selected.size===0) return;
    setRejectTarget("_batch"); setRejectNote("");
  };

  const STATUS_META = {
    pending:  {label:t.feedbackStatusPending,  color:"#E65100", bg:"#FFF3E0"},
    approved: {label:t.feedbackStatusApproved, color:"#2E7D32", bg:"#E8F5E9"},
    rejected: {label:t.feedbackStatusRejected, color:"#D32F2F", bg:"#FFEBEE"},
  };

  return (
    <div>
      {showBatchInput && <BatchFeedbackModal users={users} courses={courses} enrollments={enrollments} setFeedback={setFeedback} lang={lang} setToast={setToast} onClose={()=>setShowBatchInput(false)}/>}

      {/* Reject reason modal (single or batch) */}
      {rejectTarget && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9200,padding:"1rem"}}>
          <div style={{background:"#FFFFFF",borderRadius:14,width:"100%",maxWidth:380,boxSizing:"border-box",boxShadow:"0 8px 32px rgba(23,47,57,0.18)",overflow:"hidden"}}>
            <div style={{background:"#172F39",padding:"12px 16px"}}>
              <span style={{fontSize:14,fontWeight:600,color:"#fff"}}>{t.feedbackReject}{rejectTarget==="_batch"?` (${selected.size})`:""}</span>
            </div>
            <div style={{padding:"16px"}}>
              <label style={{fontSize:12,color:"#546E7A",display:"block",marginBottom:6}}>{t.feedbackRejectReason}</label>
              <input
                value={rejectNote}
                onChange={e=>setRejectNote(e.target.value)}
                placeholder={lang==="zh"?"例：內容需要更具體…":"e.g. Needs more specific detail…"}
                style={{width:"100%",boxSizing:"border-box",padding:"8px 10px",borderRadius:6,border:"0.5px solid #CFD8DC",background:"#FFFFFF",color:"#172F39",fontSize:13,marginBottom:14}}
                autoFocus
              />
              <div style={{display:"flex",gap:8}}>
                <button onClick={confirmReject} style={{flex:1,background:"#D32F2F",border:"none",borderRadius:7,color:"#fff",padding:"9px",fontSize:13,fontWeight:600,cursor:"pointer"}}>✓ {t.feedbackReject}</button>
                <button onClick={()=>setRejectTarget(null)} style={{padding:"9px 16px",borderRadius:7,background:"transparent",border:"0.5px solid #CFD8DC",color:"#546E7A",fontSize:13,cursor:"pointer"}}>{t.cancel}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:10,marginBottom:4}}>
        <div>
          <h3 style={{fontSize:16,fontWeight:600,color:"#172F39",margin:"0 0 4px"}}>{t.feedbackReview}</h3>
          <p style={{fontSize:12,color:"#9E9E9E",margin:0}}>{t.feedbackReviewDesc}</p>
        </div>
        <button onClick={()=>setShowBatchInput(true)} style={{background:"#7B1FA2",border:"none",borderRadius:7,color:"#fff",padding:"8px 16px",fontSize:12,fontWeight:500,cursor:"pointer",whiteSpace:"nowrap"}}>
          📋 {t.feedbackBatchInput}
        </button>
      </div>

      {/* Filter */}
      <div style={{display:"flex",gap:5,marginTop:14,marginBottom:12,flexWrap:"wrap",alignItems:"center"}}>
        {[["pending",t.feedbackReview],["all",t.feedbackAllReviewed]].map(([k,l])=>(
          <button key={k} onClick={()=>{setFilter(k);setSelected(new Set());}} style={{padding:"5px 14px",borderRadius:6,fontSize:12,cursor:"pointer",border:filter===k?"none":"0.5px solid #CFD8DC",background:filter===k?"#1A6B8A":"transparent",color:filter===k?"#fff":"#546E7A"}}>
            {k==="pending"?(lang==="zh"?"待審核":"Pending"):(lang==="zh"?"全部":"All")}
          </button>
        ))}
      </div>

      {/* Batch selection toolbar — only relevant when there's pending items in view */}
      {pendingIds.length>0 && (
        <div style={{display:"flex",alignItems:"center",gap:10,background:"#F5F5F5",border:"0.5px solid #E0E0E0",borderRadius:8,padding:"8px 12px",marginBottom:14,flexWrap:"wrap"}}>
          <label style={{display:"flex",alignItems:"center",gap:6,fontSize:12,color:"#546E7A",cursor:"pointer"}}>
            <input type="checkbox" checked={allPendingSelected} onChange={toggleSelAll} style={{cursor:"pointer"}}/>
            {t.feedbackSelectAll}
          </label>
          {selected.size>0 && (
            <>
              <span style={{fontSize:12,color:"#1A6B8A",fontWeight:500}}>{t.feedbackSelected.replace("{n}", selected.size)}</span>
              <button onClick={batchApprove} style={{marginLeft:"auto",background:"#2E7D32",border:"none",borderRadius:6,color:"#fff",padding:"6px 14px",fontSize:12,fontWeight:600,cursor:"pointer"}}>
                ✓ {t.feedbackBatchApprove}
              </button>
              <button onClick={batchReject} style={{background:"transparent",border:"1px solid #D32F2F",borderRadius:6,color:"#D32F2F",padding:"6px 14px",fontSize:12,fontWeight:600,cursor:"pointer"}}>
                ✕ {t.feedbackBatchReject}
              </button>
            </>
          )}
        </div>
      )}

      {list.length===0 && (
        <div style={{textAlign:"center",padding:"2.5rem 0",color:"#9E9E9E"}}>
          <div style={{fontSize:28,marginBottom:8}}>✅</div>
          <div style={{fontSize:13}}>{t.feedbackNoPending}</div>
        </div>
      )}

      {list.map(f => {
        const course = getCourse(f.courseId);
        const teacher = getUser(f.teacherId);
        const student = getUser(f.studentId);
        const meta = STATUS_META[f.status];
        return (
          <div key={f.id} style={{background:selected.has(f.id)?"#EEF6FB":"#FFFFFF",border:`1px solid ${selected.has(f.id)?"#1A6B8A":meta.color+"33"}`,borderRadius:10,padding:"14px 16px",marginBottom:10,display:"flex",gap:10}}>
            {f.status==="pending" && (
              <input type="checkbox" checked={selected.has(f.id)} onChange={()=>toggleSel(f.id)} style={{marginTop:2,cursor:"pointer",flexShrink:0}}/>
            )}
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10,marginBottom:8,flexWrap:"wrap"}}>
                <div>
                  <div style={{fontWeight:600,fontSize:13,color:"#172F39"}}>{course?.subject||"—"}</div>
                  <div style={{fontSize:11,color:"#9E9E9E",marginTop:2}}>
                    {t.feedbackDate}: {f.date} ({T[lang].days[f.dayIndex]}) · #{f.sessionNo}
                  </div>
                  <div style={{fontSize:11,color:"#546E7A",marginTop:2}}>
                    {t.feedbackBy}: <strong>{teacher?.name||"—"}</strong> → {t.feedbackFor}: <strong>{student?.name||"—"}</strong>
                  </div>
                </div>
                <span style={{fontSize:11,background:meta.bg,color:meta.color,borderRadius:5,padding:"3px 10px",fontWeight:600,flexShrink:0}}>● {meta.label}</span>
              </div>
              <div style={{background:"#F5F5F5",borderRadius:8,padding:"10px 13px",fontSize:13,color:"#172F39",lineHeight:1.7,whiteSpace:"pre-wrap",marginBottom:10}}>
                {f.text}
              </div>
              {f.status==="rejected" && f.reviewNote && (
                <div style={{fontSize:11,color:"#D32F2F",marginBottom:10}}>↳ {t.feedbackRejectReason.split("（")[0].split("(")[0]}: {f.reviewNote}</div>
              )}
              {f.status==="pending" && (
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>approve(f)} style={{flex:1,background:"#2E7D32",border:"none",borderRadius:7,color:"#fff",padding:"8px",fontSize:13,fontWeight:600,cursor:"pointer"}}>
                    ✓ {t.feedbackApprove}
                  </button>
                  <button onClick={()=>openReject(f)} style={{flex:1,background:"transparent",border:"1px solid #D32F2F",borderRadius:7,color:"#D32F2F",padding:"8px",fontSize:13,fontWeight:600,cursor:"pointer"}}>
                    ✕ {t.feedbackReject}
                  </button>
                </div>
              )}
              {f.status!=="pending" && (
                <button onClick={()=>setFeedback(prev=>prev.map(x=>x.id===f.id?{...x,status:"pending",reviewedAt:"",reviewedBy:"",reviewNote:""}:x))} style={{fontSize:11,padding:"5px 12px",borderRadius:5,border:"0.5px solid #CFD8DC",background:"transparent",color:"#546E7A",cursor:"pointer"}}>
                  {lang==="zh"?"重新送審":"Re-open for review"}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Batch Feedback Input (admin fills in on behalf of teacher) ──────────────
// Paste Excel data (Date, Comments/Suggestions/New Vocabulary Sentence) for a
// chosen course. Each row's date is matched against that course's scheduled
// sessions (across all its enrollments); matched rows are imported and
// approved immediately since the admin is entering/reviewing them directly.
function normalizeFeedbackDate(str) {
  const s = (str||"").trim().replace(/\//g, "-");
  const m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (!m) return null;
  const [, y, mo, d] = m;
  return `${y}-${mo.padStart(2,"0")}-${d.padStart(2,"0")}`;
}

function BatchFeedbackModal({ users, courses, enrollments, setFeedback, lang, setToast, onClose }) {
  const t = T[lang];
  const [courseId, setCourseId] = useState(courses[0]?.id || "");
  const [pasteText, setPasteText] = useState("");
  const [parsed, setParsed] = useState([]); // [{date, text, match: {enrollment,session} | null}]
  const [selected, setSelected] = useState(new Set());

  const course = courses.find(c=>c.id===courseId);
  const teacher = course ? users.find(u=>u.id===course.teacherId) : null;
  const student = course ? users.find(u=>u.id===course.studentId) : null;
  const courseEnrollments = course ? enrollments.filter(e=>e.courseId===course.id) : [];

  const findMatch = (dateStr) => {
    for (const enr of courseEnrollments) {
      const s = (enr.scheduledDates||[]).find(sd=>sd.date===dateStr);
      if (s) return {enrollment: enr, session: s};
    }
    return null;
  };

  const parseExcel = () => {
    const rows = pasteText.trim().split(/\r?\n/).map(row=>row.split(/\t/).map(c=>c.trim()));
    const result = rows
      .filter(r => r.length>=2 && r[0] && r[1])
      .map(r => {
        const date = normalizeFeedbackDate(r[0]);
        return { rawDate:r[0], date, text:r.slice(1).join(" ").trim(), match: date ? findMatch(date) : null };
      })
      // Drop the header row if present (e.g. "Date" doesn't normalize to a real date)
      .filter(r => r.date !== null || r.rawDate.toLowerCase() !== "date");
    setParsed(result);
    setSelected(new Set(result.map((_,i)=>i).filter(i=>result[i].match)));
  };

  const toggleSel = (i) => setSelected(s=>{const n=new Set(s); n.has(i)?n.delete(i):n.add(i); return n;});

  const doImport = () => {
    const now = new Date().toISOString();
    const newRecs = [];
    parsed.forEach((row, i) => {
      if (!selected.has(i) || !row.match) return;
      const {enrollment, session} = row.match;
      newRecs.push({
        id: genId(),
        enrollmentId: enrollment.id,
        courseId: course.id,
        studentId: course.studentId,
        teacherId: course.teacherId,
        date: row.date,
        dayIndex: session.dayIndex,
        sessionNo: session.sessionNo,
        text: row.text,
        status: "approved", // admin is entering + implicitly reviewing on the teacher's behalf
        createdAt: now, updatedAt: now,
        reviewedAt: now, reviewedBy: "admin",
      });
    });
    if (!newRecs.length) return;
    setFeedback(prev => {
      // Replace any existing feedback for the same enrollment+date, otherwise append
      const keys = new Set(newRecs.map(r=>r.enrollmentId+"|"+r.date));
      const kept = prev.filter(f => !keys.has(f.enrollmentId+"|"+f.date));
      return [...kept, ...newRecs];
    });
    setToast(t.feedbackImportDone.replace("{n}", newRecs.length));
    setParsed([]); setPasteText(""); onClose();
  };

  const iStyle = {width:"100%",boxSizing:"border-box",padding:"8px 10px",borderRadius:6,border:"0.5px solid #CFD8DC",background:"#FFFFFF",color:"#172F39",fontSize:13};
  const matchedCount = parsed.filter(r=>r.match).length;

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"flex-start",justifyContent:"center",zIndex:9300,padding:"1rem",overflowY:"auto"}}>
      <div style={{background:"#FFFFFF",borderRadius:16,width:"100%",maxWidth:640,boxSizing:"border-box",boxShadow:"0 8px 40px rgba(23,47,57,0.2)",marginTop:"2rem",marginBottom:"2rem"}}>
        <div style={{background:"#172F39",padding:"14px 20px",borderRadius:"16px 16px 0 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:15,fontWeight:600,color:"#fff"}}>📋 {t.feedbackBatchInput}</span>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.15)",border:"none",borderRadius:"50%",width:28,height:28,cursor:"pointer",color:"#fff",fontSize:16}}>×</button>
        </div>
        <div style={{padding:"18px 20px"}}>
          <p style={{fontSize:12,color:"#9E9E9E",margin:"0 0 14px",lineHeight:1.6}}>{t.feedbackBatchInputDesc}</p>

          {/* Course selector */}
          <label style={{fontSize:12,color:"#546E7A",display:"block",marginBottom:5}}>{t.feedbackSelectCourse}</label>
          <select style={{...iStyle,marginBottom:8}} value={courseId} onChange={e=>{setCourseId(e.target.value);setParsed([]);setPasteText("");}}>
            {courses.map(c=>{
              const s = users.find(u=>u.id===c.studentId);
              const te = users.find(u=>u.id===c.teacherId);
              return <option key={c.id} value={c.id}>{c.subject} ({te?.name} → {s?.name})</option>;
            })}
          </select>
          {course && (
            <div style={{fontSize:11,color:"#9E9E9E",marginBottom:14}}>
              {lang==="zh"?"老師":"Teacher"}: {teacher?.name||"—"} · {lang==="zh"?"學生":"Student"}: {student?.name||"—"} · {lang==="zh"?"排課紀錄":"Enrollments"}: {courseEnrollments.length}
            </div>
          )}

          {/* Paste area */}
          <p style={{fontSize:12,color:"#546E7A",margin:"0 0 8px",lineHeight:1.6}}>{t.feedbackPasteHint}</p>
          <div style={{fontSize:11,background:"#E3F2FD",color:"#1565C0",borderRadius:5,padding:"5px 10px",marginBottom:10,fontFamily:"monospace"}}>{t.feedbackExcelCols}</div>
          <textarea
            value={pasteText}
            onChange={e=>setPasteText(e.target.value)}
            placeholder={lang==="zh"?"在此貼上從 Excel 複製的內容…":"Paste Excel content here…"}
            style={{...iStyle,height:130,resize:"vertical",fontFamily:"monospace",lineHeight:1.5}}
          />
          <div style={{display:"flex",gap:8,marginTop:10}}>
            <button onClick={parseExcel} disabled={!pasteText.trim()||!course} style={{padding:"8px 18px",borderRadius:7,background:(pasteText.trim()&&course)?"#1A6B8A":"#E0E0E0",border:"none",color:(pasteText.trim()&&course)?"#fff":"#9E9E9E",fontSize:13,cursor:(pasteText.trim()&&course)?"pointer":"not-allowed"}}>
              🔍 {t.feedbackParseRows}
            </button>
            <button onClick={()=>{setPasteText("");setParsed([]);}} style={{padding:"8px 14px",borderRadius:7,background:"transparent",border:"0.5px solid #CFD8DC",color:"#546E7A",fontSize:13,cursor:"pointer"}}>{t.cancel}</button>
          </div>

          {/* Preview */}
          {parsed.length>0 && (
            <div style={{marginTop:"1.25rem"}}>
              <div style={{fontSize:13,fontWeight:500,color:"#172F39",marginBottom:8}}>
                {t.parsedPreview} — {parsed.length} {lang==="zh"?"筆":"rows"} ({matchedCount} {t.feedbackMatched})
              </div>
              <div style={{maxHeight:320,overflowY:"auto",borderRadius:8,border:"0.5px solid #E0E0E0"}}>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead style={{background:"#F5F5F5",position:"sticky",top:0}}>
                    <tr>
                      <th style={{width:36,padding:"7px 8px"}}>
                        <input type="checkbox" checked={selected.size===matchedCount&&matchedCount>0} onChange={()=>{
                          if (selected.size===matchedCount) setSelected(new Set());
                          else setSelected(new Set(parsed.map((_,i)=>i).filter(i=>parsed[i].match)));
                        }} style={{cursor:"pointer"}}/>
                      </th>
                      <th style={{fontSize:11,fontWeight:600,color:"#546E7A",padding:"7px 8px",textAlign:"left"}}>{lang==="zh"?"日期":"Date"}</th>
                      <th style={{fontSize:11,fontWeight:600,color:"#546E7A",padding:"7px 8px",textAlign:"left"}}>{lang==="zh"?"內容":"Text"}</th>
                      <th style={{fontSize:11,fontWeight:600,color:"#546E7A",padding:"7px 8px",textAlign:"left"}}>{lang==="zh"?"狀態":"Status"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsed.map((row,i)=>(
                      <tr key={i} style={{background:selected.has(i)?"rgba(26,107,138,0.05)":"transparent",borderTop:"0.5px solid #F0F0F0"}}>
                        <td style={{padding:"7px 8px"}}>
                          <input type="checkbox" checked={selected.has(i)} onChange={()=>toggleSel(i)} disabled={!row.match} style={{cursor:row.match?"pointer":"not-allowed"}}/>
                        </td>
                        <td style={{fontSize:12,color:"#172F39",padding:"7px 8px",whiteSpace:"nowrap"}}>{row.date||row.rawDate}{row.match?` (#${row.match.session.sessionNo})`:""}</td>
                        <td style={{fontSize:12,color:"#546E7A",padding:"7px 8px",maxWidth:260,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}} title={row.text}>{row.text}</td>
                        <td style={{padding:"7px 8px"}}>
                          {row.match
                            ? <span style={{fontSize:10,background:"#E8F5E9",color:"#2E7D32",borderRadius:4,padding:"2px 7px"}}>✓ {t.feedbackMatched}</span>
                            : <span style={{fontSize:10,background:"#FFEBEE",color:"#D32F2F",borderRadius:4,padding:"2px 7px"}}>{t.feedbackNoMatch}</span>
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button onClick={doImport} disabled={selected.size===0} style={{marginTop:12,padding:"9px 20px",borderRadius:7,background:selected.size>0?"#2E7D32":"#E0E0E0",border:"none",color:selected.size>0?"#fff":"#9E9E9E",fontSize:13,fontWeight:600,cursor:selected.size>0?"pointer":"not-allowed"}}>
                ✓ {t.feedbackImport} ({selected.size})
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Site Settings (admin-editable login page intro text) ────────────────────
function SiteSettings({ introText, setIntroText, lang, setToast }) {
  const [draft, setDraft] = useState(introText||"");
  useEffect(()=>{ setDraft(introText||""); }, [introText]);
  const dirty = draft !== (introText||"");
  const save = () => {
    setIntroText(draft);
    setToast(lang==="zh"?"已儲存":"Saved");
  };
  return (
    <div>
      <h3 style={{fontSize:15,fontWeight:600,color:"#172F39",margin:"0 0 4px"}}>{lang==="zh"?"登入頁介紹文字":"Login Page Intro Text"}</h3>
      <p style={{fontSize:12,color:"#9E9E9E",margin:"0 0 12px"}}>
        {lang==="zh"
          ? "顯示在登入頁標題下方的一小段文字（例如公告、上課須知）。留空則不顯示。"
          : "A short block of text shown below the title on the login page (e.g. announcements). Leave empty to hide it."}
      </p>
      <textarea
        value={draft}
        onChange={e=>setDraft(e.target.value)}
        rows={5}
        placeholder={lang==="zh"?"例如：歡迎來到 ES 課程平台！本週上課請提前 10 分鐘登入。":"e.g. Welcome! Please log in 10 minutes before class."}
        style={{width:"100%",boxSizing:"border-box",padding:"10px 12px",borderRadius:8,border:"0.5px solid #CFD8DC",background:"#FFFFFF",color:"#172F39",fontSize:13,lineHeight:1.6,resize:"vertical",fontFamily:"inherit"}}
      />
      <div style={{display:"flex",gap:8,marginTop:10,alignItems:"center"}}>
        <button onClick={save} disabled={!dirty} style={{padding:"8px 20px",borderRadius:7,background:dirty?"#1A6B8A":"#E0E0E0",border:"none",color:dirty?"#fff":"#9E9E9E",fontSize:13,fontWeight:500,cursor:dirty?"pointer":"not-allowed"}}>
            {lang==="zh"?"儲存":"Save"}
          </button>
        {dirty && <span style={{fontSize:11,color:"#E65100"}}>{lang==="zh"?"尚未儲存":"Unsaved changes"}</span>}
      </div>
    </div>
  );
}

// ─── Login ────────────────────────────────────────────────────────────────────
function LoginPage({ onLogin, lang, setLang, users, introText }) {
  const t=T[lang];
  const [u,setU]=useState("");const [p,setP]=useState("");const [err,setErr]=useState("");
  const go=()=>{const f=users.find(x=>x.username===u&&x.password===p);if(f){setErr("");onLogin(f);}else setErr(t.loginError);};
  return (
    <div style={{minHeight:"100vh",background:"#172F39",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"system-ui, -apple-system, sans-serif",padding:"2rem"}}>
      <button onClick={()=>setLang(lang==="zh"?"en":"zh")} style={{position:"absolute",top:"1.5rem",right:"1.5rem",background:"rgba(26,107,138,0.15)",border:"1px solid rgba(26,107,138,0.4)",color:"#1A6B8A",borderRadius:"6px",padding:"6px 14px",cursor:"pointer",fontSize:"13px"}}>{t.langToggle}</button>
      <div style={{marginBottom:"1.25rem",textAlign:"center"}}>
        <div style={{width:56,height:56,borderRadius:14,background:"#1A6B8A",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 1rem",fontSize:26}}>📚</div>
        <h1 style={{color:"#FFFFFF",fontSize:22,fontWeight:500,margin:0}}>{t.appName}</h1>
      </div>

      {/* ── Admin-editable intro / announcement block ── */}
      {introText && introText.trim() && (
        <div style={{maxWidth:420,width:"100%",textAlign:"center",color:"rgba(255,255,255,0.75)",fontSize:13,lineHeight:1.7,marginBottom:"1.5rem",padding:"0 1rem",whiteSpace:"pre-wrap"}}>
          {introText}
        </div>
      )}

      {/* ── Login card — shrunk ~20% and shifted down relative to the title/intro above ── */}
      <div style={{background:"#FFFFFF",borderRadius:13,border:"1px solid rgba(26,107,138,0.25)",boxShadow:"0 4px 24px rgba(23,47,57,0.15)",padding:"1.6rem",width:"100%",maxWidth:288,marginTop:"0.5rem"}}>
        <div style={{marginBottom:"0.8rem"}}>
          <label style={{display:"block",fontSize:11,color:"#546E7A",marginBottom:5}}>{t.username}</label>
          <input value={u} onChange={e=>setU(e.target.value)} onKeyDown={e=>e.key==="Enter"&&go()} style={{width:"100%",boxSizing:"border-box",background:"#FAFAFA",border:"1px solid rgba(26,107,138,0.25)",borderRadius:7,color:"#172F39",padding:"8px 10px",fontSize:12,outline:"none"}}/>
        </div>
        <div style={{marginBottom:"1.2rem"}}>
          <label style={{display:"block",fontSize:11,color:"#546E7A",marginBottom:5}}>{t.password}</label>
          <input type="password" value={p} onChange={e=>setP(e.target.value)} onKeyDown={e=>e.key==="Enter"&&go()} style={{width:"100%",boxSizing:"border-box",background:"#FAFAFA",border:"1px solid rgba(26,107,138,0.25)",borderRadius:7,color:"#172F39",padding:"8px 10px",fontSize:12,outline:"none"}}/>
        </div>
        {err&&<p style={{color:"#F0A0A0",fontSize:11,margin:"0 0 0.8rem",textAlign:"center"}}>{err}</p>}
        <button onClick={go} style={{width:"100%",background:"#1A6B8A",border:"none",borderRadius:7,color:"#fff",padding:"9px",fontSize:13,fontWeight:500,cursor:"pointer"}}>{t.loginBtn}</button>
        <p style={{color:"rgba(255,255,255,0.5)",fontSize:10,textAlign:"center",marginTop:"0.8rem",marginBottom:0}}>admin/admin123 · teacher1/pass123 · student1/pass123</p>
      </div>
    </div>
  );
}

// ─── Medal / Progress helpers ─────────────────────────────────────────────────
const MEDALS = [
  { key:"bronze",   zh:"銅牌", en:"Bronze",   sessions:40,   color:"#CD7F32", bg:"#FFF3E0", glow:"rgba(205,127,50,0.3)",  icon:"🥉" },
  { key:"silver",   zh:"銀牌", en:"Silver",   sessions:160,  color:"#9E9E9E", bg:"#F5F5F5", glow:"rgba(158,158,158,0.3)", icon:"🥈" },
  { key:"gold",     zh:"金牌", en:"Gold",     sessions:400,  color:"#FFC107", bg:"#FFFDE7", glow:"rgba(255,193,7,0.35)",  icon:"🥇" },
  { key:"platinum", zh:"白金", en:"Platinum", sessions:760,  color:"#1A6B8A", bg:"#E3F2FD", glow:"rgba(26,107,138,0.3)",  icon:"💎" },
  { key:"diamond",  zh:"鑽石", en:"Diamond",  sessions:1240, color:"#7B1FA2", bg:"#F3E5F5", glow:"rgba(123,31,162,0.35)", icon:"💠" },
];

// 25-min class = 1 session, 50-min class = 2 sessions (no fractions)
// confirmedOverride: if set by admin, use this as the total instead of calculating
function calcStudentSessions(studentId, enrollments, attendance, courses, confirmedOverride) {
  if (confirmedOverride !== undefined && confirmedOverride !== null && confirmedOverride !== "") {
    const c = parseInt(confirmedOverride)||0;
    return { full: c, half: 0, total: c };
  }
  const today = new Date().toISOString().slice(0,10);
  let count = 0;
  enrollments.filter(e=>e.studentId===studentId).forEach(enr=>{
    const course = courses.find(c=>c.id===enr.courseId);
    if (!course) return;
    const sessVal = course.duration===25 ? 1 : 2; // 25min=1, 50min=2
    (enr.scheduledDates||[]).forEach(s=>{
      // Only count sessions whose actual end time has passed (not just "today or earlier")
      if (!isSessionOver(s.date, course.start, course.duration)) return;
      const att = attendance.find(a=>a.enrollmentId===enr.id&&a.date===s.date);
      if (att?.type==="absent") return; // deducted
      count += sessVal;
    });
  });
  // full = total count, half = 0 (kept for API compat), total = count
  return { full: count, half: 0, total: count };
}

function getMedalInfo(totalFloat) {
  let current = null, next = null;
  for (let i = MEDALS.length-1; i >= 0; i--) {
    if (totalFloat >= MEDALS[i].sessions) { current = MEDALS[i]; next = MEDALS[i+1]||null; break; }
  }
  if (!current) { current = null; next = MEDALS[0]; }
  return { current, next };
}

// ─── Student Progress Panel ───────────────────────────────────────────────────
function StudentProgressPanel({ currentUser, enrollments, attendance, courses, lang, dirLoaded, confirmedOverride }) {
  const t = T[lang];

  // Don't render any numbers until we know whether admin has confirmed an
  // official session count — prevents a flash of the "unofficial" number
  // before the correct (admin-confirmed) one is available.
  if (!dirLoaded) {
    return (
      <div style={{padding:"1.25rem 1rem",textAlign:"center",color:"#9E9E9E"}}>
        <div style={{fontSize:32,marginBottom:8}}>⏳</div>
        <div style={{fontSize:13}}>{lang==="zh"?"載入中…":"Loading…"}</div>
      </div>
    );
  }

  const { full, half, total } = calcStudentSessions(currentUser.id, enrollments, attendance, courses, confirmedOverride);
  const { current, next } = getMedalInfo(total);

  // Progress toward next medal
  const prevThreshold = current ? current.sessions : 0;
  const nextThreshold = next ? next.sessions : null;
  const progressInTier = total - prevThreshold;
  const tierSize = nextThreshold ? nextThreshold - prevThreshold : 1;
  const pct = nextThreshold ? Math.min(100, Math.round((progressInTier / tierSize) * 100)) : 100;
  const sessToNext = nextThreshold ? Math.ceil(nextThreshold - total) : 0;

  const medal = current || { key:"none", zh:"尚無獎牌", en:"No medal yet", color:"#9E9E9E", bg:"#F5F5F5", glow:"none", icon:"🎯" };
  const displayLabel = lang==="zh" ? medal.zh : medal.en;
  const nextLabel = next ? (lang==="zh" ? next.zh : next.en) : null;

  // full = total POINTS (25min class → 1pt, 50min class → 2pt), half is always 0 now
  const sessCount = full; // clean alias
  const ptLabel = lang==="zh" ? "點" : "pt";

  return (
    <div style={{padding:"1.25rem 1rem"}}>
      {/* Medal badge */}
      <div style={{textAlign:"center",marginBottom:"1.5rem"}}>
        <div style={{fontSize:52,marginBottom:4,filter:`drop-shadow(0 0 8px ${medal.glow})`}}>{medal.icon}</div>
        <div style={{fontSize:18,fontWeight:700,color:medal.color,marginBottom:2}}>{displayLabel}</div>
        {current && <div style={{fontSize:11,color:"#9E9E9E"}}>{lang==="zh"?"目前等級":"Current Tier"}</div>}
      </div>

      {/* Points total — clean display */}
      <div style={{background:medal.bg,borderRadius:12,padding:"14px 16px",marginBottom:"1rem",textAlign:"center",border:`1px solid ${medal.color}33`}}>
        <div style={{fontSize:11,color:medal.color,fontWeight:500,marginBottom:6,opacity:0.8,letterSpacing:"0.05em",textTransform:"uppercase"}}>
          {lang==="zh"?"累積積分":"Total Points"}
        </div>
        {<div>
            <span style={{fontSize:36,fontWeight:800,color:medal.color}}>{full}</span>
            <span style={{fontSize:16,color:medal.color,opacity:0.7,marginLeft:4}}>{ptLabel}</span>
          </div>}
      </div>

      {/* ── Points rule explainer — beautified ── */}
      <div style={{display:"flex",gap:10,alignItems:"center",background:"#F5F5F5",borderRadius:10,padding:"10px 12px",marginBottom:"1.25rem",border:"0.5px solid #E0E0E0"}}>
        <div style={{display:"flex",gap:6,flexShrink:0}}>
          <div style={{width:26,height:26,borderRadius:"50%",background:"#E3F2FD",color:"#1A6B8A",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700}}>1</div>
          <div style={{width:26,height:26,borderRadius:"50%",background:"#EDE7F6",color:"#7B1FA2",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700}}>2</div>
        </div>
        <div style={{fontSize:11,color:"#546E7A",lineHeight:1.5}}>
          {lang==="zh"
            ? <>每 <strong style={{color:"#172F39"}}>25 分鐘</strong>課堂 = <strong style={{color:"#1A6B8A"}}>1 點</strong>；每 <strong style={{color:"#172F39"}}>50 分鐘</strong>課堂 = <strong style={{color:"#7B1FA2"}}>2 點</strong></>
            : <>Every <strong style={{color:"#172F39"}}>25-min</strong> class = <strong style={{color:"#1A6B8A"}}>1 pt</strong> · Every <strong style={{color:"#172F39"}}>50-min</strong> class = <strong style={{color:"#7B1FA2"}}>2 pts</strong></>
          }
        </div>
      </div>

      {/* Next medal progress */}
      {next && (
        <div style={{marginBottom:"1.25rem"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
            <span style={{fontSize:12,color:"#546E7A",fontWeight:500}}>
              {lang==="zh"?`距離 ${nextLabel} 還差`:`${sessToNext} more to ${nextLabel}`}
            </span>
            <span style={{fontSize:12,fontWeight:700,color:next.color}}>
              {lang==="zh"?`${sessToNext} 點！`:""}
            </span>
          </div>
          {/* Progress bar */}
          <div style={{background:"#E0E0E0",borderRadius:99,height:10,overflow:"hidden",marginBottom:4}}>
            <div style={{width:`${pct}%`,height:"100%",borderRadius:99,background:`linear-gradient(90deg, ${medal.color}, ${next.color})`,transition:"width 0.6s ease"}}/>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#9E9E9E"}}>
            <span>{current ? `${current.sessions}${ptLabel}` : "0"}</span>
            <span style={{color:next.color,fontWeight:600}}>{pct}%</span>
            <span>{next.sessions}{ptLabel}</span>
          </div>
          {/* Motivational nudge */}
          {sessToNext <= 10 && (
            <div style={{marginTop:8,background:`${next.color}15`,border:`1px solid ${next.color}44`,borderRadius:7,padding:"7px 10px",fontSize:12,color:next.color,fontWeight:500,textAlign:"center"}}>
              🔥 {lang==="zh"?`只差 ${sessToNext} 點就能達到 ${nextLabel}！衝！`:`Only ${sessToNext} more to ${nextLabel}! Keep going!`}
            </div>
          )}
          {sessToNext > 10 && sessToNext <= 30 && (
            <div style={{marginTop:8,background:`${next.color}10`,border:`1px solid ${next.color}33`,borderRadius:7,padding:"7px 10px",fontSize:12,color:next.color,textAlign:"center"}}>
              💪 {lang==="zh"?`再 ${sessToNext} 點達到 ${nextLabel}！`:`${sessToNext} points away from ${nextLabel}!`}
            </div>
          )}
        </div>
      )}

      {/* Next tier only (no full roadmap for students) */}
      {next ? (
        <div style={{borderTop:"0.5px solid #E0E0E0",paddingTop:"1rem"}}>
          <div style={{fontSize:11,color:"#9E9E9E",fontWeight:500,marginBottom:8,letterSpacing:"0.04em"}}>{lang==="zh"?"下一階":"NEXT TIER"}</div>
          <div style={{display:"flex",alignItems:"center",gap:10,background:next.bg,border:`1px solid ${next.color}44`,borderRadius:10,padding:"10px 12px"}}>
            <span style={{fontSize:24,flexShrink:0,opacity:0.6}}>{next.icon}</span>
            <div style={{flex:1}}>
              <span style={{fontSize:13,fontWeight:600,color:next.color}}>{lang==="zh"?next.zh:next.en}</span>
              <span style={{fontSize:11,color:"#9E9E9E",marginLeft:6}}>{next.sessions}{ptLabel}</span>
            </div>
          </div>
        </div>
      ) : (
        <div style={{borderTop:"0.5px solid #E0E0E0",paddingTop:"1rem",textAlign:"center"}}>
          <div style={{fontSize:12,color:"#7B1FA2",fontWeight:600}}>{lang==="zh"?"🎉 已達最高等級！":"🎉 You've reached the top tier!"}</div>
        </div>
      )}
    </div>
  );
}

// ─── Teacher Students Panel ───────────────────────────────────────────────────
function TeacherStudentsPanel({ currentUser, users, courses, enrollments, attendance, lang, dirEntries }) {
  const t = T[lang];
  const [expandedId, setExpandedId] = useState(null);

  const myCourses = courses.filter(c=>c.teacherId===currentUser.id);
  const myStudentIds = [...new Set(myCourses.map(c=>c.studentId).filter(Boolean))];
  const myStudents = myStudentIds.map(id=>users.find(u=>u.id===id)).filter(Boolean);

  const getDirEntry = (userId) => (dirEntries||[]).find(d=>d.linkedUserId===userId);

  return (
    <div style={{padding:"1rem"}}>
      <div style={{fontSize:12,fontWeight:600,color:"#546E7A",letterSpacing:"0.04em",marginBottom:12,padding:"0 4px"}}>
        {lang==="zh"?"任教學生":"MY STUDENTS"} ({myStudents.length})
      </div>
      {myStudents.length===0 && <p style={{fontSize:12,color:"#9E9E9E",textAlign:"center",padding:"1rem 0"}}>{lang==="zh"?"尚無學生":"No students yet"}</p>}
      {myStudents.map(stu=>{
        const dir = getDirEntry(stu.id);
        const isExpanded = expandedId===stu.id;
        const stuCourses = myCourses.filter(c=>c.studentId===stu.id);
        const confirmedOverride = dir?.confirmedSessions || null;
        const {full,half,total} = calcStudentSessions(stu.id, enrollments, attendance, courses, confirmedOverride);
        const {current:medal} = getMedalInfo(total);
        const weeklyCount = stuCourses.reduce((s,c)=>(c.days?.length||0)+s, 0);
        const duration = stuCourses[0]?.duration || "—";

        return (
          <div key={stu.id} style={{background:"#FFFFFF",border:"0.5px solid #E0E0E0",borderRadius:10,marginBottom:8,overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
            {/* Card header — always visible */}
            <button onClick={()=>setExpandedId(isExpanded?null:stu.id)} style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:"transparent",border:"none",cursor:"pointer",textAlign:"left"}}>
              <div style={{width:32,height:32,borderRadius:"50%",background:medal?medal.bg:"#F5F5F5",border:`1.5px solid ${medal?medal.color:"#E0E0E0"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>
                {medal?medal.icon:"👤"}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:500,color:"#172F39",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{stu.name}</div>
                <div style={{fontSize:10,color:"#9E9E9E",marginTop:1,display:"flex",gap:6,alignItems:"center"}}>
                  {medal&&<span style={{color:medal.color,fontWeight:600}}>{lang==="zh"?medal.zh:medal.en}</span>}
                  <span>{full}{lang==="zh"?"點":"pt"}</span>
                </div>
              </div>
              <span style={{fontSize:11,color:"#CFD8DC",transform:isExpanded?"rotate(90deg)":"rotate(0deg)",transition:"transform 0.2s",flexShrink:0}}>▶</span>
            </button>

            {/* Expanded details */}
            {isExpanded && (
              <div style={{borderTop:"0.5px solid #F0F0F0",padding:"10px 12px",background:"#FAFAFA"}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px 12px"}}>
                  {[
                    {label:lang==="zh"?"英文姓名":"English", val:dir?.nameEn||stu.name},
                    {label:lang==="zh"?"中文姓名":"Chinese",  val:dir?.nameCn||"—"},
                    {label:lang==="zh"?"年齡":"Age",          val: dir ? fmtAge(dir.age, dir.regYear, lang) : "—"},
                    {label:lang==="zh"?"課程長度":"Duration",  val:duration?(duration+" min"):"—"},
                    {label:lang==="zh"?"每週堂數":"Per Week",  val:weeklyCount?(weeklyCount+(lang==="zh"?"堂":"x")):"—"},
                    {label:lang==="zh"?"累積積分":"Points",   val:full+(lang==="zh"?"點":"pt")},
                  ].map(row=>(
                    <div key={row.label}>
                      <div style={{fontSize:9,color:"#9E9E9E",fontWeight:500,marginBottom:1,textTransform:"uppercase",letterSpacing:"0.04em"}}>{row.label}</div>
                      <div style={{fontSize:12,color:"#172F39",fontWeight:500}}>{row.val}</div>
                    </div>
                  ))}
                </div>
                {/* Medal progress mini-bar */}
                {(() => {
                  const {current:cm,next:nm}=getMedalInfo(total);
                  if (!nm) return null;
                  const prevT=cm?cm.sessions:0;
                  const pct2=Math.min(100,Math.round(((total-prevT)/(nm.sessions-prevT))*100));
                  const toNext=Math.ceil(nm.sessions-total);
                  return (
                    <div style={{marginTop:10}}>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#9E9E9E",marginBottom:3}}>
                        <span>{lang==="zh"?`距 ${nm?.[lang==="zh"?"zh":"en"]} 還差 ${toNext} 點`:`${toNext} to ${nm?.en}`}</span>
                        <span style={{color:nm.color,fontWeight:600}}>{pct2}%</span>
                      </div>
                      <div style={{background:"#E0E0E0",borderRadius:99,height:5,overflow:"hidden"}}>
                        <div style={{width:`${pct2}%`,height:"100%",borderRadius:99,background:`linear-gradient(90deg,${cm?cm.color:"#9E9E9E"},${nm.color})`}}/>
                      </div>
                    </div>
                  );
                })()}
                {/* Courses */}
                {stuCourses.map(c=>(
                  <div key={c.id} style={{marginTop:8,background:"#F0F4FF",borderRadius:6,padding:"6px 8px",fontSize:11,color:"#1A6B8A"}}>
                    {c.subject} · {c.days?.map(d=>T[lang].days[d]).join("、")} · {c.start}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Student Class History ────────────────────────────────────────────────────
// ─── Student Class History ────────────────────────────────────────────────────
function StudentClassHistory({ currentUser, enrollments, attendance, courses, users, lang, dirLoaded, feedback }) {
  const t = T[lang];
  const today = new Date().toISOString().slice(0,10);

  if (!dirLoaded) {
    return (
      <div style={{padding:"1.25rem",textAlign:"center",color:"#9E9E9E"}}>
        <div style={{fontSize:32,marginBottom:8}}>⏳</div>
        <div style={{fontSize:13}}>{lang==="zh"?"載入中…":"Loading…"}</div>
      </div>
    );
  }

  // Gather all past sessions for this student
  const myEnrollments = enrollments.filter(e=>e.studentId===currentUser.id);

  // Build session records: past sessions with status
  const sessions = [];
  myEnrollments.forEach(enr => {
    const course = courses.find(c=>c.id===enr.courseId);
    if (!course) return;
    const teacher = users.find(u=>u.id===course.teacherId);
    const sessVal = course.duration===25 ? 1 : 2;
    (enr.scheduledDates||[]).forEach(s => {
      const attRec = attendance.find(a=>a.enrollmentId===enr.id&&a.date===s.date);
      const status = attRec
        ? attRec.type   // "absent" | "excused" | "teacher_leave"
        : isSessionOver(s.date, course.start, course.duration) ? "completed" : "upcoming";
      sessions.push({
        date: s.date,
        dayIndex: s.dayIndex,
        sessionNo: s.sessionNo,
        course,
        teacher,
        enrollment: enr,
        attRec,
        status,
        sessVal,
      });
    });
  });

  // Sort newest first for history
  const past = sessions.filter(s=>s.status!=="upcoming").sort((a,b)=>b.date.localeCompare(a.date));
  const upcoming = sessions.filter(s=>s.status==="upcoming").sort((a,b)=>a.date.localeCompare(b.date));

  // ── Stats — anchored 1:1 to 付費與排課 (payment/enrollment) records ──
  // These are LITERAL session counts (no medal-style weighting, no admin
  // "confirmedSessions" override). totalPurchased = exactly what admin typed
  // into 付費與排課's 購買堂數 field. completedCount/absentCount are counted
  // directly from that same enrollment's scheduledDates, so the numbers are
  // guaranteed to reconcile: purchased = completed + absent + upcoming.
  const totalPurchased = myEnrollments.reduce((n,e)=>n+(e.totalSessions||0),0);
  const completedCount = past.filter(s=>s.status==="completed").length;
  const excusedCount   = past.filter(s=>s.status==="excused"||s.status==="teacher_leave").length;
  const absentCount    = past.filter(s=>s.status==="absent").length;
  // Remaining = purchased − everything already consumed (completed or absent).
  // Excused/teacher-leave sessions don't consume a slot — they get automatically
  // deferred to a later date by 付費與排課, so they're not subtracted here.
  const remainingCount = Math.max(0, totalPurchased - completedCount - absentCount);

  const STATUS_STYLE = {
    completed:     {bg:"#E8F5E9",color:"#2E7D32",label:lang==="zh"?"完課":"Done"},
    excused:       {bg:"#E3F2FD",color:"#1A6B8A",label:lang==="zh"?"正規請假":"Leave"},
    teacher_leave: {bg:"#FFF8E1",color:"#E65100",label:lang==="zh"?"老師假":"T.Leave"},
    absent:        {bg:"#FFEBEE",color:"#D32F2F",label:lang==="zh"?"缺勤":"Absent"},
  };

  const DAYS_ZH = ["週一","週二","週三","週四","週五","週六","週日"];
  const DAYS_EN = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const dayLabel = (i) => lang==="zh" ? DAYS_ZH[i] : DAYS_EN[i];

  // Group past sessions by year-month for section headers
  const grouped = {};
  past.forEach(s => {
    const ym = s.date.slice(0,7);
    if (!grouped[ym]) grouped[ym]=[];
    grouped[ym].push(s);
  });
  const months = Object.keys(grouped).sort((a,b)=>b.localeCompare(a));

  return (
    <div style={{padding:"1.25rem"}}>
      {/* ── Summary cards ── */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:10,marginBottom:"1.5rem"}}>
        {[
          {icon:"✅",label:lang==="zh"?"已完課堂":  "Completed",  val:completedCount,    color:"#2E7D32",bg:"#E8F5E9"},
          {icon:"⏳",label:lang==="zh"?"剩餘課堂":  "Remaining",  val:remainingCount,    color:"#1A6B8A",bg:"#E3F2FD"},
          {icon:"📦",label:lang==="zh"?"購買總堂":  "Purchased",  val:totalPurchased,    color:"#546E7A",bg:"#F5F5F5"},
          {icon:"📋",label:lang==="zh"?"正規請假":  "Excused",    val:excusedCount,      color:"#E65100",bg:"#FFF8E1"},
          {icon:"❌",label:lang==="zh"?"缺勤扣課":  "Absent",     val:absentCount,       color:"#D32F2F",bg:"#FFEBEE"},
        ].map(c=>(
          <div key={c.label} style={{background:c.bg,borderRadius:10,padding:"12px 14px",textAlign:"center",border:`1px solid ${c.color}22`}}>
            <div style={{fontSize:20,marginBottom:4}}>{c.icon}</div>
            <div style={{fontSize:22,fontWeight:800,color:c.color}}>{c.val}</div>
            <div style={{fontSize:11,color:c.color,opacity:0.8,marginTop:2}}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* ── Remaining sessions breakdown ── */}
      {upcoming.length>0 && (
        <div style={{background:"#F5F5F5",borderRadius:10,padding:"12px 14px",marginBottom:"1.5rem"}}>
          <div style={{fontSize:13,fontWeight:600,color:"#172F39",marginBottom:8}}>
            ⏳ {lang==="zh"?"即將上課（剩餘課堂）":"Upcoming Sessions (Remaining)"}
            <span style={{fontSize:11,fontWeight:400,color:"#9E9E9E",marginLeft:6}}>{lang==="zh"?`共 ${upcoming.length} 節`:`${upcoming.length} sessions`}</span>
          </div>
          <div style={{maxHeight:160,overflowY:"auto",display:"flex",flexDirection:"column",gap:5}}>
            {upcoming.slice(0,10).map((s,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:10,background:"#FFFFFF",borderRadius:7,padding:"7px 12px",border:"0.5px solid #E0E0E0"}}>
                <span style={{fontSize:11,color:"#9E9E9E",minWidth:18,textAlign:"right"}}>#{s.sessionNo}</span>
                <span style={{fontSize:12,fontWeight:600,color:"#172F39",minWidth:70}}>{s.date}</span>
                <span style={{fontSize:11,color:"#9E9E9E",minWidth:28}}>{dayLabel(s.dayIndex)}</span>
                <span style={{fontSize:11,color:"#546E7A",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.course.subject}</span>
                <span style={{fontSize:11,color:"#9E9E9E"}}>{s.course.start}</span>
                <span style={{fontSize:10,background:"rgba(26,107,138,0.1)",color:"#1A6B8A",borderRadius:4,padding:"1px 6px"}}>{s.sessVal===2?"50m":"25m"}</span>
              </div>
            ))}
            {upcoming.length>10&&<div style={{fontSize:11,color:"#9E9E9E",textAlign:"center",padding:"4px 0"}}>... {lang==="zh"?`還有 ${upcoming.length-10} 節`:`and ${upcoming.length-10} more`}</div>}
          </div>
        </div>
      )}

      {/* ── Past sessions history ── */}
      <div style={{fontSize:14,fontWeight:600,color:"#172F39",marginBottom:10}}>
        📋 {lang==="zh"?"完課紀錄":"Class History"}
        <span style={{fontSize:11,fontWeight:400,color:"#9E9E9E",marginLeft:6}}>{lang==="zh"?`共 ${past.length} 節`:`${past.length} sessions`}</span>
      </div>

      {past.length===0 && (
        <div style={{textAlign:"center",padding:"2rem 0",color:"#9E9E9E"}}>
          <div style={{fontSize:28,marginBottom:8}}>📭</div>
          <div style={{fontSize:13}}>{lang==="zh"?"尚無完課紀錄":"No class history yet"}</div>
        </div>
      )}

      {months.map(ym=>{
        const [yr,mo] = ym.split("-");
        const moLabel = lang==="zh"
          ? `${yr}年${parseInt(mo)}月`
          : new Date(ym+"-01").toLocaleDateString("en-US",{year:"numeric",month:"long"});
        const monthSessions = grouped[ym];
        const monthCompleted = monthSessions.filter(s=>s.status==="completed").reduce((n,s)=>n+s.sessVal,0);
        return (
          <div key={ym} style={{marginBottom:"1.25rem"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
              <span style={{fontSize:12,fontWeight:600,color:"#546E7A",whiteSpace:"nowrap"}}>{moLabel}</span>
              <div style={{flex:1,height:"0.5px",background:"#E0E0E0"}}/>
              <span style={{fontSize:11,color:"#4CAF50",whiteSpace:"nowrap"}}>✓ {monthCompleted} {lang==="zh"?"堂":""}</span>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:5}}>
              {monthSessions.map((s,i)=>{
                const st = STATUS_STYLE[s.status]||STATUS_STYLE.completed;
                const fbRec = (feedback||[]).find(f=>f.enrollmentId===s.enrollment.id && f.date===s.date && f.status==="approved");
                return (
                  <div key={i}>
                    <div style={{display:"flex",alignItems:"center",gap:8,background:"#FAFAFA",borderRadius:fbRec?"8px 8px 0 0":8,padding:"9px 12px",border:`0.5px solid ${s.status==="completed"?"#E8F5E9":"#F0F0F0"}`,borderBottom:fbRec?"none":undefined}}>
                      {/* Session no */}
                      <span style={{fontSize:10,color:"#9E9E9E",minWidth:22,textAlign:"right"}}>#{s.sessionNo}</span>
                      {/* Date */}
                      <div style={{minWidth:80}}>
                        <div style={{fontSize:12,fontWeight:600,color:"#172F39"}}>{s.date}</div>
                        <div style={{fontSize:10,color:"#9E9E9E"}}>{dayLabel(s.dayIndex)} {s.course.start}–{s.course.start?(()=>{const [h,m]=s.course.start.split(":").map(Number);const end=h*60+m+s.course.duration;return `${String(Math.floor(end/60)).padStart(2,"0")}:${String(end%60).padStart(2,"0")}`;})():""}</div>
                      </div>
                      {/* Course */}
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:12,color:"#172F39",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.course.subject}</div>
                        {s.teacher&&<div style={{fontSize:10,color:"#9E9E9E"}}>{s.teacher.name}</div>}
                      </div>
                      {/* Duration */}
                      <span style={{fontSize:10,color:"#9E9E9E",flexShrink:0}}>{s.course.duration}min</span>
                      {/* Sesion value */}
                      <span style={{fontSize:10,background:"rgba(26,107,138,0.08)",color:"#1A6B8A",borderRadius:4,padding:"1px 6px",flexShrink:0,fontWeight:500}}>+{s.sessVal}</span>
                      {/* Status */}
                      <span style={{fontSize:10,background:st.bg,color:st.color,borderRadius:4,padding:"2px 8px",fontWeight:500,flexShrink:0}}>{st.label}</span>
                      {/* Admin note */}
                      {s.attRec?.note&&<span style={{fontSize:10,color:"#9E9E9E",flexShrink:0}} title={s.attRec.note}>📝</span>}
                    </div>
                    {/* Approved teacher feedback — shown inline right under the session */}
                    {fbRec && (
                      <div style={{background:"#E8F5E9",border:"0.5px solid #C8E6C9",borderTop:"none",borderRadius:"0 0 8px 8px",padding:"9px 12px",fontSize:12,color:"#2E7D32",lineHeight:1.6,whiteSpace:"pre-wrap"}}>
                        <div style={{fontSize:10,fontWeight:700,color:"#2E7D32",marginBottom:3,letterSpacing:"0.03em"}}>💬 {t.feedbackFromTeacher}</div>
                        {fbRec.text}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Student / Teacher Layout (sidebar + main) ────────────────────────────────
function StudentTeacherLayout({ currentUser, users, courses, lang, absences, setAbsences, materials, setMaterials, enrollments, setEnrollments, attendance, setAttendance, setToast, feedback, setFeedback }) {
  const t = T[lang];
  const isStudent = currentUser.role==="student";
  const isTeacher = currentUser.role==="teacher";
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dirEntries, setDirEntries] = useState([]);
  const [dirLoaded, setDirLoaded] = useState(false);
  useEffect(()=>{
    (async()=>{
      try{ const r=await window.storage.get("cp3_student_dir"); if(r?.value) setDirEntries(JSON.parse(r.value)); }catch{}
      setDirLoaded(true);
    })();
  },[]);
  // The admin-confirmed official session count for the logged-in student (if any) —
  // this is the single source of truth used everywhere in the student's own views.
  const myDirEntry = dirEntries.find(d=>d.linkedUserId===currentUser.id);
  const myConfirmedOverride = myDirEntry?.confirmedSessions || null;
  // Student: "progress" | "schedule_side" — Teacher: "students" | "schedule_side"
  const [sideTab, setSideTab] = useState("schedule_side");

  const menuItems = isStudent
    ? [
        { key:"progress",      icon:"🏆", zh:"獎牌進度", en:"My Progress" },
        { key:"history",       icon:"📋", zh:"課程紀錄", en:"Class History"},
        { key:"schedule_side", icon:"📅", zh:"課表",     en:"Schedule"   },
      ]
    : [
        { key:"students",      icon:"👥", zh:"任教學生", en:"My Students" },
        { key:"schedule_side", icon:"📅", zh:"課表",     en:"Schedule"   },
      ];

  const sideHasSidebar = isStudent || isTeacher;

  return (
    <div style={{display:"flex",gap:0,alignItems:"flex-start",minHeight:"60vh"}}>
      {/* ── Sidebar ── */}
      {sideHasSidebar && (
        <div style={{flexShrink:0,transition:"width 0.2s",width:sidebarOpen?264:44,overflow:"hidden",position:"relative"}}>
          <button onClick={()=>setSidebarOpen(o=>!o)} title={sidebarOpen?"收起":"展開"} style={{position:"absolute",top:8,right:4,zIndex:10,background:"#FFFFFF",border:"0.5px solid #E0E0E0",borderRadius:6,width:28,height:28,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:"#1A6B8A",boxShadow:"0 1px 4px rgba(0,0,0,0.08)"}}>
            {sidebarOpen?"◀":"▶"}
          </button>

          <div style={{background:"#FFFFFF",border:"0.5px solid #E0E0E0",borderRadius:12,overflow:"hidden",minHeight:400,boxShadow:"0 2px 12px rgba(23,47,57,0.06)",width:264}}>
            {/* Header */}
            <div style={{background:"#172F39",padding:"13px 14px",display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:30,height:30,borderRadius:"50%",background:"#1A6B8A",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:600,color:"#fff",flexShrink:0}}>{currentUser.name.slice(0,2).toUpperCase()}</div>
              <div style={{overflow:"hidden"}}>
                <div style={{fontSize:13,fontWeight:500,color:"#FFFFFF",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{currentUser.name}</div>
                <div style={{fontSize:10,color:"rgba(255,255,255,0.6)"}}>{isStudent?t.role_student:t.role_teacher}</div>
              </div>
            </div>

            {/* Menu */}
            <div style={{padding:"6px 0"}}>
              {menuItems.map(item=>(
                <button key={item.key} onClick={()=>setSideTab(item.key)} style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:sideTab===item.key?"#EEF6FB":"transparent",border:"none",borderLeft:sideTab===item.key?"3px solid #1A6B8A":"3px solid transparent",color:sideTab===item.key?"#1A6B8A":"#546E7A",fontSize:13,cursor:"pointer",textAlign:"left"}}>
                  <span style={{fontSize:15,flexShrink:0}}>{item.icon}</span>
                  <span style={{fontWeight:sideTab===item.key?500:400}}>{lang==="zh"?item.zh:item.en}</span>
                </button>
              ))}
            </div>

            {/* Student: quick medal teaser when not on progress tab */}
            {isStudent && sideTab!=="progress" && dirLoaded && (()=>{
              // Medal number (top box) — the gamified, duration-weighted metric (unrelated to payment records)
              const {total:tot}=calcStudentSessions(currentUser.id,enrollments,attendance,courses,myConfirmedOverride);
              const {current,next}=getMedalInfo(tot);
              const medal=current||{icon:"🎯",zh:"努力中",en:"In Progress",color:"#9E9E9E",bg:"#F5F5F5"};
              const toNext=next?Math.ceil(next.sessions-tot):null;

              // "剩餘堂數" (bottom box) — literal, non-weighted count anchored 1:1 to
              // 付費與排課 payment records: purchased − (completed + absent).
              // Deliberately independent from the medal number above.
              const myEnr=enrollments.filter(e=>e.studentId===currentUser.id);
              const totalPurchased=myEnr.reduce((n,e)=>n+(e.totalSessions||0),0);
              let usedCount=0;
              myEnr.forEach(e=>{
                const c=courses.find(x=>x.id===e.courseId);
                if(!c) return;
                (e.scheduledDates||[]).forEach(s=>{
                  const attRec=attendance.find(a=>a.enrollmentId===e.id&&a.date===s.date);
                  if(attRec?.type==="absent"){ usedCount++; return; }
                  if(!attRec && isSessionOver(s.date,c.start,c.duration)){ usedCount++; }
                });
              });
              const remaining=Math.max(0, totalPurchased - usedCount);
              return (
                <div style={{margin:"6px 10px",display:"flex",flexDirection:"column",gap:5}}>
                  <div onClick={()=>setSideTab("progress")} style={{background:medal.bg,borderRadius:8,padding:"9px 11px",cursor:"pointer",border:`1px solid ${medal.color}33`}}>
                    <div style={{display:"flex",alignItems:"center",gap:7}}>
                      <span style={{fontSize:18}}>{medal.icon}</span>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:11,fontWeight:600,color:medal.color}}>{lang==="zh"?medal.zh:medal.en}</div>
                        <div style={{fontSize:10,color:"#9E9E9E"}}>{tot} {lang==="zh"?"點":"pt"}{toNext?` · ${lang==="zh"?`差${toNext}點`:`${toNext} to next`}`:""}</div>
                      </div>
                    </div>
                  </div>
                  <div onClick={()=>setSideTab("history")} style={{background:"#E3F2FD",borderRadius:8,padding:"8px 11px",cursor:"pointer",border:"1px solid rgba(26,107,138,0.2)"}}>
                    <div style={{fontSize:11,fontWeight:600,color:"#1A6B8A"}}>{lang==="zh"?`剩餘 ${remaining} 堂`:`${remaining} sessions left`}</div>
                    <div style={{fontSize:10,color:"#9E9E9E"}}>{lang==="zh"?"點此查看課程紀錄":"View class history"}</div>
                  </div>
                </div>
              );
            })()}

            {/* Teacher: student count teaser */}
            {isTeacher && sideTab!=="students" && (()=>{
              const myCount=courses.filter(c=>c.teacherId===currentUser.id).reduce((s,c)=>s+(c.studentId?1:0),0);
              const uniq=[...new Set(courses.filter(c=>c.teacherId===currentUser.id).map(c=>c.studentId))].length;
              return (
                <div onClick={()=>setSideTab("students")} style={{margin:"8px 10px",background:"#EEF6FB",borderRadius:8,padding:"10px 12px",cursor:"pointer",border:"1px solid rgba(26,107,138,0.2)"}}>
                  <div style={{fontSize:12,fontWeight:500,color:"#1A6B8A"}}>{uniq} {lang==="zh"?"位學生":"students"}</div>
                  <div style={{fontSize:10,color:"#9E9E9E",marginTop:2}}>{lang==="zh"?"點此查看詳情":"Click to view"}</div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ── Main content ── */}
      <div style={{flex:1,minWidth:0,marginLeft:sideHasSidebar?12:0}}>
        <div style={{background:"#FFFFFF",borderRadius:14,border:"0.5px solid #E0E0E0",boxShadow:"0 2px 12px rgba(23,47,57,0.06)",overflow:"hidden"}}>
          {isStudent && sideTab==="progress"
            ? <StudentProgressPanel currentUser={currentUser} enrollments={enrollments} attendance={attendance} courses={courses} lang={lang} dirLoaded={dirLoaded} confirmedOverride={myConfirmedOverride}/>
            : isStudent && sideTab==="history"
              ? <StudentClassHistory currentUser={currentUser} enrollments={enrollments} attendance={attendance} courses={courses} users={users} lang={lang} dirLoaded={dirLoaded} feedback={feedback}/>
            : isTeacher && sideTab==="students"
              ? <TeacherStudentsPanel currentUser={currentUser} users={users} courses={courses} enrollments={enrollments} attendance={attendance} lang={lang} dirEntries={dirEntries}/>
              : <div style={{padding:"1.5rem"}}>
                  <ScheduleView currentUser={currentUser} users={users} courses={courses} lang={lang} absences={absences} setAbsences={setAbsences} materials={materials} setMaterials={setMaterials} enrollments={enrollments} setEnrollments={setEnrollments} attendance={attendance} setAttendance={setAttendance} setToast={setToast} feedback={feedback} setFeedback={setFeedback}/>
                </div>
          }
        </div>
      </div>
    </div>
  );
}

// ─── App root ─────────────────────────────────────────────────────────────────
export default function App() {
  const [lang,setLang]=useState("zh");
  const [currentUser,setCurrentUser]=useState(null);
  const [activeTab,setActiveTab]=useState("schedule");
  const [users,setUsers,uLoaded]=useStorage("cp3_users",DEFAULT_USERS);
  const [courses,setCourses,cLoaded]=useStorage("cp3_courses",DEFAULT_COURSES);
  const [absences,setAbsences,aLoaded]=useStorage("cp3_absences",[]);
  const [materials,setMaterials,mLoaded]=useStorage("cp3_materials",[]);
  const [enrollments,setEnrollments,eLoaded]=useStorage("cp3_enrollments",DEFAULT_ENROLLMENTS);
  const [attendance,setAttendance,attLoaded]=useStorage("cp3_attendance",DEFAULT_ATTENDANCE);
  const [feedback,setFeedback,fbLoaded]=useStorage("cp3_feedback",[]);
  const [introText,setIntroText,introLoaded]=useStorage("cp3_intro_text","");
  const [toast,setToastMsg]=useState("");
  const t=T[lang];
  const syncFailures = useSyncStatus(); // surfaces any storage keys that failed to save after retry

  const setToast=msg=>{setToastMsg(msg);setTimeout(()=>setToastMsg(""),3500);};

  useEffect(()=>{
    if(currentUser&&uLoaded){
      const fresh=users.find(u=>u.id===currentUser.id);
      if(fresh&&(fresh.name!==currentUser.name||fresh.username!==currentUser.username)) setCurrentUser(fresh);
    }
  },[users]);

  if(!uLoaded||!cLoaded||!aLoaded||!mLoaded||!eLoaded||!attLoaded||!fbLoaded) return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#FAFAFA"}}>
      <span style={{color:"#1A6B8A",fontSize:16}}>Loading…</span>
    </div>
  );

  if(!currentUser) return <LoginPage onLogin={setCurrentUser} lang={lang} setLang={setLang} users={users} introText={introText}/>;

  const initials=currentUser.name.slice(0,2).toUpperCase();
  const roleLabel=t[`role_${currentUser.role}`];
  const isAdmin=currentUser.role==="admin";

  return (
    <div style={{minHeight:"100vh",background:"#FAFAFA",fontFamily:"system-ui, -apple-system, sans-serif"}}>
      <Toast msg={toast}/>
      {syncFailures.size>0 && (
        <div style={{position:"fixed",top:0,left:0,right:0,zIndex:9999,background:"#D32F2F",color:"#fff",fontSize:12,padding:"6px 14px",textAlign:"center",fontWeight:500}}>
          ⚠️ {lang==="zh"
            ? `部分資料儲存失敗（${syncFailures.size} 項），請檢查網路連線並重試，否則變更可能遺失`
            : `Some data failed to save (${syncFailures.size}) — check your connection and retry, or changes may be lost`}
        </div>
      )}
      <header style={{background:"#172F39",borderBottom:"1px solid rgba(26,107,138,0.15)",padding:"0 1.25rem",display:"flex",alignItems:"center",justifyContent:"space-between",height:58,position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:20}}>📚</span>
          <span style={{color:"#FFFFFF",fontWeight:500,fontSize:14}}>ES Platform</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <button onClick={()=>setLang(lang==="zh"?"en":"zh")} style={{background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.25)",color:"#FFFFFF",borderRadius:6,padding:"4px 12px",cursor:"pointer",fontSize:12}}>{t.langToggle}</button>
          <div style={{display:"flex",alignItems:"center",gap:7}}>
            <div style={{width:30,height:30,borderRadius:"50%",background:"#1A6B8A",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:500,color:"#fff"}}>{initials}</div>
            <div style={{lineHeight:1.2}}>
              <div style={{color:"#FFFFFF",fontSize:13,fontWeight:500}}>{currentUser.name}</div>
              <div style={{color:"rgba(255,255,255,0.65)",fontSize:11}}>{roleLabel}</div>
            </div>
          </div>
          <button onClick={()=>setCurrentUser(null)} style={{background:"transparent",border:"1px solid rgba(255,255,255,0.15)",color:"rgba(255,255,255,0.7)",borderRadius:6,padding:"5px 10px",cursor:"pointer",fontSize:12}}>{t.logout}</button>
        </div>
      </header>
      {isAdmin&&(
        <div style={{background:"#172F39",borderBottom:"1px solid rgba(26,107,138,0.1)",padding:"0 1.25rem",display:"flex",gap:4}}>
          {["schedule","admin"].map(tab=>(
            <button key={tab} onClick={()=>setActiveTab(tab)} style={{padding:"10px 14px",background:"transparent",border:"none",borderBottom:activeTab===tab?"2px solid #4DCCF5":"2px solid transparent",color:activeTab===tab?"#FFFFFF":"rgba(255,255,255,0.6)",fontSize:13,cursor:"pointer"}}>
              {tab==="schedule"?t.tabSchedule:t.tabAdmin}
            </button>
          ))}
        </div>
      )}
      <main style={{maxWidth:isAdmin?820:980,margin:"0 auto",padding:"1.25rem"}}>
        {/* ── Admin view ── */}
        {isAdmin && (
          <div style={{background:"#FFFFFF",borderRadius:14,border:"0.5px solid #E0E0E0",boxShadow:"0 2px 12px rgba(23,47,57,0.06)",padding:"1.5rem"}}>
            {activeTab==="schedule"&&<ScheduleView currentUser={currentUser} users={users} courses={courses} lang={lang} absences={absences} setAbsences={setAbsences} materials={materials} setMaterials={setMaterials} enrollments={enrollments} setEnrollments={setEnrollments} attendance={attendance} setAttendance={setAttendance} setToast={setToast} feedback={feedback} setFeedback={setFeedback}/>}
            {activeTab==="admin"&&<AdminPanel users={users} setUsers={setUsers} courses={courses} setCourses={setCourses} absences={absences} setAbsences={setAbsences} materials={materials} setMaterials={setMaterials} enrollments={enrollments} setEnrollments={setEnrollments} attendance={attendance} setAttendance={setAttendance} lang={lang} setToast={setToast} introText={introText} setIntroText={setIntroText} feedback={feedback} setFeedback={setFeedback}/>}
          </div>
        )}

        {/* ── Student / Teacher sidebar layout ── */}
        {!isAdmin && (
          <StudentTeacherLayout
            currentUser={currentUser} users={users} courses={courses} lang={lang}
            absences={absences} setAbsences={setAbsences}
            materials={materials} setMaterials={setMaterials}
            enrollments={enrollments} setEnrollments={setEnrollments}
            attendance={attendance} setAttendance={setAttendance}
            feedback={feedback} setFeedback={setFeedback}
            setToast={setToast}
          />
        )}
      </main>
    </div>
  );
}
