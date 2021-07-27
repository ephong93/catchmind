import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom';
import { useEffect, useState } from 'react'; 
import 'antd/dist/antd.css';
import { WelcomePage, LobbyPage, RoomPage, PageNotFoundPage } from 'pages';
import { axios } from 'myaxios';

const ProtectedRoute = ({ component: Component, userName, ...rest}) => {
  console.log('protected route', Component, userName);
  return <Route {...rest} render={props =>
    userName ?
      <Component {...props} {...rest} userName={userName} />
      :
      <Redirect to='/'></Redirect>
    }></Route>
}


function App() {
  const [ userName, setUserName ] = useState(null);

  const logIn = (newUserName) => {
    setUserName(newUserName);
    localStorage['catchMindUserName'] = newUserName;
    axios.post('http://localhost:5000/api/user', {
      username: newUserName
    }).then(res => {
      console.log(res);
    });
  }

  const logOut = () => {
    axios.delete('http://localhost:5000/api/user').then(res => {
      localStorage.removeItem('catchMindUserName');
      setUserName(null);
    });
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
          <ProtectedRoute path='/lobby' userName={userName} logOut={logOut} component={LobbyPage}></ProtectedRoute>
          <ProtectedRoute path='/room/:roomId' userName={userName} logOut={logOut} component={RoomPage}></ProtectedRoute>
          <Route>
            <PageNotFoundPage></PageNotFoundPage>
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;