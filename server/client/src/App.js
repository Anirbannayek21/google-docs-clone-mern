import { Redirect, Route, Switch } from 'react-router';
import './App.css';
import TextEditor from "./TextEditor"
import { v4 as uuidv4 } from "uuid"

function App() {
  return (
    <>
      <Switch>
        <Route exact path="/">
          <Redirect to={`/document/${uuidv4()}`} />
        </Route>
        <Route path="/document/:id">
          <TextEditor />
        </Route>
      </Switch>
    </>
  );
}

export default App;
