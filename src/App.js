import logo from "./logo.svg";
import "./App.css";
import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";

import { library } from "@fortawesome/fontawesome-svg-core";

import { fab } from "@fortawesome/free-brands-svg-icons";
import { faL, fas } from "@fortawesome/free-solid-svg-icons";
import { far } from "@fortawesome/free-regular-svg-icons";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function Folder({
  onDoubleClick = () => {},
  name = "New Folder",
  id,
  onInit = () => {},
  onKeyDown = () => {}
}) {
  const inputRef = useRef();
  useEffect(() => {
    onInit(inputRef.current);
  }, []);

  return (
    <div className="flex flex-col gap-2 w-24 cursor-pointer">
      <FontAwesomeIcon
        icon="fa-solid fa-folder"
        className="text-6xl text-amber-400 hover:text-amber-500"
        onDoubleClick={onDoubleClick}
      />
      <input
        className="bg-transparent text-center"
        id={id}
        defaultValue={name}
        ref={inputRef}
        onKeyDown={(e) => onKeyDown(e, inputRef.current)}
      />
    </div>
  );
}

function App() {
  const baseURL = "http://localhost:8080/folders";

  const [folders, setFolders] = useState([]);
  const [sidefolders, setSideFolders] = useState([]);
  const [detailFolder, setDetailFolder] = useState([]);
  const [route, setRoute] = useState([]);
  const [search, setSearch] = useState([]);

  React.useEffect(() => {
    axios.get(baseURL).then((res) => {
      const details = res.data;
      setFolders(details);
    });
  }, []);

  function searchFolder(e) {
    if (route.length !== 0) {
      const value = e.target.value;
      const folder = route.slice(-1)[0];

      setSearch(value);
      openFolder(folder.id);
    }
  }

  const openFolder = (id) => {
    axios
      .get(`${baseURL}/${id}`, {
        params: {
          search,
        },
      })
      .then((res) => {
        const folders = res.data.folders;
        const detail = res.data.detail;

        setSideFolders(folders);
        setDetailFolder(detail);
        addressBar(detail.path);
      })
      .catch((error) => {
        console.error("Error creating user:", error);
      });
  };

  const addressBar = (path) => {
    const body = {
      path,
    };

    axios
      .post(`http://localhost:8080/route`, body)
      .then((res) => {        
        setRoute(res.data);
      })
      .catch((error) => {
        console.error("Error creating user:", error);
      });
  };

  const newFolder = (path) => {
    const id = uuidv4();

    const payload = {
      id,
      name: null,
      path
    };

    setSideFolders((state) => [payload, ...state]);
  };

  function handleKeyDown(e, element) {
    if (e.key === 'Enter') {
      const inputValue = e.target.value;
      const inputId = e.target.id;

      const body = {
        id : inputId,
        name : inputValue,
        path : detailFolder.path,
      }      
      
      const selected = sidefolders.filter((a) => a.id === inputId);
      
      if (selected[0].is_updated === 0) {           
        updateFolder(inputId, body, () => {
          element.blur();
        })
      } else {
        storeFolder(body, () => {
          element.blur();
        })
      }
    
    }
    
  }

  function updateFolder(id, body, onSuccess=()=>{}) {    
    axios.put(`${baseURL}/${id}`, body).then(res => {
      onSuccess(res);
    }).catch(error => {
      console.error('Error creating user:', error);
    });
  }

  function initFolder(element, name) {
    if (!name) {
      element.focus();
      element.select();
    }
  }

  function storeFolder(body, onSuccess=()=>{}) {    
    axios.post(baseURL, body).then(res => {
      onSuccess(res);
    }).catch(error => {
      console.error('Error creating user:', error);
    });
  }

  return (
    <div className="App">
      <div className="folder-explorer text-zinc-50">
        <header className="flex justify-start flex-col pt-2">
          <div className="flex flex-row gap-2 py-4 w-max bg-stone-800 ps-5 pe-20 rounded-t-2xl ms-2">
            <FontAwesomeIcon icon="fa-solid fa-floppy-disk" />
            <p>File Explorer</p>
          </div>
          <nav className="flex flew-row w-full bg-stone-800 py-3 px-5 gap-2">
            <div className="flex flex-wrap items-center gap-10 w-max px-5">
              <FontAwesomeIcon
                icon="fa-solid fa-plus"
                onClick={() => newFolder(detailFolder.path)}
              />
              {/* <FontAwesomeIcon icon="fa-solid fa-trash" /> */}
            </div>
            <div className="grow rounded-md bg-stone-700 py-2 px-4 flex flex-wrap items-center gap-4">
              <div className="flex gap-4">
                <FontAwesomeIcon icon="fa-solid fa-display" />
                <FontAwesomeIcon icon="fa-solid fa-angle-right" />
              </div>
              {route.map((a) => (
                <div className="flex flex-wrap items-center gap-4" key={a.id}>
                  <p onClick={() => openFolder(a.id)} className="cursor-pointer">
                    {a.name}
                  </p>
                  <FontAwesomeIcon icon="fa-solid fa-angle-right" />
                </div>
              ))}
            </div>
            <div className="rounded-md bg-stone-700 flex flex-wrap items-center py-2 px-4 w-1/5 gap-2">
              <input
                className="bg-transparent grow"
                onChange={searchFolder}
              ></input>
              <FontAwesomeIcon icon="fa-solid fa-magnifying-glass" />
            </div>
          </nav>
        </header>
        <section className="flex flex-row gap-2">
          <article className="flex flex-col gap-5 px-5 mt-5">
            {folders &&
              folders.map((a) => (
                <div
                  className="px-2 py-1 text-left cursor-pointer hover:text-amber-400"
                  key={a.id}
                  onClick={() => openFolder(a.id)}
                >
                  {a.name}
                </div>
              ))}
          </article>
          <article
            className="border-l-[1px] h-screen w-screen ps-5"
          > 
          <div className="flex flex-wrap gap-10 mt-7"
            id="folders">
            {sidefolders.length !== 0 ? (
              sidefolders.map((a) => (
                <Folder
                  onDoubleClick={() => openFolder(a.id)}
                  name={a.name ? a.name : 'New Folder'}
                  id={a.id}
                  key={a.id}
                  onInit={(e) => initFolder(e, a.name)}
                  onKeyDown={(e, element) => handleKeyDown(e, element, a, sidefolders.length)}
                />
              ))
            ) : (
              <p className="items-center w-full">This folder is empty</p>
            )}
          </div>
          </article>
        </section>
        <div className="left-panel"></div>
        <div className="right-panel"></div>
      </div>
    </div>
  );
}

export default App;
library.add(fab, fas, far);
