import React, { useEffect, useReducer, useRef } from "react";
import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import Home from "./pages/Home";
import New from "./pages/New";
import Diary from "./pages/Diary";
import Edit from "./pages/Edit";

export interface Data {
  id: number;
  content: string;
  emotion: number;
  date: number;
}

type Init_action = {
  type: "INIT";
  data: Data[];
};

type Create_action = {
  type: "CREATE";
  data: Data;
};

type Remove_action = {
  type: "REMOVE";
  targetId: number;
};

type Edit_action = {
  type: "EDIT";
  targetId: number;
  data: Data;
};

type ActionType = Init_action | Create_action | Remove_action | Edit_action;

const reducer = (state: Data[], action: ActionType) => {
  let newState = [];

  switch (action.type) {
    case "INIT": {
      return action.data;
    }
    case "CREATE": {
      newState = [action.data, ...state];
      break;
    }
    case "REMOVE": {
      newState = state.filter((item: Data) => item.id !== action.targetId);
      break;
    }
    case "EDIT": {
      newState = state.map((item: Data) =>
        item.id === action.targetId ? { ...action.data } : item
      );
      break;
    }
    default:
      return state;
  }

  localStorage.setItem("diary", JSON.stringify(newState));
  return newState;
};

export const DiaryStateContext = React.createContext<Data[] | undefined>(
  undefined
);

type DispatchType = {
  onCreate: (date: number, content: string, emotion: number) => void;
  onRemove: (targetId: number) => void;
  onEdit: (
    targetId: number,
    content: string,
    emotion: number,
    date: number
  ) => void;
};
export const DiaryDispatchContext = React.createContext<
  DispatchType | undefined
>(undefined);

function App() {
  const [data, dispatch] = useReducer(reducer, []);

  const dataId = useRef(5);

  //CREATE
  const onCreate = (date: number, content: string, emotion: number) => {
    dispatch({
      type: "CREATE",
      data: {
        id: dataId.current,
        date: new Date(date).getTime(),
        content,
        emotion,
      },
    });

    dataId.current += 1;
  };

  //REMOVE
  const onRemove = (targetId: number) => {
    dispatch({ type: "REMOVE", targetId });
  };

  //EDIT
  const onEdit = (
    targetId: number,
    content: string,
    emotion: number,
    date: number
  ) => {
    dispatch({
      type: "EDIT",
      targetId,
      data: {
        id: targetId,
        content,
        emotion,
        date: new Date(date).getTime(),
      },
    });
  };

  useEffect(() => {
    const localData = localStorage.getItem("diary");
    if (localData) {
      const diaryList = JSON.parse(localData).sort(
        (a: Data, b: Data) => a.id - b.id
      );

      if(diaryList.length > 0) {
        dataId.current = diaryList[0].id + 1;
        dispatch({ type: "INIT", data: diaryList });
      }
    }
  }, []);

  return (
    <DiaryStateContext.Provider value={data}>
      <DiaryDispatchContext.Provider value={{ onCreate, onEdit, onRemove }}>
        <BrowserRouter basename={process.env.PUBLIC_URL}>
          <div className="App">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/new" element={<New />} />
              <Route path="/edit/:id" element={<Edit />} />
              <Route path="/diary/:id" element={<Diary />} />
            </Routes>
          </div>
        </BrowserRouter>
      </DiaryDispatchContext.Provider>
    </DiaryStateContext.Provider>
  );
}

export default App;
