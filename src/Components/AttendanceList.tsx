import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import axios from "axios";
import { debounce } from "lodash";

type Department =
  | "Cardiology"
  | "Emergency"
  | "Radiology"
  | "ICU"
  | "General Medicine";
type Role =
  | "Nurse"
  | "Technician"
  | "Doctor"
  | "Lab Assistant"
  | "Admin Assistant";
type Shift = "Morning" | "Afternoon" | "Night";

interface User {
  _id: string;
  name: string;
  staffId: string;
  department: Department;
  role: Role;
  shift: Shift;
  contactNumber: string;
  email?: string;
  passwordHash?: string;
}

interface AttendanceRecord extends User {
  status: "Present" | "Absent" | "Leave";
  date: string;
}

const AttendanceList: React.FC = () => {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [mode, setMode] = useState<"entry" | "view">("entry");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<
    Partial<Record<keyof User | "status", string>>
  >({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 20;
  const [selectedDate, setSelectedDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );
  const [modifiedRecords, setModifiedRecords] = useState<
    Record<string, AttendanceRecord>
  >({});
  const [conflictIds, setConflictIds] = useState<string[]>([]);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  const today = format(new Date(), "yyyy-MM-dd");
  const isFutureDate = new Date(selectedDate) > new Date(today);
  const [expandedGroup, setExpandedGroup] = useState<{
    department: Department;
    role: Role;
  } | null>(null);

  const fetchAttendanceData = async (page = 1) => {
    try {
      const url = `http://localhost:5000/attendance?page=${page}&limit=${itemsPerPage}`;
      const res = await axios.get(url);
      const { data, total } = res.data;
      setAttendance(data);
      setTotalPages(Math.ceil(total / itemsPerPage));
    } catch (e) {
      console.error("Failed to fetch attendance data", e);
    }
  };

  useEffect(() => {
    fetchAttendanceData(currentPage);
  }, [search, filters, selectedDate, currentPage]);

  const debouncedSearch = debounce(async (value: string) => {
    try {
      const url = `http://localhost:5000/attendance?search=${value}`;
      const res = await axios.get(url);
      const { data, total } = res.data;
      setAttendance(data);
      setTotalPages(Math.ceil(total / itemsPerPage));
    } catch (err) {
      console.error("Search fetch failed", err);
    }
  }, 500);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    debouncedSearch(value);
  };

  const handleFilterChange = (key: keyof User | "status", value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleStatusChange = (
    id: string,
    status: "Present" | "Absent" | "Leave"
  ) => {
    if (isFutureDate) return;
    setAttendance((prev) =>
      prev.map((item) => (item._id === id ? { ...item, status } : item))
    );
    const existing = attendance.find((u) => u._id === id);
    if (existing) {
      setModifiedRecords((prev) => ({
        ...prev,
        [id]: {
          ...existing,
          date: selectedDate,
          status,
        },
      }));
    }
  };

  const handleShiftChange = (id: string, shift: Shift) => {
    if (!isFutureDate) return;

    const existing = attendance.find((u) => u._id === id);
    if (!existing) return;

    // Set expanded group for UI display
    setExpandedGroup({
      department: existing.department,
      role: existing.role,
    });

    setAttendance((prev) =>
      prev.map((item) => (item._id === id ? { ...item, shift } : item))
    );

    setModifiedRecords((prev) => ({
      ...prev,
      [id]: {
        ...existing,
        date: selectedDate,
        shift,
      },
    }));
  };

  const handleSubmit = async () => {
    const recordsToSubmit = Object.values(modifiedRecords);

    if (mode === "entry" && isFutureDate) {
      const shiftMap = new Map<string, string[]>();
      for (const record of recordsToSubmit) {
        const key = `${record.date}-${record.department}-${record.role}-${record.shift}`;
        if (!shiftMap.has(key)) shiftMap.set(key, []);
        shiftMap.get(key)!.push(record._id);
      }

      const conflicts: string[] = [];
      for (const ids of shiftMap.values()) {
        if (ids.length > 1) {
          conflicts.push(...ids);
        }
      }

      if (conflicts.length > 0) {
        setConflictIds(conflicts);
        setConflictWarning(
          "⚠️ Conflict detected: Multiple staff with same department, role, and shift. Please resolve."
        );
        return;
      }
    }

    try {
      await axios.put("http://localhost:5000/attendance", recordsToSubmit);
      setModifiedRecords({});
      setConflictIds([]);
      setConflictWarning(null);
      fetchAttendanceData(currentPage);
    } catch (err) {
      console.error("Submission failed", err);
    }
  };

  const enums = {
    department: [
      "Cardiology",
      "Emergency",
      "Radiology",
      "ICU",
      "General Medicine",
    ],
    role: ["Nurse", "Technician", "Doctor", "Lab Assistant", "Admin Assistant"],
    shift: ["Morning", "Afternoon", "Night"],
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-gray-800">
          Attendance - {selectedDate}
        </h1>
        <button
          onClick={() =>
            setMode((prev) => (prev === "entry" ? "view" : "entry"))
          }
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          {mode === "entry" ? "View" : "Entry"} Mode
        </button>
      </div>

      <input
        type="text"
        placeholder="Search by name or staff ID"
        className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={search}
        onChange={handleSearchChange}
      />

      <div className="flex items-center space-x-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Select Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            max={format(
              new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
              "yyyy-MM-dd"
            )}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="overflow-x-auto border rounded-md shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 text-sm text-gray-800">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Staff ID</th>
              <th className="px-4 py-3">
                <select
                  onChange={(e) =>
                    handleFilterChange("department", e.target.value)
                  }
                  value={filters.department || ""}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md"
                >
                  <option value="">Department</option>
                  {enums.department.map((dep) => (
                    <option key={dep} value={dep}>
                      {dep}
                    </option>
                  ))}
                </select>
              </th>
              <th className="px-4 py-3">
                <select
                  onChange={(e) => handleFilterChange("role", e.target.value)}
                  value={filters.role || ""}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md"
                >
                  <option value="">Role</option>
                  {enums.role.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">
                <select
                  onChange={(e) => handleFilterChange("shift", e.target.value)}
                  value={filters.shift || ""}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md"
                >
                  <option value="">Shift</option>
                  {enums.shift.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </th>
              {!isFutureDate && (
                <th className="px-4 py-3">
                  <select
                    onChange={(e) =>
                      handleFilterChange("status", e.target.value)
                    }
                    value={filters.status || ""}
                    className="w-full px-2 py-1 border border-gray-300 rounded-md"
                  >
                    <option value="">Status</option>
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                    <option value="Leave">Leave</option>
                  </select>
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {attendance
              .filter((user) => {
                const matchesSearch =
                  user.name.toLowerCase().includes(search.toLowerCase()) ||
                  user.staffId.toLowerCase().includes(search.toLowerCase());

                const matchesFilters = Object.entries(filters).every(
                  ([key, value]) =>
                    !value || user[key as keyof typeof user] === value
                );

                const isInConflictView =
                  conflictIds.length === 0 || conflictIds.includes(user._id);

                // 👇 NEW: expand full department-role group if shift is being edited
                const isInExpandedGroup =
                  !isFutureDate || mode !== "entry" || !expandedGroup
                    ? true
                    : user.department === expandedGroup.department &&
                      user.role === expandedGroup.role;

                return (
                  matchesSearch &&
                  matchesFilters &&
                  isInConflictView &&
                  isInExpandedGroup
                );
              })

              .map((user) => {
                const isConflict = conflictIds.includes(user._id);
                console.log(isConflict);

                return (
                  <tr
                    key={user._id}
                    className={
                      isConflict
                        ? "bg-red-500 text-white"
                        : user.shift === "Morning"
                        ? "bg-yellow-300 text-black"
                        : user.shift === "Afternoon"
                        ? "bg-orange-400 text-black"
                        : "bg-blue-600 text-white"
                    }
                  >
                    <td className="px-4 py-2">{user.name}</td>
                    <td className="px-4 py-2">{user.staffId}</td>
                    <td className="px-4 py-2">{user.department}</td>
                    <td className="px-4 py-2">{user.role}</td>
                    <td className="px-4 py-2">{selectedDate}</td>
                    <td className="px-4 py-2">
                      {mode === "entry" && isFutureDate ? (
                        <select
                          value={user.shift}
                          onChange={(e) =>
                            handleShiftChange(user._id, e.target.value as Shift)
                          }
                          className="border border-gray-300 rounded-md px-2 py-1"
                        >
                          {enums.shift.map((shift) => (
                            <option key={shift} value={shift}>
                              {shift}
                            </option>
                          ))}
                        </select>
                      ) : (
                        user.shift
                      )}
                    </td>
                    {!isFutureDate && (
                      <td className="px-4 py-2">
                        {mode === "entry" ? (
                          <select
                            value={user.status}
                            onChange={(e) =>
                              handleStatusChange(
                                user._id,
                                e.target.value as "Present" | "Absent" | "Leave"
                              )
                            }
                            className="border border-gray-300 rounded-md px-2 py-1"
                          >
                            <option value="Present">Present</option>
                            <option value="Absent">Absent</option>
                            <option value="Leave">Leave</option>
                          </select>
                        ) : (
                          user.status
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {conflictWarning && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {conflictWarning}
        </div>
      )}

      {mode === "entry" && (
        <div className="text-right">
          <button
            className="mt-4 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
            onClick={handleSubmit}
          >
            Submit Attendance
          </button>
        </div>
      )}
    </div>
  );
};

export default AttendanceList;
