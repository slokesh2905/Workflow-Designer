# HR Workflow Designer

A professional, engineer-grade visual designer for HR processes. This project demonstrates a robust implementation of a node-based graph editor with real-time validation, simulation capabilities, and state-of-the-art developer experience patterns.

## Overview
The **HR Workflow Designer** is a production-ready demonstration of a complex React-based drag-and-drop tool. It allows HR administrators to visually model workflows (e.g., employee onboarding, performance reviews), validate logic in real-time, and simulate executions against a mocked backend.

## Tech Stack
- **Framework**: Vite + React 18 + TypeScript (Strict Mode)
- **Graph Engine**: [React Flow](https://reactflow.dev/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) with **Immer** for immutable updates and snapshot-based history.
- **Styling**: **Tailwind CSS v4** (utilizing native CSS variables and @theme syntax).
- **API Mocking**: [Mock Service Worker (MSW) v2](https://mswjs.io/) – handles simulation logic and data fetching.
- **Layout Engine**: [Dagre](https://github.com/dagrejs/dagre) – hierarchical auto-positioning.
- **Validation**: Custom DFS-based graph validation engine.

## Architecture
The project follows a strict separation of concerns, optimized for scalability and testing:

```text
src/
├── components/
│   ├── nodes/      # Atomic React Flow node shells (Visual layer)
│   ├── forms/      # Dynamic node property editors (Input layer)
│   ├── panels/     # Layout shells (Sidebar, Toolbar, Sandbox)
│   └── ui/         # Reusable design system primitives
├── store/          # Centralized Zustand store (Business logic & Undo/Redo)
├── mocks/          # MSW handlers (Topological sorts & Simulation engine)
├── types/          # Centralized TypeScript definitions and enums
├── utils/          # Pure functions (Layout logic, graph validation, factories)
└── hooks/          # Specialized logic (Live fetching, keyboard listeners)
```

### Key Design Decisions
- **Live Updates vs. Atomic History**: Form changes update the canvas via `onChange` for instant feedback, but history snapshots (`pushHistory`) are only triggered on `onBlur`. This keeps the undo-stack clean of "intermediate character states."
- **Topological Simulation**: The simulation engine (in MSW) uses Kahn’s algorithm to determine execution order, ensuring the "Execution Timeline" reflects logical flow rather than array order.
- **Pure Functional Core**: Validation and Layout logic are decoupled from React, allowing them to be unit-tested in isolation or even shared with a backend.

## How to Run
1.  **Clone & Install**:
    ```bash
    npm install
    ```
2.  **Start Development Server**:
    ```bash
    npm run dev
    ```
3.  **MSW Integration**: MSW is configured to start automatically in development mode. You will see a `[MSW] Mocking enabled` message in the console.

## Node Types
| Type | icon | Description | Key Fields |
| :--- | :--- | :--- | :--- |
| **Start** | ▶ | Entry point | Workflow title, metadata |
| **Task** | □ | Human task | Assignee, Due Date, Custom fields |
| **Approval** | ☑ | Sign-off | Approver Role, Auto-approve threshold |
| **Automated** | ⚡ | Service call | Action ID (API-driven), Dynamic params |
| **End** | ■ | Terminal | Completion message, Summary report toggle |

## Features Implemented
- [x] **Interactive Canvas**: Drag-and-drop node creation with coordinate conversion.
- [x] **Dynamic Forms**: Auto-switching property panels with live feedback.
- [x] **Real-time Validation**: Real-time checking for cycles, missing connections, and required fields.
- [x] **Simulation Sandbox**: Execution timeline with success/error reporting based on topological sorting.
- [x] **Auto Layout**: One-click graph organization using Dagre.
- [x] **Persistence**: Export/Import JSON workflows with layout preservation.
- [x] **History Engine**: Global Undo/Redo with standard keyboard shortcuts (`Ctrl+Z`, `Ctrl+Y`).
- [x] **Visual Feedback**: Warning badges (⚠) on invalid nodes and health indicators in the sidebar.

## What I'd add with more time
- **Backend Persistence**: Replace MSW with a real PostgreSQL/Node.js backend for multi-user storage.
- **Authentication**: RBAC (Role-Based Access Control) to restrict who can edit certain node types (e.g., HR Director only for VP approvals).
- **Node Templates**: Pre-configured sub-graphs for common HR patterns (e.g., "Standard 2-week notice flow").
- **Version History**: Comparing snapshots and rolling back to specific named versions.
- **Collaborative Editing**: Potential integration with Yjs for CRDT-based real-time coordination.

## Assumptions made
1. **Linear Logic**: While multi-path branching is supported, the simulation engine currently assumes a single successful path for the sake of the execution timeline walkthrough.
2. **Single Start Node**: The design system assumes a single entry point for a workflow to maintain process determinism.
3. **Internal Tools**: The UI is optimized for a desktop "internal tools" experience rather than a mobile-first audience.
