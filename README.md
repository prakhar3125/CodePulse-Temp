# 🚀 CodePulse Tracker

<div align="center">

</div>

<br />



<br />

CodePulse Tracker is a dynamic, personalized study planner designed to help developers and students master coding problems for interviews and skill-building. It generates a tailored, day-by-day study schedule based on your skill level, desired timeline, and specific topics of interest. Track your progress, take detailed notes, and stay on top of your goals with an intuitive and feature-rich interface.



---

## ✨ Key Features

This application is packed with features to provide a comprehensive and personalized study experience.

#### 🧠 Plan Generation & Customization
* **Personalized Study Plan:** Generates a unique study plan based on your self-assessed skill level (Beginner, Intermediate, Pro), the duration you want to study for, and the topics you want to focus on.
* **🎯 Topic Selection:** Choose from a wide range of essential topics like Arrays, Graphs, Dynamic Programming, and more. Or leave it blank for a well-rounded, comprehensive curriculum.
* **🗓️ Flexible Duration:** Select a preset duration (e.g., 2 Weeks, 1 Month) or input a custom number of days for your study plan.
* **➕ Add Custom Problems:** Easily add your own problems to the schedule, complete with a name, difficulty, topic, and a link to the problem statement.

#### 📊 Productivity & Tracking
* **Interactive Dashboard:** Visualize your progress at a glance. The dashboard features stats on total problems, completed tasks, overall completion percentage, and a progress bar.
* **🔔 Spaced Repetition:** When you complete a problem, the app automatically schedules it for review at increasing intervals to reinforce learning. The dashboard shows how many problems are due for review.
* **📋 Daily Task Manager:** View your problems organized by day. Each day is marked as 'Past', 'Today', or 'Future' with clear visual cues.
* **✅ Progress Tracking:** Mark problems as complete with a single click. The UI updates instantly, striking through the problem name and updating your daily and overall progress.

#### 📝 Enhanced Note-Taking
* **Rich Text Notes:** For every problem, you can add, view, and edit detailed notes with an editor designed for technical documentation.
* **💻 Built-in Code Blocks:** Directly embed code snippets into your notes with syntax highlighting. A toolbar allows you to insert code blocks for various languages (JavaScript, Python, Java, C++).
* **🚀 Note Templates:** Speed up your note-taking with pre-defined templates for `Approach`, `Complexity Analysis`, and `Edge Cases`.
* **🔗 External Links:** Each problem card includes a direct link to its LeetCode page or a custom URL for quick access.

#### 🎨 User Experience
* **🌗 Dark & Light Mode:** Toggle between a sleek dark mode and a clean light mode. Your preference is saved in your browser for a consistent experience.
* **📱 Fully Responsive Design:** The interface is optimized for all screen sizes, from mobile phones to desktops.
* **👤 User Authentication:** A simple and clean authentication page to manage user sessions, with the header displaying the logged-in user's profile.
* **💡 Intuitive UI:** Built with modern design principles and helpful icons from `lucide-react` to make navigation feel natural.
* **🔒 Guided Setup:** A user-friendly modal prevents navigation to the dashboard or tasks before a study plan is generated, guiding the user through the setup process.

---

## 🛠️ Tech Stack

This project is built using a modern and efficient frontend stack.

| Category          | Technology                                                                                                  |
| ----------------- | ----------------------------------------------------------------------------------------------------------- |
| **Core Framework** | [**React.js**](https://reactjs.org/)                                                                        |
| **Styling** | [**Tailwind CSS**](https://tailwindcss.com/)                                                                |
| **Icons** | [**Lucide React**](https://lucide.dev/)                                                                     |
| **Language** | **JavaScript (ES6+)** |
| **State Management**| **React Hooks** (`useState`, `useEffect`)                                                                 |
| **Data Source** | Local `problems.json`                                                                                       |
| **Persistence** | `localStorage` API                                                                                          |

---

## 📦 Installation and Setup

To get a local copy up and running, follow these simple steps.

### Prerequisites

You need to have [Node.js](https://nodejs.org/) (version 14 or later) and [npm](https://www.npmjs.com/) installed on your machine.

### Installation

1.  **Clone the repository:**
    ```sh
    git clone [https://github.com/your-username/codepulse-tracker.git](https://github.com/your-username/codepulse-tracker.git)
    ```

2.  **Navigate to the project directory:**
    ```sh
    cd codepulse-tracker
    ```

3.  **Install NPM packages:**
    ```sh
    npm install
    ```

4.  **Run the application:**
    ```sh
    npm start
    ```
    The app will open in your default browser at `http://localhost:3000`.

---

## 📂 Project Structure

The project is organized into modular components for better maintainability and readability.

| Path                  | Description                                                                 |
| --------------------- | --------------------------------------------------------------------------- |
| `src/`                | Main source directory.                                                      |
| `src/components/`     | Contains all reusable React components.                                     |
| `src/data/`           | Holds the `problems.json` data file.                                        |
| `src/App.js`          | Main application component, handles routing and high-level layout.          |
| `src/StudyPlanner.js` | The core component that manages all application state, logic, and views.    |
| `src/index.js`        | The entry point of the React application.                                   |


---

## ✍️ Author

**Prakhar Sinha**

* **GitHub:** [@prakhar3125](https://github.com/prakhar3125)
* **LinkedIn:** [Prakhar Sinha](https://www.linkedin.com/in/prakhar3125/)