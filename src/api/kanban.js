import { useMemo } from 'react';
import axiosInstance from 'src/utils/axios';
import useSWR, { mutate } from 'swr';

// ----------------------------------------------------------------------

export async function updateTaskStatus(taskId, newStatus, newColumnId) {
  /**
   * Work in local
   */
  mutate(
    KANBAN_API_KEY,
    (currentData) => {
      if (!currentData) return currentData;

      // Update the task's status
      const updatedTasks = {
        ...currentData.tasks,
        [taskId]: {
          ...currentData.tasks[taskId],
          status: newStatus,
        },
      };

      // Move task to appropriate column if needed
      const updatedColumns = { ...currentData.columns };
      
      // Remove task from all columns first
      Object.keys(updatedColumns).forEach(columnId => {
        updatedColumns[columnId] = {
          ...updatedColumns[columnId],
          taskIds: updatedColumns[columnId].taskIds.filter(id => id !== taskId)
        };
      });
      
      // Add task to the correct column
      if (updatedColumns[newColumnId]) {
        updatedColumns[newColumnId] = {
          ...updatedColumns[newColumnId],
          taskIds: [...updatedColumns[newColumnId].taskIds, taskId]
        };
      }

      return {
        ...currentData,
        tasks: updatedTasks,
        columns: updatedColumns,
      };
    },
    false
  );

  /**
   * Work on server - uncomment when ready to sync with backend
   */
  // const data = { taskId, newStatus, newColumnId };
  // await axios.post(endpoints.kanban, data, { params: { endpoint: 'update-task-status' } });
}

// ----------------------------------------------------------------------

const KANBAN_API_KEY = 'http://localhost:8222/api/planTravail/etudiant/243AMT0464';

const options = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

export function useGetBoard() {
  const { data, isLoading, error, isValidating } = useSWR(
    KANBAN_API_KEY,
    async (url) => {
      const response = await fetch(url);
      const json = await response.json();
      
      // Transform the API data into the kanban format
      return transformApiDataToKanban(json.data);
    },
    options
  );

  const memoizedValue = useMemo(
    () => ({
      board: data,
      boardLoading: isLoading,
      boardError: error,
      boardValidating: isValidating,
      boardEmpty: !isLoading && !data?.ordered?.length,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// Helper function to transform API data to kanban format
function transformApiDataToKanban(apiData) {
  if (!apiData?.details) {
    return {
      tasks: {},
      columns: {},
      ordered: [],
    };
  }

  // Initialize columns
  const columns = {
    "column-todo": {
      id: "column-todo",
      name: "To do",
      taskIds: [],
    },
    "column-inprogress": {
      id: "column-inprogress",
      name: "In progress",
      taskIds: [],
    },
    "column-done": {
      id: "column-done",
      name: "Done",
      taskIds: [],
    },
  };

  // Extract tasks from the details where typeDetail is "Tâche"
  const tasks = apiData.details
    .filter(detail => detail.typeDetail === "Tâche")
    .reduce((acc, task, index) => {
      const taskId = `task-${task.id}`;
      
      // Determine task status from API data (adjust field names as needed)
      let taskStatus = "To do"; // default
      let columnId = "column-todo"; // default
      
      // If your API has a status field, use it:
      if (task.status) {
        switch (task.status.toLowerCase()) {
          case 'in progress':
          case 'inprogress':
          case 'en cours':
            taskStatus = "In progress";
            columnId = "column-inprogress";
            break;
          case 'done':
          case 'completed':
          case 'terminé':
            taskStatus = "Done";
            columnId = "column-done";
            break;
          default:
            taskStatus = "To do";
            columnId = "column-todo";
        }
      }
      
      acc[taskId] = {
        id: taskId,
        name: task.description,
        description: task.description,
        status: taskStatus,
        priority: "medium",
        reporter: {
          name: `${apiData.etudiantPrenom} ${apiData.etudiantNom}`,
          avatarUrl: '',
        },
        assignee: [],
        labels: [],
        comments: [],
        attachments: [],
        due: [null, null],
      };
      
      // Add task to appropriate column
      columns[columnId].taskIds.push(taskId);
      
      return acc;
    }, {});

  return {
    tasks,
    columns,
    ordered: ["column-todo", "column-inprogress", "column-done"],
  };
}

// ----------------------------------------------------------------------

export async function updateColumn(columnId, columnName) {
  /**
   * Work in local
   */
  mutate(
    KANBAN_API_KEY,
    (currentData) => {
      if (!currentData) return currentData;

      // current column
      const column = currentData.columns[columnId];

      const columns = {
        ...currentData.columns,
        // update column in board.columns
        [column.id]: {
          ...column,
          name: columnName,
        },
      };

      return {
        ...currentData,
        columns,
      };
    },
    false
  );
}

// ----------------------------------------------------------------------

export async function moveColumn(newOrdered) {
  /**
   * Work in local
   */
  mutate(
    KANBAN_API_KEY,
    (currentData) => {
      if (!currentData) return currentData;

      return {
        ...currentData,
        ordered: newOrdered,
      };
    },
    false
  );
}

// ----------------------------------------------------------------------

export async function clearColumn(columnId) {
  /**
   * Work in local
   */
  mutate(
    KANBAN_API_KEY,
    (currentData) => {
      if (!currentData) return currentData;

      const { tasks } = currentData;

      // current column
      const column = currentData.columns[columnId];

      // delete tasks in board.tasks
      column.taskIds.forEach((key) => {
        delete tasks[key];
      });

      const columns = {
        ...currentData.columns,
        [column.id]: {
          ...column,
          // delete task in column
          taskIds: [],
        },
      };

      return {
        ...currentData,
        columns,
        tasks,
      };
    },
    false
  );
}

// ----------------------------------------------------------------------

export async function deleteColumn(columnId) {
  /**
   * Work in local
   */
  mutate(
    KANBAN_API_KEY,
    (currentData) => {
      if (!currentData) return currentData;

      const { columns, tasks } = currentData;

      // current column
      const column = columns[columnId];

      // delete column in board.columns
      delete columns[columnId];

      // delete tasks in board.tasks
      column.taskIds.forEach((key) => {
        delete tasks[key];
      });

      // delete column in board.ordered
      const ordered = currentData.ordered.filter((id) => id !== columnId);

      return {
        ...currentData,
        columns,
        tasks,
        ordered,
      };
    },
    false
  );
}

// ----------------------------------------------------------------------

export async function createTask(columnId, taskData) {
  /**
   * Work in local
   */
  mutate(
    KANBAN_API_KEY,
    (currentData) => {
      if (!currentData) return currentData;

      // current column
      const column = currentData.columns[columnId];

      const columns = {
        ...currentData.columns,
        [columnId]: {
          ...column,
          // add task in column
          taskIds: [...column.taskIds, taskData.id],
        },
      };

      // add task in board.tasks
      const tasks = {
        ...currentData.tasks,
        [taskData.id]: taskData,
      };

      return {
        ...currentData,
        columns,
        tasks,
      };
    },
    false
  );
}

// ----------------------------------------------------------------------

export async function updateTask(taskData) {
  /**
   * Work in local
   */
  mutate(
    KANBAN_API_KEY,
    (currentData) => {
      if (!currentData) return currentData;

      const tasks = {
        ...currentData.tasks,
        // add task in board.tasks
        [taskData.id]: taskData,
      };

      return {
        ...currentData,
        tasks,
      };
    },
    false
  );
}

// ----------------------------------------------------------------------

export async function moveTask(updateColumns, movedTaskId, newColumnId) {
  console.log('fedi',updateColumns);
  console.log('benzid:', movedTaskId);
  console.log('kessa7:', newColumnId);
  
  /**
   * Work on server - Update task status in backend
   */
  if (movedTaskId && newColumnId) {
    try {
      let newStatus;
      switch (newColumnId) {
        case 'column-todo':
          newStatus = 'To do';
          break;
        case 'column-inprogress':
          newStatus = 'In progress';
          break;
        case 'column-done':
          newStatus = 'Done';
          break;
        default:
          newStatus = 'To do';
      }

      console.log('Updating task status in backend:', {
        movedTaskId,
        newStatus,
        newColumnId,
      });
      // Extract the actual task ID from the formatted ID (remove 'task-' prefix)
      const actualTaskId = movedTaskId.replace('task-', '');
      
      // Make API call to update task status in backend
      const response = await axiosInstance.post(
        KANBAN_API_KEY,
        {
          taskId: actualTaskId,
          newStatus,
          newColumnId,
        },
        { params: { endpoint: 'update-task-status' } }
      );
      console.log('Response from backend:', response);
      // Check if the response is successful

  
      console.log('Task status updated in backend successfully');
    } catch (error) {
      console.error('Failed to update task status in backend:', error);
      // You might want to show an error message to the user here
      return;
    }
  }
  
  /**
   * Work in local - Update UI optimistically
   */
  mutate(
    KANBAN_API_KEY,
    (currentData) => {
      if (!currentData) {
        console.log('No current data available');
        return currentData;
      }
      
      console.log('Current data before update:', currentData);
      
      // Update the task's status based on the new column
      const updatedTasks = { ...currentData.tasks };
      if (movedTaskId && newColumnId && updatedTasks[movedTaskId]) {
        let newStatus;
        switch (newColumnId) {
          case 'column-todo':
            newStatus = 'To do';
            break;
          case 'column-inprogress':
            newStatus = 'In progress';
            break;
          case 'column-done':
            newStatus = 'Done';
            break;
          default:
            newStatus = updatedTasks[movedTaskId].status;
        }
        
        updatedTasks[movedTaskId] = {
          ...updatedTasks[movedTaskId],
          status: newStatus,
        };
      }
      
      const updatedData = {
        ...currentData,
        columns: updateColumns,
        tasks: updatedTasks,
      };
      
      console.log('Updated data:', updatedData);
      return updatedData;
    },
    false
  );
}

// ----------------------------------------------------------------------

export async function deleteTask(columnId, taskId) {
  /**
   * Work in local
   */
  mutate(
    KANBAN_API_KEY,
    (currentData) => {
      if (!currentData) return currentData;

      const { tasks } = currentData;

      // current column
      const column = currentData.columns[columnId];

      const columns = {
        ...currentData.columns,
        [column.id]: {
          ...column,
          // delete tasks in column
          taskIds: column.taskIds.filter((id) => id !== taskId),
        },
      };

      // delete tasks in board.tasks
      delete tasks[taskId];

      return {
        ...currentData,
        columns,
        tasks,
      };
    },
    false
  );
}