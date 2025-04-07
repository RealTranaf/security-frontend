import './App.css';
import logo from './resource/logo.jpg'
import Header from './components/Header';
import Body from './components/Body';

function App() {
  return (
    <div>
      <Header pageTitle="Frontend for Spring Security + JWT" logoSrc={logo}></Header>
      <div className='container-fluid'>
        <div className='row'>
          <div className='col'>
            <Body></Body>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
