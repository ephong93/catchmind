import './App.css';
import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom';
import { useEffect, useState } from 'react'; 
import 'antd/dist/antd.css';
import { WelcomePage, LobbyPage, RoomPage, PageNotFoundPage } from 'pages';


const ProtectedRoute = ({ component: Component, userName, ...rest}) => {
  return <Route {...rest} render={props =>
    userName ?
      <Component {...props} />
      :
      <Redirect to='/'></Redirect>
    }></Route>
}


function App() {
  const [ userName, setUserName ] = useState(null);

  const logIn = (newUserName) => {
    console.log(newUserName);
    setUserName(newUserName);
    localStorage['catchMindUserName'] = newUserName;
  }

  useEffect(() => {
    const currentUserName = localStorage.getItem('catchMindUserName');
    if (currentUserName !== null && userName === null) {
      setUserName(currentUserName);
    }
  }, [userName]);

  return (
    <div className="App">
      <Router>
        <Switch>
          <Route path='/' exact>
            {
              userName ? 
              <Redirect to='/lobby'></Redirect>
              :
              props => <WelcomePage {...props} userName={userName} logIn={logIn} ></WelcomePage>
            }
          </Route>
          <ProtectedRoute path='/lobby' userName={userName} component={LobbyPage}></ProtectedRoute>
          <ProtectedRoute path='/room' userName={userName} component={RoomPage}></ProtectedRoute>
          <Route>
            <PageNotFoundPage></PageNotFoundPage>
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;