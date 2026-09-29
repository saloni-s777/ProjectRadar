import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [projects, setProjects] = useState([]);

  // Project form
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("On Track");

  // Edit project
  const [editingId, setEditingId] = useState(null);

  // Task input
  const [taskInputs, setTaskInputs] = useState({});

  // Search + Filter
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");


  // =========================
  // GET PROJECTS
  // =========================

  const fetchProjects = () => {
    fetch("http://localhost:5000/api/projects")
      .then((response) => response.json())
      .then((data) => {
        setProjects(data);
      })
      .catch((error) => {
        console.error("Error fetching projects:", error);
      });
  };


  useEffect(() => {
    fetchProjects();
  }, []);


  // =========================
  // ADD / UPDATE PROJECT
  // =========================

  const handleSubmit = async (event) => {
    event.preventDefault();

    const projectData = {
      name,
      description,
      progress: Number(progress),
      status
    };

    try {

      if (editingId) {

        const response = await fetch(
          `http://localhost:5000/api/projects/${editingId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(projectData)
          }
        );

        if (response.ok) {
          alert("Project updated successfully!");

          setEditingId(null);
          setName("");
          setDescription("");
          setProgress(0);
          setStatus("On Track");

          fetchProjects();
        }

      } else {

        const response = await fetch(
          "http://localhost:5000/api/projects",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(projectData)
          }
        );

        if (response.ok) {
          alert("Project added successfully!");

          setName("");
          setDescription("");
          setProgress(0);
          setStatus("On Track");

          fetchProjects();
        }
      }

    } catch (error) {
      console.error("Error saving project:", error);
    }
  };


  // =========================
  // EDIT PROJECT
  // =========================

  const editProject = (project) => {
    setEditingId(project._id);

    setName(project.name);
    setDescription(project.description || "");
    setProgress(project.progress);
    setStatus(project.status);

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };


  // =========================
  // DELETE PROJECT
  // =========================

  const deleteProject = async (id) => {

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this project?"
    );

    if (!confirmDelete) {
      return;
    }

    try {

      const response = await fetch(
        `http://localhost:5000/api/projects/${id}`,
        {
          method: "DELETE"
        }
      );

      if (response.ok) {
        alert("Project deleted successfully!");
        fetchProjects();
      }

    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };


  // =========================
  // CANCEL EDIT
  // =========================

  const cancelEdit = () => {
    setEditingId(null);

    setName("");
    setDescription("");
    setProgress(0);
    setStatus("On Track");
  };


  // =========================
  // ADD TASK
  // =========================

  const addTask = async (project) => {

    const title = taskInputs[project._id];

    if (!title || title.trim() === "") {
      return;
    }

    const existingTasks = project.tasks || [];

    const updatedTasks = [
      ...existingTasks,
      {
        title: title,
        status: "Pending"
      }
    ];

    try {

      const response = await fetch(
        `http://localhost:5000/api/projects/${project._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            ...project,
            tasks: updatedTasks
          })
        }
      );

      if (response.ok) {

        setTaskInputs({
          ...taskInputs,
          [project._id]: ""
        });

        fetchProjects();
      }

    } catch (error) {
      console.error("Error adding task:", error);
    }
  };


  // =========================
  // CHANGE TASK STATUS
  // =========================

  const changeTaskStatus = async (project, taskIndex) => {

    const updatedTasks = [...(project.tasks || [])];

    const currentStatus = updatedTasks[taskIndex].status;

    let newStatus = "Pending";

    if (currentStatus === "Pending") {
      newStatus = "In Progress";
    } else if (currentStatus === "In Progress") {
      newStatus = "Completed";
    } else {
      newStatus = "Pending";
    }

    updatedTasks[taskIndex] = {
      ...updatedTasks[taskIndex],
      status: newStatus
    };

    try {

      const response = await fetch(
        `http://localhost:5000/api/projects/${project._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            ...project,
            tasks: updatedTasks
          })
        }
      );

      if (response.ok) {
        fetchProjects();
      }

    } catch (error) {
      console.error("Error changing task status:", error);
    }
  };


  // =========================
  // DELETE TASK
  // =========================

  const deleteTask = async (project, taskIndex) => {

    const updatedTasks = [...(project.tasks || [])];

    updatedTasks.splice(taskIndex, 1);

    try {

      const response = await fetch(
        `http://localhost:5000/api/projects/${project._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            ...project,
            tasks: updatedTasks
          })
        }
      );

      if (response.ok) {
        fetchProjects();
      }

    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };


  // =========================
  // SEARCH + FILTER
  // =========================

  const filteredProjects = projects.filter((project) => {

    const searchText = search.toLowerCase();

    const matchesSearch =
      project.name.toLowerCase().includes(searchText) ||
      (project.description || "")
        .toLowerCase()
        .includes(searchText);

    const matchesStatus =
      filterStatus === "All" ||
      project.status === filterStatus;

    return matchesSearch && matchesStatus;
  });


  // =========================
  // DASHBOARD COUNTS
  // =========================

  const onTrack = projects.filter(
    (project) => project.status === "On Track"
  ).length;

  const atRisk = projects.filter(
    (project) => project.status === "At Risk"
  ).length;

  const completed = projects.filter(
    (project) => project.status === "Completed"
  ).length;


  return (
    <div className="app">

      {/* SIDEBAR */}

      <aside className="sidebar">

        <h1>RADAR</h1>

        <nav>
          <p>Dashboard</p>
          <p>Projects</p>
          <p>Reports</p>
          <p>Settings</p>
        </nav>

      </aside>


      {/* MAIN */}

      <main className="main">

        <header>

          <h2>Project Monitoring Dashboard</h2>

          <p>
            Track and monitor your projects
          </p>

        </header>


        {/* STATS */}

        <section className="stats">

          <div className="card">
            <h3>Total Projects</h3>
            <strong>{projects.length}</strong>
          </div>

          <div className="card">
            <h3>On Track</h3>
            <strong>{onTrack}</strong>
          </div>

          <div className="card">
            <h3>At Risk</h3>
            <strong>{atRisk}</strong>
          </div>

          <div className="card">
            <h3>Completed</h3>
            <strong>{completed}</strong>
          </div>

        </section>


        {/* SEARCH + FILTER */}

        <section className="search-section">

          <div className="search-box">

            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />

          </div>


          <select
            value={filterStatus}
            onChange={(event) =>
              setFilterStatus(event.target.value)
            }
          >

            <option value="All">
              All Status
            </option>

            <option value="On Track">
              On Track
            </option>

            <option value="At Risk">
              At Risk
            </option>

            <option value="Completed">
              Completed
            </option>

          </select>

        </section>


        {/* ADD / EDIT PROJECT */}

        <section className="add-project">

          <h2>
            {editingId
              ? "Edit Project"
              : "Add New Project"}
          </h2>

          <form onSubmit={handleSubmit}>

            <input
              type="text"
              placeholder="Project name"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              required
            />

            <input
              type="text"
              placeholder="Description"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
            />

            <input
              type="number"
              placeholder="Progress"
              min="0"
              max="100"
              value={progress}
              onChange={(event) =>
                setProgress(event.target.value)
              }
            />

            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value)
              }
            >

              <option value="On Track">
                On Track
              </option>

              <option value="At Risk">
                At Risk
              </option>

              <option value="Completed">
                Completed
              </option>

            </select>

            <button type="submit">

              {editingId
                ? "Update Project"
                : "Add Project"}

            </button>

            {editingId && (

              <button
                type="button"
                className="cancel-button"
                onClick={cancelEdit}
              >
                Cancel
              </button>

            )}

          </form>

        </section>


        {/* PROJECTS */}

        <section>

          <div className="projects-heading">

            <h2>Projects</h2>

            <p>
              Showing {filteredProjects.length} of{" "}
              {projects.length} projects
            </p>

          </div>


          <div className="projects">

            {filteredProjects.length === 0 ? (

              <div className="no-results">

                <h3>No projects found</h3>

                <p>
                  Try changing your search or filter.
                </p>

              </div>

            ) : (

              filteredProjects.map((project) => {

                const tasks = project.tasks || [];

                const completedTasks = tasks.filter(
                  (task) =>
                    task.status === "Completed"
                ).length;

                const taskProgress =
                  tasks.length > 0
                    ? Math.round(
                        (completedTasks /
                          tasks.length) *
                          100
                      )
                    : project.progress;

                return (

                  <div
                    className="project-card"
                    key={project._id}
                  >

                    <h3>
                      {project.name}
                    </h3>

                    <p>
                      {project.description}
                    </p>

                    <p>
                      <strong>
                        Progress:
                      </strong>{" "}
                      {taskProgress}%
                    </p>

                    <div className="progress-bar">

                      <div
                        className="progress"
                        style={{
                          width:
                            `${taskProgress}%`
                        }}
                      ></div>

                    </div>

                    <p>
                      <strong>
                        Status:
                      </strong>{" "}
                      {project.status}
                    </p>


                    {/* TASKS */}

                    <div className="tasks-section">

                      <h4>Tasks</h4>

                      {tasks.length === 0 && (

                        <p className="no-tasks">
                          No tasks added yet.
                        </p>

                      )}


                      {tasks.map(
                        (task, index) => (

                          <div
                            className="task-item"
                            key={index}
                          >

                            <div>

                              <strong>
                                {task.title}
                              </strong>

                              <span
                                className={
                                  `task-status ${
                                    task.status
                                      .toLowerCase()
                                      .replace(
                                        " ",
                                        "-"
                                      )
                                  }`
                                }
                              >
                                {task.status}
                              </span>

                            </div>


                            <div className="task-actions">

                              <button
                                onClick={() =>
                                  changeTaskStatus(
                                    project,
                                    index
                                  )
                                }
                              >
                                Change Status
                              </button>

                              <button
                                className="task-delete"
                                onClick={() =>
                                  deleteTask(
                                    project,
                                    index
                                  )
                                }
                              >
                                Delete
                              </button>

                            </div>

                          </div>

                        )
                      )}


                      {/* ADD TASK */}

                      <div className="add-task">

                        <input
                          type="text"
                          placeholder="Enter new task"
                          value={
                            taskInputs[
                              project._id
                            ] || ""
                          }
                          onChange={(event) =>
                            setTaskInputs({
                              ...taskInputs,
                              [project._id]:
                                event.target.value
                            })
                          }
                        />

                        <button
                          onClick={() =>
                            addTask(project)
                          }
                        >
                          Add Task
                        </button>

                      </div>

                    </div>


                    {/* PROJECT BUTTONS */}

                    <div className="project-buttons">

                      <button
                        className="edit-button"
                        onClick={() =>
                          editProject(project)
                        }
                      >
                        Edit
                      </button>

                      <button
                        className="delete-button"
                        onClick={() =>
                          deleteProject(
                            project._id
                          )
                        }
                      >
                        Delete
                      </button>

                    </div>

                  </div>

                );
              })

            )}

          </div>

        </section>

      </main>

    </div>
  );
}

export default App;