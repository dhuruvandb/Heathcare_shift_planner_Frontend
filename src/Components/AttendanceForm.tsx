import React, { useState, useEffect } from "react";
import { format, subDays } from "date-fns";

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

export interface AttendanceRecord extends User {
  status: "Present" | "Absent" | "Leave";
  date: string;
}

interface Props {
  users: User[];
  mode: "entry" | "view";
}

const AttendanceForm: React.FC<Props> = ({ users: initialUsers }) => {
  const [mode, setMode] = useState<"entry" | "view">("entry");
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Partial<Record<keyof User, string>>>(
    {}
  );
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [selectedDate, setSelectedDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );
  const [dateRange, setDateRange] = useState<string>("last-30-days");

  const [modifiedRecords, setModifiedRecords] = useState<
    Record<string, AttendanceRecord>
  >({});

  const today = format(new Date(), "yyyy-MM-dd");
  const isFutureDate = new Date(selectedDate) > new Date(today);

  useEffect(() => {
    if (mode === "view") {
      fetchAllUsers();
    } else {
      initializeAttendance(initialUsers);
    }
  }, [mode]);

  useEffect(() => {
    filterByDate(selectedDate);
  }, [selectedDate, dateRange]);

  const initializeAttendance = (users: User[]) => {
    const initialized = users.map((user) => ({
      ...user,
      status: "Present" as const,
      date: selectedDate,
    }));
    setAttendance(initialized);
  };

  const fetchAllUsers = () => {
    const mockFetch = new Promise<User[]>((resolve) => {
      setTimeout(() => {
        resolve(initialUsers);
      }, 500);
    });

    mockFetch.then((data) => {
      const records = data.map((user) => ({
        ...user,
        status: "Present" as const,
        date: selectedDate,
      }));
      setAttendance(records);
    });
  };

  const handleStatusChange = (
    id: string,
    status: "Present" | "Absent" | "Leave"
  ) => {
    setAttendance((prev) =>
      prev.map((item) => (item._id === id ? { ...item, status } : item))
    );

    setModifiedRecords((prev) => {
      const existing = attendance.find((u) => u._id === id);
      if (!existing) return prev;
      const updated = { ...existing, ...prev[id], status };
      return { ...prev, [id]: updated };
    });
  };

  const handleShiftChange = (id: string, shift: Shift) => {
    setAttendance((prev) =>
      prev.map((item) => (item._id === id ? { ...item, shift } : item))
    );

    setModifiedRecords((prev) => {
      const existing = attendance.find((u) => u._id === id);
      if (!existing) return prev;
      const updated = { ...existing, ...prev[id], shift };
      return { ...prev, [id]: updated };
    });
  };

  const handleFilterChange = (key: keyof User, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const filterByDate = (date: string) => {
    setAttendance((prev) =>
      prev.filter((user) => {
        const userDate = user.date;
        if (dateRange === "last-30-days") {
          const thirtyDaysAgo = subDays(new Date(), 30);
          return new Date(userDate) >= thirtyDaysAgo;
        }
        return userDate === date;
      })
    );
  };

  const filteredUsers = attendance.filter((user) => {
    const searchMatch =
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.staffId.toLowerCase().includes(search.toLowerCase());

    const filterMatch = Object.entries(filters).every(
      ([key, value]) => (user as any)[key] === value
    );

    return searchMatch && filterMatch;
  });

  const enums = {
    department: [
      "Nursing",
      "Pathology",
      "Radiology",
      "Pharmacy",
      "Administration",
    ],
    role: ["Nurse", "Technician", "Doctor", "Lab Assistant", "Admin Assistant"],
    shift: ["Morning", "Afternoon", "Night"],
  };

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const displayedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSubmit = async () => {
    const recordsToSubmit = Object.values(modifiedRecords);
    console.log(recordsToSubmit);

    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(recordsToSubmit),
      });

      const data = await res.json();
      console.log("Submitted successfully", data);

      setModifiedRecords({});
    } catch (err) {
      console.error("Submission failed", err);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Attendance - {selectedDate}</h1>
        <button
          onClick={() =>
            setMode((prev) => (prev === "entry" ? "view" : "entry"))
          }
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
        >
          {mode === "entry" ? "View" : "Entry"}
        </button>
      </div>

      <input
        type="text"
        placeholder="Search by name or staff ID"
        className="mb-4 px-4 py-2 border rounded w-full"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {(mode === "view" || mode === "entry") && (
        <div className="mb-4 flex space-x-4">
          <div>
            <label className="block text-sm font-medium">Select Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border rounded"
            />
          </div>

          {mode === "view" && (
            <div>
              <label className="block text-sm font-medium">Date Range</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border rounded"
              >
                <option value="last-30-days">Last 30 Days</option>
                <option value="specific-date">Specific Date</option>
              </select>
            </div>
          )}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left border">Name</th>
              <th className="p-2 text-left border">Staff ID</th>
              <th className="p-2 text-left border">
                <select
                  className="w-full bg-white border rounded"
                  onChange={(e) =>
                    handleFilterChange("department", e.target.value)
                  }
                  value={filters.department || ""}
                >
                  <option value="">Department</option>
                  {enums.department.map((dep) => (
                    <option key={dep} value={dep}>
                      {dep}
                    </option>
                  ))}
                </select>
              </th>
              <th className="p-2 text-left border">
                <select
                  className="w-full bg-white border rounded"
                  onChange={(e) => handleFilterChange("role", e.target.value)}
                  value={filters.role || ""}
                >
                  <option value="">Role</option>
                  {enums.role.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </th>
              <th className="p-2 text-left border">Attendance Date</th>
              <th className="p-2 text-left border">
                <select
                  className="w-full bg-white border rounded"
                  onChange={(e) => handleFilterChange("shift", e.target.value)}
                  value={filters.shift || ""}
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
                <th className="p-2 text-left border">
                  <select
                    className="w-full bg-white border rounded"
                    onChange={(e) =>
                      handleFilterChange("status", e.target.value)
                    }
                    value={filters.status || ""}
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
          <tbody>
            {displayedUsers.map((user) => (
              <tr key={user._id} className="border-t">
                <td className="p-2 border">{user.name}</td>
                <td className="p-2 border">{user.staffId}</td>
                <td className="p-2 border">{user.department}</td>
                <td className="p-2 border">{user.role}</td>
                <td className="p-2 border">{selectedDate}</td>
                <td className="p-2 border">
                  {mode === "entry" ? (
                    <select
                      value={user.shift}
                      onChange={(e) =>
                        handleShiftChange(user._id, e.target.value as Shift)
                      }
                      className="border rounded px-2 py-1"
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
                  <td className="p-2 border">
                    {mode === "entry" ? (
                      <select
                        value={user.status}
                        onChange={(e) =>
                          handleStatusChange(
                            user._id,
                            e.target.value as "Present" | "Absent" | "Leave"
                          )
                        }
                        className="border rounded px-2 py-1"
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
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <div>
          Page {currentPage} of {totalPages}
        </div>
        <div className="space-x-2">
          <button
            className="px-3 py-1 border rounded"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            Prev
          </button>
          <button
            className="px-3 py-1 border rounded"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            Next
          </button>
        </div>
      </div>

      {mode === "entry" && (
        <button
          className="mt-6 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={handleSubmit}
        >
          Submit
        </button>
      )}
    </div>
  );
};

export default AttendanceForm;
