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
    role_student:"學生", role_teacher:"老師", role_admin:"管理員", role_assistant:"助教",
    assistantPanel:"助教後台",
    weekSchedule:"本週課表", teacher:"老師", student:"學生", time:"時間",
    join:"加入會議", material:"教材", noClass:"本週無課程",
    addToGCal:"新增到 Google 日曆", addToGCalShort:"加到日曆",
    weekExportBtn:"本週加入日曆", weekExportTitle:"匯出本週課表",
    weekExportDesc:"勾選要加入日曆的課堂，下載成一個日曆檔案（.ics），拿去 Google 日曆匯入，就能一次把整週的課都加進去。",
    weekExportNone:"本週沒有可匯出的課堂", weekExportSelectAll:"全選",
    weekExportHowTo:"下載後：開啟 Google 日曆網頁版 → 右上角齒輪「設定」→「匯入及匯出」→「匯入」，選擇剛下載的檔案即可。",
    weekExportDownload:"下載日曆檔案", weekExportDone:"已下載，包含 {n} 堂課",
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
    courseDetails:"課程明細", completedNote:"已完課 = 已發生且未請假的堂數；剩餘課程 = 尚未發生、未來還會上的堂數",
    absenceHistory:"請假紀錄", by:"by",
    // Materials
    materials:"教材管理", addMaterial:"新增教材", materialTitle:"教材名稱", materialUrl:"教材網址",
    materialDate:"上課日期", materialDesc:"備註（選填）", materialSaved:"教材已儲存",
    matContinueBtn:"延續到下一堂", matContinueHint:"此教材上一堂課沒有上完？一鍵複製到下一堂課",
    matContinueTitle:"確認延續教材", matContinueDesc:"將這份教材複製一份到課程的下一堂課，原本這一堂的教材不會被刪除或修改。",
    matContinueFrom:"目前教材", matContinueTo:"將新增至",
    matContinueWarnExisting:"該堂課已有 {n} 份教材，仍會另外新增這一份",
    matContinueConfirm:"確認新增", matContinuedToast:"已複製到下一堂課",
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
    feedbackCenterTitle:"課後追蹤中心", feedbackCenterDesc:"追蹤已完課但尚未填寫反饋的課堂，並審核老師送出的反饋",
    fbTabReview:"反饋審核", fbTabTracking:"未填寫追蹤", fbTabMaterial:"教材協助",
    fbTrackingDesc:"以下是已經上完課、但老師還沒有填寫課後反饋的堂次，依週分類",
    fbTrackingEmpty:"目前沒有未填寫反饋的課堂 🎉", fbTrackingCount:"{n} 堂未填寫",
    fbWeekOf:"週次",
    teacherFeedbackTab:"課後回饋", teacherFeedbackDesc:"只顯示你自己任教的課堂，依時間排序",
    teacherFbOverviewTab:"課堂反饋總覽", teacherFbMissingTab:"未填寫追蹤",
    teacherFbNoSessions:"目前沒有已完成的課堂", feedbackNotWrittenShort:"尚未填寫",
    sortOldToNew:"舊到新", sortNewToOld:"新到舊",
    fbTabOverview:"反饋總覽", fbOverviewDesc:"勾選學生，依週檢視該生課表與已填寫的課後心得",
    fbOverviewSelectPrompt:"請先勾選至少一位學生", fbOverviewNoSessions:"該生尚無排課紀錄",
    fbNotWritten:"尚未填寫課後心得", fbSelectStudents:"選擇學生",
    feedbackNoPending:"目前沒有待審核的反饋", feedbackAllReviewed:"全部反饋",
    feedbackBy:"填寫者", feedbackFor:"學生", feedbackDate:"上課日期",
    feedbackRejectReason:"退回原因（選填，會顯示給老師）",
    feedbackFromTeacher:"老師的課後反饋",
    // Batch feedback review & input
    feedbackSelectAll:"全選待審核", feedbackSelected:"已選 {n} 筆",
    feedbackBatchApprove:"批次核准", feedbackBatchReject:"批次退回",
    feedbackBatchApproved:"已核准 {n} 筆反饋", feedbackBatchRejected:"已退回 {n} 筆反饋",
    feedbackDelete:"刪除", feedbackDeleteConfirm:"確認刪除此筆反饋？此操作無法復原。",
    feedbackDeleted:"反饋已刪除", feedbackBatchDelete:"批次刪除",
    feedbackBatchDeleted:"已刪除 {n} 筆反饋", feedbackAdminReturned:"已直接刪除（管理員代填，無需退回老師）",
    feedbackSourceAdmin:"管理員代填", feedbackSourceTeacher:"老師填寫", feedbackSourceAssistant:"助教代填",
    // Teacher availability
    availability:"可安排時段", availabilityDesc:"點擊時段方格切換可安排（綠色）／不可安排（白色）",
    availabilityNextWeek:"次週", availabilityThisWeek:"本週",
    availabilityLegendOpen:"可安排", availabilityLegendClosed:"未開放", availabilityLegendLocked:"已鎖定",
    availabilityLockNote:"距上課不足 12 小時，無法取消已開放時段",
    availabilityLockToast:"距離此時段開始不足 12 小時，無法取消（如需異動請聯絡管理員）",
    availabilitySelectAllDay:"全選", availabilityClearDay:"清除",
    availabilityAdminOverride:"管理員可覆蓋鎖定時段",
    availabilitySelectTeacher:"選擇老師", availabilityNoTeachers:"尚無老師資料",
    availabilityRange:"開放時段：上午 9:00 – 晚上 11:00",
    availabilitySaved:"已更新可安排時段",
    availabilityLegendFixed:"已排課（固定，不可選）",
    availabilityFixedNote:"藍色 📌 為既有固定課程時段，僅顯示不可選取",
    forceOpenTitle:"強制開放固定時段", forceOpenDesc:"此時段原本為固定課程，僅在學生/老師請假等特殊情況下才應開放",
    forceOpenScanFound:"✅ 掃描到請假／缺勤紀錄", forceOpenScanNone:"⚠️ 未掃描到請假或缺勤紀錄，請確認情況屬實再開放",
    forceOpenReason:"開放原因（選填）", forceOpenConfirm:"確認開放此時段",
    forceOpenSuccess:"已強制開放此時段", forceOpenBadge:"強制開放中",
    forceOpenActiveList:"本週強制開放時段", forceOpenRevoke:"還原鎖定",
    forceOpenRevoked:"已還原為固定課程鎖定",
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
    // People directory (student + teacher)
    peopleDir:"師生資料庫", peopleDirStudents:"學生資料庫", peopleDirTeachers:"老師資料庫",
    peopleDirChanges:"通知變更",
    // Student settings
    settingsTab:"基本資訊與設定", settingsDesc:"更新你的基本資料與密碼",
    settingsBasicInfo:"基本資訊", settingsNameEn:"英文姓名", settingsNameCn:"中文姓名", settingsBirthDate:"出生年月日",
    settingsAvatar:"大頭貼", settingsEmail:"Email", settingsPhone:"聯絡電話（手機）",
    settingsOptionalNote:"以下欄位皆為選填，可留空", settingsSaveInfo:"儲存變更",
    settingsPendingBanner:"您有一筆資料變更正在等待管理員審核合併",
    settingsSubmitted:"已送出變更，待管理員審核合併", settingsNoChange:"沒有變更可儲存",
    settingsSavedInstant:"已更新，立即生效",
    settingsNameReviewNote:"名字變更需經管理員審核合併，其餘欄位儲存後立即生效",
    settingsNoneValue:"無", settingsCurrentInfo:"目前資料",
    scheduleShareBtn:"課表共享", scheduleShareTitle:"課表共享設定",
    scheduleShareDesc:"勾選的學生帳號，登入後可以在側邊欄看到這位學生的課表", 
    scheduleShareNoOthers:"目前系統裡沒有其他學生帳號",
    scheduleShareHint:"已選 {n} 位帳號，儲存後對方登入即可在側邊欄看到課表",
    scheduleShareSaved:"課表共享設定已儲存",
    sharedScheduleMenu:"{name}的課表",
    settingsChangePwd:"更改密碼", settingsCurrentPwd:"目前密碼", settingsNewPwd:"新密碼",
    settingsConfirmPwd:"確認新密碼", settingsPwdMismatch:"兩次輸入的新密碼不一致",
    settingsCurrentPwdWrong:"目前密碼不正確", settingsPwdUpdated:"密碼已更新",
    settingsUpdatePwdBtn:"更新密碼",
    // Admin change notifications
    changeNotifTitle:"通知變更", changeNotifDesc:"學員自行更新的資料異動，審核後才會合併到正式資料",
    changeNotifNone:"目前沒有待審核的異動", changeNotifFrom:"由", changeNotifAt:"提交時間",
    changeNotifField:"欄位", changeNotifOld:"原值", changeNotifNew:"新值",
    changeNotifMerge:"合併至既有資料", changeNotifDismiss:"忽略",
    changeNotifMerged:"已合併至既有資料", changeNotifDismissed:"已忽略此筆異動",
    changeNotifStatus:"狀態", changeNotifStatusPending:"待審核", changeNotifStatusMerged:"已合併", changeNotifStatusDismissed:"已忽略",
    changeNotifStatusAutoApplied:"已自動套用", changeNotifAutoAppliedNote:"此變更無需審核，已直接套用至師生資料庫",
    teacherDir:"老師資料庫", dirTeacherName:"老師姓名", dirYearsExp:"教學年資",
    teacherExcelCols:"老師姓名 | 教學年資 | 加入年份",
    teacherPasteHint:"直接從 Excel 複製並貼上（Tab 分隔，欄位順序：老師姓名、教學年資、加入年份）",
    dirAddManualTeacher:"手動新增老師", yearsUnit:"年",
    // Salary
    salary:"薪資", salaryTotal:"已發放總薪資", salaryRecords:"發放紀錄",
    salaryAdd:"新增薪資紀錄", salaryAmount:"金額", salaryDate:"發放日期",
    salaryNote:"備註（選填）", salarySave:"儲存紀錄", salaryNone:"尚無發放紀錄",
    salaryManage:"管理薪資", salaryDeleteConfirm:"確認刪除此筆薪資紀錄？",
    salaryAdded:"薪資紀錄已新增", salaryDeleted:"薪資紀錄已刪除",
    // Teacher profile / bio
    teacherBio:"教學理念與優勢", teacherBioPlaceholder:"教學風格、擅長領域、教學方針…",
    useTemplate:"套用預設範本", teacherIntro:"老師介紹",
    teacherIntroDesc:"認識你的授課老師", myTeachers:"我的授課老師",
    teacherYears:"教學年資", teacherYearsUnit:"年教學經驗",
    previewStudentView:"預覽學生檢視畫面", noBioYet:"尚未填寫教學理念",
    teacherPreviewTitle:"學生檢視預覽",
  },
  en: {
    appName:"ES Online Course Platform", login:"Login", logout:"Logout", username:"Username", password:"Password",
    loginBtn:"Sign In", loginError:"Invalid username or password",
    role_student:"Student", role_teacher:"Teacher", role_admin:"Admin", role_assistant:"Assistant",
    assistantPanel:"Assistant Panel",
    weekSchedule:"This Week's Schedule", teacher:"Teacher", student:"Student", time:"Time",
    join:"Join", material:"Materials", noClass:"No classes this week",
    addToGCal:"Add to Google Calendar", addToGCalShort:"Add to Calendar",
    weekExportBtn:"Add Week to Calendar", weekExportTitle:"Export This Week's Schedule",
    weekExportDesc:"Check the sessions you want, and download a single calendar file (.ics) — import it into Google Calendar to add the whole week at once.",
    weekExportNone:"No sessions to export this week", weekExportSelectAll:"Select All",
    weekExportHowTo:"After downloading: open Google Calendar on the web → gear icon \"Settings\" → \"Import & export\" → \"Import\", then choose the file you just downloaded.",
    weekExportDownload:"Download Calendar File", weekExportDone:"Downloaded — {n} session(s) included",
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
    courseDetails:"Course Details", completedNote:"Completed = past sessions with no leave; Remaining = future sessions still to come",
    absenceHistory:"Absence History", by:"by",
    // Materials
    materials:"Materials", addMaterial:"Add Material", materialTitle:"Title", materialUrl:"URL",
    materialDate:"Class Date", materialDesc:"Notes (optional)", materialSaved:"Material saved",
    matContinueBtn:"Carry to Next Class", matContinueHint:"Didn't finish this material last class? Copy it to the next class in one click",
    matContinueTitle:"Confirm Carry Forward", matContinueDesc:"This copies the material onto the course's next class — the original stays as-is.",
    matContinueFrom:"Current Material", matContinueTo:"Will Be Added To",
    matContinueWarnExisting:"That class already has {n} material(s) — this will be added alongside them",
    matContinueConfirm:"Confirm Add", matContinuedToast:"Copied to next class",
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
    feedbackCenterTitle:"Post-Class Tracking Center", feedbackCenterDesc:"Track completed classes missing feedback, and review feedback teachers have submitted",
    fbTabReview:"Feedback Review", fbTabTracking:"Missing Feedback", fbTabMaterial:"Material Assist",
    fbTrackingDesc:"Classes that have already ended but the teacher hasn't written feedback for yet, grouped by week",
    fbTrackingEmpty:"No missing feedback right now 🎉", fbTrackingCount:"{n} missing",
    fbWeekOf:"Week of",
    teacherFeedbackTab:"Post-Class Feedback", teacherFeedbackDesc:"Only your own courses, sorted by time",
    teacherFbOverviewTab:"Feedback Overview", teacherFbMissingTab:"Missing Feedback",
    teacherFbNoSessions:"No completed sessions yet", feedbackNotWrittenShort:"Not written yet",
    sortOldToNew:"Oldest first", sortNewToOld:"Newest first",
    fbTabOverview:"Feedback Overview", fbOverviewDesc:"Check students to view their weekly schedule with any feedback already written",
    fbOverviewSelectPrompt:"Select at least one student", fbOverviewNoSessions:"No scheduled sessions for this student",
    fbNotWritten:"No feedback written yet", fbSelectStudents:"Select Students",
    feedbackNoPending:"No feedback pending review", feedbackAllReviewed:"All Feedback",
    feedbackBy:"Submitted by", feedbackFor:"Student", feedbackDate:"Class Date",
    feedbackRejectReason:"Reason for rejection (optional, shown to teacher)",
    feedbackFromTeacher:"Teacher's Feedback",
    // Batch feedback review & input
    feedbackSelectAll:"Select all pending", feedbackSelected:"{n} selected",
    feedbackBatchApprove:"Batch Approve", feedbackBatchReject:"Batch Reject",
    feedbackBatchApproved:"{n} feedback approved", feedbackBatchRejected:"{n} feedback rejected",
    feedbackDelete:"Delete", feedbackDeleteConfirm:"Delete this feedback? This cannot be undone.",
    feedbackDeleted:"Feedback deleted", feedbackBatchDelete:"Batch Delete",
    feedbackBatchDeleted:"{n} feedback deleted", feedbackAdminReturned:"Deleted directly (admin-authored, no teacher hand-off needed)",
    feedbackSourceAdmin:"Admin-entered", feedbackSourceTeacher:"Teacher-written", feedbackSourceAssistant:"Assistant-written",
    // Teacher availability
    availability:"Availability", availabilityDesc:"Click a time slot to toggle open (green) / closed (white)",
    availabilityNextWeek:"Next Week", availabilityThisWeek:"This Week",
    availabilityLegendOpen:"Open", availabilityLegendClosed:"Closed", availabilityLegendLocked:"Locked",
    availabilityLockNote:"Less than 12 hours before class — can't cancel an open slot",
    availabilityLockToast:"Less than 12 hours until this slot — can't cancel (contact admin if needed)",
    availabilitySelectAllDay:"Select All", availabilityClearDay:"Clear",
    availabilityAdminOverride:"Admin can override locked slots",
    availabilitySelectTeacher:"Select Teacher", availabilityNoTeachers:"No teacher data yet",
    availabilityRange:"Open hours: 9:00 AM – 11:00 PM",
    availabilitySaved:"Availability updated",
    availabilityLegendFixed:"Booked (fixed, not selectable)",
    availabilityFixedNote:"Blue 📌 marks existing fixed course slots — shown but not selectable",
    forceOpenTitle:"Force-Open Fixed Slot", forceOpenDesc:"This slot belongs to a fixed course — only open it for special cases like a student/teacher leave",
    forceOpenScanFound:"✅ Leave/absence record found", forceOpenScanNone:"⚠️ No leave or absence record found — please confirm before opening",
    forceOpenReason:"Reason (optional)", forceOpenConfirm:"Confirm & Open This Slot",
    forceOpenSuccess:"Slot force-opened", forceOpenBadge:"Force-opened",
    forceOpenActiveList:"Force-opened slots this week", forceOpenRevoke:"Revert Lock",
    forceOpenRevoked:"Reverted to fixed course lock",
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
    // People directory (student + teacher)
    peopleDir:"Teacher & Student Directory", peopleDirStudents:"Student Directory", peopleDirTeachers:"Teacher Directory",
    peopleDirChanges:"Change Notifications",
    // Student settings
    settingsTab:"Basic Info & Settings", settingsDesc:"Update your basic info and password",
    settingsBasicInfo:"Basic Info", settingsNameEn:"English Name", settingsNameCn:"Chinese Name", settingsBirthDate:"Date of Birth",
    settingsAvatar:"Avatar", settingsEmail:"Email", settingsPhone:"Contact Number (Mobile)",
    settingsOptionalNote:"All fields below are optional — feel free to leave any blank", settingsSaveInfo:"Save Changes",
    settingsPendingBanner:"You have a pending profile change awaiting admin review",
    settingsSubmitted:"Change submitted, awaiting admin review", settingsNoChange:"No changes to save",
    settingsSavedInstant:"Updated — effective immediately",
    settingsNameReviewNote:"Name changes require admin review before taking effect; all other fields save instantly",
    settingsNoneValue:"None", settingsCurrentInfo:"Current Info",
    scheduleShareBtn:"Schedule Sharing", scheduleShareTitle:"Schedule Sharing Settings",
    scheduleShareDesc:"Checked student accounts will see this student's schedule in their own sidebar",
    scheduleShareNoOthers:"No other student accounts in the system yet",
    scheduleShareHint:"{n} account(s) selected — once saved, they'll see the schedule in their sidebar",
    scheduleShareSaved:"Schedule sharing settings saved",
    sharedScheduleMenu:"{name}'s Schedule",
    settingsChangePwd:"Change Password", settingsCurrentPwd:"Current Password", settingsNewPwd:"New Password",
    settingsConfirmPwd:"Confirm New Password", settingsPwdMismatch:"New passwords don't match",
    settingsCurrentPwdWrong:"Current password is incorrect", settingsPwdUpdated:"Password updated",
    settingsUpdatePwdBtn:"Update Password",
    // Admin change notifications
    changeNotifTitle:"Change Notifications", changeNotifDesc:"Students' self-submitted profile edits — review before merging into official records",
    changeNotifNone:"No pending changes to review", changeNotifFrom:"From", changeNotifAt:"Submitted",
    changeNotifField:"Field", changeNotifOld:"Old Value", changeNotifNew:"New Value",
    changeNotifMerge:"Merge into Records", changeNotifDismiss:"Dismiss",
    changeNotifMerged:"Merged into records", changeNotifDismissed:"Change dismissed",
    changeNotifStatus:"Status", changeNotifStatusPending:"Pending", changeNotifStatusMerged:"Merged", changeNotifStatusDismissed:"Dismissed",
    changeNotifStatusAutoApplied:"Auto-applied", changeNotifAutoAppliedNote:"No review needed — already applied to the student directory",
    teacherDir:"Teacher Directory", dirTeacherName:"Teacher Name", dirYearsExp:"Years of Teaching",
    teacherExcelCols:"Teacher Name | Years of Teaching | Join Year",
    teacherPasteHint:"Paste directly from Excel (Tab-separated, columns: Teacher Name, Years of Teaching, Join Year)",
    dirAddManualTeacher:"Add Teacher", yearsUnit:"yrs",
    // Salary
    salary:"Salary", salaryTotal:"Total Paid", salaryRecords:"Payment History",
    salaryAdd:"Add Payment Record", salaryAmount:"Amount", salaryDate:"Payment Date",
    salaryNote:"Notes (optional)", salarySave:"Save Record", salaryNone:"No payment records yet",
    salaryManage:"Manage Salary", salaryDeleteConfirm:"Delete this payment record?",
    salaryAdded:"Payment record added", salaryDeleted:"Payment record deleted",
    // Teacher profile / bio
    teacherBio:"Teaching Philosophy & Strengths", teacherBioPlaceholder:"Teaching style, areas of expertise, approach…",
    useTemplate:"Use Default Template", teacherIntro:"Teacher Introduction",
    teacherIntroDesc:"Get to know your teachers", myTeachers:"My Teachers",
    teacherYears:"Years of Teaching", teacherYearsUnit:"years of experience",
    previewStudentView:"Preview Student View", noBioYet:"No teaching philosophy written yet",
    teacherPreviewTitle:"Student View Preview",
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
// Trial lessons always get this one fixed color, regardless of the normal
// per-course rotation — so a [Trial] session is instantly recognizable on
// the calendar/list at a glance instead of blending in with regular classes.
const TRIAL_COLOR = {bg:"#FFFDE7",border:"#F9A825",text:"#F57F17"};

// Bumped whenever a meaningful set of changes ships. Shown low-key on the
// login page so version can be confirmed at a glance; also called out
// whenever a new file is delivered.
const APP_VERSION = "v1.2.8";

const genId = () => "id_" + Math.random().toString(36).slice(2,9);

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

// Admin-editable dropdown choices for the trial-lesson application form.
const DEFAULT_ENGLISH_LEVELS = [
  {id:genId(), zh:"初階", en:"Beginner"},
  {id:genId(), zh:"中階", en:"Intermediate"},
  {id:genId(), zh:"中高階", en:"Upper-Intermediate"},
  {id:genId(), zh:"高階", en:"Advanced"},
];
const DEFAULT_LEARNING_PURPOSES = [
  {id:genId(), zh:"出國留學", en:"Study Abroad"},
  {id:genId(), zh:"職場工作需求", en:"Career / Workplace"},
  {id:genId(), zh:"學術／考試準備（多益、雅思、托福等）", en:"Academic / Test Prep (TOEIC, IELTS, TOEFL)"},
  {id:genId(), zh:"日常生活溝通", en:"Daily Communication"},
  {id:genId(), zh:"兒童／青少年基礎教育", en:"Child / Teen Foundational Education"},
  {id:genId(), zh:"旅遊會話", en:"Travel Conversation"},
  {id:genId(), zh:"興趣嗜好", en:"Personal Interest"},
  {id:genId(), zh:"其他", en:"Other"},
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

// ─── Password hashing (Web Crypto API, built into every modern browser) ───
// PBKDF2 with a random per-user salt and 100k iterations — deliberately slow
// to make brute-forcing a leaked database impractical, unlike plaintext or a
// single fast hash. Migration is transparent: an account's ACTUAL password
// never changes; only how it's stored changes, automatically, the next time
// that person logs in (see LoginPage) — nobody needs to reset anything.
async function hashPassword(password, existingSaltHex) {
  const enc = new TextEncoder();
  const salt = existingSaltHex
    ? new Uint8Array(existingSaltHex.match(/.{2}/g).map(b => parseInt(b, 16)))
    : crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" }, keyMaterial, 256);
  const toHex = (buf) => Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
  return { hash: toHex(bits), salt: toHex(salt) };
}
// Verifies a typed password against a user record that may still be on the
// OLD plaintext scheme (passwordHash/passwordSalt not set yet) — supports
// both transparently so nothing breaks mid-migration.
async function verifyPassword(typed, user) {
  if (user.passwordHash && user.passwordSalt) {
    const { hash } = await hashPassword(typed, user.passwordSalt);
    return hash === user.passwordHash;
  }
  return typed === user.password; // legacy plaintext fallback
}


function addMins(timeStr, mins) {
  const [h,m] = timeStr.split(":").map(Number);
  const t = h*60+m+mins;
  return `${String(Math.floor(t/60)).padStart(2,"0")}:${String(t%60).padStart(2,"0")}`;
}
// Separate hour (00-23) and minute (00,10,20,30,40,50) option lists for two
// independent <select> dropdowns — keeps "時" and "分" as distinct pickers
// (a single combined HH:MM list works but isn't what was wanted here), while
// still enforcing the 10-minute grid on the minute side. A plain
// <input type="time"> only nudges its native spinner by a step amount, it
// doesn't stop someone from typing/scrolling to an arbitrary minute.
const HOUR_OPTIONS = Array.from({length:24}, (_,h) => String(h).padStart(2,"0"));
const MIN_OPTIONS = ["00","10","20","30","40","50"];

// ─── Google Calendar "quick add" link ──────────────────────────────────────
// Builds a URL that opens Google Calendar with a pre-filled event — no API
// key, no OAuth login, works for anyone with a Google account. Dates are sent
// WITHOUT a timezone suffix (floating/local time) so the event lands on the
// person's calendar at the same wall-clock time shown in the app (e.g. "9:00"
// shows up as 9:00 for them), rather than being converted across timezones.
function buildGoogleCalendarUrl({ title, dateStr, startTime, durationMins, details, location }) {
  const [y, mo, d] = dateStr.split("-");
  const [sh, sm] = startTime.split(":").map(Number);
  const startTotalMin = sh * 60 + sm;
  const endTotalMin = startTotalMin + durationMins;
  const fmtStamp = (totalMin) => {
    const hh = String(Math.floor(totalMin / 60) % 24).padStart(2, "0");
    const mm = String(totalMin % 60).padStart(2, "0");
    return `${y}${mo}${d}T${hh}${mm}00`;
  };
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title || "",
    dates: `${fmtStamp(startTotalMin)}/${fmtStamp(endTotalMin)}`,
    details: details || "",
    location: location || "",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

// ─── Batch .ics calendar export ────────────────────────────────────────────
// Google's quick-add link only supports one event at a time, and browsers
// block opening many tabs at once from a single click — so for "add my whole
// week in one go" we generate a single standard .ics file containing every
// selected session as its own VEVENT. The person downloads it once, then uses
// their calendar app's own "Import" feature (Google/Apple/Outlook all support
// this) to bring every event in together in one step.
function icsEscape(str) {
  return String(str||"").replace(/\\/g,"\\\\").replace(/;/g,"\\;").replace(/,/g,"\\,").replace(/\n/g,"\\n");
}
function buildICSCalendar(events) {
  const fmtStamp = (dateStr, timeStr) => {
    const [y,mo,d] = dateStr.split("-");
    const [h,m] = timeStr.split(":").map(Number);
    return `${y}${mo}${d}T${String(h).padStart(2,"0")}${String(m).padStart(2,"0")}00`;
  };
  const nowStamp = new Date().toISOString().replace(/[-:]/g,"").split(".")[0]+"Z";
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ES Course Platform//Schedule Export//EN",
    "CALSCALE:GREGORIAN",
  ];
  events.forEach(ev => {
    const endTime = addMins(ev.startTime, ev.durationMins);
    lines.push(
      "BEGIN:VEVENT",
      `UID:${ev.uid||genId()}@es-course-platform`,
      `DTSTAMP:${nowStamp}`,
      `DTSTART:${fmtStamp(ev.dateStr, ev.startTime)}`,
      `DTEND:${fmtStamp(ev.dateStr, endTime)}`,
      `SUMMARY:${icsEscape(ev.title)}`,
      `DESCRIPTION:${icsEscape(ev.details)}`,
      `LOCATION:${icsEscape(ev.location)}`,
      "END:VEVENT",
    );
  });
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}
function downloadICS(events, filename) {
  const content = buildICSCalendar(events);
  const blob = new Blob([content], {type:"text/calendar;charset=utf-8"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename || "schedule.ics";
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Course schedule helpers ────────────────────────────────────────────────
// A course can meet on different days at DIFFERENT times (e.g. Sat 9:00, Sun
// 8:00) via `course.schedule = [{dayIndex, start}, ...]`. Older courses saved
// before this existed only have `days[]` + a single shared `start` — these
// helpers transparently normalize both shapes so the rest of the app can just
// ask "what days does this course meet" / "what time does it start on day X"
// without caring which format is stored.
function getCourseSchedule(course) {
  if (course?.schedule && course.schedule.length) return course.schedule;
  return (course?.days||[]).map(d => ({ dayIndex: d, start: course?.start }));
}
function getCourseDays(course) {
  return [...new Set(getCourseSchedule(course).map(s => s.dayIndex))].sort((a,b)=>a-b);
}
function getCourseStartForDay(course, dayIndex) {
  const entry = getCourseSchedule(course).find(s => s.dayIndex === dayIndex);
  return entry ? entry.start : course?.start;
}
// A scheduledDates entry's ACTUAL start time — a rescheduled/make-up session
// (customStart, set via "更換時間補課") always overrides the course's regular
// weekly pattern for that one occurrence. Using getCourseStartForDay alone
// here was a bug: it silently ignored reschedules when checking whether a
// session had ended yet (isSessionOver), completion status, medal points,
// feedback tracking, etc. — a moved session could be judged "over" or "not
// over" against the WRONG (original) time instead of its real new time.
function resolveSessionStart(course, s) {
  return s.customStart || getCourseStartForDay(course, s.dayIndex);
}
// Human-readable summary like "週六 9:00、週日 8:00" — groups days that share
// the same start time together, e.g. "一、三、五 16:00" if they're identical.
function formatCourseScheduleSummary(course, lang) {
  const sched = getCourseSchedule(course);
  const byTime = {};
  sched.forEach(s => { if (!byTime[s.start]) byTime[s.start] = []; byTime[s.start].push(s.dayIndex); });
  return Object.entries(byTime)
    .sort((a,b)=>a[0].localeCompare(b[0]))
    .map(([start, days]) => `${days.sort((a,b)=>a-b).map(d=>T[lang].days[d]).join("、")} ${start}`)
    .join(" ・ ");
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

// For student material self-submission: only sessions starting MORE than 24
// hours from now are eligible — anything closer is too last-minute for a
// teacher to realistically review and use.
function hoursUntilSession(dateStr, startTime) {
  if (!dateStr) return -Infinity;
  const [h,m] = (startTime||"00:00").split(":").map(Number);
  const start = new Date(dateStr+"T00:00:00");
  start.setHours(h||0, m||0, 0, 0);
  return (start.getTime() - Date.now()) / 3600000;
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg }) {
  if (!msg) return null;
  return <div style={{position:"fixed",top:16,right:16,background:"#4CAF50",color:"#fff",borderRadius:8,padding:"11px 18px",fontSize:13,zIndex:9999,maxWidth:320,lineHeight:1.4,boxShadow:"0 2px 12px rgba(0,0,0,0.18)"}}>{msg}</div>;
}

// ─── Absence modal ────────────────────────────────────────────────────────────
function AbsenceModal({ course, dayIndex, resolvedStart, users, lang, currentUser, onConfirm, onClose }) {
  const t = T[lang];
  const teacher = users.find(u=>u.id===course.teacherId);
  const student = users.find(u=>u.id===course.studentId);
  const startTime = resolvedStart || getCourseStartForDay(course, dayIndex);
  const endTime = addMins(startTime, course.duration);

  // ── Step 1: reason; Step 2: notify ──
  const [step, setStep] = useState(1);
  const [reason, setReason] = useState("sick"); // "sick" | "personal"
  const [personalNote, setPersonalNote] = useState("");
  const [sent, setSent] = useState({email:false,fb:false,line:false});

  const reasonLabel = reason === "sick"
    ? (lang==="zh" ? "病假" : "Sick Leave")
    : (lang==="zh" ? `事假（${personalNote||"…"}）` : `Personal Leave (${personalNote||"…"})`);

  const msgBody = `[${t.absentNotif}] ${course.subject}\n${t.teacher}: ${teacher?.name} · ${t.student}: ${student?.name}\n${T[lang].days[dayIndex]} ${startTime}–${endTime}\n${lang==="zh"?"請假人":"By"}: ${currentUser.name}\n${lang==="zh"?"事由":"Reason"}: ${reasonLabel}`;

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
          {T[lang].days[dayIndex]} · {startTime}–{endTime}
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

// ─── Discontinue enrollment (admin) — a safe alternative to delete for a
// student who genuinely can't continue. Explicitly spells out what's kept
// vs removed so there's no ambiguity like there was with "delete". ────────────
function DiscontinueModal({ course, student, futureCount, lang, onConfirm, onCancel }) {
  const [reason, setReason] = useState("");
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:99999,padding:"1rem"}}>
      <div style={{background:"#FFFFFF",borderRadius:12,width:"100%",maxWidth:420,boxSizing:"border-box",boxShadow:"0 8px 32px rgba(23,47,57,0.18)",overflow:"hidden"}}>
        <div style={{background:"#172F39",padding:"13px 18px"}}>
          <span style={{fontSize:14,fontWeight:600,color:"#FFFFFF"}}>⛔ {lang==="zh"?"中斷課程":"Discontinue Course"}</span>
        </div>
        <div style={{padding:"18px 18px 16px"}}>
          <p style={{margin:"0 0 10px",fontSize:13,color:"#172F39",lineHeight:1.6}}>
            {lang==="zh"
              ? <>確認中斷「<strong>{course?.subject||""}</strong>」（學生：{student?.name||"—"}）？</>
              : <>Discontinue "<strong>{course?.subject||""}</strong>" (student: {student?.name||"—"})?</>}
          </p>
          <div style={{background:"#E8F5E9",borderRadius:8,padding:"9px 12px",marginBottom:8,fontSize:12,color:"#2E7D32",lineHeight:1.6}}>
            ✓ {lang==="zh"?"所有已發生的出席、完課、反饋、教材紀錄完全保留，不會受影響":"All past attendance, completion, feedback, and material records stay exactly as they are"}
          </div>
          <div style={{background:"#FFF3E0",borderRadius:8,padding:"9px 12px",marginBottom:14,fontSize:12,color:"#E65100",lineHeight:1.6}}>
            ⛔ {lang==="zh"?`將移除 ${futureCount} 堂尚未發生的未來排課，學生不會再出現在未來課表上`:`Will remove ${futureCount} not-yet-happened future session(s) — the student won't appear on the future schedule anymore`}
          </div>
          <label style={{fontSize:12,color:"#546E7A",display:"block",marginBottom:5}}>{lang==="zh"?"中斷原因（選填）":"Reason (optional)"}</label>
          <textarea value={reason} onChange={e=>setReason(e.target.value)} rows={3} placeholder={lang==="zh"?"例如：搬家、時間無法配合…":"e.g. moved away, schedule conflict…"} style={{width:"100%",boxSizing:"border-box",padding:"8px 10px",borderRadius:7,border:"0.5px solid #CFD8DC",fontSize:13,fontFamily:"inherit",resize:"vertical",marginBottom:16}}/>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <button onClick={onCancel} style={{padding:"8px 18px",borderRadius:7,border:"0.5px solid #CFD8DC",background:"#F5F5F5",color:"#546E7A",fontSize:13,cursor:"pointer"}}>
              {lang==="zh"?"取消":"Cancel"}
            </button>
            <button onClick={()=>onConfirm(reason)} style={{padding:"8px 18px",borderRadius:7,border:"none",background:"#E65100",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer"}}>
              ⛔ {lang==="zh"?"確認中斷":"Confirm Discontinue"}
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
function MaterialPanel({ course, initialDate, users, lang, currentUser, materials, setMaterials, setToast, onClose, enrollments, attendance, absences }) {
  const t = T[lang];
  const canEdit = currentUser.role === "admin" || currentUser.role === "teacher";

  // The set of DATES a material can be tagged with comes from the course's
  // real scheduled sessions (enrollment.scheduledDates) — every class
  // occurrence is its own exact date, and materials are tied to that exact
  // date, NOT a recurring day-of-week. Matching by day-of-week was the bug:
  // it made a Monday's material silently reappear on every future Monday
  // instead of being that one class's own material.
  const validDates = [...new Set(
    (enrollments||[])
      .filter(e => e.courseId === course.id)
      .flatMap(e => (e.scheduledDates||[]).map(s => s.date))
  )].sort();
  const dateDayIndex = (dateStr) => {
    const found = (enrollments||[])
      .filter(e => e.courseId === course.id)
      .flatMap(e => e.scheduledDates||[])
      .find(s => s.date === dateStr);
    if (found) return found.dayIndex;
    return (new Date(dateStr+"T00:00:00").getDay()+6)%7;
  };
  const fmtDateLabel = (d) => `${d} (${T[lang].days[dateDayIndex(d)]})`;
  // A date already marked as leave/excused (self-reported or admin-recorded)
  // shouldn't be selectable for a new material — that class isn't happening
  // as normally scheduled, so there's nothing to prep material for.
  const courseEnrs = (enrollments||[]).filter(e => e.courseId === course.id);
  const isLeaveDate = (dateStr) => {
    const hasAttLeave = courseEnrs.some(e => (attendance||[]).some(a => a.enrollmentId===e.id && a.date===dateStr && a.type!=="other"));
    const hasSelfAbs = (absences||[]).some(a => a.courseId===course.id && a.dateStr===dateStr);
    return hasAttLeave || hasSelfAbs;
  };

  // ── filter / sort state ──
  // initialDate: "YYYY-MM-DD" for one specific class occurrence, or null (show all)
  const [dateFilter, setDateFilter] = useState(initialDate ?? "all");
  const [sortOrder, setSortOrder] = useState("newest"); // newest | oldest
  const [confirmDelId, setConfirmDelId] = useState(null); // material id pending delete

  // ── form state ──
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showBatchInPanel, setShowBatchInPanel] = useState(false);
  const today = new Date().toISOString().slice(0, 10);
  // Default date must be a real class occurrence — falling back to a
  // hardcoded/arbitrary date was the bug: materials saved against the wrong
  // date silently reappeared on (or vanished from) the wrong day.
  const nextUpcoming = validDates.find(d => d >= today && !isLeaveDate(d));
  const defaultDate = (dateFilter !== "all" && validDates.includes(dateFilter) && !isLeaveDate(dateFilter)) ? dateFilter : (nextUpcoming || validDates.find(d=>!isLeaveDate(d)) || validDates[validDates.length-1] || today);
  const blank = { title:"", url:"", date: defaultDate, desc:"", dayIndex: dateDayIndex(defaultDate) };
  const [form, setForm] = useState(blank);
  const fset = (k, v) => setForm(f => ({...f, [k]: v, ...(k==="date" ? {dayIndex: dateDayIndex(v)} : {})}));

  // ── derived list ──
  let visible = materials.filter(m => m.courseId === course.id);
  if (dateFilter !== "all") visible = visible.filter(m => m.date === dateFilter);
  visible = [...visible].sort((a, b) => {
    const da = a.date || a.addedAt?.slice(0,10) || "";
    const db = b.date || b.addedAt?.slice(0,10) || "";
    return sortOrder === "newest" ? db.localeCompare(da) : da.localeCompare(db);
  });

  // Which specific dates already have materials (for the filter pills) — kept
  // to actual dates with content, not every possible date across the term.
  const datesWithMat = [...new Set(materials.filter(m => m.courseId === course.id).map(m => m.date))].sort().reverse();

  const openAdd = () => {
    setEditing(null);
    const d = (dateFilter !== "all") ? dateFilter : defaultDate;
    setForm({...blank, date: d, dayIndex: dateDayIndex(d)});
    setShowForm(true);
  };

  const save = () => {
    if (!form.url.trim()) return;
    if (!form.date) { setToast(lang==="zh" ? "請選擇日期" : "Please select a date"); return; }
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

  // "延續到下一堂課" — copies a material forward to the course's NEXT real
  // scheduled date (not next week/same day-of-week — the actual next session,
  // which could be sooner if the course meets multiple times a week). Kept
  // generic under `canEdit` (admin OR teacher) so a teacher can use this too
  // once they're given access to manage their own course's materials.
  const [continueTarget, setContinueTarget] = useState(null); // material being continued
  const getNextValidDate = (fromDate) => validDates.find(d => d > fromDate) || null;
  const confirmContinue = () => {
    if (!continueTarget) return;
    const nextDate = getNextValidDate(continueTarget.date);
    if (!nextDate) return;
    setMaterials(ms => [...ms, {
      id: genId(), courseId: course.id, date: nextDate, dayIndex: dateDayIndex(nextDate),
      title: continueTarget.title, url: continueTarget.url, desc: continueTarget.desc,
      addedBy: currentUser.id, addedAt: new Date().toISOString(),
    }]);
    setToast(t.matContinuedToast);
    setContinueTarget(null);
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
      {showBatchInPanel && <BatchMaterialModal users={users} courses={[course]} materials={materials} setMaterials={setMaterials} lang={lang} setToast={setToast} onClose={()=>setShowBatchInPanel(false)} enrollments={enrollments} initialCourseId={course.id}/>}
      {continueTarget && (() => {
        const nextDate = getNextValidDate(continueTarget.date);
        const nextDayLabel = nextDate ? `${nextDate} (${T[lang].days[dateDayIndex(nextDate)]})` : "";
        const nextDateAlreadyHas = materials.filter(m=>m.courseId===course.id && m.date===nextDate).length;
        return (
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9400,padding:"1rem"}}>
            <div style={{background:"#FFFFFF",borderRadius:16,width:"100%",maxWidth:400,boxSizing:"border-box",boxShadow:"0 8px 36px rgba(23,47,57,0.2)",overflow:"hidden"}}>
              <div style={{background:"#172F39",padding:"13px 18px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:14,fontWeight:600,color:"#fff"}}>➡️ {t.matContinueTitle}</span>
                <button onClick={()=>setContinueTarget(null)} style={{background:"rgba(255,255,255,0.15)",border:"none",borderRadius:"50%",width:28,height:28,cursor:"pointer",color:"#fff",fontSize:16}}>×</button>
              </div>
              <div style={{padding:"16px 18px"}}>
                <p style={{fontSize:12,color:"#546E7A",margin:"0 0 12px",lineHeight:1.6}}>{t.matContinueDesc}</p>

                <div style={{background:"#F5F5F5",borderRadius:8,padding:"10px 13px",marginBottom:10}}>
                  <div style={{fontSize:11,color:"#9E9E9E",marginBottom:2}}>{t.matContinueFrom}</div>
                  <div style={{fontSize:13,fontWeight:600,color:"#172F39"}}>{continueTarget.title}</div>
                  <div style={{fontSize:11,color:"#546E7A",marginTop:2}}>{continueTarget.date} ({T[lang].days[continueTarget.dayIndex]})</div>
                  <div style={{fontSize:11,color:"#1A6B8A",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginTop:4}}>{continueTarget.url}</div>
                </div>

                <div style={{textAlign:"center",fontSize:16,color:"#9E9E9E",marginBottom:10}}>↓</div>

                <div style={{background:"#EEF6FB",border:"1px solid #CFE3EF",borderRadius:8,padding:"10px 13px",marginBottom:12}}>
                  <div style={{fontSize:11,color:"#1A6B8A",marginBottom:2}}>{t.matContinueTo}</div>
                  <div style={{fontSize:13,fontWeight:600,color:"#172F39"}}>{nextDayLabel}</div>
                  {nextDateAlreadyHas>0 && (
                    <div style={{fontSize:11,color:"#E65100",marginTop:6}}>⚠️ {t.matContinueWarnExisting.replace("{n}", nextDateAlreadyHas)}</div>
                  )}
                </div>

                <div style={{display:"flex",gap:8}}>
                  <button onClick={confirmContinue} style={{flex:1,padding:"9px",borderRadius:7,background:"#1A6B8A",border:"none",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer"}}>
                    ✓ {t.matContinueConfirm}
                  </button>
                  <button onClick={()=>setContinueTarget(null)} style={{padding:"9px 16px",borderRadius:7,background:"transparent",border:"0.5px solid #CFD8DC",color:"#546E7A",fontSize:13,cursor:"pointer"}}>
                    {t.cancel}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
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

          {/* ── Date filter pills — actual class occurrences that have material, not recurring days ── */}
          <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:"0.75rem",maxHeight:80,overflowY:"auto"}}>
            <button onClick={()=>setDateFilter("all")} style={{padding:"4px 11px",borderRadius:20,fontSize:11,cursor:"pointer",border:dateFilter==="all"?"none":"0.5px solid #CFD8DC",background:dateFilter==="all"?"#1A6B8A":"transparent",color:dateFilter==="all"?"#fff":"#546E7A"}}>
              {t.allDays} ({materials.filter(m=>m.courseId===course.id).length})
            </button>
            {datesWithMat.map(d => {
              const cnt = materials.filter(m => m.courseId===course.id && m.date===d).length;
              return (
                <button key={d} onClick={()=>setDateFilter(d)} style={{padding:"4px 11px",borderRadius:20,fontSize:11,cursor:"pointer",border:dateFilter===d?"none":"0.5px solid #CFD8DC",background:dateFilter===d?"#1A6B8A":"transparent",color:dateFilter===d?"#fff":"#546E7A",whiteSpace:"nowrap"}}>
                  {fmtDateLabel(d)}{cnt > 0 ? ` (${cnt})` : ""}
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
              <div style={{display:"flex",gap:6}}>
                <button onClick={()=>setShowBatchInPanel(true)} style={{display:"flex",alignItems:"center",gap:5,padding:"6px 12px",borderRadius:7,background:"transparent",border:"1px solid #4A9FD4",color:"#1A6B8A",fontSize:12,cursor:"pointer",fontWeight:500}}>
                  📦 {lang==="zh"?"批次輸入":"Batch Input"}
                </button>
                <button onClick={openAdd} style={{display:"flex",alignItems:"center",gap:5,padding:"6px 14px",borderRadius:7,background:"#1A6B8A",border:"none",color:"#fff",fontSize:12,cursor:"pointer",fontWeight:500}}>
                  + {t.addMaterial}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div style={{flex:1,overflowY:"auto",padding:"0 1.25rem 1.5rem"}}>

          {/* Add / Edit Form */}
          {showForm && canEdit && (
            <div style={{background:"#F5F5F5",borderRadius:12,border:"0.5px solid #E0E0E0",padding:"1rem",marginBottom:"1rem"}}>
              <div style={{fontWeight:500,fontSize:13,color:"#172F39",marginBottom:4}}>{editing ? t.editMaterial : t.addMaterial}</div>
              <div style={{fontSize:11,color:"#9E9E9E",marginBottom:8}}>{lang==="zh"?"教材綁定於「這一堂課的實際日期」，不會套用到其他週次":"Materials are tied to this exact class date — they won't carry over to other weeks"}</div>

              {/* Date selector — pick from the course's real scheduled occurrences */}
              <label style={lStyle}>{t.materialDate}</label>
              {validDates.length > 0 ? (
                <select style={iStyle} value={validDates.includes(form.date) ? form.date : ""} onChange={e=>fset("date",e.target.value)}>
                  {!validDates.includes(form.date) && <option value="">{lang==="zh"?"— 非排課日期 —":"— Not a scheduled date —"}</option>}
                  {validDates.map(d => {
                    const onLeave = isLeaveDate(d);
                    return (
                      <option key={d} value={d} disabled={onLeave}>
                        {fmtDateLabel(d)}{d===today?(lang==="zh"?"（今天）":" (today)"):""}{onLeave?(lang==="zh"?"（已請假）":" (on leave)"):""}
                      </option>
                    );
                  })}
                </select>
              ) : (
                <div style={{fontSize:11,color:"#E65100",background:"#FFF3E0",borderRadius:6,padding:"6px 10px",marginBottom:4}}>
                  {lang==="zh"?"此課程尚無排課紀錄，請先於「付費與排課」建立排課":"No enrollment yet — set one up in 付費與排課 first"}
                </div>
              )}
              {/* Manual override — for a rescheduled/make-up class not in the standard list */}
              <input type="date" style={{...iStyle,marginTop:6}} value={form.date} onChange={e=>fset("date",e.target.value)}/>
              {validDates.length>0 && !validDates.includes(form.date) && (
                <div style={{fontSize:10,color:"#E65100",marginTop:3}}>⚠️ {lang==="zh"?"此日期不在課程的標準排課中（可能是補課），仍會依此日期顯示":"This date isn't in the standard schedule (maybe a make-up class) — it'll still show based on this date"}</div>
              )}

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
                const isOrphanDate = validDates.length && !validDates.includes(m.date);
                return (
                <div key={m.id} style={{background:"#F5F5F5",border:`0.5px solid ${isOrphanDate?"#FFB74D":"#E0E0E0"}`,borderRadius:10,padding:"12px 14px",marginBottom:6}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
                    <div style={{flex:1,minWidth:0}}>
                      {/* Index badge + title */}
                      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2,flexWrap:"wrap"}}>
                        <span style={{fontSize:10,background:"#FFFFFF",border:"0.5px solid #CFD8DC",borderRadius:4,padding:"1px 6px",color:"#9E9E9E",flexShrink:0}}>#{idx+1}</span>
                        <span style={{fontWeight:500,fontSize:13,color:"#172F39",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.title}</span>
                        {isOrphanDate && (
                          <span style={{fontSize:10,background:"#FFF3E0",color:"#E65100",borderRadius:4,padding:"1px 7px",fontWeight:600,flexShrink:0}} title={lang==="zh"?"此日期不是課程的排課日，可能是補課或排課已異動，請確認":"This date isn't a scheduled class day — might be a make-up class or the schedule changed. Please confirm."}>
                            ⚠️ {lang==="zh"?"非排課日":"Not a scheduled day"}
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
                        {getNextValidDate(m.date) && (
                          <button onClick={()=>setContinueTarget(m)} title={t.matContinueHint} style={{fontSize:11,background:"transparent",border:"0.5px solid #1A6B8A",borderRadius:5,color:"#1A6B8A",padding:"3px 9px",cursor:"pointer"}}>
                            ➡️ {t.matContinueBtn}
                          </button>
                        )}
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
function CourseDetailModal({ course, dayIndex, date, users, lang, materials, setMaterials, onClose, currentUser, enrollments, attendance, absences, setToast }) {
  const t = T[lang];
  const teacher = users.find(u=>u.id===course.teacherId);
  const student  = users.find(u=>u.id===course.studentId);
  // A rescheduled ("更換時間補課") session stores its actual new time as
  // customStart on that specific scheduledDates entry — using the course's
  // regular weekly pattern here instead was the bug: the schedule cards
  // (built via getWeekSlots, which does check customStart) showed the
  // correct updated time, but this modal — and everything derived from it,
  // including "複製課程資訊" — independently recomputed the OLD time from
  // scratch and never looked at the override.
  const enr = (enrollments||[]).find(e => e.courseId===course.id && (e.scheduledDates||[]).some(s=>s.date===date));
  const sessionEntry = enr?.scheduledDates?.find(s=>s.date===date);
  const startTime = sessionEntry ? resolveSessionStart(course, sessionEntry) : getCourseStartForDay(course, dayIndex);
  const endTime  = addMins(startTime, course.duration);
  const dayMats  = materials.filter(m=>m.courseId===course.id&&(date ? m.date===date : m.dayIndex===dayIndex))
    .sort((a,b)=>(b.date||"").localeCompare(a.date||""));
  const [copied, setCopied] = useState(false);
  const [continuedNow, setContinuedNow] = useState(false);

  // Admin/assistant only: if this session has no material yet, show the
  // most recent PAST session's material as a muted reference, with a
  // one-click way to just reuse it here instead of having to retype it.
  //
  // Bug fix: this used to just grab whichever material had the closest
  // earlier date for this course — no check that the date actually
  // corresponded to a real, ACTUALLY-TAUGHT session. That could surface a
  // material that was only ever pre-assigned to a class that got excused/
  // cancelled before it was used, or (if the course had a gap between
  // enrollment periods) a stale material from an unrelated, much-earlier
  // stretch. Now it walks backward through this course's real scheduled
  // sessions (across any enrollment period), skips any that were excused/
  // absent, and returns the material from the first ACTUALLY-TAUGHT one
  // that has a material at all.
  const canSeePrevMat = currentUser?.role==="admin" || currentUser?.role==="assistant";
  const prevMat = (() => {
    if (!canSeePrevMat || dayMats.length!==0 || !date) return null;
    const priorSessions = (enrollments||[])
      .filter(e => e.courseId===course.id)
      .flatMap(e => (e.scheduledDates||[]).map(s => ({...s, enrollmentId:e.id})))
      .filter(s => s.date && s.date < date)
      .sort((a,b) => b.date.localeCompare(a.date)); // most recent first
    for (const s of priorSessions) {
      const attRec = (attendance||[]).find(a=>a.enrollmentId===s.enrollmentId && a.date===s.date);
      const absRec = (absences||[]).find(a=>a.courseId===course.id && a.dateStr===s.date);
      if ((attRec && attRec.type!=="other") || absRec) continue; // that session was excused/absent — not really taught, skip it
      const mat = materials.find(m=>m.courseId===course.id && m.date===s.date);
      if (mat) return mat;
    }
    return null;
  })();
  const continuePrevMat = () => {
    if (!prevMat || !date) return;
    setMaterials(prev => [...(prev||[]), {
      id: genId(), courseId: course.id, date, dayIndex,
      title: prevMat.title, url: prevMat.url, desc: prevMat.desc,
      addedBy: currentUser?.id || "admin", addedAt: new Date().toISOString(),
    }]);
    setContinuedNow(true);
    setToast?.(lang==="zh"?"已沿用上一堂教材":"Reused the previous class's material");
  };

  // Build the date for this day-of-week (this week)
  // Same principle as the time fix above: `date` is already the correct,
  // authoritative date passed in from the schedule (getWeekSlots resolves it
  // properly for whatever week is being viewed). getDateForDow(dayIndex) is
  // week-blind — it only ever computes "this calendar week's" date for that
  // weekday, so it would silently show the WRONG date whenever viewing any
  // week other than the current one. Only fall back to it if no date was
  // actually passed in.
  const classDate = date || getDateForDow(dayIndex); // YYYY-MM-DD

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
**${startTime}-${endTime} **${student?.name||""}

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
            {icon:"⏰", label: lang==="zh"?"時間":"Time",      val: `${startTime} – ${endTime} (${course.duration}min)`},
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
                ? (
                  <>
                    <div style={{fontSize:12,color:"#9E9E9E",marginBottom:prevMat&&!continuedNow?6:0}}>—</div>
                    {continuedNow && (
                      <div style={{fontSize:11,color:"#2E7D32"}}>✓ {lang==="zh"?"已沿用上一堂教材":"Reused previous class's material"}</div>
                    )}
                    {prevMat && !continuedNow && (
                      <div style={{background:"#F5F5F5",borderRadius:6,padding:"7px 9px"}}>
                        <div style={{fontSize:10,color:"#9E9E9E",marginBottom:2}}>{lang==="zh"?`上一堂教材（${prevMat.date}，僅供參考）`:`Previous class's material (${prevMat.date}, for reference)`}</div>
                        <div style={{fontSize:11,color:"#9E9E9E",marginBottom:1}}>{prevMat.title}</div>
                        <div style={{fontSize:10,color:"#B0B0B0",wordBreak:"break-all",marginBottom:6}}>{prevMat.url}</div>
                        <button onClick={continuePrevMat} style={{fontSize:11,padding:"4px 11px",borderRadius:5,background:"#1A6B8A",border:"none",color:"#fff",cursor:"pointer",fontWeight:500}}>
                          {lang==="zh"?"是否繼續沿用？":"Continue using this?"}
                        </button>
                      </div>
                    )}
                  </>
                )
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
function SlotListView({ slots, users, lang, currentUser, absences, materials, setMaterials, onAbsent, setToast, weekDates, weekOffset, attendance, setAttendance, enrollments, setEnrollments, courses, feedback, setFeedback, sharedView }) {
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
              return <SlotCourseCard key={sl.course.id+sl.date+sl.sessionNo} slot={sl} colorIdx={colorIdx} users={users} lang={lang} currentUser={currentUser} absences={absences} materials={materials} setMaterials={setMaterials} onAbsent={onAbsent} setToast={setToast} weekDates={weekDates} weekOffset={weekOffset} attendance={attendance} setAttendance={setAttendance} enrollments={enrollments} setEnrollments={setEnrollments} courses={courses} feedback={feedback} setFeedback={setFeedback} sharedView={sharedView}/>;
            })}
          </div>
        );
      })}
    </div>
  );
}

// ─── Slot-based Calendar View ─────────────────────────────────────────────────
function SlotCalendarView({ slots, users, lang, currentUser, absences, materials, setMaterials, onAbsent, setToast, weekDates, weekOffset, attendance, setAttendance, enrollments, setEnrollments, courses, feedback, setFeedback, sharedView }) {
  const t = T[lang];
  const todayDow = (new Date().getDay()+6)%7;
  const isThisWeek = weekOffset===0;
  const [matTarget, setMatTarget] = useState(null);
  const [detTarget, setDetTarget] = useState(null);
  const [adminEditTarget, setAdminEditTarget] = useState(null); // slot being edited by admin
  const [fbTarget, setFbTarget] = useState(null); // slot being written/viewed for feedback
  const isAdmin = currentUser.role==="admin";
  const isAssistant = currentUser.role==="assistant";
  const isTeacher = currentUser.role==="teacher";
  const isStudent = currentUser.role==="student";
  const byDay = {};
  slots.forEach(s=>{ if(!byDay[s.dayIndex]) byDay[s.dayIndex]=[]; byDay[s.dayIndex].push(s); });

  // Same "copy this teacher's whole day" action as the list view — the
  // calendar view is the DEFAULT one people land on, so it needs the button
  // too, not just the list view.
  const [dayCopiedKey, setDayCopiedKey] = useState(null);
  const copyDayForTeacher = (teacherId, date) => {
    const daySessions = [];
    enrollments.forEach(enr => {
      const c = courses.find(x=>x.id===enr.courseId);
      if (!c || c.teacherId !== teacherId) return;
      (enr.scheduledDates||[]).forEach(s => {
        if (s.date !== date) return;
        const sStart = s.customStart || getCourseStartForDay(c, s.dayIndex);
        const attRec = (attendance||[]).find(a=>a.enrollmentId===enr.id && a.date===date);
        const absRec = (absences||[]).find(a=>a.courseId===c.id && a.dateStr===date);
        daySessions.push({ course:c, start:sStart, isExcused: (attRec && attRec.type!=="other") || !!absRec });
      });
    });
    daySessions.sort((a,b)=>a.start.localeCompare(b.start));
    const dObj = new Date(date+"T00:00:00");
    const dayName = dObj.toLocaleDateString("en-US", {weekday:"long"});
    const dateFmt = `${dObj.getFullYear()}/${dObj.getMonth()+1}/${dObj.getDate()}`;
    const lines = [dayName, dateFmt];
    daySessions.forEach(sl => {
      const stu = users.find(u=>u.id===sl.course.studentId);
      const sEnd = addMins(sl.start, sl.course.duration);
      lines.push(`${sl.start}-${sEnd}`);
      lines.push(stu?.name || "");
      if (sl.isExcused) {
        // On leave — no point sending the material/meeting link for a class
        // that isn't actually happening.
        lines.push(lang==="zh"?"（請假）":"(On Leave)");
        return;
      }
      lines.push(sl.course.meetingUrl || "");
      materials.filter(m=>m.courseId===sl.course.id && m.date===date).forEach(m => {
        lines.push("Material");
        lines.push(m.url || "");
      });
    });
    const text = lines.join("\n");
    const key = `${teacherId}_${date}`;
    navigator.clipboard?.writeText(text).then(()=>{
      setDayCopiedKey(key); setTimeout(()=>setDayCopiedKey(null), 2000);
    }).catch(()=>{
      const ta = document.createElement("textarea");
      ta.value = text; document.body.appendChild(ta);
      ta.select(); document.execCommand("copy"); document.body.removeChild(ta);
      setDayCopiedKey(key); setTimeout(()=>setDayCopiedKey(null), 2000);
    });
  };

  return (
    <div style={{overflowX:"auto"}}>
      {matTarget&&<MaterialPanel course={matTarget.course} initialDate={matTarget.date} users={users} lang={lang} currentUser={currentUser} materials={materials} setMaterials={setMaterials} setToast={setToast} onClose={()=>setMatTarget(null)} enrollments={enrollments} attendance={attendance} absences={absences}/>}
      {detTarget&&<CourseDetailModal course={detTarget.course} dayIndex={detTarget.dayIndex} date={detTarget.date} users={users} lang={lang} materials={materials} setMaterials={setMaterials} onClose={()=>setDetTarget(null)} currentUser={currentUser} enrollments={enrollments} attendance={attendance} absences={absences} setToast={setToast}/>}
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
                  const col=sl.course.isTrial ? TRIAL_COLOR : COLORS[(sl.course.id.charCodeAt(0)||0)%COLORS.length];
                  const attRec=attendance.find(a=>a.enrollmentId===sl.enrollment.id&&a.date===sl.date);
                  // Same faded/"已請假" treatment whether the leave was self-
                  // reported (absences) OR recorded directly by admin
                  // (attendance excused/absent/teacher_leave) — previously
                  // only self-reported ones got it, so admin-arranged leave
                  // silently looked identical to a normal upcoming class.
                  const isAbsent=absences.some(a=>a.courseId===sl.course.id&&a.dateStr===sl.date) || (attRec && attRec.type!=="other");
                  const status=classStatusForWeek(weekDates,sl.dayIndex,sl.start,sl.course.duration);
                  const isPast=status==="past";
                  const isOngoing=status==="ongoing";
                  const leaveOk=canRequestLeaveForWeek(weekDates,sl.dayIndex,sl.start,sl.course.duration);
                  const canAbsent=!sharedView&&(currentUser.role==="student"||currentUser.role==="teacher");
                  const endTime=addMins(sl.start,sl.course.duration);
                  const teacher=users.find(u=>u.id===sl.course.teacherId);
                  const student=users.find(u=>u.id===sl.course.studentId);
                  const fbRec=(feedback||[]).find(f=>f.enrollmentId===sl.enrollment.id&&f.date===sl.date);
                  const dayMatCount=materials.filter(m=>m.courseId===sl.course.id&&m.date===sl.date).length;
                  const dimText=isAbsent||isPast?"#9E9E9E":col.text;
                  const dimBorder=isAbsent||isPast?"#CFD8DC":col.border;
                  const showTeacherFbBtn = isTeacher && isPast;
                  const showStudentFbBtn = isStudent && isPast && fbRec?.status==="approved";
                  const fbColor = fbRec ? {pending:"#E65100",approved:"#2E7D32",rejected:"#D32F2F"}[fbRec.status] : "#7B1FA2";
                  return (
                    <div key={sl.course.id+sl.date+sl.sessionNo} style={{background:isAbsent?"#F9F9F9":col.bg,border:`1px solid ${dimBorder}`,borderRadius:6,padding:"5px 6px",marginBottom:3,opacity:isAbsent?0.55:isPast?0.6:1}}>
                      <div onClick={()=>setDetTarget({course:sl.course,dayIndex:sl.dayIndex,date:sl.date})} style={{cursor:"pointer",marginBottom:2,display:"flex",justifyContent:"space-between",gap:2}}>
                        <div style={{fontSize:10,fontWeight:600,color:dimText,lineHeight:1.3,wordBreak:"break-word",flex:1}}>{sl.course.subject.length>18?sl.course.subject.slice(0,16)+"…":sl.course.subject}</div>
                        <span style={{fontSize:9,color:dimText,opacity:0.5}}>ℹ</span>
                      </div>
                      <div style={{fontSize:9,color:dimText,opacity:0.8,marginBottom:1}}>{sl.start}–{endTime}</div>
                      <div style={{fontSize:8,color:"#9E9E9E",marginBottom:2}}>#{sl.sessionNo}</div>
                      {currentUser.role==="admin"&&teacher&&<div style={{fontSize:9,color:dimText,opacity:0.7}}>{teacher.name}</div>}
                      {currentUser.role!=="student"&&student&&<div style={{fontSize:9,color:dimText,opacity:0.7}}>{student.name}</div>}
                      {isAbsent&&<div style={{fontSize:8,color:"#D32F2F",fontWeight:600}}>{lang==="zh"?"已請假":"Absent"}</div>}
                      {isOngoing&&<div style={{fontSize:8,color:"#4CAF50",fontWeight:600}}>{lang==="zh"?"進行中":"Live"}</div>}
                      {attRec&&<div style={{fontSize:8,color:attRec.type==="absent"?"#D32F2F":attRec.type==="excused"?"#1A6B8A":attRec.type==="teacher_leave"?"#FF9800":"#9E9E9E",fontWeight:600}}>{attRec.type==="absent"?(lang==="zh"?"缺勤":"Absent"):attRec.type==="excused"?(lang==="zh"?"請假":"Leave"):attRec.type==="teacher_leave"?(lang==="zh"?"師假":"T.Leave"):(lang==="zh"?"備註":"Note")}</div>}
                      <div style={{display:"flex",flexWrap:"wrap",gap:2,marginTop:3,alignItems:"center"}}>
                        {!isAbsent&&!isPast&&sl.course.meetingUrl&&<a href={sl.course.meetingUrl} target="_blank" rel="noreferrer" style={{fontSize:9,fontWeight:500,background:col.border,color:"#fff",borderRadius:3,padding:"2px 5px",textDecoration:"none"}}>{t.join}</a>}
                        {!isAbsent&&(
                          <a
                            href={buildGoogleCalendarUrl({
                              title: sl.course.subject,
                              dateStr: sl.date,
                              startTime: sl.start,
                              durationMins: sl.course.duration,
                              details: `${lang==="zh"?"老師":"Teacher"}: ${teacher?.name||"—"}\n${lang==="zh"?"學生":"Student"}: ${student?.name||"—"}${sl.course.meetingUrl?`\n${lang==="zh"?"上課連結":"Meeting link"}: ${sl.course.meetingUrl}`:""}`,
                              location: sl.course.meetingUrl||"",
                            })}
                            target="_blank" rel="noreferrer" title={t.addToGCal}
                            style={{fontSize:9,background:"transparent",border:`1px solid ${dimBorder}`,color:dimText,borderRadius:3,padding:"2px 5px",textDecoration:"none"}}
                          >📅</a>
                        )}
                        <button onClick={()=>setMatTarget({course:sl.course,date:sl.date})} style={{fontSize:9,background:"transparent",border:`1px solid ${dimBorder}`,color:dimText,borderRadius:3,padding:"2px 5px",cursor:"pointer"}}>📄{dayMatCount>0?` ${dayMatCount}`:""}</button>
                        {(isAdmin||isAssistant)&&(
                          <button onClick={()=>copyDayForTeacher(sl.course.teacherId,sl.date)} title={lang==="zh"?"複製老師當日課表":"Copy teacher's schedule for today"} style={{fontSize:8,background:"transparent",border:"none",color:dimText,padding:"1px 2px",cursor:"pointer",opacity:0.6}}>
                            {dayCopiedKey===`${sl.course.teacherId}_${sl.date}`?"✓":"📋"}
                          </button>
                        )}
                        {canAbsent&&!isAbsent&&!isPast&&!attRec&&<button onClick={()=>{if(leaveOk)onAbsent(sl.course,sl.dayIndex,sl.date,sl.start);else setToast(t.absentTooLate);}} style={{fontSize:8,background:"transparent",border:`1px solid ${leaveOk?"#9E9E9E":"#E0E0E0"}`,color:leaveOk?"#9E9E9E":"#CFD8DC",borderRadius:3,padding:"2px 4px",cursor:leaveOk?"pointer":"not-allowed",opacity:leaveOk?0.6:0.25,marginLeft:"auto"}} title={leaveOk?t.absent:t.absentTooLate}>{lang==="zh"?"假":"Lv"}</button>}
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
  const {course, date, dayIndex, sessionNo, enrollment, start:startTime} = slot;
  const teacher = users.find(u=>u.id===course.teacherId);
  const student  = users.find(u=>u.id===course.studentId);
  const endTime  = addMins(startTime, course.duration);

  // Existing record for this session
  const existing = attendance.find(a=>a.enrollmentId===enrollment.id&&a.date===date);
  const [type, setType] = useState(existing?.type||"normal");
  const [note, setNote] = useState(existing?.note||"");
  // "更換時間補課" — moves THIS ONE session to an admin-chosen date/time,
  // rather than creating an absence-style attendance record. Doesn't touch
  // totalSessions or any other session — it's a direct, single-session move.
  const [rsDate, setRsDate] = useState(date);
  const [rsTime, setRsTime] = useState(startTime);

  const OPTS = [
    {k:"normal",         icon:"✅", zh:"正常上課",          en:"Normal (attended)",        color:"#2E7D32", hint:lang==="zh"?"清除異常狀態":"Marks as attended"},
    {k:"excused",        icon:"📘", zh:"學生請假（順延）",   en:"Student Leave (deferred)", color:"#1A6B8A", hint:lang==="zh"?"不扣課，自動順延至下一堂":"Not deducted, auto-deferred"},
    {k:"teacher_leave",  icon:"👨‍🏫",zh:"老師請假（順延）",   en:"Teacher Leave (deferred)", color:"#FF9800", hint:lang==="zh"?"老師假，學生不扣課":"Teacher absent, not deducted"},
    {k:"absent",         icon:"❌", zh:"學生缺勤（扣課）",   en:"Absent (deducted)",        color:"#D32F2F", hint:lang==="zh"?"此堂扣課，不順延":"Session deducted"},
    {k:"reschedule",     icon:"🔄", zh:"更換時間補課",       en:"Reschedule / Make-up",     color:"#7B1FA2", hint:lang==="zh"?"只改這一堂到指定日期時段，不影響其他堂":"Moves only this session to a chosen date/time"},
    {k:"other",          icon:"📝", zh:"其他備註",           en:"Other / Note only",        color:"#9E9E9E", hint:lang==="zh"?"僅記錄備註，不影響計算":"Note only, no effect"},
  ];

  const doReschedule = () => {
    if (!rsDate || !rsTime) { setToast(lang==="zh"?"請選擇日期與時間":"Please pick a date and time"); return; }
    // Guard against creating a duplicate: if this enrollment already has a
    // DIFFERENT session on the target date, moving this one there would make
    // the same course show up twice on the same day in the schedule.
    const collision = (enrollment.scheduledDates||[]).some(s => s.date===rsDate && !(s.date===date && s.sessionNo===sessionNo));
    if (collision) {
      setToast(lang==="zh"?`${rsDate} 已經有這堂課的排課了，請選擇其他日期`:`This course already has a session on ${rsDate} — pick a different date`);
      return;
    }
    const newDayIndex = (new Date(rsDate+"T00:00:00").getDay()+6)%7;
    const newSched = (enrollment.scheduledDates||[]).map(s =>
      (s.date===date && s.sessionNo===sessionNo)
        ? { ...s, date: rsDate, dayIndex: newDayIndex, customStart: rsTime, rescheduledFrom: s.rescheduledFrom || date }
        : s
    );
    setEnrollments(es=>es.map(e=>e.id===enrollment.id?{...e,scheduledDates:newSched}:e));
    // Clear any attendance exception that was on the OLD date for this session (e.g. a stale leave record)
    setAttendance(prev=>prev.filter(a=>!(a.enrollmentId===enrollment.id&&a.date===date)));
    setToast(lang==="zh"?`已將此堂課改到 ${rsDate} ${rsTime}`:`This session moved to ${rsDate} ${rsTime}`);
    onClose();
  };

  const save = () => {
    if (type==="reschedule") { doReschedule(); return; }
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
      // If NEWLY marked excused/teacher_leave (wasn't already) → keep this
      // date visible on the schedule and append one compensating make-up
      // session, instead of the old approach of regenerating the whole
      // schedule (which deleted the excused date from scheduledDates
      // entirely — the actual cause of it not showing up on the calendar).
      const wasAlreadyDeferred = existing && (existing.type==="excused"||existing.type==="teacher_leave");
      if ((type==="excused"||type==="teacher_leave") && !wasAlreadyDeferred) {
        const newSched = deferExcusedSession(course, enrollment, date);
        setEnrollments(es=>es.map(e=>e.id===enrollment.id?{...e,scheduledDates:newSched}:e));
      }
      // If changed FROM excused/teacher_leave TO something else → remove
      // the compensating make-up session that was added for it (the
      // excused date's own entry was never removed, so nothing to restore there)
      if (wasAlreadyDeferred && type!=="excused" && type!=="teacher_leave") {
        const newSched = undoDeferExcusedSession(enrollment, date);
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
                <div>{date} ({T[lang].days[dayIndex]}) · {startTime}–{endTime}</div>
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

          {/* Reschedule date/time picker */}
          {type==="reschedule" && (
            <div style={{marginBottom:14,background:"#F3E5F5",borderRadius:8,padding:"12px 13px"}}>
              <div style={{fontSize:11,color:"#7B1FA2",marginBottom:8}}>{lang==="zh"?"這堂課原本在":"This session was originally on"} {date} ({T[lang].days[dayIndex]}) {startTime}</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div>
                  <label style={{fontSize:11,color:"#546E7A",display:"block",marginBottom:4}}>{lang==="zh"?"新日期":"New Date"}</label>
                  <input type="date" style={{width:"100%",boxSizing:"border-box",padding:"7px 9px",borderRadius:6,border:"0.5px solid #CFD8DC",background:"#FFFFFF",color:"#172F39",fontSize:13}} value={rsDate} onChange={e=>setRsDate(e.target.value)}/>
                </div>
                <div>
                  <label style={{fontSize:11,color:"#546E7A",display:"block",marginBottom:4}}>{lang==="zh"?"新時間":"New Time"}</label>
                  <input type="time" style={{width:"100%",boxSizing:"border-box",padding:"7px 9px",borderRadius:6,border:"0.5px solid #CFD8DC",background:"#FFFFFF",color:"#172F39",fontSize:13}} value={rsTime} onChange={e=>setRsTime(e.target.value)}/>
                </div>
              </div>
              {rsDate && <div style={{fontSize:11,color:"#7B1FA2",marginTop:8}}>→ {rsDate} ({T[lang].days[(new Date(rsDate+"T00:00:00").getDay()+6)%7]}) {rsTime}</div>}
            </div>
          )}

          {/* Note — hide for "normal" and "reschedule" (reschedule has its own date/time fields above) */}
          {type!=="normal" && type!=="reschedule" && (
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
// ─── Next-lesson material status — required alongside every feedback ─────────
// Forces the teacher to say, right when they write feedback, whether the
// next class's material is ready to go: YES (someone should prep new
// material), NO+reuse (topic isn't finished, just repeat what's there), or
// NO+specify (topic isn't finished, but here's what's coming next). Nothing
// can be saved without one of these three being answered.
function NextMaterialFields({ value, note, onValueChange, onNoteChange, lang, readOnly }) {
  const OPTIONS = [
    {key:"yes", label:"YES", hint: lang==="zh"?"請協助提供下一堂教材":"Please help prepare the next lesson's material"},
    {key:"no_continue", label:"NO", hint: lang==="zh"?"尚未完成授課教材，請沿用教材":"Haven't finished this material yet — reuse it for next class"},
    {key:"no_scope", label:"NO", hint: lang==="zh"?"尚未完成授課教材，下次上課的標題/範圍是：":"Haven't finished this material yet — next class's title/scope is:"},
  ];
  if (readOnly) {
    const chosen = OPTIONS.find(o=>o.key===value);
    if (!value) return null;
    return (
      <div style={{background:"#F5F5F5",borderRadius:7,padding:"9px 12px",marginTop:10,fontSize:12,color:"#546E7A"}}>
        <strong style={{color:"#172F39"}}>{lang==="zh"?"下一堂教材":"Next Lesson Material"}</strong>：{chosen?.label} — {chosen?.hint}
        {value==="no_scope" && note && <div style={{marginTop:3,color:"#172F39"}}>{lang==="zh"?"範圍":"Scope"}：{note}</div>}
      </div>
    );
  }
  return (
    <div style={{marginTop:12}}>
      <label style={{fontSize:12,color:"#546E7A",display:"block",marginBottom:6,fontWeight:500}}>
        {lang==="zh"?"下一堂教材準備狀況":"Next Lesson Material Status"} <span style={{color:"#D32F2F"}}>*</span>
      </label>
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {OPTIONS.map(o=>(
          <label key={o.key} style={{display:"flex",alignItems:"flex-start",gap:8,padding:"8px 10px",borderRadius:7,border:`1px solid ${value===o.key?"#1A6B8A":"#E0E0E0"}`,background:value===o.key?"#EEF6FB":"#FAFAFA",cursor:"pointer"}}>
            <input type="radio" checked={value===o.key} onChange={()=>onValueChange(o.key)} style={{marginTop:2,cursor:"pointer"}}/>
            <div style={{flex:1,minWidth:0}}>
              <span style={{fontSize:12,fontWeight:700,color:"#172F39"}}>{o.label}</span>
              <span style={{fontSize:11,color:"#9E9E9E",marginLeft:6}}>{o.hint}</span>
              {o.key==="no_scope" && value==="no_scope" && (
                <input
                  value={note} onChange={e=>onNoteChange(e.target.value)}
                  placeholder={lang==="zh"?"請填寫下次上課的標題/範圍…":"Enter next class's title/scope…"}
                  style={{width:"100%",boxSizing:"border-box",marginTop:6,padding:"7px 9px",borderRadius:5,border:"0.5px solid #CFD8DC",background:"#FFFFFF",color:"#172F39",fontSize:12}}
                  onClick={e=>e.stopPropagation()}
                />
              )}
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}

function FeedbackModal({ slot, currentUser, users, lang, feedback, setFeedback, setToast, onClose, readOnly }) {
  const t = T[lang];
  const {course, date, dayIndex, sessionNo, enrollment, start:startTime} = slot;
  const teacher = users.find(u=>u.id===course.teacherId);
  const student  = users.find(u=>u.id===course.studentId);
  const endTime  = addMins(startTime, course.duration);

  const existing = feedback.find(f=>f.enrollmentId===enrollment.id && f.date===date);
  const [text, setText] = useState(existing?.text || "");
  const [nextMat, setNextMat] = useState(existing?.nextMaterialStatus || "");
  const [nextMatNote, setNextMatNote] = useState(existing?.nextMaterialNote || "");
  const nextMatValid = nextMat && (nextMat!=="no_scope" || nextMatNote.trim());
  const canSave = text.trim() && nextMatValid;

  const STATUS_META = {
    pending:  {label:t.feedbackStatusPending,  color:"#E65100", bg:"#FFF3E0"},
    approved: {label:t.feedbackStatusApproved, color:"#2E7D32", bg:"#E8F5E9"},
    rejected: {label:t.feedbackStatusRejected, color:"#D32F2F", bg:"#FFEBEE"},
  };
  const statusMeta = existing ? STATUS_META[existing.status] : null;

  const save = () => {
    if (!canSave) return;
    const rec = {
      id: existing?.id || genId(),
      enrollmentId: enrollment.id,
      courseId: course.id,
      studentId: course.studentId,
      teacherId: course.teacherId,
      date, dayIndex, sessionNo,
      text: text.trim(),
      nextMaterialStatus: nextMat,
      nextMaterialNote: nextMat==="no_scope" ? nextMatNote.trim() : "",
      status: "pending", // (re)submitting always resets to pending for review
      source: currentUser.role==="assistant" ? "assistant" : "teacher", // who wrote it — rejections need to go back to them
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
                <div>{date} ({T[lang].days[dayIndex]}) · {startTime}–{endTime}</div>
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

          {!readOnly && <NextMaterialFields value={nextMat} note={nextMatNote} onValueChange={setNextMat} onNoteChange={setNextMatNote} lang={lang}/>}

          {/* Buttons */}
          {!readOnly && (
            <div style={{display:"flex",gap:8,marginTop:14}}>
              <button onClick={save} disabled={!canSave} style={{flex:1,background:canSave?"#1A6B8A":"#E0E0E0",border:"none",borderRadius:7,color:canSave?"#fff":"#9E9E9E",padding:"10px",fontSize:13,fontWeight:600,cursor:canSave?"pointer":"not-allowed"}}>
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
function SlotCourseCard({ slot, colorIdx, users, lang, currentUser, absences, materials, setMaterials, onAbsent, setToast, weekDates, weekOffset, attendance, setAttendance, enrollments, setEnrollments, courses, feedback, setFeedback, sharedView }) {
  const t = T[lang];
  const {course, dayIndex, date, enrollment, sessionNo, start, rescheduledFrom} = slot;
  const teacher = users.find(u=>u.id===course.teacherId);
  const student  = users.find(u=>u.id===course.studentId);
  const col = course.isTrial ? TRIAL_COLOR : COLORS[colorIdx%COLORS.length];
  const endTime = addMins(start, course.duration);
  const attRec   = (attendance||[]).find(a=>a.enrollmentId===enrollment.id&&a.date===date);
  // Same faded/"已請假" treatment whether the leave was self-reported
  // (absences) OR recorded directly by admin (attendance excused/absent/
  // teacher_leave) — previously only self-reported ones got it.
  const isAbsent = absences.some(a=>a.courseId===course.id&&a.dateStr===date) || (attRec && attRec.type!=="other");
  const canAbsent = !sharedView && (currentUser.role==="student"||currentUser.role==="teacher");
  const isAdmin = currentUser.role==="admin";
  const isAssistant = currentUser.role==="assistant";
  const isTeacher = currentUser.role==="teacher";
  const isStudent = currentUser.role==="student";
  const leaveOk  = canRequestLeaveForWeek(weekDates, dayIndex, start, course.duration);
  const status   = classStatusForWeek(weekDates, dayIndex, start, course.duration);
  const isPast   = status==="past";
  const isOngoing= status==="ongoing";
  const totalMatCount = materials.filter(m=>m.courseId===course.id).length;
  const dayMatCount   = materials.filter(m=>m.courseId===course.id&&m.date===date).length;
  const fbRec = (feedback||[]).find(f=>f.enrollmentId===enrollment.id&&f.date===date);
  const [showMat, setShowMat] = useState(false);
  const [matInitDate, setMatInitDate] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showAdminEdit, setShowAdminEdit] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const openMat = (d) => { setMatInitDate(d); setShowMat(true); };

  // ── Small, unobtrusive "copy today's schedule for this teacher" button —
  // separate from the single-session "複製課程資訊" inside the detail modal.
  // Gathers EVERY session this same teacher has on this same date (not just
  // this one card) into one paste-ready block: day name, date, then each
  // session's time / student / meeting link / material link in sequence —
  // meant to be sent straight to the teacher as a same-day reminder.
  const [dayCopied, setDayCopied] = useState(false);
  const copyDayForTeacher = () => {
    const teacherId = course.teacherId;
    const daySessions = [];
    enrollments.forEach(enr => {
      const c = courses.find(x=>x.id===enr.courseId);
      if (!c || c.teacherId !== teacherId) return;
      (enr.scheduledDates||[]).forEach(s => {
        if (s.date !== date) return;
        const sStart = s.customStart || getCourseStartForDay(c, s.dayIndex);
        const attRec = (attendance||[]).find(a=>a.enrollmentId===enr.id && a.date===date);
        const absRec = (absences||[]).find(a=>a.courseId===c.id && a.dateStr===date);
        daySessions.push({ course:c, enrollment:enr, start:sStart, isExcused: (attRec && attRec.type!=="other") || !!absRec });
      });
    });
    daySessions.sort((a,b)=>a.start.localeCompare(b.start));

    const dObj = new Date(date+"T00:00:00");
    const dayName = dObj.toLocaleDateString("en-US", {weekday:"long"});
    const dateFmt = `${dObj.getFullYear()}/${dObj.getMonth()+1}/${dObj.getDate()}`;
    const lines = [dayName, dateFmt];
    daySessions.forEach(sl => {
      const stu = users.find(u=>u.id===sl.course.studentId);
      const sEnd = addMins(sl.start, sl.course.duration);
      lines.push(`${sl.start}-${sEnd}`);
      lines.push(stu?.name || "");
      if (sl.isExcused) {
        lines.push(lang==="zh"?"（請假）":"(On Leave)");
        return;
      }
      lines.push(sl.course.meetingUrl || "");
      materials.filter(m=>m.courseId===sl.course.id && m.date===date).forEach(m => {
        lines.push("Material");
        lines.push(m.url || "");
      });
    });
    const text = lines.join("\n");
    navigator.clipboard?.writeText(text).then(()=>{
      setDayCopied(true); setTimeout(()=>setDayCopied(false), 2000);
    }).catch(()=>{
      const ta = document.createElement("textarea");
      ta.value = text; document.body.appendChild(ta);
      ta.select(); document.execCommand("copy"); document.body.removeChild(ta);
      setDayCopied(true); setTimeout(()=>setDayCopied(false), 2000);
    });
  };

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
      {showDetail&&<CourseDetailModal course={course} dayIndex={dayIndex} date={date} users={users} lang={lang} materials={materials} setMaterials={setMaterials} onClose={()=>setShowDetail(false)} currentUser={currentUser} enrollments={enrollments} attendance={attendance} absences={absences} setToast={setToast}/>}
      {showMat&&<MaterialPanel course={course} initialDate={matInitDate} users={users} lang={lang} currentUser={currentUser} materials={materials} setMaterials={setMaterials} setToast={setToast} onClose={()=>setShowMat(false)} enrollments={enrollments} attendance={attendance} absences={absences}/>}
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
            <span style={{fontSize:12,color:textCol,opacity:0.9,whiteSpace:"nowrap"}}>{start}–{endTime}·{course.duration}m</span>
            <button onClick={()=>setShowDetail(true)} style={{background:"transparent",border:`1px solid ${textCol}44`,borderRadius:4,color:textCol,fontSize:11,padding:"1px 6px",cursor:"pointer",opacity:0.7}}>ℹ</button>
            {/* Small, deliberately low-key — copies THIS teacher's whole day
                (all their sessions today, not just this card) as one block
                to paste straight to them */}
            {(isAdmin||isAssistant)&&(
              <button onClick={copyDayForTeacher} title={lang==="zh"?"複製老師當日課表":"Copy teacher's schedule for today"} style={{background:"transparent",border:"none",color:textCol,fontSize:9,padding:"1px 3px",cursor:"pointer",opacity:0.4}}>
                {dayCopied?"✓":"📋"}
              </button>
            )}
            {/* Admin session edit button — all sessions, all times */}
            {isAdmin&&<button onClick={()=>setShowAdminEdit(true)} title={t.adminSessionEdit} style={{background:attRec?"rgba(26,107,138,0.1)":"transparent",border:`1px solid ${attRec?"#1A6B8A":"#CFD8DC"}`,borderRadius:4,color:attRec?"#1A6B8A":"#9E9E9E",fontSize:11,padding:"1px 6px",cursor:"pointer",fontWeight:attRec?600:400}}>📝</button>}
          </div>
        </div>
        {currentUser.role!=="teacher"&&teacher&&<div style={{fontSize:12,color:textCol,opacity:0.85,marginTop:3}}>{t.teacher}: {teacher.name}</div>}
        {currentUser.role!=="student"&&student&&<div style={{fontSize:12,color:textCol,opacity:0.85}}>{t.student}: {student.name}</div>}
        {isAdmin&&<div style={{fontSize:11,color:"#9E9E9E",marginTop:1}}>{lang==="zh"?"付費排課":"Enrollment"}: {enrollment.payDate} · {enrollment.totalSessions}{lang==="zh"?"堂":"sess."}</div>}
        {isAbsent&&<div style={{fontSize:11,color:"#D32F2F",marginTop:3,fontWeight:500}}>● {t.absentAlready}</div>}
        {attBadge&&<div style={{fontSize:11,color:attBadge.color,background:attBadge.bg,borderRadius:4,padding:"2px 8px",marginTop:4,display:"inline-block",fontWeight:500}}>● {attBadge.label}{attRec?.note?` — ${attRec.note}`:""}</div>}
        {rescheduledFrom&&<div style={{fontSize:11,color:"#7B1FA2",background:"rgba(123,31,162,0.1)",borderRadius:4,padding:"2px 8px",marginTop:4,display:"inline-block",fontWeight:500}}>🔄 {lang==="zh"?`補課（原定 ${rescheduledFrom}）`:`Rescheduled (was ${rescheduledFrom})`}</div>}
        {/* Feedback status badge — visible to teacher (their own submission) and admin */}
        {fbRec && (isTeacher||isAdmin) && (
          <div style={{fontSize:11,color:FB_STATUS[fbRec.status].color,marginTop:4,fontWeight:500}}>💬 {t.feedbackShort}: {FB_STATUS[fbRec.status].label}</div>
        )}
        <div style={{display:"flex",gap:6,marginTop:8,flexWrap:"wrap",alignItems:"center"}}>
          {!isAbsent&&!isPast&&course.meetingUrl&&<a href={course.meetingUrl} target="_blank" rel="noreferrer" style={{fontSize:13,fontWeight:500,background:col.border,color:"#fff",borderRadius:6,padding:"5px 14px",textDecoration:"none"}}>{t.join}</a>}
          {!isAbsent&&(
            <a
              href={buildGoogleCalendarUrl({
                title: course.subject,
                dateStr: date,
                startTime: start,
                durationMins: course.duration,
                details: `${lang==="zh"?"老師":"Teacher"}: ${teacher?.name||"—"}\n${lang==="zh"?"學生":"Student"}: ${student?.name||"—"}${course.meetingUrl?`\n${lang==="zh"?"上課連結":"Meeting link"}: ${course.meetingUrl}`:""}`,
                location: course.meetingUrl||"",
              })}
              target="_blank" rel="noreferrer"
              title={t.addToGCal}
              style={{fontSize:13,fontWeight:500,background:"transparent",border:`1.5px solid ${isPast?"#CFD8DC":col.border}`,color:textCol,borderRadius:6,padding:"5px 14px",textDecoration:"none",display:"inline-flex",alignItems:"center",gap:4}}
            >
              📅 {t.addToGCalShort}
            </a>
          )}
          <button onClick={()=>openMat(date)} style={{fontSize:13,fontWeight:500,background:"transparent",border:`1.5px solid ${isAbsent||isPast?"#CFD8DC":col.border}`,color:textCol,borderRadius:6,padding:"5px 14px",cursor:"pointer"}}>
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
            <button onClick={()=>{if(leaveOk)onAbsent(course,dayIndex,date,start);else setToast(t.absentTooLate);}}
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
        // Resolve THIS day's actual start time — a course can have different
        // times on different days (e.g. Sat 9:00, Sun 8:00), so we can't just
        // assume course.start applies uniformly. A one-off reschedule/make-up
        // (customStart) always wins over the course's regular pattern.
        const start = s.customStart || getCourseStartForDay(course, s.dayIndex);
        slots.push({ course, dayIndex: s.dayIndex, date: s.date, enrollment: enr, sessionNo: s.sessionNo, start, rescheduledFrom: s.rescheduledFrom||null });
      }
    });
  });
  // Sort by dayIndex then start time
  slots.sort((a,b) => a.dayIndex - b.dayIndex || a.start.localeCompare(b.start));
  return slots;
}

// ─── Week export modal — pick sessions, download as one .ics file ───────────
function WeekExportModal({ weekSlots, absences, lang, setToast, onClose }) {
  const t = T[lang];
  const notAbsent = (sl) => !absences.some(a=>a.courseId===sl.course.id&&a.dateStr===sl.date);
  const exportable = weekSlots.filter(notAbsent);
  const [selected, setSelected] = useState(new Set(exportable.map((_,i)=>i)));

  const toggle = (i) => setSelected(prev=>{const n=new Set(prev); n.has(i)?n.delete(i):n.add(i); return n;});
  const allSelected = exportable.length>0 && exportable.every((_,i)=>selected.has(i));
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(exportable.map((_,i)=>i)));

  const doExport = () => {
    const picked = exportable.filter((_,i)=>selected.has(i));
    if (!picked.length) return;
    const events = picked.map(sl => ({
      title: sl.course.subject,
      dateStr: sl.date,
      startTime: sl.start,
      durationMins: sl.course.duration,
      details: sl.course.meetingUrl ? `${lang==="zh"?"上課連結":"Meeting link"}: ${sl.course.meetingUrl}` : "",
      location: sl.course.meetingUrl || "",
      uid: `${sl.course.id}-${sl.date}-${sl.sessionNo}`,
    }));
    downloadICS(events, `schedule_${weekSlots[0]?.date||""}.ics`);
    setToast(t.weekExportDone.replace("{n}", picked.length));
    onClose();
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9300,padding:"1rem"}}>
      <div style={{background:"#FFFFFF",borderRadius:16,width:"100%",maxWidth:440,boxSizing:"border-box",boxShadow:"0 8px 36px rgba(23,47,57,0.2)",overflow:"hidden",maxHeight:"85vh",display:"flex",flexDirection:"column"}}>
        <div style={{background:"#172F39",padding:"13px 18px",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
          <span style={{fontSize:14,fontWeight:600,color:"#fff"}}>📅 {t.weekExportTitle}</span>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.15)",border:"none",borderRadius:"50%",width:28,height:28,cursor:"pointer",color:"#fff",fontSize:16}}>×</button>
        </div>
        <div style={{padding:"16px 18px",overflowY:"auto",flex:1,minHeight:0}}>
          <p style={{fontSize:12,color:"#546E7A",margin:"0 0 12px",lineHeight:1.6}}>{t.weekExportDesc}</p>

          {exportable.length===0 ? (
            <p style={{color:"#9E9E9E",fontSize:13,textAlign:"center",padding:"1.5rem 0"}}>{t.weekExportNone}</p>
          ) : (
            <>
              <label style={{display:"flex",alignItems:"center",gap:8,padding:"6px 4px",fontSize:12,color:"#546E7A",cursor:"pointer",borderBottom:"0.5px solid #F0F0F0",marginBottom:4,fontWeight:500}}>
                <input type="checkbox" checked={allSelected} onChange={toggleAll} style={{cursor:"pointer"}}/>
                {t.weekExportSelectAll} ({exportable.length})
              </label>
              <div style={{display:"flex",flexDirection:"column",gap:2,maxHeight:280,overflowY:"auto"}}>
                {exportable.map((sl,i)=>(
                  <label key={i} style={{display:"flex",alignItems:"center",gap:9,padding:"7px 6px",borderRadius:6,cursor:"pointer",background:selected.has(i)?"#EEF6FB":"transparent"}}>
                    <input type="checkbox" checked={selected.has(i)} onChange={()=>toggle(i)} style={{cursor:"pointer"}}/>
                    <div style={{minWidth:0}}>
                      <div style={{fontSize:12,fontWeight:600,color:"#172F39",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{sl.course.subject}</div>
                      <div style={{fontSize:11,color:"#9E9E9E"}}>{sl.date} ({T[lang].days[sl.dayIndex]}) · {sl.start}</div>
                    </div>
                  </label>
                ))}
              </div>
            </>
          )}

          <div style={{fontSize:11,color:"#1A6B8A",background:"#EEF6FB",borderRadius:6,padding:"9px 11px",marginTop:14,lineHeight:1.6}}>
            ℹ️ {t.weekExportHowTo}
          </div>
        </div>
        <div style={{display:"flex",gap:8,padding:"12px 18px 16px",borderTop:"0.5px solid #E0E0E0",flexShrink:0}}>
          <button onClick={doExport} disabled={selected.size===0} style={{flex:1,padding:"10px",borderRadius:7,background:selected.size>0?"#1A6B8A":"#E0E0E0",border:"none",color:selected.size>0?"#fff":"#9E9E9E",fontSize:13,fontWeight:600,cursor:selected.size>0?"pointer":"not-allowed"}}>
            ⬇ {t.weekExportDownload} ({selected.size})
          </button>
          <button onClick={onClose} style={{padding:"10px 16px",borderRadius:7,background:"transparent",border:"0.5px solid #CFD8DC",color:"#546E7A",fontSize:13,cursor:"pointer"}}>
            {t.cancel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Bulk copy modal (admin) ──────────────────────────────────────────────────
// Check off any combination of this week's sessions and get one combined,
// ready-to-paste text block for all of them — the preview updates live as
// you check/uncheck, so there's no separate "generate" step.
function BulkCopyModal({ weekSlots, materials, users, lang, onClose }) {
  const t = T[lang];
  const [selected, setSelected] = useState(new Set());
  const [copied, setCopied] = useState(false);
  const getName = id => users.find(u=>u.id===id)?.name || "";

  const toggle = (i) => setSelected(prev=>{const n=new Set(prev); n.has(i)?n.delete(i):n.add(i); return n;});
  const allSelected = weekSlots.length>0 && weekSlots.every((_,i)=>selected.has(i));
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(weekSlots.map((_,i)=>i)));

  const blockFor = (sl) => {
    const student = getName(sl.course.studentId);
    const teacher = getName(sl.course.teacherId);
    const endTime = addMins(sl.start, sl.course.duration);
    const dayMats = materials.filter(m=>m.courseId===sl.course.id && m.date===sl.date);
    const matLine = dayMats.length ? dayMats.map(m=>`${m.title}${m.url?` ${m.url}`:""}`).join(lang==="zh"?"、":", ") : "—";
    return (
`===== ES English Today =====
 Date / 日期: ${sl.date} (${T[lang].days[sl.dayIndex]})
 Time&Student / 時間&學生: ${sl.start}-${endTime}  ${student}
 Teacher / 老師: ${teacher}
 Lesson Material / 課程教材: ${matLine}
 Class Link / 上課連結: ${sl.course.meetingUrl||"—"}
========================`
    );
  };

  const combinedText = weekSlots
    .filter((_,i)=>selected.has(i))
    .map(blockFor)
    .join("\n\n");

  const handleCopy = () => {
    if (!combinedText) return;
    navigator.clipboard?.writeText(combinedText).then(()=>{
      setCopied(true); setTimeout(()=>setCopied(false), 2500);
    }).catch(()=>{
      const ta = document.createElement("textarea");
      ta.value = combinedText; document.body.appendChild(ta);
      ta.select(); document.execCommand("copy"); document.body.removeChild(ta);
      setCopied(true); setTimeout(()=>setCopied(false), 2500);
    });
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9300,padding:"1rem"}}>
      <div style={{background:"#FFFFFF",borderRadius:16,width:"100%",maxWidth:560,boxSizing:"border-box",boxShadow:"0 8px 36px rgba(23,47,57,0.2)",overflow:"hidden",maxHeight:"85vh",display:"flex",flexDirection:"column"}}>
        <div style={{background:"#172F39",padding:"13px 18px",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
          <span style={{fontSize:14,fontWeight:600,color:"#fff"}}>📋 {lang==="zh"?"批量複製課堂資訊":"Bulk Copy Class Info"}</span>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.15)",border:"none",borderRadius:"50%",width:28,height:28,cursor:"pointer",color:"#fff",fontSize:16}}>×</button>
        </div>
        <div style={{padding:"16px 18px",overflowY:"auto",flex:1,minHeight:0}}>
          {weekSlots.length===0 ? (
            <p style={{color:"#9E9E9E",fontSize:13,textAlign:"center",padding:"1.5rem 0"}}>{lang==="zh"?"本週沒有堂次":"No sessions this week"}</p>
          ) : (
            <>
              <label style={{display:"flex",alignItems:"center",gap:8,padding:"6px 4px",fontSize:12,color:"#546E7A",cursor:"pointer",borderBottom:"0.5px solid #F0F0F0",marginBottom:4,fontWeight:500}}>
                <input type="checkbox" checked={allSelected} onChange={toggleAll} style={{cursor:"pointer"}}/>
                {lang==="zh"?"全選":"Select all"} ({weekSlots.length})
              </label>
              <div style={{display:"flex",flexDirection:"column",gap:2,maxHeight:220,overflowY:"auto",marginBottom:12}}>
                {weekSlots.map((sl,i)=>(
                  <label key={i} style={{display:"flex",alignItems:"center",gap:9,padding:"7px 6px",borderRadius:6,cursor:"pointer",background:selected.has(i)?"#EEF6FB":"transparent"}}>
                    <input type="checkbox" checked={selected.has(i)} onChange={()=>toggle(i)} style={{cursor:"pointer"}}/>
                    <div style={{minWidth:0}}>
                      <div style={{fontSize:12,fontWeight:600,color:"#172F39",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{sl.course.subject}</div>
                      <div style={{fontSize:11,color:"#9E9E9E"}}>{sl.date} ({T[lang].days[sl.dayIndex]}) · {sl.start} · {getName(sl.course.teacherId)} → {getName(sl.course.studentId)}</div>
                    </div>
                  </label>
                ))}
              </div>

              <div style={{fontSize:11,color:"#546E7A",fontWeight:500,marginBottom:6}}>
                {lang==="zh"?`預覽（已選 ${selected.size} 堂）`:`Preview (${selected.size} selected)`}
              </div>
              <div style={{background:"#FAFAFA",borderRadius:8,padding:"10px 12px",fontFamily:"monospace",fontSize:10,color:"#546E7A",lineHeight:1.7,whiteSpace:"pre-wrap",maxHeight:180,overflowY:"auto",border:"0.5px solid #E0E0E0"}}>
                {combinedText || (lang==="zh"?"（勾選上方堂次以預覽）":"(check sessions above to preview)")}
              </div>
            </>
          )}
        </div>
        <div style={{display:"flex",gap:8,padding:"12px 18px 16px",borderTop:"0.5px solid #E0E0E0",flexShrink:0}}>
          <button onClick={handleCopy} disabled={selected.size===0} style={{flex:1,padding:"10px",borderRadius:7,background:selected.size===0?"#E0E0E0":copied?"#4CAF50":"#1A6B8A",border:"none",color:selected.size===0?"#9E9E9E":"#fff",fontSize:13,fontWeight:600,cursor:selected.size===0?"not-allowed":"pointer",transition:"background 0.2s"}}>
            {copied ? (lang==="zh"?"✓ 已複製！":"✓ Copied!") : `📋 ${lang==="zh"?"複製":"Copy"} (${selected.size})`}
          </button>
          <button onClick={onClose} style={{padding:"10px 16px",borderRadius:7,background:"transparent",border:"0.5px solid #CFD8DC",color:"#546E7A",fontSize:13,cursor:"pointer"}}>
            {t.cancel}
          </button>
        </div>
      </div>
    </div>
  );
}

function ScheduleView({ currentUser, users, courses, lang, absences, setAbsences, materials, setMaterials, enrollments, setEnrollments, attendance, setAttendance, setToast, feedback, setFeedback, viewAsStudentId, sharedView, onGoToFeedback }) {
  const t = T[lang];
  const [viewMode, setViewMode] = useState("calendar");
  const [weekOffset, setWeekOffset] = useState(0);
  const [absentTarget, setAbsentTarget] = useState(null);
  const [showWeekExport, setShowWeekExport] = useState(false);
  const [showBulkCopy, setShowBulkCopy] = useState(false);
  const isAdmin = currentUser.role==="admin"||currentUser.role==="assistant";
  const [adminFilterType, setAdminFilterType] = useState("all"); // "all" | "teacher" | "student"
  const [adminFilterId, setAdminFilterId] = useState("all"); // used for teacher (single-select)
  const [adminSelectedStudents, setAdminSelectedStudents] = useState(new Set()); // used for student (multi-select) — empty = all
  const [showStudentPicker, setShowStudentPicker] = useState(false);

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
    if (viewAsStudentId) return enr.studentId===viewAsStudentId; // shared/guardian view — always a specific student's schedule
    if (!isAdmin) return currentUser.role==="teacher" ? course.teacherId===currentUser.id : enr.studentId===currentUser.id;
    // Admin filters
    if (adminFilterType==="teacher" && adminFilterId!=="all") return course.teacherId===adminFilterId;
    if (adminFilterType==="student" && adminSelectedStudents.size>0) return adminSelectedStudents.has(enr.studentId) || adminSelectedStudents.has(course.studentId);
    return true;
  });
  const weekSlots = getWeekSlots(courses, myEnrollments, weekDates);

  // ── Teacher-only: how many of MY past sessions still have no feedback ──
  // written yet. Shown as a persistent, hard-to-miss counter right on the
  // schedule page (the page teachers land on by default), not tucked away
  // only inside the Post-Class Feedback tab.
  const isTeacherView = currentUser.role==="teacher" && !viewAsStudentId && !sharedView;
  const missingFeedbackCount = isTeacherView ? (() => {
    const myCourseIds = new Set(courses.filter(c=>c.teacherId===currentUser.id).map(c=>c.id));
    let count = 0;
    enrollments.filter(enr=>myCourseIds.has(enr.courseId)).forEach(enr=>{
      const course = courses.find(c=>c.id===enr.courseId);
      if (!course) return;
      (enr.scheduledDates||[]).forEach(s=>{
        if (!isSessionOver(s.date, resolveSessionStart(course,s), course.duration)) return;
        const attRec = (attendance||[]).find(a=>a.enrollmentId===enr.id&&a.date===s.date);
        if (attRec && attRec.type!=="other") return; // absent/excused/teacher_leave sessions don't need feedback
        const hasFeedback = (feedback||[]).some(f=>f.enrollmentId===enr.id&&f.date===s.date);
        if (!hasFeedback) count++;
      });
    });
    return count;
  })() : 0;

  const enrolledCourseIds = new Set(myEnrollments.map(e=>e.courseId));
  const unenrolledCount = isAdmin ? courses.filter(c=>!enrolledCourseIds.has(c.id)).length : 0;

  // Label for current filter
  const filterLabel = isAdmin
    ? (adminFilterType==="teacher" && adminFilterId!=="all")
      ? users.find(u=>u.id===adminFilterId)?.name
      : (adminFilterType==="student" && adminSelectedStudents.size>0)
        ? (adminSelectedStudents.size===1
            ? users.find(u=>u.id===[...adminSelectedStudents][0])?.name
            : (lang==="zh"?`${adminSelectedStudents.size} 位學生`:`${adminSelectedStudents.size} students`))
        : null
    : null;

  const rangeLabel = `${fmtMD(weekStart)} – ${fmtMD(weekEnd)}`;
  const weekLabel = weekOffset===0?(lang==="zh"?"本週":"This week")
    :weekOffset===-1?(lang==="zh"?"上週":"Last week")
    :weekOffset===-2?(lang==="zh"?"上上週":"2 weeks ago")
    :weekOffset===1?(lang==="zh"?"下週":"Next week")
    :weekOffset===2?(lang==="zh"?"下下週":"In 2 weeks")
    :`${weekOffset>0?"+":""}${weekOffset} ${lang==="zh"?"週":"wk"}`;

  const handleAbsent = (course, dayIndex, date, start) => {
    // Reuse the ALREADY-correct resolved start time (which accounts for a
    // reschedule/make-up's customStart) instead of re-deriving it here — the
    // re-derivation used to ignore customStart, so a rescheduled session could
    // show its "Request Leave" button as enabled but then fail this re-check.
    const effectiveStart = start || getCourseStartForDay(course, dayIndex);
    if (!canRequestLeaveForWeek(weekDates, dayIndex, effectiveStart, course.duration)) {
      setToast(t.absentTooLate); return;
    }
    setAbsentTarget({course, dayIndex, date, start: effectiveStart});
  };
  const confirmAbsent = (reason, note) => {
    const {course, dayIndex} = absentTarget;
    const dateStr = fmtYMD(weekDates[dayIndex]);
    setAbsences(prev=>[...prev,{id:genId(),courseId:course.id,day:dayIndex,weekOffset,dateStr,requestedAt:new Date().toISOString(),requestedBy:currentUser.id,requesterRole:currentUser.role,reason:reason||"sick",note:note||"",acknowledgedByAdmin:false}]);
    setAbsentTarget(null);
    setToast(t.notifySuccess);
  };

  const btnStyle = (active) => ({padding:"6px 13px",borderRadius:6,border:active?"none":"0.5px solid #CFD8DC",background:active?"#1A6B8A":"transparent",color:active?"#fff":"#546E7A",fontSize:12,cursor:"pointer"});
  const iStyle = {padding:"6px 10px",borderRadius:6,border:"0.5px solid #CFD8DC",background:"#FFFFFF",color:"#172F39",fontSize:12,cursor:"pointer"};

  return (
    <div>
      {absentTarget&&<AbsenceModal course={absentTarget.course} dayIndex={absentTarget.dayIndex} resolvedStart={absentTarget.start} users={users} lang={lang} currentUser={currentUser} onConfirm={confirmAbsent} onClose={()=>setAbsentTarget(null)}/>}
      {showWeekExport&&<WeekExportModal weekSlots={weekSlots} absences={absences} lang={lang} setToast={setToast} onClose={()=>setShowWeekExport(false)}/>}
      {showBulkCopy&&<BulkCopyModal weekSlots={weekSlots} materials={materials} users={users} lang={lang} onClose={()=>setShowBulkCopy(false)}/>}

      {/* ── Teacher-only: missing feedback counter, always visible ── */}
      {isTeacherView && (
        <button
          onClick={onGoToFeedback}
          style={{
            display:"flex",alignItems:"center",gap:8,width:"100%",textAlign:"left",
            background:missingFeedbackCount>0?"#FFF3E0":"#E8F5E9",
            border:`1px solid ${missingFeedbackCount>0?"#FFB74D":"#A5D6A7"}`,
            borderRadius:9,padding:"9px 14px",marginBottom:12,cursor:onGoToFeedback?"pointer":"default",
          }}
        >
          <span style={{fontSize:16}}>{missingFeedbackCount>0?"⚠️":"✅"}</span>
          <span style={{fontSize:13,fontWeight:600,color:missingFeedbackCount>0?"#E65100":"#2E7D32"}}>
            {lang==="zh"?`未填寫課堂反饋 (${missingFeedbackCount})`:`Missing Feedback (${missingFeedbackCount})`}
          </span>
          {onGoToFeedback && <span style={{marginLeft:"auto",fontSize:11,color:missingFeedbackCount>0?"#E65100":"#2E7D32",opacity:0.8}}>{lang==="zh"?"前往填寫 →":"Go fill in →"}</span>}
        </button>
      )}

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
          {weekSlots.length>0 && (
            <button onClick={()=>setShowWeekExport(true)} style={{...btnStyle(false),display:"flex",alignItems:"center",gap:5}}>
              📅 {t.weekExportBtn}
            </button>
          )}
          {isAdmin && weekSlots.length>0 && (
            <button onClick={()=>setShowBulkCopy(true)} style={{...btnStyle(false),display:"flex",alignItems:"center",gap:5}}>
              📋 {lang==="zh"?"批量複製課堂資訊":"Bulk Copy Class Info"}
            </button>
          )}
          {["calendar","list"].map(m=>(
            <button key={m} onClick={()=>setViewMode(m)} style={btnStyle(viewMode===m)}>
              {m==="calendar"?t.calendarView:t.listView}
            </button>
          ))}
        </div>
      </div>

      {/* ── Admin filter bar ── */}
      {isAdmin && (
        <div style={{display:"flex",gap:6,alignItems:"flex-start",flexWrap:"wrap",background:"#F5F5F5",borderRadius:8,padding:"8px 10px",marginBottom:"0.75rem",position:"relative"}}>
          <span style={{fontSize:11,color:"#9E9E9E",fontWeight:500,whiteSpace:"nowrap",paddingTop:5}}>{lang==="zh"?"篩選：":"Filter:"}</span>
          {/* Type selector */}
          <div style={{display:"flex",gap:3}}>
            {[["all",lang==="zh"?"全部":"All"],["teacher",lang==="zh"?"老師":"Teacher"],["student",lang==="zh"?"學生":"Student"]].map(([k,l])=>(
              <button key={k} onClick={()=>{setAdminFilterType(k);setAdminFilterId("all");setAdminSelectedStudents(new Set());setShowStudentPicker(false);}} style={{padding:"4px 10px",borderRadius:5,fontSize:11,cursor:"pointer",border:adminFilterType===k?"none":"0.5px solid #CFD8DC",background:adminFilterType===k?"#1A6B8A":"transparent",color:adminFilterType===k?"#fff":"#546E7A"}}>
                {l}
              </button>
            ))}
          </div>
          {/* Teacher: single-select dropdown */}
          {adminFilterType==="teacher" && (
            <select style={iStyle} value={adminFilterId} onChange={e=>setAdminFilterId(e.target.value)}>
              <option value="all">{lang==="zh"?"所有老師":"All Teachers"}</option>
              {teachers.map(u=><option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          )}
          {/* Student: multi-select checkbox picker */}
          {adminFilterType==="student" && (
            <div style={{position:"relative"}}>
              <button onClick={()=>setShowStudentPicker(p=>!p)} style={{...iStyle,display:"flex",alignItems:"center",gap:6,cursor:"pointer"}}>
                {adminSelectedStudents.size===0
                  ? (lang==="zh"?"所有學生":"All Students")
                  : (lang==="zh"?`已選 ${adminSelectedStudents.size} 位`:`${adminSelectedStudents.size} selected`)}
                <span style={{fontSize:9,color:"#9E9E9E"}}>{showStudentPicker?"▲":"▼"}</span>
              </button>
              {showStudentPicker && (
                <div style={{position:"absolute",top:"calc(100% + 4px)",left:0,zIndex:50,background:"#FFFFFF",border:"0.5px solid #CFD8DC",borderRadius:8,boxShadow:"0 4px 16px rgba(23,47,57,0.15)",minWidth:200,maxHeight:280,overflowY:"auto",padding:"6px 0"}}>
                  {/* "All Students" option — checking it clears individual selections */}
                  <label style={{display:"flex",alignItems:"center",gap:8,padding:"6px 12px",fontSize:12,color:"#172F39",cursor:"pointer",borderBottom:"0.5px solid #F0F0F0",fontWeight:500}}>
                    <input type="checkbox" checked={adminSelectedStudents.size===0} onChange={()=>setAdminSelectedStudents(new Set())} style={{cursor:"pointer"}}/>
                    {lang==="zh"?"所有學生":"All Students"}
                  </label>
                  {students.map(s=>(
                    <label key={s.id} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 12px",fontSize:12,color:"#546E7A",cursor:"pointer"}}>
                      <input type="checkbox" checked={adminSelectedStudents.has(s.id)} onChange={()=>setAdminSelectedStudents(prev=>{const n=new Set(prev); n.has(s.id)?n.delete(s.id):n.add(s.id); return n;})} style={{cursor:"pointer"}}/>
                      {s.name}
                    </label>
                  ))}
                  <div style={{padding:"6px 12px",borderTop:"0.5px solid #F0F0F0",marginTop:4}}>
                    <button onClick={()=>setShowStudentPicker(false)} style={{width:"100%",padding:"6px",borderRadius:5,background:"#1A6B8A",border:"none",color:"#fff",fontSize:12,cursor:"pointer"}}>
                      {lang==="zh"?"完成":"Done"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          {/* Clear filter */}
          {(adminFilterType!=="all"||adminFilterId!=="all"||adminSelectedStudents.size>0) && (
            <button onClick={()=>{setAdminFilterType("all");setAdminFilterId("all");setAdminSelectedStudents(new Set());setShowStudentPicker(false);}} style={{fontSize:11,padding:"3px 8px",borderRadius:4,border:"0.5px solid #CFD8DC",background:"transparent",color:"#9E9E9E",cursor:"pointer"}}>✕ {lang==="zh"?"清除":"Clear"}</button>
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
          ?<SlotListView slots={weekSlots} users={users} lang={lang} currentUser={currentUser} absences={absences} materials={materials} setMaterials={setMaterials} onAbsent={handleAbsent} setToast={setToast} weekDates={weekDates} weekOffset={weekOffset} attendance={attendance} setAttendance={setAttendance} setEnrollments={setEnrollments} enrollments={enrollments} courses={courses} feedback={feedback} setFeedback={setFeedback} sharedView={sharedView}/>
          :<SlotCalendarView slots={weekSlots} users={users} lang={lang} currentUser={currentUser} absences={absences} materials={materials} setMaterials={setMaterials} onAbsent={handleAbsent} setToast={setToast} weekDates={weekDates} weekOffset={weekOffset} attendance={attendance} setAttendance={setAttendance} setEnrollments={setEnrollments} enrollments={enrollments} courses={courses} feedback={feedback} setFeedback={setFeedback} sharedView={sharedView}/>
      )}
    </div>
  );
}

// ─── Course form ──────────────────────────────────────────────────────────────
function CourseForm({ course, users, onSave, onSaveTrial, onCancel, lang }) {
  const t = T[lang];
  const teachers = users.filter(u=>u.role==="teacher");
  const students = users.filter(u=>u.role==="student");
  const defT = teachers[0]?.id||"";
  const defS = students[0]?.id||"";
  const autoSubject = (sId,tId) => `ES English Study - ${students.find(u=>u.id===sId)?.name||""} and ${teachers.find(u=>u.id===tId)?.name||""}`;

  const today = new Date().toISOString().slice(0,10);
  // Trial lessons ("[Trial]") skip the usual two-step "create course, then go
  // set up an enrollment separately" flow — a trial is always exactly one
  // fixed-25-minute session on a specific date, so it's created + scheduled +
  // (optionally) given material all in this one form. Only offered when
  // adding a NEW course — an existing course already has its own real
  // enrollment(s), which the "exactly one session" semantics can't apply to.
  const [isTrial, setIsTrial] = useState(false);
  const [trialDate, setTrialDate] = useState(today);
  const [trialTime, setTrialTime] = useState("09:00");
  const [trialAppliedDate, setTrialAppliedDate] = useState(today);
  const [trialMatTitle, setTrialMatTitle] = useState("");
  const [trialMatUrl, setTrialMatUrl] = useState("");
  const [trialMatDesc, setTrialMatDesc] = useState("");
  const [trialPreviewed, setTrialPreviewed] = useState(false);

  // A single course can meet at DIFFERENT times on different days (e.g. Sat
  // 9:00, Sun 8:00) — internally this is ONE course record with
  // `schedule: [{dayIndex, start}, ...]`. In the form, days that share the
  // same start time are grouped into one editable "block" for convenience;
  // on save all blocks flatten back into a single schedule[] on ONE record —
  // this keeps the whole course (and therefore its enrollment/leave-deferral)
  // unified, unlike creating separate courses per time slot.
  const blankBlock = () => ({ _bid: genId(), days:[0], start:"09:00" });
  const blocksFromCourse = (c) => {
    const sched = getCourseSchedule(c);
    if (!sched.length) return [blankBlock()];
    const byTime = {};
    sched.forEach(s=>{ if(!byTime[s.start]) byTime[s.start]=[]; byTime[s.start].push(s.dayIndex); });
    return Object.entries(byTime).map(([start,days])=>({_bid:genId(), days:days.sort((a,b)=>a-b), start}));
  };
  const blank = {subject:autoSubject(defS,defT),teacherId:defT,studentId:defS,duration:50,meetingUrl:"",_edited:false,blocks:[blankBlock()]};
  const [form,setForm] = useState(()=>{
    if (!course) return blank;
    // _edited must start false even when editing — it only means "the admin
    // has manually typed into the subject box THIS session". Hardcoding it
    // true here was the bug: switching the teacher or student dropdown while
    // editing an existing course would silently never update the subject
    // line, since handleTeacher/handleStudent both check this flag first.
    return {...course, _edited:false, blocks:blocksFromCourse(course)};
  });
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const withTrialPrefix = (subj) => isTrial ? (subj.startsWith("[Trial] ") ? subj : `[Trial] ${subj}`) : subj;
  const handleTeacher = v => setForm(f=>({...f,teacherId:v,subject:f._edited?f.subject:withTrialPrefix(autoSubject(f.studentId,v))}));
  const handleStudent = v => setForm(f=>({...f,studentId:v,subject:f._edited?f.subject:withTrialPrefix(autoSubject(v,f.teacherId))}));

  const updateBlock = (bid, patch) => setForm(f=>({...f, blocks: f.blocks.map(b=>b._bid===bid?{...b,...patch}:b)}));
  const toggleBlockDay = (bid, d) => setForm(f=>({...f, blocks: f.blocks.map(b=>{
    if (b._bid!==bid) return b;
    const cur = b.days||[];
    const next = cur.includes(d) ? cur.filter(x=>x!==d) : [...cur,d].sort((a,b2)=>a-b2);
    return {...b, days: next.length?next:[d]};
  })}));
  const addBlock = () => setForm(f=>({...f, blocks:[...f.blocks, blankBlock()]}));
  const removeBlock = (bid) => setForm(f=>({...f, blocks: f.blocks.length>1 ? f.blocks.filter(b=>b._bid!==bid) : f.blocks}));

  const iStyle = {width:"100%",boxSizing:"border-box",padding:"8px 10px",borderRadius:6,border:"0.5px solid #CFD8DC",background:"#FFFFFF",color:"#172F39",fontSize:13};
  const lStyle = {display:"block",fontSize:12,color:"#546E7A",marginBottom:4,marginTop:12};

  const totalSessionsPerWeek = form.blocks.reduce((sum,b)=>sum+(b.days?.length||0),0);

  const handleSave = () => {
    const { _edited, blocks, days, start, schedule, ...shared } = form;
    // Flatten all blocks into one schedule[] on a SINGLE course record — this
    // is what keeps the course (and its future enrollment) unified across
    // however many day/time combinations it has.
    const newSchedule = blocks.flatMap(b => (b.days||[]).map(d => ({ dayIndex: d, start: b.start })));
    const record = {
      ...shared,
      schedule: newSchedule,
      // Legacy fields kept in sync too, so any code path that hasn't been
      // updated to read `schedule[]` still degrades gracefully.
      days: getCourseDays({schedule:newSchedule}),
      start: newSchedule[0]?.start,
    };
    onSave(record);
  };

  const handleSaveTrial = () => {
    if (!trialPreviewed) return;
    const dayIndex = (new Date(trialDate+"T00:00:00").getDay()+6)%7;
    const newCourseId = genId();
    const courseRecord = {
      id: newCourseId,
      teacherId: form.teacherId, studentId: form.studentId, subject: form.subject,
      duration: 25, schedule: [{dayIndex, start: trialTime}],
      days: [dayIndex], start: trialTime,
      meetingUrl: form.meetingUrl||"", isTrial: true, status: "active",
    };
    const enrollmentRecord = {
      id: genId(), courseId: newCourseId, studentId: form.studentId,
      payDate: trialAppliedDate, startDate: trialDate, totalSessions: 1,
      scheduledDates: [{date: trialDate, dayIndex, sessionNo: 1}],
      isTrial: true,
    };
    const materialRecord = (trialMatTitle.trim() || trialMatUrl.trim()) ? {
      id: genId(), courseId: newCourseId, date: trialDate, dayIndex,
      title: trialMatTitle.trim(), url: trialMatUrl.trim(), desc: trialMatDesc.trim(),
    } : null;
    onSaveTrial(courseRecord, enrollmentRecord, materialRecord);
  };

  return (
    <div style={{display:"flex",flexDirection:"column",maxHeight:"70vh"}}>
      <div style={{overflowY:"auto",flex:1,minHeight:0,paddingRight:2}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <div><label style={lStyle}>{t.selectTeacher}</label><select style={iStyle} value={form.teacherId} onChange={e=>handleTeacher(e.target.value)}>{teachers.map(te=><option key={te.id} value={te.id}>{te.name}</option>)}</select></div>
          <div><label style={lStyle}>{t.selectStudent}</label><select style={iStyle} value={form.studentId} onChange={e=>handleStudent(e.target.value)}>{students.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
        </div>
        <label style={lStyle}>{t.subjectName}</label>
        <input style={iStyle} value={form.subject} onChange={e=>setForm(f=>({...f,subject:e.target.value,_edited:true}))} placeholder={t.autoSubjectHint}/>

        {!course && (
          <label style={{display:"flex",alignItems:"center",gap:8,marginTop:12,padding:"9px 11px",background:isTrial?"#FFF3E0":"#F5F5F5",borderRadius:7,cursor:"pointer",border:`1px solid ${isTrial?"#FFB74D":"#E0E0E0"}`}}>
            <input type="checkbox" checked={isTrial} onChange={e=>{
              const checked = e.target.checked;
              setIsTrial(checked);
              setTrialPreviewed(false);
              setForm(f=>{
                let subj = f.subject||"";
                if (checked && !subj.startsWith("[Trial] ")) subj = `[Trial] ${subj}`;
                if (!checked && subj.startsWith("[Trial] ")) subj = subj.slice(8);
                return {...f, subject: subj};
              });
            }}/>
            <span style={{fontSize:13,fontWeight:600,color:isTrial?"#E65100":"#546E7A"}}>🎓 [Trial] {lang==="zh"?"試聽課程":"Trial Lesson"}</span>
          </label>
        )}

        {isTrial ? (
          <>
            <div style={{background:"#FFF8E1",borderRadius:8,padding:"9px 12px",marginTop:10,fontSize:11,color:"#E65100",lineHeight:1.6}}>
              ℹ️ {lang==="zh"?"試聽課程固定 25 分鐘、只會建立這一堂課，確認後會直接排入正式課表，跟一般課程一樣被記錄。":"Trial lessons are fixed at 25 minutes and create exactly this one class — once confirmed it's scheduled and recorded just like any regular course."}
            </div>

            <label style={lStyle}>{lang==="zh"?"申請試聽日期":"Trial Application Date"}</label>
            <input type="date" style={iStyle} value={trialAppliedDate} onChange={e=>setTrialAppliedDate(e.target.value)}/>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div>
                <label style={lStyle}>{lang==="zh"?"試聽日期":"Trial Date"}</label>
                <input type="date" style={iStyle} value={trialDate} onChange={e=>{setTrialDate(e.target.value);setTrialPreviewed(false);}}/>
              </div>
              <div>
                <label style={lStyle}>{lang==="zh"?"試聽時間":"Trial Time"}</label>
                <div style={{display:"flex",gap:5,alignItems:"center"}}>
                  <select style={{...iStyle,flex:1}} value={trialTime.split(":")[0]} onChange={e=>{setTrialTime(`${e.target.value}:${trialTime.split(":")[1]}`);setTrialPreviewed(false);}}>
                    {HOUR_OPTIONS.map(h=><option key={h} value={h}>{h}</option>)}
                  </select>
                  <span style={{color:"#9E9E9E"}}>:</span>
                  <select style={{...iStyle,flex:1}} value={trialTime.split(":")[1]} onChange={e=>{setTrialTime(`${trialTime.split(":")[0]}:${e.target.value}`);setTrialPreviewed(false);}}>
                    {MIN_OPTIONS.map(m=><option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div style={{fontSize:11,color:"#9E9E9E",marginTop:4}}>{lang==="zh"?"時長固定 25 分鐘":"Fixed at 25 minutes"}: {trialTime}–{addMins(trialTime,25)}</div>

            <label style={lStyle}>{lang==="zh"?"教材標題（選填，可後補）":"Material Title (optional, can add later)"}</label>
            <input style={iStyle} value={trialMatTitle} onChange={e=>setTrialMatTitle(e.target.value)}/>
            <label style={lStyle}>{lang==="zh"?"教材連結（選填，可後補）":"Material URL (optional, can add later)"}</label>
            <input style={iStyle} value={trialMatUrl} onChange={e=>setTrialMatUrl(e.target.value)} placeholder="https://..."/>

            <label style={lStyle}>{t.meetingUrl}（{lang==="zh"?"選填，可後補":"optional, can add later"}）</label>
            <input style={iStyle} value={form.meetingUrl} onChange={e=>set("meetingUrl",e.target.value)} placeholder="https://..."/>

            {!trialPreviewed ? (
              <button type="button" onClick={()=>setTrialPreviewed(true)} style={{width:"100%",marginTop:14,padding:"9px",borderRadius:7,border:"1px solid #4A9FD4",background:"transparent",color:"#1A6B8A",fontSize:13,cursor:"pointer",fontWeight:500}}>
                🔍 {lang==="zh"?"預覽排課":"Preview Schedule"}
              </button>
            ) : (
              <div style={{background:"#E8F5E9",border:"1px solid #A5D6A7",borderRadius:8,padding:"12px 14px",marginTop:14}}>
                <div style={{fontSize:12,fontWeight:600,color:"#2E7D32",marginBottom:6}}>✓ {lang==="zh"?"排課預覽":"Schedule Preview"}</div>
                <div style={{fontSize:12,color:"#172F39",lineHeight:1.9}}>
                  {lang==="zh"?"日期":"Date"}：{trialDate}（{T[lang].days[(new Date(trialDate+"T00:00:00").getDay()+6)%7]}）<br/>
                  {lang==="zh"?"時間":"Time"}：{trialTime}–{addMins(trialTime,25)}（25{lang==="zh"?"分鐘":"min"}）<br/>
                  {lang==="zh"?"老師":"Teacher"}：{teachers.find(te=>te.id===form.teacherId)?.name||"—"}<br/>
                  {lang==="zh"?"學生":"Student"}：{students.find(s=>s.id===form.studentId)?.name||"—"}<br/>
                  {lang==="zh"?"堂數":"Sessions"}：1 {lang==="zh"?"堂（僅此堂）":"(this one only)"}
                </div>
                <button type="button" onClick={()=>setTrialPreviewed(false)} style={{marginTop:8,fontSize:11,padding:"4px 10px",borderRadius:5,border:"0.5px solid #CFD8DC",background:"transparent",color:"#546E7A",cursor:"pointer"}}>
                  {lang==="zh"?"重新編輯":"Edit again"}
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            <label style={lStyle}>{t.duration}</label>
        <div style={{display:"flex",gap:8}}>
          {[25,50].map(d=>(
            <button key={d} type="button" onClick={()=>set("duration",d)} style={{flex:1,padding:"8px",borderRadius:6,fontSize:13,cursor:"pointer",border:`1px solid ${form.duration===d?"#1A6B8A":"#CFD8DC"}`,background:form.duration===d?"#1A6B8A":"transparent",color:form.duration===d?"#fff":"#546E7A"}}>
              {d===25?t.min25:t.min50}
            </button>
          ))}
        </div>

        {/* ── Time slots — one block per group of days sharing a start time; all blocks belong to ONE course ── */}
        <label style={lStyle}>{lang==="zh"?"上課時段（可新增多組，星期跟時間可各自不同，仍屬同一堂課）":"Time Slots (add more — days & times can differ, still one course)"}</label>
        {form.blocks.map((b,idx)=>{
          const blockEnd = addMins(b.start, form.duration);
          return (
            <div key={b._bid} style={{background:"#F5F5F5",borderRadius:8,border:"0.5px solid #E0E0E0",padding:"10px 12px",marginBottom:8}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <span style={{fontSize:11,fontWeight:600,color:"#546E7A"}}>{lang==="zh"?`時段 ${idx+1}`:`Slot ${idx+1}`}</span>
                {form.blocks.length>1 && (
                  <button type="button" onClick={()=>removeBlock(b._bid)} style={{fontSize:11,padding:"2px 8px",borderRadius:4,border:"0.5px solid #FFCDD2",background:"transparent",color:"#D32F2F",cursor:"pointer"}}>✕ {lang==="zh"?"移除":"Remove"}</button>
                )}
              </div>
              <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:6}}>
                {t.days.map((d,i)=>(
                  <button key={i} type="button" onClick={()=>toggleBlockDay(b._bid,i)} style={{padding:"5px 10px",borderRadius:5,fontSize:12,cursor:"pointer",border:`1px solid ${b.days?.includes(i)?"#1A6B8A":"#CFD8DC"}`,background:b.days?.includes(i)?"#1A6B8A":"transparent",color:b.days?.includes(i)?"#fff":"#546E7A"}}>{d}</button>
                ))}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div>
                  <label style={{...lStyle,marginTop:0}}>{t.startTime}</label>
                  <div style={{display:"flex",gap:5,alignItems:"center"}}>
                    <select style={{...iStyle,flex:1}} value={b.start.split(":")[0]} onChange={e=>updateBlock(b._bid,{start:`${e.target.value}:${b.start.split(":")[1]||"00"}`})}>
                      {HOUR_OPTIONS.map(h=><option key={h} value={h}>{h}</option>)}
                    </select>
                    <span style={{color:"#9E9E9E"}}>:</span>
                    <select style={{...iStyle,flex:1}} value={b.start.split(":")[1]} onChange={e=>updateBlock(b._bid,{start:`${b.start.split(":")[0]||"00"}:${e.target.value}`})}>
                      {!MIN_OPTIONS.includes(b.start.split(":")[1]) && <option value={b.start.split(":")[1]}>{b.start.split(":")[1]}</option>}
                      {MIN_OPTIONS.map(m=><option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{...lStyle,marginTop:0}}>{t.endTime}</label>
                  <div style={{...iStyle,background:"#FFFFFF",color:"#9E9E9E",borderStyle:"dashed",cursor:"not-allowed",display:"flex",alignItems:"center"}}>{blockEnd}</div>
                </div>
              </div>
            </div>
          );
        })}
        <button type="button" onClick={addBlock} style={{width:"100%",padding:"8px",borderRadius:6,border:"1px dashed #1A6B8A",background:"transparent",color:"#1A6B8A",fontSize:12,cursor:"pointer",marginBottom:6}}>
          + {lang==="zh"?"新增時段（可設定不同星期與時間）":"Add Time Slot (different day/time)"}
        </button>
        <div style={{fontSize:11,color:"#9E9E9E",marginBottom:8}}>{t.sessionsPerWeek}: <strong style={{color:"#172F39"}}>{totalSessionsPerWeek}</strong> {lang==="zh"?"堂/週":"sessions/week"}</div>

        <label style={lStyle}>{t.meetingUrl}</label>
        <input style={iStyle} value={form.meetingUrl} onChange={e=>set("meetingUrl",e.target.value)} placeholder="https://..."/>
          </>
        )}
      </div>

      {/* Buttons — always visible outside the scrollable area, never pushed off-screen */}
      <div style={{display:"flex",gap:8,marginTop:14,paddingTop:12,borderTop:"0.5px solid #E0E0E0",flexShrink:0}}>
        {isTrial ? (
          <button onClick={handleSaveTrial} disabled={!trialPreviewed} style={{flex:1,background:trialPreviewed?"#4CAF50":"#E0E0E0",border:"none",borderRadius:6,color:trialPreviewed?"#fff":"#9E9E9E",padding:"10px",fontSize:14,fontWeight:600,cursor:trialPreviewed?"pointer":"not-allowed"}}>
            ✓ {lang==="zh"?"確認並儲存":"Confirm & Save"}
          </button>
        ) : (
          <button onClick={handleSave} style={{flex:1,background:"#1A6B8A",border:"none",borderRadius:6,color:"#fff",padding:"10px",fontSize:14,fontWeight:600,cursor:"pointer"}}>{t.save}</button>
        )}
        <button onClick={onCancel} style={{flex:1,background:"#FFFFFF",border:"0.5px solid #CFD8DC",borderRadius:6,color:"#172F39",padding:"10px",fontSize:14,cursor:"pointer"}}>{t.cancel}</button>
      </div>
    </div>
  );
}

// ─── Batch Material Modal ─────────────────────────────────────────────────────
// Admin can pick student + teacher → see matched courses → enter multiple material rows at once
// Can also load existing materials for bulk-edit
function BatchMaterialModal({ users, courses, materials, setMaterials, lang, setToast, onClose, enrollments, initialCourseId }) {
  const t = T[lang];
  const teachers = users.filter(u=>u.role==="teacher");
  const students = users.filter(u=>u.role==="student");
  const lockedCourse = initialCourseId ? courses.find(c=>c.id===initialCourseId) : null;

  // Real scheduled DATES for a course, from its enrollment(s) — a material must
  // match an exact class occurrence, not a recurring day-of-week (that was the
  // bug: a Monday's material would silently reappear on every future Monday).
  const getScheduledDatesForCourse = (courseId) => {
    return [...new Set(
      (enrollments||[])
        .filter(e => e.courseId === courseId)
        .flatMap(e => (e.scheduledDates||[]).map(s => s.date))
    )];
  };
  const dateToDayIndex = (dateStr) => (new Date(dateStr+"T00:00:00").getDay()+6)%7;

  const [selTeacher, setSelTeacher] = useState(lockedCourse ? lockedCourse.teacherId : (teachers[0]?.id||""));
  const [selStudent, setSelStudent] = useState(lockedCourse ? lockedCourse.studentId : (students[0]?.id||""));
  const [selCourseId, setSelCourseId] = useState(lockedCourse ? lockedCourse.id : ""); // "" = all matched

  // Matched courses
  const matched = courses.filter(c=>
    c.status!=="archived" &&
    (selTeacher===""||c.teacherId===selTeacher) &&
    (selStudent===""||c.studentId===selStudent)
  );
  const targetCourses = selCourseId ? matched.filter(c=>c.id===selCourseId) : matched;

  const today = new Date().toISOString().slice(0,10);
  // When exactly one course is targeted, this is that course's own real
  // scheduled dates (today onward) that DON'T already have material — sorted
  // chronologically. This is the single source of truth for both (a) what
  // the date <select> offers and (b) what gets auto-assigned during paste —
  // using the same list guarantees they never disagree. Past dates are
  // deliberately excluded: a material always belongs to an upcoming lesson,
  // never one that's already happened.
  const soloCourseId = targetCourses.length===1 ? targetCourses[0].id : null;
  const soloAllValidDates = soloCourseId ? getScheduledDatesForCourse(soloCourseId).sort() : [];
  const soloFutureValidDates = soloCourseId
    ? soloAllValidDates.filter(d=>d>=today)
    : [];
  const soloFilledDates = soloCourseId
    ? new Set(materials.filter(m=>m.courseId===soloCourseId).map(m=>m.date))
    : new Set();
  const soloEmptyFutureDates = soloFutureValidDates.filter(d=>!soloFilledDates.has(d));

  // Rows: each has {id, date, title, url, desc} — dayIndex is derived from date, not picked separately
  // `afterDate`: when adding a new row, skip ahead to the next still-empty
  // valid date that comes after the previous row's date, so rows you add one
  // at a time naturally walk forward through the course's real schedule.
  const blankRow = (afterDate) => {
    let date = today;
    if (soloCourseId) {
      const pool = afterDate ? soloEmptyFutureDates.filter(d=>d>afterDate) : soloEmptyFutureDates;
      date = pool[0] || soloEmptyFutureDates[0] || today;
    }
    return {_rid:genId(), date, title:"", url:"", desc:""};
  };
  const [rows, setRows] = useState([blankRow()]);
  // Editing a row's DATE cascades forward — every row below it re-walks the
  // course's empty-date queue starting just after the newly picked date, so
  // manually correcting one row automatically pushes the rest of the list
  // into the right sequence instead of leaving them stuck on old dates.
  const setRow = (rid, k, v) => {
    if (k !== "date" || !soloCourseId) {
      setRows(rs=>rs.map(r=>r._rid===rid?{...r,[k]:v}:r));
      return;
    }
    setRows(rs => {
      const idx = rs.findIndex(r=>r._rid===rid);
      if (idx===-1) return rs.map(r=>r._rid===rid?{...r,date:v}:r);
      const updated = rs.map(r=>r._rid===rid?{...r,date:v}:r);
      const usedDates = new Set(updated.slice(0, idx+1).map(r=>r.date));
      let qi = soloEmptyFutureDates.findIndex(d => d > v);
      if (qi === -1) qi = soloEmptyFutureDates.length;
      for (let i = idx+1; i < updated.length; i++) {
        while (qi < soloEmptyFutureDates.length && usedDates.has(soloEmptyFutureDates[qi])) qi++;
        if (qi < soloEmptyFutureDates.length) {
          updated[i] = {...updated[i], date: soloEmptyFutureDates[qi]};
          usedDates.add(soloEmptyFutureDates[qi]);
          qi++;
        }
        // otherwise no more empty dates left — leave that row's date as-is
      }
      return updated;
    });
  };
  const addRow = () => setRows(rs=>[...rs, blankRow(rs[rs.length-1]?.date)]);
  const delRow = rid => setRows(rs=>rs.length>1?rs.filter(r=>r._rid!==rid):rs);
  // One-click fix: re-walk EVERY current row through the course's empty
  // future dates in order, top to bottom — for when you've been editing rows
  // by hand and want them to line back up sequentially again.
  const autoFillSequential = () => {
    if (!soloCourseId) return;
    let qi = 0;
    setRows(rs => rs.map(r => {
      if (qi < soloEmptyFutureDates.length) { const d = soloEmptyFutureDates[qi]; qi++; return {...r, date:d}; }
      return r;
    }));
    setToast(lang==="zh"?"已依序帶入未來空堂日期":"Filled in sequential upcoming dates");
  };

  // ── Paste from Excel/Sheets — tab-separated rows, flexible column count.
  // Supports "Date\tURL\tTitle" (3 cols, auto-matched against real class
  // dates) or just "URL\tTitle" (2 cols, no date — admin fills dates in
  // afterward). A header row is detected and skipped automatically.
  const [showPasteMat, setShowPasteMat] = useState(false);
  const [pasteMatText, setPasteMatText] = useState("");
  // normalizeDate is a top-level shared helper (see near parseTSVBlock)
  // parseTSVBlock is a top-level shared helper (see near buildSchedule) —
  // reused here and by the batch-import feature in the student overview page.

  const parsePastedMaterials = () => {
    const tsvRows = parseTSVBlock(pasteMatText);
    const raw = [];
    tsvRows.forEach(cells=>{
      if (cells.length<=1) return; // not enough columns to be a real row
      if (cells.some(c=>/^(date|material|title|material title|url)$/i.test(c))) return; // header row
      let date="", url="", title="";
      if (cells.length>=3) {
        const d = normalizeDate(cells[0]);
        if (d) { date=d; url=cells[1]; title=cells[2]||""; }
        else { url=cells[0]; title=cells[1]||""; } // first cell wasn't a date after all
      } else {
        url=cells[0]; title=cells[1]||"";
      }
      if (!url) return;
      raw.push({date, url, title}); // date "" means: no explicit date given
    });
    if (!raw.length) { setToast(lang==="zh"?"沒有解析到有效資料，請確認格式":"No valid rows found — check the format"); return; }

    // When scoped to exactly one course (locked, or filters happen to narrow
    // to one), rows without an explicit date get auto-assigned to that
    // course's own upcoming (today or later) class dates that don't have
    // material yet — walking forward chronologically, one per row, so a
    // pasted list can just be "next lesson, then the one after that, ..."
    // without having to look up each date by hand. Reuses the exact same
    // future-only queue the date <select> below is built from, so what gets
    // assigned always matches what's actually selectable.
    let autoAssignedCount = 0;
    if (soloCourseId) {
      let qi = 0;
      raw.forEach(r=>{
        if (r.date) return; // explicit date already given — leave it alone
        if (qi < soloEmptyFutureDates.length) {
          r.date = soloEmptyFutureDates[qi];
          autoAssignedCount++;
          qi++;
        }
      });
    }

    const parsed = raw.map(r => ({_rid:genId(), date: r.date||today, title:r.title, url:r.url, desc:""}));
    setRows(parsed);
    setShowPasteMat(false);
    setPasteMatText("");
    setToast(autoAssignedCount>0
      ? (lang==="zh"?`已解析 ${parsed.length} 筆，其中 ${autoAssignedCount} 筆自動配對下一個空堂日期，請確認`:`Parsed ${parsed.length} row(s), ${autoAssignedCount} auto-assigned to the next open class date — please double-check`)
      : (lang==="zh"?`已解析 ${parsed.length} 筆，請確認每列的日期比對結果`:`Parsed ${parsed.length} row(s) — check each row's date match below`));
  };

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
    const valid = rows.filter(r=>r.url.trim() && r.date);
    if (!valid.length) return;
    const newMats = [];
    valid.forEach(r=>{
      targetCourses.forEach(c=>{
        // Only add to courses that actually have a class on this exact date
        // (per real schedule, not a recurring day-of-week guess)
        if (!getScheduledDatesForCourse(c.id).includes(r.date)) return;
        newMats.push({id:genId(), courseId:c.id, dayIndex:dateToDayIndex(r.date), date:r.date,
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
          {/* Filter row — hidden when locked to a specific course (opened from that course's own material manager) */}
          {lockedCourse ? (
            <div style={{background:"#EEF6FB",border:"0.5px solid #4A9FD4",borderRadius:8,padding:"8px 12px",marginBottom:14,fontSize:12,color:"#1A6B8A"}}>
              🔒 {lang==="zh"?"已鎖定課程":"Locked to course"}: <strong>{lockedCourse.subject}</strong>
            </div>
          ) : (
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
          )}

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

              <div style={{marginBottom:10}}>
                <button onClick={()=>setShowPasteMat(v=>!v)} style={{fontSize:12,padding:"6px 12px",borderRadius:6,border:"0.5px solid #4A9FD4",background:showPasteMat?"#EEF6FB":"transparent",color:"#1A6B8A",cursor:"pointer"}}>
                  📋 {lang==="zh"?"貼上 Excel／Sheet 資料":"Paste from Excel/Sheets"}
                </button>
              </div>
              {showPasteMat && (
                <div style={{background:"#F5F5F5",borderRadius:8,padding:"10px 12px",marginBottom:12}}>
                  <div style={{fontSize:11,color:"#546E7A",marginBottom:6,lineHeight:1.6}}>
                    {lang==="zh"
                      ? `直接從 Excel 或 Google Sheet 複製整個範圍貼上即可，欄位順序：日期、教材連結、教材名稱。${targetCourses.length===1?"日期可以省略——省略的列會自動依序配對這堂課接下來還沒教材的日期。":"日期可省略，只貼連結跟名稱兩欄也可以（但鎖定單一課程時才會自動配對日期）。"}`
                      : `Copy a range directly from Excel or Google Sheets and paste it here. Columns: Date, Material URL, Title. ${targetCourses.length===1?"Date can be left out — rows without one auto-fill into this course's next open (material-less) class dates, in order.":"Date is optional (just URL + Title also works), but auto-date-assignment only kicks in when locked to a single course."}`}
                  </div>
                  <textarea
                    value={pasteMatText}
                    onChange={e=>setPasteMatText(e.target.value)}
                    placeholder={"2026/07/14\thttps://reurl.cc/mYON4Y\tWhat Was Your First Job Like?\n2026/07/30\thttps://reurl.cc/qYlKy3\tWhen Was the Last Time You Were Sick?"}
                    style={{width:"100%",boxSizing:"border-box",minHeight:100,padding:"8px 10px",borderRadius:6,border:"0.5px solid #CFD8DC",background:"#FFFFFF",color:"#172F39",fontSize:12,fontFamily:"monospace",resize:"vertical"}}
                  />
                  <button onClick={parsePastedMaterials} disabled={!pasteMatText.trim()} style={{marginTop:8,padding:"7px 16px",borderRadius:6,background:pasteMatText.trim()?"#1A6B8A":"#E0E0E0",border:"none",color:pasteMatText.trim()?"#fff":"#9E9E9E",fontSize:12,cursor:pasteMatText.trim()?"pointer":"not-allowed"}}>
                    🔍 {lang==="zh"?"解析資料":"Parse Data"}
                  </button>
                </div>
              )}

              {/* Column headers */}
              <div style={{display:"grid",gridTemplateColumns:"120px 1fr 1fr 90px 28px",gap:6,marginBottom:4}}>
                {[lang==="zh"?"日期":"Date", "URL *", lang==="zh"?"名稱(選填)":"Title", lang==="zh"?"備註":"Notes", ""].map((h,i)=>(
                  <div key={i} style={{fontSize:10,color:"#9E9E9E",fontWeight:500}}>{h}</div>
                ))}
              </div>
              {rows.map((r,idx)=>{
                const rowMatches = targetCourses.filter(c=>getScheduledDatesForCourse(c.id).includes(r.date)).length;
                return (
                <div key={r._rid}>
                  <div style={{display:"grid",gridTemplateColumns:"120px 1fr 1fr 90px 28px",gap:6,marginBottom:2,alignItems:"center"}}>
                    {soloCourseId ? (
                      <select style={iStyle} value={r.date} onChange={e=>setRow(r._rid,"date",e.target.value)}>
                        {!soloAllValidDates.includes(r.date) && r.date && <option value={r.date}>{r.date} (?)</option>}
                        {soloAllValidDates.map(d=>(
                          <option key={d} value={d}>{d} ({T[lang].days[dateToDayIndex(d)]}){soloFilledDates.has(d)?` · ${lang==="zh"?"已有教材":"has material"}`:""}</option>
                        ))}
                      </select>
                    ) : (
                      <input type="date" style={iStyle} value={r.date} onChange={e=>setRow(r._rid,"date",e.target.value)}/>
                    )}
                    <input style={iStyle} value={r.url} onChange={e=>setRow(r._rid,"url",e.target.value)} placeholder="https://..."/>
                    <input style={iStyle} value={r.title} onChange={e=>setRow(r._rid,"title",e.target.value)} placeholder={lang==="zh"?"Unit 3…":"Unit 3…"}/>
                    <input style={iStyle} value={r.desc} onChange={e=>setRow(r._rid,"desc",e.target.value)} placeholder={lang==="zh"?"備註…":"Notes…"}/>
                    <button onClick={()=>delRow(r._rid)} style={{background:"transparent",border:"0.5px solid #C0392B",borderRadius:4,color:"#D32F2F",fontSize:14,cursor:"pointer",height:28,width:28}}>×</button>
                  </div>
                  {r.date && targetCourses.length>0 && (
                    <div style={{fontSize:10,color:rowMatches>0?"#2E7D32":"#E65100",marginBottom:6,marginLeft:2}}>
                      {rowMatches>0
                        ? `✓ ${T[lang].days[dateToDayIndex(r.date)]} · ${lang==="zh"?`符合 ${rowMatches} 個課程的排課日`:`matches ${rowMatches} course(s)' schedule`}`
                        : `⚠️ ${lang==="zh"?"沒有課程在此日期有排課，這列不會被加入":"No course has a class on this date — this row will be skipped"}`}
                    </div>
                  )}
                </div>
                );
              })}
              <div style={{display:"flex",gap:8,marginTop:8}}>
                <button onClick={addRow} style={{padding:"7px 14px",borderRadius:6,background:"#F5F5F5",border:"0.5px solid #CFD8DC",color:"#546E7A",fontSize:12,cursor:"pointer"}}>{t.batchAddRow}</button>
                {soloCourseId && rows.length>1 && (
                  <button onClick={autoFillSequential} style={{padding:"7px 14px",borderRadius:6,background:"transparent",border:"0.5px solid #4A9FD4",color:"#1A6B8A",fontSize:12,cursor:"pointer"}}>
                    🔽 {lang==="zh"?"依序帶入空堂日期":"Auto-fill sequential dates"}
                  </button>
                )}
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
                  <div style={{display:"grid",gridTemplateColumns:"120px 1fr 1fr 90px 28px",gap:6,marginBottom:4}}>
                    {[lang==="zh"?"日期":"Date", "URL", lang==="zh"?"名稱":"Title", lang==="zh"?"備註":"Notes",""].map((h,i)=>(
                      <div key={i} style={{fontSize:10,color:"#9E9E9E",fontWeight:500}}>{h}</div>
                    ))}
                  </div>
                  <div style={{maxHeight:320,overflowY:"auto"}}>
                    {editRows.map(r=>(
                      <div key={r.id} style={{display:"grid",gridTemplateColumns:"120px 1fr 1fr 90px 28px",gap:6,marginBottom:6,alignItems:"center",background:r._dirty?"rgba(26,107,138,0.06)":"transparent",borderRadius:4,padding:"2px 0"}}>
                        <input type="date" style={iStyle} value={r.date||""} onChange={e=>{
                          const newDate = e.target.value;
                          setEditRow(r.id,"date",newDate);
                          if (newDate) setEditRow(r.id,"dayIndex",dateToDayIndex(newDate));
                        }}/>
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
function CourseManager({ users, courses, setCourses, lang, setToast, materials, setMaterials, enrollments, setEnrollments, attendance, absences }) {
  const t = T[lang];
  const [showAdd,setShowAdd] = useState(false);
  const [editing,setEditing] = useState(null);
  const [matTarget,setMatTarget] = useState(null);
  const [showBatch,setShowBatch] = useState(false);
  const [confirmDelCourseId, setConfirmDelCourseId] = useState(null);
  const [confirmArchiveId, setConfirmArchiveId] = useState(null);
  const [statusTab, setStatusTab] = useState("active"); // active | archived
  const [searchQuery, setSearchQuery] = useState("");
  const [onlyUnenrolled, setOnlyUnenrolled] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState(new Set());
  const getName = id=>users.find(u=>u.id===id)?.name||id;
  const save = record => {
    if (editing) { setCourses(courses.map(c=>c.id===editing.id?{...record,id:editing.id,status:c.status}:c)); setToast(t.courseUpdated); }
    else { setCourses([...courses,{...record,id:genId(),status:"active"}]); setToast(t.courseAdded); }
    setShowAdd(false); setEditing(null);
  };
  // Trial lessons skip the usual "create course, then go set up enrollment
  // separately" two-step flow — one confirm here creates the course, its
  // one-session enrollment, and (if given) its material, all at once, so the
  // trial is immediately a real, fully-recorded class like any other.
  const saveTrial = (courseRecord, enrollmentRecord, materialRecord) => {
    setCourses([...courses, courseRecord]);
    setEnrollments(prev => [...(prev||[]), enrollmentRecord]);
    if (materialRecord) setMaterials(prev => [...(prev||[]), materialRecord]);
    setShowAdd(false); setEditing(null);
    setToast(lang==="zh"?"已建立試聽課程並排入課表":"Trial lesson created and scheduled");
  };
  // Whether a course has any real history (a scheduled session ever existed
  // for it) — courses with none are safe to hard-delete outright; anything
  // with history should be archived instead, so completed sessions / medal
  // points / attendance records are never affected.
  const hasHistory = (courseId) => (enrollments||[]).some(e=>e.courseId===courseId && (e.scheduledDates||[]).length>0);

  const del = id => { setConfirmDelCourseId(id); };
  const doDelCourse = () => {
    setCourses(courses.filter(c=>c.id!==confirmDelCourseId));
    setToast(t.courseDeleted);
    setConfirmDelCourseId(null);
  };
  // Archiving ("結束課程") — NEVER touches enrollments/attendance/materials/
  // feedback. The course record itself is kept exactly as-is (just flagged),
  // so every historical lookup (medal points, class history, stats) that
  // depends on finding the course by id keeps working correctly. This is the
  // safe alternative to deleting a course that already has real history.
  const archive = id => setConfirmArchiveId(id);
  const doArchive = () => {
    setCourses(courses.map(c=>c.id===confirmArchiveId?{...c,status:"archived",archivedAt:new Date().toISOString()}:c));
    setToast(lang==="zh"?"已將課程標記為結束":"Course marked as ended");
    setConfirmArchiveId(null);
  };
  const unarchive = (id) => {
    setCourses(courses.map(c=>c.id===id?{...c,status:"active",archivedAt:undefined}:c));
    setToast(lang==="zh"?"已恢復為進行中":"Restored to active");
  };
  const fakeAdmin = { id:"admin", role:"admin", name:"Admin" };

  // ── Search + grouping (display only — never touches courses/enrollments data) ──
  const q = searchQuery.trim().toLowerCase();
  const byStatus = courses.filter(c => statusTab==="archived" ? c.status==="archived" : c.status!=="archived");
  const filtered = byStatus.filter(c=>{
    const hasEnrollment = (enrollments||[]).some(e=>e.courseId===c.id);
    if (onlyUnenrolled && hasEnrollment) return false;
    if (!q) return true;
    const teacherName = getName(c.teacherId).toLowerCase();
    const studentName = getName(c.studentId).toLowerCase();
    return c.subject.toLowerCase().includes(q) || teacherName.includes(q) || studentName.includes(q);
  });

  const groups = {}; // teacherId -> courses[]
  filtered.forEach(c=>{
    const key = c.teacherId || "_none";
    if (!groups[key]) groups[key] = [];
    groups[key].push(c);
  });
  const groupKeys = Object.keys(groups).sort((a,b)=>getName(a).localeCompare(getName(b)));

  const toggleGroup = (key) => setCollapsedGroups(prev=>{const n=new Set(prev); n.has(key)?n.delete(key):n.add(key); return n;});
  const collapseAll = () => setCollapsedGroups(new Set(groupKeys));
  const expandAll = () => setCollapsedGroups(new Set());

  // ── Sessions missing materials — a prominent, hard-to-miss reminder so
  // materials don't quietly go unfilled. Normally scoped to just THIS WEEK,
  // but starting Saturday (the tail end of the current week) it widens to
  // also include next week — an early heads-up before Monday arrives, rather
  // than everyone finding out the week's already started with nothing ready.
  const [showMissingMat, setShowMissingMat] = useState(true);
  const todayDow = (new Date().getDay()+6)%7; // 0=Mon...5=Sat,6=Sun
  const missingMatWindowDates = todayDow>=5
    ? [...getWeekDates(0), ...getWeekDates(1)].map(fmtYMD)
    : getWeekDates(0).map(fmtYMD);
  const missingMaterialsThisWeek = enrollments.flatMap(enr => {
    const course = courses.find(c=>c.id===enr.courseId);
    if (!course || course.status==="archived") return [];
    return (enr.scheduledDates||[])
      .filter(s => missingMatWindowDates.includes(s.date))
      .filter(s => !materials.some(m => m.courseId===course.id && m.date===s.date))
      // Already-requested leave (either self-reported or admin-recorded,
      // covering student/teacher/excused) means this session isn't actually
      // happening as normally scheduled — no point nagging admin/assistant
      // to prep material for it.
      .filter(s => !(attendance||[]).some(a => a.enrollmentId===enr.id && a.date===s.date && a.type!=="other"))
      .filter(s => !(absences||[]).some(a => a.courseId===course.id && a.dateStr===s.date))
      .map(s => ({ course, date:s.date, dayIndex:s.dayIndex }));
  }).sort((a,b)=>a.date.localeCompare(b.date));

  // ── Stale teacher-student pairings — a course with no upcoming sessions AND
  // whose last actual session was 2+ weeks ago is very likely a relationship
  // that's quietly ended (enrollment lapsed, not renewed, etc.) without
  // anyone formally removing it from the teacher's roster. This surfaces it
  // to admin to decide — nothing is ever auto-deleted.
  const [showStaleCourses, setShowStaleCourses] = useState(true);
  const staleCourses = courses.map(c => {
    if (c.status==="archived") return null;
    const courseEnrs = (enrollments||[]).filter(e=>e.courseId===c.id);
    const allDates = courseEnrs.flatMap(e => (e.scheduledDates||[]).map(s=>s.date));
    if (allDates.length === 0) return null; // never had a real enrollment — the "尚無排課" warning already covers this case
    const todayStr = new Date().toISOString().slice(0,10);
    const hasFuture = allDates.some(d => d >= todayStr);
    if (hasFuture) return null;
    const lastDate = [...allDates].sort().reverse()[0];
    const daysSince = Math.floor((new Date() - new Date(lastDate+"T00:00:00")) / (24*60*60*1000));
    if (daysSince < 14) return null; // within the 2-week grace window
    return { course:c, lastDate, daysSince };
  }).filter(Boolean).sort((a,b)=>b.daysSince-a.daysSince);

  // ── Duplicate booking detector — the same teacher+student pair ending up
  // with TWO OR MORE scheduled sessions on the exact same date and time
  // (whether from the same course record with a stray extra entry, or from
  // two separate course records that happen to collide). This can slip in
  // from data edited before the reschedule collision-guard existed, or from
  // any other path that adds a scheduledDates entry without checking for a
  // clash. Detection only — nothing is auto-removed, since deciding WHICH
  // duplicate to drop needs a human to look at it.
  const [showDupes, setShowDupes] = useState(true);
  const duplicateBookings = (() => {
    const seen = {}; // `${teacherId}_${studentId}_${date}_${time}` -> [{course, sessionNo}]
    enrollments.forEach(enr => {
      const c = courses.find(x=>x.id===enr.courseId);
      if (!c || c.status==="archived") return;
      (enr.scheduledDates||[]).forEach(s => {
        const start = s.customStart || getCourseStartForDay(c, s.dayIndex);
        const key = `${c.teacherId}_${c.studentId}_${s.date}_${start}`;
        if (!seen[key]) seen[key] = [];
        seen[key].push({ course:c, enrollment:enr, date:s.date, dayIndex:s.dayIndex, start, sessionNo:s.sessionNo });
      });
    });
    return Object.values(seen)
      .filter(entries => entries.length > 1)
      .sort((a,b)=>a[0].date.localeCompare(b[0].date));
  })();

  return (
    <div>
      {confirmDelCourseId && <ConfirmModal title={lang==="zh"?"刪除課程":"Delete Course"} message={lang==="zh"?"確認要刪除此課程？此操作無法復原，相關教材紀錄也將失效。":"Delete this course? This cannot be undone."} confirmLabel={lang==="zh"?"確認刪除":"Delete"} onConfirm={doDelCourse} onCancel={()=>setConfirmDelCourseId(null)} danger/>}
      {confirmArchiveId && <ConfirmModal title={lang==="zh"?"結束課程":"End Course"} message={lang==="zh"?"這堂課會標記為「已結束」，不再出現在進行中名單、不能再新增排課，但完課紀錄、出缺勤、獎牌積分完全不受影響。之後隨時可以在「已結束」分頁恢復。":"This marks the course as ended — it won't appear in the active roster or accept new scheduling, but completed sessions, attendance, and medal points are completely unaffected. You can restore it anytime from the Ended tab."} confirmLabel={lang==="zh"?"確認結束課程":"End Course"} onConfirm={doArchive} onCancel={()=>setConfirmArchiveId(null)}/>}
      {matTarget && <MaterialPanel course={matTarget} initialDate={null} users={users} lang={lang} currentUser={fakeAdmin} materials={materials} setMaterials={setMaterials} setToast={setToast} onClose={()=>setMatTarget(null)} enrollments={enrollments} attendance={attendance} absences={absences}/>}
      {showBatch && <BatchMaterialModal users={users} courses={courses} materials={materials} setMaterials={setMaterials} lang={lang} setToast={setToast} onClose={()=>setShowBatch(false)} enrollments={enrollments}/>}

      {/* ── Prominent alert: sessions still missing materials — widens to include next week from Saturday onward ── */}
      {missingMaterialsThisWeek.length > 0 && showMissingMat && (
        <div style={{background:"#FFF3E0",border:"1.5px solid #FF9800",borderRadius:10,padding:"12px 16px",marginBottom:16}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,marginBottom:8}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:18}}>⚠️</span>
              <span style={{fontSize:14,fontWeight:700,color:"#E65100"}}>
                {todayDow>=5
                  ? (lang==="zh"?`本週及下週共有 ${missingMaterialsThisWeek.length} 堂課尚未填寫教材`:`${missingMaterialsThisWeek.length} session(s) this week and next still need materials`)
                  : (lang==="zh"?`本週有 ${missingMaterialsThisWeek.length} 堂課尚未填寫教材`:`${missingMaterialsThisWeek.length} session(s) this week still need materials`)}
              </span>
            </div>
            <button onClick={()=>setShowMissingMat(false)} style={{background:"transparent",border:"none",color:"#E65100",cursor:"pointer",fontSize:16,padding:"2px 6px"}}>×</button>
          </div>
          {todayDow>=5 && (
            <div style={{fontSize:11,color:"#E65100",marginBottom:8,opacity:0.85}}>
              {lang==="zh"?"（週六起提前顯示下週份，方便提早準備）":"(shown early from Saturday, so next week's can be prepped ahead of time)"}
            </div>
          )}
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {missingMaterialsThisWeek.map((m,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,background:"#FFFFFF",borderRadius:7,padding:"7px 11px",flexWrap:"wrap"}}>
                <div style={{fontSize:12,color:"#172F39"}}>
                  <strong>{m.date}</strong> ({T[lang].days[m.dayIndex]}) · {m.course.subject}
                  <span style={{color:"#9E9E9E"}}> · {getName(m.course.teacherId)} → {getName(m.course.studentId)}</span>
                </div>
                <button onClick={()=>setMatTarget(m.course)} style={{fontSize:11,padding:"4px 12px",borderRadius:5,background:"#FF9800",border:"none",color:"#fff",cursor:"pointer",fontWeight:600,whiteSpace:"nowrap"}}>
                  📄 {lang==="zh"?"前往填寫":"Fill in now"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      {missingMaterialsThisWeek.length > 0 && !showMissingMat && (
        <button onClick={()=>setShowMissingMat(true)} style={{display:"flex",alignItems:"center",gap:6,background:"#FFF3E0",border:"1px solid #FFCC80",borderRadius:7,color:"#E65100",padding:"6px 12px",fontSize:12,cursor:"pointer",marginBottom:16,fontWeight:600}}>
          ⚠️ {lang==="zh"?`${missingMaterialsThisWeek.length} 堂課尚未填寫教材（點擊展開）`:`${missingMaterialsThisWeek.length} session(s) missing materials (click to expand)`}
        </button>
      )}

      {/* ── Prominent alert: teaching relationships with no future sessions and 2+ weeks quiet — possibly lapsed, ask admin whether to remove ── */}
      {staleCourses.length > 0 && showStaleCourses && (
        <div style={{background:"#F3E5F5",border:"1.5px solid #BA68C8",borderRadius:10,padding:"12px 16px",marginBottom:16}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,marginBottom:8}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:18}}>🔍</span>
              <span style={{fontSize:14,fontWeight:700,color:"#6A1B9A"}}>
                {lang==="zh"?`${staleCourses.length} 堂課已超過 2 週沒有排課，可能已無實際任教關係`:`${staleCourses.length} course(s) with no sessions for 2+ weeks — likely no longer active`}
              </span>
            </div>
            <button onClick={()=>setShowStaleCourses(false)} style={{background:"transparent",border:"none",color:"#6A1B9A",cursor:"pointer",fontSize:16,padding:"2px 6px"}}>×</button>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {staleCourses.map(({course:c,lastDate,daysSince})=>(
              <div key={c.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,background:"#FFFFFF",borderRadius:7,padding:"7px 11px",flexWrap:"wrap"}}>
                <div style={{fontSize:12,color:"#172F39"}}>
                  <strong>{c.subject}</strong>
                  <span style={{color:"#9E9E9E"}}> · {getName(c.teacherId)} → {getName(c.studentId)}</span>
                  <div style={{fontSize:11,color:"#9E9E9E",marginTop:2}}>
                    {lang==="zh"?`最後一堂：${lastDate}（${daysSince} 天前），之後沒有任何排課`:`Last session: ${lastDate} (${daysSince} days ago), nothing scheduled since`}
                  </div>
                </div>
                <button onClick={()=>archive(c.id)} style={{fontSize:11,padding:"4px 12px",borderRadius:5,background:"transparent",border:"1px solid #6A1B9A",color:"#6A1B9A",cursor:"pointer",fontWeight:600,whiteSpace:"nowrap"}}>
                  📦 {lang==="zh"?"結束課程（封存）":"End course (archive)"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      {staleCourses.length > 0 && !showStaleCourses && (
        <button onClick={()=>setShowStaleCourses(true)} style={{display:"flex",alignItems:"center",gap:6,background:"#F3E5F5",border:"1px solid #CE93D8",borderRadius:7,color:"#6A1B9A",padding:"6px 12px",fontSize:12,cursor:"pointer",marginBottom:16,fontWeight:600}}>
          🔍 {lang==="zh"?`${staleCourses.length} 堂課可能已無實際任教關係（點擊展開）`:`${staleCourses.length} possibly-inactive course(s) (click to expand)`}
        </button>
      )}

      {/* ── Duplicate booking alert — same teacher+student, same date+time, more than one scheduled entry ── */}
      {duplicateBookings.length > 0 && showDupes && (
        <div style={{background:"#FFEBEE",border:"1.5px solid #E57373",borderRadius:10,padding:"12px 16px",marginBottom:16}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,marginBottom:8}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:18}}>🚨</span>
              <span style={{fontSize:14,fontWeight:700,color:"#C62828"}}>
                {lang==="zh"?`偵測到 ${duplicateBookings.length} 組同一時間重複排課`:`${duplicateBookings.length} duplicate booking group(s) detected`}
              </span>
            </div>
            <button onClick={()=>setShowDupes(false)} style={{background:"transparent",border:"none",color:"#C62828",cursor:"pointer",fontSize:16,padding:"2px 6px"}}>×</button>
          </div>
          <div style={{fontSize:11,color:"#C62828",marginBottom:8,opacity:0.85}}>
            {lang==="zh"?"同一位老師跟同一位學生，在同一天同一時間出現超過一筆排課。請到「付費與排課」確認哪一筆是多餘的並手動調整，系統不會自動刪除任何一筆。":"The same teacher and student have more than one session landing on the exact same date and time. Check \"Payments & Enrollment\" to see which entry is extra and adjust it manually — nothing gets auto-deleted."}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {duplicateBookings.map((group,i)=>(
              <div key={i} style={{background:"#FFFFFF",borderRadius:7,padding:"9px 12px"}}>
                <div style={{fontSize:12,color:"#172F39",marginBottom:4}}>
                  <strong>{group[0].date}</strong> ({T[lang].days[group[0].dayIndex]}) · {group[0].start} · {getName(group[0].course.teacherId)} → {getName(group[0].course.studentId)}
                </div>
                {group.map((entry,j)=>(
                  <div key={j} style={{fontSize:11,color:"#9E9E9E",paddingLeft:10,lineHeight:1.7}}>
                    · {entry.course.subject} (#{entry.sessionNo}){entry.course.id===group[0].course.id?"":`　[${lang==="zh"?"不同課程":"different course"}]`}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
      {duplicateBookings.length > 0 && !showDupes && (
        <button onClick={()=>setShowDupes(true)} style={{display:"flex",alignItems:"center",gap:6,background:"#FFEBEE",border:"1px solid #EF9A9A",borderRadius:7,color:"#C62828",padding:"6px 12px",fontSize:12,cursor:"pointer",marginBottom:16,fontWeight:600}}>
          🚨 {lang==="zh"?`偵測到 ${duplicateBookings.length} 組重複排課（點擊展開）`:`${duplicateBookings.length} duplicate booking(s) detected (click to expand)`}
        </button>
      )}
      <div style={{display:"flex",gap:8,marginBottom:"1rem",flexWrap:"wrap"}}>
        <button onClick={()=>{setShowAdd(true);setEditing(null);}} style={{background:"#1A6B8A",border:"none",borderRadius:7,color:"#fff",padding:"8px 16px",fontSize:13,cursor:"pointer"}}>+ {t.addCourse}</button>
        <button onClick={()=>setShowBatch(true)} style={{background:"transparent",border:"1px solid #4A9FD4",borderRadius:7,color:"#1A6B8A",padding:"8px 16px",fontSize:13,cursor:"pointer"}}>📦 {t.batchMaterials}</button>
      </div>

      {/* ── Active vs Ended course tabs ── */}
      <div style={{display:"flex",gap:5,marginBottom:14}}>
        {[["active",lang==="zh"?"課程進行中":"In Progress",courses.filter(c=>c.status!=="archived").length],["archived",lang==="zh"?"課程結束":"Ended",courses.filter(c=>c.status==="archived").length]].map(([k,l,cnt])=>(
          <button key={k} onClick={()=>setStatusTab(k)} style={{padding:"7px 16px",borderRadius:7,fontSize:13,cursor:"pointer",border:statusTab===k?"none":"0.5px solid #CFD8DC",background:statusTab===k?"#1A6B8A":"transparent",color:statusTab===k?"#fff":"#546E7A",fontWeight:statusTab===k?600:400}}>
            {l} <span style={{opacity:0.75}}>({cnt})</span>
          </button>
        ))}
      </div>
      {(showAdd||editing)&&(
        <div style={{background:"#F5F5F5",borderRadius:10,border:"0.5px solid #E0E0E0",padding:"1.25rem",marginBottom:"1rem"}}>
          <div style={{fontWeight:500,fontSize:14,color:"#172F39",marginBottom:10}}>{editing?t.editCourse:t.addCourse}</div>
          <CourseForm course={editing} users={users} lang={lang} onSave={save} onSaveTrial={saveTrial} onCancel={()=>{setShowAdd(false);setEditing(null);}}/>
        </div>
      )}

      {/* ── Search + filter toolbar ── */}
      <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap",marginBottom:12}}>
        <input
          value={searchQuery}
          onChange={e=>setSearchQuery(e.target.value)}
          placeholder={lang==="zh"?"🔍 搜尋課程名稱、老師或學生…":"🔍 Search course, teacher, or student…"}
          style={{flex:1,minWidth:200,boxSizing:"border-box",padding:"8px 12px",borderRadius:7,border:"0.5px solid #CFD8DC",background:"#FFFFFF",color:"#172F39",fontSize:13}}
        />
        <label style={{display:"flex",alignItems:"center",gap:5,fontSize:12,color:"#546E7A",cursor:"pointer",whiteSpace:"nowrap"}}>
          <input type="checkbox" checked={onlyUnenrolled} onChange={e=>setOnlyUnenrolled(e.target.checked)} style={{cursor:"pointer"}}/>
          ⚠️ {lang==="zh"?"只顯示未排課":"Unenrolled only"}
        </label>
        <button onClick={collapseAll} style={{fontSize:12,padding:"6px 12px",borderRadius:6,border:"0.5px solid #CFD8DC",background:"transparent",color:"#546E7A",cursor:"pointer",whiteSpace:"nowrap"}}>{lang==="zh"?"全部收合":"Collapse All"}</button>
        <button onClick={expandAll} style={{fontSize:12,padding:"6px 12px",borderRadius:6,border:"0.5px solid #CFD8DC",background:"transparent",color:"#546E7A",cursor:"pointer",whiteSpace:"nowrap"}}>{lang==="zh"?"全部展開":"Expand All"}</button>
      </div>
      <div style={{fontSize:11,color:"#9E9E9E",marginBottom:10}}>
        {lang==="zh"?`共 ${filtered.length} 堂課程（${groupKeys.length} 位老師）`:`${filtered.length} course(s) across ${groupKeys.length} teacher(s)`}
      </div>

      {filtered.length===0 && (
        <p style={{color:"#9E9E9E",fontSize:13,textAlign:"center",padding:"2rem 0"}}>{lang==="zh"?"沒有符合條件的課程":"No courses match your search"}</p>
      )}

      {/* ── Grouped by teacher, each section collapsible ── */}
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {groupKeys.map(teacherId=>{
          const groupCourses = groups[teacherId];
          const collapsed = collapsedGroups.has(teacherId);
          const unenrolledInGroup = groupCourses.filter(c=>!(enrollments||[]).some(e=>e.courseId===c.id)).length;
          return (
            <div key={teacherId} style={{border:"0.5px solid #E0E0E0",borderRadius:10,overflow:"hidden"}}>
              <button onClick={()=>toggleGroup(teacherId)} style={{width:"100%",display:"flex",alignItems:"center",gap:8,padding:"10px 14px",background:"#F5F5F5",border:"none",cursor:"pointer",textAlign:"left"}}>
                <span style={{fontSize:11,color:"#546E7A",transform:collapsed?"rotate(-90deg)":"rotate(0deg)",transition:"transform 0.15s",display:"inline-block"}}>▼</span>
                <span style={{fontWeight:600,fontSize:13,color:"#172F39"}}>👤 {teacherId==="_none"?(lang==="zh"?"未指定老師":"No Teacher"):getName(teacherId)}</span>
                <span style={{fontSize:11,color:"#9E9E9E"}}>({groupCourses.length}{lang==="zh"?" 堂":""})</span>
                {unenrolledInGroup>0 && <span style={{fontSize:10,background:"#FFF3E0",color:"#E65100",borderRadius:4,padding:"1px 7px",marginLeft:"auto"}}>⚠️ {unenrolledInGroup}</span>}
              </button>
              {!collapsed && (
                <div style={{padding:"10px",display:"flex",flexDirection:"column",gap:8,background:"#FFFFFF"}}>
                  {groupCourses.map(c=>{
                    const matCount = materials.filter(m=>m.courseId===c.id).length;
                    const hasEnrollment = (enrollments||[]).some(e=>e.courseId===c.id);
                    return (
                    <div key={c.id} style={{background:c.status==="archived"?"#FAFAFA":"#FFFFFF",border:`0.5px solid ${c.status==="archived"?"#E0E0E0":hasEnrollment?"#E0E0E0":"#FFCC80"}`,borderRadius:10,padding:"12px 14px",opacity:c.status==="archived"?0.85:1}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:6}}>
                        <div>
                          <span style={{fontWeight:500,fontSize:14,color:"#172F39"}}>{c.subject}</span>
                          {c.status==="archived" && <span style={{fontSize:10,background:"#EEEEEE",color:"#757575",borderRadius:4,padding:"1px 7px",marginLeft:8,fontWeight:600}}>{lang==="zh"?"已結束":"Ended"}</span>}
                          <div style={{fontSize:12,color:"#546E7A",marginTop:2}}>{formatCourseScheduleSummary(c,lang)} ({getCourseDays(c).length}{lang==="zh"?"堂/週":"x/wk"}) · {c.duration}min</div>
                          <div style={{fontSize:12,color:"#546E7A"}}>{getName(c.teacherId)} → {getName(c.studentId)}</div>
                          {!hasEnrollment && (
                            <div style={{fontSize:11,color:"#E65100",marginTop:4,background:"#FFF3E0",borderRadius:4,padding:"2px 8px",display:"inline-block"}}>
                              ⚠️ {lang==="zh"?"尚無付費排課紀錄，此課程不會出現在課表上（教材也不會顯示）":"No enrollment yet — this course won't appear on the schedule (materials won't show either)"}
                            </div>
                          )}
                        </div>
                        <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                          <button onClick={()=>setMatTarget(c)} style={{fontSize:12,padding:"5px 11px",borderRadius:5,border:"0.5px solid #4A9FD4",background:"transparent",color:"#1A6B8A",cursor:"pointer"}}>
                            📄 {t.materials}{matCount>0?` (${matCount})`:""}
                          </button>
                          <button onClick={()=>{setEditing(c);setShowAdd(false);}} style={{fontSize:12,padding:"5px 11px",borderRadius:5,border:"0.5px solid #CFD8DC",background:"transparent",color:"#546E7A",cursor:"pointer"}}>{t.editCourse}</button>
                          {statusTab==="active" ? (
                            hasHistory(c.id)
                              ? <button onClick={()=>archive(c.id)} style={{fontSize:12,padding:"5px 11px",borderRadius:5,border:"0.5px solid #6A1B9A",background:"transparent",color:"#6A1B9A",cursor:"pointer"}}>📦 {lang==="zh"?"結束課程":"End Course"}</button>
                              : <button onClick={()=>del(c.id)} style={{fontSize:12,padding:"5px 11px",borderRadius:5,border:"0.5px solid #C0392B",background:"transparent",color:"#D32F2F",cursor:"pointer"}}>{t.deleteCourse}</button>
                          ) : (
                            <>
                              <button onClick={()=>unarchive(c.id)} style={{fontSize:12,padding:"5px 11px",borderRadius:5,border:"0.5px solid #2E7D32",background:"transparent",color:"#2E7D32",cursor:"pointer"}}>↩ {lang==="zh"?"恢復為進行中":"Restore"}</button>
                              {!hasHistory(c.id) && (
                                <button onClick={()=>del(c.id)} style={{fontSize:12,padding:"5px 11px",borderRadius:5,border:"0.5px solid #C0392B",background:"transparent",color:"#D32F2F",cursor:"pointer"}}>🗑 {lang==="zh"?"永久刪除":"Delete Permanently"}</button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── User manager ─────────────────────────────────────────────────────────────
function UserManager({ users, setUsers, lang, setToast, onImpersonate }) {
  const t = T[lang];
  const [showAdd,setShowAdd] = useState(false);
  const [editing,setEditing] = useState(null);
  const [newUser,setNewUser] = useState({username:"",password:"",name:"",role:"student"});
  const [confirmDelUserId, setConfirmDelUserId] = useState(null);
  const [dupError, setDupError] = useState("");
  const iStyle={width:"100%",boxSizing:"border-box",padding:"8px 10px",borderRadius:6,border:"0.5px solid #CFD8DC",background:"#FFFFFF",color:"#172F39",fontSize:13};
  const lStyle={display:"block",fontSize:12,color:"#546E7A",marginBottom:4,marginTop:10};

  const addUser = async () => {
    if (!newUser.username||!newUser.password||!newUser.name) return;
    if (users.some(u=>u.username===newUser.username)) { setDupError(lang==="zh"?"此帳號已存在":"Username already exists"); return; }
    setDupError("");
    const { hash, salt } = await hashPassword(newUser.password);
    setUsers([...users,{username:newUser.username,name:newUser.name,role:newUser.role,passwordHash:hash,passwordSalt:salt,id:genId()}]);
    setNewUser({username:"",password:"",name:"",role:"student"}); setShowAdd(false); setToast(t.userAdded);
  };
  const delUser = id => { setConfirmDelUserId(id); };
  const doDelUser = () => {
    setUsers(users.filter(u=>u.id!==confirmDelUserId));
    setToast(t.userDeleted);
    setConfirmDelUserId(null);
  };
  const saveEdit = async () => {
    let pwdPatch = {};
    if (editing.newPwd) {
      const { hash, salt } = await hashPassword(editing.newPwd);
      pwdPatch = { passwordHash: hash, passwordSalt: salt, password: undefined };
    }
    setUsers(users.map(u=>u.id!==editing.id?u:{...u,name:editing.name,username:editing.username,...pwdPatch,...(u.role!=="admin"?{role:editing.role}:{}),canAssist:editing.role==="teacher"?!!editing.canAssist:undefined,canUseStudentOverview:editing.role==="teacher"?!!editing.canUseStudentOverview:undefined,canSubmitMaterials:editing.role==="student"?!!editing.canSubmitMaterials:undefined}));
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
            <option value="student">{t.role_student}</option><option value="teacher">{t.role_teacher}</option><option value="assistant">{t.role_assistant}</option>
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
            <option value="student">{t.role_student}</option><option value="teacher">{t.role_teacher}</option><option value="assistant">{t.role_assistant}</option>
          </select></>}
          {editing.role==="teacher" && (
            <label style={{display:"flex",alignItems:"center",gap:7,marginTop:12,fontSize:12,color:"#172F39",cursor:"pointer"}}>
              <input type="checkbox" checked={!!editing.canAssist} onChange={e=>setEditing(v=>({...v,canAssist:e.target.checked}))}/>
              🛠 {lang==="zh"?"同時具備助教權限（側邊欄會多一個「助教工具」入口）":"Also grant assistant access (adds an \"Assistant Tools\" sidebar item)"}
            </label>
          )}
          {editing.role==="teacher" && (
            <label style={{display:"flex",alignItems:"center",gap:7,marginTop:8,fontSize:12,color:"#172F39",cursor:"pointer"}}>
              <input type="checkbox" checked={!!editing.canUseStudentOverview} onChange={e=>setEditing(v=>({...v,canUseStudentOverview:e.target.checked}))}/>
              📊 {lang==="zh"?"開放「任教學生總覽」（測試階段功能，側邊欄會多一個入口）":"Enable \"Student Overview\" (test-phase feature, adds a sidebar item)"}
            </label>
          )}
          {editing.role==="student" && (
            <label style={{display:"flex",alignItems:"center",gap:7,marginTop:8,fontSize:12,color:"#172F39",cursor:"pointer"}}>
              <input type="checkbox" checked={!!editing.canSubmitMaterials} onChange={e=>setEditing(v=>({...v,canSubmitMaterials:e.target.checked}))}/>
              📚 {lang==="zh"?"開放自行準備教材（審核制，側邊欄會多一個入口）":"Allow self-submitted materials (review-gated, adds a sidebar item)"}
            </label>
          )}
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
              <span style={{fontSize:11,marginLeft:8,background:u.role==="admin"?"#EDE7F6":u.role==="teacher"?"#E3F2FD":u.role==="assistant"?"#FFF3E0":"#E8F5E9",color:u.role==="admin"?"#311B92":u.role==="teacher"?"#1565C0":u.role==="assistant"?"#E65100":"#2E7D32",borderRadius:4,padding:"2px 7px"}}>{t[`role_${u.role}`]}</span>
              {u.role==="teacher"&&u.canAssist&&<span style={{fontSize:11,marginLeft:4,background:"#FFF3E0",color:"#E65100",borderRadius:4,padding:"2px 7px"}}>🛠 {lang==="zh"?"兼助教":"+Assistant"}</span>}
            </div>
            <div style={{display:"flex",gap:6}}>
              {u.role!=="admin"&&<button onClick={()=>onImpersonate(u)} title={lang==="zh"?"不需密碼，直接切換成此帳號的視角":"No password needed — switch straight into this account's view"} style={{fontSize:12,padding:"5px 12px",borderRadius:5,border:"0.5px solid #4A9FD4",background:"transparent",color:"#1A6B8A",cursor:"pointer",fontWeight:500}}>🔑 {lang==="zh"?"以此身分登入":"Login as"}</button>}
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
      if (isSessionOver(s.date, resolveSessionStart(c, s), c.duration)) completed++;
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
  const [sortOldFirst, setSortOldFirst] = useState(true);
  const getName = id => users.find(u=>u.id===id)?.name||id;
  const iStyle={padding:"8px 10px",borderRadius:6,border:"0.5px solid #CFD8DC",background:"#FFFFFF",color:"#172F39",fontSize:13};

  const myCourses = courses.filter(c=>c.teacherId===selId);
  const stats = computeStats(myCourses, absences, allTime, dateFrom, dateTo, enrollments, attendance);

  // ── Full session-by-session ledger — every scheduled session for this
  // teacher's courses, with its exact date/time and what actually happened
  // (completed / student leave / teacher leave / absent-deducted). This is
  // the basis for reconciling actual teaching time against payroll — the old
  // "absence history" section only listed self-reported leave by day-of-week
  // (no exact date/time) and missed anything admin recorded directly, so it
  // couldn't answer "what exactly happened on which date".
  const STATUS_META = {
    completed:     {label:lang==="zh"?"完課":"Completed",      color:"#2E7D32", bg:"#E8F5E9"},
    absent:        {label:t.studentAbsent,                      color:"#D32F2F", bg:"#FFEBEE"},
    excused:       {label:lang==="zh"?"學生請假（順延）":"Student Leave", color:"#1A6B8A", bg:"#E3F2FD"},
    teacher_leave: {label:t.teacherAbsent,                      color:"#E65100", bg:"#FFF3E0"},
    upcoming:      {label:lang==="zh"?"尚未上課":"Upcoming",     color:"#9E9E9E", bg:"#F5F5F5"},
  };
  const allSessions = myCourses.flatMap(c => {
    const courseEnrs = (enrollments||[]).filter(e=>e.courseId===c.id);
    return courseEnrs.flatMap(enr =>
      (enr.scheduledDates||[]).map(s => {
        if (!allTime && ((dateFrom && s.date<dateFrom) || (dateTo && s.date>dateTo))) return null;
        const start = s.customStart || getCourseStartForDay(c, s.dayIndex);
        const attRec = (attendance||[]).find(a=>a.enrollmentId===enr.id && a.date===s.date);
        let status = attRec?.type;
        if (!status) status = isSessionOver(s.date, start, c.duration) ? "completed" : "upcoming";
        return { course:c, student:getName(c.studentId), date:s.date, dayIndex:s.dayIndex, start, duration:c.duration, status, note:attRec?.note||"" };
      }).filter(Boolean)
    );
  }).sort((a,b)=> sortOldFirst ? (a.date.localeCompare(b.date)||a.start.localeCompare(b.start)) : (b.date.localeCompare(a.date)||b.start.localeCompare(a.start)));

  const completedCount = allSessions.filter(s=>s.status==="completed").length;
  // ── Duration tallies — how many 25-min vs 50-min sessions were actually
  // completed, which is what payroll usually keys off of (25-min classes
  // often pay differently than 50-min ones).
  const completed25 = allSessions.filter(s=>s.status==="completed" && s.duration===25).length;
  const completed50 = allSessions.filter(s=>s.status==="completed" && s.duration===50).length;

  // ── Salary notification text — admin-only (this whole page already is).
  // Two ready-to-send phrasings, generated from whatever teacher/date-range
  // is currently selected, with the amount/account left blank for admin to
  // fill in by hand before sending. Always in English regardless of the
  // admin's own UI language, since this is what actually gets sent to the
  // teacher, not a UI string.
  const [salaryCopied, setSalaryCopied] = useState(null); // "long" | "short" | null
  const selectedTeacher = teachers.find(te=>te.id===selId);
  const greetingWord = () => { const h=new Date().getHours(); return h<12?"morning":h<18?"afternoon":"evening"; };
  const fmtEnDate = (ds) => new Date(ds+"T00:00:00").toLocaleDateString("en-US",{month:"long",day:"numeric"});
  const periodLabel = allTime ? "your full teaching record" : `${fmtEnDate(dateFrom)}–${fmtEnDate(dateTo)}`;
  const lessonBreakdown = () => {
    const parts = [];
    if (completed25>0) parts.push(`${completed25}×25min`);
    if (completed50>0) parts.push(`${completed50}×50min`);
    return parts.join("; ") || "0 lessons";
  };
  const salaryTextLong = () =>
`Good ${greetingWord()}, Teacher ${selectedTeacher?.name||""}!

We've calculated your salary for the period of ${periodLabel}. In total, you taught ${completedCount} lesson${completedCount===1?"":"s"} (${lessonBreakdown()}).

We'll be sending $_____ to your account (_____). Please confirm this is correct.

Thank you!`;
  const salaryTextShort = () =>
`Hi ${selectedTeacher?.name||""}! Quick salary summary for ${periodLabel}: ${completedCount} lesson${completedCount===1?"":"s"} total (${lessonBreakdown()}). Sending $_____ to account _____ — please confirm. Thanks!`;
  const copySalaryText = (which) => {
    const text = which==="long" ? salaryTextLong() : salaryTextShort();
    const doCopy = () => { setSalaryCopied(which); setTimeout(()=>setSalaryCopied(null),2000); };
    navigator.clipboard?.writeText(text).then(doCopy).catch(()=>{
      const ta=document.createElement("textarea"); ta.value=text; document.body.appendChild(ta);
      ta.select(); document.execCommand("copy"); document.body.removeChild(ta); doCopy();
    });
  };

  // ── Group everything by student — makes it much easier to cross-check one
  // student's record at a time instead of scanning one long mixed list.
  const sessionsByStudent = {};
  allSessions.forEach(s => {
    const sid = s.course.studentId;
    if (!sessionsByStudent[sid]) sessionsByStudent[sid] = [];
    sessionsByStudent[sid].push(s);
  });
  const studentIds = Object.keys(sessionsByStudent).sort((a,b)=>getName(a).localeCompare(getName(b)));
  const [collapsedStudents, setCollapsedStudents] = useState(new Set());
  const toggleStudent = (sid) => setCollapsedStudents(prev=>{const n=new Set(prev); n.has(sid)?n.delete(sid):n.add(sid); return n;});

  const csvExport = () => {
    const header = lang==="zh" ? "日期,星期,時間,課程,學生,狀態,備註" : "Date,Day,Time,Course,Student,Status,Note";
    const rows = allSessions.map(s => [
      s.date, T[lang].days[s.dayIndex], s.start, s.course.subject, s.student,
      STATUS_META[s.status]?.label||s.status, s.note
    ].map(v=>`"${String(v||"").replace(/"/g,'""')}"`).join(","));
    const csv = [header, ...rows].join("\r\n");
    const blob = new Blob(["\uFEFF"+csv], {type:"text/csv;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${getName(selId)}_${allTime?"all":dateFrom+"_"+dateTo}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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
        const allSessionEntries = courseEnrs.flatMap(e=>(e.scheduledDates||[]).map(s=>({...s, enr:e})));
        const totalSessions = allSessionEntries.length;
        const cAbs = absences.filter(a=>{
          if(a.courseId!==c.id) return false;
          if(!allTime&&a.requestedAt){const d=a.requestedAt.slice(0,10);if((dateFrom&&d<dateFrom)||(dateTo&&d>dateTo))return false;}
          return true;
        });
        const attRecs=(attendance||[]).filter(a=>courseEnrs.some(e=>e.id===a.enrollmentId));
        const sAbs=cAbs.filter(a=>a.requesterRole!=="teacher").length + attRecs.filter(a=>a.type==="absent"||a.type==="excused").length;
        const tAbs=cAbs.filter(a=>a.requesterRole==="teacher").length + attRecs.filter(a=>a.type==="teacher_leave").length;
        // Same fix as 學生統計 — this used to be a single "完課" number that
        // was actually total (past+future) minus leaves, not genuinely
        // "completed". Split into what's really happened vs what's left.
        const doneSoFar = allSessionEntries.filter(s => {
          if (!isSessionOver(s.date, resolveSessionStart(c, s), c.duration)) return false;
          const attRec = (attendance||[]).find(a=>a.enrollmentId===s.enr.id && a.date===s.date);
          if (attRec) return attRec.type!=="absent" && attRec.type!=="excused" && attRec.type!=="teacher_leave";
          const selfAbs = (absences||[]).find(a=>a.courseId===c.id && a.dateStr===s.date);
          return !selfAbs;
        }).length;
        const remaining = Math.max(0, totalSessions - doneSoFar - sAbs - tAbs);
        return (
          <div key={c.id} style={{background:"#FFFFFF",border:"0.5px solid #E0E0E0",borderRadius:8,padding:"10px 14px",marginBottom:8}}>
            <div style={{fontWeight:500,fontSize:13,color:"#172F39"}}>{c.subject}</div>
            <div style={{fontSize:12,color:"#546E7A",marginTop:2}}>{getName(c.studentId)} · {formatCourseScheduleSummary(c,lang)} ({c.duration}min)</div>
            <div style={{fontSize:12,marginTop:4,display:"flex",gap:12,flexWrap:"wrap"}}>
              <span style={{color:"#1565C0"}}>{lang==="zh"?"總排課":"Total"}: {totalSessions}</span>
              <span style={{color:"#880E4F"}}>{t.studentAbsent}: {sAbs}</span>
              <span style={{color:"#BF360C"}}>{t.teacherAbsent}: {tAbs}</span>
              <span style={{color:"#2E7D32"}}>{lang==="zh"?"已完課":"Completed"}: {doneSoFar}</span>
              <span style={{color:"#7B1FA2"}}>{lang==="zh"?"剩餘課程":"Remaining"}: {remaining}</span>
            </div>
          </div>
        );
      })}

      {/* ── Full date/time ledger — every session, exact date+time, for payroll reconciliation ── */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:"1.5rem",marginBottom:8,flexWrap:"wrap",gap:8}}>
        <div style={{fontSize:13,color:"#546E7A",fontWeight:500}}>
          {lang==="zh"?"完課與請假逐筆明細（依學生分區）":"Session-by-Session Ledger (grouped by student)"}
          <span style={{fontSize:11,color:"#9E9E9E",fontWeight:400,marginLeft:8}}>
            ({lang==="zh"?`共 ${allSessions.length} 筆，完課 ${completedCount} 堂`:`${allSessions.length} entries, ${completedCount} completed`})
          </span>
        </div>
        <div style={{display:"flex",gap:6}}>
          <button onClick={()=>setSortOldFirst(o=>!o)} style={{fontSize:12,padding:"5px 11px",borderRadius:6,border:"0.5px solid #CFD8DC",background:"transparent",color:"#546E7A",cursor:"pointer"}}>
            {sortOldFirst?(lang==="zh"?"↓ 舊到新":"↓ Oldest first"):(lang==="zh"?"↑ 新到舊":"↑ Newest first")}
          </button>
          {allSessions.length>0 && (
            <button onClick={csvExport} style={{fontSize:12,padding:"5px 11px",borderRadius:6,border:"0.5px solid #4A9FD4",background:"transparent",color:"#1A6B8A",cursor:"pointer"}}>
              ⬇ {lang==="zh"?"匯出 CSV":"Export CSV"}
            </button>
          )}
        </div>
      </div>

      {/* Duration tally — how many 25-min vs 50-min sessions were actually
          completed, since payroll usually keys off that directly */}
      {completedCount>0 && (
        <div style={{display:"flex",gap:10,marginBottom:12,flexWrap:"wrap"}}>
          <div style={{background:"#E3F2FD",border:"0.5px solid #90CAF9",borderRadius:8,padding:"8px 16px",fontSize:13,color:"#0D47A1"}}>
            <strong style={{fontSize:18}}>{completed25}</strong> {lang==="zh"?"堂 · 25分鐘":"× 25min sessions"}
          </div>
          <div style={{background:"#E8F5E9",border:"0.5px solid #A5D6A7",borderRadius:8,padding:"8px 16px",fontSize:13,color:"#1B5E20"}}>
            <strong style={{fontSize:18}}>{completed50}</strong> {lang==="zh"?"堂 · 50分鐘":"× 50min sessions"}
          </div>
        </div>
      )}

      {/* Salary notification text — admin only (this whole page already is
          admin-exclusive). Two ready-to-send phrasings; amount/account are
          left as blanks for you to fill in after pasting. */}
      {completedCount>0 && (
        <div style={{background:"#FAFAFA",border:"0.5px solid #E0E0E0",borderRadius:8,padding:"10px 14px",marginBottom:16}}>
          <div style={{fontSize:12,fontWeight:600,color:"#172F39",marginBottom:8}}>
            💰 {lang==="zh"?"薪資通知文字（自動帶入目前選擇的老師與區間）":"Salary Notification Text (uses the teacher/date-range currently selected)"}
          </div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <button onClick={()=>copySalaryText("long")} style={{fontSize:12,padding:"7px 14px",borderRadius:6,background:salaryCopied==="long"?"#4CAF50":"#1A6B8A",border:"none",color:"#fff",cursor:"pointer",fontWeight:500,transition:"background 0.2s"}}>
              {salaryCopied==="long" ? `✓ ${lang==="zh"?"已複製":"Copied"}` : `📋 ${lang==="zh"?"複製（完整版）":"Copy (Detailed)"}`}
            </button>
            <button onClick={()=>copySalaryText("short")} style={{fontSize:12,padding:"7px 14px",borderRadius:6,background:salaryCopied==="short"?"#4CAF50":"transparent",border:`1px solid ${salaryCopied==="short"?"#4CAF50":"#1A6B8A"}`,color:salaryCopied==="short"?"#fff":"#1A6B8A",cursor:"pointer",fontWeight:500,transition:"background 0.2s"}}>
              {salaryCopied==="short" ? `✓ ${lang==="zh"?"已複製":"Copied"}` : `📋 ${lang==="zh"?"複製（簡短版）":"Copy (Short)"}`}
            </button>
          </div>
          <div style={{fontSize:10,color:"#9E9E9E",marginTop:6,lineHeight:1.5}}>
            {lang==="zh"?"金額跟帳號欄位會留白，貼上後自行填寫。":"Amount and account number are left blank — fill them in after pasting."}
          </div>
        </div>
      )}

      {allSessions.length===0 ? (
        <p style={{color:"#9E9E9E",fontSize:13,textAlign:"center",padding:"1.5rem 0"}}>—</p>
      ) : (
        <div style={{display:"flex",gap:6,marginBottom:10}}>
          <button onClick={()=>setCollapsedStudents(new Set(studentIds))} style={{fontSize:11,padding:"4px 10px",borderRadius:5,border:"0.5px solid #CFD8DC",background:"transparent",color:"#546E7A",cursor:"pointer"}}>{lang==="zh"?"全部收合":"Collapse all"}</button>
          <button onClick={()=>setCollapsedStudents(new Set())} style={{fontSize:11,padding:"4px 10px",borderRadius:5,border:"0.5px solid #CFD8DC",background:"transparent",color:"#546E7A",cursor:"pointer"}}>{lang==="zh"?"全部展開":"Expand all"}</button>
        </div>
      )}
      {allSessions.length>0 && studentIds.map(sid => {
        const items = sessionsByStudent[sid];
        const collapsed = collapsedStudents.has(sid);
        const studentDone = items.filter(s=>s.status==="completed").length;
        const student25 = items.filter(s=>s.status==="completed"&&s.duration===25).length;
        const student50 = items.filter(s=>s.status==="completed"&&s.duration===50).length;
        return (
          <div key={sid} style={{border:"0.5px solid #E0E0E0",borderRadius:8,overflow:"hidden",marginBottom:8}}>
            <button onClick={()=>toggleStudent(sid)} style={{width:"100%",display:"flex",alignItems:"center",gap:8,padding:"9px 14px",background:"#F5F5F5",border:"none",cursor:"pointer",textAlign:"left"}}>
              <span style={{fontSize:11,color:"#546E7A",transform:collapsed?"rotate(-90deg)":"rotate(0deg)",transition:"transform 0.15s",display:"inline-block"}}>▼</span>
              <span style={{fontWeight:600,fontSize:13,color:"#172F39"}}>{getName(sid)}</span>
              <span style={{fontSize:11,color:"#9E9E9E"}}>({items.length}{lang==="zh"?" 筆，完課 ":" entries, "}{studentDone}{lang==="zh"?" 堂":" done"})</span>
              <div style={{marginLeft:"auto",display:"flex",gap:6}}>
                {student25>0&&<span style={{fontSize:10,background:"rgba(21,101,192,0.1)",color:"#0D47A1",borderRadius:4,padding:"1px 7px"}}>25{lang==="zh"?"分":"m"}×{student25}</span>}
                {student50>0&&<span style={{fontSize:10,background:"rgba(27,94,32,0.1)",color:"#1B5E20",borderRadius:4,padding:"1px 7px"}}>50{lang==="zh"?"分":"m"}×{student50}</span>}
              </div>
            </button>
            {!collapsed && (
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                <thead style={{background:"#FAFAFA"}}>
                  <tr>
                    {[lang==="zh"?"日期":"Date", lang==="zh"?"時間":"Time", lang==="zh"?"課程":"Course", lang==="zh"?"狀態":"Status", lang==="zh"?"備註":"Note"].map((h,i)=>(
                      <th key={i} style={{textAlign:"left",padding:"7px 10px",color:"#546E7A",fontWeight:600,borderBottom:"0.5px solid #E0E0E0"}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((s,i)=>{
                    const meta = STATUS_META[s.status]||STATUS_META.upcoming;
                    return (
                      <tr key={i} style={{borderBottom:"0.5px solid #F0F0F0"}}>
                        <td style={{padding:"7px 10px",color:"#172F39",whiteSpace:"nowrap"}}>{s.date} ({T[lang].days[s.dayIndex]})</td>
                        <td style={{padding:"7px 10px",color:"#546E7A",whiteSpace:"nowrap"}}>{s.start}–{addMins(s.start,s.duration)} <span style={{color:"#B0B0B0"}}>({s.duration}{lang==="zh"?"分":"m"})</span></td>
                        <td style={{padding:"7px 10px",color:"#172F39"}}>{s.course.subject}{s.course.isTrial&&<span style={{marginLeft:5,fontSize:10,background:"#FFFDE7",color:"#F57F17",borderRadius:4,padding:"1px 6px"}}>Trial</span>}</td>
                        <td style={{padding:"7px 10px"}}><span style={{background:meta.bg,color:meta.color,borderRadius:4,padding:"2px 8px",fontWeight:600,whiteSpace:"nowrap"}}>{meta.label}</span></td>
                        <td style={{padding:"7px 10px",color:"#9E9E9E"}}>{s.note||"—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Student stats ────────────────────────────────────────────────────────────
function StudentStats({ users, courses, absences, attendance, enrollments, setEnrollments, lang }) {
  const t = T[lang];
  const students = users.filter(u=>u.role==="student");
  const [selId, setSelId] = useState(students[0]?.id||"");
  const [viewMode, setViewMode] = useState("table"); // table (overview, default) | detail (single student drill-down)
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

  // ── Overview table — one row per enrollment cycle (a renewed student shows
  // multiple rows, same as the reference spreadsheet), landing page for this
  // whole tab. Clicking a row drills into the existing single-student detail
  // view below.
  const todayStr = new Date().toISOString().slice(0,10);
  const overviewRows = enrollments
    .map(enr => {
      const student = users.find(u=>u.id===enr.studentId);
      const course = courses.find(c=>c.id===enr.courseId);
      if (!student || !course) return null;
      const dir = dirEntries.find(d=>d.linkedUserId===student.id);
      const dates = (enr.scheduledDates||[]).map(s=>s.date).filter(Boolean).sort();
      const lastDate = dates[dates.length-1] || "";
      const weeklySessions = (course.schedule?.length) || (course.days?.length) || 1;
      // 首次登記購買日 — this student's EARLIEST payDate across ALL their
      // enrollments (not just this one) — a per-student fact, so it repeats
      // identically across all of that student's rows.
      const studentEnrollments = enrollments.filter(e=>e.studentId===student.id);
      const firstPurchaseDate = studentEnrollments.map(e=>e.payDate).filter(Boolean).sort()[0] || "";
      // 期滿續課？— only meaningful once this cycle has actually ended;
      // otherwise it's still in progress and the question doesn't apply yet.
      let renewed = "";
      if (lastDate && lastDate < todayStr) {
        const hasLater = studentEnrollments.some(e => e.id!==enr.id && (e.startDate||e.payDate||"") > lastDate);
        renewed = hasLater ? "yes" : "no";
      }
      return {
        enr, student, course, dir,
        nameCn: dir?.nameCn || "",
        age: dir ? fmtAge(dir.age, dir.regYear, lang) : "",
        firstPurchaseDate, renewed, lastDate, weeklySessions,
      };
    })
    .filter(Boolean)
    .sort((a,b) => getName(a.student.id).localeCompare(getName(b.student.id)) || (a.enr.startDate||"").localeCompare(b.enr.startDate||""));

  const updateEnrollExtra = (enrId, key, val) => {
    setEnrollments(es => es.map(e => e.id===enrId ? {...e, [key]:val} : e));
  };

  return (
    <div>
      {viewMode==="table" ? (
        <>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:8}}>
            <h3 style={{fontSize:15,fontWeight:600,color:"#172F39",margin:0}}>{lang==="zh"?"學生總表":"Student Overview"}</h3>
            <span style={{fontSize:12,color:"#9E9E9E"}}>{lang==="zh"?`共 ${overviewRows.length} 筆排課週期`:`${overviewRows.length} enrollment cycle(s)`}</span>
          </div>
          {overviewRows.length===0 ? (
            <p style={{color:"#9E9E9E",fontSize:13,textAlign:"center",padding:"2rem 0"}}>—</p>
          ) : (
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,minWidth:1100}}>
                <thead>
                  <tr style={{borderBottom:"1.5px solid #E0E0E0"}}>
                    {[
                      lang==="zh"?"學生姓名":"Student", lang==="zh"?"中文姓名":"Chinese Name", lang==="zh"?"年齡":"Age",
                      lang==="zh"?"首次登記購買日":"First Purchase", lang==="zh"?"正式上課日":"Start Date",
                      lang==="zh"?"期滿續課?":"Renewed?", lang==="zh"?"結束課程時間":"End Date",
                      lang==="zh"?"課程長度":"Duration", lang==="zh"?"週堂數":"Sessions/Wk", lang==="zh"?"付費堂數":"Paid Sessions",
                      lang==="zh"?"老師":"Teacher", lang==="zh"?"介紹人":"Referrer", lang==="zh"?"學費收益(NTD)":"Revenue (NTD)",
                    ].map((h,i)=><th key={i} style={{textAlign:"left",padding:"8px 10px",color:"#546E7A",fontWeight:600,whiteSpace:"nowrap"}}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {overviewRows.map(row=>(
                    <tr key={row.enr.id} style={{borderBottom:"0.5px solid #F0F0F0"}}>
                      <td style={{padding:"8px 10px",whiteSpace:"nowrap"}}>
                        <button onClick={()=>{setSelId(row.student.id);setViewMode("detail");}} style={{background:"transparent",border:"none",color:"#1A6B8A",cursor:"pointer",fontWeight:600,fontSize:12,padding:0,textDecoration:"underline"}}>
                          {row.student.name}
                        </button>
                      </td>
                      <td style={{padding:"8px 10px",whiteSpace:"nowrap"}}>{row.nameCn||"—"}</td>
                      <td style={{padding:"8px 10px",whiteSpace:"nowrap"}}>{row.age||"—"}</td>
                      <td style={{padding:"8px 10px",whiteSpace:"nowrap"}}>{row.firstPurchaseDate||"—"}</td>
                      <td style={{padding:"8px 10px",whiteSpace:"nowrap"}}>{row.enr.startDate||"—"}</td>
                      <td style={{padding:"8px 10px",whiteSpace:"nowrap"}}>
                        {row.renewed==="yes" && <span style={{color:"#2E7D32",fontWeight:600}}>Yes</span>}
                        {row.renewed==="no" && <span style={{color:"#D32F2F",fontWeight:600}}>No</span>}
                        {!row.renewed && <span style={{color:"#9E9E9E"}}>—</span>}
                      </td>
                      <td style={{padding:"8px 10px",whiteSpace:"nowrap"}}>{row.lastDate||"—"}</td>
                      <td style={{padding:"8px 10px",whiteSpace:"nowrap"}}>{row.course.duration}min</td>
                      <td style={{padding:"8px 10px",whiteSpace:"nowrap"}}>{row.weeklySessions}</td>
                      <td style={{padding:"8px 10px",whiteSpace:"nowrap"}}>{row.enr.totalSessions}</td>
                      <td style={{padding:"8px 10px",whiteSpace:"nowrap"}}>{getName(row.course.teacherId)}</td>
                      <td style={{padding:"4px 6px",whiteSpace:"nowrap"}}>
                        <input
                          defaultValue={row.enr.referrer||""}
                          onBlur={e=>{ if(e.target.value!==(row.enr.referrer||"")) updateEnrollExtra(row.enr.id,"referrer",e.target.value); }}
                          placeholder={lang==="zh"?"選填":"optional"}
                          style={{width:80,boxSizing:"border-box",padding:"5px 7px",borderRadius:5,border:"0.5px solid #E0E0E0",background:"#FAFAFA",fontSize:12,color:"#172F39"}}
                        />
                      </td>
                      <td style={{padding:"4px 6px",whiteSpace:"nowrap"}}>
                        <input
                          defaultValue={row.enr.tuitionRevenue||""}
                          onBlur={e=>{ if(e.target.value!==(row.enr.tuitionRevenue||"")) updateEnrollExtra(row.enr.id,"tuitionRevenue",e.target.value); }}
                          placeholder={lang==="zh"?"選填":"optional"}
                          style={{width:80,boxSizing:"border-box",padding:"5px 7px",borderRadius:5,border:"0.5px solid #E0E0E0",background:"#FAFAFA",fontSize:12,color:"#172F39"}}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        <>
      <button onClick={()=>setViewMode("table")} style={{display:"flex",alignItems:"center",gap:5,background:"transparent",border:"0.5px solid #CFD8DC",borderRadius:6,color:"#546E7A",padding:"5px 12px",fontSize:12,cursor:"pointer",marginBottom:14}}>
        ← {lang==="zh"?"返回總表":"Back to Overview"}
      </button>
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
        const allSessionEntries = courseEnrs.flatMap(e=>(e.scheduledDates||[]).map(s=>({...s, enr:e})));
        const totalSessions = allSessionEntries.length;
        const cAbs=absences.filter(a=>{
          if(a.courseId!==c.id) return false;
          if(!allTime&&a.requestedAt){const d=a.requestedAt.slice(0,10);if((dateFrom&&d<dateFrom)||(dateTo&&d>dateTo))return false;}
          return true;
        });
        const attRecs=(attendance||[]).filter(a=>courseEnrs.some(e=>e.id===a.enrollmentId));
        const sAbs=cAbs.filter(a=>a.requesterRole!=="teacher").length + attRecs.filter(a=>a.type==="absent"||a.type==="excused").length;
        const tAbs=cAbs.filter(a=>a.requesterRole==="teacher").length + attRecs.filter(a=>a.type==="teacher_leave").length;
        // 已完課 — sessions that have GENUINELY already happened (past) and
        // weren't excused/absent. This used to be miscalled "完課" while
        // actually counting past+future combined; now it's the real thing.
        const doneSoFar = allSessionEntries.filter(s => {
          if (!isSessionOver(s.date, resolveSessionStart(c, s), c.duration)) return false;
          const attRec = (attendance||[]).find(a=>a.enrollmentId===s.enr.id && a.date===s.date);
          if (attRec) return attRec.type!=="absent" && attRec.type!=="excused" && attRec.type!=="teacher_leave";
          const selfAbs = (absences||[]).find(a=>a.courseId===c.id && a.dateStr===s.date);
          return !selfAbs;
        }).length;
        // 剩餘課程 — everything else: not yet happened, and not already
        // excused (so it's still genuinely coming up).
        const remaining = Math.max(0, totalSessions - doneSoFar - sAbs - tAbs);
        return (
          <div key={c.id} style={{background:"#FFFFFF",border:"0.5px solid #E0E0E0",borderRadius:8,padding:"10px 14px",marginBottom:8}}>
            <div style={{fontWeight:500,fontSize:13,color:"#172F39"}}>{c.subject}</div>
            <div style={{fontSize:12,color:"#546E7A",marginTop:2}}>{getName(c.teacherId)} · {formatCourseScheduleSummary(c,lang)} ({c.duration}min)</div>
            <div style={{fontSize:12,marginTop:4,display:"flex",gap:12,flexWrap:"wrap"}}>
              <span style={{color:"#1565C0"}}>{lang==="zh"?"總排課":"Total"}: {totalSessions}</span>
              <span style={{color:"#880E4F"}}>{t.studentAbsent}: {sAbs}</span>
              <span style={{color:"#BF360C"}}>{t.teacherAbsent}: {tAbs}</span>
              <span style={{color:"#2E7D32"}}>{lang==="zh"?"已完課":"Completed"}: {doneSoFar}</span>
              <span style={{color:"#7B1FA2"}}>{lang==="zh"?"剩餘課程":"Remaining"}: {remaining}</span>
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
  const dow = getCourseDays(course); // [0..6] Mon-based — union of all schedule blocks' days
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

// When a session gets marked excused/teacher_leave ("順延"), the excused
// date itself STAYS in scheduledDates — it must still show up on the
// calendar (with its leave/faded styling) instead of silently vanishing. A
// separate compensating make-up session gets appended, continuing the
// course's regular weekly pattern, so the student doesn't lose a paid
// session. This replaces the old approach of regenerating the whole
// schedule via buildSchedule(), which fully REMOVED the excused date from
// scheduledDates — that was the actual bug: an excused/admin-recorded leave
// session couldn't be shown on the schedule because it no longer existed in
// the data at all, not because of any display logic.
// Excel/Google Sheets wrap a cell in double-quotes whenever its content has a
// newline or tab inside it (e.g. a two-line bilingual title) — naively
// splitting on every newline cuts a quoted, multi-line field in half. This
// tokenizes the WHOLE pasted block properly: a field starting with " keeps
// absorbing characters — including tabs and newlines — until its matching
// closing quote, exactly like Excel/Sheets' own paste format. Shared by the
// batch-material-paste feature and the student-overview batch importer.
// "YYYY/M/D" or "YYYY-M-D" (any digit-count month/day) → strict "YYYY-MM-DD".
// Shared by the batch-material-paste feature and the student-overview batch importer.
function normalizeDate(raw) {
  const s = (raw||"").trim();
  const m = s.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
  if (!m) return null;
  return `${m[1]}-${m[2].padStart(2,"0")}-${m[3].padStart(2,"0")}`;
}

function parseTSVBlock(text) {
  const rows = [];
  let row = [], field = "", inQuotes = false, i = 0;
  const n = text.length;
  while (i < n) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i+1] === '"') { field += '"'; i += 2; continue; }
        inQuotes = false; i++; continue;
      }
      field += c; i++; continue;
    }
    if (c === '"' && field === "") { inQuotes = true; i++; continue; }
    if (c === '\t') { row.push(field); field = ""; i++; continue; }
    if (c === '\r') { i++; continue; }
    if (c === '\n') { row.push(field); rows.push(row); row = []; field = ""; i++; continue; }
    field += c; i++;
  }
  if (field !== "" || row.length > 0) { row.push(field); rows.push(row); }
  return rows
    .map(r => r.map(c => c.trim()))
    .filter(r => r.some(c => c !== ""));
}

// What day(s)/time(s) is this enrollment CURRENTLY actually meeting on?
// Prefers `enrollment.currentPattern` — an explicit record of the pattern in
// effect, set directly by "調整未來時段" whenever it's used — over trying to
// GUESS from whichever dates happen to still be in scheduledDates. Guessing
// from dates was the earlier bug: any leftover not-yet-happened session
// still using the OLD pattern (e.g. one scheduled between "today" and a
// future effective date, which correctly stays kept) would get counted
// alongside the new pattern's days, silently reintroducing the old day into
// the deferral logic. Falls back to the course's own declared schedule only
// if this enrollment has never been adjusted at all.
function inferActivePattern(course, enrollment) {
  const map = {};
  if (enrollment.currentPattern && enrollment.currentPattern.length) {
    enrollment.currentPattern.forEach(b => { map[b.dayIndex] = b.start; });
  } else {
    getCourseSchedule(course).forEach(b => { map[b.dayIndex] = b.start; });
  }
  return map;
}

// "加開課堂" — append addCount more sessions after whatever's currently the
// LAST scheduled date, following the enrollment's CURRENT active pattern
// (same source of truth as 調整未來時段/deferExcusedSession — never guesses
// from raw dates, which is what caused the earlier reschedule bugs). Nothing
// existing is touched; this only ever appends new entries.
function extendSchedule(course, enrollment, addCount) {
  const patternMap = inferActivePattern(course, enrollment);
  const days = Object.keys(patternMap).map(Number);
  if (!days.length || !addCount) return [];
  const existingDates = (enrollment.scheduledDates||[]).map(s=>s.date);
  const lastDate = existingDates.length ? [...existingDates].sort().reverse()[0] : (enrollment.startDate || new Date().toISOString().slice(0,10));
  const maxSessionNo = Math.max(0, ...(enrollment.scheduledDates||[]).map(s=>s.sessionNo||0));
  const results = [];
  let d = new Date(lastDate+"T00:00:00");
  let count = 0, safety = 0;
  while (count < addCount && safety < 3650) {
    safety++;
    d.setDate(d.getDate()+1);
    const dow = (d.getDay()+6)%7;
    if (days.includes(dow)) {
      results.push({ date: fmtYMD(d), dayIndex: dow, sessionNo: maxSessionNo+count+1, customStart: patternMap[dow] });
      count++;
    }
  }
  return results;
}

function deferExcusedSession(course, enrollment, excusedDate) {
  const existingDates = new Set((enrollment.scheduledDates||[]).map(s=>s.date));
  const patternMap = inferActivePattern(course, enrollment);
  const days = Object.keys(patternMap).map(Number);
  if (!days.length) return enrollment.scheduledDates||[];
  const lastDate = [...existingDates].sort().reverse()[0] || enrollment.startDate || excusedDate;
  let d = new Date(lastDate+"T00:00:00");
  let compDate = null, compDayIndex = null;
  for (let i=0; i<3650; i++) { // ~10yr safety cap
    d.setDate(d.getDate()+1);
    const dow = (d.getDay()+6)%7;
    if (days.includes(dow)) {
      const ds = fmtYMD(d);
      if (!existingDates.has(ds)) { compDate = ds; compDayIndex = dow; break; }
    }
  }
  if (!compDate) return enrollment.scheduledDates||[]; // couldn't find a slot — leave schedule untouched
  const maxNo = Math.max(0, ...(enrollment.scheduledDates||[]).map(s=>s.sessionNo||0));
  return [...(enrollment.scheduledDates||[]), {date:compDate, dayIndex:compDayIndex, sessionNo:maxNo+1, rescheduledFrom:excusedDate, customStart:patternMap[compDayIndex]}];
}
// Reverting a session FROM excused/teacher_leave back to normal: the excused
// date's own entry was never removed in the first place (see above), so
// there's nothing to "re-add" there — just remove the compensating make-up
// session that was created for THIS specific excused date, if any.
function undoDeferExcusedSession(enrollment, excusedDate) {
  return (enrollment.scheduledDates||[]).filter(s => s.rescheduledFrom !== excusedDate);
}


// ─── Enrollment Manager ───────────────────────────────────────────────────────
// Adjust a student's schedule GOING FORWARD only — every already-happened
// session stays exactly as it is (same date, time, any reschedule history),
// only sessions on or after the chosen effective date get regenerated using
// the new day/time. This is the safe alternative to "編輯排課", which
// rebuilds the ENTIRE schedule from scratch and would silently rewrite
// history for a student who already has real sessions behind them.
function AdjustFutureScheduleModal({ enrollment, course, users, setEnrollments, lang, setToast, onClose, onApplied }) {
  const t = T[lang];
  const teacher = users.find(u=>u.id===course?.teacherId);
  const student = users.find(u=>u.id===course?.studentId);
  const today = new Date().toISOString().slice(0,10);

  // Same "blocks" concept as the course-creation form — a student can meet on
  // MULTIPLE different days, each potentially at its own different time, all
  // as part of one adjustment. blocksFromCourse seeds the form with the
  // course's current pattern as a starting point.
  const blankBlock = () => ({ _bid: genId(), days:[0], start:"09:00" });
  const blocksFromCourse = (c) => {
    const sched = getCourseSchedule(c);
    if (!sched.length) return [blankBlock()];
    const byTime = {};
    sched.forEach(s=>{ if(!byTime[s.start]) byTime[s.start]=[]; byTime[s.start].push(s.dayIndex); });
    return Object.entries(byTime).map(([start,days])=>({_bid:genId(), days:days.sort((a,b)=>a-b), start}));
  };

  const [blocks, setBlocks] = useState(()=>blocksFromCourse(course));
  const [effectiveDate, setEffectiveDate] = useState(today);
  const [preview, setPreview] = useState(null);

  const updateBlock = (bid, patch) => { setBlocks(bs=>bs.map(b=>b._bid===bid?{...b,...patch}:b)); setPreview(null); };
  const toggleBlockDay = (bid, d) => {
    setBlocks(bs=>bs.map(b=>{
      if (b._bid!==bid) return b;
      const cur = b.days||[];
      const next = cur.includes(d) ? cur.filter(x=>x!==d) : [...cur,d].sort((a,b2)=>a-b2);
      return {...b, days: next.length?next:[d]};
    }));
    setPreview(null);
  };
  const addBlock = () => { setBlocks(bs=>[...bs, blankBlock()]); setPreview(null); };
  const removeBlock = (bid) => { setBlocks(bs=>bs.length>1?bs.filter(b=>b._bid!==bid):bs); setPreview(null); };

  if (!course) return null;

  // dayIndex -> start time, flattened across every block (a day can only
  // belong to one block at a time in the UI, so this is unambiguous)
  const dayTimeMap = {};
  blocks.forEach(b => (b.days||[]).forEach(d => { dayTimeMap[d] = b.start; }));
  const activeDays = Object.keys(dayTimeMap).map(Number);
  const sessionsPerWeek = activeDays.length;

  // Bug fix (kept from the single-day version): a session that's ALREADY
  // HAPPENED must stay kept even if its date happens to equal the chosen
  // effective date — e.g. admin runs this in the evening after a session
  // held earlier that same day. Filtering purely on date<effectiveDate would
  // silently drop that already-real session from the schedule.
  const keptEntries = (enrollment.scheduledDates||[]).filter(s => {
    const start = s.customStart || getCourseStartForDay(course, s.dayIndex);
    return isSessionOver(s.date, start, course.duration) || s.date < effectiveDate;
  });
  const remainingCount = enrollment.totalSessions - keptEntries.length;

  const buildPreview = () => {
    if (remainingCount <= 0 || activeDays.length===0) { setPreview([]); return; }
    const keptDates = new Set(keptEntries.map(s=>s.date));
    const newDates = [];
    let d = new Date(effectiveDate+"T00:00:00");
    d.setDate(d.getDate()-1);
    let sessionNo = Math.max(0, ...keptEntries.map(s=>s.sessionNo||0)) + 1;
    for (let i=0; i<3650 && newDates.length<remainingCount; i++) {
      d.setDate(d.getDate()+1);
      const dow = (d.getDay()+6)%7;
      const ds = fmtYMD(d);
      if (activeDays.includes(dow) && !keptDates.has(ds)) {
        // customStart is set explicitly on every new entry (using THAT
        // day's own block time) — its displayed time is then fully
        // self-contained and never depends on the course's own schedule
        // pattern, which is deliberately left untouched (see confirmAdjust
        // below) so nothing here can ever retroactively affect how past
        // sessions resolve their time.
        newDates.push({date:ds, dayIndex:dow, sessionNo:sessionNo++, customStart:dayTimeMap[dow]});
      }
    }
    setPreview(newDates);
  };

  const confirmAdjust = () => {
    if (!preview) return;
    const newSchedule = [...keptEntries, ...preview];
    // The new day/time pattern, recorded explicitly and reliably — this is
    // what deferExcusedSession reads going forward for any future leave, so
    // it always knows the CURRENT arrangement without having to guess from
    // scattered dates in scheduledDates (which was the earlier bug: a
    // leftover not-yet-happened old-pattern entry, still correctly kept
    // because its date fell before the effective date, could get mistaken
    // for part of the active pattern too).
    const newPattern = activeDays.map(d => ({dayIndex:d, start:dayTimeMap[d]}));
    // Capture what the schedule looked like right before this change, so
    // the caller can offer a one-click undo if the admin picked the wrong
    // day/time by mistake.
    onApplied?.(enrollment, enrollment.scheduledDates||[]);
    setEnrollments(es=>es.map(e=>e.id===enrollment.id?{...e, scheduledDates:newSchedule, currentPattern:newPattern}:e));
    // Deliberately NOT touching the course record's own schedule/days/start
    // here. Past (kept) entries have no customStart of their own — their
    // displayed time is computed live from the course's pattern — so
    // changing that pattern would retroactively change how already-happened
    // sessions show their time, even though their raw data was untouched.
    // The new entries above carry an explicit customStart instead, which
    // makes this whole adjustment self-contained without needing to touch
    // the course at all. (If this course is also used to set up a brand new
    // future enrollment, its own "編輯課程" form can be updated separately.)
    setToast(lang==="zh"?`已調整未來時段，${keptEntries.length} 堂過去紀錄維持不變（可用復原按鈕還原）`:`Future schedule updated — ${keptEntries.length} past session(s) untouched (use Undo to revert)`);
    onClose();
  };

  const iStyle = {width:"100%",boxSizing:"border-box",padding:"8px 10px",borderRadius:6,border:"0.5px solid #CFD8DC",background:"#FFFFFF",color:"#172F39",fontSize:13};
  const lStyle = {display:"block",fontSize:12,color:"#546E7A",marginBottom:4,marginTop:12};

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9300,padding:"1rem"}}>
      <div style={{background:"#FFFFFF",borderRadius:16,width:"100%",maxWidth:560,boxSizing:"border-box",maxHeight:"88vh",display:"flex",flexDirection:"column",boxShadow:"0 8px 36px rgba(23,47,57,0.2)",overflow:"hidden"}}>
        <div style={{background:"#172F39",padding:"13px 18px",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
          <span style={{fontSize:14,fontWeight:600,color:"#fff"}}>🔄 {lang==="zh"?"調整未來時段":"Adjust Future Time Slot"}</span>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.15)",border:"none",borderRadius:"50%",width:28,height:28,cursor:"pointer",color:"#fff",fontSize:16}}>×</button>
        </div>
        <div style={{padding:"18px",overflowY:"auto",flex:1,minHeight:0}}>
          <div style={{fontSize:12,color:"#546E7A",marginBottom:10,lineHeight:1.6}}>
            {lang==="zh"
              ? <>老師：<strong>{teacher?.name}</strong>　學生：<strong>{student?.name}</strong><br/>此功能只會調整「還沒發生」的堂次，已經上過的 <strong>{keptEntries.length}</strong> 堂完全不會被更動。</>
              : <>Teacher: <strong>{teacher?.name}</strong>　Student: <strong>{student?.name}</strong><br/>This only changes sessions that haven't happened yet — the <strong>{keptEntries.length}</strong> already-held session(s) stay exactly as they are.</>}
          </div>
          <div style={{fontSize:11,color:"#9E9E9E",marginBottom:14,lineHeight:1.6}}>
            {lang==="zh"
              ? "（這不會更動課程本身預設的星期/時間；如果之後要用同一堂課建立全新的一期排課，記得另外到「課程管理」把課程本身的時段也一起更新。）"
              : "(This doesn't change the course's own default day/time. If you later create a brand-new enrollment period for this same course, update the course's own schedule separately via Course Management.)"}
          </div>

          <label style={{...lStyle,marginTop:0}}>{lang==="zh"?"生效日期（此日期起套用新時段）":"Effective date (new time applies from this date on)"}</label>
          <input type="date" min={today} value={effectiveDate} onChange={e=>{setEffectiveDate(e.target.value);setPreview(null);}} style={{...iStyle,marginBottom:6}}/>

          {/* ── Time slots — same "add multiple, days & times can differ" pattern as course creation ── */}
          <label style={lStyle}>{lang==="zh"?"新的上課時段（可新增多組，星期跟時間可各自不同）":"New Time Slots (add more — days & times can differ)"}</label>
          {blocks.map((b,idx)=>{
            const blockEnd = addMins(b.start, course.duration);
            return (
              <div key={b._bid} style={{background:"#F5F5F5",borderRadius:8,border:"0.5px solid #E0E0E0",padding:"10px 12px",marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                  <span style={{fontSize:11,fontWeight:600,color:"#546E7A"}}>{lang==="zh"?`時段 ${idx+1}`:`Slot ${idx+1}`}</span>
                  {blocks.length>1 && (
                    <button type="button" onClick={()=>removeBlock(b._bid)} style={{fontSize:11,padding:"2px 8px",borderRadius:4,border:"0.5px solid #FFCDD2",background:"transparent",color:"#D32F2F",cursor:"pointer"}}>✕ {lang==="zh"?"移除":"Remove"}</button>
                  )}
                </div>
                <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:6}}>
                  {T[lang].days.map((d,i)=>{
                    const takenByOther = blocks.some(ob=>ob._bid!==b._bid && (ob.days||[]).includes(i));
                    return (
                      <button key={i} type="button" disabled={takenByOther} onClick={()=>toggleBlockDay(b._bid,i)} style={{padding:"5px 10px",borderRadius:5,fontSize:12,cursor:takenByOther?"not-allowed":"pointer",border:`1px solid ${b.days?.includes(i)?"#1A6B8A":"#CFD8DC"}`,background:b.days?.includes(i)?"#1A6B8A":"transparent",color:takenByOther?"#CFD8DC":b.days?.includes(i)?"#fff":"#546E7A",opacity:takenByOther?0.5:1}}>{d}</button>
                    );
                  })}
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  <div>
                    <label style={{...lStyle,marginTop:0}}>{t.startTime}</label>
                    <div style={{display:"flex",gap:5,alignItems:"center"}}>
                      <select style={{...iStyle,flex:1}} value={b.start.split(":")[0]} onChange={e=>updateBlock(b._bid,{start:`${e.target.value}:${b.start.split(":")[1]||"00"}`})}>
                        {HOUR_OPTIONS.map(h=><option key={h} value={h}>{h}</option>)}
                      </select>
                      <span style={{color:"#9E9E9E"}}>:</span>
                      <select style={{...iStyle,flex:1}} value={b.start.split(":")[1]} onChange={e=>updateBlock(b._bid,{start:`${b.start.split(":")[0]||"00"}:${e.target.value}`})}>
                        {!MIN_OPTIONS.includes(b.start.split(":")[1]) && <option value={b.start.split(":")[1]}>{b.start.split(":")[1]}</option>}
                        {MIN_OPTIONS.map(m=><option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={{...lStyle,marginTop:0}}>{t.endTime}</label>
                    <div style={{...iStyle,background:"#FFFFFF",color:"#9E9E9E",borderStyle:"dashed",cursor:"not-allowed",display:"flex",alignItems:"center"}}>{blockEnd}</div>
                  </div>
                </div>
              </div>
            );
          })}
          <button type="button" onClick={addBlock} style={{width:"100%",padding:"8px",borderRadius:6,border:"1px dashed #1A6B8A",background:"transparent",color:"#1A6B8A",fontSize:12,cursor:"pointer",marginBottom:6}}>
            + {lang==="zh"?"新增時段（可設定不同星期與時間）":"Add Time Slot (different day/time)"}
          </button>
          <div style={{fontSize:11,color:"#9E9E9E",marginBottom:14}}>{t.sessionsPerWeek}: <strong style={{color:"#172F39"}}>{sessionsPerWeek}</strong> {lang==="zh"?"堂/週":"sessions/week"}</div>

          {remainingCount<=0 && (
            <div style={{background:"#FFF3E0",borderRadius:7,padding:"9px 12px",fontSize:12,color:"#E65100",marginBottom:12}}>
              {lang==="zh"?"這個生效日期之後已經沒有剩餘堂數可以調整了，請確認總堂數或生效日期。":"There are no remaining sessions to schedule after this effective date — check the total session count or the effective date."}
            </div>
          )}

          {!preview ? (
            <button onClick={buildPreview} disabled={remainingCount<=0||sessionsPerWeek===0} style={{width:"100%",padding:"9px",borderRadius:7,border:"1px solid #4A9FD4",background:"transparent",color:"#1A6B8A",fontSize:13,cursor:(remainingCount<=0||sessionsPerWeek===0)?"not-allowed":"pointer",opacity:(remainingCount<=0||sessionsPerWeek===0)?0.5:1}}>
              🔍 {lang==="zh"?"預覽新排程":"Preview New Schedule"}
            </button>
          ) : (
            <div style={{background:"#E8F5E9",border:"1px solid #A5D6A7",borderRadius:8,padding:"12px 14px"}}>
              <div style={{fontSize:12,fontWeight:600,color:"#2E7D32",marginBottom:6}}>✓ {lang==="zh"?`預覽（${preview.length} 堂新排程）`:`Preview (${preview.length} new session(s))`}</div>
              <div style={{fontSize:11,color:"#172F39",maxHeight:150,overflowY:"auto",lineHeight:1.8}}>
                {preview.map((s,i)=>(<div key={i}>{s.date} ({T[lang].days[s.dayIndex]}) {s.customStart} · #{s.sessionNo}</div>))}
              </div>
              <button onClick={()=>setPreview(null)} style={{marginTop:8,fontSize:11,padding:"4px 10px",borderRadius:5,border:"0.5px solid #CFD8DC",background:"transparent",color:"#546E7A",cursor:"pointer"}}>
                {lang==="zh"?"重新調整":"Adjust again"}
              </button>
            </div>
          )}
        </div>
        <div style={{display:"flex",gap:8,padding:"12px 18px 16px",borderTop:"0.5px solid #E0E0E0",flexShrink:0}}>
          <button onClick={confirmAdjust} disabled={!preview || preview.length===0} style={{flex:1,padding:"10px",borderRadius:7,background:(preview&&preview.length>0)?"#4CAF50":"#E0E0E0",border:"none",color:(preview&&preview.length>0)?"#fff":"#9E9E9E",fontSize:13,fontWeight:600,cursor:(preview&&preview.length>0)?"pointer":"not-allowed"}}>
            ✓ {lang==="zh"?"確認並套用":"Confirm & Apply"}
          </button>
          <button onClick={onClose} style={{padding:"10px 16px",borderRadius:7,background:"transparent",border:"0.5px solid #CFD8DC",color:"#546E7A",fontSize:13,cursor:"pointer"}}>
            {t.cancel}
          </button>
        </div>
      </div>
    </div>
  );
}


// ─── 加開課堂 — append N more sessions after whatever's currently the last
// scheduled date, using the enrollment's current pattern. Nothing existing
// (past or future) is touched; this purely extends the tail. ─────────────────
function ExtendEnrollmentModal({ enrollment, course, users, setEnrollments, lang, setToast, onClose }) {
  const teacher = users.find(u=>u.id===course?.teacherId);
  const student = users.find(u=>u.id===course?.studentId);
  const [addCount, setAddCount] = useState(4);
  const [preview, setPreview] = useState(null);

  if (!course) return null;

  const existingDates = (enrollment.scheduledDates||[]).map(s=>s.date).sort();
  const lastDate = existingDates[existingDates.length-1] || enrollment.startDate || "—";
  const patternMap = inferActivePattern(course, enrollment);
  const activeDays = Object.keys(patternMap).map(Number);

  const buildPreview = () => {
    if (!addCount || addCount<=0 || !activeDays.length) { setPreview([]); return; }
    setPreview(extendSchedule(course, enrollment, addCount));
  };

  const confirmExtend = () => {
    if (!preview || !preview.length) return;
    const newSchedule = [...(enrollment.scheduledDates||[]), ...preview];
    setEnrollments(es=>es.map(e=>e.id===enrollment.id?{...e, scheduledDates:newSchedule, totalSessions:(parseInt(e.totalSessions)||0)+preview.length}:e));
    setToast(lang==="zh"?`已加開 ${preview.length} 堂課，總堂數更新為 ${(parseInt(enrollment.totalSessions)||0)+preview.length} 堂`:`Added ${preview.length} session(s) — total is now ${(parseInt(enrollment.totalSessions)||0)+preview.length}`);
    onClose();
  };

  const iStyle = {width:"100%",boxSizing:"border-box",padding:"8px 10px",borderRadius:6,border:"0.5px solid #CFD8DC",background:"#FFFFFF",color:"#172F39",fontSize:13};

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9300,padding:"1rem"}}>
      <div style={{background:"#FFFFFF",borderRadius:16,width:"100%",maxWidth:480,boxSizing:"border-box",maxHeight:"85vh",display:"flex",flexDirection:"column",boxShadow:"0 8px 36px rgba(23,47,57,0.2)",overflow:"hidden"}}>
        <div style={{background:"#172F39",padding:"13px 18px",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
          <span style={{fontSize:14,fontWeight:600,color:"#fff"}}>➕ {lang==="zh"?"加開課堂":"Add More Sessions"}</span>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.15)",border:"none",borderRadius:"50%",width:28,height:28,cursor:"pointer",color:"#fff",fontSize:16}}>×</button>
        </div>
        <div style={{padding:"18px",overflowY:"auto",flex:1,minHeight:0}}>
          <div style={{fontSize:12,color:"#546E7A",marginBottom:12,lineHeight:1.6}}>
            {lang==="zh"
              ? <>老師：<strong>{teacher?.name}</strong>　學生：<strong>{student?.name}</strong><br/>目前已排到 <strong>{lastDate}</strong>，加開的堂數會接在這之後，完全不會動到已經排定（含已上過）的堂次。</>
              : <>Teacher: <strong>{teacher?.name}</strong>　Student: <strong>{student?.name}</strong><br/>Currently scheduled through <strong>{lastDate}</strong> — new sessions get appended after that, nothing already scheduled (or already held) is touched.</>}
          </div>

          {!activeDays.length && (
            <div style={{background:"#FFEBEE",borderRadius:7,padding:"9px 12px",fontSize:12,color:"#D32F2F",marginBottom:12}}>
              {lang==="zh"?"找不到這筆排課目前的上課規律，無法加開。":"Can't determine this enrollment's current pattern — unable to add sessions."}
            </div>
          )}

          <label style={{display:"block",fontSize:12,color:"#546E7A",marginBottom:5}}>{lang==="zh"?"要加開幾堂":"Number of sessions to add"}</label>
          <input type="number" min="1" value={addCount} onChange={e=>{setAddCount(parseInt(e.target.value)||0);setPreview(null);}} style={{...iStyle,marginBottom:14}}/>

          {!preview ? (
            <button onClick={buildPreview} disabled={!addCount||addCount<=0||!activeDays.length} style={{width:"100%",padding:"9px",borderRadius:7,border:"1px solid #4A9FD4",background:"transparent",color:"#1A6B8A",fontSize:13,cursor:(!addCount||addCount<=0||!activeDays.length)?"not-allowed":"pointer",opacity:(!addCount||addCount<=0||!activeDays.length)?0.5:1}}>
              🔍 {lang==="zh"?"預覽新增堂次":"Preview New Sessions"}
            </button>
          ) : (
            <div style={{background:"#E8F5E9",border:"1px solid #A5D6A7",borderRadius:8,padding:"12px 14px"}}>
              <div style={{fontSize:12,fontWeight:600,color:"#2E7D32",marginBottom:6}}>✓ {lang==="zh"?`預覽（${preview.length} 堂新加開）`:`Preview (${preview.length} new session(s))`}</div>
              <div style={{fontSize:11,color:"#172F39",maxHeight:180,overflowY:"auto",lineHeight:1.8}}>
                {preview.map((s,i)=>(<div key={i}>{s.date} ({T[lang].days[s.dayIndex]}) {s.customStart} · #{s.sessionNo}</div>))}
              </div>
              <button onClick={()=>setPreview(null)} style={{marginTop:8,fontSize:11,padding:"4px 10px",borderRadius:5,border:"0.5px solid #CFD8DC",background:"transparent",color:"#546E7A",cursor:"pointer"}}>
                {lang==="zh"?"重新設定":"Adjust again"}
              </button>
            </div>
          )}
        </div>
        <div style={{display:"flex",gap:8,padding:"12px 18px 16px",borderTop:"0.5px solid #E0E0E0",flexShrink:0}}>
          <button onClick={confirmExtend} disabled={!preview || preview.length===0} style={{flex:1,padding:"10px",borderRadius:7,background:(preview&&preview.length>0)?"#4CAF50":"#E0E0E0",border:"none",color:(preview&&preview.length>0)?"#fff":"#9E9E9E",fontSize:13,fontWeight:600,cursor:(preview&&preview.length>0)?"pointer":"not-allowed"}}>
            ✓ {lang==="zh"?"確認加開":"Confirm & Add"}
          </button>
          <button onClick={onClose} style={{padding:"10px 16px",borderRadius:7,background:"transparent",border:"0.5px solid #CFD8DC",color:"#546E7A",fontSize:13,cursor:"pointer"}}>
            {lang==="zh"?"取消":"Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
}

function EnrollmentManager({ users, courses, setCourses, enrollments, setEnrollments, attendance, setAttendance, lang, setToast }) {
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
  const [adjustTarget, setAdjustTarget] = useState(null);
  // A single level of undo for "調整未來時段" — captured right before the
  // change is applied, cleared once dismissed or a new adjustment is made.
  // In-memory only (not persisted), so it covers the immediate "oops, wrong
  // day/time" moment, not a long-term history.
  const [lastAdjustSnapshot, setLastAdjustSnapshot] = useState(null);
  const undoLastAdjust = () => {
    if (!lastAdjustSnapshot) return;
    setEnrollments(es=>es.map(e=>e.id===lastAdjustSnapshot.enrollmentId?{...e,scheduledDates:lastAdjustSnapshot.scheduledDates,currentPattern:lastAdjustSnapshot.currentPattern}:e));
    setToast(lang==="zh"?"已復原上一次的時段調整":"Last schedule adjustment undone");
    setLastAdjustSnapshot(null);
  };

  // ── Search / grouping / collapse state (display only — never touches enrollment data) ──
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCards, setExpandedCards] = useState(new Set()); // enrollment ids whose session grid is shown
  const [collapsedGroups, setCollapsedGroups] = useState(new Set()); // studentIds whose group is collapsed
  const toggleCard = (id) => setExpandedCards(prev=>{const n=new Set(prev); n.has(id)?n.delete(id):n.add(id); return n;});
  const toggleGroup = (id) => setCollapsedGroups(prev=>{const n=new Set(prev); n.has(id)?n.delete(id):n.add(id); return n;});
  // Active/Inactive split — same pattern as 課程管理's 進行中/已結束 tabs.
  // "Inactive" here means the enrollment itself was discontinued, OR its
  // underlying course has been ended/archived — either way it's done and
  // shouldn't clutter the main list, but nothing about its data changes.
  const [statusTab, setStatusTab] = useState("active"); // active | inactive
  const isInactiveEnrollment = (enr) => {
    const c = courses.find(x=>x.id===enr.courseId);
    return enr.status==="discontinued" || c?.status==="archived";
  };

  // Courses for selected form (all courses — needed so lookups for EXISTING
  // enrollments still resolve even if their course has since been archived)
  const allCourses = courses;
  // But the "pick a course" dropdown when setting up a NEW/edited enrollment
  // should only offer active courses — an ended course shouldn't be picked
  // for new scheduling. The currently-selected course stays visible even if
  // archived, so editing an existing (now-ended) enrollment doesn't show a
  // blank selection.
  const selectableCourses = courses.filter(c => c.status!=="archived" || c.id===form.courseId);

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

  // "中斷課程" — for when a student genuinely can't continue. Unlike delete,
  // this NEVER touches anything that already happened: every past session
  // (and its attendance/feedback/material records, none of which live on
  // the enrollment itself) stays exactly as it was. Only scheduledDates
  // entries that haven't happened yet get dropped, so the student simply
  // stops showing up on the future schedule. If this was the course's last
  // still-active enrollment, the course itself gets archived too, so
  // 課程管理 and 付費與排課 agree on the course's state instead of drifting
  // out of sync.
  const [discontinueTarget, setDiscontinueTarget] = useState(null); // enrollment being discontinued
  const [extendTarget, setExtendTarget] = useState(null); // enrollment being extended with more sessions
  const doDiscontinue = (reason) => {
    const enr = discontinueTarget;
    if (!enr) return;
    const today = new Date().toISOString().slice(0,10);
    const keptDates = (enr.scheduledDates||[]).filter(s => s.date < today);
    const removedCount = (enr.scheduledDates||[]).length - keptDates.length;
    setEnrollments(es => es.map(e => e.id===enr.id ? {
      ...e,
      scheduledDates: keptDates,
      status: "discontinued",
      discontinuedAt: today,
      discontinuedReason: (reason||"").trim(),
    } : e));
    const stillActiveElsewhere = enrollments.some(e => e.id!==enr.id && e.courseId===enr.courseId && e.status!=="discontinued");
    if (!stillActiveElsewhere) {
      setCourses(cs => cs.map(c => c.id===enr.courseId ? {...c, status:"archived", archivedAt: new Date().toISOString()} : c));
    }
    setToast(lang==="zh"?`已中斷課程，移除了 ${removedCount} 堂尚未發生的排課，歷史紀錄完整保留`:`Course discontinued — removed ${removedCount} not-yet-happened session(s), all history preserved`);
    setDiscontinueTarget(null);
  };

  // "恢復課程" — undoes a discontinue. The kept (past) sessions were never
  // touched, so those are safe; what's regenerated is the future portion —
  // built fresh from today using the course's normal weekly pattern, picking
  // session numbering back up where it left off, out to the enrollment's
  // original contracted total. If discontinuing had auto-archived the
  // course, restoring un-archives it too, so the two screens stay in sync
  // both ways.
  const restoreEnrollment = (enr) => {
    const course = courses.find(c => c.id === enr.courseId);
    if (!course) { setToast(lang==="zh"?"找不到對應課程，無法恢復":"Course not found — can't restore"); return; }
    const pastCount = (enr.scheduledDates||[]).length;
    const remainingNeeded = Math.max(0, (parseInt(enr.totalSessions)||0) - pastCount);
    const today = new Date().toISOString().slice(0,10);
    const newFutureDates = buildSchedule(course, today, remainingNeeded, [])
      .map((s,i) => ({...s, sessionNo: pastCount + i + 1}));
    setEnrollments(es => es.map(e => e.id===enr.id ? {
      ...e,
      scheduledDates: [...(enr.scheduledDates||[]), ...newFutureDates],
      status: "active",
      discontinuedAt: "",
      discontinuedReason: "",
    } : e));
    if (course.status === "archived") {
      setCourses(cs => cs.map(c => c.id===course.id ? {...c, status:"active"} : c));
    }
    setToast(lang==="zh"?`已恢復課程，重新排入 ${newFutureDates.length} 堂未來課程`:`Course restored — ${newFutureDates.length} future session(s) re-scheduled`);
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
    const wasAlreadyDeferred = existingIdx>=0 && (attendance[existingIdx].type==="excused"||attendance[existingIdx].type==="teacher_leave");
    const nextAttendance = existingIdx>=0
      ? attendance.map((a,i)=>i===existingIdx?{...a,type,note,recordedAt:new Date().toISOString()}:a)
      : [...attendance, newAttRecord];
    setAttendance(nextAttendance);

    // Newly marked excused/teacher_leave (wasn't already) → keep this date
    // visible on the schedule and append one compensating make-up session,
    // instead of the old approach of regenerating the whole schedule (which
    // deleted the excused date from scheduledDates entirely).
    if ((type==="excused"||type==="teacher_leave") && !wasAlreadyDeferred) {
      const course = allCourses.find(c=>c.id===enrollment.courseId);
      if (course) {
        const newSched = deferExcusedSession(course, enrollment, sessionEntry.date);
        setEnrollments(es=>es.map(e=>e.id===enrollment.id?{...e,scheduledDates:newSched}:e));
      }
    }
    // Changed FROM excused/teacher_leave TO something else → remove the
    // compensating make-up session added for it
    if (wasAlreadyDeferred && type!=="excused" && type!=="teacher_leave") {
      const newSched = undoDeferExcusedSession(enrollment, sessionEntry.date);
      setEnrollments(es=>es.map(e=>e.id===enrollment.id?{...e,scheduledDates:newSched}:e));
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
    if (isSessionOver(s.date, resolveSessionStart(course, s), course?.duration)) return "completed"; // ended → completed
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

  // ── Search + group-by-student (display only) ──
  const q = searchQuery.trim().toLowerCase();
  const filteredEnrollments = enrollments.filter(enr=>{
    if (statusTab==="active" ? isInactiveEnrollment(enr) : !isInactiveEnrollment(enr)) return false;
    if (!q) return true;
    const course = allCourses.find(c=>c.id===enr.courseId);
    const subject = (course?.subject||"").toLowerCase();
    const studentName = getName(enr.studentId).toLowerCase();
    return subject.includes(q) || studentName.includes(q);
  });
  const activeCount = enrollments.filter(enr=>!isInactiveEnrollment(enr)).length;
  const inactiveCount = enrollments.filter(enr=>isInactiveEnrollment(enr)).length;
  const enrollGroups = {}; // studentId -> enrollments[]
  filteredEnrollments.forEach(enr=>{
    const key = enr.studentId || "_none";
    if (!enrollGroups[key]) enrollGroups[key] = [];
    enrollGroups[key].push(enr);
  });
  const enrollGroupKeys = Object.keys(enrollGroups).sort((a,b)=>getName(a).localeCompare(getName(b)));
  const collapseAllGroups = () => setCollapsedGroups(new Set(enrollGroupKeys));
  const expandAllGroups = () => setCollapsedGroups(new Set());

  return (
    <div>
      {lastAdjustSnapshot && (
        <div style={{background:"#EEF6FB",border:"1px solid #4A9FD4",borderRadius:9,padding:"10px 14px",marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
          <span style={{fontSize:12,color:"#1A6B8A"}}>
            🔄 {lang==="zh"?`已調整「${lastAdjustSnapshot.courseName}」的未來時段`:`Adjusted future schedule for "${lastAdjustSnapshot.courseName}"`}
          </span>
          <div style={{display:"flex",gap:8}}>
            <button onClick={undoLastAdjust} style={{fontSize:12,padding:"5px 12px",borderRadius:6,background:"#1A6B8A",border:"none",color:"#fff",cursor:"pointer",fontWeight:500}}>
              ↩️ {lang==="zh"?"復原這次調整":"Undo This Adjustment"}
            </button>
            <button onClick={()=>setLastAdjustSnapshot(null)} style={{fontSize:12,padding:"5px 10px",borderRadius:6,background:"transparent",border:"0.5px solid #CFD8DC",color:"#546E7A",cursor:"pointer"}}>×</button>
          </div>
        </div>
      )}
      {confirmDelEnrollId && (() => {
        const enr = enrollments.find(e=>e.id===confirmDelEnrollId);
        const course = courses.find(c=>c.id===enr?.courseId);
        const pastCount = (enr?.scheduledDates||[]).filter(s=>s.date < new Date().toISOString().slice(0,10)).length;
        return <ConfirmModal
          title={lang==="zh"?"刪除排課紀錄":"Delete Enrollment"}
          message={lang==="zh"
            ? `確認刪除「${course?.subject||""}」的排課紀錄？${pastCount>0?`這堂課已經有 ${pastCount} 堂完成紀錄，將`:"將"}連同所有出缺勤記錄一併永久刪除，此操作無法復原。若學生只是因故無法繼續上課，建議改用「中斷課程」——那個功能會保留所有已完成的紀錄。`
            : `Delete enrollment for "${course?.subject||""}"? ${pastCount>0?`This has ${pastCount} completed session(s) — they'll`:"This will"} be permanently deleted along with all attendance records, and cannot be undone. If the student simply can't continue, use "Discontinue" instead — it preserves all completed records.`}
          confirmLabel={lang==="zh"?"確認刪除":"Delete"}
          onConfirm={doDelEnrollment}
          onCancel={()=>setConfirmDelEnrollId(null)}
          danger/>;
      })()}
      {discontinueTarget && (() => {
        const course = courses.find(c=>c.id===discontinueTarget.courseId);
        const student = users.find(u=>u.id===discontinueTarget.studentId);
        const today = new Date().toISOString().slice(0,10);
        const futureCount = (discontinueTarget.scheduledDates||[]).filter(s=>s.date>=today).length;
        return <DiscontinueModal course={course} student={student} futureCount={futureCount} lang={lang} onConfirm={doDiscontinue} onCancel={()=>setDiscontinueTarget(null)}/>;
      })()}
      {adjustTarget && (
        <AdjustFutureScheduleModal
          enrollment={adjustTarget}
          course={courses.find(c=>c.id===adjustTarget.courseId)}
          users={users}
          setEnrollments={setEnrollments}
          lang={lang} setToast={setToast}
          onClose={()=>setAdjustTarget(null)}
          onApplied={(enr, previousScheduledDates)=>{
            setLastAdjustSnapshot({
              enrollmentId: enr.id,
              scheduledDates: previousScheduledDates,
              currentPattern: enr.currentPattern || null,
              courseName: courses.find(c=>c.id===enr.courseId)?.subject || "",
            });
          }}
        />
      )}
      {extendTarget && (
        <ExtendEnrollmentModal
          enrollment={extendTarget}
          course={courses.find(c=>c.id===extendTarget.courseId)}
          users={users}
          setEnrollments={setEnrollments}
          lang={lang} setToast={setToast}
          onClose={()=>setExtendTarget(null)}
        />
      )}
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
        <div style={{background:"#F5F5F5",borderRadius:12,border:"0.5px solid #E0E0E0",padding:"1.25rem",marginBottom:"1.5rem",display:"flex",flexDirection:"column",maxHeight:"75vh"}}>
          <div style={{fontWeight:500,fontSize:14,color:"#172F39",marginBottom:12,flexShrink:0}}>{editingId?(lang==="zh"?"編輯排課":"Edit Schedule"):t.addEnrollment}</div>

          {/* Scrollable content — course/date fields + preview grid, however tall it gets */}
          <div style={{overflowY:"auto",flex:1,minHeight:0,paddingRight:2}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div>
                <label style={lStyle}>{lang==="zh"?"選擇課程":"Select Course"}</label>
                <select style={iStyle} value={form.courseId} onChange={e=>{fset("courseId",e.target.value);setPreview(null);}}>
                  <option value="">{lang==="zh"?"—請選擇—":"—Select—"}</option>
                  {selectableCourses.map(c=><option key={c.id} value={c.id}>{c.subject} ({getName(c.studentId)})</option>)}
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
                {lang==="zh"?"每週":"Weekly"}: {formatCourseScheduleSummary(selectedCourse,lang)} ({selectedCourse.duration}min)
              </div>
            )}

            <div style={{display:"flex",gap:8,marginTop:14}}>
              <button onClick={handlePreview} disabled={!form.courseId||!form.startDate} style={{flex:1,padding:"9px",borderRadius:7,background:form.courseId?"#F5F5F5":"#FFFFFF",border:"1px solid #4A9FD4",color:"#1A6B8A",fontSize:13,cursor:form.courseId?"pointer":"not-allowed"}}>
                🔍 {t.previewSchedule}
              </button>
            </div>

            {/* Preview */}
            {preview && (
              <div style={{marginTop:14}}>
                <div style={{fontSize:12,fontWeight:500,color:"#172F39",marginBottom:8}}>
                  {t.scheduledDates} — {preview.length} {lang==="zh"?"堂":"sessions"} ({lang==="zh"?"起":"from"} {form.startDate} {lang==="zh"?"至":"to"} {preview[preview.length-1]?.date})
                </div>
                {Number(form.totalSessions) !== preview.length && (
                  <div style={{fontSize:11,color:"#E65100",background:"#FFF3E0",borderRadius:6,padding:"8px 11px",marginBottom:10,lineHeight:1.6}}>
                    ⚠️ {lang==="zh"
                      ? `購買堂數為 ${form.totalSessions} 堂，但實際排課有 ${preview.length} 堂，兩者不一致——可能是請假改期造成的，請確認是否需要手動調整。`
                      : `Purchased ${form.totalSessions} session(s), but the actual schedule has ${preview.length} — these don't match, possibly from a leave reschedule. Please check if manual adjustment is needed.`}
                  </div>
                )}
                <div style={{maxHeight:220,overflowY:"auto",display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:5}}>
                  {preview.map((s,i)=>(
                    <div key={i} style={{background:s.customStart?"#F3E5F5":"#FFFFFF",border:`0.5px solid ${s.customStart?"#CE93D8":"#CFD8DC"}`,borderRadius:6,padding:"6px 9px",fontSize:11}}>
                      <div style={{color:"#9E9E9E",marginBottom:1}}>#{s.sessionNo}{s.customStart?" 🔄":""}</div>
                      <div style={{color:"#172F39",fontWeight:500}}>{s.date}</div>
                      <div style={{color:"#546E7A"}}>{T[lang].days[s.dayIndex]}{s.customStart?` ${s.customStart}`:""}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Buttons — always visible outside the scrollable area, never pushed off-screen */}
          <div style={{display:"flex",gap:8,marginTop:14,paddingTop:12,borderTop:"0.5px solid #E0E0E0",flexShrink:0}}>
            {preview && (
              <button onClick={handleSave} style={{flex:1,padding:"11px",borderRadius:7,background:"#4CAF50",border:"none",color:"#fff",fontSize:14,fontWeight:600,cursor:"pointer"}}>
                ✓ {t.confirmSchedule}
              </button>
            )}
            <button onClick={()=>{setShowForm(false);setPreview(null);setEditingId(null);}} style={{padding:"11px 16px",borderRadius:7,background:"transparent",border:"0.5px solid #CFD8DC",color:"#546E7A",fontSize:13,cursor:"pointer",flex:preview?"none":1}}>{t.cancel}</button>
          </div>
        </div>
      )}

      {/* ── Active/Inactive tabs — mirrors 課程管理's 進行中/已結束 split ── */}
      {enrollments.length>0 && (
        <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>
          {[["active",lang==="zh"?"進行中":"Active",activeCount],["inactive",lang==="zh"?"已中斷／已結束":"Discontinued / Ended",inactiveCount]].map(([k,l,cnt])=>(
            <button key={k} onClick={()=>setStatusTab(k)} style={{padding:"7px 16px",borderRadius:7,fontSize:13,cursor:"pointer",border:statusTab===k?"none":"0.5px solid #CFD8DC",background:statusTab===k?"#1A6B8A":"transparent",color:statusTab===k?"#fff":"#546E7A",fontWeight:statusTab===k?600:400}}>
              {l} ({cnt})
            </button>
          ))}
        </div>
      )}

      {/* ── Search + filter toolbar ── */}
      {enrollments.length>0 && (
        <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap",marginBottom:12}}>
          <input
            value={searchQuery}
            onChange={e=>setSearchQuery(e.target.value)}
            placeholder={lang==="zh"?"🔍 搜尋課程名稱或學生姓名…":"🔍 Search course or student…"}
            style={{flex:1,minWidth:200,boxSizing:"border-box",padding:"8px 12px",borderRadius:7,border:"0.5px solid #CFD8DC",background:"#FFFFFF",color:"#172F39",fontSize:13}}
          />
          <button onClick={collapseAllGroups} style={{fontSize:12,padding:"6px 12px",borderRadius:6,border:"0.5px solid #CFD8DC",background:"transparent",color:"#546E7A",cursor:"pointer",whiteSpace:"nowrap"}}>{lang==="zh"?"全部收合":"Collapse All"}</button>
          <button onClick={expandAllGroups} style={{fontSize:12,padding:"6px 12px",borderRadius:6,border:"0.5px solid #CFD8DC",background:"transparent",color:"#546E7A",cursor:"pointer",whiteSpace:"nowrap"}}>{lang==="zh"?"全部展開":"Expand All"}</button>
        </div>
      )}
      {enrollments.length>0 && (
        <div style={{fontSize:11,color:"#9E9E9E",marginBottom:10}}>
          {lang==="zh"?`共 ${filteredEnrollments.length} 筆排課（${enrollGroupKeys.length} 位學生）`:`${filteredEnrollments.length} enrollment(s) across ${enrollGroupKeys.length} student(s)`}
        </div>
      )}

      {/* ── Enrollment list — grouped by student, each group collapsible ── */}
      {enrollments.length===0 && !showForm && (
        <p style={{color:"#9E9E9E",fontSize:13,textAlign:"center",padding:"2rem 0"}}>{t.noEnrollments}</p>
      )}
      {enrollments.length>0 && filteredEnrollments.length===0 && (
        <p style={{color:"#9E9E9E",fontSize:13,textAlign:"center",padding:"2rem 0"}}>{lang==="zh"?"沒有符合條件的排課紀錄":"No enrollments match your search"}</p>
      )}

      {enrollGroupKeys.map(studentId=>{
        const groupEnrollments = enrollGroups[studentId];
        const groupCollapsed = collapsedGroups.has(studentId);
        return (
          <div key={studentId} style={{border:"0.5px solid #E0E0E0",borderRadius:10,overflow:"hidden",marginBottom:10}}>
            <button onClick={()=>toggleGroup(studentId)} style={{width:"100%",display:"flex",alignItems:"center",gap:8,padding:"10px 14px",background:"#F5F5F5",border:"none",cursor:"pointer",textAlign:"left"}}>
              <span style={{fontSize:11,color:"#546E7A",transform:groupCollapsed?"rotate(-90deg)":"rotate(0deg)",transition:"transform 0.15s",display:"inline-block"}}>▼</span>
              <span style={{fontWeight:600,fontSize:13,color:"#172F39"}}>🎓 {studentId==="_none"?(lang==="zh"?"未指定學生":"No Student"):getName(studentId)}</span>
              <span style={{fontSize:11,color:"#9E9E9E"}}>({groupEnrollments.length}{lang==="zh"?" 筆":""})</span>
            </button>
            {!groupCollapsed && (
              <div style={{padding:"10px",background:"#FFFFFF"}}>
                {groupEnrollments.map(enr=>{
                  const course = allCourses.find(c=>c.id===enr.courseId);
                  const stats = getStats(enr);
                  const cardExpanded = expandedCards.has(enr.id);
                  return (
                    <div key={enr.id} style={{background:enr.status==="discontinued"?"#FAFAFA":"#FFFFFF",border:enr.status==="discontinued"?"0.5px solid #FFCCBC":"0.5px solid #E0E0E0",borderRadius:12,padding:"14px 16px",marginBottom:10}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:8,marginBottom:cardExpanded?10:0}}>
                        <div>
                          <div style={{fontWeight:500,fontSize:14,color:"#172F39",display:"flex",alignItems:"center",gap:6}}>
                            {course?.subject||"—"}
                            {enr.status==="discontinued" && (
                              <span title={enr.discontinuedReason||""} style={{fontSize:10,background:"#FFF3E0",color:"#E65100",borderRadius:5,padding:"2px 8px",fontWeight:600}}>
                                ⛔ {lang==="zh"?`已中斷 ${enr.discontinuedAt||""}`:`Discontinued ${enr.discontinuedAt||""}`}
                              </span>
                            )}
                          </div>
                          <div style={{fontSize:12,color:"#546E7A",marginTop:2}}>
                            {t.payDate}: {enr.payDate} · {t.startDate}: {enr.startDate}
                          </div>
                        </div>
                        {/* Stats pills */}
                        <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
                          <span style={{fontSize:11,background:"rgba(76,175,80,0.15)",color:"#2E7D32",borderRadius:5,padding:"3px 9px",fontWeight:500}}>✓ {stats.completed} {lang==="zh"?"完課":""}</span>
                          <span style={{fontSize:11,background:"rgba(26,107,138,0.1)",color:"#9E9E9E",borderRadius:5,padding:"3px 9px"}}>📅 {enr.totalSessions} {lang==="zh"?"堂":""}</span>
                          {stats.upcoming>0&&<span style={{fontSize:11,background:"rgba(158,158,158,0.12)",color:"#9E9E9E",borderRadius:5,padding:"3px 9px"}}>○ {stats.upcoming} {lang==="zh"?"未完成":""}</span>}
                          {stats.excused>0&&<span style={{fontSize:11,background:"rgba(255,152,0,0.15)",color:"#E65100",borderRadius:5,padding:"3px 9px"}}>{lang==="zh"?"假":"Lv"} {stats.excused}</span>}
                          {stats.absent>0&&<span style={{fontSize:11,background:"rgba(211,47,47,0.15)",color:"#D32F2F",borderRadius:5,padding:"3px 9px"}}>✗ {stats.absent} {lang==="zh"?"缺勤":""}</span>}
                          <button onClick={()=>toggleCard(enr.id)} style={{fontSize:11,padding:"3px 10px",borderRadius:5,border:"0.5px solid #4A9FD4",background:cardExpanded?"#EEF6FB":"transparent",color:"#1A6B8A",cursor:"pointer",whiteSpace:"nowrap"}}>
                            {cardExpanded?(lang==="zh"?"▲ 收合堂次":"▲ Hide sessions"):(lang==="zh"?"▼ 查看堂次":"▼ View sessions")}
                          </button>
                        </div>
                      </div>

                      {/* Session grid — collapsed by default, this is what ate up all the vertical space */}
                      {cardExpanded && (
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
                      )}

                      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                        {enr.status!=="discontinued" ? (
                          <>
                            <button onClick={()=>setAdjustTarget(enr)} style={{fontSize:12,padding:"5px 12px",borderRadius:5,border:"1px solid #4A9FD4",background:"transparent",color:"#1A6B8A",cursor:"pointer",fontWeight:500}}>🔄 {lang==="zh"?"調整未來時段":"Adjust Future Time"}</button>
                            <button onClick={()=>setExtendTarget(enr)} title={lang==="zh"?"在目前已排的最後面接著往後加開，不會動到已排定的堂次":"Appends new sessions after the current last one — doesn't touch anything already scheduled"} style={{fontSize:12,padding:"5px 12px",borderRadius:5,border:"1px solid #2E7D32",background:"transparent",color:"#2E7D32",cursor:"pointer",fontWeight:500}}>➕ {lang==="zh"?"加開課堂":"Add Sessions"}</button>
                            <button onClick={()=>startEdit(enr)} title={lang==="zh"?"⚠️ 會重新產生整份排課表，含已上過的堂次也會被覆蓋——調整未來時段請改用左邊按鈕":"⚠️ Regenerates the ENTIRE schedule, including already-happened sessions — use the button on the left to adjust just future sessions"} style={{fontSize:12,padding:"5px 12px",borderRadius:5,border:"0.5px solid #CFD8DC",background:"transparent",color:"#546E7A",cursor:"pointer"}}>{lang==="zh"?"編輯排課":"Edit"}</button>
                            <button onClick={()=>setDiscontinueTarget(enr)} title={lang==="zh"?"保留所有已發生的出席/完課紀錄，只移除尚未發生的未來排課":"Keeps all past attendance/completion records — only removes sessions that haven't happened yet"} style={{fontSize:12,padding:"5px 12px",borderRadius:5,border:"1px solid #E65100",background:"transparent",color:"#E65100",cursor:"pointer",fontWeight:500}}>⛔ {lang==="zh"?"中斷課程":"Discontinue"}</button>
                          </>
                        ) : (
                          <button onClick={()=>restoreEnrollment(enr)} title={lang==="zh"?`依課程原本的固定排課規律，從今天開始重新排入剩餘堂數（原訂總堂數：${enr.totalSessions}）`:`Re-schedules the remaining sessions from today using the course's regular pattern (original total: ${enr.totalSessions})`} style={{fontSize:12,padding:"5px 12px",borderRadius:5,border:"1px solid #2E7D32",background:"transparent",color:"#2E7D32",cursor:"pointer",fontWeight:500}}>↩ {lang==="zh"?"恢復課程":"Restore"}</button>
                        )}
                        <button onClick={()=>deleteEnrollment(enr.id)} title={lang==="zh"?"⚠️ 會連同已發生的出缺勤紀錄一起完全刪除，無法復原——學生因故無法繼續請改用「中斷課程」":"⚠️ Fully deletes past attendance history too, cannot be undone — for a student who can't continue, use \"Discontinue\" instead"} style={{fontSize:12,padding:"5px 12px",borderRadius:5,border:"0.5px solid #C0392B",background:"transparent",color:"#D32F2F",cursor:"pointer"}}>{t.deleteCourse}</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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
function LeaveReview({ users, courses, absences, setAbsences, attendance, setAttendance, enrollments, setEnrollments, lang, setToast }) {
  const t = T[lang];
  const today = new Date().toISOString().slice(0,10);
  const [filterRole, setFilterRole] = useState("all");
  const [selUserId, setSelUserId] = useState("all");
  const [allTime, setAllTime] = useState(true);
  const [dateFrom, setDateFrom] = useState(today.slice(0,7)+"-01");
  const [dateTo, setDateTo] = useState(today);
  // Records list grouping — by week or month, newest first, each group can
  // collapse independently so the page doesn't turn into an endless scroll.
  const [groupUnit, setGroupUnit] = useState("week"); // week | month
  const [collapsedGroups, setCollapsedGroups] = useState(new Set());

  // Opening this page is the "I've seen it" moment for the student-leave
  // notice banner — no separate approval step exists for student leave, so
  // there's nothing else to click that would make more sense as the trigger.
  useEffect(() => {
    setAbsences(prev => {
      if (!prev.some(a => a.requesterRole==="student" && a.acknowledgedByAdmin===false)) return prev;
      return prev.map(a => a.requesterRole==="student" && a.acknowledgedByAdmin===false ? {...a, acknowledgedByAdmin:true} : a);
    });
  }, []);

  // ── Edit state ──
  const [editTarget, setEditTarget] = useState(null); // the merged record r
  const [editType, setEditType] = useState("");
  const [editNote, setEditNote] = useState("");
  // "更換時間補課" — same capability as the schedule's 📝 button: moves just
  // THIS ONE session to an admin-chosen date/time instead of marking it as leave.
  const [rsDate, setRsDate] = useState("");
  const [rsTime, setRsTime] = useState("");

  const findEnrollmentAndSession = (courseId, date) => {
    for (const enr of enrollments.filter(e=>e.courseId===courseId)) {
      const s = (enr.scheduledDates||[]).find(sd=>sd.date===date);
      if (s) return {enrollment: enr, session: s};
    }
    return null;
  };

  const openEdit = (r) => {
    setEditTarget(r);
    setEditType(r.type);
    setEditNote(r.note||"");
    const match = findEnrollmentAndSession(r.courseId, r.date);
    const course = courses.find(c=>c.id===r.courseId);
    const fallbackDayIndex = (new Date(r.date+"T00:00:00").getDay()+6)%7;
    setRsDate(r.date);
    setRsTime(
      match?.session?.customStart
      || (match && course ? getCourseStartForDay(course, match.session.dayIndex) : null)
      || (course ? getCourseStartForDay(course, fallbackDayIndex) : "")
      || ""
    );
  };

  const doRescheduleFromReview = () => {
    if (!editTarget) return;
    if (!rsDate || !rsTime) { setToast(lang==="zh"?"請選擇日期與時間":"Please pick a date and time"); return; }

    const match = findEnrollmentAndSession(editTarget.courseId, editTarget.date);
    let enrollment, session;

    if (match) {
      ({ enrollment, session } = match);
    } else {
      // The original date is no longer in scheduledDates — this happens once
      // a leave was already recorded as excused/teacher_leave: buildSchedule
      // drops that date entirely and appends ONE compensating replacement
      // session later in the sequence, keeping scheduledDates.length equal to
      // totalSessions (堂數 purchased). That replacement is the highest
      // sessionNo entry — reuse ITS slot for the specific make-up date/time
      // instead of appending an extra (11th, 12th, ...) entry, which would
      // silently desync the schedule from what was actually purchased.
      enrollment = enrollments.find(e=>e.courseId===editTarget.courseId);
      if (!enrollment || !(enrollment.scheduledDates||[]).length) { setToast(lang==="zh"?"找不到對應的排課紀錄，無法更換時間":"Couldn't find a matching enrollment — unable to reschedule"); return; }
      session = enrollment.scheduledDates.reduce((max, s) => (s.sessionNo||0) > (max.sessionNo||0) ? s : max, enrollment.scheduledDates[0]);
    }

    // Guard against creating a duplicate: if this enrollment already has a
    // DIFFERENT session on the target date, moving this one there would make
    // the same course show up twice on the same day in the schedule. This is
    // the exact mechanism that was causing duplicate same-day sessions —
    // most commonly when the fallback above picks the auto-deferred
    // replacement session and its new date happens to already be used by
    // another regularly-scheduled occurrence of the same course.
    const collision = (enrollment.scheduledDates||[]).some(s => s.date===rsDate && !(s.date===session.date && s.sessionNo===session.sessionNo));
    if (collision) {
      setToast(lang==="zh"?`${rsDate} 這堂課已經有排課了，請選擇其他日期`:`This course already has a session on ${rsDate} — pick a different date`);
      return;
    }

    const newDayIndex = (new Date(rsDate+"T00:00:00").getDay()+6)%7;
    const newSched = (enrollment.scheduledDates||[]).map(s =>
      (s.date===session.date && s.sessionNo===session.sessionNo)
        ? { ...s, date: rsDate, dayIndex: newDayIndex, customStart: rsTime, rescheduledFrom: s.rescheduledFrom || (match ? session.date : editTarget.date) }
        : s
    );
    setEnrollments(es=>es.map(e=>e.id===enrollment.id?{...e,scheduledDates:newSched}:e));
    // The original leave record is superseded by the move — remove it
    if (editTarget.source==="self") {
      setAbsences(prev=>prev.filter(a=>a.id!==editTarget._id));
    } else {
      setAttendance(prev=>prev.filter(a=>a.id!==editTarget._id));
    }
    setToast(lang==="zh"?`已將此堂課改到 ${rsDate} ${rsTime}`:`This session moved to ${rsDate} ${rsTime}`);
    setEditTarget(null); setEditType(""); setEditNote("");
  };

  const saveEdit = () => {
    if (!editTarget) return;
    if (editType === "reschedule") { doRescheduleFromReview(); return; }
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
    // Admin-recorded attendance — requestedBy must match requesterRole: a
    // "teacher_leave" entry is the TEACHER's leave and should count against
    // the teacher's stats, not the student's. The old code always attributed
    // these to the enrollment's student regardless of type, which silently
    // undercounted every teacher's leave (and overcounted their students'),
    // throwing off both sides' attendance percentages.
    ...attendance.map(a=>{
      const isTeacherLeave = a.type==="teacher_leave";
      const course = courses.find(c=>c.id===a.courseId);
      return {
        _id:a.id, source:"admin", courseId:a.courseId, date:a.date,
        requestedAt:a.recordedAt, requesterRole: isTeacherLeave?"teacher":"student",
        requestedBy: isTeacherLeave
          ? (course?.teacherId||"")
          : (enrollments.find(e=>e.id===a.enrollmentId)?.studentId||""),
        type:a.type, note:a.note||"",
      };
    }),
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
  // Sort by the actual leave DATE (not when it was requested) — newest first,
  // since that's what "由近到遠" means for a chronological leave log.
  const sorted = [...dateFiltered].sort((a,b)=>(b.date||"").localeCompare(a.date||"") || (b.requestedAt||"").localeCompare(a.requestedAt||""));

  // ── Group into week/month buckets, newest first ──
  const groupKeyOf = (dateStr) => {
    if (!dateStr) return "unknown";
    return groupUnit==="month" ? dateStr.slice(0,7) : getMondayKey(dateStr);
  };
  const recordGroups = {};
  sorted.forEach(r => {
    const key = groupKeyOf(r.date);
    if (!recordGroups[key]) recordGroups[key] = [];
    recordGroups[key].push(r);
  });
  const groupKeys = Object.keys(recordGroups).sort((a,b)=>b.localeCompare(a));
  const groupLabel = (key) => {
    if (key==="unknown") return lang==="zh"?"日期不明":"Unknown date";
    if (groupUnit==="month") {
      const [y,m] = key.split("-");
      return lang==="zh" ? `${y}年${parseInt(m)}月` : new Date(key+"-01T00:00:00").toLocaleDateString("en-US",{year:"numeric",month:"long"});
    }
    const monday = new Date(key+"T00:00:00");
    const sunday = new Date(monday); sunday.setDate(monday.getDate()+6);
    return `${fmtMD(monday)} – ${fmtMD(sunday)}`;
  };
  const toggleGroup = (key) => setCollapsedGroups(prev=>{const n=new Set(prev); n.has(key)?n.delete(key):n.add(key); return n;});
  const collapseAllGroups = () => setCollapsedGroups(new Set(groupKeys));
  const expandAllGroups = () => setCollapsedGroups(new Set());

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

      {/* Per-user overview cards — compact */}
      {selUserId==="all" && (
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:6,marginBottom:"1.25rem"}}>
          {relevantUsers.map(u=>{
            const st=getUserStats(u.id);
            const rateColor=st.rate===null?"#9E9E9E":st.rate>=80?"#2E7D32":st.rate>=60?"#E65100":"#D32F2F";
            return (
              <div key={u.id} onClick={()=>setSelUserId(u.id)} style={{background:"#FFFFFF",border:"0.5px solid #E0E0E0",borderRadius:8,padding:"7px 10px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",gap:6,transition:"box-shadow 0.15s"}}
                onMouseEnter={e=>e.currentTarget.style.boxShadow="0 2px 8px rgba(26,107,138,0.15)"}
                onMouseLeave={e=>e.currentTarget.style.boxShadow="none"}>
                <div style={{minWidth:0}}>
                  <div style={{fontWeight:500,fontSize:12,color:"#172F39",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{u.name}</div>
                  <div style={{fontSize:10,color:"#9E9E9E"}}>
                    {st.leave>0&&<span style={{color:"#1A6B8A"}}>假{st.leave} </span>}
                    {st.absent>0&&<span style={{color:"#D32F2F"}}>缺{st.absent}</span>}
                    {st.leave===0&&st.absent===0&&(st.rate!==null?(lang==="zh"?"全勤":"Perfect"):(lang==="zh"?"無排課":"No sessions"))}
                  </div>
                </div>
                {st.rate!==null&&<span style={{fontSize:13,fontWeight:700,color:rateColor,flexShrink:0}}>{st.rate}%</span>}
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

      {/* Records list — grouped by week/month, newest first, each group collapsible */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8,flexWrap:"wrap",gap:8}}>
        <div style={{fontSize:12,color:"#546E7A",fontWeight:500}}>
          {sorted.length} {lang==="zh"?"筆紀錄":"records"}
        </div>
        <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
          <div style={{display:"flex",gap:2,background:"#F5F5F5",borderRadius:6,padding:2}}>
            {[["week",lang==="zh"?"依週":"By Week"],["month",lang==="zh"?"依月":"By Month"]].map(([k,l])=>(
              <button key={k} onClick={()=>{setGroupUnit(k);setCollapsedGroups(new Set());}} style={{padding:"5px 11px",borderRadius:5,fontSize:11,cursor:"pointer",border:"none",background:groupUnit===k?"#1A6B8A":"transparent",color:groupUnit===k?"#fff":"#546E7A",fontWeight:groupUnit===k?600:400}}>{l}</button>
            ))}
          </div>
          <button onClick={collapseAllGroups} style={{fontSize:11,padding:"5px 11px",borderRadius:6,border:"0.5px solid #CFD8DC",background:"transparent",color:"#546E7A",cursor:"pointer"}}>{lang==="zh"?"全部收合":"Collapse All"}</button>
          <button onClick={expandAllGroups} style={{fontSize:11,padding:"5px 11px",borderRadius:6,border:"0.5px solid #CFD8DC",background:"transparent",color:"#546E7A",cursor:"pointer"}}>{lang==="zh"?"全部展開":"Expand All"}</button>
        </div>
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
                  {k:"reschedule",    icon:"🔄", zh:"更換時間補課",           en:"Reschedule / Make-up"},
                ].map(opt=>(
                  <button key={opt.k} onClick={()=>setEditType(opt.k)} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:8,border:`1.5px solid ${editType===opt.k?"#1A6B8A":"#E0E0E0"}`,background:editType===opt.k?"rgba(26,107,138,0.07)":"transparent",color:editType===opt.k?"#1A6B8A":"#546E7A",fontSize:12,cursor:"pointer",textAlign:"left"}}>
                    <span>{opt.icon}</span>
                    <span style={{flex:1}}>{lang==="zh"?opt.zh:opt.en}</span>
                    {editType===opt.k&&<span style={{color:"#1A6B8A",fontWeight:700}}>✓</span>}
                  </button>
                ))}
              </div>

              {/* Reschedule date/time picker — replaces the note field for this option */}
              {editType==="reschedule" ? (
                <div style={{marginBottom:16,background:"#F3E5F5",borderRadius:8,padding:"12px 13px"}}>
                  <div style={{fontSize:11,color:"#7B1FA2",marginBottom:8}}>{lang==="zh"?"這堂課只有這一次會被移動，不影響其他堂次":"Only this one session moves — no other sessions are affected"}</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                    <div>
                      <label style={{fontSize:11,color:"#546E7A",display:"block",marginBottom:4}}>{lang==="zh"?"新日期":"New Date"}</label>
                      <input type="date" style={{width:"100%",boxSizing:"border-box",padding:"7px 9px",borderRadius:6,border:"0.5px solid #CFD8DC",background:"#FFFFFF",color:"#172F39",fontSize:13}} value={rsDate} onChange={e=>setRsDate(e.target.value)}/>
                    </div>
                    <div>
                      <label style={{fontSize:11,color:"#546E7A",display:"block",marginBottom:4}}>{lang==="zh"?"新時間":"New Time"}</label>
                      <input type="time" style={{width:"100%",boxSizing:"border-box",padding:"7px 9px",borderRadius:6,border:"0.5px solid #CFD8DC",background:"#FFFFFF",color:"#172F39",fontSize:13}} value={rsTime} onChange={e=>setRsTime(e.target.value)}/>
                    </div>
                  </div>
                  {rsDate && <div style={{fontSize:11,color:"#7B1FA2",marginTop:8}}>→ {rsDate} ({T[lang].days[(new Date(rsDate+"T00:00:00").getDay()+6)%7]}) {rsTime}</div>}
                </div>
              ) : (
                <>
                  {/* Note */}
                  <div style={{fontSize:12,color:"#546E7A",marginBottom:5}}>{lang==="zh"?"備註：":"Note:"}</div>
                  <input
                    style={{width:"100%",boxSizing:"border-box",padding:"8px 10px",borderRadius:6,border:"0.5px solid #CFD8DC",background:"#FFFFFF",color:"#172F39",fontSize:13,marginBottom:16}}
                    value={editNote}
                    onChange={e=>setEditNote(e.target.value)}
                    placeholder={lang==="zh"?"備註說明（選填）":"Notes (optional)"}
                  />
                </>
              )}

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

      {groupKeys.map(key => {
        const items = recordGroups[key];
        const collapsed = collapsedGroups.has(key);
        const leaveCount = items.filter(r=>r.type!=="absent").length;
        const absentCount = items.filter(r=>r.type==="absent").length;
        return (
          <div key={key} style={{border:"0.5px solid #E0E0E0",borderRadius:10,overflow:"hidden",marginBottom:8}}>
            <button onClick={()=>toggleGroup(key)} style={{width:"100%",display:"flex",alignItems:"center",gap:8,padding:"9px 14px",background:"#F5F5F5",border:"none",cursor:"pointer",textAlign:"left"}}>
              <span style={{fontSize:11,color:"#546E7A",transform:collapsed?"rotate(-90deg)":"rotate(0deg)",transition:"transform 0.15s",display:"inline-block"}}>▼</span>
              <span style={{fontWeight:600,fontSize:13,color:"#172F39"}}>{groupLabel(key)}</span>
              <span style={{fontSize:11,color:"#9E9E9E"}}>({items.length}{lang==="zh"?" 筆":""})</span>
              <div style={{marginLeft:"auto",display:"flex",gap:6}}>
                {leaveCount>0&&<span style={{fontSize:10,background:"rgba(26,107,138,0.1)",color:"#1A6B8A",borderRadius:4,padding:"1px 7px"}}>{lang==="zh"?"假":"Lv"} {leaveCount}</span>}
                {absentCount>0&&<span style={{fontSize:10,background:"rgba(211,47,47,0.1)",color:"#D32F2F",borderRadius:4,padding:"1px 7px"}}>{lang==="zh"?"缺":"Ab"} {absentCount}</span>}
              </div>
            </button>
            {!collapsed && (
              <div style={{padding:"8px 10px",background:"#FFFFFF"}}>
                {items.map((r,i)=>{
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
            )}
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

// ─── Schedule Share Modal ──────────────────────────────────────────────────────
// Lets admin pick which OTHER student accounts (e.g. a parent/guardian logged
// in as a "student" role, or a sibling) can view this student's schedule —
// useful for young children whose family manages their account.
function ScheduleShareModal({ ownerEntry, users, dirEntries, saveDirEntries, lang, setToast, onClose }) {
  const t = T[lang];
  const ownerUser = users.find(u=>u.id===ownerEntry.linkedUserId);
  const otherStudents = users.filter(u=>u.role==="student" && u.id!==ownerEntry.linkedUserId);
  const [selected, setSelected] = useState(new Set(ownerEntry.sharedWith||[]));

  const toggle = (id) => setSelected(prev=>{const n=new Set(prev); n.has(id)?n.delete(id):n.add(id); return n;});

  const save = () => {
    const entryId = ownerEntry.id;
    const exists = dirEntries.some(d=>d.id===entryId);
    const next = exists
      ? dirEntries.map(d=>d.id===entryId ? {...d, sharedWith:[...selected]} : d)
      : [...dirEntries, {...ownerEntry, sharedWith:[...selected]}];
    saveDirEntries(next);
    setToast(t.scheduleShareSaved);
    onClose();
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9300,padding:"1rem"}}>
      <div style={{background:"#FFFFFF",borderRadius:16,width:"100%",maxWidth:400,boxSizing:"border-box",boxShadow:"0 8px 36px rgba(23,47,57,0.2)",overflow:"hidden",maxHeight:"85vh",display:"flex",flexDirection:"column"}}>
        <div style={{background:"#172F39",padding:"13px 18px",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
          <span style={{fontSize:14,fontWeight:600,color:"#fff"}}>🔗 {t.scheduleShareTitle}</span>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.15)",border:"none",borderRadius:"50%",width:28,height:28,cursor:"pointer",color:"#fff",fontSize:16}}>×</button>
        </div>
        <div style={{padding:"16px 18px",overflowY:"auto",flex:1,minHeight:0}}>
          <div style={{fontSize:12,color:"#546E7A",marginBottom:2}}>{t.scheduleShareDesc}</div>
          <div style={{fontSize:13,fontWeight:600,color:"#172F39",marginBottom:12}}>{ownerEntry.nameEn||ownerUser?.name||"—"}</div>

          {otherStudents.length===0 ? (
            <p style={{color:"#9E9E9E",fontSize:13,textAlign:"center",padding:"1.5rem 0"}}>{t.scheduleShareNoOthers}</p>
          ) : (
            <div style={{display:"flex",flexDirection:"column",gap:2,maxHeight:320,overflowY:"auto"}}>
              {otherStudents.map(s=>(
                <label key={s.id} style={{display:"flex",alignItems:"center",gap:9,padding:"8px 10px",borderRadius:7,cursor:"pointer",background:selected.has(s.id)?"#EEF6FB":"transparent"}}>
                  <input type="checkbox" checked={selected.has(s.id)} onChange={()=>toggle(s.id)} style={{cursor:"pointer"}}/>
                  <span style={{fontSize:13,color:"#172F39"}}>{s.name}</span>
                  <span style={{fontSize:11,color:"#9E9E9E"}}>@{s.username}</span>
                </label>
              ))}
            </div>
          )}

          {selected.size>0 && (
            <div style={{fontSize:11,color:"#1A6B8A",background:"#EEF6FB",borderRadius:6,padding:"8px 10px",marginTop:12}}>
              ℹ️ {t.scheduleShareHint.replace("{n}", selected.size)}
            </div>
          )}
        </div>
        <div style={{display:"flex",gap:8,padding:"12px 18px 16px",borderTop:"0.5px solid #E0E0E0",flexShrink:0}}>
          <button onClick={save} style={{flex:1,padding:"10px",borderRadius:7,background:"#1A6B8A",border:"none",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer"}}>
            ✓ {t.save}
          </button>
          <button onClick={onClose} style={{padding:"10px 16px",borderRadius:7,background:"transparent",border:"0.5px solid #CFD8DC",color:"#546E7A",fontSize:13,cursor:"pointer"}}>
            {t.cancel}
          </button>
        </div>
      </div>
    </div>
  );
}

function StudentDirectory({ users, setUsers, lang, setToast, enrollments, attendance, courses, readOnly }) {
  const t = T[lang];
  const students = users.filter(u=>u.role==="student");

  // Compute real sessions for a student (from enrollments+attendance) + manual supplement
  // "confirmed" is a one-time, admin-entered baseline (e.g. prior history from
  // before this platform) — it's ADDED to the live system count, not a freeze/
  // override. The old override behavior was the bug: once confirmed, the
  // system's ongoing session growth silently stopped counting.
  const getSessions = (linkedUserId, manualSessions, confirmedSessions) => {
    const manual = parseInt(manualSessions||0)||0;
    const confirmed = confirmedSessions!==undefined && confirmedSessions!==""
      ? (parseInt(confirmedSessions)||0)
      : 0;
    const system = linkedUserId
      ? calcStudentSessions(linkedUserId, enrollments||[], attendance||[], courses||[]).full
      : 0;
    const total = system + manual + confirmed;
    return {
      system,
      manual,
      confirmed,             // one-time baseline, always added — 0 if never set
      unofficial: system + manual, // kept for any legacy display that wants the pre-baseline figure
      total,                  // what medal uses — always live, always growing
      hasBaseline: confirmed > 0,
    };
  };

  const getMedal = (linkedUserId, manualSessions, confirmedSessions) => {
    const {total} = getSessions(linkedUserId, manualSessions, confirmedSessions);
    return getMedalInfo(total);
  };

  const [dirEntries, setDirEntries] = useState([]);
  const [dirLoaded, setDirLoaded] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [parsed, setParsed] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [showPaste, setShowPaste] = useState(false);
  const [editingId, setEditingId] = useState(null);  // id of entry being edited
  const [editForm, setEditForm] = useState({});       // form state for editing
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({nameEn:"",nameCn:"",age:"",regYear:String(new Date().getFullYear()),regDate:"",startDate:"",duration:"",manualSessions:"",linkedUserId:""});
  const [confirmDelDirId, setConfirmDelDirId] = useState(null);
  const [shareTarget, setShareTarget] = useState(null); // dir entry whose schedule-sharing is being edited
  const [sortField, setSortField] = useState(null); // "age" | "regYear" | "duration" | "points" | null
  const [sortDir, setSortDir] = useState("asc"); // "asc" | "desc"
  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d==="asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  useEffect(()=>{
    (async()=>{
      try{ const r=await window.storage.get("cp3_student_dir"); if(r?.value) setDirEntries(JSON.parse(r.value)); }catch{}
      setDirLoaded(true);
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

  const createAccounts = async () => {
    let created = 0;
    const newUsers = [...users];
    const newDir = [...dirEntries];
    for (let i = 0; i < parsed.length; i++) {
      const row = parsed[i];
      if (!selected.has(i)) continue;
      const existing = isLinked(row.nameEn);
      if (existing) continue;
      const pwd = genPassword();
      const { hash, salt } = await hashPassword(pwd);
      const username = row.nameEn.toLowerCase().replace(/\s+/g,".");
      // _defaultPwd stays plaintext ON PURPOSE — it's shown once to the admin
      // so they can actually hand the student their first-login credential.
      // It never participates in login verification; passwordHash does.
      const newUser = { id:genId(), username, passwordHash:hash, passwordSalt:salt, name:row.nameEn+(row.nameCn?` (${row.nameCn})`:""), role:"student", _defaultPwd:pwd };
      newUsers.push(newUser);
      const existingDirIdx = newDir.findIndex(d=>d.nameEn===row.nameEn);
      const entry = { id:genId(), ...row, linkedUserId:newUser.id };
      if (existingDirIdx>=0) newDir[existingDirIdx]=entry; else newDir.push(entry);
      created++;
    }
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

  // Precompute numeric sort keys once per row (points needs the getSessions
  // calc; empty/missing values always sort to the end regardless of direction)
  const sortKeyFor = (d, field) => {
    if (field === "points") return getSessions(d.linkedUserId, d.manualSessions, d.confirmedSessions).total;
    // "age" shows a computed CURRENT age (join age + years elapsed since
    // regYear), not the raw stored value — sort by that same computed number,
    // or the sort order won't match what's actually on screen.
    if (field === "age") return computeCurrentAge(d.age, d.regYear) ?? (parseInt(d.age) || null);
    const v = parseInt(d[field]);
    return isNaN(v) ? null : v;
  };
  const sortedStudents = sortField
    ? [...allStudents].sort((a,b) => {
        const av = sortKeyFor(a, sortField), bv = sortKeyFor(b, sortField);
        if (av === null && bv === null) return 0;
        if (av === null) return 1;   // empty values always last
        if (bv === null) return -1;
        return sortDir === "asc" ? av - bv : bv - av;
      })
    : allStudents;

  const iStyle={width:"100%",boxSizing:"border-box",padding:"7px 9px",borderRadius:6,border:"0.5px solid #CFD8DC",background:"#FFFFFF",color:"#172F39",fontSize:12};
  const thStyle={fontSize:11,fontWeight:600,color:"#546E7A",padding:"8px 10px",textAlign:"left",borderBottom:"1px solid #E0E0E0",whiteSpace:"nowrap",background:"#F5F5F5"};
  const tdStyle={fontSize:12,color:"#172F39",padding:"8px 10px",borderBottom:"0.5px solid #F0F0F0",verticalAlign:"middle"};
  const lStyle={fontSize:11,color:"#546E7A",display:"block",marginBottom:3,marginTop:8};

  // Small clickable header — label + sort arrow, toggles asc/desc, highlights when active
  const SortTh = ({ label, field }) => (
    <th style={thStyle}>
      <button onClick={()=>toggleSort(field)} style={{display:"flex",alignItems:"center",gap:3,background:"none",border:"none",padding:0,cursor:"pointer",font:"inherit",color:sortField===field?"#1A6B8A":"inherit",fontWeight:sortField===field?700:600}}>
        {label}
        <span style={{fontSize:9,color:sortField===field?"#1A6B8A":"#CFD8DC"}}>
          {sortField===field ? (sortDir==="asc"?"▲":"▼") : "⇅"}
        </span>
      </button>
    </th>
  );

  // Critical: every add/edit/delete/batch-import action here writes
  // [...dirEntries, ...] back to the WHOLE student directory. If that ever
  // fires before the initial fetch finishes, dirEntries is still empty and
  // the write would silently wipe out every other student's record. Block
  // interaction until the real data is in.
  if (!dirLoaded) {
    return (
      <div style={{padding:"2rem",textAlign:"center",color:"#9E9E9E"}}>
        <div style={{fontSize:28,marginBottom:8}}>⏳</div>
        <div style={{fontSize:13}}>{lang==="zh"?"載入中…":"Loading…"}</div>
      </div>
    );
  }

  return (
    <div>
      {confirmDelDirId && <ConfirmModal title={lang==="zh"?"刪除學生資料":"Delete Student"} message={lang==="zh"?"確認刪除此學生的資料？":"Delete this student record?"} confirmLabel={lang==="zh"?"確認刪除":"Delete"} onConfirm={doDelDir} onCancel={()=>setConfirmDelDirId(null)} danger/>}
      {shareTarget && <ScheduleShareModal ownerEntry={shareTarget} users={users} dirEntries={dirEntries} saveDirEntries={saveDirEntries} lang={lang} setToast={setToast} onClose={()=>setShareTarget(null)}/>}

      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.6rem",flexWrap:"wrap",gap:8}}>
        <h3 style={{fontSize:16,fontWeight:500,color:"#172F39",margin:0}}>{t.studentDir} ({allStudents.length})</h3>
        {!readOnly && (
          <div style={{display:"flex",gap:7}}>
            <button onClick={()=>{setShowAddForm(!showAddForm);setEditingId(null);}} style={{background:showAddForm?"#546E7A":"#4CAF50",border:"none",borderRadius:7,color:"#fff",padding:"7px 14px",fontSize:12,cursor:"pointer"}}>
              ＋ {t.dirAddManual}
            </button>
            <button onClick={()=>setShowPaste(!showPaste)} style={{background:"#1A6B8A",border:"none",borderRadius:7,color:"#fff",padding:"7px 14px",fontSize:12,cursor:"pointer"}}>
              📋 {t.pasteFromExcel}
            </button>
          </div>
        )}
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
      {!readOnly && showAddForm && (
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
      {!readOnly && showPaste && (
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
              <tr>
                <th style={thStyle}>{t.dirStudentName}</th>
                <th style={thStyle}>{t.dirCnName}</th>
                <SortTh label={t.dirAge} field="age"/>
                <th style={thStyle}>{lang==="zh"?"聯絡資訊":"Contact Info"}</th>
                <SortTh label={lang==="zh"?"加入年":"Join Yr"} field="regYear"/>
                <th style={thStyle}>{t.dirRegDate}</th>
                <th style={thStyle}>{t.dirStartDate}</th>
                <SortTh label={t.dirDuration} field="duration"/>
                <SortTh label={lang==="zh"?"積分":"Points"} field="points"/>
                <th style={thStyle}>{t.dirStatus}</th>
                <th style={thStyle}></th>
              </tr>
            </thead>
            <tbody>
              {sortedStudents.map((d,i)=>{
                const linkedUser = users.find(u=>u.id===d.linkedUserId);
                const entryId = d.id||d.linkedUserId;
                const isEditing = !readOnly && editingId===entryId;
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
                      {/* Contact info — birthDate/email/phone are normally self-service via student Settings, but admin can adjust here too */}
                      <td style={tdStyle}>
                        <div style={{display:"flex",flexDirection:"column",gap:3,minWidth:110}}>
                          <input style={iStyle} value={ef.birthDate||""} onChange={e=>setEditForm(f=>({...f,birthDate:e.target.value}))} placeholder="YYYY-MM-DD" title={t.settingsBirthDate}/>
                          <input style={iStyle} value={ef.email||""} onChange={e=>setEditForm(f=>({...f,email:e.target.value}))} placeholder="email" title={t.settingsEmail}/>
                          <input style={iStyle} value={ef.phone||""} onChange={e=>setEditForm(f=>({...f,phone:e.target.value}))} placeholder="phone" title={t.settingsPhone}/>
                        </div>
                      </td>
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
                    {/* Contact info — birthDate/email/phone, self-service via student Settings */}
                    <td style={tdStyle}>
                      <div style={{fontSize:11,color:"#546E7A",lineHeight:1.6}}>
                        <div>🎂 {d.birthDate || "—"}</div>
                        <div>✉️ {d.email || "—"}</div>
                        <div>📱 {d.phone || "—"}</div>
                      </div>
                    </td>
                    <td style={tdStyle}>{d.regYear||"—"}</td>
                    <td style={tdStyle}>{d.regDate||"—"}</td>
                    <td style={tdStyle}>{d.startDate||"—"}</td>
                    <td style={tdStyle}>{d.duration?(d.duration+" min"):"—"}</td>
                    {/* Sessions column — total is always live (system + manual + baseline) */}
                    <td style={tdStyle}>
                      {d.linkedUserId ? (
                        <div>
                          <div style={{display:"flex",alignItems:"baseline",gap:4,marginBottom:2}}>
                            <span style={{fontSize:15,fontWeight:800,color:medal?medal.color:"#2E7D32"}}>{sess.total}</span>
                            <span style={{fontSize:10,color:"#9E9E9E"}}>{lang==="zh"?"點":"pt"}</span>
                          </div>
                          {medal&&<div style={{fontSize:10,color:medal.color,fontWeight:500}}>{lang==="zh"?medal.zh:medal.en}</div>}
                          <div style={{fontSize:10,color:"#9E9E9E",marginTop:2}}>
                            {lang==="zh"?"系統":"Sys"}: {sess.system}
                            {sess.manual>0&&<span style={{color:"#1A6B8A"}}> + {lang==="zh"?"手動":"M"}: {sess.manual}</span>}
                            {sess.hasBaseline&&<span style={{color:"#2E7D32"}}> + {lang==="zh"?"已確認基準":"Baseline"}: {sess.confirmed}</span>}
                          </div>
                          {/* Merge manual into the permanent baseline — a one-time save that the
                              system then keeps adding to automatically going forward */}
                          {!readOnly && sess.manual>0 && (
                            <button
                              onClick={()=>{
                                const prevConfirmed = parseInt(d.confirmedSessions||0)||0;
                                const prevManual = parseInt(d.manualSessions||0)||0;
                                const merged = prevConfirmed + prevManual;
                                const next = dirEntries.map(x=>
                                  (x.id===entryId||x.linkedUserId===entryId)
                                    ? {...x, confirmedSessions: merged, manualSessions: 0, confirmedAt: new Date().toISOString()}
                                    : x
                                );
                                saveDirEntries(next);
                                setToast(lang==="zh"?`已併入基準，總計 ${merged} 點，後續系統會自動累計新完課點數`:`Merged into baseline (${merged} pts) — the system will keep adding new sessions automatically`);
                              }}
                              style={{fontSize:11,padding:"3px 10px",borderRadius:5,background:"#1A6B8A",border:"none",color:"#fff",cursor:"pointer",fontWeight:500,marginTop:4}}
                            >
                              ✓ {lang==="zh"?"併入正式基準":"Merge to Baseline"}
                            </button>
                          )}
                          {/* Reset the permanent baseline back to 0, e.g. to fix a mistaken entry */}
                          {!readOnly && sess.hasBaseline && (
                            <button
                              onClick={()=>{
                                const next = dirEntries.map(x=>
                                  (x.id===entryId||x.linkedUserId===entryId)
                                    ? {...x, confirmedSessions:"", confirmedAt:""}
                                    : x
                                );
                                saveDirEntries(next);
                                setToast(lang==="zh"?"已清除確認基準":"Baseline cleared");
                              }}
                              style={{fontSize:10,padding:"2px 7px",borderRadius:4,background:"transparent",border:"0.5px solid #CFD8DC",color:"#9E9E9E",cursor:"pointer",marginTop:4,display:"block"}}
                            >
                              {lang==="zh"?"清除基準":"Clear Baseline"}
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
                      {readOnly ? (
                        <span style={{fontSize:11,color:"#CFD8DC"}}>—</span>
                      ) : (
                        <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                          <button onClick={()=>startEdit(d)} style={{padding:"4px 9px",borderRadius:4,border:"0.5px solid #CFD8DC",background:"transparent",color:"#1A6B8A",fontSize:11,cursor:"pointer"}}>{t.dirEdit}</button>
                          {linkedUser && (
                            <button onClick={()=>setShareTarget(d)} title={t.scheduleShareBtn} style={{padding:"4px 9px",borderRadius:4,border:`0.5px solid ${(d.sharedWith||[]).length?"#1A6B8A":"#CFD8DC"}`,background:(d.sharedWith||[]).length?"#EEF6FB":"transparent",color:"#1A6B8A",fontSize:11,cursor:"pointer"}}>
                              🔗{(d.sharedWith||[]).length>0?` ${(d.sharedWith||[]).length}`:""}
                            </button>
                          )}
                          {d._fromDir && <button onClick={()=>setConfirmDelDirId(entryId)} style={{padding:"4px 9px",borderRadius:4,border:"0.5px solid #FFCDD2",background:"transparent",color:"#D32F2F",fontSize:11,cursor:"pointer"}}>✕</button>}
                        </div>
                      )}
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

// ─── Salary Modal ─────────────────────────────────────────────────────────────
// Per-teacher salary management: total paid so far + individual dated payment records.
function SalaryModal({ teacherEntry, users, lang, setToast, onClose }) {
  const t = T[lang];
  const teacherName = teacherEntry.nameEn || users.find(u=>u.id===teacherEntry.linkedUserId)?.name || "—";

  const [records, setRecords] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0,10));
  const [note, setNote] = useState("");
  const [confirmDelId, setConfirmDelId] = useState(null);

  useEffect(()=>{
    (async()=>{
      try{ const r=await window.storage.get("cp3_salary"); if(r?.value) setRecords(JSON.parse(r.value)); }catch{}
      setLoaded(true);
    })();
  },[]);

  const saveAll = async (next) => {
    setRecords(next);
    try{ await window.storage.set("cp3_salary",JSON.stringify(next)); }catch{}
  };

  const myRecords = records.filter(r=>r.teacherEntryId===teacherEntry.id).sort((a,b)=>b.date.localeCompare(a.date));
  const total = myRecords.reduce((s,r)=>s+(parseFloat(r.amount)||0),0);

  const addRecord = () => {
    const amt = parseFloat(amount);
    if (!amt || amt<=0 || !date) return;
    if (editingId) {
      saveAll(records.map(r=>r.id===editingId?{...r,amount:amt,date,note:note.trim(),editedAt:new Date().toISOString()}:r));
      setToast(lang==="zh"?"已更新薪資紀錄":"Payment record updated");
    } else {
      const rec = { id:genId(), teacherEntryId:teacherEntry.id, amount:amt, date, note:note.trim(), recordedAt:new Date().toISOString() };
      saveAll([...records, rec]);
      setToast(t.salaryAdded);
    }
    setAmount(""); setNote(""); setShowAdd(false); setEditingId(null);
  };
  const startEdit = (r) => {
    setEditingId(r.id); setAmount(String(r.amount)); setDate(r.date); setNote(r.note||""); setShowAdd(true);
  };
  const cancelForm = () => { setShowAdd(false); setEditingId(null); setAmount(""); setNote(""); };

  const doDelete = () => {
    saveAll(records.filter(r=>r.id!==confirmDelId));
    setConfirmDelId(null);
    setToast(t.salaryDeleted);
  };

  const iStyle = {width:"100%",boxSizing:"border-box",padding:"8px 10px",borderRadius:6,border:"0.5px solid #CFD8DC",background:"#FFFFFF",color:"#172F39",fontSize:13};
  const lStyle = {fontSize:12,color:"#546E7A",display:"block",marginBottom:4,marginTop:10};

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9300,padding:"1rem"}}>
      {confirmDelId && <ConfirmModal title={lang==="zh"?"刪除薪資紀錄":"Delete Payment Record"} message={t.salaryDeleteConfirm} confirmLabel={lang==="zh"?"確認刪除":"Delete"} onConfirm={doDelete} onCancel={()=>setConfirmDelId(null)} danger/>}
      <div style={{background:"#FFFFFF",borderRadius:16,width:"100%",maxWidth:420,boxSizing:"border-box",boxShadow:"0 8px 36px rgba(23,47,57,0.2)",overflow:"hidden",maxHeight:"85vh",display:"flex",flexDirection:"column"}}>
        {/* Header */}
        <div style={{background:"#172F39",padding:"13px 18px",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
          <span style={{fontSize:14,fontWeight:600,color:"#fff"}}>💰 {t.salaryManage} — {teacherName}</span>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.15)",border:"none",borderRadius:"50%",width:28,height:28,cursor:"pointer",color:"#fff",fontSize:16}}>×</button>
        </div>
        <div style={{padding:"16px 18px",overflowY:"auto"}}>
          {/* Total */}
          <div style={{background:"#E8F5E9",borderRadius:10,padding:"14px 16px",textAlign:"center",marginBottom:14,border:"1px solid #C8E6C9"}}>
            <div style={{fontSize:11,color:"#2E7D32",fontWeight:500,letterSpacing:"0.04em",marginBottom:4}}>{t.salaryTotal.toUpperCase()}</div>
            <div style={{fontSize:30,fontWeight:800,color:"#2E7D32"}}>{total.toLocaleString()}</div>
          </div>

          {/* Add / Edit form */}
          {!showAdd ? (
            <button onClick={()=>setShowAdd(true)} style={{width:"100%",padding:"9px",borderRadius:7,background:"#1A6B8A",border:"none",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",marginBottom:14}}>
              ＋ {t.salaryAdd}
            </button>
          ) : (
            <div style={{background:"#F5F5F5",borderRadius:10,padding:"12px 14px",marginBottom:14,border:"0.5px solid #E0E0E0"}}>
              <div style={{fontSize:12,fontWeight:600,color:"#172F39",marginBottom:2}}>{editingId?(lang==="zh"?"✏️ 編輯薪資紀錄":"✏️ Edit Payment Record"):(lang==="zh"?"新增薪資紀錄":"New Payment Record")}</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div>
                  <label style={lStyle}>{t.salaryAmount}</label>
                  <input type="number" style={iStyle} value={amount} onChange={e=>setAmount(e.target.value)} placeholder="0"/>
                </div>
                <div>
                  <label style={lStyle}>{t.salaryDate}</label>
                  <input type="date" style={iStyle} value={date} onChange={e=>setDate(e.target.value)}/>
                </div>
              </div>
              <label style={lStyle}>{t.salaryNote}</label>
              <input style={iStyle} value={note} onChange={e=>setNote(e.target.value)} placeholder={lang==="zh"?"例：6月份薪資":"e.g. June salary"}/>
              <div style={{display:"flex",gap:8,marginTop:12}}>
                <button onClick={addRecord} disabled={!amount||parseFloat(amount)<=0} style={{flex:1,padding:"8px",borderRadius:6,background:(amount&&parseFloat(amount)>0)?"#2E7D32":"#E0E0E0",border:"none",color:(amount&&parseFloat(amount)>0)?"#fff":"#9E9E9E",fontSize:13,fontWeight:600,cursor:(amount&&parseFloat(amount)>0)?"pointer":"not-allowed"}}>
                  ✓ {editingId?(lang==="zh"?"儲存修改":"Save Changes"):t.salarySave}
                </button>
                <button onClick={cancelForm} style={{padding:"8px 14px",borderRadius:6,background:"transparent",border:"0.5px solid #CFD8DC",color:"#546E7A",fontSize:13,cursor:"pointer"}}>
                  {t.cancel}
                </button>
              </div>
            </div>
          )}

          {/* History */}
          <div style={{fontSize:12,fontWeight:600,color:"#172F39",marginBottom:8}}>{t.salaryRecords}</div>
          {!loaded && <div style={{fontSize:12,color:"#9E9E9E",textAlign:"center",padding:"1rem 0"}}>{lang==="zh"?"載入中…":"Loading…"}</div>}
          {loaded && myRecords.length===0 && <div style={{fontSize:12,color:"#9E9E9E",textAlign:"center",padding:"1rem 0"}}>{t.salaryNone}</div>}
          {myRecords.map(r=>(
            <div key={r.id} style={{display:"flex",alignItems:"center",gap:10,background:"#FAFAFA",border:"0.5px solid #E0E0E0",borderRadius:8,padding:"9px 12px",marginBottom:6}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:600,color:"#172F39"}}>{parseFloat(r.amount).toLocaleString()}</div>
                <div style={{fontSize:11,color:"#9E9E9E"}}>{r.date}{r.note?` · ${r.note}`:""}{r.editedAt?` · ${lang==="zh"?"已修改":"edited"}`:""}</div>
              </div>
              <button onClick={()=>startEdit(r)} style={{fontSize:11,padding:"4px 9px",borderRadius:5,border:"0.5px solid #CFD8DC",background:"transparent",color:"#1A6B8A",cursor:"pointer",flexShrink:0}}>✏️</button>
              <button onClick={()=>setConfirmDelId(r.id)} style={{fontSize:11,padding:"4px 9px",borderRadius:5,border:"0.5px solid #FFCDD2",background:"transparent",color:"#D32F2F",cursor:"pointer",flexShrink:0}}>✕</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Teacher Directory ────────────────────────────────────────────────────────
// Rough default template for a senior language-school teacher's bio — admin
// can use this as a starting point and edit freely per teacher.
const DEFAULT_TEACHER_BIO = {
  zh: "資深語言教學老師，擁有多年一對一及小班教學經驗。教學風格活潑生動，注重口語表達與實際應用，善於根據學生的程度與學習目標調整課程節奏。課堂上重視互動與鼓勵，致力於幫助學生建立學習自信心，並培養長期、穩定的學習動力與習慣。",
  en: "A senior language teacher with years of one-on-one and small-group teaching experience. Teaching style is engaging and practical, focused on spoken fluency and real-world application, with lessons paced to each student's level and goals. Classes emphasize interaction and encouragement, helping students build confidence and develop steady, lasting learning habits.",
};

// ─── Teacher Profile Card (reusable — shown to students AND admin preview) ───
function TeacherProfileCard({ entry, lang }) {
  const t = T[lang];
  const name = entry?.nameEn || "—";
  const years = entry?.yearsExp;
  const bio = entry?.bio && entry.bio.trim() ? entry.bio.trim() : "";

  return (
    <div style={{background:"#FFFFFF",border:"0.5px solid #E0E0E0",borderRadius:14,padding:"1.25rem",boxShadow:"0 2px 10px rgba(23,47,57,0.05)"}}>
      <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:14}}>
        <div style={{width:52,height:52,borderRadius:"50%",background:"linear-gradient(135deg,#1A6B8A,#7B1FA2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:700,color:"#fff",flexShrink:0}}>
          {name.slice(0,2).toUpperCase()}
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:16,fontWeight:700,color:"#172F39"}}>{name}</div>
          {years && (
            <div style={{fontSize:12,color:"#1A6B8A",marginTop:2,fontWeight:500}}>
              🎓 {years} {t.teacherYearsUnit}
            </div>
          )}
        </div>
      </div>
      <div style={{fontSize:11,fontWeight:600,color:"#9E9E9E",letterSpacing:"0.04em",marginBottom:6,textTransform:"uppercase"}}>{t.teacherBio}</div>
      <div style={{fontSize:13,color:"#172F39",lineHeight:1.8,whiteSpace:"pre-wrap"}}>
        {bio || <span style={{color:"#CFD8DC",fontStyle:"italic"}}>{t.noBioYet}</span>}
      </div>
    </div>
  );
}

function TeacherDirectory({ users, setUsers, lang, setToast, hideSalary, readOnly }) {
  const t = T[lang];
  const teachers = users.filter(u=>u.role==="teacher");

  const [dirEntries, setDirEntries] = useState([]);
  const [dirLoaded, setDirLoaded] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [parsed, setParsed] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [showPaste, setShowPaste] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({nameEn:"",yearsExp:"",joinYear:String(new Date().getFullYear()),bio:"",linkedUserId:""});
  const [previewTarget, setPreviewTarget] = useState(null);
  const [confirmDelDirId, setConfirmDelDirId] = useState(null);
  const [salaryTarget, setSalaryTarget] = useState(null); // teacher entry being managed for salary

  useEffect(()=>{
    (async()=>{
      try{ const r=await window.storage.get("cp3_teacher_dir"); if(r?.value) setDirEntries(JSON.parse(r.value)); }catch{}
      setDirLoaded(true);
    })();
  },[]);
  const saveDirEntries = async (next) => {
    setDirEntries(next);
    try{ await window.storage.set("cp3_teacher_dir",JSON.stringify(next)); }catch{}
  };

  const parseExcel = () => {
    const rows = pasteText.trim().split(/\r?\n/).map(row=>row.split(/\t/).map(c=>c.trim()));
    const result = rows
      .filter(r=>r.length>=1&&r[0])
      .map(r=>({ nameEn:r[0]||"", yearsExp:r[1]||"", joinYear:r[2]||String(new Date().getFullYear()) }))
      .filter(r=>r.nameEn.toLowerCase()!=="teacher name"); // drop header row if pasted
    setParsed(result);
    setSelected(new Set(result.map((_,i)=>i)));
  };

  const genPassword = () => Math.random().toString(36).slice(2,8).toUpperCase();
  const isLinked = (nameEn) => {
    const lower = nameEn.toLowerCase().replace(/\s/g,"");
    return users.find(u=>u.role==="teacher"&&(u.name.toLowerCase().replace(/\s/g,"")===lower||u.username.toLowerCase()===lower));
  };

  const createAccounts = async () => {
    let created = 0;
    const newUsers = [...users];
    const newDir = [...dirEntries];
    for (let i = 0; i < parsed.length; i++) {
      const row = parsed[i];
      if (!selected.has(i)) continue;
      if (isLinked(row.nameEn)) continue;
      const pwd = genPassword();
      const { hash, salt } = await hashPassword(pwd);
      const username = row.nameEn.toLowerCase().replace(/\s+/g,".");
      const newUser = { id:genId(), username, passwordHash:hash, passwordSalt:salt, name:row.nameEn, role:"teacher", _defaultPwd:pwd };
      newUsers.push(newUser);
      const existingDirIdx = newDir.findIndex(d=>d.nameEn===row.nameEn);
      const entry = { id:genId(), ...row, linkedUserId:newUser.id };
      if (existingDirIdx>=0) newDir[existingDirIdx]=entry; else newDir.push(entry);
      created++;
    }
    setUsers(newUsers);
    saveDirEntries(newDir);
    setParsed([]); setPasteText(""); setShowPaste(false);
    setToast(t.importDone.replace("{n}",created));
  };

  const toggleSel = (i) => setSelected(s=>{const n=new Set(s);n.has(i)?n.delete(i):n.add(i);return n;});

  const startEdit = (d) => { setEditingId(d.id||d.linkedUserId); setEditForm({...d}); setShowAddForm(false); };
  const saveEdit = () => {
    const next = dirEntries.map(d => (d.id===editingId||d.linkedUserId===editingId) ? {...d,...editForm} : d);
    if (!next.some(d=>d.id===editingId||d.linkedUserId===editingId)) next.push({id:genId(),...editForm});
    saveDirEntries(next);
    setEditingId(null); setEditForm({});
    setToast(lang==="zh"?"已儲存":"Saved");
  };
  const cancelEdit = () => { setEditingId(null); setEditForm({}); };

  const saveAdd = () => {
    if (!addForm.nameEn.trim()) return;
    saveDirEntries([...dirEntries, {id:genId(), ...addForm}]);
    setAddForm({nameEn:"",yearsExp:"",joinYear:String(new Date().getFullYear()),bio:"",linkedUserId:""});
    setShowAddForm(false);
    setToast(lang==="zh"?"老師資料已新增":"Teacher added");
  };

  const doDelDir = () => {
    saveDirEntries(dirEntries.filter(d=>d.id!==confirmDelDirId&&d.linkedUserId!==confirmDelDirId));
    setConfirmDelDirId(null);
    setToast(lang==="zh"?"已刪除":"Deleted");
  };

  const allTeachers = [
    ...dirEntries.map(d=>({...d,_fromDir:true})),
    ...teachers.filter(u=>!dirEntries.some(d=>d.linkedUserId===u.id)).map(u=>({
      id:u.id, nameEn:u.name, yearsExp:"", joinYear:"", linkedUserId:u.id, _fromDir:false,
    })),
  ];

  const iStyle={width:"100%",boxSizing:"border-box",padding:"7px 9px",borderRadius:6,border:"0.5px solid #CFD8DC",background:"#FFFFFF",color:"#172F39",fontSize:12};
  const thStyle={fontSize:11,fontWeight:600,color:"#546E7A",padding:"8px 10px",textAlign:"left",borderBottom:"1px solid #E0E0E0",whiteSpace:"nowrap",background:"#F5F5F5"};
  const tdStyle={fontSize:12,color:"#172F39",padding:"8px 10px",borderBottom:"0.5px solid #F0F0F0",verticalAlign:"middle"};
  const lStyle={fontSize:11,color:"#546E7A",display:"block",marginBottom:3,marginTop:8};

  const cols = [t.dirTeacherName, lang==="zh"?"聯絡資訊":"Contact Info", t.dirYearsExp, t.dirRegYear, t.salary, t.dirStatus, ""];

  // Same protection as StudentDirectory — block interaction until the real
  // teacher directory has loaded, so an add/edit/delete/batch-import can't
  // fire against an still-empty local copy and wipe existing records.
  if (!dirLoaded) {
    return (
      <div style={{padding:"2rem",textAlign:"center",color:"#9E9E9E"}}>
        <div style={{fontSize:28,marginBottom:8}}>⏳</div>
        <div style={{fontSize:13}}>{lang==="zh"?"載入中…":"Loading…"}</div>
      </div>
    );
  }

  return (
    <div>
      {confirmDelDirId && <ConfirmModal title={lang==="zh"?"刪除老師資料":"Delete Teacher"} message={lang==="zh"?"確認刪除此老師的資料？":"Delete this teacher record?"} confirmLabel={lang==="zh"?"確認刪除":"Delete"} onConfirm={doDelDir} onCancel={()=>setConfirmDelDirId(null)} danger/>}
      {salaryTarget && <SalaryModal teacherEntry={salaryTarget} users={users} lang={lang} setToast={setToast} onClose={()=>setSalaryTarget(null)}/>}

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1rem",flexWrap:"wrap",gap:8}}>
        <h3 style={{fontSize:16,fontWeight:500,color:"#172F39",margin:0}}>{t.teacherDir} ({allTeachers.length})</h3>
        {!readOnly && (
          <div style={{display:"flex",gap:7}}>
            <button onClick={()=>{setShowAddForm(!showAddForm);setEditingId(null);}} style={{background:showAddForm?"#546E7A":"#4CAF50",border:"none",borderRadius:7,color:"#fff",padding:"7px 14px",fontSize:12,cursor:"pointer"}}>
              ＋ {t.dirAddManualTeacher}
            </button>
            <button onClick={()=>setShowPaste(!showPaste)} style={{background:"#1A6B8A",border:"none",borderRadius:7,color:"#fff",padding:"7px 14px",fontSize:12,cursor:"pointer"}}>
              📋 {t.pasteFromExcel}
            </button>
          </div>
        )}
      </div>

      {/* Manual add form */}
      {!readOnly && showAddForm && (
        <div style={{background:"#F5F5F5",borderRadius:12,border:"0.5px solid #E0E0E0",padding:"1.25rem",marginBottom:"1.25rem"}}>
          <div style={{fontWeight:500,fontSize:14,color:"#172F39",marginBottom:12}}>{t.dirAddManualTeacher}</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:10}}>
            {[
              {k:"nameEn",   l:t.dirTeacherName, ph:"John Smith"},
              {k:"yearsExp", l:t.dirYearsExp,    ph:"5"},
              {k:"joinYear", l:t.dirRegYear,     ph:"2025"},
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
                {teachers.filter(u=>!dirEntries.some(d=>d.linkedUserId===u.id)).map(u=><option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:8}}>
            <label style={{...lStyle,marginTop:0}}>{t.teacherBio}</label>
            <button onClick={()=>setAddForm(f=>({...f,bio:DEFAULT_TEACHER_BIO[lang]||DEFAULT_TEACHER_BIO.en}))} style={{fontSize:11,padding:"3px 10px",borderRadius:5,border:"0.5px solid #1A6B8A",background:"transparent",color:"#1A6B8A",cursor:"pointer"}}>
              ✨ {t.useTemplate}
            </button>
          </div>
          <textarea value={addForm.bio||""} onChange={e=>setAddForm(f=>({...f,bio:e.target.value}))} rows={4} placeholder={t.teacherBioPlaceholder} style={{...iStyle,resize:"vertical",lineHeight:1.6,fontFamily:"inherit"}}/>
          <div style={{display:"flex",gap:8,marginTop:14}}>
            <button onClick={saveAdd} style={{padding:"8px 20px",borderRadius:7,background:"#4CAF50",border:"none",color:"#fff",fontSize:13,fontWeight:500,cursor:"pointer"}}>✓ {t.dirSave}</button>
            <button onClick={()=>setShowAddForm(false)} style={{padding:"8px 14px",borderRadius:7,background:"transparent",border:"0.5px solid #CFD8DC",color:"#546E7A",fontSize:13,cursor:"pointer"}}>{t.cancel}</button>
          </div>
        </div>
      )}

      {/* Paste panel */}
      {!readOnly && showPaste && (
        <div style={{background:"#F5F5F5",borderRadius:12,border:"0.5px solid #E0E0E0",padding:"1.25rem",marginBottom:"1.5rem"}}>
          <p style={{fontSize:12,color:"#546E7A",margin:"0 0 8px",lineHeight:1.6}}>{t.teacherPasteHint}</p>
          <div style={{fontSize:11,background:"#E3F2FD",color:"#1565C0",borderRadius:5,padding:"5px 10px",marginBottom:10,fontFamily:"monospace"}}>{t.teacherExcelCols}</div>
          <textarea value={pasteText} onChange={e=>setPasteText(e.target.value)} placeholder={lang==="zh"?"在此貼上從 Excel 複製的內容…":"Paste Excel content here…"} style={{...iStyle,height:110,resize:"vertical",fontFamily:"monospace",lineHeight:1.5}}/>
          <div style={{display:"flex",gap:8,marginTop:10}}>
            <button onClick={parseExcel} disabled={!pasteText.trim()} style={{padding:"7px 16px",borderRadius:7,background:pasteText.trim()?"#1A6B8A":"#E0E0E0",border:"none",color:pasteText.trim()?"#fff":"#9E9E9E",fontSize:12,cursor:pasteText.trim()?"pointer":"not-allowed"}}>🔍 {t.parseRows}</button>
            <button onClick={()=>{setPasteText("");setParsed([]);}} style={{padding:"7px 12px",borderRadius:7,background:"transparent",border:"0.5px solid #CFD8DC",color:"#546E7A",fontSize:12,cursor:"pointer"}}>{t.cancel}</button>
          </div>
          {parsed.length>0 && (
            <div style={{marginTop:"1.25rem"}}>
              <div style={{fontSize:13,fontWeight:500,color:"#172F39",marginBottom:8}}>{t.parsedPreview} — {parsed.length} {lang==="zh"?"筆":"rows"}</div>
              <div style={{overflowX:"auto",borderRadius:8,border:"0.5px solid #E0E0E0",marginBottom:12}}>
                <table style={{width:"100%",borderCollapse:"collapse",minWidth:420}}>
                  <thead style={{background:"#F5F5F5"}}>
                    <tr>
                      <th style={{...thStyle,width:36}}><input type="checkbox" checked={selected.size===parsed.length&&parsed.length>0} onChange={e=>{if(e.target.checked)setSelected(new Set(parsed.map((_,i)=>i)));else setSelected(new Set());}} style={{cursor:"pointer"}}/></th>
                      {[t.dirTeacherName,t.dirYearsExp,t.dirRegYear,t.dirStatus].map(h=><th key={h} style={thStyle}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {parsed.map((row,i)=>{
                      const exists=isLinked(row.nameEn);
                      return (
                        <tr key={i} style={{background:selected.has(i)?"rgba(26,107,138,0.04)":"transparent"}}>
                          <td style={{...tdStyle,width:36}}><input type="checkbox" checked={selected.has(i)} onChange={()=>toggleSel(i)} disabled={!!exists} style={{cursor:exists?"not-allowed":"pointer"}}/></td>
                          <td style={tdStyle}>{row.nameEn}</td>
                          <td style={tdStyle}>{row.yearsExp}</td>
                          <td style={tdStyle}>{row.joinYear}</td>
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

      {/* Table */}
      {allTeachers.length===0 ? (
        <p style={{color:"#9E9E9E",fontSize:13,textAlign:"center",padding:"2rem 0"}}>{lang==="zh"?"尚無老師資料":"No teacher data yet"}</p>
      ) : (
        <div style={{overflowX:"auto",borderRadius:10,border:"0.5px solid #E0E0E0"}}>
          <table style={{width:"100%",borderCollapse:"collapse",minWidth:620}}>
            <thead><tr>{cols.map((h,i)=><th key={i} style={thStyle}>{h}</th>)}</tr></thead>
            <tbody>
              {allTeachers.map((d,i)=>{
                const linkedUser = users.find(u=>u.id===d.linkedUserId);
                const entryId = d.id||d.linkedUserId;
                const isEditing = !readOnly && editingId===entryId;

                if (isEditing) {
                  const ef = editForm;
                  const inEd = (k,ph)=><input style={{...iStyle,minWidth:70}} value={ef[k]||""} onChange={e=>setEditForm(f=>({...f,[k]:e.target.value}))} placeholder={ph||""}/>;
                  return (
                    <>
                      <tr key={entryId} style={{background:"#EEF6FB"}}>
                        <td style={tdStyle}>{inEd("nameEn","John Smith")}</td>
                        <td style={tdStyle}>
                          <div style={{fontSize:11,color:"#546E7A",lineHeight:1.6}}>
                            <div>🎂 {d.birthDate || "—"}</div>
                            <div>✉️ {d.email || "—"}</div>
                            <div>📱 {d.phone || "—"}</div>
                          </div>
                        </td>
                        <td style={tdStyle}>{inEd("yearsExp","5")}</td>
                        <td style={tdStyle}>{inEd("joinYear","2025")}</td>
                        <td style={tdStyle}>—</td>
                        <td style={tdStyle} colSpan={2}>
                          <div style={{display:"flex",gap:5}}>
                            <button onClick={saveEdit} style={{padding:"5px 12px",borderRadius:5,background:"#1A6B8A",border:"none",color:"#fff",fontSize:11,cursor:"pointer"}}>✓ {t.dirSave}</button>
                            <button onClick={cancelEdit} style={{padding:"5px 10px",borderRadius:5,background:"transparent",border:"0.5px solid #CFD8DC",color:"#546E7A",fontSize:11,cursor:"pointer"}}>{t.cancel}</button>
                          </div>
                        </td>
                      </tr>
                      <tr key={entryId+"_bio"} style={{background:"#EEF6FB"}}>
                        <td colSpan={7} style={{...tdStyle,paddingTop:0}}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                            <label style={{fontSize:11,color:"#546E7A"}}>{t.teacherBio}</label>
                            <button onClick={()=>setEditForm(f=>({...f,bio:DEFAULT_TEACHER_BIO[lang]||DEFAULT_TEACHER_BIO.en}))} style={{fontSize:10,padding:"2px 8px",borderRadius:4,border:"0.5px solid #1A6B8A",background:"transparent",color:"#1A6B8A",cursor:"pointer"}}>
                              ✨ {t.useTemplate}
                            </button>
                          </div>
                          <textarea value={ef.bio||""} onChange={e=>setEditForm(f=>({...f,bio:e.target.value}))} rows={3} placeholder={t.teacherBioPlaceholder} style={{...iStyle,resize:"vertical",lineHeight:1.6,fontFamily:"inherit"}}/>
                        </td>
                      </tr>
                    </>
                  );
                }

                return (
                  <tr key={entryId} style={{background:i%2===0?"#FFFFFF":"#FAFAFA"}} onMouseEnter={e=>e.currentTarget.style.background="#EEF6FB"} onMouseLeave={e=>e.currentTarget.style.background=i%2===0?"#FFFFFF":"#FAFAFA"}>
                    <td style={tdStyle}>
                      <div style={{fontWeight:500}}>{d.nameEn||"—"}</div>
                      {linkedUser&&<div style={{fontSize:10,color:"#9E9E9E"}}>@{linkedUser.username}</div>}
                    </td>
                    <td style={tdStyle}>
                      <div style={{fontSize:11,color:"#546E7A",lineHeight:1.6}}>
                        <div>🎂 {d.birthDate || "—"}</div>
                        <div>✉️ {d.email || "—"}</div>
                        <div>📱 {d.phone || "—"}</div>
                      </div>
                    </td>
                    <td style={tdStyle}>{d.yearsExp?`${d.yearsExp} ${t.yearsUnit}`:"—"}</td>
                    <td style={tdStyle}>{d.joinYear||"—"}</td>
                    <td style={tdStyle}>
                      {!hideSalary && (
                        <button onClick={()=>setSalaryTarget({id:entryId,nameEn:d.nameEn,linkedUserId:d.linkedUserId})} style={{fontSize:11,padding:"4px 10px",borderRadius:5,border:"0.5px solid #2E7D32",background:"transparent",color:"#2E7D32",cursor:"pointer",fontWeight:500}}>
                          💰 {t.salaryManage}
                        </button>
                      )}
                    </td>
                    <td style={tdStyle}>
                      {linkedUser
                        ? <span style={{fontSize:11,background:"#E8F5E9",color:"#2E7D32",borderRadius:4,padding:"2px 7px"}}>✓ {t.dirHasAccount}</span>
                        : <span style={{fontSize:11,background:"#FFF3E0",color:"#E65100",borderRadius:4,padding:"2px 7px"}}>{t.dirNoAccount}</span>}
                    </td>
                    <td style={tdStyle}>
                      <div style={{display:"flex",gap:4}}>
                        <button onClick={()=>setPreviewTarget(d)} title={t.previewStudentView} style={{padding:"4px 9px",borderRadius:4,border:"0.5px solid #7B1FA2",background:"transparent",color:"#7B1FA2",fontSize:11,cursor:"pointer"}}>👁</button>
                        {!readOnly && <button onClick={()=>startEdit(d)} style={{padding:"4px 9px",borderRadius:4,border:"0.5px solid #CFD8DC",background:"transparent",color:"#1A6B8A",fontSize:11,cursor:"pointer"}}>{t.dirEdit}</button>}
                        {!readOnly && d._fromDir && <button onClick={()=>setConfirmDelDirId(entryId)} style={{padding:"4px 9px",borderRadius:4,border:"0.5px solid #FFCDD2",background:"transparent",color:"#D32F2F",fontSize:11,cursor:"pointer"}}>✕</button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Admin preview: exactly what a student sees on the Teacher Introduction tab */}
      {previewTarget && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9300,padding:"1rem"}} onClick={()=>setPreviewTarget(null)}>
          <div style={{background:"#F5F5F5",borderRadius:16,width:"100%",maxWidth:420,boxSizing:"border-box",boxShadow:"0 8px 36px rgba(23,47,57,0.2)",overflow:"hidden"}} onClick={e=>e.stopPropagation()}>
            <div style={{background:"#172F39",padding:"13px 18px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:14,fontWeight:600,color:"#fff"}}>👁 {t.teacherPreviewTitle}</span>
              <button onClick={()=>setPreviewTarget(null)} style={{background:"rgba(255,255,255,0.15)",border:"none",borderRadius:"50%",width:28,height:28,cursor:"pointer",color:"#fff",fontSize:16}}>×</button>
            </div>
            <div style={{padding:"18px"}}>
              <TeacherProfileCard entry={previewTarget} lang={lang}/>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── People Directory (wraps Student + Teacher directories) ──────────────────
// ─── Change Notifications (admin review queue for student self-submitted edits) ──
function ChangeNotifications({ users, setUsers, lang, setToast, profileChanges, setProfileChanges }) {
  const t = T[lang];
  const [filter, setFilter] = useState("pending"); // pending | all
  const [dirEntries, setDirEntries] = useState([]);
  const [teacherDirEntries, setTeacherDirEntries] = useState([]);
  const [dirLoaded, setDirLoaded] = useState(false);

  useEffect(()=>{
    (async()=>{
      try{ const r=await window.storage.get("cp3_student_dir"); if(r?.value) setDirEntries(JSON.parse(r.value)); }catch{}
      try{ const r2=await window.storage.get("cp3_teacher_dir"); if(r2?.value) setTeacherDirEntries(JSON.parse(r2.value)); }catch{}
      setDirLoaded(true);
    })();
  },[]);
  const saveDirEntries = async (next) => {
    setDirEntries(next);
    try{ await window.storage.set("cp3_student_dir",JSON.stringify(next)); }catch{}
  };
  const saveTeacherDirEntries = async (next) => {
    setTeacherDirEntries(next);
    try{ await window.storage.set("cp3_teacher_dir",JSON.stringify(next)); }catch{}
  };

  const getStudent = id => users.find(u=>u.id===id);

  const list = (profileChanges||[])
    .filter(c => filter==="all" || c.status==="pending")
    .sort((a,b)=>b.requestedAt.localeCompare(a.requestedAt));

  const FIELD_LABEL = {
    nameEn: t.settingsNameEn, nameCn: t.settingsNameCn, birthDate: t.settingsBirthDate, avatar: t.settingsAvatar,
    email: t.settingsEmail, phone: t.settingsPhone,
  };

  const STATUS_META = {
    pending:      {label:t.changeNotifStatusPending,     color:"#E65100", bg:"#FFF3E0"},
    merged:       {label:t.changeNotifStatusMerged,      color:"#2E7D32", bg:"#E8F5E9"},
    dismissed:    {label:t.changeNotifStatusDismissed,   color:"#9E9E9E", bg:"#F5F5F5"},
    auto_applied: {label:t.changeNotifStatusAutoApplied, color:"#1A6B8A", bg:"#E3F2FD"},
  };

  const merge = (change) => {
    // Students and teachers each have their own directory — pick whichever
    // one this change belongs to (defaults to "student" for older records
    // saved before teachers had their own Settings panel).
    const isTeacherChange = change.role === "teacher";
    const entries = isTeacherChange ? teacherDirEntries : dirEntries;
    const saveEntries = isTeacherChange ? saveTeacherDirEntries : saveDirEntries;

    // English name → users array (referenced everywhere: courses, schedule,
    // teacher's roster, etc.) AND the directory's nameEn field.
    // Chinese name (students only) → only the directory's nameCn field.
    const dirPatch = {};
    if (change.changes.nameEn) {
      setUsers(prev => prev.map(u => u.id===change.studentId ? {...u, name:change.changes.nameEn} : u));
      dirPatch.nameEn = change.changes.nameEn;
    }
    if (change.changes.nameCn !== undefined) {
      dirPatch.nameCn = change.changes.nameCn;
    }
    if (Object.keys(dirPatch).length > 0) {
      const existingIdx = entries.findIndex(d=>d.linkedUserId===change.studentId);
      const person = getStudent(change.studentId);
      const next = existingIdx >= 0
        ? entries.map((d,i)=> i===existingIdx ? {...d, ...dirPatch} : d)
        : [...entries, {id:genId(), nameEn:person?.name||"", linkedUserId:change.studentId, ...dirPatch}];
      saveEntries(next);
    }
    setProfileChanges(prev => prev.map(c => c.id===change.id ? {...c, status:"merged", mergedAt:new Date().toISOString(), mergedBy:"admin"} : c));
    setToast(t.changeNotifMerged);
  };

  const dismiss = (change) => {
    setProfileChanges(prev => prev.map(c => c.id===change.id ? {...c, status:"dismissed", mergedAt:new Date().toISOString(), mergedBy:"admin"} : c));
    setToast(t.changeNotifDismissed);
  };

  return (
    <div>
      <h3 style={{fontSize:16,fontWeight:600,color:"#172F39",margin:"0 0 4px"}}>{t.changeNotifTitle}</h3>
      <p style={{fontSize:12,color:"#9E9E9E",margin:"0 0 14px"}}>{t.changeNotifDesc}</p>

      <div style={{display:"flex",gap:5,marginBottom:16}}>
        {[["pending",lang==="zh"?"待審核":"Pending"],["all",lang==="zh"?"全部":"All"]].map(([k,l])=>(
          <button key={k} onClick={()=>setFilter(k)} style={{padding:"5px 14px",borderRadius:6,fontSize:12,cursor:"pointer",border:filter===k?"none":"0.5px solid #CFD8DC",background:filter===k?"#1A6B8A":"transparent",color:filter===k?"#fff":"#546E7A"}}>
            {l}
          </button>
        ))}
      </div>

      {list.length===0 && (
        <div style={{textAlign:"center",padding:"2.5rem 0",color:"#9E9E9E"}}>
          <div style={{fontSize:28,marginBottom:8}}>✅</div>
          <div style={{fontSize:13}}>{t.changeNotifNone}</div>
        </div>
      )}

      {list.map(c => {
        const student = getStudent(c.studentId);
        const meta = STATUS_META[c.status];
        return (
          <div key={c.id} style={{background:"#FFFFFF",border:`1px solid ${meta.color}33`,borderRadius:10,padding:"14px 16px",marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10,marginBottom:10,flexWrap:"wrap"}}>
              <div>
                <div style={{fontWeight:600,fontSize:13,color:"#172F39",display:"flex",alignItems:"center",gap:6}}>
                  {t.changeNotifFrom} {student?.name||"—"}
                  <span style={{fontSize:10,background:c.role==="teacher"?"#EDE7F6":"#E3F2FD",color:c.role==="teacher"?"#7B1FA2":"#1565C0",borderRadius:3,padding:"1px 6px",fontWeight:500}}>
                    {c.role==="teacher"?(lang==="zh"?"老師":"Teacher"):(lang==="zh"?"學生":"Student")}
                  </span>
                </div>
                <div style={{fontSize:11,color:"#9E9E9E",marginTop:2}}>{t.changeNotifAt}: {c.requestedAt.slice(0,16).replace("T"," ")}</div>
              </div>
              <span style={{fontSize:11,background:meta.bg,color:meta.color,borderRadius:5,padding:"3px 10px",fontWeight:600,flexShrink:0}}>● {meta.label}</span>
            </div>

            <div style={{background:"#F5F5F5",borderRadius:8,overflow:"hidden",marginBottom:c.status==="pending"?12:0}}>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead>
                  <tr style={{background:"#EEEEEE"}}>
                    <th style={{fontSize:10,fontWeight:600,color:"#546E7A",padding:"6px 10px",textAlign:"left"}}>{t.changeNotifField}</th>
                    <th style={{fontSize:10,fontWeight:600,color:"#546E7A",padding:"6px 10px",textAlign:"left"}}>{t.changeNotifOld}</th>
                    <th style={{fontSize:10,fontWeight:600,color:"#546E7A",padding:"6px 10px",textAlign:"left"}}>{t.changeNotifNew}</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(c.changes).map(field=>{
                    const isAvatar = field==="avatar";
                    const oldVal = c.previousValues[field];
                    const newVal = c.changes[field];
                    return (
                      <tr key={field} style={{borderTop:"0.5px solid #E0E0E0"}}>
                        <td style={{fontSize:12,color:"#172F39",padding:"6px 10px",fontWeight:500}}>{FIELD_LABEL[field]||field}</td>
                        <td style={{fontSize:12,color:"#9E9E9E",padding:"6px 10px"}}>
                          {isAvatar ? (getAvatarById(oldVal)?.icon || "—") : (oldVal || "—")}
                        </td>
                        <td style={{fontSize:12,color:"#2E7D32",padding:"6px 10px",fontWeight:500}}>
                          {isAvatar ? (getAvatarById(newVal)?.icon || "—") : (newVal || "—")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {c.status==="pending" && (
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>merge(c)} disabled={!dirLoaded} title={!dirLoaded?(lang==="zh"?"資料載入中，請稍候":"Data still loading, please wait"):undefined} style={{flex:1,background:dirLoaded?"#2E7D32":"#BDBDBD",border:"none",borderRadius:7,color:"#fff",padding:"8px",fontSize:13,fontWeight:600,cursor:dirLoaded?"pointer":"not-allowed"}}>
                  {dirLoaded?`✓ ${t.changeNotifMerge}`:(lang==="zh"?"載入中…":"Loading…")}
                </button>
                <button onClick={()=>dismiss(c)} style={{flex:1,background:"transparent",border:"1px solid #9E9E9E",borderRadius:7,color:"#546E7A",padding:"8px",fontSize:13,fontWeight:600,cursor:"pointer"}}>
                  ✕ {t.changeNotifDismiss}
                </button>
              </div>
            )}
            {c.status==="auto_applied" && (
              <div style={{fontSize:11,color:"#1A6B8A"}}>ℹ️ {t.changeNotifAutoAppliedNote}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function PeopleDirectory({ users, setUsers, lang, setToast, enrollments, attendance, courses, profileChanges, setProfileChanges, hideSalary, readOnly }) {
  const t = T[lang];
  const [subTab, setSubTab] = useState("students"); // students | teachers | changes
  const pendingChangeCount = (profileChanges||[]).filter(c=>c.status==="pending").length;
  // "通知變更" is specifically an approval/merge action on student & teacher
  // data — that stays admin-only, same reasoning as hiding feedback review.
  const tabs = readOnly
    ? [["students",t.peopleDirStudents],["teachers",t.peopleDirTeachers]]
    : [["students",t.peopleDirStudents],["teachers",t.peopleDirTeachers],["changes",t.peopleDirChanges]];
  return (
    <div>
      <h3 style={{fontSize:16,fontWeight:600,color:"#172F39",margin:"0 0 12px"}}>{t.peopleDir}</h3>
      {readOnly && (
        <div style={{fontSize:11,color:"#546E7A",background:"#F5F5F5",borderRadius:6,padding:"6px 11px",marginBottom:12,display:"inline-block"}}>
          👁 {lang==="zh"?"僅供檢視，無法編輯師生資料":"View only — you can't edit student or teacher records"}
        </div>
      )}
      <div style={{display:"flex",gap:5,marginBottom:18,flexWrap:"wrap"}}>
        {tabs.map(([k,l])=>(
          <button key={k} onClick={()=>setSubTab(k)} style={{position:"relative",padding:"7px 16px",borderRadius:7,fontSize:13,cursor:"pointer",border:subTab===k?"none":"0.5px solid #CFD8DC",background:subTab===k?"#1A6B8A":"transparent",color:subTab===k?"#fff":"#546E7A",fontWeight:subTab===k?600:400}}>
            {l}
            {k==="changes" && pendingChangeCount>0 && <span style={{position:"absolute",top:-6,right:-6,background:"#D32F2F",color:"#fff",borderRadius:"50%",width:18,height:18,fontSize:10,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>{pendingChangeCount}</span>}
          </button>
        ))}
      </div>
      {subTab==="students" && <StudentDirectory users={users} setUsers={setUsers} lang={lang} setToast={setToast} enrollments={enrollments} attendance={attendance} courses={courses} readOnly={readOnly}/>}
      {subTab==="teachers" && <TeacherDirectory users={users} setUsers={setUsers} lang={lang} setToast={setToast} hideSalary={hideSalary} readOnly={readOnly}/>}
      {!readOnly && subTab==="changes" && <ChangeNotifications users={users} setUsers={setUsers} lang={lang} setToast={setToast} profileChanges={profileChanges} setProfileChanges={setProfileChanges}/>}
    </div>
  );
}

// ─── Admin panel ──────────────────────────────────────────────────────────────
// ─── Trial application review + option-list editor ────────────────────────────
// ─── Review student-submitted materials (admin AND assistant) ────────────────
function StudentMaterialReviewPanel({ users, courses, enrollments, materials, setMaterials, studentMatSubs, setStudentMatSubs, currentUser, lang, setToast }) {
  const [subTab, setSubTab] = useState("pending"); // pending | history
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const getCourse = id => courses.find(c=>c.id===id);
  const getUser = id => users.find(u=>u.id===id);

  const pending = (studentMatSubs||[]).filter(s=>s.status==="pending").sort((a,b)=>a.date.localeCompare(b.date));
  const history = (studentMatSubs||[]).filter(s=>s.status!=="pending").sort((a,b)=>(b.reviewedAt||"").localeCompare(a.reviewedAt||""));

  const markReviewed = (sub, patch) => {
    setStudentMatSubs(prev => prev.map(x=>x.id===sub.id?{...x, ...patch, reviewedAt:new Date().toISOString(), reviewedBy:currentUser?.id||""}:x));
  };
  const approveCoexist = (sub) => {
    setMaterials(prev => [...(prev||[]), {
      id: genId(), courseId: sub.courseId, date: sub.date, dayIndex: sub.dayIndex,
      title: sub.title, url: sub.url, desc:"",
      addedBy: sub.studentId, addedAt: new Date().toISOString(), source:"student",
    }]);
    markReviewed(sub, {status:"approved"});
    setToast(lang==="zh"?"已核准並新增為教材":"Approved and added as material");
  };
  const approveReplace = (sub) => {
    setMaterials(prev => [
      ...(prev||[]).filter(m=>!(m.courseId===sub.courseId && m.date===sub.date)),
      { id: genId(), courseId: sub.courseId, date: sub.date, dayIndex: sub.dayIndex, title: sub.title, url: sub.url, desc:"", addedBy: sub.studentId, addedAt: new Date().toISOString(), source:"student" }
    ]);
    markReviewed(sub, {status:"approved"});
    setToast(lang==="zh"?"已核准並取代原教材":"Approved and replaced the existing material");
  };
  const doReject = () => {
    if (!rejectTarget) return;
    markReviewed(rejectTarget, {status:"rejected", reviewNote:rejectReason.trim()});
    setRejectTarget(null); setRejectReason("");
    setToast(lang==="zh"?"已退回":"Rejected");
  };

  const renderCard = (sub) => {
    const course = getCourse(sub.courseId);
    const student = getUser(sub.studentId);
    const existingMats = (materials||[]).filter(m=>m.courseId===sub.courseId && m.date===sub.date);
    return (
      <div key={sub.id} style={{background:"#FFFFFF",border:"0.5px solid #E0E0E0",borderRadius:10,padding:"12px 14px",marginBottom:10}}>
        <div style={{fontSize:12,fontWeight:600,color:"#172F39"}}>{course?.subject||"—"}</div>
        <div style={{fontSize:11,color:"#9E9E9E",marginTop:2,marginBottom:6}}>{sub.date} ({T[lang].days[sub.dayIndex]}) · {lang==="zh"?"學生":"Student"}: {student?.name||"—"}</div>
        <div style={{background:"#F5F5F5",borderRadius:7,padding:"9px 11px",marginBottom:8}}>
          <div style={{fontSize:12,color:"#172F39",fontWeight:500}}>{sub.title}</div>
          <a href={sub.url} target="_blank" rel="noreferrer" style={{fontSize:11,color:"#1A6B8A",wordBreak:"break-all"}}>{sub.url}</a>
        </div>
        {existingMats.length>0 && sub.status==="pending" && (
          <div style={{background:"#FFF3E0",borderRadius:6,padding:"7px 10px",marginBottom:8,fontSize:11,color:"#E65100"}}>
            ⚠️ {lang==="zh"?`這堂課已經有 ${existingMats.length} 筆教材（${existingMats.map(m=>m.title).join("、")}），請選擇新增或取代`:`This class already has ${existingMats.length} material(s) (${existingMats.map(m=>m.title).join(", ")}) — choose to add or replace`}
          </div>
        )}
        {sub.status==="pending" ? (
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            <button onClick={()=>approveCoexist(sub)} style={{fontSize:12,padding:"6px 12px",borderRadius:6,background:"#2E7D32",border:"none",color:"#fff",cursor:"pointer",fontWeight:500}}>
              ✓ {lang==="zh"?"核准（新增）":"Approve (Add)"}
            </button>
            {existingMats.length>0 && (
              <button onClick={()=>approveReplace(sub)} style={{fontSize:12,padding:"6px 12px",borderRadius:6,background:"#1A6B8A",border:"none",color:"#fff",cursor:"pointer",fontWeight:500}}>
                ✓ {lang==="zh"?"核准（取代）":"Approve (Replace)"}
              </button>
            )}
            <button onClick={()=>{setRejectTarget(sub);setRejectReason("");}} style={{fontSize:12,padding:"6px 12px",borderRadius:6,background:"transparent",border:"0.5px solid #D32F2F",color:"#D32F2F",cursor:"pointer"}}>
              ✕ {lang==="zh"?"退回":"Reject"}
            </button>
          </div>
        ) : (
          <div style={{fontSize:11,color:sub.status==="approved"?"#2E7D32":"#D32F2F"}}>
            {sub.status==="approved" ? `✓ ${lang==="zh"?"已核准":"Approved"}` : `✕ ${lang==="zh"?"已退回":"Rejected"}${sub.reviewNote?`：${sub.reviewNote}`:""}`}
            <span style={{color:"#9E9E9E",marginLeft:6}}>{sub.reviewedAt?.slice(0,10)}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <h3 style={{fontSize:15,fontWeight:600,color:"#172F39",margin:"0 0 12px"}}>{lang==="zh"?"學生教材投稿":"Student Material Submissions"}</h3>
      <div style={{display:"flex",gap:5,marginBottom:14}}>
        {[["pending",lang==="zh"?"待審核":"Pending",pending.length],["history",lang==="zh"?"已處理":"History",0]].map(([k,l,badge])=>(
          <button key={k} onClick={()=>setSubTab(k)} style={{position:"relative",padding:"7px 16px",borderRadius:7,fontSize:13,cursor:"pointer",border:subTab===k?"none":"0.5px solid #CFD8DC",background:subTab===k?"#1A6B8A":"transparent",color:subTab===k?"#fff":"#546E7A",fontWeight:subTab===k?600:400}}>
            {l}
            {badge>0 && <span style={{marginLeft:6,fontSize:10,background:"#D32F2F",color:"#fff",borderRadius:9,padding:"1px 6px",fontWeight:700}}>{badge}</span>}
          </button>
        ))}
      </div>
      {subTab==="pending" && (pending.length===0
        ? <div style={{textAlign:"center",padding:"2.5rem 0",color:"#9E9E9E"}}><div style={{fontSize:28,marginBottom:8}}>🎉</div><div style={{fontSize:13}}>{lang==="zh"?"目前沒有待審核的投稿":"No pending submissions"}</div></div>
        : pending.map(renderCard))}
      {subTab==="history" && (history.length===0
        ? <p style={{color:"#9E9E9E",fontSize:13,textAlign:"center",padding:"2rem 0"}}>—</p>
        : history.map(renderCard))}

      {rejectTarget && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999,padding:"1rem"}}>
          <div style={{background:"#FFFFFF",borderRadius:12,width:"100%",maxWidth:400,padding:"18px",boxSizing:"border-box"}}>
            <div style={{fontSize:14,fontWeight:600,color:"#172F39",marginBottom:10}}>{lang==="zh"?"退回並附理由":"Reject with a reason"}</div>
            <textarea value={rejectReason} onChange={e=>setRejectReason(e.target.value)} rows={3} placeholder={lang==="zh"?"讓學生知道為什麼被退回…":"Let the student know why…"} style={{width:"100%",boxSizing:"border-box",padding:"8px 10px",borderRadius:7,border:"0.5px solid #CFD8DC",fontSize:13,fontFamily:"inherit",resize:"vertical",marginBottom:14}}/>
            <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
              <button onClick={()=>setRejectTarget(null)} style={{padding:"7px 16px",borderRadius:7,border:"0.5px solid #CFD8DC",background:"#F5F5F5",color:"#546E7A",fontSize:13,cursor:"pointer"}}>{lang==="zh"?"取消":"Cancel"}</button>
              <button onClick={doReject} style={{padding:"7px 16px",borderRadius:7,border:"none",background:"#D32F2F",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer"}}>{lang==="zh"?"確認退回":"Confirm Reject"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TrialApplicationsPanel({ users, setUsers, lang, setToast, trialApplications, setTrialApplications, englishLevels, setEnglishLevels, learningPurposes, setLearningPurposes, hideOptions }) {
  const t = T[lang];
  const [subTab, setSubTab] = useState("pending"); // pending | history | options
  const [dirEntries, setDirEntries] = useState([]);
  const [dirLoaded, setDirLoaded] = useState(false);
  const [justCreated, setJustCreated] = useState(null); // {username, pwd, name} — shown once after approval
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectNote, setRejectNote] = useState("");
  const [editTarget, setEditTarget] = useState(null); // application being corrected before review
  const [editForm, setEditForm] = useState(null);

  useEffect(()=>{
    (async()=>{
      try{ const r=await window.storage.get("cp3_student_dir"); if(r?.value) setDirEntries(JSON.parse(r.value)); }catch{}
      setDirLoaded(true);
    })();
  },[]);
  const saveDirEntries = async (next) => {
    setDirEntries(next);
    try{ await window.storage.set("cp3_student_dir",JSON.stringify(next)); }catch{}
  };

  const genPassword = () => Math.random().toString(36).slice(2,8).toUpperCase();
  const iStyle = {width:"100%",boxSizing:"border-box",padding:"8px 10px",borderRadius:6,border:"0.5px solid #CFD8DC",background:"#FFFFFF",color:"#172F39",fontSize:13};
  const lStyle = {fontSize:11,color:"#546E7A",display:"block",marginBottom:4,marginTop:8};

  // Critical: approving an application writes [...dirEntries, newEntry] to the
  // WHOLE student directory. If that write happens before the initial fetch
  // above has finished, dirEntries is still its empty initial [] — and the
  // save would silently overwrite/destroy every other student's directory
  // record. Block interaction entirely until the real data has loaded.
  if (!dirLoaded) {
    return (
      <div style={{padding:"2rem",textAlign:"center",color:"#9E9E9E"}}>
        <div style={{fontSize:28,marginBottom:8}}>⏳</div>
        <div style={{fontSize:13}}>{lang==="zh"?"載入中…":"Loading…"}</div>
      </div>
    );
  }

  const pending = trialApplications.filter(a=>a.status==="pending").sort((a,b)=>a.submittedAt.localeCompare(b.submittedAt));
  const history = trialApplications.filter(a=>a.status!=="pending").sort((a,b)=>b.submittedAt.localeCompare(a.submittedAt));

  const levelLabel = (id) => { const l=englishLevels.find(x=>x.id===id); return l ? (lang==="zh"?l.zh:l.en) : "—"; };
  const purposeLabel = (id) => { const p=learningPurposes.find(x=>x.id===id); return p ? (lang==="zh"?p.zh:p.en) : "—"; };
  const PREFERRED_SLOTS = [
    {id:"weekday_day",   zh:"平日白天", en:"Weekday Daytime"},
    {id:"weekday_night", zh:"平日晚間", en:"Weekday Evening"},
    {id:"weekend_day",   zh:"假日白天", en:"Weekend Daytime"},
    {id:"weekend_night", zh:"假日晚間", en:"Weekend Evening"},
  ];
  const slotLabel = (id) => { const s=PREFERRED_SLOTS.find(x=>x.id===id); return s ? (lang==="zh"?s.zh:s.en) : "—"; };

  const approve = async (app) => {
    const baseUsername = app.nameEn.toLowerCase().replace(/[^a-z0-9]+/g,".").replace(/^\.+|\.+$/g,"") || "student";
    let username = baseUsername, n = 1;
    while (users.some(u=>u.username===username)) { username = `${baseUsername}${n}`; n++; }
    const pwd = genPassword();
    const { hash, salt } = await hashPassword(pwd);
    const newUserId = genId();
    const newUser = { id:newUserId, username, passwordHash:hash, passwordSalt:salt, name:app.nameEn, role:"student", _defaultPwd:pwd };
    setUsers(prev => [...prev, newUser]);
    const dirEntry = { id:genId(), nameEn:app.nameEn, nameCn:app.nameCn, birthDate:app.birthDate, phone:app.phone||"", email:app.email||"", linkedUserId:newUserId };
    saveDirEntries([...dirEntries, dirEntry]);
    setTrialApplications(prev => prev.map(a => a.id===app.id ? {...a, status:"approved", reviewedAt:new Date().toISOString(), createdUserId:newUserId} : a));
    setJustCreated({ username, pwd, name:app.nameEn });
    setToast(lang==="zh"?"已核准並建立帳號":"Approved and account created");
  };

  const doReject = () => {
    setTrialApplications(prev => prev.map(a => a.id===rejectTarget.id ? {...a, status:"rejected", reviewedAt:new Date().toISOString(), reviewNote:rejectNote} : a));
    setRejectTarget(null); setRejectNote("");
    setToast(lang==="zh"?"已標記為婉拒":"Marked as declined");
  };

  // Admin can correct whatever the applicant typed (typo in name, wrong DOB,
  // etc.) before approving — this edits the application record itself, not
  // any already-created account, so it's only offered while still pending.
  const openEdit = (app) => { setEditTarget(app); setEditForm({...app}); };
  const saveEdit = () => {
    if (!editForm.nameCn?.trim() || !editForm.nameEn?.trim() || !editForm.birthDate) {
      setToast(lang==="zh"?"中文姓名、英文姓名、出生年月日為必填":"Chinese name, English name, and date of birth are required");
      return;
    }
    setTrialApplications(prev => prev.map(a => a.id===editTarget.id ? {...editForm} : a));
    setEditTarget(null); setEditForm(null);
    setToast(lang==="zh"?"已更新申請資料":"Application updated");
  };

  const addOption = (list, setList) => setList(prev => [...prev, {id:genId(), zh:"", en:""}]);
  const updateOption = (list, setList, id, field, val) => setList(prev => prev.map(o=>o.id===id?{...o,[field]:val}:o));
  const removeOption = (list, setList, id) => setList(prev => prev.filter(o=>o.id!==id));

  return (
    <div>
      {justCreated && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9300,padding:"1rem"}}>
          <div style={{background:"#FFFFFF",borderRadius:16,width:"100%",maxWidth:360,boxSizing:"border-box",boxShadow:"0 8px 36px rgba(23,47,57,0.2)",padding:"22px"}}>
            <div style={{fontSize:32,textAlign:"center",marginBottom:8}}>✅</div>
            <div style={{fontSize:14,fontWeight:600,color:"#172F39",textAlign:"center",marginBottom:4}}>{lang==="zh"?"帳號已建立":"Account Created"}</div>
            <div style={{fontSize:12,color:"#9E9E9E",textAlign:"center",marginBottom:16}}>{lang==="zh"?"請把以下帳密提供給學生（僅顯示這一次）":"Give these credentials to the student (shown only this once)"}</div>
            <div style={{background:"#F5F5F5",borderRadius:8,padding:"12px 14px",fontSize:13,lineHeight:2}}>
              <div>{lang==="zh"?"姓名":"Name"}：<strong>{justCreated.name}</strong></div>
              <div>{lang==="zh"?"帳號":"Username"}：<strong>{justCreated.username}</strong></div>
              <div>{lang==="zh"?"密碼":"Password"}：<strong>{justCreated.pwd}</strong></div>
            </div>
            <button onClick={()=>setJustCreated(null)} style={{width:"100%",marginTop:16,padding:"10px",borderRadius:8,background:"#1A6B8A",border:"none",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer"}}>{lang==="zh"?"知道了":"Got it"}</button>
          </div>
        </div>
      )}
      {rejectTarget && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9300,padding:"1rem"}}>
          <div style={{background:"#FFFFFF",borderRadius:16,width:"100%",maxWidth:360,boxSizing:"border-box",boxShadow:"0 8px 36px rgba(23,47,57,0.2)",padding:"22px"}}>
            <div style={{fontSize:14,fontWeight:600,color:"#172F39",marginBottom:10}}>{lang==="zh"?`婉拒「${rejectTarget.nameCn}」的申請`:`Decline ${rejectTarget.nameCn}'s application`}</div>
            <label style={lStyle}>{lang==="zh"?"備註（選填）":"Note (optional)"}</label>
            <input style={iStyle} value={rejectNote} onChange={e=>setRejectNote(e.target.value)}/>
            <div style={{display:"flex",gap:8,marginTop:16}}>
              <button onClick={doReject} style={{flex:1,padding:"9px",borderRadius:7,background:"#D32F2F",border:"none",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer"}}>{lang==="zh"?"確認婉拒":"Confirm Decline"}</button>
              <button onClick={()=>{setRejectTarget(null);setRejectNote("");}} style={{padding:"9px 16px",borderRadius:7,background:"transparent",border:"0.5px solid #CFD8DC",color:"#546E7A",fontSize:13,cursor:"pointer"}}>{t.cancel}</button>
            </div>
          </div>
        </div>
      )}

      {editTarget && editForm && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9300,padding:"1rem"}}>
          <div style={{background:"#FFFFFF",borderRadius:16,width:"100%",maxWidth:380,boxSizing:"border-box",boxShadow:"0 8px 36px rgba(23,47,57,0.2)",maxHeight:"85vh",display:"flex",flexDirection:"column"}}>
            <div style={{background:"#172F39",padding:"13px 18px",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
              <span style={{fontSize:14,fontWeight:600,color:"#fff"}}>✎ {lang==="zh"?"編輯申請資料":"Edit Application"}</span>
              <button onClick={()=>{setEditTarget(null);setEditForm(null);}} style={{background:"rgba(255,255,255,0.15)",border:"none",borderRadius:"50%",width:28,height:28,cursor:"pointer",color:"#fff",fontSize:16}}>×</button>
            </div>
            <div style={{padding:"16px 18px",overflowY:"auto",flex:1,minHeight:0}}>
              <label style={lStyle}>{lang==="zh"?"中文姓名 *":"Chinese Name *"}</label>
              <input style={iStyle} value={editForm.nameCn} onChange={e=>setEditForm(f=>({...f,nameCn:e.target.value}))}/>

              <label style={lStyle}>{lang==="zh"?"英文姓名 *":"English Name *"}</label>
              <input style={iStyle} value={editForm.nameEn} onChange={e=>setEditForm(f=>({...f,nameEn:e.target.value}))}/>

              <label style={lStyle}>{lang==="zh"?"出生年月日 *":"Date of Birth *"}</label>
              <input type="date" style={iStyle} value={editForm.birthDate} onChange={e=>setEditForm(f=>({...f,birthDate:e.target.value}))}/>

              <label style={lStyle}>{lang==="zh"?"聯絡電話":"Contact Phone"}</label>
              <input style={iStyle} value={editForm.phone||""} onChange={e=>setEditForm(f=>({...f,phone:e.target.value}))}/>

              <label style={lStyle}>{lang==="zh"?"Email":"Email"}</label>
              <input type="email" style={iStyle} value={editForm.email||""} onChange={e=>setEditForm(f=>({...f,email:e.target.value}))}/>

              <label style={lStyle}>{lang==="zh"?"其他聯繫方式":"Other Contact Method"}</label>
              <input style={iStyle} value={editForm.otherContact||""} onChange={e=>setEditForm(f=>({...f,otherContact:e.target.value}))}/>

              <label style={lStyle}>{lang==="zh"?"英文程度":"English Level"}</label>
              <select style={iStyle} value={editForm.englishLevel||""} onChange={e=>setEditForm(f=>({...f,englishLevel:e.target.value}))}>
                {englishLevels.map(l=><option key={l.id} value={l.id}>{lang==="zh"?l.zh:l.en}</option>)}
              </select>

              <label style={lStyle}>{lang==="zh"?"學習英文目的":"Purpose of Learning English"}</label>
              <select style={iStyle} value={editForm.learningPurpose||""} onChange={e=>setEditForm(f=>({...f,learningPurpose:e.target.value}))}>
                {learningPurposes.map(p=><option key={p.id} value={p.id}>{lang==="zh"?p.zh:p.en}</option>)}
              </select>

              <label style={lStyle}>{lang==="zh"?"傾向的試聽＆上課時段":"Preferred Trial & Class Time"}</label>
              <select style={iStyle} value={editForm.preferredSlot||""} onChange={e=>setEditForm(f=>({...f,preferredSlot:e.target.value}))}>
                <option value="">{lang==="zh"?"—請選擇—":"—Select—"}</option>
                {PREFERRED_SLOTS.map(s=><option key={s.id} value={s.id}>{lang==="zh"?s.zh:s.en}</option>)}
              </select>

              <label style={lStyle}>{lang==="zh"?"備註":"Notes"}</label>
              <textarea style={{...iStyle,minHeight:50,resize:"vertical",fontFamily:"inherit"}} value={editForm.note||""} onChange={e=>setEditForm(f=>({...f,note:e.target.value}))}/>
            </div>
            <div style={{display:"flex",gap:8,padding:"12px 18px 16px",borderTop:"0.5px solid #E0E0E0",flexShrink:0}}>
              <button onClick={saveEdit} style={{flex:1,padding:"10px",borderRadius:7,background:"#1A6B8A",border:"none",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer"}}>✓ {lang==="zh"?"儲存修改":"Save Changes"}</button>
              <button onClick={()=>{setEditTarget(null);setEditForm(null);}} style={{padding:"10px 16px",borderRadius:7,background:"transparent",border:"0.5px solid #CFD8DC",color:"#546E7A",fontSize:13,cursor:"pointer"}}>{t.cancel}</button>
            </div>
          </div>
        </div>
      )}

      <div style={{display:"flex",gap:5,marginBottom:16,flexWrap:"wrap"}}>
        {(hideOptions
          ? [["pending",lang==="zh"?"待審核":"Pending",pending.length],["history",lang==="zh"?"已處理":"History",0]]
          : [["pending",lang==="zh"?"待審核":"Pending",pending.length],["history",lang==="zh"?"已處理":"History",0],["options",lang==="zh"?"選項設定":"Options",0]]
        ).map(([k,l,badge])=>(
          <button key={k} onClick={()=>setSubTab(k)} style={{position:"relative",padding:"7px 16px",borderRadius:7,fontSize:13,cursor:"pointer",border:subTab===k?"none":"0.5px solid #CFD8DC",background:subTab===k?"#1A6B8A":"transparent",color:subTab===k?"#fff":"#546E7A",fontWeight:subTab===k?600:400}}>
            {l}
            {badge>0 && <span style={{marginLeft:6,fontSize:10,background:subTab===k?"rgba(255,255,255,0.25)":"#D32F2F",color:"#fff",borderRadius:9,padding:"1px 6px",fontWeight:700}}>{badge}</span>}
          </button>
        ))}
      </div>

      {subTab==="pending" && (
        pending.length===0 ? <p style={{color:"#9E9E9E",fontSize:13,textAlign:"center",padding:"2rem 0"}}>{lang==="zh"?"目前沒有待審核的試聽申請":"No pending trial applications"}</p> :
        pending.map(app => (
          <div key={app.id} style={{background:"#FFFFFF",border:"0.5px solid #E0E0E0",borderRadius:10,padding:"14px 16px",marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:8}}>
              <div>
                <div style={{fontSize:14,fontWeight:600,color:"#172F39"}}>{app.nameCn}（{app.nameEn}）</div>
                <div style={{fontSize:12,color:"#546E7A",marginTop:3,lineHeight:1.8}}>
                  🎂 {app.birthDate}　{app.phone&&`📱 ${app.phone}`}
                  {(app.email||app.otherContact) && <>{app.phone?"　":""}{app.email&&`✉️ ${app.email}`}{app.email&&app.otherContact?"　":""}{app.otherContact&&`💬 ${app.otherContact}`}</>}<br/>
                  📊 {levelLabel(app.englishLevel)}　🎯 {purposeLabel(app.learningPurpose)}<br/>
                  🕐 {lang==="zh"?"偏好時段":"Preferred"}: {slotLabel(app.preferredSlot)}
                  {app.note && <><br/>📝 {app.note}</>}
                </div>
                <div style={{fontSize:10,color:"#9E9E9E",marginTop:4}}>{lang==="zh"?"申請時間":"Submitted"}: {app.submittedAt.slice(0,16).replace("T"," ")}</div>
              </div>
              <div style={{display:"flex",gap:6,flexShrink:0,flexWrap:"wrap"}}>
                <button onClick={()=>openEdit(app)} style={{fontSize:12,padding:"6px 14px",borderRadius:6,background:"transparent",border:"0.5px solid #CFD8DC",color:"#546E7A",cursor:"pointer"}}>✎ {lang==="zh"?"編輯資料":"Edit"}</button>
                <button onClick={()=>approve(app)} style={{fontSize:12,padding:"6px 14px",borderRadius:6,background:"#2E7D32",border:"none",color:"#fff",cursor:"pointer",fontWeight:600}}>✓ {lang==="zh"?"核准並建立帳號":"Approve & Create Account"}</button>
                <button onClick={()=>setRejectTarget(app)} style={{fontSize:12,padding:"6px 14px",borderRadius:6,background:"transparent",border:"0.5px solid #D32F2F",color:"#D32F2F",cursor:"pointer"}}>✕ {lang==="zh"?"婉拒":"Decline"}</button>
              </div>
            </div>
          </div>
        ))
      )}

      {subTab==="history" && (
        history.length===0 ? <p style={{color:"#9E9E9E",fontSize:13,textAlign:"center",padding:"2rem 0"}}>—</p> :
        history.map(app => (
          <div key={app.id} style={{background:"#FFFFFF",border:"0.5px solid #E0E0E0",borderRadius:10,padding:"12px 16px",marginBottom:8}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
              <div>
                <span style={{fontSize:13,fontWeight:600,color:"#172F39"}}>{app.nameCn}（{app.nameEn}）</span>
                <span style={{fontSize:11,color:"#9E9E9E",marginLeft:8}}>{app.submittedAt.slice(0,10)}</span>
                {app.reviewNote && <div style={{fontSize:11,color:"#9E9E9E",marginTop:2}}>{lang==="zh"?"備註":"Note"}: {app.reviewNote}</div>}
              </div>
              <span style={{fontSize:11,fontWeight:600,borderRadius:5,padding:"2px 10px",background:app.status==="approved"?"#E8F5E9":"#FFEBEE",color:app.status==="approved"?"#2E7D32":"#D32F2F"}}>
                {app.status==="approved"?(lang==="zh"?"已核准":"Approved"):(lang==="zh"?"已婉拒":"Declined")}
              </span>
            </div>
          </div>
        ))
      )}

      {!hideOptions && subTab==="options" && (
        <div>
          <div style={{fontSize:13,fontWeight:600,color:"#172F39",marginBottom:8}}>{lang==="zh"?"英文程度選項":"English Level Options"}</div>
          {englishLevels.map(opt=>(
            <div key={opt.id} style={{display:"flex",gap:6,marginBottom:6,alignItems:"center"}}>
              <input style={{...iStyle,flex:1}} value={opt.zh} onChange={e=>updateOption(englishLevels,setEnglishLevels,opt.id,"zh",e.target.value)} placeholder="中文"/>
              <input style={{...iStyle,flex:1}} value={opt.en} onChange={e=>updateOption(englishLevels,setEnglishLevels,opt.id,"en",e.target.value)} placeholder="English"/>
              <button onClick={()=>removeOption(englishLevels,setEnglishLevels,opt.id)} style={{background:"transparent",border:"0.5px solid #FFCDD2",borderRadius:5,color:"#D32F2F",padding:"7px 10px",cursor:"pointer",fontSize:13}}>✕</button>
            </div>
          ))}
          <button onClick={()=>addOption(englishLevels,setEnglishLevels)} style={{fontSize:12,padding:"6px 14px",borderRadius:6,border:"1px dashed #1A6B8A",background:"transparent",color:"#1A6B8A",cursor:"pointer",marginBottom:20}}>+ {lang==="zh"?"新增選項":"Add Option"}</button>

          <div style={{fontSize:13,fontWeight:600,color:"#172F39",marginBottom:8}}>{lang==="zh"?"學習英文目的選項":"Learning Purpose Options"}</div>
          {learningPurposes.map(opt=>(
            <div key={opt.id} style={{display:"flex",gap:6,marginBottom:6,alignItems:"center"}}>
              <input style={{...iStyle,flex:1}} value={opt.zh} onChange={e=>updateOption(learningPurposes,setLearningPurposes,opt.id,"zh",e.target.value)} placeholder="中文"/>
              <input style={{...iStyle,flex:1}} value={opt.en} onChange={e=>updateOption(learningPurposes,setLearningPurposes,opt.id,"en",e.target.value)} placeholder="English"/>
              <button onClick={()=>removeOption(learningPurposes,setLearningPurposes,opt.id)} style={{background:"transparent",border:"0.5px solid #FFCDD2",borderRadius:5,color:"#D32F2F",padding:"7px 10px",cursor:"pointer",fontSize:13}}>✕</button>
            </div>
          ))}
          <button onClick={()=>addOption(learningPurposes,setLearningPurposes)} style={{fontSize:12,padding:"6px 14px",borderRadius:6,border:"1px dashed #1A6B8A",background:"transparent",color:"#1A6B8A",cursor:"pointer"}}>+ {lang==="zh"?"新增選項":"Add Option"}</button>
        </div>
      )}
    </div>
  );
}


function AdminPanel({ users, setUsers, courses, setCourses, absences, setAbsences, materials, setMaterials, enrollments, setEnrollments, attendance, setAttendance, lang, setToast, introText, setIntroText, feedback, setFeedback, teacherAvailability, setTeacherAvailability, availabilityOverrides, setAvailabilityOverrides, profileChanges, setProfileChanges, onImpersonate, trialApplications, setTrialApplications, englishLevels, setEnglishLevels, learningPurposes, setLearningPurposes, initialTab, currentUser, studentMatSubs, setStudentMatSubs }) {
  const t = T[lang];
  const [tab, setTab] = useState(initialTab || "courses");
  const pendingFbCount = (feedback||[]).filter(f=>f.status==="pending").length;
  const pendingChangeCount = (profileChanges||[]).filter(c=>c.status==="pending").length;
  const pendingTrialCount = (trialApplications||[]).filter(a=>a.status==="pending").length;
  const pendingMatEditCount = (materials||[]).filter(m=>m.pendingEdit).length;
  const pendingStudentMatCount = (studentMatSubs||[]).filter(s=>s.status==="pending").length;
  const tabs = [
    {key:"courses", label:t.courses},
    {key:"enroll",  label:t.enrollments},
    {key:"leave",   label:t.leaveReview},
    {key:"feedback",label:t.feedbackCenterTitle, badge:pendingFbCount},
    {key:"matedit", label:lang==="zh"?"教材編輯審核":"Material Edit Review", badge:pendingMatEditCount},
    {key:"studentmat", label:lang==="zh"?"學生教材投稿":"Student Materials", badge:pendingStudentMatCount},
    {key:"availability", label:t.availability},
    {key:"peopledir", label:t.peopleDir, badge:pendingChangeCount},
    {key:"trial", label:lang==="zh"?"試聽申請":"Trial Applications", badge:pendingTrialCount},
    {key:"users",   label:t.manageUsers},
    {key:"tstats",  label:t.teacherStats},
    {key:"sstats",  label:t.studentStats},
    {key:"studentOverview", label:lang==="zh"?"任教學生總覽":"Student Overview"},
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
      {tab==="courses"&&<CourseManager users={users} courses={courses} setCourses={setCourses} lang={lang} setToast={setToast} materials={materials} setMaterials={setMaterials} enrollments={enrollments} setEnrollments={setEnrollments} attendance={attendance} absences={absences}/>}
      {tab==="enroll" &&<EnrollmentManager users={users} courses={courses} setCourses={setCourses} enrollments={enrollments} setEnrollments={setEnrollments} attendance={attendance} setAttendance={setAttendance} lang={lang} setToast={setToast}/>}
      {tab==="leave"  &&<LeaveReview users={users} courses={courses} absences={absences} setAbsences={setAbsences} attendance={attendance} setAttendance={setAttendance} enrollments={enrollments} setEnrollments={setEnrollments} lang={lang} setToast={setToast}/>}
      {tab==="feedback"&&<FeedbackCenter users={users} courses={courses} enrollments={enrollments} attendance={attendance} absences={absences} feedback={feedback||[]} setFeedback={setFeedback} lang={lang} setToast={setToast} currentUser={currentUser} materials={materials} setMaterials={setMaterials}/>}
      {tab==="matedit"&&<MaterialEditReview courses={courses} materials={materials||[]} setMaterials={setMaterials} users={users} lang={lang} setToast={setToast}/>}
      {tab==="studentmat"&&<StudentMaterialReviewPanel users={users} courses={courses} enrollments={enrollments} materials={materials||[]} setMaterials={setMaterials} studentMatSubs={studentMatSubs||[]} setStudentMatSubs={setStudentMatSubs} currentUser={currentUser} lang={lang} setToast={setToast}/>}
      {tab==="availability"&&<AdminTeacherAvailability users={users} courses={courses} availability={teacherAvailability||[]} setAvailability={setTeacherAvailability} overrides={availabilityOverrides||[]} setOverrides={setAvailabilityOverrides} absences={absences} attendance={attendance} enrollments={enrollments} lang={lang} setToast={setToast}/>}
      {tab==="peopledir" &&<PeopleDirectory users={users} setUsers={setUsers} lang={lang} setToast={setToast} enrollments={enrollments} attendance={attendance} courses={courses} profileChanges={profileChanges} setProfileChanges={setProfileChanges}/>}
      {tab==="trial" &&<TrialApplicationsPanel users={users} setUsers={setUsers} lang={lang} setToast={setToast} trialApplications={trialApplications||[]} setTrialApplications={setTrialApplications} englishLevels={englishLevels||[]} setEnglishLevels={setEnglishLevels} learningPurposes={learningPurposes||[]} setLearningPurposes={setLearningPurposes}/>}
      {tab==="users"  &&<UserManager users={users} setUsers={setUsers} lang={lang} setToast={setToast} onImpersonate={onImpersonate}/>}
      {tab==="tstats" &&<TeacherStats users={users} courses={courses} absences={absences} attendance={attendance} enrollments={enrollments} lang={lang}/>}
      {tab==="sstats" &&<StudentStats users={users} courses={courses} absences={absences} attendance={attendance} enrollments={enrollments} setEnrollments={setEnrollments} lang={lang}/>}
      {tab==="studentOverview" &&<AdminStudentOverview currentUser={currentUser} users={users} courses={courses} enrollments={enrollments} materials={materials} setMaterials={setMaterials} feedback={feedback} setFeedback={setFeedback} attendance={attendance} absences={absences} lang={lang} setToast={setToast}/>}
      {tab==="settings"&&<SiteSettings introText={introText} setIntroText={setIntroText} lang={lang} setToast={setToast}/>}
    </div>
  );
}

// ─── Assistant panel ──────────────────────────────────────────────────────────
// A trimmed-down version of AdminPanel for the 助教 (assistant) role: can edit
// courses/materials and view the schedule and people directory, but has no
// access to payment/enrollment records, leave review, feedback moderation,
// user management, stats, or site settings — and salary is hidden entirely
// within the people directory.
function AssistantPanel({ users, setUsers, courses, setCourses, materials, setMaterials, enrollments, setEnrollments, attendance, lang, setToast, currentUser, feedback, setFeedback, teacherAvailability, setTeacherAvailability, availabilityOverrides, setAvailabilityOverrides, absences, trialApplications, setTrialApplications, englishLevels, learningPurposes, studentMatSubs, setStudentMatSubs }) {
  const t = T[lang];
  const [tab, setTab] = useState("courses");
  const pendingTrialCount = (trialApplications||[]).filter(a=>a.status==="pending").length;
  const pendingStudentMatCount = (studentMatSubs||[]).filter(s=>s.status==="pending").length;
  const tabs = [
    {key:"courses", label:t.courses},
    {key:"feedback", label:t.feedbackCenterTitle},
    {key:"studentmat", label:lang==="zh"?"學生教材投稿":"Student Materials", badge:pendingStudentMatCount},
    {key:"availability", label:t.availability},
    {key:"peopledir", label:t.peopleDir},
    {key:"trial", label:lang==="zh"?"試聽申請":"Trial Applications", badge:pendingTrialCount},
    {key:"studentOverview", label:lang==="zh"?"任教學生總覽":"Student Overview"},
  ];
  return (
    <div>
      <h2 style={{fontSize:18,fontWeight:500,color:"#172F39",margin:"0 0 1.25rem"}}>{t.assistantPanel}</h2>
      <div style={{display:"flex",gap:2,marginBottom:"1.5rem",flexWrap:"wrap",borderBottom:"0.5px solid #E0E0E0",paddingBottom:0}}>
        {tabs.map(tb=>(
          <button key={tb.key} onClick={()=>setTab(tb.key)} style={{position:"relative",padding:"7px 12px",borderRadius:"6px 6px 0 0",border:"none",borderBottom:tab===tb.key?"2px solid #1A6B8A":"2px solid transparent",background:tab===tb.key?"#EEF6FB":"transparent",color:tab===tb.key?"#1A6B8A":"#546E7A",fontSize:12,cursor:"pointer",marginBottom:-1,whiteSpace:"nowrap"}}>
            {tb.label}
            {tb.badge>0 && <span style={{marginLeft:6,fontSize:10,background:"#D32F2F",color:"#fff",borderRadius:9,padding:"1px 6px",fontWeight:700}}>{tb.badge}</span>}
          </button>
        ))}
      </div>
      {tab==="courses"&&<CourseManager users={users} courses={courses} setCourses={setCourses} lang={lang} setToast={setToast} materials={materials} setMaterials={setMaterials} enrollments={enrollments} setEnrollments={setEnrollments} attendance={attendance} absences={absences}/>}
      {tab==="feedback"&&<FeedbackCenter users={users} courses={courses} enrollments={enrollments} attendance={attendance} absences={absences} feedback={feedback||[]} setFeedback={setFeedback} lang={lang} setToast={setToast} currentUser={currentUser} materials={materials} setMaterials={setMaterials}/>}
      {tab==="studentmat"&&<StudentMaterialReviewPanel users={users} courses={courses} enrollments={enrollments} materials={materials||[]} setMaterials={setMaterials} studentMatSubs={studentMatSubs||[]} setStudentMatSubs={setStudentMatSubs} currentUser={currentUser} lang={lang} setToast={setToast}/>}
      {tab==="availability"&&<AdminTeacherAvailability users={users} courses={courses} availability={teacherAvailability||[]} setAvailability={setTeacherAvailability} overrides={availabilityOverrides||[]} setOverrides={setAvailabilityOverrides} absences={absences} attendance={attendance} enrollments={enrollments} lang={lang} setToast={setToast} readOnly/>}
      {tab==="peopledir" &&<PeopleDirectory users={users} setUsers={setUsers} lang={lang} setToast={setToast} enrollments={enrollments} attendance={attendance} courses={courses} hideSalary readOnly/>}
      {tab==="trial" &&<TrialApplicationsPanel users={users} setUsers={setUsers} lang={lang} setToast={setToast} trialApplications={trialApplications||[]} setTrialApplications={setTrialApplications} englishLevels={englishLevels||[]} learningPurposes={learningPurposes||[]} hideOptions/>}
      {tab==="studentOverview" &&<AdminStudentOverview currentUser={currentUser} users={users} courses={courses} enrollments={enrollments} materials={materials} setMaterials={setMaterials} feedback={feedback} setFeedback={setFeedback} attendance={attendance} absences={absences} lang={lang} setToast={setToast}/>}
    </div>
  );
}


// Simple check-and-approve flow: view the teacher's written feedback, then
// one click to Approve (becomes visible to the student) or Reject.
// Compute completed sessions that have no feedback entry at all yet (excludes
// sessions marked absent/excused/teacher_leave, since feedback isn't expected there)
function computeMissingFeedback(courses, enrollments, feedback, attendance, absences) {
  const missing = [];
  (enrollments||[]).forEach(enr => {
    const course = courses.find(c=>c.id===enr.courseId);
    if (!course) return;
    (enr.scheduledDates||[]).forEach(s => {
      if (!isSessionOver(s.date, resolveSessionStart(course, s), course.duration)) return;
      const attRec = (attendance||[]).find(a=>a.enrollmentId===enr.id && a.date===s.date);
      if (attRec && attRec.type!=="other") return; // absent/excused/teacher_leave (admin-recorded) — feedback not expected
      // Self-reported leave (student/teacher via AbsenceModal) only ever
      // creates an `absences` entry, never an `attendance` one — checking
      // attRec alone missed every self-reported leave.
      const absRec = (absences||[]).find(a=>a.courseId===course.id && a.dateStr===s.date);
      if (absRec) return;
      const hasFeedback = (feedback||[]).some(f=>f.enrollmentId===enr.id && f.date===s.date);
      if (!hasFeedback) missing.push({ course, enrollment: enr, date: s.date, dayIndex: s.dayIndex, sessionNo: s.sessionNo });
    });
  });
  return missing;
}

// Monday (YYYY-MM-DD) of the week containing dateStr — used as a grouping key
function getMondayKey(dateStr) {
  const d = new Date(dateStr+"T00:00:00");
  const dow = (d.getDay()+6)%7;
  d.setDate(d.getDate()-dow);
  return fmtYMD(d);
}

function FeedbackCenter({ users, courses, enrollments, attendance, absences, feedback, setFeedback, lang, setToast, currentUser, materials, setMaterials }) {
  const t = T[lang];
  const isAssistant = currentUser?.role === "assistant";
  // Assistants can help fill in feedback (tracking tab) and browse it
  // (overview), but approving/rejecting stays admin-only — that's the whole
  // point of still requiring admin review before it reaches the student.
  const [subTab, setSubTab] = useState(isAssistant ? "tracking" : "review"); // review | tracking | overview
  const [filter, setFilter] = useState("pending"); // pending | all
  const [rejectTarget, setRejectTarget] = useState(null); // feedback id (or "_batch") pending a reject-reason prompt
  const [rejectNote, setRejectNote] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null); // feedback id (or "_batch") pending a delete confirmation
  const [selected, setSelected] = useState(new Set()); // selected feedback ids (pending only)
  const [showBatchInput, setShowBatchInput] = useState(false);
  const [batchInputCourseId, setBatchInputCourseId] = useState(null);
  const [overviewStudents, setOverviewStudents] = useState(new Set()); // optional narrow-down; empty = all students
  const [showOverviewPicker, setShowOverviewPicker] = useState(false);
  const [overviewSearch, setOverviewSearch] = useState(""); // free-text: feedback content, student, teacher, course
  const [overviewTeacherId, setOverviewTeacherId] = useState(""); // "" = all teachers
  const [overviewStatusFilter, setOverviewStatusFilter] = useState("all"); // all | pending | approved | rejected | none
  const todayStr0 = new Date().toISOString().slice(0,10);
  const [overviewAllTime, setOverviewAllTime] = useState(false);
  const [overviewDateFrom, setOverviewDateFrom] = useState(new Date(Date.now()-30*86400000).toISOString().slice(0,10));
  const [overviewDateTo, setOverviewDateTo] = useState(todayStr0);
  // For "NO — 沿用教材" items: whether to also carry the material forward
  // when approving. Defaults to checked, since that's the whole point of the
  // quick action — admin just needs to uncheck it if they'd rather handle it
  // manually.
  const [continueChecks, setContinueChecks] = useState({});
  const continueChecked = (f) => continueChecks[f.id] ?? true;

  const allStudentUsers = users.filter(u=>u.role==="student");
  const allTeacherUsers = users.filter(u=>u.role==="teacher");

  const getCourse = id => courses.find(c=>c.id===id);
  const getUser = id => users.find(u=>u.id===id);
  const isAdminSourced = f => f.source === "admin"; // legacy records without `source` default to teacher-authored

  const list = (feedback||[])
    .filter(f => filter==="all" || f.status==="pending")
    .sort((a,b) => (b.updatedAt||"").localeCompare(a.updatedAt||""));

  const pendingIds = list.filter(f=>f.status==="pending").map(f=>f.id);
  const allPendingSelected = pendingIds.length>0 && pendingIds.every(id=>selected.has(id));

  // ── Material Assistance — a separate, review-independent action list.
  // Anyone who can act on it (admin OR assistant) sees every feedback with a
  // reported next-material status that hasn't been handled yet, regardless
  // of whether the feedback text itself has been approved — material prep
  // shouldn't have to wait on that. Assistants get full access here since
  // it's purely materials, never touches approve/reject.
  const materialPendingList = (feedback||[])
    .filter(f => f.nextMaterialStatus && !f.materialProcessed)
    .sort((a,b) => (a.date||"").localeCompare(b.date||""));
  const markMaterialProcessed = (f) => {
    setFeedback(prev => prev.map(x => x.id===f.id ? {...x, materialProcessed:true, materialProcessedAt:new Date().toISOString(), materialProcessedBy:currentUser?.id||""} : x));
  };
  const getMaterialStatusMeta = (f) => {
    const hasCurrentMat = (materials||[]).some(m=>m.courseId===f.courseId && m.date===f.date);
    if (f.nextMaterialStatus==="yes") return {bg:"#E8F5E9", color:"#2E7D32", icon:"✅", label:lang==="zh"?"教材已上完（已結束）":"Material completed", note:lang==="zh"?"請協助提供下一堂教材":"Please help prepare the next lesson's material", hasCurrentMat};
    if (f.nextMaterialStatus==="no_continue") return {bg:"#FFF3E0", color:"#E65100", icon:"🔄", label:lang==="zh"?"尚未完成，沿用教材":"Not finished — reuse material", note: hasCurrentMat ? (lang==="zh"?"下次上課沿用本堂教材":"Reuse this class's material next time") : (lang==="zh"?"（此堂沒有登記教材，無法自動沿用）":"(no material logged for this class — can't auto-carry it forward)"), hasCurrentMat};
    return {bg:"#FFF3E0", color:"#E65100", icon:"📝", label:lang==="zh"?"尚未完成，下次主題":"Not finished — next topic", note: f.nextMaterialNote||"—", hasCurrentMat};
  };

  const toggleSel = (id) => setSelected(s=>{const n=new Set(s); n.has(id)?n.delete(id):n.add(id); return n;});
  const toggleSelAll = () => setSelected(allPendingSelected ? new Set() : new Set(pendingIds));

  const approve = (f, alsoContinueMaterial) => {
    setFeedback(prev => prev.map(x => x.id===f.id ? {...x, status:"approved", reviewedAt:new Date().toISOString(), reviewedBy:"admin", reviewNote:""} : x));
    if (alsoContinueMaterial) copyMaterialForward(f);
    setToast(alsoContinueMaterial ? (lang==="zh"?"已核准，並將教材沿用至下一堂課":"Approved — material carried over to the next class") : t.feedbackApproved);
  };

  // Quick action for the "NO — 沿用教材" case: copy whatever material was
  // used for THIS session forward onto the course's next real scheduled
  // date, same mechanism as the "延續到下一堂課" button in the materials
  // manager — just triggered straight from the review action instead of
  // requiring a separate trip there.
  const copyMaterialForward = (f) => {
    const enr = (enrollments||[]).find(e=>e.id===f.enrollmentId);
    if (!enr) return;
    const currentMat = (materials||[]).find(m=>m.courseId===f.courseId && m.date===f.date);
    if (!currentMat) return; // nothing to carry forward
    const futureDates = (enr.scheduledDates||[]).map(s=>s.date).filter(d=>d>f.date).sort();
    const nextDate = futureDates[0];
    if (!nextDate) return; // no future session to attach it to
    if ((materials||[]).some(m=>m.courseId===f.courseId && m.date===nextDate)) return; // that date already has its own material — don't overwrite
    const nextSession = (enr.scheduledDates||[]).find(s=>s.date===nextDate);
    setMaterials(prev => [...(prev||[]), {
      id: genId(), courseId: f.courseId, date: nextDate, dayIndex: nextSession?.dayIndex ?? f.dayIndex,
      title: currentMat.title, url: currentMat.url, desc: currentMat.desc,
      addedBy: currentUser?.id || "admin", addedAt: new Date().toISOString(),
    }]);
    markMaterialProcessed(f);
  };

  // Reject: admin-authored feedback has no teacher to hand back to, so it's
  // simply removed on the spot. Teacher-written feedback keeps the reason-prompt
  // flow so the teacher can see why and revise it.
  const openReject = (f) => {
    if (isAdminSourced(f)) {
      setFeedback(prev => prev.filter(x => x.id !== f.id));
      setToast(t.feedbackAdminReturned);
      return;
    }
    setRejectTarget(f); setRejectNote("");
  };
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
    const selectedItems = list.filter(f=>selected.has(f.id));
    setFeedback(prev => prev.map(x => selected.has(x.id) ? {...x, status:"approved", reviewedAt:new Date().toISOString(), reviewedBy:"admin", reviewNote:""} : x));
    // Same quick action as the single-item approve — for any selected item
    // that's "沿用教材" with its checkbox still checked, carry the material
    // forward too.
    selectedItems.forEach(f => { if (f.nextMaterialStatus==="no_continue" && continueChecked(f)) copyMaterialForward(f); });
    setToast(t.feedbackBatchApproved.replace("{n}", selected.size));
    setSelected(new Set());
  };

  // Batch reject: split by source — admin-authored ones are removed immediately
  // (no teacher to notify), teacher-authored ones go through the shared reason prompt.
  const batchReject = () => {
    if (selected.size===0) return;
    const selectedItems = list.filter(f=>selected.has(f.id));
    const adminIds = selectedItems.filter(isAdminSourced).map(f=>f.id);
    const teacherIds = selectedItems.filter(f=>!isAdminSourced(f)).map(f=>f.id);
    if (adminIds.length>0) {
      setFeedback(prev => prev.filter(x => !adminIds.includes(x.id)));
    }
    if (teacherIds.length>0) {
      setSelected(new Set(teacherIds)); // narrow the pending batch action to just the teacher-authored ones
      setRejectTarget("_batch"); setRejectNote("");
    } else {
      setToast(t.feedbackBatchRejected.replace("{n}", adminIds.length));
      setSelected(new Set());
    }
  };

  // Delete — available for any feedback regardless of status/source, straightforward removal.
  const openDelete = (f) => setDeleteTarget(f.id);
  const confirmDelete = () => {
    if (deleteTarget === "_batch") {
      setFeedback(prev => prev.filter(x => !selected.has(x.id)));
      setToast(t.feedbackBatchDeleted.replace("{n}", selected.size));
      setSelected(new Set());
    } else {
      setFeedback(prev => prev.filter(x => x.id !== deleteTarget));
      setToast(t.feedbackDeleted);
    }
    setDeleteTarget(null);
  };
  const batchDelete = () => { if (selected.size>0) setDeleteTarget("_batch"); };

  const STATUS_META = {
    pending:  {label:t.feedbackStatusPending,  color:"#E65100", bg:"#FFF3E0"},
    approved: {label:t.feedbackStatusApproved, color:"#2E7D32", bg:"#E8F5E9"},
    rejected: {label:t.feedbackStatusRejected, color:"#D32F2F", bg:"#FFEBEE"},
  };

  // ── Missing-feedback tracking, grouped by week (most recent first) ──
  const missing = computeMissingFeedback(courses, enrollments, feedback, attendance, absences);
  const missingByWeek = {};
  missing.forEach(m => {
    const wk = getMondayKey(m.date);
    if (!missingByWeek[wk]) missingByWeek[wk] = [];
    missingByWeek[wk].push(m);
  });
  const weekKeys = Object.keys(missingByWeek).sort((a,b)=>b.localeCompare(a));

  const openBatchInputFor = (courseId) => { setBatchInputCourseId(courseId); setShowBatchInput(true); };

  // ── Overview: searchable/filterable browse across ALL feedback + material
  // status — no longer requires picking students first. Student picker is
  // now an optional extra narrow-down, same as the teacher/status/date filters.
  const overviewRows = enrollments
    .flatMap(enr => {
      const course = courses.find(c=>c.id===enr.courseId);
      if (!course) return [];
      if (overviewStudents.size>0 && !overviewStudents.has(enr.studentId)) return [];
      if (overviewTeacherId && course.teacherId!==overviewTeacherId) return [];
      return (enr.scheduledDates||[])
        .filter(s => overviewAllTime || (s.date>=overviewDateFrom && s.date<=overviewDateTo))
        .map(s => ({
          course, enrollment: enr, studentId: enr.studentId,
          date: s.date, dayIndex: s.dayIndex, sessionNo: s.sessionNo, customStart: s.customStart,
          fb: (feedback||[]).find(f=>f.enrollmentId===enr.id && f.date===s.date) || null,
        }));
    })
    .filter(r => {
      if (overviewStatusFilter==="all") return true;
      if (overviewStatusFilter==="none") return !r.fb;
      return r.fb?.status === overviewStatusFilter;
    })
    .filter(r => {
      const q = overviewSearch.trim().toLowerCase();
      if (!q) return true;
      const student = getUser(r.studentId);
      const teacher = getUser(r.course.teacherId);
      return (r.fb?.text||"").toLowerCase().includes(q)
        || (student?.name||"").toLowerCase().includes(q)
        || (teacher?.name||"").toLowerCase().includes(q)
        || r.course.subject.toLowerCase().includes(q);
    });
  const overviewByWeek = {};
  overviewRows.forEach(r => {
    const wk = getMondayKey(r.date);
    if (!overviewByWeek[wk]) overviewByWeek[wk] = [];
    overviewByWeek[wk].push(r);
  });
  const overviewWeekKeys = Object.keys(overviewByWeek).sort((a,b)=>b.localeCompare(a));

  return (
    <div>
      {showBatchInput && <BatchFeedbackModal users={users} courses={courses} enrollments={enrollments} setFeedback={setFeedback} lang={lang} setToast={setToast} initialCourseId={batchInputCourseId} onClose={()=>{setShowBatchInput(false);setBatchInputCourseId(null);}} currentUser={currentUser}/>}

      {/* Delete confirmation (single or batch) */}
      {deleteTarget && (
        <ConfirmModal
          title={t.feedbackDelete}
          message={deleteTarget==="_batch" ? `${t.feedbackDeleteConfirm} (${selected.size})` : t.feedbackDeleteConfirm}
          confirmLabel={t.feedbackDelete}
          onConfirm={confirmDelete}
          onCancel={()=>setDeleteTarget(null)}
          danger
        />
      )}

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
          <h3 style={{fontSize:16,fontWeight:600,color:"#172F39",margin:"0 0 4px"}}>{t.feedbackCenterTitle}</h3>
          <p style={{fontSize:12,color:"#9E9E9E",margin:0}}>{t.feedbackCenterDesc}</p>
        </div>
        <button onClick={()=>openBatchInputFor(null)} style={{background:"#7B1FA2",border:"none",borderRadius:7,color:"#fff",padding:"8px 16px",fontSize:12,fontWeight:500,cursor:"pointer",whiteSpace:"nowrap"}}>
          📋 {t.feedbackBatchInput}
        </button>
      </div>

      {/* Sub-tabs: Review vs Tracking vs Overview */}
      <div style={{display:"flex",gap:5,marginTop:16,marginBottom:16,flexWrap:"wrap"}}>
        {(isAssistant
          ? [["material",t.fbTabMaterial,materialPendingList.length],["tracking",t.fbTabTracking,missing.length],["overview",t.fbTabOverview,0]]
          : [["review",t.fbTabReview,pendingIds.length],["material",t.fbTabMaterial,materialPendingList.length],["tracking",t.fbTabTracking,missing.length],["overview",t.fbTabOverview,0]]
        ).map(([k,l,badge])=>(
          <button key={k} onClick={()=>setSubTab(k)} style={{position:"relative",padding:"7px 16px",borderRadius:7,fontSize:13,cursor:"pointer",border:subTab===k?"none":"0.5px solid #CFD8DC",background:subTab===k?"#1A6B8A":"transparent",color:subTab===k?"#fff":"#546E7A",fontWeight:subTab===k?600:400}}>
            {l}
            {badge>0 && <span style={{marginLeft:6,fontSize:10,background:subTab===k?"rgba(255,255,255,0.25)":"#D32F2F",color:"#fff",borderRadius:9,padding:"1px 6px",fontWeight:700}}>{badge}</span>}
          </button>
        ))}
      </div>

      {/* ══════════ REVIEW SUB-TAB ══════════ */}
      {subTab==="review" && (
        <>
          {/* Filter */}
          <div style={{display:"flex",gap:5,marginBottom:12,flexWrap:"wrap",alignItems:"center"}}>
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
                  <button onClick={batchDelete} style={{background:"transparent",border:"1px solid #9E9E9E",borderRadius:6,color:"#546E7A",padding:"6px 14px",fontSize:12,fontWeight:600,cursor:"pointer"}}>
                    🗑 {t.feedbackBatchDelete}
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
            const fromAdmin = isAdminSourced(f);
            const sourceMeta = f.source==="admin" ? {label:t.feedbackSourceAdmin, bg:"#EDE7F6", color:"#7B1FA2"}
              : f.source==="assistant" ? {label:t.feedbackSourceAssistant, bg:"#E3F2FD", color:"#1565C0"}
              : {label:t.feedbackSourceTeacher, bg:"#F5F5F5", color:"#9E9E9E"};
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
                    <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4,flexShrink:0}}>
                      <span style={{fontSize:11,background:meta.bg,color:meta.color,borderRadius:5,padding:"3px 10px",fontWeight:600}}>● {meta.label}</span>
                      <span style={{fontSize:10,background:sourceMeta.bg,color:sourceMeta.color,borderRadius:4,padding:"1px 7px"}}>{sourceMeta.label}</span>
                    </div>
                  </div>
                  <div style={{background:"#F5F5F5",borderRadius:8,padding:"10px 13px",fontSize:13,color:"#172F39",lineHeight:1.7,whiteSpace:"pre-wrap",marginBottom:10}}>
                    {f.text}
                  </div>
                  {/* Next-lesson material status — important for admin/assistant to know
                      whether they need to go prep material themselves */}
                  {f.nextMaterialStatus && (() => {
                    const matMeta = getMaterialStatusMeta(f);
                    return (
                      <div style={{background:matMeta.bg,borderRadius:7,padding:"8px 12px",marginBottom:10,display:"flex",alignItems:"flex-start",gap:8}}>
                        <span style={{fontSize:14,flexShrink:0}}>{matMeta.icon}</span>
                        <div style={{fontSize:12,color:matMeta.color}}>
                          <strong>{matMeta.label}</strong>
                          <span style={{marginLeft:6}}>{matMeta.note}</span>
                        </div>
                      </div>
                    );
                  })()}
                  {f.status==="pending" && f.nextMaterialStatus==="no_continue" && (materials||[]).some(m=>m.courseId===f.courseId && m.date===f.date) && (
                    <label style={{display:"flex",alignItems:"center",gap:7,fontSize:12,color:"#546E7A",marginBottom:10,cursor:"pointer"}}>
                      <input type="checkbox" checked={continueChecked(f)} onChange={()=>setContinueChecks(c=>({...c,[f.id]:!continueChecked(f)}))} style={{cursor:"pointer"}}/>
                      {lang==="zh"?"核准時一併將教材沿用至下一堂課":"Also carry the material forward to the next class when approving"}
                    </label>
                  )}
                  {f.status==="rejected" && f.reviewNote && (
                    <div style={{fontSize:11,color:"#D32F2F",marginBottom:10}}>↳ {t.feedbackRejectReason.split("（")[0].split("(")[0]}: {f.reviewNote}</div>
                  )}
                  <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                    {f.status==="pending" && (
                      <>
                        <button onClick={()=>approve(f, f.nextMaterialStatus==="no_continue" && continueChecked(f))} style={{flex:1,minWidth:100,background:"#2E7D32",border:"none",borderRadius:7,color:"#fff",padding:"8px",fontSize:13,fontWeight:600,cursor:"pointer"}}>
                          ✓ {t.feedbackApprove}
                        </button>
                        <button onClick={()=>openReject(f)} style={{flex:1,minWidth:100,background:"transparent",border:"1px solid #D32F2F",borderRadius:7,color:"#D32F2F",padding:"8px",fontSize:13,fontWeight:600,cursor:"pointer"}}>
                          ✕ {t.feedbackReject}
                        </button>
                      </>
                    )}
                    {f.status!=="pending" && (
                      <button onClick={()=>setFeedback(prev=>prev.map(x=>x.id===f.id?{...x,status:"pending",reviewedAt:"",reviewedBy:"",reviewNote:""}:x))} style={{fontSize:11,padding:"5px 12px",borderRadius:5,border:"0.5px solid #CFD8DC",background:"transparent",color:"#546E7A",cursor:"pointer"}}>
                        {lang==="zh"?"重新送審":"Re-open for review"}
                      </button>
                    )}
                    <button onClick={()=>openDelete(f)} style={{padding:"8px 12px",borderRadius:7,border:"0.5px solid #FFCDD2",background:"transparent",color:"#D32F2F",fontSize:12,cursor:"pointer"}}>
                      🗑 {t.feedbackDelete}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </>
      )}

      {/* ══════════ MATERIAL ASSISTANCE SUB-TAB — admin AND assistant, no
          approve/reject power here at all, purely the material follow-up
          action based on what the teacher reported ══════════ */}
      {subTab==="material" && (
        <>
          <p style={{fontSize:12,color:"#9E9E9E",margin:"0 0 12px",lineHeight:1.6}}>
            {lang==="zh"?"依老師填寫反饋時勾選的教材狀況，協助處理下一堂課的教材準備——跟反饋文字本身的審核狀態無關。":"Based on what the teacher checked when writing feedback — handle next-lesson material prep independently of whether the feedback text itself has been reviewed."}
          </p>
          {materialPendingList.length===0 ? (
            <div style={{textAlign:"center",padding:"2.5rem 0",color:"#9E9E9E"}}><div style={{fontSize:28,marginBottom:8}}>🎉</div><div style={{fontSize:13}}>{lang==="zh"?"目前沒有待處理的教材項目":"No material follow-ups pending"}</div></div>
          ) : materialPendingList.map(f => {
            const course = getCourse(f.courseId);
            const teacher = getUser(f.teacherId);
            const student = getUser(f.studentId);
            const matMeta = getMaterialStatusMeta(f);
            return (
              <div key={f.id} style={{background:"#FFFFFF",border:`1px solid ${matMeta.color}33`,borderRadius:10,padding:"14px 16px",marginBottom:10}}>
                <div style={{marginBottom:8}}>
                  <div style={{fontWeight:600,fontSize:13,color:"#172F39"}}>{course?.subject||"—"}</div>
                  <div style={{fontSize:11,color:"#9E9E9E",marginTop:2}}>{f.date} ({T[lang].days[f.dayIndex]}) · #{f.sessionNo}</div>
                  <div style={{fontSize:11,color:"#546E7A",marginTop:2}}>{t.feedbackBy}: <strong>{teacher?.name||"—"}</strong> → {t.feedbackFor}: <strong>{student?.name||"—"}</strong></div>
                </div>
                <div style={{background:matMeta.bg,borderRadius:7,padding:"8px 12px",marginBottom:10,display:"flex",alignItems:"flex-start",gap:8}}>
                  <span style={{fontSize:14,flexShrink:0}}>{matMeta.icon}</span>
                  <div style={{fontSize:12,color:matMeta.color}}>
                    <strong>{matMeta.label}</strong>
                    <span style={{marginLeft:6}}>{matMeta.note}</span>
                  </div>
                </div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  {f.nextMaterialStatus==="no_continue" && matMeta.hasCurrentMat && (
                    <button onClick={()=>copyMaterialForward(f)} style={{flex:1,minWidth:140,background:"#1A6B8A",border:"none",borderRadius:7,color:"#fff",padding:"8px",fontSize:13,fontWeight:600,cursor:"pointer"}}>
                      🔄 {lang==="zh"?"沿用教材至下一堂課":"Carry material to next class"}
                    </button>
                  )}
                  <button onClick={()=>markMaterialProcessed(f)} style={{flex:1,minWidth:140,background:"transparent",border:"1px solid #546E7A",borderRadius:7,color:"#546E7A",padding:"8px",fontSize:13,fontWeight:500,cursor:"pointer"}}>
                    ✓ {lang==="zh"?"標記已處理":"Mark handled"}
                  </button>
                </div>
              </div>
            );
          })}
        </>
      )}

      {/* ══════════ TRACKING SUB-TAB ══════════ */}
      {subTab==="tracking" && (
        <>
          <p style={{fontSize:12,color:"#9E9E9E",margin:"0 0 14px"}}>{t.fbTrackingDesc}</p>

          {weekKeys.length===0 && (
            <div style={{textAlign:"center",padding:"2.5rem 0",color:"#9E9E9E"}}>
              <div style={{fontSize:28,marginBottom:8}}>🎉</div>
              <div style={{fontSize:13}}>{t.fbTrackingEmpty}</div>
            </div>
          )}

          {weekKeys.map(wk => {
            const items = missingByWeek[wk].sort((a,b)=>a.date.localeCompare(b.date));
            const monday = new Date(wk+"T00:00:00");
            const sunday = new Date(monday); sunday.setDate(monday.getDate()+6);
            const rangeLabel = `${fmtMD(monday)} – ${fmtMD(sunday)}`;
            return (
              <div key={wk} style={{marginBottom:"1.5rem"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                  <span style={{fontSize:13,fontWeight:600,color:"#172F39"}}>{t.fbWeekOf} {rangeLabel}</span>
                  <span style={{fontSize:10,background:"#FFF3E0",color:"#E65100",borderRadius:9,padding:"2px 8px",fontWeight:700}}>{t.fbTrackingCount.replace("{n}", items.length)}</span>
                  <div style={{flex:1,height:"0.5px",background:"#E0E0E0"}}/>
                </div>
                {items.map((m,i) => {
                  const teacher = getUser(m.course.teacherId);
                  const student = getUser(m.course.studentId);
                  return (
                    <div key={i} style={{display:"flex",alignItems:"center",gap:10,background:"#FFF8E1",border:"0.5px solid #FFE0B2",borderRadius:9,padding:"9px 13px",marginBottom:6,flexWrap:"wrap"}}>
                      <span style={{fontSize:10,color:"#9E9E9E",minWidth:60}}>{m.date} ({T[lang].days[m.dayIndex]})</span>
                      <span style={{fontSize:10,background:"#FFFFFF",border:"0.5px solid #E0E0E0",borderRadius:4,padding:"1px 6px",color:"#9E9E9E"}}>#{m.sessionNo}</span>
                      <div style={{flex:1,minWidth:120}}>
                        <div style={{fontSize:12,fontWeight:600,color:"#172F39"}}>{m.course.subject}</div>
                        <div style={{fontSize:11,color:"#546E7A"}}>{teacher?.name||"—"} → {student?.name||"—"}</div>
                      </div>
                      <button onClick={()=>openBatchInputFor(m.course.id)} style={{fontSize:11,padding:"5px 12px",borderRadius:6,background:"#7B1FA2",border:"none",color:"#fff",cursor:"pointer",fontWeight:500,whiteSpace:"nowrap"}}>
                        📋 {lang==="zh"?"前往填寫":"Fill in"}
                      </button>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </>
      )}

      {/* ══════════ OVERVIEW SUB-TAB ══════════ */}
      {subTab==="overview" && (
        <>
          <p style={{fontSize:12,color:"#9E9E9E",margin:"0 0 12px"}}>{t.fbOverviewDesc}</p>

          {/* Filter toolbar — search + teacher + status + date range, all optional and combinable */}
          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:10,alignItems:"flex-end"}}>
            <div style={{flex:"1 1 200px",minWidth:160}}>
              <label style={{display:"block",fontSize:11,color:"#9E9E9E",marginBottom:3}}>{lang==="zh"?"搜尋":"Search"}</label>
              <input value={overviewSearch} onChange={e=>setOverviewSearch(e.target.value)} placeholder={lang==="zh"?"反饋內容、學生、老師、課程…":"Feedback text, student, teacher, course…"} style={{width:"100%",boxSizing:"border-box",padding:"7px 10px",borderRadius:6,border:"0.5px solid #CFD8DC",fontSize:12}}/>
            </div>
            <div style={{minWidth:120}}>
              <label style={{display:"block",fontSize:11,color:"#9E9E9E",marginBottom:3}}>{lang==="zh"?"老師":"Teacher"}</label>
              <select value={overviewTeacherId} onChange={e=>setOverviewTeacherId(e.target.value)} style={{width:"100%",boxSizing:"border-box",padding:"7px 8px",borderRadius:6,border:"0.5px solid #CFD8DC",fontSize:12,background:"#fff"}}>
                <option value="">{lang==="zh"?"全部老師":"All teachers"}</option>
                {allTeacherUsers.map(te=><option key={te.id} value={te.id}>{te.name}</option>)}
              </select>
            </div>
            <div style={{minWidth:120}}>
              <label style={{display:"block",fontSize:11,color:"#9E9E9E",marginBottom:3}}>{lang==="zh"?"狀態":"Status"}</label>
              <select value={overviewStatusFilter} onChange={e=>setOverviewStatusFilter(e.target.value)} style={{width:"100%",boxSizing:"border-box",padding:"7px 8px",borderRadius:6,border:"0.5px solid #CFD8DC",fontSize:12,background:"#fff"}}>
                <option value="all">{lang==="zh"?"全部":"All"}</option>
                <option value="none">{t.fbNotWritten}</option>
                <option value="pending">{STATUS_META.pending.label}</option>
                <option value="approved">{STATUS_META.approved.label}</option>
                <option value="rejected">{STATUS_META.rejected.label}</option>
              </select>
            </div>
          </div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16,alignItems:"center"}}>
            <button onClick={()=>setOverviewAllTime(v=>!v)} style={{padding:"6px 12px",borderRadius:6,fontSize:12,cursor:"pointer",border:overviewAllTime?"none":"0.5px solid #CFD8DC",background:overviewAllTime?"#1A6B8A":"transparent",color:overviewAllTime?"#fff":"#546E7A",fontWeight:overviewAllTime?600:400}}>
              {lang==="zh"?"不限日期":"All time"}
            </button>
            {!overviewAllTime && (
              <>
                <input type="date" value={overviewDateFrom} onChange={e=>setOverviewDateFrom(e.target.value)} style={{padding:"6px 8px",borderRadius:6,border:"0.5px solid #CFD8DC",fontSize:12}}/>
                <span style={{color:"#9E9E9E",fontSize:12}}>–</span>
                <input type="date" value={overviewDateTo} onChange={e=>setOverviewDateTo(e.target.value)} style={{padding:"6px 8px",borderRadius:6,border:"0.5px solid #CFD8DC",fontSize:12}}/>
              </>
            )}
            {/* Optional extra narrow-down by student — no longer required to see anything */}
            <div style={{position:"relative"}}>
              <button onClick={()=>setShowOverviewPicker(p=>!p)} style={{display:"flex",alignItems:"center",gap:6,padding:"6px 12px",borderRadius:6,border:"0.5px solid #CFD8DC",background:overviewStudents.size>0?"#EEF6FB":"#FFFFFF",color:"#172F39",fontSize:12,cursor:"pointer"}}>
                👤 {overviewStudents.size===0
                  ? (lang==="zh"?"篩選學生（選填）":"Filter by student (optional)")
                  : (lang==="zh"?`已選 ${overviewStudents.size} 位學生`:`${overviewStudents.size} student(s) selected`)}
                <span style={{fontSize:9,color:"#9E9E9E"}}>{showOverviewPicker?"▲":"▼"}</span>
              </button>
              {showOverviewPicker && (
                <div style={{position:"absolute",top:"calc(100% + 4px)",left:0,zIndex:50,background:"#FFFFFF",border:"0.5px solid #CFD8DC",borderRadius:8,boxShadow:"0 4px 16px rgba(23,47,57,0.15)",minWidth:220,maxHeight:300,overflowY:"auto",padding:"6px 0"}}>
                  {allStudentUsers.length===0 && <div style={{padding:"10px 12px",fontSize:12,color:"#9E9E9E"}}>—</div>}
                  {allStudentUsers.map(s=>(
                    <label key={s.id} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 12px",fontSize:12,color:"#546E7A",cursor:"pointer"}}>
                      <input type="checkbox" checked={overviewStudents.has(s.id)} onChange={()=>setOverviewStudents(prev=>{const n=new Set(prev); n.has(s.id)?n.delete(s.id):n.add(s.id); return n;})} style={{cursor:"pointer"}}/>
                      {s.name}
                    </label>
                  ))}
                  <div style={{padding:"6px 12px",borderTop:"0.5px solid #F0F0F0",marginTop:4,display:"flex",gap:6}}>
                    <button onClick={()=>setOverviewStudents(new Set())} style={{flex:1,padding:"6px",borderRadius:5,background:"transparent",border:"0.5px solid #CFD8DC",color:"#9E9E9E",fontSize:11,cursor:"pointer"}}>
                      {lang==="zh"?"清除":"Clear"}
                    </button>
                    <button onClick={()=>setShowOverviewPicker(false)} style={{flex:1,padding:"6px",borderRadius:5,background:"#1A6B8A",border:"none",color:"#fff",fontSize:11,cursor:"pointer"}}>
                      {lang==="zh"?"完成":"Done"}
                    </button>
                  </div>
                </div>
              )}
            </div>
            <span style={{fontSize:11,color:"#9E9E9E",marginLeft:"auto"}}>{lang==="zh"?`共 ${overviewRows.length} 筆`:`${overviewRows.length} result(s)`}</span>
          </div>

          {overviewWeekKeys.length===0 && (
            <div style={{textAlign:"center",padding:"2.5rem 0",color:"#9E9E9E"}}>
              <div style={{fontSize:28,marginBottom:8}}>📭</div>
              <div style={{fontSize:13}}>{t.fbOverviewNoSessions}</div>
            </div>
          )}

          {overviewWeekKeys.map(wk => {
            const items = overviewByWeek[wk].sort((a,b)=>a.date.localeCompare(b.date) || a.course.subject.localeCompare(b.course.subject));
            const monday = new Date(wk+"T00:00:00");
            const sunday = new Date(monday); sunday.setDate(monday.getDate()+6);
            const rangeLabel = `${fmtMD(monday)} – ${fmtMD(sunday)}`;
            return (
              <div key={wk} style={{marginBottom:"1.5rem"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                  <span style={{fontSize:13,fontWeight:600,color:"#172F39"}}>{t.fbWeekOf} {rangeLabel}</span>
                  <div style={{flex:1,height:"0.5px",background:"#E0E0E0"}}/>
                </div>
                {items.map((r,i) => {
                  const teacher = getUser(r.course.teacherId);
                  const student = getUser(r.studentId);
                  const meta = r.fb ? STATUS_META[r.fb.status] : null;
                  const matMeta = r.fb?.nextMaterialStatus ? getMaterialStatusMeta(r.fb) : null;
                  return (
                    <div key={i} style={{background:"#FFFFFF",border:`1px solid ${meta?meta.color+"33":"#E0E0E0"}`,borderRadius:9,padding:"10px 14px",marginBottom:8}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10,flexWrap:"wrap",marginBottom:r.fb?8:0}}>
                        <div>
                          <div style={{fontSize:12,fontWeight:600,color:"#172F39"}}>{r.course.subject}</div>
                          <div style={{fontSize:11,color:"#9E9E9E",marginTop:2}}>
                            {r.date} ({T[lang].days[r.dayIndex]}) · #{r.sessionNo} · {r.customStart || getCourseStartForDay(r.course, r.dayIndex)}
                          </div>
                          <div style={{fontSize:11,color:"#546E7A",marginTop:2}}>
                            {student?.name||"—"} · {teacher?.name||"—"}
                          </div>
                        </div>
                        {meta
                          ? <span style={{fontSize:10,background:meta.bg,color:meta.color,borderRadius:5,padding:"2px 9px",fontWeight:600,flexShrink:0}}>● {meta.label}</span>
                          : <span style={{fontSize:10,background:"#F5F5F5",color:"#9E9E9E",borderRadius:5,padding:"2px 9px",flexShrink:0}}>{t.fbNotWritten}</span>
                        }
                      </div>
                      {r.fb && (
                        <div style={{background:"#F5F5F5",borderRadius:7,padding:"9px 12px",fontSize:12,color:"#172F39",lineHeight:1.7,whiteSpace:"pre-wrap",marginBottom:matMeta?6:0}}>
                          {r.fb.text}
                        </div>
                      )}
                      {matMeta && (
                        <div style={{background:matMeta.bg,borderRadius:6,padding:"6px 10px",display:"flex",alignItems:"flex-start",gap:6}}>
                          <span style={{fontSize:12,flexShrink:0}}>{matMeta.icon}</span>
                          <div style={{fontSize:11,color:matMeta.color}}>
                            <strong>{matMeta.label}</strong><span style={{marginLeft:4}}>{matMeta.note}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </>
      )}
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

function BatchFeedbackModal({ users, courses, enrollments, setFeedback, lang, setToast, onClose, initialCourseId, currentUser }) {
  const t = T[lang];
  const [courseId, setCourseId] = useState(initialCourseId || courses[0]?.id || "");
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
        // Admin entering feedback is implicitly reviewing it too, so it's
        // auto-approved. An assistant doing the same still needs an admin to
        // actually review it before it reaches the student — same rule as
        // when an assistant fills it in one at a time via FeedbackModal.
        status: currentUser?.role==="assistant" ? "pending" : "approved",
        source: currentUser?.role==="assistant" ? "assistant" : "admin",
        createdAt: now, updatedAt: now,
        reviewedAt: currentUser?.role==="assistant" ? "" : now,
        reviewedBy: currentUser?.role==="assistant" ? "" : "admin",
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
// ─── Trial lesson application form (public, no login needed) ─────────────────
function TrialApplicationForm({ englishLevels, learningPurposes, onSubmit, onBack, lang }) {
  const [nameCn, setNameCn] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [otherContact, setOtherContact] = useState("");
  const [englishLevel, setEnglishLevel] = useState(englishLevels[0]?.id||"");
  const [learningPurpose, setLearningPurpose] = useState(learningPurposes[0]?.id||"");
  const [preferredSlot, setPreferredSlot] = useState("");
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const canSubmit = nameCn.trim() && nameEn.trim() && birthDate && preferredSlot;
  const iStyle = {width:"100%",boxSizing:"border-box",background:"#FAFAFA",border:"1px solid rgba(26,107,138,0.25)",borderRadius:7,color:"#172F39",padding:"8px 10px",fontSize:12,outline:"none"};
  const lStyle = {display:"block",fontSize:11,color:"#546E7A",marginBottom:5,marginTop:10};
  const PREFERRED_SLOTS = [
    {id:"weekday_day",   zh:"平日白天", en:"Weekday Daytime"},
    {id:"weekday_night", zh:"平日晚間", en:"Weekday Evening"},
    {id:"weekend_day",   zh:"假日白天", en:"Weekend Daytime"},
    {id:"weekend_night", zh:"假日晚間", en:"Weekend Evening"},
  ];

  const submit = () => {
    if (!canSubmit || submitted) return;
    onSubmit({ nameCn:nameCn.trim(), nameEn:nameEn.trim(), birthDate, phone:phone.trim(), email:email.trim(), otherContact:otherContact.trim(), englishLevel, learningPurpose, preferredSlot, note:note.trim() });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div style={{background:"#FFFFFF",borderRadius:13,border:"1px solid rgba(26,107,138,0.25)",boxShadow:"0 4px 24px rgba(23,47,57,0.15)",padding:"2rem 1.6rem",width:"100%",maxWidth:320,textAlign:"center"}}>
        <div style={{fontSize:40,marginBottom:10}}>✅</div>
        <div style={{fontSize:14,color:"#172F39",fontWeight:600,marginBottom:16}}>{lang==="zh"?"我們已經收到你的申請，會盡速聯繫通知你":"We've received your application — we'll contact you as soon as possible."}</div>
        <button onClick={onBack} style={{width:"100%",background:"#1A6B8A",border:"none",borderRadius:7,color:"#fff",padding:"9px",fontSize:13,fontWeight:500,cursor:"pointer"}}>{lang==="zh"?"返回登入":"Back to Login"}</button>
      </div>
    );
  }

  return (
    <div style={{background:"#FFFFFF",borderRadius:13,border:"1px solid rgba(26,107,138,0.25)",boxShadow:"0 4px 24px rgba(23,47,57,0.15)",padding:"1.6rem",width:"100%",maxWidth:320,maxHeight:"85vh",overflowY:"auto"}}>
      <div style={{fontSize:15,fontWeight:600,color:"#172F39",marginBottom:2}}>{lang==="zh"?"申請免費試聽":"Apply for a Free Trial Lesson"}</div>
      <div style={{fontSize:11,color:"#9E9E9E"}}>{lang==="zh"?"填妥資料後，我們會盡快與您聯繫":"Fill this out and we'll reach out soon"}</div>

      <label style={lStyle}>{lang==="zh"?"中文姓名 *":"Chinese Name *"}</label>
      <input style={iStyle} value={nameCn} onChange={e=>setNameCn(e.target.value)}/>

      <label style={lStyle}>{lang==="zh"?"英文姓名 *":"English Name *"}</label>
      <input style={iStyle} value={nameEn} onChange={e=>setNameEn(e.target.value)}/>

      <label style={lStyle}>{lang==="zh"?"出生年月日 *":"Date of Birth *"}</label>
      <input type="date" style={iStyle} value={birthDate} onChange={e=>setBirthDate(e.target.value)}/>

      <label style={lStyle}>{lang==="zh"?"聯絡電話（選填）":"Contact Phone (optional)"}</label>
      <input style={iStyle} value={phone} onChange={e=>setPhone(e.target.value)} placeholder="09xx-xxx-xxx"/>

      <label style={lStyle}>{lang==="zh"?"Email（選填）":"Email (optional)"}</label>
      <input type="email" style={iStyle} value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/>

      <label style={lStyle}>{lang==="zh"?"其他聯繫方式（選填）":"Other Contact Method (optional)"}</label>
      <input style={iStyle} value={otherContact} onChange={e=>setOtherContact(e.target.value)} placeholder={lang==="zh"?"例：LINE ID、微信":"e.g. LINE ID, WeChat"}/>

      <label style={lStyle}>{lang==="zh"?"英文程度":"English Level"}</label>
      <select style={iStyle} value={englishLevel} onChange={e=>setEnglishLevel(e.target.value)}>
        {englishLevels.map(l=><option key={l.id} value={l.id}>{lang==="zh"?l.zh:l.en}</option>)}
      </select>

      <label style={lStyle}>{lang==="zh"?"學習英文目的":"Purpose of Learning English"}</label>
      <select style={iStyle} value={learningPurpose} onChange={e=>setLearningPurpose(e.target.value)}>
        {learningPurposes.map(p=><option key={p.id} value={p.id}>{lang==="zh"?p.zh:p.en}</option>)}
      </select>

      <label style={lStyle}>{lang==="zh"?"傾向的試聽＆上課時段 *":"Preferred Trial & Class Time *"}</label>
      <select style={iStyle} value={preferredSlot} onChange={e=>setPreferredSlot(e.target.value)}>
        <option value="">{lang==="zh"?"—請選擇—":"—Select—"}</option>
        {PREFERRED_SLOTS.map(s=><option key={s.id} value={s.id}>{lang==="zh"?s.zh:s.en}</option>)}
      </select>

      <label style={lStyle}>{lang==="zh"?"備註（選填）":"Notes (optional)"}</label>
      <textarea style={{...iStyle,minHeight:50,resize:"vertical",fontFamily:"inherit"}} value={note} onChange={e=>setNote(e.target.value)}/>

      <button onClick={submit} disabled={!canSubmit} style={{width:"100%",marginTop:16,background:canSubmit?"#1A6B8A":"#CFD8DC",border:"none",borderRadius:7,color:"#fff",padding:"9px",fontSize:13,fontWeight:500,cursor:canSubmit?"pointer":"not-allowed"}}>
        {lang==="zh"?"送出申請":"Submit Application"}
      </button>
      <button onClick={onBack} style={{width:"100%",marginTop:8,background:"transparent",border:"none",color:"#9E9E9E",padding:"6px",fontSize:12,cursor:"pointer"}}>
        {lang==="zh"?"返回登入":"Back to Login"}
      </button>
    </div>
  );
}

function LoginPage({ onLogin, lang, setLang, users, setUsers, introText, trialApplications, setTrialApplications, englishLevels, learningPurposes }) {
  const t=T[lang];
  const [u,setU]=useState("");const [p,setP]=useState("");const [err,setErr]=useState("");
  const [checking,setChecking]=useState(false);
  const [showTrial,setShowTrial]=useState(false);
  const go=async ()=>{
    const f=users.find(x=>x.username===u);
    if(!f){setErr(t.loginError);return;}
    setChecking(true);
    const ok = await verifyPassword(p, f);
    setChecking(false);
    if(!ok){setErr(t.loginError);return;}
    // Transparent migration: this account's password just checked out against
    // the OLD plaintext field — upgrade it to a salted hash now. The person's
    // actual password never changes, only how it's stored; they notice nothing.
    if(!f.passwordHash){
      hashPassword(p).then(({hash,salt})=>{
        setUsers(prev=>prev.map(x=>x.id===f.id?{...x,passwordHash:hash,passwordSalt:salt,password:undefined}:x));
      });
    }
    setErr("");onLogin(f);
  };
  const submitTrial = (data) => {
    setTrialApplications(prev => [...prev, { id:genId(), ...data, status:"pending", submittedAt:new Date().toISOString() }]);
  };
  return (
    <div style={{minHeight:"100vh",background:"#172F39",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"system-ui, -apple-system, sans-serif",padding:"2rem"}}>
      <button onClick={()=>setLang(lang==="zh"?"en":"zh")} style={{position:"absolute",top:"1.5rem",right:"1.5rem",background:"rgba(26,107,138,0.15)",border:"1px solid rgba(26,107,138,0.4)",color:"#1A6B8A",borderRadius:"6px",padding:"6px 14px",cursor:"pointer",fontSize:"13px"}}>{t.langToggle}</button>
      <div style={{marginBottom:"1.25rem",textAlign:"center"}}>
        <div style={{width:56,height:56,borderRadius:14,background:"#1A6B8A",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 1rem",fontSize:26}}>📚</div>
        <h1 style={{color:"#FFFFFF",fontSize:22,fontWeight:500,margin:0}}>{t.appName}</h1>
      </div>

      {/* ── Admin-editable intro / announcement block ── */}
      {introText && introText.trim() && !showTrial && (
        <div style={{maxWidth:420,width:"100%",textAlign:"center",color:"rgba(255,255,255,0.75)",fontSize:13,lineHeight:1.7,marginBottom:"1.5rem",padding:"0 1rem",whiteSpace:"pre-wrap"}}>
          {introText}
        </div>
      )}

      {showTrial ? (
        <TrialApplicationForm englishLevels={englishLevels} learningPurposes={learningPurposes} onSubmit={submitTrial} onBack={()=>setShowTrial(false)} lang={lang}/>
      ) : (
        <>
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
            <button onClick={go} disabled={checking} style={{width:"100%",background:checking?"#9E9E9E":"#1A6B8A",border:"none",borderRadius:7,color:"#fff",padding:"9px",fontSize:13,fontWeight:500,cursor:checking?"not-allowed":"pointer"}}>{checking?(lang==="zh"?"驗證中…":"Checking…"):t.loginBtn}</button>
            <p style={{color:"rgba(255,255,255,0.5)",fontSize:10,textAlign:"center",marginTop:"0.8rem",marginBottom:0}}>admin/admin123 · teacher1/pass123 · student1/pass123</p>
          </div>
          <button onClick={()=>setShowTrial(true)} style={{marginTop:16,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.25)",borderRadius:8,color:"#fff",padding:"9px 20px",fontSize:13,cursor:"pointer",fontWeight:500}}>
            📝 {lang==="zh"?"申請免費試聽課程":"Apply for a Free Trial Lesson"}
          </button>
        </>
      )}
      <div style={{position:"fixed",bottom:10,right:14,color:"rgba(255,255,255,0.25)",fontSize:10,letterSpacing:0.3}}>{APP_VERSION}</div>
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
// `confirmedOverride` used to REPLACE the live calculation entirely, which was
// the bug: once admin confirmed a total, the system's ongoing session count
// never got added on top of it again. It's now treated as a one-time baseline
// that's ADDED to the live, ever-growing system count — admin enters prior
// history once, and everything the platform tracks afterward keeps
// accumulating on top of it automatically.
function calcStudentSessions(studentId, enrollments, attendance, courses, confirmedOverride) {
  const today = new Date().toISOString().slice(0,10);
  let count = 0;
  enrollments.filter(e=>e.studentId===studentId).forEach(enr=>{
    const course = courses.find(c=>c.id===enr.courseId);
    if (!course) return;
    const sessVal = course.duration===25 ? 1 : 2; // 25min=1, 50min=2
    (enr.scheduledDates||[]).forEach(s=>{
      // Only count sessions whose actual end time has passed (not just "today or earlier")
      if (!isSessionOver(s.date, resolveSessionStart(course, s), course.duration)) return;
      const att = attendance.find(a=>a.enrollmentId===enr.id&&a.date===s.date);
      if (att?.type==="absent") return; // deducted
      count += sessVal;
    });
  });
  const baseline = (confirmedOverride !== undefined && confirmedOverride !== null && confirmedOverride !== "")
    ? (parseInt(confirmedOverride)||0) : 0;
  const total = count + baseline;
  // full/total = live system count + one-time baseline (half kept at 0 for API compat)
  return { full: total, half: 0, total: total, systemOnly: count, baseline };
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

// ─── Student self-submitted materials ─────────────────────────────────────────
// Only shown to students the admin has explicitly opted in (canSubmitMaterials).
// Lists eligible upcoming sessions (>24h away, near→far), one row each, with
// its own independent save/submit — never a big batch submit. Every
// submission goes to pending review; nothing reaches the teacher until an
// admin/assistant approves it.
function StudentMaterialSubmitPanel({ currentUser, courses, enrollments, materials, attendance, absences, studentMatSubs, setStudentMatSubs, lang, setToast }) {
  const [drafts, setDrafts] = useState({}); // key -> {title, url}
  const keyFor = (s) => `${s.enr.id}_${s.date}`;
  const draftFor = (s) => drafts[keyFor(s)] || {title:"", url:""};
  const setDraft = (s, patch) => setDrafts(d=>({...d, [keyFor(s)]: {...draftFor(s), ...patch}}));

  const mySessions = enrollments
    .filter(enr => enr.studentId === currentUser.id && enr.status!=="discontinued")
    .flatMap(enr => {
      const course = courses.find(c => c.id === enr.courseId);
      if (!course || course.status==="archived") return [];
      return (enr.scheduledDates||[]).map(s => ({
        course, enr, date: s.date, dayIndex: s.dayIndex,
        start: s.customStart || getCourseStartForDay(course, s.dayIndex),
        sessionNo: s.sessionNo,
      }));
    })
    .filter(s => hoursUntilSession(s.date, s.start) > 24)
    .filter(s => {
      const attRec = (attendance||[]).find(a=>a.enrollmentId===s.enr.id && a.date===s.date);
      if (attRec && attRec.type!=="other") return false;
      const selfAbs = (absences||[]).find(a=>a.courseId===s.course.id && a.dateStr===s.date);
      if (selfAbs) return false;
      return true;
    })
    .sort((a,b) => a.date.localeCompare(b.date) || a.start.localeCompare(b.start));

  const submitFor = (s) => {
    const draft = draftFor(s);
    if (!draft.title.trim() || !draft.url.trim()) return;
    const existing = studentMatSubs.find(x=>x.enrollmentId===s.enr.id && x.date===s.date && x.studentId===currentUser.id);
    const rec = {
      id: existing?.id || genId(),
      courseId: s.course.id, enrollmentId: s.enr.id, studentId: currentUser.id,
      date: s.date, dayIndex: s.dayIndex,
      title: draft.title.trim(), url: draft.url.trim(),
      status: "pending",
      submittedAt: new Date().toISOString(),
      reviewedAt: "", reviewedBy: "", reviewNote: "",
    };
    setStudentMatSubs(prev => existing ? prev.map(x=>x.id===existing.id?rec:x) : [...(prev||[]), rec]);
    setDrafts(d=>{const n={...d}; delete n[keyFor(s)]; return n;});
    setToast(lang==="zh"?"已送出，等待審核":"Submitted — waiting for review");
  };

  return (
    <div style={{padding:"1.25rem 1rem"}}>
      <h3 style={{fontSize:15,fontWeight:600,color:"#172F39",margin:"0 0 4px"}}>{lang==="zh"?"自行準備教材":"Submit Your Own Material"}</h3>
      <p style={{fontSize:12,color:"#9E9E9E",margin:"0 0 1rem",lineHeight:1.6}}>
        {lang==="zh"
          ? "只能為 24 小時以後的課堂準備教材（太臨時老師會來不及看）。送出後需要管理員或助教審核通過，老師才看得到。"
          : "You can only submit material for a session more than 24 hours away (anything sooner is too last-minute for the teacher). Submissions need admin/assistant approval before the teacher can see them."}
      </p>
      {mySessions.length===0 ? (
        <div style={{textAlign:"center",padding:"2.5rem 0",color:"#9E9E9E"}}><div style={{fontSize:28,marginBottom:8}}>📭</div><div style={{fontSize:13}}>{lang==="zh"?"目前沒有符合條件（24小時以後）的課堂":"No sessions currently more than 24 hours away"}</div></div>
      ) : mySessions.map((s,i) => {
        const key = keyFor(s);
        const existingSub = studentMatSubs.find(x=>x.enrollmentId===s.enr.id && x.date===s.date && x.studentId===currentUser.id);
        const existingMats = (materials||[]).filter(m=>m.courseId===s.course.id && m.date===s.date);
        const draft = draftFor(s);
        const isEditing = !existingSub || existingSub.status==="rejected";
        return (
          <div key={i} style={{background:"#FFFFFF",border:"1px solid #E0E0E0",borderRadius:10,padding:"12px 14px",marginBottom:10}}>
            <div style={{fontSize:12,fontWeight:600,color:"#172F39"}}>{s.course.subject}</div>
            <div style={{fontSize:11,color:"#9E9E9E",marginTop:2,marginBottom:8}}>{s.date} ({T[lang].days[s.dayIndex]}) · {s.start} · #{s.sessionNo}</div>

            {existingMats.length>0 && (
              <div style={{background:"#FFF3E0",borderRadius:6,padding:"6px 10px",marginBottom:8,fontSize:11,color:"#E65100"}}>
                ⚠️ {lang==="zh"?"老師已經有這堂的教材了，你送出的會被當作補充，由管理員/助教審核後決定新增或取代":"The teacher already has material for this class — yours will be treated as a supplement; admin/assistant will decide whether to add it or replace the existing one"}
              </div>
            )}

            {existingSub && existingSub.status==="pending" && (
              <div style={{background:"#FFF3E0",borderRadius:7,padding:"9px 11px",fontSize:12,color:"#E65100"}}>
                ⏳ {lang==="zh"?"待審核":"Pending review"}：{existingSub.title}
                <div style={{fontSize:11,color:"#9E9E9E",wordBreak:"break-all",marginTop:2}}>{existingSub.url}</div>
              </div>
            )}
            {existingSub && existingSub.status==="approved" && (
              <div style={{background:"#E8F5E9",borderRadius:7,padding:"9px 11px",fontSize:12,color:"#2E7D32"}}>
                ✓ {lang==="zh"?"已核准":"Approved"}：{existingSub.title}
                <div style={{fontSize:11,color:"#9E9E9E",wordBreak:"break-all",marginTop:2}}>{existingSub.url}</div>
              </div>
            )}
            {existingSub && existingSub.status==="rejected" && (
              <div style={{background:"#FFEBEE",borderRadius:7,padding:"9px 11px",fontSize:12,color:"#D32F2F",marginBottom:8}}>
                ✕ {lang==="zh"?"已退回":"Rejected"}{existingSub.reviewNote?`：${existingSub.reviewNote}`:""}
                <div style={{fontSize:11,color:"#9E9E9E",marginTop:2}}>{lang==="zh"?"可以修改後重新送出":"You can edit and resubmit below"}</div>
              </div>
            )}

            {isEditing && (
              <div style={{marginTop:existingSub?8:0}}>
                <input
                  value={draft.title}
                  onChange={e=>setDraft(s,{title:e.target.value})}
                  placeholder={lang==="zh"?"教材標題":"Material title"}
                  style={{width:"100%",boxSizing:"border-box",padding:"7px 9px",borderRadius:6,border:"0.5px solid #CFD8DC",fontSize:12,marginBottom:6}}
                />
                <input
                  value={draft.url}
                  onChange={e=>setDraft(s,{url:e.target.value})}
                  placeholder="https://..."
                  style={{width:"100%",boxSizing:"border-box",padding:"7px 9px",borderRadius:6,border:"0.5px solid #CFD8DC",fontSize:12,marginBottom:8}}
                />
                <button onClick={()=>submitFor(s)} disabled={!draft.title.trim()||!draft.url.trim()} style={{padding:"6px 16px",borderRadius:6,background:(draft.title.trim()&&draft.url.trim())?"#1A6B8A":"#E0E0E0",border:"none",color:(draft.title.trim()&&draft.url.trim())?"#fff":"#9E9E9E",fontSize:12,fontWeight:600,cursor:(draft.title.trim()&&draft.url.trim())?"pointer":"not-allowed"}}>
                  {lang==="zh"?"送出":"Submit"}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Teacher Students Panel ───────────────────────────────────────────────────
function TeacherStudentsPanel({ currentUser, users, courses, enrollments, attendance, lang, dirEntries }) {
  const t = T[lang];
  const [expandedId, setExpandedId] = useState(null);

  const myCourses = courses.filter(c=>c.teacherId===currentUser.id && c.status!=="archived");
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
                    {c.subject} · {formatCourseScheduleSummary(c,lang)}
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
        : isSessionOver(s.date, resolveSessionStart(course, s), course.duration) ? "completed" : "upcoming";
      sessions.push({
        date: s.date,
        dayIndex: s.dayIndex,
        sessionNo: s.sessionNo,
        customStart: s.customStart,
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
                <span style={{fontSize:11,color:"#9E9E9E"}}>{s.customStart || getCourseStartForDay(s.course, s.dayIndex)}</span>
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
                        <div style={{fontSize:10,color:"#9E9E9E"}}>{dayLabel(s.dayIndex)} {s.customStart||getCourseStartForDay(s.course,s.dayIndex)}–{addMins(s.customStart||getCourseStartForDay(s.course,s.dayIndex),s.course.duration)}</div>
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
// ─── Teacher Availability ──────────────────────────────────────────────────────
// Teachers declare which half-hour slots (9:00–23:00) they can be scheduled for,
// limited to THIS WEEK and NEXT WEEK only. Changes are staged locally and must be
// explicitly confirmed (with a plain-language summary) before they're saved. Once
// a slot is opened, cancelling it within 12 hours of its start time is locked
// (admin can override).
const AVAILABILITY_SLOTS = Array.from({length:28}, (_,i)=>{
  const totalMin = 9*60 + i*30; // 9:00 .. 22:30, 30-min steps, last slot ends 23:00
  const h = Math.floor(totalMin/60), m = totalMin%60;
  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`;
});

// Hours between now and a given day/time slot's start (can be negative if past)
function hoursUntilSlotTime(weekDates, dayIndex, timeStr) {
  const [h,m] = timeStr.split(":").map(Number);
  const start = new Date(weekDates[dayIndex]);
  start.setHours(h, m, 0, 0);
  return (start - new Date()) / 3600000;
}

// Merge a sorted list of contiguous 30-min slot start-times ("HH:MM") into
// human-readable ranges, e.g. ["20:00","20:30"] → [["20:00","21:00"]]
function mergeSlotsToRanges(times) {
  const sorted = [...times].sort();
  const ranges = [];
  let rangeStart = null, rangeEnd = null;
  sorted.forEach(t => {
    const endT = addMins(t, 30);
    if (rangeStart === null) { rangeStart = t; rangeEnd = endT; }
    else if (t === rangeEnd) { rangeEnd = endT; }
    else { ranges.push([rangeStart, rangeEnd]); rangeStart = t; rangeEnd = endT; }
  });
  if (rangeStart !== null) ranges.push([rangeStart, rangeEnd]);
  return ranges;
}

// Reusable click grid — used by both the teacher's own page and the admin's viewer/editor.
// weekOffset is restricted to 0 (this week) or 1 (next week) by the caller.
function timeToMinutes(t) { const [h,m] = t.split(":").map(Number); return h*60+m; }

// True if a given half-hour grid slot overlaps one of this teacher's existing
// fixed weekly courses (course.days/start/duration) — these are locked/unselectable
// on the availability grid since the teacher is already committed to them.
function findFixedCourseForSlot(teacherId, courses, dayIndex, time) {
  const slotStart = timeToMinutes(time);
  const slotEnd = slotStart + 30;
  return courses.find(c => {
    if (c.teacherId !== teacherId) return false;
    if (!getCourseDays(c).includes(dayIndex)) return false;
    const cStartTime = getCourseStartForDay(c, dayIndex);
    const cStart = timeToMinutes(cStartTime);
    const cEnd = cStart + (c.duration||50);
    return slotStart < cEnd && cStart < slotEnd; // overlap
  }) || null;
}

// Scan for any leave/absence evidence covering a fixed course on a specific date —
// checks both self-reported absences and admin-recorded attendance entries.
function scanLeaveForCourseDate(course, date, absences, attendance, enrollments) {
  const results = [];
  (absences||[]).forEach(a => {
    if (a.courseId===course.id && a.dateStr===date) {
      results.push({ type: a.requesterRole==="teacher"?"teacher_leave":"student_leave", note: a.note||a.reason||"", source:"self" });
    }
  });
  const courseEnrollments = (enrollments||[]).filter(e=>e.courseId===course.id);
  (attendance||[]).forEach(a => {
    if (a.date===date && courseEnrollments.some(e=>e.id===a.enrollmentId)) {
      results.push({ type:a.type, note:a.note||"", source:"admin" });
    }
  });
  return results;
}

// ─── Force-Open confirmation modal (admin only) ───────────────────────────────
function ForceOpenModal({ course, date, dayIndex, users, lang, absences, attendance, enrollments, onConfirm, onClose }) {
  const t = T[lang];
  const teacher = users.find(u=>u.id===course.teacherId);
  const student = users.find(u=>u.id===course.studentId);
  const startTime = getCourseStartForDay(course, dayIndex);
  const endTime = addMins(startTime, course.duration);
  const [reason, setReason] = useState("");

  const scanResults = scanLeaveForCourseDate(course, date, absences, attendance, enrollments);
  const TYPE_LABEL = {
    student_leave: lang==="zh"?"學生請假":"Student Leave",
    teacher_leave: lang==="zh"?"老師請假":"Teacher Leave",
    excused:       lang==="zh"?"正規請假":"Excused Leave",
    absent:        lang==="zh"?"缺勤":"Absent",
    other:         lang==="zh"?"備註":"Note",
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9400,padding:"1rem"}}>
      <div style={{background:"#FFFFFF",borderRadius:16,width:"100%",maxWidth:420,boxSizing:"border-box",boxShadow:"0 8px 36px rgba(23,47,57,0.2)",overflow:"hidden"}}>
        <div style={{background:"#172F39",padding:"13px 18px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:14,fontWeight:600,color:"#fff"}}>🔓 {t.forceOpenTitle}</span>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.15)",border:"none",borderRadius:"50%",width:28,height:28,cursor:"pointer",color:"#fff",fontSize:16}}>×</button>
        </div>
        <div style={{padding:"16px 18px"}}>
          <p style={{fontSize:12,color:"#9E9E9E",margin:"0 0 12px",lineHeight:1.6}}>{t.forceOpenDesc}</p>

          {/* Course info */}
          <div style={{background:"#F5F5F5",borderRadius:8,padding:"10px 13px",marginBottom:12,fontSize:12,color:"#546E7A",lineHeight:1.7}}>
            <div style={{fontWeight:600,color:"#172F39",fontSize:13}}>{course.subject}</div>
            <div>{date} ({T[lang].days[dayIndex]}) · {startTime}–{endTime}</div>
            <div>{lang==="zh"?"老師":"Teacher"}: {teacher?.name||"—"} · {lang==="zh"?"學生":"Student"}: {student?.name||"—"}</div>
          </div>

          {/* Leave scan result */}
          {scanResults.length>0 ? (
            <div style={{background:"#E8F5E9",border:"0.5px solid #C8E6C9",borderRadius:8,padding:"10px 13px",marginBottom:14}}>
              <div style={{fontSize:12,fontWeight:600,color:"#2E7D32",marginBottom:6}}>{t.forceOpenScanFound}</div>
              {scanResults.map((r,i)=>(
                <div key={i} style={{fontSize:11,color:"#2E7D32",marginBottom:2}}>
                  • {TYPE_LABEL[r.type]||r.type}{r.note?`：${r.note}`:""}
                </div>
              ))}
            </div>
          ) : (
            <div style={{background:"#FFF3E0",border:"0.5px solid #FFE0B2",borderRadius:8,padding:"10px 13px",marginBottom:14}}>
              <div style={{fontSize:12,color:"#E65100"}}>{t.forceOpenScanNone}</div>
            </div>
          )}

          <label style={{fontSize:12,color:"#546E7A",display:"block",marginBottom:5}}>{t.forceOpenReason}</label>
          <input
            value={reason}
            onChange={e=>setReason(e.target.value)}
            placeholder={lang==="zh"?"例：學生臨時請假，開放老師空堂":"e.g. Student took sudden leave, opening this slot"}
            style={{width:"100%",boxSizing:"border-box",padding:"8px 10px",borderRadius:6,border:"0.5px solid #CFD8DC",background:"#FFFFFF",color:"#172F39",fontSize:13,marginBottom:16}}
          />

          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>onConfirm(reason.trim())} style={{flex:1,padding:"10px",borderRadius:7,background:"#1A6B8A",border:"none",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer"}}>
              ✓ {t.forceOpenConfirm}
            </button>
            <button onClick={onClose} style={{padding:"10px 16px",borderRadius:7,background:"transparent",border:"0.5px solid #CFD8DC",color:"#546E7A",fontSize:13,cursor:"pointer"}}>
              {t.cancel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TeacherAvailabilityGrid({ teacherId, availability, setAvailability, courses, lang, isAdmin, setToast, weekOffset, setWeekOffset, overrides, setOverrides, users, absences, attendance, enrollments, readOnly }) {
  const t = T[lang];
  const weekDates = getWeekDates(weekOffset);
  const [pending, setPending] = useState({}); // key `${date}_${time}` -> "open" | "close"
  const [showConfirm, setShowConfirm] = useState(false);
  const [forceOpenTarget, setForceOpenTarget] = useState(null); // {course, date, dayIndex} pending force-open confirmation

  const mySlots = availability.filter(a=>a.teacherId===teacherId);
  const keyOf = (date, time) => `${date}_${time}`;
  const isCommittedOpen = (dayIndex, time) => mySlots.some(a=>a.dayIndex===dayIndex && a.time===time && a.date===fmtYMD(weekDates[dayIndex]));
  const hasOverride = (courseId, date) => (overrides||[]).some(o=>o.courseId===courseId && o.date===date);
  const weekOverrides = (overrides||[]).filter(o=>o.teacherId===teacherId && weekDates.some(d=>fmtYMD(d)===o.date));

  const confirmForceOpen = (reason) => {
    const {course, date, dayIndex} = forceOpenTarget;
    setOverrides(prev => [...prev, {id:genId(), teacherId, courseId:course.id, date, dayIndex, reason, openedBy:"admin", openedAt:new Date().toISOString()}]);
    setForceOpenTarget(null);
    setToast(t.forceOpenSuccess);
  };
  const revokeOverride = (overrideId) => {
    setOverrides(prev => prev.filter(o=>o.id!==overrideId));
    setToast(t.forceOpenRevoked);
  };

  // A slot is truly locked-as-fixed only if it belongs to a course AND no
  // admin override has freed that specific course+date combination.
  const isEffectivelyFixed = (dayIndex, time) => {
    const course = findFixedCourseForSlot(teacherId, courses, dayIndex, time);
    if (!course) return null;
    const date = fmtYMD(weekDates[dayIndex]);
    return hasOverride(course.id, date) ? null : course;
  };

  // Clear any staged-but-unsaved changes whenever the visible week changes,
  // so pending edits never silently carry over to a different week.
  useEffect(()=>{ setPending({}); setShowConfirm(false); }, [weekOffset]);

  const toggleCell = (dayIndex, time) => {
    if (readOnly) return; // view-only — assistant can see the grid but not change it
    if (isEffectivelyFixed(dayIndex, time)) return; // fixed course (no override) — not selectable
    const hrs = hoursUntilSlotTime(weekDates, dayIndex, time);
    if (hrs <= 0) return; // slot already passed — no-op
    const date = fmtYMD(weekDates[dayIndex]);
    const key = keyOf(date, time);
    const committedOpen = isCommittedOpen(dayIndex, time);
    const existingPending = pending[key];

    if (existingPending) {
      // Clicking again on a staged cell reverts it back to its committed state
      setPending(p => { const n = {...p}; delete n[key]; return n; });
      return;
    }
    if (committedOpen) {
      // Staging a cancellation — locked within 12h unless admin
      if (!isAdmin && hrs < 12) { setToast(t.availabilityLockToast); return; }
      setPending(p => ({...p, [key]: "close"}));
    } else {
      setPending(p => ({...p, [key]: "open"}));
    }
  };

  const setWholeDay = (dayIndex, open) => {
    const date = fmtYMD(weekDates[dayIndex]);
    const updates = {};
    AVAILABILITY_SLOTS.forEach(time => {
      if (isEffectivelyFixed(dayIndex, time)) return; // skip fixed course slots (unless overridden)
      const hrs = hoursUntilSlotTime(weekDates, dayIndex, time);
      if (hrs <= 0) return;
      const committedOpen = isCommittedOpen(dayIndex, time);
      const key = keyOf(date, time);
      if (open && !committedOpen) updates[key] = "open";
      if (!open && committedOpen && (isAdmin || hrs >= 12)) updates[key] = "close";
    });
    setPending(p => ({...p, ...updates}));
  };

  const pendingCount = Object.keys(pending).length;

  // Group staged changes into a readable preview: per date+action, merged into ranges
  const buildPreview = () => {
    const byDateAction = {}; // `${date}|${action}` -> [times]
    Object.entries(pending).forEach(([key, action]) => {
      const [date, time] = key.split("_");
      const k = `${date}|${action}`;
      if (!byDateAction[k]) byDateAction[k] = [];
      byDateAction[k].push(time);
    });
    const rows = [];
    Object.entries(byDateAction).forEach(([k, times]) => {
      const [date, action] = k.split("|");
      mergeSlotsToRanges(times).forEach(([s,e]) => rows.push({date, action, start:s, end:e}));
    });
    rows.sort((a,b)=> a.date===b.date ? a.start.localeCompare(b.start) : a.date.localeCompare(b.date));
    return rows;
  };

  const confirmSave = () => {
    let next = [...availability];
    Object.entries(pending).forEach(([key, action]) => {
      const [date, time] = key.split("_");
      const dayIndex = weekDates.findIndex(d=>fmtYMD(d)===date);
      if (action === "open") {
        if (!next.some(a=>a.teacherId===teacherId && a.date===date && a.time===time)) {
          next.push({id:genId(), teacherId, date, dayIndex, time, createdAt:new Date().toISOString()});
        }
      } else {
        next = next.filter(a=>!(a.teacherId===teacherId && a.date===date && a.time===time));
      }
    });
    setAvailability(next);
    setPending({});
    setShowConfirm(false);
    setToast(t.availabilitySaved);
  };

  const preview = showConfirm ? buildPreview() : [];

  return (
    <div>
      {/* Week selector — restricted to this week / next week only */}
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12,flexWrap:"wrap"}}>
        {[0,1].map(wo=>(
          <button key={wo} onClick={()=>setWeekOffset(wo)} style={{padding:"6px 16px",borderRadius:7,border:weekOffset===wo?"none":"0.5px solid #CFD8DC",background:weekOffset===wo?"#1A6B8A":"transparent",color:weekOffset===wo?"#fff":"#546E7A",fontSize:13,fontWeight:weekOffset===wo?600:400,cursor:"pointer"}}>
            {wo===0?t.availabilityThisWeek:t.availabilityNextWeek}
          </button>
        ))}
        <span style={{fontSize:11,color:"#9E9E9E"}}>({fmtMD(weekDates[0])} – {fmtMD(weekDates[6])})</span>
      </div>

      {/* Legend */}
      <div style={{display:"flex",gap:14,alignItems:"center",marginBottom:12,flexWrap:"wrap",fontSize:11,color:"#546E7A"}}>
        <span style={{display:"flex",alignItems:"center",gap:5}}><span style={{width:12,height:12,borderRadius:3,background:"#4CAF50",display:"inline-block"}}/>{t.availabilityLegendOpen}</span>
        <span style={{display:"flex",alignItems:"center",gap:5}}><span style={{width:12,height:12,borderRadius:3,background:"#FFFFFF",border:"1px solid #E0E0E0",display:"inline-block"}}/>{t.availabilityLegendClosed}</span>
        <span style={{display:"flex",alignItems:"center",gap:5}}><span style={{width:12,height:12,borderRadius:3,background:"#C8E6C9",border:"1px dashed #4CAF50",display:"inline-block"}}/>{lang==="zh"?"待儲存（開）":"Pending (open)"}</span>
        <span style={{display:"flex",alignItems:"center",gap:5}}><span style={{width:12,height:12,borderRadius:3,background:"#FFCDD2",border:"1px dashed #D32F2F",display:"inline-block"}}/>{lang==="zh"?"待儲存（關）":"Pending (close)"}</span>
        <span style={{display:"flex",alignItems:"center",gap:5}}>🔒 {t.availabilityLegendLocked}</span>
        <span style={{display:"flex",alignItems:"center",gap:5}}><span style={{width:12,height:12,borderRadius:3,background:"#1A6B8A",display:"inline-block"}}/>{t.availabilityLegendFixed}</span>
        {isAdmin && <span style={{color:"#7B1FA2"}}>⚡ {t.availabilityAdminOverride}</span>}
      </div>

      {/* Grid */}
      <div style={{overflowX:"auto"}}>
        <div style={{minWidth:560}}>
          {/* Day headers */}
          <div style={{display:"grid",gridTemplateColumns:"48px repeat(7,1fr)",gap:2,marginBottom:2,position:"sticky",top:0,zIndex:1,background:"#FFFFFF"}}>
            <div/>
            {T[lang].days.map((d,i)=>(
              <div key={i} style={{textAlign:"center",padding:"4px 2px"}}>
                <div style={{fontSize:11,fontWeight:600,color:"#172F39"}}>{T[lang].daysShort[i]}</div>
                <div style={{fontSize:9,color:"#9E9E9E"}}>{fmtMD(weekDates[i])}</div>
              </div>
            ))}
          </div>
          {/* Half-hour rows */}
          <div style={{maxHeight:480,overflowY:"auto"}}>
            {AVAILABILITY_SLOTS.map(time=>(
              <div key={time} style={{display:"grid",gridTemplateColumns:"48px repeat(7,1fr)",gap:2,marginBottom:2}}>
                <div style={{fontSize:9,color:"#9E9E9E",textAlign:"right",paddingRight:6,paddingTop:5}}>{time.endsWith(":00")?time:""}</div>
                {T[lang].days.map((_,dayIndex)=>{
                  const date = fmtYMD(weekDates[dayIndex]);
                  const rawFixedCourse = findFixedCourseForSlot(teacherId, courses, dayIndex, time);
                  const overridden = rawFixedCourse && hasOverride(rawFixedCourse.id, date);
                  const fixedCourse = overridden ? null : rawFixedCourse; // overridden slots fall through to normal rendering
                  const hrs = hoursUntilSlotTime(weekDates, dayIndex, time);
                  const past = hrs<=0;
                  const committedOpen = isCommittedOpen(dayIndex, time);
                  const pendingAction = pending[keyOf(date, time)];
                  const displayOpen = pendingAction ? pendingAction==="open" : committedOpen;
                  const locked = committedOpen && !pendingAction && !isAdmin && hrs<12;

                  const fixedCourseStart = fixedCourse ? getCourseStartForDay(fixedCourse, dayIndex) : null;
                  // Fixed courses take absolute visual + interaction priority — not
                  // selectable regardless of past/lock/pending state, EXCEPT admin
                  // can click to open the force-open flow (e.g. student took leave).
                  if (fixedCourse) {
                    return (
                      <button
                        key={dayIndex}
                        disabled={!isAdmin}
                        onClick={isAdmin ? ()=>setForceOpenTarget({course:fixedCourse, date, dayIndex}) : undefined}
                        title={isAdmin
                          ? `${fixedCourse.subject} (${fixedCourseStart}–${addMins(fixedCourseStart,fixedCourse.duration)}) — ${lang==="zh"?"點擊強制開放":"click to force-open"}`
                          : `${fixedCourse.subject} (${fixedCourseStart}–${addMins(fixedCourseStart,fixedCourse.duration)})`}
                        style={{
                          height:20, borderRadius:3, border:"1px solid #1A6B8A",
                          background:"#1A6B8A", cursor:isAdmin?"pointer":"not-allowed",
                          display:"flex",alignItems:"center",justifyContent:"center",
                          fontSize:7, color:"#fff", opacity:0.9,
                        }}
                      >
                        📌
                      </button>
                    );
                  }

                  let bg = "#FFFFFF", border = "#E0E0E0";
                  if (past) { bg = "#FAFAFA"; border = "#F0F0F0"; }
                  else if (pendingAction==="open") { bg = "#C8E6C9"; border = "#4CAF50"; }
                  else if (pendingAction==="close") { bg = "#FFCDD2"; border = "#D32F2F"; }
                  else if (committedOpen) { bg = locked ? "#A5D6A7" : "#4CAF50"; border = "#4CAF50"; }
                  else if (overridden) { border = "#7B1FA2"; } // subtle hint this was force-opened from a fixed course

                  return (
                    <button
                      key={dayIndex}
                      onClick={()=>toggleCell(dayIndex, time)}
                      disabled={past || locked}
                      title={past?"":locked?t.availabilityLockNote:overridden?t.forceOpenBadge:""}
                      style={{
                        height:20,
                        borderRadius:3,
                        border:`1px ${pendingAction?"dashed":overridden&&!committedOpen?"dashed":"solid"} ${border}`,
                        background:bg,
                        cursor:(past||locked)?"not-allowed":"pointer",
                        display:"flex",alignItems:"center",justifyContent:"center",
                        fontSize:8,
                        color:"#fff",
                        opacity:past?0.4:1,
                      }}
                    >
                      {locked?"🔒":(overridden&&!committedOpen&&!pendingAction)?"🔓":""}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
          {/* Per-day quick actions */}
          <div style={{display:"grid",gridTemplateColumns:"48px repeat(7,1fr)",gap:2,marginTop:6}}>
            <div/>
            {T[lang].days.map((_,dayIndex)=>(
              <div key={dayIndex} style={{display:"flex",flexDirection:"column",gap:2}}>
                <button onClick={()=>setWholeDay(dayIndex,true)} style={{fontSize:9,padding:"2px",borderRadius:3,border:"0.5px solid #4CAF50",background:"transparent",color:"#2E7D32",cursor:"pointer"}}>{t.availabilitySelectAllDay}</button>
                <button onClick={()=>setWholeDay(dayIndex,false)} style={{fontSize:9,padding:"2px",borderRadius:3,border:"0.5px solid #CFD8DC",background:"transparent",color:"#9E9E9E",cursor:"pointer"}}>{t.availabilityClearDay}</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Force-opened slots list (admin only) — lets admin revert a force-open back to locked */}
      {isAdmin && weekOverrides.length>0 && (
        <div style={{marginTop:14,background:"#F3E5F5",border:"0.5px solid #E1BEE7",borderRadius:10,padding:"10px 14px"}}>
          <div style={{fontSize:12,fontWeight:600,color:"#7B1FA2",marginBottom:8}}>🔓 {t.forceOpenActiveList}</div>
          {weekOverrides.map(o=>{
            const course = courses.find(c=>c.id===o.courseId);
            return (
              <div key={o.id} style={{display:"flex",alignItems:"center",gap:8,background:"#FFFFFF",borderRadius:7,padding:"7px 10px",marginBottom:6,flexWrap:"wrap"}}>
                <span style={{fontSize:11,color:"#172F39",flex:1,minWidth:120}}>
                  {course?.subject||"—"} · {o.date}
                  {o.reason && <span style={{color:"#9E9E9E"}}> — {o.reason}</span>}
                </span>
                <button onClick={()=>revokeOverride(o.id)} style={{fontSize:10,padding:"3px 10px",borderRadius:5,border:"0.5px solid #7B1FA2",background:"transparent",color:"#7B1FA2",cursor:"pointer",flexShrink:0}}>
                  🔒 {t.forceOpenRevoke}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Force-open confirmation (admin clicking a fixed course slot) */}
      {forceOpenTarget && (
        <ForceOpenModal
          course={forceOpenTarget.course}
          date={forceOpenTarget.date}
          dayIndex={forceOpenTarget.dayIndex}
          users={users||[]}
          lang={lang}
          absences={absences||[]}
          attendance={attendance||[]}
          enrollments={enrollments||[]}
          onConfirm={confirmForceOpen}
          onClose={()=>setForceOpenTarget(null)}
        />
      )}

      {/* Save bar — appears once there are staged changes */}
      {pendingCount>0 && !showConfirm && (
        <div style={{position:"sticky",bottom:0,marginTop:14,background:"#EEF6FB",border:"1px solid #1A6B8A",borderRadius:10,padding:"10px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
          <span style={{fontSize:12,color:"#1A6B8A",fontWeight:600}}>
            {lang==="zh"?`${pendingCount} 項變更尚未儲存`:`${pendingCount} unsaved change(s)`}
          </span>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>setPending({})} style={{padding:"6px 14px",borderRadius:6,border:"0.5px solid #CFD8DC",background:"transparent",color:"#546E7A",fontSize:12,cursor:"pointer"}}>
              {lang==="zh"?"捨棄":"Discard"}
            </button>
            <button onClick={()=>setShowConfirm(true)} style={{padding:"6px 16px",borderRadius:6,border:"none",background:"#1A6B8A",color:"#fff",fontSize:12,fontWeight:600,cursor:"pointer"}}>
              {lang==="zh"?"預覽並儲存":"Review & Save"}
            </button>
          </div>
        </div>
      )}

      {/* Confirmation summary — lists every staged change in plain language before committing */}
      {showConfirm && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9300,padding:"1rem"}}>
          <div style={{background:"#FFFFFF",borderRadius:16,width:"100%",maxWidth:420,boxSizing:"border-box",boxShadow:"0 8px 36px rgba(23,47,57,0.2)",overflow:"hidden",maxHeight:"80vh",display:"flex",flexDirection:"column"}}>
            <div style={{background:"#172F39",padding:"13px 18px",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
              <span style={{fontSize:14,fontWeight:600,color:"#fff"}}>{lang==="zh"?"確認本次操作":"Confirm Changes"}</span>
              <button onClick={()=>setShowConfirm(false)} style={{background:"rgba(255,255,255,0.15)",border:"none",borderRadius:"50%",width:28,height:28,cursor:"pointer",color:"#fff",fontSize:16}}>×</button>
            </div>
            <div style={{padding:"16px 18px",overflowY:"auto",flex:1,minHeight:0}}>
              {preview.length===0 && <p style={{fontSize:12,color:"#9E9E9E",textAlign:"center"}}>—</p>}
              {preview.map((r,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",borderRadius:7,background:r.action==="open"?"#E8F5E9":"#FFEBEE",marginBottom:6}}>
                  <span style={{fontSize:14}}>{r.action==="open"?"🟢":"🔴"}</span>
                  <span style={{fontSize:12,color:"#172F39"}}>
                    {r.action==="open" ? (lang==="zh"?"開啟時段":"Open slot") : (lang==="zh"?"關閉時段":"Close slot")}:
                    {" "}<strong>{fmtMD(new Date(r.date+"T00:00:00"))} {r.start}–{r.end}</strong>
                  </span>
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:8,padding:"12px 18px 16px",borderTop:"0.5px solid #E0E0E0",flexShrink:0}}>
              <button onClick={confirmSave} style={{flex:1,padding:"10px",borderRadius:7,background:"#1A6B8A",border:"none",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer"}}>
                ✓ {lang==="zh"?"確認送出":"Confirm & Save"}
              </button>
              <button onClick={()=>setShowConfirm(false)} style={{padding:"10px 16px",borderRadius:7,background:"transparent",border:"0.5px solid #CFD8DC",color:"#546E7A",fontSize:13,cursor:"pointer"}}>
                {lang==="zh"?"返回修改":"Back"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Teacher's own sidebar page — restricted to this week / next week
function TeacherAvailabilityPanel({ currentUser, users, availability, setAvailability, overrides, setOverrides, courses, absences, attendance, enrollments, lang, setToast }) {
  const t = T[lang];
  const [weekOffset, setWeekOffset] = useState(1); // next week by default
  return (
    <div style={{padding:"1.25rem"}}>
      <div style={{marginBottom:14}}>
        <h3 style={{fontSize:15,fontWeight:600,color:"#172F39",margin:"0 0 3px"}}>{t.availability}</h3>
        <p style={{fontSize:12,color:"#9E9E9E",margin:0}}>{t.availabilityDesc}</p>
        <p style={{fontSize:11,color:"#9E9E9E",margin:"3px 0 0"}}>{t.availabilityRange}</p>
        <p style={{fontSize:11,color:"#1A6B8A",margin:"3px 0 0"}}>{t.availabilityFixedNote}</p>
      </div>
      <TeacherAvailabilityGrid teacherId={currentUser.id} availability={availability||[]} setAvailability={setAvailability} courses={courses||[]} lang={lang} isAdmin={false} setToast={setToast} weekOffset={weekOffset} setWeekOffset={setWeekOffset} overrides={overrides||[]} setOverrides={setOverrides} users={users||[]} absences={absences||[]} attendance={attendance||[]} enrollments={enrollments||[]}/>
    </div>
  );
}

// Admin's viewer/editor — pick any teacher, this week / next week only, bypasses the 12h lock
function AdminTeacherAvailability({ users, courses, availability, setAvailability, overrides, setOverrides, absences, attendance, enrollments, lang, setToast, readOnly }) {
  const t = T[lang];
  const teachers = users.filter(u=>u.role==="teacher");
  const [teacherId, setTeacherId] = useState(teachers[0]?.id||"");
  const [weekOffset, setWeekOffset] = useState(1);

  return (
    <div>
      <h3 style={{fontSize:16,fontWeight:600,color:"#172F39",margin:"0 0 4px"}}>{t.availability}</h3>
      <p style={{fontSize:12,color:"#9E9E9E",margin:"0 0 4px"}}>{t.availabilityDesc}</p>
      <p style={{fontSize:11,color:"#1A6B8A",margin:"0 0 14px"}}>{t.availabilityFixedNote}</p>
      {readOnly && (
        <div style={{fontSize:11,color:"#546E7A",background:"#F5F5F5",borderRadius:6,padding:"6px 11px",marginBottom:14,display:"inline-block"}}>
          👁 {lang==="zh"?"僅供檢視，無法變更時段":"View only — you can't change availability from here"}
        </div>
      )}

      {teachers.length===0 ? (
        <p style={{color:"#9E9E9E",fontSize:13,textAlign:"center",padding:"2rem 0"}}>{t.availabilityNoTeachers}</p>
      ) : (
        <>
          <label style={{fontSize:12,color:"#546E7A",display:"block",marginBottom:5}}>{t.availabilitySelectTeacher}</label>
          <select value={teacherId} onChange={e=>setTeacherId(e.target.value)} style={{padding:"8px 10px",borderRadius:6,border:"0.5px solid #CFD8DC",background:"#FFFFFF",color:"#172F39",fontSize:13,marginBottom:16,minWidth:200}}>
            {teachers.map(te=><option key={te.id} value={te.id}>{te.name}</option>)}
          </select>
          <TeacherAvailabilityGrid teacherId={teacherId} availability={availability||[]} setAvailability={setAvailability} courses={courses||[]} lang={lang} isAdmin={!readOnly} readOnly={readOnly} setToast={setToast} weekOffset={weekOffset} setWeekOffset={setWeekOffset} overrides={overrides||[]} setOverrides={setOverrides} users={users||[]} absences={absences||[]} attendance={attendance||[]} enrollments={enrollments||[]}/>
        </>
      )}
    </div>
  );
}

// ─── Avatar options (generic icon set — no image upload needed) ──────────────
const AVATAR_OPTIONS = [
  { id:"fox",     icon:"🦊", bg:"#FFE0B2" },
  { id:"bear",    icon:"🐻", bg:"#D7CCC8" },
  { id:"panda",   icon:"🐼", bg:"#ECEFF1" },
  { id:"lion",    icon:"🦁", bg:"#FFF3C4" },
  { id:"koala",   icon:"🐨", bg:"#CFD8DC" },
  { id:"tiger",   icon:"🐯", bg:"#FFCCBC" },
  { id:"rabbit",  icon:"🐰", bg:"#F8BBD0" },
  { id:"owl",     icon:"🦉", bg:"#D1C4E9" },
  { id:"frog",    icon:"🐸", bg:"#C8E6C9" },
  { id:"penguin", icon:"🐧", bg:"#B3E5FC" },
  { id:"unicorn", icon:"🦄", bg:"#F3E5F5" },
  { id:"turtle",  icon:"🐢", bg:"#DCEDC8" },
  { id:"man",     icon:"👨", bg:"#BBDEFB" },
  { id:"woman",   icon:"👩", bg:"#FFCDD2" },
  { id:"robot",   icon:"🤖", bg:"#CFD8DC" },
  { id:"dog",     icon:"🐶", bg:"#FFE0B2" },
  { id:"cat",     icon:"🐱", bg:"#FFF9C4" },
  { id:"dragon",  icon:"🐉", bg:"#C8E6C9" },
];
function getAvatarById(id) { return AVATAR_OPTIONS.find(a=>a.id===id) || null; }

// ─── Student Settings Panel ───────────────────────────────────────────────────
// Lets a student self-edit basic profile info (staged as a pending change for
// admin to review/merge) and change their own password (applies immediately).
function StudentSettingsPanel({ currentUser, users, setUsers, dirEntries, saveDirEntries, dirLoaded, profileChanges, setProfileChanges, lang, setToast, role }) {
  const t = T[lang];
  const isTeacherRole = role === "teacher"; // teachers use the exact same panel, minus the Chinese-name field
  const myDirEntry = dirEntries.find(d=>d.linkedUserId===currentUser.id);
  const myPending = (profileChanges||[]).filter(c=>c.studentId===currentUser.id && c.status==="pending").sort((a,b)=>b.requestedAt.localeCompare(a.requestedAt))[0];

  // Chinese and English names are tracked separately and BOTH require admin
  // review (students only — teachers just have the one name field). English
  // name is what's used everywhere else in the system (schedule, rosters,
  // etc.) so it maps to users.name on merge; Chinese name lives in the
  // student directory (nameCn).
  const [nameEn, setNameEn] = useState(currentUser.name || "");
  const [nameCn, setNameCn] = useState(myDirEntry?.nameCn || "");
  const [birthDate, setBirthDate] = useState(myDirEntry?.birthDate || "");
  const [avatar, setAvatar] = useState(myDirEntry?.avatar || "");
  const [email, setEmail] = useState(myDirEntry?.email || "");
  const [phone, setPhone] = useState(myDirEntry?.phone || "");

  const [curPwd, setCurPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");

  if (!dirLoaded) {
    return (
      <div style={{padding:"1.25rem",textAlign:"center",color:"#9E9E9E"}}>
        <div style={{fontSize:32,marginBottom:8}}>⏳</div>
        <div style={{fontSize:13}}>{lang==="zh"?"載入中…":"Loading…"}</div>
      </div>
    );
  }

  const saveInfo = () => {
    // Name(s) are the only field(s) that need admin review before taking
    // effect. Everything else applies immediately, but STILL generates a
    // notification record so admin has visibility into every change someone
    // makes — it's just already-applied, not blocking.
    const nameChanges = {};
    const namePrevious = {};
    if (nameEn.trim() && nameEn.trim() !== currentUser.name) { nameChanges.nameEn = nameEn.trim(); namePrevious.nameEn = currentUser.name; }
    if (!isTeacherRole && nameCn.trim() !== (myDirEntry?.nameCn||"")) { nameChanges.nameCn = nameCn.trim(); namePrevious.nameCn = myDirEntry?.nameCn||""; }
    const hasNameChanges = Object.keys(nameChanges).length > 0;

    const immediateFields = {};
    const immediatePrevious = {};
    if (birthDate !== (myDirEntry?.birthDate||"")) { immediateFields.birthDate = birthDate; immediatePrevious.birthDate = myDirEntry?.birthDate||""; }
    if (avatar !== (myDirEntry?.avatar||"")) { immediateFields.avatar = avatar; immediatePrevious.avatar = myDirEntry?.avatar||""; }
    if (email !== (myDirEntry?.email||"")) { immediateFields.email = email; immediatePrevious.email = myDirEntry?.email||""; }
    if (phone !== (myDirEntry?.phone||"")) { immediateFields.phone = phone; immediatePrevious.phone = myDirEntry?.phone||""; }
    const hasImmediateChanges = Object.keys(immediateFields).length > 0;

    if (!hasNameChanges && !hasImmediateChanges) { setToast(t.settingsNoChange); return; }

    const now = new Date().toISOString();

    // Apply birth date / avatar / email / phone right away — no review needed —
    // but still log a notification record (status "auto_applied") for admin visibility.
    if (hasImmediateChanges) {
      const existingIdx = dirEntries.findIndex(d=>d.linkedUserId===currentUser.id);
      let next;
      if (existingIdx >= 0) {
        next = dirEntries.map((d,i)=> i===existingIdx ? {...d, ...immediateFields} : d);
      } else {
        next = [...dirEntries, {id:genId(), nameEn:currentUser.name, linkedUserId:currentUser.id, ...immediateFields}];
      }
      saveDirEntries(next);
      setProfileChanges(prev => [...prev, {
        id:genId(), studentId:currentUser.id, role, requestedAt:now,
        changes:immediateFields, previousValues:immediatePrevious,
        status:"auto_applied", mergedAt:now, mergedBy:"system",
      }]);
    }

    // Name(s) still require admin review, since English name is referenced everywhere else
    if (hasNameChanges) {
      setProfileChanges(prev => [...prev, {
        id:genId(), studentId:currentUser.id, role, requestedAt:now,
        changes:nameChanges, previousValues:namePrevious, status:"pending",
      }]);
    }

    setToast(hasNameChanges ? t.settingsSubmitted : t.settingsSavedInstant);
  };

  const updatePassword = async () => {
    const ok = await verifyPassword(curPwd, currentUser);
    if (!ok) { setToast(t.settingsCurrentPwdWrong); return; }
    if (!newPwd || newPwd !== confirmPwd) { setToast(t.settingsPwdMismatch); return; }
    const { hash, salt } = await hashPassword(newPwd);
    setUsers(prev => prev.map(u => u.id===currentUser.id ? {...u, passwordHash:hash, passwordSalt:salt, password:undefined} : u));
    setCurPwd(""); setNewPwd(""); setConfirmPwd("");
    setToast(t.settingsPwdUpdated);
  };

  const iStyle = {width:"100%",boxSizing:"border-box",padding:"9px 11px",borderRadius:7,border:"0.5px solid #CFD8DC",background:"#FFFFFF",color:"#172F39",fontSize:13};
  const lStyle = {fontSize:12,color:"#546E7A",display:"block",marginBottom:5,marginTop:12};
  const currentAvatar = getAvatarById(myDirEntry?.avatar);

  return (
    <div style={{padding:"1.25rem"}}>
      <div style={{marginBottom:14}}>
        <h3 style={{fontSize:15,fontWeight:600,color:"#172F39",margin:"0 0 3px"}}>{t.settingsTab}</h3>
        <p style={{fontSize:12,color:"#9E9E9E",margin:0}}>{t.settingsDesc}</p>
      </div>

      {/* Current official info — always shown at the top, "無" for anything unset */}
      <div style={{display:"flex",alignItems:"center",gap:14,background:"#EEF6FB",borderRadius:12,padding:"14px 16px",marginBottom:16,border:"0.5px solid #CFE3EF"}}>
        <div style={{width:52,height:52,borderRadius:"50%",background:currentAvatar?.bg||"#CFD8DC",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>
          {currentAvatar?.icon || currentUser.name.slice(0,2).toUpperCase()}
        </div>
        <div style={{fontSize:12,color:"#546E7A",lineHeight:1.9}}>
          <div><strong style={{color:"#172F39"}}>{t.settingsNameEn}</strong>：{currentUser.name || t.settingsNoneValue}</div>
          {!isTeacherRole && <div><strong style={{color:"#172F39"}}>{t.settingsNameCn}</strong>：{myDirEntry?.nameCn || t.settingsNoneValue}</div>}
          <div><strong style={{color:"#172F39"}}>{t.settingsBirthDate}</strong>：{myDirEntry?.birthDate || t.settingsNoneValue}</div>
          <div><strong style={{color:"#172F39"}}>{t.settingsEmail}</strong>：{myDirEntry?.email || t.settingsNoneValue}</div>
          <div><strong style={{color:"#172F39"}}>{t.settingsPhone}</strong>：{myDirEntry?.phone || t.settingsNoneValue}</div>
        </div>
      </div>

      {myPending && (
        <div style={{background:"#FFF3E0",border:"0.5px solid #FFE0B2",borderRadius:8,padding:"10px 13px",marginBottom:16,fontSize:12,color:"#E65100"}}>
          ⏳ {t.settingsPendingBanner}
          {myPending.changes?.nameEn?`：${t.settingsNameEn}「${myPending.changes.nameEn}」`:""}
          {myPending.changes?.nameCn?`${myPending.changes?.nameEn?"、":"："}${t.settingsNameCn}「${myPending.changes.nameCn}」`:""}
        </div>
      )}

      {/* Basic info form */}
      <div style={{background:"#F5F5F5",borderRadius:12,border:"0.5px solid #E0E0E0",padding:"1rem 1.1rem",marginBottom:16}}>
        <div style={{fontWeight:600,fontSize:13,color:"#172F39",marginBottom:2}}>{t.settingsBasicInfo}</div>
        <div style={{fontSize:11,color:"#9E9E9E"}}>{t.settingsOptionalNote}</div>
        <div style={{fontSize:11,color:"#1A6B8A",marginTop:4}}>ℹ️ {t.settingsNameReviewNote}</div>

        <label style={lStyle}>{t.settingsNameEn}</label>
        <input style={iStyle} value={nameEn} onChange={e=>setNameEn(e.target.value)} placeholder={currentUser.name}/>

        {!isTeacherRole && (
          <>
            <label style={lStyle}>{t.settingsNameCn}</label>
            <input style={iStyle} value={nameCn} onChange={e=>setNameCn(e.target.value)} placeholder={lang==="zh"?"例：王小明":"e.g. 王小明"}/>
          </>
        )}

        <label style={lStyle}>{t.settingsBirthDate}</label>
        <input type="date" style={iStyle} value={birthDate} onChange={e=>setBirthDate(e.target.value)}/>

        <label style={lStyle}>{t.settingsAvatar}</label>
        <div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:4}}>
          {AVATAR_OPTIONS.map(a=>(
            <button key={a.id} type="button" onClick={()=>setAvatar(a.id)} style={{width:42,height:42,borderRadius:"50%",background:a.bg,border:avatar===a.id?"2.5px solid #1A6B8A":"2px solid transparent",fontSize:20,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
              {a.icon}
            </button>
          ))}
        </div>

        <label style={lStyle}>{t.settingsEmail}</label>
        <input type="email" style={iStyle} value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/>

        <label style={lStyle}>{t.settingsPhone}</label>
        <input style={iStyle} value={phone} onChange={e=>setPhone(e.target.value)} placeholder="09xx-xxx-xxx"/>

        <button onClick={saveInfo} style={{marginTop:16,width:"100%",padding:"10px",borderRadius:8,background:"#1A6B8A",border:"none",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer"}}>
          {t.settingsSaveInfo}
        </button>
      </div>

      {/* Change password */}
      <div style={{background:"#F5F5F5",borderRadius:12,border:"0.5px solid #E0E0E0",padding:"1rem 1.1rem"}}>
        <div style={{fontWeight:600,fontSize:13,color:"#172F39"}}>{t.settingsChangePwd}</div>

        <label style={lStyle}>{t.settingsCurrentPwd}</label>
        <input type="password" style={iStyle} value={curPwd} onChange={e=>setCurPwd(e.target.value)}/>

        <label style={lStyle}>{t.settingsNewPwd}</label>
        <input type="password" style={iStyle} value={newPwd} onChange={e=>setNewPwd(e.target.value)}/>

        <label style={lStyle}>{t.settingsConfirmPwd}</label>
        <input type="password" style={iStyle} value={confirmPwd} onChange={e=>setConfirmPwd(e.target.value)}/>

        <button onClick={updatePassword} disabled={!curPwd||!newPwd||!confirmPwd} style={{marginTop:16,width:"100%",padding:"10px",borderRadius:8,background:(curPwd&&newPwd&&confirmPwd)?"#2E7D32":"#E0E0E0",border:"none",color:(curPwd&&newPwd&&confirmPwd)?"#fff":"#9E9E9E",fontSize:13,fontWeight:600,cursor:(curPwd&&newPwd&&confirmPwd)?"pointer":"not-allowed"}}>
          {t.settingsUpdatePwdBtn}
        </button>
      </div>
    </div>
  );
}

// ─── Student Teacher Introduction Panel ───────────────────────────────────────
// Shows the student's own teacher(s) — basic profile with years of experience
// and teaching philosophy/strengths, filled in (and editable) by admin.
// ─── Teacher's own Post-Class Feedback panel ──────────────────────────────────
// Scoped to just this teacher's own courses — "課堂反饋總覽" lists every past
// session chronologically (oldest first by default), "未填寫追蹤" narrows that
// down to sessions still missing feedback, grouped by week. Both let the
// teacher write/edit feedback directly via the same FeedbackModal used from
// the schedule view.
function TeacherFeedbackPanel({ currentUser, users, courses, enrollments, attendance, absences, feedback, setFeedback, lang, setToast }) {
  const t = T[lang];
  const [subTab, setSubTab] = useState("missing"); // missing | overview — missing-first, since that's the actionable one
  const [sortOldFirst, setSortOldFirst] = useState(true); // default: old → new, top to bottom
  // Inline fill-in workflow (no modal): type directly under each session →
  // "confirm preview" locks the text in and shows it as a preview right
  // there → check off which confirmed drafts to actually save → one batch
  // save button submits all checked ones at once. key = enrollmentId_date.
  const [drafts, setDrafts] = useState({});
  const keyFor = (s) => `${s.enrollment.id}_${s.date}`;
  const draftFor = (s) => drafts[keyFor(s)] || {text:"", nextMat:"", nextMatNote:"", confirmed:false, checked:false};
  const setDraftText = (s, text) => setDrafts(d=>({...d, [keyFor(s)]: {...draftFor(s), text}}));
  const setDraftNextMat = (s, nextMat) => setDrafts(d=>({...d, [keyFor(s)]: {...draftFor(s), nextMat}}));
  const setDraftNextMatNote = (s, nextMatNote) => setDrafts(d=>({...d, [keyFor(s)]: {...draftFor(s), nextMatNote}}));
  const draftIsValid = (draft) => draft.text?.trim() && draft.nextMat && (draft.nextMat!=="no_scope" || draft.nextMatNote?.trim());
  const confirmDraft = (s) => setDrafts(d=>({...d, [keyFor(s)]: {...draftFor(s), confirmed:true, checked:true}}));
  const editDraftAgain = (s) => setDrafts(d=>({...d, [keyFor(s)]: {...draftFor(s), confirmed:false}}));
  const toggleDraftChecked = (s) => setDrafts(d=>({...d, [keyFor(s)]: {...draftFor(s), checked: !draftFor(s).checked}}));

  const myCourseIds = new Set(courses.filter(c=>c.teacherId===currentUser.id).map(c=>c.id));

  // Every past session across this teacher's own courses
  const allSessions = enrollments
    .filter(enr => myCourseIds.has(enr.courseId))
    .flatMap(enr => {
      const course = courses.find(c=>c.id===enr.courseId);
      if (!course) return [];
      return (enr.scheduledDates||[])
        .filter(s => isSessionOver(s.date, resolveSessionStart(course, s), course.duration))
        .map(s => {
          const start = s.customStart || getCourseStartForDay(course, s.dayIndex);
          return {
            course, enrollment: enr, date: s.date, dayIndex: s.dayIndex, sessionNo: s.sessionNo, start,
            feedbackRec: (feedback||[]).find(f=>f.enrollmentId===enr.id && f.date===s.date) || null,
            attRec: (attendance||[]).find(a=>a.enrollmentId===enr.id && a.date===s.date) || null,
            // Self-reported leave (student/teacher via AbsenceModal) only
            // ever creates an `absences` entry, never an `attendance` one —
            // checking attRec alone was the bug, it silently missed every
            // self-reported leave and kept nagging for feedback on classes
            // that were already excused.
            absRec: (absences||[]).find(a=>a.courseId===course.id && a.dateStr===s.date) || null,
          };
        });
    });

  const sorted = [...allSessions].sort((a,b) => {
    const cmp = a.date.localeCompare(b.date) || a.start.localeCompare(b.start);
    return sortOldFirst ? cmp : -cmp;
  });

  // Sessions where feedback is genuinely expected but missing (absent/excused/
  // teacher_leave — whether admin-recorded OR self-reported — don't need feedback)
  const missingSessions = sorted.filter(s => (!s.attRec || s.attRec.type==="other") && !s.absRec && !s.feedbackRec);
  const missingByWeek = {};
  missingSessions.forEach(s => {
    const wk = getMondayKey(s.date);
    if (!missingByWeek[wk]) missingByWeek[wk] = [];
    missingByWeek[wk].push(s);
  });
  const weekKeys = Object.keys(missingByWeek).sort((a,b)=> sortOldFirst ? a.localeCompare(b) : b.localeCompare(a));

  const readyToSaveCount = Object.values(drafts).filter(d=>d.confirmed && d.checked && d.text?.trim()).length;

  const batchSave = () => {
    const now = new Date().toISOString();
    const source = currentUser.role==="assistant" ? "assistant" : "teacher";
    const newRecords = [];   // brand-new sessions with no prior feedback record
    const updatedById = {};  // re-edits of an existing record — must keep the same id and get REPLACED, not duplicated
    const usedKeys = [];
    allSessions.forEach(s => {
      const key = keyFor(s);
      const d = drafts[key];
      if (!d || !d.confirmed || !d.checked || !draftIsValid(d)) return;
      const rec = {
        id: s.feedbackRec?.id || genId(),
        enrollmentId: s.enrollment.id, courseId: s.course.id,
        studentId: s.course.studentId, teacherId: s.course.teacherId,
        date: s.date, dayIndex: s.dayIndex, sessionNo: s.sessionNo,
        text: d.text.trim(),
        nextMaterialStatus: d.nextMat,
        nextMaterialNote: d.nextMat==="no_scope" ? (d.nextMatNote||"").trim() : "",
        status: "pending", source,
        createdAt: s.feedbackRec?.createdAt || now, updatedAt: now, reviewedAt: "", reviewedBy: "",
      };
      if (s.feedbackRec) updatedById[rec.id] = rec;
      else newRecords.push(rec);
      usedKeys.push(key);
    });
    if (!newRecords.length && !Object.keys(updatedById).length) return;
    setFeedback(prev => [
      ...(prev||[]).map(f => updatedById[f.id] || f),
      ...newRecords,
    ]);
    setDrafts(d => { const next = {...d}; usedKeys.forEach(k=>delete next[k]); return next; });
    setToast(lang==="zh"?`已儲存 ${newRecords.length+Object.keys(updatedById).length} 筆反饋，待管理員審核`:`Saved ${newRecords.length+Object.keys(updatedById).length} feedback record(s), pending review`);
  };

  const STATUS_META = {
    pending:  {label:t.feedbackStatusPending,  color:"#E65100", bg:"#FFF3E0"},
    approved: {label:t.feedbackStatusApproved, color:"#2E7D32", bg:"#E8F5E9"},
    rejected: {label:t.feedbackStatusRejected, color:"#D32F2F", bg:"#FFEBEE"},
  };
  const taStyle = {width:"100%",boxSizing:"border-box",minHeight:60,padding:"8px 10px",borderRadius:6,border:"0.5px solid #CFD8DC",background:"#FFFFFF",color:"#172F39",fontSize:12,fontFamily:"inherit",resize:"vertical"};

  const renderSessionRow = (s, i) => {
    const student = users.find(u=>u.id===s.course.studentId);
    const meta = s.feedbackRec ? STATUS_META[s.feedbackRec.status] : null;
    const draft = draftFor(s);
    // Editing an existing submitted record re-uses the same inline draft
    // mechanism — typing into it and confirming re-submits as pending.
    const isEditingExisting = drafts[keyFor(s)] && s.feedbackRec;
    return (
      <div key={i} style={{background:"#FFFFFF",border:`1px solid ${meta?meta.color+"33":"#E0E0E0"}`,borderRadius:9,padding:"10px 14px",marginBottom:8}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10,flexWrap:"wrap",marginBottom:8}}>
          <div>
            <div style={{fontSize:12,fontWeight:600,color:"#172F39"}}>{s.course.subject}</div>
            <div style={{fontSize:11,color:"#9E9E9E",marginTop:2}}>
              {s.date} ({T[lang].days[s.dayIndex]}) · {s.start} · #{s.sessionNo}
            </div>
            <div style={{fontSize:11,color:"#546E7A",marginTop:2}}>{lang==="zh"?"學生":"Student"}: {student?.name||"—"}</div>
          </div>
          {meta && !isEditingExisting && (
            <span style={{fontSize:10,background:meta.bg,color:meta.color,borderRadius:5,padding:"2px 9px",fontWeight:600,flexShrink:0}}>● {meta.label}</span>
          )}
        </div>

        {/* Already-submitted content — shown as read display, with an inline edit-again option */}
        {s.feedbackRec && !isEditingExisting && (
          <div>
            <div style={{background:"#F5F5F5",borderRadius:7,padding:"9px 12px",fontSize:12,color:"#172F39",lineHeight:1.7,whiteSpace:"pre-wrap",marginBottom:6}}>
              {s.feedbackRec.text}
            </div>
            <NextMaterialFields value={s.feedbackRec.nextMaterialStatus} note={s.feedbackRec.nextMaterialNote} lang={lang} readOnly/>
            <button onClick={()=>setDrafts(d=>({...d,[keyFor(s)]:{text:s.feedbackRec.text, nextMat:s.feedbackRec.nextMaterialStatus||"", nextMatNote:s.feedbackRec.nextMaterialNote||"", confirmed:false, checked:false}}))} style={{fontSize:11,padding:"4px 11px",borderRadius:6,background:"transparent",border:"1px solid #7B1FA2",color:"#7B1FA2",cursor:"pointer",fontWeight:500,marginTop:8}}>
              ✏️ {t.feedbackEdit}
            </button>
          </div>
        )}

        {/* No submission yet, OR re-editing an existing one — inline draft workflow */}
        {(!s.feedbackRec || isEditingExisting) && (
          draft.confirmed ? (
            <div style={{background:"#EEF6FB",border:"1px solid #4A9FD4",borderRadius:8,padding:"10px 12px"}}>
              <label style={{display:"flex",alignItems:"flex-start",gap:8,cursor:"pointer"}}>
                <input type="checkbox" checked={draft.checked} onChange={()=>toggleDraftChecked(s)} style={{marginTop:3,cursor:"pointer"}}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:10,color:"#1A6B8A",fontWeight:600,marginBottom:4}}>✓ {lang==="zh"?"預覽（已勾選待儲存）":"Preview (checked — will be saved)"}</div>
                  <div style={{fontSize:12,color:"#172F39",lineHeight:1.7,whiteSpace:"pre-wrap"}}>{draft.text}</div>
                </div>
              </label>
              <NextMaterialFields value={draft.nextMat} note={draft.nextMatNote} lang={lang} readOnly/>
              <button onClick={()=>editDraftAgain(s)} style={{marginTop:8,fontSize:11,padding:"3px 10px",borderRadius:5,border:"0.5px solid #CFD8DC",background:"transparent",color:"#546E7A",cursor:"pointer"}}>
                {lang==="zh"?"重新編輯":"Edit again"}
              </button>
            </div>
          ) : (
            <div>
              <textarea
                value={draft.text}
                onChange={e=>setDraftText(s, e.target.value)}
                placeholder={lang==="zh"?"在這裡直接輸入課後反饋…":"Type the feedback for this class here…"}
                style={taStyle}
              />
              <NextMaterialFields value={draft.nextMat} note={draft.nextMatNote} onValueChange={v=>setDraftNextMat(s,v)} onNoteChange={v=>setDraftNextMatNote(s,v)} lang={lang}/>
              <div style={{display:"flex",gap:8,marginTop:10}}>
                <button onClick={()=>confirmDraft(s)} disabled={!draftIsValid(draft)} style={{fontSize:12,padding:"6px 14px",borderRadius:6,background:draftIsValid(draft)?"#1A6B8A":"#E0E0E0",border:"none",color:draftIsValid(draft)?"#fff":"#9E9E9E",cursor:draftIsValid(draft)?"pointer":"not-allowed",fontWeight:500}}>
                  🔍 {lang==="zh"?"送出預覽確認":"Preview & Confirm"}
                </button>
                {isEditingExisting && (
                  <button onClick={()=>setDrafts(d=>{const n={...d};delete n[keyFor(s)];return n;})} style={{fontSize:12,padding:"6px 14px",borderRadius:6,background:"transparent",border:"0.5px solid #CFD8DC",color:"#546E7A",cursor:"pointer"}}>
                    {t.cancel}
                  </button>
                )}
              </div>
            </div>
          )
        )}
      </div>
    );
  };

  return (
    <div style={{padding:"1.25rem",paddingBottom:readyToSaveCount>0?90:20}}>
      <div style={{marginBottom:14}}>
        <h3 style={{fontSize:15,fontWeight:600,color:"#172F39",margin:"0 0 3px"}}>{t.teacherFeedbackTab}</h3>
        <p style={{fontSize:12,color:"#9E9E9E",margin:0}}>{t.teacherFeedbackDesc}</p>
      </div>

      {/* Sub-tabs */}
      <div style={{display:"flex",gap:5,marginBottom:14,flexWrap:"wrap"}}>
        {[["missing",t.teacherFbMissingTab,missingSessions.length],["overview",t.teacherFbOverviewTab,0]].map(([k,l,badge])=>(
          <button key={k} onClick={()=>setSubTab(k)} style={{position:"relative",padding:"7px 16px",borderRadius:7,fontSize:13,cursor:"pointer",border:subTab===k?"none":"0.5px solid #CFD8DC",background:subTab===k?"#1A6B8A":"transparent",color:subTab===k?"#fff":"#546E7A",fontWeight:subTab===k?600:400}}>
            {l}
            {badge>0 && <span style={{marginLeft:6,fontSize:10,background:subTab===k?"rgba(255,255,255,0.25)":"#D32F2F",color:"#fff",borderRadius:9,padding:"1px 6px",fontWeight:700}}>{badge}</span>}
          </button>
        ))}
        <button onClick={()=>setSortOldFirst(o=>!o)} style={{marginLeft:"auto",fontSize:12,padding:"6px 12px",borderRadius:7,border:"0.5px solid #CFD8DC",background:"transparent",color:"#546E7A",cursor:"pointer",whiteSpace:"nowrap"}}>
            {sortOldFirst ? `↓ ${t.sortOldToNew}` : `↑ ${t.sortNewToOld}`}
        </button>
      </div>

      {/* ── Overview: every past session, chronological ── */}
      {subTab==="overview" && (
        sorted.length===0
          ? <div style={{textAlign:"center",padding:"2.5rem 0",color:"#9E9E9E"}}><div style={{fontSize:28,marginBottom:8}}>📭</div><div style={{fontSize:13}}>{t.teacherFbNoSessions}</div></div>
          : sorted.map(renderSessionRow)
      )}

      {/* ── Missing: only sessions without feedback, grouped by week ── */}
      {subTab==="missing" && (
        weekKeys.length===0
          ? <div style={{textAlign:"center",padding:"2.5rem 0",color:"#9E9E9E"}}><div style={{fontSize:28,marginBottom:8}}>🎉</div><div style={{fontSize:13}}>{t.fbTrackingEmpty}</div></div>
          : weekKeys.map(wk=>{
              const items = missingByWeek[wk];
              const monday = new Date(wk+"T00:00:00");
              const sunday = new Date(monday); sunday.setDate(monday.getDate()+6);
              const rangeLabel = `${fmtMD(monday)} – ${fmtMD(sunday)}`;
              return (
                <div key={wk} style={{marginBottom:"1.25rem"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                    <span style={{fontSize:13,fontWeight:600,color:"#172F39"}}>{t.fbWeekOf} {rangeLabel}</span>
                    <span style={{fontSize:10,background:"#FFF3E0",color:"#E65100",borderRadius:9,padding:"2px 8px",fontWeight:700}}>{t.fbTrackingCount.replace("{n}", items.length)}</span>
                    <div style={{flex:1,height:"0.5px",background:"#E0E0E0"}}/>
                  </div>
                  {items.map(renderSessionRow)}
                </div>
              );
            })
      )}

      {/* Sticky batch-save bar — appears once at least one draft is confirmed+checked */}
      {readyToSaveCount>0 && (
        <div style={{position:"fixed",bottom:0,left:0,right:0,background:"#172F39",padding:"12px 1.25rem",display:"flex",alignItems:"center",justifyContent:"center",gap:14,boxShadow:"0 -2px 12px rgba(0,0,0,0.2)",zIndex:200}}>
          <span style={{color:"#fff",fontSize:13}}>{lang==="zh"?`已勾選 ${readyToSaveCount} 筆準備儲存`:`${readyToSaveCount} confirmed and ready`}</span>
          <button onClick={batchSave} style={{background:"#4CAF50",border:"none",borderRadius:7,color:"#fff",padding:"9px 20px",fontSize:13,fontWeight:600,cursor:"pointer"}}>
            💾 {lang==="zh"?`儲存已勾選項目 (${readyToSaveCount})`:`Save Checked (${readyToSaveCount})`}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── 任教學生總覽 (Teacher Student Overview) ──────────────────────────────────
// A per-student, spreadsheet-style consolidated view: every session's date/
// time/materials/feedback in one place, button-switcher between students
// (never a dropdown, per spec). Shares the exact same underlying feedback
// data as the regular "課後回饋" tab — a session filled in over there shows
// here read-only (color-coded by status) with an "edit" unlock; a session
// not yet filled uses this page as the primary entry point. Material
// completion status (YES/沿用教材/指定範圍) now lives on the material
// itself, not the feedback record, since one session can have 1-3 materials
// each needing their own answer. Only shown to teachers admin has switched
// on for (currentUser.canUseStudentOverview) — a test-phase feature.
// Admin/assistant entry point for the same overview — pick a teacher first
// (dropdown here is fine; the "buttons only, no dropdown" rule was specific
// to a teacher's OWN small roster, not admin/assistant picking among
// potentially many teachers), then reuse the exact same component teachers
// see for their own roster.
// Admin-only review queue for teacher-submitted material content edits
// (title/URL/description). Approving promotes the pending draft into the
// live fields (what students see); rejecting just discards the draft and
// leaves the current material untouched — the teacher can always resubmit.
function MaterialEditReview({ courses, materials, setMaterials, users, lang, setToast }) {
  const t = T[lang];
  const pendingEdits = materials.filter(m => m.pendingEdit).sort((a,b)=>(a.pendingEdit.submittedAt||"").localeCompare(b.pendingEdit.submittedAt||""));

  const approve = (m) => {
    setMaterials(prev => prev.map(x => x.id===m.id ? {
      ...x, title: m.pendingEdit.title, url: m.pendingEdit.url, desc: m.pendingEdit.desc, pendingEdit: null,
    } : x));
    setToast(lang==="zh"?"已核准，教材已更新":"Approved — material updated");
  };
  const reject = (m) => {
    setMaterials(prev => prev.map(x => x.id===m.id ? {...x, pendingEdit: null} : x));
    setToast(lang==="zh"?"已退回，維持原教材內容":"Rejected — material kept as-is");
  };

  return (
    <div style={{padding:"1.25rem"}}>
      <h3 style={{fontSize:15,fontWeight:600,color:"#172F39",margin:"0 0 3px"}}>{lang==="zh"?"教材編輯審核":"Material Edit Review"}</h3>
      <p style={{fontSize:12,color:"#9E9E9E",margin:"0 0 14px"}}>{lang==="zh"?"老師透過「任教學生總覽」提出的教材修改，核准後才會更新到學生看到的版本":"Material edits teachers submitted via the Student Overview page — approving updates what students actually see"}</p>
      {pendingEdits.length===0 ? (
        <div style={{textAlign:"center",padding:"2.5rem 0",color:"#9E9E9E"}}><div style={{fontSize:28,marginBottom:8}}>🎉</div><div style={{fontSize:13}}>{lang==="zh"?"目前沒有待審核的教材修改":"No material edits pending"}</div></div>
      ) : pendingEdits.map(m=>{
        const course = courses.find(c=>c.id===m.courseId);
        const submitter = users.find(u=>u.id===m.pendingEdit.submittedBy);
        return (
          <div key={m.id} style={{background:"#FFFFFF",border:"1px solid #FFCC80",borderRadius:10,padding:"14px 16px",marginBottom:10}}>
            <div style={{fontSize:12,color:"#172F39",fontWeight:600}}>{course?.subject||"—"}</div>
            <div style={{fontSize:11,color:"#9E9E9E",marginBottom:10}}>
              {m.date} · {lang==="zh"?"提交者":"Submitted by"}: {submitter?.name||"—"}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
              <div style={{background:"#F5F5F5",borderRadius:7,padding:"8px 10px"}}>
                <div style={{fontSize:10,color:"#9E9E9E",fontWeight:600,marginBottom:4}}>{lang==="zh"?"目前版本":"Current"}</div>
                <div style={{fontSize:12,color:"#172F39"}}>{m.title||"—"}</div>
                {m.url && <div style={{fontSize:10,color:"#1A6B8A",wordBreak:"break-all",marginTop:2}}>{m.url}</div>}
              </div>
              <div style={{background:"#EEF6FB",borderRadius:7,padding:"8px 10px"}}>
                <div style={{fontSize:10,color:"#1A6B8A",fontWeight:600,marginBottom:4}}>{lang==="zh"?"提議修改為":"Proposed change"}</div>
                <div style={{fontSize:12,color:"#172F39"}}>{m.pendingEdit.title||"—"}</div>
                {m.pendingEdit.url && <div style={{fontSize:10,color:"#1A6B8A",wordBreak:"break-all",marginTop:2}}>{m.pendingEdit.url}</div>}
              </div>
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>approve(m)} style={{flex:1,background:"#2E7D32",border:"none",borderRadius:6,color:"#fff",padding:"7px",fontSize:12,fontWeight:600,cursor:"pointer"}}>✓ {lang==="zh"?"核准":"Approve"}</button>
              <button onClick={()=>reject(m)} style={{flex:1,background:"transparent",border:"1px solid #D32F2F",borderRadius:6,color:"#D32F2F",padding:"7px",fontSize:12,fontWeight:600,cursor:"pointer"}}>✕ {lang==="zh"?"退回":"Reject"}</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AdminStudentOverview({ currentUser, users, courses, enrollments, materials, setMaterials, feedback, setFeedback, attendance, absences, lang, setToast }) {
  const t = T[lang];
  const teachersWithActiveCourses = users.filter(u=>u.role==="teacher" && courses.some(c=>c.teacherId===u.id && c.status!=="archived"));
  const [viewTeacherId, setViewTeacherId] = useState(teachersWithActiveCourses[0]?.id || "");
  if (!teachersWithActiveCourses.length) {
    return <div style={{padding:"1.25rem",textAlign:"center",color:"#9E9E9E",fontSize:13}}>{lang==="zh"?"目前沒有任教中的老師":"No teachers with active students"}</div>;
  }
  return (
    <div>
      <div style={{padding:"1.25rem 1.25rem 0"}}>
        <label style={{fontSize:12,color:"#546E7A",display:"block",marginBottom:5}}>{lang==="zh"?"選擇老師":"Select Teacher"}</label>
        <select value={viewTeacherId} onChange={e=>setViewTeacherId(e.target.value)} style={{padding:"8px 10px",borderRadius:6,border:"0.5px solid #CFD8DC",background:"#FFFFFF",color:"#172F39",fontSize:13,minWidth:220}}>
          {teachersWithActiveCourses.map(te=><option key={te.id} value={te.id}>{te.name}</option>)}
        </select>
      </div>
      <TeacherStudentOverview currentUser={currentUser} users={users} courses={courses} enrollments={enrollments} materials={materials} setMaterials={setMaterials} feedback={feedback} setFeedback={setFeedback} attendance={attendance} absences={absences} lang={lang} setToast={setToast} viewTeacherId={viewTeacherId}/>
    </div>
  );
}

function TeacherStudentOverview({ currentUser, users, courses, enrollments, materials, setMaterials, feedback, setFeedback, attendance, absences, lang, setToast, viewTeacherId }) {
  const t = T[lang];
  // Teachers always view their own roster; admin/assistant pass in a
  // specific teacherId to look at (via the picker in AdminStudentOverview).
  const teacherId = viewTeacherId || currentUser.id;
  const isAdmin = currentUser.role==="admin";
  const myCourses = courses.filter(c => c.teacherId===teacherId && c.status!=="archived");
  const myStudentIds = [...new Set(myCourses.map(c=>c.studentId))];
  const [selectedStudentId, setSelectedStudentId] = useState(myStudentIds[0] || "");
  useEffect(() => { setSelectedStudentId(myStudentIds[0] || ""); }, [teacherId]);
  const [showOlder, setShowOlder] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState("");

  const studentCourseIds = new Set(myCourses.filter(c=>c.studentId===selectedStudentId).map(c=>c.id));
  const allSessions = enrollments
    .filter(enr => studentCourseIds.has(enr.courseId))
    .flatMap(enr => {
      const course = myCourses.find(c=>c.id===enr.courseId);
      if (!course) return [];
      // Every scheduled session from the paid enrollment shows up here, not
      // just ones that already happened — upcoming ones pre-populate their
      // date/time straight from the paid arrangement, just without
      // materials/feedback to fill in yet since they haven't occurred.
      return (enr.scheduledDates||[])
        .map(s => {
          const start = s.customStart || getCourseStartForDay(course, s.dayIndex);
          return {
            course, enrollment: enr, date: s.date, dayIndex: s.dayIndex, sessionNo: s.sessionNo, start,
            isFuture: !isSessionOver(s.date, start, course.duration),
            sessionMaterials: materials.filter(m=>m.courseId===course.id && m.date===s.date),
            feedbackRec: (feedback||[]).find(f=>f.enrollmentId===enr.id && f.date===s.date) || null,
            attRec: (attendance||[]).find(a=>a.enrollmentId===enr.id && a.date===s.date) || null,
            absRec: (absences||[]).find(a=>a.courseId===course.id && a.dateStr===s.date) || null,
          };
        });
    })
    .sort((a,b) => a.date.localeCompare(b.date) || a.start.localeCompare(b.start)); // oldest → newest (far to near), matching the original Excel sheet's row order

  // Already-happened sessions default to showing just the last month;
  // anything older auto-collapses. Future (not-yet-happened) sessions are
  // never collapsed — they're the upcoming schedule, always relevant.
  const oneMoAgo = new Date(); oneMoAgo.setMonth(oneMoAgo.getMonth()-1);
  const cutoff = fmtYMD(oneMoAgo);
  const recentSessions = allSessions.filter(s=>s.isFuture || s.date>=cutoff);
  const olderSessions = allSessions.filter(s=>!s.isFuture && s.date<cutoff);

  // Drafts: feedback text keyed by session, material completion keyed by materialId
  const [fbDrafts, setFbDrafts] = useState({});   // sessionKey -> {text, editing}
  const [matDrafts, setMatDrafts] = useState({}); // materialId -> {status, note}
  const sKey = (s) => `${s.enrollment.id}_${s.date}`;
  const fbDraftFor = (s) => fbDrafts[sKey(s)] || {text:s.feedbackRec?.text||"", editing:!s.feedbackRec};
  const matDraftFor = (m) => matDrafts[m.id] || {status:m.completionStatus||"", note:m.completionNote||""};

  // Editing a material's actual content (title/url/desc) — unlike
  // completion status, this needs admin approval before it's visible to the
  // student. The live title/url/desc are never touched directly; the edit
  // goes into `pendingEdit` and only gets promoted once admin approves it,
  // so the student keeps seeing the current version in the meantime.
  const [editingMatId, setEditingMatId] = useState(null);
  const [matEditDraft, setMatEditDraft] = useState({title:"",url:"",desc:""});
  const startEditMaterial = (m) => {
    setEditingMatId(m.id);
    setMatEditDraft({title:m.title||"", url:m.url||"", desc:m.desc||""});
  };
  const submitMaterialEdit = () => {
    if (!matEditDraft.title.trim() && !matEditDraft.url.trim()) return;
    setMaterials(prev => prev.map(m => m.id===editingMatId ? {
      ...m,
      pendingEdit: { title:matEditDraft.title.trim(), url:matEditDraft.url.trim(), desc:matEditDraft.desc.trim(), submittedBy:currentUser.id, submittedAt:new Date().toISOString() },
    } : m));
    setEditingMatId(null);
    setToast(lang==="zh"?"已送出教材修改，待管理員審核":"Material edit submitted — pending admin review");
  };

  const sessionIsValid = (s) => {
    const fd = fbDraftFor(s);
    if (!fd.text?.trim()) return false;
    return s.sessionMaterials.every(m => {
      const md = matDraftFor(m);
      return md.status && (md.status!=="no_scope" || md.note?.trim());
    });
  };

  const saveSession = (s) => {
    if (!sessionIsValid(s)) return;
    const fd = fbDraftFor(s);
    const now = new Date().toISOString();
    const source = currentUser.role==="assistant" ? "assistant" : "teacher";
    const rec = {
      id: s.feedbackRec?.id || genId(),
      enrollmentId: s.enrollment.id, courseId: s.course.id,
      studentId: s.course.studentId, teacherId: s.course.teacherId,
      date: s.date, dayIndex: s.dayIndex, sessionNo: s.sessionNo,
      text: fd.text.trim(), status: "pending", source,
      createdAt: s.feedbackRec?.createdAt || now, updatedAt: now, reviewedAt: "", reviewedBy: "",
    };
    setFeedback(prev => s.feedbackRec ? prev.map(f=>f.id===rec.id?rec:f) : [...(prev||[]), rec]);
    if (s.sessionMaterials.length) {
      setMaterials(prev => prev.map(m => {
        const md = matDrafts[m.id];
        if (!md || !studentCourseIds.has(m.courseId) || m.date!==s.date) return m;
        return {...m, completionStatus: md.status, completionNote: md.status==="no_scope"?(md.note||"").trim():"", completionSetBy: currentUser.id, completionSetAt: now};
      }));
    }
    setFbDrafts(d => { const n={...d}; delete n[sKey(s)]; return n; });
    setToast(lang==="zh"?"已儲存，待管理員審核":"Saved — pending review");
  };

  // ── Batch paste-import legacy Excel-style records (admin only) — for
  // backfilling the old spreadsheet-tracking history into this system. One
  // row per session: Date / Time / Material URL / Material Title / Finished?
  // (Yes or No) / Classes Title / Lesson Link / Comments. A row only lands
  // if its date matches an EXISTING scheduled session for the selected
  // student (across any of this teacher's courses with them) — nothing gets
  // invented into the schedule itself, since that's a separate, more
  // consequential action than backfilling notes onto sessions that already
  // exist. Comments become an auto-approved feedback record (admin is the
  // one entering it, same rule as the existing batch-feedback-input tool);
  // materials + their completion status get attached directly, same as any
  // other admin material write.
  const runImport = () => {
    const rows = parseTSVBlock(importText);
    let matched = 0, skipped = 0;
    const newMaterials = [];
    const newFeedback = [];
    const updatedFeedbackById = {};
    const now = new Date().toISOString();
    rows.forEach(cells => {
      if (cells.length < 2) return;
      if (cells.some(c=>/^(date|time|material|material title|finished|finished the material\??|classes title|lesson link|comments?)$/i.test(c))) return; // header row
      const [dateRaw, , matUrl, matTitle, finishedRaw, , , comments] = cells;
      const date = normalizeDate(dateRaw);
      if (!date) { skipped++; return; }
      let found = null;
      for (const enr of enrollments) {
        if (!studentCourseIds.has(enr.courseId)) continue;
        const sEntry = (enr.scheduledDates||[]).find(x=>x.date===date);
        if (sEntry) { found = { enr, sEntry, course: myCourses.find(c=>c.id===enr.courseId) }; break; }
      }
      if (!found) { skipped++; return; }
      matched++;
      const { enr, sEntry, course } = found;
      if ((matUrl||"").trim() || (matTitle||"").trim()) {
        newMaterials.push({
          id: genId(), courseId: course.id, date, dayIndex: sEntry.dayIndex,
          title: (matTitle||"").trim(), url: (matUrl||"").trim(),
          completionStatus: /^y/i.test((finishedRaw||"").trim()) ? "yes" : ((finishedRaw||"").trim() ? "no_continue" : ""),
          addedBy: currentUser.id, addedAt: now,
        });
      }
      if ((comments||"").trim()) {
        const existing = (feedback||[]).find(f=>f.enrollmentId===enr.id && f.date===date);
        const rec = {
          id: existing?.id || genId(), enrollmentId: enr.id, courseId: course.id,
          studentId: course.studentId, teacherId: course.teacherId,
          date, dayIndex: sEntry.dayIndex, sessionNo: sEntry.sessionNo,
          text: (comments||"").trim(), status: "approved", source: "admin",
          createdAt: existing?.createdAt || now, updatedAt: now, reviewedAt: now, reviewedBy: "admin",
        };
        if (existing) updatedFeedbackById[rec.id] = rec;
        else newFeedback.push(rec);
      }
    });
    if (newMaterials.length) setMaterials(prev => [...(prev||[]), ...newMaterials]);
    if (newFeedback.length || Object.keys(updatedFeedbackById).length) {
      setFeedback(prev => [...(prev||[]).map(f=>updatedFeedbackById[f.id]||f), ...newFeedback]);
    }
    setToast(lang==="zh"
      ? `已匯入 ${matched} 筆${skipped>0?`，${skipped} 筆因找不到對應排課日期而跳過`:""}`
      : `Imported ${matched} row(s)${skipped>0?`, ${skipped} skipped (no matching scheduled date)`:""}`);
    setImportText(""); setShowImport(false);
  };

  const STATUS_META = {
    pending:  {label:t.feedbackStatusPending,  color:"#E65100", bg:"#FFF3E0"},
    approved: {label:t.feedbackStatusApproved, color:"#2E7D32", bg:"#E8F5E9"},
    rejected: {label:t.feedbackStatusRejected, color:"#D32F2F", bg:"#FFEBEE"},
  };
  const taStyle = {width:"100%",boxSizing:"border-box",minHeight:50,padding:"7px 9px",borderRadius:6,border:"0.5px solid #CFD8DC",background:"#FFFFFF",color:"#172F39",fontSize:12,fontFamily:"inherit",resize:"vertical"};

  const renderMaterialStatus = (m, editing) => {
    const md = matDraftFor(m);
    if (!editing) {
      if (!m.completionStatus) return <span style={{fontSize:10,color:"#B0B0B0"}}>—</span>;
      const label = m.completionStatus==="yes"?"YES":m.completionStatus==="no_continue"?(lang==="zh"?"NO・沿用":"NO・Reuse"):(lang==="zh"?"NO・指定範圍":"NO・New topic");
      return <span style={{fontSize:10,background:m.completionStatus==="yes"?"#E8F5E9":"#FFF3E0",color:m.completionStatus==="yes"?"#2E7D32":"#E65100",borderRadius:4,padding:"2px 7px",fontWeight:600}}>{label}{m.completionStatus==="no_scope"&&m.completionNote?`：${m.completionNote}`:""}</span>;
    }
    return (
      <div style={{display:"flex",flexDirection:"column",gap:3,marginTop:3}}>
        {[["yes","YES"],["no_continue",lang==="zh"?"NO・沿用教材":"NO・Reuse"],["no_scope",lang==="zh"?"NO・指定範圍":"NO・New topic"]].map(([k,l])=>(
          <label key={k} style={{display:"flex",alignItems:"center",gap:5,fontSize:11,cursor:"pointer"}}>
            <input type="radio" checked={md.status===k} onChange={()=>setMatDrafts(d=>({...d,[m.id]:{...matDraftFor(m),status:k}}))}/>
            {l}
          </label>
        ))}
        {md.status==="no_scope" && (
          <input value={md.note} onChange={e=>setMatDrafts(d=>({...d,[m.id]:{...matDraftFor(m),note:e.target.value}}))} placeholder={lang==="zh"?"下次主題…":"Next topic…"} style={{fontSize:11,padding:"4px 6px",borderRadius:4,border:"0.5px solid #CFD8DC"}}/>
        )}
      </div>
    );
  };

  const renderRow = (s, i) => {
    const meta = s.feedbackRec ? STATUS_META[s.feedbackRec.status] : null;
    const isExcused = (s.attRec && s.attRec.type!=="other") || s.absRec;
    const fd = fbDraftFor(s);
    const editing = fd.editing && !s.isFuture; // can't give feedback for a class that hasn't happened yet
    const cellStyle = {padding:"10px 12px",verticalAlign:"top",borderRight:"0.5px solid #E8E8E8",borderBottom:"0.5px solid #E8E8E8"};
    return (
      <tr key={i} style={{background:meta?meta.bg+"22":s.isFuture?"#FAFBFC":"#FFFFFF",opacity:isExcused?0.55:1}}>
        <td style={cellStyle}>
          <div style={{fontSize:12,color:"#172F39"}}>{s.date}</div>
          <div style={{fontSize:10,color:"#9E9E9E"}}>{T[lang].days[s.dayIndex]}</div>
          {s.isFuture && !isExcused && <div style={{fontSize:9,color:"#9E9E9E",marginTop:2}}>{lang==="zh"?"尚未上課":"Upcoming"}</div>}
        </td>
        <td style={cellStyle}><span style={{fontSize:12,color:"#546E7A"}}>{s.start}–{addMins(s.start,s.course.duration)}</span></td>
        <td style={cellStyle}>
          {isExcused ? (
            <span style={{fontSize:11,color:"#9E9E9E"}}>{lang==="zh"?"（已請假）":"(excused)"}</span>
          ) : s.sessionMaterials.length===0 ? (
            <span style={{fontSize:11,color:"#B0B0B0"}}>{lang==="zh"?"無教材":"No material"}</span>
          ) : s.sessionMaterials.map(m=>(
            <div key={m.id} style={{marginBottom:6}}>
              {editingMatId===m.id ? (
                <div style={{background:"#F5F5F5",borderRadius:6,padding:"7px 8px"}}>
                  <input value={matEditDraft.title} onChange={e=>setMatEditDraft(d=>({...d,title:e.target.value}))} placeholder={lang==="zh"?"教材標題":"Title"} style={{width:"100%",boxSizing:"border-box",fontSize:11,padding:"4px 6px",borderRadius:4,border:"0.5px solid #CFD8DC",marginBottom:4}}/>
                  <input value={matEditDraft.url} onChange={e=>setMatEditDraft(d=>({...d,url:e.target.value}))} placeholder={lang==="zh"?"教材連結":"URL"} style={{width:"100%",boxSizing:"border-box",fontSize:11,padding:"4px 6px",borderRadius:4,border:"0.5px solid #CFD8DC",marginBottom:4}}/>
                  <div style={{display:"flex",gap:5}}>
                    <button onClick={submitMaterialEdit} style={{fontSize:10,padding:"3px 9px",borderRadius:4,background:"#1A6B8A",border:"none",color:"#fff",cursor:"pointer"}}>{lang==="zh"?"送出審核":"Submit for review"}</button>
                    <button onClick={()=>setEditingMatId(null)} style={{fontSize:10,padding:"3px 9px",borderRadius:4,background:"transparent",border:"0.5px solid #CFD8DC",color:"#546E7A",cursor:"pointer"}}>{t.cancel}</button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{fontSize:11,color:"#172F39",fontWeight:500}}>{m.title}</div>
                  {m.url && <a href={m.url} target="_blank" rel="noreferrer" style={{fontSize:10,color:"#1A6B8A",wordBreak:"break-all"}}>{m.url}</a>}
                  {m.pendingEdit && (
                    <div style={{fontSize:10,background:"#FFF3E0",color:"#E65100",borderRadius:4,padding:"2px 6px",marginTop:2,display:"inline-block"}}>
                      ⏳ {lang==="zh"?"修改待審核":"Edit pending review"}
                    </div>
                  )}
                  {renderMaterialStatus(m, editing && !isExcused)}
                  {editing && !isExcused && !m.pendingEdit && (
                    <button onClick={()=>startEditMaterial(m)} style={{fontSize:10,padding:"2px 8px",borderRadius:4,border:"0.5px solid #CFD8DC",background:"transparent",color:"#546E7A",cursor:"pointer",marginTop:3}}>
                      ✏️ {lang==="zh"?"編輯教材":"Edit material"}
                    </button>
                  )}
                </>
              )}
            </div>
          ))}
        </td>
        <td style={{...cellStyle,borderRight:"none"}}>
          {isExcused ? (
            <span style={{fontSize:11,color:"#9E9E9E"}}>—</span>
          ) : s.isFuture ? (
            <span style={{fontSize:11,color:"#B0B0B0"}}>{lang==="zh"?"尚未上課，無法填寫反饋":"Not yet held — feedback isn't available until after class"}</span>
          ) : !editing ? (
            <div>
              {meta && <span style={{fontSize:10,background:meta.bg,color:meta.color,borderRadius:4,padding:"2px 8px",fontWeight:600,marginBottom:4,display:"inline-block"}}>● {meta.label}</span>}
              <div style={{fontSize:12,color:"#172F39",lineHeight:1.6,whiteSpace:"pre-wrap"}}>{s.feedbackRec?.text}</div>
              <button onClick={()=>setFbDrafts(d=>({...d,[sKey(s)]:{text:s.feedbackRec.text,editing:true}}))} style={{fontSize:10,padding:"3px 9px",borderRadius:5,border:"0.5px solid #7B1FA2",background:"transparent",color:"#7B1FA2",cursor:"pointer",marginTop:5}}>
                ✏️ {t.feedbackEdit}
              </button>
            </div>
          ) : (
            <div>
              <textarea value={fd.text} onChange={e=>setFbDrafts(d=>({...d,[sKey(s)]:{...fd,text:e.target.value}}))} style={taStyle} placeholder={lang==="zh"?"課後反饋…":"Feedback…"}/>
              <div style={{display:"flex",gap:6,marginTop:5}}>
                <button onClick={()=>saveSession(s)} disabled={!sessionIsValid(s)} style={{fontSize:11,padding:"5px 12px",borderRadius:5,background:sessionIsValid(s)?"#1A6B8A":"#E0E0E0",border:"none",color:sessionIsValid(s)?"#fff":"#9E9E9E",cursor:sessionIsValid(s)?"pointer":"not-allowed",fontWeight:500}}>
                  ✓ {lang==="zh"?"儲存":"Save"}
                </button>
                {s.feedbackRec && (
                  <button onClick={()=>setFbDrafts(d=>{const n={...d};delete n[sKey(s)];return n;})} style={{fontSize:11,padding:"5px 12px",borderRadius:5,background:"transparent",border:"0.5px solid #CFD8DC",color:"#546E7A",cursor:"pointer"}}>
                    {t.cancel}
                  </button>
                )}
              </div>
            </div>
          )}
        </td>
      </tr>
    );
  };

  if (!myStudentIds.length) {
    return <div style={{padding:"1.25rem",textAlign:"center",color:"#9E9E9E",fontSize:13}}>{lang==="zh"?"目前沒有任教學生":"No students yet"}</div>;
  }

  return (
    <div style={{padding:"1.25rem"}}>
      <h3 style={{fontSize:15,fontWeight:600,color:"#172F39",margin:"0 0 3px"}}>{lang==="zh"?"任教學生總覽":"Student Overview"}</h3>
      <p style={{fontSize:12,color:"#9E9E9E",margin:"0 0 12px"}}>{lang==="zh"?"逐堂整合檢視：日期、教材、完成度、反饋，一次看完":"Every session's date, materials, completion status and feedback in one place"}</p>

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10,flexWrap:"wrap",marginBottom:14}}>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {myStudentIds.map(sid=>{
            const stu = users.find(u=>u.id===sid);
            return (
              <button key={sid} onClick={()=>setSelectedStudentId(sid)} style={{padding:"8px 16px",borderRadius:8,border:selectedStudentId===sid?"none":"0.5px solid #CFD8DC",background:selectedStudentId===sid?"#1A6B8A":"transparent",color:selectedStudentId===sid?"#fff":"#546E7A",fontSize:13,fontWeight:selectedStudentId===sid?600:400,cursor:"pointer"}}>
                {stu?.name||"—"}
              </button>
            );
          })}
        </div>
        {isAdmin && selectedStudentId && (
          <button onClick={()=>setShowImport(v=>!v)} style={{fontSize:12,padding:"7px 14px",borderRadius:7,border:"1px solid #4A9FD4",background:showImport?"#EEF6FB":"transparent",color:"#1A6B8A",cursor:"pointer",whiteSpace:"nowrap"}}>
            📋 {lang==="zh"?"批次貼上匯入舊資料":"Batch Import Legacy Data"}
          </button>
        )}
      </div>

      {isAdmin && showImport && (
        <div style={{background:"#F5F5F5",borderRadius:8,padding:"12px 14px",marginBottom:16}}>
          <div style={{fontSize:11,color:"#546E7A",marginBottom:6,lineHeight:1.6}}>
            {lang==="zh"
              ? "從舊 Excel 表格複製整個範圍貼上，欄位順序：日期、時間、教材連結、教材標題、Finished(Yes/No)、Classes Title、Lesson Link、Comments。只有日期能對到這位學生已存在的排課紀錄，資料才會被匯入；找不到對應日期的列會被跳過，不會自動新增排課。"
              : "Paste a full range copied from the old Excel sheet. Column order: Date, Time, Material URL, Material Title, Finished (Yes/No), Classes Title, Lesson Link, Comments. Only rows whose date matches an existing scheduled session for this student get imported — non-matching rows are skipped, nothing gets added to the schedule itself."}
          </div>
          <textarea
            value={importText}
            onChange={e=>setImportText(e.target.value)}
            placeholder={"2026/05/26\t20:30-20:55\thttps://reurl.cc/GanvxA\t16. What Is Your City Like?\tNo\tES English Study\thttps://meet.google.com/oox-tuai-yop\tJohn: showed good speaking ability"}
            style={{width:"100%",boxSizing:"border-box",minHeight:110,padding:"8px 10px",borderRadius:6,border:"0.5px solid #CFD8DC",background:"#FFFFFF",color:"#172F39",fontSize:12,fontFamily:"monospace",resize:"vertical"}}
          />
          <div style={{display:"flex",gap:8,marginTop:8}}>
            <button onClick={runImport} disabled={!importText.trim()} style={{padding:"7px 16px",borderRadius:6,background:importText.trim()?"#1A6B8A":"#E0E0E0",border:"none",color:importText.trim()?"#fff":"#9E9E9E",fontSize:12,cursor:importText.trim()?"pointer":"not-allowed",fontWeight:600}}>
              📥 {lang==="zh"?"匯入":"Import"}
            </button>
            <button onClick={()=>{setShowImport(false);setImportText("");}} style={{padding:"7px 16px",borderRadius:6,background:"transparent",border:"0.5px solid #CFD8DC",color:"#546E7A",fontSize:12,cursor:"pointer"}}>
              {t.cancel}
            </button>
          </div>
        </div>
      )}

      {olderSessions.length>0 && (
        <div style={{marginBottom:10}}>
          <button onClick={()=>setShowOlder(v=>!v)} style={{fontSize:12,padding:"6px 14px",borderRadius:6,border:"0.5px solid #CFD8DC",background:"transparent",color:"#546E7A",cursor:"pointer"}}>
            {showOlder ? (lang==="zh"?"收合較舊紀錄":"Collapse older records") : (lang==="zh"?`顯示更早的 ${olderSessions.length} 筆`:`Show ${olderSessions.length} earlier record(s)`)}
          </button>
          {showOlder && (
            <div style={{border:"0.5px solid #E0E0E0",borderRadius:8,overflow:"hidden",marginTop:8}}>
              <table style={{width:"100%",borderCollapse:"collapse",tableLayout:"fixed"}}>
                <colgroup><col style={{width:110}}/><col style={{width:90}}/><col style={{width:"38%"}}/><col/></colgroup>
                <tbody>
                  {olderSessions.map(renderRow)}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <div style={{border:"0.5px solid #E0E0E0",borderRadius:8,overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse",tableLayout:"fixed"}}>
          <colgroup><col style={{width:110}}/><col style={{width:90}}/><col style={{width:"38%"}}/><col/></colgroup>
          <thead>
            <tr style={{background:"#F5F5F5"}}>
              {[lang==="zh"?"日期":"Date", lang==="zh"?"時間":"Time", lang==="zh"?"教材":"Materials", lang==="zh"?"反饋":"Feedback"].map((h,i)=>(
                <th key={i} style={{textAlign:"left",padding:"8px 12px",fontSize:11,fontWeight:600,color:"#546E7A",borderRight:i<3?"0.5px solid #E8E8E8":"none",borderBottom:"1px solid #DDD"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recentSessions.length===0 && olderSessions.length===0 && (
              <tr><td colSpan={4} style={{padding:"1.5rem",textAlign:"center",color:"#9E9E9E",fontSize:13}}>—</td></tr>
            )}
            {recentSessions.map(renderRow)}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StudentTeacherIntroPanel({ currentUser, users, courses, teacherDirEntries, dirLoaded, lang }) {
  const t = T[lang];

  if (!dirLoaded) {
    return (
      <div style={{padding:"1.25rem",textAlign:"center",color:"#9E9E9E"}}>
        <div style={{fontSize:32,marginBottom:8}}>⏳</div>
        <div style={{fontSize:13}}>{lang==="zh"?"載入中…":"Loading…"}</div>
      </div>
    );
  }

  // Find the student's own teacher(s) via their courses
  const myTeacherIds = [...new Set(courses.filter(c=>c.studentId===currentUser.id).map(c=>c.teacherId))];
  const myTeachers = myTeacherIds.map(id=>users.find(u=>u.id===id)).filter(Boolean);

  return (
    <div style={{padding:"1.25rem"}}>
      <div style={{marginBottom:16}}>
        <h3 style={{fontSize:15,fontWeight:600,color:"#172F39",margin:"0 0 3px"}}>{t.teacherIntro}</h3>
        <p style={{fontSize:12,color:"#9E9E9E",margin:0}}>{t.teacherIntroDesc}</p>
      </div>

      {myTeachers.length===0 && (
        <div style={{textAlign:"center",padding:"2.5rem 0",color:"#9E9E9E"}}>
          <div style={{fontSize:28,marginBottom:8}}>🎓</div>
          <div style={{fontSize:13}}>{lang==="zh"?"尚無授課老師":"No teacher assigned yet"}</div>
        </div>
      )}

      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        {myTeachers.map(teacher=>{
          const entry = teacherDirEntries.find(d=>d.linkedUserId===teacher.id) || {nameEn:teacher.name};
          return <TeacherProfileCard key={teacher.id} entry={entry} lang={lang}/>;
        })}
      </div>
    </div>
  );
}

function StudentTeacherLayout({ currentUser, users, setUsers, courses, setCourses, lang, absences, setAbsences, materials, setMaterials, enrollments, setEnrollments, attendance, setAttendance, setToast, feedback, setFeedback, teacherAvailability, setTeacherAvailability, availabilityOverrides, setAvailabilityOverrides, profileChanges, setProfileChanges, dirEntries, saveDirEntries, dirLoaded, teacherDirEntries, saveTeacherDirEntries, teacherDirLoaded, trialApplications, setTrialApplications, englishLevels, learningPurposes, sideTabRequest, studentMatSubs, setStudentMatSubs }) {
  const t = T[lang];
  const isStudent = currentUser.role==="student";
  const isTeacher = currentUser.role==="teacher";
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarHover, setSidebarHover] = useState(false);
  // Sidebar starts open; after picking a menu item it auto-collapses to give the
  // content more room, but hovering the mouse over it still reveals it temporarily.
  const sidebarEffectiveOpen = sidebarOpen || sidebarHover;
  // The admin-confirmed official session count for the logged-in student (if any) —
  // this is the single source of truth used everywhere in the student's own views.
  const myDirEntry = dirEntries.find(d=>d.linkedUserId===currentUser.id);
  const myConfirmedOverride = myDirEntry?.confirmedSessions || null;
  // Student: "progress" | "schedule_side" — Teacher: "students" | "schedule_side"
  const [sideTab, setSideTab] = useState("schedule_side");
  useEffect(() => { if (sideTabRequest) setSideTab(sideTabRequest); }, [sideTabRequest]);

  // Schedules other students have shared with this student (e.g. a guardian
  // account for a young child) — each becomes its own read-only sidebar item.
  const sharedSchedules = isStudent
    ? dirEntries
        .filter(d => (d.sharedWith||[]).includes(currentUser.id) && d.linkedUserId && d.linkedUserId!==currentUser.id)
        .map(d => ({ studentId: d.linkedUserId, name: d.nameEn || users.find(u=>u.id===d.linkedUserId)?.name || "—" }))
    : [];

  const menuItems = isStudent
    ? [
        { key:"progress",      icon:"🏆", zh:"獎牌進度", en:"My Progress" },
        { key:"history",       icon:"📋", zh:"課程紀錄", en:"Class History"},
        { key:"teacherIntro",  icon:"🎓", zh:"老師介紹", en:"My Teachers" },
        ...(currentUser.canSubmitMaterials ? [{ key:"submitMaterials", icon:"📚", zh:"自行準備教材", en:"Submit Material" }] : []),
        { key:"settings",      icon:"⚙️", zh:"基本資訊與設定", en:"Basic Info & Settings" },
        { key:"schedule_side", icon:"📅", zh:"課表",     en:"Schedule"   },
        ...sharedSchedules.map(s => ({
          key:`shared_${s.studentId}`, icon:"👪",
          zh:t.sharedScheduleMenu.replace("{name}", s.name),
          en:t.sharedScheduleMenu.replace("{name}", s.name),
        })),
      ]
    : [
        { key:"students",      icon:"👥", zh:"任教學生", en:"My Students" },
        { key:"teacherFeedback",icon:"💬", zh:"課後回饋", en:"Post-Class Feedback" },
        ...(currentUser.canUseStudentOverview ? [{ key:"studentOverview", icon:"📊", zh:"任教學生總覽", en:"Student Overview" }] : []),
        { key:"availability",  icon:"🗓", zh:"可安排時段", en:"Availability" },
        ...(currentUser.canAssist ? [{ key:"assistantTools", icon:"🛠", zh:"助教工具", en:"Assistant Tools" }] : []),
        { key:"settings",      icon:"⚙️", zh:"基本資訊與設定", en:"Basic Info & Settings" },
        { key:"schedule_side", icon:"📅", zh:"課表",     en:"Schedule"   },
      ];

  const sideHasSidebar = isStudent || isTeacher;

  return (
    <div className="es-sidebar-layout" style={{display:"flex",gap:0,alignItems:"flex-start",minHeight:"60vh"}}>
      {/* ── Sidebar ── */}
      {sideHasSidebar && (
        <div className="es-sidebar-outer" onMouseEnter={()=>setSidebarHover(true)} onMouseLeave={()=>setSidebarHover(false)} style={{flexShrink:0,transition:"width 0.2s",width:sidebarEffectiveOpen?264:44,overflow:"hidden",position:"relative"}}>
          <button className="es-sidebar-toggle" onClick={()=>setSidebarOpen(o=>!o)} title={sidebarOpen?"收起":"展開"} style={{position:"absolute",top:8,right:4,zIndex:10,background:"#FFFFFF",border:"0.5px solid #E0E0E0",borderRadius:6,width:28,height:28,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:"#1A6B8A",boxShadow:"0 1px 4px rgba(0,0,0,0.08)"}}>
            {sidebarEffectiveOpen?"◀":"▶"}
          </button>

          <div className="es-sidebar-box" style={{background:"#FFFFFF",border:"0.5px solid #E0E0E0",borderRadius:12,overflow:"hidden",minHeight:400,boxShadow:"0 2px 12px rgba(23,47,57,0.06)",width:264}}>
            {/* Header */}
            <div style={{background:"#172F39",padding:"13px 14px",display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:30,height:30,borderRadius:"50%",background:"#1A6B8A",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:600,color:"#fff",flexShrink:0}}>{currentUser.name.slice(0,2).toUpperCase()}</div>
              <div style={{overflow:"hidden"}}>
                <div style={{fontSize:13,fontWeight:500,color:"#FFFFFF",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{currentUser.name}</div>
                <div style={{fontSize:10,color:"rgba(255,255,255,0.6)"}}>{isStudent?t.role_student:t.role_teacher}</div>
              </div>
            </div>

            {/* Menu */}
            <div className="es-sidebar-menu" style={{padding:"6px 0"}}>
              {menuItems.map(item=>(
                <button key={item.key} className="es-sidebar-menu-item" onClick={()=>{setSideTab(item.key);setSidebarOpen(false);}} style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:sideTab===item.key?"#EEF6FB":"transparent",border:"none",borderLeft:sideTab===item.key?"3px solid #1A6B8A":"3px solid transparent",color:sideTab===item.key?"#1A6B8A":"#546E7A",fontSize:13,cursor:"pointer",textAlign:"left"}}>
                  <span style={{fontSize:15,flexShrink:0}}>{item.icon}</span>
                  <span style={{fontWeight:sideTab===item.key?500:400,whiteSpace:"nowrap"}}>{lang==="zh"?item.zh:item.en}</span>
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
                  if(!attRec && isSessionOver(s.date,resolveSessionStart(c,s),c.duration)){ usedCount++; }
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
      <div className="es-sidebar-main" style={{flex:1,minWidth:0,marginLeft:sideHasSidebar?12:0,width:"100%"}}>
        <div style={{background:"#FFFFFF",borderRadius:14,border:"0.5px solid #E0E0E0",boxShadow:"0 2px 12px rgba(23,47,57,0.06)",overflow:"hidden"}}>
          {isStudent && sideTab==="progress"
            ? <StudentProgressPanel currentUser={currentUser} enrollments={enrollments} attendance={attendance} courses={courses} lang={lang} dirLoaded={dirLoaded} confirmedOverride={myConfirmedOverride}/>
            : isStudent && sideTab==="history"
              ? <StudentClassHistory currentUser={currentUser} enrollments={enrollments} attendance={attendance} courses={courses} users={users} lang={lang} dirLoaded={dirLoaded} feedback={feedback}/>
            : isStudent && sideTab==="teacherIntro"
              ? <StudentTeacherIntroPanel currentUser={currentUser} users={users} courses={courses} teacherDirEntries={teacherDirEntries} dirLoaded={dirLoaded} lang={lang}/>
            : isStudent && currentUser.canSubmitMaterials && sideTab==="submitMaterials"
              ? <StudentMaterialSubmitPanel currentUser={currentUser} courses={courses} enrollments={enrollments} materials={materials} attendance={attendance} absences={absences} studentMatSubs={studentMatSubs} setStudentMatSubs={setStudentMatSubs} lang={lang} setToast={setToast}/>
            : isStudent && sideTab==="settings"
              ? <StudentSettingsPanel currentUser={currentUser} users={users} setUsers={setUsers} dirEntries={dirEntries} saveDirEntries={saveDirEntries} dirLoaded={dirLoaded} profileChanges={profileChanges} setProfileChanges={setProfileChanges} lang={lang} setToast={setToast}/>
            : isTeacher && sideTab==="students"
              ? <TeacherStudentsPanel currentUser={currentUser} users={users} courses={courses} enrollments={enrollments} attendance={attendance} lang={lang} dirEntries={dirEntries}/>
            : isTeacher && sideTab==="teacherFeedback"
              ? <TeacherFeedbackPanel currentUser={currentUser} users={users} courses={courses} enrollments={enrollments} attendance={attendance} absences={absences} feedback={feedback} setFeedback={setFeedback} lang={lang} setToast={setToast}/>
            : isTeacher && currentUser.canUseStudentOverview && sideTab==="studentOverview"
              ? <TeacherStudentOverview currentUser={currentUser} users={users} courses={courses} enrollments={enrollments} materials={materials} setMaterials={setMaterials} feedback={feedback} setFeedback={setFeedback} attendance={attendance} absences={absences} lang={lang} setToast={setToast}/>
            : isTeacher && sideTab==="availability"
              ? <TeacherAvailabilityPanel currentUser={currentUser} users={users} availability={teacherAvailability} setAvailability={setTeacherAvailability} overrides={availabilityOverrides} setOverrides={setAvailabilityOverrides} courses={courses} absences={absences} attendance={attendance} enrollments={enrollments} lang={lang} setToast={setToast}/>
            : isTeacher && currentUser.canAssist && sideTab==="assistantTools"
              ? <div style={{padding:"1.5rem"}}>
                  <AssistantPanel users={users} setUsers={setUsers} courses={courses} setCourses={setCourses} materials={materials} setMaterials={setMaterials} enrollments={enrollments} setEnrollments={setEnrollments} attendance={attendance} lang={lang} setToast={setToast} currentUser={currentUser} feedback={feedback} setFeedback={setFeedback} teacherAvailability={teacherAvailability} setTeacherAvailability={setTeacherAvailability} availabilityOverrides={availabilityOverrides} setAvailabilityOverrides={setAvailabilityOverrides} absences={absences} trialApplications={trialApplications} setTrialApplications={setTrialApplications} englishLevels={englishLevels} learningPurposes={learningPurposes}/>
                </div>
            : isTeacher && sideTab==="settings"
              ? <StudentSettingsPanel currentUser={currentUser} users={users} setUsers={setUsers} dirEntries={teacherDirEntries} saveDirEntries={saveTeacherDirEntries} dirLoaded={teacherDirLoaded} profileChanges={profileChanges} setProfileChanges={setProfileChanges} lang={lang} setToast={setToast} role="teacher"/>
            : isStudent && sideTab.startsWith("shared_")
              ? <div style={{padding:"1.5rem"}}>
                  <div style={{background:"#F3E5F5",border:"0.5px solid #E1BEE7",borderRadius:8,padding:"9px 13px",marginBottom:14,fontSize:12,color:"#7B1FA2"}}>
                    👪 {t.sharedScheduleMenu.replace("{name}", sharedSchedules.find(s=>`shared_${s.studentId}`===sideTab)?.name||"")} — {lang==="zh"?"僅供檢視，無法請假或編輯":"View only — leave requests and edits are disabled"}
                  </div>
                  <ScheduleView currentUser={currentUser} users={users} courses={courses} lang={lang} absences={absences} setAbsences={setAbsences} materials={materials} setMaterials={setMaterials} enrollments={enrollments} setEnrollments={setEnrollments} attendance={attendance} setAttendance={setAttendance} setToast={setToast} feedback={feedback} setFeedback={setFeedback} viewAsStudentId={sideTab.replace("shared_","")} sharedView={true}/>
                </div>
              : <div style={{padding:"1.5rem"}}>
                  <ScheduleView currentUser={currentUser} users={users} courses={courses} lang={lang} absences={absences} setAbsences={setAbsences} materials={materials} setMaterials={setMaterials} enrollments={enrollments} setEnrollments={setEnrollments} attendance={attendance} setAttendance={setAttendance} setToast={setToast} feedback={feedback} setFeedback={setFeedback} onGoToFeedback={isTeacher?()=>setSideTab("teacherFeedback"):undefined}/>
                </div>
          }
        </div>
      </div>
    </div>
  );
}

// ─── Responsive styles ────────────────────────────────────────────────────────
// This entire app is built with inline styles (no external stylesheet), which
// means nothing adapts to viewport width by default — on phones/tablets the
// fixed-width sidebar (264px) alone can exceed the screen width, forcing the
// whole page to scroll horizontally and squeezing the schedule down to an
// unusable sliver. This injects real CSS media queries (with !important, the
// only way to override inline styles from an external rule) targeting a small
// set of className hooks added to the key layout elements.
function ResponsiveStyles() {
  return (
    <style>{`
      html, body { overflow-x: hidden; max-width: 100%; }
      .es-app-root { overflow-x: hidden; max-width: 100vw; }

      @media (max-width: 860px) {
        .es-main { padding: 0.75rem !important; }
        .es-content-card { padding: 1rem !important; }
      }

      @media (max-width: 768px) {
        .es-header { padding: 0 10px !important; }
        .es-header-right { gap: 6px !important; }
        .es-lang-toggle { padding: 4px 8px !important; font-size: 11px !important; }
        .es-logout-btn { padding: 4px 8px !important; font-size: 11px !important; }

        /* Stack the sidebar above the main content instead of squeezing beside it */
        .es-sidebar-layout { flex-direction: column !important; }
        .es-sidebar-outer { width: 100% !important; overflow: visible !important; }
        .es-sidebar-box { width: 100% !important; }
        .es-sidebar-toggle { display: none !important; }
        .es-sidebar-main { margin-left: 0 !important; margin-top: 10px !important; }

        /* Turn the vertical menu list into a horizontally scrollable tab strip */
        .es-sidebar-menu { display: flex !important; overflow-x: auto !important; padding: 6px !important; gap: 4px !important; -webkit-overflow-scrolling: touch; }
        .es-sidebar-menu-item { width: auto !important; flex-shrink: 0 !important; border-left: none !important; border-radius: 8px !important; padding: 8px 12px !important; }
      }

      @media (max-width: 480px) {
        .es-main { padding: 0.5rem !important; }
        .es-content-card { padding: 0.75rem !important; }
        .es-header { padding: 0 8px !important; }
        .es-header-title { display: none !important; }
        .es-header-user-info { display: none !important; }
      }
    `}</style>
  );
}

// ─── App root ─────────────────────────────────────────────────────────────────
// ─── Change Password Modal ────────────────────────────────────────────────────
// For roles that don't have a Settings sidebar (admin, assistant) — same
// verify-then-hash logic as the student/teacher Settings panel's password
// section, just packaged as a standalone modal reachable from the header.
function ChangePasswordModal({ currentUser, setUsers, lang, setToast, onClose }) {
  const t = T[lang];
  const [curPwd, setCurPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [busy, setBusy] = useState(false);
  const iStyle = {width:"100%",boxSizing:"border-box",padding:"8px 10px",borderRadius:6,border:"0.5px solid #CFD8DC",background:"#FFFFFF",color:"#172F39",fontSize:13};
  const lStyle = {fontSize:12,color:"#546E7A",display:"block",marginBottom:4,marginTop:10};

  const submit = async () => {
    setBusy(true);
    const ok = await verifyPassword(curPwd, currentUser);
    if (!ok) { setBusy(false); setToast(t.settingsCurrentPwdWrong); return; }
    if (!newPwd || newPwd !== confirmPwd) { setBusy(false); setToast(t.settingsPwdMismatch); return; }
    const { hash, salt } = await hashPassword(newPwd);
    setUsers(prev => prev.map(u => u.id===currentUser.id ? {...u, passwordHash:hash, passwordSalt:salt, password:undefined} : u));
    setBusy(false);
    setToast(t.settingsPwdUpdated);
    onClose();
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9300,padding:"1rem"}}>
      <div style={{background:"#FFFFFF",borderRadius:16,width:"100%",maxWidth:380,boxSizing:"border-box",boxShadow:"0 8px 36px rgba(23,47,57,0.2)",padding:"20px"}}>
        <div style={{fontSize:14,fontWeight:600,color:"#172F39",marginBottom:4}}>🔒 {t.settingsChangePwd}</div>
        <div style={{fontSize:11,color:"#9E9E9E",marginBottom:4}}>{currentUser.name}（{t[`role_${currentUser.role}`]}）</div>

        <label style={lStyle}>{t.settingsCurrentPwd}</label>
        <input type="password" style={iStyle} value={curPwd} onChange={e=>setCurPwd(e.target.value)}/>

        <label style={lStyle}>{t.settingsNewPwd}</label>
        <input type="password" style={iStyle} value={newPwd} onChange={e=>setNewPwd(e.target.value)}/>

        <label style={lStyle}>{t.settingsConfirmPwd}</label>
        <input type="password" style={iStyle} value={confirmPwd} onChange={e=>setConfirmPwd(e.target.value)}/>

        <div style={{display:"flex",gap:8,marginTop:16}}>
          <button onClick={submit} disabled={busy||!curPwd||!newPwd||!confirmPwd} style={{flex:1,padding:"10px",borderRadius:8,background:(!busy&&curPwd&&newPwd&&confirmPwd)?"#2E7D32":"#E0E0E0",border:"none",color:(!busy&&curPwd&&newPwd&&confirmPwd)?"#fff":"#9E9E9E",fontSize:13,fontWeight:600,cursor:(!busy&&curPwd&&newPwd&&confirmPwd)?"pointer":"not-allowed"}}>
            {busy?(lang==="zh"?"處理中…":"Working…"):(lang==="zh"?"確認變更":"Update Password")}
          </button>
          <button onClick={onClose} style={{padding:"10px 16px",borderRadius:8,background:"transparent",border:"0.5px solid #CFD8DC",color:"#546E7A",fontSize:13,cursor:"pointer"}}>{t.cancel}</button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [lang,setLang]=useState("zh");
  const [currentUser,setCurrentUser]=useState(null);
  const [activeTab,setActiveTab]=useState("schedule");
  const [showPwdModal,setShowPwdModal]=useState(false);
  // Which sub-tab AdminPanel should open on when it (re)mounts. Normally
  // "courses" (the default), but set to "users" specifically when returning
  // from impersonation — AdminPanel fully unmounts while impersonating (since
  // currentUser stops being an admin), so its own internal tab state resets;
  // this is how we steer where it lands back on.
  const [adminInitialTab,setAdminInitialTab]=useState("courses");
  // Lets App-root-level actions (like the global feedback reminder) jump a
  // teacher/student straight to a specific sidebar tab inside
  // StudentTeacherLayout, whose own tab state otherwise isn't reachable from
  // out here.
  const [sideTabRequest,setSideTabRequest]=useState(null);
  // Admin "login as" — lets a developer/admin jump straight into any
  // student/teacher's view without knowing (or resetting) their password.
  // Their own admin session is kept here so "return to admin" is one click,
  // no re-login needed. Never touches the impersonated account's password.
  const [impersonatorAdmin,setImpersonatorAdmin]=useState(null);
  const [users,setUsers,uLoaded]=useStorage("cp3_users",DEFAULT_USERS);
  const [courses,setCourses,cLoaded]=useStorage("cp3_courses",DEFAULT_COURSES);
  const [absences,setAbsences,aLoaded]=useStorage("cp3_absences",[]);
  const [materials,setMaterials,mLoaded]=useStorage("cp3_materials",[]);
  const [enrollments,setEnrollments,eLoaded]=useStorage("cp3_enrollments",DEFAULT_ENROLLMENTS);
  const [attendance,setAttendance,attLoaded]=useStorage("cp3_attendance",DEFAULT_ATTENDANCE);
  const [feedback,setFeedback,fbLoaded]=useStorage("cp3_feedback",[]);
  // One-time-per-material (idempotent) migration/sync: "next lesson material
  // status" used to live on the feedback record; it now lives on the
  // material itself (a session can have 1-3 materials, each needing its own
  // status). This only touches materials that don't already have their own
  // completionStatus, so it's safe to run repeatedly — it does nothing once
  // a given material already has its status set. Depends on `feedback` (not
  // just the load flags) so it also catches NEW feedback submitted during
  // the session, not just what already existed when the app first loaded —
  // otherwise a teacher's fresh submission would never reach
  // TeacherStudentOverview's material tracking until the next full reload.
  useEffect(() => {
    if (!mLoaded || !fbLoaded) return;
    const feedbackWithStatus = (feedback||[]).filter(f => f.nextMaterialStatus);
    if (!feedbackWithStatus.length) return;
    let changed = false;
    const next = (materials||[]).map(m => {
      if (m.completionStatus) return m;
      const f = feedbackWithStatus.find(x => x.courseId===m.courseId && x.date===m.date);
      if (!f) return m;
      changed = true;
      return {...m, completionStatus:f.nextMaterialStatus, completionNote:f.nextMaterialNote||"", completionSetBy:"migrated", completionSetAt:f.updatedAt||f.createdAt||""};
    });
    if (changed) setMaterials(next);
  }, [mLoaded, fbLoaded, feedback]);
  const [teacherAvailability,setTeacherAvailability,taLoaded]=useStorage("cp3_teacher_availability",[]);
  const [availabilityOverrides,setAvailabilityOverrides,aoLoaded]=useStorage("cp3_availability_overrides",[]);
  const [profileChanges,setProfileChanges,pcLoaded]=useStorage("cp3_profile_changes",[]);
  // Single canonical source for student directory data (birth date, avatar,
  // email, phone, etc). Passed down to StudentTeacherLayout so the Settings
  // panel writes here directly — the header reads the exact same state, so
  // avatar changes are reflected immediately with no separate sync step needed.
  const [studentDirEntries,setStudentDirEntries,sdLoaded]=useStorage("cp3_student_dir",[]);
  // Same treatment for the teacher directory — teachers now get their own
  // Settings panel too, and this keeps their header avatar in sync the same
  // reliable way (single shared state, not a separate self-fetch copy).
  const [teacherDirEntries,setTeacherDirEntries,tdLoaded]=useStorage("cp3_teacher_dir",[]);
  const [introText,setIntroText,introLoaded]=useStorage("cp3_intro_text","");
  // Trial-lesson applications submitted from the public login page, plus the
  // two admin-editable dropdown option lists used on that form.
  const [trialApplications,setTrialApplications,trialLoaded]=useStorage("cp3_trial_applications",[]);
  const [studentMatSubs,setStudentMatSubs]=useStorage("cp3_student_material_submissions",[]);
  const [englishLevels,setEnglishLevels,elLoaded]=useStorage("cp3_english_levels",DEFAULT_ENGLISH_LEVELS);
  const [learningPurposes,setLearningPurposes,lpLoaded]=useStorage("cp3_learning_purposes",DEFAULT_LEARNING_PURPOSES);
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

  if(!uLoaded||!cLoaded||!aLoaded||!mLoaded||!eLoaded||!attLoaded||!fbLoaded||!taLoaded||!aoLoaded||!pcLoaded) return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#FAFAFA"}}>
      <span style={{color:"#1A6B8A",fontSize:16}}>Loading…</span>
    </div>
  );

  if(!currentUser) return <LoginPage onLogin={(u)=>{setCurrentUser(u);setAdminInitialTab("courses");}} lang={lang} setLang={setLang} users={users} setUsers={setUsers} introText={introText} trialApplications={trialApplications} setTrialApplications={setTrialApplications} englishLevels={englishLevels} learningPurposes={learningPurposes}/>;

  const initials=currentUser.name.slice(0,2).toUpperCase();
  const roleLabel=t[`role_${currentUser.role}`];
  const isAdmin=currentUser.role==="admin";
  const isAssistant=currentUser.role==="assistant";
  const myDirEntryForHeader = currentUser.role==="teacher"
    ? (teacherDirEntries||[]).find(d=>d.linkedUserId===currentUser.id)
    : (studentDirEntries||[]).find(d=>d.linkedUserId===currentUser.id);
  const headerAvatar = getAvatarById(myDirEntryForHeader?.avatar);

  // ── Global "missing feedback" reminder — teacher sees their own, admin/
  // assistant see the company-wide count. Shown as a sticky bar under the
  // header on EVERY page (not just the schedule tab), so it's hard to miss
  // regardless of what someone's currently looking at.
  const isTeacherRole = currentUser.role==="teacher";
  const globalMissingFeedback = (isTeacherRole||isAdmin||isAssistant)
    ? computeMissingFeedback(courses, enrollments, feedback, attendance, absences).filter(m => isTeacherRole ? m.course.teacherId===currentUser.id : true)
    : [];
  const goToFeedbackReminder = () => {
    if (isAdmin) { setActiveTab("admin"); setAdminInitialTab("feedback"); }
    else if (isAssistant) { setActiveTab("assistant"); }
    else { setSideTabRequest("teacherFeedback"); }
  };

  // ── Global "new student leave" notice — student self-reported leave never
  // needed approval, which meant it also never surfaced to admin/assistant
  // at all; they'd only find out by happening to open Leave Review. This
  // just makes sure they're TOLD it happened — no action required, purely
  // awareness. Marked acknowledged the moment they open Leave Review.
  const newStudentLeaveCount = (isAdmin||isAssistant)
    ? (absences||[]).filter(a => a.requesterRole==="student" && a.acknowledgedByAdmin===false).length
    : 0;
  const goToLeaveReminder = () => {
    if (isAdmin) { setActiveTab("admin"); setAdminInitialTab("leave"); }
  };

  const startImpersonating = (targetUser) => {
    setImpersonatorAdmin(currentUser);
    setCurrentUser(targetUser);
    setActiveTab("schedule");
  };
  const stopImpersonating = () => {
    if (!impersonatorAdmin) return;
    setCurrentUser(impersonatorAdmin);
    setImpersonatorAdmin(null);
    setActiveTab("admin");
    setAdminInitialTab("users");
  };

  return (
    <div className="es-app-root" style={{minHeight:"100vh",background:"#FAFAFA",fontFamily:"system-ui, -apple-system, sans-serif",overflowX:"hidden"}}>
      <ResponsiveStyles/>
      <Toast msg={toast}/>
      {syncFailures.size>0 && (
        <div style={{position:"fixed",top:0,left:0,right:0,zIndex:9999,background:"#D32F2F",color:"#fff",fontSize:12,padding:"6px 14px",textAlign:"center",fontWeight:500}}>
          ⚠️ {lang==="zh"
            ? `部分資料儲存失敗（${syncFailures.size} 項），請檢查網路連線並重試，否則變更可能遺失`
            : `Some data failed to save (${syncFailures.size}) — check your connection and retry, or changes may be lost`}
        </div>
      )}
      <header className="es-header" style={{background:"#172F39",borderBottom:"1px solid rgba(26,107,138,0.15)",padding:"0 1.25rem",display:"flex",alignItems:"center",justifyContent:"space-between",height:58,position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:10,minWidth:0,overflow:"hidden"}}>
          <span style={{fontSize:20,flexShrink:0}}>📚</span>
          <span className="es-header-title" style={{color:"#FFFFFF",fontWeight:500,fontSize:14,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>ES Platform</span>
          <span style={{color:"rgba(255,255,255,0.3)",fontSize:10,flexShrink:0}}>{APP_VERSION}</span>
        </div>
        <div className="es-header-right" style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
          <button className="es-lang-toggle" onClick={()=>setLang(lang==="zh"?"en":"zh")} style={{background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.25)",color:"#FFFFFF",borderRadius:6,padding:"4px 12px",cursor:"pointer",fontSize:12,flexShrink:0}}>{t.langToggle}</button>
          <div style={{display:"flex",alignItems:"center",gap:7,minWidth:0}}>
            <div style={{width:30,height:30,borderRadius:"50%",background:headerAvatar?headerAvatar.bg:"#1A6B8A",display:"flex",alignItems:"center",justifyContent:"center",fontSize:headerAvatar?15:11,fontWeight:500,color:headerAvatar?undefined:"#fff",flexShrink:0}}>{headerAvatar?headerAvatar.icon:initials}</div>
            <div className="es-header-user-info" style={{lineHeight:1.2,minWidth:0}}>
              <div style={{color:"#FFFFFF",fontSize:13,fontWeight:500,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:120}}>{currentUser.name}</div>
              <div style={{color:"rgba(255,255,255,0.65)",fontSize:11}}>{roleLabel}</div>
            </div>
          </div>
          <button className="es-logout-btn" onClick={()=>{setCurrentUser(null);setImpersonatorAdmin(null);}} style={{background:"transparent",border:"1px solid rgba(255,255,255,0.15)",color:"rgba(255,255,255,0.7)",borderRadius:6,padding:"5px 10px",cursor:"pointer",fontSize:12,flexShrink:0}}>{t.logout}</button>
        </div>
      </header>
      {impersonatorAdmin && (
        <div style={{background:"#7B1FA2",color:"#fff",padding:"7px 1.25rem",display:"flex",alignItems:"center",justifyContent:"center",gap:10,flexWrap:"wrap",fontSize:12,position:"sticky",top:58,zIndex:99}}>
          <span>👁 {lang==="zh"?`你正在以「${currentUser.name}」（${roleLabel}）的身分檢視 — 這不是你自己的帳號`:`You're viewing as "${currentUser.name}" (${roleLabel}) — this isn't your own account`}</span>
          <button onClick={stopImpersonating} style={{background:"#fff",color:"#7B1FA2",border:"none",borderRadius:5,padding:"3px 12px",fontSize:12,fontWeight:600,cursor:"pointer"}}>
            ← {lang==="zh"?"返回管理員帳號":"Return to admin"}
          </button>
        </div>
      )}
      {globalMissingFeedback.length > 0 && (
        <div style={{background:"#FFF3E0",color:"#E65100",padding:"7px 1.25rem",display:"flex",alignItems:"center",justifyContent:"center",gap:10,flexWrap:"wrap",fontSize:12,position:"sticky",top:impersonatorAdmin?106:58,zIndex:98,borderBottom:"1px solid #FFCC80"}}>
          <span>⚠️ {isTeacherRole
            ? (lang==="zh"?`你有 ${globalMissingFeedback.length} 堂課尚未填寫課後反饋`:`You have ${globalMissingFeedback.length} session(s) still needing feedback`)
            : (lang==="zh"?`全站共有 ${globalMissingFeedback.length} 堂課尚未填寫課後反饋`:`${globalMissingFeedback.length} session(s) across all classes still need feedback`)}</span>
          <button onClick={goToFeedbackReminder} style={{background:"#E65100",color:"#fff",border:"none",borderRadius:5,padding:"3px 12px",fontSize:12,fontWeight:600,cursor:"pointer"}}>
            {lang==="zh"?"前往填寫 →":"Go fill in →"}
          </button>
        </div>
      )}
      {newStudentLeaveCount > 0 && (
        <div style={{background:"#E3F2FD",color:"#1565C0",padding:"7px 1.25rem",display:"flex",alignItems:"center",justifyContent:"center",gap:10,flexWrap:"wrap",fontSize:12,position:"sticky",top:58+(impersonatorAdmin?48:0)+(globalMissingFeedback.length>0?36:0),zIndex:97,borderBottom:"1px solid #90CAF9"}}>
          <span>🔔 {lang==="zh"?`有 ${newStudentLeaveCount} 筆學生請假通知（無須審核，僅供知悉）`:`${newStudentLeaveCount} new student leave notice(s) (no action needed, awareness only)`}</span>
          {isAdmin && (
            <button onClick={goToLeaveReminder} style={{background:"#1565C0",color:"#fff",border:"none",borderRadius:5,padding:"3px 12px",fontSize:12,fontWeight:600,cursor:"pointer"}}>
              {lang==="zh"?"前往查看 →":"View →"}
            </button>
          )}
        </div>
      )}
      {showPwdModal && <ChangePasswordModal currentUser={currentUser} setUsers={setUsers} lang={lang} setToast={setToast} onClose={()=>setShowPwdModal(false)}/>}
      {(isAdmin||isAssistant)&&(
        <div style={{background:"#172F39",borderBottom:"1px solid rgba(26,107,138,0.1)",padding:"0 1.25rem",display:"flex",gap:4,alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",gap:4}}>
            {(isAdmin?["schedule","admin"]:["schedule","assistant"]).map(tab=>(
              <button key={tab} onClick={()=>setActiveTab(tab)} style={{padding:"10px 14px",background:"transparent",border:"none",borderBottom:activeTab===tab?"2px solid #4DCCF5":"2px solid transparent",color:activeTab===tab?"#FFFFFF":"rgba(255,255,255,0.6)",fontSize:13,cursor:"pointer"}}>
                {tab==="schedule"?t.tabSchedule:tab==="admin"?t.tabAdmin:t.assistantPanel}
              </button>
            ))}
          </div>
          <button onClick={()=>setShowPwdModal(true)} style={{background:"transparent",border:"1px solid rgba(255,255,255,0.2)",color:"rgba(255,255,255,0.75)",borderRadius:6,padding:"5px 11px",fontSize:11,cursor:"pointer",flexShrink:0}}>
            🔒 {lang==="zh"?"修改密碼":"Change Password"}
          </button>
        </div>
      )}
      <main className="es-main" style={{maxWidth:(isAdmin||isAssistant)?820:980,margin:"0 auto",padding:"1.25rem",boxSizing:"border-box"}}>
        {/* ── Admin view ── */}
        {isAdmin && (
          <div className="es-content-card" style={{background:"#FFFFFF",borderRadius:14,border:"0.5px solid #E0E0E0",boxShadow:"0 2px 12px rgba(23,47,57,0.06)",padding:"1.5rem"}}>
            {activeTab==="schedule"&&<ScheduleView currentUser={currentUser} users={users} courses={courses} lang={lang} absences={absences} setAbsences={setAbsences} materials={materials} setMaterials={setMaterials} enrollments={enrollments} setEnrollments={setEnrollments} attendance={attendance} setAttendance={setAttendance} setToast={setToast} feedback={feedback} setFeedback={setFeedback}/>}
            {activeTab==="admin"&&<AdminPanel users={users} setUsers={setUsers} courses={courses} setCourses={setCourses} absences={absences} setAbsences={setAbsences} materials={materials} setMaterials={setMaterials} enrollments={enrollments} setEnrollments={setEnrollments} attendance={attendance} setAttendance={setAttendance} lang={lang} setToast={setToast} introText={introText} setIntroText={setIntroText} feedback={feedback} setFeedback={setFeedback} teacherAvailability={teacherAvailability} setTeacherAvailability={setTeacherAvailability} availabilityOverrides={availabilityOverrides} setAvailabilityOverrides={setAvailabilityOverrides} profileChanges={profileChanges} setProfileChanges={setProfileChanges} onImpersonate={startImpersonating} trialApplications={trialApplications} setTrialApplications={setTrialApplications} englishLevels={englishLevels} setEnglishLevels={setEnglishLevels} learningPurposes={learningPurposes} setLearningPurposes={setLearningPurposes} initialTab={adminInitialTab} currentUser={currentUser} studentMatSubs={studentMatSubs} setStudentMatSubs={setStudentMatSubs}/>}
          </div>
        )}

        {/* ── Assistant view ── */}
        {isAssistant && (
          <div className="es-content-card" style={{background:"#FFFFFF",borderRadius:14,border:"0.5px solid #E0E0E0",boxShadow:"0 2px 12px rgba(23,47,57,0.06)",padding:"1.5rem"}}>
            {activeTab==="schedule"&&<ScheduleView currentUser={currentUser} users={users} courses={courses} lang={lang} absences={absences} setAbsences={setAbsences} materials={materials} setMaterials={setMaterials} enrollments={enrollments} setEnrollments={setEnrollments} attendance={attendance} setAttendance={setAttendance} setToast={setToast} feedback={feedback} setFeedback={setFeedback}/>}
            {activeTab==="assistant"&&<AssistantPanel users={users} setUsers={setUsers} courses={courses} setCourses={setCourses} materials={materials} setMaterials={setMaterials} enrollments={enrollments} setEnrollments={setEnrollments} attendance={attendance} lang={lang} setToast={setToast} currentUser={currentUser} feedback={feedback} setFeedback={setFeedback} teacherAvailability={teacherAvailability} setTeacherAvailability={setTeacherAvailability} availabilityOverrides={availabilityOverrides} setAvailabilityOverrides={setAvailabilityOverrides} absences={absences} trialApplications={trialApplications} setTrialApplications={setTrialApplications} englishLevels={englishLevels} learningPurposes={learningPurposes} studentMatSubs={studentMatSubs} setStudentMatSubs={setStudentMatSubs}/>}
          </div>
        )}

        {/* ── Student / Teacher sidebar layout ── */}
        {!isAdmin && !isAssistant && (
          <StudentTeacherLayout
            currentUser={currentUser} users={users} setUsers={setUsers} courses={courses} setCourses={setCourses} lang={lang}
            absences={absences} setAbsences={setAbsences}
            materials={materials} setMaterials={setMaterials}
            enrollments={enrollments} setEnrollments={setEnrollments}
            attendance={attendance} setAttendance={setAttendance}
            feedback={feedback} setFeedback={setFeedback}
            teacherAvailability={teacherAvailability} setTeacherAvailability={setTeacherAvailability}
            availabilityOverrides={availabilityOverrides} setAvailabilityOverrides={setAvailabilityOverrides}
            profileChanges={profileChanges} setProfileChanges={setProfileChanges}
            dirEntries={studentDirEntries} saveDirEntries={setStudentDirEntries} dirLoaded={sdLoaded}
            teacherDirEntries={teacherDirEntries} saveTeacherDirEntries={setTeacherDirEntries} teacherDirLoaded={tdLoaded}
            trialApplications={trialApplications} setTrialApplications={setTrialApplications}
            englishLevels={englishLevels} learningPurposes={learningPurposes}
            sideTabRequest={sideTabRequest}
            studentMatSubs={studentMatSubs} setStudentMatSubs={setStudentMatSubs}
            setToast={setToast}
          />
        )}
      </main>
    </div>
  );
}
