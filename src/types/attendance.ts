export interface AttendanceType {
  staffId: string;
  date: string;
  shiftType: "Morning" | "Afternoon" | "Night";
  status: "Present" | "Absent" | "On Leave";
  remarks: string;
}

export interface AttendanceSummary {
  _id: string;
  totalPresent: number;
  totalAbsent: number;
  totalLeave: number;
}
