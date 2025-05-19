import React from "react";

export type Department =
  | "Nursing"
  | "Pathology"
  | "Radiology"
  | "Pharmacy"
  | "Administration";
export type Role =
  | "Nurse"
  | "Technician"
  | "Doctor"
  | "Lab Assistant"
  | "Admin Assistant";
export type Shift = "Morning" | "Afternoon" | "Night";

export interface User {
  name: string;
  staffId: string;
  department: Department;
  role: Role;
  shiftPreference: Shift;
  contactNumber: string;
}

interface Props {
  user: User;
}

const UserProfile: React.FC<Props> = ({ user }) => {
  return (
    <div className="max-w-2xl mx-auto p-6 border rounded-lg shadow-md bg-white">
      <h2 className="text-2xl font-bold mb-4">User Profile</h2>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label className="text-sm font-medium">Name</label>
          <span className="text-gray-700">{user.name}</span>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium">Staff ID</label>
          <span className="text-gray-700">{user.staffId}</span>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium">Department</label>
          <span className="text-gray-700">{user.department}</span>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium">Role</label>
          <span className="text-gray-700">{user.role}</span>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium">Shift Preference</label>
          <span className="text-gray-700">{user.shiftPreference}</span>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium">Contact Number</label>
          <span className="text-gray-700">{user.contactNumber}</span>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
