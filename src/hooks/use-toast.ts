import * as React from "react";

import type { ToastActionElement, ToastProps } from "@/components/ui/toast";

const TOAST_LIMIT = 5; // ✅ Better UX: Multiple toasts can stack
const TOAST_REMOVE_DELAY = 5000;

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
  createdAt?: number; // ✅ Added for debugging/timing
};

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const;

// ✅ Improved ID generation with timestamp to prevent collisions
function genId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID(); // Modern browsers
  }
  // Fallback for older browsers
  return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

type ActionType = typeof actionTypes;

type Action =
  | {
      type: ActionType["ADD_TOAST"];
      toast: ToasterToast;
    }
  | {
      type: ActionType["UPDATE_TOAST"];
      toast: Partial<ToasterToast> & { id: string };
    }
  | {
      type: ActionType["DISMISS_TOAST"];
      toastId?: ToasterToast["id"];
    }
  | {
      type: ActionType["REMOVE_TOAST"];
      toastId?: ToasterToast["id"];
    };

interface State {
  toasts: ToasterToast[];
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

// ✅ Extracted side-effect to keep reducer pure-ish
const scheduleToastRemoval = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return;
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    });
  }, TOAST_REMOVE_DELAY);

  toastTimeouts.set(toastId, timeout);
};

// ✅ Helper function for dismiss side-effects
const dismissToastSideEffect = (toastId?: string) => {
  if (toastId) {
    scheduleToastRemoval(toastId);
  } else {
    // Get all toast IDs before iterating to avoid mutation issues
    const toastIds = Array.from(toastTimeouts.keys());
    toastIds.forEach(id => {
      scheduleToastRemoval(id);
    });
  }
};

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) => 
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      };

    case "DISMISS_TOAST": {
      // Side-effect moved to dispatch level for purity
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toastId || action.toastId === undefined
            ? { ...t, open: false }
            : t
        ),
      };
    }
    
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };
      
    default:
      return state;
  }
};

const listeners: Array<(state: State) => void> = [];

let memoryState: State = { toasts: [] };

function dispatch(action: Action) {
  // Handle side-effects before reducer
  if (action.type === "DISMISS_TOAST") {
    dismissToastSideEffect(action.toastId);
  }
  
  memoryState = reducer(memoryState, action);
  
  // Notify all listeners
  listeners.forEach((listener) => {
    try {
      listener(memoryState);
    } catch (error) {
      console.error("Toast listener error:", error);
    }
  });
}

// SSR safety: Reset state on server
if (typeof window === "undefined") {
  memoryState = { toasts: [] };
}

type ToastInput = Omit<ToasterToast, "id">;

function toast({ ...props }: ToastInput) {
  const id = genId();

  const update = (props: Partial<ToasterToast>) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    });
    
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id });

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      createdAt: Date.now(),
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss();
      },
    },
  });

  return {
    id: id,
    dismiss,
    update,
  };
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState);

  React.useEffect(() => {
    // Add listener
    listeners.push(setState);
    
    // Initial sync
    setState(memoryState);
    
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, []);

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  };
}

export { useToast, toast };
