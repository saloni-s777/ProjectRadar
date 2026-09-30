import { useEffect, useState } from "react";
import "./App.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

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

  // Search + filter
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  // Navigation
  const [activePage, setActivePage] = useState("Dashboard");

  // =========================
  // GET PROJECTS
  // =========================

  const fetchProjects = () => {
    fetch(`${API_URL}/api/projects`)
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
      status,
    };

    try {
      if (editingId) {
        const response = await fetch(
          `${API_URL}/api/projects/${editingId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(projectData),
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
          `${API_URL}/api/projects`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(projectData),
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

    setActivePage("Projects");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
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
        `${API_URL}/api/projects/${id}`,
        {
          method: "DELETE",
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
        title: title.trim(),
        status: "Pending",
      },
    ];

    try {
      const response = await fetch(
        `${API_URL}/api/projects/${project._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...project,
            tasks: updatedTasks,
          }),
        }
      );

      if (response.ok) {
        setTaskInputs({
          ...taskInputs,
          [project._id]: "",
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
      status: newStatus,
    };

    try {
      const response = await fetch(
        `${API_URL}/api/projects/${project._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...project,
            tasks: updatedTasks,
          }),
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
        `${API_URL}/api/projects/${project._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...project,
            tasks: updatedTasks,
          }),
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

  const totalTasks = projects.reduce(
    (total, project) => total + (project.tasks || []).length,
    0
  );

  const completedTasks = projects.reduce(
    (total, project) =>
      total +
      (project.tasks || []).filter(
        (task) => task.status === "Completed"
      ).length,
    0
  );

  const overallProgress =
    projects.length > 0
      ? Math.round(
          projects.reduce(
            (total, project) =>
              total + Number(project.progress || 0),
            0
          ) / projects.length
        )
      : 0;

  // =========================
  // STATUS CLASS
  // =========================

  const getStatusClass = (value) => {
    return value
      .toLowerCase()
      .replace(/\s+/g, "-");
  };

  // =========================
  // PROJECT CARD
  // =========================

  const ProjectCard = ({ project }) => {
    const tasks = project.tasks || [];

    const completedProjectTasks = tasks.filter(
      (task) => task.status === "Completed"
    ).length;

    const taskProgress =
      tasks.length > 0
        ? Math.round(
            (completedProjectTasks / tasks.length) * 100
          )
        : Number(project.progress || 0);

    return (
      <div className="project-card">
        <div className="project-card-header">
          <div>
            <h3>{project.name}</h3>

            <p className="project-card-description">
              {project.description ||
                "No project description available."}
            </p>
          </div>

          <span
            className={`status-badge ${getStatusClass(
              project.status
            )}`}
          >
            {project.status}
          </span>
        </div>

        <div className="progress-section">
          <div className="progress-label">
            <span>Project progress</span>
            <strong>{taskProgress}%</strong>
          </div>

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${taskProgress}%`,
              }}
            />
          </div>
        </div>

        <div className="project-meta">
          <div className="project-meta-item">
            <span>Tasks</span>
            <strong>
              {completedProjectTasks}/{tasks.length}
            </strong>
          </div>

          <div className="project-meta-item">
            <span>Progress</span>
            <strong>{taskProgress}%</strong>
          </div>

          <div className="project-meta-item">
            <span>Status</span>
            <strong>{project.status}</strong>
          </div>
        </div>

        <div className="tasks-section">
          <div className="section-header">
            <div>
              <h3>Tasks</h3>
              <p>
                {tasks.length === 0
                  ? "No tasks yet"
                  : `${tasks.length} task${
                      tasks.length > 1 ? "s" : ""
                    }`}
              </p>
            </div>
          </div>

          {tasks.length > 0 && (
            <div className="tasks-list">
              {tasks.map((task, index) => (
                <div
                  className="task-item"
                  key={`${project._id}-${index}`}
                >
                  <div className="task-info">
                    <span>{task.title}</span>
                  </div>

                  <div className="task-actions">
                    <button
                      className={`status-badge ${getStatusClass(
                        task.status
                      )}`}
                      onClick={() =>
                        changeTaskStatus(project, index)
                      }
                      title="Click to change status"
                    >
                      {task.status}
                    </button>

                    <button
                      className="danger-btn"
                      onClick={() =>
                        deleteTask(project, index)
                      }
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="add-task">
            <input
              type="text"
              placeholder="Add a new task..."
              value={taskInputs[project._id] || ""}
              onChange={(event) =>
                setTaskInputs({
                  ...taskInputs,
                  [project._id]:
                    event.target.value,
                })
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  addTask(project);
                }
              }}
            />

            <button
              className="primary-btn"
              onClick={() => addTask(project)}
            >
              + Add Task
            </button>
          </div>
        </div>

        <div className="project-buttons">
          <button
            className="secondary-btn"
            onClick={() => editProject(project)}
          >
            Edit Project
          </button>

          <button
            className="danger-btn"
            onClick={() =>
              deleteProject(project._id)
            }
          >
            Delete
          </button>
        </div>
      </div>
    );
  };

  // =========================
  // DASHBOARD
  // =========================

  const renderDashboard = () => {
    return (
      <>
        <div className="stats">
          <div className="stat-card">
            <div className="stat-card-header">
              <h3>Total Projects</h3>
              <div className="stat-icon">▦</div>
            </div>

            <div className="stat-number">
              {projects.length}
            </div>

            <p>Projects currently in RADAR</p>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <h3>On Track</h3>
              <div className="stat-icon">✓</div>
            </div>

            <div className="stat-number">
              {onTrack}
            </div>

            <p>Projects progressing normally</p>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <h3>At Risk</h3>
              <div className="stat-icon">!</div>
            </div>

            <div className="stat-number">
              {atRisk}
            </div>

            <p>Projects requiring attention</p>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <h3>Completed</h3>
              <div className="stat-icon">★</div>
            </div>

            <div className="stat-number">
              {completed}
            </div>

            <p>Projects successfully completed</p>
          </div>
        </div>

        <div className="analytics-grid">
          <div className="analytics-card">
            <h4>Overall Progress</h4>
            <div className="value">
              {overallProgress}%
            </div>
            <p>Average project completion</p>
          </div>

          <div className="analytics-card">
            <h4>Total Tasks</h4>
            <div className="value">
              {totalTasks}
            </div>
            <p>
              {completedTasks} completed
            </p>
          </div>

          <div className="analytics-card">
            <h4>Task Completion</h4>
            <div className="value">
              {totalTasks > 0
                ? Math.round(
                    (completedTasks /
                      totalTasks) *
                      100
                  )
                : 0}
              %
            </div>
            <p>Across all projects</p>
          </div>
        </div>

        <div className="section">
          <div className="section-header">
            <div>
              <h3>Recent Projects</h3>
              <p>
                A quick overview of your projects
              </p>
            </div>

            <button
              className="secondary-btn"
              onClick={() =>
                setActivePage("Projects")
              }
            >
              View all projects
            </button>
          </div>

          {projects.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                +
              </div>

              <h3>No projects yet</h3>

              <p>
                Create your first project to start
                monitoring progress.
              </p>
            </div>
          ) : (
            <div className="projects-grid">
              {projects
                .slice(0, 4)
                .map((project) => (
                  <ProjectCard
                    key={project._id}
                    project={project}
                  />
                ))}
            </div>
          )}
        </div>
      </>
    );
  };

  // =========================
  // PROJECTS PAGE
  // =========================

  const renderProjects = () => {
    return (
      <>
        <div className="toolbar">
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

          <button
            className="primary-btn"
            onClick={() => {
              setEditingId(null);
              setName("");
              setDescription("");
              setProgress(0);
              setStatus("On Track");

              document
                .getElementById("project-form")
                ?.scrollIntoView({
                  behavior: "smooth",
                });
            }}
          >
            + New Project
          </button>
        </div>

        <div
          className="form-card"
          id="project-form"
        >
          <div className="section-header">
            <div>
              <h3>
                {editingId
                  ? "Edit Project"
                  : "Create New Project"}
              </h3>

              <p>
                {editingId
                  ? "Update project information and progress."
                  : "Add a new project to your RADAR workspace."}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>
                  Project name
                </label>

                <input
                  type="text"
                  placeholder="e.g. Project RADAR"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  Current progress
                </label>

                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="0 - 100"
                  value={progress}
                  onChange={(event) =>
                    setProgress(
                      event.target.value
                    )
                  }
                />
              </div>

              <div className="form-group full">
                <label>
                  Description
                </label>

                <textarea
                  placeholder="Describe what this project is about..."
                  value={description}
                  onChange={(event) =>
                    setDescription(
                      event.target.value
                    )
                  }
                />
              </div>

              <div className="form-group">
                <label>
                  Project status
                </label>

                <select
                  value={status}
                  onChange={(event) =>
                    setStatus(
                      event.target.value
                    )
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
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "20px",
              }}
            >
              <button
                type="submit"
                className="primary-btn"
              >
                {editingId
                  ? "Update Project"
                  : "Create Project"}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={cancelEdit}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="section">
          <div className="section-header">
            <div>
              <h3>All Projects</h3>

              <p>
                Showing{" "}
                {filteredProjects.length} of{" "}
                {projects.length} projects
              </p>
            </div>
          </div>

          {filteredProjects.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                ⌕
              </div>

              <h3>
                No projects found
              </h3>

              <p>
                Try changing your search or
                filter.
              </p>
            </div>
          ) : (
            <div className="projects-grid">
              {filteredProjects.map(
                (project) => (
                  <ProjectCard
                    key={project._id}
                    project={project}
                  />
                )
              )}
            </div>
          )}
        </div>
      </>
    );
  };

  // =========================
  // REPORTS PAGE
  // =========================

  const renderReports = () => {
    return (
      <>
        <div className="analytics-grid">
          <div className="analytics-card">
            <h4>Total Projects</h4>

            <div className="value">
              {projects.length}
            </div>

            <p>
              Projects tracked in RADAR
            </p>
          </div>

          <div className="analytics-card">
            <h4>Average Progress</h4>

            <div className="value">
              {overallProgress}%
            </div>

            <p>
              Across all projects
            </p>
          </div>

          <div className="analytics-card">
            <h4>Task Completion</h4>

            <div className="value">
              {totalTasks > 0
                ? Math.round(
                    (completedTasks /
                      totalTasks) *
                      100
                  )
                : 0}
              %
            </div>

            <p>
              {completedTasks} of{" "}
              {totalTasks} tasks completed
            </p>
          </div>
        </div>

        <div className="section">
          <div className="section-header">
            <div>
              <h3>
                Project Performance
              </h3>

              <p>
                Current progress across all
                projects
              </p>
            </div>
          </div>

          {projects.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                ◫
              </div>

              <h3>
                No data available
              </h3>

              <p>
                Create projects to see
                performance analytics.
              </p>
            </div>
          ) : (
            <div className="tasks-list">
              {projects.map((project) => (
                <div
                  className="task-item"
                  key={project._id}
                >
                  <div className="task-info">
                    <div>
                      <strong>
                        {project.name}
                      </strong>

                      <div
                        style={{
                          marginTop: "6px",
                          width: "280px",
                          maxWidth: "50vw",
                        }}
                      >
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{
                              width: `${project.progress || 0}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <strong>
                      {project.progress || 0}%
                    </strong>

                    <span
                      className={`status-badge ${getStatusClass(
                        project.status
                      )}`}
                    >
                      {project.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </>
    );
  };

  // =========================
  // PAGE TITLE
  // =========================

  const pageDescriptions = {
    Dashboard:
      "A clear overview of your projects and progress.",
    Projects:
      "Manage projects, tasks, progress and status.",
    Reports:
      "Monitor project performance and completion.",
  };

  // =========================
  // MAIN UI
  // =========================

  return (
    <div className="app">
      {/* SIDEBAR */}

      <aside className="sidebar">
        <div className="logo">
          <h1>RADAR</h1>
          <p>
            Project Integration
          </p>
        </div>

        <nav>
          <button
            className={
              activePage === "Dashboard"
                ? "active"
                : ""
            }
            onClick={() =>
              setActivePage("Dashboard")
            }
          >
            ◈
            <span>Dashboard</span>
          </button>

          <button
            className={
              activePage === "Projects"
                ? "active"
                : ""
            }
            onClick={() =>
              setActivePage("Projects")
            }
          >
            ▦
            <span>Projects</span>
          </button>

          <button
            className={
              activePage === "Reports"
                ? "active"
                : ""
            }
            onClick={() =>
              setActivePage("Reports")
            }
          >
            ◫
            <span>Reports</span>
          </button>
        </nav>

        <div className="sidebar-bottom">
          <button
            onClick={() =>
              alert(
                "Settings will be available in a future version."
              )
            }
          >
            ⚙
            <span>Settings</span>
          </button>
        </div>
      </aside>

      {/* MAIN */}

      <main className="main">
        <header className="header">
          <div>
            <h2>{activePage}</h2>

            <p>
              {pageDescriptions[activePage]}
            </p>
          </div>

          <div className="header-actions">
            <div className="user-profile">
              <div className="user-avatar">
                R
              </div>

              <div className="user-info">
                <strong>
                  RADAR Workspace
                </strong>

                <span>
                  Project Management
                </span>
              </div>
            </div>
          </div>
        </header>

        {activePage === "Dashboard" &&
          renderDashboard()}

        {activePage === "Projects" &&
          renderProjects()}

        {activePage === "Reports" &&
          renderReports()}
      </main>
    </div>
  );
}

export default App;