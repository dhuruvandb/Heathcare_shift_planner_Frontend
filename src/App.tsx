import "./App.css";
import AttendanceForm from "./Components/AttendanceForm";
import data from "./data.json";

function App() {
  return (
    <>
      <h1>Heath care</h1>
      <AttendanceForm users={data} mode={"entry"} />
    </>
  );
}

export default App;
